/* ==========================================================================
   Medismart Empresas — experiencia progresiva con GSAP
   Plugins: ScrollTrigger, ScrollSmoother, SplitText, ScrambleText, DrawSVG
   ========================================================================== */
import '@fontsource/poppins/latin-400.css';
import '@fontsource/poppins/latin-500.css';
import '@fontsource/poppins/latin-600.css';
import '@fontsource/poppins/latin-700.css';
import '@fontsource/mulish/latin-400.css';
import '@fontsource/mulish/latin-600.css';
import '@fontsource/mulish/latin-700.css';
import '@fontsource/mulish/latin-900.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '../styles/main.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { createIcons, Stethoscope, PawPrint, Hospital } from 'lucide';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, ScrambleTextPlugin, DrawSVGPlugin);

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const DESKTOP = '(min-width: 1201px)';
const THEME_BG = { dark: '#070a1e', light: '#f8fafc' };

let smoother = null;

/* --------------------------------------------------------------------------
   0. Preparación: íconos + SVG en línea (para animar trazos)
   -------------------------------------------------------------------------- */
createIcons({ icons: { Stethoscope, PawPrint, Hospital }, attrs: { 'stroke-width': 1.25 } });

async function inlineSvgs() {
  const hosts = $$('.js-inline-svg');
  await Promise.all(hosts.map(async (host, i) => {
    const res = await fetch(host.dataset.src);
    let svg = await res.text();
    // Prefija ids para evitar colisiones entre SVGs en línea
    const p = `s${i}-`;
    svg = svg.replace(/id="([^"]+)"/g, `id="${p}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${p}$1)`);
    host.innerHTML = svg;
    host.dataset.prefix = p;
  }));
}

const imagesReady = () => Promise.all($$('img').filter(img => !img.complete).map(img =>
  new Promise(r => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); })));

/* --------------------------------------------------------------------------
   1. Preloader con contador (estilo odómetro)
   -------------------------------------------------------------------------- */
function runPreloader(ready) {
  const pre = $('.preloader');
  if (REDUCED || !pre) { pre?.remove(); document.body.classList.remove('is-loading'); return Promise.resolve(); }

  const count = $('.js-count', pre);
  const bar = $('.preloader__bar span', pre);
  const state = { v: 0 };

  return new Promise(resolve => {
    // Avanza hasta 82% mientras carga; termina cuando todo está listo
    const fill = gsap.to(state, {
      v: 82, duration: 1.4, ease: 'power2.out',
      onUpdate: () => { count.textContent = String(Math.round(state.v)).padStart(2, '0'); gsap.set(bar, { scaleX: state.v / 100 }); },
    });
    // Espera a que todo cargue y a un mínimo de tiempo para el momento de marca
    Promise.all([ready, fill.then()]).then(() => {
      gsap.timeline({ onComplete: resolve })
        .to(state, {
          v: 100, duration: .6, ease: 'power3.inOut',
          onUpdate: () => { count.textContent = String(Math.round(state.v)).padStart(2, '0'); gsap.set(bar, { scaleX: state.v / 100 }); },
        })
        .to('.preloader__inner > *', { y: -30, opacity: 0, stagger: .05, duration: .5, ease: 'power3.in' }, '+=.15')
        .to(pre, { yPercent: -100, duration: 1, ease: 'power4.inOut' }, '-=.2')
        .add(() => { pre.remove(); document.body.classList.remove('is-loading'); }, '-=.35');
    });
  });
}

/* --------------------------------------------------------------------------
   2. Scroll suave + navegación por anclas
   -------------------------------------------------------------------------- */
function initSmoother() {
  if (REDUCED) return;
  $$('.glow').forEach(g => { g.dataset.speed = '0.75'; });
  smoother = ScrollSmoother.create({
    wrapper: '#smooth-wrapper', content: '#smooth-content',
    smooth: 1.15, effects: true, smoothTouch: false,
  });
}

function scrollToTarget(target, { focus } = {}) {
  const el = typeof target === 'string' ? $(target) : target;
  if (!el) return;
  if (smoother) smoother.scrollTo(el, true, 'top 90px');
  else el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
  if (focus) {
    const form = $('#demo-form');
    setTimeout(() => {
      $('#d-nombre')?.focus({ preventScroll: true });
      form.classList.remove('is-attention'); void form.offsetWidth; form.classList.add('is-attention');
    }, smoother ? 1100 : 600);
  }
}

function initAnchors() {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id === '#' || id === '#simulador') { e.preventDefault(); return; }
    const toForm = a.classList.contains('js-to-form') || id === '#demo-form';
    const target = toForm ? '#inicio' : id;
    if (!$(target)) return;
    e.preventDefault();
    $('.nb')?.classList.remove('is-open');
    $('.nb__burger')?.setAttribute('aria-expanded', 'false');
    scrollToTarget(target, { focus: toForm });
  });

  const burger = $('.nb__burger');
  burger?.addEventListener('click', () => {
    const open = $('.nb').classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
}

/* --------------------------------------------------------------------------
   3. Header inteligente + progreso de lectura + fondo por capítulo
   -------------------------------------------------------------------------- */
function initChrome() {
  const header = $('.nb');
  const bar = $('.nb__progress span');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate(self) {
      gsap.set(bar, { scaleX: self.progress });
      const y = self.scroll();
      header.classList.toggle('is-hidden', self.direction === 1 && y > 240 && !header.classList.contains('is-open'));
    },
  });

  // Un solo lienzo de fondo que cambia de color con transición suave
  const stage = $('.bg-stage');
  $$('.sec[data-theme]:not(.trust)').forEach(sec => {
    const color = THEME_BG[sec.dataset.theme];
    ScrollTrigger.create({
      trigger: sec, start: 'top 55%', end: 'bottom 55%',
      onToggle: self => self.isActive && gsap.to(stage, { backgroundColor: color, duration: REDUCED ? 0 : .7, ease: 'power2.out', overwrite: true }),
    });
  });

  // Link activo del menú
  const links = $$('.nb__link');
  links.forEach(link => {
    const sec = $(link.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top 50%', end: 'bottom 50%',
      onToggle: self => link.classList.toggle('is-active', self.isActive),
    });
  });
}

/* --------------------------------------------------------------------------
   4. Navegación de capítulos (incentiva a seguir explorando)
   -------------------------------------------------------------------------- */
function initChapters() {
  const nav = $('.chapters');
  if (!nav) return;
  const items = $$('a', nav);
  const show = v => {
    nav.classList.toggle('is-visible', v);
    gsap.to(nav, { autoAlpha: v ? 1 : 0, x: v ? 0 : 20, duration: .5, ease: 'power3.out', overwrite: true });
  };
  ScrollTrigger.create({
    trigger: '#pilar-1', start: 'top 60%', endTrigger: '#innovacion', end: 'bottom 40%',
    onToggle: self => show(self.isActive),
  });
  $$('section[data-chapter]').forEach(sec => {
    const n = Number(sec.dataset.chapter);
    ScrollTrigger.create({
      trigger: sec, start: 'top 50%', end: 'bottom 50%',
      onToggle: self => {
        if (!self.isActive) return;
        items.forEach(a => {
          const k = Number(a.dataset.chapter);
          a.classList.toggle('is-active', k === n);
          a.classList.toggle('is-done', k < n);
        });
      },
    });
  });
}

/* --------------------------------------------------------------------------
   5. Utilidades de texto
   -------------------------------------------------------------------------- */
function splitReveal(el, { trigger = el, start = 'top 80%', delay = 0, stagger = .1, paused = false } = {}) {
  let tween;
  SplitText.create(el, {
    type: 'lines,words', mask: 'lines', autoSplit: true, linesClass: 'line',
    onSplit(self) {
      tween = gsap.from(self.lines, {
        yPercent: 110, duration: 1.1, ease: 'expo.out', stagger, delay,
        paused,
        scrollTrigger: paused ? undefined : { trigger, start, once: true },
      });
      return tween;
    },
  });
  return () => tween;
}

function countUp(el, { duration = 1.6 } = {}) {
  const to = Number(el.dataset.to);
  const o = { v: 0 };
  return gsap.to(o, { v: to, duration, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } });
}

/* --------------------------------------------------------------------------
   6. Hero
   -------------------------------------------------------------------------- */
function heroIntro() {
  const getTitle = splitReveal($('.hero__title'), { paused: true, stagger: .12 });
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.add(() => getTitle()?.play(), 0)
    .from('.nb', { yPercent: -100, duration: 1 }, 0)
    .from('.hero__lead', { y: 30, opacity: 0, duration: 1.1 }, .35)
    .from('.hero__checks li', { x: -16, opacity: 0, stagger: .08, duration: .9 }, .5)
    .from('.hero__ctas', { y: 20, opacity: 0, duration: .9 }, .7)
    .from('.demo-form', { y: 80, opacity: 0, rotateX: 8, transformPerspective: 1200, transformOrigin: '50% 100%', duration: 1.4 }, .3)
    .from('.demo-form .field, .demo-form .check, .demo-form .btn, .demo-form__micro', { y: 16, opacity: 0, stagger: .05, duration: .8 }, .6)
    .from('.scroll-cue', { opacity: 0, y: 10, duration: 1 }, 1.1);

  // El brillo sigue al cursor (profundidad sutil)
  if (FINE_POINTER) {
    const glow = $('.js-glow');
    const xTo = gsap.quickTo(glow, 'x', { duration: 1.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(glow, 'y', { duration: 1.4, ease: 'power3.out' });
    $('#inicio').addEventListener('pointermove', e => {
      const r = e.currentTarget.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width * .7) * .35);
      yTo((e.clientY - r.top - r.height * .2) * .35);
    });
  }

}

// El copy del hero se desvanece y aleja a medida que avanzas
function initHeroScroll() {
  gsap.to('.hero__copy', {
    y: -60, opacity: .2, ease: 'none', immediateRender: false,
    scrollTrigger: { trigger: '#inicio', start: 'center 40%', end: 'bottom top', scrub: true },
  });
}

/* --------------------------------------------------------------------------
   7. Confianza + puente narrativo
   -------------------------------------------------------------------------- */
function initTrust() {
  splitReveal($('.trust__title'), { start: 'top 75%' });
  gsap.from('.trust__logos li', {
    y: 50, opacity: 0, scale: .94, duration: 1.2, ease: 'expo.out', stagger: .12,
    scrollTrigger: { trigger: '.trust__logos', start: 'top 85%', once: true },
  });
}

function initBridge() {
  const statement = $('.js-scrub-words');
  SplitText.create(statement, {
    type: 'words', wordsClass: 'word', autoSplit: true,
    onSplit: self => gsap.to(self.words, {
      opacity: 1, stagger: .12, ease: 'none',
      scrollTrigger: { trigger: statement, start: 'top 78%', end: 'bottom 42%', scrub: true },
    }),
  });
  gsap.from('.bridge .eyebrow', { y: 20, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.bridge', start: 'top 75%', once: true } });

  const stats = $$('.stats li');
  gsap.from(stats, {
    y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .1,
    scrollTrigger: {
      trigger: '.stats', start: 'top 85%', once: true,
      onEnter: () => $$('.js-countup').forEach(el => countUp(el)),
    },
  });
}

/* --------------------------------------------------------------------------
   8. Pilares — copy (se reproduce) + ilustración (se "scrubea" con pin)
   -------------------------------------------------------------------------- */
function pillarCopyTl(sec) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out', duration: 1 } });
  const [prev, curr] = $$('.pillar__num-roll span', sec);
  tl.to(prev, { yPercent: -100, duration: .9, ease: 'power3.inOut' }, 0)
    .to(curr, { yPercent: -100, duration: .9, ease: 'power3.inOut' }, 0)
    .from($('.pillar__icon', sec), { scale: .4, rotate: -25, opacity: 0, duration: 1.1, ease: 'back.out(2)' }, .1)
    .from($('.pillar__desc', sec), { y: 24, opacity: 0 }, .35)
    .from($('.badge', sec), { y: 16, opacity: 0 }, .5);
  const getTitle = splitReveal($('.pillar__title', sec), { paused: true });
  tl.add(() => getTitle()?.play(), .15);
  return tl;
}

function ids(host, names) {
  const p = host.dataset.prefix;
  return names.map(n => host.querySelector(`#${CSS.escape(p + n)}`)).filter(Boolean);
}

function artPillar1(sec) {
  const host = $('.flow__svg', sec);
  const lines = ids(host, ['Vector', 'Vector_2', 'Vector_3', 'Vector_4']);
  const circles = ids(host, ['Vector_5', 'Vector_6', 'Vector_7', 'Vector_8', 'Vector_9']);
  const icons = ids(host, ['Group_2', 'Group_3', 'Group_4', 'Group_5', 'Group_6']);
  const labels = $$('.flow__labels li', sec);
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  gsap.set([...lines, ...circles].flatMap(g => [...g.querySelectorAll('path')]), { drawSVG: '0%' });
  gsap.set(icons, { opacity: 0, scale: .4, transformOrigin: '50% 50%' });
  gsap.set(labels, { opacity: 0, y: 14 });

  circles.forEach((c, i) => {
    const at = i * .9;
    tl.to(c.querySelectorAll('path'), { drawSVG: '100%', duration: .6, ease: 'power1.inOut' }, at)
      .to(icons[i], { opacity: 1, scale: 1, duration: .5, ease: 'back.out(2.2)' }, at + .3)
      .to(labels[i], { opacity: 1, y: 0, duration: .5 }, at + .35)
      .add(() => labels.forEach((l, k) => l.classList.toggle('is-current', k === i)), at + .3);
    if (lines[i]) tl.to(lines[i].querySelectorAll('path'), { drawSVG: '100%', duration: .5, ease: 'none' }, at + .5);
  });
  tl.to({}, { duration: .4 }); // respiro final antes de soltar el pin
  return tl;
}

function artPillar2(sec) {
  const art = $('.art--p2', sec);
  const q = s => $(s, art);
  const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1 } });
  tl.from(q('.l-circles'), { scale: .55, rotate: -40, opacity: 0, duration: 1.4 }, 0)
    .from(q('.l-doc'), { y: 70, opacity: 0 }, .25)
    .from(q('.l-card-top'), { x: -90, opacity: 0 }, .45)
    .from(q('.l-card-top').querySelectorAll('.t'), { opacity: 0, y: 6, stagger: .1, duration: .6 }, .75)
    .from(q('.l-shield'), { scale: 0, rotate: -30, duration: .8, ease: 'back.out(2.5)' }, .8)
    .fromTo(q('.l-scan'), { opacity: 0, top: '0%' }, { opacity: 1, top: '82%', duration: .9, ease: 'power1.inOut' }, 1)
    .to(q('.l-scan'), { top: '6%', duration: .9, ease: 'power1.inOut' }, 1.9)
    .to(q('.l-scan'), { opacity: 0, duration: .3 }, 2.6)
    .from(q('.l-card-bottom'), { x: 90, opacity: 0 }, 1.6)
    .from(q('.l-card-bottom').querySelectorAll('.t'), { opacity: 0, y: 6, stagger: .1, duration: .6 }, 1.9)
    .from(q('.l-sparkles'), { opacity: 0, scale: .9, duration: 1.2 }, 1.2)
    .from(q('.l-caption'), { opacity: 0, y: 12 }, 2.1);

  if (!REDUCED) {
    gsap.to(q('.l-card-top'), { y: -8, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to(q('.l-card-bottom'), { y: 8, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: .6 });
    gsap.to(q('.l-sparkles'), { opacity: .55, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 3 });
  }
  return tl;
}

function artPillar3(sec) {
  const art = $('.art--p3', sec);
  const q = s => $(s, art);
  const date = { d: 1, m: 1 };
  const dA = q('.js-date-a'), dB = q('.js-date-b');
  const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1 } });
  const graphHost = q('.l-graph-line');
  const graphPath = graphHost.querySelector('path');
  gsap.set(graphPath, { drawSVG: '0%' });

  tl.from(q('.l-blob'), { scale: .8, opacity: 0, duration: 1.4 }, 0)
    .from(q('.l-arc'), { clipPath: 'inset(0 100% 0 0)', duration: 1.2, ease: 'power2.inOut' }, .2)
    .from(q('.l-panel-top'), { y: 90, opacity: 0 }, .35)
    .from([q('.l-cal'), q('.l-t-title'), q('.l-t-meta')], { opacity: 0, y: 10, stagger: .08, duration: .7 }, .7)
    .from(q('.l-t-date'), { opacity: 0, duration: .4 }, .8)
    .to(date, {
      d: 15, m: 4, duration: 1.2, ease: 'power2.out', snap: { d: 1, m: 1 },
      onUpdate: () => { dA.textContent = String(date.d).padStart(2, '0'); dB.textContent = String(date.m).padStart(2, '0'); },
    }, .8)
    .from(q('.l-panel-bottom'), { y: 90, opacity: 0 }, 1.1)
    .from([q('.l-t-health'), q('.l-axis')], { opacity: 0, y: 10, stagger: .08, duration: .7 }, 1.4)
    .from(q('.l-graph-fill'), { clipPath: 'inset(0 100% 0 0)', duration: 1.3, ease: 'power2.inOut' }, 1.6)
    .to(graphPath, { drawSVG: '100%', duration: 1.3, ease: 'power2.inOut' }, 1.6)
    .from(q('.l-pet'), { scale: 0, rotate: 30, duration: .9, ease: 'back.out(2)' }, 1.2)
    .from([q('.l-paws'), q('.l-pill-a'), q('.l-pill-b')], { scale: 0, opacity: 0, stagger: .12, duration: .8, ease: 'back.out(2.4)' }, 1.9);

  // Parallax por profundidad con el cursor (desktop)
  if (FINE_POINTER && !REDUCED) {
    const layers = $$('[data-depth]', art).map(el => {
      const t = el.tagName === 'DIV' && !el.classList.contains('l-paws') && !el.classList.contains('l-pill-a') && !el.classList.contains('l-pill-b') ? el.firstElementChild : el;
      const d = Number(el.dataset.depth);
      return { x: gsap.quickTo(t, 'x', { duration: .9, ease: 'power3.out' }), y: gsap.quickTo(t, 'y', { duration: .9, ease: 'power3.out' }), d };
    });
    sec.addEventListener('pointermove', e => {
      const r = art.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5;
      const ny = (e.clientY - r.top) / r.height - .5;
      layers.forEach(l => { l.x(nx * l.d * 6); l.y(ny * l.d * 6); });
    });
    sec.addEventListener('pointerleave', () => layers.forEach(l => { l.x(0); l.y(0); }));
  }
  return tl;
}

