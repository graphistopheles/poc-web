// ============================================================================
//  Biblioteca compartida de los reels Medismart (guiones 2 y 3)
// ============================================================================
const Q = new URLSearchParams(location.search);
const FMT = Q.get("f") === "v" ? "v" : "h", CAPTURE = Q.has("capture");
const W = FMT === "h" ? 1920 : 1080, H = FMT === "h" ? 1080 : 1920, V = FMT === "v";
if (CAPTURE) document.body.classList.add("capture");
document.getElementById(V ? "fv" : "fh").classList.add("on");

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  lin: p => p, outCubic: p => 1 - Math.pow(1 - p, 3), inCubic: p => p * p * p,
  inOut: p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2, outQuint: p => 1 - Math.pow(1 - p, 5),
  outBack: (p, s = 1.9) => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2),
  outElastic: p => p === 0 || p === 1 ? p : Math.pow(2, -10 * p) * Math.sin((p * 10 - .75) * (2 * Math.PI) / 3) + 1,
  inOutSine: p => -(Math.cos(Math.PI * p) - 1) / 2,
};
const K = (t, f) => { if (t <= f[0][0]) return f[0][1]; for (let i = 1; i < f.length; i++) if (t <= f[i][0]) { const [t0, v0] = f[i - 1], [t1, v1, e] = f[i]; return lerp(v0, v1, (E[e || "inOut"])(seg(t, t0, t1))); } return f[f.length - 1][1]; };
const pulse = (t, at, dur = .35) => { const p = (t - at) / dur; return p < 0 || p > 1 ? 0 : Math.sin(Math.PI * p) * (1 - p * .3); };
const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const $ = s => document.querySelector(s);
const G = id => document.getElementById(id);
const css = (el, o) => { for (const k in o) el.style[k] = o[k]; };
const tf = (x, y, s = 1, r = 0, sx = 1, sy = 1) => `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotate(${r.toFixed(2)}deg) scale(${(s * sx).toFixed(4)},${(s * sy).toFixed(4)})`;
const mk = (tag, cls, parent, style, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (style) css(e, style); if (html != null) e.innerHTML = html; (parent || $("#cam")).appendChild(e); return e; };
const addStyle = s => { const e = document.createElement("style"); e.textContent = s; document.head.appendChild(e); };

// ---------- escenario y cámara ----------
const stage = $("#stage"), cam = $("#cam"); css(stage, { width: W + "px", height: H + "px" }); css(cam, { width: W + "px", height: H + "px" });
function fit() { const k = CAPTURE ? 1 : Math.min(innerWidth / W, innerHeight / H); css(stage, { transform: `scale(${k})` }); css($("#viewport"), { width: W * k + "px", height: H * k + "px" }); }
fit(); addEventListener("resize", fit);
// capa de interfaz por encima de la cámara (no hace zoom)
const hud = mk("div", "layer", stage, { width: W + "px", height: H + "px", pointerEvents: "none" }); stage.insertBefore(hud, $("#flash"));
// cámara: centra el punto (x,y) del escenario con zoom z
function camera(x, y, z, rot = 0) { cam.style.transform = `translate(${W / 2}px,${H / 2}px) scale(${z.toFixed(4)}) rotate(${rot}deg) translate(${-x}px,${-y}px)`; }
css($("#bg"), { width: W + "px", height: H + "px", overflow: "hidden" });
// titulares y logotipo van fuera de la cámara (no les afecta el zoom)
["#h1", "#h2", "#logoWrap"].forEach(s => stage.insertBefore($(s), hud));
// lo que no se usa empieza oculto
["#ring", "#card", "#polaroid", "#logoWrap", "#h1", "#h2"].forEach(s => css($(s), { opacity: 0 }));

