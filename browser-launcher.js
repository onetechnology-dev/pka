const { chromium } = require("playwright");
const fs = require("fs");
const { execSync } = require("child_process");

async function launchChromium(options = {}) {
  const headless = options.headless !== undefined ? options.headless : true;
  const launchOptions = {
    headless,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
    ],
    ignoreDefaultArgs: ["--enable-automation"],
  };

  const envExec =
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    process.env.CHROME_BIN ||
    process.env.CHROMIUM_PATH;

  if (envExec && fs.existsSync(envExec)) {
    launchOptions.executablePath = envExec;
  }

  // Attempt 1: Standard launch
  try {
    return await chromium.launch(launchOptions);
  } catch (err) {
    console.warn(`[BROWSER] Initial chromium.launch failed (${err.message}). Trying alternatives...`);

    // Attempt 2: Search for system Chromium / Google Chrome (e.g. from Nix or Linux packages)
    const candidates = [
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
      "/usr/bin/google-chrome",
      "/usr/bin/google-chrome-stable",
    ];

    try {
      const which = execSync("which chromium 2>/dev/null || which google-chrome 2>/dev/null || true", {
        encoding: "utf8",
      }).trim();
      if (which && fs.existsSync(which)) candidates.unshift(which);
    } catch (_) {}

    for (const binPath of candidates) {
      if (fs.existsSync(binPath)) {
        console.log(`[BROWSER] Found system browser at: ${binPath}`);
        try {
          return await chromium.launch({ ...launchOptions, executablePath: binPath });
        } catch (sysErr) {
          console.warn(`[BROWSER] Launch with ${binPath} failed: ${sysErr.message}`);
        }
      }
    }

    // Attempt 3: Install Playwright Chromium on-the-fly
    console.log("[BROWSER] Attempting on-the-fly Playwright browser install...");
    try {
      execSync("npx playwright install chromium", { stdio: "inherit" });
      return await chromium.launch(launchOptions);
    } catch (installErr) {
      console.error("[BROWSER] On-the-fly install failed:", installErr.message);
    }

    throw err;
  }
}

module.exports = { launchChromium };
