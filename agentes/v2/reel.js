// ============================================================================
//  "Una sola sonrisa" — motion reel Medismart · línea de tiempo determinista
//  render(t) dibuja el fotograma exacto del segundo t (sin estado acumulado).
//  ?f=h → 16:9 (1920×1080) · ?f=v → 9:16 (1080×1920) · ?capture=1 → modo exportación
// ============================================================================
(() => {
const Q = new URLSearchParams(location.search);
const FMT = Q.get("f") === "v" ? "v" : "h";
const CAPTURE = Q.has("capture");
const W = FMT === "h" ? 1920 : 1080, H = FMT === "h" ? 1080 : 1920, V = FMT === "v";
const DUR = MUSIC.DUR;
if (CAPTURE) document.body.classList.add("capture");
document.getElementById(V ? "fv" : "fh").classList.add("on");

// ---------- utilidades de animación ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  lin: p => p,
  outCubic: p => 1 - Math.pow(1 - p, 3),
  inCubic: p => p * p * p,
  inOut: p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2,
  outQuint: p => 1 - Math.pow(1 - p, 5),
  outBack: (p, s = 1.9) => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2),
  outElastic: p => p === 0 || p === 1 ? p : Math.pow(2, -10 * p) * Math.sin((p * 10 - .75) * (2 * Math.PI) / 3) + 1,
  inOutSine: p => -(Math.cos(Math.PI * p) - 1) / 2,
};
// Keyframes: [[t, v], [t, v, ease], ...]
const K = (t, f) => { if (t <= f[0][0]) return f[0][1]; for (let i = 1; i < f.length; i++) if (t <= f[i][0]) { const [t0, v0] = f[i - 1], [t1, v1, e] = f[i]; return lerp(v0, v1, (E[e || "inOut"])(seg(t, t0, t1))); } return f[f.length - 1][1]; };
const pulse = (t, at, dur = .35) => { const p = (t - at) / dur; return p < 0 || p > 1 ? 0 : Math.sin(Math.PI * p) * (1 - p * .3); };
const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const $ = s => document.querySelector(s);
const css = (el, o) => { for (const k in o) el.style[k] = o[k]; };
const tf = (x, y, s = 1, r = 0, sx = 1, sy = 1) => `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotate(${r.toFixed(2)}deg) scale(${(s * sx).toFixed(4)},${(s * sy).toFixed(4)})`;

// ---------- escenario ----------
const stage = $("#stage"); css(stage, { width: W + "px", height: H + "px" });
function fit() { const k = CAPTURE ? 1 : Math.min(innerWidth / W, innerHeight / H); css(stage, { transform: `scale(${k})` }); css($("#viewport"), { width: W * k + "px", height: H * k + "px" }); }
fit(); addEventListener("resize", fit);

// ---------- datos de la familia ----------
const NAMES = ["catalina", "teo", "sara", "alma", "noelia", "dalia", "lia", "clara"];
const AV_T = MUSIC.AV_T;
const INFO = {
  catalina: ["01 · Concierge del paciente", "Catalina", "La mamá de la familia", "Yo junto todo en un solo lugar.", "Reúne tus horas, datos y exámenes en un solo lugar."],
  teo: ["02 · Teleperitaje", "Teo", "El ejecutivo, preciso y directo", "Caso completo. Todo listo.", "Prepara y ordena tus peritajes médicos a distancia."],
  sara: ["03 · SaaS de centros médicos", "Sara", "La secretaria del centro", "Agenda en orden.", "Gestiona la agenda y la atención del centro médico."],
  alma: ["04 · Salud mental", "Alma", "La que escucha sin apuro", "Respira. Sin apuro.", "Te acompaña y orienta en tu bienestar emocional."],
  noelia: ["05 · Paciente crónico", "Noelia", "La enfermera de los recordatorios", "¡Hora de tu control!", "Te recuerda tus controles y medicamentos."],
  dalia: ["06 · Cargas y enrolamiento", "Dalia", "La que siempre dice que sí", "¡Sí! Yo te ayudo.", "Te ayuda a cargar las nóminas de titulares y beneficiarios."],
  lia: ["07 · Citas por WhatsApp", "Lia", "La amiga que te avisa a tiempo", "¿Confirmamos tu hora?", "Agenda y confirma tus horas por WhatsApp."],
  clara: ["08 · Lectura de exámenes", "Clara", "La más médica de la familia", "Tus exámenes, claros.", "Te explica tus exámenes en palabras simples."],
};
const AV = {}; NAMES.forEach(n => { const el = $("#av-" + n); AV[n] = { el, flat: el.querySelector(".flat"), glass: el.querySelector(".glass") }; });
const G = id => document.getElementById(id);
// badge de notificación de Lia
const badge = document.createElement("div"); css(badge, { position: "absolute", right: "70px", top: "90px", width: "84px", height: "84px", borderRadius: "50%", background: "#FF4D6D", color: "#fff", font: "900 50px MulishR,system-ui", display: "grid", placeItems: "center", boxShadow: "0 8px 24px rgba(255,77,109,.5)" }); badge.textContent = "1"; AV.lia.el.appendChild(badge);

