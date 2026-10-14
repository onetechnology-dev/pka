const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mysql = require("mysql2/promise");
const { chromium } = require("playwright");
const { createStore, productKey, canonicalUrl } = require("../database");
const { createApp } = require("../server");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
let store, server, baseUrl, browser;
let scrapeCalls = 0;
let nextName = "Test Perfume";
const url = (id) => `https://www.fragrantica.com/perfume/Test/Perfume-${id}.html`;
const product = (name = "Test Perfume") => ({ name, brand: "Test", photo: "", brandLogo: "", mainAccords: ["floral"],
  topNotes: [{ name: "Pear", photo: "https://example.com/pear.jpg" }], middleNotes: [], baseNotes: [] });
const approved = (result) => Object.fromEntries(result.conflicts.map((item) => [item.id, item.version]));
async function request(route, body, method = "POST") {
  const response = await fetch(baseUrl + route, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
}
before(async () => {
  store = await createStore({ database: `scraper_test_db_${process.pid}_${Date.now()}` });
  server = createApp(store, {
    fragrantica: async (_, options) => { assert.equal(options.persist, false); scrapeCalls++; return { products: [product(nextName)] }; },
    foodpanda: async () => ({ products: [] }),
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
  if (server) await new Promise((resolve) => server.close(resolve));
  if (store) {
    await store.close();
    const connection = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER, password: process.env.DB_PASSWORD });
    try {
      assert.match(store.database, /^scraper_test_db_\d+_\d+$/);
      await connection.query(`DROP DATABASE \`${store.database}\``);
    } finally { await connection.end(); }
  }
});

test("accumulates links and requires confirmation even for identical data", async () => {
  await store.saveBatch("fragrantica", url(1), [product("One")]);
  await store.saveBatch("fragrantica", url(2), [product("Two")]);
  assert.equal((await store.list("fragrantica")).length, 2);
  const conflict = await store.saveBatch("fragrantica", `${url(1)}?utm_source=test#notes`, [product("One")]);
  assert.equal(conflict.conflicts.length, 1);
  assert.equal(conflict.conflicts[0].unchanged, true);
  assert.equal((await store.list("fragrantica")).length, 2);
  assert.equal(canonicalUrl(`${url(1)}?x=1#notes`), url(1));
  const result = await store.saveBatch("fragrantica", url(1), [product("Renamed")], approved(conflict));
  assert.equal(result.overwritten, 1);
  const row = (await store.list("fragrantica")).find((item) => item.sourceUrl === url(1));
  assert.equal(row.name, "Renamed");
  assert.equal(row.version, 2);
});

test("database preserves ungrouped note images through saving, editing, and duplicate detection", async () => {
  const data = { ...product("Ungrouped"), topNotes: [], fragranceNotes: [{ name: "Pear", photo: "https://example.com/pear.jpg" }] };
  await store.saveBatch("fragrantica", url(88), [data]);
  let row = (await store.list("fragrantica")).find((item) => item.sourceUrl === url(88));
  assert.deepEqual(row.fragranceNotes, data.fragranceNotes);
  await store.edit(row.id, { status: "Deactive", name: "Edited ungrouped" }, row.version);
  row = (await store.list("fragrantica")).find((item) => item.id === row.id);
  assert.deepEqual(row.fragranceNotes, data.fragranceNotes);
  const conflict = await store.saveBatch("fragrantica", url(88), [row]);
  assert.equal(conflict.conflicts[0].unchanged, true);
  await store.delete(row.id, row.version);
});

test("foodpanda batches are atomic and retain records absent from a later scrape", async () => {
  const link = "https://www.foodpanda.com.kh/shop/test";
  const a = { name: "A", barcode: "1", price: 1 };
  const b = { name: "B", barcode: "2", price: 2 };
  await store.saveBatch("foodpanda", link, [a]);
  const conflict = await store.saveBatch("foodpanda", link, [a, b]);
  assert.equal((await store.list("foodpanda")).length, 1, "new records must wait for the batch confirmation");
  await store.saveBatch("foodpanda", link, [a, b], approved(conflict));
  assert.equal((await store.list("foodpanda")).length, 2);
  const repeat = await store.saveBatch("foodpanda", link, [a]);
  await store.saveBatch("foodpanda", link, [a], approved(repeat));
  assert.equal((await store.list("foodpanda")).length, 2);
});

test("edits preserve metadata, reject stale writes, and persist status across overwrite and reconnect", async () => {
  let row = (await store.list("fragrantica")).find((item) => item.sourceUrl === url(2));
  const originalVersion = row.version;
  await store.edit(row.id, { name: "Edited", status: "Deactive" }, row.version);
  await assert.rejects(store.edit(row.id, { name: "Wrong", status: "Active" }, originalVersion), /changed/);
  const conflict = await store.saveBatch("fragrantica", url(2), [product("Scraped again")]);
  await store.saveBatch("fragrantica", url(2), [product("Scraped again")], approved(conflict));
  const another = await createStore({ database: store.database });
  try {
    row = (await another.list("fragrantica")).find((item) => item.id === row.id);
    assert.equal(row.status, "Deactive");
    assert.equal(row.topNotes[0].photo, "https://example.com/pear.jpg");
    await assert.rejects(another.edit(row.id, { status: "Disabled" }, row.version), /Status/);
  } finally { await another.close(); }
});

test("API cancellation and confirmation do not re-scrape and stale approvals cannot overwrite edits", async () => {
  nextName = "API original";
  await request("/api/scrape", { source: "fragrantica", url: url(3) });
  const duplicate = await request("/api/scrape", { source: "fragrantica", url: url(3) });
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.requiresConfirmation, true);
  const calls = scrapeCalls;
  const cancelled = await request("/api/scrape/confirm", { token: duplicate.body.token, overwrite: false });
  assert.equal(cancelled.body.cancelled, true);
  assert.equal(scrapeCalls, calls);
  nextName = "API new";
  const again = await request("/api/scrape", { source: "fragrantica", url: url(3) });
  let row = (await store.list("fragrantica")).find((item) => item.sourceUrl === url(3));
  await store.edit(row.id, { name: "Concurrent edit", status: "Active" }, row.version);
  const stale = await request("/api/scrape/confirm", { token: again.body.token, overwrite: true });
  assert.equal(stale.status, 409);
  row = (await store.list("fragrantica")).find((item) => item.id === row.id);
  assert.equal(row.name, "Concurrent edit");
  const confirmed = await request("/api/scrape/confirm", { token: stale.body.token, overwrite: true });
  assert.equal(confirmed.status, 200);
  assert.equal(confirmed.body.overwritten, 1);
  assert.equal(scrapeCalls, calls + 1);
  assert.equal((await request("/api/scrape/confirm", { token: stale.body.token, overwrite: true })).status, 410);
});

