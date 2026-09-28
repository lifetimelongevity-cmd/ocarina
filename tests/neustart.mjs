// Alles zurücksetzen im Admin: Dennis sieht genau ein Fenster (NEUER ANFANG), das Tagebuch ist leer und wieder
// beschreibbar, beim nächsten PRESS START kommt der Prolog. Rückgängig holt alles still zurück. Dazu: Tagebuch allein leeren.
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/neustart.mjs
import { chromium } from 'playwright';

const BASE = 'http://localhost:8765/';
const ok = [], fehler = [];
const pruefe = (bed, text) => (bed ? ok : fehler).push(text);
const warte = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch();

// Admin und Dennis im selben Browser, Speicher „lokal“: beide Seiten sehen sich über localStorage
const ctx = await b.newContext({ viewport: { width: 852, height: 393 }, isMobile: true, hasTouch: true });
await ctx.route('**/config.js', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace('typ: "firebase"', 'typ: "lokal"') }); });
// Jedes Fenster, das bei Dennis aufgeht, wird mitgeschrieben
await ctx.addInitScript(() => {
  window.__fenster = [];
  document.addEventListener('DOMContentLoaded', () => {
    const o = document.getElementById('overlay');
    if (!o) return;
    new MutationObserver(() => { if (!o.hidden) window.__fenster.push(o.textContent.replace(/\s+/g, ' ').trim().slice(0, 80)); })
      .observe(o, { attributes: true, attributeFilter: ['hidden'], childList: true, subtree: true });
  });
});
const seite = async url => { const p = await ctx.newPage(); p.on('pageerror', e => fehler.push(url + ': ' + e.message)); await p.goto(BASE + url); await warte(500); return p; };
const zu = async p => { while (await p.isVisible('#overlay')) { await p.click('#overlay'); await warte(300); } while (await p.isVisible('#coach')) { await p.click('#coach'); await warte(150); } };
const fenster = p => p.evaluate(() => [...new Set(window.__fenster)]);
const leeren = p => p.evaluate(() => { window.__fenster = []; });
async function halten(p, ms = 1100) {
  const k = await p.locator('#swSiegel').boundingBox();
  await p.mouse.move(k.x + k.width / 2, k.y + k.height / 2); await p.mouse.down(); await warte(ms); await p.mouse.up(); await warte(700);
}
async function tagebuch(p, text) {
  await p.click('[data-logbuch]'); await warte(300);
  for (let i = 0; i < 7; i++) { await p.fill('#lbInput', text + (i + 1)); await p.click('#lbSeal'); await warte(200); await p.click('#lbNext'); await warte(120); }
  await p.click('#lbClose'); await warte(300);
}

const admin = await seite('admin.html');
admin.on('dialog', d => d.accept());
// Dennis öffnet die App wie am Spieltag: Titelbild, PRESS START, Prolog überspringen
let dennis = await seite('');
await dennis.click('#introScreen'); await warte(900);
if (await dennis.isVisible('#prolog')) { await dennis.click('#prologSkip'); await warte(500); }
await zu(dennis);

// Ein halber Vormittag: Tagebuch beantwortet und besiegelt, zwei Quests vom Quest Master, ein Fluch gebucht
await tagebuch(dennis, 'Antwort ');
await dennis.tap('[data-ergebnis="bestanden"]'); await warte(400); await halten(dennis); await zu(dennis); await warte(800);
await admin.click('#nextWin'); await warte(600); await zu(dennis);
await admin.click('#nextLose'); await warte(600); await zu(dennis);
await warte(1200);
pruefe((await admin.textContent('#lbList')).includes('Antwort 7'), 'Admin sieht die sieben Tagebuch-Antworten');
pruefe((await admin.textContent('#done')) === '3', 'Drei Quests erledigt');

