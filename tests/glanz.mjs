// Wasserwaffen in drei Stufen und Glanzsieg (28.09.): Die Spritze bringt seit 01.10. die Fee am Samstagmorgen (vorher Startitem),
// die kleine Pistole bringt das Podrennen, die große der Glanzsieg im Kartenwurf. Im Auge des Jägers leuchtet nur die stärkste.
// Dennis trägt den Glanzsieg selbst ein, der Quest Master sieht ihn, nimmt ihn zurück (es bleibt ein Sieg) und bucht ihn selbst.
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/glanz.mjs /tmp/shots
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:8765/';
const OUT = process.argv[2] || '.';
fs.mkdirSync(OUT, { recursive: true });
const ok = [], fehler = [];
const pruefe = (bed, text) => (bed ? ok : fehler).push(text);
const warte = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch();
const fenster = async p => (await p.isVisible('#overlay')) ? (await p.textContent('#overlay')).replace(/\s+/g, ' ').trim() : '';
const zu = async p => { while (await p.isVisible('#overlay')) { await p.click('#overlay'); await warte(300); } while (await p.isVisible('#coach')) { await p.click('#coach'); await warte(150); } };
async function halten(p, ms = 1100) {
  const k = await p.locator('#swSiegel').boundingBox();
  await p.mouse.move(k.x + k.width / 2, k.y + k.height / 2); await p.mouse.down(); await warte(ms); await p.mouse.up(); await warte(700);
}
const slot = (p, id) => p.$eval(`.slot[data-id="${id}"]`, e => e.classList.contains('schatten') ? 'schatten' : e.classList.contains('usable') ? 'leuchtet' : [...e.classList].find(c => c.startsWith('st-')));
const zurAusruestung = async p => { await p.evaluate(() => document.querySelector('.shoulder-right').click()); await warte(900); };   // Quests → Ausrüstung

// 1. Freitag (seit 01.10.): Der Beutel ist leer, vier Felder voller Schatten. Die Spritze bringt die Fee am Samstagmorgen.
{
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); p.on('pageerror', e => fehler.push('start: ' + e.message));
  await p.goto(BASE + '?demo=start&direkt'); await warte(700);
  await zu(p);
  await zurAusruestung(p);
  pruefe(!(await p.isVisible('#overlay')), 'Ausrüstung am Freitag: kein Fundfenster, es gibt noch nichts');
  pruefe((await p.textContent('#coach')).includes('Noch ist dein Beutel leer'), 'Die Fee: Noch ist dein Beutel leer, morgen früh bringt sie etwas');
  pruefe(await slot(p, 'spritze') === 'schatten' && await p.$eval('.slot[data-id="spritze"] .ic use', u => u.getAttribute('href')) === '#i-spritze', 'Feld der Wasserwaffen: Schatten der Spritze (kein Beutel mehr)');
  pruefe((await p.$$('#slotsGear .slot')).length === 4 && !(await p.$('.slot[data-id="beutel"]')), 'Vier Felder (01.10.): Wasser, Karten, Klinge, Nadel');
  await p.screenshot({ path: `${OUT}/glanz-1-freitag.png` });
  while (await p.isVisible('#coach')) { await p.click('#coach'); await warte(200); }
  pruefe(!(await p.$('.slot[data-id="pistole_klein"]')) && !(await p.$('.slot[data-id="pistole_gross"]')), 'Die Pistolen haben kein eigenes Feld, sie kommen später ins Feld der Spritze');
  await p.evaluate(() => document.querySelector('.slot[data-feld="nadel"]').click()); await warte(300);
  pruefe(await slot(p, 'nadel_fein') === 'schatten' && (await p.textContent('#itemBox')).includes('Splitter'), 'Feld der Nadel: Schatten, heißt noch Splitter');
  await p.evaluate(() => document.querySelector('.slot[data-id="spritze"]').click()); await warte(300);
  pruefe((await p.textContent('#itemBox')).includes('Zoras Tropfen') && (await p.textContent('#itemBox')).includes('Kommt bald'), 'Spritze am Freitag: Zoras Tropfen, kommt bald');
  await p.screenshot({ path: `${OUT}/glanz-2-ausruestung-start.png` });
  await ctx.close();
}
// Nach dem Morgen gehört die Spritze Dennis, von Rikes Fee
{
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); p.on('pageerror', e => fehler.push('mitte: ' + e.message));
  await p.goto(BASE + '?demo=mitte&direkt'); await warte(700);
  await zu(p);
  await zurAusruestung(p); await zu(p);
  await p.evaluate(() => document.querySelector('.slot[data-feld="klinge"]').click()); await warte(300);
  pruefe(await slot(p, 'klinge_rost') !== 'schatten' && (await p.textContent('#itemBox')).includes('Von Rikes Fee') && (await p.textContent('#itemBox')).includes('Stufe 1 von 2'), 'Nach dem Morgen: Verrostete Klinge, Stufe 1 von 2, von Rikes Fee');
  await ctx.close();
}

