import '@fontsource-variable/plus-jakarta-sans';
import '../styles/main.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { renderIcons } from './icons.js';
import { initHeader } from './header.js';
import { initCatalina } from './catalina.js';
import { initPages } from './pages.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

const root = document.documentElement;
root.classList.add('js');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'expo.out';

renderIcons();
initHeader();

document.fonts.ready.then(() => {
  intro();
  reveals();
  if (!reduce) motion();
  initPages({ gsap, ScrollTrigger, reduce });
  initCatalina({ gsap, ScrollTrigger, reduce });
  ScrollTrigger.refresh();
});

/* -------------------------------------------------------------------------
   Intro de página: el hero cuenta su historia en secuencia
   ------------------------------------------------------------------------- */
function intro() {
  const hero = document.querySelector('.hero, .phero');
  if (!hero) return;
  const title = hero.querySelector('[data-split]');
  const ins = hero.querySelectorAll('[data-hero-in]');
  const stage = hero.querySelector('[data-hero-stage]');
  const cards = hero.querySelectorAll('[data-hero-card]');
  const chat = hero.querySelectorAll('[data-hero-chat] .bubble');
  const img = hero.querySelector('[data-hero-img]');
  const draw = hero.querySelector('[data-draw]');

  if (title) title.dataset.splitDone = '1';
  if (reduce) { gsap.set([ins, cards, chat], { opacity: 1 }); return; }

  const tl = gsap.timeline({ defaults: { ease: EASE, duration: 1.2 } });
  tl.from(hero.querySelectorAll('.aurora span'), { opacity: 0, scale: 0.6, duration: 2.4, stagger: 0.2 }, 0);

  if (title) {
    const split = SplitText.create(title, { type: 'lines,words', mask: 'lines', linesClass: 'ln', wordsClass: 'wd' });
    tl.from(split.words, { yPercent: 110, duration: 1.2, stagger: 0.04 }, 0.15);
  }
  tl.fromTo(ins, { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.08, duration: 1 }, 0.5);

  if (stage) {
    tl.from(stage, { y: 96, opacity: 0, duration: 1.6 }, 0.6);
    if (img) tl.from(img, { scale: 1.16, duration: 2.4, ease: 'power3.out' }, 0.6);
    tl.fromTo(cards, { opacity: 0, y: 24, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, stagger: 0.16, duration: 1 }, 1.3);
    if (draw) {
      const len = draw.getTotalLength();
      tl.fromTo(draw, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 1.5);
    }
    // conversación: el usuario pregunta, Catalina responde
    tl.fromTo(chat, { opacity: 0, y: 16, scale: 0.9, transformOrigin: '0% 100%' },
      { opacity: 1, y: 0, scale: 1, stagger: 0.9, duration: 0.8, ease: 'back.out(1.6)' }, 2.1);
  }
  window.__introTl = tl;
}

/* -------------------------------------------------------------------------
   Revelados al hacer scroll
   ------------------------------------------------------------------------- */
function reveals() {
  const titles = gsap.utils.toArray('[data-split]').filter((t) => !t.dataset.splitDone);
  const fades = gsap.utils.toArray('[data-reveal]').filter((el) => !el.closest('.hero, .phero') || !el.hasAttribute('data-hero-in'));
  const groups = gsap.utils.toArray('[data-reveal-stagger]');

  if (reduce) {
    gsap.set([fades, groups.map((g) => g.children)], { opacity: 1 });
    return;
  }

  titles.forEach((t) => {
    const split = SplitText.create(t, { type: 'lines,words', mask: 'lines', linesClass: 'ln', wordsClass: 'wd' });
    gsap.from(split.words, {
      yPercent: 110, duration: 1.2, ease: EASE, stagger: 0.035,
      scrollTrigger: { trigger: t, start: 'top 85%', once: true },
    });
  });

  fades.forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 32 }, {
      opacity: 1, y: 0, duration: 1.2, ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  groups.forEach((g) => {
    gsap.fromTo(g.children, { opacity: 0, y: 32 }, {
      opacity: 1, y: 0, duration: 1.2, ease: EASE, stagger: 0.1,
      scrollTrigger: { trigger: g, start: 'top 85%', once: true },
    });
  });
}