// ---------- layout por formato ----------
const L = V ? {
  iso: [540, 800], isoW: 560,
  hero: k => [540 + (k % 2 ? 26 : -26), 700], heroS: 700,
  card: k => [80, 1100],
  shelf: k => [540 + (k - 3.5) * 122, 1795], shelfS: 104,
  photoOrder: ["sara", "alma", "catalina", "teo", "lia", "noelia", "dalia", "clara"],
  photo: j => [540 + ((j % 4) - 1.5) * 245, j < 4 ? 760 : 1075], photoS: 250,
  polaroid: [52, 560, 976, 760],
  orbit: [540, 860, 410, 600],
  h1y: 1330, h2y: 300, endH: 1230, hs: 100,
  logoW: 860, logoY: 690, tagY: 990,
} : {
  iso: [960, 455], isoW: 440,
  hero: k => (k % 2 ? [1310, 520] : [610, 520]), heroS: 620,
  card: k => (k % 2 ? [190, 300] : [1010, 300]),
  shelf: k => [960 + (k - 3.5) * 118, 990], shelfS: 96,
  photoOrder: ["lia", "sara", "alma", "catalina", "teo", "noelia", "dalia", "clara"],
  photo: j => [960 + (j - 3.5) * 214, 520], photoS: 232,
  polaroid: [70, 330, 1780, 400],
  orbit: [960, 520, 700, 360],
  h1y: 830, h2y: 120, endH: 790, hs: 96,
  logoW: 940, logoY: 330, tagY: 600,
};

// ---------- fondo: manchas de color + partículas ----------
const blobs = ["#b1", "#b2", "#b3"].map($);
const dotsEl = $("#dots"); const DOTS = [...Array(28)].map((_, i) => { const d = document.createElement("div"); d.className = "dot"; dotsEl.appendChild(d); return d; });

// ---------- anillo ----------
const ringArc = G("ringArc"), ringArc2 = G("ringArc2"), ringDisc = G("ringDisc");

// ---------- isotipo ----------
const isoWrap = $("#isoWrap"); css(isoWrap, { width: "1000px", height: (1000 * 96 / 108) + "px", transformOrigin: "50% 50%" });
const isoTop = G("isoTop"), isoStroke = G("isoTopStroke"), isoSmile = G("isoSmile");
const STROKE_LEN = isoStroke.getTotalLength(); isoStroke.style.strokeDasharray = STROKE_LEN;
isoSmile.style.transformBox = "fill-box"; isoSmile.style.transformOrigin = "50% 50%";
isoTop.style.transformBox = "fill-box"; isoTop.style.transformOrigin = "50% 50%";
// centro de la sonrisa en coordenadas del isotipo (viewBox 108×96)
const SMILE_C = [53.7, 80];
function isoPlace(cx, cy, w, extra = "") { const k = w / 1000; css(isoWrap, { transform: `translate(${cx - 500}px,${cy - 1000 * 96 / 108 / 2}px) scale(${k.toFixed(4)}) ${extra}` }); }
const isoSmileStage = (cx, cy, w) => [cx + (SMILE_C[0] / 108 - .5) * w, cy + (SMILE_C[1] / 96 - .5) * w * 96 / 108];

// ---------- logotipo ----------
const logoWrap = $("#logoWrap"), logoSvg = G("logo"), logoWord = [...G("logoWord").children];
const LK = L.logoW / 161, LX = (W - L.logoW) / 2, LY = L.logoY;
css(logoWrap, { left: LX + "px", top: LY + "px", width: L.logoW + "px" });
logoWord.forEach(p => { p.style.transformBox = "fill-box"; p.style.transformOrigin = "50% 100%"; });
const tag = $("#tagline"), sub = $("#sub");
tag.innerHTML = `<div style="font-size:${V ? 62 : 58}px;font-weight:900;letter-spacing:-1px;line-height:1.1">${V ? "Ocho asistentes.<br>" : "Ocho asistentes. "}<span class="gt">Una sola sonrisa.</span></div>
<div style="font-size:${V ? 34 : 30}px;font-weight:700;color:#5A5F7D;margin-top:${V ? 26 : 18}px;line-height:1.35">Orientan, ordenan y acompañan.${V ? "<br>" : " "}Nunca reemplazan a tu médico.</div>`;
css(tag, { top: (L.tagY - LY) + "px", left: (-LX) + "px", width: W + "px" });
css(sub, { top: (V ? 1330 : 800) - LY + "px", left: (-LX) + "px", width: W + "px", fontSize: (V ? 30 : 26) + "px" });
const tagLines = [...tag.children];
// el isotipo aterriza exactamente sobre el isotipo del logotipo
const LOGO_ISO = { cx: LX + 15.395 * LK, cy: LY + (5.134 + 96 * .2851 / 2) * LK, w: 108 * .2851 * LK };

// ---------- chispas ----------
const sparksEl = $("#sparks");
const SP = NAMES.map((n, k) => { const s = document.createElement("div"); s.className = "spark"; const tr = [...Array(7)].map(() => { const d = document.createElement("div"); d.className = "trail"; sparksEl.appendChild(d); return d; }); sparksEl.appendChild(s); return { s, tr }; });
const BURST = 6.0;
function orbitPos(k, t) {
  const [cx, cy, rx, ry] = L.orbit, base = -Math.PI / 2 + k * Math.PI * 2 / 8, a = base + (t - BURST) * .55;
  return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry + Math.sin(t * 2.4 + k) * 10];
}
function sparkPos(k, t) {
  const [sx, sy] = isoSmileStage(...L.iso, L.isoW);
  const T = AV_T[k], dive0 = T, dive1 = T + (k ? .35 : .4);
  if (t < BURST) return null;
  if (t < BURST + .8) { const p = E.outQuint(seg(t, BURST, BURST + .8)), o = orbitPos(k, t); return [lerp(sx, o[0], p), lerp(sy, o[1], p), 1 + (1 - p) * .6]; }
  if (t < dive0) return [...orbitPos(k, t), 1];
  if (t < dive1) { const p = E.inCubic(seg(t, dive0, dive1)), o = orbitPos(k, dive0), h = L.hero(k); return [lerp(o[0], h[0], p), lerp(o[1], h[1], p) - Math.sin(Math.PI * p) * 120, 1 + p * 1.6]; }
  return null;
}

