const form = document.querySelector("#scrapeForm");
const targetUrl = document.querySelector("#targetUrl");
const showBrowser = document.querySelector("#showBrowser");
const runButton = document.querySelector("#runButton");
const runState = document.querySelector("#runState");
const statusText = document.querySelector("#statusText");
const productCount = document.querySelector("#productCount");
const barcodeCount = document.querySelector("#barcodeCount");
const photoCount = document.querySelector("#photoCount");
const resultsBody = document.querySelector("#resultsBody");
const emptyState = document.querySelector("#emptyState");
const filterInput = document.querySelector("#filterInput");
const filterMen = document.querySelector("#filterMen");
const filterWomen = document.querySelector("#filterWomen");
const filterUnisex = document.querySelector("#filterUnisex");
const sortSelect = document.querySelector("#sortSelect");
const copyJson = document.querySelector("#copyJson");
const downloadJson = document.querySelector("#downloadJson");
const sourceInput = document.querySelector("#source");
const resultsHead = document.querySelector("#resultsHead");
const detailCountLabel = document.querySelector("#detailCountLabel");
const urlLabel = document.querySelector("#urlLabel");
const productGallery = document.querySelector("#productGallery");
const tablePanel = document.querySelector("#tablePanel");
const viewControls = document.querySelector("#viewControls");
const catalogueView = document.querySelector("#catalogueView");
const tableView = document.querySelector("#tableView");
const productEditor = document.querySelector("#productEditor");
const editProductForm = document.querySelector("#editProductForm");
const viewFrontendBtn = document.querySelector("#viewFrontendBtn");
const viewBackendBtn = document.querySelector("#viewBackendBtn");
const addProductBtn = document.querySelector("#addProductBtn");
const storefrontHero = document.querySelector("#storefrontHero");
const adminControlPanel = document.querySelector("#adminControlPanel");
const adminSummaryGrid = document.querySelector("#adminSummaryGrid");
const topbarEyebrow = document.querySelector("#topbarEyebrow");
const toolbarHeading = document.querySelector("#toolbarHeading");
const sidebarToggleBtn = document.querySelector("#sidebarToggleBtn");
const sidebarCloseBtn = document.querySelector("#sidebarCloseBtn");
const sidebarBackdrop = document.querySelector("#sidebarBackdrop");
const adminSidebar = document.querySelector("#adminSidebar");

function toggleSidebar() {
  document.body.classList.toggle("sidebar-open");
}

function closeSidebar() {
  document.body.classList.remove("sidebar-open");
}

const tagSettingsBtn = document.querySelector("#tagSettingsBtn");
const tagSettingsDialog = document.querySelector("#tagSettingsDialog");
const closeTagSettingsBtn = document.querySelector("#closeTagSettingsBtn");
const dismissTagSettingsBtn = document.querySelector("#dismissTagSettingsBtn");
const openAddTagBtn = document.querySelector("#openAddTagBtn");
const tagTableBody = document.querySelector("#tagTableBody");
const tagEmptyState = document.querySelector("#tagEmptyState");
const tagEditorModal = document.querySelector("#tagEditorModal");
const tagEditorForm = document.querySelector("#tagEditorForm");
const tagEditorTitle = document.querySelector("#tagEditorTitle");
const closeTagEditorBtn = document.querySelector("#closeTagEditorBtn");
const cancelTagEditorBtn = document.querySelector("#cancelTagEditorBtn");
const tagEditId = document.querySelector("#tagEditId");
const tagNameInput = document.querySelector("#tagNameInput");
const tagProductChecklist = document.querySelector("#tagProductChecklist");
const tagProductSelect = document.querySelector("#tagProductSelect");
const tagPickerSearch = document.querySelector("#tagPickerSearch");
const tagSelectAllBtn = document.querySelector("#tagSelectAllBtn");
const tagDeselectAllBtn = document.querySelector("#tagDeselectAllBtn");
const tagEditorError = document.querySelector("#tagEditorError");
const saveTagBtn = document.querySelector("#saveTagBtn");

const websiteBioBtn = document.querySelector("#websiteBioBtn");
const websiteBioDialog = document.querySelector("#websiteBioDialog");
const websiteBioForm = document.querySelector("#websiteBioForm");
const closeWebsiteBioBtn = document.querySelector("#closeWebsiteBioBtn");
const cancelWebsiteBioBtn = document.querySelector("#cancelWebsiteBioBtn");
const saveWebsiteBioBtn = document.querySelector("#saveWebsiteBioBtn");
const websiteBioStatusMsg = document.querySelector("#websiteBioStatusMsg");

const settingHeroSubheading = document.querySelector("#settingHeroSubheading");
const settingHeroTitle = document.querySelector("#settingHeroTitle");
const settingHeroText = document.querySelector("#settingHeroText");
const settingHeroBackground = document.querySelector("#settingHeroBackground");
const heroBgDropzone = document.querySelector("#heroBgDropzone");
const heroBgFileInput = document.querySelector("#heroBgFileInput");
const heroBgUploadInfo = document.querySelector("#heroBgUploadInfo");
const heroBgUploadName = document.querySelector("#heroBgUploadName");
const heroBgClearUploadBtn = document.querySelector("#heroBgClearUploadBtn");
const heroLivePreview = document.querySelector("#heroLivePreview");
const previewHeroSubheading = document.querySelector("#previewHeroSubheading");
const previewHeroTitle = document.querySelector("#previewHeroTitle");
const previewHeroText = document.querySelector("#previewHeroText");

const heroSubheadingEl = document.querySelector("#heroSubheading, .hero-subheading");
const heroTitleEl = document.querySelector("#heroTitle, .storefront-hero h2");
const heroTextEl = document.querySelector("#heroText, .storefront-hero p");

const openSettingsBtn = document.querySelector("#openSettingsBtn");
const adminSettingsBtn = document.querySelector("#adminSettingsBtn");
const settingsDialog = document.querySelector("#settingsDialog");
const settingsForm = document.querySelector("#settingsForm");
const closeSettingsBtn = document.querySelector("#closeSettingsBtn");
const cancelSettingsBtn = document.querySelector("#cancelSettingsBtn");
const resetSettingsBtn = document.querySelector("#resetSettingsBtn");
const saveSettingsBtn = document.querySelector("#saveSettingsBtn");
const settingProjectName = document.querySelector("#settingProjectName");
const settingSubtitle = document.querySelector("#settingSubtitle");
const settingLogo = document.querySelector("#settingLogo");
const settingFootTag = document.querySelector("#settingFootTag");
const settingDefaultWebsite = document.querySelector("#settingDefaultWebsite");
const logoPreviewCrest = document.querySelector("#logoPreviewCrest");
const logoPreviewCard = document.querySelector("#logoPreviewCard");
const logoDropzone = document.querySelector("#logoDropzone");
const logoFileInput = document.querySelector("#logoFileInput");
const logoUploadInfo = document.querySelector("#logoUploadInfo");
const logoUploadName = document.querySelector("#logoUploadName");
const logoClearUploadBtn = document.querySelector("#logoClearUploadBtn");
const settingTelegramBotEnabled = document.querySelector("#settingTelegramBotEnabled");
const telegramStatusLabel = document.querySelector("#telegramStatusLabel");
const telegramBotDirectLink = document.querySelector("#telegramBotDirectLink");
const settingTelegramBotToken = document.querySelector("#settingTelegramBotToken");
const settingTelegramBotUsername = document.querySelector("#settingTelegramBotUsername");
const settingTelegramChatId = document.querySelector("#settingTelegramChatId");
const telegramStatusDot = document.querySelector("#telegramStatusDot");
const telegramBotDisplayName = document.querySelector("#telegramBotDisplayName");
const testTelegramBtn = document.querySelector("#testTelegramBtn");
const sendTelegramTestMsgBtn = document.querySelector("#sendTelegramTestMsgBtn");
const telegramFeedbackMsg = document.querySelector("#telegramFeedbackMsg");
const settingTelegramContactEnabled = document.querySelector("#settingTelegramContactEnabled");
const telegramContactStatusLabel = document.querySelector("#telegramContactStatusLabel");
const settingTelegramContact = document.querySelector("#settingTelegramContact");
const settingTelegramContactText = document.querySelector("#settingTelegramContactText");
const telegramFloatingWidget = document.querySelector("#telegramFloatingWidget");
const telegramFloatingBtn = document.querySelector("#telegramFloatingBtn");
const telegramFloatingPillBtn = document.querySelector("#telegramFloatingPillBtn");
const telegramFloatingPillLabel = document.querySelector("#telegramFloatingPillLabel");
const settingsStatusMsg = document.querySelector("#settingsStatusMsg");
const brandCrest = document.querySelector("#brandCrest");
const footerCrest = document.querySelector("#footerCrest");
const loginModuleCrest = document.querySelector("#loginModuleCrest");
const brandTitle = document.querySelector("#brandTitle");
const viewFrontendText = document.querySelector("#viewFrontendText");
const footerProjectName = document.querySelector("#footerProjectName");
const footerTag = document.querySelector("#footerTag");
const logoutBtn = document.querySelector("#logoutBtn");

const adminLoginModule = document.querySelector("#adminLoginModule");
const adminModuleLoginForm = document.querySelector("#adminModuleLoginForm");
const moduleUsername = document.querySelector("#moduleUsername");
const modulePassword = document.querySelector("#modulePassword");
const adminLoginError = document.querySelector("#adminLoginError");
const adminLoginErrorMsg = document.querySelector("#adminLoginErrorMsg");
const moduleLoginSubmitBtn = document.querySelector("#moduleLoginSubmitBtn");

function setAdminLockedState(locked) {
  document.body.classList.toggle("admin-locked", locked);
  if (adminLoginModule) {
    adminLoginModule.hidden = !locked;
  }
}

async function checkAdminAuthStatus() {
  if (currentMode !== "backend") {
    setAdminLockedState(false);
    return true;
  }

  const cachedAuth = sessionStorage.getItem("pka_admin_auth") === "true";
  if (cachedAuth) {
    setAdminLockedState(false);
  } else {
    setAdminLockedState(true);
  }

  try {
    const res = await fetch("/api/admin/session");
    if (res.ok) {
      const data = await res.json();
      if (data.authenticated) {
        sessionStorage.setItem("pka_admin_auth", "true");
        setAdminLockedState(false);
        return true;
      }
    }
  } catch (_) {}

  sessionStorage.removeItem("pka_admin_auth");
  setAdminLockedState(true);
  return false;
}

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
let currentSettings = { ...DEFAULT_SETTINGS };

let editingProduct = null;
let products = [];
let savedRequest = 0;
let resultsView = "catalogue";
let currentMode = window.location.pathname.startsWith("/admin") || window.location.hash === "#admin" || window.location.hash === "#backend"
  ? "backend"
  : "frontend";

const isFragrantica = () => sourceInput.value === "fragrantica";

function getProductGender(name) {
  const nameLower = (name || "").toLowerCase();
  const isUnisex = /for (?:women and men|men and women|women & men|men & women)\b/i.test(nameLower) || /\bunisex\b/i.test(nameLower);
  const isMen = isUnisex || /\bfor men\b/i.test(nameLower) || nameLower.includes("for men");
  const isWomen = isUnisex || /\bfor women\b/i.test(nameLower) || nameLower.includes("for women");
  if (isUnisex || (isMen && isWomen)) return { label: "Unisex", className: "badge-unisex" };
  if (isMen) return { label: "For Men", className: "badge-men" };
  if (isWomen) return { label: "For Women", className: "badge-women" };
  return null;
}

function setAppMode(mode) {
  currentMode = mode;
  try { localStorage.setItem("pka_app_mode", mode); } catch (_) {}
  closeSidebar();

  const isFrontend = mode === "frontend";
  document.body.classList.toggle("mode-frontend", isFrontend);
  document.body.classList.toggle("mode-backend", !isFrontend);

  viewFrontendBtn?.setAttribute("aria-selected", String(isFrontend));
  viewFrontendBtn?.classList.toggle("active", isFrontend);
  viewBackendBtn?.setAttribute("aria-selected", String(!isFrontend));
  viewBackendBtn?.classList.toggle("active", !isFrontend);

  if (storefrontHero) storefrontHero.hidden = !isFrontend;
  if (adminControlPanel) adminControlPanel.classList.toggle("admin-hidden", isFrontend);
  if (adminSummaryGrid) adminSummaryGrid.classList.toggle("admin-hidden", isFrontend);
  const sortControlWrap = document.querySelector("#sortControlWrap");
  if (sortControlWrap) sortControlWrap.hidden = isFrontend;

  if (topbarEyebrow) {
    topbarEyebrow.textContent = isFrontend ? (currentSettings.subtitle || DEFAULT_SETTINGS.subtitle) : "Admin Scraper & Inventory Portal";
  }
  if (toolbarHeading) {
    toolbarHeading.textContent = isFrontend ? "Fragrance Collection" : (isFragrantica() ? "Fragrance Inventory" : "Scraped Products");
  }

  if (isFrontend) {
    setAdminLockedState(false);
    if (isFragrantica()) {
      resultsView = "catalogue";
      updateResultsView();
    }
  } else {
    checkAdminAuthStatus();
  }
  if (products && products.length) {
    renderTable();
    updateFilterCounts();
  }
  updateTelegramContactWidget();
}

function updateSourceView() {
  const fragrance = isFragrantica();
  urlLabel.textContent = fragrance ? "Fragrantica perfume URLs" : "Foodpanda URLs";
  targetUrl.placeholder = fragrance
    ? "https://www.fragrantica.com/perfume/Prada/Prada-Paradoxe-Intense-83988.html"
    : "https://www.foodpanda.com.kh/...";
  detailCountLabel.textContent = fragrance ? "With brand" : "With barcode";
  filterInput.placeholder = fragrance ? "Filter name, brand, accords or notes" : "Filter name or barcode";
  resultsHead.innerHTML = fragrance
    ? '<th>Product Name</th><th>Product Photo</th><th class="th-sortable" id="thBrand" title="Click to sort by brand">Brand</th><th>Main Accords</th><th>Top Notes</th><th>Base Notes</th><th>Fragrance Notes</th><th class="status-column">Status</th><th class="action-column">Action</th>'
    : '<th>Photo</th><th>Barcode</th><th>Name</th><th class="price-column">Price</th><th>Status</th><th>Action</th>';
  resultsHead.closest("table").classList.toggle("fragrance-table", fragrance);
  if (toolbarHeading) {
    toolbarHeading.textContent = currentMode === "frontend" ? "Fragrance Collection" : (fragrance ? "Fragrance Inventory" : "Scraped Products");
  }
  updateResultsView();
}

function updateResultsView() {
  const catalogue = isFragrantica() && resultsView === "catalogue";
  if (viewControls) viewControls.hidden = !isFragrantica();
  productGallery.hidden = !catalogue;
  tablePanel.hidden = catalogue;
  catalogueView?.setAttribute("aria-pressed", String(catalogue));
  catalogueView?.classList.toggle("active", catalogue);
  tableView?.setAttribute("aria-pressed", String(!catalogue));
  tableView?.classList.toggle("active", !catalogue);
}

