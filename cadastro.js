(() => {
  const $ = s => document.querySelector(s);
  const els = {
    nome: $("#nome"), cidade: $("#cidade"), whats: $("#whats"), pix: $("#pix"), logo: $("#logo"), cover: $("#cover"), csv: $("#csv"),
    tagline: $("#tagline"), categorias: $("#categorias"),
    horarios: $("#horarios"), bairro: $("#bairro"), taxa: $("#taxa"),
    entrega: $("#entrega"), retirada: $("#retirada"), agendamento: $("#agendamento"),
    instagram: $("#instagram"), facebook: $("#facebook"),
    idPreview: $("#idPreview"), idPreviewSmall: $("#idPreviewSmall"),
    enviar: $("#enviar"), preview: $("#preview"), copiarJson: $("#copiarJson"), baixarJson: $("#baixarJson"),
    validarCsv: $("#validarCsv"), salvarRascunho: $("#salvarRascunho"), limpar: $("#limpar"),
    valErrors: $("#valErrors"), toast: $("#toast"),
    logoFile: $("#logoFile"), coverFile: $("#coverFile"),
    logoPreview: $("#logoPreview"), coverPreview: $("#coverPreview")
  };
  const cfg = window.APP_CONFIG || {};
  const slug = (s) => (s||"").toLowerCase().normalize("NFD").replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-").slice(0,60) || "minha-banca";
  const onlyDigits = (s) => String(s||"").replace(/\D/g,"");
  const parseMoney = (s) => { if (!s) return 0; const n = Number(String(s).replace(/\./g,"").replace(",",".")); return isFinite(n)?n:0; };
  const csvLooksValid = (url) => /^https?:\/\/.+/.test(url||"") && /[?&]output=csv\b/.test(url||"");
  const updateId = () => { const id = slug(els.nome.value); els.idPreview.textContent = id; els.idPreviewSmall.textContent = id; };
  loadDraft();
  els.nome.addEventListener("input", updateId); updateId();
  setupImageField({ input: els.logo, file: els.logoFile, preview: els.logoPreview, label: "logo" });
  setupImageField({ input: els.cover, file: els.coverFile, preview: els.coverPreview, label: "capa" });
  els.whats.addEventListener("input", () => { els.whats.value = onlyDigits(els.whats.value); });
  function validate(){
    const errors = [];
    if (!els.nome.value.trim()) errors.push("Informe o nome da banca/produtor.");
    if (!els.cidade.value.trim()) errors.push("Informe a cidade.");
    const w = onlyDigits(els.whats.value);
    if (!w) errors.push("Informe o WhatsApp.");
    if (w && (w.length < 10 || w.length > 14)) errors.push("WhatsApp deve ter 10–14 dígitos (55 + DDD + número).");
    const csv = els.csv.value.trim();
    if (csv && !csvLooksValid(csv)) errors.push("Link do CSV parece inválido. Verifique se termina com &output=csv.");
    els.valErrors.textContent = errors.join(" ");
    els.valErrors.classList.toggle("show", errors.length>0);
    return errors.length === 0;
  }
  function buildProducer(){
    const id = slug(els.nome.value);
    const payments = Array.from(document.querySelectorAll(".pay:checked")).map(x => x.value);
    const ops = { entrega: !!els.entrega.checked, retirada: !!els.retirada.checked, agendamento: !!els.agendamento.checked,
      bairro: els.bairro.value.trim() || undefined, horarios: els.horarios.value.trim() || undefined, taxaEntrega: parseMoney(els.taxa.value || 0) };
    const meta = { categories: els.categorias.value.split(",").map(s => s.trim()).filter(Boolean), instagram: els.instagram.value.trim() || undefined,
      facebook: els.facebook.value.trim() || undefined, payments };
    return { id, name: els.nome.value.trim(), city: els.cidade.value.trim(), tagline: els.tagline.value.trim(), logo: els.logo.value.trim(), cover: els.cover.value.trim(),
      whatsapp: onlyDigits(els.whats.value), pixKey: els.pix.value.trim(), dataSource: { type: els.csv.value.trim() ? "csv" : "json", csvUrl: els.csv.value.trim() || "", jsonUrl: "products.json" },
      ops, meta };
  }
  function toast(msg, ms=4500){ els.toast.textContent=msg; els.toast.classList.remove("hidden"); clearTimeout(window.__toastT); window.__toastT=setTimeout(()=>els.toast.classList.add("hidden"),ms); }
  async function validateCsvUrl(){
    const url = els.csv.value.trim(); if (!url){ toast("Informe um link de CSV."); return; }
    if (!csvLooksValid(url)){ toast("URL não parece válida. Deve conter &output=csv."); return; }
    try{ const res = await fetch(url, { cache:"no-store" }); if (!res.ok) throw new Error("HTTP "+res.status);
      const text = await res.text(); if (!/nome|produto|categoria|preço|preco|descrição|descricao/i.test(text)){ toast("CSV acessível, mas não reconheci colunas usuais."); return; }
      toast("CSV OK! Consegui acessar e ler o conteúdo."); }catch(e){ toast("Não consegui baixar o CSV (CORS ou link privado)."); }
  }
  els.enviar.addEventListener("click", () => {
    const admin = (cfg.adminWhats || cfg.whatsappPhone || "").replace(/\D/g,"");
    if (!admin){ toast("Defina adminWhats em config.js"); return; }
    if (!validate()) { toast("Corrija os campos destacados."); return; }
    const p = buildProducer();
    const pays = p.meta.payments?.length ? `Pagamentos: ${p.meta.payments.join(", ")}` : "";
    const ops = [p.ops.entrega?"Entrega":"", p.ops.retirada?"Retirada":"", p.ops.agendamento?"Agendamento":""].filter(Boolean).join(" | ");
    const linhas = ["*Cadastro de Produtor*", `Nome: ${p.name}`, `Cidade: ${p.city}`, `WhatsApp: ${p.whatsapp}`, p.pixKey?`Pix: ${p.pixKey}`:"", p.tagline?`Descrição: ${p.tagline}`:"",
      p.logo?`Logo: ${p.logo}`:"", p.cover?`Capa: ${p.cover}`:"",  
      ops?`Operação: ${ops}`:"", p.ops.bairro?`Bairro: ${p.ops.bairro}`:"", p.ops.horarios?`Horários: ${p.ops.horarios}`:"", (p.ops.taxaEntrega>0)?`Taxa entrega: R$ ${p.ops.taxaEntrega.toFixed(2).replace(".",",")}`:"",
      p.dataSource.csvUrl?`CSV: ${p.dataSource.csvUrl}`:"(sem CSV — usar products.json)", pays, p.meta.instagram?`Instagram: ${p.meta.instagram}`:"", p.meta.facebook?`Facebook: ${p.meta.facebook}`:"", "",
      "Sugestão para producers.json:", "```json", JSON.stringify(p, null, 2), "```"
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${admin}?text=${encodeURIComponent(linhas)}`, "_blank");
  });
  els.preview.addEventListener("click", (e) => {
    e.preventDefault(); if (!validate()) { toast("Corrija os campos obrigatórios."); return; }
    const p = buildProducer(); const base = location.origin + location.pathname.replace("cadastro.html","catalogo.html"); const url = new URL(base);
    url.searchParams.set("produtor", p.id); localStorage.setItem("__preview_producer__", JSON.stringify(p)); window.open(url.toString(), "_blank");
  });
  els.copiarJson.addEventListener("click", () => { if (!validate()) { toast("Corrija os campos obrigatórios."); return; } navigator.clipboard?.writeText(JSON.stringify(buildProducer(), null, 2)).then(()=>toast("JSON copiado!")).catch(()=>toast("Não consegui copiar.")); });
  els.baixarJson.addEventListener("click", () => { if (!validate()) { toast("Corrija os campos obrigatórios."); return; } const text = JSON.stringify(buildProducer(), null, 2); const blob = new Blob([text], {type:"application/json"}); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `producer-${slug(els.nome.value)}.json`; a.click(); URL.revokeObjectURL(a.href); });
  els.validarCsv.addEventListener("click", validateCsvUrl);
  els.salvarRascunho.addEventListener("click", () => { try{ localStorage.setItem("__cad_produtor_draft__", JSON.stringify({ nome:els.nome.value,cidade:els.cidade.value,whats:els.whats.value,pix:els.pix.value,logo:els.logo.value,cover:els.cover.value,csv:els.csv.value, tagline:els.tagline.value,categorias:els.categorias.value,horarios:els.horarios.value,bairro:els.bairro.value,taxa:els.taxa.value, entrega:els.entrega.checked,retirada:els.retirada.checked,agendamento:els.agendamento.checked, instagram:els.instagram.value,facebook:els.facebook.value })) }catch{} toast("Rascunho salvo neste navegador."); });
  els.limpar.addEventListener("click", () => {
    document.querySelectorAll("input, textarea").forEach(el => { if(el.type==="checkbox") el.checked=false; else el.value=""; });
    [els.logoFile, els.coverFile].forEach(file => { if (file) file.value=""; });
    updateId();
    els.valErrors.textContent="";
    els.valErrors.classList.remove("show");
    [els.logoPreview, els.coverPreview].forEach(preview => preview?.classList.remove("show"));
    toast("Formulário limpo.");
  });
  function setupImageField({ input, file, preview, label }){
    if (!input) return;
    const updatePreview = () => {
      const val = input.value.trim();
      if (!preview) return;
      if (val){
        preview.style.backgroundImage = `url(${val})`;
        preview.classList.add("show");
      }else{
        preview.style.backgroundImage = "";
        preview.classList.remove("show");
      }
    };
    input.addEventListener("input", updatePreview);
    if (file){
      file.addEventListener("change", async () => {
        const img = file.files?.[0];
        if (!img) return;
        if (img.size > 1.5 * 1024 * 1024){ toast("Imagem muito grande (máx. 1.5MB)."); file.value=""; return; }
        try{
          const dataUrl = await readFileAsDataURL(img);
          input.value = dataUrl;
          updatePreview();
          toast(`Imagem de ${label} carregada!`);
        }catch{
          toast("Não foi possível ler a imagem selecionada.");
        }
      });
    }
    updatePreview();
  }

  function readFileAsDataURL(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("read-error"));
      reader.readAsDataURL(file);
    });
  }

  function loadDraft(){
    try{
      const saved = JSON.parse(localStorage.getItem("__cad_produtor_draft__") || "null");
      if (!saved) return;
      if (saved.nome) els.nome.value = saved.nome;
      if (saved.cidade) els.cidade.value = saved.cidade;
      if (saved.whats) els.whats.value = saved.whats;
      if (saved.pix) els.pix.value = saved.pix;
      if (saved.logo) els.logo.value = saved.logo;
      if (saved.cover) els.cover.value = saved.cover;
      if (saved.csv) els.csv.value = saved.csv;
      if (saved.tagline) els.tagline.value = saved.tagline;
      if (saved.categorias) els.categorias.value = saved.categorias;
      if (saved.horarios) els.horarios.value = saved.horarios;
      if (saved.bairro) els.bairro.value = saved.bairro;
      if (saved.taxa) els.taxa.value = saved.taxa;
      if (typeof saved.entrega === "boolean") els.entrega.checked = saved.entrega;
      if (typeof saved.retirada === "boolean") els.retirada.checked = saved.retirada;
      if (typeof saved.agendamento === "boolean") els.agendamento.checked = saved.agendamento;
      if (saved.instagram) els.instagram.value = saved.instagram;
      if (saved.facebook) els.facebook.value = saved.facebook;
    }catch{}
  }
})();
