const textarea = document.getElementById("prefixes");
const template = document.getElementById("urlTemplate");
const saveBtn = document.getElementById("save");
const status = document.getElementById("status");

const DEFAULT_URL_TEMPLATE = "https://www.google.com/search?q={query}";

async function load() {
  const stored = await browser.storage.local.get(["prefixes", "urlTemplate"]);
  textarea.value = (stored.prefixes || []).join("\n");
  template.value = stored.urlTemplate || DEFAULT_URL_TEMPLATE;
}

saveBtn.addEventListener("click", async () => {
  const prefixes = [...new Set(
    textarea.value.split("\n").map((s) => s.trim()).filter(Boolean)
  )];
  await browser.storage.local.set({
    prefixes,
    urlTemplate: template.value.trim() || DEFAULT_URL_TEMPLATE,
  });
  status.textContent = "Saved";
  setTimeout(() => (status.textContent = ""), 1500);
});

load();
