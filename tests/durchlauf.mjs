// Der ganze Tag einmal durchgespielt, wie am 3. Oktober: Dennis trägt alles selbst ein (Siegel halten), der Quest Master
// startet die laufenden Quests und bucht Treffer. Vom Log-Buch bis zum offenen Kästchen, mit Glanzsieg im Kartenwurf.
// Am Ende müssen Dennis und der Admin dieselben Packs, Ziffern und Items zeigen wie engine.js.
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/durchlauf.mjs /tmp/shots
import { chromium } from 'playwright';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const C = require('../app/config.js');
const E = require('../app/engine.js');

const BASE = 'http://localhost:8765/';
const OUT = process.argv[2] || '.';
fs.mkdirSync(OUT, { recursive: true });
const ok = [], fehler = [];
const pruefe = (bed, text) => (bed ? ok : fehler).push(text);
const warte = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 852, height: 393 }, isMobile: true, hasTouch: true });
await ctx.addInitScript(() => { try { localStorage.setItem('dq-brief-v1', '1'); localStorage.setItem('dq-brief-v1-probe', '1'); } catch (e) {} });   // ohne den Brief vor dem Titelbild (eigener Test: brief.mjs)
await ctx.route('**/config.js', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace('typ: "firebase"', 'typ: "lokal"') }); });
const seite = async url => { const p = await ctx.newPage(); p.on('pageerror', e => fehler.push(url + ': ' + e.message)); await p.goto(BASE + url); await warte(500); return p; };
const fenster = async p => (await p.isVisible('#overlay')) ? (await p.textContent('#overlay')).replace(/\s+/g, ' ').trim() : '';
const zu = async p => { for (let i = 0; i < 3; i++) { while (await p.isVisible('#overlay')) { await p.click('#overlay'); await warte(300); } while (await p.isVisible('#coach')) { await p.click('#coach'); await warte(150); } await warte(400); } };
async function halten(p, ms = 1100) {
  const k = await p.locator('#swSiegel').boundingBox();
  await p.mouse.move(k.x + k.width / 2, k.y + k.height / 2); await p.mouse.down(); await warte(ms); await p.mouse.up(); await warte(700);
}
// Ausrüsten beim Spiel (29.09.): AUSRÜSTEN auf der Quest-Karte, Felder antippen (C-Tasten), MITNEHMEN, Siegel halten
async function ausruesten(p, qid, ids) {
  await p.tap(`#questCard [data-ausruesten="${qid}"]`); await warte(1300);
  for (const id of ids) { await p.tap(`.slot[data-id="${id}"]`); await warte(200); }
  await p.tap('[data-mitnehmen]'); await warte(350); await halten(p);
  // Mit Fluch: die Szene lässt sich erst nach der Auflösung überspringen
  for (let i = 0; i < 80 && await p.isVisible('#fluchSzene') && !(await p.evaluate(() => document.getElementById('fluchSzene').classList.contains('steht'))); i++) await warte(200);
  if (await p.isVisible('#fluchSzene')) { await p.click('#fluchSzene'); await warte(500); }
  const f = await fenster(p);
  await zu(p); await warte(900);
  return f;
}
const questOeffnen = async (p, id) => { await p.evaluate(i => document.querySelector(`.q-row[data-id="${i}"]`).click(), id); await warte(250); };
async function siegel(p, sel, erwartet, text) {
  await p.tap(sel); await warte(350); await halten(p);
  const f = await fenster(p);
  pruefe(f.includes(erwartet), `${text}: „${erwartet}“` + (f.includes(erwartet) ? "" : " (Fenster: " + f.slice(0, 120) + ")"));
  await zu(p); await warte(900);
  await frei(p);                               // der Quest Master gibt die nächste Quest frei
  return f;
}
// Freigabe (30.09.): Der Quest Master gibt jede Quest frei. Dennis sieht die Fee, wandert auf der Karte zur Station,
// dann tritt die Quest aus dem Nebel. Wartet, bis er wieder auf der Quest-Seite steht.
async function frei(p = dennis) {
  if (await admin.isVisible('#freigeben')) { await admin.click('#freigeben'); await warte(800); }
  await zu(p);
  for (let i = 0; i < 24; i++) { if (await p.$('#overlay[hidden]') && !(await p.isVisible('#mapWalker')) && await p.evaluate(() => document.querySelector('.face.active').dataset.page) === '1') break; await warte(250); }
  await warte(500); await zu(p);
}

