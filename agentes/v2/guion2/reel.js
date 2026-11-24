// ============================================================================
//  GUION 2 · "La sesión de fotos familiar" — comedia · 55 s
//  El isotipo es el fotógrafo; su sonrisa es el flash. Cada avatar interrumpe la foto.
// ============================================================================
(() => {
const DUR = 55;
// ---------- layout ----------
const L = V ? {
  order: ["sara", "alma", "catalina", "teo", "lia", "noelia", "dalia", "clara"],
  slot: j => [540 + ((j % 4) - 1.5) * 245, j < 4 ? 900 : 1300], S: 235,
  pg: [540, 1095], zoom: 1.45, wideZ: 1, ph: [900, 1735], phW: 230,
  soft: [[150, 470], [930, 470]], softS: [150, 200], back: [40, 390, 1000, 1140], floorY: 1530,
  pol: [55, 742, 970, 880], isoC: [540, 860], isoW: 520, hlY: 1250, hs: 96, num: [540, 560], numS: 300,
  lock: { logoW: 860, logoY: 690, tagY: 990, subY: 1330 },
} : {
  order: ["lia", "sara", "alma", "catalina", "teo", "noelia", "dalia", "clara"],
  slot: j => [960 + (j - 3.5) * 196, 600], S: 200,
  pg: [960, 560], zoom: 1.75, wideZ: 1, ph: [1822, 972], phW: 200,
  soft: [[210, 300], [1710, 300]], softS: [190, 250], back: [110, 60, 1700, 750], floorY: 760,
  pol: [70, 395, 1710, 480], isoC: [960, 455], isoW: 440, hlY: 790, hs: 96, num: [960, 220], numS: 260,
  lock: { logoW: 940, logoY: 330, tagY: 600, subY: 800 },
};
const slotOf = n => L.slot(L.order.indexOf(n));
const ENT = { catalina: 5.0, teo: 10.0, sara: 14.2, alma: 18.4, noelia: 22.6, dalia: 26.8, lia: 31.0, clara: 35.2 };
const FLASH = 42.2;

// ---------- estudio ----------
addStyle(`.soft{position:absolute;left:0;top:0;border-radius:14px;background:linear-gradient(160deg,#fff,#E9ECFA);border:10px solid #2B2F4A;box-sizing:border-box}
.soft:after{content:"";position:absolute;left:50%;top:100%;width:8px;height:${V ? 330 : 520}px;margin-left:-4px;background:linear-gradient(#2B2F4A,rgba(43,47,74,.2))}
.cone{position:absolute;left:0;top:0;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.95),rgba(255,255,255,0));pointer-events:none}
.xmark{position:absolute;left:0;top:0;font:900 44px MulishR,system-ui;color:#F2A93B;transform-origin:50% 50%}
.prop{position:absolute;left:0;top:0;transform-origin:50% 100%}
.big{position:absolute;left:0;top:0;font-weight:900;line-height:1;background:linear-gradient(135deg,#7556D7,#529DE8 55%,#2FC7D6);-webkit-background-clip:text;background-clip:text;color:transparent;padding:0 .1em .1em}`);
const cam0 = $("#cam");
const back = mk("div", "", null, { position: "absolute", left: L.back[0] + "px", top: L.back[1] + "px", width: L.back[2] + "px", height: L.back[3] + "px", borderRadius: "40px 40px 220px 220px / 40px 40px 120px 120px",
  background: "radial-gradient(120% 90% at 50% 35%,#FFFFFF 0%,#F1F0FB 55%,#E2E3F6 100%)", boxShadow: "inset 0 -40px 80px rgba(117,86,215,.10)" });
cam0.insertBefore(back, cam0.firstChild);
const floor = mk("div", "", null, { position: "absolute", left: "-400px", top: L.floorY + "px", width: W + 800 + "px", height: "900px", background: "linear-gradient(#ECEAF8,#F7F7FE 60%)" });
cam0.insertBefore(floor, back.nextSibling);
const cones = L.soft.map(([x, y], i) => { const c = mk("div", "cone", null, { width: (V ? 900 : 1100) + "px", height: (V ? 700 : 760) + "px" }); cam0.insertBefore(c, floor.nextSibling); return c; });
const softs = L.soft.map(([x, y], i) => mk("div", "soft", null, { width: L.softS[0] + "px", height: L.softS[1] + "px" }));
// marcas de cinta en el piso (Catalina ordena el set)
const XS = L.order.map(() => mk("div", "xmark", null, {}, "✕"));
// etiquetas con nombre
const TAGS = NAMES.map(n => mk("div", "tagIA", null, { fontSize: (V ? 28 : 26) + "px" }, `${n[0].toUpperCase() + n.slice(1)}<i>IA</i>`));
// globos
const bubble = say(hud), bubble2 = say(hud, "grad"), phBubble = say(hud), phBubble2 = say(hud, "grad");
const siPops = [0, 1, 2].map(() => say(hud, "grad"));
// reloj de Teo
const clock = mk("div", "prop", null, { background: "#030C43", color: "#7FE7F0", borderRadius: "18px", padding: "10px 20px", font: `900 ${V ? 42 : 38}px MulishR,system-ui`, letterSpacing: "2px", boxShadow: "0 12px 30px rgba(3,12,67,.3)" });
// portapapeles de Sara
const clip = mk("div", "prop", null, {}, `<svg width="120" height="150" viewBox="0 0 120 150"><rect x="6" y="14" width="108" height="132" rx="14" fill="#7556D7"/><rect x="16" y="26" width="88" height="112" rx="8" fill="#fff"/><rect x="38" y="4" width="44" height="22" rx="8" fill="#2B2F4A"/>
  <g stroke="#529DE8" stroke-width="7" stroke-linecap="round" fill="none"><path d="M28 54l7 7 12-14M28 84l7 7 12-14M28 114l7 7 12-14"/></g><g stroke="#D9DCF2" stroke-width="7" stroke-linecap="round"><path d="M58 56h34M58 86h34M58 116h26"/></g></svg>`);
// alarma de Noelia
const alarm = mk("div", "prop", null, {}, `<svg width="420" height="220" viewBox="0 0 420 220" overflow="visible"><g fill="none" stroke="#FF6B8B" stroke-width="10" stroke-linecap="round">
  <path d="M70 60 Q40 110 70 160"/><path d="M40 35 Q0 110 40 185"/><path d="M350 60 Q380 110 350 160"/><path d="M380 35 Q420 110 380 185"/></g></svg>`);
// lupa de Clara
const lens = mk("div", "prop", null, { transformOrigin: "50% 50%" }, `<svg width="230" height="230" viewBox="0 0 230 230" overflow="visible"><defs><radialGradient id="lg2" cx=".35" cy=".3"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".6" stop-color="#CFEFFF" stop-opacity=".25"/><stop offset="1" stop-color="#7FB8F0" stop-opacity=".35"/></radialGradient></defs>
  <line x1="150" y1="150" x2="215" y2="215" stroke="#2B2F4A" stroke-width="22" stroke-linecap="round"/><circle cx="95" cy="95" r="78" fill="url(#lg2)" stroke="#7556D7" stroke-width="12"/><path d="M50 70 Q60 45 90 38" stroke="#fff" stroke-width="10" stroke-linecap="round" fill="none"/></svg>`);
// cuenta regresiva
const bigNum = mk("div", "big", hud, { fontSize: L.numS + "px" });
const hlEnd = headline($("#h1"), `…una sola <span class="gt">sonrisa.</span>`);
const hlOcho = headline($("#h2"), `Ocho personalidades…`);
const lock = logoLockup({ ...L.lock, html: `<div style="font-size:${V ? 62 : 58}px;font-weight:900;letter-spacing:-1px;line-height:1.1">Ocho personalidades.${V ? "<br>" : " "}<span class="gt">Una sola sonrisa.</span></div>
<div style="font-size:${V ? 34 : 30}px;font-weight:700;color:#5A5F7D;margin-top:${V ? 26 : 18}px;line-height:1.35">Orientan, ordenan y acompañan.${V ? "<br>" : " "}Nunca reemplazan a tu médico.</div>` });
const pol = $("#polaroid"); pol.querySelector("span").textContent = "La familia IA de Medismart"; cam0.appendChild(pol);
css(pol, { left: L.pol[0] + "px", top: L.pol[1] + "px", width: L.pol[2] - 44 + "px", height: L.pol[3] - 132 + "px", transformOrigin: "50% 60%" });
const dark = mk("div", "", stage, { position: "absolute", inset: "0", background: "#0B0E24", pointerEvents: "none" }); stage.insertBefore(dark, hud);
stage.appendChild(isoWrap); stage.insertBefore(isoWrap, $("#flash"));   // el fotógrafo no hace zoom
const spark = mk("div", "spark", null);

// ---------- cámara ----------
function camAt(t) {
  const wide = [W / 2, H / 2, 1];
  let best = null;
  const focus = { catalina: [...slotOf("catalina"), L.zoom * .9], teo: [...slotOf("teo"), L.zoom], sara: [(slotOf("sara")[0] + slotOf("teo")[0]) / 2, slotOf("sara")[1], V ? 1.2 : 1.25],
    alma: [...L.pg, 1.12], noelia: [...slotOf("noelia"), V ? 1.3 : 1.4], dalia: [...slotOf("dalia"), L.zoom], lia: [...slotOf("lia"), L.zoom], clara: [...L.pg, 1.05] };
  for (const n of NAMES) { const T = ENT[n]; if (t >= T - .2 && t <= T + 4.15) { best = [n, T]; break; } }
  if (!best) return wide;
  const [n, T] = best, f = focus[n].slice(); f[1] -= (V ? 120 : 70) / f[2];
  const p = E.inOut(seg(t, T - .2, T + .4)) * (1 - E.inOut(seg(t, T + 3.6, T + 4.15)));
  return [lerp(wide[0], f[0], p), lerp(wide[1], f[1], p), lerp(1, f[2], p)];
}

// ---------- avatares ----------
const tiltCat = t => K(t, [[11.6, 0], [11.9, 7, "outBack"], [16.0, 7], [16.25, 0, "outBack"]]);
const tiltTeo = t => K(t, [[11.5, 0], [11.8, -11, "outBack"], [16.0, -11], [16.25, 0, "outBack"]]);
function avAt(n, t) {
  const T = ENT[n], s = t - T, [sx0, sy0] = slotOf(n), S = L.S;
  const st = { x: sx0, y: sy0 + Math.sin((t + NAMES.indexOf(n)) * 2.2) * 5, size: S, rot: 0, sx: 1, sy: 1, op: 1, flat: 0, glass: 1, z: 1 };
  if (s < 0) return null;
  switch (n) {
    case "catalina": { if (s < .4) return null; const pp = seg(s, .4, .85); st.size = S * E.outBack(pp, 2.4); st.rot = (1 - E.outCubic(pp)) * -30;
      const gp = seg(s, .9, 1.3); st.flat = 1 - E.inOut(gp); st.glass = E.inOut(gp); st.bright = 1 + .8 * pulse(s, .9, .5); st.rot += tiltCat(t);
      const call = pulse(s, 1.7, .35) + pulse(s, 2.25, .35); st.sy = 1 + call * .08; st.sx = 1 - call * .05; break; }
    case "teo": { const p = E.outQuint(seg(s, .1, 1.2)); st.x = lerp(W + 300, sx0, p); st.rot = tiltTeo(t) + (s < 1.2 ? 0 : Math.sin((s - 1.2) * 30) * 3 * clamp(1 - (s - 1.2) / .3)); break; }
    case "sara": { const p = seg(s, .05, .95), hops = Math.abs(Math.sin(p * Math.PI * 3)) * 70; st.x = lerp(-250, sx0, E.outCubic(p)); st.y -= p < 1 ? hops : 0;
      const tap = pulse(s, 1.8, .25); st.sy *= 1 - tap * .1; st.sx *= 1 + tap * .06; break; }
    case "alma": { st.y = lerp(-300, st.y, E.inOutSine(seg(s, 0, 1.15))); st.rot = Math.sin(s * 3) * 8 * (1 - seg(s, 0, 1.15)); break; }
    case "noelia": { st.y = lerp(H + 300, st.y, E.outBack(seg(s, 0, .6), 1.4)); if (s > .7 && s < 1.6) st.rot = Math.sin(s * 70) * 9; break; }
    case "dalia": { const p = seg(s, 0, 1.2); st.x = lerp(W + 250, sx0, E.outCubic(p)); st.y -= Math.abs(Math.sin(p * Math.PI * 3)) * 140 * (1 - p);
      const hop = a => Math.sin(Math.PI * seg(s, a, a + .35)) * 70; st.y -= hop(1.25) + hop(1.65) + hop(2.05);
      const land = pulse(s, 1.6, .12) + pulse(s, 2.0, .12) + pulse(s, 2.4, .12); st.sx *= 1 + land * .14; st.sy *= 1 - land * .14; break; }
    case "lia": { st.y = lerp(-250, st.y, E.outBack(seg(s, 0, .6), 1.6)); if ((s > .7 && s < 1.25) || (s > 1.45 && s < 1.9)) st.x += Math.sin(t * 95) * 9; break; }
    case "clara": { st.y = lerp(-300, st.y, E.outBack(seg(s, 0, .7), 1.3)); st.rot = (1 - E.outCubic(seg(s, 0, .9))) * 25; break; }
  }
  // gags colectivos
  const alma = ENT.alma, br = K(t, [[alma + 1.4, 1], [alma + 1.85, 1.13, "inOutSine"], [alma + 2.3, .98, "inOutSine"], [alma + 2.75, 1.13, "inOutSine"], [alma + 3.2, 1, "inOutSine"]]);
  if (t > alma + 1.4 && t < alma + 3.2) st.size *= br;
  const nj = ENT.noelia + .75; if (n !== "noelia" && t > nj && t < nj + .5) { const q = Math.sin(Math.PI * seg(t, nj, nj + .45)); st.y -= q * 55; st.rot += q * (hash(NAMES.indexOf(n)) - .5) * 30; }
  // cuenta regresiva: Teo se acomoda en el último segundo; todos sonríen
  if (n === "teo" && t > 41.45 && t < 41.95) st.rot += Math.sin((t - 41.45) * 40) * 10 * (1 - (t - 41.45) / .5);
  const cheese = pulse(t, 41.9, .3); st.sx *= 1 + cheese * .05; st.sy *= 1 - cheese * .04;
  if (t >= FLASH && t < 46.4) st.y = sy0 + Math.sin((FLASH + NAMES.indexOf(n)) * 2.2) * 5;
  st.bright = (st.bright || 1) * (1 + .5 * pulse(t, FLASH, .5));
  // la foto se aplana
  if (t > 46.4) { const f = E.inCubic(seg(t, 46.4, 47.1)); st.sy *= 1 - f; st.y = lerp(st.y, L.pg[1], f); st.op = 1 - f; }
  return st;
}

// ---------- RENDER ----------
function render(t) {
  t = clamp(t, 0, DUR);
  const [cx, cy, cz] = camAt(t), shake = pulse(t, FLASH, .25) * 7;
  camera(cx + Math.sin(t * 61) * shake, cy + Math.cos(t * 47) * shake, cz + pulse(t, FLASH, .2) * .02);
  background(t, t < 46.4 ? .6 : 1);
  // luces: clac, clac, clac
  const lights = [.4, .9, 1.4].map(a => t >= a ? 1 : 0);
  css(dark, { opacity: (t < 46.4 ? Math.max(0, .82 - .27 * lights.reduce((a, b) => a + b, 0)) : 0).toFixed(3) });
  softs.forEach((s, i) => { const on = lights[i], fl = on * (1 + .6 * pulse(t, [.4, .9][i], .25)); css(s, { transform: `translate(${L.soft[i][0] - L.softS[0] / 2}px,${L.soft[i][1] - L.softS[1] / 2}px) rotate(${i ? -12 : 12}deg)`, filter: `brightness(${(.45 + .55 * fl).toFixed(2)})`, boxShadow: on ? "0 0 70px 20px rgba(255,255,255,.85)" : "none", opacity: ((1 - .85 * seg(cz, 1.05, 1.3)) * (1 - seg(t, FLASH, FLASH + .3))).toFixed(3) }); });
  cones.forEach((c, i) => css(c, { opacity: (lights[i] * .55 * (t > 46.4 ? 1 - seg(t, 46.4, 47) : 1)).toFixed(3), transform: `translate(${L.soft[i][0] + (i ? -1 : 1) * (V ? 120 : 260) - (V ? 450 : 550)}px,${L.soft[i][1] + 60}px) rotate(${i ? 25 : -25}deg)` }));
  const stOp = t > 46.4 ? 1 - seg(t, 46.4, 47) : 1; css(back, { opacity: (lights[2] ? 1 : .35) * stOp }); css(floor, { opacity: stOp });

  // marcas ✕ (Catalina ordena el set)
  XS.forEach((x, j) => { const a = 7.0 + j * .12, p = seg(t, a, a + .3), [sx, sy] = L.slot(j); const gone = seg(t, ENT[L.order[j]] + .3, ENT[L.order[j]] + .6);
    css(x, { opacity: (p * (1 - gone)).toFixed(3), transform: `translate(${sx - 16}px,${sy + L.S * .42}px) scale(${E.outBack(p, 3)}) rotate(${(1 - p) * 90}deg)` }); });

  // familia
  NAMES.forEach(n => { const st = avAt(n, t); setAv(n, st); const tag = TAGS[NAMES.indexOf(n)], [sx, sy] = slotOf(n), a = ENT[n] + 1.0, p = seg(t, a, a + .35);
    css(tag, { opacity: (t > a && t < 46.4 ? p : 0).toFixed(3), transform: `translate(${sx - tag.offsetWidth / 2}px,${sy + L.S * .5 + 8}px) scale(${.7 + .3 * E.outBack(p, 2.5)})` }); });
  resetGestures();
  const cs = s => K(s, [[0, 0], [.3, 1, "outBack"], [.6, 1], [.85, -.15, "inCubic"], [1.15, 0, "outBack"]]), cd = 120 * cs(t - 6.5);
  [["cTL", -1, -1], ["cTR", 1, -1], ["cBL", -1, 1], ["cBR", 1, 1]].forEach(([id, x, y]) => gset("catalina-" + id, `translate(${x * cd} ${y * cd * .8})`));
  const sq = pulse(t, ENT.sara + 1.8, .3); gset("sara-sara", `translate(1000 940) scale(${1 + sq * .08} ${1 - sq * .1}) translate(-1000 -940)`);
  gset("clara-fold", `rotate(${(Math.sin((t - ENT.clara) * 12) * 10 * (t > ENT.clara && t < ENT.clara + .8 ? 1 : 0)).toFixed(2)} 1128 438)`);

  // chispa de Catalina: sale del flash del fotógrafo y cae en su lugar
  { const p = seg(t, 5.0, 5.4), [px, py] = isoSmileAt(...L.ph, L.phW), [sx, sy] = slotOf("catalina");
    // coordenadas del escenario -> mundo de la cámara
    const wx = cx + (px - W / 2) / cz, wy = cy + (py - H / 2) / cz;
    css(spark, { opacity: p > 0 && p < 1 ? 1 : 0, transform: `translate(${lerp(wx, sx, E.inCubic(p))}px,${lerp(wy, sy, E.inCubic(p)) - Math.sin(Math.PI * p) * 160}px) scale(${1 + p})` }); }

  // utilería de cada gag
  const prop = (el, on, x, y, sc = 1, rot = 0) => css(el, { opacity: on.toFixed(3), transform: `translate(${x}px,${y}px) scale(${sc}) rotate(${rot}deg)` });
  { const s = t - ENT.teo, [sx, sy] = slotOf("teo"), sec = s < .4 ? 57 : s < .8 ? 58 : s < 1.2 ? 59 : 0; clock.textContent = `10:${sec ? 12 : 13}:${String(sec).padStart(2, "0")}`;
    const on = seg(s, -.1, .15) * (1 - seg(s, 3.3, 3.55)); prop(clock, on, sx + L.S * .5, sy - L.S * .2, E.outBack(seg(s, -.1, .25), 2.5) * (1 + .15 * pulse(s, 1.2, .25))); }
  { const s = t - ENT.sara, [sx, sy] = slotOf("sara"), on = seg(s, .8, 1) * (1 - seg(s, 3.3, 3.5)); prop(clip, on, sx + 60, sy - 40, E.outBack(seg(s, .8, 1.1), 2.4), -12 + 10 * pulse(s, 1.8, .25)); }
  { const s = t - ENT.noelia, [sx, sy] = slotOf("noelia"), on = s > .7 && s < 1.6 ? (Math.sin(s * 40) > 0 ? 1 : .35) : 0; prop(alarm, on, sx - 210, sy - 130, 1 + .08 * Math.sin(s * 40)); }
  { const s = t - ENT.clara, g0 = L.slot(0), g1 = L.slot(L.order.length - 1), p = E.inOut(seg(s, .9, 2.5)), on = seg(s, .8, 1) * (1 - seg(s, 2.6, 2.85));
    const lx = V ? lerp(L.slot(0)[0], L.slot(3)[0], (p * 2) % 1) : lerp(g0[0], g1[0], p), ly = V ? (p < .5 ? L.slot(0)[1] : L.slot(4)[1]) : g0[1];
    prop(lens, on, lx - 95, ly - 95 - 20 + Math.sin(s * 9) * 12, 1, -10 + Math.sin(s * 5) * 8); }

  // diálogos
  const [ph, pw] = [L.ph, L.phW];
  const BS = V ? 40 : 38, toScr = (wx, wy) => [W / 2 + (wx - cx) * cz, H / 2 + (wy - cy) * cz], headOf = n => { const [sx, sy] = slotOf(n); return toScr(sx, sy - L.S * .44); };
  const bub = (n, t0, t1, text, size = BS, grad = false) => { const [x, y] = headOf(n); (grad ? bubble2 : bubble).show(t, t0, t1, x, y, text, size, .5); };
  let used1 = false, used2 = false;
  const lines1 = [[ENT.catalina + 1.5, ENT.catalina + 3.9, "catalina", "La mamá ya llegó. ¡Ordenaditos!"], [ENT.teo + 1.3, ENT.teo + 3.4, "teo", "Puntual. 10:13 en punto."],
    [ENT.sara + 1.0, ENT.sara + 3.4, "sara", "Derechitos, por favor."], [ENT.alma + 1.0, ENT.alma + 3.4, "alma", "Respiremos antes de la foto…"],
    [ENT.noelia + .8, ENT.noelia + 3.3, "noelia", "¡Hora de la foto!"], [ENT.dalia + 2.55, ENT.dalia + 4.0, "dalia", "¡Lo que necesiten!"],
    [ENT.clara + 2.6, ENT.clara + 4.0, "clara", "Todo dentro del rango normal. ✓"]];
  lines1.forEach(([a, b, n, txt]) => { if (t >= a && t <= b + .3) { bub(n, a, b, txt); used1 = true; } });
  if (!used1) bubble.show(t, -1, -1);
  if (t >= ENT.lia + .8 && t <= ENT.lia + 3.6) { bub("lia", ENT.lia + .8, ENT.lia + 3.3, "¿Confirmamos la foto?", BS, true); used2 = true; } if (!used2) bubble2.show(t, -1, -1);
  // "¡Sí!" de Dalia
  siPops.forEach((b, i) => { const a = ENT.dalia + 1.2 + i * .35, [x, y] = headOf("dalia"); b.show(t, a, a + .5, x + (i - 1) * (V ? 170 : 160), y - [10, 60, 10][i], "¡Sí!", BS, .5); });
  // el fotógrafo habla (fuera de la cámara)
  const phY = ph[1] - pw * .42, phX = ph[0];
  const ph1 = [[2.4, 4.5, "¡Foto familiar! Todos a sus puestos."], [ENT.lia + 2.0, ENT.lia + 3.6, "✓✓ ¡Confirmada!"], [39.3, 41.95, "Digan… ¡sonrisa!"]];
  let usedP = false; ph1.forEach(([a, b, txt]) => { if (t >= a && t <= b + .3) { phBubble.show(t, a, b, phX, phY, txt, BS, .85); usedP = true; } }); if (!usedP) phBubble.show(t, -1, -1);

  // fotógrafo: entra, prueba el flash, dispara
  const flashes = [4.7, 5.0, FLASH];
  if (t < 46.4) { const p = E.outBack(seg(t, 1.6, 2.3), 1.7), x = lerp(W + 250, ph[0], p), bob = Math.sin(t * 2.6) * 6, glow = flashes.reduce((a, f) => a + pulse(t, f - .05, .35), 0);
    const aim = pulse(t, 4.55, .2) + pulse(t, 41.9, .35); iso(x, ph[1] + bob, pw * (1 + .06 * aim), { glow: Math.min(1.5, glow * 1.4), smSX: 1 + .25 * glow, smSY: 1 + .25 * glow, rot: -6 * aim });
  } else { // el fotógrafo se convierte en el isotipo protagonista
    const p = E.inOut(seg(t, 46.4, 47.3)), q = E.inOut(seg(t, 49.0, 49.85));
    const c0 = [lerp(ph[0], L.isoC[0], p), lerp(ph[1], L.isoC[1], p) - Math.sin(Math.PI * p) * 120], w0 = lerp(pw, L.isoW, p);
    const hb = 1 + pulse(t, 47.6, .22) * .08 + pulse(t, 47.82, .22) * .05;
    iso(lerp(c0[0], lock.ISO.cx, q), lerp(c0[1], lock.ISO.cy, q) - Math.sin(Math.PI * q) * 40, lerp(w0, lock.ISO.w, q) * hb, { glow: .4 * pulse(t, 47.6, .5) });
  }
  // cuenta regresiva
  const nums = [[39.8, "3"], [40.6, "2"], [41.4, "1"]]; let shown = false;
  nums.forEach(([a, n]) => { if (t >= a && t < a + .78) { shown = true; const p = seg(t, a, a + .78); bigNum.textContent = n;
    css(bigNum, { opacity: (1 - E.inCubic(seg(p, .6, 1))).toFixed(3), transform: `translate(${L.num[0] - bigNum.offsetWidth / 2}px,${L.num[1] - L.numS / 2}px) scale(${(.4 + .6 * E.outBack(seg(p, 0, .35), 2.6)) * (1 + .15 * p)})` }); } });
  if (!shown) bigNum.style.opacity = 0;
  // flash + polaroid
  $("#flash").style.opacity = (K(t, [[FLASH - .02, 0], [FLASH, 1, "lin"], [FLASH + .45, 0, "outCubic"]]) + .45 * pulse(t, 5.0, .3) + .2 * pulse(t, 4.7, .2)).toFixed(3);
  const pp = seg(t, FLASH, FLASH + .35);
  css(pol, { opacity: t > 46.4 ? 1 - seg(t, 46.4, 47.1) : pp, transform: `rotate(${lerp(4, -1.5, E.outBack(seg(t, FLASH, FLASH + .6), 2))}deg) scale(${lerp(1.08, 1, E.outCubic(seg(t, FLASH, FLASH + .6)))},${lerp(1.08, 1, E.outCubic(seg(t, FLASH, FLASH + .6))) * (1 - E.inCubic(seg(t, 46.4, 47.1)))})` });
  hlOcho(t, 43.0, 46.0, V ? 600 : 935, V ? 80 : 70, { color: "#030C43" });
  hlEnd(t, 47.3, 48.85, L.hlY, L.hs);
  lock.render(t, 49.0);
}
boot(render, DUR, MUSIC2.render);
})();
