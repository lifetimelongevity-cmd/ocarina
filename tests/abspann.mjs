// Finale: Siegbildschirm, Geschichte als Laufschrift, Abspann mit THE END. Einmal pro Handy von selbst, danach über
// das Code-Fenster. Nimmt der Quest Master den Bund zurück, geht alles still zu und kommt beim nächsten Ende wieder.
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/abspann.mjs /tmp/shots
import { chromium } from 'playwright';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const C = require('../app/config.js');

const BASE = 'http://localhost:8765/';
const OUT = process.argv[2] || '.';
fs.mkdirSync(OUT, { recursive: true });
const ok = [], fehler = [];
const pruefe = (bed, text) => (bed ? ok : fehler).push(text);
const warte = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch();
const phase = p => p.evaluate(() => { const el = document.getElementById('abspann'); return el.hidden ? 'zu' : el.dataset.phase; });
const zu = async p => { for (let i = 0; i < 3; i++) { while (await p.isVisible('#overlay')) { await p.click('#overlay'); await warte(300); } while (await p.isVisible('#coach')) { await p.click('#coach'); await warte(150); } await warte(300); } };

// 1. Demo am Ende des Tages: Das Finale startet von selbst
{
  const ctx = await b.newContext({ viewport: { width: 852, height: 393 }, isMobile: true, hasTouch: true });
  await ctx.route('**firebasedatabase.app**', r => r.abort());
  const p = await ctx.newPage(); p.on('pageerror', e => fehler.push('Demo: ' + e.message));
  await p.goto(BASE + '?demo=ende&direkt'); await warte(2000);
  pruefe(await phase(p) === 'sieg', 'Am Ende startet der Siegbildschirm von selbst');
  const sieg = await p.textContent('#abSieg');
  pruefe(sieg.includes('DIE LEGENDE IST VOLLBRACHT') && /\d+ von 20 Packs gehören dir/.test(sieg), 'Siegbildschirm: Titel und Packs: ' + sieg.replace(/\s+/g, ' ').slice(0, 90));
  pruefe(!sieg.includes('10 Packs') && !(await p.textContent('#abRoll')).includes('Überraschung'), 'Die 10 Packs im Kästchen bleiben geheim');
  await p.screenshot({ path: `${OUT}/abspann-1-sieg.png` });
  await p.click('#abSieg'); await warte(1500);
  pruefe(await phase(p) === 'geschichte' && (await p.textContent('#abVorlange')).includes('Vor langer Zeit'), 'Tippen: „Vor langer Zeit …“');
  const story = await p.textContent('#abCrawlText');
  pruefe(story.includes(C.abspann.geschichte.titel) && story.includes('RIKE') && story.includes(C.abspann.geschichte.sieg), 'Laufschrift: Titel, Rike und der Absatz zum Sieg');
  pruefe(!/[–—]/.test(story), 'Geschichte ohne Gedankenstriche');
  await warte(9000);
  const lage = await p.evaluate(() => getComputedStyle(document.getElementById('abCrawlText')).transform);
  pruefe(lage !== 'none' && lage !== 'matrix(1, 0, 0, 1, 0, 0)', 'Die Laufschrift bewegt sich');
  await p.screenshot({ path: `${OUT}/abspann-2-geschichte.png` });
  await p.click('#abSkip'); await warte(3000);
  pruefe(await phase(p) === 'credits', 'ÜBERSPRINGEN: weiter zum Abspann');
  const roll = await p.textContent('#abRoll');
  pruefe(['Quest Master', 'Bene', 'Fabio', 'Der Bund', 'Rike', 'Prüfung des Bundes', 'Der Tag in Zahlen', 'THE END'].every(t => roll.includes(t)), 'Abspann: Rollen, Namen, Quests, Zahlen, THE END');
  await p.screenshot({ path: `${OUT}/abspann-3-credits.png` });
  await p.click('#abSkip'); await warte(800);
  pruefe(await phase(p) === 'ende' && await p.isVisible('[data-ab="nochmal"]') && !(await p.isVisible('#abSkip')), 'ÜBERSPRINGEN: THE END mit NOCHMAL und ZUM MENÜ');
  const ende = await p.$eval('#abEnde', e => { const r = e.getBoundingClientRect(); return { oben: r.top, unten: r.bottom, h: innerHeight }; });
  pruefe(ende.oben >= 0 && ende.unten <= ende.h, 'THE END steht ganz im Bild');
  pruefe((await p.textContent('#abEnde')).includes('Fortsetzung folgt') && (await p.$$('#abEnde .tumbler.known')).length === 4, 'THE END: Fortsetzung folgt und der Code');
  await p.screenshot({ path: `${OUT}/abspann-4-ende.png` });
  await p.click('[data-ab="nochmal"]'); await warte(500);
  pruefe(await phase(p) === 'geschichte', 'NOCHMAL: die Geschichte beginnt von vorn');
  await p.click('#abSkip'); await warte(500); await p.click('#abSkip'); await warte(500);
  await p.click('[data-ab="zu"]'); await warte(500);
  pruefe(await phase(p) === 'zu', 'ZUM MENÜ schließt');
  await warte(1500);
  pruefe(await phase(p) === 'zu', 'Danach startet es nicht noch einmal von selbst');
  await p.click('#hudCode'); await warte(400);
  pruefe(await p.isVisible('[data-abspann]'), 'Code-Fenster: Knopf ABSPANN');
  await p.click('[data-abspann]'); await warte(500);
  pruefe(await phase(p) === 'geschichte', 'ABSPANN im Code-Fenster startet die Geschichte');
  await ctx.close();
}

