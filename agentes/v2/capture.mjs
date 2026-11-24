// Captura del reel con Edge headless vía Chrome DevTools Protocol.
//   node capture.mjs --fmt h --stills 2,6.1,9.5 --out dir     -> PNG sueltos para revisión
//   node capture.mjs --fmt h --video out.mp4 [--fps 30] [--audio audio.wav]
import { spawn } from "node:child_process";
import fs from "node:fs"; import path from "node:path"; import os from "node:os";

const A = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith("--") ? a.push([v.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true]) : 0, a), []));
const FMT = A.fmt === "v" ? "v" : "h", W = FMT === "h" ? 1920 : 1080, H = FMT === "h" ? 1080 : 1920;
const FPS = +(A.fps || 30); let DUR = 50; const PORT = 9300 + Math.floor(Math.random() * 500);
const EDGE = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(fs.existsSync);
const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const URL_ = "file:///" + path.join(HERE, A.dir || "", "index.html").replace(/\\/g, "/") + `?f=${FMT}&capture=1`;
const prof = fs.mkdtempSync(path.join(os.tmpdir(), "reel-"));
const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, "--hide-scrollbars", "--mute-audio",
  `--window-size=${W},${H}`, "--force-device-scale-factor=1", "--autoplay-policy=no-user-gesture-required", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let targets; for (let i = 0; i < 60; i++) { try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); if (targets.find(t => t.type === "page")) break; } catch { } await sleep(250); }
const ws = new WebSocket(targets.find(t => t.type === "page").webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map(), evs = [];
ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } else if (d.method) evs.push(d); };
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, d => d.error ? rej(new Error(method + ": " + d.error.message)) : res(d.result)); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async name => { for (;;) { const i = evs.findIndex(e => e.method === name); if (i >= 0) return evs.splice(i, 1)[0]; await sleep(30); } };
const js = async (expr, awaitPromise = false) => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 600)); return r.result.value; };

await send("Page.enable"); await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: URL_ }); await ev("Page.loadEventFired");
await js("__ready.then(()=>1)", true); await sleep(300); DUR = (await js("window.__DUR")) || DUR;
const shot = async (t, fmt = "jpeg") => { await js(`__render(${t})`); return Buffer.from((await send("Page.captureScreenshot", { format: fmt, quality: 93, captureBeyondViewport: false })).data, "base64"); };

try {
  if (A.stills) {
    const out = A.out || "stills"; fs.mkdirSync(out, { recursive: true });
    for (const t of String(A.stills).split(",").map(Number)) { fs.writeFileSync(path.join(out, `${FMT}_${t.toFixed(2)}.png`), await shot(t, "png")); process.stdout.write(`${t} `); }
    console.log("\nok");
  }
  if (A.audio) {
    const len = await js("__audio()", true); let b64 = "";
    for (let i = 0; i < len; i += 1 << 20) b64 += await js(`__chunk(${i},${1 << 20})`);
    fs.writeFileSync(A.audio, Buffer.from(b64, "base64")); console.log("audio", A.audio, fs.statSync(A.audio).size);
  }
  if (A.video) {
    const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-movflags", "+faststart", A.video], { stdio: ["pipe", "inherit", "inherit"] });
    const N = Math.round(DUR * FPS), t0 = Date.now();
    for (let f = 0; f < N; f++) {
      const buf = await shot(f / FPS);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
      if (f % 75 === 0) console.log(`frame ${f}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await new Promise(r => ff.on("close", r)); console.log("video", A.video, ((Date.now() - t0) / 1000).toFixed(0) + "s");
  }
} finally { ws.close(); edge.kill(); }
process.exit(0);
