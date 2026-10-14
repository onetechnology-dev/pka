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

test("DEFAULT_SETTINGS includes telegramContact configurations", () => {
  assert.equal(DEFAULT_SETTINGS.telegramContact, "+85510666813");
  assert.equal(DEFAULT_SETTINGS.telegramContactEnabled, "true");
  assert.equal(DEFAULT_SETTINGS.telegramContactText, "Chat with us on Telegram");
});

test("API saves and retrieves telegramContact settings", async () => {
  // 1. GET settings
  const getRes = await fetch(`${baseUrl}/api/settings`);
  assert.equal(getRes.status, 200);
  const getData = await getRes.json();
  assert.equal(getData.settings.telegramContact, "+85510666813");
  assert.equal(getData.settings.telegramContactEnabled, "true");

  // 2. POST update settings with phone number
  const updatePayload = {
    projectName: "PKA LUXE",
    logo: "⚜️",
    footTag: "Luxury Fragrances",
    telegramContact: "+85510666813",
    telegramContactEnabled: "true",
    telegramContactText: "Chat with us on Telegram",
  };
  const postRes = await fetch(`${baseUrl}/api/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatePayload),
  });
  assert.equal(postRes.status, 200);
  const postData = await postRes.json();
  assert.equal(postData.settings.telegramContact, "+85510666813");
  assert.equal(postData.settings.telegramContactText, "Chat with us on Telegram");

  // 3. Reset settings
  const resetRes = await fetch(`${baseUrl}/api/settings/reset`, { method: "POST" });
  assert.equal(resetRes.status, 200);
  const resetData = await resetRes.json();
  assert.equal(resetData.settings.telegramContact, "+85510666813");
});

test("index.html contains Telegram floating widget with icon on the left and no popup", () => {
  const html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
  assert.match(html, /id="telegramFloatingWidget"/);
  assert.match(html, /id="telegramFloatingBtn"/);
  assert.match(html, /id="telegramFloatingPillBtn"/);
  assert.match(html, /id="telegramFloatingPillLabel"/);
  assert.match(html, /src="\/telegram-icon\.png"/);
  assert.match(html, /id="settingTelegramContactEnabled"/);
  assert.match(html, /id="settingTelegramContact"/);
  assert.match(html, /placeholder="\+85510666813"/);

  // Assert telegramContactPopup and airplane icon are removed
  assert.equal(html.includes('id="telegramContactPopup"'), false);
  assert.equal(html.includes("btn-airplane-icon"), false);

  // Assert telegram icon appears before the pill button (on the left)
  const iconIdx = html.indexOf('id="telegramFloatingBtn"');
  const pillIdx = html.indexOf('id="telegramFloatingPillBtn"');
  assert.ok(iconIdx !== -1 && pillIdx !== -1 && iconIdx < pillIdx, "Telegram icon must appear before (to the left of) the pill button");
});


