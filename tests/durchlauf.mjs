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
await ctx.route('**/config.js', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace('typ: "firebase"', 'typ: "lokal"') }); });
const seite = async url => { const p = await ctx.newPage(); p.on('pageerror', e => fehler.push(url + ': ' + e.message)); await p.goto(BASE + url); await warte(500); return p; };
const fenster = async p => (await p.isVisible('#overlay')) ? (await p.textContent('#overlay')).replace(/\s+/g, ' ').trim() : '';
const zu = async p => { for (let i = 0; i < 3; i++) { while (await p.isVisible('#overlay')) { await p.click('#overlay'); await warte(300); } while (await p.isVisible('#coach')) { await p.click('#coach'); await warte(150); } await warte(400); } };
async function halten(p, ms = 1100) {
  const k = await p.locator('#swSiegel').boundingBox();
  await p.mouse.move(k.x + k.width / 2, k.y + k.height / 2); await p.mouse.down(); await warte(ms); await p.mouse.up(); await warte(700);
}
const questOeffnen = async (p, id) => { await p.evaluate(i => document.querySelector(`.q-row[data-id="${i}"]`).click(), id); await warte(250); };
async function siegel(p, sel, erwartet, text) {
  await p.tap(sel); await warte(350); await halten(p);
  const f = await fenster(p);
  pruefe(f.includes(erwartet), `${text}: „${erwartet}“` + (f.includes(erwartet) ? "" : " (Fenster: " + f.slice(0, 120) + ")"));
  await zu(p); await warte(900);
  return f;
}

const admin = await seite('admin.html');
admin.on('dialog', d => d.accept());
await admin.click('#reset'); await warte(300);
const dennis = await seite('?direkt');

// Freitag im Zug: Log-Buch
await dennis.click('[data-logbuch]'); await warte(300);
for (let i = 0; i < 7; i++) { await dennis.fill('#lbInput', 'Antwort ' + (i + 1)); await dennis.click('#lbSeal'); await warte(250); await dennis.click('#lbNext'); await warte(150); }
await dennis.click('#lbClose'); await warte(300);
await siegel(dennis, '#questCard [data-ergebnis="bestanden"]', 'PRÜFUNG BESTANDEN', 'Rikes Tagebuch');

// Samstagmorgen: Prophezeiung und Amulett starten
await admin.click('#lauf .lauf-q[data-id="prophezeiung"] [data-a="start"]'); await warte(300);
await admin.click('#lauf .lauf-q[data-id="amulett"] [data-a="start"]'); await warte(500);
await zu(dennis);

// Wiese
await siegel(dennis, '#questCard [data-ergebnis="bestanden"]', 'SIDEQUEST BESTANDEN', 'Die drei Zeichen');
await siegel(dennis, '#questCard [data-ergebnis="verloren"]', 'PRÜFUNG VERLOREN', 'Wirbel der Götter');
const pod = await siegel(dennis, '#questCard [data-ergebnis="bestanden"]', 'PRÜFUNG BESTANDEN', 'Podrennen');
pruefe(pod.includes('Kleine Wasserpistole'), 'Podrennen bringt die Kleine Wasserpistole');
// Prophezeiung: ein Treffer unterwegs
await admin.click('#lauf .lauf-q[data-id="prophezeiung"] [data-a="plus"]'); await warte(500);
await zu(dennis);

// Wald: Kartenwurf mit Glanzsieg, dann Auge des Jägers mit der großen Pistole
const glanz = await siegel(dennis, '#questCard [data-ergebnis="glanz"]', 'GLANZSIEG', 'Kartenwurf');
pruefe(glanz.includes('Große Wasserpistole'), 'Glanzsieg bringt die Große Wasserpistole');
pruefe(await dennis.isVisible('#questCard [data-einsetzen="pistole_gross"]') && !(await dennis.$('#questCard [data-einsetzen="pistole_klein"]')) && !(await dennis.$('#questCard [data-einsetzen="spritze"]')), 'Auge: nur die große Pistole leuchtet');
await siegel(dennis, '#questCard [data-einsetzen="pistole_gross"]', 'GROSSE WASSERPISTOLE', 'Große Wasserpistole eingesetzt');
await siegel(dennis, '#questCard [data-ergebnis="bestanden"]', 'PRÜFUNG BESTANDEN', 'Auge des Jägers');
await siegel(dennis, '#questCard [data-ergebnis="bestanden"]', 'PRÜFUNG BESTANDEN', 'Klingen des Deku-Baums');

