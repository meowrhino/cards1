// ── Data ──────────────────────────────────────────────

const DEFAULT_EFFECTS = [
  { id: "eff-01", name: "Power Up",    symbol: "✦", description: "Aumenta ataque en 2" },
  { id: "eff-02", name: "Shield",      symbol: "⊕", description: "Aumenta defensa en 3" },
  { id: "eff-03", name: "Drain",       symbol: "↓", description: "Roba 1 punto de vida al atacar" },
  { id: "eff-04", name: "Pierce",      symbol: "→", description: "Ignora parte de la defensa" },
  { id: "eff-05", name: "Stun",        symbol: "×", description: "El rival pierde un turno" },
];

const DEFAULT_CARDS = [
  { id: "c01", name: "Dragon",          emoji: "🐉", attack: 8, defense: 5, directAttack: 3, effectId: null },
  { id: "c02", name: "Caballero",       emoji: "🗡️", attack: 6, defense: 6, directAttack: 2, effectId: null },
  { id: "c03", name: "Golem",           emoji: "🪨", attack: 3, defense: 9, directAttack: 0, effectId: null },
  { id: "c04", name: "Fantasma",        emoji: "👻", attack: 5, defense: 2, directAttack: 6, effectId: null },
  { id: "c05", name: "Lobo",            emoji: "🐺", attack: 7, defense: 3, directAttack: 4, effectId: null },
  { id: "c06", name: "Tortuga",         emoji: "🐢", attack: 2, defense: 9, directAttack: 1, effectId: null },
  { id: "c07", name: "Fenix",           emoji: "🔥", attack: 7, defense: 4, directAttack: 5, effectId: null },
  { id: "c08", name: "Serpiente",       emoji: "🐍", attack: 6, defense: 3, directAttack: 5, effectId: null },
  { id: "c09", name: "Treant",          emoji: "🌳", attack: 3, defense: 8, directAttack: 1, effectId: null },
  { id: "c10", name: "Halcon",          emoji: "🦅", attack: 5, defense: 2, directAttack: 7, effectId: null },
  { id: "c11", name: "Kraken",          emoji: "🐙", attack: 8, defense: 6, directAttack: 2, effectId: null },
  { id: "c12", name: "Murcielago",      emoji: "🦇", attack: 4, defense: 3, directAttack: 6, effectId: null },
  { id: "c13", name: "Escorpion",       emoji: "🦂", attack: 6, defense: 4, directAttack: 4, effectId: null },
  { id: "c14", name: "Yeti",            emoji: "❄️", attack: 7, defense: 7, directAttack: 1, effectId: null },
  { id: "c15", name: "Araña",           emoji: "🕷️", attack: 4, defense: 3, directAttack: 5, effectId: null },
  { id: "c16", name: "Minotauro",       emoji: "🐂", attack: 8, defense: 5, directAttack: 2, effectId: null },
  { id: "c17", name: "Medusa",          emoji: "🐍", attack: 5, defense: 4, directAttack: 4, effectId: null },
  { id: "c18", name: "Elemental",       emoji: "⚡", attack: 6, defense: 3, directAttack: 6, effectId: null },
  { id: "c19", name: "Oso",             emoji: "🐻", attack: 7, defense: 6, directAttack: 2, effectId: null },
  { id: "c20", name: "Sombra",          emoji: "🌑", attack: 4, defense: 2, directAttack: 8, effectId: null },
];

function loadData() {
  const raw = localStorage.getItem("cards-data");
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { /* fall through */ }
  }
  const initial = { effects: DEFAULT_EFFECTS, cards: DEFAULT_CARDS };
  saveData(initial);
  return initial;
}

function saveData(data) {
  localStorage.setItem("cards-data", JSON.stringify(data));
}

let data = loadData();

// ── Views ─────────────────────────────────────────────

function showView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  if (id === "viewer") renderGrid();
  if (id === "creator") {
    populateEffectSelect();
    updatePreview();
  }
}

// ── Card HTML ─────────────────────────────────────────

function getEffectById(id) {
  return data.effects.find(e => e.id === id) || null;
}

