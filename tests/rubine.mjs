// Packs unterwegs öffnen (29.09.): Die Zahl oben sind Dennis' geschlossene Packs, wie Rubine. Er öffnet eins per Siegel,
// der Admin sieht es live. Reichen die geschlossenen nicht, zahlt er in Karten (je geöffnetem Pack höchstens eine).
// Dazu Rikes Rache: Hauptquest am Aussichtspunkt mit Ziffer 4, die Nadeln aus Wirbel und Deku-Baum sind dort einsetzbar.
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/rubine.mjs /tmp/shots
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:8765/';
const OUT = process.argv[2] || '.';
fs.mkdirSync(OUT, { recursive: true });
const ok = [], fehler = [];
const pruefe = (bed, text) => (bed ? ok : fehler).push(text);
const warte = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch();

// Admin und Dennis im selben Browser, Speicher „lokal“: beide Seiten sehen sich über localStorage
const ctx = await b.newContext({ viewport: { width: 852, height: 393 }, isMobile: true, hasTouch: true });
await ctx.route('**/config.js', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace('typ: "firebase"', 'typ: "lokal"') }); });
const seite = async url => { const p = await ctx.newPage(); p.on('pageerror', e => fehler.push(url + ': ' + e.message)); await p.goto(BASE + url); await warte(500); return p; };
const fenster = async p => (await p.isVisible('#overlay')) ? (await p.textContent('#overlay')).replace(/\s+/g, ' ').trim() : '';
const zu = async p => { while (await p.isVisible('#overlay')) { await p.click('#overlay', { position: { x: 5, y: 5 } }); await warte(300); } while (await p.isVisible('#coach')) { await p.click('#coach'); await warte(150); } };
async function halten(p, ms = 1100) {
  const k = await p.locator('#swSiegel').boundingBox();
  await p.mouse.move(k.x + k.width / 2, k.y + k.height / 2); await p.mouse.down(); await warte(ms); await p.mouse.up(); await warte(700);
}
async function buchen(n, grund) {
  await admin.fill('#customAmount', String(n)); await admin.fill('#customReason', grund);
  await admin.click('#customForm button[type="submit"]'); await warte(900);
}
async function oeffnen() {
  await dennis.click('#hudPacks'); await warte(400);
  await dennis.click('[data-oeffnen]'); await warte(400);
  await halten(dennis);
}

const admin = await seite('admin.html');
await admin.$$eval('details', ds => ds.forEach(d => { d.open = true; }));
admin.on('dialog', d => d.accept());
await admin.click('#reset').catch(() => {});
const dennis = await seite('?direkt');
await zu(dennis);
// Freigabe (30.09.): Der Quest Master gibt jede Quest frei. Dennis sieht die Fee, wandert auf der Karte zur Station,
// dann tritt die Quest aus dem Nebel. Wartet, bis er wieder auf der Quest-Seite steht.
async function frei(p = dennis) {
  if (await admin.isVisible('#freigeben')) { await admin.click('#freigeben'); await warte(800); }
  await zu(p);
  for (let i = 0; i < 24; i++) { if (await p.$('#overlay[hidden]') && !(await p.isVisible('#mapWalker')) && await p.evaluate(() => document.querySelector('.face.active').dataset.page) === '1') break; await warte(250); }
  await warte(500); await zu(p);
}

// Drei Packs gewonnen, dann eins öffnen
await buchen(3, 'Test: drei Packs');
await zu(dennis);
await dennis.click('#hudPacks'); await warte(400);
const packsFenster = await fenster(dennis);
pruefe(packsFenster.includes('3 PACKS') && packsFenster.includes('geschlossen') && await dennis.isVisible('[data-oeffnen]'), 'Packs-Fenster: 3 geschlossen, Knopf PACK ÖFFNEN');
await dennis.screenshot({ path: `${OUT}/rubine-1-fenster.png` });
await dennis.click('[data-oeffnen]'); await warte(400);
pruefe(await dennis.isVisible('#schwur') && (await dennis.textContent('#swKopf')).includes('Pack öffnen'), 'Siegel-Fenster „Pack öffnen“');
await dennis.screenshot({ path: `${OUT}/rubine-2-siegel.png` });
await halten(dennis);
const moment = await fenster(dennis);
pruefe(moment.includes('PACK GEÖFFNET') && moment.includes('Noch 2 geschlossen'), 'Moment „Pack geöffnet“, noch 2 geschlossen');
await dennis.screenshot({ path: `${OUT}/rubine-3-moment.png` });
await zu(dennis);
pruefe((await dennis.textContent('#packsVal')) === '2', 'HUD zeigt 2 geschlossene');
pruefe(await dennis.$eval('#packRow', r => r.querySelectorAll('.ic-card.offen').length) === 1, 'HUD: ein geöffnetes Pack hinter den geschlossenen');
await warte(500);
pruefe((await admin.textContent('#packs')) === '2' && (await admin.textContent('#packsMax')).includes('1 offen'), 'Admin: 2 Packs, 1 offen');
pruefe((await admin.textContent('#verlauf')).includes('Pack geöffnet'), 'Admin sieht „Pack geöffnet“ live');

