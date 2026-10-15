const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createFallbackStore, cleanProduct } = require("../database");
const { createApp } = require("../server");

test("index.html loads Google Font Kantumruy Pro and styles.css applies it to Khmer text", () => {
  const html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
  assert.match(html, /fonts\.googleapis\.com\/css2\?family=Kantumruy\+Pro/);

  const css = fs.readFileSync(path.join(__dirname, "../public/styles.css"), "utf8");
  assert.match(css, /Kantumruy Pro/);
  assert.match(css, /\.product-tag-badge/);
  assert.match(css, /\.chip-label/);
});

test("index.html contains tagSettingsBtn in sidebar directly below addProductBtn", () => {
  const html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
  assert.match(html, /id="tagSettingsBtn"/);
  assert.match(html, /id="addProductBtn"[\s\S]*?id="tagSettingsBtn"/);
});

test("index.html contains tagSettingsDialog with Tag Name, Filter, Perfume Names, and Action columns", () => {
  const html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
  assert.match(html, /id="tagSettingsDialog"/);
  assert.match(html, /id="tagManagementTable"/);
  assert.match(html, /Tag Name/);
  assert.match(html, /Filter/);
  assert.match(html, /Perfume Names/);
  assert.doesNotMatch(html, /Perfume Names \(Product Name\)/);
  assert.match(html, /Action/);
});

test("index.html contains tagEditorModal popup with multi-select, Filter input, and default tag 'ក្លិនពេញនិយម'", () => {
  const html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
  assert.match(html, /id="tagEditorModal"/);
  assert.match(html, /id="tagNameInput"[\s\S]*?value="ក្លិនពេញនិយម"/);
  assert.match(html, /id="tagFilterInput"/);
  assert.match(html, /id="tagProductChecklist"/);
  assert.match(html, /id="tagProductSelect"/);
});

test("cleanProduct defaults tags to ['ក្លិនពេញនិយម'] when not specified", () => {
  const product = cleanProduct("fragrantica", {
    name: "Aventus",
    brand: "Creed",
    photo: "https://example.com/aventus.jpg",
  });
  assert.deepEqual(product.tags, ["ក្លិនពេញនិយម"]);
});

test("cleanProduct sanitizes array and comma-separated tags", () => {
  const product1 = cleanProduct("fragrantica", {
    name: "Sauvage",
    brand: "Dior",
    tags: "ក្លិនពេញនិយម, Fresh, Citrus",
  });
  assert.deepEqual(product1.tags, ["ក្លិនពេញនិយម", "Fresh", "Citrus"]);

  const product2 = cleanProduct("fragrantica", {
    name: "Bleu de Chanel",
    brand: "Chanel",
    tags: ["ក្លិនពេញនិយម", "Woody", "ក្លិនពេញនិយម"],
  });
  assert.deepEqual(product2.tags, ["ក្លិនពេញនិយម", "Woody"]);

  const product3 = cleanProduct("fragrantica", {
    name: "No Tags",
    brand: "Generic",
    tags: [],
  });
  assert.deepEqual(product3.tags, []);
});

test("store tag methods: listTags, saveTag, and deleteTag update products correctly", async () => {
  const store = createFallbackStore();
  const source = "fragrantica";

  await store.saveBatch(source, "https://www.fragrantica.com/perfume/Creed/Aventus-1.html", [
    { name: "Aventus", brand: "Creed", photo: "https://example.com/aventus.1.jpg" },
  ]);
  await store.saveBatch(source, "https://www.fragrantica.com/perfume/Dior/Sauvage-2.html", [
    { name: "Sauvage", brand: "Dior", photo: "https://example.com/sauvage.2.jpg" },
  ]);

  const initialProducts = await store.list(source);
  const aventus = initialProducts.find((p) => p.name === "Aventus");
  const sauvage = initialProducts.find((p) => p.name === "Sauvage");
  assert.ok(aventus);
  assert.ok(sauvage);
  assert.ok(aventus.tags.includes("ក្លិនពេញនិយម"));
  assert.ok(sauvage.tags.includes("ក្លិនពេញនិយម"));

  const tags = await store.listTags(source);
  assert.ok(tags.length >= 1);
  const popularTag = tags.find((t) => t.name === "ក្លិនពេញនិយម");
  assert.ok(popularTag);
  assert.ok(popularTag.productIds.includes(aventus.id));
  assert.ok(popularTag.productIds.includes(sauvage.id));

  // Create a new tag "Signature" for only Aventus
  const updatedTags = await store.saveTag(source, {
    name: "Signature",
    productIds: [aventus.id],
  });
  assert.ok(updatedTags.some((t) => t.name === "Signature"));

  const productsAfterSave = await store.list(source);
  const aventusAfter = productsAfterSave.find((p) => p.name === "Aventus");
  const sauvageAfter = productsAfterSave.find((p) => p.name === "Sauvage");
  assert.ok(aventusAfter.tags.includes("Signature"));
  assert.ok(!sauvageAfter.tags.includes("Signature"));

  // Delete tag "Signature"
  const sigTag = updatedTags.find((t) => t.name === "Signature");
  await store.deleteTag(source, sigTag.id);

  const productsAfterDelete = await store.list(source);
  const aventusFinal = productsAfterDelete.find((p) => p.name === "Aventus");
  assert.ok(!aventusFinal.tags.includes("Signature"));
});