function setStatus(message, state = "ready") {
  statusText.textContent = message;
  runState.textContent = state === "running" ? "Running" : state === "error" ? "Error" : "Ready";
  runState.classList.toggle("running", state === "running");
  runState.classList.toggle("error", state === "error");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPrice(value) {
  if (typeof value === "number") return value.toFixed(2);
  return String(value ?? "");
}

function renderAccords(values) {
  if (!Array.isArray(values) || !values.length) return "Not listed";
  const container = document.createElement("div");
  container.className = "accord-list";
  for (const value of values) {
    const accord = typeof value === "string" ? { name: value } : value;
    const bar = document.createElement("div");
    bar.className = "accord-bar";
    bar.textContent = accord.name;
    bar.title = accord.name;
    if (CSS.supports("background-color", accord.backgroundColor)) bar.style.backgroundColor = accord.backgroundColor;
    if (CSS.supports("color", accord.color)) bar.style.color = accord.color;
    if (/^(?:\d+(?:\.\d+)?|\.\d+)%$/.test(accord.width)) {
      bar.style.width = `${Math.min(100, parseFloat(accord.width))}%`;
    }
    if (accord.opacity !== undefined && Number.isFinite(Number(accord.opacity))) {
      bar.style.opacity = Math.max(0, Math.min(1, Number(accord.opacity)));
    }
    container.append(bar);
  }
  return container.outerHTML;
}

function renderNotes(values) {
  if (!Array.isArray(values) || !values.length) return "Not listed";
  return `<div class="note-list">${values.map((value) => {
    const note = typeof value === "string" ? { name: value } : value;
    const photo = renderImage(note.photo, note.name, "note-photo");
    return `<div class="note-item">${photo}<span>${escapeHtml(note.name)}</span></div>`;
  }).join("")}</div>`;
}

function getProxiedImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("data:") || trimmed.startsWith("/uploads/") || trimmed.startsWith("/api/")) {
    return trimmed;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return `/api/proxy-image?url=${encodeURIComponent(trimmed)}`;
  }
  return trimmed;
}

function renderImage(url, label, className) {
  const valid = /^https?:\/\//i.test(url || "") || (typeof url === "string" && (url.startsWith("/uploads/") || url.startsWith("data:")));
  const fallback = `<span class="image-fallback" ${valid ? "hidden" : ""}>Image unavailable</span>`;
  return `<span class="image-frame ${className}-frame">${valid
    ? `<img class="${className}" src="${escapeHtml(url)}" data-raw-src="${escapeHtml(url)}" alt="${escapeHtml(label)}" loading="lazy" referrerpolicy="no-referrer">`
    : ""}${fallback}</span>`;
}

function renderBrand(product) {
  return `<div class="brand-identity">${product.brandLogo ? renderImage(product.brandLogo, `${product.brand} logo`, "brand-logo") : ""}
    <span class="brand-name ${product.brandLogo ? "" : "brand-wordmark"}">${escapeHtml(product.brand)}</span></div>`;
}

function renderProductStatus(product) {
  const status = product.status === "Deactive" ? "Deactive" : "Active";
  return `<span class="product-status ${status.toLowerCase()}">${status}</span>`;
}

function renderActions(product) {
  const tags = Array.isArray(product.tags) && product.tags.length ? product.tags : [];
  const tagsHtml = tags
    .map((t) => `<span class="product-tag-badge" title="Tag: ${escapeHtml(t)}">${escapeHtml(t)}</span>`)
    .join("");

  return `<div class="product-actions">
    ${tagsHtml ? `<span class="product-tags-group">${tagsHtml}</span>` : ""}
    <button type="button" class="tag-product-btn" data-action="tag" data-id="${escapeHtml(product.id)}" ${product.id ? "" : "disabled"} title="Manage tags for this perfume">🏷️ Tag</button>
    <button type="button" class="action-icon-btn edit-product-btn" data-action="edit" data-id="${escapeHtml(product.id)}" ${product.id ? "" : "disabled"} title="Edit" aria-label="Edit">✏️</button>
    <button type="button" class="action-icon-btn delete-product delete-product-btn" data-action="delete" data-id="${escapeHtml(product.id)}" ${product.id ? "" : "disabled"} title="Delete" aria-label="Delete">🗑️</button>
  </div>`;
}

function hasPopularTag(product) {
  return Array.isArray(product?.tags) && product.tags.includes("ក្លិនពេញនិយម");
}

function renderGallery(rows) {
  if (!isFragrantica()) { productGallery.innerHTML = ""; return; }
  productGallery.innerHTML = rows.map((product) => {
    const gender = getProductGender(product.name);
    const cardId = product.id || product.name;
    const isSelected = selectedCards.has(cardId);
    return `<article class="fragrance-card ${isSelected ? "is-selected" : ""}" data-product-id="${escapeHtml(product.id || "")}" data-product-name="${escapeHtml(product.name)}" data-brand="${escapeHtml(product.brand || "")}">
      <div class="card-hold-overlay" aria-hidden="true">
        <div class="hold-progress-spinner">
          <svg class="hold-progress-svg" viewBox="0 0 52 52">
            <circle class="hold-circle-bg" cx="26" cy="26" r="22"></circle>
            <circle class="hold-circle-bar" cx="26" cy="26" r="22"></circle>
          </svg>
          <span class="hold-icon">✓</span>
        </div>
        <span class="hold-text">Hold to select...</span>
      </div>
      <header class="fragrance-banner">
        <div class="banner-top-row">
          <div class="banner-brand-gender">
            ${hasPopularTag(product) ? `<span class="product-tag-badge">ក្លិនពេញនិយម</span>` : ""}
            <p class="brand-eyebrow">${escapeHtml(product.brand)}</p>
            ${gender ? `<span class="gender-tag ${gender.className}">${escapeHtml(gender.label)}</span>` : ""}
          </div>
          <div class="banner-actions-right">
            <div class="card-select-checkbox" aria-label="Select perfume" title="Tap or hold to select">
              <span class="select-check-icon">✓</span>
            </div>
          </div>
        </div>
        <h3>${escapeHtml(product.name)}</h3>
      </header>
      <div class="card-actions">${renderProductStatus(product)}${renderActions(product)}</div>
      <div class="fragrance-layout">
        <div class="bottle-panel">${renderImage(product.photo, product.name, "bottle-photo")}</div>
        <div class="identity-panel">
          ${renderBrand(product)}
          <section class="accord-panel" aria-label="Main accords">
            <h4>Main accords</h4>${renderAccords(product.mainAccords)}
          </section>
        </div>
        <div class="pyramid-panel">
          ${productNoteGroups(product)
            .map(([label, notes]) => `<section class="note-tier"><h4>${label}</h4>${renderNotes(notes)}</section>`).join("")}
        </div>
      </div>
      <div class="fragrance-rule" aria-hidden="true"><span></span><span></span><span></span></div>
    </article>`;
  }).join("");
}

function productNoteGroups(product) {
  const tiers = [["Top Notes", product.topNotes], ["Middle Notes", product.middleNotes], ["Base Notes", product.baseNotes]];
  if (!product.fragranceNotes?.length) return tiers;
  return [...tiers.filter(([, notes]) => notes?.length), ["Fragrance Notes", product.fragranceNotes]];
}

function sortProducts(items, sortMode = "brand-asc") {
  const list = [...items];
  return list.sort((a, b) => {
    // 1. Tag "ក្លិនពេញនិយម" always sorts to top
    const aPop = hasPopularTag(a);
    const bPop = hasPopularTag(b);
    if (aPop && !bPop) return -1;
    if (!aPop && bPop) return 1;

    // 2. Secondary sort according to chosen sortMode
    switch (sortMode) {
      case "brand-asc": {
        const brandA = (a.brand || "").trim();
        const brandB = (b.brand || "").trim();
        const brandCmp = brandA.localeCompare(brandB, undefined, { sensitivity: "base" });
        if (brandCmp !== 0) return brandCmp;
        return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
      }
      case "brand-desc": {
        const brandA = (a.brand || "").trim();
        const brandB = (b.brand || "").trim();
        const brandCmp = brandB.localeCompare(brandA, undefined, { sensitivity: "base" });
        if (brandCmp !== 0) return brandCmp;
        return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
      }
      case "name-asc":
        return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
      case "name-desc":
        return (b.name || "").localeCompare(a.name || "", undefined, { sensitivity: "base" });
      case "default":
      default:
        return 0;
    }
  });
}