// 2. Echter Ablauf (Speicher lokal): Admin bucht den Bund, Dennis sieht das Ergebnis, dann das Finale.
//    Rückgängig schließt es still, beim nächsten Ende kommt es wieder, nach dem Neuladen nicht mehr.
{
  const ctx = await b.newContext({ viewport: { width: 852, height: 393 }, isMobile: true, hasTouch: true });
  await ctx.route('**/config.js', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace('typ: "firebase"', 'typ: "lokal"') }); });
  const seite = async url => { const p = await ctx.newPage(); p.on('pageerror', e => fehler.push(url + ': ' + e.message)); await p.goto(BASE + url); await warte(500); return p; };
  const admin = await seite('admin.html?probe'); admin.on('dialog', d => d.accept());
  await admin.$$eval('details', ds => ds.forEach(d => { d.open = true; }));
  const dennis = await seite('?probe&direkt');
  await admin.click('#szenarien button:has-text("Vor dem Bund")'); await warte(800);
  await zu(dennis);
  pruefe(await phase(dennis) === 'zu', 'Vor dem Bund: kein Finale');
  await admin.click('#nextWin'); await warte(900);
  pruefe((await dennis.textContent('#overlay')).includes('BESTANDEN') && await phase(dennis) === 'zu', 'Bund bestanden: erst das Ergebnis-Fenster');
  await dennis.click('#overlay'); await warte(1500);
  pruefe(await phase(dennis) === 'sieg', 'Fenster zu: Siegbildschirm');
  await admin.click('#undo'); await warte(1500);
  pruefe(await phase(dennis) === 'zu', 'Rückgängig: Das Finale geht still zu');
  await zu(dennis);
  await admin.click('#nextLose'); await warte(900);
  await zu(dennis); await warte(1200);
  pruefe(await phase(dennis) === 'sieg' && (await dennis.textContent('#abSieg')).includes('DER BUND HAT GESIEGT'), 'Bund verloren: Finale mit „Der Bund hat gesiegt“');
  pruefe((await dennis.textContent('#abCrawlText')).includes(C.abspann.geschichte.niederlage), 'Geschichte endet mit dem Absatz zur Niederlage');
  await dennis.click('#abSkip'); await warte(400); await dennis.click('#abSkip'); await warte(400); await dennis.click('#abSkip'); await warte(400);
  await dennis.click('[data-ab="zu"]'); await warte(300);
  await dennis.goto(BASE + '?probe'); await warte(600);
  await dennis.click('#introScreen'); await warte(2000); await zu(dennis); await warte(1200);
  pruefe(await phase(dennis) === 'zu', 'Neu geladen: kein zweites Finale von selbst');
  await ctx.close();
}

await b.close();
console.log(ok.map(t => 'ok    ' + t).join('\n'));
console.log(fehler.length ? fehler.map(t => 'FEHLT ' + t).join('\n') : 'Alles in Ordnung.');
process.exit(fehler.length ? 1 : 0);
