const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { createStore } = require("../database");
const { createApp } = require("../server");

let store, server, baseUrl, browser;

before(async () => {
  store = await createStore({ database: `scraper_test_nav_${process.pid}_${Date.now()}` });
  server = createApp(store, {
    fragrantica: async () => ({ products: [] }),
    foodpanda: async () => ({ products: [] }),
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
});

after(async () => {
  if (browser) await browser.close().catch(() => {});
  if (server) await new Promise((resolve) => server.close(resolve)).catch(() => {});
  if (store) await store.close().catch(() => {});
});

test("backend UI disappears summary metrics and toolbar heading/view controls, renders nav sidebar, and keeps only Settings button in topbar", async () => {
  const context = await browser.newContext({
    httpCredentials: { username: "admin", password: "123" },
  });
  await context.addCookies([
    { name: "admin_session", value: "authenticated", url: baseUrl + "/admin" },
  ]);
  const page = await context.newPage({ viewport: { width: 1280, height: 800 } });
  try {
    await page.goto(baseUrl + "/admin");

    // 1. Verify summary metrics panel is disappeared in backend mode
    assert.equal(await page.locator("#adminSummaryGrid").isVisible(), false);

    // 2. Verify Fragrance Inventory / Catalogue heading and old toolbar view switch are disappeared
    assert.equal(await page.locator(".toolbar-title-group").isVisible(), false);

    // Verify Admin Controls header and Show browser switch are disappeared
    assert.equal(await page.locator(".admin-panel-header").isVisible(), false);
    assert.equal(await page.locator(".switch:has(#showBrowser)").isVisible(), false);

    // Verify filter chips have Khmer labels: ប្រុស, ស្រី, ស្រី/ប្រុស
    assert.equal(await page.locator('label[for="filterMen"] .chip-label').textContent(), "ប្រុស");
    assert.equal(await page.locator('label[for="filterWomen"] .chip-label').textContent(), "ស្រី");
    assert.equal(await page.locator('label[for="filterUnisex"] .chip-label').textContent(), "ស្រី/ប្រុស");

    // 3. Verify topbar-controls contains only ONE visible button: #openSettingsBtn (Settings)
    const visibleTopbarButtons = await page.locator(".topbar-controls button").evaluateAll((btns) =>
      btns.filter((b) => window.getComputedStyle(b).display !== "none" && b.offsetWidth > 0 && b.offsetHeight > 0).map((b) => b.id)
    );
    assert.deepEqual(visibleTopbarButtons, ["openSettingsBtn"]);

    // 4. Verify adminSidebar exists and contains all required nav buttons
    assert.equal(await page.locator("#adminSidebar").isVisible(), true);
    assert.equal(await page.locator("#adminSidebar #catalogueView").isVisible(), true);
    assert.equal(await page.locator("#adminSidebar #tableView").isVisible(), true);
    assert.equal(await page.locator("#adminSidebar #addProductBtn").isVisible(), true);
    assert.equal(await page.locator("#adminSidebar #viewFrontendBtn").isVisible(), true);
    assert.equal(await page.locator("#adminSidebar #adminSettingsBtn").isVisible(), true);
    assert.equal(await page.locator("#adminSidebar #logoutBtn").isVisible(), true);

    // 5. Test view switching from nav menu
    await page.locator("#adminSidebar #tableView").click();
    assert.equal(await page.locator("#catalogueView").getAttribute("aria-pressed"), "false");
    assert.equal(await page.locator("#tableView").getAttribute("aria-pressed"), "true");

    await page.locator("#adminSidebar #catalogueView").click();
    assert.equal(await page.locator("#catalogueView").getAttribute("aria-pressed"), "true");
    assert.equal(await page.locator("#tableView").getAttribute("aria-pressed"), "false");

    // 6. Test responsive mobile drawer behavior
    await page.setViewportSize({ width: 390, height: 844 });
    // On mobile, sidebar is off-canvas (not visible initially)
    assert.equal(await page.locator("#adminSidebar").isVisible(), false);
    assert.equal(await page.locator("#sidebarToggleBtn").isVisible(), true);

    // Open sidebar via hamburger toggle
    await page.locator("#sidebarToggleBtn").click();
    assert.equal(await page.locator("#adminSidebar").isVisible(), true);
    assert.equal(await page.locator("#sidebarBackdrop").isVisible(), true);

    // Close sidebar via close button
    await page.locator("#sidebarCloseBtn").click();
    await page.waitForFunction(() => !document.body.classList.contains("sidebar-open"));
    assert.equal(await page.locator("#adminSidebar").isVisible(), false);

    // Open again and close via backdrop
    await page.locator("#sidebarToggleBtn").click();
    assert.equal(await page.locator("#adminSidebar").isVisible(), true);
    await page.locator("#sidebarBackdrop").click({ position: { x: 350, y: 400 } });
    await page.waitForFunction(() => !document.body.classList.contains("sidebar-open"));
    assert.equal(await page.locator("#adminSidebar").isVisible(), false);

    // 7. Verify frontend mode hides sidebar and toggle button
    await page.goto(baseUrl + "/");
    assert.equal(await page.locator("#adminSidebar").isVisible(), false);
    assert.equal(await page.locator("#sidebarToggleBtn").isVisible(), false);
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
});
