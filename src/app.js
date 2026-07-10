import {
  buildDedupedGroups,
  DISPLAY_GROUPS,
  filterAvailablePlugins,
  getSheetExcludedPinnedIds
} from "./logic.js";

const pluginCatalog = [
  { id: "courses", name: "All Courses", asset: "chat_shortcut_1.png", color: "#398cf5" },
  { id: "play", name: "Play", asset: "chat_shortcut_2.png", color: "#12c888" },
  { id: "translate", name: "AI Translator", asset: "plugin_translate.png", color: "#2bbcc8" },
  { id: "english-ai", name: "English AI", asset: "plugin_ai.png", color: "#1b357f" },
  { id: "wordclass", name: "Wordclass", asset: "plugin_game.png", color: "#7b4df5" },
  { id: "notepad", name: "Notepad", asset: "plugin_bookmark.png", color: "#f44f75" },
  { id: "short-drama", name: "ShortDrama", asset: "plugin_voice.png", color: "#4230a0" },
  { id: "study-plan", name: "Study Plan", asset: "plugin_calendar.png", color: "#f5ac2f" },
  { id: "word-game", name: "Word Game", asset: "plugin_vote.png", color: "#ff8f42" },
  { id: "draw", name: "Draw", asset: "plugin_draw.png", color: "#f15ea8" },
  { id: "teach", name: "Teach", asset: "plugin_teach.png", color: "#36b9a4" },
  { id: "location", name: "Nearby", asset: "plugin_location.png", color: "#3f8df5" },
  { id: "introduce", name: "Introduce", asset: "plugin_intro.png", color: "#ff9a45" },
  { id: "voice-room", name: "Voice Room", asset: "plugin_voice.png", color: "#7947ed" },
  { id: "bookmark", name: "Favorites", asset: "plugin_bookmark.png", color: "#f5c140" },
  { id: "phrases", name: "Phrases", initials: "Aa", color: "#29a8ef" },
  { id: "topics", name: "Topics", initials: "Q", color: "#5966d6" },
  { id: "live-lesson", name: "Live Lesson", initials: "L", color: "#ffb020" },
  { id: "gift", name: "Gift", initials: "G", color: "#f04a6a" },
  { id: "class", name: "Class", initials: "C", color: "#18c7d7" },
  { id: "word-snake", name: "Word Snake", initials: "S", color: "#d875d7" },
  { id: "hello-spanish", name: "HelloSpanish", initials: "ES", color: "#f8b727" },
  { id: "daily-quiz", name: "Daily Quiz", initials: "QZ", color: "#ef6c55" },
  { id: "pronunciation", name: "Pronunciation", initials: "PR", color: "#1fa8a0" },
  { id: "grammar-coach", name: "Grammar Coach", initials: "GC", color: "#6574c8" }
];

const getPlugin = (id) => pluginCatalog.find((plugin) => plugin.id === id);

const initialPinnedIds = [
  "courses",
  "play",
  "translate",
  "english-ai",
  "wordclass",
  "notepad",
  "short-drama",
  "study-plan",
  "word-game",
  "draw",
  "teach",
  "location",
  "introduce",
  "voice-room",
  "bookmark"
];

const state = {
  route: "chat",
  sheetOpen: false,
  sheetTall: false,
  search: "",
  nativeSheetEnabled: true,
  maxReached: false,
  failNext: false,
  toast: "",
  pinnedIds: [...initialPinnedIds],
  recentDeletedIds: ["live-lesson", "voice-room", "word-snake"],
  sheetAddedIds: [],
  sheetAddedFromRecentDeletedIds: [],
  pendingAddIds: []
};

const groupCandidates = {
  recentViewed: ["phrases", "topics", "gift", "class"],
  recentDeleted: state.recentDeletedIds,
  recommended: [
    "daily-quiz",
    "pronunciation",
    "grammar-coach",
    "gift",
    "class",
    "live-lesson",
    "word-snake",
    "hello-spanish",
    "topics"
  ]
};

const app = document.querySelector("#app");
const nativeSwitch = document.querySelector("#nativeSwitch");
const maxSwitch = document.querySelector("#maxSwitch");
const failSwitch = document.querySelector("#failSwitch");
const openAddMore = document.querySelector("#openAddMore");
const resetDemo = document.querySelector("#resetDemo");
const isNextRuntime = [...document.scripts].some((script) => script.src.includes("/_next/"));
const assetBase = isNextRuntime ? "/assets/" : "./public/assets/";

function assetPath(name) {
  return `${assetBase}${name}`;
}