test("legacy import is one-time, matches perfume IDs, and deleted products stay deleted", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "scraper-import-"));
  const filename = path.join(dir, "fragrantica-products.json");
  const legacy = { ...product("Legacy"), photo: "https://fimgs.net/mdimg/perfume/375x500.83988.jpg" };
  fs.writeFileSync(filename, JSON.stringify([legacy]));
  try {
    assert.equal(await store.importLegacy(dir), 1);
    const duplicate = await store.saveBatch("fragrantica", url(83988), [legacy]);
    assert.equal(duplicate.conflicts.length, 1);
    const row = (await store.list("fragrantica")).find((item) => item.name === "Legacy");
    await assert.rejects(store.delete(row.id, row.version + 1), /changed/);
    await store.delete(row.id, row.version);
    assert.equal(await store.importLegacy(dir), 0);
    assert.equal((await store.list("fragrantica")).some((item) => item.id === row.id), false);
    assert.equal(productKey("fragrantica", "", legacy), productKey("fragrantica", url(83988), legacy));
  } finally { fs.unlinkSync(filename); fs.rmdirSync(dir); }
});

test("frontend saves multiple links, confirms duplicates, edits status, and deletes persistently", async () => {
  const context = await browser.newContext({
    httpCredentials: { username: "admin", password: "123" },
  });
  await context.addCookies([
    { name: "admin_session", value: "authenticated", url: baseUrl + "/admin" },
  ]);
  const page = await context.newPage();
  try {
    await page.route("https://example.com/**", (route) => route.abort());
    await page.goto(baseUrl + "/admin");
    await page.locator("#targetUrl").fill(`${url(10)}\n${url(11)}`);
    await page.locator("#runButton").click();
    await page.waitForFunction(() => document.querySelector("#statusText").textContent.includes("2 links saved"));
    await page.locator("#tableView").click();
    assert.equal(await page.locator("#resultsHead th").last().textContent(), "Action");
    const count = await page.locator("#resultsBody tr").count();
    await page.locator("#targetUrl").fill(url(10));
    page.once("dialog", (dialog) => dialog.dismiss());
    await page.locator("#runButton").click();
    await page.waitForFunction(() => document.querySelector("#statusText").textContent.includes("1 skipped"));
    assert.equal(await page.locator("#resultsBody tr").count(), count);
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#runButton").click();
    await page.waitForFunction(() => document.querySelector("#statusText").textContent.includes("1 links saved"));
    await page.locator('#resultsBody [data-action="edit"]').first().click();
    await page.locator('#editProductForm [name="name"]').fill("UI edited product");
    await page.locator('#editProductForm [name="status"]').selectOption("Deactive");
    await page.locator("#saveEdit").click();
    await page.waitForFunction(() => document.querySelector("#statusText").textContent === "Product updated");
    const row = page.locator("#resultsBody tr").filter({ hasText: "UI edited product" });
    assert.equal(await row.locator(".product-status").textContent(), "Deactive");
    await page.reload();
    await page.evaluate(() => {
      const s = document.querySelector("#source");
      if (s) { s.value = "fragrantica"; s.dispatchEvent(new Event("change")); }
    });
    await page.locator("#tableView").click();
    await row.waitFor();
    page.once("dialog", (dialog) => dialog.accept());
    await row.locator('[data-action="delete"]').click();
    await page.waitForFunction(() => document.querySelector("#statusText").textContent === "Product deleted");
    assert.equal(await row.count(), 0);
    assert.equal(await page.locator("#resultsBody tr").count(), count - 1);
  } finally { await page.close(); }
});
