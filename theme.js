/* theme.js — alterna tema claro/escuro em todas as páginas
   - Usa localStorage('theme') para lembrar a preferência
   - Atualiza <meta name="theme-color">
   - Expõe window.Theme com { get, set, toggle, apply, init }
   - Evita inicialização duplicada com window.__themeInit
*/
(() => {
  if (window.__themeInit) return; // evita rodar duas vezes
  window.__themeInit = true;

  const STORAGE_KEY = 'theme';

  // Garante que exista a meta theme-color
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }

  const readPref = () => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  };

  const getInitial = () => {
    return readPref() || (window.APP_CONFIG && window.APP_CONFIG.theme) || 'dark';
  };

  const apply = (theme) => {
    const isLight = theme === 'light';
    document.body.classList.toggle('theme-light', isLight);
    meta.setAttribute('content', isLight ? '#ffffff' : '#111018');
  };

  const set = (theme) => {
    apply(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
  };

  const get = () => document.body.classList.contains('theme-light') ? 'light' : 'dark';

  const toggle = () => set(get() === 'light' ? 'dark' : 'light');

  // Inicializa tema logo de início
  apply(getInitial());

  // Vincula o botão, se existir
  const bindButton = () => {
    const btn = document.getElementById('themeToggle');
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', toggle);
  };

  // tenta já vincular e garante no DOMContentLoaded
  bindButton();
  document.addEventListener('DOMContentLoaded', bindButton);

  // Sincroniza entre abas
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) apply(e.newValue || 'dark');
  });

  // API pública (opcional)
  window.Theme = { get, set, toggle, apply, init: () => { apply(getInitial()); bindButton(); } };
})();