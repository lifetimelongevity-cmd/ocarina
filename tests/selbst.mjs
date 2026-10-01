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
await ctx.addInitScript(() => { try { localStorage.setItem('dq-brief-v1', '1'); localStorage.setItem('dq-brief-v1-probe', '1'); } catch (e) {} });   // ohne den Brief vor dem Titelbild (eigener Test: brief.mjs)
await ctx.route('**/config.js', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace('typ: "firebase"', 'typ: "lokal"') }); });
const seite = async url => { const p = await ctx.newPage(); p.on('pageerror', e => fehler.push(url + ': ' + e.message)); await p.goto(BASE + url); await warte(500); return p; };
const fenster = async p => (await p.isVisible('#overlay')) ? (await p.textContent('#overlay')).replace(/\s+/g, ' ').trim() : '';
const zu = async p => { while (await p.isVisible('#overlay')) { await p.click('#overlay'); await warte(300); } while (await p.isVisible('#coach')) { await p.click('#coach'); await warte(150); } };
async function halten(p, ms = 1100) {
  const k = await p.locator('#swSiegel').boundingBox();
  await p.mouse.move(k.x + k.width / 2, k.y + k.height / 2); await p.mouse.down(); await warte(ms); await p.mouse.up(); await warte(700);
}

const admin = await seite('admin.html');
await admin.$$eval('details', ds => ds.forEach(d => { d.open = true; }));
const dennis = await seite('?direkt');
await admin.click('#reset').catch(() => {});
admin.on('dialog', d => d.accept());
// Freigabe (30.09.): Der Quest Master gibt jede Quest frei. Dennis sieht die Fee, wandert auf der Karte zur Station,
// dann tritt die Quest aus dem Nebel. Wartet, bis er wieder auf der Quest-Seite steht.
async function frei(p = dennis) {
  if (await admin.isVisible('#freigeben')) { await admin.click('#freigeben'); await warte(800); }
  await zu(p);
  for (let i = 0; i < 24; i++) { if (await p.$('#overlay[hidden]') && !(await p.isVisible('#mapWalker')) && await p.evaluate(() => document.querySelector('.face.active').dataset.page) === '1') break; await warte(250); }
  await warte(500); await zu(p);
}
await frei();

// Log-Buch: Knöpfe zum Eintragen erst, wenn alle Antworten besiegelt sind
pruefe(!(await dennis.$('[data-ergebnis]')), 'Log-Buch: kein Ergebnis-Knopf vor den Antworten');
await dennis.click('[data-logbuch]'); await warte(300);
for (let i = 0; i < 7; i++) {
  await dennis.fill('#lbInput', 'Antwort ' + (i + 1)); await dennis.click('#lbSeal'); await warte(250); await dennis.click('#lbNext'); await warte(150);
  // Nach Frage 1 macht der Schattendieb aus Rikes Antwort eine Quest (30.09.): durchtippen, bis er geflohen ist
  for (let k = 0; k < 30 && await dennis.isVisible('#geistRuf'); k++) { await dennis.click('#geistRuf', { timeout: 1500 }).catch(() => {}); await warte(200); }
}
await dennis.click('#lbClose'); await warte(300);
pruefe(await dennis.isVisible('[data-ergebnis="bestanden"]') && await dennis.isVisible('[data-ergebnis="verloren"]'), 'Log-Buch: nach sieben Antworten BESTANDEN und VERLOREN');

// Kurzer Tipp auf das Siegel löst nichts aus, Halten besiegelt
await dennis.tap('[data-ergebnis="bestanden"]'); await warte(400);
pruefe(await dennis.isVisible('#schwur') && (await dennis.textContent('#swKopf')).includes('Rikes Tagebuch'), 'Siegel-Fenster zeigt die Quest');
await dennis.tap('#swSiegel'); await warte(400);
pruefe(await dennis.isVisible('#schwur') && !(await fenster(dennis)), 'Kurzer Tipp besiegelt nicht');
await dennis.screenshot({ path: `${OUT}/selbst-1-siegel.png` });
await halten(dennis);
pruefe((await fenster(dennis)).includes('PRÜFUNG BESTANDEN'), 'Halten: Moment „Prüfung bestanden“ sofort bei Dennis');
await dennis.screenshot({ path: `${OUT}/selbst-2-moment.png` });
await warte(400);
pruefe((await admin.textContent('#verlauf')).includes('Rikes Tagebuch: bestanden'), 'Admin sieht Dennis’ Eintrag live');
pruefe((await admin.textContent('#nextTitle')).includes('Wirbel der Götter'), 'Admin: nächste Quest rückt weiter (seit 01.10. der Wirbel)');
pruefe((await admin.textContent('#packs')) === '1', 'Admin: Packs zählen mit');
await admin.screenshot({ path: `${OUT}/selbst-3-admin.png`, fullPage: true });
await zu(dennis); await warte(1200);

