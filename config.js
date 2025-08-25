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
  https://docs.google.com/spreadsheets/d/e/2PACX-1vRu_YsbYeDr3uxthwY_ssWSGzV8el29KMge3PMl22nCNscERQs3kjmSg2GQjZtZPw/pub?gid=70692563&single=true&output=csv",

  // (2) Fallback local (se csvUrl estiver vazio): carrega 'products.json' deste repositório
};
