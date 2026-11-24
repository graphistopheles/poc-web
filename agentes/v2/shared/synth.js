// ============================================================================
//  Sintetizador compartido (Web Audio offline) — instrumentos originales
// ============================================================================
const NOTE = n => {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(n); const base = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 }[m[1]];
  return 440 * Math.pow(2, (base + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + (parseInt(m[3]) - 4) * 12) / 12);
};
const OCT = (n, d = 1) => n.replace(/-?\d$/, x => +x + d);

function createSynth(ctx, { revGain = .5, delay = .375 } = {}) {
  const sr = ctx.sampleRate;
  const master = ctx.createGain(); master.gain.value = .9;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = .004; comp.release.value = .18;
  master.connect(comp); comp.connect(ctx.destination);
  const rev = ctx.createConvolver(); { const len = sr * 3, ir = ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); } rev.buffer = ir; }
  const revIn = ctx.createGain(); revIn.gain.value = revGain; revIn.connect(rev); rev.connect(master);
  const dly = ctx.createDelay(1); dly.delayTime.value = delay; const fb = ctx.createGain(); fb.gain.value = .3; const dlf = ctx.createBiquadFilter(); dlf.type = "lowpass"; dlf.frequency.value = 3800;
  dly.connect(dlf); dlf.connect(fb); fb.connect(dly); const dOut = ctx.createGain(); dOut.gain.value = .32; dlf.connect(dOut); dOut.connect(master); dOut.connect(revIn);
  const duck = ctx.createGain(); duck.connect(master); duck.connect(revIn);
  const noiseBuf = (() => { const b = ctx.createBuffer(1, sr * 2, sr), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();

  function out(node, pan = 0, send = .2, dest = master) { const p = ctx.createStereoPanner(); p.pan.value = pan; node.connect(p); p.connect(dest);
    if (send) { const s = ctx.createGain(); s.gain.value = send; p.connect(s); s.connect(revIn); } return p; }
  function env(g, t, a, peak, d, sus, rel, end) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.setTargetAtTime(sus, t + a, d); g.gain.setValueAtTime(sus, end); g.gain.setTargetAtTime(0, end, rel); }
  function osc(type, f, t, dur, { gain = .2, a = .005, d = .1, sus = 0, rel = .08, pan = 0, send = .2, detune = 0, dest = master, lp = 0, q = .7, lpEnv = 0, glide = 0 } = {}) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur); o.detune.value = detune;
    const g = ctx.createGain(); let n = o;
    if (lp) { const fl = ctx.createBiquadFilter(); fl.type = "lowpass"; fl.Q.value = q; fl.frequency.setValueAtTime(lp + lpEnv, t); if (lpEnv) fl.frequency.setTargetAtTime(lp, t, .08); o.connect(fl); n = fl; }
    n.connect(g); env(g, t, a, gain, d, sus, rel, t + dur); out(g, pan, send, dest); o.start(t); o.stop(t + dur + rel * 8 + .1); return o; }
  function noise(t, dur, { gain = .2, type = "highpass", f = 6000, q = .7, a = .001, d = .05, pan = 0, send = .1, fTo = 0 } = {}) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (fTo) fl.frequency.exponentialRampToValueAtTime(fTo, t + dur);
    const g = ctx.createGain(); s.connect(fl); fl.connect(g); env(g, t, a, gain, d, 0, d, t + dur); out(g, pan, send); s.start(t, Math.random()); s.stop(t + dur + d * 6 + .1); }
  const drop = (t, f0, f1, dur, gain, send = 0, lp = 0) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur * .3);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); let n = o; if (lp) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = lp; o.connect(f); n = f; } n.connect(g); out(g, 0, send); o.start(t); o.stop(t + dur + .05); };

  const I = {
    NOTE, OCT, osc, noise, master, duck,
    kick(t, v = 1) { drop(t, 150, 44, .42, .95 * v); noise(t, .01, { gain: .12 * v, type: "lowpass", f: 3000, d: .01, send: 0 }); duck.gain.setValueAtTime(.35, t); duck.gain.setTargetAtTime(1, t + .02, .09); },
    heart(t, v = 1) { drop(t, 95, 38, .5, 1.1 * v, .25, 180); },
    clap(t, v = 1) { for (let k = 0; k < 3; k++) noise(t + k * .011, .02, { gain: .22 * v, type: "bandpass", f: 1600, q: 1.2, d: k === 2 ? .12 : .01, send: .35 }); },
    snare(t, v = 1) { noise(t, .02, { gain: .3 * v, type: "bandpass", f: 2200, q: .8, d: .1, send: .25 }); drop(t, 240, 160, .12, .25 * v); },
    rim(t, v = 1) { osc("square", 1700, t, .01, { gain: .12 * v, d: .015, rel: .02, lp: 3000, send: .15 }); noise(t, .01, { gain: .15 * v, type: "bandpass", f: 3000, q: 3, d: .02 }); },
    hat(t, v = 1, open = false) { noise(t, open ? .08 : .02, { gain: .09 * v, f: 8000, d: open ? .09 : .025, pan: .25, send: .05 }); },
    ride(t, v = 1) { noise(t, .03, { gain: .07 * v, f: 6500, d: .22, pan: -.3, send: .15 }); osc("sine", 5200, t, .01, { gain: .015 * v, d: .2, rel: .2, send: .1 }); },
    bass(t, n, dur = .45, v = 1) { osc("sawtooth", NOTE(n), t, dur, { gain: .22 * v, d: .12, sus: .6, rel: .06, lp: 280, lpEnv: 900, q: 4, send: 0, dest: duck }); osc("sine", NOTE(n), t, dur, { gain: .3 * v, d: .2, sus: .8, rel: .06, send: 0, dest: duck }); },
    upright(t, n, dur = .45, v = 1) { osc("triangle", NOTE(n), t, dur, { gain: .42 * v, a: .004, d: .18, sus: .2, rel: .08, lp: 700, lpEnv: 600, send: .05 }); osc("sine", NOTE(n) * 2, t, .05, { gain: .05 * v, d: .04, send: 0 }); },
    pad(t, notes, dur, v = 1, bright = 1400) { notes.forEach(n => [-9, 0, 9].forEach((dt, j) => osc("sawtooth", NOTE(n), t, dur, { gain: .035 * v, a: .6, d: .5, sus: .035 * v, rel: .9, lp: bright, detune: dt, pan: (j - 1) * .5, send: .45, dest: duck }))); },
    pluck(t, n, v = 1, pan = 0) { osc("square", NOTE(n), t, .12, { gain: .07 * v, a: .002, d: .07, rel: .1, lp: 900, lpEnv: 3200, q: 2, pan, send: .3 }); osc("triangle", NOTE(n), t, .1, { gain: .05 * v, d: .1, pan: -pan, send: .2 }); },
    ep(t, notes, dur = .5, v = 1) { notes.forEach((n, i) => { const f = NOTE(n), p = (i - notes.length / 2) * .2;
      osc("sine", f, t, dur, { gain: .07 * v, a: .004, d: .4, sus: .03 * v, rel: .3, pan: p, send: .3 }); osc("sine", f * 2, t, .05, { gain: .025 * v, d: .08, pan: p, send: .2 }); osc("triangle", f * 4.01, t, .01, { gain: .008 * v, d: .03, pan: p }); }); },
    brass(t, notes, dur = .25, v = 1) { notes.forEach((n, i) => [-6, 6].forEach(dt => osc("sawtooth", NOTE(n), t, dur, { gain: .05 * v, a: .02, d: .12, sus: .035 * v, rel: .12, lp: 900, lpEnv: 2400, q: 1.5, detune: dt, pan: (i - 1) * .3, send: .3 }))); },
    bell(t, n, v = 1, pan = 0, dl = true) { const f = NOTE(n);
      osc("sine", f, t, .02, { gain: .16 * v, a: .002, d: .02, sus: .16 * v, rel: 1.1, pan, send: .5 }); osc("sine", f * 2.76, t, .02, { gain: .05 * v, a: .002, d: .02, sus: .05 * v, rel: .35, pan, send: .3 });
      osc("triangle", f * 2, t, .02, { gain: .03 * v, a: .002, d: .02, sus: .03 * v, rel: .5, pan, send: .3 });
      if (dl) { const g = ctx.createGain(); g.gain.value = .5; const o = ctx.createOscillator(); o.frequency.value = f; const e = ctx.createGain(); env(e, t, .002, .12 * v, .02, .12 * v, .5, t + .02); o.connect(e); e.connect(g); g.connect(dly); o.start(t); o.stop(t + 3); } },
    ooh(t, n, dur, v = 1) { const f = NOTE(n); [0, 1].forEach(k => { const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f * (k ? 1.003 : 1);
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 5.2; lg.gain.value = f * .006; lfo.connect(lg); lg.connect(o.frequency);
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 820; bp.Q.value = 1.4; const g = ctx.createGain();
      o.connect(bp); bp.connect(g); env(g, t, .35, .16 * v, .3, .14 * v, .5, t + dur); out(g, k ? .35 : -.35, .6, duck); o.start(t); lfo.start(t); o.stop(t + dur + 3); lfo.stop(t + dur + 3); }); },
    blip(t, v = 1) { osc("sine", NOTE("E6"), t, .05, { gain: .14 * v, d: .05, rel: .05, send: .25, pan: .3 }); osc("sine", NOTE("B6"), t + .085, .07, { gain: .14 * v, d: .07, rel: .08, send: .3, pan: .3 }); },
    pop(t, v = 1) { drop(t, 1100, 160, .14, .35 * v, .3); noise(t, .008, { gain: .2 * v, f: 2500, d: .01 }); },
    chime(t, notes, step = .06, v = 1) { notes.forEach((n, i) => I.bell(t + i * step, n, v * (.8 + i * .08), (i % 2 ? .3 : -.3), false)); },
    whoosh(t, dur, up = true, v = 1) { noise(t, dur, { gain: .16 * v, type: "bandpass", f: up ? 400 : 5000, fTo: up ? 7000 : 300, q: 1.6, a: dur * .8, d: .15, send: .4 }); },
    boing(t, v = 1, f0 = 220, f1 = 660) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + .18);
      const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 18; lg.gain.value = 40; l.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.2 * v, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + .45); o.connect(g); out(g, 0, .3); o.start(t); l.start(t); o.stop(t + .5); l.stop(t + .5); },
    slide(t, dur, f0, f1, v = 1) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 6; lg.gain.value = 12; l.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.13 * v, t + .04); g.gain.setValueAtTime(.13 * v, t + dur - .05); g.gain.linearRampToValueAtTime(0, t + dur); o.connect(g); out(g, 0, .3); o.start(t); l.start(t); o.stop(t + dur + .05); l.stop(t + dur + .05); },
    crash(t, v = 1) { noise(t, .05, { gain: .14 * v, f: 5000, d: .9, send: .5 }); },
    shutter(t) { noise(t, .015, { gain: .5, type: "bandpass", f: 3200, q: 2, d: .012, send: .1 }); noise(t + .07, .02, { gain: .35, type: "bandpass", f: 2200, q: 2, d: .02, send: .2 }); },
    tom(t, f, v = 1) { drop(t, f * 1.6, f, .3, .45 * v, .3); },
    rimshot(t, v = 1) { I.tom(t, 220, .8 * v); I.tom(t + .14, 150, .8 * v); I.kick(t + .28, .7 * v); noise(t + .28, .04, { gain: .16 * v, f: 6000, d: .35, send: .35 }); },
    tick(t, v = 1, hi = true) { osc("sine", hi ? 2600 : 1900, t, .01, { gain: .12 * v, d: .015, rel: .02, send: .2 }); noise(t, .005, { gain: .08 * v, type: "bandpass", f: 4000, q: 4, d: .01 }); },
    clack(t, v = 1) { noise(t, .02, { gain: .45 * v, type: "bandpass", f: 1800, q: 1, d: .03, send: .3 }); drop(t, 120, 50, .25, .5 * v, .2, 400); },
    chirp(t, v = 1, f = 3200) { [0, .09, .2].forEach((d, i) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(f * (1 + i * .08), t + d); o.frequency.exponentialRampToValueAtTime(f * 1.45, t + d + .06);
      g.gain.setValueAtTime(0, t + d); g.gain.linearRampToValueAtTime(.05 * v, t + d + .01); g.gain.exponentialRampToValueAtTime(.001, t + d + .07); o.connect(g); out(g, (Math.random() - .5), .5); o.start(t + d); o.stop(t + d + .1); }); },
    buzz(t, dur, v = 1) { const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = "square"; o.frequency.value = 160; f.type = "lowpass"; f.frequency.value = 600;
      const l = ctx.createOscillator(), lg = ctx.createGain(); l.type = "square"; l.frequency.value = 14; lg.gain.value = .5; l.connect(lg); lg.connect(g.gain);
      g.gain.setValueAtTime(.0, t); g.gain.linearRampToValueAtTime(.12 * v, t + .01); g.gain.setValueAtTime(.12 * v, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + .02); o.connect(f); f.connect(g); out(g, 0, .1); o.start(t); l.start(t); o.stop(t + dur + .05); l.stop(t + dur + .05); },
  };
  return I;
}

function encodeWav(buf, fadeOut = 1.2) {
  const ch = buf.numberOfChannels, sr = buf.sampleRate, n = buf.length, data = new DataView(new ArrayBuffer(44 + n * ch * 2));
  const w = (o, s) => [...s].forEach((c, i) => data.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); data.setUint32(4, 36 + n * ch * 2, true); w(8, "WAVE"); w(12, "fmt "); data.setUint32(16, 16, true); data.setUint16(20, 1, true);
  data.setUint16(22, ch, true); data.setUint32(24, sr, true); data.setUint32(28, sr * ch * 2, true); data.setUint16(32, ch * 2, true); data.setUint16(34, 16, true);
  w(36, "data"); data.setUint32(40, n * ch * 2, true);
  const chans = [...Array(ch)].map((_, c) => buf.getChannelData(c)); let o = 44;
  for (let i = 0; i < n; i++) { const fade = Math.min(1, (n - i) / (sr * fadeOut)); for (let c = 0; c < ch; c++) { const v = Math.max(-1, Math.min(1, chans[c][i] * fade)); data.setInt16(o, v * 32767, true); o += 2; } }
  return data.buffer;
}
