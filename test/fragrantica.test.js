const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const { extractFragranticaProduct, isFragranticaUrl, scrapeFragrantica } = require("../scrape-fragrantica");
const { createStore } = require("../database");
const mysql = require("mysql2/promise");
const modernHtml = fs.readFileSync(path.join(__dirname, "fixtures/fragrantica-modern.html"), "utf8");
const flatHtml = fs.readFileSync(path.join(__dirname, "fixtures/fragrantica-flat.html"), "utf8");

const targetUrl = "https://www.fragrantica.com/perfume/Prada/Prada-Paradoxe-Intense-83988.html";
const product = {
  name: "Prada Paradoxe Intense",
  photo: "https://fimgs.net/mdimg/perfume/375x500.83988.jpg",
  brand: "Prada",
  mainAccords: ["white floral", "vanilla", "citrus"],
  topNotes: ["Neroli", "Pear", "Bergamot"],
  baseNotes: ["Bourbon Vanilla", "Vanilla", "Amber", "Ambrofix™", "Serenolide"],
};
let browser, context;
let server;
let baseUrl, adminUrl;
let testStore;

before(async () => {
  testStore = await createStore({ database: `scraper_test_ui_${process.pid}_${Date.now()}` });
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({
    httpCredentials: { username: "admin", password: "123" },
  });
  server = spawn(process.execPath, ["server.js"], {
    cwd: path.join(__dirname, ".."),
    env: { ...process.env, PORT: "0", HOST: "127.0.0.1", DB_NAME: testStore.database, SKIP_LEGACY_IMPORT: "1" },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  baseUrl = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Test server did not start")), 10000);
    server.once("error", (error) => { clearTimeout(timer); reject(error); });
    server.stdout.on("data", (chunk) => {
      const match = chunk.toString().match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) { clearTimeout(timer); resolve(match[0]); }
    });
  });
  adminUrl = `${baseUrl}/admin`;
  await context.addCookies([
    { name: "admin_session", value: "authenticated", url: adminUrl },
  ]);
});

async function setSource(page, source) {
  await page.evaluate((val) => {
    const s = document.querySelector("#source");
    if (s) {
      s.value = val;
      s.dispatchEvent(new Event("change"));
    }
  }, source);
}

after(async () => {
  await browser?.close();
  if (server && server.exitCode === null) {
    const stopped = once(server, "exit");
    server.kill();
    await stopped;
  }
  if (testStore) {
    await testStore.close();
    const connection = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER, password: process.env.DB_PASSWORD });
    try {
      assert.match(testStore.database, /^scraper_test_ui_\d+_\d+$/);
      await connection.query(`DROP DATABASE \`${testStore.database}\``);
    } finally { await connection.end(); }
  }
});

test("accepts perfume pages and rejects wrong hosts, paths and protocols", () => {
  assert.equal(isFragranticaUrl(targetUrl), true);
  assert.equal(isFragranticaUrl(`${targetUrl}?source=test`), true);
  for (const value of ["invalid", "https://www.fragrantica.com/", targetUrl.replace("https:", "http:"),
    targetUrl.replace("www.fragrantica.com", "www.fragrantica.com.evil.test"),
    targetUrl.replace("www.fragrantica.com", "user:pass@www.fragrantica.com")]) {
    assert.equal(isFragranticaUrl(value), false, value);
  }
});

test("extracts all pyramid image/span pairs without requiring tier headings or note links", async () => {
  const page = await browser.newPage();
  try {
    await page.route("**/*", (route) => route.abort());
    await page.setContent(flatHtml);
    const expected = [
      { name: "Bourbon Vanilla", photo: "https://fimgs.net/mdimg/sastojci/t.74.jpg" },
      { name: "Vanilla", photo: "https://fimgs.net/mdimg/sastojci/t.74.jpg" },
      { name: "Pear", photo: "https://fimgs.net/mdimg/sastojci/t.182.jpg" },
    ];
    for (const title of ["Fragrance Notes", "Composition", ""]) {
      await page.locator("#pyramid strong").evaluate((node, text) => node.textContent = text, title);
      const result = await page.evaluate(extractFragranticaProduct);
      assert.deepEqual(result.fragranceNotes, expected);
      assert.deepEqual(result.topNotes, []);
      assert.deepEqual(result.middleNotes, []);
      assert.deepEqual(result.baseNotes, []);
    }
    await page.locator("#pyramid").evaluate((node) => {
      node.querySelector("strong").textContent = "Top Notes";
      const cards = node.querySelector(".pyramid-level-container");
      cards.children[1].insertAdjacentHTML("beforebegin", "<div>Base Notes</div>");
    });
    const grouped = await page.evaluate(extractFragranticaProduct);
    assert.deepEqual(grouped.topNotes, expected.slice(0, 1));
    assert.deepEqual(grouped.baseNotes, expected.slice(1));
    assert.deepEqual(grouped.fragranceNotes, []);
    await page.locator("#pyramid").evaluate((node) => {
      node.innerHTML = '<img loading="lazy" src="https://example.com/rose.jpg"><span>Rose</span>';
    });
    assert.deepEqual((await page.evaluate(extractFragranticaProduct)).fragranceNotes,
      [{ name: "Rose", photo: "https://example.com/rose.jpg" }]);
  } finally { await page.close(); }
});

