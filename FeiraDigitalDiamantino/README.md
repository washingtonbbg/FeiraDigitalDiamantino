# Agro MVP (CSV via Google Sheets) – 100% grátis no GitHub Pages

Este é um starter kit de catálogo + carrinho que envia o pedido **pelo WhatsApp**, sem servidor e sem custo.

## Como usar (5 passos)

1. **Faça um fork/baixe** estes arquivos e publique no **GitHub Pages**:  
   - Settings → Pages → Source = Deploy from a branch → `main` → `/root`.
   - Aguarde a URL (ex.: `https://seu-usuario.github.io/agro-mvp-csv`).

2. **Edite `config.js`**:
   - `brandName`, `whatsappCentral`, `pixKey`, `pickupPoints`.
   - Em **csvUrl**, cole o **link CSV** da sua planilha do Google:
     - No Google Sheets → **Arquivo → Publicar na Web** → escolha a aba **Produtos** → **CSV** → **Publicar**.
     - Copie a URL (termina com `output=csv`) e cole em `csvUrl`.

   > Alternativa: se preferir, deixe `csvUrl` vazio e edite o `products.json` local.

3. **Formato esperado da aba `Produtos`** (cabeçalhos):
   ```
   id | name | unit | price | stock | photo
   ```
   - `price` pode ter vírgula decimal (ex.: `8,90`).
   - `unit` (ex.: `kg`, `maço`, `dúzia`).
   - `photo` é um link de imagem pública (Drive, Imgur, Unsplash etc.).

4. **Permissões**:
   - O CSV publicado é público. Ele é **somente leitura**.
   - Se preferir não “Publicar na web”, pode usar:  
     `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/export?format=csv&gid=SUA_GID`  
     > Nesse caso, é preciso deixar o arquivo **Compartilhado com: Qualquer pessoa com o link (Leitor)**.

5. **Testar no celular**:
   - Abra a URL do GitHub Pages.
   - Adicione à tela inicial (PWA “leve”).

## Dicas
- **Busca e filtro**: barra de busca + filtro por unidade.
- **WhatsApp**: envia itens, total, nome do cliente, ponto de entrega e PIX.
- **Estoque**: por simplicidade, não decrementar automaticamente (ajuste no CSV).

## Próximos passos (free)
- Registrar pedidos em uma planilha via **Google Apps Script Web App** (recebendo POST do `fetch`).  
- Incluir **ícone/manifest** para comportamento PWA completo.
