# Feira Digital Diamantino — tema Napoli

Interface mobile-first no estilo do layout anexo (escuro + destaque magenta), com:
- busca, categorias em *chips*, cards de produto;
- carrinho flutuante e modal;
- checkout por WhatsApp.

## Como usar

1) **Troque o número do WhatsApp** em `config.js` (campo `whatsappPhone`) — só números: `55` + DDD + número.
2) **Escolha a fonte de dados** em `config.js`:
   - `type: "csv"` + cole a URL `output=csv` da sua planilha publicada;
   - ou `type: "json"` para usar `products.json` (padrão deste pacote).
3) Publique no GitHub Pages:
   ```bash
   git add .
   git commit -m "tema napoli + carrinho whatsapp"
   git push
   ```
4) Abra `https://SEU-USUARIO.github.io/FeiraDigitalDiamantino/`.

> Se o CSV falhar, o app avisa e usa automaticamente o `products.json`.
