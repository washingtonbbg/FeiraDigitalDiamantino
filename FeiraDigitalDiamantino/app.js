// util
const $ = (sel) => document.querySelector(sel);
const fmtMoney = (n) => (window.AGRO_CFG.currency + " " + n.toFixed(2).replace(".", ","));

let products = [];
let cart = {}; // { productId: {qty, price, name, unit} }

// CSV parser simples (suporta campos com vírgula entre aspas)
function parseCSV(csvText) {
  const rows = [];
  let current = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];
    const nc = csvText[i + 1];

    if (c === '"' && inQuotes && nc === '"') { field += '"'; i++; continue; }
    if (c === '"') { inQuotes = !inQuotes; continue; }
    if (c === "," && !inQuotes) { current.push(field); field = ""; continue; }
    if ((c === "\n" || c === "\r") && !inQuotes) {
      if (field !== "" || current.length > 0) { current.push(field); rows.push(current); current = []; field = ""; }
      continue;
    }
    field += c;
  }
  if (field !== "" || current.length > 0) { current.push(field); rows.push(current); }

  return rows;
}

function csvToObjects(csvText) {
  const rows = parseCSV(csvText).filter(r => r.length && r.some(v => v.trim() !== ""));
  if (!rows.length) return [];
  const header = rows[0].map(h => h.trim());
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const obj = {};
    header.forEach((h, idx) => obj[h] = (rows[i][idx] ?? "").trim());
    out.push(obj);
  }
  return out;
}

async function load() {
  // Branding e configs
  $("#brandTitle").textContent = window.AGRO_CFG.brandName;
  $("#brandFoot").textContent = window.AGRO_CFG.brandName;
  $("#pixKey").textContent = window.AGRO_CFG.pixKey;

  // Pontos de entrega
  const pp = $("#pickupPoint");
  window.AGRO_CFG.pickupPoints.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p; opt.textContent = p; pp.appendChild(opt);
  });

  // Carrega produtos: CSV → fallback JSON local
  try {
    if (window.AGRO_CFG.csvUrl && window.AGRO_CFG.csvUrl.startsWith("http")) {
      const raw = await fetch(window.AGRO_CFG.csvUrl).then(r => {
        if (!r.ok) throw new Error("Falha ao baixar CSV do Google Sheets");
        return r.text();
      });
      const objs = csvToObjects(raw);
      products = objs.map((o, idx) => ({
        id: Number(o.id || idx + 1),
        name: o.name || o.nome || "",
        unit: (o.unit || o.unidade || "").toLowerCase(),
        price: Number(String(o.price || o.preco || "0").replace(",", ".")),
        stock: Number(o.stock || o.estoque || 0),
        photo: o.photo || o.foto_url || ""
      })).filter(p => p.name);
    } else {
      products = await fetch("products.json").then(r => r.json());
    }
  } catch (e) {
    console.error(e);
    alert("Não foi possível carregar o catálogo. Verifique a URL do CSV ou o arquivo products.json.");
    products = [];
  }

  renderUnitFilter(products);
  renderProducts(products);
  bindEvents();
}

function bindEvents() {
  $("#search").addEventListener("input", applyFilters);
  $("#unitFilter").addEventListener("change", applyFilters);
  $("#whatsBtn").addEventListener("click", sendWhatsApp);
}

function renderUnitFilter(list) {
  const sel = $("#unitFilter");
  const units = Array.from(new Set(list.map(p => p.unit).filter(Boolean)));
  // limpa mantendo a primeira opção
  sel.querySelectorAll("option:not(:first-child)").forEach(o => o.remove());
  units.sort().forEach(u => {
    const opt = document.createElement("option");
    opt.value = u;
    opt.textContent = u;
    sel.appendChild(opt);
  });
}

function applyFilters() {
  const q = $("#search").value.trim().toLowerCase();
  const unit = $("#unitFilter").value;

  const filtered = products.filter(p => {
    const okQ = !q || p.name.toLowerCase().includes(q);
    const okU = !unit || p.unit === unit;
    return okQ && okU;
  });

  renderProducts(filtered);
}

