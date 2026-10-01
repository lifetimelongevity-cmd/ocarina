// Die finale Schlacht (01.10.): Vor der Prüfung des Bundes kämpft Rikes Fee am Gipfelkreuz gegen Buu Huu, danach erscheinen
// die drei Duelle und „DIE FINALE SCHLACHT BEGINNT“. Kommt erst, wenn der Bund freigegeben und das Tor offen ist (alle vier
// Ziffern), einmal pro Handy und Freigabe, nicht mehr, sobald ein Duell eingetragen ist.
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/schlacht.mjs /tmp/shots
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
// Andere Größe: GROESSE=852x393 node tests/schlacht.mjs …
const [W, H] = (process.env.GROESSE || '780x280').split('x').map(Number);
const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await ctx.addInitScript(() => { try { localStorage.setItem('dq-brief-v1', '1'); localStorage.setItem('dq-brief-v1-probe', '1'); } catch (e) {} });   // ohne den Brief vor dem Titelbild (eigener Test: brief.mjs)
await ctx.route('**/config.js', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace('typ: "firebase"', 'typ: "lokal"') }); });
const seite = async url => { const p = await ctx.newPage(); p.on('pageerror', e => fehler.push(url + ': ' + e.message)); await p.goto(BASE + url); await warte(500); return p; };
const phase = p => p.evaluate(() => document.querySelector('#schlacht').hidden ? '' : document.querySelector('#schlacht').dataset.phase);
// Fenster zu, bis nichts mehr kommt (auch der Weg auf der Karte und das Aufdecken)
const zu = async p => { for (let i = 0; i < 4; i++) { while (await p.isVisible('#overlay')) { await p.click('#overlay'); await warte(300); } await warte(900); } };
const seitenNr = p => p.evaluate(() => document.querySelector('.face.active').dataset.page);

const admin = await seite('admin.html?probe');
admin.on('dialog', d => d.accept());
await admin.$$eval('details', ds => ds.forEach(d => { d.open = true; }));
let dennis = await seite('?probe&direkt&schlacht');

// ---------- 1. Vor dem Bund mit zwei fehlenden Ziffern: erst das Tor, keine Schlacht ----------
await admin.click('#szenarien button:has-text("Vor dem Bund")'); await warte(800);
await zu(dennis);
pruefe(!(await phase(dennis)), 'Tor zu (zwei Ziffern fehlen): keine Schlacht');
pruefe(!!(await dennis.$('#questCard [data-tor]')), 'Quest-Karte zeigt das Tor');
pruefe((await admin.textContent('#freiHint')).includes('finale Schlacht') || await admin.isHidden('#freiHint'), 'Admin: Hinweis auf die Schlacht bei der Freigabe (oder schon frei)');
await admin.click('#buyDigits button:has-text("per Buße")'); await warte(600);
await zu(dennis);
pruefe(!(await phase(dennis)), 'Eine Ziffer fehlt noch: keine Schlacht');

// ---------- 2. Letzte Ziffer: Fenster, dann die Schlacht ----------
await admin.click('#buyDigits button:has-text("per Buße")'); await warte(800);
pruefe((await dennis.textContent('#overlay')).includes('Das Tor ist offen') && !(await phase(dennis)), 'Letzte Ziffer: erst das Fenster, Schlacht wartet');
await dennis.click('#overlay'); await warte(900);
pruefe(await phase(dennis) === 'gipfel', 'Fenster zu: Die Schlacht beginnt am Gipfel');
const gesehen = [];
for (let k = 0; k < 40 && await phase(dennis); k++) {
  const ph = await phase(dennis);
  if (!gesehen.includes(ph)) {
    gesehen.push(ph);
    await warte(ph === 'duelle' ? 2200 : ph === 'kampf' ? 1600 : 1300);
    await dennis.screenshot({ path: `${OUT}/schlacht-${gesehen.length}-${ph}.png` });
    if (ph === 'kampf') {
      const st = await dennis.$eval('.sl-strahl.fee', e => getComputedStyle(e).transform);
      pruefe(st !== 'none' && !st.startsWith('matrix(0'), 'Kampf: Die Strahlen sind ausgefahren');
      await warte(2400);
      continue;                          // der Kampf geht von selbst weiter
    }
    if (ph === 'duelle') {
      const t = await dennis.textContent('#slDuelle');
      pruefe(await dennis.$$eval('#slDuelle .mg-item.da', l => l.length) === 3, 'Duelle: alle drei sind erschienen');
      pruefe(t.includes('DUELL 1') && t.includes('REVANCHE') && t.includes('Auge des Jägers'), 'Duelle: Nummer, Revanche und Name: ' + t.replace(/\s+/g, ' ').slice(0, 120));
    }
    if (ph === 'titel') { pruefe((await dennis.textContent('#schlacht .mg-titel')).includes('DIE FINALE SCHLACHT BEGINNT'), 'Titel: DIE FINALE SCHLACHT BEGINNT'); await warte(3000); continue; }
    if (ph === 'gipfel') { await warte(1600); continue; }
  }
  await dennis.click('#schlacht', { position: { x: 390, y: 80 } }); await warte(250);
  if (await phase(dennis) === ph) { await dennis.click('#schlacht', { position: { x: 390, y: 80 } }); await warte(250); }
}
pruefe(JSON.stringify(gesehen) === JSON.stringify(['gipfel', 'ankunft', 'drohung', 'trotz', 'kampf', 'patt', 'rat', 'hohn', 'duelle', 'titel']), 'Alle Phasen der Reihe nach: ' + gesehen.join(', '));
await warte(800);
pruefe(!(await phase(dennis)) && !(await dennis.isVisible('#overlay')) && await seitenNr(dennis) === '1', 'Danach: Szene zu, kein Fenster, QUESTS');
pruefe((await dennis.textContent('#questCard')).includes('Prüfung des Bundes'), 'Quest-Karte: Prüfung des Bundes');
await dennis.screenshot({ path: `${OUT}/schlacht-z-quests.png` });

// ---------- 3. Kein zweites Mal ----------
await dennis.reload(); await warte(2500); await zu(dennis);
pruefe(!(await phase(dennis)), 'Neu geladen: keine zweite Schlacht');

// ---------- 4. Überspringen: springt zu den Duellen, dort beendet es ----------
await dennis.evaluate(() => localStorage.removeItem('dq-schlacht-v1-probe'));
await dennis.reload(); await warte(2500);
pruefe(await phase(dennis) === 'gipfel', 'Neues Handy: Die Schlacht kommt nach dem Laden');
await dennis.click('#slSkip'); await warte(400);
pruefe(await phase(dennis) === 'duelle', 'ÜBERSPRINGEN springt zu den Duellen');
await dennis.click('#slSkip'); await warte(700);
pruefe(!(await phase(dennis)), 'Nochmal ÜBERSPRINGEN: Szene zu');

// ---------- 5. Ein Duell ist schon eingetragen: keine Schlacht mehr ----------
await dennis.evaluate(() => localStorage.removeItem('dq-schlacht-v1-probe'));
await admin.click('.duel-list button[data-nr="1"][data-v="sieg"]'); await warte(600);
await dennis.reload(); await warte(2500); await zu(dennis);
pruefe(!(await phase(dennis)), 'Duell 1 eingetragen: keine Schlacht mehr');

console.log(`\n${ok.length} ok, ${fehler.length} Fehler`);
ok.forEach(t => console.log('  ✓ ' + t));
fehler.forEach(t => console.log('  ✗ ' + t));
await b.close();
process.exit(fehler.length ? 1 : 0);