const admin = await seite('admin.html');
await admin.$$eval('details', ds => ds.forEach(d => { d.open = true; }));
admin.on('dialog', d => d.accept());
await admin.click('#reset'); await warte(300);
const dennis = await seite('?direkt&morgen');
await frei();

// Freitag im Zug: Log-Buch
await dennis.click('[data-logbuch]'); await warte(300);
for (let i = 0; i < 7; i++) {
  await dennis.fill('#lbInput', 'Antwort ' + (i + 1)); await dennis.click('#lbSeal'); await warte(250); await dennis.click('#lbNext'); await warte(150);
  // Nach Frage 1 macht der Schattendieb aus Rikes Antwort eine Quest (30.09.): durchtippen, bis er geflohen ist
  for (let k = 0; k < 30 && await dennis.isVisible('#geistRuf'); k++) { await dennis.click('#geistRuf', { timeout: 1500 }).catch(() => {}); await warte(200); }
}
await dennis.click('#lbClose'); await warte(300);
await dennis.tap('#questCard [data-ergebnis="bestanden"]'); await warte(350); await halten(dennis);
pruefe((await fenster(dennis)).includes('PRÜFUNG BESTANDEN'), 'Rikes Tagebuch: „PRÜFUNG BESTANDEN“');
await zu(dennis); await warte(600);
pruefe(await dennis.$$eval('#slotsGear .slot.schatten', l => l.length) === 4, 'Freitag: noch kein Item');

// Samstagmorgen (01.10.): Der Quest Master stößt den Morgen an, die Fee bringt die vier Basis-Items. Dann Amulett starten.
await admin.click('#morgenBtn'); await warte(900);
pruefe(await dennis.isVisible('#morgen'), 'Samstagmorgen: die Zwischensequenz läuft');
for (let i = 0; i < 3 && await dennis.isVisible('#morgen'); i++) { await dennis.click('#mgSkip'); await warte(500); }
pruefe(await dennis.$$eval('#slotsGear .slot.schatten', l => l.length) === 0, 'Nach dem Morgen: alle vier Felder mit Stufe 1');
await admin.click('#lauf .lauf-q[data-id="amulett"] [data-a="start"]'); await warte(500);
await zu(dennis);
await frei();

// Talstation: seit 01.10. erst der Wirbel, dann Die drei Zeichen (dort beginnen die Flüche), dann Speed Flip
await siegel(dennis, '#questCard [data-ergebnis="verloren"]', 'PRÜFUNG VERLOREN', 'Wirbel der Götter');
const zeichen = await siegel(dennis, '#questCard [data-ergebnis="bestanden"]', 'SIDEQUEST BESTANDEN', 'Die drei Zeichen');
pruefe(zeichen.includes('+2') && zeichen.includes('Einen davon schenkt dir Buu Huu'), 'Die drei Zeichen: zwei Flüche, einen schenkt Buu Huu');
const pod = await siegel(dennis, '#questCard [data-ergebnis="bestanden"]', 'PRÜFUNG BESTANDEN', 'Speed Flip');
pruefe(pod.includes('Kleine Wasserpistole'), 'Speed Flip bringt die Kleine Wasserpistole');