// 2. Admin und Dennis: Podrennen bringt die kleine Pistole, Glanzsieg im Kartenwurf die große
const ctx = await b.newContext({ viewport: { width: 852, height: 393 }, isMobile: true, hasTouch: true });
await ctx.route('**/config.js', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace('typ: "firebase"', 'typ: "lokal"') }); });
const seite = async url => { const p = await ctx.newPage(); p.on('pageerror', e => fehler.push(url + ': ' + e.message)); await p.goto(BASE + url); await warte(500); return p; };
const admin = await seite('admin.html');
await admin.$$eval('details', ds => ds.forEach(d => { d.open = true; }));
admin.on('dialog', d => d.accept());
await admin.click('#reset'); await warte(300);
const dennis = await seite('?direkt');
// Freigabe (30.09.): Der Quest Master gibt jede Quest frei. Dennis sieht die Fee, wandert auf der Karte zur Station,
// dann tritt die Quest aus dem Nebel. Wartet, bis er wieder auf der Quest-Seite steht.
async function frei(p = dennis) {
  if (await admin.isVisible('#freigeben')) { await admin.click('#freigeben'); await warte(800); }
  await zu(p);
  for (let i = 0; i < 24; i++) { if (await p.$('#overlay[hidden]') && !(await p.isVisible('#mapWalker')) && await p.evaluate(() => document.querySelector('.face.active').dataset.page) === '1') break; await warte(250); }
  await warte(500); await zu(p);
}
for (let i = 0; i < 3; i++) { await admin.click('#nextWin'); await warte(250); }          // Log-Buch, Wirbel, Die drei Zeichen
await zu(dennis); await warte(600);
await admin.click('#nextWin'); await warte(900);                                           // Podrennen
const pod = await fenster(dennis);
pruefe(pod.includes('Silberne Schuppe entpuppt sich als') && pod.includes('Kleine Wasserpistole'), 'Podrennen: Silberne Schuppe entpuppt sich als Kleine Wasserpistole');
const wasserFeld = () => dennis.$eval('.slot[data-feld="wasser"]', e => e.dataset.id);
pruefe(await wasserFeld() === 'pistole_klein', 'Im Feld der Spritze steckt jetzt die kleine Pistole');
await zu(dennis); await warte(1500);
await frei();

// Kartenwurf: Zeile GLANZSIEG mit Bedingung und getarnter Belohnung
await dennis.evaluate(() => document.querySelector('.q-row[data-id="kartenwurf"]').click()); await warte(300);
const karte = (await dennis.textContent('#questCard')).replace(/\s+/g, ' ');
pruefe(karte.includes('GLANZSIEG') && karte.includes('2 Karten Vorsprung') && karte.includes('Quellstab'), 'Kartenwurf: Zeile GLANZSIEG, Bedingung, Belohnung getarnt');
pruefe(await dennis.isVisible('#questCard [data-ergebnis="glanz"]'), 'Knopf GLANZSIEG');
await dennis.screenshot({ path: `${OUT}/glanz-3-karte.png` });
await dennis.tap('#questCard [data-ergebnis="glanz"]'); await warte(400);
pruefe((await dennis.textContent('#swKopf')).includes('GLANZSIEG') && (await dennis.textContent('#swFolgen')).includes('2 Karten Vorsprung'), 'Siegel: Glanzsieg mit Bedingung');
await dennis.screenshot({ path: `${OUT}/glanz-4-siegel.png` });
await halten(dennis);
const moment = await fenster(dennis);
pruefe(moment.includes('GLANZSIEG') && moment.includes('Zoras Quellstab entpuppt sich als') && moment.includes('Große Wasserpistole'), 'Moment: GLANZSIEG, Zoras Quellstab entpuppt sich als Große Wasserpistole');
await dennis.screenshot({ path: `${OUT}/glanz-5-moment.png` });
await warte(400);
pruefe((await admin.textContent('#verlauf')).includes('Kartenwurf: Glanzsieg'), 'Admin sieht „Kartenwurf: Glanzsieg“');
pruefe(await admin.getAttribute('#quests li[data-id="kartenwurf"] [data-v="glanz"]', 'aria-pressed') === 'true', 'Admin: Glanzsieg ist gedrückt');
await admin.screenshot({ path: `${OUT}/glanz-6-admin.png`, fullPage: true });
await zu(dennis); await warte(1500);
await frei();