test("headless mode waits for untitled lazy pyramid content and reuses successful sessions", async (t) => {
  const launch = chromium.launch.bind(chromium);
  const launches = [];
  let run = 0;
  let lastBrowser;
  t.mock.method(chromium, "launch", async (options) => {
    launches.push(options);
    lastBrowser = await launch(options);
    const newPage = lastBrowser.newPage.bind(lastBrowser);
    lastBrowser.newPage = async (pageOptions) => {
      const page = await newPage(pageOptions);
      run++;
      if (run === 2) assert.equal(pageOptions.storageState.cookies.some((cookie) => cookie.name === "scraper_test_session"), true);
      const html = flatHtml.replace(/<div id="pyramid">[\s\S]*?<\/body>/, `<div id="pyramid" style="margin-top:1800px"></div>
        <script>
          document.cookie = 'scraper_test_session=example; path=/';
          const root = document.getElementById('pyramid');
          const observer = new IntersectionObserver(entries => {
            if (!entries.some(entry => entry.isIntersecting)) return;
            setTimeout(() => root.innerHTML = '<div><img loading="lazy" src="https://fimgs.net/mdimg/sastojci/t.17.jpg"><span>Neroli</span></div>', 300);
            observer.disconnect();
          });
          root.style.minHeight = '50px'; observer.observe(root);
        </script></body>`);
      await page.route("**/*", (route) => route.request().isNavigationRequest()
        ? route.fulfill({ contentType: "text/html", status: run === 3 ? 403 : 200,
          body: run === 3 ? "<title>Just a moment...</title><h1>Verify you are human</h1>" : html }) : route.abort());
      return page;
    };
    return lastBrowser;
  });
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fragrantica-session-test-"));
  const sessionPath = path.join(dir, "session.json");
  try {
    for (let index = 0; index < 2; index++) {
      const result = await scrapeFragrantica(targetUrl, { headless: true, persist: false, sessionPath, timeout: 2000 });
      assert.deepEqual(result.products[0].fragranceNotes, [{ name: "Neroli", photo: "https://fimgs.net/mdimg/sastojci/t.17.jpg" }]);
      assert.equal(lastBrowser.isConnected(), false);
    }
    const saved = fs.readFileSync(sessionPath, "utf8");
    await assert.rejects(scrapeFragrantica(targetUrl, { headless: true, persist: false, sessionPath, timeout: 150 }), /requires browser verification/);
    assert.equal(fs.readFileSync(sessionPath, "utf8"), saved);
    assert.equal(lastBrowser.isConnected(), false);
    assert.equal(launches.every((options) => options.headless === true && options.channel === "chromium"), true);
  } finally {
    if (fs.existsSync(sessionPath)) fs.unlinkSync(sessionPath);
    fs.rmdirSync(dir);
  }
});