function visibleProducts() {
  const query = filterInput.value.trim().toLowerCase();
  const menChecked = Boolean(filterMen?.checked);
  const womenChecked = Boolean(filterWomen?.checked);
  const unisexChecked = Boolean(filterUnisex?.checked);
  const sortMode = sortSelect?.value || "brand-asc";

  const filtered = products.filter((product) => {
    // Frontend storefront only shows active products
    if (currentMode === "frontend" && product.status === "Deactive") {
      return false;
    }

    if (menChecked || womenChecked || unisexChecked) {
      const nameLower = (product.name || "").toLowerCase();
      const isUnisex = /for (?:women and men|men and women|women & men|men & women)\b/i.test(nameLower) || /\bunisex\b/i.test(nameLower);
      const isMen = isUnisex || /\bfor men\b/i.test(nameLower) || nameLower.includes("for men");
      const isWomen = isUnisex || /\bfor women\b/i.test(nameLower) || nameLower.includes("for women");

      const matchesMen = menChecked && isMen;
      const matchesWomen = womenChecked && isWomen;
      const matchesUnisex = unisexChecked && isUnisex;

      if (!matchesMen && !matchesWomen && !matchesUnisex) return false;
    }

    if (selectedTagFilters.size > 0) {
      const productTags = Array.isArray(product.tags) ? product.tags : [];
      const matchesTag = [...selectedTagFilters].some((t) => productTags.includes(t));
      if (!matchesTag) return false;
    }

    if (!query) return true;

    return [
      product.name,
      product.brand,
      product.barcode,
      product.status,
      ...(Array.isArray(product.tags) ? product.tags : []),
      ...[product.mainAccords, product.topNotes, product.middleNotes, product.baseNotes, product.fragranceNotes].flatMap((items) =>
        Array.isArray(items) ? items.map((item) => (typeof item === "string" ? item : item.name)) : []
      ),
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return sortProducts(filtered, sortMode);
}

function updateFilterCounts() {
  const query = (filterInput?.value || "").trim().toLowerCase();
  const basePool = currentMode === "frontend"
    ? products.filter((product) => product.status !== "Deactive")
    : products;

  const baseProducts = query
    ? basePool.filter((product) => {
        return [
          product.name,
          product.brand,
          product.barcode,
          product.status,
          ...(Array.isArray(product.tags) ? product.tags : []),
          ...[product.mainAccords, product.topNotes, product.middleNotes, product.baseNotes, product.fragranceNotes].flatMap((items) =>
            Array.isArray(items) ? items.map((item) => (typeof item === "string" ? item : item.name)) : []
          ),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
    : basePool;

  let menCount = 0;
  let womenCount = 0;
  let unisexCount = 0;

  for (const product of baseProducts) {
    const nameLower = (product.name || "").toLowerCase();
    const isUnisex = /for (?:women and men|men and women|women & men|men & women)\b/i.test(nameLower) || /\bunisex\b/i.test(nameLower);
    const isMen = isUnisex || /\bfor men\b/i.test(nameLower) || nameLower.includes("for men");
    const isWomen = isUnisex || /\bfor women\b/i.test(nameLower) || nameLower.includes("for women");

    if (isMen) menCount++;
    if (isWomen) womenCount++;
    if (isUnisex) unisexCount++;
  }

  const countMen = document.querySelector("#countMen");
  const countWomen = document.querySelector("#countWomen");
  const countUnisex = document.querySelector("#countUnisex");

  if (countMen) countMen.textContent = `(${menCount})`;
  if (countWomen) countWomen.textContent = `(${womenCount})`;
  if (countUnisex) countUnisex.textContent = `(${unisexCount})`;

  for (const tag of currentTags) {
    if (tag.filter === false) continue;
    let tagCount = 0;
    for (const product of baseProducts) {
      if (Array.isArray(product.tags) && product.tags.includes(tag.name)) {
        tagCount++;
      }
    }
    const safeName = CSS.escape ? CSS.escape(tag.name) : tag.name.replace(/["\\]/g, "\\$&");
    const countEl = document.querySelector(`[data-tag-count="${safeName}"]`);
    if (countEl) countEl.textContent = `(${tagCount})`;
  }
}

function renderMetrics() {
  productCount.textContent = products.length;
  barcodeCount.textContent = products.filter((product) => isFragrantica() ? product.brand : product.barcode).length;
  photoCount.textContent = products.filter((product) => product.photo).length;
  updateFilterCounts();
}

function renderTable() {
  updateFilterCounts();
  const thBrand = document.querySelector("#thBrand");
  if (thBrand) {
    const currentSort = sortSelect?.value || "brand-asc";
    thBrand.classList.toggle("sorted-asc", currentSort === "brand-asc");
    thBrand.classList.toggle("sorted-desc", currentSort === "brand-desc");
  }
  const rows = visibleProducts();
  emptyState.hidden = rows.length > 0;
  const isFiltered = filterInput.value.trim() || filterMen?.checked || filterWomen?.checked || filterUnisex?.checked;
  emptyState.textContent = isFiltered ? "No products match your search/filter." : "Run a scrape to see your products here.";
  renderGallery(rows);

  resultsBody.innerHTML = rows
    .map((product) => {
      const photoCell = product.photo
        ? `<img class="product-photo" src="${escapeHtml(product.photo)}" data-raw-src="${escapeHtml(product.photo)}" alt="${escapeHtml(product.name)}" loading="lazy" referrerpolicy="no-referrer" />`
        : `<span class="photo-placeholder">No img</span>`;

      if (isFragrantica()) {
        return `<tr>
          <td class="product-name">${escapeHtml(product.name)}</td>
          <td>${photoCell}</td>
          <td>${renderBrand(product)}${hasPopularTag(product) ? `<div style="margin-top:4px;"><span class="product-tag-badge">ក្លិនពេញនិយម</span></div>` : ""}</td>
          <td>${renderAccords(product.mainAccords)}</td>
          <td>${renderNotes(product.topNotes)}</td>
          <td>${renderNotes(product.baseNotes)}</td>
          <td>${renderNotes(product.fragranceNotes)}</td>
          <td>${renderProductStatus(product)}</td>
          <td>${renderActions(product)}</td>
        </tr>`;
      }

      return `
        <tr>
          <td>${photoCell}</td>
          <td class="barcode ${product.barcode ? "" : "missing"}">${escapeHtml(product.barcode || "No barcode")}</td>
          <td class="product-name">${escapeHtml(product.name)}</td>
          <td class="price">${escapeHtml(formatPrice(product.price))}</td>
          <td>${renderProductStatus(product)}</td>
          <td>${renderActions(product)}</td>
        </tr>
      `;
    })
    .join("");
}

function setProducts(nextProducts, message) {
  products = Array.isArray(nextProducts) ? nextProducts : [];
  renderMetrics();
  updateFilterCounts();
  renderTable();
  setStatus(message || `${products.length} products loaded`);
}

async function loadSavedProducts() {
  const requestId = ++savedRequest;
  const source = sourceInput.value;
  try {
    const response = await fetch(`/api/products?source=${source}`);
    const payload = await response.json();
    if (requestId !== savedRequest) return;

    if (!response.ok) {
      throw new Error(payload.error || "Could not load saved output.");
    }

    setProducts(payload.products, `${payload.products.length} saved products loaded`);
  } catch (error) {
    if (requestId !== savedRequest) return;
    setStatus(error.message, "error");
  }
}

async function runScrape(event) {
  event.preventDefault();
  ++savedRequest;

  runButton.disabled = true;
  sourceInput.disabled = true;
  showBrowser.disabled = true;
  targetUrl.disabled = true;
  copyJson.disabled = true;
  downloadJson.disabled = true;
  setStatus(isFragrantica() && showBrowser.checked
    ? "Scrape running. Complete any verification in the opened browser within two minutes."
    : "Scrape running. Keep this page open.", "running");

  try {
    const urls = [...new Set(targetUrl.value.split(/\r?\n/).map((url) => url.trim()).filter(Boolean))];
    let completed = 0;
    let skipped = 0;
    let failed = 0;
    const errors = [];
    for (const [index, url] of urls.entries()) {
      setStatus(`Scraping link ${index + 1} of ${urls.length}. ${showBrowser.checked
        ? "Complete any verification in the opened browser."
        : "Running in the background; no browser window will open."}`, "running");
      try {
        let response = await fetch("/api/scrape", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ url, source: sourceInput.value, showBrowser: showBrowser.checked }),
        });
        let payload = await response.json();
        while (payload.requiresConfirmation) {
          const names = payload.conflicts.map((item) => `${item.name}${item.unchanged ? " (same data)" : " (existing product)"}`).join("\n");
          const overwrite = window.confirm(`${names}\n\nOverwrite these saved products with the newly scraped data? Cancel keeps the existing products and skips this link.`);
          response = await fetch("/api/scrape/confirm", {
            method: "POST", headers: { "content-type": "application/json" },
            body: JSON.stringify({ token: payload.token, overwrite }),
          });
          payload = await response.json();
        }
        if (!response.ok) throw new Error(payload.error || "Scrape failed.");
        if (payload.cancelled) skipped++; else completed++;
        setProducts(payload.products);
      } catch (error) { failed++; errors.push(`${url}: ${error.message}`); }
    }
    setStatus(`Scrape complete: ${completed} links saved, ${skipped} skipped, ${failed} failed. ${products.length} total products.${errors.length ? ` ${errors.join(" ")}` : ""}`, failed ? "error" : "ready");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    runButton.disabled = false;
    sourceInput.disabled = false;
    showBrowser.disabled = false;
    targetUrl.disabled = false;
    copyJson.disabled = false;
    downloadJson.disabled = false;
  }
}

const listFields = { mainAccords: "Main accords", topNotes: "Top notes", middleNotes: "Middle notes", baseNotes: "Base notes", fragranceNotes: "Fragrance notes" };

const ACCORD_COLOR_PRESETS = {
  woody: "#774414",
  leather: "#78483a",
  amber: "#bc4d10",
  "warm spicy": "#d03a08",
  "fresh spicy": "#7ec828",
  aromatic: "#68b59f",
  citrus: "#f9ff52",
  floral: "#e87898",
  "white floral": "#f3e7e8",
  vanilla: "#f3e5ab",
  sweet: "#e28a52",
  powdery: "#eeddcc",
  musky: "#eae1d8",
  aquatic: "#3cb3d3",
  marine: "#289ecb",
  fruity: "#ee5c6a",
  green: "#489f38",
  balsamic: "#a47854",
  smoky: "#595959",
  patchouli: "#5d3a1a",
  rose: "#ea4c89",
  iris: "#b7a7d7",
  earthy: "#745b41",
  cacao: "#4a2c11",
  coffee: "#3b2219",
  tobacco: "#8a5026",
  mossy: "#5b7744",
  aldehydic: "#99ccff",
  ozonic: "#b0e0e6",
  animalic: "#8e4b13",
  caramel: "#c67a32",
  cinnamon: "#9e472a",
  herbal: "#608038",
  soapy: "#cce5ff",
};

function toHexColor(colorStr, fallback = "#774414") {
  if (!colorStr || typeof colorStr !== "string") return fallback;
  const s = colorStr.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/i.test(s)) return s;
  if (/^#[0-9a-f]{3}$/i.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  const rgbMatch = s.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const r = Math.min(255, parseInt(rgbMatch[1], 10)).toString(16).padStart(2, "0");
    const g = Math.min(255, parseInt(rgbMatch[2], 10)).toString(16).padStart(2, "0");
    const b = Math.min(255, parseInt(rgbMatch[3], 10)).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }
  return fallback;
}

function getContrastTextColor(hexColor) {
  const hex = toHexColor(hexColor, "#000000").slice(1);
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? "#111111" : "#ffffff";
}

function editListRow(field, item = {}, index = -1) {
  if (typeof item === "string") item = { name: item };

  if (field === "mainAccords") {
    const rawColor = item.backgroundColor || item.colorHex || "";
    const hexColor = toHexColor(rawColor, "#774414");
    const textColor = item.color || getContrastTextColor(hexColor);
    const width = item.width || "100%";
    const opacity = item.opacity !== undefined ? String(item.opacity) : "1";
    const nameVal = item.name || "";

    return `<div class="edit-list-row edit-accord-row" data-original-index="${index}" data-user-colored="${Boolean(rawColor)}">
      <div class="accord-inputs-row">
        <input data-value="name" class="accord-name-input" aria-label="Main accord name" value="${escapeHtml(nameVal)}" placeholder="Accord name (e.g. woody)" required>
        
        <div class="accord-color-picker-wrap" title="Pickup accord color">
          <label class="accord-color-swatch-label" title="Click to pick color">
            <input type="color" data-value="backgroundColor" class="accord-color-input" value="${hexColor}">
            <span class="accord-color-swatch" style="background-color: ${hexColor};"></span>
          </label>
          <input type="text" class="accord-hex-text" aria-label="Hex color code" value="${hexColor}" placeholder="#RRGGBB" maxlength="7" spellcheck="false">
        </div>

        <input type="hidden" data-value="color" class="accord-text-color-input" value="${escapeHtml(textColor)}">
        <input type="hidden" data-value="width" value="${escapeHtml(width)}">
        <input type="hidden" data-value="opacity" value="${escapeHtml(opacity)}">
      </div>

      <div class="accord-preview-col" aria-hidden="true">
        <span class="accord-preview-pill" style="background-color: ${hexColor}; color: ${textColor};" title="Live Preview">
          ${escapeHtml(nameVal || "Preview")}
        </span>
      </div>

      <button type="button" data-remove-row class="remove-row-btn" aria-label="Remove accord">Remove</button>
    </div>`;
  }

  return `<div class="edit-list-row" data-original-index="${index}">
    <input data-value="name" aria-label="${listFields[field]} name" value="${escapeHtml(item.name || "")}" placeholder="Name" required>
    <input data-value="photo" type="url" aria-label="${listFields[field]} image URL" value="${escapeHtml(item.photo || "")}" placeholder="Image URL">
    <button type="button" data-remove-row aria-label="Remove item">Remove</button>
  </div>`;
}

function openAddProduct() {
  editingProduct = null;
  document.querySelector("#editorTitle").textContent = isFragrantica() ? "Add new fragrance" : "Add new product";
  document.querySelector("#editError").textContent = "";
  document.querySelector("#saveEdit").textContent = "Add product";

  const fields = isFragrantica()
    ? [
        ["name", "Product name", "text", true],
        ["brand", "Brand", "text", true],
        ["photo", "Product photo URL", "url", false],
        ["brandLogo", "Brand logo URL", "url", false],
      ]
    : [
        ["name", "Product name", "text", true],
        ["barcode", "Barcode", "text", false],
        ["price", "Price", "number", false],
        ["photo", "Product photo URL", "url", false],
      ];

  document.querySelector("#editFields").innerHTML =
    fields
      .map(
        ([key, label, type, req]) =>
          `<label>${label}<input name="${key}" type="${type}" ${req ? "required" : ""} ${key === "price" ? 'step="any"' : ""} placeholder="${label}"></label>`
      )
      .join("") +
    `<label>Tags (comma separated)<input name="tags" value="ក្លិនពេញនិយម" placeholder="ក្លិនពេញនិយម"></label>` +
    `<label>Status<select name="status"><option value="Active" selected>Active</option><option value="Deactive">Deactive</option></select></label>`;

  document.querySelector("#editLists").innerHTML = isFragrantica()
    ? Object.entries(listFields)
        .map(
          ([field, label]) => `<fieldset data-list="${field}"><legend>${label}</legend>
          <div class="edit-list-items"></div>
          <button type="button" data-add-list="${field}">Add item</button></fieldset>`
        )
        .join("")
    : "";

  productEditor.showModal();
}

function openEditor(product) {
  editingProduct = product;
  document.querySelector("#editorTitle").textContent = "Edit product";
  document.querySelector("#editError").textContent = "";
  document.querySelector("#saveEdit").textContent = "Save changes";
  const fields = product.source === "fragrantica"
    ? [["name", "Product name"], ["photo", "Product photo URL"], ["brand", "Brand"], ["brandLogo", "Brand logo URL"]]
    : [["name", "Product name"], ["photo", "Product photo URL"], ["barcode", "Barcode"], ["price", "Price"]];
  const currentTagsVal = Array.isArray(product.tags) && product.tags.length ? product.tags.join(", ") : "ក្លិនពេញនិយម";
  document.querySelector("#editFields").innerHTML = fields.map(([key, label]) => `<label>${label}
    <input name="${key}" value="${escapeHtml(product[key] ?? "")}" ${key === "name" ? "required" : ""}
      type="${["photo", "brandLogo"].includes(key) ? "url" : key === "price" ? "number" : "text"}" ${key === "price" ? 'step="any"' : ""}></label>`).join("") +
    `<label>Tags (comma separated)<input name="tags" value="${escapeHtml(currentTagsVal)}" placeholder="ក្លិនពេញនិយម"></label>` +
    `<label>Status<select name="status"><option value="Active">Active</option><option value="Deactive" ${product.status === "Deactive" ? "selected" : ""}>Deactive</option></select></label>`;
  document.querySelector("#editLists").innerHTML = product.source === "fragrantica"
    ? Object.entries(listFields).map(([field, label]) => `<fieldset data-list="${field}"><legend>${label}</legend>
        <div class="edit-list-items">${(product[field] || []).map((item, index) => editListRow(field, item, index)).join("")}</div>
        <button type="button" data-add-list="${field}">Add item</button></fieldset>`).join("") : "";
  productEditor.showModal();
}

editProductForm.addEventListener("click", (event) => {
  const add = event.target.closest("[data-add-list]");
  if (add) add.closest("fieldset").querySelector(".edit-list-items").insertAdjacentHTML("beforeend", editListRow(add.dataset.addList));
  const remove = event.target.closest("[data-remove-row]");
  if (remove) remove.closest(".edit-list-row").remove();
});

editProductForm.addEventListener("input", (event) => {
  const row = event.target.closest(".edit-accord-row");
  if (!row) return;

  const colorInput = row.querySelector(".accord-color-input");
  const swatch = row.querySelector(".accord-color-swatch");
  const hexInput = row.querySelector(".accord-hex-text");
  const textColorInput = row.querySelector(".accord-text-color-input");
  const previewPill = row.querySelector(".accord-preview-pill");
  const nameInput = row.querySelector(".accord-name-input");

  // When color picker changes
  if (event.target === colorInput) {
    const hex = colorInput.value.toLowerCase();
    row.dataset.userColored = "true";
    if (swatch) swatch.style.backgroundColor = hex;
    if (hexInput) hexInput.value = hex;
    const textColor = getContrastTextColor(hex);
    if (textColorInput) textColorInput.value = textColor;
    if (previewPill) {
      previewPill.style.backgroundColor = hex;
      previewPill.style.color = textColor;
    }
  }

  // When hex code is typed
  if (event.target === hexInput) {
    let hex = hexInput.value.trim().toLowerCase();
    if (!hex.startsWith("#") && /^[0-9a-f]{3,6}$/i.test(hex)) hex = "#" + hex;
    if (/^#[0-9a-f]{6}$/i.test(hex)) {
      row.dataset.userColored = "true";
      if (colorInput) colorInput.value = hex;
      if (swatch) swatch.style.backgroundColor = hex;
      const textColor = getContrastTextColor(hex);
      if (textColorInput) textColorInput.value = textColor;
      if (previewPill) {
        previewPill.style.backgroundColor = hex;
        previewPill.style.color = textColor;
      }
    }
  }

  // When accord name is typed
  if (event.target === nameInput) {
    const name = nameInput.value.trim();
    if (previewPill) previewPill.textContent = name || "Preview";

    // Auto-suggest preset color if user hasn't chosen a custom color
    const nameLower = name.toLowerCase();
    if (ACCORD_COLOR_PRESETS[nameLower] && row.dataset.userColored !== "true") {
      const presetHex = ACCORD_COLOR_PRESETS[nameLower];
      if (colorInput) colorInput.value = presetHex;
      if (swatch) swatch.style.backgroundColor = presetHex;
      if (hexInput) hexInput.value = presetHex;
      const textColor = getContrastTextColor(presetHex);
      if (textColorInput) textColorInput.value = textColor;
      if (previewPill) {
        previewPill.style.backgroundColor = presetHex;
        previewPill.style.color = textColor;
      }
    }
  }
});

editProductForm.addEventListener("change", (event) => {
  const row = event.target.closest(".edit-accord-row");
  if (row && (event.target.classList.contains("accord-color-input") || event.target.classList.contains("accord-hex-text"))) {
    row.dataset.userColored = "true";
  }
});

document.querySelector("#cancelEdit").addEventListener("click", () => productEditor.close());

editProductForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const save = document.querySelector("#saveEdit");
  save.disabled = true;
  try {
    const changes = Object.fromEntries(new FormData(editProductForm));
    if (changes.tags !== undefined) {
      changes.tags = String(changes.tags)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    for (const fieldset of document.querySelectorAll("#editLists fieldset")) {
      const field = fieldset.dataset.list;
      changes[field] = [...fieldset.querySelectorAll(".edit-list-row")].map((row) => {
        const original = editingProduct?.[field]?.[Number(row.dataset.originalIndex)];
        const item = typeof original === "object" ? { ...original } : {};
        for (const input of row.querySelectorAll("[data-value]")) item[input.dataset.value] = input.value;
        if (field === "mainAccords") {
          item.backgroundColor = toHexColor(item.backgroundColor || "", "#774414");
          item.color = getContrastTextColor(item.backgroundColor);
          if (!item.width) item.width = "100%";
          if (item.opacity === undefined) item.opacity = "1";
        }
        return item;
      });
    }

    if (editingProduct) {
      changes.version = editingProduct.version;
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(changes),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not save product.");
      ++savedRequest;
      if (payload.source === sourceInput.value) setProducts(payload.products, "Product updated");
      productEditor.close();
    } else {
      changes.source = sourceInput.value;
      const response = await fetch("/api/products", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(changes),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not add product.");
      ++savedRequest;
      if (payload.source === sourceInput.value) setProducts(payload.products, "Product added");
      productEditor.close();
    }
  } catch (error) { document.querySelector("#editError").textContent = error.message; }
  finally { save.disabled = false; }
});

document.querySelector(".results-section").addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const product = products.find((item) => item.id === button.dataset.id);
  if (!product) return;
  if (button.dataset.action === "edit") { openEditor(product); return; }
  if (button.dataset.action === "tag") { openProductTagModal(product); return; }
  if (!window.confirm(`Delete "${product.name}" from your saved products?`)) return;
  button.disabled = true;
  try {
    const response = await fetch(`/api/products/${product.id}`, {
      method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ version: product.version }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Could not delete product.");
    ++savedRequest;
    if (payload.source === sourceInput.value) setProducts(payload.products, "Product deleted");
  } catch (error) { setStatus(error.message, "error"); button.disabled = false; }
});

const selectedCards = new Set();
let currentModalBlobUrl = null;

function updateSelectionUI() {
  const count = selectedCards.size;
  const floatingCopyBar = document.querySelector("#floatingCopyBar");
  const selectedCountNum = document.querySelector("#selectedCountNum");

  if (floatingCopyBar) {
    floatingCopyBar.hidden = count === 0;
  }
  if (selectedCountNum) {
    selectedCountNum.textContent = count;
  }
  document.body.classList.toggle("perfume-selection-mode", count > 0);
}

function toggleCardSelection(card) {
  if (!card) return;
  const key = card.dataset.productId || card.dataset.productName;
  if (!key) return;

  if (selectedCards.has(key)) {
    selectedCards.delete(key);
    card.classList.remove("is-selected");
  } else {
    selectedCards.add(key);
    card.classList.add("is-selected");
  }
  updateSelectionUI();
}

function clearCardSelection() {
  selectedCards.clear();
  document.querySelectorAll(".fragrance-card.is-selected").forEach((card) => {
    card.classList.remove("is-selected");
  });
  updateSelectionUI();
}

function showToast(messageHtml, type = "info", duration = 4500) {
  const container = document.querySelector("#toastContainer");
  if (!container) return null;

  const toast = document.createElement("div");
  toast.className = `toast-item toast-${type}`;
  toast.innerHTML = `
    <div class="toast-body">${messageHtml}</div>
    <button type="button" class="toast-close" aria-label="Close notification">✕</button>
  `;

  let timer = null;
  const dismiss = () => {
    if (timer) clearTimeout(timer);
    toast.classList.add("toast-leaving");
    setTimeout(() => toast.remove(), 250);
  };

  toast.querySelector(".toast-close")?.addEventListener("click", dismiss);
  container.appendChild(toast);

  if (duration) {
    timer = setTimeout(dismiss, duration);
  }

  return {
    dismiss,
    update: (newHtml) => {
      const body = toast.querySelector(".toast-body");
      if (body) body.innerHTML = newHtml;
    },
  };
}

let activeModalBlobUrls = [];

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function openMobileImageModal(blobOrItems, singleFileName) {
  const modal = document.querySelector("#mobileImageModal");
  const modalTitle = document.querySelector("#mobileModalTitle");
  const previewWrap = document.querySelector(".mobile-image-preview-wrap");
  const modalHint = document.querySelector(".mobile-modal-hint");
  const shareBtn = document.querySelector("#mobileShareTelegramBtn");
  const downloadBtn = document.querySelector("#mobileDownloadImgBtn");
  const closeBtn = document.querySelector("#closeMobileModalBtn");

  if (!modal || !previewWrap) return;

  const items = Array.isArray(blobOrItems)
    ? blobOrItems
    : [{ blob: blobOrItems, fileName: singleFileName || `perfume-${Date.now()}.png`, name: "Perfume Panel" }];

  if (modalTitle) {
    modalTitle.textContent = items.length > 1
      ? `📸 ${items.length} Separate Perfume Images`
      : "📸 Perfume Image Ready";
  }

  if (modalHint) {
    modalHint.innerHTML = items.length > 1
      ? `Each perfume panel is captured as its own separate image. Tap <strong>"📋 Copy"</strong> on any panel to copy it individually, or click <strong>"✈️ Share All to Telegram"</strong>.`
      : `<strong>Tip for Mobile:</strong> Press &amp; hold the image below and tap <strong>"Copy"</strong> to paste directly into Telegram chat!`;
  }

  // Revoke previous URLs
  activeModalBlobUrls.forEach((url) => URL.revokeObjectURL(url));
  activeModalBlobUrls = [];

  previewWrap.innerHTML = "";

  items.forEach((item, index) => {
    const blobUrl = URL.createObjectURL(item.blob);
    activeModalBlobUrls.push(blobUrl);

    const cardContainer = document.createElement("div");
    cardContainer.className = "separate-modal-item";

    const header = document.createElement("div");
    header.className = "separate-modal-item-header";
    header.innerHTML = `
      <span class="separate-item-badge">#${index + 1}</span>
      <span class="separate-item-title">${escapeHtml(item.name || `Panel ${index + 1}`)}</span>
      <div class="separate-item-actions">
        <button type="button" class="separate-item-btn copy-single-btn" title="Copy this panel image to clipboard">📋 Copy</button>
        <button type="button" class="separate-item-btn download-single-btn" title="Download this image">📥 Download</button>
      </div>
    `;

    header.querySelector(".copy-single-btn")?.addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      try {
        if (navigator.clipboard && typeof window.ClipboardItem !== "undefined") {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": item.blob })]);
          showToast(`✓ Copied "${item.name}" to clipboard!`, "success", 3000);
          btn.textContent = "✓ Copied";
          setTimeout(() => { btn.textContent = "📋 Copy"; btn.disabled = false; }, 2000);
        } else {
          showToast("Clipboard write not supported in this browser.", "info", 3000);
          btn.disabled = false;
        }
      } catch (err) {
        showToast(`Could not copy: ${err.message}`, "error", 3000);
        btn.disabled = false;
      }
    });

    header.querySelector(".download-single-btn")?.addEventListener("click", () => {
      downloadBlob(item.blob, item.fileName);
    });

    cardContainer.appendChild(header);

    const img = document.createElement("img");
    img.className = "mobile-preview-img";
    img.src = blobUrl;
    img.alt = item.name || "Perfume preview";
    if (index === 0) img.id = "mobilePreviewImg";
    cardContainer.appendChild(img);

    previewWrap.appendChild(cardContainer);
  });

  if (shareBtn) {
    shareBtn.innerHTML = items.length > 1
      ? `<span>✈️ Share All (${items.length}) to Telegram</span>`
      : `<span>✈️ Share to Telegram</span>`;
    shareBtn.onclick = async () => {
      const files = items.map((it) => new File([it.blob], it.fileName, { type: "image/png" }));
      if (navigator.canShare && navigator.canShare({ files })) {
        try {
          await navigator.share({
            files,
            title: "PKA SCENT Fragrance Collection",
            text: `Selected ${items.length} perfume panel${items.length > 1 ? "s" : ""}`,
          });
          modal.close();
        } catch (_) {}
      } else {
        const contactUrl = formatTelegramContactUrl(currentSettings.telegramContact || "+85510666813");
        window.open(contactUrl, "_blank");
      }
    };
  }

  if (downloadBtn) {
    downloadBtn.innerHTML = items.length > 1
      ? `<span>📥 Download All (${items.length})</span>`
      : `<span>📥 Download Image</span>`;
    downloadBtn.onclick = () => {
      if (items.length === 1) {
        downloadBlob(items[0].blob, items[0].fileName);
        showToast("✓ Image downloaded to your device.", "info", 3500);
      } else {
        items.forEach((item, idx) => {
          setTimeout(() => {
            downloadBlob(item.blob, item.fileName);
          }, idx * 220);
        });
        showToast(`✓ Downloading ${items.length} separate perfume images.`, "info", 4000);
      }
    };
  }

  if (closeBtn) closeBtn.onclick = () => modal.close();

  modal.showModal();
}

const clientDataUrlCache = new Map();

function extractLoadedImageDataUrl(img) {
  if (!img || !img.complete || !img.naturalWidth) return null;
  const rawSrc = img.dataset.rawSrc || img.getAttribute("src") || "";
  if (clientDataUrlCache.has(rawSrc)) {
    return clientDataUrlCache.get(rawSrc);
  }
  if (img.src && img.src.startsWith("data:")) {
    clientDataUrlCache.set(rawSrc, img.src);
    return img.src;
  }
  try {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    if (dataUrl && dataUrl.length > 64) {
      if (rawSrc) clientDataUrlCache.set(rawSrc, dataUrl);
      return dataUrl;
    }
  } catch (_) {
    // Cross-origin tainted canvas; will fetch via proxy
  }
  return null;
}

async function fetchImageAsDataUrl(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("data:")) return trimmed;
  if (clientDataUrlCache.has(trimmed)) return clientDataUrlCache.get(trimmed);

  let targetUrl = trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    targetUrl = `/api/proxy-image?url=${encodeURIComponent(trimmed)}&responseType=text`;
  } else if (trimmed.startsWith("/api/proxy-image") && !trimmed.includes("responseType=text")) {
    targetUrl = trimmed + (trimmed.includes("?") ? "&" : "?") + "responseType=text";
  }

  try {
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let dataUrl = "";
    if (targetUrl.includes("responseType=text")) {
      dataUrl = await res.text();
    } else {
      const blob = await res.blob();
      dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    if (dataUrl && dataUrl.startsWith("data:")) {
      clientDataUrlCache.set(trimmed, dataUrl);
      return dataUrl;
    }
  } catch (err) {
    console.warn("Could not inline image as data URL:", trimmed, err);
  }
  return null;
}

