// ============================================================================
//  "Una sola sonrisa" — composición original sintetizada (Web Audio, offline)
//  120 BPM · Re mayor · progresión I–V–vi–IV · 50 s
//  Cada avatar que nace suma una capa: la canción crece con la familia.
// ============================================================================
const MUSIC = (() => {
  const DUR = 75, BPM = 120, B = 60 / BPM, BAR = 4 * B;
  const NOTE = n => { // "F#5" -> Hz
    const m = /^([A-G])(#|b)?(-?\d)$/.exec(n); const base = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 }[m[1]];
    const semi = base + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + (parseInt(m[3]) - 4) * 12;
    return 440 * Math.pow(2, semi / 12);
  };
  // Acordes (2 s c/u): D – A – Bm – G
  const PROG = [
    { root: "D2", pad: ["D3", "F#3", "A3", "E4"], arp: ["D5", "F#5", "A5", "E5"] },
    { root: "A1", pad: ["C#3", "E3", "A3", "B3"], arp: ["C#5", "E5", "A5", "B4"] },
    { root: "B1", pad: ["D3", "F#3", "B3", "C#4"], arp: ["B4", "D5", "F#5", "C#5"] },
    { root: "G1", pad: ["D3", "G3", "B3", "A3"], arp: ["G4", "B4", "D5", "A4"] },
  ];
  const HOOK = [[0, "F#5", 1], [1, "A5", 1], [2, "D6", 1.5], [3.5, "C#6", .5], [4, "E6", 1], [5, "C#6", 1], [6, "A5", 2],
    [8, "B5", 1], [9, "D6", 1], [10, "F#6", 1.5], [11.5, "E6", .5], [12, "D6", 1], [13, "B5", 1], [14, "G5", 1], [15, "A5", 1]];

  // Momentos clave compartidos con la animación
  const AV_T = [8, 14, 20, 26, 32, 38, 44, 50];      // nacimiento de cada avatar
  const IMPACT = AV_T.map((t, i) => t + (i === 0 ? .4 : .35));
  const GLASS = AV_T.map((t, i) => t + (i === 0 ? 1.0 : .8));

  async function render(sr = 44100) {
    const ctx = new OfflineAudioContext(2, Math.ceil(DUR * sr), sr);
    const master = ctx.createGain(); master.gain.value = .9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .18;
    master.connect(comp); comp.connect(ctx.destination);

    // Reverb: respuesta al impulso generada (ruido con caída exponencial)
    const rev = ctx.createConvolver(); {
      const len = sr * 3.2, ir = ctx.createBuffer(2, len, sr);
      for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
      rev.buffer = ir;
    }
    const revIn = ctx.createGain(); revIn.gain.value = .5; revIn.connect(rev); rev.connect(master);
    // Delay estéreo con filtro (para campanas y destellos)
    const dly = ctx.createDelay(1); dly.delayTime.value = B * .75; const fb = ctx.createGain(); fb.gain.value = .32;
    const dlf = ctx.createBiquadFilter(); dlf.type = "lowpass"; dlf.frequency.value = 3800;
    dly.connect(dlf); dlf.connect(fb); fb.connect(dly); const dlyOut = ctx.createGain(); dlyOut.gain.value = .35; dlf.connect(dlyOut); dlyOut.connect(master); dlyOut.connect(revIn);

    // Sidechain simulado: los pads y el bajo "respiran" con el bombo
    const duck = ctx.createGain(); duck.connect(master); duck.connect(revIn);

    const noiseBuf = (() => { const b = ctx.createBuffer(1, sr * 2, sr), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();

    function out(node, pan = 0, send = .2, dest = master) {
      const p = ctx.createStereoPanner(); p.pan.value = pan; node.connect(p); p.connect(dest);
      if (send) { const s = ctx.createGain(); s.gain.value = send; p.connect(s); s.connect(revIn); }
      return p;
    }
    function env(g, t, a, peak, d, sus, rel, end) {
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a);
      g.gain.setTargetAtTime(sus, t + a, d); g.gain.setValueAtTime(sus, end); g.gain.setTargetAtTime(0, end, rel);
    }
    function osc(type, f, t, dur, { gain = .2, a = .005, d = .1, sus = 0, rel = .08, pan = 0, send = .2, detune = 0, dest = master, lp = 0, q = .7, lpEnv = 0 } = {}) {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = detune;
      const g = ctx.createGain(); let n = o;
      if (lp) { const fl = ctx.createBiquadFilter(); fl.type = "lowpass"; fl.Q.value = q; fl.frequency.setValueAtTime(lp + lpEnv, t); if (lpEnv) fl.frequency.setTargetAtTime(lp, t, .08); o.connect(fl); n = fl; }
      n.connect(g); env(g, t, a, gain, d, sus, rel, t + dur); out(g, pan, send, dest);
      o.start(t); o.stop(t + dur + rel * 8 + .1); return o;
    }
    function noise(t, dur, { gain = .2, type = "highpass", f = 6000, q = .7, a = .001, d = .05, pan = 0, send = .1, fTo = 0 } = {}) {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
      if (fTo) fl.frequency.exponentialRampToValueAtTime(fTo, t + dur);
      const g = ctx.createGain(); s.connect(fl); fl.connect(g); env(g, t, a, gain, d, 0, d, t + dur); out(g, pan, send);
      s.start(t, Math.random()); s.stop(t + dur + d * 6 + .1);
    }

    // ---------- Instrumentos ----------
    const kick = (t, v = 1) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(44, t + .12);
      g.gain.setValueAtTime(.95 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .42); o.connect(g); out(g, 0, 0); o.start(t); o.stop(t + .5);
      noise(t, .01, { gain: .12 * v, type: "lowpass", f: 3000, d: .01, send: 0 });
      duck.gain.setValueAtTime(.35, t); duck.gain.setTargetAtTime(1, t + .02, .09); };
    const heart = (t, v = 1) => { const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 180;
      o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(38, t + .16); g.gain.setValueAtTime(1.1 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .5);
      o.connect(f); f.connect(g); out(g, 0, .25); o.start(t); o.stop(t + .6); };
    const clap = (t, v = 1) => { for (let k = 0; k < 3; k++) noise(t + k * .011, .02, { gain: .22 * v, type: "bandpass", f: 1600, q: 1.2, d: k === 2 ? .12 : .01, send: .35 }); };
    const hat = (t, v = 1, open = false) => noise(t, open ? .08 : .02, { gain: .09 * v, f: 8000, d: open ? .09 : .025, pan: .25, send: .05 });
    const bass = (t, n, dur = B * .9, v = 1) => { osc("sawtooth", NOTE(n), t, dur, { gain: .22 * v, a: .005, d: .12, sus: .6, rel: .06, lp: 280, lpEnv: 900, q: 4, send: 0, dest: duck });
      osc("sine", NOTE(n), t, dur, { gain: .3 * v, a: .005, d: .2, sus: .8, rel: .06, send: 0, dest: duck }); };
    const pad = (t, notes, dur, v = 1, bright = 1400) => notes.forEach((n, i) => [-9, 0, 9].forEach((dt, j) =>
      osc("sawtooth", NOTE(n), t, dur, { gain: .035 * v, a: .6, d: .5, sus: .035 * v, rel: .9, lp: bright, detune: dt, pan: (j - 1) * .5, send: .45, dest: duck })));
    const pluck = (t, n, v = 1, pan = 0) => { osc("square", NOTE(n), t, .12, { gain: .07 * v, a: .002, d: .07, sus: 0, rel: .1, lp: 900, lpEnv: 3200, q: 2, pan, send: .3 });
      const o = osc("triangle", NOTE(n), t, .1, { gain: .05 * v, d: .1, pan: -pan, send: .2 }); };
    const bell = (t, n, v = 1, pan = 0, dl = true) => { const f = NOTE(n);
      osc("sine", f, t, .02, { gain: .16 * v, a: .002, d: .02, sus: .16 * v, rel: 1.1, pan, send: .5 });
      osc("sine", f * 2.76, t, .02, { gain: .05 * v, a: .002, d: .02, sus: .05 * v, rel: .35, pan, send: .3 });
      osc("triangle", f * 2, t, .02, { gain: .03 * v, a: .002, d: .02, sus: .03 * v, rel: .5, pan, send: .3 });
      if (dl) { const g = ctx.createGain(); g.gain.value = .5; const o = ctx.createOscillator(); o.frequency.value = f; const e = ctx.createGain(); env(e, t, .002, .12 * v, .02, .12 * v, .5, t + .02); o.connect(e); e.connect(g); g.connect(dly); o.start(t); o.stop(t + 3); } };
    const ooh = (t, n, dur, v = 1) => { const f = NOTE(n); [0, 1].forEach(k => { const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f * (k ? 1.003 : 1);
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 5.2; lg.gain.value = f * .006; lfo.connect(lg); lg.connect(o.frequency);
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 820; bp.Q.value = 1.4; const g = ctx.createGain();
      o.connect(bp); bp.connect(g); env(g, t, .35, .16 * v, .3, .14 * v, .5, t + dur); out(g, k ? .35 : -.35, .6, duck); o.start(t); lfo.start(t); o.stop(t + dur + 3); lfo.stop(t + dur + 3); }); };
    const blip = (t, v = 1) => { osc("sine", NOTE("E6"), t, .05, { gain: .14 * v, d: .05, rel: .05, send: .25, pan: .3 }); osc("sine", NOTE("B6"), t + .085, .07, { gain: .14 * v, d: .07, rel: .08, send: .3, pan: .3 }); };
    const pop = (t, v = 1) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(1100, t); o.frequency.exponentialRampToValueAtTime(160, t + .07);
      g.gain.setValueAtTime(.35 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .14); o.connect(g); out(g, 0, .3); o.start(t); o.stop(t + .2); noise(t, .008, { gain: .2 * v, f: 2500, d: .01 }); };
    const chime = (t, notes, step = .06, v = 1) => notes.forEach((n, i) => bell(t + i * step, n, v * (.8 + i * .08), (i % 2 ? .3 : -.3), false));
    const whoosh = (t, dur, up = true, v = 1) => noise(t, dur, { gain: .16 * v, type: "bandpass", f: up ? 400 : 5000, fTo: up ? 7000 : 300, q: 1.6, a: dur * .8, d: .15, send: .4 });
    const boing = (t, v = 1) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(660, t + .18);
      const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 18; lg.gain.value = 40; l.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(.0, t); g.gain.linearRampToValueAtTime(.2 * v, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + .45); o.connect(g); out(g, 0, .3); o.start(t); l.start(t); o.stop(t + .5); l.stop(t + .5); };
    const crash = (t, v = 1) => noise(t, .05, { gain: .14 * v, f: 5000, d: .9, send: .5 });
    const shutter = t => { noise(t, .015, { gain: .5, type: "bandpass", f: 3200, q: 2, d: .012, send: .1 }); noise(t + .07, .02, { gain: .35, type: "bandpass", f: 2200, q: 2, d: .02, send: .2 }); };
    const tom = (t, f, v = 1) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(f * 1.6, t); o.frequency.exponentialRampToValueAtTime(f, t + .08);
      g.gain.setValueAtTime(.45 * v, t); g.gain.exponentialRampToValueAtTime(.001, t + .3); o.connect(g); out(g, 0, .3); o.start(t); o.stop(t + .35); };

    // ---------- Arreglo ----------
    const chordAt = t => PROG[Math.floor((t - 8) / BAR + 400) % 4];

    // Intro (0–4): pad que respira + caja de música + latido
    pad(.0, ["D3", "A3", "E4", "F#4"], 3.6, .75, 900);
    ["A5", "D6", "F#6", "E6", "A6", "F#6"].forEach((n, i) => bell(.45 + i * .38, n, .55, i % 2 ? .4 : -.4));
    heart(3.0); heart(3.22, .7);

    // Sonrisa que se despega (4–6): boing, risita, subida
    boing(4.05); [4.7, 4.86, 5.02].forEach((t, i) => osc("sine", NOTE(["A5", "C#6", "E6"][i]), t, .05, { gain: .12, d: .05, rel: .05, send: .3 }));
    whoosh(4.9, 1.1, true, 1.1);
    pad(4.0, ["D3", "F#3", "A3", "E4"], 4.0, .7, 1100);
    // Explosión de chispas (6.0): pop + 8 campanas
    pop(6.0, 1.3); crash(6.0, .7);
    ["D6", "E6", "F#6", "A6", "B6", "D7", "E7", "F#7"].forEach((n, i) => bell(6.02 + i * .07, n, .5, (i - 3.5) / 4));
    for (let t = 6.5; t < 8; t += B) hat(t + B / 2, .6);
    whoosh(7.4, .6, true, .8);

    // Groove (8–33): cada avatar suma una capa
    for (let t = 8; t < 61.5 - 1e-6; t += B) {
      const beat = Math.round((t - 8) / B), inBar = beat % 4, ch = chordAt(t), sec = t;
      kick(t, inBar === 0 ? 1 : .85);
      if (inBar === 1 || inBar === 3) clap(t, .9);
      if (sec >= AV_T[1]) { hat(t + B / 2, 1, (beat % 8) === 7); hat(t + B / 4, .35); }          // Teo: precisión rítmica
      if (inBar === 0) pad(t, ch.pad, BAR * .98, sec >= AV_T[3] ? 1.0 : .8, sec >= 57 ? 2200 : 1500);  // Catalina: el abrazo armónico
      // bajo: corcheas desde Catalina; octavas saltarinas desde Dalia
      const r = ch.root, up = r.replace(/\d/, d => +d + 1);
      bass(t, r, B * .45, .9); bass(t + B / 2, sec >= AV_T[5] ? up : r, B * .4, .7);
      if (sec >= AV_T[2]) ch.arp.forEach((n, k) => pluck(t + k * B / 4, n, .8, k % 2 ? .35 : -.35)); // Sara: orden en semicorcheas
      if (sec >= AV_T[3] && inBar === 0) ooh(t, ch.pad[2].replace(/\d/, d => +d + 1), BAR * .95, .9); // Alma: voz que respira
      if (sec >= AV_T[6] && inBar === 2) blip(t + B * .5, .7);                                       // Lia: notificaciones
      if (sec >= AV_T[7]) [0, 1, 2].forEach(k => bell(t + k * B / 3, ch.arp[(beat + k) % 4].replace(/\d/, d => +d + 1), .25, (k - 1) * .5, false)); // Clara: brillo
    }
    // Noelia: la melodía (gancho) desde 21; doblada en el coro (33–37.5)
    for (let c = 8; c < 61.5; c += 8) HOOK.forEach(([b, n, d]) => { const t = 8 + (c - 8) + b * B; if (t >= AV_T[4] && t < 61.4) { bell(t, n, t >= 57 ? .85 : .65, 0); if (t >= 57) osc("triangle", NOTE(n) / 2, t, d * B * .9, { gain: .05, a: .02, d: .2, sus: .04, rel: .2, send: .3 }); } });

    // Firmas sonoras de cada nacimiento: impacto + cristalización
    IMPACT.forEach((t, i) => { pop(t, .9); whoosh(t - .3, .3, false, .5); });
    const GL = [["D6", "F#6", "A6"], ["A5", "E6", "A6"], ["B5", "F#6", "B6"], ["G5", "D6", "G6"], ["D6", "A6", "D7"], ["A5", "C#6", "E6"], ["E6", "B6", "E7"], ["F#6", "A6", "C#7"]];
    GLASS.forEach((t, i) => { chime(t, GL[i], .055, .7); noise(t, .4, { gain: .05, f: 9000, a: .2, d: .2, send: .5 }); });

    // Gesto de cada uno (acentos)
    [8.6, 9.2, 9.8].forEach(t => osc("sine", NOTE("D5"), t, .04, { gain: .1, d: .05, send: .3 }));   // cubos que se abrazan
    whoosh(AV_T[1] + 1.0, .35, true, .6); tom(AV_T[1] + 1.45, 220, .5);                                                    // Teo gira y frena seco
    blip(AV_T[6] + 1.0, 1); blip(AV_T[6] + 1.35, .9);                                                                      // Lia vibra
    // Teo llega tarde a la foto
    whoosh(59.9, .3, true, .7); tom(60.25, 160, .5); tom(60.4, 120, .4);
    // Redoble y foto (37–38)
    [61.0, 61.12, 61.25, 61.37].forEach((t, i) => tom(t, [220, 180, 150, 120][i], .7));
    shutter(61.5); crash(61.52, .9);
    // Corte: congelado (37.55–38.0) y vuelta suave
    for (let t = 62; t < 65.5; t += B) { const ch = chordAt(t), inBar = Math.round((t - 8) / B) % 4;
      if (inBar === 0) pad(t, ch.pad, BAR, .9, 1800); hat(t + B / 2, .6); if (inBar === 0 || inBar === 2) kick(t, .6);
      ch.arp.forEach((n, k) => pluck(t + k * B / 4, n, .45)); }
    // Las sonrisas vuelan al centro (41.5–43.5): subida + campanas convergentes
    whoosh(65.4, 2.1, true, 1.2);
    ["F#7", "E7", "D7", "B6", "A6", "F#6", "E6", "D6"].forEach((n, i) => bell(65.6 + i * .2, n, .45, (i % 2 ? .5 : -.5)));
    // El isotipo vuelve a latir (43.5–44.6)
    pop(67.5, 1.1); heart(68.3, 1); heart(68.52, .75);
    // Final: acorde abierto + motivo + firma del logo
    pad(68.0, ["D3", "A3", "D4", "E4", "F#4"], 6.4, 1.1, 2000); ooh(68.0, "F#4", 6, .8);
    bass(68.0, "D2", 5.5, .8);
    [["D6", 68.6], ["F#6", 68.85], ["A6", 69.1], ["D7", 69.6]].forEach(([n, t]) => bell(t, n, .8, 0));
    chime(69.6, ["A6", "D7", "F#7", "A7"], .08, .6); crash(69.6, .5);
    kick(69.6, .7);

    return await ctx.startRendering();
  }

  function wav(buf) {
    const ch = buf.numberOfChannels, sr = buf.sampleRate, n = buf.length, data = new DataView(new ArrayBuffer(44 + n * ch * 2));
    const w = (o, s) => [...s].forEach((c, i) => data.setUint8(o + i, c.charCodeAt(0)));
    w(0, "RIFF"); data.setUint32(4, 36 + n * ch * 2, true); w(8, "WAVE"); w(12, "fmt "); data.setUint32(16, 16, true); data.setUint16(20, 1, true);
    data.setUint16(22, ch, true); data.setUint32(24, sr, true); data.setUint32(28, sr * ch * 2, true); data.setUint16(32, ch * 2, true); data.setUint16(34, 16, true);
    w(36, "data"); data.setUint32(40, n * ch * 2, true);
    const chans = [...Array(ch)].map((_, c) => buf.getChannelData(c)); let o = 44;
    // fundido de salida suave
    for (let i = 0; i < n; i++) { const fade = Math.min(1, (n - i) / (sr * 1.2)); for (let c = 0; c < ch; c++) { const v = Math.max(-1, Math.min(1, chans[c][i] * fade)); data.setInt16(o, v * 32767, true); o += 2; } }
    return data.buffer;
  }
  return { render, wav, DUR, AV_T };
})();
