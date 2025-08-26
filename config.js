// CONFIGURAÇÕES DO PROJETO (edite aqui)
window.AGRO_CFG = {
  brandName: "Rede AgroFamiliar Diamantino",
  whatsappCentral: "5565977770000",   // DDD + número sem + ou espaços
  pixKey: "000.111.222-33 (CPF)",
  pickupPoints: [
    "Feira Municipal (Sex 17h-18h)",
    "Escola X – Bairro Y (Sex 17h-18h)"
  ],
  currency: "R$",

  // === Fonte dos produtos ===
  // (1) Google Sheets CSV publicado (recomendado para catálogo dinâmico)
  // PASSO: No Google Sheets → Arquivo → Publicar na Web → Selecione a aba Produtos → formato CSV
  // Cole aqui o URL gerado (termina com 'output=csv' ou 'export?format=csv&gid=...'):
  //https://docs.google.com/spreadsheets/d/e/2PACX-1vTOR66Rr5hjr9-l6-j5cfMRdtFwt38A49Mrp_qjpYPLM88NIfwD-EnXXIIpgAmkPSfAv-f_9GJDWLUe/pub?gid=70692563&single=true&output=csv",
  csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTOR66Rr5hjr9-l6-j5cfMRdtFwt38A49Mrp_qjpYPLM88NIfwD-EnXXIIpgAmkPSfAv-f_9GJDWLUe/pubhtml?gid=70692563&single=true",
  // (2) Fallback local (se csvUrl estiver vazio): carrega 'products.json' deste repositório
  fallbackUrl: "products.json"

};
