// Der Brief vor dem Titelbild (01.10.): Beim allerersten Öffnen liegt ein versiegelter Brief von Fabio und Bene vor dem
// Titelbild, auch hochkant. Ein kurzer Tipp öffnet nichts, das Siegel muss gehalten werden. Dann der Brief, Tippen zeigt
// alles, noch ein Tipp das P.S. mit dem Startbildschirm (Schritte je Browser) und „Jetzt dreh dein Handy“. Drehen (oder LOS
// im Querformat) öffnet das Titelbild. Einmal pro Handy, nie mit ?direkt, in der Demo nur mit ?brief. Passt auf jedes Handy.
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/brief.mjs /tmp/shots
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:8765/';
const OUT = process.argv[2] || '.';
fs.mkdirSync(OUT, { recursive: true });
const ok = [], fehler = [];
const pruefe = (bed, text) => (bed ? ok : fehler).push(text);
const warte = ms => new Promise(r => setTimeout(r, ms));
const UA = {
  samsung: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36',
  chrome: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
};
// Das Siegel braucht mit Absicht lange (config.js, brief.halten)
const HALT = Number(fs.readFileSync(new URL('../app/config.js', import.meta.url), 'utf8').match(/\bhalten: (\d+)/)[1]) + 500;
const b = await chromium.launch();

async function seite(w, h, ua, url = '') {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA[ua] });
  await ctx.route('**firebasedatabase.app**', r => r.abort());
  const p = await ctx.newPage();
  p.on('pageerror', e => fehler.push(`${w}×${h} ${url}: ${e.message}`));
  await p.goto(BASE + url, { waitUntil: 'load' }); await warte(1300);
  return { ctx, p };
}
const sichtbar = (p, sel) => p.isVisible(sel);
// Liegt das Papier ganz im Bild?
const passt = p => p.evaluate(() => { const r = document.querySelector('.brief-papier').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight + .5 && r.left >= 0 && r.right <= innerWidth + .5; });
async function halten(p, ms) {
  const k = await p.locator('#briefSiegel').boundingBox();
  await p.mouse.move(k.x + k.width / 2, k.y + k.height / 2); await p.mouse.down(); await warte(ms); await p.mouse.up();
}

