const { chromium } = require("playwright");
const { launchChromium } = require("./browser-launcher");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("node:crypto");

function isFragranticaUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      ["fragrantica.com", "www.fragrantica.com"].includes(url.hostname) &&
      !url.username && !url.password && !url.port &&
      /^\/perfume\/[^/]+\/[^/]+-\d+\.html$/.test(url.pathname);
  } catch (_) {
    return false;
  }
}

// Runs in the page; keep this function independent of Node.js helpers.
function extractFragranticaProduct() {
  const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const unique = (values) => [...new Set(values.map(clean).filter(Boolean))];
  const text = (selector) => clean(document.querySelector(selector)?.textContent);
  const value = (node) => clean(node?.getAttribute("content") || node?.textContent);
  const meta = (selector) => clean(document.querySelector(selector)?.content);
  const absoluteUrl = (value) => {
    try {
      const url = new URL(value, document.baseURI);
      return value && ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch (_) { return ""; }
  };
  const schemas = [];
  const collect = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) return value.forEach(collect);
    if ([].concat(value["@type"] || []).includes("Product")) schemas.push(value);
    if (value["@graph"]) collect(value["@graph"]);
    if (value.mainEntity) collect(value.mainEntity);
  };
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try { collect(JSON.parse(script.textContent)); } catch (_) {}
  }
  const schema = schemas[0] || {};
  const brand = value(document.querySelector('[itemprop="brand"] [itemprop="name"]')) ||
    value(document.querySelector('[itemprop="brand"]')) ||
    clean(typeof schema.brand === "string" ? schema.brand : schema.brand?.name) ||
    text('a[href*="/designers/"]');
  const nameNode = [...document.querySelectorAll('[itemprop="name"]')]
    .find((node) => !node.closest('[itemprop="brand"], [itemprop="review"], [itemprop="author"], [itemtype*="Breadcrumb"]'));
  // An explicit microdata value is authoritative; only clean up a plain h1 fallback.
  let name = value(nameNode) || clean(schema.name);
  if (!name) {
    name = text("h1")
      .replace(/\s+for (?:women and men|men and women|women|men)$/i, "");
    if (brand && name.toLowerCase().endsWith(` ${brand.toLowerCase()}`)) {
      name = name.slice(0, -brand.length).trim();
    }
  }
  const schemaImage = Array.isArray(schema.image) ? schema.image[0] : schema.image;
  const imageUrl = (node) => {
    if (!node) return "";
    const image = node.matches("img, meta, link, source") ? node : node.querySelector("img, source");
    const candidates = [image?.getAttribute("content"), image?.getAttribute("data-src"),
      image?.getAttribute("data-lazy-src"), image?.getAttribute("data-original"),
      image?.getAttribute("data-srcset")?.split(",")[0]?.trim().split(/\s+/)[0],
      image?.currentSrc, image?.getAttribute("srcset")?.split(",")[0]?.trim().split(/\s+/)[0],
      image?.getAttribute("src"), image?.getAttribute("href"), node.getAttribute("content")];
    return candidates.map(absoluteUrl).find(Boolean) || "";
  };
  const productImage = [...document.querySelectorAll('[itemprop="image"]')]
    .find((node) => !node.closest('[itemprop="brand"], [itemprop="review"], [itemprop="author"]'));
  const photo = imageUrl(productImage) ||
    absoluteUrl(typeof schemaImage === "string" ? schemaImage : schemaImage?.url) ||
    imageUrl(document.querySelector('img[src*="/mdimg/perfume/"]')) || absoluteUrl(meta('meta[property="og:image"]'));
  const brandElement = document.querySelector('[itemprop="brand"]');
  const logo = schema.brand?.logo || schema.brand?.image;
  const brandLink = [...document.querySelectorAll('a[href*="/designers/"]')]
    .find((node) => clean(node.textContent).toLowerCase() === brand.toLowerCase() ||
      clean(node.querySelector("img")?.alt).toLowerCase() === brand.toLowerCase());
  const brandImage = [...document.images].find((node) =>
    /\/dizajneri\//.test(node.getAttribute("src") || node.getAttribute("data-src") || "") &&
    clean(node.alt).toLowerCase().includes(brand.toLowerCase()));
  const brandLogo = imageUrl(brandElement?.querySelector('[itemprop="logo"], [itemprop="image"], img')) ||
    imageUrl(brandLink) || imageUrl(brandImage) || absoluteUrl(typeof logo === "string" ? logo : logo?.url);
  const findLabel = (label, selector = "h2, h3, h4, h5, h6, span") =>
    [...document.querySelectorAll(selector)].find((node) => clean(node.textContent).toLowerCase() === label.toLowerCase());
  const isBoundary = (node) => [node, ...node.querySelectorAll("h1, h2, h3, h4, h5, h6, span")]
    .some((child) => child.matches("h1, h2, h3, h4, h5, h6") || /^(top|middle|base|heart) notes$/i.test(clean(child.textContent)));
  // Labels may be inside decorative wrappers. Climb those wrappers, but never
  // cross the next heading/tier when looking for its associated content.
  const sectionItems = (heading, selector) => {
    for (let anchor = heading; anchor && anchor !== document.body; anchor = anchor.parentElement) {
      for (let node = anchor.nextElementSibling; node; node = node.nextElementSibling) {
        if (isBoundary(node)) return [];
        const matches = [...(node.matches(selector) ? [node] : []), ...node.querySelectorAll(selector)];
        if (matches.length) return matches;
      }
    }
    return [];
  };
  const byName = (items) => [...new Map(items.filter((item) => item.name).map((item) => [item.name, item])).values()];
  const accordHeading = findLabel("main accords", "h6");
  let accordNodes = sectionItems(accordHeading, 'div[style*="background"], .accord-bar');
  if (!accordNodes.length) accordNodes = [...document.querySelectorAll(".accord-bar")];
  const mainAccords = byName(accordNodes.map((node) => {
    const style = getComputedStyle(node);
    return {
      name: clean(node.textContent),
      backgroundColor: style.backgroundColor,
      color: style.color,
      width: node.style.width || "100%",
      opacity: style.opacity,
    };
  }));
  const notes = (label) => {
    const links = sectionItems(findLabel(label), 'a[href*="/notes/"]');
    let values = byName(links.map((link) => {
      const image = link.querySelector('img[loading="lazy"], img');
      return {
        name: clean(link.querySelector(".pyramid-note-label, span")?.textContent || link.textContent || image?.alt),
        photo: imageUrl(image),
      };
    }));
    // Some layouts expose the pyramid only in the product description.
    const description = text('[itemprop="description"]') || clean(schema.description);
    const match = description.match(new RegExp(`${label.replace(/s$/, "s?")} (?:are|is) ([^.;]+)`, "i"));
    if (!values.length && match) values = unique(match[1].split(/,\s*|\s+and\s+/i)).map((name) => ({ name, photo: "" }));
    // Hydrated pyramids may wrap headings and links differently. Match missing
    // photos by their exact labels, never by URL (two notes can share a URL).
    const allLinks = [...document.querySelectorAll('a[href*="/notes/"]')];
    return values.map((note) => {
      if (note.photo) return note;
      const link = allLinks.find((node) => clean(node.querySelector(".pyramid-note-label")?.textContent || node.textContent || node.querySelector("img")?.alt)
        .toLowerCase() === note.name.toLowerCase());
      return { ...note, photo: imageUrl(link) };
    });
  };
  const isMetaLabel = (val) => /^(?:show votes|hide labels|votes?|hide|show|\d+)$/i.test(val);

  const findSpanLabel = (image, card, container) => {
    if (card && card !== image) {
      const specialized = card.querySelector(".pyramid-note-label");
      if (specialized && clean(specialized.textContent)) return clean(specialized.textContent);
      const spans = [...card.querySelectorAll("span")]
        .map((s) => clean(s.textContent))
        .filter((s) => s && !isMetaLabel(s));
      if (spans.length) return spans[spans.length - 1];
    }
    let sibling = image.nextElementSibling;
    while (sibling && !sibling.matches("img") && !sibling.querySelector("img")) {
      if (sibling.matches("span") && clean(sibling.textContent) && !isMetaLabel(clean(sibling.textContent))) {
        return clean(sibling.textContent);
      }
      const inner = sibling.querySelector(".pyramid-note-label, span");
      if (inner && clean(inner.textContent) && !isMetaLabel(clean(inner.textContent))) {
        return clean(inner.textContent);
      }
      sibling = sibling.nextElementSibling;
    }
    if (image.parentElement && image.parentElement !== container) {
      let parentSibling = image.parentElement.nextElementSibling;
      while (parentSibling && !parentSibling.matches("img") && !parentSibling.querySelector("img")) {
        if (parentSibling.matches("span") && clean(parentSibling.textContent) && !isMetaLabel(clean(parentSibling.textContent))) {
          return clean(parentSibling.textContent);
        }
        const inner = parentSibling.querySelector(".pyramid-note-label, span");
        if (inner && clean(inner.textContent) && !isMetaLabel(clean(inner.textContent))) {
          return clean(inner.textContent);
        }
        parentSibling = parentSibling.nextElementSibling;
      }
    }
    return clean(image.alt);
  };

  const pyramids = [...document.querySelectorAll('#pyramid, [id="pyramid"]')];
  const groups = { topNotes: [], middleNotes: [], baseNotes: [], fragranceNotes: [] };
  if (pyramids.length > 0) {
    const cards = new Map();
    const tierMap = {
      "top notes": "topNotes", "top note": "topNotes", "head notes": "topNotes",
      "middle notes": "middleNotes", "middle note": "middleNotes", "heart notes": "middleNotes",
      "base notes": "baseNotes", "base note": "baseNotes", "bottom notes": "baseNotes",
      "fragrance notes": "fragranceNotes", "perfume notes": "fragranceNotes",
    };
    for (const root of pyramids) {
      let images = [...root.querySelectorAll('img[loading="lazy"], a[href*="/notes/"] img, .pyramid-note-link img, img[src*="/sastojci/"], img[data-src*="/sastojci/"]')];
      if (!images.length) images = [...root.querySelectorAll('img')];
      for (const image of images) {
        let card = image.closest('a[href*="/notes/"], .pyramid-note-link, .note-card');
        if (!card || !root.contains(card)) {
          card = null;
          for (let node = image.parentElement; node && node !== root; node = node.parentElement) {
            if (node.querySelectorAll('img[loading="lazy"], a[href*="/notes/"] img, .pyramid-note-link img, img').length !== 1) break;
            if (node.querySelector("span")) { card = node; break; }
          }
        }
        card ||= image;
        if (!cards.has(card)) {
          cards.set(card, {
            name: findSpanLabel(image, card, root),
            photo: imageUrl(image),
          });
        }
      }
      for (const link of root.querySelectorAll('a[href*="/notes/"]')) {
        if (!cards.has(link) && !link.querySelector("img")) {
          cards.set(link, {
            name: clean(link.querySelector(".pyramid-note-label, span")?.textContent || link.textContent),
            photo: "",
          });
        }
      }
    }
    let tier = "fragranceNotes";
    const seenCards = new Set();
    for (const root of pyramids) {
      for (const node of root.querySelectorAll("*")) {
        const label = clean(node.textContent).toLowerCase();
        if (!node.querySelector("img") && !node.closest('a[href*="/notes/"], .pyramid-note-link') && tierMap[label]) {
          tier = tierMap[label];
        }
        const note = cards.get(node);
        if (note?.name && !seenCards.has(node)) {
          seenCards.add(node);
          groups[tier].push(note);
        }
      }
    }
    for (const key of Object.keys(groups)) groups[key] = byName(groups[key]);
  } else {
    // Older layouts have no #pyramid container.
    groups.topNotes = notes("Top Notes");
    groups.middleNotes = notes("Middle Notes");
    groups.baseNotes = notes("Base Notes");
    groups.fragranceNotes = notes("Fragrance Notes");
  }
  return { name, photo, brand, brandLogo, mainAccords, ...groups };
}