/* -------------------------------------------------------------------------
   Movimiento ambiental y de relato
   ------------------------------------------------------------------------- */
function motion() {
  // Aurora respira y sigue suavemente al cursor en el hero
  gsap.utils.toArray('.aurora span').forEach((b, i) => {
    gsap.to(b, { x: `random(-80, 80)`, y: `random(-60, 60)`, duration: `random(8, 12)`, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i });
  });

  // Fotos: revelado con máscara + parallax interno
  gsap.utils.toArray('.sec .photo, .phero .photo').forEach((p) => {
    const img = p.querySelector('img');
    if (!img || p.closest('[data-hero-stage]')) return;
    gsap.fromTo(p, { clipPath: 'inset(16% 8% 16% 8% round 32px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.6, ease: EASE,
      scrollTrigger: { trigger: p, start: 'top 90%', once: true },
      onComplete: () => gsap.set(p, { clearProps: 'clipPath' }),
    });
    gsap.fromTo(img, { scale: 1.2 }, { scale: 1, duration: 2, ease: EASE, scrollTrigger: { trigger: p, start: 'top 90%', once: true } });
  });
  gsap.utils.toArray('[data-parallax] img').forEach((img) => {
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Hero: la foto se aleja con profundidad al hacer scroll
  const stage = document.querySelector('[data-hero-stage] .hero__photo');
  if (stage) {
    gsap.to(stage.querySelector('img'), { yPercent: 8, scale: 1.06, ease: 'none', scrollTrigger: { trigger: stage, start: 'top 60%', end: 'bottom top', scrub: true } });
  }

  // Marquee infinito de logos
  document.querySelectorAll('[data-marquee]').forEach((m) => {
    const track = m.querySelector('.marquee__track');
    track.innerHTML += track.innerHTML + track.innerHTML;
    track.querySelectorAll('li').forEach((li, i) => i >= track.children.length / 3 && li.setAttribute('aria-hidden', 'true'));
    const w = track.scrollWidth / 3;
    const tw = gsap.to(track, { x: -w, duration: 32, ease: 'none', repeat: -1 });
    m.addEventListener('mouseenter', () => gsap.to(tw, { timeScale: 0.2, duration: 0.6 }));
    m.addEventListener('mouseleave', () => gsap.to(tw, { timeScale: 1, duration: 0.6 }));
  });

  // Frase que se ilumina palabra por palabra con el scroll
  document.querySelectorAll('[data-scrub-words]').forEach((el) => {
    const split = SplitText.create(el, { type: 'words', wordsClass: 'w' });
    gsap.to(split.words, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
    });
  });

  // Tarjetas apiladas: la anterior se hunde cuando llega la siguiente
  const cards = gsap.utils.toArray('[data-stack-card]');
  if (cards.length && window.matchMedia('(min-width: 64.0625rem)').matches) {
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;
      gsap.to(card, {
        scale: 0.95, ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true },
      });
    });
  }

  // Botón magnético
  document.querySelectorAll('[data-magnetic]').forEach((b) => {
    const xTo = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'power3.out' });
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.24);
      yTo((e.clientY - r.top - r.height / 2) * 0.32);
    });
    b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* Cuenta ascendente reutilizable */
export function countUp(el, ScrollTriggerRef = ScrollTrigger) {
  const to = parseFloat(el.dataset.countup);
  const dec = (el.dataset.countup.split('.')[1] || '').length;
  const o = { v: 0 };
  gsap.to(o, {
    v: to, duration: 2, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    onUpdate: () => { el.textContent = o.v.toFixed(dec).replace('.', ','); },
  });
}
document.fonts.ready.then(() => {
  document.querySelectorAll('[data-countup]').forEach((el) => {
    if (reduce) { el.textContent = el.dataset.countup.replace('.', ','); return; }
    countUp(el);
  });
});