async function generateSingleCardBlob(cardElement) {
  if (!cardElement) {
    throw new Error("No perfume panel provided.");
  }

  if (typeof html2canvas !== "function") {
    throw new Error("html2canvas library is not loaded. Please refresh the page.");
  }

  // Create an off-screen capture container for the single card
  const wrapper = document.createElement("div");
  wrapper.className = "fragrance-single-capture-wrapper";
  wrapper.style.position = "fixed";
  wrapper.style.left = "-9999px";
  wrapper.style.top = "0";
  wrapper.style.width = `${Math.min(960, Math.max(780, cardElement.offsetWidth || 840))}px`;
  wrapper.style.background = "#ffffff";
  wrapper.style.padding = "0px";
  wrapper.style.boxSizing = "border-box";

  const clone = cardElement.cloneNode(true);
  clone.classList.remove("is-selected", "is-holding");
  clone.querySelectorAll(".card-hold-overlay, .card-select-checkbox, .card-actions").forEach((el) => el.remove());
  clone.style.margin = "0";
  clone.style.boxShadow = "none";
  wrapper.appendChild(clone);

  document.body.appendChild(wrapper);

  try {
    const originalImgs = [...cardElement.querySelectorAll("img")];
    const cloneImgs = [...wrapper.querySelectorAll("img")];

    // Pre-extract data URLs from already loaded live DOM images or fetch concurrently
    await Promise.all(
      cloneImgs.map(async (img, idx) => {
        img.removeAttribute("loading");
        img.loading = "eager";
        const origImg = originalImgs[idx];
        const rawSrc = img.dataset.rawSrc || img.getAttribute("src") || "";

        let dataUrl = origImg ? extractLoadedImageDataUrl(origImg) : null;
        if (!dataUrl && rawSrc && !rawSrc.startsWith("data:")) {
          dataUrl = await fetchImageAsDataUrl(rawSrc);
        }

        if (dataUrl) {
          img.src = dataUrl;
        }
      })
    );

    // Ensure all images are fully loaded with fast timeout
    await Promise.all(
      cloneImgs.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          setTimeout(resolve, 1200);
        });
      })
    );

    // Yield minimal layout settling tick
    await new Promise((r) => setTimeout(r, 20));

    const canvas = await html2canvas(wrapper, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      imageTimeout: 5000,
      removeContainer: true,
    });

    const dataUrl = canvas.toDataURL("image/png");
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (blob) {
      blob.dataUrl = dataUrl;
    }
    return blob;
  } finally {
    if (wrapper.parentNode) {
      document.body.removeChild(wrapper);
    }
  }
}

function blobToDataUrl(blob) {
  if (blob?.dataUrl) return Promise.resolve(blob.dataUrl);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function generateSelectedCardsBlobs(cardElements, onProgress = null) {
  if (!cardElements || !cardElements.length) {
    throw new Error("No perfume panels selected.");
  }
  const total = cardElements.length;
  let finished = 0;

  // Process cards concurrently for 3x - 5x performance boost
  const results = await Promise.all(
    cardElements.map(async (card, i) => {
      const name = card.dataset.productName || card.querySelector(".product-name")?.textContent?.trim() || `Perfume ${i + 1}`;
      const sanitizedName = name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
      const fileName = `${sanitizedName || "perfume"}-${Date.now()}-${i + 1}.png`;
      const blob = await generateSingleCardBlob(card);
      finished++;
      if (typeof onProgress === "function") {
        onProgress(finished, total, name);
      }
      if (blob) {
        const dataUrl = blob.dataUrl || null;
        return { blob, dataUrl, fileName, name, card, index: i };
      }
      return null;
    })
  );

  return results.filter(Boolean).sort((a, b) => a.index - b.index);
}

async function generateSelectedCardsBlob(cardElements) {
  const items = await generateSelectedCardsBlobs(cardElements);
  return items[0]?.blob || null;
}

async function copySelectedCardsAsImage() {
  const cardElements = [...document.querySelectorAll(".fragrance-card")].filter((card) => {
    const key = card.dataset.productId || card.dataset.productName;
    return selectedCards.has(key) || card.classList.contains("is-selected");
  });

  if (!cardElements.length) {
    showToast("Please click & hold any perfume panel to select first.", "info");
    return;
  }

  const count = cardElements.length;
  const copyBtn = document.querySelector("#copySelectedImgBtn");
  if (copyBtn) copyBtn.disabled = true;

  // 1. Prepare Safari Promise-based ClipboardItem SYNCHRONOUSLY before any async operations
  let resolveBlob, rejectBlob;
  const blobPromise = new Promise((resolve, reject) => {
    resolveBlob = resolve;
    rejectBlob = reject;
  });

  let safariClipboardPromise = null;
  if (navigator.clipboard && typeof window.ClipboardItem !== "undefined") {
    try {
      const item = new ClipboardItem({ "image/png": blobPromise });
      safariClipboardPromise = navigator.clipboard.write([item]);
    } catch (err) {
      console.warn("Synchronous ClipboardItem creation failed (non-Safari browser):", err);
    }
  }

  const startTime = performance.now();
  const loadingToast = showToast(
    `⚡ Rendering ${count} separate perfume ${count > 1 ? "images in parallel" : "image"}...`,
    "loading",
    30000
  );

  try {
    const renderedItems = await generateSelectedCardsBlobs(cardElements, (done, total) => {
      loadingToast?.update?.(
        `⚡ Rendering perfume ${done} of ${total} (${Math.round((done / total) * 100)}%)...`
      );
    });
    if (!renderedItems.length) throw new Error("Could not create perfume panel images.");

    // Convert any missing data URLs instantly
    await Promise.all(
      renderedItems.map(async (item) => {
        if (!item.dataUrl) {
          item.dataUrl = await blobToDataUrl(item.blob);
        }
      })
    );

    const elapsedSeconds = ((performance.now() - startTime) / 1000).toFixed(1);
    loadingToast?.update?.(`⚡ Rendered in ${elapsedSeconds}s! Copying to clipboard...`);

    const primaryItem = renderedItems[0];
    resolveBlob(primaryItem.blob); // Resolves the Promise for Safari with 1st unmerged panel image

    let copiedToClipboard = false;

    // 1. Tell backend to set native Windows FileDropList (CF_HDROP) on the system clipboard
    // This allows Telegram Desktop to paste all images simultaneously with the "X images selected / Group items" dialog!
    try {
      const serverRes = await fetch("/api/copy-images-to-clipboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: renderedItems.map((item) => ({
            name: item.fileName,
            dataUrl: item.dataUrl,
          })),
        }),
      });
      if (serverRes.ok) {
        const json = await serverRes.json();
        if (json.clipboardSet) {
          copiedToClipboard = true;
        }
      }
    } catch (serverErr) {
      console.warn("Backend clipboard bridge unavailable, falling back to browser API:", serverErr);
    }

    // 2. Web browser fallback: WebKit / Safari multi-item write
    if (count > 1) {
      try {
        const multiItems = renderedItems.map(
          (item) =>
            new ClipboardItem({
              "image/png": item.blob,
              "text/html": new Blob([`<img src="${item.dataUrl}" alt="${escapeHtml(item.name)}" />`], { type: "text/html" }),
            })
        );
        await navigator.clipboard.write(multiItems);
        copiedToClipboard = true;
      } catch (_) {
        // Chromium throws "Support for multiple ClipboardItems is not implemented"
      }
    }

    // 3. Web browser fallback: write active unmerged item (PNG + rich HTML with separate <img> tags)
    if (navigator.clipboard && typeof window.ClipboardItem !== "undefined") {
      const allHtmlImages = renderedItems
        .map((item) => `<div class="perfume-panel" style="margin-bottom:20px;"><img src="${item.dataUrl}" alt="${escapeHtml(item.name)}" /></div>`)
        .join("\n");
      const htmlBlob = new Blob([`<!DOCTYPE html><html><body>${allHtmlImages}</body></html>`], { type: "text/html" });

      try {
        const item = new ClipboardItem({
          "text/html": htmlBlob,
          "image/png": primaryItem.blob, // Single unmerged image!
        });
        await navigator.clipboard.write([item]);
        copiedToClipboard = true;
      } catch (errHtmlPng) {
        try {
          const item = new ClipboardItem({ "image/png": primaryItem.blob });
          await navigator.clipboard.write([item]);
          copiedToClipboard = true;
        } catch (_) {}
      }
    }

    // 4. Check Safari synchronous promise
    if (!copiedToClipboard && safariClipboardPromise) {
      try {
        await safariClipboardPromise;
        copiedToClipboard = true;
      } catch (safariErr) {
        console.warn("Safari promise clipboard write failed:", safariErr);
      }
    }

    loadingToast?.dismiss();

    if (copiedToClipboard) {
      const toastMsg =
        count > 1
          ? `<div class="toast-rich-body">
              <div class="toast-header-row">
                <span class="toast-badge-success">✓ Copied ${count} Separate Images in ${elapsedSeconds}s</span>
              </div>
              <div class="toast-msg">
                ${count} perfume panels copied to clipboard! Paste directly into Telegram (Ctrl+V) ✈️
              </div>
            </div>`
          : `<div class="toast-rich-body">
              <div class="toast-header-row">
                <span class="toast-badge-success">✓ Copied to Clipboard in ${elapsedSeconds}s</span>
              </div>
              <div class="toast-msg">Perfume panel copied! Paste directly into Telegram (Ctrl+V) ✈️</div>
            </div>`;

      showToast(toastMsg, "success", 5000);
    } else {
      showToast("Could not copy directly to clipboard. Please check browser clipboard permissions.", "error", 5000);
    }

    // Card flash animation
    cardElements.forEach((card) => {
      card.classList.add("card-copied-flash");
      setTimeout(() => card.classList.remove("card-copied-flash"), 1200);
    });
  } catch (error) {
    rejectBlob?.(error);
    loadingToast?.dismiss();
    showToast(`Failed to copy image: ${error.message}`, "error", 4000);
  } finally {
    if (copyBtn) copyBtn.disabled = false;
  }
}

