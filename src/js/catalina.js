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

  /* ---------- Deriva libre (inspirada en Pilo de Impilo) ----------
     Fuera de una percha, Catalina viaja en línea recta a velocidad constante
     y rebota en los bordes del viewport. Se frena con suavidad al pasar el
     mouse, mientras habla o con el panel abierto, para que siempre sea fácil
     hacer click en ella o en la ✕ de su burbuja. */
  const free = { x: 0, y: 0, vx: 0, vy: 0, k: 1, ready: false };
  const ROAM = !reduce;
  const isMobile = () => innerWidth < 640;
  const freeSize = () => (isMobile() ? 72 : 96);
  const speed = () => (isMobile() ? 48 : 80); // px/s (Pilo ≈ 110; algo más calmo)
  function bounds(size) {
    const m = isMobile() ? 16 : 24;
    const top = isMobile() ? 88 : 104; // bajo la barra del header (80) + aire
    return { minX: m + size / 2, maxX: innerWidth - m - size / 2, minY: top + size / 2, maxY: innerHeight - m - size / 2 };
  }
  function setHeading(deg) {
    // evita trayectorias casi horizontales o verticales (aburridas)
    const a = ((deg % 360) + 360) % 360;
    const q = Math.floor(a / 90) * 90;
    const clamped = q + gsap.utils.clamp(20, 70, a - q);
    const rad = (clamped * Math.PI) / 180;
    free.vx = Math.cos(rad) * speed();
    free.vy = Math.sin(rad) * speed();
  }
  function dock() {
    const size = freeSize();
    const b = bounds(size);
    if (!free.ready) { // primer punto: esquina inferior derecha, rumbo arriba-izquierda
      free.x = b.maxX; free.y = b.maxY; setHeading(gsap.utils.random(205, 245)); free.ready = true;
    }
    return { x: free.x, y: free.y, size };
  }
  // Rebote: se aplasta contra el borde y recupera la forma con elasticidad
  function bounceFx(axis) {
    if (reduce) return;
    const sx = axis === 'x' ? 0.86 : 1.1, sy = axis === 'x' ? 1.1 : 0.86;
    gsap.fromTo(body, { scaleX: sx, scaleY: sy }, { scaleX: 1, scaleY: 1, duration: 0.9, ease: 'elastic.out(1, 0.35)', transformOrigin: '50% 50%', overwrite: 'auto' });
  }
  function stepFree(dt, perchW) {
    const size = freeSize();
    const b = bounds(size);
    if (!free.ready) dock();
    // Mientras está posada, su punto libre la acompaña: al soltarse, parte desde ahí
    if (perchW > 0.6 && st.perch) {
      const r = st.perch.el.getBoundingClientRect();
      free.x = gsap.utils.clamp(b.minX, b.maxX, r.left + r.width / 2);
      free.y = gsap.utils.clamp(b.minY, b.maxY, r.top + r.height / 2);
      return;
    }
    if (!ROAM) { free.x = b.maxX; free.y = b.maxY; return; }
    const hold = st.hover || st.open || bubble.classList.contains('is-on');
    const kT = hold ? 0 : 1;
    free.k += (kT - free.k) * (1 - Math.pow(hold ? 0.0004 : 0.05, dt)); // frena en ~0,25 s, arranca en ~1 s
    const sp = Math.hypot(free.vx, free.vy) || 1;
    if (Math.abs(sp - speed()) > 1) { free.vx *= speed() / sp; free.vy *= speed() / sp; } // cambio de breakpoint
    free.x += free.vx * free.k * dt;
    free.y += free.vy * free.k * dt;
    const jitter = () => gsap.utils.random(-10, 10);
    let hit = null;
    if (free.x < b.minX) { free.x = b.minX; free.vx = Math.abs(free.vx); hit = 'x'; }
    else if (free.x > b.maxX) { free.x = b.maxX; free.vx = -Math.abs(free.vx); hit = 'x'; }
    if (free.y < b.minY) { free.y = b.minY; free.vy = Math.abs(free.vy); hit = 'y'; }
    else if (free.y > b.maxY) { free.y = b.maxY; free.vy = -Math.abs(free.vy); hit = 'y'; }
    if (hit) {
      setHeading((Math.atan2(free.vy, free.vx) * 180) / Math.PI + jitter());
      if (free.k > 0.5 && st.docked) bounceFx(hit);
    }
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
    stepFree(Math.min(dt, 64) / 1000, st.w);
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

    // Bamboleo tipo Pilo: ±4px y ±4° en ciclos de 1,6 s (ω = 2π / 1,6)
    const W = 3.93;
    const amp = 4 - e;
    const fy = reduce ? 0 : Math.sin(st.t * W) * amp;
    const vel = (st.w - prevW) / Math.max(dt, 1) * 1000;
    prevW = st.w;
    // se inclina hacia donde viaja (hasta 6°) y al despegar de una percha
    const lean = (free.vx / speed()) * 6 * free.k * (1 - e);
    const tr = reduce ? 0 : Math.sin(st.t * W) * 4 + lean + gsap.utils.clamp(-18, 18, vel * -12);
    st.r += (tr - st.r) * 0.12;

    // El contenedor (y la burbuja) quedan quietos; solo el personaje flota.
    // Así la ✕ de la burbuja no se mueve bajo el cursor.
    st.x = tx; st.y = ty; st.s = ts / BASE;
    wrap.style.transform = `translate3d(${st.x.toFixed(1)}px, ${st.y.toFixed(1)}px, 0)`;
    btn.style.transform = `translateY(${fy.toFixed(1)}px) scale(${st.s.toFixed(4)}) rotate(${st.r.toFixed(2)}deg)`;
    if (shadow) shadow.style.opacity = String(0.7 - Math.sin(st.t * W) * 0.2);

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
    st.hover = true;
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
    st.hover = false;
    if (!cubes.TL) return;
    hoverTl?.kill();
    gsap.to(Object.values(cubes), { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' });
    gsap.to(smile, { scaleX: 1, scaleY: 1, duration: 0.5, ease: 'power2.out' });
  });

  /* ---------- Burbuja contextual ---------- */
  // Respeto del cierre: 1.ª vez silencia 60 s; 2.ª vez, el resto de la sesión.
  const MUTE_KEY = 'cata-muted';
  const store = {
    get: () => { try { return sessionStorage.getItem(MUTE_KEY) === '1'; } catch { return false; } },
    set: () => { try { sessionStorage.setItem(MUTE_KEY, '1'); } catch { /* sin storage: solo en memoria */ } },
  };
  st.muted = store.get();
  st.dismissCount = 0;
  st.dismissedTexts = new Set();

  function say(text, ask = '') {
    if (!text || st.open || st.muted || Date.now() < st.dismissedUntil || st.dismissedTexts.has(text)) return;
    if (!st.docked) { st.pendingSay = { text, ask }; return; }
    if (text === st.lastSay && bubble.classList.contains('is-on')) return;
    st.lastSay = text;
    clearTimeout(st.hideTimer);
    bubbleText.textContent = text;
    bubbleCta.dataset.cataAsk = ask || '';
    placeBubble();
    bubble.classList.add('is-on');
    gsap.killTweensOf([bubble, bubbleText]);
    if (reduce) gsap.set(bubble, { autoAlpha: 1, scale: 1, y: 0 });
    else {
      gsap.fromTo(bubble, { autoAlpha: 0, scale: 0.8, y: 16 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)' });
      gsap.fromTo(bubbleText, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.15, ease: 'power3.out' });
    }
    talk();
    scheduleHide();
  }
  // Se oculta sola a los 8 s, pero nunca mientras el usuario la está leyendo
  function scheduleHide(ms = 8000) {
    clearTimeout(st.hideTimer);
    st.hideTimer = setTimeout(() => hideBubble(), ms);
  }
  bubble.addEventListener('pointerenter', () => { st.hover = true; clearTimeout(st.hideTimer); });
  bubble.addEventListener('pointerleave', () => { st.hover = false; if (bubble.classList.contains('is-on')) scheduleHide(4000); });

  // La burbuja se abre hacia el lado con más espacio y nunca sale del viewport
  function placeBubble() {
    const right = st.x < innerWidth / 2;
    const below = st.y < innerHeight * 0.4;
    wrap.classList.toggle('bubble-right', right);
    wrap.classList.toggle('bubble-below', below);
    bubble.style.marginLeft = '0px';
    const w = bubble.offsetWidth;
    const off = (isMobile() ? 40 : 56);
    const left = right ? st.x + off : st.x - off - w;
    const m = 24; // 16 de margen + 8 de holgura: Catalina aún avanza unos px mientras frena
    const shift = gsap.utils.clamp(m, innerWidth - m - w, left) - left;
    bubble.style.marginLeft = shift + 'px';
  }
  function hideBubble(instant = false) {
    clearTimeout(st.hideTimer);
    st.pendingSay = null;
    if (!bubble.classList.contains('is-on')) return;
    bubble.classList.remove('is-on');
    gsap.killTweensOf([bubble, bubbleText]);
    gsap.to(bubble, { autoAlpha: 0, scale: 0.9, y: 8, duration: instant ? 0.15 : 0.3, ease: 'power2.in' });
  }
  function dismiss() {
    st.dismissedTexts.add(st.lastSay);
    hideBubble(true);
    st.dismissCount += 1;
    if (st.dismissCount >= 2) { st.muted = true; store.set(); }
    else st.dismissedUntil = Date.now() + 60000;
  }
  const xBtn = bubble.querySelector('[data-cata-dismiss]');
  xBtn.addEventListener('click', (e) => { e.stopPropagation(); dismiss(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !st.open && bubble.classList.contains('is-on')) dismiss();
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
      mobile ? { x: 0, y: 0, yPercent: 104 } : { x: '104%', y: 0, yPercent: 0 },
      { x: 0, y: 0, yPercent: 0, duration: reduce ? 0 : 0.8, ease: 'expo.out' });
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
