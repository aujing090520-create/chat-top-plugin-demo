export const DISPLAY_GROUPS = [
  { key: "recentViewed", title: "最近浏览" },
  { key: "recentDeleted", title: "最近删除" },
  { key: "recommended", title: "推荐添加" }
];

export const DEDUPE_PRIORITY = ["recentDeleted", "recentViewed", "recommended"];

export function buildDedupedGroups({
  catalog,
  pinnedIds,
  recentViewedIds,
  recentDeletedIds,
  recommendedIds
}) {
  const pinned = new Set(pinnedIds);
  const candidates = {
    recentViewed: recentViewedIds,
    recentDeleted: recentDeletedIds,
    recommended: recommendedIds
  };
  const owner = new Map();

  for (const key of DEDUPE_PRIORITY) {
    for (const id of candidates[key]) {
      if (!pinned.has(id) && !owner.has(id)) owner.set(id, key);
    }
  }

  return DISPLAY_GROUPS.map((group) => ({
    ...group,
    plugins: catalog.filter((plugin) => owner.get(plugin.id) === group.key)
  }));
}

export function filterAvailablePlugins(catalog, pinnedIds, query = "") {
  const pinned = new Set(pinnedIds);
  const normalizedQuery = query.trim().toLowerCase();
  return catalog.filter((plugin) => {
    if (pinned.has(plugin.id)) return false;
    return !normalizedQuery || plugin.name.toLowerCase().includes(normalizedQuery);
  });
}

export function getSheetExcludedPinnedIds(pinnedIds, addedThisSessionIds) {
  const addedThisSession = new Set(addedThisSessionIds);
  return pinnedIds.filter((id) => !addedThisSession.has(id));
}