test("ungrouped notes display, filter and export in both views with the browser switch off", async () => {
  const page = await context.newPage();
  try {
    await page.route("https://**/*", (route) => route.abort());
    await page.setContent(flatHtml);
    const extracted = await page.evaluate(extractFragranticaProduct);
    await page.route("**/api/products*", (route) => route.fulfill({ json: { products: [] } }));
    await page.route("**/api/scrape", (route) => {
      assert.equal(route.request().postDataJSON().showBrowser, false);
      return route.fulfill({ json: { products: [extracted] } });
    });
    await page.goto(adminUrl);
    assert.equal(await page.locator("#showBrowser").isChecked(), false);
    await page.locator("#targetUrl").fill(targetUrl);
    await page.locator("#runButton").click();
    await page.waitForFunction(() => document.querySelector("#statusText").textContent.includes("Scrape complete"));
    assert.deepEqual(await page.locator("#productGallery .note-tier h4").allTextContents(), ["Fragrance Notes"]);
    assert.equal(await page.locator("#productGallery .note-photo").count(), 3);
    await page.locator("#tableView").click();
    assert.equal(await page.locator("#resultsBody .note-photo").count(), 3);
    await page.locator("#filterInput").fill("Bourbon Vanilla");
    assert.equal(await page.locator("#resultsBody tr").count(), 1);
    const downloadPromise = page.waitForEvent("download");
    await page.evaluate(() => document.querySelector("#downloadJson").click());
    const chunks = [];
    for await (const chunk of await (await downloadPromise).createReadStream()) chunks.push(chunk);
    assert.deepEqual(JSON.parse(Buffer.concat(chunks).toString())[0].fragranceNotes, extracted.fragranceNotes);
  } finally { await page.close(); }
});

test("extracts product identity, ordered accords and separate note tiers from DOM fixtures", async () => {
  const page = await browser.newPage();
  try {
    const links = (values) => values.map((value) => `<a href="/notes/${value}.html"><img alt="${value}">${value}</a>`).join("");
    await page.setContent(`<base href="https://www.fragrantica.com/">
      <h1>Prada Paradoxe Intense Prada <small>for women</small></h1>
      <a href="/designers/Prada.html">Prada</a>
      <img itemprop="image" src="${product.photo}">
      ${product.mainAccords.map((value) => `<div class="accord-bar">${value}</div>`).join("")}
      <div class="accord-bar">vanilla</div>
      <h4>Top Notes</h4><div>${links(product.topNotes)}</div>
      <h4>Middle Notes</h4><div>${links(["Jasmine", "Moss"])}</div>
      <h4>Base Notes</h4><div>${links(product.baseNotes)}</div>
      <h3>Related perfumes</h3><div>${links(["Must not leak"])}</div>`);
    const extracted = await page.evaluate(extractFragranticaProduct);
    const { brandLogo, middleNotes, fragranceNotes, ...originalFields } = extracted;
    assert.equal(brandLogo, "");
    assert.deepEqual(middleNotes.map((note) => note.name), ["Jasmine", "Moss"]);
    assert.deepEqual({ ...originalFields,
      mainAccords: extracted.mainAccords.map((item) => item.name),
      topNotes: extracted.topNotes.map((item) => item.name),
      baseNotes: extracted.baseNotes.map((item) => item.name),
    }, product);
  } finally { await page.close(); }
});

test("uses structured product identity and description fallback; absent tiers stay empty", async () => {
  const page = await browser.newPage();
  try {
    await page.setContent(`<script type="application/ld+json">broken</script>
      <script type="application/ld+json">${JSON.stringify({ "@graph": [{ "@type": "Product",
        name: "Example", brand: { name: "Example Brand" }, image: [{ url: product.photo }],
        description: "Top notes are Pear and Bergamot; middle notes are Rose; base note is Amber.",
      }] })}</script>`);
    let result = await page.evaluate(extractFragranticaProduct);
    assert.equal(result.name, "Example");
    assert.equal(result.brand, "Example Brand");
    assert.equal(result.photo, product.photo);
    assert.deepEqual(result.topNotes, [{ name: "Pear", photo: "" }, { name: "Bergamot", photo: "" }]);
    assert.deepEqual(result.baseNotes, [{ name: "Amber", photo: "" }]);
    await page.setContent("<h1>Example</h1>");
    result = await page.evaluate(extractFragranticaProduct);
    assert.deepEqual(result.topNotes, []);
    assert.deepEqual(result.baseNotes, []);
  } finally { await page.close(); }
});

