// Freigabe (30.09.): Der Quest Master gibt jede Quest von Hand frei, wenn Dennis an der Station ankommt. Bis dahin bleibt
// sie im Nebel, das HUD sagt nur, wohin es geht. Mit der Freigabe sagt es die Fee, Dennis wandert auf der Karte zur
// Station, dann tritt die Quest aus dem Nebel. Löschen der Freigabe im Verlauf holt sie still zurück. Kein GPS mehr.
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/freigabe.mjs /tmp/shots
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
const zu = async p => { while (await p.isVisible('#overlay')) { await p.click('#overlay'); await warte(300); } while (await p.isVisible('#coach')) { await p.click('#coach'); await warte(150); } };
const aktiv = p => p.evaluate(() => document.querySelector('.face.active').dataset.page);
const hud = p => p.textContent('#hudNextName');
const legende = p => p.evaluate(() => ['#mlWert', '#mlWo', '#mlRest'].map(s => document.querySelector(s).textContent).join(' | '));
async function halten(p, ms = 1100) {
  const k = await p.locator('#swSiegel').boundingBox();
  await p.mouse.move(k.x + k.width / 2, k.y + k.height / 2); await p.mouse.down(); await warte(ms); await p.mouse.up(); await warte(700);
}

const admin = await seite('admin.html');
await admin.$$eval('details', ds => ds.forEach(d => { d.open = true; }));
admin.on('dialog', d => d.accept());
await admin.click('#reset'); await warte(300);
const dennis = await seite('?direkt');
await zu(dennis);

// Anfang: nichts freigegeben. Kein GPS-Knopf mehr.
pruefe(!(await dennis.$('#gpsBtn')) && !(await dennis.$('#mapGps')), 'Kein GPS mehr auf der Karte');
pruefe((await hud(dennis)) === 'Die Reise beginnt bald', 'HUD am Anfang: „Die Reise beginnt bald“, statt: ' + await hud(dennis));
pruefe(!(await dennis.$('[data-logbuch]')) && (await dennis.textContent('#questCard')).includes('Der Quest Master gibt das Zeichen'), 'Quest-Karte: Nebel mit Hinweis auf den Quest Master, kein Tagebuch');
const liste = p => p.evaluate(() => document.querySelector('#questList').innerText);
pruefe(!(await liste(dennis)).includes('Rikes Tagebuch'), 'Quest-Liste: das Tagebuch liegt noch im Nebel');
pruefe(await admin.isVisible('#freigeben') && (await admin.textContent('#nextTitle')).includes('Rikes Tagebuch') && (await admin.textContent('#nextMeta')).includes('im Nebel'), 'Admin: Tagebuch kommt, Knopf zum Freigeben');
pruefe((await admin.textContent('#quests li[data-id="logbuch"] .badge.jetzt')) === 'Kommt', 'Admin-Quests: Marke „Kommt“');
await admin.screenshot({ path: `${OUT}/freigabe-1-admin.png`, fullPage: true });
await dennis.screenshot({ path: `${OUT}/freigabe-2-dennis-nebel.png` });

// Freigabe im Zug: Die Fee sagt es, die Quest tritt aus dem Nebel, ohne Wandern
await admin.click('#freigeben'); await warte(900);
const start = await fenster(dennis);
pruefe(start.includes('DIE REISE BEGINNT') && start.includes('erste Quest'), 'Freigabe im Zug: „DIE REISE BEGINNT“: ' + start.slice(0, 60));
pruefe((await hud(dennis)) === '?', 'Während des Fensters bleibt der Name verdeckt');
await dennis.screenshot({ path: `${OUT}/freigabe-3-reise-beginnt.png` });
await zu(dennis); await warte(1500);
pruefe((await hud(dennis)) === 'Rikes Tagebuch' && await dennis.isVisible('[data-logbuch]'), 'Danach: Rikes Tagebuch ist dran');
pruefe(!(await admin.isVisible('#freigeben')) && (await admin.textContent('#verlauf')).includes('Freigegeben: Rikes Tagebuch'), 'Admin: Knopf weg, Freigabe im Verlauf');
pruefe((await admin.textContent('#quests li[data-id="logbuch"] .badge.jetzt')) === 'Jetzt', 'Admin-Quests: Marke „Jetzt“');

