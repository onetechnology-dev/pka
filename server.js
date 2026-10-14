const fs = require("fs");
const http = require("http");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");
const { URL } = require("url");
const { scrapeFoodpanda } = require("./scrape-foodpanda");
const { scrapeFragrantica, isFragranticaUrl } = require("./scrape-fragrantica");
const { randomUUID } = require("node:crypto");
const { createStore, createFallbackStore, problem, DEFAULT_SETTINGS } = require("./database");
const { createTelegramBotService } = require("./telegram-bot");

function setWindowsClipboardFiles(filePaths) {
  return new Promise((resolve) => {
    if (process.platform !== "win32" || !filePaths.length) {
      return resolve(false);
    }
    const escapedPaths = filePaths.map((p) => `'${p.replace(/'/g, "''")}'`).join(",");
    const psScript = `
      Add-Type -AssemblyName System.Windows.Forms
      $col = New-Object System.Collections.Specialized.StringCollection
      @(${escapedPaths}) | ForEach-Object { $col.Add($_) }
      [System.Windows.Forms.Clipboard]::SetFileDropList($col)
    `;
    let finished = false;
    const child = spawn("powershell.exe", ["-STA", "-NoProfile", "-Command", psScript], {
      stdio: "ignore",
      windowsHide: true,
    });
    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        try { child.kill(); } catch (_) {}
        resolve(false);
      }
    }, 4500);

    child.on("close", (code) => {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        resolve(code === 0);
      }
    });
    child.on("error", () => {
      if (!finished) {
        finished = true;
        clearTimeout(timer);
        resolve(false);
      }
    });
  });
}

const port = Number(process.env.PORT || 7000);
const host = process.env.HOST || "0.0.0.0";
const publicDir = path.join(__dirname, "public");
const sources = {
  foodpanda: scrapeFoodpanda,
  fragrantica: scrapeFragrantica,
};

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > 10 * 1024 * 1024) {
        request.destroy();
        reject(new Error("Request body is too large."));
      }
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (_) {
        reject(new Error("Request body must be valid JSON."));
      }
    });

    request.on("error", reject);
  });
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

function checkAdminAuth(request) {
  const cookieHeader = request.headers["cookie"] || "";
  if (cookieHeader.includes("admin_session=authenticated")) return true;

  const authHeader = request.headers["authorization"] || "";
  if (!authHeader.startsWith("Basic ")) return false;
  try {
    const credentials = Buffer.from(authHeader.slice(6).trim(), "base64").toString("utf8");
    const [user, pass] = credentials.split(":");
    return user === "admin" && pass === "123";
  } catch (_) {
    return false;
  }
}

function requireAdminAuth(response) {
  response.writeHead(401, {
    "WWW-Authenticate": 'Basic realm="Admin Access Required"',
    "Content-Type": "text/html; charset=utf-8",
  });
  response.end("<h1>401 Unauthorized</h1><p>Admin authentication required (User: admin / Pass: 123).</p>");
}

function serveStatic(request, response) {
  const requestUrl = new URL(request.url, `http://localhost:${port}`);
  const pathname = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const filePath = path.normalize(path.join(publicDir, pathname));

  if (!filePath.startsWith(publicDir + path.sep)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    const extension = path.extname(filePath);
    response.writeHead(200, {
      "content-type": mimeTypes[extension] || "application/octet-stream",
    });
    response.end(content);
  });
}