test("extracts supplied modern markup, prioritizes microdata, and retains accord styles and note images", async () => {
  const page = await browser.newPage();
  try {
    await page.setContent(modernHtml);
    const result = await page.evaluate(extractFragranticaProduct);
    assert.equal(result.name, product.name);
    assert.equal(result.brand, product.brand);
    assert.equal(result.photo, product.photo);
    assert.deepEqual(result.mainAccords.map((item) => item.name),
      ["white floral", "vanilla", "citrus", "mossy", "amber", "fruity", "sweet", "fresh", "earthy", "powdery"]);
    assert.deepEqual(result.mainAccords.map((item) => item.backgroundColor),
      ["rgb(237, 242, 251)", "rgb(255, 254, 192)", "rgb(249, 255, 82)", "rgb(91, 107, 50)", "rgb(188, 77, 16)",
        "rgb(252, 75, 41)", "rgb(238, 54, 59)", "rgb(155, 229, 237)", "rgb(84, 72, 56)", "rgb(238, 221, 204)"]);
    assert.deepEqual(result.mainAccords[3], {
      name: "mossy", backgroundColor: "rgb(91, 107, 50)", color: "rgb(255, 255, 255)", width: "72.275%", opacity: "0.762357",
    });
    assert.deepEqual(result.topNotes, product.topNotes.map((name, index) => ({ name,
      photo: `https://fimgs.net/mdimg/sastojci/t.${[17, 182, 75][index]}.jpg`,
    })));
    assert.deepEqual(result.baseNotes, product.baseNotes.map((name, index) => ({ name,
      photo: `https://fimgs.net/mdimg/sastojci/t.${[74, 74, 54, 1457, 1446][index]}.jpg`,
    })));
    // A missing tier must not capture the following tier's links.
    await page.locator(".pyramid-level-container").first().evaluate((node) => node.remove());
    assert.deepEqual((await page.evaluate(extractFragranticaProduct)).topNotes, []);
  } finally { await page.close(); }
});

test("scrape accepts the modern page and preserves its file when a subsequent page is blocked", async (t) => {
  const launch = chromium.launch.bind(chromium);
  let html = modernHtml;
  let scrapeBrowser;
  t.mock.method(chromium, "launch", async (options) => {
    scrapeBrowser = await launch(options);
    const newPage = scrapeBrowser.newPage.bind(scrapeBrowser);
    scrapeBrowser.newPage = async (options) => {
      const page = await newPage(options);
      await page.route("**/*", (route) => route.request().isNavigationRequest()
        ? route.fulfill({ contentType: "text/html", body: html }) : route.abort());
      return page;
    };
    return scrapeBrowser;
  });
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fragrantica-test-"));
  const output = path.join(dir, "products.json");
  try {
    const result = await scrapeFragrantica(targetUrl, { headless: true, sessionPath: null, timeout: 1000, productOutputPath: output });
    assert.equal(result.products[0].mainAccords.length, 10);
    assert.equal(result.products[0].topNotes[0].photo, "https://fimgs.net/mdimg/sastojci/t.17.jpg");
    assert.equal(scrapeBrowser.isConnected(), false);
    const saved = fs.readFileSync(output, "utf8");
    assert.deepEqual(JSON.parse(saved), result.products);
    html = "<h1>Verify you are human</h1>";
    await assert.rejects(scrapeFragrantica(targetUrl, { headless: true, sessionPath: null, timeout: 150, productOutputPath: output }), /Saved results were not changed/);
    assert.equal(fs.readFileSync(output, "utf8"), saved);
    assert.equal(scrapeBrowser.isConnected(), false);
  } finally {
    if (fs.existsSync(output)) fs.unlinkSync(output);
    fs.rmdirSync(dir);
  }
});

test("UI renders and exports accord styles and note pictures from supplied markup", async () => {
  const page = await context.newPage();
  try {
    await page.setContent(modernHtml);
    const extracted = await page.evaluate(extractFragranticaProduct);
    await page.route("**/api/products*", (route) => route.fulfill({ json: { products: [extracted] } }));
    await page.goto(adminUrl);
    await setSource(page, "fragrantica");
    await page.waitForFunction(() => document.querySelectorAll("#resultsBody .accord-bar").length === 10);
    await page.locator("#tableView").click();
    assert.equal(await page.locator("#resultsBody .note-photo").count(), 8);
    assert.equal(await page.locator("#resultsBody .note-photo").first().getAttribute("loading"), "lazy");
    assert.equal(await page.locator("#resultsBody .note-photo").first().getAttribute("src"), extracted.topNotes[0].photo);
    const bars = await page.locator("#resultsBody .accord-bar").evaluateAll((nodes) => nodes.map((node) => ({
      name: node.textContent, backgroundColor: getComputedStyle(node).backgroundColor,
      color: getComputedStyle(node).color, width: node.style.width, opacity: node.style.opacity,
    })));
    assert.deepEqual(bars, extracted.mainAccords);
    await page.locator("#filterInput").fill("Serenolide");
    assert.equal(await page.locator("#resultsBody tr").count(), 1);
    const downloadPromise = page.waitForEvent("download");
    await page.evaluate(() => document.querySelector("#downloadJson").click());
    const chunks = [];
    for await (const chunk of await (await downloadPromise).createReadStream()) chunks.push(chunk);
    assert.deepEqual(JSON.parse(Buffer.concat(chunks).toString()), [extracted]);
  } finally { await page.close(); }
});

