const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { createApp } = require("../server");
const { createFallbackStore, DEFAULT_SETTINGS } = require("../database");

let server, baseUrl, adminUrl, browser, context;

before(async () => {
  const store = createFallbackStore();
  const app = createApp(store);
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  adminUrl = `${baseUrl}/admin`;
  browser = await chromium.launch({ headless: true });
});

after(async () => {
  if (context) await context.close();
  if (browser) await browser.close();
  if (server) await new Promise((resolve) => server.close(resolve));
});

test("index.html contains websiteBioBtn directly above adminSettingsBtn in sidebar", () => {
  const html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
  assert.match(html, /id="websiteBioBtn"/);
  assert.match(html, /id="websiteBioBtn"[\s\S]*?id="adminSettingsBtn"/);
});

test("index.html contains websiteBioDialog with Project Name, Subtitle, Logo, Header Bio, and Foot Tag", () => {
  const html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
  assert.match(html, /id="websiteBioDialog"/);
  assert.match(html, /id="websiteBioForm"/);
  assert.match(html, /id="settingProjectName"/);
  assert.match(html, /id="settingSubtitle"/);
  assert.match(html, /id="settingLogo"/);
  assert.match(html, /id="settingFootTag"/);
  assert.match(html, /id="settingHeroSubheading"/);
  assert.match(html, /id="settingHeroTitle"/);
  assert.match(html, /id="settingHeroText"/);
  assert.match(html, /id="settingHeroBackground"/);
  assert.match(html, /id="heroBgDropzone"/);
  assert.match(html, /id="heroBgFileInput"/);
  assert.match(html, /id="heroLivePreview"/);
});

test("server supports POST /api/upload-hero-bg for background image uploads", async () => {
  const pngBase64 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  const res = await fetch(`${baseUrl}/api/upload-hero-bg`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: pngBase64, name: "boutique-hero.png" }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.match(data.url, /^\/uploads\/hero-bg-\d+-[a-f0-9]+\.png$/);
});

test("UI opens Website Bio dialog, edits Header Bio text and background, and updates storefront hero live", async () => {
  context = await browser.newContext();
  await context.addCookies([
    { name: "admin_session", value: "authenticated", url: baseUrl + "/admin" },
  ]);
  const page = await context.newPage();

  try {
    await page.goto(adminUrl);

    // 1. Verify initial hero content on frontend
    await page.goto(baseUrl);
    assert.equal(await page.locator("#heroTitle").textContent(), DEFAULT_SETTINGS.heroTitle);
    assert.equal(await page.locator("#heroText").textContent(), DEFAULT_SETTINGS.heroText);

    // 2. Open Website Bio from Admin sidebar
    await page.goto(adminUrl);
    await page.locator("#websiteBioBtn").click();
    assert.equal(await page.locator("#websiteBioDialog").isVisible(), true);

    // 3. Edit Header Bio fields
    await page.locator("#settingHeroSubheading").fill("MAISON ROYALE • PARIS");
    await page.locator("#settingHeroTitle").fill("Artisanal Haute Parfumerie");
    await page.locator("#settingHeroText").fill("Discover handcrafted scents formulated with rare essences.");
    await page.locator("#settingHeroBackground").fill("/uploads/custom-hero.jpg");

    // 4. Verify mini live preview inside dialog updates
    assert.equal(await page.locator("#previewHeroSubheading").textContent(), "MAISON ROYALE • PARIS");
    assert.equal(await page.locator("#previewHeroTitle").textContent(), "Artisanal Haute Parfumerie");
    assert.equal(await page.locator("#previewHeroText").textContent(), "Discover handcrafted scents formulated with rare essences.");

    // 5. Save Website Bio
    await page.locator("#saveWebsiteBioBtn").click();
    await page.waitForFunction(() => !document.querySelector("#websiteBioDialog")?.open);

    // 6. Verify Storefront Hero reflects saved changes on Frontend
    await page.goto(baseUrl);
    assert.equal(await page.locator("#heroSubheading").textContent(), "MAISON ROYALE • PARIS");
    assert.equal(await page.locator("#heroTitle").textContent(), "Artisanal Haute Parfumerie");
    assert.equal(await page.locator("#heroText").textContent(), "Discover handcrafted scents formulated with rare essences.");
    const heroBg = await page.locator("#storefrontHero").evaluate((el) => el.style.backgroundImage);
    assert.match(heroBg, /\/uploads\/custom-hero\.jpg/);

    // 7. Verify persistence after reload
    await page.reload();
    assert.equal(await page.locator("#heroTitle").textContent(), "Artisanal Haute Parfumerie");
  } finally {
    await page.close();
  }
});