// ---------- pulsos (ondas de choque) ----------
const pulsesEl = $("#pulses"); const PULSES = [];
function addPulse(t, x, y, size, color = "#7556D7", dur = .7, w = 6) { const d = document.createElement("div"); css(d, { position: "absolute", left: "0", top: "0", width: size + "px", height: size + "px", margin: `${-size / 2}px 0 0 ${-size / 2}px`, borderRadius: "50%", border: `${w}px solid ${color}`, opacity: 0 }); pulsesEl.appendChild(d); PULSES.push({ t, x, y, d, dur }); }
addPulse(3.0, ...L.iso, L.isoW * 1.1, "#529DE8"); addPulse(3.22, ...L.iso, L.isoW * 1.1, "#7556D7");
addPulse(BURST, ...isoSmileStage(...L.iso, L.isoW), 300, "#3FD3DE", .8, 10);
NAMES.forEach((n, k) => { const h = L.hero(k), T = AV_T[k]; addPulse(T + (k ? .35 : .4), ...h, L.heroS * .9, "#7556D7", .6, 8); addPulse(T + (k ? .8 : 1.0), ...h, L.heroS * 1.15, "#3FD3DE", .9, 4); });
addPulse(68.3, ...L.iso, L.isoW * 1.2, "#529DE8"); addPulse(68.52, ...L.iso, L.isoW * 1.2, "#7556D7");
// destellos de cristalización: 10 estrellitas por avatar
const STARS = []; NAMES.forEach((n, k) => { for (let j = 0; j < 10; j++) { const d = document.createElement("div"); d.className = "trail"; css(d, { opacity: 0 }); pulsesEl.appendChild(d); STARS.push({ k, j, d }); } });

// ---------- sonrisas que vuelan al final ----------
const smilesEl = $("#smiles");
const FLY = NAMES.map(() => { const s = document.createElementNS("http://www.w3.org/2000/svg", "svg"); s.setAttribute("viewBox", "0 0 120 60"); s.setAttribute("class", "smileFly");
  s.innerHTML = `<path d="M14 14 Q60 70 106 14" fill="none" stroke="#9FD0FF" stroke-width="20" stroke-linecap="round" opacity=".55" style="filter:blur(6px)"/><path d="M14 14 Q60 70 106 14" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round"/>`;
  smilesEl.appendChild(s); return s; });

// ---------- tarjeta de nombre ----------
const card = $("#card"), cNum = card.querySelector(".num"), cName = card.querySelector(".name b"), cIA = card.querySelector(".ia"), cRole = card.querySelector(".role"), cQ = card.querySelector(".q"), cFn = card.querySelector(".fn");
let cardFor = -1, letters = [], qWords = [];
function setCard(k) {
  if (k === cardFor) return; cardFor = k; if (k < 0) return;
  const [num, name, role, q, fn] = INFO[NAMES[k]];
  cNum.textContent = num; cRole.textContent = role; cFn.textContent = fn;
  const mix = (a, b, p) => "#" + [0, 2, 4].map(i => Math.round(lerp(parseInt(a.substr(i, 2), 16), parseInt(b.substr(i, 2), 16), p)).toString(16).padStart(2, "0")).join("");
  cName.innerHTML = [...name].map((c, i, arr) => `<span class="word" style="color:${mix("3F4FC2", "0FA9C9", i / Math.max(1, arr.length - 1))}">${c}</span>`).join(""); letters = [...cName.children];
  cQ.innerHTML = q.split(" ").map(w => `<span class="word">${w}&nbsp;</span>`).join(""); qWords = [...cQ.children];
  if (V) { card.style.width = "920px"; card.classList.add("center"); }
}
const cardWin = k => { const T = AV_T[k]; return k ? [T + .85, T + 5.2] : [T + 1.05, T + 5.2]; };

// ---------- titulares ----------
const h1 = $("#h1"), h2 = $("#h2");
const HL = [
  { el: h1, t0: 4.35, t1: 7.6, y: L.h1y, html: `Todo empezó con <span class="gt">una sonrisa.</span>` },
  { el: h2, t0: 57.7, t1: 61.25, y: L.h2y, html: `Ocho asistentes.` },
  { el: h1, t0: 68.05, t1: 69.55, y: L.endH, html: `Una sola <span class="gt">sonrisa.</span>` },
];
function splitWords(el, html) { if (el._html === html) return; el._html = html; const tmp = document.createElement("div"); tmp.innerHTML = html;
  const out = []; tmp.childNodes.forEach(n => { if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(w => w.trim() ? out.push(`<span class="word">${w}</span>`) : w && out.push(" ")); else n.textContent.split(/(\s+)/).forEach(w => w.trim() ? out.push(`<span class="word ${n.className}">${w}</span>`) : w && out.push(" ")); });
  el.innerHTML = out.join(""); el._words = [...el.querySelectorAll(".word")]; }

