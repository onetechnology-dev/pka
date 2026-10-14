const { createInterface } = require("node:readline/promises");
const { createStore } = require("./database");

async function runCli(source, scrape, args) {
  const urls = args.filter((arg) => !arg.startsWith("--"));
  if (!urls.length) throw new Error(`Usage: npm run ${source === "fragrantica" ? "scrape:fragrantica" : "scrape"} -- <url> [more-urls] [--headless]`);
  const store = await createStore();
  let prompt;
  try {
    await store.importLegacy();
    for (const url of urls) {
      const { products } = await scrape(url, { persist: false, headless: args.includes("--headless"), onStatus: console.log });
      let approved = null;
      let result = await store.saveBatch(source, url, products);
      while (result.conflicts.length) {
        console.log(`Existing products: ${result.conflicts.map((item) => item.name).join(", ")}`);
        if (!process.stdin.isTTY) { console.log("Skipped: overwrite requires interactive confirmation."); break; }
        prompt ||= createInterface({ input: process.stdin, output: process.stdout });
        const answer = await prompt.question("Overwrite these products? [y/N] ");
        if (answer.trim().toLowerCase() !== "y") { console.log("Skipped; existing products kept."); break; }
        approved = { ...approved, ...Object.fromEntries(result.conflicts.map((item) => [item.id, item.version])) };
        result = await store.saveBatch(source, url, products, approved);
      }
      if (!result.conflicts.length) console.log(`Saved to ${store.database}: ${result.added} added, ${result.overwritten} overwritten.`);
    }
  } finally { prompt?.close(); await store.close(); }
}

module.exports = { runCli };
