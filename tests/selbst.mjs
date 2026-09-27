// Dennis trägt selbst ein: Siegel halten, Moment, Admin sieht es live, Zurücknehmen mit Meldung der Fee, Rückgängig,
// Einsetzen, verpasste Momente nach PRESS START, Duelle am Gipfel, Amulett, Ziffer am Kästchen.
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/selbst.mjs /tmp/shots
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
async function halten(p, ms = 1100) {
  const k = await p.locator('#swSiegel').boundingBox();
  await p.mouse.move(k.x + k.width / 2, k.y + k.height / 2); await p.mouse.down(); await warte(ms); await p.mouse.up(); await warte(700);
}

const admin = await seite('admin.html');
const dennis = await seite('?direkt');
await admin.click('#reset').catch(() => {});
admin.on('dialog', d => d.accept());

// Log-Buch: Knöpfe zum Eintragen erst, wenn alle Antworten besiegelt sind
pruefe(!(await dennis.$('[data-ergebnis]')), 'Log-Buch: kein Ergebnis-Knopf vor den Antworten');
await dennis.click('[data-logbuch]'); await warte(300);
for (let i = 0; i < 7; i++) { await dennis.fill('#lbInput', 'Antwort ' + (i + 1)); await dennis.click('#lbSeal'); await warte(250); await dennis.click('#lbNext'); await warte(150); }
await dennis.click('#lbClose'); await warte(300);
pruefe(await dennis.isVisible('[data-ergebnis="bestanden"]') && await dennis.isVisible('[data-ergebnis="verloren"]'), 'Log-Buch: nach sieben Antworten BESTANDEN und VERLOREN');

// Kurzer Tipp auf das Siegel löst nichts aus, Halten besiegelt
await dennis.tap('[data-ergebnis="bestanden"]'); await warte(400);
pruefe(await dennis.isVisible('#schwur') && (await dennis.textContent('#swKopf')).includes('Log-Buch'), 'Siegel-Fenster zeigt die Quest');
await dennis.tap('#swSiegel'); await warte(400);
pruefe(await dennis.isVisible('#schwur') && !(await fenster(dennis)), 'Kurzer Tipp besiegelt nicht');
await dennis.screenshot({ path: `${OUT}/selbst-1-siegel.png` });
await halten(dennis);
pruefe((await fenster(dennis)).includes('PRÜFUNG BESTANDEN'), 'Halten: Moment „Prüfung bestanden“ sofort bei Dennis');
await dennis.screenshot({ path: `${OUT}/selbst-2-moment.png` });
await warte(400);
pruefe((await admin.textContent('#dennisListe')).includes('Log-Buch: bestanden'), 'Admin sieht Dennis’ Eintrag live');
pruefe((await admin.textContent('#nextTitle')).includes('Kreuzung der Klingen'), 'Admin: nächste Quest rückt weiter');
pruefe((await admin.textContent('#packs')) === '1', 'Admin: Packs zählen mit');
await admin.screenshot({ path: `${OUT}/selbst-3-admin.png`, fullPage: true });
await zu(dennis); await warte(1200);

// Zurücknehmen: Die Fee sagt es Dennis, die Quest ist wieder offen
await admin.click('#dennisListe .zurueck'); await warte(700);
const zurueck = await fenster(dennis);
pruefe(zurueck.includes('ZURÜCKGENOMMEN') && zurueck.includes('Log-Buch') && zurueck.includes('Trag es neu ein'), 'Zurücknehmen: Fee meldet es Dennis');
await dennis.screenshot({ path: `${OUT}/selbst-4-zurueck.png` });
await zu(dennis);
pruefe(await dennis.isVisible('[data-ergebnis="bestanden"]'), 'Nach dem Zurücknehmen: Dennis kann neu eintragen');
// Rückgängig im Admin holt seinen Eintrag zurück
await admin.click('#undo'); await warte(700);
pruefe((await fenster(dennis)).includes('PRÜFUNG BESTANDEN'), 'Rückgängig: Eintrag ist wieder da, Dennis sieht den Moment');
await zu(dennis); await warte(1200);

// Einsetzen: Spruchrolle aus der Prophezeiung, bei Kreuzung der Klingen
await admin.click('#lauf .lauf-q[data-id="prophezeiung"] [data-a="start"]'); await warte(400);
await admin.click('#lauf .lauf-q[data-id="prophezeiung"] [data-a="plus"]'); await warte(600);
await zu(dennis); await warte(800);
await dennis.evaluate(() => { const r = document.querySelector('.q-row[data-id="klingen"]'); r && r.click(); }); await warte(300);
pruefe(await dennis.isVisible('#questCard [data-einsetzen="spruchrolle"]'), 'Spruchrolle leuchtet unter EINSETZBAR');
await dennis.tap('#questCard [data-einsetzen="spruchrolle"]'); await warte(400);
pruefe((await dennis.textContent('#swFolgen')).includes('Fluch'), 'Siegel-Fenster erklärt den Fluch');
await halten(dennis);
pruefe((await fenster(dennis)).includes('SPRUCHROLLE') && (await fenster(dennis)).includes('Fluch ist gesprochen'), 'Einsatz: Moment „Fluch gesprochen“');
await warte(300);
pruefe((await admin.textContent('#einsaetze')).includes('von Dennis'), 'Admin: Einsatz von Dennis unter Eingesetzt');
await zu(dennis);