// Tagebuch bestanden (Notfall im Admin): Die nächste Quest liegt an der Talstation, bleibt im Nebel
await admin.click('#nextWin'); await warte(900);
pruefe((await fenster(dennis)).includes('PRÜFUNG BESTANDEN'), 'Tagebuch bestanden: Moment bei Dennis');
await zu(dennis); await warte(800);
pruefe((await hud(dennis)) === 'Weiter zur TALSTATION', 'HUD: „Weiter zur TALSTATION“, statt: ' + await hud(dennis));
pruefe((await dennis.textContent('#questCard')).includes('Der Weg führt weiter zur TALSTATION'), 'Quest-Karte im Nebel: Der Weg führt weiter zur TALSTATION');
pruefe(!(await liste(dennis)).includes('Wirbel der Götter'), 'Wirbel der Götter liegt noch im Nebel');
await dennis.click('.shoulder-left'); await warte(900); await zu(dennis);
pruefe((await legende(dennis)).includes('am Samstag') && await dennis.$eval('.mark[data-station="zug"] .you', e => !!e), 'Karte: Dennis steht noch im Zug');
pruefe(!(await admin.textContent('#verlauf')).includes('Freigegeben: Rikes Tagebuch'), 'Admin-Verlauf: alte Freigabe verschwindet, sobald die Quest entschieden ist');
await dennis.screenshot({ path: `${OUT}/freigabe-4-karte-zug.png` });
await dennis.click('.shoulder-right'); await warte(900);

// Freigabe an der Talstation: Fee, dann wandert Dennis auf der Karte, am Ziel tritt die Quest aus dem Nebel
await admin.click('#freigeben'); await warte(900);
const wiese = await fenster(dennis);
pruefe(wiese.includes('WEITER ZUR TALSTATION') && wiese.includes('nächste Quest'), 'Freigabe: „WEITER ZUR TALSTATION“: ' + wiese.slice(0, 60));
await dennis.screenshot({ path: `${OUT}/freigabe-5-weiter-zur-wiese.png` });
await dennis.click('#overlay'); await warte(1300);
pruefe(await aktiv(dennis) === '0' && await dennis.isVisible('#mapWalker'), 'Nach dem Fenster: Karte, Dennis wandert');
await dennis.screenshot({ path: `${OUT}/freigabe-6-wandert.png` });
await warte(3500);
pruefe(await aktiv(dennis) === '1' && (await hud(dennis)) === 'Wirbel der Götter', 'Angekommen: Quests, Wirbel der Götter ist dran (seit 01.10. das erste Spiel am Samstag), statt: ' + await hud(dennis));
pruefe(await dennis.isVisible('#questCard [data-ergebnis="bestanden"]'), 'Dennis kann eintragen');
await zu(dennis);
await dennis.click('.shoulder-left'); await warte(900); await zu(dennis);
pruefe((await legende(dennis)).includes('TALSTATION') && !(await dennis.isVisible('#mapWalker')), 'Karte: an der Talstation angekommen');
await dennis.screenshot({ path: `${OUT}/freigabe-7-karte-wiese.png` });
await dennis.click('.shoulder-right'); await warte(900);