// Alles zurücksetzen, während Dennis im Menü ist: genau ein Fenster
await leeren(dennis);
await admin.click('#reset'); await warte(2500);
let f = await fenster(dennis);
pruefe(f.length === 1 && f[0].includes('NEUER ANFANG'), 'Zurücksetzen: genau ein Fenster bei Dennis: ' + JSON.stringify(f));
pruefe((await admin.textContent('#done')) === '0', 'Admin: alles offen');
pruefe(!(await admin.textContent('#lbList')).includes('Antwort 1'), 'Admin: Tagebuch-Antworten gelöscht');
pruefe(!(await admin.textContent('#dennisListe')).includes('Rikes Tagebuch'), 'Admin: Dennis’ Einträge gelöscht');
// Fenster zu: Die Seite lädt neu, Titelbild, danach Prolog
await dennis.click('#overlay'); await warte(1500);
pruefe(await dennis.isVisible('#introScreen'), 'Nach dem Fenster: Titelbild wie beim ersten Mal');
await dennis.click('#introScreen'); await warte(900);
pruefe(await dennis.isVisible('#prolog'), 'PRESS START: Der Prolog mit der Fee kommt wieder');
await dennis.click('#prologSkip'); await warte(500);
f = await fenster(dennis);
pruefe(!f.some(t => t.includes('ZURÜCK')), 'Nach dem Neustart keine Meldungen über Zurückgenommenes: ' + JSON.stringify(f));
await zu(dennis);
// Tagebuch wieder beschreibbar
await dennis.click('[data-logbuch]'); await warte(300);
pruefe(await dennis.isVisible('#lbInput') && (await dennis.textContent('#lbStep')).startsWith('1 /'), 'Tagebuch: Frage 1 ist wieder offen und beschreibbar');
await dennis.click('#lbClose'); await warte(300);

// Rückgängig holt alles zurück, still (keine Kette von Momenten)
await leeren(dennis);
await admin.click('#undo'); await warte(2500);
f = await fenster(dennis);
pruefe(f.length === 0, 'Rückgängig: kein Fenster bei Dennis: ' + JSON.stringify(f));
pruefe((await admin.textContent('#done')) === '3' && (await admin.textContent('#lbList')).includes('Antwort 7'), 'Rückgängig: Quests und Tagebuch wieder da');
pruefe((await dennis.textContent('#questList')).includes('Rikes Tagebuch') && await dennis.$eval('.q-row[data-id="logbuch"]', e => /bestanden|won|done/.test(e.className + e.innerHTML)), 'Rückgängig: Dennis sieht das Tagebuch wieder bestanden');

// Zurücksetzen, während Dennis' Handy auf dem Titelbild steht: still, beim PRESS START Prolog, keine Meldungen
await dennis.close();
dennis = await seite('');
await warte(500);
await admin.click('#reset'); await warte(2500);
pruefe(!(await dennis.isVisible('#overlay')), 'Titelbild: kein Fenster während des Zurücksetzens');
await dennis.click('#introScreen'); await warte(900);
pruefe(await dennis.isVisible('#prolog'), 'Titelbild: PRESS START zeigt den Prolog');
await dennis.click('#prologSkip'); await warte(800);
f = await fenster(dennis);
pruefe(!f.length, 'Titelbild: danach keine Meldungen: ' + JSON.stringify(f));
await zu(dennis);

// Nur das Tagebuch leeren (eigener Knopf), mit Rückgängig
await tagebuch(dennis, 'Neu ');
await warte(500);
await admin.click('#resetLb'); await warte(800);
pruefe(!(await admin.textContent('#lbList')).includes('Neu 7'), 'Tagebuch-Knopf: Antworten gelöscht');
await dennis.click('[data-logbuch]'); await warte(300);
pruefe(await dennis.isVisible('#lbInput'), 'Tagebuch-Knopf: Dennis kann wieder antworten');
await dennis.click('#lbClose'); await warte(300);
await admin.click('#undo'); await warte(800);
pruefe((await admin.textContent('#lbList')).includes('Neu 7'), 'Tagebuch-Knopf: Rückgängig holt die Antworten zurück');