// ---------- fondo ----------
const blobs = ["#b1", "#b2", "#b3"].map($);
const dotsEl = $("#dots"); const DOTS = [...Array(28)].map(() => mk("div", "dot", dotsEl));
function background(t, op = 1, colors = null) {
  const base = [.16, .15, .13];
  blobs.forEach((b, i) => { const s = (V ? 900 : 1000) + 200 * Math.sin(t * .3 + i);
    const x = W * (.2 + .6 * hash(i + 1)) + Math.sin(t * .23 + i * 2) * W * .18 - s / 2, y = H * (.2 + .6 * hash(i + 7)) + Math.cos(t * .19 + i) * H * .16 - s / 2;
    css(b, { width: s + "px", height: s + "px", opacity: base[i] * op, transform: `translate(${x}px,${y}px)`, background: colors ? colors[i] : "" }); });
  DOTS.forEach((d, i) => { const sp = 18 + hash(i) * 40, sz = 3 + hash(i + 50) * 7, x = hash(i + 9) * W + Math.sin(t * .5 + i) * 30, y = H + 20 - ((hash(i + 3) * (H + 40) + t * sp) % (H + 40));
    css(d, { width: sz + "px", height: sz + "px", opacity: (.25 + .5 * hash(i + 11)) * seg(t, .3, 1.5) * op, transform: `translate(${x}px,${y}px)` }); });
}

// ---------- familia ----------
const NAMES = ["catalina", "teo", "sara", "alma", "noelia", "dalia", "lia", "clara"];
const AV = {}; NAMES.forEach(n => { const el = $("#av-" + n); AV[n] = { el, flat: el.querySelector(".flat"), glass: el.querySelector(".glass") }; });
function setAv(n, s) {
  const a = AV[n]; if (!s || s.op <= .001) { a.el.style.opacity = 0; return; }
  css(a.el, { opacity: (s.op ?? 1).toFixed(3), transform: tf(s.x, s.y, (s.size || 600) / 600, s.rot || 0, s.sx || 1, s.sy || 1),
    filter: s.bright && Math.abs(s.bright - 1) > .01 ? `brightness(${s.bright.toFixed(3)})` : "none", zIndex: s.z || 0 });
  a.flat.style.opacity = (s.flat ?? 0).toFixed(3); a.glass.style.opacity = (s.glass ?? 1).toFixed(3);
}
const gset = (id, v) => { const e = G(id); if (e) e.setAttribute("transform", v); };
function resetGestures() { ["catalina-cTL", "catalina-cTR", "catalina-cBL", "catalina-cBR", "teo-teo", "sara-sara", "alma-alma", "noelia-noelia", "clara-fold"].forEach(id => gset(id, "")); }

// ---------- isotipo ----------
const isoWrap = $("#isoWrap"); css(isoWrap, { width: "1000px", height: (1000 * 96 / 108) + "px", transformOrigin: "50% 50%" });
const isoTop = G("isoTop"), isoStroke = G("isoTopStroke"), isoSmile = G("isoSmile");
const STROKE_LEN = isoStroke.getTotalLength(); isoStroke.style.strokeDasharray = STROKE_LEN;
[isoSmile, isoTop].forEach(e => { e.style.transformBox = "fill-box"; e.style.transformOrigin = "50% 50%"; });
const SMILE_C = [53.7, 80];
function iso(cx, cy, w, { op = 1, draw = 1, fill = 1, stroke = 0, top = 1, sm = 1, smX = 0, smY = 0, smR = 0, smSX = 1, smSY = 1, smOp = 1, glow = 0, rot = 0 } = {}) {
  css(isoWrap, { opacity: op, transform: `translate(${cx - 500}px,${cy - 1000 * 96 / 108 / 2}px) scale(${(w / 1000).toFixed(4)}) rotate(${rot}deg)`, filter: glow > .01 ? `drop-shadow(0 0 ${30 * glow}px rgba(120,190,255,${.9 * glow}))` : "none" });
  isoTop.style.opacity = (top * fill).toFixed(3); isoStroke.style.strokeDashoffset = ((1 - draw) * STROKE_LEN).toFixed(1); isoStroke.style.opacity = (stroke * top).toFixed(3);
  isoSmile.style.opacity = smOp; isoSmile.style.transform = `translate(${smX}px,${smY}px) rotate(${smR}deg) scale(${(sm * smSX).toFixed(3)},${(sm * smSY).toFixed(3)})`;
}
const isoSmileAt = (cx, cy, w) => [cx + (SMILE_C[0] / 108 - .5) * w, cy + (SMILE_C[1] / 96 - .5) * w * 96 / 108];

