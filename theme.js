/* theme.js — alterna tema claro/escuro em todas as páginas */
(() => {
  if (window.__themeInit) return;
  window.__themeInit = true;
  const KEY='theme';
  let meta=document.querySelector('meta[name="theme-color"]');
  if(!meta){ meta=document.createElement('meta'); meta.setAttribute('name','theme-color'); document.head.appendChild(meta); }
  const read=()=>{ try{return localStorage.getItem(KEY)}catch{return null} };
  const initial = read() || (window.APP_CONFIG && window.APP_CONFIG.theme) || 'dark';
  const apply = (t)=>{ const light=(t==='light'); document.body.classList.toggle('theme-light', light); meta.setAttribute('content', light?'#ffffff':'#111018'); };
  const set = (t)=>{ apply(t); try{localStorage.setItem(KEY,t)}catch{} };
  const get = ()=> document.body.classList.contains('theme-light')?'light':'dark';
  const toggle = ()=> set(get()==='light'?'dark':'light');
  apply(initial);
  const bind=()=>{ const b=document.getElementById('themeToggle'); if(!b||b.dataset.bound) return; b.dataset.bound='1'; b.addEventListener('click', toggle); };
  bind(); document.addEventListener('DOMContentLoaded', bind);
  window.addEventListener('storage', e=>{ if(e.key===KEY) apply(e.newValue||'dark'); });
  window.Theme = {get,set,toggle,apply,init:()=>{ apply(read()||initial); bind(); }};
})();