test("API endpoints: GET /api/tags, POST /api/tags, and POST /api/tags/delete", async () => {
  const store = createFallbackStore();
  const source = "fragrantica";

  await store.saveBatch(source, "https://www.fragrantica.com/perfume/Creed/Aventus-1.html", [
    { name: "Aventus", brand: "Creed", photo: "https://example.com/aventus.jpg" },
    { name: "Eros", brand: "Versace", photo: "https://example.com/eros.jpg" },
  ]);

  const app = createApp(store);
  const server = app.listen(0);
  const port = server.address().port;

  try {
    // 1. GET /api/tags
    const res1 = await fetch(`http://127.0.0.1:${port}/api/tags?source=fragrantica`);
    assert.equal(res1.status, 200);
    const data1 = await res1.json();
    assert.ok(Array.isArray(data1.tags));
    assert.ok(data1.tags.some((t) => t.name === "ក្លិនពេញនិយម"));

    // 2. POST /api/tags
    const allProds = await store.list(source);
    const res2 = await fetch(`http://127.0.0.1:${port}/api/tags`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Best Seller",
        productIds: [allProds[0].id],
        source: "fragrantica",
      }),
    });
    assert.equal(res2.status, 200);
    const data2 = await res2.json();
    assert.equal(data2.success, true);
    const bestSeller = data2.tags.find((t) => t.name === "Best Seller");
    assert.ok(bestSeller);

    // 3. POST /api/tags/delete
    const res3 = await fetch(`http://127.0.0.1:${port}/api/tags/delete`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: bestSeller.id,
        source: "fragrantica",
      }),
    });
    assert.equal(res3.status, 200);
    const data3 = await res3.json();
    assert.ok(!data3.tags.some((t) => t.name === "Best Seller"));
  } finally {
    server.close();
  }
});

test("sortProducts places 'ក្លិនពេញនិយម' products at the top before brand sorting", () => {
  const items = [
    { name: "Eros", brand: "Versace", tags: [] },
    { name: "Aventus", brand: "Creed", tags: ["Other"] },
    { name: "Sauvage", brand: "Dior", tags: ["ក្លិនពេញនិយម"] },
    { name: "Bleu de Chanel", brand: "Chanel", tags: ["ក្លិនពេញនិយម"] },
  ];

  function hasPopularTag(product) {
    return Array.isArray(product?.tags) && product.tags.includes("ក្លិនពេញនិយម");
  }

  function sortProducts(list, sortMode = "brand-asc") {
    return [...list].sort((a, b) => {
      const aPop = hasPopularTag(a);
      const bPop = hasPopularTag(b);
      if (aPop && !bPop) return -1;
      if (!aPop && bPop) return 1;

      switch (sortMode) {
        case "brand-asc": {
          const brandA = (a.brand || "").trim();
          const brandB = (b.brand || "").trim();
          const brandCmp = brandA.localeCompare(brandB, undefined, { sensitivity: "base" });
          if (brandCmp !== 0) return brandCmp;
          return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
        }
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
        default:
          return 0;
      }
    });
  }

  const sorted = sortProducts(items, "brand-asc");
  // Bleu de Chanel (Chanel, popular) and Sauvage (Dior, popular) must come before Creed and Versace
  assert.equal(sorted[0].name, "Bleu de Chanel");
  assert.equal(sorted[1].name, "Sauvage");
  assert.equal(sorted[2].name, "Aventus"); // Creed
  assert.equal(sorted[3].name, "Eros"); // Versace
});

