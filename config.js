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
  csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRHmP2wwv8GyKOXBzbShz6Ctm3SaU4Xb186-qCHrMn3gEUcmtpbug59GogNwB6w80fbfh-WfXeX8sDj/pub?gid=70692563&single=true&output=csv",
  // (2) Fallback local (se csvUrl estiver vazio): carrega 'products.json' deste repositório

};