// 1. Galaxy S24 hochkant, Samsung Internet (Dennis' Handy, Link aus WhatsApp)
{
  const { ctx, p } = await seite(360, 680, 'samsung');
  pruefe(await sichtbar(p, '#brief'), 'S24 hochkant: der Brief liegt da');
  pruefe(await p.evaluate(() => document.elementFromPoint(innerWidth / 2, innerHeight / 2).closest('#brief') !== null), 'S24 hochkant: der Brief liegt über „Handy quer halten“');
  const zuText = await p.textContent('#briefZu');
  pruefe(zuText.includes('An Dennis') && zuText.includes('Mach den Ton an') && zuText.includes('Halte das Siegel gedrückt'), 'Verschlossen: „An Dennis“, gleich „Mach den Ton an“, „Halte das Siegel gedrückt“');
  pruefe(await passt(p), 'S24 hochkant: verschlossener Brief passt ins Bild');
  await p.screenshot({ path: `${OUT}/brief-1-zu.png` });
  await halten(p, 300); await warte(500);
  pruefe(await sichtbar(p, '#briefZu') && !(await p.$eval('#brief', e => e.classList.contains('gebrochen'))), 'Kurzer Tipp aufs Siegel öffnet nichts');
  pruefe((await p.textContent('#briefHinweis')).includes('Waldschrat'), 'Zu früh losgelassen: „Ey, gedrückt halten, du Waldschrat!“');
  await p.screenshot({ path: `${OUT}/brief-1b-waldschrat.png` });
  await halten(p, HALT - 2500); await warte(500);
  pruefe(await sichtbar(p, '#briefZu') && (await p.textContent('#briefHinweis')).includes('Waldschrat'), 'Auch nach ein paar Sekunden losgelassen: noch zu, wieder der Waldschrat');
  {
    const k = await p.locator('#briefSiegel').boundingBox();
    await p.mouse.move(k.x + k.width / 2, k.y + k.height / 2); await p.mouse.down(); await warte(HALT * .5);
    const t = await p.textContent('#briefHinweis');
    pruefe(!t.includes('Waldschrat') && t.length > 0, 'Beim Halten wechselt der Hinweis: ' + t);
    await warte(HALT * .5); await p.mouse.up();
  }
  await warte(900);
  pruefe(await sichtbar(p, '#briefOffen') && !(await sichtbar(p, '#briefZu')), 'Siegel lange genug gehalten: der Brief geht auf');
  const text = await p.textContent('#briefText');
  pruefe(text.includes('Fabio und Bene') && text.includes('ein letztes Abenteuer als freier Mann'), 'Brief von Fabio und Bene: ein letztes Abenteuer als freier Mann');
  pruefe(!/Rike/.test(await p.textContent('#brief')), 'Rike kommt im Brief nicht vor');
  pruefe(await p.evaluate(() => localStorage.getItem('dq-brief-v1')) === null, 'Noch nicht gemerkt, solange er liest');
  await p.mouse.click(20, 20); await warte(300);
  pruefe(await p.$eval('#briefOffen', e => e.classList.contains('fertig')), 'Erster Tipp zeigt den ganzen Brief');
  pruefe(await passt(p), 'S24 hochkant: offener Brief passt ins Bild');
  await p.screenshot({ path: `${OUT}/brief-2-offen.png` });
  await p.mouse.click(20, 20); await warte(700);
  pruefe(await sichtbar(p, '#briefPs'), 'Zweiter Tipp: das P.S.');
  pruefe(await p.evaluate(() => localStorage.getItem('dq-brief-v1')) === '1', 'Ab dem P.S. merkt sich das Handy den Brief');
  pruefe(await sichtbar(p, '#briefInstall'), 'P.S.: Knopf AUF DEN STARTBILDSCHIRM');
  pruefe(!(await p.textContent('#briefPsText')).includes('Ton'), 'Der Ton steht nicht noch einmal im P.S.');
  pruefe((await p.textContent('#briefDrehText')) === 'Jetzt dreh dein Handy.' && (await sichtbar(p, '.brief-handy')), 'Hochkant: „Jetzt dreh dein Handy.“ mit Handy');
  pruefe((await p.textContent('#briefSperre')).includes('Automatisch drehen'), 'Hinweis aufs automatische Drehen (Android)');
  pruefe(await sichtbar(p, '#briefLos'), 'Android hochkant: LOS (Vollbild und quer)');
  await p.click('#briefInstall'); await warte(400);
  pruefe((await p.textContent('#briefSchritte')).includes('Seite hinzufügen zu') && !(await sichtbar(p, '#briefInstall')), 'Samsung Internet ohne Fenster: Schritte von Hand');
  pruefe(await passt(p), 'S24 hochkant: P.S. mit Schritten passt ins Bild');
  await p.screenshot({ path: `${OUT}/brief-3-ps.png` });
  await p.setViewportSize({ width: 780, height: 360 }); await warte(1000);
  pruefe(!(await sichtbar(p, '#brief')), 'Gedreht: der Brief ist weg');
  pruefe(await sichtbar(p, '#introScreen') && await sichtbar(p, '#startQuest'), 'Gedreht: das Titelbild mit PRESS START');
  await p.screenshot({ path: `${OUT}/brief-4-titel.png` });
  await p.reload({ waitUntil: 'load' }); await warte(900);
  pruefe(!(await sichtbar(p, '#brief')) && await sichtbar(p, '#introScreen'), 'Neu geladen: kein Brief mehr, gleich das Titelbild');
  await ctx.close();
}