// Verpasste Momente: Dennis lädt neu, der Admin bucht, während der Startbildschirm offen ist
await dennis.goto(BASE); await warte(600);
await admin.click('#nextWin'); await warte(600);
pruefe(!(await fenster(dennis)), 'Startbildschirm: noch kein Fenster');
await dennis.click('#introScreen'); await warte(1200);
pruefe(!(await dennis.isVisible('#prolog')), 'Später am Tag kein Prolog');
const nachgeholt = await fenster(dennis);
pruefe(nachgeholt.includes('BESTANDEN') && nachgeholt.includes('Kreuzung der Klingen'), 'Nach PRESS START: verpasster Moment läuft nach');
pruefe((await dennis.textContent('#hudNextName')) === '?', 'Die nächste Quest bleibt im Nebel, bis der Moment vorbei ist');
await dennis.screenshot({ path: `${OUT}/selbst-5-nachgeholt.png` });
await zu(dennis); await warte(1500);
pruefe((await dennis.textContent('#hudNextName')) === 'Wirbel der Götter', 'Danach tritt die nächste Quest aus dem Nebel');
await ctx.close();

// Gipfel (Demo): Duelle, Ergebnis nach der Mehrheit, Amulett, Ziffer am Kästchen
const ctx2 = await b.newContext({ viewport: { width: 844, height: 340 }, isMobile: true, hasTouch: true });
const p = await ctx2.newPage(); p.on('pageerror', e => fehler.push('gipfel: ' + e.message));
await p.goto(BASE + '?demo=bund&direkt'); await warte(600);
pruefe(await p.isVisible('.duell.jetzt [data-duell="1"][data-v="sieg"]'), 'Gipfel: Duell 1 ist dran');
pruefe(!(await p.$('#questCard [data-ergebnis]')), 'Gipfel: noch kein Ergebnis-Knopf vor den Duellen');
await p.screenshot({ path: `${OUT}/selbst-6-gipfel.png` });
for (const nr of [1, 2]) {
  await p.tap(`[data-duell="${nr}"][data-v="sieg"]`); await warte(400); await halten(p);
  pruefe((await fenster(p)).includes(`DUELL ${nr} GEWONNEN`), `Duell ${nr}: Sieg besiegelt`);
  await zu(p);
}
pruefe(await p.isVisible('#questCard [data-ergebnis="bestanden"]') && !(await p.$('#questCard [data-ergebnis="verloren"]')), 'Zwei Siege: nur noch BESTANDEN');
await p.screenshot({ path: `${OUT}/selbst-7-zwei-siege.png` });
await p.tap('#questCard [data-ergebnis="bestanden"]'); await warte(400); await halten(p);
pruefe((await fenster(p)).includes('PRÜFUNG BESTANDEN'), 'Prüfung des Bundes bestanden');
await zu(p); await warte(1200);
// Rikes Amulett zusammensetzen
await p.evaluate(() => document.querySelector('.q-row[data-id="amulett"]').click()); await warte(300);
await p.tap('#questCard [data-ergebnis="bestanden"]'); await warte(400);
pruefe((await p.textContent('#swKopf')).includes('ZUSAMMENGESETZT'), 'Amulett: Knopf heißt ZUSAMMENGESETZT');
await halten(p);
pruefe((await fenster(p)).includes('BESTANDEN') || (await fenster(p)).includes('BEENDET'), 'Amulett: Moment');
await zu(p); await warte(800);
// Am Kästchen fehlt Ziffer 2 (Kreuzung der Klingen verloren): selbst kaufen
await p.click('#hudNext'); await warte(400);
pruefe(await p.isVisible('#overlay [data-kauf="2"]'), 'Kästchen: Ziffer 2 kaufen');
await p.screenshot({ path: `${OUT}/selbst-8-kaestchen.png` });
await p.click('#overlay [data-kauf="2"]'); await warte(400); await halten(p);
const kauf = await fenster(p);
pruefe(kauf.includes('ZIFFER GEKAUFT') && kauf.includes('Ziffer 2: 4'), 'Ziffer gekauft, sie rastet ein');
await ctx2.close();

await b.close();
console.log(ok.map(t => 'ok    ' + t).join('\n'));
console.log(fehler.length ? fehler.map(t => 'FEHLT ' + t).join('\n') : 'Alles in Ordnung.');
process.exit(fehler.length ? 1 : 0);