test("extracts lazy image variants, brand logo, and middle notes without confusing brand/product images", async () => {
  const page = await browser.newPage();
  try {
    await page.route("**/*", (route) => route.abort());
    await page.setContent(modernHtml);
    await page.evaluate(() => {
      document.querySelector('[itemprop="brand"]').insertAdjacentHTML("afterbegin",
        '<img itemprop="image" data-src="https://example.com/prada-logo.png" src="data:image/gif;base64,AAAA">');
      const images = document.querySelectorAll('.pyramid-level-container img');
      images[0].setAttribute("data-lazy-src", images[0].getAttribute("src"));
      images[0].setAttribute("src", "data:image/gif;base64,AAAA");
      images[1].setAttribute("srcset", `${images[1].getAttribute("src")} 1x`);
      images[1].removeAttribute("src");
      document.querySelector('a[href="/notes/Jasmine-14.html"]').insertAdjacentHTML("afterbegin",
        '<img src="https://fimgs.net/mdimg/sastojci/t.14.jpg" loading="lazy">');
      // Force description fallback with a layout whose heading shares a wrapper
      // with the pyramid; image enrichment still needs to recover the photo.
      document.querySelector("body").insertAdjacentHTML("beforeend",
        '<div itemprop="description">Top notes are Neroli, Pear and Bergamot.</div>');
      const title = [...document.querySelectorAll("span")].find((node) => node.textContent === "Top Notes");
      title.parentElement.append(document.querySelector(".pyramid-level-container"));
    });
    const result = await page.evaluate(extractFragranticaProduct);
    assert.equal(result.brandLogo, "https://example.com/prada-logo.png");
    assert.equal(result.photo, product.photo);
    assert.deepEqual(result.middleNotes, [{ name: "Jasmine", photo: "https://fimgs.net/mdimg/sastojci/t.14.jpg" }]);
    assert.equal(result.topNotes[0].photo, "https://fimgs.net/mdimg/sastojci/t.17.jpg");
    assert.equal(result.topNotes[1].photo, "https://fimgs.net/mdimg/sastojci/t.182.jpg");
  } finally { await page.close(); }
});

test("scrape waits for delayed pyramid hydration before saving note photos", async (t) => {
  const launch = chromium.launch.bind(chromium);
  t.mock.method(chromium, "launch", async (options) => {
    const instance = await launch(options);
    const newPage = instance.newPage.bind(instance);
    instance.newPage = async (options) => {
      const page = await newPage(options);
      const html = `<h1 itemprop="name">Example</h1><div itemprop="brand"><span itemprop="name">Brand</span></div>
        <img itemprop="image" src="https://example.com/bottle.jpg"><div class="accord-bar">floral</div>
        <div itemprop="description">Top note is Neroli.</div>
        <script>setTimeout(() => document.body.insertAdjacentHTML('beforeend',
          '<h4>Top Notes</h4><div class="pyramid-level-container"><a href="/notes/Neroli-17.html"><img src="https://fimgs.net/mdimg/sastojci/t.17.jpg"><span>Neroli</span></a></div>'), 400)</script>`;
      await page.route("**/*", (route) => route.request().isNavigationRequest()
        ? route.fulfill({ contentType: "text/html", body: html }) : route.abort());
      return page;
    };
    return instance;
  });
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fragrantica-hydration-"));
  const output = path.join(dir, "products.json");
  try {
    const result = await scrapeFragrantica(targetUrl, { headless: true, sessionPath: null, timeout: 2000, productOutputPath: output });
    assert.equal(result.products[0].topNotes[0].photo, "https://fimgs.net/mdimg/sastojci/t.17.jpg");
  } finally {
    if (fs.existsSync(output)) fs.unlinkSync(output);
    fs.rmdirSync(dir);
  }
});

