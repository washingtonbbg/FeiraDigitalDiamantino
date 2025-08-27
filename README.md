# Feira Digital Diamantino — Multi‑produtor (bancas)

## Páginas
- `feira.html` — lista as bancas (produtores) de `producers.json`.
- `index.html?produtor=<id>` — abre o catálogo da banca (usa CSV do Google Sheets ou `products.json`).
- `cadastro.html` — formulário simples que envia o cadastro no WhatsApp do admin e permite pré‑visualizar.

## Configuração rápida
1. Abra `config.js` e coloque seu WhatsApp em `whatsappPhone` e `adminWhats`.
2. Edite `producers.json` e adicione os produtores (id, name, city, whatsapp, pixKey, dataSource.csvUrl).
3. Publique no GitHub Pages.
4. Use `feira.html` para escolher a banca. O botão **Ver banca** abre `index.html?produtor=ID`.

> Dica: Para cada produtor, publique o Google Sheets como **CSV** (Arquivo → Publicar na Web → CSV) e use o link no `csvUrl`.