function createApp(store, scrapers = sources) {
const telegramBot = createTelegramBotService({ store, scrapers });
let activeRun = false;
const pending = new Map();
const imageProxyCache = new Map();
function confirmation(response, draft, conflicts) {
  const token = randomUUID();
  for (const [key, item] of pending) if (Date.now() - item.created > 15 * 60 * 1000) pending.delete(key);
  if (pending.size >= 20) pending.delete(pending.keys().next().value);
  pending.set(token, { ...draft, created: Date.now(), versions: { ...draft.versions, ...Object.fromEntries(conflicts.map((item) => [item.id, item.version])) } });
  sendJson(response, 409, { requiresConfirmation: true, token, conflicts,
    message: `${conflicts.length} existing product(s) found. Confirm before overwriting. Nothing has been saved yet.` });
}
async function finish(response, draft, result) {
  sendJson(response, 200, { source: draft.source, count: draft.products.length,
    products: await store.list(draft.source), added: result.added, overwritten: result.overwritten, logs: draft.logs });
}
const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://localhost:${port}`);

  const productMatch = requestUrl.pathname.match(/^\/api\/products\/([a-f0-9-]{36})$/i);
  if (productMatch && ["PATCH", "DELETE"].includes(request.method)) {
    try {
      const payload = await readRequestBody(request);
      const source = request.method === "PATCH"
        ? await store.edit(productMatch[1], payload, payload.version)
        : await store.delete(productMatch[1], payload.version);
      sendJson(response, 200, { source, products: await store.list(source) });
    } catch (error) { sendJson(response, error.statusCode || 500, { error: error.statusCode ? error.message : "Could not update the database." }); }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/scrape/confirm") {
    try {
      const payload = await readRequestBody(request);
      const draft = pending.get(payload.token);
      if (!draft || Date.now() - draft.created > 15 * 60 * 1000) throw problem("Confirmation expired. Run the scrape again.", 410);
      pending.delete(payload.token);
      if (payload.overwrite !== true) {
        sendJson(response, 200, { cancelled: true, source: draft.source, products: await store.list(draft.source) });
        return;
      }
      const result = await store.saveBatch(draft.source, draft.url, draft.products, draft.versions);
      if (result.conflicts.length) confirmation(response, draft, result.conflicts);
      else await finish(response, draft, result);
    } catch (error) { sendJson(response, error.statusCode || 500, { error: error.statusCode ? error.message : "Could not save the confirmed products." }); }
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/settings") {
    try {
      const settings = typeof store.getSettings === "function" ? await store.getSettings() : DEFAULT_SETTINGS;
      sendJson(response, 200, { settings });
    } catch (error) {
      sendJson(response, 500, { error: "Could not load settings." });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/settings") {
    try {
      const payload = await readRequestBody(request);
      if (typeof store.saveSettings !== "function") throw problem("Settings store not configured.", 500);
      const settings = await store.saveSettings(payload);
      sendJson(response, 200, { settings, message: "Settings saved successfully." });
    } catch (error) {
      sendJson(response, error.statusCode || 500, { error: error.statusCode ? error.message : "Could not save settings." });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/settings/reset") {
    try {
      const settings = typeof store.resetSettings === "function"
        ? await store.resetSettings()
        : (await store.saveSettings(DEFAULT_SETTINGS));
      sendJson(response, 200, { settings, message: "Settings reset to defaults." });
    } catch (error) {
      sendJson(response, error.statusCode || 500, { error: error.statusCode ? error.message : "Could not reset settings." });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/upload-logo") {
    try {
      const payload = await readRequestBody(request);
      if (!payload || !payload.data) {
        sendJson(response, 400, { error: "No image data provided." });
        return;
      }

      const rawData = String(payload.data).trim();
      const matches = rawData.match(/^data:image\/([a-zA-Z0-9+.-]+)(?:;[a-zA-Z0-9=._-]+)*;base64,([\s\S]+)$/i);
      let ext = ".png";
      let base64Data = rawData;

      if (matches) {
        const type = matches[1].toLowerCase();
        if (type === "svg+xml" || type === "svg") ext = ".svg";
        else if (type === "jpeg" || type === "jpg") ext = ".jpg";
        else if (type === "webp") ext = ".webp";
        else if (type === "gif") ext = ".gif";
        else if (type === "x-icon" || type === "vnd.microsoft.icon" || type === "ico") ext = ".ico";
        else ext = `.${type.replace(/[^a-z0-9]/g, "")}`;
        base64Data = matches[2].replace(/\s+/g, "");
      } else if (payload.name) {
        const fileExt = path.extname(payload.name).toLowerCase();
        if ([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".ico"].includes(fileExt)) {
          ext = fileExt;
        }
        base64Data = rawData.replace(/^data:image\/[^;]+;base64,/, "").replace(/\s+/g, "");
      }

      let buffer;
      if (rawData.startsWith("<svg") || rawData.startsWith("<?xml")) {
        ext = ".svg";
        buffer = Buffer.from(rawData, "utf8");
      } else {
        buffer = Buffer.from(base64Data, "base64");
      }

      if (!buffer || buffer.length === 0) {
        sendJson(response, 400, { error: "Invalid image content." });
        return;
      }

      const uploadsDir = path.join(publicDir, "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `logo-${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      sendJson(response, 200, { success: true, url: `/uploads/${filename}`, filename });
    } catch (error) {
      sendJson(response, 500, { error: error.message || "Failed to upload logo image." });
    }
    return;
  }

  if (request.method === "OPTIONS" && requestUrl.pathname === "/api/copy-images-to-clipboard") {
    response.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "*",
    });
    response.end();
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/copy-images-to-clipboard") {
    try {
      const body = await readRequestBody(request);
      const images = Array.isArray(body.images) ? body.images : [];
      if (!images.length) {
        sendJson(response, 400, { error: "No images provided." });
        return;
      }

      const clipboardDir = path.join(os.tmpdir(), "pka-scent-clipboard");
      if (!fs.existsSync(clipboardDir)) {
        fs.mkdirSync(clipboardDir, { recursive: true });
      }

      const writePromises = images.map(async (img, i) => {
        const dataUrl = img.dataUrl || "";
        const matches = dataUrl.match(/^data:image\/[A-Za-z-+/]+;base64,(.+)$/);
        const base64Str = matches ? matches[1] : (dataUrl.startsWith("data:") ? dataUrl.split(",")[1] : dataUrl);
        if (!base64Str) return null;

        const buffer = Buffer.from(base64Str, "base64");
        const safeName = (img.name || `perfume-${i + 1}`).replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 35);
        const fileName = `${Date.now()}_${i + 1}_${safeName.endsWith(".png") ? safeName : safeName + ".png"}`;
        const filePath = path.join(clipboardDir, fileName);
        await fs.promises.writeFile(filePath, buffer);
        return filePath;
      });

      const writeResults = await Promise.all(writePromises);
      const savedFilePaths = writeResults.filter(Boolean);

      let clipboardSet = false;
      if (savedFilePaths.length > 0) {
        clipboardSet = await setWindowsClipboardFiles(savedFilePaths);
      }

      sendJson(response, 200, {
        success: true,
        count: savedFilePaths.length,
        clipboardSet,
        files: savedFilePaths,
      });
    } catch (err) {
      sendJson(response, 500, { error: err.message || "Failed to copy images to clipboard." });
    }
    return;
  }

  if (request.method === "OPTIONS" && requestUrl.pathname === "/api/proxy-image") {
    response.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "*",
      "access-control-max-age": "86400",
    });
    response.end();
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/proxy-image") {
    const target = requestUrl.searchParams.get("url");
    if (!target || !isValidHttpUrl(target)) {
      sendJson(response, 400, { error: "Invalid target image URL." });
      return;
    }
    const responseType = requestUrl.searchParams.get("responseType");
    const cached = imageProxyCache.get(target);
    if (cached) {
      if (responseType === "text") {
        response.writeHead(200, {
          "content-type": "text/plain; charset=utf-8",
          "access-control-allow-origin": "*",
          "cache-control": "public, max-age=604800, immutable",
        });
        response.end(cached.base64DataUrl);
      } else {
        response.writeHead(200, {
          "content-type": cached.contentType,
          "access-control-allow-origin": "*",
          "cache-control": "public, max-age=604800, immutable",
        });
        response.end(cached.buffer);
      }
      return;
    }
    try {
      const imgRes = await fetch(target, {
        headers: {
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          "referer": target,
        },
      });
      if (!imgRes.ok) {
        sendJson(response, imgRes.status, { error: `Failed to fetch image: ${imgRes.statusText}` });
        return;
      }
      const contentType = imgRes.headers.get("content-type") || "image/jpeg";
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      const base64DataUrl = `data:${contentType};base64,${buffer.toString("base64")}`;
      if (imageProxyCache.size > 500) {
        const firstKey = imageProxyCache.keys().next().value;
        imageProxyCache.delete(firstKey);
      }
      imageProxyCache.set(target, { contentType, buffer, base64DataUrl });

      if (responseType === "text") {
        response.writeHead(200, {
          "content-type": "text/plain; charset=utf-8",
          "access-control-allow-origin": "*",
          "cache-control": "public, max-age=604800, immutable",
        });
        response.end(base64DataUrl);
      } else {
        response.writeHead(200, {
          "content-type": contentType,
          "access-control-allow-origin": "*",
          "cache-control": "public, max-age=604800, immutable",
        });
        response.end(buffer);
      }
    } catch (err) {
      sendJson(response, 500, { error: err.message || "Proxy image error" });
    }
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/telegram/status") {
    try {
      const status = await telegramBot.getStatus();
      sendJson(response, 200, status);
    } catch (err) {
      sendJson(response, 500, { error: err.message || "Could not get Telegram status." });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/telegram/test") {
    try {
      const payload = await readRequestBody(request);
      const botInfo = await telegramBot.testConnection(payload?.token);
      sendJson(response, 200, { ok: true, bot: botInfo });
    } catch (err) {
      sendJson(response, 400, { ok: false, error: err.message || "Failed to connect to Telegram bot." });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/telegram/send") {
    try {
      const payload = await readRequestBody(request);
      const result = await telegramBot.sendTestMessage(payload?.token, payload?.chatId, payload?.message);
      sendJson(response, 200, { ok: true, result });
    } catch (err) {
      sendJson(response, 400, { ok: false, error: err.message || "Failed to send message to Telegram." });
    }
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/products") {
    const source = requestUrl.searchParams.get("source") || "foodpanda";
    if (!Object.hasOwn(sources, source)) {
      sendJson(response, 400, { error: "Unknown scraper source." });
      return;
    }
    try {
      sendJson(response, 200, { source, products: await store.list(source) });
    } catch (error) {
      sendJson(response, 500, { error: "Could not load products from the database." });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/products") {
    try {
      const payload = await readRequestBody(request);
      const source = payload.source || (payload.barcode !== undefined ? "foodpanda" : "fragrantica");
      if (!Object.hasOwn(sources, source)) {
        sendJson(response, 400, { error: "Unknown scraper source." });
        return;
      }
      const sourceUrl = payload.sourceUrl || `https://local.admin/${source}/manual-${Date.now()}`;
      const result = await store.saveBatch(source, sourceUrl, [payload]);
      sendJson(response, 201, { source, products: await store.list(source), added: result.added });
    } catch (error) {
      sendJson(response, error.statusCode || 500, { error: error.statusCode ? error.message : "Could not add product." });
    }
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/scrape") {
    if (activeRun) {
      sendJson(response, 409, {
        error: "A scrape is already running. Wait for it to finish before starting another.",
      });
      return;
    }

    activeRun = true;

    try {
      const payload = await readRequestBody(request);
      const targetUrl = String(payload.url || "").trim();

      if (!isValidHttpUrl(targetUrl)) {
        sendJson(response, 400, { error: "Enter a valid http or https URL." });
        return;
      }

      const logs = [];
      const source = payload.source || (["fragrantica.com", "www.fragrantica.com"].includes(new URL(targetUrl).hostname) ? "fragrantica" : "foodpanda");
      if (!Object.hasOwn(sources, source)) {
        sendJson(response, 400, { error: "Unknown scraper source." });
        return;
      }
      if (source === "fragrantica" && !isFragranticaUrl(targetUrl)) {
        sendJson(response, 400, { error: "Enter a valid https://www.fragrantica.com/perfume/… product URL." });
        return;
      }
      const result = await scrapers[source](targetUrl, {
        persist: false,
        headless: payload.showBrowser !== true,
        onStatus: (message) => {
          logs.push({
            time: new Date().toISOString(),
            message,
          });
        },
      });

      const draft = { source, url: targetUrl, products: result.products, logs };
      const saved = await store.saveBatch(source, targetUrl, result.products);
      if (saved.conflicts.length) confirmation(response, draft, saved.conflicts);
      else await finish(response, draft, saved);
    } catch (error) {
      sendJson(response, 500, { error: error.message });
    } finally {
      activeRun = false;
    }
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/admin/session") {
    const authenticated = checkAdminAuth(request);
    sendJson(response, 200, { authenticated });
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/admin/login") {
    try {
      const payload = await readRequestBody(request);
      if (payload.username === "admin" && payload.password === "123") {
        response.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Set-Cookie": "admin_session=authenticated; Path=/; Max-Age=86400; SameSite=Lax",
        });
        response.end(JSON.stringify({ success: true, redirect: "/admin" }));
        return;
      }
      sendJson(response, 401, { error: "Invalid username or password (use admin / 123)." });
      return;
    } catch (_) {
      sendJson(response, 400, { error: "Invalid request payload." });
      return;
    }
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/admin/logout") {
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Set-Cookie": "admin_session=; Path=/; Max-Age=0; SameSite=Lax",
    });
    response.end(JSON.stringify({ success: true, redirect: "/admin" }));
    return;
  }

  if (request.method === "GET") {
    if (requestUrl.pathname === "/login" || requestUrl.pathname === "/login/") {
      const loginPath = path.join(publicDir, "login.html");
      fs.readFile(loginPath, (error, content) => {
        if (error) {
          response.writeHead(500);
          response.end("Could not load login view.");
          return;
        }
        response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        response.end(content);
      });
      return;
    }

    if (requestUrl.pathname === "/admin" || requestUrl.pathname === "/admin/") {
      const indexPath = path.join(publicDir, "index.html");
      fs.readFile(indexPath, (error, content) => {
        if (error) {
          response.writeHead(500);
          response.end("Could not load admin view.");
          return;
        }
        response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        response.end(content);
      });
      return;
    }

    serveStatic(request, response);
    return;
  }

  response.writeHead(405);
  response.end("Method not allowed");
});
server.telegramBot = telegramBot;
return server;
}

