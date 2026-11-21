const state = {
  categories: [],
  links: [],
  activeCategory: "all",
  query: ""
};

const els = {
  heroStats: document.getElementById("heroStats"),
  overviewGrid: document.getElementById("overviewGrid"),
  filters: document.getElementById("filters"),
  search: document.getElementById("search"),
  linkGrid: document.getElementById("linkGrid"),
  resultCount: document.getElementById("resultCount"),
  emptyState: document.getElementById("emptyState")
};

function mainElement() {
  return document.querySelector("main");
}

function renderLoadError() {
  const isFile = location.protocol === "file:";
  const message = isFile
    ? "The savanna needs a web server to graze. Run <code>python3 -m http.server</code> in this folder and open <code>http://localhost:8000</code>."
    : "Could not load <code>data.json</code>. Check that the file exists and is valid JSON.";
  mainElement().innerHTML = `<div class="empty-state"><span class="empty-emoji">🦒</span><p>${message}</p></div>`;
}

async function loadData() {
  const res = await fetch("data.json", { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function categoryById(id) {
  return state.categories.find((c) => c.id === id);
}

function linksFor(categoryId) {
  return state.links.filter((l) => l.category === categoryId);
}

function renderHeroStats() {
  els.heroStats.innerHTML = `
    <span class="stat-chip"><strong>${state.links.length}</strong> links</span>
    <span class="stat-chip"><strong>${state.categories.length}</strong> herds</span>
    <span class="stat-chip"><strong>${new Set(state.links.flatMap((l) => l.tags || [])).size}</strong> tags</span>
  `;
}

function categoryCardHtml(cat, count, preview) {
  return `
    <button class="herder-card" type="button" data-category="${cat.id}" style="--accent-color: ${cat.color};">
      <div class="herder-head">
        <span class="herder-icon">${cat.icon}</span>
        <span class="herder-count">${count} link${count === 1 ? "" : "s"}</span>
      </div>
      <h3>${cat.name}</h3>
      <p>${cat.description}</p>
      ${preview ? `<p class="herder-preview">${preview}…</p>` : ""}
    </button>
  `;
}

function allCategory() {
  return {
    id: "all",
    name: "The Whole Savanna",
    icon: "🌅",
    color: "#e8a33d",
    description: "Every link in the directory, no fences."
  };
}

function renderOverview() {
  const cards = [allCategory(), ...state.categories];

  els.overviewGrid.innerHTML = cards
    .map((cat) => {
      const count = cat.id === "all" ? state.links.length : linksFor(cat.id).length;
      const preview =
        cat.id === "all"
          ? ""
          : `${linksFor(cat.id)
              .map((l) => l.title)
              .slice(0, 3)
              .join(" • ")}…`;
      return categoryCardHtml(cat, count, preview);
    })
    .join("");

  els.overviewGrid.querySelectorAll(".herder-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      setFilter(btn.dataset.category);
      document.getElementById("directory").scrollIntoView({ behavior: "smooth" });
    });
  });
}

function renderFilters() {
  const chips = [allCategory(), ...state.categories];

  els.filters.innerHTML = chips
    .map((chip) => {
      const count = chip.id === "all" ? state.links.length : linksFor(chip.id).length;
      return `
        <button class="filter-btn" type="button" role="tab" aria-selected="false"
          data-category="${chip.id}" style="--accent-color: ${chip.color};">
          <span aria-hidden="true">${chip.icon}</span> ${chip.name}
          <span class="filter-count">${count}</span>
        </button>
      `;
    })
    .join("");

  els.filters.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.category));
  });
}

function matchingLinks() {
  const q = state.query.trim().toLowerCase();
  return state.links.filter((link) => {
    const inCategory = state.activeCategory === "all" || link.category === state.activeCategory;
    if (!inCategory) return false;
    if (!q) return true;
    const haystack = [
      link.title,
      link.description,
      (link.tags || []).join(" "),
      (categoryById(link.category) || {}).name || ""
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

function renderLinks() {
  const links = matchingLinks();

  els.resultCount.textContent = links.length
    ? `${links.length} link${links.length === 1 ? "" : "s"} in view`
    : "No links in view";

  els.linkGrid.innerHTML = links
    .map((link, i) => {
      const cat = categoryById(link.category);
      const color = cat ? cat.color : "#e8a33d";
      const tags = (link.tags || []).map((t) => `<span class="tag">#${t}</span>`).join("");
      return `
        <a class="link-card" href="${link.url}" target="_blank" rel="noopener"
           style="--accent-color: ${color}; animation-delay: ${Math.min(i * 45, 360)}ms;">
          <div class="link-top">
            <span class="category-badge">${cat ? `${cat.icon} ${cat.name}` : "Uncategorised"}</span>
          </div>
          <h3>${escapeHtml(link.title)}</h3>
          <p class="link-desc">${escapeHtml(link.description)}</p>
          <div class="tag-row">${tags}</div>
        </a>
      `;
    })
    .join("");

  els.emptyState.hidden = links.length > 0;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

function setFilter(categoryId) {
  state.activeCategory = categoryId;

  els.filters.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.setAttribute("aria-selected", String(btn.dataset.category === categoryId));
  });

  els.overviewGrid.querySelectorAll(".herder-card").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category === categoryId);
  });

  renderLinks();
}

async function init() {
  try {
    const data = await loadData();
    state.categories = data.categories || [];
    state.links = data.links || [];

    if (data.site) {
      if (data.site.brand) document.querySelector(".brand").textContent = data.site.brand;
      if (data.site.searchPlaceholder) els.search.placeholder = data.site.searchPlaceholder;
    }

    renderHeroStats();
    renderOverview();
    renderFilters();
    renderLinks();

    els.search.addEventListener("input", (e) => {
      state.query = e.target.value;
      renderLinks();
    });
  } catch (err) {
    renderLoadError();
  }
}

init();
