/* app.js — versão compatível com catalogo.html (#products, templates)
   - Lê somente products.json (dataSource JSON)
   - Renderiza usando <main id="products"> + templates #productCardTpl / #cartItemTpl
   - Imagens: campo Imagem (URL/data/nome.ext) OU fallback por slug em images/produtos
   - Busca, categorias, carrinho + WhatsApp
*/
(() => {
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const ASSETS = { base: 'images/produtos', tryExt: ['webp','jpeg','jpg','png'] };

  // ------------ DOM ------------
  const $ = (s) => document.querySelector(s);
  const els = {
    storeName: $('#storeName'),
    storeInfo: $('#storeInfo'),
    whatsHeader: $('#whatsHeader'),
    heroCover: $('#heroCover'),
    search: $('#search'),
    chips: $('#categories'),
    list: $('#products'), // IMPORTANT: compatível com catalogo.html
    tplCard: $('#productCardTpl'),
    tplCart: $('#cartItemTpl'),
    cartBar: $('#cartBar'),
    cartCount: $('#cartCount'),
    cartTotal: $('#cartTotal'),
    cartModal: $('#cartModal'),
    cartItems: $('#cartItems'),
    cartTotalModal: $('#cartTotalModal'),
    openCart: $('#openCart'),
    closeCart: $('#closeCart'),
    checkout: $('#checkout'),
    toast: $('#toast'),
  };

  const state = {
    producer: null,
    items: [],
    filtered: [],
    categories: ['Tudo'],
    cat: 'Tudo',
    q: '',
    cart: new Map(),
  };

  document.addEventListener('DOMContentLoaded', init);
  async function init(){
    await loadProducer();
    updateHeader();
    await loadProductsJSON();
    buildCategories();
    filterAndRender();
    wireUI();
    restoreCart();
    console.log('[FeiraDigital] pronto.');
  }

  // ------------ Producer ------------
  async function loadProducer(){
    const url = new URL(location.href);
    const pid = url.searchParams.get('produtor') || url.searchParams.get('producer');
    if(!pid) return;
    try{
      const r = await fetch('producers.json', { cache:'no-store' });
      if (!r.ok) throw new Error('HTTP '+r.status);
      const all = await r.json();
      const p = all.find(x => String(x.id).toLowerCase() === String(pid).toLowerCase() || String(x.name||'').toLowerCase() === String(pid).toLowerCase());
      if(p) state.producer = p; else console.warn('Produtor não encontrado:', pid);
    }catch(e){ console.warn('Falha ao ler producers.json', e); }
  }

  function updateHeader(){
    const p = state.producer || {};
    if(els.storeName) els.storeName.textContent = p.name || 'Feira Digital Diamantino';
    if(els.storeInfo) els.storeInfo.textContent = p.tagline ? p.tagline : 'Entrega via WhatsApp';
    if(els.whatsHeader && p.whatsapp){ els.whatsHeader.href = `https://wa.me/${(p.whatsapp+'').replace(/\D+/g,'')}`; }
    if(els.heroCover && p.cover){
      const url = resolveMediaGeneric(p.cover, 'images/capas');
      els.heroCover.style.backgroundImage = `url(${url})`;
      els.heroCover.classList.add('has-photo');
    }
  }

  // ------------ Products ------------
  async function loadProductsJSON(){
    try{
      const r = await fetch('products.json', { cache:'no-store' });
      if(!r.ok) throw new Error('HTTP '+r.status);
      const raw = await r.json();
      state.items = raw
        .filter(p => (p.Ativo||'SIM').toString().toUpperCase() === 'SIM')
        .map((p,i)=>({ id: p.id || String(i+1),
                       name: p.Nome || p.name || '',
                       price: parseBR(p.Preço || p.price || '0'),
                       unit: p.Unidade || p.unit || '',
                       category: p.Categoria || p.category || 'Outros',
                       description: p.Descrição || p.description || '',
                       image: (p.Imagem || p.image || '').trim() }));
      console.log('[CAT] itens carregados:', state.items.length);
    }catch(e){
      console.error('Falha ao ler products.json', e);
      state.items = [];
    }
  }

  function buildCategories(){
    const set = new Set(['Tudo']);
    state.items.forEach(p => set.add(p.category||'Outros'));
    state.categories = [...set];
    renderCategories();
  }

  function renderCategories(){
    if(!els.chips) return;
    els.chips.innerHTML = '';
    state.categories.forEach(cat => {
      const b = document.createElement('button');
      b.className = 'chip'+(cat===state.cat?' active':'');
      b.textContent = cat;
      b.onclick = () => {
        state.cat = cat;
        filterAndRender();
        document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
      };
      els.chips.appendChild(b);
    });
  }

  function filterAndRender(){
    const q = state.q.trim().toLowerCase();
    state.filtered = state.items.filter(p => {
      const okCat = state.cat === 'Tudo' || (p.category||'').toLowerCase() === state.cat.toLowerCase();
      const okTxt = !q || (p.name||'').toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q);
      return okCat && okTxt;
    });
    renderProducts();
  }

  async function renderProducts(){
    if(!els.list){ console.error('Container #products não encontrado.'); return; }
    if(!els.tplCard){ console.error('Template #productCardTpl não encontrado.'); return; }
    els.list.innerHTML = '';
    if(!state.filtered.length){
      els.list.innerHTML = '<p style="color:var(--muted)">Nenhum item encontrado.</p>';
      return;
    }
    for(const item of state.filtered){
      const node = els.tplCard.content.cloneNode(true);
      const card = node.querySelector('.card');
      const thumb = node.querySelector('.thumb');
      const title = node.querySelector('.title');
      const desc = node.querySelector('.desc');
      const unit = node.querySelector('.unit');
      const cat = node.querySelector('.category');
      const price = node.querySelector('.price');
      const btnMinus = node.querySelector('.qty .minus');
      const btnPlus  = node.querySelector('.qty .plus');
      const qtyInput = node.querySelector('.qty-input');

      title.textContent = item.name;
      desc.textContent = item.description || '';
      unit.textContent = item.unit || '';
      cat.textContent = item.category || '';
      price.textContent = BRL.format(item.price || 0);
      thumb.style.backgroundImage = await buildThumb(item);

      btnMinus.onclick = () => { const q = Math.max(0, (+qtyInput.value||0)-1); qtyInput.value = q; if(q>0) addToCart(item, 1, q); };
      btnPlus.onclick  = () => { const q = (+qtyInput.value||0)+1; qtyInput.value = q; addToCart(item, 1, q); };
      qtyInput.onchange = () => { const q = Math.max(0, +qtyInput.value||0); qtyInput.value = q; setQty(item, q); };

      els.list.appendChild(node);
    }
    updateCartUI();
  }

  // ------------ Images ------------
  async function buildThumb(item){
    const direct = resolveImage(item.image);
    if(direct && await headOk(direct)) return `url(${direct})`;
    const slug = slugify(item.name || item.id || '');
    for(const ext of ASSETS.tryExt){
      const url = `${ASSETS.base}/${slug}.${ext}`;
      if(await headOk(url)) return `url(${url})`;
    }
    return 'url(images/placeholder.png)';
  }

  function resolveImage(val){
    if(!val) return '';
    const v = String(val).trim();
    if(/^data:image\//i.test(v) || /^https?:\/\//i.test(v)) return v;
    if(/\.(webp|png|jpe?g)$/i.test(v)) return `${ASSETS.base}/${v}`;
    return v;
  }
  function resolveMediaGeneric(val, baseDir){
    if(!val) return '';
    const v = String(val).trim();
    if(/^data:image\//i.test(v) || /^https?:\/\//i.test(v)) return v;
    if(/\.(webp|png|jpe?g)$/i.test(v)) return `${baseDir}/${v}`;
    return v;
  }
  async function headOk(url){ try{ const r = await fetch(url, { method:'HEAD', cache:'no-store' }); return r.ok; }catch{ return false; } }

  // ------------ Busca & UI ------------
  function wireUI(){
    if(els.search){ els.search.addEventListener('input', e => { state.q = e.target.value; filterAndRender(); }); }
    if(els.openCart && els.cartModal) els.openCart.onclick = () => els.cartModal.showModal?.();
    if(els.closeCart && els.cartModal) els.closeCart.onclick = () => els.cartModal.close?.();
    if(els.checkout) els.checkout.onclick = checkout;
  }

  // ------------ Carrinho ------------
  function addToCart(item, inc=1, setTo=null){
    const key = item.id;
    const cur = state.cart.get(key) || { item, qty:0 };
    cur.qty = setTo==null ? (cur.qty + inc) : setTo;
    if(cur.qty<=0) state.cart.delete(key); else state.cart.set(key, cur);
    persistCart();
    updateCartUI();
  }
  function setQty(item, q){ addToCart(item, 0, q); }
  function cartTotals(){ let count=0, total=0; for(const {item,qty} of state.cart.values()){ count+=qty; total+=qty*(item.price||0);} return {count,total}; }
  function updateCartUI(){
    const {count,total} = cartTotals();
    if(els.cartBar) els.cartBar.classList.toggle('hidden', count<=0);
    if(els.cartCount) els.cartCount.textContent = String(count);
    if(els.cartTotal) els.cartTotal.textContent = BRL.format(total);
    renderCartModal();
  }
  function renderCartModal(){
    if(!els.cartItems || !els.cartTotalModal) return;
    els.cartItems.innerHTML = '';
    for(const [key,{item,qty}] of state.cart.entries()){
      const row = els.tplCart?.content.cloneNode(true) || document.createElement('div');
      const root = row.querySelector('.cart-item') || row;
      const name = row.querySelector('.cart-name') || document.createElement('span');
      const minus = row.querySelector('[data-action="minus"]');
      const plus = row.querySelector('[data-action="plus"]');
      const subtotal = row.querySelector('.cart-subtotal') || document.createElement('span');
      name.textContent = item.name;
      subtotal.textContent = BRL.format(qty*(item.price||0));
      if(minus) minus.onclick = () => addToCart(item, -1);
      if(plus) plus.onclick  = () => addToCart(item, +1);
      if(!row.querySelector('.cart-name')) root.appendChild(name);
      if(!row.querySelector('.cart-subtotal')) root.appendChild(subtotal);
      els.cartItems.appendChild(row);
    }
    const { total } = cartTotals();
    els.cartTotalModal.textContent = BRL.format(total);
  }
  function checkout(){
    const p = state.producer || {};
    const phone = (p.whatsapp||'').replace(/\D+/g,'');
    const lines = [ `*Pedido — ${p.name||'Feira Digital'}*` ];
    for(const {item,qty} of state.cart.values()) lines.push(`- ${qty} x ${item.name} (${BRL.format(item.price)}${item.unit?' / '+item.unit:''})`);
    const { total } = cartTotals(); lines.push(`*Total:* ${BRL.format(total)}`);
    const wa = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}` : `https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(wa, '_blank');
  }
  function persistCart(){ try{ const plain=[...state.cart.entries()].map(([k,v])=>[k,{id:v.item.id,qty:v.qty}]); localStorage.setItem('__cart__', JSON.stringify(plain)); }catch{} }
  function restoreCart(){ try{ const raw=localStorage.getItem('__cart__'); if(!raw) return; const ent=JSON.parse(raw); const map=new Map(); ent.forEach(([k,{id,qty}])=>{ const it=state.items.find(x=>String(x.id)===String(id)); if(it) map.set(k,{item:it,qty}); }); state.cart=map; updateCartUI(); }catch{} }

  // ------------ Utils ------------
  function slugify(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
  function parseBR(v){ if(typeof v==='number') return v; const s=String(v).trim().replace(/\./g,'').replace(',', '.'); const n=parseFloat(s); return isFinite(n)?n:0; }
})();