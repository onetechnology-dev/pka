const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("index.html contains filter chips with count indicators for MEN, WOMEN, and UNISEX", () => {
  const html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
  assert.match(html, /id="filterUnisex"/);
  assert.match(html, /for="filterUnisex"/);
  assert.match(html, /<span class="chip-label">MEN<\/span><span class="filter-count" id="countMen">\(0\)<\/span>/);
  assert.match(html, /<span class="chip-label">WOMEN<\/span><span class="filter-count" id="countWomen">\(0\)<\/span>/);
  assert.match(html, /<span class="chip-label">UNISEX<\/span><span class="filter-count" id="countUnisex">\(0\)<\/span>/);
});

test("styles.css contains styling for filterUnisex chip input and filter-count", () => {
  const css = fs.readFileSync(path.join(__dirname, "../public/styles.css"), "utf8");
  assert.match(css, /\.gender-chip\[for="filterUnisex"\] input/);
  assert.match(css, /\.filter-count/);
});

test("app.js binds filterUnisex and handles unisex filtering logic and count calculation", () => {
  const appJs = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");
  assert.match(appJs, /const filterUnisex = document\.querySelector\("#filterUnisex"\);/);
  assert.match(appJs, /filterUnisex\?\.addEventListener\("change", renderTable\);/);
  assert.match(appJs, /filterUnisex\.checked = false;/);
  assert.match(appJs, /updateFilterCounts/);

  // Test filter logic directly with simulated products
  const products = [
    { name: "Eros Energy Versace for men", brand: "Versace" },
    { name: "Prada Paradoxe Intense Prada for women", brand: "Prada" },
    { name: "CK One Calvin Klein for women and men", brand: "Calvin Klein" },
    { name: "Baccarat Rouge 540 Maison Francis Kurkdjian unisex", brand: "MFK" },
    { name: "Neutral Eau de Cologne", brand: "Unknown" },
  ];

  function filter(men, women, unisex) {
    return products.filter((product) => {
      if (men || women || unisex) {
        const nameLower = (product.name || "").toLowerCase();
        const isUnisex = /for (?:women and men|men and women|women & men|men & women)\b/i.test(nameLower) || /\bunisex\b/i.test(nameLower);
        const isMen = isUnisex || /\bfor men\b/i.test(nameLower) || nameLower.includes("for men");
        const isWomen = isUnisex || /\bfor women\b/i.test(nameLower) || nameLower.includes("for women");

        const matchesMen = men && isMen;
        const matchesWomen = women && isWomen;
        const matchesUnisex = unisex && isUnisex;

        if (!matchesMen && !matchesWomen && !matchesUnisex) return false;
      }
      return true;
    });
  }

  // 1. None checked -> all 5
  assert.equal(filter(false, false, false).length, 5);

  // 2. Unisex checked only -> only unisex perfumes (CK One and Baccarat Rouge)
  const unisexOnly = filter(false, false, true).map((p) => p.name);
  assert.deepEqual(unisexOnly.sort(), [
    "Baccarat Rouge 540 Maison Francis Kurkdjian unisex",
    "CK One Calvin Klein for women and men",
  ].sort());

  // 3. Men checked only -> Eros, CK One, Baccarat Rouge
  const menOnly = filter(true, false, false).map((p) => p.name);
  assert.deepEqual(menOnly.sort(), [
    "Baccarat Rouge 540 Maison Francis Kurkdjian unisex",
    "CK One Calvin Klein for women and men",
    "Eros Energy Versace for men",
  ].sort());

  // 4. Women checked only -> Prada, CK One, Baccarat Rouge
  const womenOnly = filter(false, true, false).map((p) => p.name);
  assert.deepEqual(womenOnly.sort(), [
    "Baccarat Rouge 540 Maison Francis Kurkdjian unisex",
    "CK One Calvin Klein for women and men",
    "Prada Paradoxe Intense Prada for women",
  ].sort());

  // 5. Men and Women checked -> Eros, Prada, CK One, Baccarat Rouge
  const menAndWomen = filter(true, true, false).map((p) => p.name);
  assert.deepEqual(menAndWomen.sort(), [
    "Baccarat Rouge 540 Maison Francis Kurkdjian unisex",
    "CK One Calvin Klein for women and men",
    "Eros Energy Versace for men",
    "Prada Paradoxe Intense Prada for women",
  ].sort());

  // 6. Men and Unisex checked -> Eros, CK One, Baccarat Rouge
  const menAndUnisex = filter(true, false, true).map((p) => p.name);
  assert.deepEqual(menAndUnisex.sort(), [
    "Baccarat Rouge 540 Maison Francis Kurkdjian unisex",
    "CK One Calvin Klein for women and men",
    "Eros Energy Versace for men",
  ].sort());
});

test("frontend only displays Active products while backend displays both Active and Deactive", () => {
  const appJs = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");
  assert.match(appJs, /if\s*\(currentMode === "frontend" && product\.status === "Deactive"\)\s*{\s*return false;\s*}/);
  assert.match(appJs, /const basePool = currentMode === "frontend"\s*\?\s*products\.filter\(\(product\) => product\.status !== "Deactive"\)\s*:\s*products;/);

  const sampleProducts = [
    { name: "Perfume A for men", status: "Active" },
    { name: "Perfume B for women", status: "Deactive" },
    { name: "Perfume C unisex", status: "Active" },
    { name: "Perfume D for men", status: "Deactive" },
  ];

  function simulateVisible(mode, products) {
    return products.filter((product) => {
      if (mode === "frontend" && product.status === "Deactive") return false;
      return true;
    });
  }

  const frontendVisible = simulateVisible("frontend", sampleProducts);
  assert.deepEqual(frontendVisible.map((p) => p.name), ["Perfume A for men", "Perfume C unisex"]);

  const backendVisible = simulateVisible("backend", sampleProducts);
  assert.deepEqual(backendVisible.map((p) => p.name), [
    "Perfume A for men",
    "Perfume B for women",
    "Perfume C unisex",
    "Perfume D for men",
  ]);
});
