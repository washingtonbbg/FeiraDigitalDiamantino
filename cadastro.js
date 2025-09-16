(() => {
  const $ = s => document.querySelector(s);
  const els = {
    nome: $('#nome'), cidade: $('#cidade'), whats: $('#whats'), pix: $('#pix'), logo: $('#logo'), csv: $('#csv'),
    tagline: $('#tagline'), categorias: $('#categorias'),
    horarios: $('#horarios'), bairro: $('#bairro'), taxa: $('#taxa'),
    entrega: $('#entrega'), retirada: $('#retirada'), agendamento: $('#agendamento'),
    instagram: $('#instagram'), facebook: $('#facebook'),
    idPreview: $('#idPreview'), idPreviewSmall: $('#idPreviewSmall'),
    enviar: $('#enviar'), preview: $('#preview'), copiarJson: $('#copiarJson'), baixarJson: $('#baixarJson'),
    validarCsv: $('#validarCsv'), salvarRascunho: $('#salvarRascunho'), limpar: $('#limpar'),
    valErrors: $('#valErrors'), toast: $('#toast')
  };
  const cfg = window.APP_CONFIG || {};
  const admin = (cfg.adminWhats || cfg.whatsappPhone || '').replace(/\D/g,'');

  // utils
  const slug = (s) => (s||'').toLowerCase().normalize('NFD').replace(/[^\w\s-]/g,'').trim().replace(/\s+/g,'-').slice(0,60) || 'minha-banca';
  const onlyDigits = (s) => String(s||'').replace(/\D/g,'');
  const parseMoney = (s) => {
    if (!s) return 0;
    const n = Number(String(s).replace(/\./g,'').replace(',','.').replace(/[^0-9.]/g,''));
    return isFinite(n) ? n : 0;
  };
  const csvLooksValid = (url) => /^https?:\/\/.+/.test(url||'') && /[?&]output=csv\b/.test(url||'');

  // live id preview
  const updateId = () => {
    const id = slug(els.nome.value);
    els.idPreview.textContent = id;
    els.idPreviewSmall.textContent = id;
  };
  els.nome.addEventListener('input', updateId);
  updateId();

  // phone: keep digits only visually
  els.whats.addEventListener('input', () => { els.whats.value = onlyDigits(els.whats.value); });

  // validation
  function validate(){
    const errors = [];
    if (!els.nome.value.trim()) errors.push('Informe o nome da banca/produtor.');
    if (!els.cidade.value.trim()) errors.push('Informe a cidade.');
    const w = onlyDigits(els.whats.value);
    if (!w) errors.push('Informe o WhatsApp.');
    if (w && (w.length < 10 || w.length > 14)) errors.push('WhatsApp deve ter entre 10 e 14 dígitos (55 + DDD + número).');
    const csv = els.csv.value.trim();
    if (csv && !csvLooksValid(csv)) errors.push('Link do CSV parece inválido. Verifique se termina com &output=csv.');
    els.valErrors.textContent = errors.join(' ');
    els.valErrors.classList.toggle('show', errors.length>0);
    return errors.length === 0;
  }

  // build object
  function buildProducer(){
    const id = slug(els.nome.value);
    const payments = Array.from(document.querySelectorAll('.pay:checked')).map(x => x.value);
    const ops = {
      entrega: !!els.entrega.checked,
      retirada: !!els.retirada.checked,
      agendamento: !!els.agendamento.checked,
      bairro: els.bairro.value.trim() || undefined,
      horarios: els.horarios.value.trim() || undefined,
      taxaEntrega: parseMoney(els.taxa.value || 0)
    };
    const meta = {
      categories: els.categorias.value.split(',').map(s => s.trim()).filter(Boolean),
      instagram: els.instagram.value.trim() || undefined,
      facebook: els.facebook.value.trim() || undefined,
      payments
    };
    return {
      id,
      name: els.nome.value.trim(),
      city: els.cidade.value.trim(),
      tagline: els.tagline.value.trim(),
      logo: els.logo.value.trim(),
      whatsapp: onlyDigits(els.whats.value),
      pixKey: els.pix.value.trim(),
      dataSource: { type: els.csv.value.trim() ? 'csv' : 'json', csvUrl: els.csv.value.trim() || '', jsonUrl: 'products.json' },
      ops,
      meta
    };
  }

  // toast
  function toast(msg, ms=4500){ els.toast.textContent=msg; els.toast.classList.remove('hidden'); clearTimeout(window.__toastT); window.__toastT=setTimeout(()=>els.toast.classList.add('hidden'),ms); }

  // copy JSON
  function copyJson(obj){
    const text = JSON.stringify(obj, null, 2);
    navigator.clipboard?.writeText(text).then(() => toast('JSON copiado!')).catch(()=>{
      const blob = new Blob([text], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      toast('Não foi possível copiar — abri o JSON em outra aba.');
    });
  }

  // download JSON
  function downloadJson(obj){
    const text = JSON.stringify(obj, null, 2);
    const blob = new Blob([text], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `producer-${obj.id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // rascunho
  const DRAFT_KEY = '__cad_produtor_draft__';
  function saveDraft(){
    try{ localStorage.setItem(DRAFT_KEY, JSON.stringify({
      nome:els.nome.value,cidade:els.cidade.value,whats:els.whats.value,pix:els.pix.value,logo:els.logo.value,csv:els.csv.value,
      tagline:els.tagline.value,categorias:els.categorias.value,horarios:els.horarios.value,bairro:els.bairro.value,taxa:els.taxa.value,
      entrega:els.entrega.checked,retirada:els.retirada.checked,agendamento:els.agendamento.checked,instagram:els.instagram.value,facebook:els.facebook.value,
      pays:Array.from(document.querySelectorAll('.pay')).map(p => ({v:p.value, c:p.checked}))
    })) }catch{}
    toast('Rascunho salvo neste navegador.');
  }
  function loadDraft(){
    try{
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      els.nome.value=d.nome||''; els.cidade.value=d.cidade||''; els.whats.value=d.whats||''; els.pix.value=d.pix||'';
      els.logo.value=d.logo||''; els.csv.value=d.csv||''; els.tagline.value=d.tagline||''; els.categorias.value=d.categorias||'';
      els.horarios.value=d.horarios||''; els.bairro.value=d.bairro||''; els.taxa.value=d.taxa||'';
      els.entrega.checked=!!d.entrega; els.retirada.checked=!!d.retirada; els.agendamento.checked=!!d.agendamento;
      els.instagram.value=d.instagram||''; els.facebook.value=d.facebook||'';
      if (Array.isArray(d.pays)){
        const map = new Map(d.pays.map(x => [x.v, x.c]));
        document.querySelectorAll('.pay').forEach(p => p.checked = !!map.get(p.value));
      }
      updateId();
    }catch{}
  }
  loadDraft();

  // validate CSV by simple fetch (best effort; pode falhar por CORS)
  async function validateCsvUrl(){
    const url = els.csv.value.trim();
    if (!url){ toast('Informe um link de CSV.'); return; }
    if (!csvLooksValid(url)){ toast('URL não parece válida. Deve conter &output=csv.'); return; }
    try{
      const res = await fetch(url, { cache:'no-store' });
      if (!res.ok) throw new Error('HTTP '+res.status);
      const text = await res.text();
      if (!/nome|produto|categoria|preço|preco|descrição|descricao/i.test(text)){
        toast('CSV acessível, mas não reconheci colunas usuais. Verifique os cabeçalhos.'); return;
      }
      toast('CSV OK! Consegui acessar e ler o conteúdo.');
    }catch(e){
      console.warn(e);
      toast('Não consegui baixar o CSV agora (pode ser CORS ou link privado). Verifique se está PUBLICADO.');
    }
  }

  // buttons
  els.enviar.addEventListener('click', () => {
    if (!admin){ toast('Defina adminWhats em config.js'); return; }
    if (!validate()) { toast('Corrija os campos destacados.'); return; }
    const p = buildProducer();
    const pays = p.meta.payments?.length ? `Pagamentos: ${p.meta.payments.join(', ')}` : '';
    const ops = [
      p.ops.entrega?'Entrega':'',
      p.ops.retirada?'Retirada':'',
      p.ops.agendamento?'Agendamento':''
    ].filter(Boolean).join(' | ');
    const linhas = [
      '*Cadastro de Produtor*',
      `Nome: ${p.name}`,
      `Cidade: ${p.city}`,
      `WhatsApp: ${p.whatsapp}`,
      p.pixKey ? `Pix: ${p.pixKey}` : '',
      p.tagline ? `Descrição: ${p.tagline}` : '',
      ops ? `Operação: ${ops}` : '',
      p.ops.bairro ? `Bairro: ${p.ops.bairro}` : '',
      p.ops.horarios ? `Horários: ${p.ops.horarios}` : '',
      (p.ops.taxaEntrega>0) ? `Taxa entrega: R$ ${p.ops.taxaEntrega.toFixed(2).replace('.',',')}` : '',
      p.dataSource.csvUrl ? `CSV: ${p.dataSource.csvUrl}` : '(sem CSV — usar products.json)',
      pays,
      p.meta.instagram ? `Instagram: ${p.meta.instagram}` : '',
      p.meta.facebook ? `Facebook: ${p.meta.facebook}` : '',
      '',
      'Sugestão para producers.json:',
      '```json',
      JSON.stringify(p, null, 2),
      '```'
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${admin}?text=${encodeURIComponent(linhas)}`, '_blank');
  });

  els.preview.addEventListener('click', (e) => {
    e.preventDefault();
    if (!validate()) { toast('Corrija os campos obrigatórios.'); return; }
    const p = buildProducer();
    const url = new URL(location.origin + location.pathname.replace('cadastro.html','index.html'));
    url.searchParams.set('produtor', p.id);
    localStorage.setItem('__preview_producer__', JSON.stringify(p));
    window.open(url.toString(), '_blank');
  });

  els.copiarJson.addEventListener('click', () => {
    if (!validate()) { toast('Corrija os campos obrigatórios.'); return; }
    copyJson(buildProducer());
  });

  els.baixarJson.addEventListener('click', () => {
    if (!validate()) { toast('Corrija os campos obrigatórios.'); return; }
    downloadJson(buildProducer());
  });

  els.validarCsv.addEventListener('click', validateCsvUrl);
  els.salvarRascunho.addEventListener('click', saveDraft);
  els.limpar.addEventListener('click', () => { document.querySelectorAll('input, textarea').forEach(el => { if(el.type==='checkbox') el.checked=false; else el.value=''; }); updateId(); els.valErrors.textContent=''; els.valErrors.classList.remove('show'); toast('Formulário limpo.'); });

})();