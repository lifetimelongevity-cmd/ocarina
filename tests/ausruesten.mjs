// Ausrüsten beim Spiel (29.09., 08-erlebnis-plan.md Abschnitt 16): AUSRÜSTEN auf der Quest-Karte, in der Ausrüstung Items und
// Fluch auf die C-Tasten legen, ein Siegel MITNEHMEN, Moment AUSGERÜSTET, zurück zu QUESTS mit DABEI. Am Gipfel rüstet Dennis
// sich je Duell (der Schild ist seit 01.10. gestrichen). Dazu: Fenster sind immer gleich groß.
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/ausruesten.mjs /tmp/shots
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:8765/';
const OUT = process.argv[2] || '.';
fs.mkdirSync(OUT, { recursive: true });
const ok = [], fehler = [];
const pruefe = (bed, text) => (bed ? ok : fehler).push(text);
const warte = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 844, height: 340 }, isMobile: true, hasTouch: true });   // iPhone 13 in Safari, das kleinste
const text = async (p, sel) => ((await p.textContent(sel).catch(() => '')) || '').replace(/\s+/g, ' ').trim();
const fenster = async p => (await p.isVisible('#overlay')) ? text(p, '#overlay') : '';
const szeneUeberspringen = async p => { for (let i = 0; i < 80 && await p.isVisible('#fluchSzene') && !(await p.evaluate(() => document.getElementById('fluchSzene').classList.contains('steht'))); i++) await warte(200); if (await p.isVisible('#fluchSzene')) { await p.click('#fluchSzene'); await warte(500); } };
const zu = async p => { for (let i = 0; i < 3; i++) { await szeneUeberspringen(p); while (await p.isVisible('#overlay')) { await p.click('#overlay'); await warte(300); } while (await p.isVisible('#coach')) { await p.click('#coach'); await warte(150); } await warte(400); } };
const seite = async () => (await p.evaluate(() => document.querySelector('.face.active')?.dataset.page));
const hoehe = async (p, sel) => p.$eval(sel, e => e.offsetHeight);
async function halten(p, ms = 1100) {
  const k = await p.locator('#swSiegel').boundingBox();
  await p.mouse.move(k.x + k.width / 2, k.y + k.height / 2); await p.mouse.down(); await warte(ms); await p.mouse.up(); await warte(700);
}

// 1. Auge des Jägers: Dennis hat die kleine Pistole und zwei Flüche
const p = await ctx.newPage();
p.on('pageerror', e => fehler.push('seite: ' + e.message));
await p.goto(BASE + '?demo=mitte&direkt'); await warte(900); await zu(p);
const moment1 = await hoehe(p, '#overlay .result').catch(() => 0);
await p.click('[data-demo="bestanden"]'); await warte(800);
const hoeheMoment = await hoehe(p, '#overlay .result');
await zu(p); await warte(1200); await zu(p);
pruefe((await text(p, '#hudNextName')) === 'Auge des Jägers', 'Auge des Jägers ist dran');
const minis = await p.$$eval('#questCard .ruest-minis [data-item]', xs => xs.map(x => x.dataset.item));
pruefe(await p.isVisible('#questCard [data-ausruesten="auge"]') && JSON.stringify(minis) === '["pistole_klein","spruchrolle"]', 'Quest-Karte: AUSRÜSTEN mit kleiner Pistole und Fluch (' + minis.join(', ') + ')');
pruefe(!(await p.$('#questCard [data-einsetzen]')), 'Keine Einsatz-Knöpfe mehr auf der Quest-Karte');
pruefe(await p.$eval('#questCard', e => e.classList.contains('vor-dem-spiel')) && await p.isVisible('#questCard [data-ergebnis="bestanden"]'), 'Eine Farbe pro Schritt: AUSRÜSTEN leuchtet, BESTANDEN ist nur umrandet, aber da');
pruefe((await text(p, '#questCard .tb-text')) === 'Lösch fünf Flammen mit einem Tank.', 'Quest-Text in einem Satz');
await p.screenshot({ path: `${OUT}/ausruesten-1-quest.png` });