async function applyStealth(page) {
  await page.addInitScript(() => {
    try {
      const proto = Object.getPrototypeOf(navigator);
      delete proto.webdriver;
      Object.defineProperty(proto, "webdriver", { get: () => undefined, configurable: true });
    } catch (_) {}

    try {
      if (!window.chrome) {
        window.chrome = {
          app: { isInstalled: false, InstallState: { DISABLED: "disabled", INSTALLED: "installed", NOT_INSTALLED: "not_installed" }, RunningState: { CANNOT_RUN: "cannot_run", READY_TO_RUN: "ready_to_run", RUNNING: "running" } },
          runtime: {
            OnInstalledReason: { CHROME_UPDATE: "chrome_update", INSTALL: "install", SHARED_MODULE_UPDATE: "shared_module_update", UPDATE: "update" },
            OnRestartRequiredReason: { APP_UPDATE: "app_update", OS_UPDATE: "os_update", PERIODIC: "periodic" },
            PlatformArch: { ARM: "arm", ARM64: "arm64", MIPS: "mips", MIPS64: "mips64", X86_32: "x86-32", X86_64: "x86-64" },
            PlatformNaclArch: { ARM: "arm", MIPS: "mips", MIPS64: "mips64", X86_32: "x86-32", X86_64: "x86-64" },
            PlatformOs: { ANDROID: "android", CROS: "cros", LINUX: "linux", MAC: "mac", OPENBSD: "openbsd", WIN: "win" },
            RequestUpdateCheckStatus: { NO_UPDATE: "no_update", THROTTLED: "throttled", UPDATE_AVAILABLE: "update_available" },
          },
          loadTimes: function () {},
          csi: function () {},
        };
      }
    } catch (_) {}

    try {
      const fakePlugins = [
        { name: "PDF Viewer", filename: "internal-pdf-viewer", description: "Portable Document Format" },
        { name: "Chrome PDF Viewer", filename: "internal-pdf-viewer", description: "Portable Document Format" },
        { name: "Chromium PDF Viewer", filename: "internal-pdf-viewer", description: "Portable Document Format" },
        { name: "Microsoft Edge PDF Viewer", filename: "internal-pdf-viewer", description: "Portable Document Format" },
        { name: "WebKit built-in PDF", filename: "internal-pdf-viewer", description: "Portable Document Format" },
      ];
      Object.defineProperty(navigator, "plugins", {
        get: () => Object.assign([...fakePlugins], {
          item: (i) => fakePlugins[i] || null,
          namedItem: (n) => fakePlugins.find((p) => p.name === n) || null,
          refresh: () => {},
        }),
        configurable: true,
      });
    } catch (_) {}

    try {
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
        configurable: true,
      });
    } catch (_) {}

    try {
      const getParameterProto = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function (parameter) {
        if (parameter === 37445) return "Google Inc. (NVIDIA)";
        if (parameter === 37446) return "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)";
        return getParameterProto.call(this, parameter);
      };
      if (typeof WebGL2RenderingContext !== "undefined") {
        const getParameter2Proto = WebGL2RenderingContext.prototype.getParameter;
        WebGL2RenderingContext.prototype.getParameter = function (parameter) {
          if (parameter === 37445) return "Google Inc. (NVIDIA)";
          if (parameter === 37446) return "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)";
          return getParameter2Proto.call(this, parameter);
        };
      }
    } catch (_) {}
  });
}

