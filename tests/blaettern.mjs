// Blättern mit Z und R (30.09.): ohne 3D, flüssig auch bei schnellem Tippen, Tasten ohne clip-path
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/blaettern.mjs
// Wie auf Dennis' Galaxy S24: 780 × 360, dreifache Pixeldichte, alle Effekte an (kein html.schwach), CPU vierfach gedrosselt.
import { chromium } from 'playwright';

const BASE = 'http://localhost:8765/';
const ok = [], fehler = [];
const pruefe = (bed, text) => (bed ? ok : fehler).push(text);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 780, height: 360 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await ctx.addInitScript(() => { Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 }); Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 }); });
await ctx.route('**firebasedatabase.app**', r => r.abort());
const p = await ctx.newPage();
p.on('pageerror', e => fehler.push('Seitenfehler: ' + e.message));
const cdp = await ctx.newCDPSession(p);
await p.goto(BASE + '?demo'); await p.waitForTimeout(800);
pruefe(!(await p.evaluate(() => document.documentElement.classList.contains('schwach'))), 'Alle Effekte an wie auf dem S24');
await p.click('#introScreen'); await p.waitForTimeout(1500);
while (await p.$('#coach:not([hidden])')) { await p.click('#coach'); await p.waitForTimeout(200); }

const zustand = () => p.evaluate(() => ({
  aktiv: document.querySelector('.face.active').dataset.page,
  dreht: document.querySelector('#game').classList.contains('dreht'),
  sichtbar: [...document.querySelectorAll('.face')].filter(f => getComputedStyle(f).visibility === 'visible').map(f => f.dataset.page),
  versetzt: [...document.querySelectorAll('.face')].filter(f => getComputedStyle(f).transform !== 'none').length
}));

// Kein 3D mehr: weder Perspektive noch preserve-3d noch clip-path an den Tasten
const stil = await p.evaluate(() => ({
  p3d: [...document.querySelectorAll('.stage, .stage *')].some(e => getComputedStyle(e).transformStyle === 'preserve-3d' || getComputedStyle(e).perspective !== 'none'),
  clip: [...document.querySelectorAll('.shoulder')].map(e => getComputedStyle(e).clipPath),
  form: document.querySelectorAll('.shoulder .shoulder-form polygon').length
}));
pruefe(!stil.p3d, 'Bühne ohne preserve-3d und Perspektive');
pruefe(stil.clip.every(c => c === 'none') && stil.form === 2, 'Z und R: Form als SVG, kein clip-path');

// Eine Drehung: Die alte Seite gleitet hinaus, die neue herein, danach ist nur die neue sichtbar
const lauf = await p.evaluate(() => new Promise(res => {
  const out = []; document.querySelector('.shoulder-right').click(); const t0 = performance.now();
  const f = () => { const t = performance.now() - t0; out.push([...document.querySelectorAll('.face')].map(e => Math.round(e.getBoundingClientRect().left))); if (t < 300) requestAnimationFrame(f); else res(out); };
  requestAnimationFrame(f);
}));
pruefe(lauf.some(l => l[1] < 0 && l[2] > 45 && l[2] < 780), 'R: Quests gleiten nach links hinaus, Ausrüstung von rechts herein');
await p.waitForTimeout(400);
let z = await zustand();
pruefe(z.aktiv === '2' && !z.dreht && z.sichtbar.join() === '2' && z.versetzt === 0, `Nach der Drehung nur die Ausrüstung, nichts versetzt (${JSON.stringify(z)})`);

// Flüssig: Bildzeiten und lange Aufgaben über viele Drehungen, dazu die Fläche der Grafikebenen
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await cdp.send('LayerTree.enable');
let maxFlaeche = 0;
cdp.on('LayerTree.layerTreeDidChange', e => { if (e.layers) maxFlaeche = Math.max(maxFlaeche, e.layers.filter(l => l.drawsContent).reduce((s, l) => s + l.width * l.height, 0)); });
await p.evaluate(() => { window.__f = []; let l = performance.now(); const t = n => { window.__f.push(n - l); l = n; requestAnimationFrame(t); }; requestAnimationFrame(t);
  window.__lt = []; new PerformanceObserver(l => l.getEntries().forEach(e => window.__lt.push(Math.round(e.duration)))).observe({ type: 'longtask' }); });
for (let r = 0; r < 2; r++) for (const s of ['.shoulder-left', '.shoulder-left', '.shoulder-left', '.shoulder-right', '.shoulder-right', '.shoulder-right']) { await p.click(s); await p.waitForTimeout(650); }
// Schnelles Tippen mitten in die Drehung
for (let i = 0; i < 12; i++) { await p.click(i % 4 === 3 ? '.shoulder-left' : '.shoulder-right'); await p.waitForTimeout(90); }
await p.waitForTimeout(800);
const m = await p.evaluate(() => { const f = window.__f.slice(1).sort((a, b) => a - b); return { max: Math.round(f[f.length - 1]), lang: window.__lt.length, summe: window.__lt.reduce((a, b) => a + b, 0) }; });
const bildschirme = maxFlaeche / (780 * 360);
pruefe(m.summe < 300, `Lange Aufgaben beim Blättern zusammen unter 300 ms (${m.lang}, ${m.summe} ms, mit 3D waren es 11 bis 14 und 750 bis 900 ms)`);
pruefe(m.max < 100, `Kein Bild länger als 100 ms (${m.max} ms)`);
pruefe(bildschirme < 12, `Grafikebenen höchstens 12 Bildschirme groß (${bildschirme.toFixed(1)})`);
z = await zustand();
pruefe(!z.dreht && z.sichtbar.length === 1 && z.sichtbar[0] === z.aktiv && z.versetzt === 0, `Nach schnellem Tippen: eine Seite, ruhig (${JSON.stringify(z)})`);
pruefe(await p.isVisible('.shoulder-left') && await p.isVisible('.shoulder-right') && await p.isVisible('.hud'), 'Z, R und HUD bleiben sichtbar');

await b.close();
ok.forEach(t => console.log('ok   ', t));
fehler.forEach(t => console.log('FEHLER', t));
console.log(fehler.length ? `${fehler.length} Fehler` : 'Alles in Ordnung.');
process.exit(fehler.length ? 1 : 0);