// ---------- polaroid y destello ----------
const pol = $("#polaroid"), flash = $("#flash");
css(pol, { left: L.polaroid[0] + "px", top: L.polaroid[1] + "px", width: L.polaroid[2] - 44 + "px", height: L.polaroid[3] - 132 + "px" });

// ---------- posición de cada avatar en el tiempo ----------
const ORDER = n => NAMES.indexOf(n);
function avState(k, t) {
  const n = NAMES[k], T = AV_T[k], imp = k ? .35 : .4, g0 = k ? .8 : 1.0, s = t - T;
  const shrink0 = 5.45, hero = L.hero(k), shelf = L.shelf(k);
  const st = { x: hero[0], y: hero[1], size: L.heroS, rot: 0, flat: 0, glass: 1, bright: 1, op: 1, sx: 1, sy: 1 };
  if (s < imp) { st.op = 0; return st; }
  // nace plano
  const pp = seg(s, imp, imp + .5); st.size *= E.outBack(pp, 2.4); st.rot = (1 - E.outCubic(pp)) * -28;
  // se vuelve cristal
  const gp = seg(s, g0, g0 + .45); st.flat = 1 - E.inOut(gp); st.glass = E.inOut(gp);
  st.size *= 1 + .13 * Math.sin(Math.PI * gp); st.bright = 1 + .8 * pulse(s, g0, .55);
  // flotación
  st.y += Math.sin((t + k) * 2.1) * 8;
  // viaja al estante
  if (s >= shrink0 && t < 57) { const p = E.inOut(seg(s, shrink0, shrink0 + .5));
    st.x = lerp(hero[0], shelf[0], p); st.y = lerp(st.y, shelf[1] + Math.sin((t + k) * 2) * 3, p) - Math.sin(Math.PI * p) * 90; st.size = lerp(st.size, L.shelfS, p); }
  // la foto familiar
  if (t >= 57) { const j = L.photoOrder.indexOf(n), dst = L.photo(j);
    let a0 = n === "catalina" ? 57.0 : n === "teo" ? 59.9 : 57.35 + (k - (k > 1 ? 2 : 1)) * .17, dur = n === "teo" ? .38 : .55;
    const p = seg(t, a0, a0 + dur), e = n === "teo" ? E.outBack(p, 2.6) : E.outBack(p, 1.6);
    const from = [shelf[0], shelf[1]];
    st.x = lerp(from[0], dst[0], e); st.y = lerp(from[1], dst[1], e) - Math.sin(Math.PI * p) * (n === "teo" ? 60 : 160);
    st.size = lerp(L.shelfS, L.photoS, E.outCubic(p));
    if (p >= 1) st.y += Math.sin((t + k * .7) * 2.4) * 6;
    if (n === "teo") st.rot = Math.sin((t - 60.28) * 34) * 9 * clamp(1 - (t - 60.28) / .6) * (t > 60.28 ? 1 : 0) + (p < 1 && p > 0 ? 10 : 0);
    // "digan whisky"
    const ch = pulse(t, 61.15, .35); st.sx = 1 + ch * .05; st.sy = 1 - ch * .04;
    // congelado tras el flash
    if (t >= 61.5 && t < 64.6) st.y = dst[1] + Math.sin((61.5 + k * .7) * 2.4) * 6;
    // las sonrisas se van: el avatar se despide
    const fo = 65.65 + ORDER_END(n) * .11, fp = seg(t, fo, fo + .7);
    st.op = 1 - E.inCubic(fp); st.size *= 1 - .45 * E.inCubic(fp); st.y -= fp * 30;
  }
  return st;
}
const ORDER_END = n => L.photoOrder.indexOf(n);

// gestos internos (grupos del SVG)
function gestures(t) {
  const set = (id, v) => { const e = G(id); if (e) e.setAttribute("transform", v); };
  // Catalina: los cubos se separan y se abrazan (y vuelve a llamar a la familia en 33.4)
  const cat = s => { const out = K(s, [[0, 0], [.35, 1, "outBack"], [.75, 1], [1.0, -.18, "inCubic"], [1.4, 0, "outBack"]]); return out; };
  const c1 = cat(t - AV_T[0] - 1.6) + cat(t - 57.35) * .8, d = 120 * c1;
  [["cTL", -1, -1], ["cTR", 1, -1], ["cBL", -1, 1], ["cBR", 1, 1]].forEach(([id, x, y]) => set("catalina-" + id, `translate(${x * d} ${y * d * .8})`));
  // Teo: giro preciso y frenada en seco
  const t1 = t - AV_T[1] + 12, tp = seg(t1, 13.25, 13.75), spin = E.outBack(tp, 1.2) * 360 + Math.sin((t1 - 13.75) * 40) * 4 * clamp(1 - (t1 - 13.75) / .35) * (t1 > 13.75 ? 1 : 0);
  set("teo-teo", `rotate(${spin.toFixed(2)} 962 900)`);
  // Sara: se cuadra y emite señal
  const t2 = t - AV_T[2] + 15, sq = pulse(t2, 16.25, .3), sq2 = pulse(t2, 16.6, .25);
  set("sara-sara", `translate(1000 940) scale(${1 + sq * .08 - sq2 * .05} ${1 - sq * .1 + sq2 * .07}) translate(-1000 -940)`);
  const wv = G("sara-waves"); if (wv) { const w = .35 + .65 * Math.abs(Math.sin((t2 - 16) * 6)) * (t2 > 16 && t2 < 17.6 ? 1 : 0); wv.setAttribute("opacity", t2 < 16 || t2 > 17.6 ? 1 : w.toFixed(3)); }
  // Alma: inhala y exhala
  const br = K(t - AV_T[3] + 18, [[19.15, 1], [19.85, 1.11, "inOutSine"], [20.55, .97, "inOutSine"], [20.85, 1, "inOutSine"]]);
  set("alma-alma", `translate(960 945) scale(${br}) translate(-960 -945)`);
  // Noelia: destella como alarma suave
  const t4 = t - AV_T[4] + 21, nr = Math.sin((t4 - 22.1) * 30) * 5 * (t4 > 22.1 && t4 < 22.75 ? 1 : 0);
  set("noelia-noelia", `rotate(${nr.toFixed(2)} 965 955)`);
  // Clara: se ilumina la línea del examen
  const t7 = t - AV_T[7] + 30;
  const tl = G("clara-textLine"); if (tl) tl.setAttribute("opacity", t7 > 31.05 && t7 < 32.4 ? (.25 + .75 * Math.abs(Math.sin((t7 - 31.05) * 7))).toFixed(3) : 1);
  set("clara-fold", `rotate(${(Math.sin((t7 - 31.1) * 9) * 6 * (t7 > 31.1 && t7 < 31.9 ? 1 : 0)).toFixed(2)} 1128 438)`);
}

