const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createApp } = require("../server");

let server, baseUrl;
const createdFiles = [];

before(async () => {
  const fakeStore = {
    getSettings: async () => ({}),
    saveSettings: async () => ({}),
    list: async () => [],
  };
  const app = createApp(fakeStore);
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  for (const f of createdFiles) {
    try {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    } catch (_) {}
  }
  if (server) await new Promise((resolve) => server.close(resolve));
});

test("POST /api/upload-logo uploads PNG and serves it statically", async () => {
  const pngDataUrl =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  const res = await fetch(`${baseUrl}/api/upload-logo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "logo.png", data: pngDataUrl }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.match(data.url, /^\/uploads\/logo-\d+-[a-f0-9]+\.png$/);

  const diskPath = path.join(__dirname, "..", "public", data.url);
  createdFiles.push(diskPath);
  assert.equal(fs.existsSync(diskPath), true);
  assert.equal(fs.statSync(diskPath).size, 70);

  // Test static retrieval
  const staticRes = await fetch(`${baseUrl}${data.url}`);
  assert.equal(staticRes.status, 200);
  assert.equal(staticRes.headers.get("content-type"), "image/png");
});

test("POST /api/upload-logo handles SVG with charset parameters", async () => {
  const svgDataUrl =
    "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PC9zdmc+";

  const res = await fetch(`${baseUrl}/api/upload-logo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "vector.svg", data: svgDataUrl }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.match(data.url, /^\/uploads\/logo-\d+-[a-f0-9]+\.svg$/);

  const diskPath = path.join(__dirname, "..", "public", data.url);
  createdFiles.push(diskPath);
  assert.equal(fs.existsSync(diskPath), true);

  const staticRes = await fetch(`${baseUrl}${data.url}`);
  assert.equal(staticRes.status, 200);
  assert.equal(staticRes.headers.get("content-type"), "image/svg+xml");
});

test("POST /api/upload-logo rejects invalid or empty data", async () => {
  const res = await fetch(`${baseUrl}/api/upload-logo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  assert.equal(res.status, 400);
});