// Echtes Handy mit Firebase (nachgebildet, langsames Netz): Es hatte schon gespielt und hat Kopien von Einträgen und
// Tagebuch im Speicher. Nach NEUER ANFANG vergisst es alles, auch nach schnellem PRESS START taucht nichts Altes auf,
// und es schreibt nichts auf den Server.
{
  const ctx2 = await b.newContext({ viewport: { width: 852, height: 393 }, isMobile: true, hasTouch: true });
  const schreibt = [];
  await ctx2.route('**firebasedatabase.app/**', async r => {
    if (r.request().method() !== 'GET') { schreibt.push(r.request().method()); return r.fulfill({ status: 200, body: 'null' }); }
    await warte(2500);
    const spiel = /dennis-jga-2026\.json/.test(r.request().url());
    return r.fulfill({ status: 200, contentType: 'application/json', body: spiel ? JSON.stringify({ neustart: 1790000000000, stand: 1790000000001 }) : 'null' });
  });
  await ctx2.addInitScript(() => {
    window.EventSource = undefined;
    window.__fenster = [];
    document.addEventListener('DOMContentLoaded', () => { const o = document.getElementById('overlay'); new MutationObserver(() => { if (!o.hidden) window.__fenster.push(o.textContent.replace(/\s+/g, ' ').trim().slice(0, 60)); }).observe(o, { attributes: true, childList: true, subtree: true }); });
    if (sessionStorage.vorher) return;
    sessionStorage.vorher = 1;
    localStorage.setItem('dq-gesehen-v1', JSON.stringify({ quests: { logbuch: 'bestanden' }, zeiten: { logbuch: 1 } }));
    ['dq-prolog-v2', 'dq-onboarding-v1', 'dq-gps'].forEach(k => localStorage.setItem(k, '1'));
    localStorage.setItem('dennis-quest-doc:dennis-jga-2026', JSON.stringify({ stand: 5 }));
    localStorage.setItem('dennis-quest-eintraege:dennis-jga-2026-dennis', JSON.stringify({ q_logbuch: { status: 'bestanden', zeit: 1 } }));
    localStorage.setItem('dennis-quest-logbuch:dennis-jga-2026-logbuch', JSON.stringify({ 1: { antwort: 'Kino', zeit: 1 } }));
  });
  const p = await ctx2.newPage(); p.on('pageerror', e => fehler.push('Firebase-Handy: ' + e.message));
  await p.goto(BASE); await warte(400);
  await p.click('#introScreen'); await warte(800);
  await p.evaluate(() => { while (!document.getElementById('coach').hidden) document.getElementById('coach').click(); });
  await warte(3500);
  pruefe((await p.evaluate(() => window.__fenster.slice(-1)[0] || '')).includes('NEUER ANFANG'), 'Firebase-Handy: Fenster NEUER ANFANG');
  const speicher = await p.evaluate(() => ['dennis-quest-eintraege:dennis-jga-2026-dennis', 'dennis-quest-logbuch:dennis-jga-2026-logbuch', 'dq-gps', 'dq-prolog-v2', 'dq-onboarding-v1'].map(k => localStorage.getItem(k)));
  pruefe(speicher.join('|') === '{}|{}|||', 'Firebase-Handy vergisst Einträge, Tagebuch, GPS, Prolog, Beutel: ' + speicher.join('|'));
  await p.click('#overlay'); await warte(700);
  await p.click('#introScreen'); await warte(700);
  pruefe(await p.isVisible('#prolog'), 'Firebase-Handy: nach dem Neuladen gleich PRESS START, der Prolog kommt');
  if (await p.isVisible('#prologSkip')) await p.click('#prologSkip');
  await warte(4000);
  const f = await p.evaluate(() => window.__fenster);
  pruefe(!f.length && (await p.$eval('.q-row[data-id="logbuch"]', e => e.classList.contains('st-offen'))), 'Firebase-Handy: nichts Altes taucht auf: ' + JSON.stringify(f));
  pruefe(!schreibt.length, 'Firebase-Handy schreibt nichts auf den Server: ' + schreibt.join(','));
  await ctx2.close();
}

await b.close();
console.log(ok.map(t => 'ok    ' + t).join('\n'));
console.log(fehler.length ? fehler.map(t => 'FEHLT ' + t).join('\n') : 'Alles in Ordnung.');
process.exit(fehler.length ? 1 : 0);
