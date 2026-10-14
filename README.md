# PKA SCENT & Product Scraper

Full-featured luxury fragrance boutique & scraper with dual Frontend and Backend user interfaces:

- **Frontend (PKA SCENT)**: Dedicated user-facing fragrance showcase with the header **PKA SCENT**, discovery hero banner, and rich product cards presenting bottle photography, brand identity, accord color bars, and olfactory pyramids.
- **Gender Filter Checkboxes (Men, Women)**: Filter fragrances by target gender right after the search input. It matches `"for men"`, `"for women"`, as well as unisex products (`"for women and men"` / `"for men and women"`).
- **Settings (Branding & Identity)**: Easily customize your store and portal identity via the `⚙️ Settings` button in the topbar or admin panel:
  - **Logo**: Customize the brand crest with emoji/icon presets (`⚜️`, `👑`, `💎`, `🌸`, `✨`, `🌹`, `🌿`) or provide a custom image URL (`https://...`), complete with real-time live preview.
  - **Project Name**: Change the project/brand name (defaults to `PKA SCENT`), which updates the topbar brand header, document `<title>`, storefront hero subtitle, navigation tabs, and footer.
  - **Foot Tag**: Configure the footer note/tagline displayed inside the luxury boutique footer tag at the bottom of the page.
  - **Persistence & Reset**: Settings are stored in the MySQL `scraper_settings` table and synced through `/api/settings` with a single-click `Reset to defaults` action.
- **Backend (Admin Portal)**: Scraper controls (Foodpanda & Fragrantica URLs, browser switch), metrics summary, and complete product management:
  - **View**: Table view with photo previews, accords, note thumbnails, barcode/brand, status, and actions.
  - **Add**: Manual `+ Add product` modal dialog to add new fragrance and foodpanda items with instant database persistence.
  - **Edit**: In-place editor with field validation and optimistic locking.
  - **Delete**: Confirmation-guarded deletion.

Supports individual Fragrantica perfume pages with these table columns:
Product Name, Product Photo, Brand, Main Accords, Top Notes, Base Notes, Fragrance Notes, Status,
and Action. Status is `Active` or `Deactive`; Action offers Edit and Delete.
Product identity comes from the page's `itemprop="name"`, `itemprop="image"`, and
`itemprop="brand"` microdata, with structured-data fallbacks. Main accords appear
as bars with the source background/text colors, widths, and opacity. Top and base
notes appear as images with their labels, including the current span-based pyramid.
The scraper waits for the pyramid to populate before saving images and recognizes
lazy image attributes and responsive image sources. `brandLogo` contains the
brand image URL when available; `middleNotes` provides the middle tier.
Notes inside `#pyramid` are read from each lazy image and its paired span label,
including cards without links. Tier titles can use any HTML tag. Untitled pyramids
or a single "Fragrance Notes" section are stored as `fragranceNotes` with `{ name,
photo }` entries, instead of assigning an invented top/base tier. Only notes inside
that pyramid are collected; older pages without it retain the heading/description
fallback. The general notes appear in the table, product view, search, editor, and
JSON/database records. Existing saved rows need a new scrape to capture this field.

Fragrantica results open in **Product view**: a burgundy product banner with gender tag pill, large
bottle photo, brand logo, accord bars, and top/middle/base note groups. Use **Table**
to see the data columns, brand logo, note thumbnails, status, and actions.
Search and gender checkboxes filter both views. The product layout adapts to smaller screens. Missing
or failed images show a placeholder while keeping the product and note labels.
Re-scrape older saved results to populate logos and previously missing note images.

Photos are previewed in the table and exported as image URLs. Accords are arrays
of `{ name, backgroundColor, color, width, opacity }`; notes are arrays of
`{ name, photo }`, preserving their order on the page. Older saved string arrays
still display and filter correctly; re-scrape to capture styles and note photos. Missing note tiers
are shown as `Not listed` and exported as empty arrays.

It opens a Foodpanda page in Chromium, reads product data from network responses,
and stores product details such as:

```json
{
  "photo": "https://example.com/product.jpg",
  "barcode": "6902890022497",
  "name": "Product name",
  "price": 3.5
}
```

## Setup

Install Node.js 22.16 or newer and npm, then run:

```bash
npm install
```

If Chromium is missing, install it with:

```bash
npx playwright install chromium
```

