// Karte und Prolog: Stationstafel, zweites Tippen, Höhe und Strecke, Dennis läuft, Prolog mit der Fee (GPS seit 30.09. gestrichen)
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/karte.mjs /tmp/shots
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:8765/';
const OUT = process.argv[2] || '.';
fs.mkdirSync(OUT, { recursive: true });
const ok = [], fehler = [];
const pruefe = (bed, text) => (bed ? ok : fehler).push(text);
const b = await chromium.launch();

async function seite(url, { w = 852, h = 393 } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
  await ctx.route('**firebasedatabase.app**', r => r.abort());
  const p = await ctx.newPage();
  p.on('pageerror', e => fehler.push(url + ': ' + e.message));
  await p.goto(BASE + url); await p.waitForTimeout(500);
  return { ctx, p };
}
const warte = ms => new Promise(r => setTimeout(r, ms));
const weg = async p => { while (await p.$('#coach:not([hidden])')) { await p.click('#coach'); await warte(200); } };
const zurKarte = async p => { await weg(p); await p.click('.shoulder-left'); await warte(900); };
const aktiv = p => p.evaluate(() => document.querySelector('.face.active').dataset.page);
const legende = p => p.evaluate(() => ['#mlWert', '#mlWo', '#mlRest'].map(s => document.querySelector(s).textContent).join(' | '));

// Prolog: erscheint nach PRESS START am Anfang des Spiels, sechs Tafeln, danach Rundgang mit der Fee
let { ctx, p } = await seite('?demo=start');
await p.click('#introScreen'); await warte(900);
pruefe(await p.isVisible('#prolog'), 'Prolog erscheint nach PRESS START');
pruefe((await p.$$('#prologDots i')).length === 6, 'Prolog hat sechs Tafeln');
await warte(1500);
pruefe((await p.textContent('#prologText')).includes('Ich bin die Fee. Rike hat mich'), 'Tafel 1: Die Fee stellt sich vor, Rike hat sie geschickt');
await p.click('#prolog'); await warte(1800);
pruefe((await p.textContent('#prologBild')).includes('The Legend of Dennis') && (await p.textContent('#prologText')).startsWith('Willkommen in deiner eigenen Legende'), 'Tafel 2: Willkommen in The Legend of Dennis');
await p.click('#prolog'); await warte(1800);
pruefe((await p.$$('#prologBild .medal.covered')).length === 7 && (await p.textContent('#prologText')).includes('geprüft werden'), 'Tafel 3: die Reise, sieben Prüfungen im Nebel');
for (let i = 0; i < 20 && await p.isVisible('#prolog'); i++) { await p.click('#prolog'); await warte(250); }
await warte(500);
pruefe(!(await p.isVisible('#prolog')), 'Prolog lässt sich durchblättern');
pruefe(await p.isVisible('#coach') && (await p.textContent('.coach-text')).includes('Packs'), 'Rundgang beginnt bei den Packs');
await weg(p);
// Karte: erster Besuch mit Hinweis der Fee
await p.click('.shoulder-left'); await warte(900);
pruefe(await p.isVisible('#coach') && (await p.textContent('.coach-text')).includes('Station'), 'Karte: Hinweis zum Antippen');
await ctx.close();

// Später am Tag kein Onboarding mehr: weder in der Demo noch auf einem neuen Handy mit dem echten Stand
for (const url of ['?demo', '?demo=bund']) {
  ({ ctx, p } = await seite(url));
  await p.click('#introScreen'); await warte(900);
  pruefe(!(await p.isVisible('#prolog')), `${url}: später am Tag kein Prolog`);
  await p.click('.shoulder-right'); await warte(900);
  pruefe(await p.$('#overlay[hidden]') && await p.$('#coach[hidden]'), `${url}: Ausrüstung ohne Beutel-Fund und ohne Hinweise`);
  pruefe(await p.$eval('.slot[data-feld="wasser"]', e => !e.classList.contains('schatten')), `${url}: Der Beutel ist schon zur Spritze geworden`);
  await p.click('.shoulder-left'); await warte(500); await p.click('.shoulder-left'); await warte(900);
  pruefe(!(await p.isVisible('#coach')), `${url}: Karte ohne Hinweis`);
  await ctx.close();
}
{
  // Echter Stand auf einem neuen Handy: im Speicher liegt schon ein Tag mit zwei entschiedenen Quests
  const ctx2 = await b.newContext({ viewport: { width: 852, height: 393 }, isMobile: true, hasTouch: true });
  await ctx2.route('**firebasedatabase.app**', r => r.abort());
  await ctx2.addInitScript(() => localStorage.setItem('dennis-quest-doc:dennis-jga-2026', JSON.stringify({ quests: { logbuch: 'bestanden', klingen: 'verloren' }, stand: 1 })));
  const p2 = await ctx2.newPage(); p2.on('pageerror', e => fehler.push('neues Handy: ' + e.message));
  await p2.goto(BASE); await warte(500);
  await p2.click('#introScreen'); await warte(900);
  pruefe(!(await p2.isVisible('#prolog')), 'Neues Handy mitten am Tag: kein Prolog');
  await ctx2.close();
}
({ ctx, p } = await seite('?demo=bund&onboarding'));
await p.click('#introScreen'); await warte(900);
pruefe(await p.isVisible('#prolog'), '?onboarding zeigt den Prolog auch später am Tag');
await ctx.close();

