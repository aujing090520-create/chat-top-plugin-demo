import fs from "node:fs";

const requiredFiles = [
  "index.html",
  "src/app.js",
  "src/logic.js",
  "src/styles.css",
  "public/assets/chat_home_header.png",
  "public/assets/chat_home_row_1.png",
  "public/assets/bottom_tab_chat_active.png",
  "public/assets/plugin_translate.png",
  "public/assets/plugin_game.png",
  "public/assets/plugin_calendar.png"
];

const requiredSnippets = [
  ["src/app.js", "nativeSheetEnabled"],
  ["src/logic.js", '{ key: "recentViewed", title: "最近浏览" }'],
  ["src/logic.js", "recentDeleted"],
  ["src/logic.js", "recommended"],
  ["src/logic.js", 'DEDUPE_PRIORITY = ["recentDeleted", "recentViewed", "recommended"]'],
  ["src/app.js", "顶部插件栏已达数量上限"],
  ["src/app.js", "添加失败，请重试"],
  ["src/app.js", "已撤销添加"],
  ["src/app.js", '"daily-quiz",'],
  ["src/app.js", '"pronunciation",'],
  ["src/app.js", '"grammar-coach",'],
  ["src/app.js", "chat_home_row_1.png"],
  ["src/app.js", "updateSheetContent()"],
  ["src/app.js", "sheetAddedIds"],
  ["src/app.js", "undoAddedPlugin"],
  ["src/app.js", "data-undo-add"],
  ["src/app.js", "pendingAddIds"],
  ["src/app.js", "contentOverflows"],
  ["src/app.js", 'classList.add("tall")'],
  ["src/app.js", "window.__chatTopPluginDemo"],
  ["src/styles.css", "grid-template-columns: repeat(5"],
  ["src/styles.css", "height: 586px"],
  ["src/styles.css", "width: 375px"],
  ["src/styles.css", "height: 812px"],
  ["index.html", "后台开关：原生半屏"]
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

for (const [file, snippet] of requiredSnippets) {
  const text = fs.readFileSync(file, "utf8");
  if (!text.includes(snippet)) {
    throw new Error(`Missing snippet in ${file}: ${snippet}`);
  }
}

const appText = fs.readFileSync("src/app.js", "utf8");
const logicText = fs.readFileSync("src/logic.js", "utf8");
const viewedIndex = logicText.indexOf('{ key: "recentViewed"');
const deletedIndex = logicText.indexOf('{ key: "recentDeleted"');
const recommendedIndex = logicText.indexOf('{ key: "recommended"');

if (!(viewedIndex < deletedIndex && deletedIndex < recommendedIndex)) {
  throw new Error("Sheet display order must be recentViewed -> recentDeleted -> recommended");
}

if (appText.includes("searchInput.focus()")) {
  throw new Error("Search input must not auto-focus after every render");
}

const recentViewedSource = appText.match(/recentViewed:\s*\[([^\]]*)\]/s)?.[1] || "";
const recommendedSource = appText.match(/recommended:\s*\[([^\]]*)\]/s)?.[1] || "";
for (const id of ["daily-quiz", "pronunciation", "grammar-coach"]) {
  if (!recommendedSource.includes(`"${id}"`) || recentViewedSource.includes(`"${id}"`)) {
    throw new Error(`Recommended-only candidate is misconfigured: ${id}`);
  }
}

console.log("Static demo validation passed.");