Start your local MySQL or MariaDB server. Copy `.env.example` to `.env` and set
`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`. The default database
name is `scraper`. Keep credentials in `.env`, which is ignored by Git; they are
never sent to the browser.

Initialize the database and import existing saved JSON products:

```bash
npm run db:init
```

Startup also initializes the database automatically. The configured account needs
permission to create the database/tables and read/write products. Tables are
`scraper_products` and `scraper_migrations`. The JSON import runs once, keeps the
old files intact, and does not re-add products you later delete. Legacy rows without
a saved source URL retain a blank URL; perfume image IDs help recognize them on a
later scrape.

## Use The Web UI

Start the app:

```bash
npm start
```

Open this in your browser:

```text
http://127.0.0.1:7000
```

Then:

1. Select Foodpanda or Fragrantica, then paste one or more URLs from that website, one per line. The first supported URL selects the website automatically.
2. Leave `Show browser` off for background scraping (the default). Turn it on if the website needs location, login, or verification.
3. Run the scraper.
4. Review any duplicate confirmation. Confirm replaces the matching records; Cancel keeps them and skips that link.
5. Use Edit to update fields, note images, and status. Delete removes a product after confirmation.
6. Copy or download the accumulated JSON results.

Switching websites loads that website's saved database collection. New links add
products without deleting older results. The same perfume link (including tracking
URL variants) triggers confirmation even if its data is unchanged. Foodpanda uses
the page URL plus barcode, or name when no barcode exists. Scrapes with both new
and existing products wait for confirmation before saving any of that link's data.

Confirmation uses the already-scraped data and expires after 15 minutes or a server
restart. If a product is edited while confirmation is open, the app asks again.
Overwriting scraped details preserves the product's status. Both statuses remain
visible in this management UI and in exports; search also matches status. Product
edits/deletes persist across restarts, and stale edits cannot replace newer changes.

For Fragrantica, use a perfume detail URL such as:

```text
https://www.fragrantica.com/perfume/Prada/Prada-Paradoxe-Intense-83988.html
```

Background Fragrantica scraping uses the full Chromium engine, scrolls `#pyramid`
to trigger lazy content, and waits for images/labels even when no tier headings
exist. It never opens a visible browser automatically. Successful browser sessions
are saved locally in `.fragrantica-session.json` (Git-ignored) and reused by both
visible and background runs. Keep this session file private; delete it to reset
the saved session. A malformed session file starts a fresh session.

Fragrantica may still require verification in headless mode. Complete a successful
scrape once with `Show browser` enabled, then retry in the background. Session reuse
does not guarantee access, and the site can request verification again. With `Show browser` enabled, the
scraper allows up to two minutes for you to complete it. If access stays blocked,
it reports an error and preserves the previous results. It does not bypass verification.

## Use The CLI

Run a scrape from the terminal:

```bash
npm run scrape -- "https://www.foodpanda.com.kh/..."
```

Scrape a Fragrantica perfume (opens a visible browser):

```bash
npm run scrape:fragrantica -- "https://www.fragrantica.com/perfume/Prada/Prada-Paradoxe-Intense-83988.html"
```

Add `--headless` to run without a visible browser. This mode cannot accept manual verification.
Pass more URLs as additional arguments to scrape multiple pages. The CLI saves to
the same database and prompts before overwriting. Non-interactive runs skip
duplicates because they cannot obtain confirmation.

## Output

The database is the persistent source of results for the UI and CLI. JSON download
exports the selected website's complete collection, including `id`, `sourceUrl`,
`status`, `version`, and timestamps. Legacy JSON files are used only for the one-time
import; normal app/CLI scraping does not overwrite them.

## Check The Project

Run syntax checks and browser-backed extraction, API validation, and UI tests:

```bash
npm test
```

Tests use supplied HTML fixtures and mocked scrape responses, plus real database
integration tests for accumulation, confirmation, editing, deletion, and import.
They create isolated databases named `scraper_test_*` and remove those databases
afterward. MySQL/MariaDB and Chromium must be available; the test account needs
create/drop database permission. Tests do not scrape Fragrantica. Use
`npm run check` for syntax checks only.

## Troubleshooting

If port `7000` is busy (PowerShell):

```powershell
$env:PORT = "7001"
npm start
```

If no products are found:

- Run with `Show browser` turned on.
- Complete any Foodpanda location, login, or verification prompt.
- Let the page finish loading before closing the browser.

If startup reports a database connection error, verify the database service is
running and the connection settings in `.env` are correct.