// Zurücknehmen: Die Fee sagt es Dennis, die Quest ist wieder offen
await admin.click('#verlauf li[data-von="dennis"] .zurueck'); await warte(1400);   // Rücknahmen sammelt Dennis' Seite 0,7 s
const zurueck = await fenster(dennis);
pruefe(zurueck.includes('ZURÜCKGENOMMEN') && zurueck.includes('Rikes Tagebuch') && zurueck.includes('Trag es neu ein'), 'Zurücknehmen: Fee meldet es Dennis');
await dennis.screenshot({ path: `${OUT}/selbst-4-zurueck.png` });
await zu(dennis);
pruefe(await dennis.isVisible('[data-ergebnis="bestanden"]'), 'Nach dem Zurücknehmen: Dennis kann neu eintragen');
// Rückgängig im Admin holt seinen Eintrag zurück
await admin.click('#undo'); await warte(700);
pruefe((await fenster(dennis)).includes('PRÜFUNG BESTANDEN'), 'Rückgängig: Eintrag ist wieder da, Dennis sieht den Moment');
await zu(dennis); await warte(1200);
await frei();                                   // Wirbel der Götter freigeben (seit 01.10. vor Die drei Zeichen)
await admin.click('#nextWin'); await warte(600); await zu(dennis); await warte(800);
await frei();                                   // Die drei Zeichen freigeben

// Die drei Zeichen (seit 01.10. die dritte Aufgabe) bringen Flüche, verraten sie aber nicht
await dennis.evaluate(() => { const r = document.querySelector('.q-row[data-id="klingen"]'); r && r.click(); }); await warte(300);
const vorschau = await dennis.textContent('#questCard');
pruefe(vorschau.includes('Geheimnis') && !vorschau.includes('Fluch') && !vorschau.includes('Pergament'), 'Die drei Zeichen: Belohnung heißt nur „Geheimnis“');
pruefe(vorschau.includes('beide geschlagen'), 'Die drei Zeichen: Glanzsieg, wenn beide geschlagen sind');
pruefe(!(await dennis.$('#questCard [data-ausruesten]')), 'Bei Die drei Zeichen gibt es nichts mitzunehmen');

// Verpasste Momente: Dennis lädt neu, der Admin bucht, während der Startbildschirm offen ist
await dennis.goto(BASE); await warte(600);
await admin.click('#nextWin'); await warte(600);
await admin.click('#freigeben'); await warte(400);   // Speed Flip freigeben, Dennis holt beides nach
pruefe(!(await fenster(dennis)), 'Startbildschirm: noch kein Fenster');
await dennis.click('#introScreen'); await warte(1200);
pruefe(!(await dennis.isVisible('#prolog')), 'Später am Tag kein Prolog');
const nachgeholt = await fenster(dennis);
pruefe(nachgeholt.includes('BESTANDEN') && nachgeholt.includes('Die drei Zeichen'), 'Nach PRESS START: verpasster Moment läuft nach');
pruefe(nachgeholt.includes('Du hast etwas gefunden') && nachgeholt.includes('Flüche haben es in sich') && nachgeholt.includes('+2'), 'Fund: zwei Flüche, „Du hast etwas gefunden … Flüche haben es in sich“');
pruefe(nachgeholt.includes('Einen davon schenkt dir Buu Huu'), 'Buu Huu hat mitgespielt und einen geschenkt');
pruefe((await dennis.textContent('#hudNextName')) === '?', 'Die nächste Quest bleibt im Nebel, bis der Moment vorbei ist');
await dennis.screenshot({ path: `${OUT}/selbst-5-nachgeholt.png` });
await zu(dennis); await warte(1500);
pruefe((await dennis.textContent('#hudNextName')) === 'Speed Flip', 'Danach tritt die nächste Quest aus dem Nebel');

