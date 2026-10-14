const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createApp } = require("../server");
const { DEFAULT_SETTINGS } = require("../database");

let server, baseUrl;

before(async () => {
  const fakeStore = {
    getSettings: async () => ({ ...DEFAULT_SETTINGS }),
    saveSettings: async (input) => ({ ...DEFAULT_SETTINGS, ...input }),
    resetSettings: async () => ({ ...DEFAULT_SETTINGS }),
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

test("index.html contains html2canvas, toast container, floating copy bar, and mobile modal", () => {
  const html = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
  assert.match(html, /src="\/html2canvas\.min\.js"/);
  assert.match(html, /id="toastContainer"/);
  assert.match(html, /id="floatingCopyBar"/);
  assert.match(html, /id="copySelectedImgBtn"/);
  assert.match(html, /id="clearSelectionBtn"/);
  assert.match(html, /id="mobileImageModal"/);
  assert.ok(fs.existsSync(path.join(__dirname, "../public/html2canvas.min.js")));
});

test("app.js contains multi-select logic, floating copy handler, mobile modal, and image inlining", () => {
  const appJs = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");
  assert.match(appJs, /card-hold-overlay/);
  assert.match(appJs, /card-select-checkbox/);
  assert.match(appJs, /toggleCardSelection/);
  assert.match(appJs, /copySelectedCardsAsImage/);
  assert.match(appJs, /openMobileImageModal/);
  assert.match(appJs, /initHoldToCopyListeners/);
  assert.match(appJs, /html2canvas/);
  assert.match(appJs, /fetchImageAsDataUrl/);
  assert.match(appJs, /getProxiedImageUrl/);
  assert.match(appJs, /generateSingleCardBlob/);
  assert.match(appJs, /generateSelectedCardsBlobs/);
  assert.match(appJs, /blobToDataUrl/);
  assert.match(appJs, /separate-modal-item/);
  assert.match(appJs, /\/api\/copy-images-to-clipboard/);
  // Verify selected panels are not merged into a single composite file
  assert.equal(appJs.includes("fragrance-multi-capture-wrapper"), false, "must not merge selected panels into a single file");
  // Verify top-right button disappeared from card template
  assert.equal(appJs.includes("card-copy-img-btn"), false);

  // Verify copySelectedCardsAsImage does NOT open modal popup
  const copyFunctionMatch = appJs.match(/async function copySelectedCardsAsImage\(\) \{([\s\S]*?)\nfunction /);
  assert.ok(copyFunctionMatch, "copySelectedCardsAsImage should be defined");
  assert.equal(copyFunctionMatch[1].includes("openMobileImageModal"), false, "copySelectedCardsAsImage must not call openMobileImageModal");
});

test("GET and OPTIONS /api/proxy-image validates URL, sets CORS and proxies image", async () => {
  // Test invalid URL
  const invalidRes = await fetch(`${baseUrl}/api/proxy-image?url=not-a-url`);
  assert.equal(invalidRes.status, 400);

  // Test missing URL
  const missingRes = await fetch(`${baseUrl}/api/proxy-image`);
  assert.equal(missingRes.status, 400);

  // Test OPTIONS CORS preflight
  const optionsRes = await fetch(`${baseUrl}/api/proxy-image`, { method: "OPTIONS" });
  assert.equal(optionsRes.status, 204);
  assert.equal(optionsRes.headers.get("access-control-allow-origin"), "*");

  // Test local static serving of html2canvas.min.js
  const scriptRes = await fetch(`${baseUrl}/html2canvas.min.js`);
  assert.equal(scriptRes.status, 200);
  assert.match(scriptRes.headers.get("content-type") || "", /javascript/);
});

test("POST and OPTIONS /api/copy-images-to-clipboard validates and handles multiple images", async () => {
  const optionsRes = await fetch(`${baseUrl}/api/copy-images-to-clipboard`, { method: "OPTIONS" });
  assert.equal(optionsRes.status, 204);

  // Empty images rejection
  const emptyRes = await fetch(`${baseUrl}/api/copy-images-to-clipboard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images: [] }),
  });
  assert.equal(emptyRes.status, 400);

  // Valid multiple images
  const samplePngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const postRes = await fetch(`${baseUrl}/api/copy-images-to-clipboard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      images: [
        { name: "panel-1.png", dataUrl: `data:image/png;base64,${samplePngBase64}` },
        { name: "panel-2.png", dataUrl: `data:image/png;base64,${samplePngBase64}` },
        { name: "panel-3.png", dataUrl: `data:image/png;base64,${samplePngBase64}` },
      ],
    }),
  });
  assert.equal(postRes.status, 200);
  const data = await postRes.json();
  assert.equal(data.success, true);
  assert.equal(data.count, 3);
  assert.equal(data.files.length, 3);
});
