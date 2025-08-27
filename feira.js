(() => {
  const $ = s => document.querySelector(s);
  const els = { search: $('#search'), grid: $('#grid'), tpl: $('#producerTpl'), toast: $('#toast') };
  async function loadProducers(){
    try{
      const r = await fetch('producers.json', { cache:'no-store' });
      if (!r.ok) throw new Error('HTTP '+r.status);
      const items = await r.json();
      render(items);
      els.search.oninput = () => {
        const s = els.search.value.trim().toLowerCase();
        render(items.filter(p => [p.name, p.city, p.tagline].join(' ').toLowerCase().includes(s)));
      };
    }catch(e){ toast('Não foi possível carregar a lista de produtores.'); console.error(e); }
  }
  function render(list){
    els.grid.innerHTML='';
    if (!list.length){ els.grid.innerHTML='<p style="color:#b7b2ff">Nenhuma banca encontrada.</p>'; return; }
    list.forEach(p => {
      const node = els.tpl.content.cloneNode(true);
      node.querySelector('.producer-thumb').style.backgroundImage = p.logo ? `url(${p.logo})` : 'linear-gradient(135deg,#2e294e,#3e2b5e)';
      node.querySelector('.p-name').textContent = p.name;
      node.querySelector('.p-line').textContent = [p.city, p.tagline].filter(Boolean).join(' • ');
      node.querySelector('a.primary').href = `index.html?produtor=${encodeURIComponent(p.id)}`;
      els.grid.appendChild(node);
    });
  }
  function toast(msg, ms=4500){ els.toast.textContent=msg; els.toast.classList.remove('hidden'); clearTimeout(window.__toastT); window.__toastT=setTimeout(()=>els.toast.classList.add('hidden'),ms); }
  loadProducers();
})();