// Fluch sprechen bei Speed Flip: erst der Vorteil, dann dreht Buu Huu am Rad (hier fest auf 2, der erste Fluch kann kein ALLES).
// Vorher zwei Packs dazu, damit er wirklich zwei stehlen kann
await admin.fill('#customAmount', '2'); await admin.fill('#customReason', 'Test: Packs für den Dieb');
await admin.click('#customForm button[type="submit"]'); await warte(900); await zu(dennis);
const packsVor = Number(await dennis.textContent('#packsVal'));
await dennis.evaluate(() => { const r = document.querySelector('.q-row[data-id="podrennen"]'); r && r.click(); }); await warte(300);
// Ausrüsten beim Spiel (29.09.): AUSRÜSTEN auf der Quest-Karte, in der Ausrüstung den Fluch auf eine C-Taste, ein Siegel
pruefe(await dennis.isVisible('#questCard [data-ausruesten="podrennen"]'), 'Speed Flip: AUSRÜSTEN auf der Quest-Karte');
await dennis.tap('#questCard [data-ausruesten="podrennen"]'); await warte(1200);
pruefe((await dennis.textContent('#ruestFuer')).includes('SPEED FLIP') && await dennis.isVisible('.slot.usable[data-id="spruchrolle"]'), 'Ausrüstung für Speed Flip: der Fluch leuchtet');
await dennis.tap('.slot[data-id="spruchrolle"]'); await warte(300);
pruefe((await dennis.getAttribute('.c-taste.l', 'data-id')) === 'spruchrolle', 'Tippen legt den Fluch auf die erste C-Taste');
const box = await dennis.textContent('#itemBox');
pruefe(box.includes('Sabotage') && box.includes('0 bis 3 Packs.') && !box.includes('ALLES') && await dennis.$('#itemBox .rad-mini'), 'Textbox: Vorteil und das kleine Rad, beim ersten Fluch noch ohne ALLES');
await dennis.tap('[data-mitnehmen]'); await warte(400);
const siegelText = await dennis.textContent('#swFolgen');
pruefe(siegelText.includes('FLUCH') && siegelText.includes('Sabotage') && siegelText.includes('PREIS') && siegelText.includes('0 bis 3 Packs.'), 'Siegel-Fenster: Vorteil bei Speed Flip und Buu Huus Rad');
pruefe(siegelText.includes('glänzenden und seltenen'), 'Siegel-Fenster: was passiert, wenn Packs fehlen');
const passt = await dennis.evaluate(() => { const f = document.getElementById('swFolgen'); return f.scrollHeight <= f.clientHeight + 1; });
pruefe(passt, 'Siegel-Fenster: alle Zeilen passen hinein, nichts zu scrollen');
await dennis.evaluate(() => { Math.random = () => 0.7; });
await halten(dennis, 1100);
const szene = async () => (await dennis.textContent('#fluchSzene')).replace(/\s+/g, ' ');
pruefe(await dennis.isVisible('#fluchSzene') && (await szene()).includes('DER FLUCH GREIFT') && (await szene()).includes('Sabotage'), 'Szene: Der Fluch greift, mit Vorteil');
pruefe(Number(await dennis.textContent('#packsVal')) === packsVor, 'Solange Buu Huu unterwegs ist, zeigt das HUD noch die alten Packs');
await dennis.screenshot({ path: `${OUT}/selbst-5a-greift.png` });
await warte(5200);
pruefe(await dennis.evaluate(() => document.getElementById('fluchSzene').classList.contains('nacht')) && await dennis.$('#fluchSzene .fs-geist') !== null, 'Licht aus, Buu Huu kreist um die Packs');
pruefe(await dennis.evaluate(() => document.getElementById('fluchSzene').classList.contains('rad-da')) && (await dennis.$$('#fsScheibe .rad-feld')).length === 4, 'Das Rad: vier Felder, beim ersten Fluch noch kein ALLES');
await dennis.click('#fluchSzene'); await warte(300);
pruefe(await dennis.isVisible('#fluchSzene'), 'Vor der Auflösung lässt sich die Szene nicht wegtippen');
await dennis.screenshot({ path: `${OUT}/selbst-5b-rad.png` });
for (let i = 0; i < 40 && await dennis.evaluate(() => document.getElementById('fsRad').dataset.steht == null); i++) await warte(200);
const rad = await dennis.evaluate(() => ({ ...document.getElementById('fsRad').dataset }));
pruefe(rad.steht != null && rad.steht === rad.ziel, `Das Rad bleibt auf dem gewürfelten Feld stehen (Feld ${rad.ziel})`);
await warte(1600);
pruefe((await dennis.textContent('#fsErgebnis')) === '−2', 'Auflösung: −2 in der Mitte des Rads');
await dennis.screenshot({ path: `${OUT}/selbst-5c-klaut.png` });
for (let i = 0; i < 40 && Number(await dennis.textContent('#packsVal')) === packsVor; i++) await warte(150);
pruefe(Number(await dennis.textContent('#packsVal')) < packsVor, 'Buu Huu holt die Packs einzeln aus der Leiste');
for (let i = 0; i < 40 && await dennis.isVisible('#fluchSzene'); i++) await warte(200);
const gesprochen = await fenster(dennis);
pruefe(!(await dennis.isVisible('#fluchSzene')) && gesprochen.includes('FLUCH GESPROCHEN') && gesprochen.includes('Sabotage'), 'Danach das Fenster: Fluch gesprochen mit Vorteil');
const dieb = await dennis.textContent('#resultLines .dieb');
pruefe(dieb.includes('Buu Huu') && dieb.includes('2 Packs gestohlen') && dieb.includes('−2'), 'Buu Huu stiehlt 2 Packs');
await dennis.screenshot({ path: `${OUT}/selbst-5d-dieb.png` });
pruefe(Number(await dennis.textContent('#packsVal')) === Math.max(0, packsVor - 2), `Packs: ${packsVor} → ${Math.max(0, packsVor - 2)}`);
await warte(300);
const einsAdmin = await admin.textContent('#verlauf li[data-art="e"][data-von="dennis"]');
pruefe(einsAdmin.includes('Sabotage') && einsAdmin.includes('Buu Huu stiehlt 2'), 'Admin: Fluch mit Vorteil und Raub im Verlauf');
await zu(dennis); await warte(600);
// Der zweite Fluch kann ALLES: kleines Rad mit rotem Feld in der Textbox
await dennis.evaluate(() => document.querySelector('.shoulder-right').click()); await warte(1300); await zu(dennis);
await dennis.evaluate(() => { const b = document.querySelector('.slot[data-id="spruchrolle"]'); b && b.click(); }); await warte(300);
pruefe((await dennis.textContent('#itemBox')).includes('oder ALLES!'), 'Nach dem ersten Fluch droht ALLES');
await dennis.evaluate(() => document.querySelector('.shoulder-left').click()); await warte(1300); await zu(dennis);
// Zurücknehmen: die gestohlenen Packs sind zurück
await admin.click('#verlauf li[data-art="e"] .zurueck'); await warte(1400);
pruefe((await fenster(dennis)).includes('stahl, ist zurück'), 'Rücknahme: Was Buu Huu gestohlen hat, ist zurück');
pruefe(Number(await dennis.textContent('#packsVal')) === packsVor, 'Packs wieder wie vorher');
await zu(dennis);
await ctx.close();

