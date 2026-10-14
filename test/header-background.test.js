const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createApp } = require("../server");

let server, baseUrl;

before(async () => {
  const fakeStore = {
    getSettings: async () => ({}),
    saveSettings: async () => ({}),
    resetSettings: async () => ({}),
    list: async () => [],
    getProducts: async () => [],
    countProducts: async () => 0,
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

test("public/header-bg.png exists and has valid PNG content", () => {
  const filePath = path.join(__dirname, "../public/header-bg.png");
  assert.equal(fs.existsSync(filePath), true, "header-bg.png should exist in public/");
  const stat = fs.statSync(filePath);
  assert.ok(stat.size > 10000, "header-bg.png should be a non-trivial image file");

  const buffer = fs.readFileSync(filePath);
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  assert.equal(buffer[0], 0x89);
  assert.equal(buffer[1], 0x50);
  assert.equal(buffer[2], 0x4e);
  assert.equal(buffer[3], 0x47);
});

test("public/styles.css configures .storefront-hero with header-bg.png and luxury overlay", () => {
  const css = fs.readFileSync(path.join(__dirname, "../public/styles.css"), "utf8");
  assert.match(css, /\.storefront-hero\s*\{[^}]*url\(['"]?\/header-bg\.png['"]?\)/);
  assert.match(css, /\.storefront-hero\s*\{[^}]*background-size:\s*cover/);
});

test("server serves /header-bg.png with status 200 and image/png content-type", async () => {
  const res = await fetch(`${baseUrl}/header-bg.png`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "image/png");
  const arrayBuffer = await res.arrayBuffer();
  assert.ok(arrayBuffer.byteLength > 10000);
});

test("public/styles.css configures header logo background as black and text color as white", () => {
  const css = fs.readFileSync(path.join(__dirname, "../public/styles.css"), "utf8");
  // Topbar background is black
  assert.match(css, /\.topbar\s*\{[^}]*background:\s*#000000/);
  // Header crest logo background is black
  assert.match(css, /\.brand-crest\s*\{[^}]*background:\s*#000000/);
  // Logo brand title text color is white
  assert.match(css, /\.brand-title\s*\{[^}]*color:\s*#ffffff/);
  // Subtitle eyebrow text color is white
  assert.match(css, /\.eyebrow\s*\{[^}]*color:\s*#ffffff/);
});

