const PALETTE = ["#e8a33d", "#c96f4a", "#9ba65d", "#d4b483", "#a97e5f", "#c9a227", "#7e9b76", "#b98cd4"];

const state = {
  items: [],
  categories: [],
  enabled: new Set(),
  query: ""
};

const els = {
  heroStats: document.getElementById("heroStats"),
  toggles: document.getElementById("toggles"),
  toggleAllBtn: document.getElementById("toggleAllBtn"),
  search: document.getElementById("search"),
  columns: document.getElementById("columns"),
  resultCount: document.getElementById("resultCount"),
  emptyState: document.getElementById("emptyState"),
  emptyMessage: document.getElementById("emptyMessage")
};

function renderLoadError() {
  const isFile = location.protocol === "file:";
  const message = isFile
    ? "The savanna needs a web server to graze. Run <code>python3 -m http.server</code> in this folder and open <code>http://localhost:8000</code>."
    : "Could not load <code>catalog.json</code>. Check that the file exists and is valid JSON.";
  document.querySelector("main").innerHTML = `<div class="empty-state"><span class="empty-emoji">🦒</span><p>${message}</p></div>`;
}

async function loadData() {
  const res = await fetch("catalog.json", { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("catalog.json must be an array");
  return data;
}

function deriveCategories(items) {
  const order = [];
  const seen = new Set();
  for (const item of items) {
    const name = (item.category || "Uncategorised").trim();
    if (!seen.has(name)) {
      seen.add(name);
      order.push(name);
    }
  }
  return order.map((name, i) => ({
    id: name,
    name,
    color: PALETTE[i % PALETTE.length]
  }));
}

function normalizeItem(item, index) {
  return {
    name: (item.name || item.title || `Untitled link ${index + 1}`).trim(),
    url: (item.url || item.link || "#").trim(),
    category: (item.category || "Uncategorised").trim(),
    description: (item.description || "").trim()
  };
}

function hostOf(url) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch (err) {
    return url;
  }
}

function renderHeroStats() {
  els.heroStats.innerHTML = `
    <span class="stat-chip"><strong>${state.items.length}</strong> links</span>
    <span class="stat-chip"><strong>${state.categories.length}</strong> herds</span>
    <span class="stat-chip"><strong>${state.enabled.size}</strong> herds in view</span>
  `;
}

function categoryColor(id) {
  const cat = state.categories.find((c) => c.id === id);
  return cat ? cat.color : "#e8a33d";
}

function hexWithAlpha(hex, alpha) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function renderToggles() {
  els.toggles.innerHTML = state.categories
    .map((cat) => {
      const count = state.items.filter((item) => item.category === cat.id).length;
      return `
        <button class="toggle-btn" type="button" aria-pressed="true" data-category="${escapeHtml(cat.id)}"
          style="--accent-color: ${cat.color};">
          <span class="toggle-dot" aria-hidden="true"></span>
          ${escapeHtml(cat.name)}
          <span class="toggle-count">${count}</span>
        </button>
      `;
    })
    .join("");

  els.toggles.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.category;
      const on = !state.enabled.has(id);
      if (on) state.enabled.add(id);
      else state.enabled.delete(id);
      btn.setAttribute("aria-pressed", String(on));
      renderView();
    });
  });

  syncToggleAllBtn();
}

function syncToggleAllBtn() {
  const allOn = state.enabled.size === state.categories.length;
  els.toggleAllBtn.textContent = allOn ? "Hide all" : "Show all";
}

function matches(item) {
  const q = state.query.trim().toLowerCase();
  if (!q) return true;
  return [item.name, item.description, item.url, item.category].join(" ").toLowerCase().includes(q);
}

function cardHtml(item, color, index) {
  const desc = item.description ? `<p class="link-desc">${escapeHtml(item.description)}</p>` : "";
  return `
    <a class="link-card" href="${escapeHtml(item.url)}" target="_blank" rel="noopener"
       style="--accent-color: ${color}; animation-delay: ${Math.min(index * 40, 320)}ms;">
      <h3 class="link-name">${escapeHtml(item.name)}</h3>
      ${desc}
      <span class="link-host">${escapeHtml(hostOf(item.url))}</span>
    </a>
  `;
}

function renderColumns() {
  const q = state.query.trim().toLowerCase();
  const visible = state.categories.filter((c) => state.enabled.has(c.id));

  els.columns.innerHTML = visible
    .map((cat, columnIndex) => {
      const items = state.items.filter((item) => item.category === cat.id && matches(item));
      let body;
      if (items.length === 0) {
        body = `<div class="column-empty">${
          q ? `No matches in this herd.` : "No links in this herd yet."
        }</div>`;
      } else {
        body = items.map((item, i) => cardHtml(item, cat.color, i)).join("");
      }
      return `
        <section class="column" style="--accent-color: ${cat.color}; --accent-faint: ${hexWithAlpha(cat.color, 0.14)}; animation-delay: ${Math.min(columnIndex * 70, 350)}ms;">
          <div class="column-head">
            <p class="column-count">${items.length} link${items.length === 1 ? "" : "s"}${q ? " matching" : ""}</p>
            <h2 class="column-title">${escapeHtml(cat.name)}</h2>
          </div>
          <div class="column-body">
            ${body}
          </div>
        </section>
      `;
    })
    .join("");

  const totalVisible = state.items.filter((item) => state.enabled.has(item.category) && matches(item)).length;
  els.resultCount.textContent = `${totalVisible} of ${state.items.length} links in view · ${visible.length} of ${state.categories.length} herds`;

  if (visible.length === 0) {
    els.emptyMessage.textContent = "All herds are switched off. Hit “Show all” to bring the savanna back.";
    els.emptyState.hidden = false;
  } else if (totalVisible === 0) {
    els.emptyMessage.textContent = `No links match “${escapeHtml(state.query.trim())}”. Try another word or clear the search.`;
    els.emptyState.hidden = false;
  } else {
    els.emptyState.hidden = true;
  }
}

function renderView() {
  renderColumns();
  renderHeroStats();
  syncToggleAllBtn();
}

function syncToolbarOffset() {
  const header = document.querySelector(".site-header");
  const toolbar = document.querySelector(".toolbar-sticky");
  if (header && toolbar) toolbar.style.top = header.offsetHeight + 6 + "px";
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

async function init() {
  try {
    const raw = await loadData();
    state.items = raw.map(normalizeItem);
    state.categories = deriveCategories(state.items);
    state.enabled = new Set(state.categories.map((c) => c.id));

    renderHeroStats();
    renderToggles();
    renderColumns();
    syncToolbarOffset();
    window.addEventListener("resize", syncToolbarOffset);

    els.search.addEventListener("input", (e) => {
      state.query = e.target.value;
      renderColumns();
    });

    els.toggleAllBtn.addEventListener("click", () => {
      const allOn = state.enabled.size === state.categories.length;
      state.enabled = allOn ? new Set() : new Set(state.categories.map((c) => c.id));
      els.toggles.querySelectorAll(".toggle-btn").forEach((btn) => {
        btn.setAttribute("aria-pressed", String(state.enabled.has(btn.dataset.category)));
      });
      renderView();
    });
  } catch (err) {
    renderLoadError();
  }
}

init();