if (require.main === module) {
  (async () => {
    let store;
    try {
      store = await createStore();
    } catch (err) {
      console.warn(`[SERVER] Database initialization warning (${err.message}). Using resilient local storage.`);
      store = createFallbackStore();
    }

    try {
      if (process.env.SKIP_LEGACY_IMPORT !== "1") {
        await store.importLegacy().catch((err) => {
          console.warn(`[SERVER] Legacy import warning: ${err.message}`);
        });
      }
    } catch (err) {
      console.warn(`[SERVER] Legacy import skipped: ${err.message}`);
    }

    const server = createApp(store);
    server.on("error", async (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Server failed: ${error.code}. Port ${port} is already in use.`);
      } else {
        console.error(`Server failed: ${error.code}`);
      }
      await store.close().catch(() => {});
      process.exitCode = 1;
    });

    server.listen(port, host, () => {
      if (server.telegramBot) server.telegramBot.start();
      console.log(`Product scraper UI running at http://${host}:${server.address().port}`);
      console.log(`- Frontend: http://${host}:${server.address().port}/`);
      console.log(`- Backend:  http://${host}:${server.address().port}/admin (User: admin / Pass: 123)`);
      if (store.isFallback) {
        console.log(`- Storage: Local fallback storage active. (Add a MySQL service in Railway to store in MySQL)`);
      } else {
        console.log(`- Database: Connected to MySQL [${store.database}]`);
      }
    });

    const stop = () => {
      if (server.telegramBot) server.telegramBot.stop();
      server.close(() => store.close().catch(() => {}).then(() => process.exit(0)));
    };
    process.on("SIGINT", stop);
    process.on("SIGTERM", stop);
  })().catch((error) => {
    console.error(`Startup error: ${error.code || error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { createApp };