test("catalogue and table load images, share filtering, and remain usable on mobile", async () => {
  const page = await context.newPage({ viewport: { width: 1400, height: 1100 } });
  try {
    // Local image fixture checks real browser decoding, without CDN availability.
    await page.route("https://**/*", (route) => route.fulfill({ contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#c792ad"/></svg>' }));
    await page.setContent(modernHtml);
    const extracted = await page.evaluate(extractFragranticaProduct);
    extracted.brandLogo = "https://example.com/prada.svg";
    extracted.middleNotes = [{ name: "Jasmine", photo: "https://fimgs.net/mdimg/sastojci/t.14.jpg" }];
    await page.route("**/api/products*", (route) => route.fulfill({ json: { products: [extracted] } }));
    await page.goto(adminUrl);
    await setSource(page, "fragrantica");
    await page.locator(".fragrance-card").waitFor();
    assert.equal(await page.locator("#productGallery").isVisible(), true);
    assert.equal(await page.locator("#tablePanel").isVisible(), false);
    assert.equal(await page.locator(".note-tier").count(), 3);
    await page.locator(".fragrance-card").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll("#productGallery img")].every((img) => img.complete && img.naturalWidth > 0));
    assert.equal(await page.locator("#productGallery .brand-logo").count(), 1);
    assert.equal(await page.locator("#productGallery .note-photo").count(), 9);
    await page.locator("#tableView").click();
    await page.locator("#resultsBody").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll("#resultsBody img")].every((img) => img.complete && img.naturalWidth > 0));
    assert.equal(await page.locator("#resultsBody .brand-logo").count(), 1);
    assert.equal(await page.locator("#resultsBody .note-photo").count(), 8);
    await page.locator("#catalogueView").click();
    await page.locator("#filterInput").fill("Jasmine");
    assert.equal(await page.locator(".fragrance-card").count(), 1);
    await page.locator("#filterInput").fill("no match");
    assert.equal(await page.locator(".fragrance-card").count(), 0);
    assert.equal(await page.locator("#emptyState").isVisible(), true);
    await page.locator("#filterInput").fill("");
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    const bottleBox = await page.locator(".bottle-panel").first().boundingBox();
    const identityBox = await page.locator(".identity-panel").first().boundingBox();
    const pyramidBox = await page.locator(".pyramid-panel").first().boundingBox();
    assert.equal(bottleBox.x < identityBox.x && identityBox.x < pyramidBox.x, true);
    await page.locator("#productGallery .note-photo").first().evaluate((img) => img.dispatchEvent(new Event("error")));
    assert.equal(await page.locator("#productGallery .note-item .image-fallback").first().isVisible(), true);
  } finally { await page.close(); }
});

test("API rejects invalid sources and Fragrantica URLs without launching a scrape", async () => {
  let response = await fetch(`${baseUrl}/api/products?source=../../test`);
  assert.equal(response.status, 400);
  for (const body of [{ source: "unknown", url: targetUrl }, { source: "fragrantica", url: "https://example.com" }]) {
    response = await fetch(`${baseUrl}/api/scrape`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
    });
    assert.equal(response.status, 400);
  }
  response = await fetch(`${baseUrl}/api/products`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).source, "foodpanda");
});

