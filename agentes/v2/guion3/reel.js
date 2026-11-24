// ============================================================================
//  GUION 3 · "Un día con la familia" — relevo · 60 s
//  La sonrisa sale como un sol, se vuelve pelota de luz y pasa de mano en mano
//  durante el día. De noche, los ocho forman una constelación: el isotipo.
// ============================================================================
(() => {
const DUR = 63;
const RELAY = ["catalina", "lia", "noelia", "sara", "clara", "alma", "dalia", "teo"];
const HOURS = ["06:30", "07:00", "08:00", "09:30", "11:00", "13:00", "16:00", "18:00"];
const D = V ? 760 : 980, GY = V ? 1420 : 800, S = V ? 360 : 330;
const X = k => W / 2 + k * D;
const CATCH = [8.0, 10.6, 16.2, 21.8, 27.4, 33.0, 38.6, 44.2], THROW = [9.4, 15.0, 20.6, 26.2, 31.8, 37.4, 43.0, 48.6], BACK = 50.7;
const LOCK = logoLockup({ ...(V ? { logoW: 860, logoY: 690, tagY: 990, subY: 1330 } : { logoW: 940, logoY: 330, tagY: 600, subY: 800 }),
  html: `<div style="font-size:${V ? 62 : 58}px;font-weight:900;letter-spacing:-1px;line-height:1.1">Cada uno en lo suyo.${V ? "<br>" : " "}<span class="gt">Una sola sonrisa.</span></div>
<div style="font-size:${V ? 34 : 30}px;font-weight:700;color:#5A5F7D;margin-top:${V ? 26 : 18}px;line-height:1.35">Orientan, ordenan y acompañan.${V ? "<br>" : " "}Nunca reemplazan a tu médico.</div>` });

// ---------- cielo por hora del día ----------
const hx = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
const mixc = (a, b, p) => { const A = hx(a), B = hx(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], p))).join(",")})`; };
const SKY = [[5.0, "#1B1F4A", "#4B3F8F"], [6.5, "#B9A7F0", "#FFD9C7"], [8, "#CFE3FF", "#F7F7FE"], [12, "#DDEEFF", "#F7F7FE"], [16, "#E3DAFF", "#FFE6D6"], [18, "#B79CF0", "#FFC9B8"], [19.5, "#3A3A8C", "#8E7BD0"], [21, "#0F1330", "#232A6A"], [23, "#0F1330", "#232A6A"], [23.6, "#DDEEFF", "#F7F7FE"]];
const HOUR = t => K(t, [[0, 5.75], [8, 6.5, "lin"], [10.6, 7, "lin"], [16.2, 8, "lin"], [21.8, 9.5, "lin"], [27.4, 11, "lin"], [33, 13, "lin"], [38.6, 16, "lin"], [44.2, 18, "lin"], [50.5, 21, "lin"], [55, 23, "lin"], [56.6, 23.6, "inOut"], [63, 23.6]]);
function skyAt(h) { for (let i = 1; i < SKY.length; i++) if (h <= SKY[i][0]) { const p = seg(h, SKY[i - 1][0], SKY[i][0]); return [mixc(SKY[i - 1][1], SKY[i][1], p), mixc(SKY[i - 1][2], SKY[i][2], p), p, i]; } const l = SKY[SKY.length - 1]; return [l[1], l[2]]; }
const nightness = h => h < 6.5 ? 1 - seg(h, 5, 6.5) : h > 23 ? 1 - seg(h, 23, 23.6) : seg(h, 18.3, 20.5);

addStyle(`.card3{position:absolute;left:0;top:0;background:rgba(255,255,255,.96);border-radius:26px;box-shadow:0 20px 50px rgba(3,12,67,.16);padding:22px 26px;color:#030C43;font-weight:800;transform-origin:0 100%;width:max-content}
.card3 .hr{font-size:.8em;font-weight:900;color:#0E9BDB;letter-spacing:2px}
.card3 .nm{font-size:1.25em;font-weight:900;margin:2px 0 10px;display:flex;align-items:center;gap:10px}.card3 .nm i{font-style:normal;border:2px solid #2F3FAE;color:#2F3FAE;border-radius:999px;padding:0 9px;font-size:.55em}
.card3 .tx{font-weight:700;color:#2B2F4A;margin-top:12px;line-height:1.3;text-wrap:balance;width:0;min-width:100%}
.clockHud{position:absolute;left:0;top:0;font-weight:900;color:#030C43;display:flex;align-items:center;gap:16px}
.star{position:absolute;left:0;top:0;width:6px;height:6px;margin:-3px;border-radius:50%;background:#fff;box-shadow:0 0 8px 2px rgba(255,255,255,.7)}
.ball{position:absolute;left:0;top:0;width:110px;height:110px;margin:-55px;border-radius:50%;background:radial-gradient(circle,#fff 0 26%,#D7F3FF 38%,rgba(82,157,232,.75) 56%,rgba(117,86,215,.25) 66%,transparent 72%);box-shadow:0 0 60px 18px rgba(160,210,255,.45)}`);

// ---------- capas ----------
const sky = mk("div", "", $("#bg"), { position: "absolute", inset: "0" }); $("#bg").insertBefore(sky, $("#bg").firstChild);
const stars = [...Array(70)].map((_, i) => mk("div", "star", $("#bg"), { transform: `translate(${hash(i + 3) * W}px,${hash(i + 77) * GY * .85}px) scale(${.5 + hash(i) * 1.2})` }));
const hills = mk("div", "", $("#bg"), { position: "absolute", left: 0, top: 0 }, `<svg width="${W * 4}" height="${H}" viewBox="0 0 ${W * 4} ${H}"><path id="hillP" d="M0 ${GY - 60} ${[...Array(24)].map((_, i) => `Q ${(i + .5) * W / 6} ${GY - 130 - hash(i) * 120} ${(i + 1) * W / 6} ${GY - 50 - hash(i + 5) * 40}`).join(" ")} V ${H} H 0 Z" fill="#fff" opacity=".45"/></svg>`);
const groundW = X(7) + W * 1.5;
const ground = mk("div", "", null, { position: "absolute", left: -W + "px", top: GY + "px", width: groundW + W + "px", height: H * 5 + "px", background: "linear-gradient(#ffffff,#EEEDFA 30%,#F7F7FE)", borderTop: "3px solid rgba(117,86,215,.35)" });
cam.insertBefore(ground, cam.firstChild);
const groundNight = mk("div", "", null, { position: "absolute", left: -W + "px", top: GY + "px", width: groundW + W + "px", height: H * 5 + "px", background: "linear-gradient(#1A1F4E,#0F1330 25%)" });
cam.insertBefore(groundNight, ground.nextSibling);
const clockHud = mk("div", "clockHud", hud, { fontSize: (V ? 60 : 54) + "px" });
const ball = mk("div", "ball", null); const trail = [...Array(6)].map(() => mk("div", "trail", null));
const ballSmile = mk("div", "", null, { position: "absolute", left: 0, top: 0 }, `<svg width="70" height="36" viewBox="0 0 120 60"><path d="M16 14 Q60 66 104 14" fill="none" stroke="#7556D7" stroke-width="13" stroke-linecap="round"/></svg>`);
const rays = mk("div", "", hud, { position: "absolute", left: 0, top: 0, width: "900px", height: "900px", margin: "-450px", borderRadius: "50%",
  background: "repeating-conic-gradient(from 0deg,rgba(255,220,180,.35) 0 6deg,transparent 6deg 18deg)", WebkitMaskImage: "radial-gradient(circle,#000 18%,transparent 62%)", maskImage: "radial-gradient(circle,#000 18%,transparent 62%)" });
stage.insertBefore(isoWrap, hud);   // el isotipo vive fuera de la cámara

// tarjetas del día (utilería de cada avatar)
const PROPS = {
  lia: ["07:00", "Lia", `<div style="background:#E9F8EE;border-radius:18px;padding:12px 16px;font-weight:700">Tu cita es hoy a las 10:30.<br>¿La confirmamos? <span style="color:#38B6FF">✓✓</span></div>`],
  noelia: ["08:00", "Noelia", `<div style="display:flex;align-items:center;gap:16px"><svg width="86" height="44" viewBox="0 0 86 44"><rect x="2" y="2" width="82" height="40" rx="20" fill="#E8E2FB"/><path d="M22 2h21v40H22a20 20 0 0 1 0-40z" fill="#7556D7"/></svg><span>Son las 8:<br>toca tu pastilla.</span></div>`],
  sara: ["09:30", "Sara", `<div class="grid" style="display:grid;grid-template-columns:repeat(5,58px);gap:7px">${[...Array(15)].map((_, i) => `<b style="height:30px;border-radius:7px;background:#EEF0FA;display:block"></b>`).join("")}</div>`],
  clara: ["11:00", "Clara", `<div style="display:grid;gap:9px">${["Glucosa", "Colesterol", "Hemoglobina"].map(n => `<div style="display:flex;align-items:center;gap:10px;font-weight:700"><span style="width:6.9em;flex:none;white-space:nowrap">${n}</span><span class="bar" style="width:150px;flex:none;height:14px;border-radius:7px;background:#EEF0FA;overflow:hidden"><b style="display:block;height:100%;width:0;background:linear-gradient(90deg,#529DE8,#3FD3DE)"></b></span><span class="ok" style="color:#20B07A;opacity:0">✓</span></div>`).join("")}</div>`],
  alma: ["13:00", "Alma", `<div style="display:grid;place-items:center;height:190px;width:300px"><div class="br" style="width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,#C9B6F8,#7556D7);display:grid;place-items:center;color:#fff;font-weight:900;font-size:.78em">Respira</div></div>`],
  dalia: ["16:00", "Dalia", `<div style="display:grid;gap:8px">${[...Array(4)].map(() => `<div style="display:flex;gap:8px;align-items:center"><b style="width:250px;height:22px;border-radius:6px;background:#EEF0FA;display:block"></b><span class="ok" style="color:#20B07A;font-weight:900;opacity:0">✓</span></div>`).join("")}</div>`],
  teo: ["18:00", "Teo", `<div style="width:300px;height:170px;border-radius:18px;background:linear-gradient(160deg,#2B3AA8,#1A8BDC);position:relative;overflow:hidden"><div style="position:absolute;left:50%;top:38px;width:62px;height:62px;margin-left:-31px;border-radius:50%;background:#fff;opacity:.9"></div><div style="position:absolute;left:50%;top:106px;width:120px;height:70px;margin-left:-60px;border-radius:60px 60px 0 0;background:#fff;opacity:.9"></div><div class="rec" style="position:absolute;right:14px;top:14px;width:16px;height:16px;border-radius:50%;background:#FF4D6D"></div></div>`],
};
const QUOTES = { lia: "Te aviso a tiempo por WhatsApp.", noelia: "", sara: "Cita reagendada y paciente notificado.", clara: "Todo dentro del rango.", alma: "Respiremos juntos, sin apuro.", dalia: "¡Listo!<br>Revisé tu archivo.", teo: "Videoconsulta en 15 min. Todo listo." };
const CARDS = {}; RELAY.slice(1).forEach(n => { const [hr, nm, html] = PROPS[n];
  CARDS[n] = mk("div", "card3 " + (V ? "tb" : "tl"), null, { fontSize: (V ? 30 : 27) + "px", transformOrigin: V ? "50% 100%" : "0 100%" }, `<div class="hr">${hr}</div><div class="nm">${nm}<i>IA</i></div>${html}${QUOTES[n] ? `<div class="tx">${QUOTES[n]}</div>` : ""}`); });
const constLines = mk("div", "", hud, { position: "absolute", left: 0, top: 0 }, `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" overflow="visible"><g id="cLines" stroke="#CFE3FF" stroke-width="3" stroke-linecap="round" fill="none"></g></svg>`);
const cLines = G("cLines"); const LINES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [0, 4], [2, 6]];
LINES.forEach(() => { const l = document.createElementNS("http://www.w3.org/2000/svg", "line"); cLines.appendChild(l); });
const hl1 = headline($("#h1"), `Un día <span class="gt">cualquiera.</span>`), hl2 = headline($("#h2"), `Alguien siempre <span class="gt">te acompaña.</span>`);
const hl3 = (() => { const e = mk("div", "headline", stage); stage.insertBefore(e, $("#flash")); return headline(e, `Cada uno en lo suyo.${V ? "<br>" : " "}<span class="gt">Todos en lo mismo: cuidarte.</span>`); })();

// ---------- cámara ----------
// sigue la pelota: en cada estación se detiene; vuelta final con zoom de alejamiento
const CAM_OFF = V ? 0 : 230;
function camAt(t) {
  if (t < THROW[0]) return [X(0), H / 2, 1];
  for (let k = 0; k < 7; k++) { const a = THROW[k], b = CATCH[k + 1];
    if (t < b) { const p = E.inOut(seg(t, a, b)); return [lerp(X(k) + (k ? CAM_OFF : 0), X(k + 1) + CAM_OFF, p), H / 2, 1 - .12 * Math.sin(Math.PI * p)]; }
    if (t < THROW[k + 1]) return [X(k + 1) + CAM_OFF, H / 2, 1 + .04 * seg(t, b, THROW[k + 1])]; }
  // la vuelta: alejamiento hasta ver la línea entera
  const p = E.inOut(seg(t, THROW[7], BACK)), mid = (X(0) + X(7)) / 2, zFar = W / (X(7) - X(0) + (V ? 700 : 1100));
  return [lerp(X(7) + CAM_OFF, mid, p), lerp(H / 2, GY - (V ? 200 : 120), p), lerp(1.04, zFar, p)];
}
const toWorld = (sx, sy, c) => [c[0] + (sx - W / 2) / c[2], c[1] + (sy - H / 2) / c[2]];
const toScreen = (wx, wy, c) => [W / 2 + (wx - c[0]) * c[2], H / 2 + (wy - c[1]) * c[2]];

// ---------- pelota ----------
function ballAt(t) {
  const hold = k => [X(k) + Math.sin(t * 3) * 6, GY - S * .95 + Math.sin(t * 4) * 8];
  if (t < 5.6) return null;
  if (t < CATCH[0]) { const p = E.inOut(seg(t, 5.6, CATCH[0])), from = [W / 2, GY - (V ? 520 : 400)]; const h = hold(0); return [lerp(from[0], h[0], p), lerp(from[1], h[1], E.inCubic(p)), 1]; }
  for (let k = 0; k < 8; k++) {
    const c = CATCH[k], th = THROW[k], nx = k < 7 ? CATCH[k + 1] : BACK, dst = k < 7 ? k + 1 : 0;
    if (t < th) return [...hold(k), 1];
    if (t < nx) { const p = seg(t, th, nx), a = hold(k), b = hold(dst), e = E.inOut(p), peak = k < 7 ? (V ? 420 : 360) : (V ? 1500 : 900);
      return [lerp(a[0], b[0], e), lerp(a[1], b[1], e) - Math.sin(Math.PI * p) * peak, 1 + .25 * Math.sin(Math.PI * p)]; }
  }
  return [...hold(0), 1];
}

// ---------- constelación (de noche) ----------
const CONST = V ? [[540, 470], [820, 640], [880, 960], [760, 1260], [540, 1380], [300, 1200], [210, 900], [300, 620]]
               : [[960, 210], [1290, 300], [1450, 560], [1300, 820], [960, 900], [620, 820], [470, 560], [630, 300]];
const CS = V ? 190 : 170;

// ---------- RENDER ----------
function render(t) {
  t = clamp(t, 0, DUR);
  const c = camAt(t); camera(...c);
  const hr = HOUR(t), [top, bot] = skyAt(hr), night = nightness(hr);
  css(sky, { background: `linear-gradient(${top},${bot} 75%)` });
  background(t, 1 - night * .8);
  stars.forEach((s, i) => s.style.opacity = (night * (.4 + .6 * Math.abs(Math.sin(t * 1.3 + i)))).toFixed(3));
  css(hills, { transform: `translateX(${-((c[0] - W / 2) * .25) % (W * 2)}px)`, opacity: 1 - night * .6 });
  const gOut = 1 - seg(t, 55.2, 56.2); css(groundNight, { opacity: (night * gOut).toFixed(3) }); css(ground, { opacity: gOut, background: `linear-gradient(${bot},#F7F7FE 35%)` });

  // reloj del día
  const hh = Math.floor(hr % 24), mm = Math.floor((hr % 1) * 60 / 15) * 15;
  clockHud.innerHTML = `<svg width="${V ? 60 : 54}" height="${V ? 60 : 54}" viewBox="0 0 54 54">${night > .5 ? `<path d="M36 8a20 20 0 1 0 10 30A16 16 0 0 1 36 8z" fill="#FFE7A8"/>` : `<circle cx="27" cy="27" r="11" fill="#FFB547"/><g stroke="#FFB547" stroke-width="4" stroke-linecap="round">${[...Array(8)].map((_, i) => { const a = i * Math.PI / 4; return `<line x1="${27 + Math.cos(a) * 17}" y1="${27 + Math.sin(a) * 17}" x2="${27 + Math.cos(a) * 23}" y2="${27 + Math.sin(a) * 23}"/>`; }).join("")}</g>`}</svg>${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  css(clockHud, { opacity: (seg(t, 9.2, 9.8) * (1 - seg(t, 54.6, 55.2))).toFixed(3), color: night > .5 ? "#fff" : "#030C43", transform: `translate(${V ? 60 : 70}px,${V ? 90 : 60}px)` });

  // ----- amanecer: el isotipo en el horizonte; su sonrisa sale como sol -----
  if (t < 6.4) {
    const rise = E.inOut(seg(t, 2.2, 4.8)), glow = .55 + .45 * seg(t, 1.8, 4.5), fade = seg(t, 4.9, 5.7), isoW = V ? 440 : 380;
    iso(W / 2, GY - isoW * .35, isoW, { op: 1, draw: E.inOut(seg(t, .3, 1.8)), stroke: K(t, [[0, 1], [1.8, 1], [2.2, 0]]), fill: seg(t, 1.3, 2.0), top: 1 - fade,
      sm: E.outBack(seg(t, 1.5, 2.1), 2) * (1 + rise * .5) * (1 - seg(t, 5.0, 5.6) * .6), smY: -rise * 13, glow: glow * 1.2, smOp: 1 - seg(t, 5.4, 5.6) });
    css(rays, { opacity: (glow * (1 - fade)).toFixed(3), transform: `translate(${W / 2}px,${GY - isoW * .35 + isoW * .25 - rise * isoW * .55}px) rotate(${t * 12}deg) scale(${.6 + rise * .6})` });
  } else if (t < 55) { css(isoWrap, { opacity: 0 }); rays.style.opacity = 0; }
  hl1(t, .9, 4.6, V ? 360 : 140, V ? 100 : 92, { color: night > .5 ? "#fff" : "#030C43" });
  hl2(t, 6.2, 9.2, V ? 360 : 140, V ? 92 : 84, { color: "#030C43" });

  // ----- familia en sus estaciones -----
  RELAY.forEach((n, k) => {
    const sx = X(k), cat = CATCH[k], appear = k === 0 ? 5.8 : cat - 1.2;
    let st = { x: sx, y: GY - S * .45 + Math.sin(t * 2 + k) * 5, size: S, rot: 0, sx: 1, sy: 1, op: 1, flat: 0, glass: 1, z: 2 };
    const ap = seg(t, appear, appear + .55); if (ap <= 0) { setAv(n, null); return; }
    st.size *= E.outBack(ap, 2.2); st.rot = (1 - E.outCubic(ap)) * -25;
    if (k === 0) { const gp = seg(t, 6.3, 6.75); st.flat = 1 - E.inOut(gp); st.glass = E.inOut(gp); st.bright = 1 + .8 * pulse(t, 6.3, .5); }
    // atrapa (aplasta y brilla) y lanza (anticipa)
    const ct = k === 0 ? [CATCH[0], BACK] : [cat]; ct.forEach(a => { const q = pulse(t, a, .28); st.sy *= 1 - q * .16; st.sx *= 1 + q * .12; st.bright = (st.bright || 1) * (1 + .45 * q); });
    const th = THROW[k], ant = K(t, [[th - .35, 0], [th - .05, 1, "inCubic"], [th + .12, -.4, "outCubic"], [th + .4, 0]]); st.sy *= 1 - ant * .12; st.y += ant * 14;
    // gestos durante su momento
    const s = t - cat;
    if (n === "lia" && ((s > .5 && s < 1) || (s > 1.3 && s < 1.7))) st.x += Math.sin(t * 95) * 8;
    if (n === "alma") st.size *= K(s, [[.8, 1], [1.5, 1.1, "inOutSine"], [2.2, .97, "inOutSine"], [2.9, 1.1, "inOutSine"], [3.6, 1, "inOutSine"]]);
    if (n === "noelia" && s > .5 && s < 1.1) st.rot = Math.sin(s * 60) * 6;
    if (n === "dalia") st.y -= Math.sin(Math.PI * seg(s, .5, .85)) * 60 + Math.sin(Math.PI * seg(s, .9, 1.25)) * 45;
    // de noche: se elevan y forman la constelación (coordenadas de pantalla -> mundo)
    if (t > BACK - .2) {
      const p = E.inOut(seg(t, BACK + .2 + k * .08, BACK + 1.6 + k * .08)), cw = camAt(t), [wx, wy] = toWorld(CONST[k][0], CONST[k][1], cw);
      st.x = lerp(st.x, wx, p); st.y = lerp(st.y, wy + Math.sin(t * 1.6 + k) * 6 / cw[2], p); st.size = lerp(st.size, CS / cw[2], p); st.bright = 1 + .25 * p * (.5 + .5 * Math.sin(t * 3 + k));
      // se contraen hacia el isotipo
      const q = E.inCubic(seg(t, 55.0, 55.8)), [cx, cy] = toWorld(W / 2, V ? 860 : 455, cw);
      st.x = lerp(st.x, cx, q); st.y = lerp(st.y, cy, q); st.size *= 1 - .8 * q; st.op = 1 - seg(t, 55.5, 55.85);
    }
    st.z = 3; setAv(n, st);
  });
  resetGestures();
  const cs = s => K(s, [[0, 0], [.3, 1, "outBack"], [.6, 1], [.85, -.15, "inCubic"], [1.15, 0, "outBack"]]), cd = 120 * (cs(t - 7.0) + cs(t - (BACK + .05)));
  [["cTL", -1, -1], ["cTR", 1, -1], ["cBL", -1, 1], ["cBR", 1, 1]].forEach(([id, x, y]) => gset("catalina-" + id, `translate(${x * cd} ${y * cd * .8})`));
  gset("teo-teo", `rotate(${(E.outBack(seg(t, CATCH[7] + .4, CATCH[7] + .9), 1.2) * 360).toFixed(1)} 962 900)`);

  // ----- tarjetas -----
  RELAY.slice(1).forEach((n, i) => { const k = i + 1, el = CARDS[n], a = CATCH[k] + .25, b = THROW[k] - .15, s = t - a;
    if (t < a - .05 || t > b + .35) { el.style.opacity = 0; return; }
    const p = E.outBack(seg(t, a, a + .4), 2), o = 1 - seg(t, b, b + .3), x = V ? X(k) - el.offsetWidth / 2 : X(k) + S * .62, y = V ? GY - S * 1.2 - el.offsetHeight : GY - S * .42 - el.offsetHeight, CK = V ? 1.28 : 1.3;
    css(el, { opacity: (Math.min(1, seg(t, a, a + .15) * 3) * o).toFixed(3), transform: `translate(${x}px,${y}px) scale(${CK * p * (1 - .1 * (1 - o))})` });
    if (n === "sara") el.querySelectorAll(".grid b").forEach((b2, j) => { const q = seg(s, .4 + j * .1, .55 + j * .1); b2.style.background = q > .5 ? ([2, 6, 9, 13].includes(j) ? "#7556D7" : "#B9D7F6") : "#EEF0FA"; b2.style.transform = `scale(${1 + .2 * pulse(s, .4 + j * .1, .2)})`; });
    if (n === "clara") el.querySelectorAll(".bar b").forEach((b2, j) => { const q = E.outCubic(seg(s, .4 + j * .35, 1 + j * .35)); b2.style.width = (q * [62, 74, 58][j]) + "%"; el.querySelectorAll(".ok")[j].style.opacity = seg(s, 1 + j * .35, 1.15 + j * .35); });
    if (n === "alma") { const br = el.querySelector(".br"), q = K(s, [[.5, 1], [1.2, 1.3, "inOutSine"], [1.9, .9, "inOutSine"], [2.6, 1.3, "inOutSine"], [3.3, 1, "inOutSine"]]); br.style.transform = `scale(${q})`; }
    if (n === "dalia") el.querySelectorAll(".ok").forEach((o2, j) => { o2.style.opacity = seg(s, .5 + j * .32, .6 + j * .32); });
    if (n === "teo") el.querySelector(".rec").style.opacity = Math.sin(t * 6) > 0 ? 1 : .2;
  });

  // ----- pelota de luz -----
  const bp = ballAt(t), bOn = bp && t < BACK + .3;
  if (bOn) { css(ball, { opacity: (1 - seg(t, BACK, BACK + .3)).toFixed(3), transform: `translate(${bp[0]}px,${bp[1]}px) scale(${bp[2] / Math.min(1, c[2] * 1.4)})` });
    css(ballSmile, { opacity: ball.style.opacity, transform: `translate(${bp[0] - 35}px,${bp[1] - 8}px) scale(${bp[2] / Math.min(1, c[2] * 1.4)})` });
    trail.forEach((d, j) => { const q = ballAt(t - (j + 1) * .035); if (!q) { d.style.opacity = 0; return; } css(d, { opacity: (.5 * (1 - j / 6)).toFixed(3), transform: `translate(${q[0]}px,${q[1]}px) scale(${(1.6 - j * .2) / Math.min(1, c[2] * 1.4)})` }); });
  } else { ball.style.opacity = 0; ballSmile.style.opacity = 0; trail.forEach(d => d.style.opacity = 0); }

  // ----- constelación -----
  const lp = seg(t, BACK + 2.2, BACK + 3.2) * (1 - seg(t, 54.8, 55.3));
  [...cLines.children].forEach((l, i) => { const [a, b] = LINES[i], q = seg(lp, i / LINES.length * .6, i / LINES.length * .6 + .4);
    const [x1, y1] = CONST[a], [x2, y2] = CONST[b]; l.setAttribute("x1", x1); l.setAttribute("y1", y1); l.setAttribute("x2", lerp(x1, x2, q)); l.setAttribute("y2", lerp(y1, y2, q)); l.setAttribute("opacity", (q > 0 ? .7 : 0) * (1 - seg(t, 54.8, 55.3))); });
  hl3(t, 51.8, 54.7, V ? 1580 : 960, V ? 64 : 56, { color: "#fff" });

  // ----- el isotipo vuelve; nuevo día; logotipo -----
  if (t >= 55) { const p = E.outBack(seg(t, 55.5, 56.1), 1.8), hb = 1 + pulse(t, 56.3, .22) * .08 + pulse(t, 56.52, .22) * .05, q = E.inOut(seg(t, 57.0, 57.85));
    const c0 = [W / 2, V ? 860 : 455], w0 = (V ? 520 : 440) * p * hb;
    iso(lerp(c0[0], LOCK.ISO.cx, q), lerp(c0[1], LOCK.ISO.cy, q) - Math.sin(Math.PI * q) * 40, lerp(w0, LOCK.ISO.w, q), { glow: .9 * (1 - seg(t, 56, 57)) });
  }
  LOCK.render(t, 57.0);
  $("#flash").style.opacity = (.35 * pulse(t, 55.75, .4)).toFixed(3);
}
boot(render, DUR, MUSIC3.render);
})();
