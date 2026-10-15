const mysql = require("mysql2/promise");
const { createHash, randomUUID } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) process.loadEnvFile(envPath);

const DEFAULT_SETTINGS = {
  projectName: "PKA SCENT",
  subtitle: "Luxury Fragrance Collection",
  logo: "⚜️",
  footTag: "HAUTE PARFUMERIE • PKA SCENT — Exclusive Fragrance Discovery & Scraper Portal",
  heroSubheading: "HAUTE PARFUMERIE • PKA SCENT",
  heroTitle: "Exclusive Scent Discovery",
  heroText: "Explore luxury olfactory pyramids, vibrant main accords, and signature designer perfumes.",
  heroBackground: "/header-bg.png",
  defaultWebsite: "fragrantica",
  telegramBotToken: "8670278807:AAGODQKhNr4vdnWnI47AEEzNftRAqzkMGO0",
  telegramBotUsername: "pkascent_bot",
  telegramChatId: "+85510666813",
  telegramBotEnabled: "true",
  telegramContact: "+85510666813",
  telegramContactEnabled: "true",
  telegramContactText: "Chat with us on Telegram",
};

const DEFAULT_TAGS = [
  { id: "default-popular", name: "ក្លិនពេញនិយម" },
];

function problem(message, statusCode = 400) {
  return Object.assign(new Error(message), { statusCode });
}

function canonicalUrl(value) {
  if (!value) return "";
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw problem("Enter a valid website URL.");
  url.hash = "";
  if (["www.fragrantica.com", "fragrantica.com"].includes(url.hostname)) {
    url.hostname = "www.fragrantica.com";
    url.protocol = "https:";
    url.search = "";
  } else {
    for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid|gclid)/i.test(key)) url.searchParams.delete(key);
    url.searchParams.sort();
  }
  return url.href;
}

function cleanProduct(source, input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw problem("Product must be an object.");
  const output = {};
  const fields = source === "fragrantica" ? ["name", "photo", "brand", "brandLogo"] : ["name", "photo", "barcode"];
  for (const field of fields) {
    if (input[field] !== undefined && typeof input[field] !== "string") throw problem(`${field} must be text.`);
    output[field] = (input[field] || "").trim();
    if (output[field].length > 10000) throw problem(`${field} is too long.`);
  }
  if (!output.name) throw problem("Product name is required.");
  const imageUrl = (value) => {
    if (!value) return "";
    try { const url = new URL(value); if (["https:", "http:"].includes(url.protocol)) return url.href; } catch (_) {}
    throw problem("Image URLs must start with http:// or https://.");
  };
  output.photo = imageUrl(output.photo);
  if (source === "fragrantica") {
    output.brandLogo = imageUrl(output.brandLogo);
    for (const field of ["mainAccords", "topNotes", "middleNotes", "baseNotes", "fragranceNotes"]) {
      const list = input[field] ?? [];
      if (!Array.isArray(list) || list.length > 100) throw problem(`${field} must be a list of up to 100 items.`);
      output[field] = list.map((item) => {
        if (typeof item === "string") item = { name: item };
        if (!item || typeof item.name !== "string" || !item.name.trim()) throw problem(`Each ${field} item needs a name.`);
        const result = { name: item.name.trim() };
        if (field === "mainAccords") {
          for (const key of ["backgroundColor", "color", "width", "opacity"]) {
            if (item[key] !== undefined) result[key] = String(item[key]).slice(0, 100);
          }
        } else result.photo = imageUrl(item.photo || "");
        return result;
      });
    }
  } else {
    if (input.price !== "" && input.price !== undefined && !Number.isFinite(Number(input.price))) throw problem("Price must be a number.");
    output.price = input.price === "" || input.price === undefined ? "" : Number(input.price);
  }

  let tags;
  if (Array.isArray(input.tags)) {
    tags = [...new Set(input.tags.map((t) => String(t).trim()).filter(Boolean))];
  } else if (typeof input.tags === "string") {
    tags = [...new Set(input.tags.split(",").map((t) => t.trim()).filter(Boolean))];
  } else if (input.tags === null) {
    tags = [];
  } else {
    tags = ["ក្លិនពេញនិយម"];
  }
  output.tags = tags;

  return output;
}

function productKey(source, url, product) {
  const perfumeId = url.match(/-(\d+)\.html$/)?.[1] || product.photo?.match(/\.(\d+)\.(?:jpg|png|webp)/)?.[1];
  const identity = source === "fragrantica"
    ? (perfumeId ? `perfume:${perfumeId}` : url || `legacy:${product.brand}:${product.name}`)
    : `${url}|${product.barcode || product.name.toLowerCase()}`;
  return createHash("sha256").update(`${source}:${identity}`).digest("hex");
}

