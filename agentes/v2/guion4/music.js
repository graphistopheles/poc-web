// ============================================================================
//  GUION 4 · "Arquitectura LEGO" — composición original · 120 BPM · La mayor
//  F#m – D – A – E · cada bloque que cae toca una nota; cada escena suma una capa.
// ============================================================================
const MUSIC4 = (() => {
  const DUR = 45, B = .5, BAR = 2, G0 = 5;
  const PROG = [
    { root: "F#1", pad: ["C#3", "F#3", "A3", "E4"], arp: ["F#5", "A5", "C#6", "E5"] },
    { root: "D2", pad: ["D3", "F#3", "A3", "E4"], arp: ["D5", "F#5", "A5", "E5"] },
    { root: "A1", pad: ["C#3", "E3", "A3", "B3"], arp: ["C#5", "E5", "A5", "B4"] },
    { root: "E2", pad: ["B2", "E3", "G#3", "D4"], arp: ["B4", "E5", "G#5", "D5"] },
  ];
  const SCALE = ["A5", "B5", "C#6", "E6", "F#6", "A6", "B6", "C#7"];
  async function render(sr = 44100) {
    const ctx = new OfflineAudioContext(2, Math.ceil(DUR * sr), sr), I = createSynth(ctx, { revGain: .45, delay: B * .75 });
    // --- 1 · la pregunta (0–5): pad suave + teclas ---
    I.pad(0, ["F#3", "A3", "C#4", "E4"], 4.8, .6, 800);
    const N = 44; for (let i = 0; i < N; i++) I.tick(.5 + i * (2.9 / N), .35 + (i % 3) * .1, i % 2 === 0);
    I.chime(3.45, ["A6", "C#7", "E7"], .07, .5);
    I.whoosh(3.9, 1.1, true, 1.1);
    I.kick(5, 1); I.crash(5, .7); I.pop(5, .8);
    // --- 2 · caen los bloques: cada uno, una nota ---
    for (let k = 0; k < 8; k++) { const t = 5.4 + k * .55; I.bell(t + .35, SCALE[k], .8, (k - 3.5) / 5); I.pop(t + .35, .45); }
    // --- 3 · encajan (11.4+): clic de cada bloque; la marca cambia (14–16) ---
    I.whoosh(10.5, .7, true, .7);
    for (let k = 0; k < 8; k++) I.tick(11.95 + k * .18, 1, k % 2 === 0);
    I.pop(13.2, .7); [14, 15, 16].forEach((t, i) => { I.blip(t, .8); I.bell(t, ["C#6", "E6", "A6"][i], .5, 0, false); });
    // --- 4 · integraciones (17–23): arpegio de datos ---
    I.whoosh(17.1, .5, true, .5);
    // --- 5 · AIDA + videoconsulta ---
    [23.2, 23.6, 26.0].forEach(t => I.blip(t, .7)); I.tick(24.8, .9); I.tick(24.86, .7, false);
    I.chime(27.2, ["E6", "A6", "C#7", "E7"], .06, .6); I.crash(26.8, .4);
    // --- 6 · panel: el clic ---
    I.pop(34.5, 1); I.chime(34.6, ["A6", "C#7", "E7", "A7"], .05, .7);
    for (let i = 0; i < 9; i++) I.tick(31.3 + i * .14, .4);

    // --- groove (5–37) ---
    for (let t = G0; t < 37 - 1e-6; t += B) {
      const beat = Math.round((t - G0) / B), ib = beat % 4, ch = PROG[Math.floor((t - G0) / BAR + .0001) % 4];
      const lvl = t < 11 ? .7 : 1;
      I.kick(t, (ib === 0 ? 1 : .8) * lvl);
      if (t >= 11 && (ib === 1 || ib === 3)) I.clap(t, .85);
      I.hat(t + B / 2, t >= 17 ? 1 : .6, t >= 30 && ib === 3);
      if (t >= 23) I.hat(t + B / 4, .35);
      I.bass(t, ch.root, B * .45, .85 * lvl); I.bass(t + B / 2, t >= 30 ? I.OCT(ch.root) : ch.root, B * .4, .65 * lvl);
      if (ib === 0) I.pad(t, ch.pad, BAR * .98, t >= 30 ? 1 : .8, t >= 30 ? 2200 : 1500);
      if (t >= 17) ch.arp.forEach((n, j) => I.pluck(t + j * B / 4, n, .7, j % 2 ? .35 : -.35));
      if (t >= 30 && ib === 2) I.brass(t + B / 2, ch.pad.slice(1).map(n => I.OCT(n)), .16, .7);
    }
    // --- 7 · +8 MM: baja todo, sube la tensión ---
    I.pad(37, ["F#3", "A3", "C#4", "E4"], 3.2, .9, 1200); I.ooh(37.2, "C#5", 3, .5);
    I.whoosh(37.4, 2.8, true, 1.3);
    for (let i = 0; i < 26; i++) { const t = 37.4 + 1.8 * Math.pow(i / 26, .7); I.tick(t, .3 + i / 40, i % 2 === 0); }
    // --- 8 · golpe final + logotipo ---
    I.kick(40.2, 1); I.crash(40.2, .9); I.pop(40.25, 1.1); I.heart(40.75, 1); I.heart(40.97, .75);
    I.pad(40.2, ["A2", "E3", "A3", "C#4", "E4"], 4.6, 1.1, 2000); I.ooh(40.3, "E4", 4.4, .7); I.bass(40.2, "A1", 4.2, .8);
    [["C#6", 41.0], ["E6", 41.25], ["A6", 41.5], ["C#7", 42.0]].forEach(([n, t]) => I.bell(t, n, .8, 0));
    I.chime(42.0, ["A6", "C#7", "E7", "A7"], .08, .6); I.kick(42.0, .6);
    return await ctx.startRendering();
  }
  return { render, DUR };
})();