function artPillar4(sec) {
  const art = $('.art--p4', sec);
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.fromTo($('.p4__mask', art), { clipPath: 'circle(0% at 50% 60%)' }, { clipPath: 'circle(50% at 50% 50%)', duration: 1.6, ease: 'power3.inOut' }, 0)
    .from($('.p4__img', art), { scale: 1.35, rotate: -6, duration: 2 }, 0)
    .to({}, { duration: .4 });

  if (!REDUCED) gsap.to(art, { y: -14, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  if (FINE_POINTER && !REDUCED) {
    const rx = gsap.quickTo(art, 'rotationX', { duration: .8, ease: 'power3.out' });
    const ry = gsap.quickTo(art, 'rotationY', { duration: .8, ease: 'power3.out' });
    gsap.set(art, { transformPerspective: 1000 });
    sec.addEventListener('pointermove', e => {
      const r = art.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - .5) * 10);
      rx(-((e.clientY - r.top) / r.height - .5) * 10);
    });
    sec.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }
  return tl;
}

function initPillars() {
  const builders = { 'pilar-1': artPillar1, 'pilar-2': artPillar2, 'pilar-3': artPillar3, 'pilar-4': artPillar4 };
  const mm = gsap.matchMedia();

  $$('.pillar').forEach(sec => {
    const copy = pillarCopyTl(sec);
    ScrollTrigger.create({ trigger: sec, start: 'top 62%', once: true, onEnter: () => copy.play() });

    const art = builders[sec.id]?.(sec);
    if (!art) return;
    art.pause(0);

    mm.add(DESKTOP, () => {
      // Desktop: la sección se fija y la ilustración avanza con el scroll
      const st = ScrollTrigger.create({
        trigger: sec, start: 'top top', end: () => `+=${Math.round(window.innerHeight * 1.25)}`,
        pin: true, scrub: 1, animation: art, anticipatePin: 1,
        onLeave: () => sec.classList.add('is-complete'),
      });
      return () => st.kill();
    });
    mm.add(`not all and ${DESKTOP}`, () => {
      // Móvil / tablet: se reproduce al entrar, sin pin
      art.progress(0).pause();
      const st = ScrollTrigger.create({ trigger: $('.pillar__art', sec), start: 'top 75%', once: true, onEnter: () => art.timeScale(1.2).play() });
      return () => st.kill();
    });
  });
}

