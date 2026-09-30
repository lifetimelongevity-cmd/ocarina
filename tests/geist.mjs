// Der Schattendieb im Tagebuch (30.09.): Ist Rikes Antwort auf Frage 1 vorbei, huscht Buu Huu des Bundes herein und
// macht daraus eine Quest (das Gemeine macht der Bund, nicht die Fee). Satz 1 spricht er allein, bei Satz 2 erscheint das
// Medaillon von Rikes Rache, bei Satz 3 verschwindet es im Nebel. Er kommt am Ende der Nachricht, spätestens bei WEITER oder ✕,
// einmal nach jedem Besiegeln (Tagebuch leeren: wieder).
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/geist.mjs /tmp/shots
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:8765/';
const OUT = process.argv[2] || '.';
fs.mkdirSync(OUT, { recursive: true });
const ok = [], fehler = [];
const pruefe = (bed, text) => (bed ? ok : fehler).push(text);
const warte = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch();

// Admin und Dennis im selben Browser, Speicher „lokal“: beide Seiten sehen sich über localStorage. Größe: iPhone 13 quer.
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await ctx.route('**/config.js', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace('typ: "firebase"', 'typ: "lokal"') }); });
const seite = async url => { const p = await ctx.newPage(); p.on('pageerror', e => fehler.push(url + ': ' + e.message)); await p.goto(BASE + url); await warte(500); return p; };
const zu = async p => { while (await p.isVisible('#overlay')) { await p.click('#overlay'); await warte(300); } while (await p.isVisible('#coach')) { await p.click('#coach'); await warte(150); } };
const geist = p => p.isVisible('#geistRuf');
const schritt = p => p.textContent('#lbStep');
// Wartet, bis der Buu Huu da ist (höchstens ms), und gibt zurück, ob er kam
async function kommt(p, ms) { for (let t = 0; t < ms; t += 100) { if (await geist(p)) return true; await warte(100); } return false; }
// Wartet, bis der Satz ganz dasteht, und gibt ihn zurück
async function satz(p) { let alt = ''; for (let i = 0; i < 40; i++) { const t = await p.textContent('#grText'); if (t && t === alt) return t; alt = t; await warte(120); } return alt; }
const besiegeln = async (p, text) => { await p.fill('#lbInput', text); await p.click('#lbSeal'); await warte(250); };
// Tippt den Buu Huu durch, bis er geflohen ist (verschwindet er gerade, zählt der Tipp nicht)
async function durch(p) { for (let i = 0; i < 30 && await geist(p); i++) { await p.click('#geistRuf', { timeout: 1500 }).catch(() => {}); await warte(250); } }

const admin = await seite('admin.html');
await admin.$$eval('details', ds => ds.forEach(d => { d.open = true; }));
admin.on('dialog', d => d.accept());
await admin.click('#reset'); await warte(300);
await admin.click('#freigeben'); await warte(300);
const dennis = await seite('?direkt');
await zu(dennis); await warte(1500); await zu(dennis);
await dennis.click('[data-logbuch]'); await warte(400);

// 1. Frage 1 besiegelt: Während Rike spricht (hier der Platzhalter, gut 2 s), kommt der Buu Huu noch nicht
await besiegeln(dennis, 'Nadel einfädeln');
pruefe(!(await geist(dennis)), 'Während Rikes Nachricht: kein Buu Huu');
pruefe(await kommt(dennis, 6000), 'Nach Rikes Antwort auf Frage 1 huscht Buu Huu herein');
pruefe(!!(await dennis.$('#geistRuf use[href="#i-dieb"]')) && !(await dennis.$('#geistRuf img')) && (await dennis.textContent('#grBox')).includes('BUU HUU'), 'Es spricht Buu Huu im Dienst des Bundes, nicht die Fee');
pruefe((await schritt(dennis)) === '1 / 7' && await dennis.isVisible('#lbNext'), 'Dahinter bleibt das Tagebuch bei Frage 1');
const s1 = await satz(dennis);
pruefe(s1 === 'Hehehe … interessant. Nicht mal einen Faden durchs Nadelöhr?', 'Satz 1: ' + s1);
pruefe(!(await dennis.$('#grBild .gr-medaillon')), 'Satz 1: noch kein Medaillon');
await dennis.screenshot({ path: `${OUT}/geist-1-interessant.png` });

// 2. Satz 2: Das Medaillon der neuen Quest erscheint (Nadel mit Herzfaden), der Name bleibt geheim
await dennis.click('#geistRuf'); await warte(200);
const s2 = await satz(dennis);
pruefe(s2 === 'Dann macht der Bund daraus doch direkt eine Quest!', 'Satz 2: ' + s2);
pruefe(!!(await dennis.$('#grBild .medal-stage use[href="#i-nadel"]')), 'Satz 2: Medaillon mit der Nadel');
await warte(900);
await dennis.screenshot({ path: `${OUT}/geist-2-quest.png` });

