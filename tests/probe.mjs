// Probelauf und Rückgängig: admin.html?probe und /?probe zusammen, das echte Spiel bleibt unberührt.
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/probe.mjs /tmp/shots
// Lokaler Speicher (config.js wird im Test auf typ "lokal" umgeschrieben): alle Tabs teilen sich den Browser-Speicher.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:8765/';
const OUT = process.argv[2] || '.';
fs.mkdirSync(OUT, { recursive: true });
const fehler = [], ok = [], dialoge = [];
const pruefe = (bed, text) => (bed ? ok : fehler).push(text);

const b = await chromium.launch();
const ctx = await b.newContext();
await ctx.route('**/config.js', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace('typ: "firebase"', 'typ: "lokal"') }); });
await ctx.route('**firebasedatabase.app**', r => r.abort());
const seite = async (url, w, h) => {
  const p = await ctx.newPage();
  p.on('pageerror', e => fehler.push(url + ': ' + e.message));
  p.on('dialog', d => { dialoge.push(d.message()); d.accept(); });
  await p.setViewportSize({ width: w, height: h });
  await p.goto(BASE + url);
  await p.waitForTimeout(400);
  return p;
};
const warte = ms => new Promise(r => setTimeout(r, ms));

// Echtes Spiel: leer, ohne Probe-Band
const echt = await seite('admin.html', 390, 844);
await echt.click('#reset'); await warte(200);
pruefe(await echt.$eval('#probeBand', e => e.hidden), 'Echter Admin: kein Probe-Band');
pruefe((await echt.textContent('#probeLink')).includes('Probelauf öffnen'), 'Echter Admin: Knopf „Probelauf öffnen"');

// Probelauf: Admin und Dennis
const admin = await seite('admin.html?probe', 390, 844);
const dennis = await seite('?probe&direkt', 852, 393);
pruefe(!(await admin.$eval('#probeBand', e => e.hidden)), 'Probe-Admin: rotes Band sichtbar');
pruefe((await admin.$$('#szenarien button')).length === 6, 'Probe-Admin: sechs Sprungknöpfe');
pruefe(await dennis.evaluate(() => document.documentElement.classList.contains('probe')), 'Dennis ?probe: roter Rahmen');
pruefe(await dennis.evaluate(() => document.querySelector('link[rel="manifest"]').getAttribute('href') === 'probe.webmanifest'), 'Dennis ?probe: eigenes Home-Bildschirm-Icon');
pruefe(await dennis.evaluate(() => window.QuestStore.PROBE), 'Dennis ?probe liest den Probelauf');
while (await dennis.$('#coach:not([hidden])')) { await dennis.click('#coach'); await warte(150); }

// Springen: vor dem Bund
await admin.click('#szenarien button:has-text("Vor dem Bund")'); await warte(700);
pruefe((await admin.textContent('#nextTitle')).includes('Bundes'), 'Sprung „Vor dem Bund": nächste Quest ist der Bund');
pruefe((await admin.$$('.duel-list li')).length === 3, 'Sprung „Vor dem Bund": drei Duelle stehen');
while (await dennis.$('#overlay:not([hidden])')) { await dennis.click('#overlay'); await warte(300); }
pruefe((await dennis.textContent('#hudNextName')).includes('Bundes'), 'Dennis zeigt den Bund als nächste Quest');
pruefe((await echt.textContent('#nextTitle')).includes('Log-Buch') && (await echt.textContent('#packs')) === '0', 'Echtes Spiel bleibt unberührt');
await admin.screenshot({ path: `${OUT}/probe-admin.png`, fullPage: true });

// Vertippt: Verloren gebucht, Dennis sieht das Fenster, Rückgängig schließt es still
await admin.click('#nextLose'); await warte(700);
pruefe(!(await dennis.$eval('#overlay', e => e.hidden)) && (await dennis.textContent('#overlay')).includes('VERLOREN'), 'Dennis sieht „VERLOREN"');
await dennis.screenshot({ path: `${OUT}/probe-dennis-verloren.png` });
pruefe((await admin.textContent('#undoWas')).includes('Prüfung des Bundes: verloren'), 'Rückgängig zeigt, was es zurücknimmt');
await admin.click('#undo'); await warte(700);
pruefe(await dennis.$eval('#overlay', e => e.hidden), 'Rückgängig: Fenster bei Dennis geht still zu');
pruefe((await admin.textContent('#nextTitle')).includes('Bundes'), 'Rückgängig: Bund ist wieder offen');
pruefe((await admin.textContent('#undoWas')).includes('Vor dem Bund'), 'Rückgängig: davor liegt der Sprung');

// Noch einmal zurück: Stand vor dem Sprung (leer), Verlauf leer
await admin.click('#undo'); await warte(500);
pruefe((await admin.textContent('#nextTitle')).includes('Log-Buch'), 'Zweites Rückgängig: wieder am Start');
pruefe(await admin.$eval('#undo', e => e.disabled), 'Verlauf leer: Knopf aus');

// Verlauf überlebt ein Neuladen (iPhone lädt oft neu)
await admin.click('#szenarien button:has-text("Mitte")'); await warte(300);
await admin.reload(); await warte(500);
pruefe((await admin.textContent('#undoWas')).includes('Probe: Mitte'), 'Verlauf überlebt Neuladen');
await admin.click('#undo'); await warte(300);

// Keine Schulden: Strafe bei 0 Packs, Dennis erfährt warum sich nichts tut
while (await dennis.$('#overlay:not([hidden])')) { await dennis.click('#overlay'); await warte(300); }
await admin.click('#quick button:has-text("Strafe")'); await warte(700);
pruefe((await dennis.textContent('#overlay')).includes('keine Packs mehr'), 'Strafe bei 0: „keine Packs mehr"');
pruefe(!(await admin.$eval('#kappung', e => e.hidden)), 'Admin zeigt, was bei 0 nicht abgezogen wurde');

// Zweites Admin-Gerät ändert dazwischen: Rückgängig fragt nach, statt still zu überschreiben
await admin.click('#quick button:has-text("Bonus")'); await warte(300);
const admin2 = await seite('admin.html?probe', 390, 844);
await admin2.click('#quick button:has-text("Strafe")'); await warte(500);
await admin.click('#undo'); await warte(300);
pruefe(dialoge.filter(m => m.includes('anderen Gerät')).length === 1, 'Rückgängig fragt nur nach, wenn ein anderes Gerät dazwischen geändert hat');

// Echtes Spiel hat davon nichts
await echt.reload(); await warte(400);
pruefe((await echt.textContent('#packs')) === '0' && (await echt.$$('#ledger li:not(.empty)')).length === 0, 'Echtes Spiel: keine Buchung aus dem Probelauf');
pruefe((await echt.textContent('#undoWas')) === 'Zurückgesetzt', 'Echtes Spiel: eigener Verlauf (nur das eigene Zurücksetzen)');

await b.close();
console.log(ok.map(t => 'ok   ' + t).join('\n'));
console.log(fehler.length ? fehler.map(t => 'FEHLT ' + t).join('\n') : 'Alles in Ordnung.');
process.exit(fehler.length ? 1 : 0);