function renderProducts(list) {
  const grid = $("#productGrid");
  grid.innerHTML = "";

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    const priceStr = fmtMoney(p.price);
    card.innerHTML = `
      <img src="${p.photo || ""}" alt="${p.name}" loading="lazy"/>
      <div class="info">
        <div class="badge">${p.unit || "unidade"}</div>
        <h3>${p.name}</h3>
        <div class="muted">Estoque: ${p.stock ?? 0}</div>
        <div class="price">${priceStr}</div>
        <div class="add-row">
          <input type="number" min="1" max="${p.stock ?? 999}" value="1" id="qty-${p.id}" />
          <button class="btn-primary" data-id="${p.id}">Adicionar</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const prod = products.find(x => x.id === id);
      const qtyEl = document.getElementById(`qty-${id}`);
      const qty = Math.max(1, Number(qtyEl?.value || 1));
      addToCart(prod, qty);
    });
  });
}

function addToCart(prod, qty) {
  if (!prod) return;
  const key = String(prod.id);
  if (!cart[key]) {
    cart[key] = { qty: 0, price: prod.price, name: prod.name, unit: prod.unit };
  }
  cart[key].qty += qty;
  renderCart();
}

function renderCart() {
  const box = $("#cartItems");
  box.innerHTML = "";

  let total = 0;
  Object.entries(cart).forEach(([id, item]) => {
    const sub = item.qty * item.price;
    total += sub;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div>
        <div><strong>${item.name}</strong> • ${item.qty} ${item.unit}</div>
        <div class="muted">${fmtMoney(item.price)} / ${item.unit}</div>
      </div>
      <div>
        <button class="btn" data-id="${id}" data-act="minus" aria-label="Diminuir quantidade">-</button>
        <button class="btn" data-id="${id}" data-act="plus" aria-label="Aumentar quantidade">+</button>
        <button class="btn" data-id="${id}" data-act="del" aria-label="Remover item">x</button>
      </div>
    `;
    box.appendChild(row);
  });

  $("#cartTotal").textContent = fmtMoney(total);

  box.querySelectorAll("button").forEach(b => {
    b.addEventListener("click", () => {
      const id = b.dataset.id;
      const act = b.dataset.act;
      if (!cart[id]) return;

      if (act === "minus") cart[id].qty = Math.max(1, cart[id].qty - 1);
      if (act === "plus") cart[id].qty += 1;
      if (act === "del") delete cart[id];

      renderCart();
    });
  });
}

function buildWhatsMessage() {
  const name = $("#buyerName").value.trim();
  const ppoint = $("#pickupPoint").value;
  const items = Object.values(cart);
  if (items.length === 0) return { ok:false, msg:"Carrinho vazio." };
  if (!name) return { ok:false, msg:"Informe seu nome." };
  if (!ppoint) return { ok:false, msg:"Selecione o ponto de entrega." };

  let text = `Olá! Quero confirmar um pedido na *${window.AGRO_CFG.brandName}*:%0A`;
  let total = 0;
  items.forEach((it, idx) => {
    const sub = it.qty * it.price; total += sub;
    text += `%0A${idx+1}) ${it.name} • ${it.qty} ${it.unit} — ${fmtMoney(sub)}`;
  });
  text += `%0A%0ATotal: ${fmtMoney(total)}`;
  text += `%0ACliente: ${encodeURIComponent(name)}`;
  text += `%0APonto de entrega: ${encodeURIComponent(ppoint)}`;
  text += `%0APagarei via PIX (${encodeURIComponent(window.AGRO_CFG.pixKey)}).`;

  return { ok:true, text };
}

function sendWhatsApp() {
  const build = buildWhatsMessage();
  if (!build.ok) { alert(build.msg); return; }
  const phone = window.AGRO_CFG.whatsappCentral.replace(/[^\d]/g, "");
  const url = `https://wa.me/${phone}?text=${build.text}`;
  window.open(url, "_blank");
}

load();
