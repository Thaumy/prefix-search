(() => {
  if (window.top !== window) return;

  let menu = null;

  function closeMenu() {
    if (menu) menu.remove();
    menu = null;
  }

  async function onContextMenu(e) {
    closeMenu();
    const text = window.getSelection().toString().trim();
    if (!text) return;
    const stored = await browser.storage.local.get("prefixes");
    const prefixes = (stored.prefixes || []).map((p) => p.trim()).filter(Boolean);
    if (!prefixes.length) return;
    e.preventDefault();
    e.stopPropagation();
    showMenu(e.clientX, e.clientY, text, prefixes);
  }

  function showMenu(x, y, text, prefixes) {
    menu = document.createElement("div");
    menu.id = "ps-menu";
    const title = document.createElement("div");
    title.className = "ps-title";
    title.textContent = text.length > 80 ? text.slice(0, 80) + "…" : text;
    menu.appendChild(title);
    for (const prefix of prefixes) {
      const btn = document.createElement("button");
      btn.textContent = prefix + " " + text;
      btn.addEventListener("click", () => {
        browser.runtime.sendMessage({ type: "ps-search", prefix, text });
        closeMenu();
      });
      menu.appendChild(btn);
    }
    document.documentElement.appendChild(menu);
    const rect = menu.getBoundingClientRect();
    menu.style.left = Math.max(4, Math.min(x, window.innerWidth - rect.width - 4)) + "px";
    menu.style.top = Math.max(4, Math.min(y, window.innerHeight - rect.height - 4)) + "px";
  }

  document.addEventListener("contextmenu", onContextMenu, true);
  document.addEventListener(
    "mousedown",
    (e) => {
      if (menu && !menu.contains(e.target)) closeMenu();
    },
    true
  );
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") closeMenu();
    },
    true
  );
  window.addEventListener("blur", closeMenu);
  window.addEventListener("scroll", closeMenu, true);
  window.addEventListener("resize", closeMenu);
})();
