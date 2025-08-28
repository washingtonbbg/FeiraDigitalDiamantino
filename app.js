/* App logic */
(() => {
  const cfg = window.APP_CONFIG || {};
  document.body.classList.toggle('theme-light', (cfg.theme || 'dark') === 'light'); // aplica a classe de tema no <body>
  const R$ = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  const state = {
    items: [],           // full catalog
    filtered: [],        // filtered by search/category
    categories: [],
    cart: new Map(),     // id -> {item, qty}
    category: 'Tudo',
    search: ''
  };

  const els = {
    storeName: $('#storeName'),
    storeInfo: $('#storeInfo'),
    storeStatus: $('#storeStatus'),
    products: $('#products'),
    search: $('#search'),
    chips: $('#categories'),
    toast: $('#toast'),
    cartBar: $('#cartBar'),
    cartCount: $('#cartCount'),
    cartTotal: $('#cartTotal'),
    cartModal: $('#cartModal'),
    openCart: $('#openCart'),
    closeCart: $('#closeCart'),
    checkout: $('#checkout'),
    checkoutModal: $('#checkoutModal'),
    cartItems: $('#cartItems'),
    cartTotalModal: $('#cartTotalModal'),
    whatsHeader: $('#whatsHeader'),
    themeToggle: document.getElementById('themeToggle'),
    tplCard: $('#productCardTpl'),
    tplCart: $('#cartItemTpl'),
  };

  // único listener do botão de tema (perto dos outros addEventListener)
          })
      .filter(x => x.active && x.name?.trim());
  }

  function ptToKey(k){ return ({'nome':'Nome','preço':'Preço','unidade':'Unidade','categoria':'Categoria','descrição':'Descrição','imagem':'Imagem'}[k]||k); }
  function parseBR(v){
    if (typeof v === 'number') return v;
    if (!v) return 0;
    const s = String(v).replace(/[^0-9,.-]/g,'').replace('.', '').replace(',','.');
    const n = Number(s);
    return isFinite(n) ? n : 0;
  }

  function parseCSV(text){
    const lines = text.split(/\r?\n/).filter(l => l.trim().length);
    const head = lines.shift().split(',').map(h => h.trim());
    return lines.map(l => {
      // split respecting quoted commas
      const cols = [];
      let cur = '', inQ = false;
      for (let i=0;i<l.length;i++){
        const ch = l[i];
        if (ch === '"'){ inQ = !inQ; continue; }
        if (ch === ',' && !inQ){ cols.push(cur); cur=''; continue; }
        cur += ch;
      }
      cols.push(cur);
      const obj = {};
      head.forEach((h,i)=> obj[h] = (cols[i]||'').trim());
      return obj;
    });
  }

  function buildCategories(){
    const set = new Set(['Tudo']);
    state.items.forEach(x => set.add(x.category || 'Outros'));
    state.categories = Array.from(set);
    els.chips.innerHTML = '';
    state.categories.forEach(cat => {
      const el = document.createElement('button');
      el.className = 'chip' + (cat===state.category ? ' active':'');
      el.textContent = cat;
      el.onclick = () => { state.category = cat; highlightChip(cat); filterAndRender(); };
      els.chips.appendChild(el);
    });
  }
  function highlightChip(cat){
    $$('.chip').forEach(b => b.classList.toggle('active', b.textContent===cat));
  }

  // Filter + render
  function filterAndRender(){
    const s = state.search.trim().toLowerCase();
    state.filtered = state.items.filter(x => {
      const okCat = state.category==='Tudo' || (x.category||'').toLowerCase()===state.category.toLowerCase();
      const hay = [x.name, x.description, x.unit, x.category].join(' ').toLowerCase();
      const okSearch = !s || hay.includes(s);
      return okCat && okSearch;
    });
    renderProducts();
  }

  function renderProducts(){
    els.products.innerHTML = '';
    if (!state.filtered.length){
      els.products.innerHTML = '<p style="color:#b7b2ff">Nenhum item encontrado.</p>';
      return;
    }
    state.filtered.forEach(item => {
      const node = els.tplCard.content.cloneNode(true);
      const card = node.querySelector('.card');
      card.dataset.id = item.id;
      const thumb = node.querySelector('.thumb');
      if (item.image){
        thumb.style.backgroundImage = `url(${item.image})`;
      } else {
        thumb.style.backgroundImage = 'linear-gradient(135deg, #2e294e, #3e2b5e)';
      }
      node.querySelector('.title').textContent = item.name;
      node.querySelector('.desc').textContent = item.description || '';
      node.querySelector('.unit').textContent = item.unit || '';
      node.querySelector('.category').textContent = item.category || '';
      const priceEl = node.querySelector('.price');
      priceEl.textContent = R$.format(item.price);
      const qtyInput = node.querySelector('.qty-input');
      const minus = node.querySelector('.qty-btn.minus');
      const plus = node.querySelector('.qty-btn.plus');
      const inCart = state.cart.get(item.id);
      qtyInput.value = inCart ? inCart.qty : 0;
      minus.onclick = () => changeQty(item, -1);
      plus.onclick = () => changeQty(item, +1);
      qtyInput.onchange = () => setQty(item, parseInt(qtyInput.value||'0',10));
      els.products.appendChild(node);
    });
  }

  function changeQty(item, delta){ setQty(item, (state.cart.get(item.id)?.qty||0) + delta); }
  function setQty(item, qty){
    qty = Math.max(0, Math.floor(qty));
    if (!qty){ state.cart.delete(item.id); }
    else { state.cart.set(item.id, { item, qty }); }
    const card = els.products.querySelector(`.card[data-id="${item.id}"]`);
    if (card){ card.querySelector('.qty-input').value = qty; }
    updateCartUI();
  }

  function updateCartUI(){
    let count = 0, total = 0;
    for (const {item, qty} of state.cart.values()){
      count += qty;
      total += qty * (item.price||0);
    }
    els.cartCount.textContent = String(count);
    els.cartTotal.textContent = R$.format(total);
    els.cartTotalModal.textContent = R$.format(total);
    els.cartBar.classList.toggle('hidden', count===0);

    els.cartItems.innerHTML = '';
    for (const {item, qty} of state.cart.values()){
      const node = els.tplCart.content.cloneNode(true);
      node.querySelector('.cart-name').textContent = item.name;
      const input = node.querySelector('.qty-input');
      const minus = node.querySelector('[data-action="minus"]');
      const plus = node.querySelector('[data-action="plus"]');
      const line = node.querySelector('.cart-line');
      input.value = qty;
      line.textContent = R$.format(qty * (item.price||0));
      minus.onclick = () => changeQty(item, -1);
      plus.onclick = () => changeQty(item, +1);
      input.onchange = () => setQty(item, parseInt(input.value||'0',10));
      els.cartItems.appendChild(node);
    }
  }

  els.search.addEventListener('input', e => { state.search = e.target.value; filterAndRender(); });
  els.openCart.addEventListener('click', () => els.cartModal.showModal());
  els.closeCart.addEventListener('click', () => els.cartModal.close());
  els.checkout.addEventListener('click', checkout);
  els.checkoutModal.addEventListener('click', checkout);
  els.whatsHeader.addEventListener('click', () => openWhats('Olá! Gostaria de tirar uma dúvida.'));

  els.themeToggle.addEventListener('click', () => {
    const newTheme = (cfg.theme || 'dark') === 'light' ? 'dark' : 'light';
    document.body.classList.toggle('theme-light', newTheme === 'light');
    cfg.theme = newTheme;
    toast(`Tema alterado para ${newTheme === 'light' ? 'claro' : 'escuro'}`);
  });

  function checkout(){
    if (state.cart.size===0) return;
    const lines = [];
    lines.push('*Pedido - Feira Digital Diamantino*');
    for (const {item, qty} of state.cart.values()){
      lines.push(`• ${qty} x ${item.name} — ${R$.format(item.price)} (${item.unit||''})`);
    }
    let total = 0;
    for (const {item, qty} of state.cart.values()){ total += qty*(item.price||0); }
    lines.push(`*Total:* ${R$.format(total)}`);
    if (cfg.checkout?.note) lines.push('', cfg.checkout.note);
    openWhats(lines.join('\n'));
  }

  function openWhats(message){
    const phone = (cfg.whatsappPhone||'').replace(/\D/g,'');
    if (!phone){ toast('Número de WhatsApp não configurado em config.js'); return; }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  function toast(msg, ms=4500){
    const el = els.toast;
    el.textContent = msg;
    el.classList.remove('hidden');
    window.clearTimeout(window.__toastT);
    window.__toastT = setTimeout(()=> el.classList.add('hidden'), ms);
  }

  loadData();
})();