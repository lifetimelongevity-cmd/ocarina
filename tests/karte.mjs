// Karte und Prolog: Stationstafel, zweites Tippen, Höhe und Strecke, GPS (gefälscht), Dennis läuft, Prolog mit der Fee
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/karte.mjs /tmp/shots
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:8765/';
const OUT = process.argv[2] || '.';
fs.mkdirSync(OUT, { recursive: true });
const ok = [], fehler = [];
const pruefe = (bed, text) => (bed ? ok : fehler).push(text);
const b = await chromium.launch();

async function seite(url, { w = 852, h = 393, geo = null, erlaubt = true } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, ...(geo ? { geolocation: geo } : {}), permissions: erlaubt ? ['geolocation'] : [] });
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

// Prolog: erscheint nach PRESS START, vier Tafeln, danach Rundgang mit der Fee
let { ctx, p } = await seite('?demo');
await p.click('#introScreen'); await warte(900);
pruefe(await p.isVisible('#prolog'), 'Prolog erscheint nach PRESS START');
pruefe((await p.$$('#prologDots i')).length === 4, 'Prolog hat vier Tafeln');
await warte(1500);
pruefe((await p.textContent('#prologText')).includes('Rike schickt mich'), 'Tafel 1: Rikes Fee');
for (let i = 0; i < 12 && await p.isVisible('#prolog'); i++) { await p.click('#prolog'); await warte(250); }
await warte(500);
pruefe(!(await p.isVisible('#prolog')), 'Prolog lässt sich durchblättern');
pruefe(await p.isVisible('#coach') && (await p.textContent('.coach-text')).includes('Packs'), 'Rundgang beginnt bei den Packs');
await weg(p);
// Karte: erster Besuch mit Hinweis der Fee
await p.click('.shoulder-left'); await warte(900);
pruefe(await p.isVisible('#coach') && (await p.textContent('.coach-text')).includes('Station'), 'Karte: Hinweis zum Antippen');
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
({ ctx, p } = await seite('?demo&direkt', { w: 844, h: 340, geo: { latitude: 47.7270, longitude: 11.7650 } }));
await zurKarte(p); await weg(p);
await p.click('.mark[data-station="wiese"]'); await warte(300);
const tafel = await p.textContent('#stationCard');
pruefe(tafel.includes('Kreuzung der Klingen') && tafel.includes('815 m'), 'Tafel Wiese: Quests und Höhe');
pruefe(await p.$eval('#stationCard', e => e.classList.contains('rechts')), 'Tafel liegt gegenüber der Station');
await p.click('.sc-row[data-quest="podrennen"]'); await warte(800);
pruefe(await aktiv(p) === '1' && (await p.textContent('#questCard .tb-title')).includes('Podrennen'), 'Zeile öffnet die Quest');
await zurKarte(p);
await p.click('.mark[data-station="huette"]'); await warte(300);
pruefe((await p.textContent('#stationCard')).includes('Packs gehören dir'), 'Tafel Hütte: das Kästchen');
await p.click('.mark[data-station="huette"]'); await warte(500);
pruefe(await p.isVisible('#overlay') && (await p.textContent('#overlay')).includes('CODE'), 'Zweites Tippen auf die Hütte zeigt den Code');
await p.click('#overlay'); await warte(300);
await p.click('.sc-close'); await warte(200);
pruefe(!(await p.$eval('#mapLegend', e => e.classList.contains('verdeckt'))), 'Tafel zu: Kartusche wieder sichtbar');

// Höhe und Strecke, GPS am Weg
pruefe((await legende(p)).startsWith('910 m | WALD'), 'Kartusche zeigt die Station: ' + await legende(p));
await p.click('#gpsBtn'); await warte(1200);
pruefe((await legende(p)).includes('GPS') && await p.isVisible('#mapGps'), 'GPS am Weg: ' + await legende(p));
await p.screenshot({ path: `${OUT}/karte-gps.png` });
await ctx.close();

// GPS in München und ohne Erlaubnis
({ ctx, p } = await seite('?demo&direkt', { geo: { latitude: 48.1402, longitude: 11.5586 } }));
await zurKarte(p); await weg(p);
await p.click('#gpsBtn'); await warte(1200);
pruefe((await legende(p)).includes('Luftlinie') && !(await p.isVisible('#mapGps')), 'GPS weit weg: ' + await legende(p));
await ctx.close();
({ ctx, p } = await seite('?demo&direkt', { erlaubt: false }));
await zurKarte(p); await weg(p);
await p.click('#gpsBtn'); await warte(1500);
pruefe((await legende(p)).includes('Einstellungen') && (await p.$eval('#gpsBtn', e => e.getAttribute('aria-pressed'))) === 'false', 'GPS verweigert: ' + await legende(p));
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
