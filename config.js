// Configurações do app
window.APP_CONFIG = {
  storeName: "Feira Digital Diamantino",
  isOpen: true,
  whatsappPhone: "5565996245361", // << troque aqui pelo número com DDI + DDD, só números
  storeInfo: {
    tagline: "Retirada ou entrega combinada pelo WhatsApp"
  },
  checkout: {
    note: "Informe endereço, forma de pagamento (Pix, dinheiro ou cartão) e referência."
  },
  dataSource: {
    type: "csv", // "csv" para usar planilha publicada; "json" para usar products.json
    csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRHmP2wwv8GyKOXBzbShz6Ctm3SaU4Xb186-qCHrMn3gEUcmtpbug59GogNwB6w80fbfh-WfXeX8sDj/pub?gid=70692563&single=true&output=csv", // exemplo: https://docs.google.com/spreadsheets/...&output=csv
    jsonUrl: "products.json"
  }
};
