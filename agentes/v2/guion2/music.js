// ============================================================================
//  GUION 2 · "La sesión de fotos" — swing jazz-funk original · 110 BPM · Fa mayor
//  Fmaj7 – Dm7 – Gm7 – C7 · contrabajo caminante, ride con swing, piano eléctrico,
//  bronces que remarcan cada chiste y un "ba-dum-tss" al final de cada gag.
// ============================================================================
const MUSIC2 = (() => {
  const DUR = 55, B = 60 / 110, BAR = 4 * B, G0 = 5.0, SW = .64; // swing: la corchea "y" cae al 64% del pulso
  const ENT = { catalina: 5.0, teo: 10.0, sara: 14.2, alma: 18.4, noelia: 22.6, dalia: 26.8, lia: 31.0, clara: 35.2 };
  const PROG = [
    { ep: ["A3", "C4", "E4"], walk: ["F2", "A2", "C3", "E3"] },
    { ep: ["F3", "A3", "C4"], walk: ["D2", "F2", "A2", "C3"] },
    { ep: ["F3", "Bb3", "D4"], walk: ["G2", "Bb2", "D3", "F3"] },
    { ep: ["E3", "Bb3", "D4"], walk: ["C2", "E2", "G2", "Bb2"] },
  ];
  async function render(sr = 44100) {
    const ctx = new OfflineAudioContext(2, Math.ceil(DUR * sr), sr), I = createSynth(ctx, { revGain: .42, delay: B * .75 });
    // --- Intro: luces, el fotógrafo entra ---
    [.4, .9, 1.4].forEach((t, i) => I.clack(t, 1 - i * .1));
    I.upright(1.5, "F2", B * .9, .8); I.upright(1.5 + B, "A2", B * .9, .8); I.upright(1.5 + 2 * B, "C3", B * .9, .8); I.upright(1.5 + 3 * B, "E3", B * .9, .8);
    I.slide(1.55, .5, 300, 900, .9);                                  // el fotógrafo se desliza
    I.pop(2.4, .7); for (let t = 2.4; t < 5; t += B) I.rim(t, .5);    // tic tic mientras habla
    I.upright(3.7, "D2", B * .9, .8); I.upright(3.7 + B, "C2", B * .9, .8); I.upright(3.7 + 2 * B, "B1", B * .9, .7);
    I.shutter(4.7); I.bell(4.72, "C7", .35, 0, false);              // prueba de flash
    // --- ¡Flash! nace Catalina ---
    I.shutter(5.0); I.crash(5.0, .7); I.brass(5.0, ["A4", "C5", "E5", "F5"], .4, 1.2); I.pop(5.4, 1); I.chime(5.9, ["F6", "A6", "C7"], .055, .7);

    // --- Groove 5.0 → 39.3 ---
    const groove = (t0, t1, lvl = 1, drums = true) => {
      for (let t = t0; t < t1 - 1e-6; t += B) {
        const beat = Math.round((t - G0) / B), ib = ((beat % 4) + 4) % 4, ch = PROG[Math.floor((t - G0) / BAR + 400) % 4];
        I.upright(t, ch.walk[ib], B * .85, .9 * lvl);
        if (drums) { if (ib === 0 || ib === 2) I.kick(t, .7 * lvl); if (ib === 1 || ib === 3) I.snare(t, .45 * lvl);
          I.ride(t, .8 * lvl); if (ib === 1 || ib === 3) I.ride(t + B * SW, .55 * lvl); I.hat(t + (ib % 2 ? 0 : B), .25 * lvl); }
        if (ib === 1) I.ep(t + B * SW, ch.ep, B * 1.2, .9 * lvl); if (ib === 3) I.ep(t, ch.ep, B * .6, .7 * lvl);
      }
    };
    // Alma pide respirar: el groove se apaga y respira con ella
    groove(G0, ENT.alma + 1.35); groove(ENT.alma + 3.25, 39.3);
    const a = ENT.alma; I.pad(a + 1.35, ["F3", "A3", "C4", "E4"], 1.9, .8, 900); I.ooh(a + 1.4, "A4", 1.8, .9);
    [[a + 1.4, true], [a + 1.85, false], [a + 2.3, true], [a + 2.75, false]].forEach(([t, up]) => I.whoosh(t, .45, up, .7));
    for (let t = a + 1.35; t < a + 3.25; t += B * 2) I.upright(t, "F2", B * 1.6, .6);

    // --- Gags ---
    // Catalina ordena el set: marcas ✕
    for (let j = 0; j < 8; j++) I.pluck(7.0 + j * .12, ["F5", "G5", "A5", "C6", "D6", "F6", "G6", "A6"][j], .6, (j - 3.5) / 5);
    I.boing(6.5, .5, 300, 500);
    // Teo: reloj 57, 58, 59… ¡00! y llega exacto
    [0, .4, .8].forEach(d => I.tick(ENT.teo + d, 1)); I.whoosh(ENT.teo + .1, 1.0, false, .7); I.bell(ENT.teo + 1.2, "F6", .9, 0); I.brass(ENT.teo + 1.2, ["C5", "E5", "G5", "Bb5"], .18, 1);
    I.tick(ENT.teo + 1.55, .8, false);
    // Sara: llega a saltitos y endereza a todos
    [.15, .45, .75].forEach((d, i) => I.boing(ENT.sara + d, .45, 260 + i * 60, 520 + i * 80)); I.rim(ENT.sara + 1.6, 1); I.rim(ENT.sara + 1.72, 1);
    I.brass(ENT.sara + 1.8, ["A4", "C5", "F5"], .14, 1); I.whoosh(ENT.sara + 1.75, .2, true, .6);
    // Alma baja flotando
    I.chime(ENT.alma + .1, ["C6", "E6", "G6", "C7"], .14, .5);
    // Noelia: ¡alarma! y todos saltan
    I.whoosh(ENT.noelia - .1, .3, true, .6); I.pop(ENT.noelia + .55, .8); I.buzz(ENT.noelia + .7, .85, 1);
    [0, .06, .11, .17, .23, .28, .34].forEach(d => I.boing(ENT.noelia + .75 + d, .3, 280 + d * 900, 700 + d * 900));
    // Dalia: rebotes y tres "¡Sí!"
    [0, .4, .8].forEach((d, i) => I.boing(ENT.dalia + d, .5, 200, 420 - i * 40)); [1.3, 1.7, 2.1].forEach((d, i) => { I.pluck(ENT.dalia + d, ["C6", "E6", "G6"][i], 1.1); I.pop(ENT.dalia + d + .02, .5); });
    I.brass(ENT.dalia + 2.1, ["C5", "F5", "A5"], .2, 1);
    // Lia: vibra como celular, confirma, el fotógrafo responde
    I.blip(ENT.lia + .45, 1); I.buzz(ENT.lia + .7, .55, .8); I.buzz(ENT.lia + 1.45, .45, .7); I.blip(ENT.lia + .85, .8);
    I.bell(ENT.lia + 2.0, "A6", .7, .4, false); I.bell(ENT.lia + 2.12, "D7", .7, .4, false);
    // Clara: la lupa recorre a la familia
    I.whoosh(ENT.clara + .9, 1.6, true, .5); [1.0, 1.3, 1.6, 1.9, 2.2].forEach((d, i) => I.bell(ENT.clara + d, ["C6", "D6", "F6", "G6", "A6"][i], .35, (i - 2) / 3, false));
    I.chime(ENT.clara + 2.6, ["F6", "A6", "C7", "F7"], .07, .7); I.brass(ENT.clara + 2.6, ["A4", "C5", "F5"], .25, .9);
    // "ba-dum-tss" al cierre de cada gag
    ["teo", "sara", "noelia", "dalia", "lia"].forEach(n => I.rimshot(ENT[n] + 3.5, .9));

    // --- Cuenta regresiva 39.3 → 42.2 ---
    for (let t = 39.3; t < 42.2; t += B / 2) I.tick(t, .6, Math.round((t - 39.3) / (B / 2)) % 2 === 0);
    [[39.8, ["F4", "A4", "C5"]], [40.6, ["G4", "Bb4", "D5"]], [41.4, ["A4", "C5", "E5"]]].forEach(([t, ch]) => { I.brass(t, ch, .3, 1.1); I.kick(t, .8); });
    for (let i = 0; i < 12; i++) I.snare(41.6 + i * .05, .2 + i * .05);
    // ¡Flash!
    I.shutter(42.2); I.crash(42.2, 1); I.kick(42.2, 1); I.brass(42.2, ["F4", "A4", "C5", "E5", "G5"], 1.2, 1.3); I.chime(42.25, ["C7", "E7", "G7"], .06, .6);
    // Foto congelada: reprise suave
    for (let t = 43.0; t < 46.4 - 1e-6; t += B) { const ib = Math.round((t - 43) / B) % 4, ch = PROG[Math.floor((t - 43) / BAR) % 4]; I.ride(t, .45); if (ib === 1) I.ep(t + B * SW, ch.ep, B * 1.4, .7); I.upright(t, ch.walk[ib], B * .8, .6); }
    // La foto se aplana y el fotógrafo se vuelve protagonista
    I.whoosh(46.3, .7, true, .9); I.pop(47.1, 1); I.heart(47.6, 1); I.heart(47.82, .75);
    I.pad(47.3, ["F3", "A3", "C4", "E4", "G4"], 7, 1, 1800); I.ooh(47.4, "A4", 6.5, .7); I.upright(47.3, "F2", 3, .8);
    // ta-dá final con el logotipo
    I.whoosh(48.7, .35, true, .7); I.brass(49.6, ["F4", "A4", "C5", "E5", "G5"], 1.6, 1.1); I.crash(49.6, .6); I.kick(49.6, .8);
    [["C6", 49.6], ["F6", 49.8], ["A6", 50.0], ["C7", 50.3]].forEach(([n, t]) => I.bell(t, n, .8, 0));
    return await ctx.startRendering();
  }
  return { render, DUR };
})();