// Amulett gefunden, Aussicht, zweiter Treffer, Amulett zusammengesetzt
await questOeffnen(dennis, 'amulett');
await siegel(dennis, '#questCard [data-schritt="gefunden"]', 'GEFUNDEN', 'Amulett gefunden');
await questOeffnen(dennis, 'feuerprobe');
await siegel(dennis, '#questCard [data-ergebnis="bestanden"]', 'SIDEQUEST BESTANDEN', 'Hüter der Flamme');
await admin.click('#lauf .lauf-q[data-id="prophezeiung"] [data-a="plus"]'); await warte(500);
await zu(dennis);
await questOeffnen(dennis, 'amulett');
await siegel(dennis, '#questCard [data-ergebnis="bestanden"]', 'BESTANDEN', 'Amulett zusammengesetzt');

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
pruefe(abspann.includes('Kartenwurf · Glanzsieg') && abspann.includes('Große Wasserpistole') && abspann.includes('Prüfungen bestanden5 von 6'), 'Abspann: Glanzsieg, Beute und Zahlen des Tages');
for (let i = 0; i < 4 && await dennis.isVisible('#abSkip'); i++) { await dennis.click('#abSkip'); await warte(400); }
await dennis.click('[data-ab="zu"]'); await warte(400);
await admin.click('#lauf .lauf-q[data-id="prophezeiung"] [data-a="beendet"]'); await warte(500);
await zu(dennis);

// Hütte: Kästchen. Erwartung aus engine.js mit denselben Ergebnissen
const erwartet = E.derive(C, {
  quests: { logbuch: 'bestanden', klingen: 'bestanden', wirbel: 'verloren', podrennen: 'bestanden', kartenwurf: 'bestanden', auge: 'bestanden',
            deku: 'bestanden', feuerprobe: 'bestanden', bund: 'bestanden', prophezeiung: 'beendet', amulett: 'bestanden' },
  glanz: { kartenwurf: true }, zaehler: { prophezeiung: 2 }, schritte: { amulett: { gefunden: true } },
  zeiten: { logbuch: 1, klingen: 2, wirbel: 3, podrennen: 4, kartenwurf: 5, auge: 6, deku: 7, feuerprobe: 8, amulett: 9, bund: 10, prophezeiung: 11 }
});
pruefe((await dennis.textContent('#hudNextName')) === 'Zum Kästchen', 'Am Ende: Zum Kästchen');
pruefe(Number(await dennis.textContent('#packsVal')) === erwartet.packs, `Dennis: ${erwartet.packs} Packs wie engine.js`);
pruefe(Number(await admin.textContent('#packs')) === erwartet.packs, `Admin: ${erwartet.packs} Packs wie engine.js`);
const code = await dennis.$$eval('#tumblers .tumbler', els => els.map(e => e.textContent).join(''));
pruefe(code === C.code.join(''), 'Code vollständig: ' + code);
const inv = await admin.textContent('#inv');
pruefe(['Spritze', 'Kleine Pistole', 'Große Pistole', 'Kreisel', 'Stich', 'Schild', 'Nakama', 'Segen'].every(x => inv.includes(x)), 'Admin-Inventar: alle drei Wasserwaffen, Kreisel, Stich, Schild, Nakama-Ruf, Rikes Segen');
const liste = await admin.textContent('#dennisListe');
pruefe(liste.includes('Kartenwurf: Glanzsieg') && !liste.includes('gilt nicht'), 'Admin: alle Einträge von Dennis gelten, Kartenwurf als Glanzsieg');
await dennis.click('#hudNext'); await warte(400);
await dennis.screenshot({ path: `${OUT}/durchlauf-2-kaestchen.png` });
await zu(dennis);
// Ausrüstung am Ende
await dennis.evaluate(() => document.querySelector('.shoulder-right').click()); await warte(1000); await zu(dennis);
const slots = await dennis.$$eval('.slot', els => els.map(e => `${e.dataset.id}:${e.classList.contains('schatten') ? 'schatten' : [...e.classList].find(c => c.startsWith('st-'))}`));
pruefe(slots.every(x => !x.endsWith('schatten') || x.startsWith('karten_gepanzert')), 'Ausrüstung: alles erspielt außer den Gepanzerten Karten (Wirbel verloren)');
await dennis.screenshot({ path: `${OUT}/durchlauf-3-ausruestung.png` });
await ctx.close();
await b.close();
console.log(ok.map(t => 'ok    ' + t).join('\n'));
console.log(fehler.length ? fehler.map(t => 'FEHLT ' + t).join('\n') : 'Alles in Ordnung.');
process.exit(fehler.length ? 1 : 0);
