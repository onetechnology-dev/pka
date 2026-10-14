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
  } catch (err1) {
    console.warn(`[BROWSER] Launch attempt 1 failed (${err1.message}). Trying channel: "chromium"...`);

    // Attempt 2: Try channel "chromium" (uses full Chrome for Testing instead of headless shell)
    try {
      return await chromium.launch({ ...launchOptions, channel: "chromium" });
    } catch (err2) {
      console.warn(`[BROWSER] Launch attempt 2 failed (${err2.message}). Searching system browser...`);

      // Attempt 3: Search for system installed Chromium / Chrome
      const candidates = [
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
      ];
      try {
        const which = execSync("command -v chromium || command -v google-chrome || true", {
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

      // Attempt 4: Auto-install on-the-fly both chromium AND chromium-headless-shell
      console.log("[BROWSER] On-the-fly installing chromium & chromium-headless-shell...");
      try {
        execSync("npx playwright install --with-deps chromium chromium-headless-shell", { stdio: "inherit" });
        try {
          return await chromium.launch(launchOptions);
        } catch (_) {
          return await chromium.launch({ ...launchOptions, channel: "chromium" });
        }
      } catch (installErr) {
        console.error("[BROWSER] On-the-fly install failed:", installErr.message);
      }

      throw err1;
    }
  }
}

module.exports = { launchChromium };

