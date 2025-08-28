# Feira Digital Diamantino — Pronto para publicar

## O que está incluso
- **index.html, app.js, styles.css** — catálogo com carrinho e WhatsApp
- **config.js** — suas configurações (nome, Whats, tema, fonte de dados)
- **products.json** — catálogo local (exemplo)
- **theme.js** — botão Tema (claro/escuro) e meta theme-color
- **feira.html, feira.js, producers.json** — lista de bancas (multi-vendedor)
- **cadastro.html, cadastro.js** — cadastro simples do produtor por WhatsApp

## Como usar
1. Edite `config.js` e coloque seu Whats em `whatsappPhone` e `adminWhats`.
2. Se for usar **planilha** por produtor, publique o Google Sheets em **CSV** e cole o link no `producers.json` (campo `csvUrl`).
3. Faça deploy (GitHub Pages): suba todos os arquivos para o repositório.
4. Acesse:
   - Lista de bancas: `feira.html`
   - Catálogo padrão: `index.html`
   - Catálogo de uma banca: `index.html?produtor=ID_DA_BANCA`

## Dicas
- Para personalizar o tema inicial: em `config.js`, mude `theme: "dark"` para `"light"`.
- O botão **Tema** lembra a preferência do usuário no navegador (localStorage).
