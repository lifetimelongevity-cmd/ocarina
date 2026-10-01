// Der Morgen (01.10.): Am Freitag hat Dennis kein Item. Am Samstagmorgen stößt der Quest Master die Zwischensequenz an
// (oder sie kommt mit der Freigabe des Wirbels): Sonnenaufgang, die Fee bringt den Beutel, Buu Huu will ihn stehlen, ein
// Lichtblitz jagt ihn davon, vier Basis-Items kommen heraus, „DAS ABENTEUER BEGINNT“. Danach die Freigabe wie sonst.
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/morgen.mjs /tmp/shots
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:8765/';
const OUT = process.argv[2] || '.';
fs.mkdirSync(OUT, { recursive: true });
const ok = [], fehler = [];
const pruefe = (bed, text) => (bed ? ok : fehler).push(text);
const warte = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch();

// Galaxy S24 quer in Chrome mit Statusleiste (knappster Fall). Admin und Dennis im selben Browser, Speicher „lokal“
const ctx = await b.newContext({ viewport: { width: 780, height: 280 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await ctx.addInitScript(() => { try { localStorage.setItem('dq-brief-v1', '1'); localStorage.setItem('dq-brief-v1-probe', '1'); } catch (e) {} });   // ohne den Brief vor dem Titelbild (eigener Test: brief.mjs)
await ctx.route('**/config.js', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace('typ: "firebase"', 'typ: "lokal"') }); });
const seite = async url => { const p = await ctx.newPage(); p.on('pageerror', e => fehler.push(url + ': ' + e.message)); await p.goto(BASE + url); await warte(500); return p; };
const fenster = async p => (await p.isVisible('#overlay')) ? (await p.textContent('#overlay')).replace(/\s+/g, ' ').trim() : '';
const zu = async p => { while (await p.isVisible('#overlay')) { await p.click('#overlay'); await warte(300); } while (await p.isVisible('#coach')) { await p.click('#coach'); await warte(150); } };
const phase = p => p.evaluate(() => document.querySelector('#morgen').hidden ? '' : document.querySelector('#morgen').dataset.phase);
const besitz = p => p.evaluate(() => [...document.querySelectorAll('#slotsGear .slot')].filter(s => !s.classList.contains('schatten')).map(s => s.dataset.id));
const quest = async (admin, id, v) => { await admin.click(`#quests li[data-id="${id}"] .seg button[data-v="${v}"]`); await warte(500); };

const admin = await seite('admin.html');
admin.on('dialog', d => d.accept());
await admin.$$eval('details', ds => ds.forEach(d => { d.open = true; }));
await admin.click('#reset'); await warte(300);

// ---------- 1. Freitag: kein Item, auch nach dem Tagebuch nicht ----------
let dennis = await seite('?direkt&morgen');
await zu(dennis);
await dennis.click('.shoulder-right'); await warte(900); await zu(dennis);
pruefe((await besitz(dennis)).length === 0, 'Freitag: Ausrüstung nur Schatten, auch keine Spritze');
pruefe(await dennis.$$eval('#slotsGear .slot', s => s.length) === 4, 'Vier Felder für Items (Wasser, Karten, Klinge, Nadel)');
await dennis.screenshot({ path: `${OUT}/morgen-0-freitag.png` });
await admin.click('#freigeben'); await warte(400);
await quest(admin, 'logbuch', 'bestanden');
await warte(600); await zu(dennis);
pruefe((await besitz(dennis)).length === 0, 'Nach dem Tagebuch: noch immer kein Item');
pruefe(await admin.isVisible('#morgenBox') && (await admin.textContent('#nextTitle')) === 'Wirbel der Götter', 'Admin: als Nächstes der Wirbel, Knopf „Der Morgen beginnt“ ist da');
pruefe((await admin.textContent('#freiHint')).includes('Der Morgen läuft dann vorher von selbst'), 'Admin: Hinweis, dass die Freigabe den Morgen mitbringt');

// ---------- 2. Der Quest Master stößt den Morgen an ----------
await admin.click('#morgenBtn'); await warte(700);
pruefe(!(await admin.isVisible('#morgenBox')), 'Admin: Knopf weg, sobald der Morgen gelaufen ist');
pruefe(await admin.$$eval('#verlauf li[data-art="m"]', l => l.length) === 1, 'Admin: Der Morgen steht im Verlauf');
pruefe(await phase(dennis) === 'nacht', 'Dennis: Die Szene beginnt in der Nacht');
const gesehen = [];
for (let k = 0; k < 30 && await phase(dennis); k++) {
  const ph = await phase(dennis);
  if (!gesehen.includes(ph)) {
    gesehen.push(ph);
    await warte(ph === 'items' ? 2600 : 1300);
    await dennis.screenshot({ path: `${OUT}/morgen-${gesehen.length}-${ph}.png` });
    if (ph === 'items') {
      pruefe(await dennis.$$eval('.mg-item.da', l => l.length) === 4, 'Items: alle vier sind herausgesprungen');
      pruefe((await dennis.textContent('#mgItems')).includes('STUFE 1 VON 3') && (await dennis.textContent('#mgItems')).includes('Leere Hülle'), 'Items: Name und Stufe 1');
    }
    if (ph === 'titel') pruefe((await dennis.textContent('.mg-titel')).includes('DAS ABENTEUER BEGINNT'), 'Titel: DAS ABENTEUER BEGINNT');
  }
  await dennis.click('#morgen', { position: { x: 200, y: 120 } }); await warte(250);
  if (await phase(dennis) === ph) { await dennis.click('#morgen', { position: { x: 200, y: 120 } }); await warte(250); }
}
pruefe(JSON.stringify(gesehen) === JSON.stringify(['nacht', 'morgen', 'geist', 'zerrt', 'abwehr', 'flucht', 'beutel', 'items', 'titel']), 'Alle Phasen der Reihe nach: ' + gesehen.join(', '));
pruefe(!(await phase(dennis)) && !(await dennis.isVisible('#overlay')), 'Danach: Szene zu, kein Fenster (die Quest ist noch nicht freigegeben)');
await dennis.click('.shoulder-right'); await warte(900);
pruefe(JSON.stringify(await besitz(dennis)) === JSON.stringify(['spritze', 'huelle', 'klinge_rost', 'nadel_fein']), 'Ausrüstung: die vier Basis-Items, statt: ' + await besitz(dennis));
pruefe(await dennis.$$eval('#slotsGear .slot.neu', l => l.length) === 4, 'Ausrüstung: alle vier mit NEU');
await dennis.screenshot({ path: `${OUT}/morgen-a-ausruestung.png` });
await dennis.click('.shoulder-left'); await warte(900);

