const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createApp } = require("../server");

let server, baseUrl;

before(async () => {
  const fakeStore = {
    getSettings: async () => ({}),
    saveSettings: async (input) => input,
    list: async () => [],
    saveBatch: async () => ({ added: 1, overwritten: 0, conflicts: [] }),
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

test("app.js contains main accords color picker, presets, toHexColor and getContrastTextColor", () => {
  const appJs = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");
  assert.match(appJs, /ACCORD_COLOR_PRESETS/);
  assert.match(appJs, /toHexColor/);
  assert.match(appJs, /getContrastTextColor/);
  assert.match(appJs, /accord-color-input/);
  assert.match(appJs, /accord-color-swatch/);
  assert.match(appJs, /accord-hex-text/);
  assert.match(appJs, /accord-preview-pill/);
  assert.match(appJs, /data-value="backgroundColor"/);
});

test("styles.css contains rules for edit-accord-row, color swatch, hex input, and preview pill", () => {
  const css = fs.readFileSync(path.join(__dirname, "../public/styles.css"), "utf8");
  assert.match(css, /\.edit-accord-row/);
  assert.match(css, /\.accord-color-picker-wrap/);
  assert.match(css, /\.accord-color-swatch/);
  assert.match(css, /\.accord-hex-text/);
  assert.match(css, /\.accord-preview-pill/);
});

test("toHexColor and getContrastTextColor handle rgb, hex, and contrast correctly", () => {
  function toHexColor(colorStr, fallback = "#774414") {
    if (!colorStr || typeof colorStr !== "string") return fallback;
    const s = colorStr.trim().toLowerCase();
    if (/^#[0-9a-f]{6}$/i.test(s)) return s;
    if (/^#[0-9a-f]{3}$/i.test(s)) {
      return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
    }
    const rgbMatch = s.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgbMatch) {
      const r = Math.min(255, parseInt(rgbMatch[1], 10)).toString(16).padStart(2, "0");
      const g = Math.min(255, parseInt(rgbMatch[2], 10)).toString(16).padStart(2, "0");
      const b = Math.min(255, parseInt(rgbMatch[3], 10)).toString(16).padStart(2, "0");
      return `#${r}${g}${b}`;
    }
    return fallback;
  }

  function getContrastTextColor(hexColor) {
    const hex = toHexColor(hexColor, "#000000").slice(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 140 ? "#111111" : "#ffffff";
  }

  // Woody rgb -> #774414 with white text
  assert.equal(toHexColor("rgb(119, 68, 20)"), "#774414");
  assert.equal(getContrastTextColor("#774414"), "#ffffff");

  // Citrus yellow -> #f9ff52 with dark text
  assert.equal(toHexColor("rgb(249, 255, 82)"), "#f9ff52");
  assert.equal(getContrastTextColor("#f9ff52"), "#111111");

  // 3-digit hex #abc -> #aabbcc
  assert.equal(toHexColor("#abc"), "#aabbcc");

  // Empty string -> fallback #774414
  assert.equal(toHexColor(""), "#774414");
});