function renderCard(card, opts = {}) {
  const eff = card.effectId ? getEffectById(card.effectId) : null;
  const deleteBtn = opts.deletable
    ? `<button class="delete-btn" onclick="deleteCard('${card.id}', event)" title="Eliminar">x</button>`
    : "";

  return `
    <div class="card">
      ${deleteBtn}
      <div class="card-name">${esc(card.name)}</div>
      <div class="card-emoji">${esc(card.emoji)}</div>
      <div class="card-effect ${eff ? "" : "empty"}">${eff ? esc(eff.symbol) : ""}</div>
      <div class="card-stats">
        <span class="stat stat-atk">${card.attack}</span>
        <span class="stat stat-dir">${card.directAttack}</span>
        <span class="stat stat-def">${card.defense}</span>
      </div>
    </div>
  `;
}

function esc(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

// ── Viewer ────────────────────────────────────────────

function renderGrid() {
  const grid = document.getElementById("card-grid");
  const empty = document.getElementById("no-cards");

  if (data.cards.length === 0) {
    grid.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  grid.innerHTML = data.cards.map(c => renderCard(c, { deletable: true })).join("");
}

function deleteCard(id, event) {
  event.stopPropagation();
  if (!confirm("¿Eliminar esta carta?")) return;
  data.cards = data.cards.filter(c => c.id !== id);
  saveData(data);
  renderGrid();
}

// ── Creator ───────────────────────────────────────────

function populateEffectSelect() {
  const sel = document.getElementById("f-effect");
  sel.innerHTML = `<option value="">Sin efecto</option>` +
    data.effects.map(e => `<option value="${e.id}">${e.symbol} ${esc(e.name)}</option>`).join("");
}

function getFormCard() {
  return {
    id: "",
    name: document.getElementById("f-name").value,
    emoji: document.getElementById("f-emoji").value,
    attack: parseInt(document.getElementById("f-attack").value) || 0,
    defense: parseInt(document.getElementById("f-defense").value) || 0,
    directAttack: parseInt(document.getElementById("f-direct").value) || 0,
    effectId: document.getElementById("f-effect").value || null,
  };
}

function updatePreview() {
  const card = getFormCard();
  card.name = card.name || "Nombre";
  card.emoji = card.emoji || "?";
  document.getElementById("card-preview").innerHTML = renderCard(card);
}

function saveCard(event) {
  event.preventDefault();
  const card = getFormCard();
  card.id = "card-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  data.cards.push(card);
  saveData(data);
  document.getElementById("card-form").reset();
  updatePreview();
  alert("Carta guardada: " + card.name);
}

// Live preview on input change
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("card-form");
  form.addEventListener("input", updatePreview);
  form.addEventListener("change", updatePreview);
});

// ── Export ZIP ─────────────────────────────────────────

async function exportZip() {
  if (data.cards.length === 0) {
    alert("No hay cartas para exportar.");
    return;
  }

  const zip = new JSZip();

  // data.json (index with effects + card references)
  const index = {
    effects: data.effects,
    cards: data.cards.map(c => ({ id: c.id, filename: "cards/" + c.id + ".json" })),
  };
  zip.file("data.json", JSON.stringify(index, null, 2));

  // Individual card files
  const cardsFolder = zip.folder("cards");
  for (const card of data.cards) {
    cardsFolder.file(card.id + ".json", JSON.stringify(card, null, 2));
  }

  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, "cards-export.zip");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Import ZIP ────────────────────────────────────────

async function importZip(event) {
  const file = event.target.files[0];
  if (!file) return;
  event.target.value = "";

  try {
    const zip = await JSZip.loadAsync(file);

    // Read data.json
    const dataFile = zip.file("data.json");
    if (!dataFile) {
      alert("ZIP inválido: no contiene data.json");
      return;
    }
    const index = JSON.parse(await dataFile.async("string"));

    // Read effects
    if (index.effects && Array.isArray(index.effects)) {
      data.effects = index.effects;
    }

    // Read each card file
    if (index.cards && Array.isArray(index.cards)) {
      for (const ref of index.cards) {
        const cardFile = zip.file(ref.filename);
        if (cardFile) {
          const card = JSON.parse(await cardFile.async("string"));
          // Avoid duplicates by id
          const existing = data.cards.findIndex(c => c.id === card.id);
          if (existing >= 0) {
            data.cards[existing] = card;
          } else {
            data.cards.push(card);
          }
        }
      }
    }

    saveData(data);
    alert("Importación completada: " + index.cards.length + " carta(s)");
  } catch (e) {
    alert("Error al importar: " + e.message);
  }
}