// ---------- cierre: logotipo + bajada ----------
function logoLockup({ logoW, logoY, tagY, subY, html }) {
  const LK = logoW / 161, LX = (W - logoW) / 2, wrap = $("#logoWrap"), word = [...G("logoWord").children], tag = $("#tagline"), sub = $("#sub");
  css(wrap, { left: LX + "px", top: logoY + "px", width: logoW + "px" }); G("logoIso").setAttribute("opacity", 0);
  word.forEach(p => { p.style.transformBox = "fill-box"; p.style.transformOrigin = "50% 100%"; });
  tag.innerHTML = html; css(tag, { top: (tagY - logoY) + "px", left: -LX + "px", width: W + "px" });
  css(sub, { top: (subY - logoY) + "px", left: -LX + "px", width: W + "px", fontSize: (V ? 30 : 26) + "px" });
  const lines = [...tag.children];
  return {
    ISO: { cx: LX + 15.395 * LK, cy: logoY + (5.134 + 96 * .2851 / 2) * LK, w: 108 * .2851 * LK },
    render(t, t0) { css(wrap, { opacity: t > t0 - .05 ? 1 : 0 });
      word.forEach((p, i) => { const q = seg(t, t0 + .5 + i * .06, t0 + .95 + i * .06); p.style.opacity = q.toFixed(3); p.style.transform = `translateY(${((1 - E.outBack(q, 2.4)) * 10).toFixed(2)}px) scale(${(.6 + .4 * E.outBack(q, 2.4)).toFixed(3)})`; });
      lines.forEach((l, i) => { const q = seg(t, t0 + 1.2 + i * .45, t0 + 1.8 + i * .45); css(l, { opacity: q, transform: `translateY(${(1 - E.outCubic(q)) * 26}px)` }); });
      const sq = seg(t, t0 + 2.25, t0 + 2.85); css(sub, { opacity: sq, letterSpacing: lerp(14, 4, E.outCubic(sq)) + "px" }); },
  };
}

// ---------- titulares palabra por palabra ----------
function headline(el, html) {
  if (el._html !== html) { el._html = html; const tmp = document.createElement("div"); tmp.innerHTML = html; const out = [];
    tmp.childNodes.forEach(n => n.nodeName === "BR" ? out.push('<br>') : (n.nodeType === 3 ? n.textContent : n.textContent).split(/(\s+)/).forEach(w => w.trim() ? out.push(`<span class="word ${n.className || ""}">${w}</span>`) : w && out.push(" ")));
    el.innerHTML = out.join(""); el._words = [...el.querySelectorAll(".word")]; }
  return (t, t0, t1, y, size, extra = {}) => { const out = E.inCubic(seg(t, t1, t1 + .45)), on = t >= t0 - .05 && t <= t1 + .5;
    css(el, { opacity: on ? 1 - out : 0, top: y + "px", left: "0px", width: W + "px", fontSize: size + "px", padding: V ? "0 60px" : "0", boxSizing: "border-box", transform: `translateY(${-out * 30}px)`, ...extra });
    if (on) el._words.forEach((w, i) => { const p = seg(t, t0 + i * .09, t0 + .5 + i * .09); css(w, { opacity: Math.min(1, p * 2.5), transform: `translateY(${(1 - E.outBack(p, 1.8)) * 60}px) scale(${.85 + .15 * E.outCubic(p)})` }); }); };
}

