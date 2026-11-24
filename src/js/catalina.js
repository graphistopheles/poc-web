/* =========================================================================
   CATALINA · agente flotante que acompaña el recorrido
   - Vive en "perchas" (data-cata-perch) dentro del contenido: el hero, su
     lugar en la familia de agentes, etc. Entre perchas vuela a su "dock"
     (esquina inferior derecha) con un arco suave.
   - Cada sección puede dejarle una frase (data-cata-say) que ella comenta
     al entrar en escena.
   - Click: abre un panel lateral para preguntarle sobre Medismart.
   ========================================================================= */
import { answer, normalize } from './catalina-kb.js';

const BASE = 192; // tamaño nativo del botón (px); se escala hacia abajo

export function initCatalina({ gsap, ScrollTrigger, reduce }) {
  const wrap = document.querySelector('[data-cata]');
  if (!wrap) return;
  const btn = wrap.querySelector('.cata__btn');
  const body = wrap.querySelector('[data-cata-body]');
  const bubble = wrap.querySelector('[data-cata-bubble]');
  const bubbleText = wrap.querySelector('[data-cata-text]');
  const bubbleCta = bubble.querySelector('[data-cata-ask]');
  const svg = body.querySelector('svg');
  const q = (id) => svg.querySelector('#catalina-' + id);
  const cubes = { TL: q('cTL'), TR: q('cTR'), BL: q('cBL'), BR: q('cBR') };
  const smile = q('smile');
  const shadow = q('shadow');

  const perches = [...document.querySelectorAll('[data-cata-perch]')].map((el) => ({
    el,
    id: el.dataset.cataPerch,
    size: () => el.getBoundingClientRect().width || +el.dataset.perchSize || 160,
  }));

  /* ---------- Estado ---------- */
  const st = {
    w: perches.length ? 1 : 0,   // peso suavizado hacia la percha activa
    perch: perches[0] || null,
    x: 0, y: 0, s: 0.5, r: 0,
    t: 0,
    open: false,
    shown: false,
    docked: false,
    lastSay: '',
    hideTimer: null,
    dismissedUntil: 0,
  };

  function dock() {
    const mobile = innerWidth < 640;
    const size = mobile ? 72 : 96;
    const m = mobile ? 16 : 32;
    return { x: innerWidth - m - size / 2, y: innerHeight - m - size / 2, size };
  }

  // Peso de cada percha según su posición en el viewport
  function weightOf(p) {
    const r = p.el.getBoundingClientRect();
    if (!r.width) return 0;
    const cy = (r.top + r.height / 2) / innerHeight;
    if (p.id === 'hero') return gsap.utils.clamp(0, 1, (cy - 0.12) / 0.38);
    // percha en contenido: entra entre 92%→62%, se queda, sale entre 34%→6%
    if (cy > 0.92 || cy < 0.06) return 0;
    if (cy > 0.62) return (0.92 - cy) / 0.3;
    if (cy < 0.34) return (cy - 0.06) / 0.28;
    return 1;
  }

  /* ---------- Bucle de animación ---------- */
  const ease = gsap.parseEase('power2.inOut');
  let prevW = st.w;

  function frame(time, dt) {
    st.t += dt / 1000;
    const d = dock();

    // percha dominante
    let best = null, bw = 0;
    for (const p of perches) { const w = weightOf(p); if (w > bw) { bw = w; best = p; } }
    if (best) st.perch = best;
    if (st.open) bw = 0;

    // suavizado del peso (el vuelo dura ~0.6s)
    const k = 1 - Math.pow(0.0008, dt / 1000);
    st.w += (bw - st.w) * k;
    if (Math.abs(st.w - bw) < 0.001) st.w = bw;
    const e = ease(st.w);

    let tx = d.x, ty = d.y, ts = d.size;
    if (st.perch && st.w > 0.001) {
      const r = st.perch.el.getBoundingClientRect();
      const px = r.left + r.width / 2, py = r.top + r.height / 2;
      const ps = st.perch.size();
      tx = d.x + (px - d.x) * e;
      ty = d.y + (py - d.y) * e;
      ts = d.size + (ps - d.size) * e;
      // arco de vuelo
      ty -= Math.sin(Math.PI * st.w) * Math.min(160, Math.abs(px - d.x) * 0.18);
    }

    // flotación viva: más amplia en el dock, sutil en una percha
    const amp = 6 + (1 - e) * 4;
    const fy = reduce ? 0 : Math.sin(st.t * 1.6) * amp;
    const vel = (st.w - prevW) / Math.max(dt, 1) * 1000;
    prevW = st.w;
    const tr = reduce ? 0 : Math.sin(st.t * 1.1) * 3 + gsap.utils.clamp(-18, 18, vel * -12);
    st.r += (tr - st.r) * 0.12;

    st.x = tx; st.y = ty + fy; st.s = ts / BASE;
    wrap.style.transform = `translate3d(${st.x.toFixed(1)}px, ${st.y.toFixed(1)}px, 0)`;
    btn.style.transform = `scale(${st.s.toFixed(4)}) rotate(${st.r.toFixed(2)}deg)`;
    if (shadow) shadow.style.opacity = String(0.7 - Math.sin(st.t * 1.6) * 0.2);

    const docked = st.w < 0.02;
    if (docked !== st.docked) {
      st.docked = docked;
      wrap.classList.toggle('is-docked', docked);
      if (!docked) hideBubble(true);
      else if (st.pendingSay) { say(st.pendingSay.text, st.pendingSay.ask); st.pendingSay = null; }
    }
  }

  /* ---------- Aparición ---------- */
  function appear() {
    gsap.set(wrap, { opacity: 1 });
    gsap.ticker.add(frame);
    if (reduce) { st.shown = true; return; }
    gsap.from(body, { scale: 0, rotate: -24, duration: 1.2, ease: 'elastic.out(1, 0.6)', transformOrigin: '50% 60%' });
    hug(0.5);
    st.shown = true;
  }
  const intro = window.__introTl;
  if (intro && perches.some((p) => p.id === 'hero')) intro.call(appear, null, 1.7);
  else gsap.delayedCall(0.6, appear);

  if (!perches.length) {
    // Páginas internas: saluda al llegar
    const first = document.querySelector('[data-cata-say]');
    gsap.delayedCall(1.6, () => first && say(first.dataset.cataSay, first.dataset.cataAsk));
  }

  /* ---------- Gestos del personaje ---------- */
  // "abrazo": los cubos se separan y vuelven
  function hug(delay = 0) {
    if (reduce || !cubes.TL) return;
    const d = 46;
    const tl = gsap.timeline({ delay });
    tl.to(cubes.TL, { x: -d, y: -d * 0.8, duration: 0.35, ease: 'power2.out' }, 0)
      .to(cubes.TR, { x: d, y: -d * 0.8, duration: 0.35, ease: 'power2.out' }, 0)
      .to(cubes.BL, { x: -d, y: d * 0.8, duration: 0.35, ease: 'power2.out' }, 0)
      .to(cubes.BR, { x: d, y: d * 0.8, duration: 0.35, ease: 'power2.out' }, 0)
      .to([cubes.TL, cubes.TR, cubes.BL, cubes.BR], { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1.1, 0.4)', stagger: 0.04 }, 0.38);
    return tl;
  }
  function blink() {
    if (!smile || reduce) return;
    gsap.timeline()
      .to(smile, { scaleY: 0.3, duration: 0.08, ease: 'power1.in' })
      .to(smile, { scaleY: 1, duration: 0.2, ease: 'power2.out' });
    gsap.delayedCall(gsap.utils.random(3, 6), blink);
  }
  gsap.delayedCall(3, blink);
  function talk() {
    if (!smile || reduce) return;
    gsap.fromTo(smile, { scaleX: 1, scaleY: 1 }, { scaleX: 1.12, scaleY: 1.3, duration: 0.14, yoyo: true, repeat: 5, ease: 'sine.inOut' });
  }

  let hoverTl;
  btn.addEventListener('pointerenter', () => {
    if (reduce || !cubes.TL) return;
    hoverTl?.kill();
    const d = 28;
    hoverTl = gsap.timeline()
      .to(cubes.TL, { x: -d, y: -d, duration: 0.5, ease: 'expo.out' }, 0)
      .to(cubes.TR, { x: d, y: -d, duration: 0.5, ease: 'expo.out' }, 0)
      .to(cubes.BL, { x: -d, y: d, duration: 0.5, ease: 'expo.out' }, 0)
      .to(cubes.BR, { x: d, y: d, duration: 0.5, ease: 'expo.out' }, 0);
    gsap.to(smile, { scaleX: 1.15, scaleY: 1.2, duration: 0.4, ease: 'back.out(3)' });
  });
  btn.addEventListener('pointerleave', () => {
    if (!cubes.TL) return;
    hoverTl?.kill();
    gsap.to(Object.values(cubes), { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' });
    gsap.to(smile, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'power2.out' });
  });

  /* ---------- Burbuja contextual ---------- */
  function say(text, ask = '') {
    if (!text || st.open || Date.now() < st.dismissedUntil) return;
    if (!st.docked) { st.pendingSay = { text, ask }; return; }
    if (text === st.lastSay && bubble.classList.contains('is-on')) return;
    st.lastSay = text;
    clearTimeout(st.hideTimer);
    bubbleText.textContent = text;
    bubbleCta.dataset.cataAsk = ask || '';
    bubble.classList.add('is-on');
    gsap.killTweensOf(bubble);
    if (reduce) gsap.set(bubble, { autoAlpha: 1 });
    else {
      gsap.fromTo(bubble, { autoAlpha: 0, scale: 0.8, y: 16 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)' });
      gsap.from(bubbleText, { opacity: 0, y: 8, duration: 0.6, delay: 0.15, ease: 'power3.out' });
    }
    talk();
    st.hideTimer = setTimeout(() => hideBubble(), 8000);
  }
  function hideBubble(instant = false) {
    clearTimeout(st.hideTimer);
    if (!bubble.classList.contains('is-on')) return;
    bubble.classList.remove('is-on');
    gsap.to(bubble, { autoAlpha: 0, scale: 0.9, y: 8, duration: instant ? 0.2 : 0.4, ease: 'power2.in' });
  }
  bubble.querySelector('[data-cata-dismiss]').addEventListener('click', () => {
    hideBubble();
    st.dismissedUntil = Date.now() + 20000;
  });

  document.querySelectorAll('[data-cata-say]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 55%',
      end: 'bottom 55%',
      onEnter: () => st.shown && say(sec.dataset.cataSay, sec.dataset.cataAsk),
      onEnterBack: () => st.shown && say(sec.dataset.cataSay, sec.dataset.cataAsk),
    });
  });

  /* ---------- Panel lateral ---------- */
  const panel = document.getElementById('cata-panel');
  const scrim = document.querySelector('.cpanel-scrim');
  const log = panel.querySelector('[data-cata-log]');
  const form = panel.querySelector('[data-cata-form]');
  const input = panel.querySelector('#cata-input');
  const sugg = panel.querySelector('[data-cata-suggest]');
  let lastFocus = null;

  function openPanel(ask) {
    if (st.open) { if (ask) send(ask); return; }
    st.open = true;
    lastFocus = document.activeElement;
    hideBubble(true);
    panel.hidden = false; scrim.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
    const mobile = innerWidth < 640;
    gsap.to(scrim, { opacity: 1, duration: 0.5, ease: 'power2.out' });
    gsap.fromTo(panel,
      mobile ? { x: 0, yPercent: 104 } : { x: '104%', yPercent: 0 },
      { x: 0, yPercent: 0, duration: reduce ? 0 : 0.8, ease: 'expo.out' });
    gsap.to(btn, { opacity: 0, duration: 0.3 });
    gsap.from(panel.querySelectorAll('.cpanel__head, .cpanel__intro, .cpanel__sug, .cpanel__form'), { opacity: 0, y: 16, stagger: 0.05, duration: 0.6, delay: 0.2, ease: 'power3.out' });
    setTimeout(() => input.focus({ preventScroll: true }), 300);
    if (ask) setTimeout(() => send(ask), 500);
  }
  function closePanel() {
    if (!st.open) return;
    st.open = false;
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
    const mobile = innerWidth < 640;
    gsap.to(scrim, { opacity: 0, duration: 0.4, onComplete: () => (scrim.hidden = true) });
    gsap.to(panel, { ...(mobile ? { yPercent: 104 } : { x: '104%' }), duration: 0.6, ease: 'expo.inOut', onComplete: () => { panel.hidden = true; } });
    gsap.to(btn, { opacity: 1, duration: 0.4, delay: 0.3 });
    gsap.delayedCall(0.5, () => hug());
    lastFocus?.focus?.({ preventScroll: true });
  }

  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-cata-open]');
    if (o) { e.preventDefault(); openPanel(o.dataset.cataAsk); return; }
    if (e.target.closest('[data-cata-close]')) closePanel();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && st.open) closePanel();
    if (e.key === 'Tab' && st.open) { // trampa de foco simple
      const f = [...panel.querySelectorAll('button, input, a[href]')].filter((x) => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  sugg.addEventListener('click', (e) => { const b = e.target.closest('.cpanel__sug'); if (b) send(b.textContent); });
  form.addEventListener('submit', (e) => { e.preventDefault(); const v = input.value.trim(); if (v) { send(v); input.value = ''; } });

  const AV = '<span class="msg__av"><img src="/assets/agentes/catalina.svg" width="40" height="40" alt=""></span>';
  function push(html, who) {
    const m = document.createElement('div');
    m.className = `msg msg--${who}`;
    m.innerHTML = who === 'bot' ? `${AV}<div class="msg__b">${html}</div>` : `<div class="msg__b"></div>`;
    if (who === 'user') m.querySelector('.msg__b').textContent = html;
    log.appendChild(m);
    gsap.from(m, { opacity: 0, y: 16, duration: 0.5, ease: 'power3.out' });
    log.scrollTop = log.scrollHeight;
    return m;
  }
  let busy = false;
  function send(text) {
    if (busy) return;
    busy = true;
    push(text, 'user');
    const typing = push('<span class="msg__typing" aria-label="Catalina está escribiendo"><i></i><i></i><i></i></span>', 'bot');
    const res = answer(normalize(text));
    setTimeout(() => {
      typing.querySelector('.msg__b').innerHTML = res.html;
      gsap.from(typing.querySelector('.msg__b'), { opacity: 0, duration: 0.4 });
      log.scrollTop = log.scrollHeight;
      if (res.chips) {
        sugg.innerHTML = res.chips.map((c) => `<button type="button" class="cpanel__sug">${c}</button>`).join('');
        gsap.from(sugg.children, { opacity: 0, x: 16, stagger: 0.05, duration: 0.4 });
      }
      busy = false;
    }, reduce ? 200 : 700 + Math.min(900, res.html.length * 2));
  }

  window.addEventListener('resize', () => ScrollTrigger.refresh());
}