// Freigabe danach: keine zweite Szene, die Fee schickt Dennis zur Talstation
await admin.click('#freigeben'); await warte(800);
pruefe(!(await phase(dennis)) && (await fenster(dennis)).includes('WEITER ZUR TALSTATION'), 'Freigabe des Wirbels: keine zweite Szene, Fenster der Fee');
await zu(dennis);

// ---------- 3. Vergessen: Die Freigabe bringt den Morgen mit, erst die Szene, dann die Freigabe ----------
await admin.click('#reset'); await warte(800);
await zu(dennis); await dennis.close();
dennis = await seite('?direkt&morgen');
await zu(dennis);
await admin.click('#freigeben'); await warte(300);
await quest(admin, 'logbuch', 'bestanden');
await warte(500); await zu(dennis);
await admin.click('#freigeben'); await warte(800);
pruefe(await phase(dennis) && !(await dennis.isVisible('#overlay')), 'Freigabe ohne Morgen: erst die Szene, kein Fenster darüber');
await dennis.click('#mgSkip'); await warte(400);
pruefe(await phase(dennis) === 'items', 'ÜBERSPRINGEN springt zu den Items');
await dennis.click('#mgSkip'); await warte(600);
pruefe(!(await phase(dennis)) && (await fenster(dennis)).includes('WEITER ZUR TALSTATION'), 'Nochmal ÜBERSPRINGEN: Szene zu, dann die Freigabe');
pruefe(await admin.isHidden('#morgenBox'), 'Admin: Morgen gilt mit der Freigabe, kein Knopf mehr');
await zu(dennis);

// ---------- 4. Nachgeholt: App zu, als der Morgen kam ----------
await admin.click('#reset'); await warte(800);
await zu(dennis);
await admin.click('#freigeben'); await warte(300);
await quest(admin, 'logbuch', 'bestanden');
await warte(500); await zu(dennis);
await dennis.close();
await admin.click('#morgenBtn'); await warte(300);
await admin.click('#freigeben'); await warte(300);
dennis = await seite('?direkt&morgen');
await warte(500);
pruefe(await phase(dennis) === 'nacht' && !(await dennis.isVisible('#overlay')), 'Nachgeholt: erst der Morgen');
await dennis.click('#mgSkip'); await warte(300); await dennis.click('#mgSkip'); await warte(700);
pruefe((await fenster(dennis)).includes('WEITER ZUR TALSTATION'), 'Nachgeholt: danach die Freigabe');
await zu(dennis);
await dennis.close();
dennis = await seite('?direkt&morgen');
await warte(600);
pruefe(!(await phase(dennis)), 'Neu geladen: der Morgen kommt nicht noch einmal');

// ---------- 5. Ohne ?morgen (Tests, Laptop mit ?direkt): keine Szene, die Items sind trotzdem da ----------
await admin.click('#reset'); await warte(800);
await dennis.close();
dennis = await seite('?direkt');
await zu(dennis);
await admin.click('#freigeben'); await warte(300);
await quest(admin, 'logbuch', 'bestanden');
await warte(500); await zu(dennis);
await admin.click('#morgenBtn'); await warte(700);
pruefe(!(await phase(dennis)), '?direkt ohne ?morgen: keine Szene');
await dennis.click('.shoulder-right'); await warte(900); await zu(dennis);
pruefe((await besitz(dennis)).length === 4, '?direkt: die vier Items sind trotzdem da');

// ---------- 6. Admin: Löschen im Verlauf nimmt den Morgen zurück ----------
await admin.click('#verlauf li[data-art="m"] .zurueck'); await warte(700);
pruefe(await admin.isVisible('#morgenBox'), 'Admin: Morgen gelöscht, Knopf wieder da');
pruefe((await besitz(dennis)).length === 0, 'Dennis: Items wieder weg');

ok.forEach(t => console.log('ok    ' + t));
fehler.forEach(t => console.log('FEHLER ' + t));
console.log(fehler.length ? `${fehler.length} Fehler.` : 'Alles in Ordnung.');
await b.close();
process.exit(fehler.length ? 1 : 0);