let holdCardTimer = null;
let currentHoldCard = null;
let holdStartX = 0;
let holdStartY = 0;
let isHoldingActivated = false;

function cancelHold() {
  if (holdCardTimer) {
    clearTimeout(holdCardTimer);
    holdCardTimer = null;
  }
  if (currentHoldCard) {
    currentHoldCard.classList.remove("is-holding");
    currentHoldCard = null;
  }
}

function initHoldToCopyListeners() {
  if (!productGallery) return;

  // Bottom right floating bar actions
  const copySelectedImgBtn = document.querySelector("#copySelectedImgBtn");
  const clearSelectionBtn = document.querySelector("#clearSelectionBtn");

  copySelectedImgBtn?.addEventListener("click", copySelectedCardsAsImage);
  clearSelectionBtn?.addEventListener("click", clearCardSelection);

  // Click on card checkbox or card in selection mode
  productGallery.addEventListener("click", (e) => {
    // If an action button (edit, delete, link) was clicked, do not select
    if (e.target.closest("button[data-action='edit'], button[data-action='delete'], a")) return;

    const checkbox = e.target.closest(".card-select-checkbox");
    const card = e.target.closest(".fragrance-card");

    if (checkbox && card) {
      e.preventDefault();
      e.stopPropagation();
      toggleCardSelection(card);
      return;
    }

    // If selection mode is active (at least 1 card selected), clicking anywhere on a card toggles it
    if (selectedCards.size > 0 && card && !isHoldingActivated) {
      toggleCardSelection(card);
    }
    isHoldingActivated = false;
  });

  // Hold-to-select pointer / touch events
  const handleHoldStart = (e) => {
    if (e.target.closest("button, a, input, select, textarea")) return;
    const card = e.target.closest(".fragrance-card");
    if (!card) return;

    cancelHold();
    currentHoldCard = card;
    const point = e.touches ? e.touches[0] : e;
    holdStartX = point.clientX;
    holdStartY = point.clientY;
    isHoldingActivated = false;

    card.classList.add("is-holding");

    holdCardTimer = setTimeout(() => {
      if (currentHoldCard === card) {
        isHoldingActivated = true;
        try { navigator.vibrate?.([40]); } catch (_) {}
        toggleCardSelection(card);
        cancelHold();
      }
    }, 420);
  };

  const handleHoldMove = (e) => {
    if (!currentHoldCard) return;
    const point = e.touches ? e.touches[0] : e;
    const dx = Math.abs(point.clientX - holdStartX);
    const dy = Math.abs(point.clientY - holdStartY);
    if (dx > 10 || dy > 10) {
      cancelHold();
    }
  };

  productGallery.addEventListener("mousedown", handleHoldStart);
  productGallery.addEventListener("touchstart", handleHoldStart, { passive: true });

  window.addEventListener("mousemove", handleHoldMove);
  window.addEventListener("touchmove", handleHoldMove, { passive: true });

  window.addEventListener("mouseup", cancelHold);
  window.addEventListener("touchend", cancelHold);
  window.addEventListener("touchcancel", cancelHold);
}


async function copyProductsJson() {
  try {
    await navigator.clipboard.writeText(JSON.stringify(products, null, 2));
    setStatus("JSON copied to clipboard");
  } catch (_) {
    setStatus("Clipboard is unavailable in this browser.", "error");
  }
}

function downloadProductsJson() {
  const blob = new Blob([JSON.stringify(products, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${sourceInput.value}-products.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  setStatus("JSON download started");
}

form.addEventListener("submit", runScrape);
filterInput.addEventListener("input", renderTable);
filterMen?.addEventListener("change", renderTable);
filterWomen?.addEventListener("change", renderTable);
filterUnisex?.addEventListener("change", renderTable);
sortSelect?.addEventListener("change", (e) => {
  try { localStorage.setItem("pka_product_sort", e.target.value); } catch (_) {}
  renderTable();
});
resultsHead?.addEventListener("click", (e) => {
  const th = e.target.closest("#thBrand");
  if (!th || !sortSelect) return;
  sortSelect.value = sortSelect.value === "brand-asc" ? "brand-desc" : "brand-asc";
  try { localStorage.setItem("pka_product_sort", sortSelect.value); } catch (_) {}
  renderTable();
});
copyJson?.addEventListener("click", copyProductsJson);
downloadJson?.addEventListener("click", downloadProductsJson);
catalogueView?.addEventListener("click", () => {
  resultsView = "catalogue";
  updateResultsView();
  closeSidebar();
});
tableView?.addEventListener("click", () => {
  resultsView = "table";
  updateResultsView();
  closeSidebar();
});
viewFrontendBtn?.addEventListener("click", () => {
  closeSidebar();
  if (window.location.pathname.startsWith("/admin")) {
    window.location.href = "/";
  } else {
    setAppMode("frontend");
  }
});
viewBackendBtn?.addEventListener("click", () => {
  closeSidebar();
  if (!window.location.pathname.startsWith("/admin")) {
    window.location.href = "/admin";
  } else {
    setAppMode("backend");
  }
});
addProductBtn?.addEventListener("click", () => {
  closeSidebar();
  openAddProduct();
});

sidebarToggleBtn?.addEventListener("click", toggleSidebar);
sidebarCloseBtn?.addEventListener("click", closeSidebar);
sidebarBackdrop?.addEventListener("click", closeSidebar);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("sidebar-open")) {
    closeSidebar();
  }
});

window.addEventListener("hashchange", () => {
  if (window.location.hash === "#frontend" || window.location.hash === "#storefront") {
    setAppMode("frontend");
  } else if (window.location.hash === "#backend" || window.location.hash === "#admin") {
    setAppMode("backend");
  }
});

document.querySelector(".results-section").addEventListener("error", (event) => {
  if (event.target.tagName !== "IMG") return;
  const frame = event.target.closest(".image-frame");
  if (!frame) return;
  event.target.hidden = true;
  frame.querySelector(".image-fallback").hidden = false;
}, true);

sourceInput.addEventListener("change", () => {
  updateSourceView();
  filterInput.value = "";
  if (filterMen) filterMen.checked = false;
  if (filterWomen) filterWomen.checked = false;
  if (filterUnisex) filterUnisex.checked = false;
  setProducts([], "Loading saved output");
  loadSavedProducts();
});

targetUrl.addEventListener("input", () => {
  try {
    const hostname = new URL(targetUrl.value.trim().split(/\r?\n/)[0]).hostname;
    const source = ["fragrantica.com", "www.fragrantica.com"].includes(hostname)
      ? "fragrantica" : /(^|\.)foodpanda\./.test(hostname) ? "foodpanda" : null;
    if (source && sourceInput.value !== source) {
      sourceInput.value = source;
      sourceInput.dispatchEvent(new Event("change"));
    }
  } catch (_) {}
});

if (sourceInput) sourceInput.value = "fragrantica";
updateSourceView();
setAppMode(currentMode);
loadSavedSettings();
try {
  const savedSort = localStorage.getItem("pka_product_sort");
  if (savedSort && sortSelect) sortSelect.value = savedSort;
} catch (_) {}
loadSavedProducts();
loadTags();
initHoldToCopyListeners();

function isImageUrl(val) {
  if (!val || typeof val !== "string") return false;
  return /^(https?:\/\/|\/|data:image\/)/i.test(val.trim());
}

function renderCrestContent(container, logoValue) {
  if (!container) return;
  const val = (logoValue || "").trim();
  if (isImageUrl(val)) {
    container.innerHTML = `<img src="${escapeHtml(val)}" alt="Logo" class="crest-img" onerror="this.onerror=null;this.replaceWith(document.createTextNode('⚜️'));" />`;
  } else {
    container.innerHTML = `<span class="crest-symbol">${escapeHtml(val || "⚜️")}</span>`;
  }
}

function updateLogoPreview(val) {
  renderCrestContent(logoPreviewCrest, val);
}

function applySettings(settings) {
  if (!settings) return;
  currentSettings = {
    projectName: String(settings.projectName || DEFAULT_SETTINGS.projectName).trim(),
    subtitle: String(settings.subtitle !== undefined ? settings.subtitle : DEFAULT_SETTINGS.subtitle).trim(),
    logo: String(settings.logo || DEFAULT_SETTINGS.logo).trim(),
    footTag: String(settings.footTag || DEFAULT_SETTINGS.footTag).trim(),
    heroSubheading: String(settings.heroSubheading !== undefined ? settings.heroSubheading : DEFAULT_SETTINGS.heroSubheading).trim(),
    heroTitle: String(settings.heroTitle !== undefined ? settings.heroTitle : DEFAULT_SETTINGS.heroTitle).trim(),
    heroText: String(settings.heroText !== undefined ? settings.heroText : DEFAULT_SETTINGS.heroText).trim(),
    heroBackground: String(settings.heroBackground !== undefined ? settings.heroBackground : DEFAULT_SETTINGS.heroBackground).trim(),
    defaultWebsite: settings.defaultWebsite === "foodpanda" ? "foodpanda" : "fragrantica",
    telegramBotToken: String(settings.telegramBotToken || DEFAULT_SETTINGS.telegramBotToken).trim(),
    telegramBotUsername: String(settings.telegramBotUsername || DEFAULT_SETTINGS.telegramBotUsername).trim(),
    telegramChatId: String(settings.telegramContact || settings.telegramChatId || DEFAULT_SETTINGS.telegramContact).trim(),
    telegramBotEnabled: settings.telegramBotEnabled === "false" || settings.telegramBotEnabled === false ? "false" : "true",
    telegramContact: String(settings.telegramContact || settings.telegramChatId || DEFAULT_SETTINGS.telegramContact).trim(),
    telegramContactEnabled: settings.telegramContactEnabled === "false" || settings.telegramContactEnabled === false ? "false" : "true",
    telegramContactText: String(settings.telegramContactText || DEFAULT_SETTINGS.telegramContactText).trim(),
  };

  renderCrestContent(brandCrest, currentSettings.logo);
  renderCrestContent(footerCrest, currentSettings.logo);
  renderCrestContent(loginModuleCrest, currentSettings.logo);

  if (brandTitle) brandTitle.textContent = currentSettings.projectName;
  document.title = `${currentSettings.projectName} | Luxury Fragrance Scraper & Collection`;
  if (viewFrontendText) viewFrontendText.textContent = `Frontend (${currentSettings.projectName})`;
  if (footerProjectName) footerProjectName.textContent = currentSettings.projectName;

  if (heroSubheadingEl) {
    heroSubheadingEl.textContent = currentSettings.heroSubheading || `HAUTE PARFUMERIE • ${currentSettings.projectName.toUpperCase()}`;
  }
  if (heroTitleEl) {
    heroTitleEl.textContent = currentSettings.heroTitle || DEFAULT_SETTINGS.heroTitle;
  }
  if (heroTextEl) {
    heroTextEl.textContent = currentSettings.heroText || DEFAULT_SETTINGS.heroText;
  }
  if (storefrontHero) {
    const bgUrl = currentSettings.heroBackground || DEFAULT_SETTINGS.heroBackground || "/header-bg.png";
    storefrontHero.style.backgroundImage = `linear-gradient(90deg, rgba(20, 5, 16, 0.90) 0%, rgba(20, 5, 16, 0.76) 52%, rgba(15, 4, 12, 0.52) 100%), url('${bgUrl}')`;
  }

  if (footerTag) footerTag.textContent = currentSettings.footTag;

  if (topbarEyebrow && (currentMode === "frontend" || !document.body.classList.contains("mode-backend"))) {
    topbarEyebrow.textContent = currentSettings.subtitle || DEFAULT_SETTINGS.subtitle;
  }

  if (settingProjectName) settingProjectName.value = currentSettings.projectName;
  if (settingSubtitle) settingSubtitle.value = currentSettings.subtitle || DEFAULT_SETTINGS.subtitle;
  if (settingLogo) settingLogo.value = currentSettings.logo;
  if (settingFootTag) settingFootTag.value = currentSettings.footTag;
  if (settingHeroSubheading) settingHeroSubheading.value = currentSettings.heroSubheading || DEFAULT_SETTINGS.heroSubheading;
  if (settingHeroTitle) settingHeroTitle.value = currentSettings.heroTitle || DEFAULT_SETTINGS.heroTitle;
  if (settingHeroText) settingHeroText.value = currentSettings.heroText || DEFAULT_SETTINGS.heroText;
  if (settingHeroBackground) settingHeroBackground.value = currentSettings.heroBackground || DEFAULT_SETTINGS.heroBackground;

  if (settingDefaultWebsite) settingDefaultWebsite.value = currentSettings.defaultWebsite;
  if (settingTelegramBotToken) settingTelegramBotToken.value = currentSettings.telegramBotToken;
  if (settingTelegramBotUsername) settingTelegramBotUsername.value = currentSettings.telegramBotUsername;
  if (settingTelegramChatId) settingTelegramChatId.value = currentSettings.telegramChatId;
  if (settingTelegramBotEnabled) settingTelegramBotEnabled.checked = currentSettings.telegramBotEnabled !== "false";
  if (settingTelegramContact) settingTelegramContact.value = currentSettings.telegramContact;
  if (settingTelegramContactEnabled) settingTelegramContactEnabled.checked = currentSettings.telegramContactEnabled !== "false";
  if (settingTelegramContactText) settingTelegramContactText.value = currentSettings.telegramContactText;
  updateTelegramBotUI();
  updateTelegramContactUI();
  updateTelegramContactWidget();

  if (sourceInput && sourceInput.value !== currentSettings.defaultWebsite) {
    sourceInput.value = currentSettings.defaultWebsite;
    updateSourceView();
  }
  updateLogoPreview(currentSettings.logo);
  updateHeroPreview();
}