// Überspringen: kein Rundgang, auf einem echten Handy nur einmal
({ ctx, p } = await seite(''));
await p.click('#introScreen'); await warte(900);
await p.click('#prologSkip'); await warte(400);
pruefe(!(await p.isVisible('#prolog')) && !(await p.isVisible('#coach')), 'ÜBERSPRINGEN beendet Prolog ohne Rundgang');
await p.reload(); await warte(500);
await p.click('#introScreen'); await warte(900);
pruefe(!(await p.isVisible('#prolog')), 'Prolog kommt auf einem Handy nur einmal');
await ctx.close();

// Stationstafel und zweites Tippen (Mitte des Tages, kleinster Bildschirm)
({ ctx, p } = await seite('?demo&direkt', { w: 844, h: 340 }));
await zurKarte(p); await weg(p);
await p.click('.mark[data-station="wiese"]'); await warte(300);
const tafel = await p.textContent('#stationCard');
pruefe(tafel.includes('Die drei Zeichen') && tafel.includes('815 m'), 'Tafel Wiese: Quests und Höhe');
pruefe(await p.$eval('#stationCard', e => e.classList.contains('rechts')), 'Tafel liegt gegenüber der Station');
await p.click('.sc-row[data-quest="podrennen"]'); await warte(800);
pruefe(await aktiv(p) === '1' && (await p.textContent('#questCard .tb-title')).includes('Podrennen'), 'Zeile öffnet die Quest');
await zurKarte(p);
await p.click('.mark[data-station="huette"]'); await warte(300);
pruefe((await p.textContent('#stationCard')).includes('Verschlossen, noch') && !(await p.textContent('#stationCard')).includes('Packs'), 'Tafel Hütte: das Kästchen, verschlossen, ohne Packs');
await p.click('.mark[data-station="huette"]'); await warte(500);
pruefe(await p.isVisible('#overlay') && (await p.textContent('#overlay')).includes('CODE'), 'Zweites Tippen auf die Hütte zeigt den Code');
await p.click('#overlay'); await warte(300);
await p.click('.sc-close'); await warte(200);
pruefe(!(await p.$eval('#mapLegend', e => e.classList.contains('verdeckt'))), 'Tafel zu: Kartusche wieder sichtbar');

// Höhe und Strecke: die Kartusche zeigt die Station, kein GPS-Knopf mehr
pruefe((await legende(p)).startsWith('910 m | WALD'), 'Kartusche zeigt die Station: ' + await legende(p));
pruefe(!(await p.$('#gpsBtn')) && !(await p.$('#mapGps')), 'Kein GPS mehr (30.09.)');
await p.screenshot({ path: `${OUT}/karte-kartusche.png` });
await ctx.close();

// Dennis läuft: drei Siege im Wald, dann zur Aussicht
({ ctx, p } = await seite('?demo&direkt'));
await zurKarte(p); await weg(p);
const vorher = await p.$eval('#mapDone', e => e.getAttribute('d').length);
for (let i = 0; i < 3; i++) { await p.click('[data-demo="bestanden"]'); await warte(400); while (await p.$('#overlay:not([hidden])')) { await p.click('#overlay'); await warte(300); } }
await warte(1500);
await p.click('.shoulder-left'); await warte(1100);
pruefe(await p.isVisible('#mapWalker'), 'Dennis läuft, sobald er die Karte ansieht');
await p.screenshot({ path: `${OUT}/karte-lauf.png` });
await warte(2300);
pruefe(!(await p.isVisible('#mapWalker')) && (await legende(p)).includes('AUSSICHT'), 'Angekommen an der Aussicht');
pruefe((await p.$eval('#mapDone', e => e.getAttribute('d').length)) > vorher, 'Der goldene Weg ist länger geworden');
// Rückgängig (Zurück): ohne Laufen zurück
await p.click('[data-demo="zurueck"]'); await warte(500);
pruefe(!(await p.isVisible('#mapWalker')) && (await legende(p)).includes('WALD'), 'Zurück springt ohne Laufen');
await ctx.close();

await b.close();
console.log(ok.map(t => 'ok    ' + t).join('\n'));
console.log(fehler.length ? fehler.map(t => 'FEHLT ' + t).join('\n') : 'Alles in Ordnung.');
process.exit(fehler.length ? 1 : 0);