// Wald: Kartenwurf mit Glanzsieg, dann Auge des Jägers mit der großen Pistole
const glanz = await siegel(dennis, '#questCard [data-ergebnis="glanz"]', 'GLANZSIEG', 'Kartenwurf');
pruefe(glanz.includes('Große Wasserpistole'), 'Glanzsieg bringt die Große Wasserpistole');
pruefe(await dennis.isVisible('#questCard [data-ausruesten="auge"]'), 'Auge: AUSRÜSTEN auf der Quest-Karte');
await dennis.tap('#questCard [data-ausruesten="auge"]'); await warte(1300);
const leuchtet = await dennis.$$eval('.slot.usable', els => els.map(e => e.dataset.id));
pruefe(leuchtet.includes('pistole_gross') && !leuchtet.includes('pistole_klein') && !leuchtet.includes('spritze'), 'Auge: nur die große Pistole leuchtet (' + leuchtet.join(', ') + ')');
await dennis.evaluate(() => document.querySelector('.shoulder-left').click()); await warte(1300);
const ausgeruestet = await ausruesten(dennis, 'auge', ['pistole_gross']);
pruefe(ausgeruestet.includes('AUSGERÜSTET') && ausgeruestet.includes('Große Wasserpistole'), 'Große Wasserpistole mitgenommen: „AUSGERÜSTET“');
pruefe((await dennis.textContent('#questCard .dabei-zeile')).includes('Große Pistole') && await dennis.evaluate(() => document.querySelector('.face.active').dataset.page) === '1', 'Danach zurück auf QUESTS, DABEI: Große Pistole');
await siegel(dennis, '#questCard [data-ergebnis="bestanden"]', 'PRÜFUNG BESTANDEN', 'Auge des Jägers');
await siegel(dennis, '#questCard [data-ergebnis="bestanden"]', 'PRÜFUNG BESTANDEN', 'Klingen des Deku-Baums');

// Amulett gefunden, Aussicht, Amulett zusammengesetzt
await questOeffnen(dennis, 'amulett');
await siegel(dennis, '#questCard [data-schritt="gefunden"]', 'GEFUNDEN', 'Amulett gefunden');
await questOeffnen(dennis, 'feuerprobe');
await siegel(dennis, '#questCard [data-ergebnis="bestanden"]', 'SIDEQUEST BESTANDEN', 'Hüter der Flamme');
await questOeffnen(dennis, 'amulett');
await siegel(dennis, '#questCard [data-ergebnis="bestanden"]', 'BESTANDEN', 'Amulett zusammengesetzt');
// Rikes Rache (29.09.): nach Hüter der Flamme, die dicke Nadel vom Deku-Baum leuchtet, der Sieg bringt Ziffer 4
await questOeffnen(dennis, 'rache');
await dennis.tap('#questCard [data-ausruesten="rache"]'); await warte(1300);
const nadeln = await dennis.$$eval('.slot.usable', els => els.map(e => e.dataset.id));
pruefe(nadeln.includes('nadel_dick') && !nadeln.includes('nadel_fein'), 'Rikes Rache: die dicke Nadel leuchtet, nicht die feine');
await dennis.evaluate(() => document.querySelector('.shoulder-left').click()); await warte(1300);
const rache = await siegel(dennis, '#questCard [data-ergebnis="bestanden"]', 'PRÜFUNG BESTANDEN', 'Rikes Rache');
pruefe(rache.includes('Ziffer 4'), 'Rikes Rache bringt Ziffer 4');

// Gipfel: alle vier Ziffern da, also kein Tor. Revanche Wirbel der Götter, dann zweimal aufgefüllt. Sieg, Niederlage, Sieg.
await questOeffnen(dennis, 'bund');
pruefe(!(await dennis.$('#questCard [data-tor]')), 'Gipfel: mit allen vier Ziffern kein Tor');
await questOeffnen(dennis, 'bund');
const duelle = await dennis.$$eval('.duell .d-name', els => els.map(e => e.textContent.replace(/\s+/g, ' ').trim()));
pruefe(duelle.length === 3 && duelle[0].includes('Wirbel der Götter REVANCHE'), 'Showdown: zuerst die Revanche im Wirbel der Götter');
await dennis.screenshot({ path: `${OUT}/durchlauf-1-gipfel.png` });
for (const [nr, v] of [[1, 'sieg'], [2, 'niederlage'], [3, 'sieg']]) {
  await questOeffnen(dennis, 'bund');
  await siegel(dennis, `[data-duell="${nr}"][data-v="${v}"]`, `DUELL ${nr} ${v === 'sieg' ? 'GEWONNEN' : 'VERLOREN'}`, `Duell ${nr}`);
}
await questOeffnen(dennis, 'bund');
await siegel(dennis, '#questCard [data-ergebnis="bestanden"]', 'PRÜFUNG BESTANDEN', 'Prüfung des Bundes');
// Das Finale: Siegbildschirm, Geschichte, Abspann. Die Zahlen im Abspann stimmen mit dem Tag überein
pruefe(await dennis.evaluate(() => document.getElementById('abspann').dataset.phase) === 'sieg', 'Finale: Siegbildschirm nach dem Bund');
const abspann = await dennis.textContent('#abRoll');
pruefe(abspann.includes('Kartenwurf · Glanzsieg') && abspann.includes('Große Wasserpistole') && abspann.includes('Prüfungen bestanden6 von 7'), 'Abspann: Glanzsieg, Beute und Zahlen des Tages');
for (let i = 0; i < 4 && await dennis.isVisible('#abSkip'); i++) { await dennis.click('#abSkip'); await warte(400); }
await dennis.click('[data-ab="zu"]'); await warte(400);