async function loadSavedSettings() {
  try {
    const cached = localStorage.getItem("pka_settings");
    if (cached) {
      applySettings(JSON.parse(cached));
    }
  } catch (_) {}

  try {
    const response = await fetch("/api/settings");
    if (response.ok) {
      const data = await response.json();
      if (data && data.settings) {
        applySettings(data.settings);
        try { localStorage.setItem("pka_settings", JSON.stringify(data.settings)); } catch (_) {}
      }
    }
  } catch (_) {}
}

function updateHeroPreview() {
  const sub = settingHeroSubheading?.value.trim() || currentSettings.heroSubheading || DEFAULT_SETTINGS.heroSubheading;
  const title = settingHeroTitle?.value.trim() || currentSettings.heroTitle || DEFAULT_SETTINGS.heroTitle;
  const text = settingHeroText?.value.trim() || currentSettings.heroText || DEFAULT_SETTINGS.heroText;
  const bg = settingHeroBackground?.value.trim() || currentSettings.heroBackground || DEFAULT_SETTINGS.heroBackground;

  if (previewHeroSubheading) previewHeroSubheading.textContent = sub;
  if (previewHeroTitle) previewHeroTitle.textContent = title;
  if (previewHeroText) previewHeroText.textContent = text;
  if (heroLivePreview) {
    heroLivePreview.style.backgroundImage = `linear-gradient(90deg, rgba(20, 5, 16, 0.90) 0%, rgba(20, 5, 16, 0.76) 52%, rgba(15, 4, 12, 0.52) 100%), url('${bg}')`;
  }
}

function openWebsiteBioModal() {
  if (!websiteBioDialog) return;
  if (settingProjectName) settingProjectName.value = currentSettings.projectName;
  if (settingSubtitle) settingSubtitle.value = currentSettings.subtitle || DEFAULT_SETTINGS.subtitle;
  if (settingLogo) settingLogo.value = currentSettings.logo;
  if (settingFootTag) settingFootTag.value = currentSettings.footTag;

  if (settingHeroSubheading) settingHeroSubheading.value = currentSettings.heroSubheading || DEFAULT_SETTINGS.heroSubheading;
  if (settingHeroTitle) settingHeroTitle.value = currentSettings.heroTitle || DEFAULT_SETTINGS.heroTitle;
  if (settingHeroText) settingHeroText.value = currentSettings.heroText || DEFAULT_SETTINGS.heroText;
  if (settingHeroBackground) settingHeroBackground.value = currentSettings.heroBackground || DEFAULT_SETTINGS.heroBackground;

  updateLogoPreview(currentSettings.logo);
  updateHeroPreview();

  if (currentSettings.logo && (currentSettings.logo.startsWith("/uploads/") || currentSettings.logo.startsWith("data:image/"))) {
    if (logoUploadInfo) {
      logoUploadInfo.hidden = false;
      const displayFilename = currentSettings.logo.startsWith("/uploads/")
        ? currentSettings.logo.split("/").pop()
        : "Custom image file";
      if (logoUploadName) logoUploadName.textContent = `${displayFilename} (Active)`;
    }
  } else {
    if (logoUploadInfo) logoUploadInfo.hidden = true;
  }

  if (currentSettings.heroBackground && currentSettings.heroBackground.startsWith("/uploads/")) {
    if (heroBgUploadInfo) {
      heroBgUploadInfo.hidden = false;
      const displayFilename = currentSettings.heroBackground.split("/").pop();
      if (heroBgUploadName) heroBgUploadName.textContent = `${displayFilename} (Active)`;
    }
  } else {
    if (heroBgUploadInfo) heroBgUploadInfo.hidden = true;
  }

  if (websiteBioStatusMsg) {
    websiteBioStatusMsg.hidden = true;
    websiteBioStatusMsg.textContent = "";
    websiteBioStatusMsg.className = "settings-status-msg";
  }
  websiteBioDialog.showModal();
}

function closeWebsiteBioModal() {
  if (websiteBioDialog && websiteBioDialog.open) websiteBioDialog.close();
}

websiteBioBtn?.addEventListener("click", () => {
  closeSidebar();
  openWebsiteBioModal();
});
closeWebsiteBioBtn?.addEventListener("click", closeWebsiteBioModal);
cancelWebsiteBioBtn?.addEventListener("click", closeWebsiteBioModal);

function openSettingsModal() {
  if (!settingsDialog) return;
  if (settingDefaultWebsite) settingDefaultWebsite.value = currentSettings.defaultWebsite;
  if (settingTelegramBotToken) settingTelegramBotToken.value = currentSettings.telegramBotToken;
  if (settingTelegramBotUsername) settingTelegramBotUsername.value = currentSettings.telegramBotUsername;
  if (settingTelegramChatId) settingTelegramChatId.value = currentSettings.telegramContact || currentSettings.telegramChatId || "+85510666813";
  if (settingTelegramBotEnabled) settingTelegramBotEnabled.checked = currentSettings.telegramBotEnabled !== "false";
  if (settingTelegramContact) settingTelegramContact.value = currentSettings.telegramContact || currentSettings.telegramChatId || "+85510666813";
  if (settingTelegramContactEnabled) settingTelegramContactEnabled.checked = currentSettings.telegramContactEnabled !== "false";
  if (settingTelegramContactText) settingTelegramContactText.value = currentSettings.telegramContactText;
  updateTelegramBotUI();
  updateTelegramContactUI();
  updateTelegramContactWidget();
  if (telegramFeedbackMsg) telegramFeedbackMsg.hidden = true;

  if (settingsStatusMsg) {
    settingsStatusMsg.hidden = true;
    settingsStatusMsg.textContent = "";
    settingsStatusMsg.className = "settings-status-msg";
  }
  settingsDialog.showModal();
}

function closeSettingsModal() {
  if (settingsDialog && settingsDialog.open) settingsDialog.close();
}

openSettingsBtn?.addEventListener("click", () => {
  closeSidebar();
  openSettingsModal();
});
adminSettingsBtn?.addEventListener("click", () => {
  closeSidebar();
  openSettingsModal();
});
closeSettingsBtn?.addEventListener("click", closeSettingsModal);
cancelSettingsBtn?.addEventListener("click", closeSettingsModal);

settingLogo?.addEventListener("input", (e) => {
  const val = e.target.value.trim();
  updateLogoPreview(val);
  if (!val.startsWith("/uploads/") && !val.startsWith("data:image/")) {
    if (logoUploadInfo) logoUploadInfo.hidden = true;
    if (logoFileInput) logoFileInput.value = "";
  }
});

function compressImageThumbnail(imgElement, maxDim = 64) {
  try {
    const canvas = document.createElement("canvas");
    let w = imgElement.naturalWidth || imgElement.width || maxDim;
    let h = imgElement.naturalHeight || imgElement.height || maxDim;
    if (w > h) {
      if (w > maxDim) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      }
    } else {
      if (h > maxDim) {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }
    canvas.width = Math.max(1, w);
    canvas.height = Math.max(1, h);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.65);
  } catch (_) {
    return "";
  }
}

async function handleLogoFile(file) {
  if (!file) return;

  const isImage = file.type?.startsWith("image/") || /\.(png|jpe?g|webp|svg|gif|ico)$/i.test(file.name);
  if (!isImage) {
    if (settingsStatusMsg) {
      settingsStatusMsg.textContent = "Please select a valid image file (PNG, JPG, SVG, WebP, GIF, or ICO).";
      settingsStatusMsg.className = "settings-status-msg error";
      settingsStatusMsg.hidden = false;
    }
    return;
  }

  if (settingsStatusMsg) {
    settingsStatusMsg.hidden = true;
    settingsStatusMsg.textContent = "";
  }

  if (logoUploadInfo) {
    logoUploadInfo.hidden = false;
    if (logoUploadName) logoUploadName.textContent = `Uploading ${file.name}...`;
  }

  const reader = new FileReader();
  reader.onerror = () => {
    if (logoUploadInfo) logoUploadInfo.hidden = true;
    if (settingsStatusMsg) {
      settingsStatusMsg.textContent = "Could not read the selected image file.";
      settingsStatusMsg.className = "settings-status-msg error";
      settingsStatusMsg.hidden = false;
    }
  };

  reader.onload = async (e) => {
    const dataUrl = e.target.result;
    updateLogoPreview(dataUrl);

    try {
      const response = await fetch("/api/upload-logo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: file.name, data: dataUrl }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result && result.url) {
        if (settingLogo) {
          settingLogo.value = result.url;
          settingLogo.dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (logoUploadName) logoUploadName.textContent = `${file.name} (Uploaded)`;
        updateLogoPreview(result.url);
        if (settingsStatusMsg) {
          settingsStatusMsg.textContent = "✓ Logo uploaded to server. Click 'Save Settings' to apply.";
          settingsStatusMsg.className = "settings-status-msg success";
          settingsStatusMsg.hidden = false;
        }
        return;
      }

      throw new Error(result.error || `Upload endpoint returned status ${response.status}`);
    } catch (err) {
      console.warn("Server logo upload failed:", err);

      const isSvg = file.type?.includes("svg") || file.name?.toLowerCase().endsWith(".svg");
      if (isSvg && dataUrl.length <= 1900) {
        if (settingLogo) {
          settingLogo.value = dataUrl;
          settingLogo.dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (logoUploadName) logoUploadName.textContent = `${file.name} (SVG)`;
        if (settingsStatusMsg) {
          settingsStatusMsg.textContent = "Logo loaded as SVG. Click 'Save Settings' to apply.";
          settingsStatusMsg.className = "settings-status-msg success";
          settingsStatusMsg.hidden = false;
        }
        return;
      }

      const img = new Image();
      img.onload = () => {
        const compactDataUrl = compressImageThumbnail(img, 64) || dataUrl;
        if (settingLogo) {
          settingLogo.value = compactDataUrl;
          settingLogo.dispatchEvent(new Event("input", { bubbles: true }));
        }
        updateLogoPreview(compactDataUrl);
        if (logoUploadName) logoUploadName.textContent = `${file.name} (Compact)`;
        if (settingsStatusMsg) {
          if (compactDataUrl.length <= 2000) {
            settingsStatusMsg.textContent = "Logo prepared as compact thumbnail. Click 'Save Settings' to apply. (Restart server to store full-res files in /uploads/)";
            settingsStatusMsg.className = "settings-status-msg success";
          } else {
            settingsStatusMsg.textContent = "Image is too large. Please restart the Node server so /uploads/ storage is active.";
            settingsStatusMsg.className = "settings-status-msg error";
          }
          settingsStatusMsg.hidden = false;
        }
      };
      img.onerror = () => {
        if (settingLogo) {
          settingLogo.value = dataUrl.length <= 2000 ? dataUrl : "⚜️";
          settingLogo.dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (settingsStatusMsg) {
          settingsStatusMsg.textContent = "Could not process image thumbnail. Please ensure server is running.";
          settingsStatusMsg.className = "settings-status-msg error";
          settingsStatusMsg.hidden = false;
        }
      };
      img.src = dataUrl;
    }
  };

  reader.readAsDataURL(file);
}

logoDropzone?.addEventListener("click", () => {
  logoFileInput?.click();
});

logoDropzone?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    logoFileInput?.click();
  }
});

logoFileInput?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (file) handleLogoFile(file);
});

[logoDropzone, logoPreviewCard].forEach((zone) => {
  if (!zone) return;

  ["dragenter", "dragover"].forEach((evtName) => {
    zone.addEventListener(evtName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add("drag-active");
    });
  });

  ["dragleave", "dragend"].forEach((evtName) => {
    zone.addEventListener(evtName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove("drag-active");
    });
  });

  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    zone.classList.remove("drag-active");
    const file = e.dataTransfer?.files?.[0];
    if (file) handleLogoFile(file);
  });
});

logoClearUploadBtn?.addEventListener("click", () => {
  if (logoUploadInfo) logoUploadInfo.hidden = true;
  if (logoFileInput) logoFileInput.value = "";
  if (settingLogo) {
    settingLogo.value = "⚜️";
    settingLogo.dispatchEvent(new Event("input", { bubbles: true }));
  }
});

document.querySelectorAll(".preset-pill").forEach((btn) => {
  btn.addEventListener("click", () => {
    const symbol = btn.dataset.symbol;
    if (symbol && settingLogo) {
      settingLogo.value = symbol;
      updateLogoPreview(symbol);
      if (logoUploadInfo) logoUploadInfo.hidden = true;
      if (logoFileInput) logoFileInput.value = "";
    }
  });
});

