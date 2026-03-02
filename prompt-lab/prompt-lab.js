const CATEGORY_ORDER = [
  "All",
  "Professor Pro",
  "VOX",
  "Karaoke Ops",
  "Social Engine",
  "Web/GitHub",
  "Email/Admin"
];

const LS_FAV_KEY = "howard_promptlab_favourites_v1";
const LS_RECENT_KEY = "howard_promptlab_recent_v1";

const state = {
  prompts: [],
  query: "",
  category: "All",
  mode: "all", // all | fav | recent
  favourites: new Set(JSON.parse(localStorage.getItem(LS_FAV_KEY) || "[]")),
  recents: JSON.parse(localStorage.getItem(LS_RECENT_KEY) || "[]"),
  paletteOpen: false,
  paletteQuery: "",
  paletteIndex: 0
};

const els = {
  grid: document.getElementById("promptGrid"),
  chips: document.getElementById("categoryChips"),
  search: document.getElementById("searchInput"),
  toast: document.getElementById("toast"),
  showAllBtn: document.getElementById("showAllBtn"),
  showFavBtn: document.getElementById("showFavBtn"),
  showRecentBtn: document.getElementById("showRecentBtn"),
  palette: document.getElementById("palette"),
  paletteInput: document.getElementById("paletteInput"),
  paletteList: document.getElementById("paletteList")
};

function saveState() {
  localStorage.setItem(LS_FAV_KEY, JSON.stringify([...state.favourites]));
  localStorage.setItem(LS_RECENT_KEY, JSON.stringify(state.recents.slice(0, 20)));
}

function toast(msg) {
  els.toast.textContent = msg;
  els.toast.classList.add("show");
  setTimeout(() => els.toast.classList.remove("show"), 1400);
}

function cleanPromptText(prompt) {
  return prompt.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, "[$1]");
}

async function copyText(text, btn) {
  await navigator.clipboard.writeText(text);
  if (btn) {
    const prev = btn.textContent;
    btn.textContent = "Copied ✓";
    btn.classList.add("done");
    setTimeout(() => {
      btn.textContent = prev;
      btn.classList.remove("done");
    }, 1200);
  }
  toast("Copied to clipboard");
}

function registerRecent(id) {
  state.recents = [id, ...state.recents.filter((x) => x !== id)].slice(0, 20);
  saveState();
}

function toggleFavourite(id) {
  if (state.favourites.has(id)) state.favourites.delete(id);
  else state.favourites.add(id);
  saveState();
  render();
}

function cardTemplate(p, idx) {
  const isFav = state.favourites.has(p.id);
  const tags = p.tags.map((t) => `<span class="prompt-tag">${t}</span>`).join("");
  const vars = (p.variables || []).map(v => `<li><strong>${v.label}:</strong> <code>{{${v.key}}}</code> <em>(e.g. ${v.example})</em></li>`).join("");

  return `
    <article class="prompt-card" style="animation-delay:${Math.min(idx * 0.04, 0.32)}s">
      <div class="prompt-head">
        <h3 class="prompt-title">${p.title}</h3>
        <button class="prompt-btn fav-btn" data-fav="${p.id}" aria-label="Favourite" aria-pressed="${isFav}">${isFav ? "⭐" : "☆"}</button>
      </div>
      <p class="prompt-best"><strong>Best for:</strong> ${p.bestFor}</p>
      <div class="prompt-tags">${tags}</div>
      <div class="prompt-actions">
        <button class="prompt-btn" data-copy-clean="${p.id}">Copy Clean</button>
        <button class="prompt-btn" data-copy-vars="${p.id}">Copy With Variables</button>
      </div>
      <details class="prompt-details">
        <summary>Variables + Example</summary>
        <ul>${vars || "<li>No variables.</li>"}</ul>
        <p><strong>Example:</strong> ${p.example || "n/a"}</p>
      </details>
    </article>
  `;
}

function filterPrompts(base = state.prompts, query = state.query, category = state.category, mode = state.mode) {
  let items = [...base];

  if (mode === "fav") {
    items = items.filter((p) => state.favourites.has(p.id));
  } else if (mode === "recent") {
    const rank = new Map(state.recents.map((id, i) => [id, i]));
    items = items.filter((p) => rank.has(p.id)).sort((a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999));
  }

  if (category !== "All") {
    items = items.filter((p) => p.category === category);
  }

  if (!query.trim()) return items;
  const q = query.trim().toLowerCase();

  return items.filter((p) => {
    const blob = [
      p.title,
      p.category,
      p.bestFor,
      p.prompt,
      ...(p.tags || []),
      ...(p.variables || []).map((v) => `${v.key} ${v.label} ${v.example}`)
    ]
      .join(" ")
      .toLowerCase();
    return blob.includes(q);
  });
}