function fromRow(row) {
  const data = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
  if (!Array.isArray(data.tags)) {
    data.tags = ["ក្លិនពេញនិយម"];
  }
  return { ...data, id: row.id, source: row.source, sourceUrl: row.source_url,
    status: row.status, version: row.version, createdAt: row.created_at, updatedAt: row.updated_at };
}

function parseDbConfig(options = {}) {
  const anyMysqlUrl = Object.values(process.env).find((v) => typeof v === "string" && v.startsWith("mysql://"));
  const urlString =
    options.url ||
    process.env.MYSQL_URL ||
    process.env.DATABASE_URL ||
    process.env.MYSQL_PRIVATE_URL ||
    process.env.MYSQL_PUBLIC_URL ||
    process.env["${{MySQL.MYSQL_PRIVATE_URL}}"] ||
    process.env["${{MySQL.MYSQL_URL}}"] ||
    process.env["${{MySQL.DATABASE_URL}}"] ||
    anyMysqlUrl;
  let host = process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.DB_HOST || "127.0.0.1";
  let port = Number(process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT || 3306);
  let user = process.env.MYSQLUSER || process.env.MYSQL_USER || process.env.DB_USER || "root";
  let password = process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || "";
  let database = options.database || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.DB_NAME || "scraper";

  if (urlString) {
    try {
      const parsed = new URL(urlString);
      if (parsed.hostname) host = parsed.hostname;
      if (parsed.port) port = Number(parsed.port);
      if (parsed.username) user = decodeURIComponent(parsed.username);
      if (parsed.password) password = decodeURIComponent(parsed.password);
      if (parsed.pathname && parsed.pathname.length > 1) {
        database = decodeURIComponent(parsed.pathname.slice(1));
      }
    } catch (e) {
      console.warn("[DATABASE] Could not parse database URL:", e.message);
    }
  }

  if (options.database) database = options.database;
  return { host, port, user, password, database };
}