await p.tap('#questCard [data-ausruesten="auge"]'); await warte(1300);
pruefe(await seite() === '2', 'AUSRÜSTEN dreht zur Ausrüstung');
pruefe((await text(p, '#ruestFuer')) === 'FÜR AUGE DES JÄGERS' && await p.isVisible('#cTasten'), 'Plakette „FÜR AUGE DES JÄGERS“, darunter die C-Tasten');
pruefe(await p.$$eval('.c-taste.leer', xs => xs.length) === 3, 'Drei C-Tasten, alle frei');
const leuchtet = await p.$$eval('.slot.usable', xs => xs.map(x => x.dataset.id));
pruefe(JSON.stringify(leuchtet) === '["pistole_klein","spruchrolle"]', 'Es leuchtet, was hilft: kleine Pistole und Fluch');
const hoeheBox = [];
hoeheBox.push(await hoehe(p, '#itemBox'));
await p.tap('.slot[data-id="pistole_klein"]'); await warte(300);
hoeheBox.push(await hoehe(p, '#itemBox'));
pruefe((await p.getAttribute('.c-taste.l', 'data-id')) === 'pistole_klein' && await p.$eval('.slot[data-id="pistole_klein"]', e => e.classList.contains('dabei')), 'Tippen legt die Pistole auf die C-Taste links, das Feld trägt einen Haken');
pruefe((await text(p, '#itemBox')).includes('Kommt mit') && (await text(p, '[data-mitnehmen]')).includes('MITNEHMEN · 1'), 'Textbox: „Kommt mit“, MITNEHMEN · 1');
await p.tap('.c-taste.l'); await warte(300);
pruefe(await p.$$eval('.c-taste.leer', xs => xs.length) === 3 && !(await p.isVisible('[data-mitnehmen]')), 'Tippen auf die C-Taste legt sie zurück');
await p.tap('.slot[data-id="pistole_klein"]'); await warte(200);
await p.tap('.slot[data-id="spruchrolle"]'); await warte(300);
hoeheBox.push(await hoehe(p, '#itemBox'));
pruefe((await text(p, '#itemBox')).includes('Hier: Wasserwaffe eine Stufe stärker'), 'Beim Fluch steht, was er hier bringt');
await p.tap('.slot[data-feld="karten"]'); await warte(300);
hoeheBox.push(await hoehe(p, '#itemBox'));
pruefe(!(await p.$eval('.slot[data-feld="karten"]', e => e.classList.contains('dabei'))) && (await text(p, '[data-mitnehmen]')).includes('MITNEHMEN · 2'), 'Was hier nicht hilft, zeigt nur, was es ist');
pruefe(new Set(hoeheBox).size === 1, 'Textbox bleibt gleich hoch (' + hoeheBox.join(', ') + ' px)');
await p.screenshot({ path: `${OUT}/ausruesten-2-c-tasten.png` });

await p.tap('[data-mitnehmen]'); await warte(400);
const siegel = await text(p, '#schwur');
const hoeheSiegel = await hoehe(p, '.sw-panel');
pruefe(siegel.includes('AUSRÜSTEN FÜR') && siegel.includes('Kleine Pistole') && siegel.includes('FLUCH') && siegel.includes('Stufe stärker') && siegel.includes('PREIS') && siegel.includes('Buu Huu dreht am Rad'), 'Siegel: DABEI, Vorteil des Fluchs, Buu Huus Rad');
await p.screenshot({ path: `${OUT}/ausruesten-3-siegel.png` });
await p.click('#swZurueck'); await warte(300);
pruefe(await p.$$eval('.c-taste:not(.leer)', xs => xs.length) === 2, 'ZURÜCK: beides liegt noch auf den C-Tasten');
await p.tap('[data-mitnehmen]'); await warte(400);
await p.evaluate(() => { Math.random = () => 0; });   // Buu Huus Rad bleibt auf 0 stehen
await halten(p);
pruefe(await p.isVisible('#fluchSzene'), 'Mit Fluch: erst die Szene mit Buu Huus Rad');
await szeneUeberspringen(p);
const ausgeruestet = await fenster(p);
pruefe(ausgeruestet.includes('AUSGERÜSTET') && ausgeruestet.includes('Kleine Wasserpistole') && ausgeruestet.includes('Stufe stärker') && ausgeruestet.includes('leer abgezogen'), 'Moment AUSGERÜSTET: Pistole, Vorteil, der Dieb zieht leer ab');
pruefe(await hoehe(p, '#overlay .result') === hoeheMoment, `Moment gleich groß wie der Sieg davor (${hoeheMoment} px)`);
await p.screenshot({ path: `${OUT}/ausruesten-4-moment.png` });
await zu(p); await warte(800);
pruefe(await seite() === '1', 'Danach zurück auf QUESTS');
const dabei = await text(p, '#questCard .dabei-zeile');
pruefe(dabei.includes('DABEI') && dabei.includes('Kleine Pistole') && dabei.includes('Fluch') && !(await p.$('#questCard [data-ausruesten="auge"].qc-action')), 'Quest-Karte: DABEI mit Kleiner Pistole und Fluch, kein AUSRÜSTEN mehr');
pruefe(!(await p.$eval('#questCard', e => e.classList.contains('vor-dem-spiel'))), 'Jetzt sind BESTANDEN und VERLOREN die leuchtenden Knöpfe');
await p.screenshot({ path: `${OUT}/ausruesten-5-dabei.png` });
await p.tap('#questCard .dabei-zeile'); await warte(1300);
pruefe(await p.$$eval('.c-taste.fest', xs => xs.length) === 2 && !(await p.$('.slot.usable')), 'Ausrüstung: beides steht fest auf den C-Tasten, nichts leuchtet mehr');
await p.tap('.c-taste.l'); await warte(300);
pruefe((await text(p, '#itemBox')).includes('Dabei bei Auge des Jägers') && await p.$$eval('.c-taste.fest', xs => xs.length) === 2, 'Besiegeltes lässt sich nicht zurücklegen: „Dabei bei Auge des Jägers“');
// Siegel-Fenster gleich groß wie beim Ergebnis
await p.evaluate(() => document.querySelector('.shoulder-left').click()); await warte(1300);
await p.tap('#questCard [data-ergebnis="verloren"]'); await warte(400);
pruefe(await hoehe(p, '.sw-panel') === hoeheSiegel, `Siegel-Fenster immer gleich groß (${hoeheSiegel} px)`);
await p.click('#swZurueck'); await warte(300);
await p.close();

