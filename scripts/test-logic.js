import assert from "node:assert/strict";
import {
  buildDedupedGroups,
  DEDUPE_PRIORITY,
  DISPLAY_GROUPS,
  filterAvailablePlugins,
  getSheetExcludedPinnedIds
} from "../src/logic.js";

const catalog = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Beta" },
  { id: "c", name: "Class" },
  { id: "d", name: "Draw" }
];

assert.deepEqual(
  DISPLAY_GROUPS.map((group) => group.key),
  ["recentViewed", "recentDeleted", "recommended"]
);
assert.deepEqual(DEDUPE_PRIORITY, ["recentDeleted", "recentViewed", "recommended"]);

const groups = buildDedupedGroups({
  catalog,
  pinnedIds: ["a"],
  recentViewedIds: ["a", "b", "c"],
  recentDeletedIds: ["b"],
  recommendedIds: ["b", "c", "d"]
});

assert.deepEqual(groups[0].plugins.map((plugin) => plugin.id), ["c"]);
assert.deepEqual(groups[1].plugins.map((plugin) => plugin.id), ["b"]);
assert.deepEqual(groups[2].plugins.map((plugin) => plugin.id), ["d"]);
assert.deepEqual(
  filterAvailablePlugins(catalog, ["a"], "cl").map((plugin) => plugin.id),
  ["c"]
);

const currentSessionExcluded = getSheetExcludedPinnedIds(["a", "b"], ["b"]);
assert.deepEqual(currentSessionExcluded, ["a"]);
assert.deepEqual(
  filterAvailablePlugins(catalog, currentSessionExcluded).map((plugin) => plugin.id),
  ["b", "c", "d"]
);

const reopenedSessionExcluded = getSheetExcludedPinnedIds(["a", "b"], []);
assert.deepEqual(reopenedSessionExcluded, ["a", "b"]);
assert.deepEqual(
  filterAvailablePlugins(catalog, reopenedSessionExcluded).map((plugin) => plugin.id),
  ["c", "d"]
);

console.log("Demo logic tests passed.");
