import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initHeader() {
  const hd = document.querySelector('[data-hd]');
  if (!hd) return;
  const page = document.body.dataset.page;

  // Página activa
  hd.querySelectorAll('[data-nav]').forEach((l) => {
    if (l.dataset.nav === page) l.setAttribute('aria-current', 'page');
  });

  // Dropdowns: hover con intención en desktop, click/teclado siempre
  const drops = hd.querySelectorAll('[data-drop]');
  const closeAll = (except) => drops.forEach((d) => d !== except && setOpen(d, false));
  function setOpen(d, open) {
    d.classList.toggle('is-open', open);
    d.querySelector('button')?.setAttribute('aria-expanded', String(open));
  }
  drops.forEach((d) => {
    const btn = d.querySelector('button');
    let t;
    btn.addEventListener('click', () => { const o = !d.classList.contains('is-open'); closeAll(d); setOpen(d, o); });
    d.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'mouse') return; clearTimeout(t); closeAll(d); setOpen(d, true); });
    d.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'mouse') return; t = setTimeout(() => setOpen(d, false), 160); });
    d.addEventListener('focusout', (e) => { if (!d.contains(e.relatedTarget)) setOpen(d, false); });
  });
  document.addEventListener('click', (e) => { if (!hd.contains(e.target)) closeAll(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

  // Menú móvil
  const burger = hd.querySelector('.hd__burger');
  const mnav = document.getElementById('mnav');
  burger?.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    mnav.hidden = !open;
    document.body.classList.toggle('is-locked', open);
    hd.classList.toggle('is-menu', open);
    if (open) hd.classList.remove('is-light', 'is-hidden');
    else syncTheme();
  });

  // Ocultar al bajar, mostrar al subir
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (hd.classList.contains('is-menu') || hd.querySelector('.is-open')) { lastY = y; return; }
    const down = y > lastY && y > 160;
    if (Math.abs(y - lastY) > 4) hd.classList.toggle('is-hidden', down);
    lastY = y;
    syncTheme();
  }, { passive: true });

  // Tema según la sección bajo el header (y = 32px)
  const sections = [...document.querySelectorAll('[data-theme]')];
  function syncTheme() {
    hd.classList.toggle('is-scrolled', window.scrollY > 24);
    if (hd.classList.contains('is-menu')) return;
    const probe = 32;
    const s = sections.find((el) => { const r = el.getBoundingClientRect(); return r.top <= probe && r.bottom > probe; });
    hd.classList.toggle('is-light', s ? s.dataset.theme === 'light' : false);
  }
  syncTheme();
  ScrollTrigger.addEventListener('refresh', syncTheme);
}
