<!-- theme.js -->
<script>
(function() {
  const KEY = "fd_theme";

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(KEY, theme); } catch {}
    // Atualiza o texto dos botões se existirem
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
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function toggle() {
    const cur = document.documentElement.getAttribute("data-theme") || preferred();
    apply(cur === "dark" ? "light" : "dark");
  }

  function init() {
    // aplica na primeira carga
    apply(preferred());

    // liga em todos os botões com id ou classe
    const bind = () => {
      document.querySelectorAll("#themeToggle, .js-theme-toggle").forEach(btn => {
        btn.removeEventListener("click", toggle);
        btn.addEventListener("click", toggle);
      });
    };
    bind();
    document.addEventListener("DOMContentLoaded", bind);

    // sincroniza entre abas
    window.addEventListener("storage", e => {
      if (e.key === KEY && (e.newValue === "dark" || e.newValue === "light")) {
        apply(e.newValue);
      }
    });

    // segue mudança do sistema se usuário não fixou manualmente
    const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    if (mq && mq.addEventListener) {
      mq.addEventListener("change", () => {
        try { if (!localStorage.getItem(KEY)) apply(preferred()); } catch {}
      });
    }
  }

  init();
})();
</script>