// 2. Rikes Tagebuch: nichts mitzunehmen, keine Plakette
const t = await ctx.newPage();
t.on('pageerror', e => fehler.push('tagebuch: ' + e.message));
await t.goto(BASE + '?demo=start&direkt'); await warte(900); await zu(t);
pruefe(!(await t.$('#questCard [data-ausruesten]')), 'Tagebuch: kein AUSRÜSTEN');
await t.evaluate(() => document.querySelector('.shoulder-right').click()); await warte(1300); await zu(t);
pruefe(!(await t.isVisible('#ruestFuer')) && !(await t.isVisible('#cTasten')), 'Ausrüstung ohne Plakette und C-Tasten, wenn nichts hilft');
await t.close();

// 3. Gipfel: je Duell ausrüsten. Der Schild ist gestrichen: eine Niederlage im Duell bietet keine Wahl mehr
const g = await ctx.newPage();
g.on('pageerror', e => fehler.push('gipfel: ' + e.message));
await g.goto(BASE + '?demo=bund&direkt'); await warte(900); await zu(g);
await g.tap('#questCard [data-tor="3"][data-weg="busse"]'); await warte(400); await halten(g); await zu(g); await warte(600);
const namen = await g.$$eval('.duell .d-name', xs => xs.map(x => x.textContent.replace(/\s+/g, ' ').trim()));
pruefe(namen[0].startsWith('Die drei Zeichen') && namen[1].startsWith('Auge des Jägers'), 'Duelle: Revanchen Die drei Zeichen und Auge des Jägers');
pruefe(!(await g.$('#questCard [data-ausruesten]')), 'Duell 1 (Die drei Zeichen): nichts mitzunehmen, auch kein Fluch (er bringt dort keinen Vorteil)');
await g.tap('[data-duell="1"][data-v="niederlage"]'); await warte(400);
pruefe(!(await text(g, '#swWahl')) && (await text(g, '#swKopf')).includes('NIEDERLAGE'), 'Niederlage im Duell: keine Wahl mehr, nur NIEDERLAGE');
await g.screenshot({ path: `${OUT}/ausruesten-6-niederlage.png` });
await g.click('#swZurueck'); await warte(200);
await g.tap('[data-duell="1"][data-v="sieg"]'); await warte(400); await halten(g); await zu(g); await warte(600);
pruefe(await g.isVisible('#questCard [data-ausruesten="bund"]'), 'Duell 2 (Auge des Jägers): AUSRÜSTEN');
await g.tap('#questCard [data-ausruesten="bund"]'); await warte(1300);
pruefe((await text(g, '#ruestFuer')) === 'FÜR DUELL 2 · AUGE DES JÄGERS', 'Plakette: FÜR DUELL 2 · AUGE DES JÄGERS');
await g.tap('.slot[data-id="pistole_klein"]'); await warte(200);
await g.tap('[data-mitnehmen]'); await warte(400); await halten(g);
pruefe((await fenster(g)).includes('Duell 2 · Auge des Jägers'), 'Moment: ausgerüstet für Duell 2');
await zu(g); await warte(800);
await g.tap('[data-duell="2"][data-v="sieg"]'); await warte(400); await halten(g); await zu(g); await warte(600);
await g.evaluate(() => document.querySelector('.shoulder-right').click()); await warte(1300);
pruefe((await text(g, '#ruestFuer')) === 'FÜR DUELL 3 · WIRBEL DER GÖTTER' && await g.$$eval('.c-taste.fest', xs => xs.length) === 0, 'Duell 3: neue Plakette, die C-Tasten sind wieder frei');
pruefe(JSON.stringify(await g.$$eval('.slot.usable', xs => xs.map(x => x.dataset.id))) === '["spruchrolle"]', 'Duell 3 (Wirbel): nur der Fluch leuchtet (seit 01.10. ohne Kreisel)');
await g.screenshot({ path: `${OUT}/ausruesten-7-duell3.png` });
await g.close();

await b.close();
console.log(ok.map(t => 'ok    ' + t).join('\n'));
if (fehler.length) { console.log(fehler.map(t => 'FEHLER ' + t).join('\n')); process.exitCode = 1; }
else console.log('Alles in Ordnung.');