// ---------- globo de diálogo ----------
addStyle(`.say{position:absolute;left:0;top:0;background:#fff;color:#030C43;border-radius:28px;padding:16px 28px;font-weight:800;width:max-content;max-width:17em;text-align:center;text-wrap:balance;box-shadow:0 14px 40px rgba(3,12,67,.16);transform-origin:var(--ox,50%) 100%;line-height:1.2}
.say.grad{background:linear-gradient(135deg,#7556D7,#3FB4CE);color:#fff}
.tagIA{position:absolute;left:0;top:0;font-weight:900;color:#2F3FAE;white-space:nowrap;display:flex;gap:8px;align-items:center}
.tagIA i{font-style:normal;border:2px solid #2F3FAE;border-radius:999px;padding:0 9px;font-size:.62em}`);
// (x, y) = punto de pantalla al que apunta la cola (cabeza de quien habla).
// El globo se mantiene dentro del cuadro y la cola se recalcula para seguir apuntando al personaje.
function say(parent, cls = "") { const e = mk("div", "say " + cls, parent); e.style.opacity = 0; return {
  el: e, show(t, t0, t1, x, y, text, size = 30, ox = .5) { if (t < t0 || t > t1 + .3) { e.style.opacity = 0; return; } if (e._t !== text) { e.innerHTML = text; e._t = text; }
    e.style.fontSize = size + "px";
    const w = e.offsetWidth, h = e.offsetHeight, M = V ? 36 : 48;
    const left = clamp(x - w * ox, M, W - M - w), top = Math.max(M, y - h - 18), tail = clamp(x - left, 36, w - 36);
    const p = E.outBack(seg(t, t0, t0 + .35), 2.4), o = 1 - seg(t, t1, t1 + .25);
    css(e, { opacity: Math.min(1, seg(t, t0, t0 + .15) * 3) * o, "--ox": tail + "px", "--tail": (tail - 14) + "px", transform: `translate(${left}px,${top}px) scale(${p * (1 - .15 * seg(t, t1, t1 + .25))})` }); } }; }

// ---------- arranque: reproducción y captura ----------
function boot(render, DUR, music) {
  window.__render = render; window.__DUR = DUR;
  window.__ready = document.fonts ? document.fonts.ready : Promise.resolve();
  window.__audio = async () => { const ab = new Uint8Array(encodeWav(await music())); let s = ""; for (let i = 0; i < ab.length; i += 0x8000) s += String.fromCharCode.apply(null, ab.subarray(i, i + 0x8000)); window.__wav = btoa(s); return window.__wav.length; };
  window.__chunk = (i, n) => window.__wav.substr(i, n);
  render(Q.has("t") ? parseFloat(Q.get("t")) : 0);
  if (CAPTURE) return;
  const ui = $("#ui");
  ui.addEventListener("click", async e => {
    if (e.target.closest(".fmt")) return; ui.innerHTML = "<div>Cargando música…</div>"; let clock;
    const audio = new Audio("musica.wav");
    try { await new Promise((ok, ko) => { audio.oncanplaythrough = ok; audio.onerror = ko; setTimeout(ko, 4000); audio.load(); }); await audio.play(); clock = () => audio.currentTime; }
    catch (err) { ui.innerHTML = "<div>Sintetizando la música… (puede tardar)</div>";
      try { const buf = await music(); const ac = new AudioContext(); await ac.resume(); const src = ac.createBufferSource(); src.buffer = buf; src.connect(ac.destination); const t0 = ac.currentTime + .1; src.start(t0); clock = () => ac.currentTime - t0; }
      catch (e2) { const t0 = performance.now(); clock = () => (performance.now() - t0) / 1000; } }
    ui.style.display = "none";
    const loop = () => { const t = Math.max(0, clock()); render(t); if (t < DUR - .02) requestAnimationFrame(loop); else { ui.style.display = "grid"; ui.innerHTML = '<div class="btn"><i></i></div><div>Ver de nuevo</div>'; ui.onclick = () => location.reload(); } };
    loop();
  }, { once: true });
}