async function resolveCloudflareTurnstile(page, onStatus = () => {}, maxWaitMs = 25000) {
  const isChallenge = async () => {
    return await page.evaluate(() => {
      const title = (document.title || "").toLowerCase();
      const body = (document.body ? document.body.innerText.slice(0, 1500) : "").toLowerCase();
      return (
        title.includes("just a moment") ||
        title.includes("security verification") ||
        body.includes("performing security verification") ||
        body.includes("verify you are human") ||
        body.includes("cloudflare")
      );
    }).catch(() => false);
  };

  const initialCheck = await isChallenge();
  if (!initialCheck) return true;

  onStatus("Cloudflare security verification detected. Attempting automated resolution in background...");
  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < maxWaitMs) {
    if (!(await isChallenge())) {
      onStatus("Cloudflare verification passed.");
      return true;
    }

    attempt++;
    for (const frame of page.frames()) {
      if (frame.url().includes("challenges.cloudflare.com")) {
        try {
          const selectors = [
            "input[type='checkbox']",
            ".ctp-checkbox-label",
            "#challenge-stage",
            ".mark",
            "div.checkbox-container",
            "label",
          ];
          for (const sel of selectors) {
            const el = await frame.$(sel);
            if (el) {
              const box = await el.boundingBox();
              if (box) {
                await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 });
                await page.waitForTimeout(60);
                await page.mouse.down();
                await page.waitForTimeout(80);
                await page.mouse.up();
                break;
              } else {
                await el.click().catch(() => {});
                break;
              }
            }
          }
        } catch (_) {}
      }
    }

    await page.waitForTimeout(1000);
  }

  return !(await isChallenge());
}