/* --------------------------------------------------------------------------
   9. Innovación: tarjetas IA con tilt 3D, brillo y texto "scramble"
   -------------------------------------------------------------------------- */
function initAI() {
  splitReveal($('.ai__title'), { start: 'top 78%' });
  const cards = $$('.ai-card');
  gsap.from(cards, {
    y: 140, rotateX: 22, opacity: 0, transformOrigin: '50% 100%', duration: 1.4, ease: 'expo.out', stagger: .14,
    scrollTrigger: {
      trigger: '.ai__cards', start: 'top 82%', once: true,
      onEnter: () => $$('.js-scramble').forEach((el, i) => gsap.to(el, {
        delay: .35 + i * .14, duration: 1.2, ease: 'none',
        scrambleText: { text: el.textContent, chars: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ01', revealDelay: .3, speed: .5 },
      })),
    },
  });

  cards.forEach((card, i) => {
    const img = $('.ai-card__img', card);
    if (!REDUCED) gsap.to(img, { y: -14, duration: 2.6 + i * .3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * .4 });
    if (!FINE_POINTER || REDUCED) return;
    const rx = gsap.quickTo(card, 'rotationX', { duration: .7, ease: 'power3.out' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: .7, ease: 'power3.out' });
    const ix = gsap.quickTo(img, 'x', { duration: .9, ease: 'power3.out' });
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
      ry((nx - .5) * 12); rx(-(ny - .5) * 12); ix((nx - .5) * -18);
      card.style.setProperty('--mx', `${nx * 100}%`); card.style.setProperty('--my', `${ny * 100}%`);
    });
    card.addEventListener('pointerleave', () => { rx(0); ry(0); ix(0); });
  });
}