function createFallbackStore(options = {}) {
  const database = options.database || "scraper_fallback";
  const memoryProducts = new Map();
  let memorySettings = { ...DEFAULT_SETTINGS };
  let legacyImported = false;

  const fallbackStore = {
    database,
    isFallback: true,
    close: async () => {},
    async list(source) {
      return [...memoryProducts.values()]
        .filter((item) => item.source === source)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    async saveBatch(source, rawUrl, products, approvedVersions = null) {
      const url = canonicalUrl(rawUrl);
      const candidates = [...new Map(products.map((product) => {
        const data = cleanProduct(source, product);
        const status = product.status === "Deactive" ? "Deactive" : "Active";
        return [productKey(source, url, data), { data, status }];
      })).entries()];

      const existing = new Map();
      const conflicts = [];
      for (const [key, { data }] of candidates) {
        const found = [...memoryProducts.values()].find((row) => row.productKey === key);
        if (!found) continue;
        existing.set(key, found);
        if (approvedVersions?.[found.id] !== found.version) {
          conflicts.push({
            id: found.id,
            version: found.version,
            name: found.name,
            unchanged: JSON.stringify(cleanProduct(source, found)) === JSON.stringify(data),
          });
        }
      }

      if (conflicts.length) return { conflicts, added: 0, overwritten: 0 };
      if (approvedVersions && Object.keys(approvedVersions).some((id) => ![...existing.values()].some((row) => row.id === id))) {
        throw problem("A product changed or was deleted while confirmation was open. Run the scrape again.", 409);
      }

      let added = 0;
      let overwritten = 0;
      const now = new Date().toISOString();
      for (const [key, { data, status }] of candidates) {
        const found = existing.get(key);
        if (found) {
          Object.assign(found, data, {
            sourceUrl: url,
            version: found.version + 1,
            updatedAt: now,
          });
          overwritten++;
        } else {
          const id = randomUUID();
          memoryProducts.set(id, {
            ...data,
            id,
            source,
            sourceUrl: url,
            productKey: key,
            status,
            version: 1,
            createdAt: now,
            updatedAt: now,
          });
          added++;
        }
      }
      return { conflicts: [], added, overwritten };
    },
    async edit(id, changes, version) {
      const item = memoryProducts.get(id);
      if (!item) throw problem("Product not found.", 404);
      if (version !== undefined && version !== item.version) throw problem("This product changed. Reload it before editing.", 409);
      const newStatus = changes.status || item.status;
      if (!["Active", "Deactive"].includes(newStatus)) throw problem("Status must be Active or Deactive.");
      const data = cleanProduct(item.source, { ...item, ...changes });
      Object.assign(item, data, { status: newStatus, version: item.version + 1, updatedAt: new Date().toISOString() });
      return item.source;
    },
    async delete(id, version) {
      const item = memoryProducts.get(id);
      if (!item) throw problem("Product not found.", 404);
      if (version !== item.version) throw problem("This product changed. Reload it before deleting.", 409);
      memoryProducts.delete(id);
      return item.source;
    },
    async importLegacy(directory = __dirname) {
      if (legacyImported) return 0;
      legacyImported = true;
      let imported = 0;
      for (const source of ["foodpanda", "fragrantica"]) {
        const filename = path.join(directory, `${source}-products.json`);
        if (!fs.existsSync(filename)) continue;
        try {
          const rows = JSON.parse(fs.readFileSync(filename, "utf8"));
          if (!Array.isArray(rows)) continue;
          for (const product of rows) {
            const data = cleanProduct(source, product);
            const url = canonicalUrl(product.sourceUrl || "");
            const key = productKey(source, url, data);
            const exists = [...memoryProducts.values()].some((item) => item.productKey === key);
            if (exists) continue;
            const id = randomUUID();
            const now = new Date().toISOString();
            memoryProducts.set(id, {
              ...data,
              id,
              source,
              sourceUrl: url,
              productKey: key,
              status: product.status === "Deactive" ? "Deactive" : "Active",
              version: 1,
              createdAt: now,
              updatedAt: now,
            });
            imported++;
          }
        } catch (_) {}
      }
      return imported;
    },
    async getSettings() {
      return { ...DEFAULT_SETTINGS, ...memorySettings };
    },
    async saveSettings(input) {
      if (!input || typeof input !== "object" || Array.isArray(input)) throw problem("Settings must be an object.");
      const current = await this.getSettings();

      const projectName = typeof input.projectName === "string" && input.projectName.trim()
        ? input.projectName.trim()
        : (input.projectName !== undefined ? "" : current.projectName);
      const subtitle = typeof input.subtitle === "string"
        ? input.subtitle.trim()
        : (input.subtitle !== undefined ? "" : (current.subtitle || DEFAULT_SETTINGS.subtitle));
      const logo = typeof input.logo === "string" && input.logo.trim()
        ? input.logo.trim()
        : (input.logo !== undefined ? "" : current.logo);
      const footTag = typeof input.footTag === "string" && input.footTag.trim()
        ? input.footTag.trim()
        : (input.footTag !== undefined ? "" : current.footTag);

      const heroSubheading = typeof input.heroSubheading === "string"
        ? input.heroSubheading.trim()
        : (input.heroSubheading !== undefined ? "" : (current.heroSubheading || DEFAULT_SETTINGS.heroSubheading));
      const heroTitle = typeof input.heroTitle === "string"
        ? input.heroTitle.trim()
        : (input.heroTitle !== undefined ? "" : (current.heroTitle || DEFAULT_SETTINGS.heroTitle));
      const heroText = typeof input.heroText === "string"
        ? input.heroText.trim()
        : (input.heroText !== undefined ? "" : (current.heroText || DEFAULT_SETTINGS.heroText));
      const heroBackground = typeof input.heroBackground === "string" && input.heroBackground.trim()
        ? input.heroBackground.trim()
        : (input.heroBackground !== undefined ? "" : (current.heroBackground || DEFAULT_SETTINGS.heroBackground));

      const defaultWebsite = input.defaultWebsite === "foodpanda"
        ? "foodpanda"
        : (input.defaultWebsite === "fragrantica" ? "fragrantica" : current.defaultWebsite);

      if (!projectName) throw problem("Project name is required.");
      if (projectName.length > 100) throw problem("Project name is too long (max 100 characters).");
      if (subtitle.length > 200) throw problem("Subtitle is too long (max 200 characters).");
      if (!logo) throw problem("Logo is required.");
      if (logo.length > 5000000) throw problem("Logo is too long (max 5MB).");
      if (!footTag) throw problem("Foot tag is required.");
      if (footTag.length > 500) throw problem("Foot tag is too long (max 500 characters).");
      if (heroSubheading.length > 200) throw problem("Hero subheading is too long (max 200 characters).");
      if (heroTitle.length > 200) throw problem("Hero title is too long (max 200 characters).");
      if (heroText.length > 1000) throw problem("Hero text is too long (max 1000 characters).");
      if (heroBackground.length > 5000000) throw problem("Hero background is too long (max 5MB).");

      const telegramBotToken = typeof input.telegramBotToken === "string" && input.telegramBotToken.trim()
        ? input.telegramBotToken.trim()
        : current.telegramBotToken;
      const telegramBotUsername = typeof input.telegramBotUsername === "string" && input.telegramBotUsername.trim()
        ? input.telegramBotUsername.trim().replace(/^@/, "")
        : current.telegramBotUsername;
      const rawContact = typeof input.telegramContact === "string" && input.telegramContact.trim()
        ? input.telegramContact.trim()
        : (typeof input.telegramChatId === "string" && input.telegramChatId.trim() ? input.telegramChatId.trim() : current.telegramContact);
      const telegramContact = rawContact;
      const telegramChatId = rawContact;
      const telegramBotEnabled = input.telegramBotEnabled !== undefined
        ? (input.telegramBotEnabled === "false" || input.telegramBotEnabled === false ? "false" : "true")
        : current.telegramBotEnabled;
      const telegramContactEnabled = input.telegramContactEnabled !== undefined
        ? (input.telegramContactEnabled === "false" || input.telegramContactEnabled === false ? "false" : "true")
        : current.telegramContactEnabled;
      const telegramContactText = typeof input.telegramContactText === "string" && input.telegramContactText.trim()
        ? input.telegramContactText.trim()
        : current.telegramContactText;

      const sanitized = {
        projectName,
        subtitle,
        logo,
        footTag,
        heroSubheading,
        heroTitle,
        heroText,
        heroBackground,
        defaultWebsite,
        telegramBotToken,
        telegramBotUsername,
        telegramChatId,
        telegramBotEnabled,
        telegramContact,
        telegramContactEnabled,
        telegramContactText,
      };
      memorySettings = { ...memorySettings, ...sanitized };
      return sanitized;
    },
    async resetSettings() {
      memorySettings = { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS };
    },
    async listTags(source = "fragrantica") {
      const allProducts = await this.list(source);
      let tagsSetting = [];
      try {
        tagsSetting = JSON.parse(memorySettings.catalog_tags || "[]");
      } catch (_) {}
      if (!Array.isArray(tagsSetting) || !tagsSetting.length) {
        tagsSetting = DEFAULT_TAGS.map((t) => ({ ...t }));
      }
      const knownNames = new Set(tagsSetting.map((t) => t.name));
      for (const prod of allProducts) {
        if (Array.isArray(prod.tags)) {
          for (const tagName of prod.tags) {
            if (tagName && !knownNames.has(tagName)) {
              knownNames.add(tagName);
              tagsSetting.push({ id: "tag-" + randomUUID().slice(0, 8), name: tagName });
            }
          }
        }
      }
      return tagsSetting.map((tag) => {
        const matching = allProducts.filter((p) => Array.isArray(p.tags) && p.tags.includes(tag.name));
        return {
          id: tag.id,
          name: tag.name,
          productIds: matching.map((p) => p.id),
          productNames: matching.map((p) => p.name),
        };
      });
    },
    async saveTag(source = "fragrantica", { id, name, productIds = [] }) {
      const tagName = String(name || "").trim();
      if (!tagName) throw problem("Tag name is required.");
      const allProducts = await this.list(source);
      let tagsSetting = [];
      try {
        tagsSetting = JSON.parse(memorySettings.catalog_tags || "[]");
      } catch (_) {}
      if (!Array.isArray(tagsSetting) || !tagsSetting.length) {
        tagsSetting = DEFAULT_TAGS.map((t) => ({ ...t }));
      }
      let targetTag = id ? tagsSetting.find((t) => t.id === id) : null;
      const oldName = targetTag ? targetTag.name : null;
      if (!targetTag) {
        targetTag = { id: id || ("tag-" + randomUUID().slice(0, 8)), name: tagName };
        tagsSetting.push(targetTag);
      } else {
        targetTag.name = tagName;
      }
      memorySettings.catalog_tags = JSON.stringify(tagsSetting);

      const targetIds = new Set(productIds);
      for (const prod of allProducts) {
        let currentTags = Array.isArray(prod.tags) ? [...prod.tags] : [];
        const hadOld = oldName && currentTags.includes(oldName);
        const hasNew = currentTags.includes(tagName);
        const shouldHave = targetIds.has(prod.id);

        let modified = false;
        if (shouldHave) {
          if (oldName && oldName !== tagName && hadOld) {
            currentTags = currentTags.filter((t) => t !== oldName);
            modified = true;
          }
          if (!hasNew) {
            currentTags.push(tagName);
            modified = true;
          }
        } else {
          if (hasNew || hadOld) {
            currentTags = currentTags.filter((t) => t !== tagName && t !== oldName);
            modified = true;
          }
        }
        if (modified) {
          await this.edit(prod.id, { tags: currentTags }, prod.version);
        }
      }
      return this.listTags(source);
    },
    async deleteTag(source = "fragrantica", tagId) {
      if (!tagId) throw problem("Tag ID is required.");
      const allProducts = await this.list(source);
      let tagsSetting = [];
      try {
        tagsSetting = JSON.parse(memorySettings.catalog_tags || "[]");
      } catch (_) {}
      if (!Array.isArray(tagsSetting) || !tagsSetting.length) {
        tagsSetting = DEFAULT_TAGS.map((t) => ({ ...t }));
      }
      const tagIndex = tagsSetting.findIndex((t) => t.id === tagId);
      const tagToDelete = tagsSetting[tagIndex];
      if (tagToDelete) {
        tagsSetting.splice(tagIndex, 1);
        memorySettings.catalog_tags = JSON.stringify(tagsSetting);
        for (const prod of allProducts) {
          if (Array.isArray(prod.tags) && prod.tags.includes(tagToDelete.name)) {
            const newTags = prod.tags.filter((t) => t !== tagToDelete.name);
            await this.edit(prod.id, { tags: newTags }, prod.version);
          }
        }
      }
      return this.listTags(source);
    },
  };

  fallbackStore.importLegacy().catch(() => {});
  return fallbackStore;
}

async function createStore(options = {}) {
  const { host, port, user, password, database } = parseDbConfig(options);
  if (!/^[a-zA-Z0-9_]+$/.test(database)) throw problem("Invalid database name.");
  const config = {
    host,
    port,
    user,
    password,
    charset: "utf8mb4",
    connectTimeout: 6000,
  };

  let pool;
  try {
    try {
      const connection = await mysql.createConnection(config);
      try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      } catch (err) {
        // Ignored if CREATE DATABASE is not permitted on managed database
      } finally {
        await connection.end();
      }
    } catch (_) {}

    pool = mysql.createPool({ ...config, database, connectionLimit: 5 });
    const conn = await pool.getConnection();
    conn.release();

    await pool.query(`CREATE TABLE IF NOT EXISTS scraper_products (
      id CHAR(36) PRIMARY KEY, source VARCHAR(20) NOT NULL, source_url TEXT NOT NULL,
      product_key CHAR(64) NOT NULL UNIQUE, data JSON NOT NULL,
      status ENUM('Active','Deactive') NOT NULL DEFAULT 'Active', version INT NOT NULL DEFAULT 1,
      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      INDEX source_index (source)
    ) ENGINE=InnoDB`);
    await pool.query("CREATE TABLE IF NOT EXISTS scraper_migrations (name VARCHAR(100) PRIMARY KEY) ENGINE=InnoDB");
    await pool.query(`CREATE TABLE IF NOT EXISTS scraper_settings (
      setting_key VARCHAR(50) PRIMARY KEY,
      setting_value MEDIUMTEXT NOT NULL,
      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
    ) ENGINE=InnoDB`);
    try {
      await pool.query("ALTER TABLE scraper_settings MODIFY COLUMN setting_value MEDIUMTEXT NOT NULL");
    } catch (_) {}
  } catch (error) {
    if (pool) {
      try { await pool.end(); } catch (_) {}
    }
    if (options.requireMysql) {
      throw error;
    }
    console.warn(`[DATABASE] Warning: Unable to connect to MySQL at ${host}:${port} (${error.code || error.message}).`);
    console.warn("[DATABASE] Starting in resilient local storage fallback mode so server stays online.");
    return createFallbackStore({ database });
  }

  // Serialize short writes across app/CLI processes. Browser work never holds this lock.
  async function transaction(work) {
    const c = await pool.getConnection();
    const lock = `${database}:scraper-write`;
    let locked = false;
    try {
      const [[result]] = await c.execute("SELECT GET_LOCK(?, 10) AS acquired", [lock]);
      if (result.acquired !== 1) throw problem("Database is busy. Please retry.", 409);
      locked = true;
      await c.beginTransaction();
      const value = await work(c);
      await c.commit();
      return value;
    } catch (error) { await c.rollback(); throw error; }
    finally {
      try { if (locked) await c.execute("SELECT RELEASE_LOCK(?)", [lock]); }
      finally { c.release(); }
    }
  }

  const store = {
    database,
    close: () => pool.end(),
    async list(source) {
      const [rows] = await pool.execute("SELECT * FROM scraper_products WHERE source=? ORDER BY created_at DESC, id", [source]);
      return rows.map(fromRow);
    },
    async saveBatch(source, rawUrl, products, approvedVersions = null) {
      const url = canonicalUrl(rawUrl);
      const candidates = [...new Map(products.map((product) => {
        const data = cleanProduct(source, product);
        const status = product.status === "Deactive" ? "Deactive" : "Active";
        return [productKey(source, url, data), { data, status }];
      })).entries()];
      return transaction(async (c) => {
        const existing = new Map();
        const conflicts = [];
        for (const [key, { data }] of candidates) {
          const [[row]] = await c.execute("SELECT * FROM scraper_products WHERE product_key=?", [key]);
          if (!row) continue;
          existing.set(key, row);
          if (approvedVersions?.[row.id] !== row.version) conflicts.push({ id: row.id, version: row.version,
            name: fromRow(row).name, unchanged: JSON.stringify(cleanProduct(source, fromRow(row))) === JSON.stringify(data) });
        }
        if (conflicts.length) return { conflicts, added: 0, overwritten: 0 };
        // A confirmed snapshot that was deleted is stale too; don't recreate it.
        if (approvedVersions && Object.keys(approvedVersions).some((id) => ![...existing.values()].some((row) => row.id === id))) {
          throw problem("A product changed or was deleted while confirmation was open. Run the scrape again.", 409);
        }
        let added = 0;
        let overwritten = 0;
        for (const [key, { data, status }] of candidates) {
          const row = existing.get(key);
          if (row) {
            await c.execute("UPDATE scraper_products SET data=?, source_url=?, version=version+1 WHERE id=?",
              [JSON.stringify(data), url, row.id]);
            overwritten++;
          } else {
            await c.execute("INSERT INTO scraper_products (id,source,source_url,product_key,data,status) VALUES (?,?,?,?,?,?)",
              [randomUUID(), source, url, key, JSON.stringify(data), status]);
            added++;
          }
        }
        return { conflicts: [], added, overwritten };
      });
    },
    async edit(id, changes, version) {
      return transaction(async (c) => {
        const [[row]] = await c.execute("SELECT * FROM scraper_products WHERE id=?", [id]);
        if (!row) throw problem("Product not found.", 404);
        if (version !== undefined && version !== row.version) throw problem("This product changed. Reload it before editing.", 409);
        const currentData = fromRow(row);
        const newStatus = changes.status || currentData.status;
        if (!["Active", "Deactive"].includes(newStatus)) throw problem("Status must be Active or Deactive.");
        const data = cleanProduct(row.source, { ...currentData, ...changes });
        await c.execute("UPDATE scraper_products SET data=?, status=?, version=version+1 WHERE id=?",
          [JSON.stringify(data), newStatus, id]);
        return row.source;
      });
    },
    async delete(id, version) {
      return transaction(async (c) => {
        const [[row]] = await c.execute("SELECT * FROM scraper_products WHERE id=?", [id]);
        if (!row) throw problem("Product not found.", 404);
        if (version !== row.version) throw problem("This product changed. Reload it before deleting.", 409);
        await c.execute("DELETE FROM scraper_products WHERE id=?", [id]);
        return row.source;
      });
    },
    async importLegacy(directory = __dirname) {
      return transaction(async (c) => {
        const [[done]] = await c.execute("SELECT name FROM scraper_migrations WHERE name=?", ["legacy-json-v1"]);
        if (done) return 0;
        let imported = 0;
        for (const source of ["foodpanda", "fragrantica"]) {
          const filename = path.join(directory, `${source}-products.json`);
          if (!fs.existsSync(filename)) continue;
          const rows = JSON.parse(fs.readFileSync(filename, "utf8"));
          if (!Array.isArray(rows)) throw problem(`Invalid legacy output: ${source}`);
          for (const product of rows) {
            const data = cleanProduct(source, product);
            const url = canonicalUrl(product.sourceUrl || "");
            const key = productKey(source, url, data);
            const [[existing]] = await c.execute("SELECT id FROM scraper_products WHERE product_key=?", [key]);
            if (existing) continue;
            await c.execute("INSERT INTO scraper_products (id,source,source_url,product_key,data,status) VALUES (?,?,?,?,?,?)",
              [randomUUID(), source, url, key, JSON.stringify(data), product.status === "Deactive" ? "Deactive" : "Active"]);
            imported++;
          }
        }
        await c.execute("INSERT INTO scraper_migrations (name) VALUES (?)", ["legacy-json-v1"]);
        return imported;
      });
    },
    async getSettings() {
      const [rows] = await pool.execute("SELECT setting_key, setting_value FROM scraper_settings");
      const settings = { ...DEFAULT_SETTINGS };
      for (const row of rows) {
        if (row.setting_key in settings) {
          settings[row.setting_key] = row.setting_value;
        }
      }
      return settings;
    },
    async saveSettings(input) {
      if (!input || typeof input !== "object" || Array.isArray(input)) throw problem("Settings must be an object.");
      const current = await this.getSettings();

      const projectName = typeof input.projectName === "string" && input.projectName.trim()
        ? input.projectName.trim()
        : (input.projectName !== undefined ? "" : current.projectName);
      const subtitle = typeof input.subtitle === "string"
        ? input.subtitle.trim()
        : (input.subtitle !== undefined ? "" : (current.subtitle || DEFAULT_SETTINGS.subtitle));
      const logo = typeof input.logo === "string" && input.logo.trim()
        ? input.logo.trim()
        : (input.logo !== undefined ? "" : current.logo);
      const footTag = typeof input.footTag === "string" && input.footTag.trim()
        ? input.footTag.trim()
        : (input.footTag !== undefined ? "" : current.footTag);

      const heroSubheading = typeof input.heroSubheading === "string"
        ? input.heroSubheading.trim()
        : (input.heroSubheading !== undefined ? "" : (current.heroSubheading || DEFAULT_SETTINGS.heroSubheading));
      const heroTitle = typeof input.heroTitle === "string"
        ? input.heroTitle.trim()
        : (input.heroTitle !== undefined ? "" : (current.heroTitle || DEFAULT_SETTINGS.heroTitle));
      const heroText = typeof input.heroText === "string"
        ? input.heroText.trim()
        : (input.heroText !== undefined ? "" : (current.heroText || DEFAULT_SETTINGS.heroText));
      const heroBackground = typeof input.heroBackground === "string" && input.heroBackground.trim()
        ? input.heroBackground.trim()
        : (input.heroBackground !== undefined ? "" : (current.heroBackground || DEFAULT_SETTINGS.heroBackground));

      const defaultWebsite = input.defaultWebsite === "foodpanda"
        ? "foodpanda"
        : (input.defaultWebsite === "fragrantica" ? "fragrantica" : current.defaultWebsite);

      if (!projectName) throw problem("Project name is required.");
      if (projectName.length > 100) throw problem("Project name is too long (max 100 characters).");
      if (subtitle.length > 200) throw problem("Subtitle is too long (max 200 characters).");
      if (!logo) throw problem("Logo is required.");
      if (logo.length > 5000000) throw problem("Logo is too long (max 5MB).");
      if (!footTag) throw problem("Foot tag is required.");
      if (footTag.length > 500) throw problem("Foot tag is too long (max 500 characters).");
      if (heroSubheading.length > 200) throw problem("Hero subheading is too long (max 200 characters).");
      if (heroTitle.length > 200) throw problem("Hero title is too long (max 200 characters).");
      if (heroText.length > 1000) throw problem("Hero text is too long (max 1000 characters).");
      if (heroBackground.length > 5000000) throw problem("Hero background is too long (max 5MB).");

      const telegramBotToken = typeof input.telegramBotToken === "string" && input.telegramBotToken.trim()
        ? input.telegramBotToken.trim()
        : current.telegramBotToken;
      const telegramBotUsername = typeof input.telegramBotUsername === "string" && input.telegramBotUsername.trim()
        ? input.telegramBotUsername.trim().replace(/^@/, "")
        : current.telegramBotUsername;
      const rawContact = typeof input.telegramContact === "string" && input.telegramContact.trim()
        ? input.telegramContact.trim()
        : (typeof input.telegramChatId === "string" && input.telegramChatId.trim() ? input.telegramChatId.trim() : current.telegramContact);
      const telegramContact = rawContact;
      const telegramChatId = rawContact;
      const telegramBotEnabled = input.telegramBotEnabled !== undefined
        ? (input.telegramBotEnabled === "false" || input.telegramBotEnabled === false ? "false" : "true")
        : current.telegramBotEnabled;
      const telegramContactEnabled = input.telegramContactEnabled !== undefined
        ? (input.telegramContactEnabled === "false" || input.telegramContactEnabled === false ? "false" : "true")
        : current.telegramContactEnabled;
      const telegramContactText = typeof input.telegramContactText === "string" && input.telegramContactText.trim()
        ? input.telegramContactText.trim()
        : current.telegramContactText;

      const sanitized = {
        projectName,
        subtitle,
        logo,
        footTag,
        heroSubheading,
        heroTitle,
        heroText,
        heroBackground,
        defaultWebsite,
        telegramBotToken,
        telegramBotUsername,
        telegramChatId,
        telegramBotEnabled,
        telegramContact,
        telegramContactEnabled,
        telegramContactText,
      };
      return transaction(async (c) => {
        for (const [key, value] of Object.entries(sanitized)) {
          await c.execute(
            "INSERT INTO scraper_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)",
            [key, value]
          );
        }
        return sanitized;
      });
    },
    async resetSettings() {
      return transaction(async (c) => {
        await c.execute("DELETE FROM scraper_settings");
        return { ...DEFAULT_SETTINGS };
      });
    },
    async listTags(source = "fragrantica") {
      const allProducts = await this.list(source);
      const [rows] = await pool.execute("SELECT setting_value FROM scraper_settings WHERE setting_key='catalog_tags'");
      let tagsSetting = [];
      if (rows.length && rows[0].setting_value) {
        try { tagsSetting = JSON.parse(rows[0].setting_value); } catch (_) {}
      }
      if (!Array.isArray(tagsSetting) || !tagsSetting.length) {
        tagsSetting = DEFAULT_TAGS.map((t) => ({ ...t }));
      }
      const knownNames = new Set(tagsSetting.map((t) => t.name));
      for (const prod of allProducts) {
        if (Array.isArray(prod.tags)) {
          for (const tagName of prod.tags) {
            if (tagName && !knownNames.has(tagName)) {
              knownNames.add(tagName);
              tagsSetting.push({ id: "tag-" + randomUUID().slice(0, 8), name: tagName });
            }
          }
        }
      }
      return tagsSetting.map((tag) => {
        const matching = allProducts.filter((p) => Array.isArray(p.tags) && p.tags.includes(tag.name));
        return {
          id: tag.id,
          name: tag.name,
          productIds: matching.map((p) => p.id),
          productNames: matching.map((p) => p.name),
        };
      });
    },
    async saveTag(source = "fragrantica", { id, name, productIds = [] }) {
      const tagName = String(name || "").trim();
      if (!tagName) throw problem("Tag name is required.");
      const allProducts = await this.list(source);
      const [rows] = await pool.execute("SELECT setting_value FROM scraper_settings WHERE setting_key='catalog_tags'");
      let tagsSetting = [];
      if (rows.length && rows[0].setting_value) {
        try { tagsSetting = JSON.parse(rows[0].setting_value); } catch (_) {}
      }
      if (!Array.isArray(tagsSetting) || !tagsSetting.length) {
        tagsSetting = DEFAULT_TAGS.map((t) => ({ ...t }));
      }
      let targetTag = id ? tagsSetting.find((t) => t.id === id) : null;
      const oldName = targetTag ? targetTag.name : null;
      if (!targetTag) {
        targetTag = { id: id || ("tag-" + randomUUID().slice(0, 8)), name: tagName };
        tagsSetting.push(targetTag);
      } else {
        targetTag.name = tagName;
      }
      await pool.execute(
        "INSERT INTO scraper_settings (setting_key, setting_value) VALUES ('catalog_tags', ?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)",
        [JSON.stringify(tagsSetting)]
      );

      const targetIds = new Set(productIds);
      for (const prod of allProducts) {
        let currentTags = Array.isArray(prod.tags) ? [...prod.tags] : [];
        const hadOld = oldName && currentTags.includes(oldName);
        const hasNew = currentTags.includes(tagName);
        const shouldHave = targetIds.has(prod.id);

        let modified = false;
        if (shouldHave) {
          if (oldName && oldName !== tagName && hadOld) {
            currentTags = currentTags.filter((t) => t !== oldName);
            modified = true;
          }
          if (!hasNew) {
            currentTags.push(tagName);
            modified = true;
          }
        } else {
          if (hasNew || hadOld) {
            currentTags = currentTags.filter((t) => t !== tagName && t !== oldName);
            modified = true;
          }
        }
        if (modified) {
          await this.edit(prod.id, { tags: currentTags }, prod.version);
        }
      }
      return this.listTags(source);
    },
    async deleteTag(source = "fragrantica", tagId) {
      if (!tagId) throw problem("Tag ID is required.");
      const allProducts = await this.list(source);
      const [rows] = await pool.execute("SELECT setting_value FROM scraper_settings WHERE setting_key='catalog_tags'");
      let tagsSetting = [];
      if (rows.length && rows[0].setting_value) {
        try { tagsSetting = JSON.parse(rows[0].setting_value); } catch (_) {}
      }
      if (!Array.isArray(tagsSetting) || !tagsSetting.length) {
        tagsSetting = DEFAULT_TAGS.map((t) => ({ ...t }));
      }
      const tagIndex = tagsSetting.findIndex((t) => t.id === tagId);
      const tagToDelete = tagsSetting[tagIndex];
      if (tagToDelete) {
        tagsSetting.splice(tagIndex, 1);
        await pool.execute(
          "INSERT INTO scraper_settings (setting_key, setting_value) VALUES ('catalog_tags', ?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)",
          [JSON.stringify(tagsSetting)]
        );
        for (const prod of allProducts) {
          if (Array.isArray(prod.tags) && prod.tags.includes(tagToDelete.name)) {
            const newTags = prod.tags.filter((t) => t !== tagToDelete.name);
            await this.edit(prod.id, { tags: newTags }, prod.version);
          }
        }
      }
      return this.listTags(source);
    },
  };
  return store;
}

if (require.main === module) {
  (async () => {
    const store = await createStore();
    try { console.log(`Database ${store.database} ready; imported ${await store.importLegacy()} existing products.`); }
    finally { await store.close(); }
  })().catch((error) => { console.error(`Database setup failed: ${error.code || error.message}`); process.exitCode = 1; });
}

module.exports = { createStore, createFallbackStore, parseDbConfig, canonicalUrl, cleanProduct, productKey, problem, DEFAULT_SETTINGS, DEFAULT_TAGS };
