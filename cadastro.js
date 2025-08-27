(() => {
  const $ = s => document.querySelector(s);
  const els = { nome: $('#nome'), cidade: $('#cidade'), whats: $('#whats'), pix: $('#pix'), logo: $('#logo'), csv: $('#csv'), tagline: $('#tagline'),
                enviar: $('#enviar'), preview: $('#preview'), toast: $('#toast') };
  const cfg = window.APP_CONFIG || {};
  const admin = (cfg.adminWhats || cfg.whatsappPhone || '').replace(/\D/g,'');
  function buildProducer(){
    const id = (els.nome.value || '').toLowerCase().normalize('NFD').replace(/[^\w\s-]/g,'').trim().replace(/\s+/g,'-') || 'minha-banca';
    return { id, name: els.nome.value || '', city: els.cidade.value || '', tagline: els.tagline.value || '', logo: els.logo.value || '',
      whatsapp: els.whats.value.replace(/\D/g,''), pixKey: els.pix.value || '',
      dataSource: { type: els.csv.value ? 'csv' : 'json', csvUrl: els.csv.value || '', jsonUrl: 'products.json' } };
  }
  function encode(obj){ return '```json\n' + JSON.stringify(obj, null, 2) + '\n```'; }
  els.enviar.addEventListener('click', () => {
    if (!admin){ toast('Defina adminWhats em config.js'); return; }
    const p = buildProducer();
    const msg = ['*Cadastro de Produtor*', `Nome: ${p.name}`, `Cidade: ${p.city}`, `WhatsApp: ${p.whatsapp}`, `Pix: ${p.pixKey}`,
      `CSV: ${p.dataSource.csvUrl || '(usar products.json por enquanto)'}`, '', 'Sugestão para producers.json:', encode(p)].join('\n');
    window.open(`https://wa.me/${admin}?text=${encodeURIComponent(msg)}`, '_blank');
  });
  els.preview.addEventListener('click', (e) => {
    e.preventDefault();
    const p = buildProducer();
    const url = new URL(location.origin + location.pathname.replace('cadastro.html','index.html'));
    url.searchParams.set('produtor', p.id);
    localStorage.setItem('__preview_producer__', JSON.stringify(p));
    window.open(url.toString(), '_blank');
  });
  function toast(msg, ms=4500){ els.toast.textContent=msg; els.toast.classList.remove('hidden'); clearTimeout(window.__toastT); window.__toastT=setTimeout(()=>els.toast.classList.add('hidden'),ms); }
})();