// Freigabe löschen: still zurück in den Nebel, Dennis steht wieder im Zug
await admin.click('#verlauf li[data-art="f"] .zurueck'); await warte(1500);
pruefe(!(await dennis.isVisible('#overlay')) && (await hud(dennis)) === 'Weiter zur TALSTATION', 'Freigabe gelöscht: still, HUD wieder „Weiter zur TALSTATION“');
pruefe(await admin.isVisible('#freigeben'), 'Admin: Knopf wieder da');
// Rückgängig: wieder freigegeben, mit Fenster
await admin.click('#undo'); await warte(900);
pruefe((await fenster(dennis)).includes('WEITER ZUR TALSTATION'), 'Rückgängig: Freigabe kommt wieder, mit Fenster');
await dennis.click('#overlay'); await warte(5000);
pruefe((await hud(dennis)) === 'Wirbel der Götter', 'Danach wieder dran');

// Dennis besiegelt selbst, der Quest Master gibt sofort frei: erst das Ergebnis, dann die Freigabe (gleiche Station, kein Wandern)
await dennis.tap('#questCard [data-ergebnis="bestanden"]'); await warte(400); await halten(dennis);
pruefe((await fenster(dennis)).includes('PRÜFUNG BESTANDEN'), 'Wirbel der Götter bestanden');
await admin.click('#freigeben'); await warte(900);
pruefe((await fenster(dennis)).includes('PRÜFUNG BESTANDEN'), 'Die Freigabe verdrängt das Ergebnis-Fenster nicht');
await dennis.click('#overlay'); await warte(600);
const weiter = await fenster(dennis);
pruefe(weiter.includes('ES GEHT WEITER'), 'Danach die Freigabe: „ES GEHT WEITER“ (gleiche Station): ' + weiter.slice(0, 60));
await dennis.click('#overlay'); await warte(1500);
pruefe(await aktiv(dennis) === '1' && (await hud(dennis)) === 'Die drei Zeichen', 'Ohne Wandern: Die drei Zeichen sind dran');

// Verpasst: Dennis lädt neu, der Admin bucht und gibt frei, während der Startbildschirm offen ist
await dennis.goto(BASE); await warte(600);
await admin.click('#nextLose'); await warte(300); await admin.click('#freigeben'); await warte(300);
await dennis.click('#introScreen'); await warte(1500);
const verpasst = await fenster(dennis);
pruefe(verpasst.includes('SIDEQUEST VERLOREN') && verpasst.includes('Buu Huu spielt mit und schenkt dir einen Fluch'), 'Nach PRESS START: erst der verpasste Moment (verloren, Buu Huus Geschenk bleibt)');
await dennis.click('#overlay'); await warte(600);
pruefe((await fenster(dennis)).includes('ES GEHT WEITER'), 'Dann die Freigabe');
await zu(dennis); await warte(1500);
pruefe((await hud(dennis)) === 'Speed Flip', 'Danach: Speed Flip ist dran');

// Ende: nach der letzten Quest kein Knopf mehr
await admin.click('#reset'); await warte(500);
const alle = ['logbuch', 'wirbel', 'klingen', 'podrennen', 'kartenwurf', 'auge', 'deku', 'feuerprobe', 'rache', 'bund'];
for (const id of alle) { await admin.click(`#quests li[data-id="${id}"] .seg button[data-v="bestanden"]`); await warte(120); }
await warte(1200);
pruefe(!(await admin.isVisible('#freigeben')) && (await admin.textContent('#nextTitle')).includes('erledigt'), 'Alles erledigt: kein Knopf zum Freigeben');
await zu(dennis); await warte(500);
for (let i = 0; i < 4 && await dennis.isVisible('#abSkip'); i++) { await dennis.click('#abSkip'); await warte(400); }
if (await dennis.isVisible('[data-ab="zu"]')) { await dennis.click('[data-ab="zu"]'); await warte(400); }
pruefe((await hud(dennis)) === 'Zum Kästchen', 'Dennis: Zum Kästchen');

await b.close();
console.log(ok.map(t => 'ok    ' + t).join('\n'));
console.log(fehler.length ? fehler.map(t => 'FEHLT ' + t).join('\n') : 'Alles in Ordnung.');
process.exit(fehler.length ? 1 : 0);
