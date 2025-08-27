/* App logic (multi-vendor) */
(() => {
  const cfg = window.APP_CONFIG || {};

  const url = new URL(location.href);
  const pid = url.searchParams.get('produtor') || url.searchParams.get('producer');

  const isLightInitial = (cfg.theme || 'dark') === 'light';
  document.body.classList.toggle('theme-light', isLightInitial);
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const setThemeColor = (isLight) => metaTheme?.setAttribute('content', isLight ? '#ffffff' : '#111018');
  setThemeColor(isLightInitial);

  const R$ = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  const state = { items: [], filtered: [], categories: [], cart: new Map(), category:'Tudo', search:'', producer:null };

  const els = {
    storeName: $('#storeName'), storeInfo: $('#storeInfo'), storeStatus: $('#storeStatus'),
    products: $('#products'), search: $('#search'), chips: $('#categories'), toast: $('#toast'),
    cartBar: $('#cartBar'), cartCount: $('#cartCount'), cartTotal: $('#cartTotal'),
    cartModal: $('#cartModal'), openCart: $('#openCart'), closeCart: $('#closeCart'),
    checkout: $('#checkout'), checkoutModal: $('#checkoutModal'), cartItems: $('#cartItems'),
    cartTotalModal: $('#cartTotalModal'), whatsHeader: $('#whatsHeader'), themeToggle: $('#themeToggle'),
    tplCard: $('#productCardTpl'), tplCart: $('#cartItemTpl'),
  };

  (async function init(){
    await maybeLoadProducer();
    initHeader();
    await loadData();
    buildCategories();
    filterAndRender();
  })();

  async function maybeLoadProducer(){
    const preview = localStorage.getItem('__preview_producer__');
    if (preview && pid){
      try{
        const obj = JSON.parse(preview);
        if (obj && obj.id === pid){ state.producer = obj; applyProducer(obj); return; }
      }catch{}
    }
    if (!pid) return;
    try{
      const res = await fetch('producers.json', { cache:'no-store' });
      if (!res.ok) throw new Error('HTTP '+res.status);
      const list = await res.json();
      const p = list.find(x => String(x.id) === String(pid));
      if (!p) throw new Error('Produtor não encontrado');
      state.producer = p; applyProducer(p);
    }catch(e){
      toast('Não foi possível carregar a banca solicitada. Abrindo catálogo padrão.'); console.warn(e);
    }
  }

  function applyProducer(p){
    cfg.storeName = p.name || cfg.storeName;
    cfg.whatsappPhone = p.whatsapp || cfg.whatsappPhone;
    cfg.checkout = cfg.checkout || {};
    cfg.checkout.note = (cfg.checkout.note ? cfg.checkout.note + '\n' : '') + (p.pixKey ? `Pix: ${p.pixKey}` : '');
    cfg.storeInfo = { tagline: [p.city, p.tagline].filter(Boolean).join(' • ') };
    if (p.dataSource){ cfg.dataSource = p.dataSource; }
  }

  function initHeader(){
    els.storeName.textContent = cfg.storeName || 'Feira Digital Diamantino';
    els.storeInfo.textContent = cfg.storeInfo?.tagline || (state.producer ? state.producer.name : 'Entrega via WhatsApp');
  }

  function dataUrls(){
    const CSV_URL = cfg.dataSource?.type === 'csv' ? cfg.dataSource.csvUrl : null;
    const JSON_URL = cfg.dataSource?.jsonUrl || 'products.json';
    return { CSV_URL, JSON_URL };
  }

  async function loadData(){
    const { CSV_URL, JSON_URL } = dataUrls();
    try {
      if (CSV_URL) {
        const res = await fetch(CSV_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error('CSV HTTP ' + res.status);
        const text = await res.text(); state.items = parseCSV(text);
      } else {
        const res = await fetch(JSON_URL); state.items = await res.json();
      }
    } catch (e) {
      console.warn('Falha CSV, tentando JSON...', e);
      try { const res = await fetch(JSON_URL); state.items = await res.json(); toast('Não foi possível carregar o CSV. Usando o arquivo local (products.json).'); }
      catch (err) { console.error(err); toast('Não foi possível carregar o catálogo. Verifique a URL do CSV ou o arquivo products.json.'); state.items = []; }
    }
    normalizeItems();
  }

  function normalizeItems(){
    state.items = state.items.filter(Boolean).map((row, idx) => {
      const get = k => row[k] ?? row[k.toLowerCase()] ?? row[ptToKey(k)];
      const name = (get('Nome') || get('Produto') || `Item ${idx+1}`).toString();
      const price = parseBR(get('Preço') ?? get('Preco') ?? get('price') ?? 0);
      const unit = (get('Unidade') || get('Unid.') || get('unit') || '').toString();
      const cat = (get('Categoria') || get('category') || 'Outros').toString();
      const desc = (get('Descrição') || get('descricao') || '').toString();
      const img = (get('Imagem') || get('image') || '').toString();
      const ativo = (get('Ativo') || get('ativo') || 'SIM').toString().toUpperCase();
      return { id: idx+1, name, price, unit, category:cat, description:desc, image:img,
               active: !['NAO','NÃO','NO','0','FALSE','FALSO'].includes(ativo) };
    }).filter(x => x.active && x.name?.trim());
  }

  function ptToKey(k){ return ({'nome':'Nome','preço':'Preço','unidade':'Unidade','categoria':'Categoria','descrição':'Descrição','imagem':'Imagem'}[k]||k); }
  function parseBR(v){ if (typeof v === 'number') return v; if(!v) return 0; const s=String(v).replace(/[^0-9,.-]/g,'').replace('.', '').replace(',','.'); const n=Number(s); return isFinite(n)?n:0; }

  function parseCSV(text){
    const lines = text.split(/\r?\n/).filter(l => l.trim().length);
    const head = lines.shift().split(',').map(h => h.trim());
    return lines.map(l => {
      const cols=[]; let cur='', inQ=false;
      for (let i=0;i<l.length;i++){ const ch=l[i]; if (ch === '"'){ inQ=!inQ; continue; } if (ch === ',' && !inQ){ cols.push(cur); cur=''; continue; } cur+=ch; }
      cols.push(cur);
      const obj={}; head.forEach((h,i)=> obj[h]=(cols[i]||'').trim()); return obj;
    });
  }

  function buildCategories(){
    const set = new Set(['Tudo']); state.items.forEach(x => set.add(x.category || 'Outros'));
    state.categories = Array.from(set); els.chips.innerHTML='';
    state.categories.forEach(cat => { const el = document.createElement('button');
      el.className='chip'+(cat===state.category?' active':''); el.textContent=cat;
      el.onclick=()=>{ state.category=cat; highlightChip(cat); filterAndRender(); }; els.chips.appendChild(el);
    });
  }
  function highlightChip(cat){ $$('.chip').forEach(b => b.classList.toggle('active', b.textContent===cat)); }

  function filterAndRender(){
    const s=state.search.trim().toLowerCase();
    state.filtered = state.items.filter(x => {
      const okCat = state.category==='Tudo' || (x.category||'').toLowerCase()===state.category.toLowerCase();
      const hay = [x.name, x.description, x.unit, x.category].join(' ').toLowerCase();
      return okCat && (!s || hay.includes(s));
    });
    renderProducts();
  }

  function renderProducts(){
    els.products.innerHTML='';
    if (!state.filtered.length){ els.products.innerHTML='<p style="color:#b7b2ff">Nenhum item encontrado.</p>'; return; }
    state.filtered.forEach(item => {
      const node = els.tplCard.content.cloneNode(true);
      const card = node.querySelector('.card'); card.dataset.id=item.id;
      const thumb = node.querySelector('.thumb');
      thumb.style.backgroundImage = item.image ? `url(${item.image})` : 'linear-gradient(135deg, #2e294e, #3e2b5e)';
      node.querySelector('.title').textContent=item.name;
      node.querySelector('.desc').textContent=item.description||'';
      node.querySelector('.unit').textContent=item.unit||'';
      node.querySelector('.category').textContent=item.category||'';
      node.querySelector('.price').textContent = R$.format(item.price);
      const qtyInput=node.querySelector('.qty-input');
      const minus=node.querySelector('.qty-btn.minus');
      const plus=node.querySelector('.qty-btn.plus');
      qtyInput.value = state.cart.get(item.id)?.qty || 0;
      minus.onclick=()=>changeQty(item,-1); plus.onclick=()=>changeQty(item,+1);
      qtyInput.onchange=()=>setQty(item, parseInt(qtyInput.value||'0',10));
      els.products.appendChild(node);
    });
  }

  function changeQty(item,d){ setQty(item, (state.cart.get(item.id)?.qty||0)+d); }
  function setQty(item,qty){
    qty=Math.max(0, Math.floor(qty));
    if (!qty) state.cart.delete(item.id); else state.cart.set(item.id,{item,qty});
    const card = els.products.querySelector(`.card[data-id="${item.id}"]`);
    if (card) card.querySelector('.qty-input').value=qty;
    updateCartUI();
  }

  function updateCartUI(){
    let count=0,total=0;
    for (const {item, qty} of state.cart.values()){ count+=qty; total+=qty*(item.price||0); }
    els.cartCount.textContent=String(count);
    els.cartTotal.textContent=R$.format(total);
    els.cartTotalModal.textContent=R$.format(total);
    els.cartBar.classList.toggle('hidden', count===0);
    els.cartItems.innerHTML='';
    for (const {item, qty} of state.cart.values()){
      const node=els.tplCart.content.cloneNode(true);
      node.querySelector('.cart-name').textContent=item.name;
      const input=node.querySelector('.qty-input');
      const minus=node.querySelector('[data-action="minus"]');
      const plus=node.querySelector('[data-action="plus"]');
      const line=node.querySelector('.cart-line');
      input.value=qty; line.textContent=R$.format(qty*(item.price||0));
      minus.onclick=()=>changeQty(item,-1); plus.onclick=()=>changeQty(item,+1);
      input.onchange=()=>setQty(item, parseInt(input.value||'0',10));
      els.cartItems.appendChild(node);
    }
  }

  els.search.addEventListener('input', e => { state.search = e.target.value; filterAndRender(); });
  els.openCart.addEventListener('click', () => els.cartModal.showModal());
  els.closeCart.addEventListener('click', () => els.cartModal.close());
  els.checkout.addEventListener('click', checkout);
  els.checkoutModal.addEventListener('click', checkout);
  els.whatsHeader.addEventListener('click', () => openWhats('Olá! Gostaria de tirar uma dúvida.'));
  els.themeToggle?.addEventListener('click', () => {
    const isLight = !document.body.classList.contains('theme-light');
    document.body.classList.toggle('theme-light', isLight);
    setThemeColor(isLight);
    cfg.theme = isLight ? 'light' : 'dark'; try{ localStorage.setItem('theme', cfg.theme); }catch{}
    toast(`Tema alterado para ${isLight ? 'claro' : 'escuro'}`);
  });

  function checkout(){
    if (!state.cart.size) return;
    const lines = [];
    const title = state.producer ? state.producer.name : 'Feira Digital Diamantino';
    lines.push(`*Pedido - ${title}*`);
    for (const {item, qty} of state.cart.values()){ lines.push(`• ${qty} x ${item.name} — ${R$.format(item.price)} (${item.unit||''})`); }
    let total=0; for (const {item, qty} of state.cart.values()) total += qty*(item.price||0);
    lines.push(`*Total:* ${R$.format(total)}`);
    if (cfg.checkout?.note) lines.push('', cfg.checkout.note);
    openWhats(lines.join('\n'));
  }

  function openWhats(message){
    const phone = (cfg.whatsappPhone||'').replace(/\D/g,'');
    if (!phone){ toast('Número de WhatsApp não configurado em config.js'); return; }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  }

  function toast(msg, ms=4500){
    const el = els.toast; el.textContent = msg; el.classList.remove('hidden');
    clearTimeout(window.__toastT); window.__toastT = setTimeout(()=> el.classList.add('hidden'), ms);
  }
})();