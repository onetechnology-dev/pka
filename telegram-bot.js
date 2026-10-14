const { URL } = require("node:url");

const DEFAULT_TELEGRAM_TOKEN = "8670278807:AAGODQKhNr4vdnWnI47AEEzNftRAqzkMGO0";
const DEFAULT_TELEGRAM_USERNAME = "pkascent_bot";

async function callTelegramApi(token, method, payload = {}) {
  const activeToken = (token || DEFAULT_TELEGRAM_TOKEN).trim();
  const url = `https://api.telegram.org/bot${activeToken}/${method}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.description || `Telegram API call to ${method} failed.`);
  }
  return data.result;
}

async function getBotInfo(token) {
  return callTelegramApi(token, "getMe");
}

async function sendTelegramMessage(token, chatId, text, options = {}) {
  return callTelegramApi(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: options.parseMode || "Markdown",
    disable_web_page_preview: options.disablePreview !== false,
  });
}

async function sendTelegramPhoto(token, chatId, photoUrl, caption = "") {
  try {
    return await callTelegramApi(token, "sendPhoto", {
      chat_id: chatId,
      photo: photoUrl,
      caption: caption.slice(0, 1024),
      parse_mode: "Markdown",
    });
  } catch (_) {
    // Fall back to text message if photo delivery fails
    return sendTelegramMessage(token, chatId, `${caption}\n\n📷 Photo: ${photoUrl}`);
  }
}

function extractUrls(text) {
  if (!text || typeof text !== "string") return [];
  const urlRegex = /https?:\/\/[^\s<>"]+/gi;
  const matches = text.match(urlRegex) || [];
  return matches.map((m) => m.replace(/[.,;:!?]+$/, ""));
}

function createTelegramBotService({ store, scrapers }) {
  let pollingActive = false;
  let pollTimeoutId = null;
  let lastUpdateId = 0;
  let lastKnownChatId = null;
  let botUsername = DEFAULT_TELEGRAM_USERNAME;

  async function getActiveSettings() {
    try {
      const settings = typeof store.getSettings === "function" ? await store.getSettings() : {};
      return {
        token: settings.telegramBotToken || DEFAULT_TELEGRAM_TOKEN,
        username: settings.telegramBotUsername || DEFAULT_TELEGRAM_USERNAME,
        chatId: settings.telegramChatId || lastKnownChatId || "",
        enabled: settings.telegramBotEnabled !== "false",
      };
    } catch (_) {
      return {
        token: DEFAULT_TELEGRAM_TOKEN,
        username: DEFAULT_TELEGRAM_USERNAME,
        chatId: lastKnownChatId || "",
        enabled: true,
      };
    }
  }

  async function handleIncomingMessage(config, message) {
    if (!message || !message.chat || !message.text) return;
    const chatId = message.chat.id;
    lastKnownChatId = String(chatId);
    const text = message.text.trim();
    const fromUser = message.from?.username ? `@${message.from.username}` : (message.from?.first_name || "Friend");

    // Command /start or /help
    if (text.startsWith("/start") || text.startsWith("/help")) {
      const welcome = [
        "⚜️ *PKA SCENT Fragrance Scraper Bot*",
        `Hello ${fromUser}!`,
        "",
        "Send me any *Fragrantica perfume URL* (or Foodpanda URL) and I will automatically scrape it and add it directly to your catalogue!",
        "",
        "🔗 *Example:*",
        "`https://www.fragrantica.com/perfume/Prada/Prada-Paradoxe-Intense-83988.html`",
        "",
        "You can send a single link or multiple links in one message.",
      ].join("\n");
      await sendTelegramMessage(config.token, chatId, welcome);
      return;
    }

    // Extract URLs
    const urls = extractUrls(text);
    if (!urls.length) {
      await sendTelegramMessage(
        config.token,
        chatId,
        "ℹ️ Please send a valid *Fragrantica* or *Foodpanda* product link to scrape.\nExample: `https://www.fragrantica.com/perfume/...`"
      );
      return;
    }

    for (const targetUrl of urls) {
      const isFragrantica = ["fragrantica.com", "www.fragrantica.com"].some((h) => targetUrl.includes(h));
      const source = isFragrantica ? "fragrantica" : "foodpanda";
      const scraper = scrapers[source];

      if (!scraper) {
        await sendTelegramMessage(config.token, chatId, `⚠️ No scraper configured for: \`${targetUrl}\``);
        continue;
      }

      await sendTelegramMessage(
        config.token,
        chatId,
        `🔍 *Scraping ${source.toUpperCase()} product...*\nURL: \`${targetUrl}\`\nPlease wait a moment.`
      );

      try {
        const scrapeResult = await scraper(targetUrl, {
          persist: false,
          headless: true,
        });

        const products = Array.isArray(scrapeResult?.products) ? scrapeResult.products : [];
        if (!products.length) {
          await sendTelegramMessage(config.token, chatId, `⚠️ No products found or parsed from: \`${targetUrl}\``);
          continue;
        }

        // Save batch to database
        const saved = await store.saveBatch(source, targetUrl, products);
        const item = products[0];

        const details = [
          "✅ *Scrape Successful! Added to Catalogue*",
          `📦 *Product:* ${item.name || "Unknown"}`,
          item.brand ? `🏢 *Brand:* ${item.brand}` : null,
          item.barcode ? `🏷️ *Barcode:* \`${item.barcode}\`` : null,
          item.price ? `💰 *Price:* ${item.price}` : null,
          item.accords?.length ? `💎 *Accords:* ${item.accords.slice(0, 5).join(", ")}` : null,
          item.notes?.length ? `🌸 *Notes:* ${item.notes.slice(0, 8).join(", ")}` : null,
          `✨ *Saved:* ${products.length} product(s) (Overwritten: ${saved.overwritten || 0}, Added: ${saved.added || 0})`,
        ].filter(Boolean).join("\n");

        if (item.photo && /^https?:\/\//i.test(item.photo)) {
          await sendTelegramPhoto(config.token, chatId, item.photo, details);
        } else {
          await sendTelegramMessage(config.token, chatId, details);
        }
      } catch (err) {
        await sendTelegramMessage(
          config.token,
          chatId,
          `❌ *Scrape Failed*\nURL: \`${targetUrl}\`\nError: ${err.message || "Unknown error"}`
        );
      }
    }
  }

  async function pollLoop() {
    if (!pollingActive) return;

    try {
      const config = await getActiveSettings();
      if (!config.enabled || !config.token) {
        // Disabled, wait and re-check
        pollTimeoutId = setTimeout(pollLoop, 5000);
        return;
      }

      const updates = await callTelegramApi(config.token, "getUpdates", {
        offset: lastUpdateId + 1,
        timeout: 10,
        allowed_updates: ["message"],
      });

      if (Array.isArray(updates) && updates.length) {
        for (const update of updates) {
          lastUpdateId = Math.max(lastUpdateId, update.update_id);
          if (update.message) {
            await handleIncomingMessage(config, update.message);
          }
        }
      }
    } catch (_) {
      // Gracefully handle network dropouts / temporary offline periods
    }

    if (pollingActive) {
      pollTimeoutId = setTimeout(pollLoop, 2000);
    }
  }

  async function start() {
    if (pollingActive) return;
    pollingActive = true;
    try {
      const config = await getActiveSettings();
      const info = await getBotInfo(config.token);
      if (info && info.username) {
        botUsername = info.username;
      }
    } catch (_) {}
    pollLoop();
  }

  function stop() {
    pollingActive = false;
    if (pollTimeoutId) clearTimeout(pollTimeoutId);
  }

  async function testConnection(token) {
    const info = await getBotInfo(token || DEFAULT_TELEGRAM_TOKEN);
    if (info && info.username) botUsername = info.username;
    return info;
  }

  async function sendTestMessage(token, chatId, customMessage) {
    const config = await getActiveSettings();
    const activeToken = token || config.token;
    const targetChat = chatId || config.chatId || lastKnownChatId;
    if (!targetChat) {
      throw new Error("No Chat ID available. Send /start to the bot first or provide a Chat ID.");
    }
    const message = customMessage || "⚜️ *PKA SCENT Test Notification*\nTelegram Bot integration is online and ready to scrape perfume links!";
    const res = await sendTelegramMessage(activeToken, targetChat, message);
    return { ok: true, result: res, chatId: targetChat };
  }

  return {
    start,
    stop,
    testConnection,
    sendTestMessage,
    getBotInfo,
    getStatus: async () => {
      const config = await getActiveSettings();
      return {
        active: pollingActive,
        enabled: config.enabled,
        botUsername,
        lastKnownChatId,
      };
    },
  };
}

module.exports = {
  DEFAULT_TELEGRAM_TOKEN,
  DEFAULT_TELEGRAM_USERNAME,
  callTelegramApi,
  getBotInfo,
  sendTelegramMessage,
  sendTelegramPhoto,
  createTelegramBotService,
};