// Auge des Jägers: nur die stärkste Wasserwaffe leuchtet
// Was Dennis hier mitnehmen kann, steht als Symbol neben AUSRÜSTEN (29.09.)
const hier = async () => dennis.$$eval('#questCard .ruest-minis [data-item]', els => els.map(e => e.dataset.item));
pruefe((await dennis.textContent('#hudNextName')) === 'Auge des Jägers', 'Weiter zum Auge des Jägers');
pruefe(JSON.stringify(await hier()) === '["pistole_gross","spruchrolle"]', 'Auge: von den Wasserwaffen leuchtet nur die Große Wasserpistole (dazu der Fluch)');
pruefe(await wasserFeld() === 'pistole_gross', 'Im selben Feld jetzt die große Pistole');
pruefe(await dennis.$eval('.q-row[data-id="kartenwurf"] .q-mark svg', e => e.classList.contains('glanz')), 'Quest-Liste: Stern beim Kartenwurf');
await dennis.screenshot({ path: `${OUT}/glanz-7-auge.png` });

// Quest Master nimmt den Glanz zurück: Es bleibt ein Sieg, die große Pistole ist weg, die kleine leuchtet
await admin.click('#quests li[data-id="kartenwurf"] [data-v="bestanden"]'); await warte(800);
const weg = await fenster(dennis);
pruefe(weg.includes('ZURÜCKGENOMMEN') && weg.includes('Glanzsieg bei Kartenwurf') && weg.includes('Es bleibt ein Sieg'), 'Fee: Glanzsieg zurückgenommen, es bleibt ein Sieg');
await dennis.screenshot({ path: `${OUT}/glanz-8-zurueck.png` });
await zu(dennis); await warte(400);
pruefe(JSON.stringify(await hier()) === '["pistole_klein","spruchrolle"]', 'Danach leuchtet die kleine Pistole (dazu der Fluch)');
pruefe(await wasserFeld() === 'pistole_klein', 'Das Feld springt zurück auf die kleine Pistole');
pruefe((await admin.textContent('#verlauf')).includes('gilt nicht'), 'Admin: Dennis’ Glanzsieg gilt nicht mehr');

// Quest Master bucht den Glanzsieg selbst: Dennis sieht den Moment wieder
await admin.click('#quests li[data-id="kartenwurf"] [data-v="glanz"]'); await warte(800);
pruefe((await fenster(dennis)).includes('GLANZSIEG'), 'Admin bucht Glanzsieg: Dennis sieht den Moment');
await zu(dennis); await warte(400);

// Verpasst: Dennis lädt neu, der Admin schaltet auf Verloren und dann wieder Glanzsieg, der Moment läuft nach PRESS START
await dennis.goto(BASE); await warte(600);
await admin.click('#quests li[data-id="kartenwurf"] [data-v="verloren"]'); await warte(300);
await dennis.click('#introScreen'); await warte(1500); await zu(dennis); await warte(500);
await dennis.goto(BASE); await warte(600);
await admin.click('#quests li[data-id="kartenwurf"] [data-v="glanz"]'); await warte(300);
await dennis.click('#introScreen'); await warte(1500);
pruefe((await fenster(dennis)).includes('GLANZSIEG'), 'Nach PRESS START: verpasster Glanzsieg läuft nach');
await ctx.close();

await b.close();
console.log(ok.map(t => 'ok    ' + t).join('\n'));
console.log(fehler.length ? fehler.map(t => 'FEHLT ' + t).join('\n') : 'Alles in Ordnung.');
process.exit(fehler.length ? 1 : 0);