test("UI switches source, renders six columns, filters notes and downloads source-specific JSON", async () => {
  const page = await context.newPage();
  try {
    await page.route("**/api/products*", (route) => route.fulfill({ json: { products: [] } }));
    await page.route("**/api/scrape", (route) => {
      const body = route.request().postDataJSON();
      assert.equal(body.source, "fragrantica");
      assert.equal(body.url, targetUrl);
      return route.fulfill({ json: { source: "fragrantica", products: [product], count: 1 } });
    });
    await page.goto(adminUrl);
    await page.waitForFunction(() => document.querySelector("#statusText").textContent.includes("saved products"));
    await page.locator("#targetUrl").fill(targetUrl);
    assert.equal(await page.locator("#source").inputValue(), "fragrantica");
    await page.locator("#runButton").click();
    await page.waitForFunction(() => document.querySelector("#statusText").textContent.includes("Scrape complete"));
    assert.deepEqual(await page.locator("thead th").allTextContents(),
      ["Product Name", "Product Photo", "Brand", "Main Accords", "Top Notes", "Base Notes", "Fragrance Notes", "Status", "Action"]);
    assert.equal(await page.locator("#resultsBody tr").count(), 1);
    assert.match(await page.locator("#resultsBody").textContent(), /Ambrofix™/);
    assert.equal(await page.locator(".product-photo").getAttribute("src"), product.photo);
    await page.locator("#filterInput").fill("bergamot");
    assert.equal(await page.locator("#resultsBody tr").count(), 1);
    await page.locator("#filterInput").fill("not present");
    assert.equal(await page.locator("#resultsBody tr").count(), 0);
    const downloadPromise = page.waitForEvent("download");
    await page.evaluate(() => document.querySelector("#downloadJson").click());
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), "fragrantica-products.json");
    const chunks = [];
    for await (const chunk of await download.createReadStream()) chunks.push(chunk);
    assert.deepEqual(JSON.parse(Buffer.concat(chunks).toString()), [product]);
    await setSource(page, "foodpanda");
    assert.deepEqual(await page.locator("thead th").allTextContents(), ["Photo", "Barcode", "Name", "Price", "Status", "Action"]);
  } finally { await page.close(); }
});

test("extracts notes from nested and sibling #pyramid elements when Top, Middle, Base note spans are absent", async () => {
  const page = await browser.newPage();
  try {
    await page.setContent(`<base href="https://www.fragrantica.com/">
      <h1 itemprop="name">Bleu de Chanel L'Exclusif</h1>
      <div itemprop="brand"><span itemprop="name">Chanel</span></div>
      <img itemprop="image" src="https://fimgs.net/mdimg/perfume/375x500.113429.jpg">
      <div class="accord-bar">woody</div>
      <div class="md:mb-6" id="pyramid">
        <div class="mb-8" id="pyramid">
          <div class="header">
            <span>Fragrance Composition</span>
            <span>Fragrance Notes</span>
            <button><span>Show votes</span></button>
            <button><span>Hide Labels</span></button>
          </div>
          <div class="pyramid-level-container">
            <a href="https://www.fragrantica.com/notes/Amber-54.html" class="pyramid-note-link">
              <div class="relative"><img loading="lazy" src="https://fimgs.net/mdimg/sastojci/t.54.jpg" alt="Amber"></div>
              <span class="pyramid-note-label"> Amber </span>
            </a>
            <div class="note-box">
              <img loading="lazy" src="https://fimgs.net/mdimg/sastojci/t.315.jpg"><br>
              <span>Woody Notes</span>
            </div>
          </div>
        </div>
      </div>`);
    const extracted = await page.evaluate(extractFragranticaProduct);
    assert.deepEqual(extracted.topNotes, []);
    assert.deepEqual(extracted.middleNotes, []);
    assert.deepEqual(extracted.baseNotes, []);
    assert.deepEqual(extracted.fragranceNotes, [
      { name: "Amber", photo: "https://fimgs.net/mdimg/sastojci/t.54.jpg" },
      { name: "Woody Notes", photo: "https://fimgs.net/mdimg/sastojci/t.315.jpg" },
    ]);
  } finally { await page.close(); }
});

test("filters products by Men and Women checkboxes based on 'for men' and 'for women' in product name", async () => {
  const page = await context.newPage();
  try {
    const pMen = { ...product, name: "Eros Energy Versace for men", brand: "Versace" };
    const pWomen = { ...product, name: "Prada Paradoxe Intense Prada for women", brand: "Prada" };
    const pUnisex = { ...product, name: "CK One Calvin Klein for women and men", brand: "Calvin Klein" };
    await page.route("**/api/products*", (route) => route.fulfill({ json: { products: [pMen, pWomen, pUnisex] } }));
    await page.goto(adminUrl);
    await setSource(page, "fragrantica");
    await page.locator("#tableView").click();
    assert.equal(await page.locator("#resultsBody tr").count(), 3);

    // Filter Men only
    await page.locator("#filterMen").check();
    assert.equal(await page.locator("#resultsBody tr").count(), 2);
    const menNames = await page.locator("#resultsBody .product-name").allTextContents();
    assert.deepEqual(menNames.sort(), ["CK One Calvin Klein for women and men", "Eros Energy Versace for men"].sort());

    // Filter Women only
    await page.locator("#filterMen").uncheck();
    await page.locator("#filterWomen").check();
    assert.equal(await page.locator("#resultsBody tr").count(), 2);
    const womenNames = await page.locator("#resultsBody .product-name").allTextContents();
    assert.deepEqual(womenNames.sort(), ["CK One Calvin Klein for women and men", "Prada Paradoxe Intense Prada for women"].sort());

    // Filter Both Men and Women
    await page.locator("#filterMen").check();
    assert.equal(await page.locator("#resultsBody tr").count(), 3);

    // Uncheck both
    await page.locator("#filterMen").uncheck();
    await page.locator("#filterWomen").uncheck();
    assert.equal(await page.locator("#resultsBody tr").count(), 3);
  } finally { await page.close(); }
});