// Die anderen beiden auch öffnen: danach kein Knopf mehr
await oeffnen(); await zu(dennis);
await oeffnen(); await zu(dennis);
pruefe((await dennis.textContent('#packsVal')) === '0', 'Alle drei geöffnet: 0 geschlossen');
await dennis.click('#hudPacks'); await warte(400);
pruefe(!(await dennis.isVisible('[data-oeffnen]')) && (await fenster(dennis)).includes('3 geöffnet'), 'Bei 0 kein Knopf zum Öffnen, 3 geöffnet');
await zu(dennis);

// Eine Niederlage ohne geschlossene Packs: Er zahlt in Karten
await buchen(-2, 'Test: Niederlage');
const karten = await fenster(dennis);
pruefe(karten.includes('2 Karten') && karten.includes('glänzenden und seltenen'), 'Niederlage bei 0: Moment nennt 2 Karten, blind aus den glänzenden und seltenen');
await dennis.screenshot({ path: `${OUT}/rubine-4-karten.png` });
await zu(dennis);
pruefe((await admin.textContent('#kappung')).includes('Karten an den Bund: 2'), 'Admin: Karten an den Bund: 2');
// Mehr Karten als geöffnete Packs gibt es nicht: der Rest verpufft
await buchen(-2, 'Test: noch eine Niederlage');
await zu(dennis);
const hinweis = await admin.textContent('#kappung');
pruefe(hinweis.includes('Karten an den Bund: 3') && hinweis.includes('Verpufft') && hinweis.includes(': 1'), 'Admin: 3 Karten, 1 verpufft');
await admin.screenshot({ path: `${OUT}/rubine-5-admin.png`, fullPage: true });

// Zurücknehmen: ein Öffnen weg, dann zahlt er einen Pack mehr und eine Karte weniger
await admin.click('#verlauf li[data-von="dennis"] .zurueck'); await warte(1500);
pruefe((await fenster(dennis)).includes('ZURÜCKGENOMMEN'), 'Zurücknehmen des Öffnens: Fee meldet es');
await zu(dennis);
pruefe((await admin.textContent('#packsMax')).includes('2 offen') && (await admin.textContent('#kappung')).includes('Karten an den Bund: 2'), 'Nach dem Zurücknehmen: 2 offen, 2 Karten');

// Schnellbuchung „Pack geöffnet“ im Admin
await buchen(2, 'Test: zwei dazu');
await zu(dennis);
const vorher = +(await admin.textContent('#packs'));
await admin.click('#quick button:has-text("Pack geöffnet")'); await warte(900);
pruefe(+(await admin.textContent('#packs')) === vorher - 1 && (await fenster(dennis)).includes('PACK GEÖFFNET'), 'Schnellbuchung „Pack geöffnet“ zählt wie das Siegel');
await zu(dennis);

// Rikes Rache: nach Hüter der Flamme, mit Nadeln aus Wirbel und Deku-Baum, trägt Ziffer 4
await admin.click('#reset').catch(() => {}); await warte(800);
const vorRache = ['logbuch', 'wirbel', 'klingen', 'podrennen', 'kartenwurf', 'auge', 'deku', 'feuerprobe'];
for (const id of vorRache) { await admin.click(`#quests li[data-id="${id}"] .seg button[data-v="bestanden"]`).catch(() => fehler.push('Admin-Knopf fehlt: ' + id)); await warte(250); }
await warte(800); await zu(dennis); await warte(600); await zu(dennis);
await frei();
pruefe((await admin.textContent('#nextTitle')).includes('Rikes Rache'), 'Nach Hüter der Flamme ist Rikes Rache dran');
pruefe((await dennis.textContent('#hudNextName')).includes('Rikes Rache'), 'Dennis: nächste Quest Rikes Rache');
await dennis.click('#hudNext'); await warte(600);
const karte = (await dennis.textContent('#questCard').catch(() => '')) || '';
pruefe(karte.includes('Rike hat verraten'), 'Quest-Karte zeigt den Text von Rikes Rache');
pruefe(await dennis.$$eval('#questCard .ruest-minis [data-item]', xs => xs.map(x => x.dataset.item)).then(ids => ids.includes('nadel_dick') && !ids.includes('nadel_fein')), 'AUSRÜSTEN: nur die dicke Nadel (sie löst die feine Nadel ab)');
await dennis.screenshot({ path: `${OUT}/rubine-6-rache.png` });
const ziffern = await dennis.$$eval('#tumblers .tumbler', ts => ts.map(t => t.textContent));
pruefe(ziffern[3] === '?' && ziffern.slice(0, 3).every(z => z !== '?'), 'Vor Rikes Rache fehlt nur Ziffer 4');

console.log(ok.map(t => 'ok    ' + t).join('\n'));
if (fehler.length) { console.log(fehler.map(t => 'FEHLER ' + t).join('\n')); process.exitCode = 1; }
else console.log('Alles in Ordnung.');
await b.close();
