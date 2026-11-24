// ============================================================================
//  GUION 4 · "Arquitectura LEGO" — reel comercial B2B · 45 s
//  El ecosistema se arma en vivo: servicios como bloques que encajan en una app
//  de marca blanca, se integra con el cliente, atiende y entrega datos.
// ============================================================================
(() => {
const DUR = 45;
$("#ui div:nth-child(2)").textContent = "Arquitectura LEGO · Medismart";
NAMES.forEach(n => setAv(n, null));
css(isoWrap, { opacity: 0 }); stage.insertBefore(isoWrap, hud);   // el isotipo vive fuera de la cámara
$("#sub").textContent = "Ecosistema digital de salud";

// ---------- layout ----------
const L = V ? {
  ph: { cx: 540, cy: 1250, w: 420, h: 840 }, colP: 128, rowP: 160,
  ring: [540, 1250, 330, 380], tx: 60, tw: 960, align: "center",
  hY: 250, hS: 80, sY: 480, sS: 38, h6Y: 230, s6Y: 440,
  nodes: [[170, 930], [910, 930], [170, 1580], [910, 1580]],
  dash: { x: 70, y: 840, w: 940, h: 780 }, iso: [540, 860, 480],
  lock: { logoW: 860, logoY: 690, tagY: 990, subY: 1330 },
} : {
  ph: { cx: 1380, cy: 540, w: 400, h: 800 }, colP: 120, rowP: 150,
  ring: [1430, 500, 350, 280], tx: 140, tw: 820, align: "left",
  hY: 330, hS: 78, sY: 560, sS: 38, h6Y: 110, s6Y: 285,
  nodes: [[1010, 250], [1010, 830], [1760, 250], [1760, 830]],
  dash: { x: 140, y: 400, w: 820, h: 600 }, iso: [960, 470, 420],
  lock: { logoW: 940, logoY: 330, tagY: 600, subY: 800 },
};
const P = L.ph, pTop = P.cy - P.h / 2, pLeft = P.cx - P.w / 2, HEAD = 112;

addStyle(`.tile{position:absolute;left:0;top:0;width:150px;margin-left:-75px;display:flex;flex-direction:column;align-items:center;gap:10px;transform-origin:50% 40%}
.tile .sq{width:150px;height:150px;border-radius:38px;display:grid;place-items:center;box-shadow:0 18px 40px rgba(60,60,170,.28),inset 0 2px 0 rgba(255,255,255,.45)}
.tile .sq svg{width:78px;height:78px}
.tile b{font-size:26px;font-weight:800;color:#030C43;white-space:nowrap}
.phone{position:absolute;box-sizing:border-box;border:14px solid #0B0E24;border-radius:64px;background:#fff;overflow:hidden;box-shadow:0 40px 90px rgba(3,12,67,.28)}
.phone .hd{position:absolute;left:0;right:0;top:0;height:${HEAD}px;display:flex;align-items:center;gap:14px;padding:26px 24px 0;box-sizing:border-box;color:#fff;font-weight:800;font-size:22px}
.phone .chip{background:#fff;border-radius:999px;padding:6px 14px;font-weight:900;font-size:18px;letter-spacing:1px}
.phone .nav{position:absolute;left:0;right:0;bottom:0;height:70px;border-top:2px solid #EEF0FA;display:flex;justify-content:space-around;align-items:center}
.phone .nav i{width:26px;height:26px;border-radius:9px;background:#E3E6F6}
.scr{position:absolute;left:0;right:0;top:${HEAD}px;bottom:70px;padding:20px 18px;box-sizing:border-box;display:flex;flex-direction:column;gap:12px;background:#F7F8FE}
.bub{max-width:82%;padding:12px 16px;border-radius:20px;font-size:21px;font-weight:700;line-height:1.25}
.bub.ai{background:#fff;color:#030C43;box-shadow:0 6px 16px rgba(3,12,67,.08);border-bottom-left-radius:6px}
.bub.me{align-self:flex-end;background:linear-gradient(135deg,#7556D7,#3FB4CE);color:#fff;border-bottom-right-radius:6px}
.who{font-size:15px;font-weight:900;color:#7556D7;letter-spacing:1px}
.node{position:absolute;left:0;top:0;background:#fff;border-radius:999px;padding:16px 28px;font-weight:900;color:#030C43;box-shadow:0 14px 34px rgba(3,12,67,.14);white-space:nowrap;display:flex;align-items:center;gap:12px}
.node i{width:16px;height:16px;border-radius:50%;background:linear-gradient(135deg,#7556D7,#3FD3DE)}
.sub{position:absolute;left:0;top:0;font-weight:700;color:#4A4F6D;line-height:1.3}
.chips{position:absolute;left:0;top:0;display:flex;gap:16px}
.chips span{background:#fff;border-radius:999px;padding:12px 24px;font-weight:900;color:#030C43;box-shadow:0 10px 26px rgba(3,12,67,.12)}
.dash{position:absolute;background:#fff;border-radius:34px;box-shadow:0 30px 70px rgba(3,12,67,.16);padding:34px 38px;box-sizing:border-box;color:#030C43}
.dash .tt{display:flex;align-items:center;gap:12px;font-weight:900;font-size:30px}.dash .tt i{width:14px;height:14px;border-radius:50%;background:#FF4D6D}
.dash .tt small{margin-left:auto;font-size:18px;color:#5A5F7D;font-weight:800;letter-spacing:2px}
.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:18px}
.kpis div{background:#F4F5FC;border-radius:20px;padding:16px 18px}.kpis b{display:block;font-size:44px;font-weight:900;line-height:1.05;background:linear-gradient(135deg,#7556D7,#2FC7D6);-webkit-background-clip:text;background-clip:text;color:transparent}
.kpis span{font-size:18px;font-weight:800;color:#5A5F7D}
.act{display:flex;align-items:center;justify-content:space-between;margin-top:20px;background:#F4F5FC;border-radius:20px;padding:14px 18px;font-weight:800;font-size:22px}
.act .btn{border-radius:999px;padding:12px 22px;font-weight:900;color:#fff;background:linear-gradient(135deg,#7556D7,#3FB4CE);white-space:nowrap}
.bigN{position:absolute;left:0;top:0;width:${W}px;text-align:center;font-weight:900;line-height:1;font-variant-numeric:tabular-nums;background:linear-gradient(135deg,#7556D7,#529DE8 55%,#2FC7D6);-webkit-background-clip:text;background-clip:text;color:transparent;padding:0 0 .1em}
.type{position:absolute;left:0;top:0;width:${W}px;padding:0 ${V ? 70 : 200}px;box-sizing:border-box;text-align:center;font-weight:900;color:#030C43;letter-spacing:-1.5px;line-height:1.08}
.type .cur{display:inline-block;width:.08em;height:.9em;background:#7556D7;margin-left:.06em;vertical-align:-.08em}`);

// ---------- textos ----------
const front = el => { stage.insertBefore(el, $("#flash")); return el; };
const HL = (html) => headline(front(mk("div", "headline", stage)), html);
const SUB = html => front(mk("div", "sub", stage, { fontSize: L.sS + "px", width: L.tw + "px", textAlign: L.align }, html));
const showSub = (el, t, t0, t1, y) => { const p = E.outCubic(seg(t, t0, t0 + .5)), o = 1 - seg(t, t1, t1 + .4); css(el, { opacity: (Math.min(p, o)).toFixed(3), transform: `translate(${L.tx}px,${y + (1 - p) * 20 - (1 - o) * 20}px)` }); };
const left = { left: L.tx + "px", width: L.tw + "px", textAlign: L.align, padding: "0", textWrap: "balance" };

const typeEl = front(mk("div", "type", stage, { fontSize: (V ? 88 : 92) + "px" }));
const Q1 = "¿Y si tu plan de salud se armara ", Q2 = "en minutos?";
const h2 = HL(`Elige entre más de <span class="gt">120 servicios.</span>`), s2 = SUB("Salud física, mental, crónica, preventiva… y hasta mascotas.");
const h3 = HL(`Tu marca.${V ? " " : "<br>"}<span class="gt">Tu ecosistema.</span>`), s3 = SUB("Marca blanca y multirresponsiva, lista para tus usuarios.");
const h4 = HL(`Se integra con <span class="gt">tus sistemas.</span>`), s4 = SUB("SDK multi-API para aseguradoras, clínicas, empresas y corredores.");
const h5 = HL(`Atención donde <span class="gt">tus usuarios están.</span>`);
const chips = front(mk("div", "chips", stage, { fontSize: (V ? 34 : 30) + "px" }, "<span>App</span><span>Teléfono</span><span>WhatsApp</span>"));
const big90 = front(mk("div", "bigN", stage, { fontSize: (V ? 260 : 230) + "px", width: L.tw + "px", textAlign: L.align }, "90 %"));
const s5 = SUB("de las atenciones comienzan en <b style=\"color:#030C43\">menos de 10 minutos.</b>");
const h6 = HL(`Datos en vivo, <span class="gt">decisiones a un clic.</span>`), s6 = SUB("Monitorea la experiencia de tus usuarios y controla la siniestralidad.");
const bigUsers = front(mk("div", "bigN", stage, { fontSize: (V ? 170 : 200) + "px" }));
const s7 = front(mk("div", "sub", stage, { fontSize: (V ? 44 : 44) + "px", width: W + "px", textAlign: "center", color: "#030C43", fontWeight: 900 }, "personas ya usan Medismart"));

// ---------- bloques de servicios ----------
const IC = {
  tele: '<rect x="6" y="18" width="34" height="28" rx="7"/><path d="M40 28 56 19v26l-16-9z"/>',
  mente: '<path d="M32 53C10 39 5 26 13 17c6-6 14-5 19 2 5-7 13-8 19-2 8 9 3 22-19 36z"/>',
  cron: '<g transform="rotate(-40 32 32)"><rect x="8" y="22" width="48" height="20" rx="10"/><path d="M32 22v20"/></g>',
  pet: '<g fill="#fff" stroke="none"><ellipse cx="32" cy="42" rx="12" ry="10"/><circle cx="16" cy="28" r="6"/><circle cx="26" cy="17" r="6"/><circle cx="38" cy="17" r="6"/><circle cx="48" cy="28" r="6"/></g>',
  well: '<path d="M12 52C12 25 30 12 54 10c0 26-16 42-42 42zM12 52l22-22"/>',
  lab: '<path d="M24 8h16M27 8v18L13 50c-2 4 0 7 4 7h30c4 0 6-3 4-7L37 26V8M18 42h28"/>',
  rx: '<rect x="13" y="7" width="38" height="50" rx="7"/><path d="M22 21h20M22 31h20M22 41h12"/>',
  aida: '<path d="M9 12h46v30H31L18 53V42H9z"/><path d="M23 26q9 9 18 0"/>',
};
const SERV = [["tele", "Telemedicina"], ["aida", "AIDA"], ["mente", "Salud mental"], ["cron", "Crónicos"], ["lab", "Exámenes"], ["rx", "Recetas"], ["well", "Bienestar"], ["pet", "Mascotas"]];
const GR = ["linear-gradient(135deg,#7556D7,#529DE8)", "linear-gradient(135deg,#529DE8,#3FD3DE)", "linear-gradient(135deg,#8A5BE0,#5A8FE0)", "linear-gradient(135deg,#4C86DE,#2FC7D6)"];
const tiles = SERV.map(([ic, lb], k) => mk("div", "tile", null, {}, `<div class="sq" style="background:${GR[k % 4]}"><svg viewBox="0 0 64 64" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${IC[ic]}</svg></div><b>${lb}</b>`));
const more = mk("div", "tile", null, {}, `<div class="sq" style="background:#EEF0FA;box-shadow:none"><span style="font:900 44px MulishR,system-ui;color:#7556D7">+112</span></div><b>y más</b>`);
const ringPos = k => { const [cx, cy, rx, ry] = L.ring, a = -Math.PI / 2 + k * Math.PI * 2 / 8; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; };
const slot = k => [P.cx + ((k % 3) - 1) * L.colP, pTop + 14 + HEAD + 40 + 48 + Math.floor(k / 3) * L.rowP];
const TS = 96 / 150;

// ---------- teléfono ----------
const lines = mk("div", "", null, { position: "absolute", left: 0, top: 0 }, `<svg width="${W}" height="${H}" overflow="visible" id="links"></svg>`);
const phone = mk("div", "phone", null, { left: pLeft + "px", top: pTop + "px", width: P.w + "px", height: P.h + "px" },
  `<div class="hd"><span class="chip">TU LOGO</span><span>Hola, Ana</span></div><div class="nav"><i></i><i></i><i></i><i></i></div>
   <div class="scr" id="chat"><div class="who">AIDA · CONCIERGE</div><div class="bub ai">Hola, Ana. ¿Cómo te sientes hoy?</div><div class="bub me">Tengo fiebre desde ayer.</div><div class="bub ai">Te oriento y te conecto con un médico ahora mismo.</div></div>
   <div class="scr" id="video" style="padding:0;background:linear-gradient(160deg,#2B3AA8,#1A8BDC)">
     <div style="position:absolute;left:50%;top:32%;width:120px;height:120px;margin:-60px;border-radius:50%;background:#EAF2FF"></div>
     <div style="position:absolute;left:50%;top:58%;width:230px;height:150px;margin-left:-115px;border-radius:115px 115px 0 0;background:#EAF2FF"></div>
     <div style="position:absolute;left:18px;top:18px;background:rgba(255,255,255,.92);border-radius:999px;padding:8px 16px;font-weight:900;font-size:18px;color:#030C43;display:flex;gap:8px;align-items:center"><i style="width:10px;height:10px;border-radius:50%;background:#20B07A;display:block"></i>Médico en línea</div>
     <div id="vt" style="position:absolute;right:18px;top:18px;color:#fff;font-weight:900;font-size:20px">00:00</div>
     <div style="position:absolute;left:0;right:0;bottom:22px;display:flex;justify-content:center;gap:18px"><i style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.25);display:block"></i><i style="width:56px;height:56px;border-radius:50%;background:#FF4D6D;display:block"></i><i style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.25);display:block"></i></div>
   </div>`);
cam.appendChild(lines); cam.appendChild(phone); tiles.forEach(e => cam.appendChild(e)); cam.appendChild(more);
const hd = phone.querySelector(".hd"), chat = G("chat"), video = G("video"), vt = G("vt"), bubs = [...chat.children];
const BRAND = ["#7556D7", "#E0565B", "#13A57A", "#2F6FE0"];
const hexMix = (a, b, p) => { const A = [1, 3, 5].map(i => parseInt(a.substr(i, 2), 16)), B = [1, 3, 5].map(i => parseInt(b.substr(i, 2), 16)); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], p))).join(",")})`; };

// integraciones
const NODES = ["Aseguradoras", "Clínicas", "Empresas", "Corredores"].map(n => mk("div", "node", null, { fontSize: (V ? 30 : 28) + "px" }, `<i></i>${n}`));
const links = G("links"), LK = L.nodes.map(([nx, ny]) => { const ex = nx < P.cx ? pLeft : pLeft + P.w, ey = clamp(ny, pTop + 80, pTop + P.h - 80);
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path"); p.setAttribute("d", `M${nx} ${ny} C ${(nx + ex) / 2} ${ny}, ${(nx + ex) / 2} ${ey}, ${ex} ${ey}`);
  p.setAttribute("fill", "none"); p.setAttribute("stroke", "#9DB7F0"); p.setAttribute("stroke-width", "5"); p.setAttribute("stroke-linecap", "round"); links.appendChild(p);
  const dots = [0, 1, 2].map(() => { const c = document.createElementNS("http://www.w3.org/2000/svg", "circle"); c.setAttribute("r", "9"); c.setAttribute("fill", "#7556D7"); links.appendChild(c); return c; });
  return { p, len: p.getTotalLength(), dots }; });

// panel de datos
const D = L.dash, dash = mk("div", "dash", null, { left: D.x + "px", top: D.y + "px", width: D.w + "px", height: D.h + "px" },
  `<div class="tt"><i></i>Panel de experiencia<small>EN VIVO</small></div>
   <svg viewBox="0 0 700 210" style="width:100%;height:${V ? 240 : 190}px;margin-top:14px;display:block" preserveAspectRatio="none">
     <g stroke="#EEF0FA" stroke-width="2"><path d="M0 52H700M0 104H700M0 156H700"/></g>
     <path id="area" d="M0 180 C80 170 120 150 180 140 S300 120 360 96 S480 80 540 60 S640 40 700 30 V210 H0Z" fill="url(#ag)" opacity=".35"/>
     <defs><linearGradient id="ag" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#529DE8"/><stop offset="1" stop-color="#529DE8" stop-opacity="0"/></linearGradient>
     <linearGradient id="lg4" x1="0" x2="1"><stop offset="0" stop-color="#7556D7"/><stop offset="1" stop-color="#2FC7D6"/></linearGradient></defs>
     <path id="line" d="M0 180 C80 170 120 150 180 140 S300 120 360 96 S480 80 540 60 S640 40 700 30" fill="none" stroke="url(#lg4)" stroke-width="7" stroke-linecap="round"/>
   </svg>
   <div class="kpis"><div><b data-v="88" data-s=" %">0 %</b><span>NPS</span></div><div><b data-v="85" data-s=" %" data-p="+">0 %</b><span>Resolutividad</span></div><div><b data-v="75" data-s=" %">0 %</b><span>Agenda en 24 h</span></div></div>
   <div class="act"><span>Programa de crónicos</span><span class="btn">Activar</span></div>`);
const cline = dash.querySelector("#line"), clen = cline.getTotalLength(), area = dash.querySelector("#area"), kp = [...dash.querySelectorAll(".kpis b")], abtn = dash.querySelector(".act .btn");
cline.style.strokeDasharray = clen;
const cursor = mk("div", "", null, { position: "absolute", left: 0, top: 0 }, `<svg width="44" height="56" viewBox="0 0 44 56"><path d="M4 4 L4 46 L15 36 L23 53 L31 49 L23 33 L38 33 Z" fill="#030C43" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>`);

// usuarios: nube de puntos
const cv = front(mk("canvas", "", stage, { position: "absolute", left: 0, top: 0 })); cv.width = W; cv.height = H; const cx2 = cv.getContext("2d");
const NDOT = 1400, DCOL = ["#7556D7", "#529DE8", "#3FD3DE", "#8A5BE0"];

const lock = logoLockup({ ...L.lock, html: `<div style="font-size:${V ? 70 : 64}px;font-weight:900;letter-spacing:-1px;line-height:1.1"><span class="gt">Armemos el tuyo.</span></div>
<div style="font-size:${V ? 34 : 30}px;font-weight:700;color:#4A4F6D;margin-top:${V ? 26 : 18}px;line-height:1.35">+120 servicios · Marca blanca${V ? "<br>" : " · "}Integración multi-API</div>` });

// ============================================================================
function render(t) {
  t = clamp(t, 0, DUR);
  camera(W / 2, H / 2, 1 + .015 * Math.sin(t * .35));
  background(t, 1);

  // ----- 1 · la pregunta se escribe (0–5) -----
  { const n = Math.floor(seg(t, .5, 3.4) * (Q1.length + Q2.length)), a = Q1.slice(0, n), b = Q2.slice(0, Math.max(0, n - Q1.length));
    const html = `${a}<span class="gt">${b}</span><span class="cur" style="opacity:${(t < 3.4 || Math.sin(t * 9) > 0) ? 1 : 0}"></span>`;
    if (typeEl._h !== html) { typeEl.innerHTML = html; typeEl._h = html; }
    const o = 1 - seg(t, 4.7, 5.1); css(typeEl, { opacity: (seg(t, .3, .5) * o).toFixed(3), transform: `translateY(${(V ? 760 : 400) - (1 - o) * 40}px) scale(${1 + .04 * E.outBack(seg(t, 3.4, 3.8), 3) * (1 - seg(t, 3.8, 4.2))})` }); }

  // ----- 2 · caen los bloques (5–11) / 3 · encajan en la app (11–17) -----
  const phOn = E.outBack(seg(t, 10.7, 11.3), 1.6), phOff = seg(t, 37.0, 37.5) + (V ? seg(t, 29.9, 30.4) : 0);
  css(phone, { opacity: (seg(t, 10.7, 10.95) * (1 - Math.min(1, phOff))).toFixed(3), transform: `scale(${(.85 + .15 * phOn) * (1 - .1 * Math.min(1, phOff))})` });
  tiles.concat([more]).forEach((el, k) => { const isMore = k === 8, a = 5.4 + k * .55;
    let x, y, s = 1, op = 1, rot = 0;
    if (isMore) { const [sx, sy] = slot(8), p = E.outBack(seg(t, 13.0, 13.4), 2.4); x = sx; y = sy; s = TS * p; op = seg(t, 13.0, 13.15); }
    else { const [rx, ry] = ringPos(k), p = seg(t, a, a + .6), f = Math.sin((t + k) * 2) * 8;
      x = rx; y = lerp(ry - 520, ry, E.outBack(p, 1.3)) + f * (p >= 1 ? 1 : 0); op = seg(t, a, a + .12); rot = (1 - E.outCubic(p)) * (k % 2 ? 18 : -18);
      const q = seg(t, 11.4 + k * .18, 11.95 + k * .18), e = E.inOut(q), [sx, sy] = slot(k);
      x = lerp(x, sx, e); y = lerp(y, sy, e) - Math.sin(Math.PI * q) * 60; s = lerp(1, TS, e) * (1 + .12 * pulse(t, 11.95 + k * .18, .2)); rot *= 1 - e; }
    op *= 1 - seg(t, 22.8, 23.2);
    css(el, { opacity: op.toFixed(3), transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${rot.toFixed(1)}deg) scale(${s.toFixed(3)})`, zIndex: 5 }); });
  // marca blanca: el encabezado cambia de marca
  { const sw = [14.0, 15.0, 16.0], i = sw.filter(x => t >= x).length, p = i ? seg(t, sw[i - 1], sw[i - 1] + .3) : 1;
    const cur = BRAND[Math.min(i, 3)], prev = BRAND[Math.max(0, i - 1)]; hd.style.background = i ? hexMix(prev, cur, p) : BRAND[0];
    hd.querySelector(".chip").style.color = hd.style.background; hd.querySelector(".chip").style.transform = `scale(${1 + .18 * (i ? pulse(t, sw[i - 1], .3) : 0)})`; }

  h2(t, 5.6, 10.4, L.hY, L.hS, left); showSub(s2, t, 6.4, 10.4, L.sY);
  h3(t, 11.5, 16.6, L.hY, L.hS, left); showSub(s3, t, 12.2, 16.6, L.sY);

  // ----- 4 · integraciones (17–23) -----
  NODES.forEach((el, i) => { const [nx, ny] = L.nodes[i], a = 17.3 + i * .25, p = E.outBack(seg(t, a, a + .4), 2.4), o = 1 - seg(t, 22.7, 23.1);
    css(el, { opacity: (seg(t, a, a + .1) * o).toFixed(3), transform: `translate(${nx - el.offsetWidth / 2}px,${ny - el.offsetHeight / 2}px) scale(${p})` }); });
  LK.forEach(({ p, len, dots }, i) => { const a = 17.6 + i * .25, d = E.inOut(seg(t, a, a + .6)), o = 1 - seg(t, 22.7, 23.1);
    p.setAttribute("stroke-dasharray", len); p.setAttribute("stroke-dashoffset", (len * (1 - d)).toFixed(1)); p.setAttribute("opacity", o.toFixed(3));
    dots.forEach((c, j) => { const q = ((t - a - .6) * .7 + j / 3) % 1, on = t > a + .6 && o > 0; const pt = p.getPointAtLength((i % 2 ? 1 - q : q) * len);
      c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y); c.setAttribute("opacity", on ? (o * Math.sin(Math.PI * q)).toFixed(3) : 0); }); });
  h4(t, 17.4, 22.6, L.hY, L.hS, left); showSub(s4, t, 18.1, 22.6, L.sY);

  // ----- 5 · atención: AIDA orienta y deriva (23–30) -----
  css(chat, { opacity: (seg(t, 23.0, 23.3) * (1 - seg(t, 27.2, 27.5))).toFixed(3) });
  bubs.forEach((b, i) => { const a = [23.2, 23.6, 24.8, 26.0][i], p = E.outBack(seg(t, a, a + .35), 2); css(b, { opacity: seg(t, a, a + .12).toFixed(3), transform: `translateY(${(1 - p) * 18}px) scale(${.9 + .1 * p})`, transformOrigin: i === 2 ? "100% 100%" : "0 100%" }); });
  css(video, { opacity: (seg(t, 27.2, 27.5) * (1 - seg(t, 37.0, 37.3))).toFixed(3), transform: `translateY(${(1 - E.outCubic(seg(t, 27.2, 27.7))) * 60}px)` });
  { const s = Math.max(0, Math.floor((t - 27.5) * 1)); vt.textContent = `00:${String(Math.min(59, s)).padStart(2, "0")}`; }
  h5(t, 23.3, 26.4, L.hY, L.hS, left);
  { const p = E.outBack(seg(t, 24.0, 24.45), 2), o = 1 - seg(t, 26.4, 26.8); css(chips, { opacity: (seg(t, 24.0, 24.15) * o).toFixed(3), transform: `translate(${V ? (W - chips.offsetWidth) / 2 : L.tx}px,${L.sY}px) scale(${p})`, transformOrigin: V ? "50% 50%" : "0 50%" }); }
  { const p = E.outBack(seg(t, 26.8, 27.3), 2), o = 1 - seg(t, 29.6, 30.0); css(big90, { opacity: (seg(t, 26.8, 26.95) * o).toFixed(3), transform: `translate(${L.tx}px,${L.hY - (V ? 40 : 60)}px) scale(${.6 + .4 * p})`, transformOrigin: V ? "50% 50%" : "0 50%" }); }
  showSub(s5, t, 27.3, 29.6, L.hY + (V ? 230 : 200));

  // ----- 6 · datos en vivo y activación en un clic (30–37) -----
  { const p = E.outBack(seg(t, 30.2, 30.75), 1.5), o = 1 - seg(t, 36.8, 37.3); css(dash, { opacity: (seg(t, 30.2, 30.4) * o).toFixed(3), transform: `translateY(${(1 - p) * 60}px)` });
    cline.style.strokeDashoffset = (clen * (1 - E.inOut(seg(t, 30.7, 32.4)))).toFixed(1); area.setAttribute("opacity", (.35 * seg(t, 31.8, 32.6)).toFixed(3));
    kp.forEach((b, i) => { const q = E.outCubic(seg(t, 31.3 + i * .35, 32.5 + i * .35)); b.textContent = `${b.dataset.p || ""}${Math.round(q * +b.dataset.v)}${b.dataset.s}`; });
    const done = t >= 34.55; abtn.textContent = done ? "Activado ✓" : "Activar"; abtn.style.background = done ? "#20B07A" : ""; abtn.style.transform = `scale(${1 - .1 * pulse(t, 34.45, .2) + .08 * pulse(t, 34.6, .3)})`;
    const bx = D.x + abtn.offsetLeft + abtn.offsetWidth * .5, by = D.y + abtn.offsetTop + abtn.offsetHeight * .6;
    const cp = E.inOut(seg(t, 33.4, 34.3)), sx = D.x + D.w * .55, sy = D.y + D.h * .45;
    css(cursor, { opacity: (seg(t, 33.2, 33.4) * (1 - seg(t, 35.6, 36.0))).toFixed(3), transform: `translate(${lerp(sx, bx, cp)}px,${lerp(sy, by, cp)}px) scale(${1 - .15 * pulse(t, 34.45, .2)})` }); }
  if (!V) { const p = E.inOut(seg(t, 30.0, 30.6)); phone.style.transform += ` translateX(${p * 60}px)`; }
  h6(t, 30.3, 36.6, L.h6Y, V ? 76 : 64, left); showSub(s6, t, 30.9, 36.6, L.s6Y);

  // ----- 7 · +8 MM de personas (37–40.2) -----
  { const p = E.outCubic(seg(t, 37.4, 39.2)), o = 1 - seg(t, 39.7, 40.0), n = Math.round(p * 8e6);
    bigUsers.textContent = "+" + n.toLocaleString("es-CL"); css(bigUsers, { opacity: (seg(t, 37.3, 37.5) * o).toFixed(3), transform: `translateY(${(V ? 760 : 330) + (1 - E.outBack(seg(t, 37.3, 37.8), 2)) * 40}px) scale(${1 + .05 * pulse(t, 39.2, .3)})` });
    css(s7, { opacity: (seg(t, 37.8, 38.2) * o).toFixed(3), transform: `translateY(${V ? 960 : 560}px)` }); }
  { cx2.clearRect(0, 0, W, H); if (t > 37.1 && t < 41) { const [ix, iy] = [L.iso[0], L.iso[1]], conv = E.inCubic(seg(t, 39.6, 40.3));
      for (let i = 0; i < NDOT; i++) { const a0 = 37.2 + hash(i + 1) * 2.2, p = seg(t, a0, a0 + .4); if (p <= 0) continue;
        let x = hash(i + 11) * W, y = hash(i + 29) * H; x += Math.sin(t * .8 + i) * 6; y += Math.cos(t * .7 + i) * 6;
        x = lerp(x, ix, conv); y = lerp(y, iy, conv); const r = (2 + hash(i + 51) * 4) * (1 - .6 * conv);
        cx2.globalAlpha = p * .7 * (1 - seg(t, 40.2, 40.45)); cx2.fillStyle = DCOL[i % 4]; cx2.beginPath(); cx2.arc(x, y, r, 0, 6.2832); cx2.fill(); } } }

  // ----- 8 · isotipo y logotipo (40.2–45) -----
  if (t > 40.1) { const p = E.outBack(seg(t, 40.2, 40.7), 2), hb = 1 + pulse(t, 40.75, .22) * .08 + pulse(t, 40.97, .22) * .05, q = E.inOut(seg(t, 41.2, 42.0));
    const [ix, iy, iw] = L.iso; iso(lerp(ix, lock.ISO.cx, q), lerp(iy, lock.ISO.cy, q) - Math.sin(Math.PI * q) * 40, lerp(iw * p * hb, lock.ISO.w, q), { glow: .8 * (1 - seg(t, 40.6, 41.4)) });
  } else css(isoWrap, { opacity: 0 });
  lock.render(t, 41.0);
  $("#flash").style.opacity = (.35 * pulse(t, 40.25, .35) + .25 * pulse(t, 5.0, .3)).toFixed(3);
}
boot(render, DUR, MUSIC4.render);
})();