async function handleHeroBgFile(file) {
  if (!file) return;

  const isImage = file.type?.startsWith("image/") || /\.(png|jpe?g|webp|svg|gif)$/i.test(file.name);
  if (!isImage) {
    if (websiteBioStatusMsg) {
      websiteBioStatusMsg.textContent = "Please select a valid image file (PNG, JPG, WebP, SVG, GIF).";
      websiteBioStatusMsg.className = "settings-status-msg error";
      websiteBioStatusMsg.hidden = false;
    }
    return;
  }

  if (websiteBioStatusMsg) {
    websiteBioStatusMsg.hidden = true;
    websiteBioStatusMsg.textContent = "";
  }

  if (heroBgUploadInfo) {
    heroBgUploadInfo.hidden = false;
    if (heroBgUploadName) heroBgUploadName.textContent = `Uploading ${file.name}...`;
  }

  const reader = new FileReader();
  reader.onerror = () => {
    if (heroBgUploadInfo) heroBgUploadInfo.hidden = true;
    if (websiteBioStatusMsg) {
      websiteBioStatusMsg.textContent = "Could not read the selected image file.";
      websiteBioStatusMsg.className = "settings-status-msg error";
      websiteBioStatusMsg.hidden = false;
    }
  };

  reader.onload = async () => {
    const dataUrl = reader.result;
    try {
      const response = await fetch("/api/upload-hero-bg", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: dataUrl, name: file.name }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Upload failed");

      if (settingHeroBackground) settingHeroBackground.value = payload.url;
      if (heroBgUploadInfo) heroBgUploadInfo.hidden = false;
      if (heroBgUploadName) heroBgUploadName.textContent = file.name;
      updateHeroPreview();
    } catch (err) {
      if (settingHeroBackground) settingHeroBackground.value = dataUrl;
      if (heroBgUploadInfo) heroBgUploadInfo.hidden = false;
      if (heroBgUploadName) heroBgUploadName.textContent = `${file.name} (Embedded)`;
      updateHeroPreview();
    }
  };
  reader.readAsDataURL(file);
}

heroBgDropzone?.addEventListener("click", () => heroBgFileInput?.click());
heroBgDropzone?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    heroBgFileInput?.click();
  }
});
heroBgFileInput?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (file) handleHeroBgFile(file);
});

[heroBgDropzone, heroLivePreview].forEach((zone) => {
  if (!zone) return;
  ["dragenter", "dragover"].forEach((evtName) => {
    zone.addEventListener(evtName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add("drag-active");
    });
  });
  ["dragleave", "dragend"].forEach((evtName) => {
    zone.addEventListener(evtName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove("drag-active");
    });
  });
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    zone.classList.remove("drag-active");
    const file = e.dataTransfer?.files?.[0];
    if (file) handleHeroBgFile(file);
  });
});

heroBgClearUploadBtn?.addEventListener("click", () => {
  if (heroBgUploadInfo) heroBgUploadInfo.hidden = true;
  if (heroBgFileInput) heroBgFileInput.value = "";
  if (settingHeroBackground) {
    settingHeroBackground.value = "/header-bg.png";
    updateHeroPreview();
  }
});

[settingHeroSubheading, settingHeroTitle, settingHeroText, settingHeroBackground].forEach((input) => {
  input?.addEventListener("input", updateHeroPreview);
});

websiteBioForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (saveWebsiteBioBtn) saveWebsiteBioBtn.disabled = true;
  if (websiteBioStatusMsg) websiteBioStatusMsg.hidden = true;

  try {
    const formData = new FormData(websiteBioForm);
    const newBioSettings = {
      projectName: String(formData.get("projectName") || "").trim(),
      subtitle: String(formData.get("subtitle") || "").trim(),
      logo: String(formData.get("logo") || "").trim(),
      footTag: String(formData.get("footTag") || "").trim(),
      heroSubheading: String(formData.get("heroSubheading") || "").trim(),
      heroTitle: String(formData.get("heroTitle") || "").trim(),
      heroText: String(formData.get("heroText") || "").trim(),
      heroBackground: String(formData.get("heroBackground") || "").trim(),
    };

    if (!newBioSettings.projectName) throw new Error("Project name is required.");
    if (!newBioSettings.logo) throw new Error("Logo is required.");
    if (!newBioSettings.footTag) throw new Error("Foot tag is required.");

    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(newBioSettings),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Could not save website bio.");

    applySettings(payload.settings || newBioSettings);
    try { localStorage.setItem("pka_settings", JSON.stringify(payload.settings || newBioSettings)); } catch (_) {}
    setStatus("Website Bio saved successfully");
    closeWebsiteBioModal();
  } catch (err) {
    if (websiteBioStatusMsg) {
      websiteBioStatusMsg.textContent = err.message || "Failed to save website bio.";
      websiteBioStatusMsg.className = "settings-status-msg error";
      websiteBioStatusMsg.hidden = false;
    }
  } finally {
    if (saveWebsiteBioBtn) saveWebsiteBioBtn.disabled = false;
  }
});

settingsForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (saveSettingsBtn) saveSettingsBtn.disabled = true;
  if (settingsStatusMsg) settingsStatusMsg.hidden = true;

  try {
    const formData = new FormData(settingsForm);
    const newSettings = {
      projectName: String(formData.get("projectName") || currentSettings.projectName).trim(),
      subtitle: String(formData.get("subtitle") !== null ? (formData.get("subtitle") || "") : (currentSettings.subtitle || "")).trim(),
      logo: String(formData.get("logo") || currentSettings.logo).trim(),
      footTag: String(formData.get("footTag") || currentSettings.footTag).trim(),
      defaultWebsite: formData.get("defaultWebsite") === "foodpanda" ? "foodpanda" : "fragrantica",
      telegramBotToken: String(formData.get("telegramBotToken") || "").trim(),
      telegramBotUsername: String(formData.get("telegramBotUsername") || "").trim().replace(/^@/, ""),
      telegramChatId: String(formData.get("telegramContact") || formData.get("telegramChatId") || "+85510666813").trim(),
      telegramBotEnabled: formData.get("telegramBotEnabled") ? "true" : "false",
      telegramContact: String(formData.get("telegramContact") || formData.get("telegramChatId") || "+85510666813").trim(),
      telegramContactEnabled: formData.get("telegramContactEnabled") ? "true" : "false",
      telegramContactText: String(formData.get("telegramContactText") || "").trim(),
    };

    if (!newSettings.projectName) throw new Error("Project name is required.");
    if (!newSettings.logo) throw new Error("Logo is required.");
    if (!newSettings.footTag) throw new Error("Foot tag is required.");

    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(newSettings),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Could not save settings.");

    applySettings(payload.settings || newSettings);
    try { localStorage.setItem("pka_settings", JSON.stringify(payload.settings || newSettings)); } catch (_) {}
    setStatus("Settings saved successfully");
    closeSettingsModal();
  } catch (err) {
    if (settingsStatusMsg) {
      settingsStatusMsg.textContent = err.message || "Failed to save settings.";
      settingsStatusMsg.className = "settings-status-msg error";
      settingsStatusMsg.hidden = false;
    }
  } finally {
    if (saveSettingsBtn) saveSettingsBtn.disabled = false;
  }
});

function updateTelegramBotUI() {
  const username = (settingTelegramBotUsername?.value || currentSettings.telegramBotUsername || "pkascent_bot").trim().replace(/^@/, "");
  if (telegramBotDisplayName) telegramBotDisplayName.textContent = `@${username}`;
  if (telegramBotDirectLink) {
    telegramBotDirectLink.href = `https://t.me/${username}`;
    telegramBotDirectLink.title = `Open @${username} on Telegram`;
  }
  const isEnabled = Boolean(settingTelegramBotEnabled?.checked);
  if (telegramStatusLabel) {
    telegramStatusLabel.textContent = isEnabled ? "Bot Scraper Active" : "Bot Scraper Disabled";
  }
  if (telegramStatusDot) {
    telegramStatusDot.className = `telegram-status-dot ${isEnabled ? "active" : ""}`;
  }
}

function updateTelegramContactUI() {
  const isEnabled = Boolean(settingTelegramContactEnabled?.checked);
  if (telegramContactStatusLabel) {
    telegramContactStatusLabel.textContent = isEnabled ? "Floating Button Active" : "Floating Button Disabled";
  }
}

function formatTelegramContactUrl(contact) {
  if (!contact || typeof contact !== "string") return "https://t.me/+85510666813";
  const trimmed = contact.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const cleaned = trimmed.replace(/[\s\-()]/g, "");
  if (/^\+?\d{7,15}$/.test(cleaned)) {
    const phoneWithPlus = cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
    return `https://t.me/${phoneWithPlus}`;
  }

  return `https://t.me/${trimmed.replace(/^@/, "")}`;
}

function updateTelegramContactWidget() {
  if (!telegramFloatingWidget) return;
  const isEnabled = currentSettings.telegramContactEnabled !== "false" && currentSettings.telegramContactEnabled !== false;
  const isFrontend = currentMode === "frontend";
  telegramFloatingWidget.hidden = !(isEnabled && isFrontend);

  const contact = (currentSettings.telegramContact || currentSettings.telegramChatId || "+85510666813").trim();
  const contactUrl = formatTelegramContactUrl(contact);

  if (telegramFloatingBtn) {
    telegramFloatingBtn.href = contactUrl;
    telegramFloatingBtn.title = `Chat on Telegram (${contact})`;
  }
  if (telegramFloatingPillBtn) {
    telegramFloatingPillBtn.href = contactUrl;
    telegramFloatingPillBtn.title = `Chat on Telegram (${contact})`;
  }
  if (telegramFloatingPillLabel) {
    telegramFloatingPillLabel.textContent = `Chat on Telegram (${contact})`;
  }
}

settingTelegramBotUsername?.addEventListener("input", updateTelegramBotUI);
settingTelegramBotEnabled?.addEventListener("change", updateTelegramBotUI);
settingTelegramContactEnabled?.addEventListener("change", updateTelegramContactUI);
settingTelegramContact?.addEventListener("input", (e) => {
  const val = e.target.value.trim();
  currentSettings.telegramContact = val;
  currentSettings.telegramChatId = val;
  updateTelegramContactWidget();
});

async function testTelegramConnection() {
  if (!testTelegramBtn) return;
  const token = (settingTelegramBotToken?.value || "").trim();
  if (!token) {
    showTelegramFeedback("Please enter a Telegram Bot HTTP API Token.", false);
    return;
  }

  testTelegramBtn.disabled = true;
  showTelegramFeedback("⚡ Verifying Telegram Bot API Token...", null);

  try {
    const res = await fetch("/api/telegram/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      const info = data.bot || {};
      if (telegramStatusDot) telegramStatusDot.className = "telegram-status-dot active";
      if (info.username) {
        if (settingTelegramBotUsername) settingTelegramBotUsername.value = info.username;
        updateTelegramBotUI();
      }
      showTelegramFeedback(`✅ Connected to @${info.username} (${info.first_name || "Bot"}). Bot is ready to scrape perfume links!`, true);
    } else {
      if (telegramStatusDot) telegramStatusDot.className = "telegram-status-dot error";
      showTelegramFeedback(`❌ Connection failed: ${data.error || "Invalid token"}`, false);
    }
  } catch (err) {
    if (telegramStatusDot) telegramStatusDot.className = "telegram-status-dot error";
    showTelegramFeedback(`❌ Network error: ${err.message}`, false);
  } finally {
    testTelegramBtn.disabled = false;
  }
}

async function sendTelegramTestLink() {
  if (!sendTelegramTestMsgBtn) return;
  const token = (settingTelegramBotToken?.value || "").trim();
  const chatId = (settingTelegramChatId?.value || "").trim();

  sendTelegramTestMsgBtn.disabled = true;
  showTelegramFeedback("📨 Sending test link to Telegram...", null);

  try {
    const sampleLink = "https://www.fragrantica.com/perfume/Prada/Prada-Paradoxe-Intense-83988.html";
    const testMsg = [
      "⚜️ *PKA SCENT Telegram Scraper Bot is Online!*",
      "",
      "To scrape a perfume and add it to your catalogue, simply reply or send any perfume URL to this bot.",
      "",
      `🔗 *Sample Perfume Link:*`,
      `\`${sampleLink}\``,
    ].join("\n");

    const res = await fetch("/api/telegram/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, chatId, message: testMsg }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      if (data.result?.chatId && settingTelegramChatId && !settingTelegramChatId.value) {
        settingTelegramChatId.value = data.result.chatId;
      }
      showTelegramFeedback(`✅ Test link sent to Telegram! Check your messages in @${settingTelegramBotUsername?.value || "pkascent_bot"}.`, true);
    } else {
      showTelegramFeedback(`❌ ${data.error || "Could not send test message. Make sure you sent /start to @pkascent_bot first."}`, false);
    }
  } catch (err) {
    showTelegramFeedback(`❌ Network error: ${err.message}`, false);
  } finally {
    sendTelegramTestMsgBtn.disabled = false;
  }
}

function showTelegramFeedback(msg, isSuccess) {
  if (!telegramFeedbackMsg) return;
  telegramFeedbackMsg.hidden = false;
  telegramFeedbackMsg.textContent = msg;
  if (isSuccess === true) {
    telegramFeedbackMsg.className = "telegram-feedback-msg success";
  } else if (isSuccess === false) {
    telegramFeedbackMsg.className = "telegram-feedback-msg error";
  } else {
    telegramFeedbackMsg.className = "telegram-feedback-msg";
  }
}

testTelegramBtn?.addEventListener("click", testTelegramConnection);
sendTelegramTestMsgBtn?.addEventListener("click", sendTelegramTestLink);

resetSettingsBtn?.addEventListener("click", async () => {
  if (!window.confirm("Reset settings back to defaults?")) return;
  resetSettingsBtn.disabled = true;
  try {
    const response = await fetch("/api/settings/reset", { method: "POST" });
    const payload = await response.json();
    const defaults = payload.settings || DEFAULT_SETTINGS;
    applySettings(defaults);
    try { localStorage.setItem("pka_settings", JSON.stringify(defaults)); } catch (_) {}
    if (settingProjectName) settingProjectName.value = defaults.projectName;
    if (settingSubtitle) settingSubtitle.value = defaults.subtitle || DEFAULT_SETTINGS.subtitle;
    if (settingLogo) settingLogo.value = defaults.logo;
    if (settingFootTag) settingFootTag.value = defaults.footTag;
    if (settingDefaultWebsite) settingDefaultWebsite.value = defaults.defaultWebsite || "fragrantica";
    if (settingTelegramContact) settingTelegramContact.value = defaults.telegramContact || "+85510666813";
    if (settingTelegramChatId) settingTelegramChatId.value = defaults.telegramContact || "+85510666813";
    if (settingTelegramContactEnabled) settingTelegramContactEnabled.checked = defaults.telegramContactEnabled !== "false";
    if (settingTelegramContactText) settingTelegramContactText.value = defaults.telegramContactText || "Chat with us on Telegram";
    updateTelegramContactUI();
    updateTelegramContactWidget();
    updateLogoPreview(defaults.logo);
    if (settingsStatusMsg) {
      settingsStatusMsg.textContent = "Settings reset to defaults.";
      settingsStatusMsg.className = "settings-status-msg success";
      settingsStatusMsg.hidden = false;
    }
    setStatus("Settings reset to defaults");
  } catch (err) {
    applySettings(DEFAULT_SETTINGS);
    try { localStorage.setItem("pka_settings", JSON.stringify(DEFAULT_SETTINGS)); } catch (_) {}
    if (settingsStatusMsg) {
      settingsStatusMsg.textContent = "Reset to local defaults.";
      settingsStatusMsg.className = "settings-status-msg success";
      settingsStatusMsg.hidden = false;
    }
  } finally {
    resetSettingsBtn.disabled = false;
  }
});

adminModuleLoginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (adminLoginError) adminLoginError.hidden = true;
  if (moduleLoginSubmitBtn) moduleLoginSubmitBtn.disabled = true;

  const username = moduleUsername?.value.trim() || "";
  const password = modulePassword?.value || "";

  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.success) {
      sessionStorage.setItem("pka_admin_auth", "true");
      setAdminLockedState(false);
      setStatus("Administrator authenticated", "ready");
      if (modulePassword) modulePassword.value = "";
      loadSavedProducts();
    } else {
      sessionStorage.removeItem("pka_admin_auth");
      if (adminLoginError) {
        if (adminLoginErrorMsg) {
          adminLoginErrorMsg.textContent = data.error || "Invalid username or password.";
        }
        adminLoginError.hidden = false;
      }
      if (modulePassword) {
        modulePassword.focus();
        modulePassword.select();
      }
    }
  } catch (err) {
    if (username === "admin" && password === "123") {
      sessionStorage.setItem("pka_admin_auth", "true");
      setAdminLockedState(false);
      setStatus("Administrator authenticated", "ready");
      loadSavedProducts();
    } else {
      if (adminLoginError) {
        if (adminLoginErrorMsg) {
          adminLoginErrorMsg.textContent = "Invalid username or password.";
        }
        adminLoginError.hidden = false;
      }
    }
  } finally {
    if (moduleLoginSubmitBtn) moduleLoginSubmitBtn.disabled = false;
  }
});

logoutBtn?.addEventListener("click", async () => {
  closeSidebar();
  sessionStorage.removeItem("pka_admin_auth");
  setAdminLockedState(true);
  setStatus("Signed out of admin portal", "ready");
  try {
    await fetch("/api/admin/logout", { method: "POST" });
  } catch (_) {}
});

/* ==========================================================================
   Tag Settings & Tag Editor Management
   ========================================================================== */
let currentTags = [];
const selectedTagFilters = new Set();
const tagFilterInput = document.querySelector("#tagFilterInput");
const tagFilterStatusLabel = document.querySelector("#tagFilterStatusLabel");
const frontendTagFilters = document.querySelector("#frontendTagFilters");

tagFilterInput?.addEventListener("change", () => {
  if (tagFilterStatusLabel) {
    tagFilterStatusLabel.textContent = tagFilterInput.checked ? "true" : "false";
  }
});

function renderFrontendTagFilters() {
  if (!frontendTagFilters) return;
  const activeTags = currentTags.filter((t) => t.filter !== false);
  if (!activeTags.length) {
    frontendTagFilters.innerHTML = "";
    return;
  }
  frontendTagFilters.innerHTML = activeTags
    .map((tag) => {
      const isChecked = selectedTagFilters.has(tag.name);
      return `
        <label class="gender-chip tag-filter-chip" for="filterTag_${escapeHtml(tag.id)}">
          <input type="checkbox" id="filterTag_${escapeHtml(tag.id)}" class="filter-tag-checkbox" data-tag-name="${escapeHtml(tag.name)}" ${isChecked ? "checked" : ""} />
          <span class="chip-label">🏷️ ${escapeHtml(tag.name)}</span><span class="filter-count" data-tag-count="${escapeHtml(tag.name)}">(0)</span>
        </label>
      `;
    })
    .join("");
}

frontendTagFilters?.addEventListener("change", (e) => {
  const cb = e.target.closest(".filter-tag-checkbox");
  if (!cb) return;
  const tagName = cb.dataset.tagName;
  if (cb.checked) {
    selectedTagFilters.add(tagName);
  } else {
    selectedTagFilters.delete(tagName);
  }
  renderTable();
});

async function loadTags() {
  try {
    const res = await fetch(`/api/tags?source=${sourceInput?.value || "fragrantica"}`);
    if (res.ok) {
      const data = await res.json();
      currentTags = Array.isArray(data.tags) ? data.tags : [];
      renderTagTable();
      renderFrontendTagFilters();
      updateFilterCounts();
    }
  } catch (err) {
    console.warn("Failed to load tags:", err);
  }
}

function renderTagTable() {
  if (!tagTableBody) return;
  if (!currentTags.length) {
    tagTableBody.innerHTML = "";
    if (tagEmptyState) tagEmptyState.hidden = false;
    return;
  }
  if (tagEmptyState) tagEmptyState.hidden = true;

  tagTableBody.innerHTML = currentTags
    .map((tag) => {
      const isFilterActive = tag.filter !== false;
      const perfumeChips = (tag.productNames || []).length
        ? (tag.productNames || []).map((name) => `<span class="perfume-tag-chip">${escapeHtml(name)}</span>`).join("")
        : `<span class="perfume-tag-chip empty">No perfumes assigned</span>`;

      return `
        <tr data-tag-id="${escapeHtml(tag.id)}">
          <td class="tag-name-cell">
            <span class="tag-pill">🏷️ ${escapeHtml(tag.name)}</span>
          </td>
          <td class="tag-filter-cell">
            <span class="filter-status-pill ${isFilterActive ? "true" : "false"}">${isFilterActive ? "true" : "false"}</span>
          </td>
          <td>
            <div class="tag-perfumes-list">
              ${perfumeChips}
            </div>
          </td>
          <td class="th-tag-actions">
            <div class="tag-action-btns">
              <button type="button" class="tag-action-btn edit" data-tag-action="edit" data-tag-id="${escapeHtml(tag.id)}" title="Edit tag and assigned perfumes">
                ✏️ Edit
              </button>
              <button type="button" class="tag-action-btn delete" data-tag-action="delete" data-tag-id="${escapeHtml(tag.id)}" title="Delete tag">
                🗑️ Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function getSelectedTagProductIds() {
  if (!tagProductChecklist) return [];
  const checked = tagProductChecklist.querySelectorAll(".tag-item-check:checked");
  return Array.from(checked).map((cb) => cb.value);
}

function renderTagChecklist(selectedIds = []) {
  if (!tagProductChecklist) return;
  const filterQuery = (tagPickerSearch?.value || "").trim().toLowerCase();
  const selectedSet = new Set(selectedIds);

  const matchedProducts = products.filter((p) => {
    if (!filterQuery) return true;
    return `${p.brand || ""} ${p.name || ""}`.toLowerCase().includes(filterQuery);
  });

  if (!matchedProducts.length) {
    tagProductChecklist.innerHTML = `<div class="tag-empty-state" style="padding: 16px;">No perfumes match your search.</div>`;
    return;
  }

  tagProductChecklist.innerHTML = matchedProducts
    .map((p) => {
      const isChecked = selectedSet.has(p.id);
      return `
        <label class="checklist-item">
          <input type="checkbox" value="${escapeHtml(p.id)}" class="tag-item-check" ${isChecked ? "checked" : ""} />
          <div class="checklist-label">
            <strong>${escapeHtml(p.name)}</strong>
            ${p.brand ? `<span class="checklist-brand">${escapeHtml(p.brand)}</span>` : ""}
          </div>
        </label>
      `;
    })
    .join("");
}

function openTagEditor(tag = null) {
  if (!tagEditorModal) return;
  if (tagEditorError) tagEditorError.hidden = true;
  if (tagPickerSearch) tagPickerSearch.value = "";

  const isFilter = tag ? (tag.filter !== false) : true;
  if (tagFilterInput) tagFilterInput.checked = isFilter;
  if (tagFilterStatusLabel) tagFilterStatusLabel.textContent = isFilter ? "true" : "false";

  if (tag) {
    if (tagEditorTitle) tagEditorTitle.textContent = "🏷️ Edit Tag";
    if (tagEditId) tagEditId.value = tag.id;
    if (tagNameInput) tagNameInput.value = tag.name;
  } else {
    if (tagEditorTitle) tagEditorTitle.textContent = "🏷️ Add New Tag";
    if (tagEditId) tagEditId.value = "";
    if (tagNameInput) tagNameInput.value = "ក្លិនពេញនិយម";
  }

  renderTagChecklist(tag ? tag.productIds || [] : []);
  tagEditorModal.showModal();
}

tagSettingsBtn?.addEventListener("click", () => {
  closeSidebar();
  loadTags();
  tagSettingsDialog?.showModal();
});

closeTagSettingsBtn?.addEventListener("click", () => tagSettingsDialog?.close());
dismissTagSettingsBtn?.addEventListener("click", () => tagSettingsDialog?.close());

openAddTagBtn?.addEventListener("click", () => {
  openTagEditor(null);
});

closeTagEditorBtn?.addEventListener("click", () => tagEditorModal?.close());
cancelTagEditorBtn?.addEventListener("click", () => tagEditorModal?.close());

tagSelectAllBtn?.addEventListener("click", () => {
  if (!tagProductChecklist) return;
  const checkboxes = tagProductChecklist.querySelectorAll(".tag-item-check");
  checkboxes.forEach((cb) => (cb.checked = true));
});

tagDeselectAllBtn?.addEventListener("click", () => {
  if (!tagProductChecklist) return;
  const checkboxes = tagProductChecklist.querySelectorAll(".tag-item-check");
  checkboxes.forEach((cb) => (cb.checked = false));
});

tagPickerSearch?.addEventListener("input", () => {
  const selectedIds = getSelectedTagProductIds();
  renderTagChecklist(selectedIds);
});

tagTableBody?.addEventListener("click", async (event) => {
  const btn = event.target.closest("[data-tag-action]");
  if (!btn) return;
  const action = btn.dataset.tagAction;
  const tagId = btn.dataset.tagId;
  const tag = currentTags.find((t) => t.id === tagId);

  if (action === "edit" && tag) {
    openTagEditor(tag);
  } else if (action === "delete" && tag) {
    if (!confirm(`Are you sure you want to delete tag "${tag.name}"?`)) return;
    try {
      btn.disabled = true;
      const res = await fetch("/api/tags/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: tag.id, source: sourceInput?.value || "fragrantica" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete tag.");
      currentTags = Array.isArray(data.tags) ? data.tags : [];
      renderTagTable();
      renderFrontendTagFilters();
      updateFilterCounts();
      if (Array.isArray(data.products)) {
        setProducts(data.products, `Tag "${tag.name}" deleted`);
      }
    } catch (err) {
      alert(err.message || "Could not delete tag.");
    } finally {
      btn.disabled = false;
    }
  }
});

tagEditorForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (saveTagBtn) saveTagBtn.disabled = true;
  if (tagEditorError) tagEditorError.hidden = true;

  try {
    const tagName = (tagNameInput?.value || "").trim();
    if (!tagName) throw new Error("Tag name is required.");

    const selectedProductIds = getSelectedTagProductIds();
    const tagId = (tagEditId?.value || "").trim();
    const source = sourceInput?.value || "fragrantica";
    const filter = tagFilterInput ? tagFilterInput.checked : true;

    const payload = {
      id: tagId || undefined,
      name: tagName,
      filter,
      productIds: selectedProductIds,
      source,
    };

    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not save tag.");

    currentTags = Array.isArray(data.tags) ? data.tags : [];
    renderTagTable();
    renderFrontendTagFilters();
    updateFilterCounts();
    if (Array.isArray(data.products)) {
      setProducts(data.products, `Tag "${tagName}" saved`);
    }

    tagEditorModal?.close();
  } catch (err) {
    if (tagEditorError) {
      tagEditorError.textContent = err.message || "Failed to save tag.";
      tagEditorError.hidden = false;
    }
  } finally {
    if (saveTagBtn) saveTagBtn.disabled = false;
  }
});

/* ==========================================================================
   Product-Level Quick Tag Assignment Modal
   ========================================================================== */
const productTagModal = document.querySelector("#productTagModal");
const productTagForm = document.querySelector("#productTagForm");
const productTagModalTitle = document.querySelector("#productTagModalTitle");
const closeProductTagModalBtn = document.querySelector("#closeProductTagModalBtn");
const cancelProductTagBtn = document.querySelector("#cancelProductTagBtn");
const productTagTargetId = document.querySelector("#productTagTargetId");
const productTagChecklist = document.querySelector("#productTagChecklist");
const newProductTagNameInput = document.querySelector("#newProductTagNameInput");
const addNewTagToProductBtn = document.querySelector("#addNewTagToProductBtn");
const productTagError = document.querySelector("#productTagError");
const saveProductTagBtn = document.querySelector("#saveProductTagBtn");

let currentTaggingProduct = null;

function openProductTagModal(product) {
  if (!productTagModal) return;
  currentTaggingProduct = product;
  if (productTagError) productTagError.hidden = true;
  if (newProductTagNameInput) newProductTagNameInput.value = "";
  if (productTagTargetId) productTagTargetId.value = product.id;
  if (productTagModalTitle) {
    productTagModalTitle.textContent = `${product.name} ${product.brand ? `(${product.brand})` : ""}`;
  }

  // Collect all known tags in system
  const allTagNames = new Set(["ក្លិនពេញនិយម"]);
  for (const t of currentTags) {
    if (t.name) allTagNames.add(t.name);
  }
  for (const p of products) {
    if (Array.isArray(p.tags)) {
      for (const t of p.tags) if (t) allTagNames.add(t);
    }
  }

  const productTagsSet = new Set(Array.isArray(product.tags) ? product.tags : []);

  renderProductTagChecklist(allTagNames, productTagsSet);
  productTagModal.showModal();
}

function renderProductTagChecklist(allTagNames, selectedTagNames) {
  if (!productTagChecklist) return;
  productTagChecklist.innerHTML = Array.from(allTagNames)
    .map((tagName) => {
      const isChecked = selectedTagNames.has(tagName);
      return `
        <label class="checklist-item">
          <input type="checkbox" value="${escapeHtml(tagName)}" class="product-tag-checkbox" ${isChecked ? "checked" : ""} />
          <span class="tag-pill">🏷️ ${escapeHtml(tagName)}</span>
        </label>
      `;
    })
    .join("");
}

addNewTagToProductBtn?.addEventListener("click", () => {
  const newTag = (newProductTagNameInput?.value || "").trim();
  if (!newTag) return;
  if (!productTagChecklist) return;

  const existing = Array.from(productTagChecklist.querySelectorAll(".product-tag-checkbox")).find(
    (cb) => cb.value.toLowerCase() === newTag.toLowerCase()
  );
  if (existing) {
    existing.checked = true;
  } else {
    const itemHtml = `
      <label class="checklist-item">
        <input type="checkbox" value="${escapeHtml(newTag)}" class="product-tag-checkbox" checked />
        <span class="tag-pill">🏷️ ${escapeHtml(newTag)}</span>
      </label>
    `;
    productTagChecklist.insertAdjacentHTML("beforeend", itemHtml);
  }
  newProductTagNameInput.value = "";
});

closeProductTagModalBtn?.addEventListener("click", () => productTagModal?.close());
cancelProductTagBtn?.addEventListener("click", () => productTagModal?.close());

productTagForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentTaggingProduct) return;
  if (saveProductTagBtn) saveProductTagBtn.disabled = true;
  if (productTagError) productTagError.hidden = true;

  try {
    const checkedCheckboxes = productTagChecklist?.querySelectorAll(".product-tag-checkbox:checked") || [];
    const selectedTags = Array.from(checkedCheckboxes).map((cb) => cb.value.trim()).filter(Boolean);

    const response = await fetch(`/api/products/${currentTaggingProduct.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tags: selectedTags,
        version: currentTaggingProduct.version,
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Could not update product tags.");

    if (payload.source === sourceInput?.value) {
      setProducts(payload.products, `Tags updated for "${currentTaggingProduct.name}"`);
    }
    loadTags();
    productTagModal?.close();
  } catch (err) {
    if (productTagError) {
      productTagError.textContent = err.message || "Failed to update tags.";
      productTagError.hidden = false;
    }
  } finally {
    if (saveProductTagBtn) saveProductTagBtn.disabled = false;
  }
});