// Gipfel (Demo): Tor mit fehlender Ziffer 3, Amulett bringt Rikes Segen, dann Duelle und Ergebnis nach der Mehrheit
const ctx2 = await b.newContext({ viewport: { width: 844, height: 340 }, isMobile: true, hasTouch: true });
await ctx2.addInitScript(() => { try { localStorage.setItem('dq-brief-v1', '1'); localStorage.setItem('dq-brief-v1-probe', '1'); } catch (e) {} });   // ohne den Brief vor dem Titelbild (eigener Test: brief.mjs)
const p = await ctx2.newPage(); p.on('pageerror', e => fehler.push('gipfel: ' + e.message));
await p.goto(BASE + '?demo=bund&direkt'); await warte(600);
pruefe(await p.isVisible('#questCard [data-tor="3"][data-weg="busse"]') && await p.isVisible('#questCard [data-tor="3"][data-weg="packs"]'), 'Tor: Ziffer 3 fehlt, für Packs oder per Buße');
pruefe(!(await p.$('#questCard [data-duell]')) && !(await p.$('#questCard [data-ergebnis]')), 'Tor: noch keine Duelle, kein Ergebnis');
await p.screenshot({ path: `${OUT}/selbst-6-tor.png` });
// Rikes Amulett zusammensetzen: bringt Rikes Segen
await p.evaluate(() => document.querySelector('.q-row[data-id="amulett"]').click()); await warte(300);
await p.tap('#questCard [data-ergebnis="bestanden"]'); await warte(400);
pruefe((await p.textContent('#swKopf')).includes('ZUSAMMENGESETZT'), 'Amulett: Knopf heißt ZUSAMMENGESETZT');
await halten(p);
pruefe((await fenster(p)).includes('Rikes Segen'), 'Amulett: Moment mit Rikes Segen');
await zu(p); await warte(800);
// Am Tor mit Rikes Segen: Ziffer geschenkt, keine Packs, danach ist das Tor offen
await p.evaluate(() => document.querySelector('.q-row[data-id="bund"]').click()); await warte(300);
const packsVorher = await p.textContent('#packsVal');
pruefe(await p.isVisible('#questCard [data-tor="3"][data-weg="segen"]'), 'Tor: Rikes Segen wird angeboten');
await p.tap('#questCard [data-tor="3"][data-weg="segen"]'); await warte(400); await halten(p);
const segen = await fenster(p);
pruefe(segen.includes('RIKES SEGEN') && segen.includes('Ziffer 3: 2') && segen.includes('Das Tor ist offen'), 'Segen: Ziffer 3 rastet ein, das Tor ist offen');
await p.screenshot({ path: `${OUT}/selbst-7-segen.png` });
await zu(p); await warte(600);
pruefe((await p.textContent('#packsVal')) === packsVorher, 'Segen kostet keine Packs');
pruefe(await p.isVisible('.duell.jetzt [data-duell="1"][data-v="sieg"]'), 'Nach dem Tor: Duell 1 ist dran');
for (const nr of [1, 2]) {
  await p.tap(`[data-duell="${nr}"][data-v="sieg"]`); await warte(400); await halten(p);
  pruefe((await fenster(p)).includes(`DUELL ${nr} GEWONNEN`), `Duell ${nr}: Sieg besiegelt`);
  await zu(p);
}
pruefe(await p.isVisible('#questCard [data-ergebnis="bestanden"]') && !(await p.$('#questCard [data-ergebnis="verloren"]')), 'Zwei Siege: nur noch BESTANDEN');
await p.tap('#questCard [data-ergebnis="bestanden"]'); await warte(400); await halten(p);
pruefe((await fenster(p)).includes('PRÜFUNG BESTANDEN'), 'Prüfung des Bundes bestanden');
await zu(p); await warte(1200);
// Danach das Finale (tests/abspann.mjs prüft es genau): hier nur bis THE END springen und zurück ins Menü
pruefe(await p.evaluate(() => document.getElementById('abspann').dataset.phase) === 'sieg', 'Nach dem Bund: Siegbildschirm');
for (let i = 0; i < 4 && await p.isVisible('#abSkip'); i++) { await p.click('#abSkip'); await warte(400); }
await p.click('[data-ab="zu"]'); await warte(400);
await p.click('#hudCode'); await warte(300);
pruefe((await fenster(p)).includes('durch Rikes Segen'), 'Code: Ziffer 3 kam durch Rikes Segen');
await ctx2.close();