async function scrapeFragrantica(targetUrl, options = {}) {
  if (!isFragranticaUrl(targetUrl)) throw new Error("Enter a Fragrantica perfume URL, such as https://www.fragrantica.com/perfume/Prada/Prada-Paradoxe-Intense-83988.html.");
  const {
    headless = false,
    productOutputPath = path.join(__dirname, "fragrantica-products.json"),
    onStatus = () => {},
    timeout = headless ? 60000 : 120000,
    persist = true,
    sessionPath = path.join(__dirname, ".fragrantica-session.json"),
  } = options;
  onStatus(headless ? "Opening Fragrantica in the background" : "Opening Fragrantica. Complete any verification in the browser.");
  // Use launchChromium with container-safe flags and multi-stage browser detection.
  const browser = await launchChromium({ headless, channel: options.channel || "chromium" });
  try {
    let storageState;
    if (sessionPath && fs.existsSync(sessionPath)) {
      try {
        const saved = JSON.parse(fs.readFileSync(sessionPath, "utf8"));
        if (!Array.isArray(saved.cookies) || !Array.isArray(saved.origins)) throw new Error("Invalid session");
        storageState = saved;
      } catch (_) { onStatus("Saved browser session could not be read; starting a new session"); }
    }
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: "en-US", storageState, userAgent });
    await applyStealth(page);
    const response = await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    if ([404, 429].includes(response?.status())) {
      throw new Error(response.status() === 429
        ? "Fragrantica is limiting requests. Try again later. Saved results were not changed."
        : "This Fragrantica perfume page was not found. Saved results were not changed.");
    }

    // Proactively resolve Cloudflare verification if triggered
    const challengeMaxWait = Math.min(timeout, 25000);
    if (challengeMaxWait > 500) {
      await resolveCloudflareTurnstile(page, onStatus, challengeMaxWait);
    }

    try {
      await page.waitForFunction(`(() => {
        const product = (${extractFragranticaProduct.toString()})();
        return product.name && product.brand && product.photo && product.mainAccords.length;
      })()`, null, { timeout });
    } catch (_) {
      const challenge = await page.evaluate(() => /just a moment|verify.*human|security verification|access denied/i.test(document.title + " " + document.body.innerText.slice(0, 1500))).catch(() => false);
      throw new Error(challenge
        ? (headless
          ? "Fragrantica requires browser verification. Run once with Show browser enabled to complete verification and save the session, then retry in the background. The site may require verification again. Saved results were not changed."
          : "Fragrantica verification was not completed. Complete it in the opened browser within two minutes. Saved results were not changed.")
        : "Fragrantica did not finish loading the perfume details or its layout changed. Saved results were not changed.");
    }
    onStatus("Loading the fragrance pyramid and note images");
    try {
      await page.waitForFunction(`(() => {
        const pyramids = document.querySelectorAll('#pyramid, .pyramid-level-container');
        for (const p of pyramids) p.scrollIntoView({ block: 'center' });
        const product = (${extractFragranticaProduct.toString()})();
        const notes = [...product.topNotes, ...product.middleNotes, ...product.baseNotes, ...product.fragranceNotes];
        return notes.length > 0 && notes.every(note => note.photo);
      })()`, null, { timeout: Math.min(timeout, 15000) });
    } catch (_) {
      onStatus("Some note images were not supplied by the page; their labels will still be shown.");
    }
    const product = await page.evaluate(extractFragranticaProduct);
    if (!product.name || !product.brand || !product.photo || !product.mainAccords.length) {
      throw new Error("Could not read the Fragrantica product details. The page may be incomplete or its layout may have changed. Saved results were not changed.");
    }
    const products = [product];
    if (sessionPath) {
      const temporary = `${sessionPath}.${randomUUID()}.tmp`;
      try {
        const state = await page.context().storageState();
        state.cookies = state.cookies.filter((cookie) => /(^|\.)fragrantica\.com$/.test(cookie.domain));
        state.origins = state.origins.filter((origin) => ["www.fragrantica.com", "fragrantica.com"].includes(new URL(origin.origin).hostname));
        fs.writeFileSync(temporary, JSON.stringify(state), { mode: 0o600 });
        fs.renameSync(temporary, sessionPath);
      } catch (_) { onStatus("Product read successfully, but the browser session could not be saved"); }
      finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
    }
    if (persist) fs.writeFileSync(productOutputPath, JSON.stringify(products, null, 2));
    onStatus(`Found ${product.name}`);
    return { products, productOutputPath };
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  require("./run-cli").runCli("fragrantica", scrapeFragrantica, process.argv.slice(2))
    .catch((error) => { console.error(error.message); process.exitCode = 1; });
}

module.exports = { extractFragranticaProduct, isFragranticaUrl, scrapeFragrantica };