/* --------------------------------------------------------------------------
   10. Cierre + footer
   -------------------------------------------------------------------------- */
function initCierre() {
  splitReveal($('.cierre__title'), { start: 'top 80%' });
  gsap.from(['.cierre__lead', '.cierre .btn'], {
    y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .12,
    scrollTrigger: { trigger: '.cierre', start: 'top 70%', once: true },
  });
  gsap.fromTo('.glow--cierre', { scale: .7, opacity: .4 }, {
    scale: 1.15, opacity: 1, ease: 'none',
    scrollTrigger: { trigger: '.cierre', start: 'top bottom', end: 'bottom top', scrub: true },
  });

  // Botón magnético
  if (FINE_POINTER && !REDUCED) {
    $$('.js-magnetic').forEach(btn => {
      const xTo = gsap.quickTo(btn, 'x', { duration: .6, ease: 'elastic.out(1, .4)' });
      const yTo = gsap.quickTo(btn, 'y', { duration: .6, ease: 'elastic.out(1, .4)' });
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .25);
        yTo((e.clientY - r.top - r.height / 2) * .4);
      });
      btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  gsap.from('.ft__cols > *, .ft__legal > *', {
    y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: .07,
    scrollTrigger: { trigger: '.ft', start: 'top 85%', once: true },
  });
}