function renderChips() {
  els.chips.innerHTML = CATEGORY_ORDER.map((cat) => `
    <button class="chip ${state.category === cat ? "chip-active" : ""}" data-category="${cat}" role="tab" aria-selected="${state.category === cat}">${cat}</button>
  `).join("");
}

function renderModeButtons() {
  els.showAllBtn.classList.toggle("chip-active", state.mode === "all");
  els.showFavBtn.classList.toggle("chip-active", state.mode === "fav");
  els.showRecentBtn.classList.toggle("chip-active", state.mode === "recent");
}

function renderCards() {
  const list = filterPrompts();
  if (!list.length) {
    els.grid.innerHTML = `<div class="prompt-empty glass-panel">No prompts match this filter.</div>`;
    return;
  }
  els.grid.innerHTML = list.map((p, i) => cardTemplate(p, i)).join("");
}

function renderPalette() {
  const list = filterPrompts(state.prompts, state.paletteQuery, "All", "all");
  if (state.paletteIndex >= list.length) state.paletteIndex = Math.max(0, list.length - 1);

  els.paletteList.innerHTML = list
    .slice(0, 24)
    .map((p, i) => `<button type="button" class="palette-item ${i === state.paletteIndex ? "active" : ""}" data-pidx="${i}" role="option" aria-selected="${i === state.paletteIndex}"><strong>${p.title}</strong><br/><small>${p.category} · ${p.tags.join(", ")}</small></button>`)
    .join("");

  return list;
}

function openPalette() {
  state.paletteOpen = true;
  state.paletteQuery = "";
  state.paletteIndex = 0;
  els.palette.classList.remove("hidden");
  els.palette.setAttribute("aria-hidden", "false");
  els.paletteInput.value = "";
  renderPalette();
  els.paletteInput.focus();
}

function closePalette() {
  state.paletteOpen = false;
  els.palette.classList.add("hidden");
  els.palette.setAttribute("aria-hidden", "true");
}

function bindEvents() {
  document.addEventListener("click", async (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.dataset.category) {
      state.category = target.dataset.category;
      render();
      return;
    }

    if (target.dataset.fav) {
      toggleFavourite(target.dataset.fav);
      return;
    }

    if (target.dataset.copyClean) {
      const p = state.prompts.find((x) => x.id === target.dataset.copyClean);
      if (p) {
        await copyText(cleanPromptText(p.prompt), target);
        registerRecent(p.id);
      }
      return;
    }

    if (target.dataset.copyVars) {
      const p = state.prompts.find((x) => x.id === target.dataset.copyVars);
      if (p) {
        await copyText(p.prompt, target);
        registerRecent(p.id);
      }
      return;
    }

    if (target.dataset.close) {
      closePalette();
      return;
    }

    if (target.dataset.pidx && state.paletteOpen) {
      state.paletteIndex = Number(target.dataset.pidx);
      const list = renderPalette();
      const p = list[state.paletteIndex];
      if (p) {
        copyText(cleanPromptText(p.prompt));
        registerRecent(p.id);
        closePalette();
      }
    }
  });

  els.search.addEventListener("input", () => {
    state.query = els.search.value;
    renderCards();
  });

  els.showAllBtn.addEventListener("click", () => { state.mode = "all"; render(); });
  els.showFavBtn.addEventListener("click", () => { state.mode = "fav"; render(); });
  els.showRecentBtn.addEventListener("click", () => { state.mode = "recent"; render(); });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      state.paletteOpen ? closePalette() : openPalette();
      return;
    }

    if (!state.paletteOpen) return;

    if (e.key === "Escape") {
      closePalette();
      return;
    }

    const list = renderPalette();

    if (e.key === "Tab") return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      state.paletteIndex = Math.min(state.paletteIndex + 1, Math.max(0, list.length - 1));
      renderPalette();
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      state.paletteIndex = Math.max(0, state.paletteIndex - 1);
      renderPalette();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const p = list[state.paletteIndex];
      if (!p) return;
      copyText(cleanPromptText(p.prompt));
      registerRecent(p.id);
      closePalette();
      return;
    }
  });

  els.paletteInput.addEventListener("input", () => {
    state.paletteQuery = els.paletteInput.value;
    state.paletteIndex = 0;
    renderPalette();
  });
}

function render() {
  renderChips();
  renderModeButtons();
  renderCards();
}

async function init() {
  const res = await fetch("../assets/prompts.json", { cache: "no-store" });
  const data = await res.json();
  state.prompts = data.prompts || [];
  bindEvents();
  render();
}

init().catch((err) => {
  els.grid.innerHTML = `<div class="prompt-empty">Failed to load prompts: ${err.message}</div>`;
});