// ============================================================================
function render(t) {
  t = clamp(t, 0, DUR);
  // ----- cámara -----
  const camS = K(t, [[0, 1.06], [4, 1.0, "outCubic"], [5.95, 1.04, "inCubic"], [6.35, 1.0, "outCubic"], [68, 1], [75, 1.045, "inOutSine"]]) + NAMES.reduce((a, n, k) => a + pulse(t, AV_T[k] + (k ? .35 : .4), .25) * .018, 0) + pulse(t, 61.5, .2) * .02;
  const shake = pulse(t, 61.5, .25) * 6, camX = Math.sin(t * 61) * shake, camY = Math.cos(t * 47) * shake;
  $("#cam").style.transform = `translate(${W / 2 + camX}px,${H / 2 + camY}px) scale(${camS.toFixed(4)}) translate(${-W / 2}px,${-H / 2}px)`;

  // ----- fondo -----
  const hue = [[.16, "#7556D7"], [.15, "#529DE8"], [.13, "#3FD3DE"]];
  blobs.forEach((b, i) => { const s = (V ? 900 : 1000) + 200 * Math.sin(t * .3 + i);
    const x = W * (.2 + .6 * hash(i + 1)) + Math.sin(t * .23 + i * 2) * W * .18 - s / 2, y = H * (.2 + .6 * hash(i + 7)) + Math.cos(t * .19 + i) * H * .16 - s / 2;
    css(b, { width: s + "px", height: s + "px", opacity: hue[i][0] * K(t, [[0, .2], [2, 1], [61.5, 1], [61.55, 1.8], [62.5, 1]]), transform: `translate(${x}px,${y}px)` }); });
  DOTS.forEach((d, i) => { const sp = 18 + hash(i) * 40, sz = 3 + hash(i + 50) * 7, x = (hash(i + 9) * W + Math.sin(t * .5 + i) * 30), y = H + 20 - ((hash(i + 3) * (H + 40) + t * sp) % (H + 40));
    css(d, { width: sz + "px", height: sz + "px", opacity: (.25 + .5 * hash(i + 11)) * seg(t, .5, 2), transform: `translate(${x}px,${y}px)` }); });

  // ----- isotipo -----
  let isoOp = 1, isoS = 1, isoC = [...L.iso], isoW = L.isoW, topOp = 1, dash = 0, fillOp = 1, strokeOp = 0, smS = 1, smX = 0, smY = 0, smR = 0, smSX = 1, smSY = 1, smOp = 1;
  if (t < 6.2) {
    isoS = K(t, [[0, .9], [2.6, 1, "outCubic"]]) + pulse(t, 3.0, .22) * .08 + pulse(t, 3.22, .22) * .05;
    dash = 1 - E.inOut(seg(t, .25, 1.7)); strokeOp = K(t, [[0, 1], [1.7, 1], [2.2, 0]]); fillOp = E.outCubic(seg(t, 1.25, 2.0));
    smS = E.outBack(seg(t, 1.65, 2.25), 2.2); smR = (1 - E.outCubic(seg(t, 1.65, 2.25))) * -25;
    // se despega, se estira, se ríe, se encoge y ¡pop!
    smY = K(t, [[4.0, 0], [4.5, 20, "outBack"], [5.6, 17], [5.95, 12, "inCubic"]]);
    const grow = K(t, [[4.0, 1], [4.5, 1.3, "outBack"], [5.6, 1.3], [5.95, 1.1, "inCubic"]]); smS *= grow;
    smSX = 1 + pulse(t, 4.05, .4) * .32 - pulse(t, 4.45, .25) * .12 + K(t, [[5.55, 0], [5.98, -.3, "inCubic"]]);
    smSY = 1 - pulse(t, 4.05, .4) * .22 + pulse(t, 4.45, .25) * .15 + K(t, [[5.55, 0], [5.98, -.3, "inCubic"]]);
    smR = smR + (t > 4.62 && t < 5.25 ? Math.sin((t - 4.62) * 32) * 11 * (1 - (t - 4.62) / .63) : 0);
    smOp = t < 6 ? 1 : 0;
    topOp = 1 - E.inCubic(seg(t, 4.3, 5.4)); isoOp = 1;
  } else if (t < 66.7) { isoOp = 0; }
  else {
    // reaparece: sonrisa primero (llegan las 8), luego el cuerpo; late; viaja al logotipo
    smS = E.outBack(seg(t, 66.85, 67.45), 2); smOp = seg(t, 66.85, 67.0); smY = 0; smR = 0;
    dash = 1 - E.inOut(seg(t, 67.2, 67.9)); strokeOp = K(t, [[67.2, 1], [67.9, 1], [68.2, 0]]); fillOp = E.outCubic(seg(t, 67.6, 68.1)); topOp = 1;
    isoS = 1 + pulse(t, 68.3, .22) * .08 + pulse(t, 68.52, .22) * .05;
    const p = E.inOut(seg(t, 69.6, 70.45));
    isoC = [lerp(L.iso[0], LOGO_ISO.cx, p), lerp(L.iso[1], LOGO_ISO.cy, p) - Math.sin(Math.PI * p) * 40]; isoW = lerp(L.isoW, LOGO_ISO.w, p);
  }
  css(isoWrap, { opacity: isoOp }); isoPlace(isoC[0], isoC[1], isoW * isoS);
  isoTop.style.opacity = (topOp * fillOp).toFixed(3); isoTop.style.transform = `scale(${t > 4 && t < 6.2 ? 1 - .08 * seg(t, 4.3, 5.4) : 1})`;
  isoStroke.style.strokeDashoffset = (dash * STROKE_LEN).toFixed(1); isoStroke.style.opacity = (strokeOp * topOp).toFixed(3);
  isoSmile.style.opacity = smOp; isoSmile.style.transform = `translate(${smX}px,${smY}px) rotate(${smR.toFixed(2)}deg) scale(${(smS * smSX).toFixed(3)},${(smS * smSY).toFixed(3)})`;

  // ----- pulsos -----
  PULSES.forEach(({ t: pt, x, y, d, dur }) => { const p = (t - pt) / dur; if (p < 0 || p > 1) { d.style.opacity = 0; return; }
    css(d, { opacity: (1 - p) * .8, transform: `translate(${x}px,${y}px) scale(${.3 + E.outCubic(p) * 1.2})` }); });
  STARS.forEach(({ k, j, d }) => { const t0 = AV_T[k] + (k ? .8 : 1.0), p = (t - t0) / .9; if (p < 0 || p > 1) { d.style.opacity = 0; return; }
    const a = j / 10 * Math.PI * 2 + k, r = L.heroS * (.32 + .3 * E.outCubic(p)) * (.8 + .4 * hash(j + k * 10)), h = L.hero(k);
    css(d, { opacity: Math.sin(Math.PI * p), transform: `translate(${h[0] + Math.cos(a) * r}px,${h[1] + Math.sin(a) * r}px) scale(${1.4 - p})` }); });

  // ----- anillo del héroe -----
  const ringOn = seg(t, 8.15, 8.6) * (1 - seg(t, 56.6, 57.05));
  if (ringOn > 0) {
    let ki = 0; NAMES.forEach((n, k) => { if (t >= AV_T[k] - .45) ki = k; });
    const prev = L.hero(Math.max(0, ki - 1)), cur = L.hero(ki), mp = E.inOut(seg(t, AV_T[ki] - .45, AV_T[ki] + .1)), c = [lerp(prev[0], cur[0], mp), lerp(prev[1], cur[1], mp)];
    const R = L.heroS * .47 * E.outBack(ringOn, 1.4), circ = 2 * Math.PI * R;
    [ringDisc, ringArc, ringArc2].forEach(e => { e.setAttribute("cx", c[0]); e.setAttribute("cy", c[1]); });
    ringDisc.setAttribute("r", R); ringDisc.setAttribute("opacity", (.85 * ringOn).toFixed(3));
    ringArc.setAttribute("r", R); ringArc.setAttribute("stroke-width", V ? 12 : 11); ringArc.setAttribute("stroke-dasharray", circ);
    const draw = E.inOut(seg(t, AV_T[ki] + .3, AV_T[ki] + 1.1)); ringArc.setAttribute("stroke-dashoffset", (circ * (1 - draw)).toFixed(1));
    ringArc.setAttribute("transform", `rotate(${-90 + ki * 45} ${c[0]} ${c[1]})`); ringArc.setAttribute("opacity", ringOn);
    const R2 = R * 1.1, c2 = 2 * Math.PI * R2; ringArc2.setAttribute("r", R2); ringArc2.setAttribute("stroke-width", V ? 13 : 12); ringArc2.setAttribute("stroke-dasharray", `${c2 * .16} ${c2}`);
    ringArc2.setAttribute("transform", `rotate(${-60 + t * 40} ${c[0]} ${c[1]})`); ringArc2.setAttribute("opacity", (ringOn * .55).toFixed(3));
  } else { ringDisc.setAttribute("opacity", 0); ringArc.setAttribute("opacity", 0); ringArc2.setAttribute("opacity", 0); }

  // ----- chispas -----
  SP.forEach(({ s, tr }, k) => { const p = sparkPos(k, t);
    if (!p) { s.style.opacity = 0; tr.forEach(d => d.style.opacity = 0); return; }
    css(s, { opacity: 1, transform: `translate(${p[0]}px,${p[1]}px) scale(${(p[2] * (1 + .15 * Math.sin(t * 9 + k))).toFixed(3)})` });
    tr.forEach((d, j) => { const q = sparkPos(k, t - (j + 1) * .028); if (!q) { d.style.opacity = 0; return; } css(d, { opacity: (.55 * (1 - j / 7)).toFixed(3), transform: `translate(${q[0]}px,${q[1]}px) scale(${(q[2] * (1 - j / 9)).toFixed(3)})` }); }); });

  // ----- familia -----
  gestures(t);
  NAMES.forEach((n, k) => { const a = AV[n], st = avState(k, t);
    let extraX = 0, extraY = 0, sx = st.sx, sy = st.sy, bright = st.bright;
    const s = t - AV_T[k];
    if (n === "dalia") { const hop = (a0) => { const p = seg(s, a0, a0 + .45); return Math.sin(Math.PI * p) * 110; }; extraY = -(hop(1.1) + hop(1.6) * .7);
      const land = pulse(s, 1.55, .15) + pulse(s, 2.05, .15) * .7; sx *= 1 + land * .14; sy *= 1 - land * .16; }
    if (n === "lia") { const vib = (s > 1.2 && s < 1.65) || (s > 1.85 && s < 2.25) ? 1 : 0; extraX = Math.sin(t * 95) * 9 * vib; const bp = seg(s, 1.25, 1.5);
      css(badge, { opacity: s > 1.25 && t < AV_T[6] + 2.6 ? 1 - seg(s, 2.3, 2.45) : 0, transform: `scale(${E.outBack(bp, 3)})` }); }
    if (n === "noelia") bright *= 1 + .35 * (pulse(s, 1.1, .3) + pulse(s, 1.45, .3));
    if (n === "clara") bright *= 1 + .2 * pulse(s, 1.05, .4);
    const size = st.size; const sc = size / 600;
    if (st.op <= 0.001) { a.el.style.opacity = 0; return; }
    css(a.el, { opacity: st.op.toFixed(3), transform: tf(st.x + extraX, st.y + extraY, sc, st.rot, sx, sy), filter: Math.abs(bright - 1) > .01 ? `brightness(${bright.toFixed(3)})` : "none", zIndex: (t > 57 ? 10 : 0) + (t - AV_T[k] < 5.6 && t < 57 ? 20 : 0) });
    a.flat.style.opacity = st.flat.toFixed(3); a.glass.style.opacity = st.glass.toFixed(3);
  });

  // ----- tarjeta de nombre -----
  let ck = -1; NAMES.forEach((n, k) => { const [a, b] = cardWin(k); if (t >= a - .05 && t <= b + .4) ck = k; });
  setCard(ck);
  if (ck >= 0) { const [a, b] = cardWin(ck), [cx, cy] = L.card(ck), out = E.inCubic(seg(t, b, b + .35));
    css(card, { opacity: 1 - out, transform: `translate(${cx + (V ? 0 : (ck % 2 ? -1 : 1) * out * 60)}px,${cy + (V ? out * 40 : 0)}px)` });
    css(cNum, { opacity: seg(t, a, a + .25), transform: `translateX(${(1 - E.outCubic(seg(t, a, a + .35))) * -30}px)` });
    letters.forEach((l, i) => { const p = seg(t, a + .08 + i * .045, a + .5 + i * .045); css(l, { opacity: Math.min(1, p * 3), transform: `translateY(${(1 - E.outBack(p, 2.2)) * 70}px) rotate(${(1 - E.outCubic(p)) * 12}deg)` }); });
    const ip = seg(t, a + .45, a + .75); css(cIA, { opacity: ip, transform: `scale(${E.outBack(ip, 3)})` });
    css(cRole, { opacity: seg(t, a + .35, a + .6), transform: `translateY(${(1 - E.outCubic(seg(t, a + .35, a + .7))) * 16}px)` });
    css(cFn, { opacity: seg(t, a + .45, a + .75), transform: `translateY(${(1 - E.outCubic(seg(t, a + .45, a + .8))) * 16}px)` });
    const qp = seg(t, a + .7, a + 1.05); css(cQ, { opacity: Math.min(1, qp * 2), transform: `scale(${E.outBack(qp, 2)})` });
    qWords.forEach((w, i) => { const p = seg(t, a + .8 + i * .06, a + 1.1 + i * .06); css(w, { opacity: p, transform: `translateY(${(1 - E.outCubic(p)) * 14}px)` }); });
  } else card.style.opacity = 0;

  // ----- titulares -----
  [h1, h2].forEach(e => e._used = false);
  HL.forEach(hl => { if (t < hl.t0 - .05 || t > hl.t1 + .5) return; const e = hl.el; e._used = true; splitWords(e, hl.html);
    const out = E.inCubic(seg(t, hl.t1, hl.t1 + .45));
    css(e, { opacity: 1 - out, top: hl.y + "px", left: "0px", width: W + "px", fontSize: L.hs + "px", padding: V ? "0 60px" : "0", boxSizing: "border-box", transform: `translateY(${-out * 30}px)` });
    e._words.forEach((w, i) => { const p = seg(t, hl.t0 + i * .1, hl.t0 + .55 + i * .1); css(w, { opacity: Math.min(1, p * 2.5), transform: `translateY(${(1 - E.outBack(p, 1.8)) * 60}px) scale(${.85 + .15 * E.outCubic(p)})` }); }); });
  [h1, h2].forEach(e => { if (!e._used) e.style.opacity = 0; });

  // ----- foto: destello + polaroid -----
  flash.style.opacity = (K(t, [[61.48, 0], [61.5, 1, "lin"], [61.95, 0, "outCubic"]]) + .35 * pulse(t, BURST, .3)).toFixed(3);
  const pp = seg(t, 61.5, 61.85) * (1 - seg(t, 64.1, 64.6));
  css(pol, { opacity: pp.toFixed(3), transform: `rotate(${lerp(4, -1.5, E.outBack(seg(t, 61.5, 62.1), 2))}deg) scale(${lerp(1.08, 1, E.outCubic(seg(t, 61.5, 62.1)))})` });

  // ----- sonrisas que vuelven a casa -----
  const target = isoSmileStage(...L.iso, L.isoW), tw = L.isoW * .76;
  FLY.forEach((s, k) => { const n = NAMES[k], j = ORDER_END(n), t0 = 65.5 + j * .11, p = seg(t, t0, t0 + 1.15);
    if (p <= 0 || p >= 1 || t > 67.2) { s.style.opacity = 0; return; }
    const src = L.photo(j), from = [src[0], src[1] + L.photoS * .06], e = E.inOut(p);
    const ctrl = [lerp(from[0], target[0], .5) + (j - 3.5) * 40, Math.min(from[1], target[1]) - (V ? 380 : 300)];
    const x = (1 - e) * (1 - e) * from[0] + 2 * (1 - e) * e * ctrl[0] + e * e * target[0], y = (1 - e) * (1 - e) * from[1] + 2 * (1 - e) * e * ctrl[1] + e * e * target[1];
    const w = lerp(L.photoS * .42, tw, E.inCubic(p)) / 120;
    css(s, { opacity: Math.min(1, p * 5) * (1 - seg(t, 66.95, 67.15)), transform: `translate(${x}px,${y}px) scale(${w.toFixed(3)}) rotate(${(1 - e) * (j - 3.5) * 14}deg)` }); });

  // ----- logotipo -----
  const lp = seg(t, 69.55, 70.6); css(logoWrap, { opacity: t > 69.5 ? 1 : 0 });
  G("logoIso").setAttribute("opacity", 0);
  logoWord.forEach((p, i) => { const q = seg(t, 70.05 + i * .06, 70.5 + i * .06); p.style.opacity = q.toFixed(3); p.style.transform = `translateY(${((1 - E.outBack(q, 2.4)) * 10).toFixed(2)}px) scale(${(.6 + .4 * E.outBack(q, 2.4)).toFixed(3)})`; });
  tagLines.forEach((l, i) => { const q = seg(t, 70.75 + i * .45, 71.35 + i * .45); css(l, { opacity: q, transform: `translateY(${(1 - E.outCubic(q)) * 26}px)` }); });
  const sq = seg(t, 71.8, 72.4); css(sub, { opacity: sq, letterSpacing: lerp(14, 4, E.outCubic(sq)) + "px" });
}
// ============================================================================

