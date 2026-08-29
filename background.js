const MENU_ID = "ps-open";
const DEFAULT_URL_TEMPLATE = "https://www.google.com/search?q={query}";

async function getConfig() {
  const stored = await browser.storage.local.get(["prefixes", "urlTemplate"]);
  return {
    prefixes: [...new Set((stored.prefixes || []).map((p) => p.trim()).filter(Boolean))],
    urlTemplate: stored.urlTemplate || DEFAULT_URL_TEMPLATE,
  };
}

function searchUrl(urlTemplate, prefix, text) {
  return urlTemplate.replace("{query}", encodeURIComponent(prefix + " " + text));
}

async function updateMenus() {
  await browser.contextMenus.removeAll();
  const { prefixes } = await getConfig();
  if (!prefixes.length) return;
  browser.contextMenus.create({
    id: MENU_ID,
    title: `Prefix search: ${prefixes[0]} "%s"`,
    contexts: ["selection"],
  });
}

async function openSearch(url) {
  let index;
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab && typeof tab.index === "number") index = tab.index + 1;
  } catch (e) {}
  await browser.tabs.create({ url, index });
}

browser.contextMenus.onClicked.addListener(async (info) => {
  const selection = (info.selectionText || "").trim();
  if (!selection) return;
  const { prefixes, urlTemplate } = await getConfig();
  if (!prefixes.length) return;
  await openSearch(searchUrl(urlTemplate, prefixes[0], selection));
});

browser.runtime.onMessage.addListener(async (msg) => {
  if (!msg || msg.type !== "ps-search") return;
  const { prefixes, urlTemplate } = await getConfig();
  if (!prefixes.includes(msg.prefix)) return;
  await openSearch(searchUrl(urlTemplate, msg.prefix, msg.text || ""));
});

updateMenus();
browser.runtime.onInstalled.addListener(updateMenus);
browser.storage.onChanged.addListener(updateMenus);
