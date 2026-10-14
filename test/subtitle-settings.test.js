const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createApp } = require("../server");
const { DEFAULT_SETTINGS } = require("../database");

let server, baseUrl;

before(async () => {
  let inMemorySettings = { ...DEFAULT_SETTINGS };
  const fakeStore = {
    getSettings: async () => ({ ...inMemorySettings }),
    saveSettings: async (input) => {
      inMemorySettings = { ...inMemorySettings, ...input };
      return inMemorySettings;
    },
    resetSettings: async () => {
      inMemorySettings = { ...DEFAULT_SETTINGS };
      return inMemorySettings;
    },
    list: async () => [],
  };

  const app = createApp(fakeStore);
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

test("DEFAULT_SETTINGS includes subtitle configuration", () => {
  assert.equal(DEFAULT_SETTINGS.subtitle, "Luxury Fragrance Collection");
});

test("index.html contains settingSubtitle input and topbarEyebrow subtitle display", () => {
  const html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
  assert.match(html, /id="settingSubtitle"/);
  assert.match(html, /name="subtitle"/);
  assert.match(html, /id="topbarEyebrow"/);
  assert.match(html, /Luxury Fragrance Collection/);
});

test("app.js handles settingSubtitle and updates topbarEyebrow", () => {
  const appJs = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");
  assert.match(appJs, /const settingSubtitle = document\.querySelector\("#settingSubtitle"\);/);
  assert.match(appJs, /subtitle:\s*String\(formData\.get\("subtitle"\)/);
  assert.match(appJs, /topbarEyebrow\.textContent = isFrontend \? \(currentSettings\.subtitle/);
});

test("API saves and retrieves subtitle settings", async () => {
  // 1. Initial GET
  const getRes = await fetch(`${baseUrl}/api/settings`);
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.equal(getData.settings.subtitle, "Luxury Fragrance Collection");

  // 2. Save custom subtitle
  const updatePayload = {
    projectName: "ROYAL SCENT",
    subtitle: "Haute Parfumerie Privée",
    logo: "👑",
    footTag: "Royal Scent Tag",
  };
  const postRes = await fetch(`${baseUrl}/api/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatePayload),
  });
  assert.equal(postRes.status, 200);
  const postData = await postRes.json();
  assert.equal(postData.settings.subtitle, "Haute Parfumerie Privée");

  // 3. Reset settings restores default subtitle
  const resetRes = await fetch(`${baseUrl}/api/settings/reset`, { method: "POST" });
  assert.equal(resetRes.status, 200);
  const resetData = await resetRes.json();
  assert.equal(resetData.settings.subtitle, "Luxury Fragrance Collection");
});
