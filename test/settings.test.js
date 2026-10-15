const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mysql = require("mysql2/promise");
const { chromium } = require("playwright");
const { createStore, DEFAULT_SETTINGS } = require("../database");
const { createApp } = require("../server");

let store, server, baseUrl, browser;

async function request(route, body, method = "POST") {
  const options = { method, headers: { "content-type": "application/json" } };
  if (body !== undefined) options.body = JSON.stringify(body);
  const response = await fetch(baseUrl + route, options);
  return { status: response.status, body: await response.json() };
}

before(async () => {
  store = await createStore({ database: `scraper_test_settings_${process.pid}_${Date.now()}` });
  server = createApp(store, {
    fragrantica: async () => ({ products: [] }),
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
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });
    try {
      assert.match(store.database, /^scraper_test_settings_\d+_\d+$/);
      await connection.query(`DROP DATABASE \`${store.database}\``);
    } finally {
      await connection.end();
    }
  }
});

test("database and API handle settings retrieval, saving, and reset", async () => {
  // Initial default settings
  const initial = await store.getSettings();
  assert.equal(initial.projectName, DEFAULT_SETTINGS.projectName);
  assert.equal(initial.logo, DEFAULT_SETTINGS.logo);
  assert.equal(initial.footTag, DEFAULT_SETTINGS.footTag);

  // GET /api/settings
  const getRes = await request("/api/settings", undefined, "GET");
  assert.equal(getRes.status, 200);
  assert.equal(getRes.body.settings.projectName, "PKA SCENT");

  // Save new settings via API
  const newConfig = {
    projectName: "ATELIER SCENT",
    logo: "👑",
    footTag: "HAUTE PARFUMERIE • ATELIER SCENT 2026",
  };
  const postRes = await request("/api/settings", newConfig, "POST");
  assert.equal(postRes.status, 200);
  assert.equal(postRes.body.settings.projectName, "ATELIER SCENT");
  assert.equal(postRes.body.settings.logo, "👑");
  assert.equal(postRes.body.settings.footTag, "HAUTE PARFUMERIE • ATELIER SCENT 2026");

  // Verify persistence in store
  const saved = await store.getSettings();
  assert.equal(saved.projectName, "ATELIER SCENT");
  assert.equal(saved.logo, "👑");
  assert.equal(saved.footTag, "HAUTE PARFUMERIE • ATELIER SCENT 2026");

  // Validation: empty projectName or invalid payload
  await assert.rejects(store.saveSettings({ projectName: "", logo: "⚜️", footTag: "Test" }), /Project name is required/);
  await assert.rejects(store.saveSettings({ projectName: "Valid", logo: "", footTag: "Test" }), /Logo is required/);
  await assert.rejects(store.saveSettings({ projectName: "Valid", logo: "⚜️", footTag: "" }), /Foot tag is required/);

  // Reset settings
  const resetRes = await request("/api/settings/reset", {}, "POST");
  assert.equal(resetRes.status, 200);
  assert.equal(resetRes.body.settings.projectName, DEFAULT_SETTINGS.projectName);
  assert.equal(resetRes.body.settings.logo, DEFAULT_SETTINGS.logo);
});

test("UI opens settings dialog, changes logo, project name, foot tag, and persists across reloads", async () => {
  const context = await browser.newContext({
    httpCredentials: { username: "admin", password: "123" },
  });
  await context.addCookies([
    { name: "admin_session", value: "authenticated", url: baseUrl + "/admin" },
  ]);
  const page = await context.newPage();
  try {
    await page.goto(baseUrl + "/admin");

    // Initial default brand elements
    assert.equal(await page.locator("h1.brand-title").textContent(), "PKA SCENT");
    assert.equal(await page.locator("#brandCrest .crest-symbol").textContent(), "⚜️");
    assert.equal(await page.locator("#footerTag").textContent(), DEFAULT_SETTINGS.footTag);
    assert.equal(await page.locator("#footerProjectName").textContent(), "PKA SCENT");

    // Open Website Bio dialog via sidebar nav button
    await page.locator("#websiteBioBtn").click();
    assert.equal(await page.locator("#websiteBioDialog").isVisible(), true);

    // Fill new project name, logo symbol via preset, and foot tag
    await page.locator("#settingProjectName").fill("PARFUM MAJESTY");
    await page.locator('.preset-pill[data-symbol="👑"]').click();
    assert.equal(await page.locator("#settingLogo").inputValue(), "👑");
    assert.equal(await page.locator("#logoPreviewCrest .crest-symbol").textContent(), "👑");

    await page.locator("#settingFootTag").fill("MAJESTY LUXURY COLLECTION • COPYRIGHT 2026");

    // Save Website Bio
    await page.locator("#saveWebsiteBioBtn").click();
    await page.waitForFunction(() => document.querySelector("h1.brand-title").textContent === "PARFUM MAJESTY");

    // Open settings dialog via sidebar admin settings button
    await page.locator("#adminSettingsBtn").click();
    assert.equal(await page.locator("#settingsDialog").isVisible(), true);
    assert.equal(await page.locator("#settingDefaultWebsite").inputValue(), "fragrantica");
    await page.locator("#settingDefaultWebsite").selectOption("foodpanda");
    await page.locator("#saveSettingsBtn").click();

    // Verify UI updates
    assert.equal(await page.locator("h1.brand-title").textContent(), "PARFUM MAJESTY");
    assert.equal(await page.locator("#brandCrest .crest-symbol").textContent(), "👑");
    assert.equal(await page.locator("#footerTag").textContent(), "MAJESTY LUXURY COLLECTION • COPYRIGHT 2026");
    assert.equal(await page.locator("#footerProjectName").textContent(), "PARFUM MAJESTY");
    assert.equal(await page.locator("#viewFrontendText").textContent(), "Frontend (PARFUM MAJESTY)");
    assert.equal(await page.title(), "PARFUM MAJESTY | Luxury Fragrance Scraper & Collection");

    // Reload page to ensure persistence
    await page.reload();
    await page.waitForFunction(() => document.querySelector("h1.brand-title").textContent === "PARFUM MAJESTY");
    assert.equal(await page.locator("h1.brand-title").textContent(), "PARFUM MAJESTY");
    assert.equal(await page.locator("#brandCrest .crest-symbol").textContent(), "👑");
    assert.equal(await page.locator("#footerTag").textContent(), "MAJESTY LUXURY COLLECTION • COPYRIGHT 2026");

    // Open settings from Admin panel button
    await page.locator("#adminSettingsBtn").click();
    assert.equal(await page.locator("#settingsDialog").isVisible(), true);
    assert.equal(await page.locator("#settingDefaultWebsite").inputValue(), "foodpanda");

    // Reset settings to defaults
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#resetSettingsBtn").click();
    await page.waitForFunction(() => document.querySelector("h1.brand-title").textContent === "PKA SCENT");
    assert.equal(await page.locator("h1.brand-title").textContent(), "PKA SCENT");
    assert.equal(await page.locator("#brandCrest .crest-symbol").textContent(), "⚜️");
    assert.equal(await page.locator("#footerTag").textContent(), DEFAULT_SETTINGS.footTag);
    assert.equal(await page.locator("#settingDefaultWebsite").inputValue(), "fragrantica");
  } finally {
    await page.close();
  }
});
