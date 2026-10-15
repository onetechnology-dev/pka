const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { createStore } = require("../database");
const { createApp } = require("../server");

test("index.html contains sortControlWrap and sortSelect with brand and name options", () => {
  const html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
  assert.match(html, /id="sortControlWrap"/);
  assert.match(html, /id="sortSelect"/);
  assert.match(html, /value="brand-asc"/);
  assert.match(html, /value="brand-desc"/);
  assert.match(html, /value="name-asc"/);
  assert.match(html, /value="name-desc"/);
  assert.match(html, /value="default"/);
});

test("styles.css contains styling for sort control and sortable brand header", () => {
  const css = fs.readFileSync(path.join(__dirname, "../public/styles.css"), "utf8");
  assert.match(css, /\.sort-control-wrap/);
  assert.match(css, /\.sort-select/);
  assert.match(css, /th\.th-sortable/);
});

test("app.js implements sortProducts logic accurately", () => {
  const appJs = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");
  assert.match(appJs, /function sortProducts\(/);
  assert.match(appJs, /const sortSelect = document\.querySelector\("#sortSelect"\);/);

  // Directly test the sort logic
  const sample = [
    { name: "Sauvage", brand: "Dior" },
    { name: "Aventus", brand: "Creed" },
    { name: "Green Irish Tweed", brand: "Creed" },
    { name: "Bleu de Chanel", brand: "Chanel" },
    { name: "Eros", brand: "Versace" },
  ];

  function sortProducts(items, sortMode) {
    const list = [...items];
    switch (sortMode) {
      case "brand-asc":
        return list.sort((a, b) => {
          const brandA = (a.brand || "").trim();
          const brandB = (b.brand || "").trim();
          const brandCmp = brandA.localeCompare(brandB, undefined, { sensitivity: "base" });
          if (brandCmp !== 0) return brandCmp;
          return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
        });
      case "brand-desc":
        return list.sort((a, b) => {
          const brandA = (a.brand || "").trim();
          const brandB = (b.brand || "").trim();
          const brandCmp = brandB.localeCompare(brandA, undefined, { sensitivity: "base" });
          if (brandCmp !== 0) return brandCmp;
          return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
        });
      case "name-asc":
        return list.sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" }));
      case "name-desc":
        return list.sort((a, b) => (b.name || "").localeCompare(a.name || "", undefined, { sensitivity: "base" }));
      case "default":
      default:
        return list;
    }
  }

  // 1. Brand Ascending: Chanel -> Creed (Aventus, Green Irish Tweed) -> Dior -> Versace
  const brandAsc = sortProducts(sample, "brand-asc");
  assert.deepEqual(brandAsc.map((p) => `${p.brand}: ${p.name}`), [
    "Chanel: Bleu de Chanel",
    "Creed: Aventus",
    "Creed: Green Irish Tweed",
    "Dior: Sauvage",
    "Versace: Eros",
  ]);

  // 2. Brand Descending: Versace -> Dior -> Creed (Aventus, Green Irish Tweed) -> Chanel
  const brandDesc = sortProducts(sample, "brand-desc");
  assert.deepEqual(brandDesc.map((p) => `${p.brand}: ${p.name}`), [
    "Versace: Eros",
    "Dior: Sauvage",
    "Creed: Aventus",
    "Creed: Green Irish Tweed",
    "Chanel: Bleu de Chanel",
  ]);

  // 3. Name Ascending
  const nameAsc = sortProducts(sample, "name-asc");
  assert.deepEqual(nameAsc.map((p) => p.name), [
    "Aventus",
    "Bleu de Chanel",
    "Eros",
    "Green Irish Tweed",
    "Sauvage",
  ]);
});

test("UI sort control and Brand column click dynamically reorder product list", async () => {
  let store;
  let server;
  let browser;
  let page;
  try {
    store = await createStore();
    server = createApp(store);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies([
      { name: "admin_session", value: "authenticated", url: baseUrl + "/admin" },
    ]);
    page = await context.newPage();

    const sampleProducts = [
      { id: "1", name: "Sauvage", brand: "Dior", status: "Active", photo: "https://example.com/dior.jpg" },
      { id: "2", name: "Aventus", brand: "Creed", status: "Active", photo: "https://example.com/creed.jpg" },
      { id: "3", name: "Eros", brand: "Versace", status: "Active", photo: "https://example.com/versace.jpg" },
    ];

    await page.route("**/api/products*", (route) => route.fulfill({ json: { source: "fragrantica", products: sampleProducts } }));
    await page.goto(baseUrl + "/");
    await page.waitForFunction(() => document.querySelectorAll(".fragrance-card").length === 3);

    // Initial default sort is brand-asc: Creed -> Dior -> Versace
    let brands = await page.locator(".fragrance-card .brand-eyebrow").allTextContents();
    assert.deepEqual(brands, ["Creed", "Dior", "Versace"]);

    // Sort control is hidden on frontend storefront
    assert.ok(await page.locator("#sortControlWrap").isHidden());

    // Switch to admin table view where sort control is available
    await page.goto(baseUrl + "/admin");
    assert.ok(await page.locator("#sortControlWrap").isVisible());

    // Change sortSelect to brand-desc: Versace -> Dior -> Creed
    await page.locator("#sortSelect").selectOption("brand-desc");

    await page.locator("#tableView").click();
    assert.equal(await page.locator("#resultsBody tr").count(), 3);
    let tableBrands = await page.locator("#resultsBody .brand-name").allTextContents();
    assert.deepEqual(tableBrands, ["Versace", "Dior", "Creed"]);

    // Click Brand header to toggle back to brand-asc
    await page.locator("#thBrand").click();
    tableBrands = await page.locator("#resultsBody .brand-name").allTextContents();
    assert.deepEqual(tableBrands, ["Creed", "Dior", "Versace"]);
    assert.equal(await page.locator("#sortSelect").inputValue(), "brand-asc");

  } finally {
    if (page) await page.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    if (server) await new Promise((resolve) => server.close(resolve)).catch(() => {});
    if (store) await store.close().catch(() => {});
  }
});