function icon(name, size = 22) {
  const paths = {
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M7 12h10"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    up: '<path d="m7 15 5-5 5 5"/>',
    check: '<path d="m5 12 4 4L19 6"/>'
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

function renderPluginIcon(plugin, className = "") {
  const content = plugin.asset
    ? `<img src="${assetPath(plugin.asset)}" alt="" />`
    : `<span>${plugin.initials}</span>`;
  return `<span class="plugin-icon ${className}" style="--icon-color:${plugin.color}">${content}</span>`;
}

function renderTopPlugin(plugin) {
  const removable = !["courses", "play", "translate"].includes(plugin.id);
  return `
    <div class="top-plugin">
      <button class="plugin-main" type="button" aria-label="${plugin.name}">
        ${renderPluginIcon(plugin)}
        <span class="top-plugin-name">${plugin.name}</span>
      </button>
      ${removable ? `<button class="remove-badge" type="button" data-remove="${plugin.id}" aria-label="Remove ${plugin.name}">${icon("minus", 15)}</button>` : ""}
    </div>
  `;
}

function renderTopPluginBar() {
  const pinned = state.pinnedIds.map(getPlugin).filter(Boolean).map(renderTopPlugin).join("");
  return `
    <section class="top-plugin-region" aria-label="Expanded top plugin bar">
      <div class="top-plugin-grid">
        ${pinned}
        <button class="top-plugin add-more" type="button" data-action="add-more" aria-label="Add More">
          <span class="plugin-icon add-more-icon">${icon("plus", 28)}</span>
          <span class="top-plugin-name">Add More</span>
        </button>
      </div>
    </section>
  `;
}

function renderFilters() {
  return `
    <div class="chat-filters" aria-label="Chat filters">
      <button class="filter-icon" type="button" aria-label="Filter">${icon("filter", 19)}</button>
      <button class="filter-pill active" type="button">All</button>
      <button class="filter-pill" type="button">Online</button>
      <button class="filter-pill" type="button">Unread</button>
      <button class="filter-pill" type="button">My turn</button>
    </div>
  `;
}

function renderChatPage() {
  return `
    <div class="chat-page">
      <nav class="nav">
        <button class="icon-button nav-menu" type="button" aria-label="Menu">${icon("menu", 25)}<span class="notice-dot"></span></button>
        <div class="nav-title">Language Talks</div>
        <button class="icon-button" type="button" aria-label="New chat">${icon("plus", 28)}</button>
      </nav>
      ${renderTopPluginBar()}
      <div class="search-bar">${icon("search", 19)}<span>Search</span></div>
      ${renderFilters()}
      <div class="chat-list">
        <img class="asset-row" src="${assetPath("chat_home_row_1.png")}" alt="" />
        <img class="asset-row" src="${assetPath("chat_home_row_2.png")}" alt="" />
      </div>
      <img class="bottom-tab-image" src="${assetPath("bottom_tab_chat_active.png")}" alt="HelloTalk bottom navigation" />
    </div>
  `;
}

function renderLearnPage() {
  const unpinned = pluginCatalog.filter((plugin) => !state.pinnedIds.includes(plugin.id));
  return `
    <div class="learn-page">
      <nav class="nav">
        <button class="icon-button" type="button" data-action="back" aria-label="Back">${icon("back")}</button>
        <div class="nav-title">Manage top plugins</div>
        <button class="icon-button" type="button" aria-label="More">${icon("more")}</button>
      </nav>
      <div class="learn-content">
        <div class="route-notice">Current Flutter page</div>
        <div class="learn-search">${icon("search", 18)}<span>Search plugins</span></div>
        <h2 class="learn-heading">Pinned to Language Talks</h2>
        <div class="learn-list">
          ${state.pinnedIds.slice(0, 5).map(getPlugin).filter(Boolean).map((plugin) => `
            <div class="learn-row">
              ${renderPluginIcon(plugin, "small")}
              <span>${plugin.name}</span>
              <button class="learn-action remove" type="button" data-remove="${plugin.id}">Remove</button>
            </div>
          `).join("")}
        </div>
        <h2 class="learn-heading">More plugins</h2>
        <div class="learn-list">
          ${unpinned.slice(0, 5).map((plugin) => `
            <div class="learn-row">
              ${renderPluginIcon(plugin, "small")}
              <span>${plugin.name}</span>
              <button class="learn-action" type="button" data-add="${plugin.id}">Add</button>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function dedupedGroups() {
  return buildDedupedGroups({
    catalog: pluginCatalog,
    pinnedIds: getSheetExcludedPinnedIds(state.pinnedIds, state.sheetAddedIds),
    recentViewedIds: groupCandidates.recentViewed,
    recentDeletedIds: state.recentDeletedIds,
    recommendedIds: groupCandidates.recommended
  });
}

function renderPluginCard(plugin) {
  const added = state.sheetAddedIds.includes(plugin.id);
  const loading = state.pendingAddIds.includes(plugin.id);
  const disabled = loading || (!added && state.maxReached);
  const statusClass = added ? "added" : loading ? "loading" : disabled ? "disabled" : "";
  const label = added
    ? icon("check", 16)
    : loading
      ? '<span class="add-spinner" aria-hidden="true"></span>'
      : icon("plus", 17);
  const ariaLabel = added ? `Undo adding ${plugin.name}` : loading ? `Adding ${plugin.name}` : `Add ${plugin.name}`;
  const actionAttribute = added ? `data-undo-add="${plugin.id}"` : `data-add="${plugin.id}"`;
  return `
    <article class="plugin-card">
      ${renderPluginIcon(plugin)}
      <span class="plugin-name">${plugin.name}</span>
      <button class="add-chip ${statusClass}" type="button" ${actionAttribute} ${disabled ? "disabled" : ""} aria-label="${ariaLabel}">
        ${label}
      </button>
    </article>
  `;
}

function renderSheetContent() {
  const query = state.search.trim().toLowerCase();
  if (query) {
    const excludedPinnedIds = getSheetExcludedPinnedIds(state.pinnedIds, state.sheetAddedIds);
    const results = filterAvailablePlugins(pluginCatalog, excludedPinnedIds, query);
    return results.length
      ? `<div class="plugin-grid">${results.map(renderPluginCard).join("")}</div>`
      : `<div class="empty"><strong>暂无结果</strong><span>换个插件名称试试</span></div>`;
  }

  return dedupedGroups().map((group) => {
    const plugins = group.plugins;
    if (!plugins.length) return "";
    return `
      <section class="plugin-group" data-group="${group.key}">
        <h2 class="group-title">${group.title}</h2>
        <div class="plugin-grid">${plugins.map(renderPluginCard).join("")}</div>
      </section>
    `;
  }).join("");
}

function renderSheet() {
  if (!state.sheetOpen) return "";
  return `
    <button class="scrim" type="button" aria-label="Close sheet" data-action="close-sheet"></button>
    <section class="sheet ${state.sheetTall ? "tall" : ""}" aria-label="Add plugin sheet">
      <button class="sheet-handle" type="button" data-action="toggle-sheet-height" aria-label="Toggle sheet height"></button>
      <div class="sheet-head">
        <span></span>
        <div class="sheet-title">Add More</div>
        <button class="icon-button" type="button" data-action="close-sheet" aria-label="Close">${icon("close", 20)}</button>
      </div>
      <label class="sheet-search">
        ${icon("search", 18)}
        <input id="sheetSearch" type="search" value="${state.search}" placeholder="Search plugins" autocomplete="off" />
      </label>
      <div class="sheet-content">${renderSheetContent()}</div>
    </section>
  `;
}

function render() {
  app.innerHTML = `
    ${state.route === "learn" ? renderLearnPage() : renderChatPage()}
    ${renderSheet()}
    ${state.toast ? `<div class="toast" role="status">${state.toast}</div>` : ""}
  `;
}

function updateSheetContent() {
  const content = document.querySelector(".sheet-content");
  if (content) content.innerHTML = renderSheetContent();
}

function showToast(message) {
  state.toast = message;
  render();
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    state.toast = "";
    render();
  }, 1600);
}

function completeAddPlugin(id) {
  const plugin = getPlugin(id);
  state.pendingAddIds = state.pendingAddIds.filter((pluginId) => pluginId !== id);
  if (!plugin || state.pinnedIds.includes(id)) {
    if (state.sheetOpen) updateSheetContent();
    return;
  }
  if (state.maxReached) {
    showToast("顶部插件栏已达数量上限");
    return;
  }
  if (state.failNext) {
    state.failNext = false;
    failSwitch.checked = false;
    showToast("添加失败，请重试");
    return;
  }

  state.pinnedIds.push(id);
  if (state.sheetOpen) {
    state.sheetAddedIds = [...state.sheetAddedIds, id];
    if (state.recentDeletedIds.includes(id)) {
      state.sheetAddedFromRecentDeletedIds = [...state.sheetAddedFromRecentDeletedIds, id];
    }
  }
  state.recentDeletedIds = state.recentDeletedIds.filter((pluginId) => pluginId !== id);
  showToast(`已添加「${plugin.name}」`);
}

function addPlugin(id) {
  const plugin = getPlugin(id);
  const alreadyHandled = state.pinnedIds.includes(id)
    || state.sheetAddedIds.includes(id)
    || state.pendingAddIds.includes(id);
  if (!plugin || alreadyHandled) return;
  if (state.maxReached) {
    showToast("顶部插件栏已达数量上限");
    return;
  }

  if (!state.sheetOpen) {
    completeAddPlugin(id);
    return;
  }

  state.pendingAddIds = [...state.pendingAddIds, id];
  updateSheetContent();
  window.setTimeout(() => completeAddPlugin(id), 450);
}

function undoAddedPlugin(id) {
  if (!state.sheetAddedIds.includes(id)) return;

  state.pinnedIds = state.pinnedIds.filter((pluginId) => pluginId !== id);
  state.sheetAddedIds = state.sheetAddedIds.filter((pluginId) => pluginId !== id);
  if (state.sheetAddedFromRecentDeletedIds.includes(id)) {
    state.recentDeletedIds = [id, ...state.recentDeletedIds.filter((pluginId) => pluginId !== id)].slice(0, 20);
    state.sheetAddedFromRecentDeletedIds = state.sheetAddedFromRecentDeletedIds.filter((pluginId) => pluginId !== id);
  }
  showToast(`已撤销添加「${getPlugin(id)?.name || "插件"}」`);
}

function removePlugin(id) {
  if (!state.pinnedIds.includes(id)) return;
  state.pinnedIds = state.pinnedIds.filter((pluginId) => pluginId !== id);
  state.recentDeletedIds = [id, ...state.recentDeletedIds.filter((pluginId) => pluginId !== id)].slice(0, 20);
  showToast(`已移除「${getPlugin(id)?.name || "插件"}」`);
}

function openAddMoreFlow() {
  if (state.nativeSheetEnabled) {
    state.route = "chat";
    state.sheetOpen = true;
    state.sheetTall = false;
    state.search = "";
    state.sheetAddedIds = [];
    state.sheetAddedFromRecentDeletedIds = [];
    state.pendingAddIds = [];
  } else {
    state.route = "learn";
    state.sheetOpen = false;
  }
  render();
}

function reset() {
  Object.assign(state, {
    route: "chat",
    sheetOpen: false,
    sheetTall: false,
    search: "",
    nativeSheetEnabled: true,
    maxReached: false,
    failNext: false,
    toast: "",
    pinnedIds: [...initialPinnedIds],
    recentDeletedIds: ["live-lesson", "voice-room", "word-snake"],
    sheetAddedIds: [],
    sheetAddedFromRecentDeletedIds: [],
    pendingAddIds: []
  });
  nativeSwitch.checked = true;
  maxSwitch.checked = false;
  failSwitch.checked = false;
  render();
}

app.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  const addId = event.target.closest("[data-add]")?.dataset.add;
  const undoAddId = event.target.closest("[data-undo-add]")?.dataset.undoAdd;
  const removeId = event.target.closest("[data-remove]")?.dataset.remove;

  if (action === "add-more") openAddMoreFlow();
  if (action === "close-sheet") {
    state.sheetOpen = false;
    state.sheetAddedIds = [];
    state.sheetAddedFromRecentDeletedIds = [];
    state.pendingAddIds = [];
    render();
  }
  if (action === "toggle-sheet-height") {
    state.sheetTall = !state.sheetTall;
    render();
  }
  if (action === "back") {
    state.route = "chat";
    render();
  }
  if (addId) addPlugin(addId);
  if (undoAddId) undoAddedPlugin(undoAddId);
  if (removeId) removePlugin(removeId);
});

app.addEventListener("input", (event) => {
  if (event.target.id !== "sheetSearch") return;
  state.search = event.target.value;
  updateSheetContent();
});

app.addEventListener("scroll", (event) => {
  const content = event.target.closest?.(".sheet-content");
  if (!content || state.sheetTall) return;

  const contentOverflows = content.scrollHeight > content.clientHeight + 1;
  if (!contentOverflows || content.scrollTop <= 8) return;

  state.sheetTall = true;
  document.querySelector(".sheet")?.classList.add("tall");
}, true);

nativeSwitch.addEventListener("change", () => {
  state.nativeSheetEnabled = nativeSwitch.checked;
});

maxSwitch.addEventListener("change", () => {
  state.maxReached = maxSwitch.checked;
  if (state.sheetOpen) updateSheetContent();
});

failSwitch.addEventListener("change", () => {
  state.failNext = failSwitch.checked;
});

openAddMore.addEventListener("click", openAddMoreFlow);
resetDemo.addEventListener("click", reset);

window.__chatTopPluginDemo = {
  state,
  openAddMoreFlow,
  addPlugin,
  undoAddedPlugin,
  removePlugin,
  reset,
  dedupedGroups
};
render();
