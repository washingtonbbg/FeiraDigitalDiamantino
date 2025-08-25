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
  csvUrl: "https://docs.google.com/spreadsheets/d/1ALiQFBbm_11ylNZilWxCLbwJucoYiVYY/edit?gid=1979612949#gid=1979612949",

  // (2) Fallback local (se csvUrl estiver vazio): carrega 'products.json' deste repositório
};
