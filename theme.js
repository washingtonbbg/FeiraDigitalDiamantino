// theme.js — alterna claro/escuro em TODAS as páginas usando localStorage
(function () {
  const KEY = "fd_theme"; // "dark" | "light"

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(KEY, theme); } catch {}
    // Ajusta texto/aria de todos os botões de tema
    document.querySelectorAll("#themeToggle, .js-theme-toggle").forEach(btn => {
      btn.textContent = theme === "dark" ? "Claro" : "Tema";
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.title = theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro";
    });
  }

  function preferred() {
    // salvo > sistema > claro
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch {}
    return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark" : "light";
  }

  function toggle() {
    const cur = document.documentElement.getAttribute("data-theme") || preferred();
    apply(cur === "dark" ? "light" : "dark");
  }

  function bind() {
    document.querySelectorAll("#themeToggle, .js-theme-toggle")
      .forEach(btn => { btn.removeEventListener("click", toggle); btn.addEventListener("click", toggle); });
  }

  // Inicializa após parse do HTML (script está com defer)
  document.addEventListener("DOMContentLoaded", () => {
    apply(preferred());
    bind();
  });

  // Sincroniza entre abas
  window.addEventListener("storage", e => {
    if (e.key === KEY && (e.newValue === "dark" || e.newValue === "light")) apply(e.newValue);
  });

  // Segue mudança do sistema caso usuário não tenha salvo manualmente
  const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
  if (mq && mq.addEventListener) {
    mq.addEventListener("change", () => {
      try { if (!localStorage.getItem(KEY)) apply(preferred()); } catch {}
    });
  }
})();