// Hütte: Kästchen. Erwartung aus engine.js mit denselben Ergebnissen
const erwartet = E.derive(C, {
  quests: { logbuch: 'bestanden', wirbel: 'verloren', klingen: 'bestanden', podrennen: 'bestanden', kartenwurf: 'bestanden', auge: 'bestanden',
            deku: 'bestanden', feuerprobe: 'bestanden', rache: 'bestanden', bund: 'bestanden', amulett: 'bestanden' },
  glanz: { kartenwurf: true }, schritte: { amulett: { gefunden: true } },
  zeiten: { logbuch: 1, wirbel: 2, klingen: 3, podrennen: 4, kartenwurf: 5, auge: 6, deku: 7, feuerprobe: 8, amulett: 9, rache: 10, bund: 11 }
});
pruefe((await dennis.textContent('#hudNextName')) === 'Zum Kästchen', 'Am Ende: Zum Kästchen');
pruefe(Number(await dennis.textContent('#packsVal')) === erwartet.packs, `Dennis: ${erwartet.packs} Packs wie engine.js`);
pruefe(Number(await admin.textContent('#packs')) === erwartet.packs, `Admin: ${erwartet.packs} Packs wie engine.js`);
const code = await dennis.$$eval('#tumblers .tumbler', els => els.map(e => e.textContent).join(''));
pruefe(code === C.code.join(''), 'Code vollständig: ' + code);
const inv = await admin.textContent('#inv');
pruefe(['Spritze', 'Kleine Pistole', 'Große Pistole', 'Hülle', 'Klinge', 'Stich', 'Feine Nadel', 'Dicke Nadel', 'Fluch', 'Segen'].every(x => inv.includes(x)) && !inv.includes('Nakama') && !inv.includes('Kreisel') && !inv.includes('Schild'), 'Admin-Inventar: alle drei Wasserwaffen, Hülle, beide Klingen und Nadeln, Flüche, Rikes Segen, kein Kreisel, kein Schild');
const liste = await admin.textContent('#verlauf');
pruefe(liste.includes('Kartenwurf: Glanzsieg') && !liste.includes('gilt nicht'), 'Admin: alle Einträge von Dennis gelten, Kartenwurf als Glanzsieg');
await dennis.click('#hudNext'); await warte(400);
await dennis.screenshot({ path: `${OUT}/durchlauf-2-kaestchen.png` });
await zu(dennis);
// Ausrüstung am Ende
await dennis.evaluate(() => document.querySelector('.shoulder-right').click()); await warte(1000); await zu(dennis);
const slots = await dennis.$$eval('.slot', els => els.map(e => `${e.dataset.id}:${e.classList.contains('schatten') ? 'schatten' : [...e.classList].find(c => c.startsWith('st-'))}`));
pruefe(slots.every(x => !x.endsWith('schatten')) && slots.some(x => x.startsWith('huelle:')) && slots.some(x => x.startsWith('stich:')) && slots.some(x => x.startsWith('nadel_dick:')), 'Ausrüstung: kein Schatten, Karten bleiben bei der Leeren Hülle (Wirbel verloren), Stich und dicke Nadel');
await dennis.screenshot({ path: `${OUT}/durchlauf-3-ausruestung.png` });
await ctx.close();
await b.close();
console.log(ok.map(t => 'ok    ' + t).join('\n'));
console.log(fehler.length ? fehler.map(t => 'FEHLT ' + t).join('\n') : 'Alles in Ordnung.');
process.exit(fehler.length ? 1 : 0);