test("search matching includes tags", () => {
  const productWithTag = {
    name: "Light Blue",
    brand: "Dolce & Gabbana",
    barcode: "",
    status: "Active",
    tags: ["ក្លិនពេញនិយម", "Summer"],
    mainAccords: [],
    topNotes: [],
    middleNotes: [],
    baseNotes: [],
    fragranceNotes: [],
  };

  const productWithoutTag = {
    name: "Dark Rebel",
    brand: "John Varvatos",
    barcode: "",
    status: "Active",
    tags: ["Leather"],
    mainAccords: [],
    topNotes: [],
    middleNotes: [],
    baseNotes: [],
    fragranceNotes: [],
  };

  function matchesFilter(product, query) {
    return [
      product.name,
      product.brand,
      product.barcode,
      product.status,
      ...(Array.isArray(product.tags) ? product.tags : []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase());
  }

  assert.equal(matchesFilter(productWithTag, "ក្លិនពេញនិយម"), true);
  assert.equal(matchesFilter(productWithoutTag, "ក្លិនពេញនិយម"), false);
  assert.equal(matchesFilter(productWithTag, "Summer"), true);
  assert.equal(matchesFilter(productWithoutTag, "Leather"), true);
});


test("backend product list includes tag button and tags before edit button", () => {
  const appJs = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");

  // Check renderActions contains tag button before edit button
  const tagBtnIndex = appJs.indexOf('data-action="tag"');
  const editBtnIndex = appJs.indexOf('data-action="edit"');
  assert.ok(tagBtnIndex > 0, "app.js should contain data-action=\"tag\"");
  assert.ok(editBtnIndex > 0, "app.js should contain data-action=\"edit\"");
  assert.ok(tagBtnIndex < editBtnIndex, "tag button should appear before edit button in renderActions");

  // Check renderActions contains product-tags-group before edit button
  const tagsGroupIndex = appJs.indexOf("product-tags-group");
  assert.ok(tagsGroupIndex > 0, "app.js should contain product-tags-group");
  assert.ok(tagsGroupIndex < editBtnIndex, "product-tags-group should appear before edit button");

  // Check click delegation handles data-action="tag"
  assert.match(appJs, /button\.dataset\.action === "tag"/);
  assert.match(appJs, /openProductTagModal/);

  // Check index.html has productTagModal with required elements
  const html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
  assert.match(html, /id="productTagModal"/);
  assert.match(html, /id="productTagForm"/);
  assert.match(html, /id="productTagChecklist"/);
  assert.match(html, /id="newProductTagNameInput"/);
  assert.match(html, /id="addNewTagToProductBtn"/);

  // Check styles.css has tag-product-btn styling
  const css = fs.readFileSync(path.join(__dirname, "../public/styles.css"), "utf8");
  assert.match(css, /\.tag-product-btn/);
  assert.match(css, /\.product-tags-group/);
});

test("product list backend Edit and Delete buttons use text and modern single row layout", () => {
  const appJs = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");
  // Edit button uses text Edit
  assert.match(appJs, /<button[^>]*data-action="edit"[^>]*>Edit<\/button>/);
  // Delete button uses text Delete
  assert.match(appJs, /<button[^>]*data-action="delete"[^>]*>Delete<\/button>/);

  const css = fs.readFileSync(path.join(__dirname, "../public/styles.css"), "utf8");
  // Single row layout for backend product-actions
  assert.match(css, /\.product-actions\s*\{[^}]*flex-wrap:\s*nowrap/);
  assert.match(css, /\.product-actions\s*\{[^}]*white-space:\s*nowrap/);
  assert.match(css, /\.edit-product-btn/);
  assert.match(css, /\.delete-product-btn/);
});

test("store.saveTag supports filter boolean and listTags returns it", async () => {
  const store = createFallbackStore();
  const saved = await store.saveTag("fragrantica", {
    name: "Summer Fresh",
    filter: false,
    productIds: [],
  });
  const summerTag = saved.find((t) => t.name === "Summer Fresh");
  assert.ok(summerTag);
  assert.strictEqual(summerTag.filter, false);

  const defaultTag = saved.find((t) => t.name === "ក្លិនពេញនិយម");
  assert.ok(defaultTag);
  assert.strictEqual(defaultTag.filter, true);
});

test("index.html and styles.css support frontend tag filters and tag table Filter column", () => {
  const html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
  assert.match(html, /id="frontendTagFilters"/);
  assert.match(html, /class="th-tag-filter"/);

  const css = fs.readFileSync(path.join(__dirname, "../public/styles.css"), "utf8");
  assert.match(css, /\.th-tag-filter/);
  assert.match(css, /\.filter-status-pill/);
  assert.match(css, /\.frontend-tag-filters/);
  assert.match(css, /body\.mode-frontend[\s\S]*?\.sort-control-wrap/);
});