// 3. Satz 3: Nebel legt sich darüber, übrig bleibt ein verdecktes Medaillon wie in der Liste
await dennis.click('#geistRuf'); await warte(200);
const s3 = await satz(dennis);
pruefe(s3 === 'Sie wartet im Nebel auf dich. Viel Spaß beim Einfädeln!', 'Satz 3: ' + s3);
pruefe(!!(await dennis.$('#grBild .gr-medaillon.im-nebel')), 'Satz 3: Medaillon im Nebel');
await warte(1300);
await dennis.screenshot({ path: `${OUT}/geist-3-nebel.png` });
const sichtbar = await dennis.evaluate(() => [...document.querySelectorAll('#geistRuf, .face.active, .hud')].map(e => e.innerText).join(' '));
pruefe(!sichtbar.includes('Rikes Rache'), 'Nirgends steht der Name der Quest');

// 4. Letzter Tipp: Er flieht, das Tagebuch ist wieder da. WEITER führt zu Frage 2, er kommt nicht noch einmal.
await dennis.click('#geistRuf'); await warte(700);
pruefe(!(await geist(dennis)) && await dennis.isVisible('#lbNext'), 'Danach: Buu Huu weg, Tagebuch mit WEITER');
await dennis.click('#lbPlay'); await warte(3500);
pruefe(!(await geist(dennis)), 'Rike noch einmal gehört: kein zweiter Auftritt');
await dennis.click('#lbNext'); await warte(300);
pruefe((await schritt(dennis)) === '2 / 7' && !(await geist(dennis)), 'WEITER: Frage 2, ohne Buu Huu');
await besiegeln(dennis, 'Socken');
pruefe(!(await kommt(dennis, 3500)), 'Nach Frage 2: kein Buu Huu (nur Frage 1 wird zur Quest)');
await dennis.click('#lbNext'); await warte(300);

// 5. Tagebuch leeren: Frage 1 ist wieder offen. Diesmal blättert Dennis gleich weiter, der Buu Huu kommt dann sofort,
//    und danach geht es zu Frage 2.
await dennis.click('#lbClose'); await warte(300);
await admin.click('#resetLb'); await warte(600);
await dennis.click('[data-logbuch]'); await warte(400);
pruefe((await schritt(dennis)) === '1 / 7', 'Tagebuch geleert: wieder Frage 1');
await besiegeln(dennis, 'Einfädeln');
await dennis.click('#lbNext');
pruefe(await geist(dennis) && !(await dennis.isVisible('#lbForm')), 'WEITER vor dem Ende der Nachricht: Der Schattendieb kommt sofort');
await dennis.click('#geistRuf'); await warte(100);   // zu früh: zählt nicht, er huscht noch herein
pruefe(await geist(dennis), 'Tipp während er hereinhuscht: nichts übersprungen');
await durch(dennis);
pruefe(!(await geist(dennis)) && (await schritt(dennis)) === '2 / 7' && await dennis.isVisible('#lbForm'), 'Nach Buu Huu: Frage 2 zum Beantworten');

// 6. ✕ statt WEITER: erst der Buu Huu, dann schließt das Tagebuch
await dennis.click('#lbClose'); await warte(300);
await admin.click('#resetLb'); await warte(600);
await dennis.click('[data-logbuch]'); await warte(400);
await besiegeln(dennis, 'Nähen');
await dennis.click('#lbClose');
pruefe(await geist(dennis), '✕ vor dem Ende der Nachricht: Der Schattendieb kommt');
await warte(800);
await dennis.keyboard.press('Escape'); await warte(700);
pruefe(!(await geist(dennis)) && !(await dennis.isVisible('#logbuch')), 'Esc: Er flieht, dann schließt das Tagebuch');

// 7. Tastatur (Laptop): Enter blättert
await admin.click('#resetLb'); await warte(600);
await dennis.click('[data-logbuch]'); await warte(400);
await besiegeln(dennis, 'Geduld');
await dennis.click('#lbNext'); await warte(900);
for (let i = 0; i < 12 && await geist(dennis); i++) { await dennis.keyboard.press('Enter'); await warte(250); }
pruefe(!(await geist(dennis)) && (await schritt(dennis)) === '2 / 7', 'Enter blättert durch Buu Huu bis zu Frage 2');

await b.close();
console.log(ok.map(t => 'ok    ' + t).join('\n'));
console.log(fehler.length ? fehler.map(t => 'FEHLT ' + t).join('\n') : 'Alles in Ordnung.');
process.exit(fehler.length ? 1 : 0);
