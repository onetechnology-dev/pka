const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) process.loadEnvFile(envPath);

async function restore() {
  const connectionUrl =
    process.argv[2] ||
    process.env.RAILWAY_MYSQL_URL ||
    process.env.MYSQL_PUBLIC_URL ||
    process.env.MYSQL_URL ||
    process.env.DATABASE_URL;

  let host, port, user, password, database;

  if (connectionUrl) {
    try {
      const parsed = new URL(connectionUrl);
      host = parsed.hostname;
      port = Number(parsed.port || 3306);
      user = decodeURIComponent(parsed.username || "root");
      password = decodeURIComponent(parsed.password || "");
      database = decodeURIComponent(parsed.pathname ? parsed.pathname.slice(1) : "railway") || "railway";
    } catch (e) {
      console.error("[ERROR] Invalid connection URL:", e.message);
      process.exit(1);
    }
  } else {
    host = process.env.RAILWAY_MYSQLHOST || process.env.MYSQLHOST;
    port = Number(process.env.RAILWAY_MYSQLPORT || process.env.MYSQLPORT || 3306);
    user = process.env.RAILWAY_MYSQLUSER || process.env.MYSQLUSER || "root";
    password = process.env.RAILWAY_MYSQLPASSWORD || process.env.MYSQLPASSWORD || "";
    database = process.env.RAILWAY_MYSQLDATABASE || process.env.MYSQLDATABASE || "railway";
  }

  if (!host) {
    console.log("================================================================================");
    console.log("RESTORE LOCAL DATABASE TO RAILWAY MYSQL");
    console.log("================================================================================");
    console.log("Usage: node restore-railway.js <RAILWAY_PUBLIC_MYSQL_URL>");
    console.log("");
    console.log("Example:");
    console.log("  node restore-railway.js mysql://root:pass@autorack.proxy.rlwy.net:12345/railway");
    console.log("");
    console.log("How to find your Railway Public MySQL URL:");
    console.log("1. Open your project on Railway: https://railway.com/");
    console.log("2. Click on your MySQL database service.");
    console.log("3. Click on the 'Connect' tab (or 'Variables').");
    console.log("4. Under 'Public Networking' or 'Connect Externally', copy the MySQL Connection URL.");
    console.log("   (If Public Networking is not enabled, click 'Generate Domain' in MySQL > Settings > Networking)");
    console.log("================================================================================");
    process.exit(1);
  }

  console.log(`Connecting to Railway MySQL at ${host}:${port} (Database: ${database})...`);

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
    connectTimeout: 20000,
  });

  try {
    console.log("✓ Connected successfully to Railway MySQL!");
    const sqlPath = path.join(__dirname, "backup-tables.sql");
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Backup file not found at ${sqlPath}.`);
    }

    const sqlContent = fs.readFileSync(sqlPath, "utf8");
    console.log(`Executing restore from backup-tables.sql (${Math.round(sqlContent.length / 1024)} KB)...`);

    await connection.query(sqlContent);

    const [[{ productCount }]] = await connection.query("SELECT COUNT(*) AS productCount FROM scraper_products");
    const [[{ settingCount }]] = await connection.query("SELECT COUNT(*) AS settingCount FROM scraper_settings");

    console.log("");
    console.log("================================================================================");
    console.log("✓ RESTORE COMPLETED SUCCESSFULLY!");
    console.log(`- scraper_products restored: ${productCount} items`);
    console.log(`- scraper_settings restored: ${settingCount} settings`);
    console.log("================================================================================");
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  restore().catch((err) => {
    console.error("[ERROR] Restore failed:", err.message);
    process.exit(1);
  });
}

module.exports = { restore };
