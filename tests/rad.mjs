// Buu Huus Rad (01.10.): Rad vor dem Siegel (Textbox und Siegel-Fenster), die lange Fluch-Szene, das Rad bleibt auf dem
// gewürfelten Feld stehen (auch mit Ruck), Überspringen erst nach der Auflösung, ALLES nimmt alle geschlossenen Packs,
// fehlende in Karten. Läuft in der Demo (?demo=mitte: zwei Flüche aus Die drei Zeichen, 1 geschlossenes Pack).
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/rad.mjs /tmp/shots
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:8765/';
const OUT = process.argv[2] || '.';
fs.mkdirSync(OUT, { recursive: true });
const ok = [], fehler = [];
const pruefe = (bed, text) => (bed ? ok : fehler).push(text);
const warte = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 780, height: 300 }, isMobile: true, hasTouch: true });   // Galaxy S24, Samsung Internet
await ctx.addInitScript(() => { try { localStorage.setItem('dq-brief-v1', '1'); localStorage.setItem('dq-brief-v1-probe', '1'); } catch (e) {} });   // ohne den Brief vor dem Titelbild (eigener Test: brief.mjs)
const p = await ctx.newPage();
p.on('pageerror', e => fehler.push('Seite: ' + e.message));
await p.goto(BASE + '?demo=mitte&direkt'); await warte(900);

const fenster = async () => (await p.isVisible('#overlay')) ? (await p.textContent('#overlay')).replace(/\s+/g, ' ').trim() : '';
const zu = async () => { for (let i = 0; i < 8 && await p.isVisible('#overlay'); i++) { await p.click('#overlay'); await warte(250); } while (await p.isVisible('#coach')) { await p.click('#coach'); await warte(150); } };
const seite = () => p.evaluate(() => document.querySelector('.face.active').dataset.page);
const zurAusruestung = async () => { for (let i = 0; i < 4 && await seite() !== '2'; i++) { await zu(); await p.evaluate(() => document.querySelector('.shoulder-right').click()); await warte(1300); } await zu(); };
const packs = async () => Number(await p.textContent('#packsVal'));
async function halten(ms = 1100) {
  await p.evaluate(() => { const r = document.getElementById('fsRad'); delete r.dataset.ziel; delete r.dataset.steht; delete r.dataset.ruck; });
  const k = await p.locator('#swSiegel').boundingBox();
  await p.mouse.move(k.x + k.width / 2, k.y + k.height / 2); await p.mouse.down(); await warte(ms); await p.mouse.up();
}
// Das Rad bleibt bei u stehen, mit dieser Chance auf ALLES (null: wie das Spiel sie rechnet)
const festlegen = (u, quote = null) => p.evaluate(([u, quote]) => {
  const E = QuestEngine; E._dw ??= E.diebWurf; E._ac ??= E.allesChance;
  E.diebWurf = (c, z, q) => E._dw(c, () => u, q);
  E.allesChance = quote == null ? E._ac : () => quote;
}, [u, quote]);
// Fluch sprechen: Ausrüstung, Fluch antippen, MITNEHMEN, Siegel halten. Wartet, bis das Rad steht.
async function sprechen() {
  await zurAusruestung();
  await p.click('.slot[data-id="spruchrolle"]'); await warte(300);
  await p.click('[data-mitnehmen]'); await warte(400);
  await halten();
  return steht();
}
// Wartet, bis das Rad der neuen Szene steht
async function steht() {
  for (let i = 0; i < 80 && await p.evaluate(() => document.getElementById('fsRad').dataset.steht == null); i++) await warte(200);
  return p.evaluate(() => ({ ...document.getElementById('fsRad').dataset }));
}
// Szene zu Ende: aufs Fenster warten, schließen
async function szeneEnde() {
  for (let i = 0; i < 60 && await p.isVisible('#fluchSzene'); i++) await warte(250);
  for (let i = 0; i < 20 && !(await p.isVisible('#overlay')); i++) await warte(150);
  const f = await fenster(); await zu(); return f;
}
// Der Quest Master nimmt den Fluch zurück (Demo: Dennis' letzter Eintrag), die Fee sagt es
async function zuruecknehmen() {
  await p.evaluate(() => document.querySelector('[data-demo="zurueck"]').click());
  for (let i = 0; i < 20 && !(await p.isVisible('#overlay')); i++) await warte(150);
  const f = await fenster(); await zu(); await warte(300); return f;
}