/* --------------------------------------------------------------------------
   11. Formulario de demo (validación en cliente, sin backend en esta POC)
   -------------------------------------------------------------------------- */
const FREE_MAIL = /@(gmail|hotmail|outlook|live|yahoo|icloud|proton(mail)?)\./i;

function initForm() {
  const form = $('#demo-form');
  const err = $('.demo-form__error', form);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fields = [...form.querySelectorAll('input[required], select[required]')];
    let msg = '';
    fields.forEach(f => f.closest('.field')?.classList.remove('is-invalid'));
    for (const f of fields) {
      const bad = f.type === 'checkbox' ? !f.checked : !f.value.trim() || (f.type === 'email' && (!f.checkValidity() || FREE_MAIL.test(f.value)));
      if (bad) {
        f.closest('.field')?.classList.add('is-invalid');
        if (!msg) {
          msg = f.type === 'checkbox' ? 'Debes aceptar la política de privacidad.'
            : f.type === 'email' && f.value && FREE_MAIL.test(f.value) ? 'Usa tu email corporativo (no personal).'
              : 'Completa todos los campos para agendar.';
          f.focus();
        }
      }
    }
    err.textContent = msg;
    if (msg) { gsap.fromTo(form, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1, .3)' }); return; }

    const fieldsBox = $('.demo-form__fields', form);
    const done = $('.demo-form__done', form);
    gsap.timeline()
      .to(fieldsBox, { opacity: 0, y: -16, duration: .4, ease: 'power2.in' })
      .add(() => { fieldsBox.hidden = true; done.hidden = false; ScrollTrigger.refresh(); })
      .from(done.children, { y: 20, opacity: 0, stagger: .1, duration: .8, ease: 'expo.out' })
      .from($('.demo-form__done-icon', form), { scale: 0, duration: .8, ease: 'back.out(2.5)' }, '<');
  });
}

/* --------------------------------------------------------------------------
   Arranque
   -------------------------------------------------------------------------- */
(async function boot() {
  initAnchors();
  initForm();

  const ready = Promise.all([inlineSvgs(), document.fonts.ready, imagesReady()]).catch(() => {});
  const preloaderDone = runPreloader(ready);
  await ready;

  if (REDUCED) {
    initChrome();
    initChapters();
    return; // Sin animaciones: el contenido queda visible y estático
  }

  initSmoother();
  initHeroScroll();
  initTrust();
  initBridge();
  initPillars();   // los pines van antes que los triggers que dependen de su espacio
  initAI();
  initCierre();
  initChrome();
  initChapters();
  ScrollTrigger.sort();

  // Estado inicial del hero oculto hasta que termina el preloader
  gsap.set(['.hero__title', '.hero__lead', '.hero__checks', '.hero__ctas', '.demo-form', '.scroll-cue'], { visibility: 'hidden' });
  await preloaderDone;
  gsap.set(['.hero__title', '.hero__lead', '.hero__checks', '.hero__ctas', '.demo-form', '.scroll-cue'], { visibility: 'visible' });
  heroIntro();
  ScrollTrigger.refresh();
})();