window.__render = render; window.__DUR = DUR;
window.__ready = document.fonts ? document.fonts.ready : Promise.resolve();
window.__audio = async () => { const buf = await MUSIC.render(); const ab = new Uint8Array(MUSIC.wav(buf)); let s = ""; for (let i = 0; i < ab.length; i += 0x8000) s += String.fromCharCode.apply(null, ab.subarray(i, i + 0x8000)); window.__wav = btoa(s); return window.__wav.length; };
window.__chunk = (i, n) => window.__wav.substr(i, n);
render(Q.has("t") ? parseFloat(Q.get("t")) : 0);

// ---------- reproducción en vivo ----------
// Usa musica.wav (pre-renderizada, instantánea); si no está, sintetiza en el navegador.
if (!CAPTURE) {
  const ui = $("#ui");
  ui.addEventListener("click", async e => {
    if (e.target.closest(".fmt")) return;
    ui.onclick = null; ui.innerHTML = "<div>Cargando música…</div>";
    let clock;
    const audio = new Audio("musica.wav"); audio.preload = "auto";
    try {
      await new Promise((ok, ko) => { audio.oncanplaythrough = ok; audio.onerror = ko; setTimeout(ko, 4000); audio.load(); });
      await audio.play(); clock = () => audio.currentTime;
    } catch (err) {
      ui.innerHTML = "<div>Sintetizando la música… (puede tardar unos segundos)</div>";
      try { const buf = await MUSIC.render(); const ac = new AudioContext(); await ac.resume(); const src = ac.createBufferSource(); src.buffer = buf; src.connect(ac.destination); const t0 = ac.currentTime + .1; src.start(t0); clock = () => ac.currentTime - t0; }
      catch (err2) { const t0 = performance.now(); clock = () => (performance.now() - t0) / 1000; }
    }
    ui.style.display = "none";
    const loop = () => { const t = Math.max(0, clock()); render(t);
      if (t < DUR - .02) requestAnimationFrame(loop);
      else { ui.style.display = "grid"; ui.innerHTML = '<div class="btn"><i></i></div><div>Ver de nuevo</div>'; ui.onclick = () => location.reload(); } };
    loop();
  }, { once: true });
}
})();