// 1. Erster Fluch: kein ALLES, weder im kleinen Rad noch in der Szene
await zurAusruestung();
await p.click('.slot[data-id="spruchrolle"]'); await warte(300);
const box = await p.textContent('#itemBox');
pruefe(box.includes('0 bis 3 Packs.') && !box.includes('ALLES'), 'Textbox: erster Fluch, „0 bis 3 Packs.“, kein ALLES');
pruefe((await p.$$('#itemBox .rad-mini path')).length === 4, 'Kleines Rad: vier Felder');
await p.click('[data-mitnehmen]'); await warte(400);
const sw = await p.textContent('#swFolgen');
pruefe(sw.includes('PREIS') && sw.includes('Buu Huu dreht am Rad') && await p.$('#swFolgen .rad-mini'), 'Siegel-Fenster: PREIS mit Buu Huus Rad');
pruefe(await p.evaluate(() => { const f = document.getElementById('swFolgen'); return f.scrollHeight <= f.clientHeight + 1; }), 'Siegel-Fenster: alles passt auf das Galaxy S24, nichts zu scrollen');
await p.screenshot({ path: `${OUT}/rad-1-siegel.png` });
await p.click('#swZurueck'); await warte(300);
await festlegen(0.95);
const vorher1 = await packs();
const t0 = Date.now();
await zurAusruestung();
await p.click('[data-mitnehmen]', { timeout: 2000 }).catch(async () => { await p.click('.slot[data-id="spruchrolle"]'); await p.click('[data-mitnehmen]'); }); await warte(400);
await halten();
await warte(800);
pruefe((await p.textContent('#fsText')).includes('DER FLUCH GREIFT'), 'Szene: Der Fluch greift');
await warte(3600);
pruefe(await p.evaluate(() => document.getElementById('fluchSzene').classList.contains('nacht')) && await p.$('#fluchSzene .fs-geist'), 'Szene: Licht aus, Buu Huu kreist um die Packs');
await p.screenshot({ path: `${OUT}/rad-2-nacht.png` });
await p.click('#fluchSzene'); await warte(300);
pruefe(await p.isVisible('#fluchSzene'), 'Vor der Auflösung lässt sich nichts wegtippen');
for (let i = 0; i < 30 && !(await p.evaluate(() => document.getElementById('fluchSzene').classList.contains('rad-da'))); i++) await warte(150);
pruefe((await p.$$('#fsScheibe .rad-feld')).length === 4, 'Großes Rad beim ersten Fluch: vier Felder, kein ALLES');
await warte(1500);
await p.screenshot({ path: `${OUT}/rad-3-dreht.png` });
for (let i = 0; i < 60 && await p.evaluate(() => document.getElementById('fsRad').dataset.steht == null); i++) await warte(150);
const bisStopp = Date.now() - t0;
pruefe(bisStopp > 7000 && bisStopp < 12500, `Bis das Rad steht: ${(bisStopp / 1000).toFixed(1)} s (gut acht Sekunden gewollt)`);
const r1 = await p.evaluate(() => ({ ...document.getElementById('fsRad').dataset }));
pruefe(r1.ziel === '3' && r1.steht === '3', 'Rad bleibt auf 3 stehen');
await warte(500);
pruefe((await p.textContent('#fsErgebnis')) === '−3', 'Auflösung: −3 in der Mitte');
await p.screenshot({ path: `${OUT}/rad-4-steht.png` });
const f1 = await szeneEnde();
pruefe(f1.includes('FLUCH GESPROCHEN') && f1.includes('Buu Huu wollte 3 Packs') && f1.includes('du hattest nur 1'), 'Fenster: Buu Huu wollte 3 Packs, du hattest nur 1');
pruefe(await packs() === Math.max(0, vorher1 - 3), 'Packs danach 0');
pruefe((await zuruecknehmen()).includes('stahl, ist zurück'), 'Zurückgenommen: die Packs sind zurück');
pruefe(await packs() === vorher1, 'Packs wie vorher');

