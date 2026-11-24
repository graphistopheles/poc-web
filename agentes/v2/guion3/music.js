// ============================================================================
//  GUION 3 · "Un día con la familia" — composición original · Mi mayor
//  C#m – A – E – B · el tempo hace que cada relevo dure exactamente 3 compases.
//  Cada atrapada toca la siguiente nota de la escala: la pelota "canta" el día.
// ============================================================================
const MUSIC3 = (() => {
  const DUR = 63, CATCH = [8.0, 10.6, 16.2, 21.8, 27.4, 33.0, 38.6, 44.2], THROW = [9.4, 15.0, 20.6, 26.2, 31.8, 37.4, 43.0, 48.6], BACK = 50.7;
  const B = 5.6 / 12, BAR = 4 * B, G0 = CATCH[1];
  const PROG = [
    { root: "C#2", pad: ["C#3", "E3", "G#3", "B3"], arp: ["C#5", "E5", "G#5", "B4"] },
    { root: "A1", pad: ["C#3", "E3", "A3", "B3"], arp: ["A4", "C#5", "E5", "B4"] },
    { root: "E2", pad: ["E3", "G#3", "B3", "F#4"], arp: ["E5", "G#5", "B5", "F#5"] },
    { root: "B1", pad: ["D#3", "F#3", "B3", "C#4"], arp: ["B4", "D#5", "F#5", "C#5"] },
  ];
  const HOOK = [[0, "G#5", 1], [1, "B5", 1], [2, "C#6", 2], [4, "E6", 1], [5, "C#6", 1], [6, "B5", 2], [8, "G#5", 1], [9, "B5", 1], [10, "E6", 1.5], [11.5, "D#6", .5], [12, "F#6", 2], [14, "D#6", 2]];
  const SCALE = ["E5", "F#5", "G#5", "B5", "C#6", "E6", "F#6", "G#6"];
  async function render(sr = 44100) {
    const ctx = new OfflineAudioContext(2, Math.ceil(DUR * sr), sr), I = createSynth(ctx, { revGain: .5, delay: B * .75 });
    // --- Amanecer (0–10.6): pad, pájaros, caja de música ---
    I.pad(0, ["E3", "B3", "F#4", "G#4"], 5.2, .7, 800); I.pad(5.0, ["A2", "E3", "B3", "C#4"], 5.4, .8, 1100);
    [1.2, 1.9, 2.7, 3.6, 4.4, 6.2, 7.3].forEach((t, i) => I.chirp(t, .8, 2800 + (i % 3) * 600));
    ["B5", "E6", "G#6", "F#6", "B6", "G#6", "E6"].forEach((n, i) => I.bell(.6 + i * .42, n, .5, i % 2 ? .4 : -.4));
    I.whoosh(2.0, 2.6, true, .7);                                                        // el sol sube
    I.chime(4.5, ["E6", "G#6", "B6", "E7"], .09, .6);
    I.pop(5.6, 1); I.chime(6.3, ["G#6", "B6", "E7"], .055, .7); I.heart(6.3, .5);         // nace Catalina
    I.bell(CATCH[0], SCALE[0], .9, 0); I.pluck(CATCH[0], "E5", 1);
    // Lanzamientos y atrapadas
    THROW.forEach((t, k) => { I.whoosh(t - .1, (k < 7 ? 1.2 : 2.1) * .9, true, k < 7 ? .6 : 1); I.boing(t, .25, 300, 520); });
    CATCH.slice(1).forEach((t, i) => { const k = i + 1; I.bell(t, SCALE[k], 1, 0); I.pluck(t, SCALE[k], 1); I.pop(t, .5); I.crash(t, .25); });
    I.whoosh(9.6, 1.0, true, .8);

    // --- El día (10.6–48.6): cada estación suma energía ---
    for (let t = G0; t < BACK - 1e-6; t += B) {
      const beat = Math.round((t - G0) / B), ib = beat % 4, ch = PROG[Math.floor((t - G0) / BAR + .0001) % 4];
      const alma = t >= CATCH[5] && t < THROW[5];                        // respiro: todo baja a la mitad
      if (!alma) { I.kick(t, ib === 0 ? 1 : .85); if (t >= CATCH[2] && (ib === 1 || ib === 3)) I.clap(t, .9); }
      else if (ib === 0) I.kick(t, .5);
      I.bass(t, ch.root, B * .45, alma ? .5 : .9); I.bass(t + B / 2, t >= CATCH[6] ? I.OCT(ch.root) : ch.root, B * .4, alma ? .4 : .7);
      if (ib === 0) I.pad(t, ch.pad, BAR * .98, alma ? .6 : .85, alma ? 900 : 1600);
      if (t >= CATCH[3] && !alma) ch.arp.forEach((n, j) => I.pluck(t + j * B / 4, n, .75, j % 2 ? .35 : -.35));
      if (t >= CATCH[4]) I.bell(t + B / 2, I.OCT(ch.arp[(beat + 1) % 4]), .25, (ib - 1.5) / 3, false);
      if (t >= CATCH[7]) { I.hat(t + B / 2, 1, ib === 3); I.hat(t + B / 4, .4); I.hat(t + 3 * B / 4, .4); if (ib === 2) I.brass(t + B / 2, ch.pad.slice(1).map(n => I.OCT(n)), .14, .6); }
      else if (t >= CATCH[1] && !alma) I.hat(t + B / 2, .7);
      if (alma && ib === 0) I.ooh(t, I.OCT(ch.pad[2]), BAR * .95, .5);
    }
    // gancho (bell) desde Noelia
    for (let c0 = G0; c0 < BACK; c0 += 4 * BAR) HOOK.forEach(([b, n, d]) => { const t = c0 + b * B; if (t >= CATCH[2] && t < THROW[7] && !(t >= CATCH[5] && t < THROW[5])) I.bell(t, n, .7, 0); });

    // --- Sonidos de cada momento del día ---
    const c = k => CATCH[k];
    I.blip(c(1) + .5, 1); I.buzz(c(1) + .55, .4, .7); I.buzz(c(1) + 1.35, .35, .6);                         // Lia: WhatsApp
    [.5, .7, .9, 1.1].forEach((d, i) => I.tick(c(2) + d, .9, i % 2 === 0)); I.pop(c(2) + 1.3, .6);           // Noelia: pastilla
    for (let j = 0; j < 10; j++) I.rim(c(3) + .4 + j * .1, .5 + (j % 3) * .2);                             // Sara: agenda
    I.whoosh(c(4) + .4, 1.0, true, .5); [1.0, 1.35, 1.7].forEach((d, i) => I.bell(c(4) + d, ["B6", "C#7", "E7"][i], .6, .3, false)); // Clara: exámenes
    [[.8, true], [1.5, false], [2.2, true], [2.9, false]].forEach(([d, up]) => I.whoosh(c(5) + d, .65, up, .55));   // Alma: respira
    [0, 1, 2, 3].forEach(j => I.blip(c(6) + .5 + j * .32, .6));                                            // Dalia: filas revisadas
    [0, .3, .6, .9].forEach((d, j) => I.osc("sine", j % 2 ? 660 : 880, c(7) + .3 + d, .22, { gain: .1, d: .2, sus: .08, rel: .05, send: .3 })); // Teo: videollamada
    I.whoosh(c(7) + .4, .5, true, .5);

    // --- La vuelta y la noche (48.6–55) ---
    I.whoosh(THROW[7], 2.1, true, 1.2); I.crash(BACK, .7); I.pop(BACK, 1);
    I.pad(BACK, ["E3", "B3", "E4", "G#4"], 4.6, .55, 1000); I.ooh(BACK + .2, "B4", 4.2, .45); I.bass(BACK, "E2", 4.2, .35);
    ["E6", "G#6", "B6", "E7", "D#7", "B6", "G#6", "F#6", "E6", "G#6", "B6", "C#7"].forEach((n, i) => I.bell(BACK + .3 + i * .33, n, .45, i % 2 ? .4 : -.4));
    for (let i = 0; i < 10; i++) I.bell(BACK + 1.5 + i * .11, ["E7", "F#7", "G#7", "B7"][i % 4], .25, (i - 5) / 5, false); // constelación
    // --- Contracción, latido y logotipo ---
    I.whoosh(54.6, 1.15, true, 1.1); I.pop(55.75, 1.2); I.crash(55.75, .5); I.heart(56.3, 1); I.heart(56.52, .75);
    I.pad(55.8, ["E3", "B3", "E4", "F#4", "G#4"], 7.0, 1.1, 2000); I.ooh(55.9, "G#4", 6.8, .8); I.bass(55.8, "E2", 6.4, .8);
    [["B5", 56.6], ["E6", 56.85], ["G#6", 57.1], ["B6", 57.6]].forEach(([n, t]) => I.bell(t, n, .8, 0));
    I.chime(57.6, ["G#6", "B6", "E7", "G#7"], .08, .6); I.kick(57.6, .7);
    return await ctx.startRendering();
  }
  return { render, DUR };
})();