// 2. Querformat, knappster Fall (S24, Chrome mit Statusleiste): P.S. „Bereit? Dann los.“, LOS öffnet das Titelbild
{
  const { ctx, p } = await seite(780, 280, 'chrome');
  pruefe(await sichtbar(p, '#brief') && await passt(p), 'S24 quer 780×280: der Brief liegt da und passt');
  await halten(p, HALT); await warte(900);
  await p.mouse.click(20, 20); await warte(300);
  pruefe(await passt(p), 'S24 quer 780×280: offener Brief passt');
  await p.screenshot({ path: `${OUT}/brief-5-quer-offen.png` });
  await p.mouse.click(20, 20); await warte(700);
  pruefe(await passt(p), 'S24 quer 780×280: P.S. passt');
  pruefe((await p.textContent('#briefDrehText')) === 'Bereit? Dann los.' && !(await sichtbar(p, '.brief-handy')) && await sichtbar(p, '#briefLos'), 'Quer: „Bereit? Dann los.“ und LOS, ohne Handy');
  await p.click('#briefInstall'); await warte(400);
  pruefe((await p.textContent('#briefSchritte')).includes('⋮'), 'Chrome ohne Fenster: Schritte mit ⋮');
  pruefe(await passt(p), 'S24 quer 780×280: P.S. mit Schritten passt');
  await p.screenshot({ path: `${OUT}/brief-6-quer-ps.png` });
  await p.click('#briefLos'); await warte(1000);
  pruefe(!(await sichtbar(p, '#brief')) && await sichtbar(p, '#startQuest'), 'LOS: das Titelbild mit PRESS START');
  await p.click('#introScreen'); await warte(900);
  pruefe(await sichtbar(p, '#prolog'), 'Danach wie bisher: PRESS START, der Prolog');
  await ctx.close();
}

// 3. iPhone hochkant: kein LOS (Apple erlaubt kein Vollbild), Ausrichtungssperre, Schritte mit Teilen
{
  const { ctx, p } = await seite(390, 664, 'ios');
  await halten(p, HALT); await warte(900);
  await p.mouse.click(20, 20); await warte(300); await p.mouse.click(20, 20); await warte(700);
  pruefe(!(await sichtbar(p, '#briefLos')), 'iPhone hochkant: kein LOS');
  pruefe((await p.textContent('#briefSperre')).includes('Ausrichtungssperre'), 'iPhone: Hinweis auf die Ausrichtungssperre');
  await p.click('#briefInstall'); await warte(400);
  pruefe((await p.textContent('#briefSchritte')).includes('Teilen'), 'iPhone: Schritte mit Teilen');
  pruefe(await passt(p), 'iPhone hochkant: P.S. passt');
  await p.setViewportSize({ width: 844, height: 340 }); await warte(1000);
  pruefe(!(await sichtbar(p, '#brief')) && await sichtbar(p, '#startQuest'), 'iPhone gedreht: das Titelbild');
  await ctx.close();
}

// 4. Passt auf jedes Handy, auch im kleinen Browser von WhatsApp
for (const [w, h, ua] of [[360, 560, 'samsung'], [360, 600, 'chrome'], [375, 600, 'ios'], [393, 700, 'ios'], [844, 340, 'ios'], [852, 342, 'ios'], [915, 356, 'samsung'], [780, 300, 'samsung']]) {
  const { ctx, p } = await seite(w, h, ua);
  let alle = await passt(p);
  await halten(p, HALT); await warte(900);
  await p.mouse.click(5, 5); await warte(300); alle = alle && await passt(p);
  await p.mouse.click(5, 5); await warte(700); alle = alle && await passt(p);
  await p.click('#briefInstall').catch(() => {}); await warte(300); alle = alle && await passt(p);
  pruefe(alle, `${w}×${h}: verschlossen, offen und P.S. passen ins Bild`);
  await ctx.close();
}

// 5. Wann nicht: ?direkt, die Demo (außer mit ?brief)
for (const [url, soll] of [['?direkt', false], ['?demo', false], ['?demo=start', false], ['?demo&brief', true]]) {
  const { ctx, p } = await seite(780, 360, 'samsung', url);
  pruefe((await sichtbar(p, '#brief')) === soll, `${url}: ${soll ? 'mit' : 'ohne'} Brief`);
  await ctx.close();
}

await b.close();
const echt = fehler;
ok.forEach(t => console.log('ok    ' + t));
echt.forEach(t => console.log('FEHLER ' + t));
console.log(echt.length ? `${echt.length} Fehler` : 'Alles in Ordnung.');
process.exit(echt.length ? 1 : 0);