// Tor per Bußprüfung und für Packs
for (const [weg, titel] of [['busse', 'BUSSE BESTANDEN'], ['packs', 'ZIFFER GEKAUFT']]) {
  const ctx3 = await b.newContext({ viewport: { width: 852, height: 393 }, isMobile: true, hasTouch: true });
  await ctx3.addInitScript(() => { try { localStorage.setItem('dq-brief-v1', '1'); localStorage.setItem('dq-brief-v1-probe', '1'); } catch (e) {} });   // ohne den Brief vor dem Titelbild (eigener Test: brief.mjs)
  const t = await ctx3.newPage(); t.on('pageerror', e => fehler.push('tor: ' + e.message));
  await t.goto(BASE + '?demo=bund&direkt'); await warte(600);
  const vorher = +(await t.textContent('#packsVal'));
  await t.tap(`#questCard [data-tor="3"][data-weg="${weg}"]`); await warte(400);
  if (weg === 'busse') pruefe((await t.textContent('#swFolgen')).includes('Bußprüfung'), 'Buße: das Siegel-Fenster erklärt die Bußprüfung');
  await halten(t);
  pruefe((await fenster(t)).includes(titel), `Tor ${weg}: Moment „${titel}“`);
  await zu(t); await warte(400);
  const nachher = +(await t.textContent('#packsVal'));
  pruefe(nachher === vorher - (weg === 'packs' ? 2 : 0), `Tor ${weg}: Packs ${vorher} → ${nachher}`);
  await ctx3.close();
}

await b.close();
console.log(ok.map(t => 'ok    ' + t).join('\n'));
console.log(fehler.length ? fehler.map(t => 'FEHLT ' + t).join('\n') : 'Alles in Ordnung.');
process.exit(fehler.length ? 1 : 0);