// 2. Das Rad bleibt immer auf dem gewürfelten Feld stehen (mit 30 % ALLES, mal mit Ruck, mal ohne)
const landungen = [];
for (const u of [0.05, 0.4, 0.62, 0.72, 0.85, 0.99]) {
  await festlegen(u, 30);
  const r = await sprechen();
  landungen.push(`${u}: Feld ${r.ziel}, steht ${r.steht}${r.ruck ? ', Ruck' : ''}`);
  pruefe(r.ziel != null && r.ziel === r.steht, `Rad bei ${u}: gewürfelt Feld ${r.ziel}, steht auf ${r.steht}${r.ruck ? ' (mit Ruck)' : ''}`);
  pruefe(r.ziel === String([0, 0.21, 0.455, 0.63, 0.7].filter(g => u >= g).length - 1), `Rad bei ${u}: das richtige Feld`);
  await p.evaluate(() => document.getElementById('fluchSzene').click()); await warte(300);
  await szeneEnde();
  await zuruecknehmen();
}
console.log(landungen.join('\n'));

// 3. ALLES: rotes Feld im kleinen Rad, Wackeln und Rot in der Szene, alle geschlossenen Packs weg (mindestens 3)
await festlegen(0.85, 30);
await zurAusruestung();
await p.click('.slot[data-id="spruchrolle"]'); await warte(300);
pruefe((await p.textContent('#itemBox')).includes('oder ALLES!') && (await p.$$('#itemBox .rad-mini path')).length === 5, 'Mit Chance auf ALLES: rotes Feld im kleinen Rad');
await p.click('[data-mitnehmen]'); await warte(400);
pruefe((await p.textContent('#swFolgen')).includes('oder ALLES!'), 'Siegel-Fenster: „oder ALLES!“');
await halten();
await steht();
await warte(450);
pruefe((await p.textContent('#fsErgebnis')) === 'ALLES!' && await p.evaluate(() => document.getElementById('fluchSzene').classList.contains('rot')), 'ALLES: groß und rot');
pruefe(await p.evaluate(() => document.documentElement.classList.contains('fs-wackelt')), 'ALLES: das HUD wackelt');
await p.screenshot({ path: `${OUT}/rad-5-alles.png` });
const f3 = await szeneEnde();
pruefe(f3.includes('ALLES!') && f3.includes('dein letztes Pack'), 'Fenster: ALLES! Buu Huu holt sich dein letztes Pack');
pruefe(await packs() === 0, 'ALLES: keine geschlossenen Packs mehr');
await zuruecknehmen();

// 4. ALLES ohne geschlossene Packs: Karten aus den geöffneten (blind aus glänzenden und seltenen)
await zu();
await p.click('#hudPacks'); await warte(400);
await p.click('[data-oeffnen]'); await warte(400);
await halten(); await warte(900); await zu();
pruefe(await packs() === 0, 'Pack geöffnet: 0 geschlossen, 1 offen');
await festlegen(0.85, 30);
await sprechen();
await warte(2600);
pruefe((await p.textContent('#fsText')).includes('KEINE PACKS? MACHT NICHTS'), 'Szene: „Keine Packs? Macht nichts …“');
await p.screenshot({ path: `${OUT}/rad-6-karten.png` });
const f4 = await szeneEnde();
pruefe(f4.includes('ALLES!') && f4.includes('1 Karte blind aus deinen glänzenden und seltenen'), 'Fenster: der Bund zieht 1 Karte blind');
await zuruecknehmen();

// 5. Weniger Bewegung: keine Szene, gleich das Fenster
await p.emulateMedia({ reducedMotion: 'reduce' });
await festlegen(0.5, 0);
await zurAusruestung();
await p.click('.slot[data-id="spruchrolle"]'); await warte(300);
await p.click('[data-mitnehmen]'); await warte(400);
await halten(); await warte(900);
pruefe(!(await p.isVisible('#fluchSzene')) && (await fenster()).includes('FLUCH GESPROCHEN'), 'Weniger Bewegung: ohne Szene gleich das Fenster');

await b.close();
console.log(ok.map(t => 'ok    ' + t).join('\n'));
console.log(fehler.length ? fehler.map(t => 'FEHLT ' + t).join('\n') : 'Alles in Ordnung.');
process.exit(fehler.length ? 1 : 0);