test("renders PKA SCENT header and separates Frontend storefront and Backend admin views with add product", async () => {
  const page = await context.newPage();
  try {
    const currentProducts = [{ ...product, name: "Eros Energy Versace for men" }];
    await page.route("**/api/products*", (route) => {
      if (route.request().method() === "POST") {
        const body = route.request().postDataJSON();
        const created = { ...product, name: body.name, brand: body.brand || "Custom Brand", id: "new-uuid" };
        currentProducts.push(created);
        return route.fulfill({ json: { source: "fragrantica", products: currentProducts, added: 1 } });
      }
      return route.fulfill({ json: { products: currentProducts } });
    });
    await page.goto(baseUrl);
    // Verify Header name is PKA SCENT
    assert.equal(await page.locator("h1.brand-title").textContent(), "PKA SCENT");

    // Default view on baseUrl is Frontend
    assert.equal(await page.locator("#storefrontHero").isVisible(), true);
    assert.equal(await page.locator("#adminControlPanel").isVisible(), false);
    assert.equal(await page.locator("#adminSummaryGrid").isVisible(), false);
    // On frontend, header buttons are hidden
    assert.equal(await page.locator(".topbar-controls").isVisible(), false);

    // Switch to Backend mode via adminUrl
    await page.goto(adminUrl);
    assert.equal(await page.locator("#storefrontHero").isVisible(), false);
    assert.equal(await page.locator("#adminControlPanel").isVisible(), true);
    assert.equal(await page.locator("#adminSummaryGrid").isVisible(), true);
    assert.equal(await page.locator(".topbar-controls").isVisible(), true);

    // Add Product from Admin
    await setSource(page, "fragrantica");
    await page.locator("#addProductBtn").click();
    await page.locator('#editProductForm [name="name"]').fill("Aventus Creed for men");
    await page.locator('#editProductForm [name="brand"]').fill("Creed");
    await page.locator("#saveEdit").click();
    await page.waitForFunction(() => document.querySelector("#statusText").textContent === "Product added");
    assert.equal(await page.locator("#resultsBody tr, #productGallery .fragrance-card").count() > 0, true);
  } finally { await page.close(); }
});

test("professional module login form blocks backend until admin enters credentials", async () => {
  const unauthContext = await browser.newContext();
  const page = await unauthContext.newPage();
  try {
    await page.goto(adminUrl);
    // Backend is locked
    await page.locator("#adminLoginModule").waitFor({ state: "visible" });
    assert.equal(await page.locator("#adminLoginModule").isVisible(), true);
    assert.equal(await page.locator("#adminControlPanel").isVisible(), false);

    // Invalid login attempt
    await page.locator("#moduleUsername").fill("admin");
    await page.locator("#modulePassword").fill("wrongpass");
    await page.locator("#moduleLoginSubmitBtn").click();
    await page.locator("#adminLoginError").waitFor({ state: "visible" });
    assert.equal(await page.locator("#adminLoginError").isVisible(), true);

    // Valid login attempt
    await page.locator("#modulePassword").fill("123");
    await page.locator("#moduleLoginSubmitBtn").click();
    await page.waitForFunction(() => !document.querySelector("#adminLoginModule") || document.querySelector("#adminLoginModule").hidden);

    // Dashboard unlocked
    assert.equal(await page.locator("#adminControlPanel").isVisible(), true);

    // Logout
    await page.locator("#logoutBtn").click();
    await page.locator("#adminLoginModule").waitFor({ state: "visible" });
    assert.equal(await page.locator("#adminLoginModule").isVisible(), true);
  } finally {
    await unauthContext.close();
  }
});

