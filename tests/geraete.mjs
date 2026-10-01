// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/geraete.mjs /tmp/shots
// Braucht Playwright mit Chromium (global oder in einem node_modules neben dieser Datei).
// Playwright-Prüfung für die echten Geräte: iPhone 13, iPhone 15 (Safari und Home-Bildschirm), älteres Samsung (Chrome), Galaxy S24 (Chrome, Samsung Internet, Home-Bildschirm)
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:8765/';
const OUT = process.argv[2] || '.';
fs.mkdirSync(OUT, { recursive: true });

// Maße im Querformat. Safari: Adressleiste oben, Seite geht bis an den Rand (viewport-fit=cover), Insets links/rechts.
// Home-Bildschirm: ganzer Bildschirm, Insets links/rechts und Home-Balken unten.
const GERAETE = [
  { id: 'iphone13-safari', w: 844, h: 340, dpr: 3, sa: { l: 47, r: 47, b: 0, t: 0 }, ios: true },
  { id: 'iphone13-home',   w: 844, h: 390, dpr: 3, sa: { l: 47, r: 47, b: 21, t: 0 }, ios: true, standalone: true },
  { id: 'iphone15-safari', w: 852, h: 342, dpr: 3, sa: { l: 59, r: 59, b: 0, t: 0 }, ios: true },
  { id: 'iphone15-home',   w: 852, h: 393, dpr: 3, sa: { l: 59, r: 59, b: 21, t: 0 }, ios: true, standalone: true },
  { id: 'samsung-chrome',  w: 915, h: 356, dpr: 2.625, sa: { l: 0, r: 0, b: 0, t: 0 }, cpu: 4 },
  { id: 'samsung-voll',    w: 915, h: 412, dpr: 2.625, sa: { l: 32, r: 0, b: 0, t: 0 }, cpu: 4 },
  // Dennis' Handy: Galaxy S24 (SM-S921B, Exynos 2400), 780×360 CSS-Pixel. Chrome mit Adressleiste, Chrome mit Statusleiste
  // (knappster Fall), Samsung Internet (Standard-Browser) und vom Startbildschirm mit Kameraloch links
  { id: 's24-chrome',      w: 780, h: 304, dpr: 3, sa: { l: 0, r: 0, b: 0, t: 0 }, s24: true },
  { id: 's24-knapp',       w: 780, h: 280, dpr: 3, sa: { l: 0, r: 0, b: 0, t: 0 }, s24: true },
  { id: 's24-samsung',     w: 780, h: 300, dpr: 3, sa: { l: 0, r: 0, b: 0, t: 0 }, s24: true, sbrowser: true },
  { id: 's24-voll',        w: 780, h: 360, dpr: 3, sa: { l: 30, r: 0, b: 0, t: 0 }, s24: true },
];
// NUR=s24 node tests/geraete.mjs … prüft nur die Geräte, deren id so anfängt

const UA_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const UA_SAMSUNG = 'Mozilla/5.0 (Linux; Android 13; SM-A525F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36';
const UA_S24 = 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36';
const UA_S24_SB = 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36';
const ua = g => g.ios ? UA_IOS : g.sbrowser ? UA_S24_SB : g.s24 ? UA_S24 : UA_SAMSUNG;

const fehler = [];
const bericht = [];
const log = (...a) => { const s = a.join(' '); bericht.push(s); console.log(s); };

async function neueSeite(browser, g, url, { lokal = false, schwach = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: g.w, height: g.h }, deviceScaleFactor: g.dpr, isMobile: true, hasTouch: true,
    userAgent: ua(g) });
  if (lokal) await ctx.route('**/config.js', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace('typ: "firebase"', 'typ: "lokal"') }); });
  await ctx.route('**firebasedatabase.app**', r => r.abort());
  // Rikes Sprachnachrichten (AAC) kann das Chromium der Tests nicht abspielen, dann wartet Buu Huu auf „TIPP AUF ▶“.
  // Wie in tests/geist.mjs: Platzhalter-Klang statt der echten Dateien
  await ctx.route('**/assets/logbuch/*.m4a', r => r.fulfill({ status: 404 }));
  // Safe Areas nachstellen
  await ctx.addInitScript(sa => {
    document.addEventListener('DOMContentLoaded', () => {
      const st = document.createElement('style');
      st.textContent = `html:root{--sa-t:${sa.t}px;--sa-r:${sa.r}px;--sa-b:${sa.b}px;--sa-l:${sa.l}px}`;
      document.head.appendChild(st);
    });
  }, g.sa);
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') fehler.push(`${g.id}: ${m.text()}`); });
  page.on('pageerror', e => fehler.push(`${g.id}: ${e.message}`));
  if (g.cpu) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: g.cpu }); page._cdp = cdp; }
  await page.goto(BASE + url, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  return { ctx, page };
}

// Prüft: nichts im Bereich der Insets, keine abgeschnittenen Texte, Mindestschrift, Tippflächen
async function pruefen(page, g, name) {
  const r = await page.evaluate(sa => {
    const W = innerWidth, H = innerHeight, out = { inset: [], ueberlauf: [], klein: [], tipp: [], ausserhalb: [] };
    const sichtbar = el => { const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) return false; const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
    const inAktiv = el => !el.closest('.face') || el.closest('.face.active');
    const bereich = el => !el.closest('[hidden]') && inAktiv(el) && !el.closest('.intro-screen') ;
    // Sichtbarer Teil: was in einer scrollbaren Liste weggescrollt ist, ist erreichbar und kein Überlauf
    const sichtbarerTeil = el => {
      const e = el.getBoundingClientRect();
      let b = { left: e.left, right: e.right, top: e.top, bottom: e.bottom };
      for (let a = el.parentElement; a; a = a.parentElement) {
        const s = getComputedStyle(a);
        if (!/auto|scroll/.test(s.overflowY + s.overflowX)) continue;
        const q = a.getBoundingClientRect();
        b = { left: Math.max(b.left, q.left), right: Math.min(b.right, q.right), top: Math.max(b.top, q.top), bottom: Math.min(b.bottom, q.bottom) };
      }
      return b.right > b.left && b.bottom > b.top ? b : null;
    };
    for (const el of document.querySelectorAll('.hud button, .shoulder, .foot .sync, .face.active button, .face.active p, .result, .lb-panel, .qc-action, .prolog-skip, .prolog-box, .coach-bubble, .sw-panel')) {
      if (!bereich(el) || !sichtbar(el)) continue;
      const b = sichtbarerTeil(el);
      if (!b) continue;
      if (b.left < sa.l - 1 || b.right > W - sa.r + 1 || (b.bottom > H - sa.b + 1 && !el.classList.contains('sync'))) out.inset.push(`${el.className || el.tagName} [${Math.round(b.left)},${Math.round(b.right)},${Math.round(b.bottom)}]`);
      if (b.right > W + 1 || b.bottom > H + 1) out.ausserhalb.push(el.className);
    }
    for (const el of document.querySelectorAll('.face.active *, .hud *, .result *, .lb-panel *, .prolog *, .geist-ruf *, .coach-bubble *, .sw-panel *')) {
      if (!bereich(el) || !sichtbar(el)) continue;
      const s = getComputedStyle(el);
      const hatText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (hatText && parseFloat(s.fontSize) < 10) out.klein.push(`${el.className || el.tagName} ${s.fontSize} "${el.textContent.trim().slice(0, 20)}"`);
      if (hatText && s.overflow !== 'visible' && s.textOverflow !== 'ellipsis' && el.scrollWidth > el.clientWidth + 2 && !['TEXTAREA'].includes(el.tagName)) out.ueberlauf.push(`${el.className || el.tagName} "${el.textContent.trim().slice(0, 24)}"`);
    }
    for (const el of document.querySelectorAll('.face.active button:not([disabled]), .hud button, .shoulder, .lb-panel button:not([disabled]), .prolog button, .sw-panel button')) {
      if (!bereich(el) || !sichtbar(el)) continue;
      const b = el.getBoundingClientRect();
      if (Math.min(b.width, b.height) < 28) out.tipp.push(`${el.className} ${Math.round(b.width)}x${Math.round(b.height)}`);
    }
    // Demo-Knöpfe: groß genug und nicht im Streifen des Home-Balkens am unteren Rand
    out.demo = [];
    for (const el of document.querySelectorAll('.demo-bar:not([hidden]) button')) {
      const b = el.getBoundingClientRect();
      if (b.height < 28 || b.bottom > H - sa.b - 6) out.demo.push(`${el.textContent} ${Math.round(b.height)}px hoch, ${Math.round(H - b.bottom)}px über dem Rand`);
    }
    // Seite scrollt nicht quer
    out.quer = document.documentElement.scrollWidth > W + 1;
    return out;
  }, g.sa);
  const probleme = [];
  if (r.inset.length) probleme.push('Safe Area: ' + r.inset.join('; '));
  if (r.ausserhalb.length) probleme.push('außerhalb: ' + r.ausserhalb.join('; '));
  if (r.klein.length) probleme.push('Schrift < 10px: ' + r.klein.slice(0, 5).join('; '));
  if (r.ueberlauf.length) probleme.push('Überlauf: ' + r.ueberlauf.slice(0, 5).join('; '));
  if (r.tipp.length) probleme.push('Tippfläche < 28px: ' + r.tipp.slice(0, 6).join('; '));
  if (r.demo.length) probleme.push('Demo-Knöpfe: ' + r.demo.slice(0, 3).join('; '));
  if (r.quer) probleme.push('Seite scrollt quer');
  log(`  ${name}: ${probleme.length ? 'PROBLEME\n    ' + probleme.join('\n    ') : 'ok'}`);
  return probleme;
}

const shot = (page, g, name) => page.screenshot({ path: `${OUT}/${g.id}-${name}.png` });
const weiterTippen = async page => { while (await page.$('#coach:not([hidden])')) { await page.click('#coach'); await page.waitForTimeout(200); } };
const seite = async (page, n) => { await weiterTippen(page); for (let i = 0; i < 3; i++) { const p = await page.evaluate(() => +document.querySelector('.face.active').dataset.page); if (p === n) break; await page.click((n - p + 3) % 3 === 1 ? '.shoulder-right' : '.shoulder-left'); await page.waitForTimeout(650); } };

const browser = await chromium.launch();
let alleProbleme = 0;
for (const g of GERAETE.filter(g => !process.env.NUR || g.id.startsWith(process.env.NUR))) {
  log(`\n== ${g.id} (${g.w}×${g.h}, Insets l${g.sa.l} r${g.sa.r} b${g.sa.b}${g.cpu ? ', CPU ÷' + g.cpu : ''})`);
  // Startbildschirm. Mitte des Tages mit ?onboarding: Prolog und Hinweise kommen sonst nur am Anfang des Spiels
  let { ctx, page } = await neueSeite(browser, g, '?demo&onboarding');
  await page.waitForTimeout(900);
  await shot(page, g, '0-intro');
  // Bildrate auf dem Startbildschirm messen
  const fps = await page.evaluate(() => new Promise(res => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else res(n / 3); }; requestAnimationFrame(f); }));
  log(`  Intro: ${fps.toFixed(0)} Bilder/s${g.cpu ? ' (CPU gedrosselt)' : ''}`);
  const pressStart = await page.$eval('#startQuest', el => { const b = el.getBoundingClientRect(); return { l: b.left, r: b.right, b: b.bottom, fs: getComputedStyle(el).fontSize }; });
  if (pressStart.r > g.w - g.sa.r || pressStart.b > g.h - g.sa.b) { log('  PROBLEM: PRESS START in Safe Area', JSON.stringify(pressStart)); alleProbleme++; }
  await page.click('#introScreen');
  await page.waitForTimeout(700);
  // Prolog der Fee (mit ?onboarding jedes Mal): sechs Tafeln, dann ein kurzer Rundgang
  await page.waitForTimeout(1700); await shot(page, g, '0b-prolog');
  alleProbleme += (await pruefen(page, g, 'PROLOG')).length;
  for (let i = 0; i < 20 && await page.isVisible('#prolog'); i++) { await page.click('#prolog'); await page.waitForTimeout(300); }
  await page.waitForTimeout(500);
  if (await page.$('#coach:not([hidden])')) { await shot(page, g, '0c-rundgang'); alleProbleme += (await pruefen(page, g, 'RUNDGANG')).length; }
  await weiterTippen(page);
  await shot(page, g, '1-quests');
  alleProbleme += (await pruefen(page, g, 'QUESTS')).length;
  await seite(page, 0); await shot(page, g, '2-karte');
  alleProbleme += (await pruefen(page, g, 'KARTE')).length;
  await weiterTippen(page);
  // Stationstafel: Talstation (Tafel rechts) und Hütte mit dem Kästchen (Tafel links)
  await page.click('.mark[data-station="wiese"]'); await page.waitForTimeout(300);
  await shot(page, g, '2b-tafel-wiese');
  alleProbleme += (await pruefen(page, g, 'STATIONSTAFEL')).length;
  await page.click('.sc-close'); await page.waitForTimeout(200);
  await page.click('.mark[data-station="huette"]'); await page.waitForTimeout(300);
  await shot(page, g, '2c-tafel-huette');
  alleProbleme += (await pruefen(page, g, 'KÄSTCHEN-TAFEL')).length;
  await page.click('.sc-close'); await page.waitForTimeout(200);
  await seite(page, 2); await page.waitForTimeout(300);
  // Onboarding durchklicken
  // Der Beutel entpuppt sich als Spritze (ein Feld), danach beginnen die Hinweise der Fee
  if (!(await page.$('#overlay[hidden]'))) { await shot(page, g, '3a-onboarding'); alleProbleme += (await pruefen(page, g, 'BEUTEL WIRD SPRITZE')).length; await page.click('#overlay'); await page.waitForTimeout(1600); }
  else { log('  PROBLEM: Der Beutel entpuppt sich nicht'); alleProbleme++; }
  for (let i = 0; i < 4; i++) { if (await page.$('#coach:not([hidden])')) { if (i === 2) await shot(page, g, '3b-coach'); await page.click('#coach'); await page.waitForTimeout(300); } }
  await shot(page, g, '3-ausruestung');
  alleProbleme += (await pruefen(page, g, 'AUSRÜSTUNG')).length;
  // Dennis trägt selbst ein: Siegel-Fenster auf der Quest-Karte
  await seite(page, 1); await weiterTippen(page);
  // Spielbeginn blanko (30.09.): Nach dem Rundgang taucht die erste Quest mit etwas Abstand auf
  await page.waitForTimeout(2800);
  if (await page.$('#overlay:not([hidden])')) {
    await shot(page, g, '3d-erste-quest');
    alleProbleme += (await pruefen(page, g, 'ERSTE QUEST')).length;
    await page.click('#overlay'); await page.waitForTimeout(1400);
  } else { log('  PROBLEM: Die erste Quest taucht nicht auf'); alleProbleme++; }
  if (await page.$('#questCard [data-ergebnis="bestanden"]')) {
    await page.tap('#questCard [data-ergebnis="bestanden"]'); await page.waitForTimeout(400);
    await shot(page, g, '3c-siegel');
    alleProbleme += (await pruefen(page, g, 'SIEGEL')).length;
    await page.click('#swZurueck'); await page.waitForTimeout(200);
  } else { log('  PROBLEM: kein Knopf zum Eintragen auf der Quest-Karte'); alleProbleme++; }
  // Buchung: nächste Quest bestanden → Ergebnis-Fenster, per Finger getippt wie auf dem Handy
  await page.tap('[data-demo="bestanden"]');
  await page.waitForTimeout(1600);
  await shot(page, g, '4-ergebnis');
  alleProbleme += (await pruefen(page, g, 'ERGEBNIS')).length;
  await page.click('#overlay'); await page.waitForTimeout(1500);
  await shot(page, g, '5-nebel');
  await ctx.close();

  // Log-Buch am Tagesanfang
  ({ ctx, page } = await neueSeite(browser, g, '?demo=start&direkt'));
  await page.click('[data-logbuch]'); await page.waitForTimeout(400);
  await shot(page, g, '7-logbuch');
  alleProbleme += (await pruefen(page, g, 'LOG-BUCH')).length;
  await page.fill('#lbInput', 'Im Café am Gärtnerplatz, mit viel zu starkem Espresso');
  await page.click('#lbSeal'); await page.waitForTimeout(900);
  await shot(page, g, '8-logbuch-besiegelt');
  alleProbleme += (await pruefen(page, g, 'LOG-BUCH BESIEGELT')).length;
  // Nach Rikes Antwort auf Frage 1 huscht der Schattendieb herein und macht daraus eine Quest (30.09.): Bild mit dem Medaillon
  await page.waitForSelector('#geistRuf:not([hidden])', { timeout: 8000 }).catch(() => {});
  if (await page.isVisible('#geistRuf')) {
    await page.waitForTimeout(1200);
    for (let i = 0; i < 6 && !(await page.$('#grBild .gr-medaillon')); i++) { await page.click('#geistRuf', { timeout: 1500 }).catch(() => {}); await page.waitForTimeout(400); }
    await page.waitForTimeout(1200);
    await shot(page, g, '8b-geist-quest');
    alleProbleme += (await pruefen(page, g, 'SCHATTENDIEB IM TAGEBUCH')).length;
    for (let i = 0; i < 30 && await page.isVisible('#geistRuf'); i++) { await page.click('#geistRuf', { timeout: 1500 }).catch(() => {}); await page.waitForTimeout(250); }
  } else { log('  PROBLEM: Der Schattendieb kommt nach Frage 1 nicht'); alleProbleme++; }
  // Tastatur offen: sichtbarer Bereich nur etwa die Hälfte der Höhe, geprüft bei jeder weiteren Frage (lange Fragen brechen um)
  if (g.ios) {
    await page.click('#lbNext'); await page.waitForTimeout(200);
    await page.evaluate(() => { const el = document.querySelector('#logbuch'); el.style.setProperty('--vv-h', Math.round(innerHeight * .47) + 'px'); });
    const abgeschnitten = [];
    for (let erste = true; await page.isVisible('#lbForm'); erste = false) {
      await page.focus('#lbInput'); await page.waitForTimeout(200);
      if (erste) await shot(page, g, '9-logbuch-tastatur');
      const passt = await page.evaluate(() => { const f = document.querySelector('#lbFrage').getBoundingClientRect(), b = document.querySelector('#lbInput').getBoundingClientRect(), s = document.querySelector('#lbSeal').getBoundingClientRect(); return f.top >= 0 && b.bottom <= innerHeight * .47 + 1 && s.bottom <= innerHeight * .47 + 1; });
      if (!passt) abgeschnitten.push(await page.textContent('#lbStep'));
      await page.fill('#lbInput', 'Test'); await page.click('#lbSeal'); await page.waitForTimeout(300);
      await page.click('#lbNext'); await page.waitForTimeout(200);
    }
    log(`  Log-Buch mit Tastatur: Frage, Eingabe und Knopf sichtbar: ${abgeschnitten.length ? 'NEIN bei ' + abgeschnitten.join(', ') : 'ja, bei allen Fragen'}`);
    alleProbleme += abgeschnitten.length;
  }
  await ctx.close();

  // Ende des Tages
  ({ ctx, page } = await neueSeite(browser, g, '?demo=ende&direkt'));
  await shot(page, g, '10-ende');
  alleProbleme += (await pruefen(page, g, 'ENDE')).length;
  await ctx.close();
}

// Ladegröße und Seitenwechsel auf dem Samsung (gedrosselt, langsames 4G)
{
  const g = GERAETE.find(x => x.id === 'samsung-chrome');
  const ctx = await browser.newContext({ viewport: { width: g.w, height: g.h }, deviceScaleFactor: g.dpr, isMobile: true, hasTouch: true, userAgent: UA_SAMSUNG });
  await ctx.route('**firebasedatabase.app**', r => r.abort());
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
  const groessen = {};
  cdp.on('Network.loadingFinished', e => { groessen[e.requestId] = e.encodedDataLength; });
  const namen = {};
  cdp.on('Network.responseReceived', e => { namen[e.requestId] = e.response.url.replace('http://localhost:8765/', ''); });
  const t0 = Date.now();
  await page.goto(BASE + '?demo', { waitUntil: 'load' });
  const tLoad = Date.now() - t0;
  const lcp = await page.evaluate(() => new Promise(res => { new PerformanceObserver(l => { const e = l.getEntries(); res(e[e.length - 1].startTime); }).observe({ type: 'largest-contentful-paint', buffered: true }); setTimeout(() => res(-1), 3000); }));
  await page.waitForTimeout(500);
  const summe = Object.values(groessen).reduce((a, b) => a + b, 0);
  const liste = Object.keys(groessen).map(k => [namen[k], groessen[k]]).sort((a, b) => b[1] - a[1]).slice(0, 8);
  log(`\n== Laden auf dem Samsung (CPU ÷4, 1,6 Mbit/s, 150 ms): load ${tLoad} ms, größtes Bild sichtbar nach ${Math.round(lcp)} ms, übertragen ${(summe / 1024).toFixed(0)} KB`);
  liste.forEach(([n, b]) => log(`    ${(b / 1024).toFixed(0).padStart(5)} KB  ${n}`));
  // Seitenwechsel: längster Frame während der Drehung
  await page.click('#introScreen'); await page.waitForTimeout(800);
  if (await page.isVisible('#prolog')) { await page.click('#prologSkip'); await page.waitForTimeout(300); }
  const frames = await page.evaluate(async () => {
    const lang = []; let last = performance.now(), on = true;
    const f = t => { lang.push(t - last); last = t; if (on) requestAnimationFrame(f); };
    requestAnimationFrame(f);
    for (let i = 0; i < 3; i++) { document.querySelector('.shoulder-right').click(); await new Promise(r => setTimeout(r, 700)); }
    on = false;
    lang.sort((a, b) => b - a);
    return { max: lang[0], p95: lang[Math.floor(lang.length * .05)], n: lang.length };
  });
  log(`  Seitenwechsel (3×): längster Frame ${frames.max.toFixed(0)} ms, 95 % unter ${frames.p95.toFixed(0)} ms`);
  await ctx.close();
}

// Quest Master und Dennis zusammen (lokaler Speicher im selben Browser): Buchen, Einsetzen, Log-Buch
{
  const g = GERAETE.find(x => x.id === 'iphone15-home');
  const ctx = await browser.newContext({ viewport: { width: g.w, height: g.h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: UA_IOS });
  await ctx.route('**/config.js', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace('typ: "firebase"', 'typ: "lokal"') }); });
  const dennis = await ctx.newPage();
  dennis.on('pageerror', e => fehler.push('dennis: ' + e.message));
  await dennis.goto(BASE + '?direkt&onboarding');
  const admin = await ctx.newPage();
  admin.on('pageerror', e => fehler.push('admin: ' + e.message));
  await admin.setViewportSize({ width: 390, height: 844 });
  await admin.goto(BASE + 'admin.html');
  await admin.$$eval('details', ds => ds.forEach(d => { d.open = true; }));
  admin.on('dialog', d => d.accept());
  await admin.click('#reset'); await admin.click('#resetLb'); await admin.waitForTimeout(300);
  await admin.click('#freigeben'); await admin.waitForTimeout(300);   // Tagebuch freigeben (30.09.)
  // Dennis beantwortet zwei Fragen im Log-Buch
  await dennis.reload(); await dennis.waitForTimeout(800);
  // Die Freigabe kommt als Fenster der Fee (DIE REISE BEGINNT), danach tritt das Tagebuch aus dem Nebel
  while (await dennis.$('#overlay:not([hidden])')) { await dennis.click('#overlay'); await dennis.waitForTimeout(400); }
  await weiterTippen(dennis); await dennis.waitForTimeout(800);
  await dennis.click('[data-logbuch]');
  for (const a of ['Im Café am Gärtnerplatz', 'Meine Socken']) {
    await dennis.fill('#lbInput', a); await dennis.click('#lbSeal'); await dennis.waitForTimeout(400); await dennis.click('#lbNext'); await dennis.waitForTimeout(200);
    for (let i = 0; i < 30 && await dennis.isVisible('#geistRuf'); i++) { await dennis.click('#geistRuf', { timeout: 1500 }).catch(() => {}); await dennis.waitForTimeout(200); }   // der Schattendieb nach Frage 1
  }
  await dennis.click('#lbClose');
  await admin.waitForTimeout(500);
  const lb = await admin.$$eval('#lbList .lb-a', els => els.map(e => e.textContent));
  log(`\n== Admin + Dennis: Log-Buch-Antworten im Admin: ${JSON.stringify(lb.slice(0, 3))}`);
  if (lb[0] !== 'Im Café am Gärtnerplatz' || lb[1] !== 'Meine Socken') { log('  PROBLEM: Antworten kommen nicht an'); alleProbleme++; }
  await admin.screenshot({ path: `${OUT}/admin-1-logbuch.png`, fullPage: true });
  // Log-Buch bestanden, Fluch geschenkt
  await admin.click('#nextWin'); await dennis.waitForTimeout(600);
  const titel1 = await dennis.$eval('#resultHead .big', e => e.textContent).catch(() => '');
  log(`  Dennis sieht nach „Bestanden": ${titel1}`);
  await dennis.click('#overlay'); await dennis.waitForTimeout(800);
  await admin.click('button.btn:has-text("Fluch geschenkt")'); await dennis.waitForTimeout(700);
  await dennis.click('#overlay').catch(() => {}); await dennis.waitForTimeout(300);
  // Wirbel und Die drei Zeichen gewonnen (seit 01.10. in dieser Reihenfolge, dort Flüche), dann einen Fluch bei Speed Flip
  // sprechen (Notlösung im Admin). Die Szene mit Buu Huus Rad lässt sich erst nach der Auflösung überspringen
  for (let i = 0; i < 2; i++) { await admin.click('#nextWin'); await dennis.waitForTimeout(600); await dennis.click('#overlay').catch(() => {}); await dennis.waitForTimeout(300); }
  await admin.screenshot({ path: `${OUT}/admin-2-naechste.png`, fullPage: true });
  await admin.click('#nextUse .use-btn[data-item="spruchrolle"]'); await dennis.waitForTimeout(600);
  for (let i = 0; i < 80 && await dennis.isVisible('#fluchSzene') && !(await dennis.evaluate(() => document.getElementById('fluchSzene').classList.contains('steht'))); i++) await dennis.waitForTimeout(200);
  if (await dennis.isVisible('#fluchSzene')) { await dennis.click('#fluchSzene'); await dennis.waitForTimeout(700); }
  log(`  Einsatz: ${await dennis.$eval('#resultHead .big', e => e.textContent).catch(() => '–')} ${await dennis.$eval('#resultHead .sub', e => e.textContent).catch(() => '')}`);
  await dennis.click('#overlay'); await dennis.waitForTimeout(300);
  const rolle = await admin.$eval('#items li[data-id="spruchrolle"] small', e => e.textContent);
  log(`  Admin zeigt Spruchrolle: ${rolle}`);
  // Showdown: alles bis zum Gipfel, zwei verloren
  // bis einschließlich Rikes Rache (seit 29.09.)
  for (const v of ['bestanden', 'bestanden', 'verloren', 'bestanden', 'bestanden', 'bestanden']) { await admin.click(v === 'bestanden' ? '#nextWin' : '#nextLose'); await admin.waitForTimeout(150); }   // Speed Flip bis Rikes Rache
  await admin.click('#freigeben'); await admin.waitForTimeout(300);   // Prüfung des Bundes freigeben
  await dennis.waitForTimeout(600); await dennis.evaluate(() => document.querySelector('#overlay').click()); await dennis.waitForTimeout(4500);
  const duelle = await admin.$$eval('.duel-list .d-name', els => els.map(e => e.textContent.replace(/\s+/g, ' ').trim()));
  log(`  Showdown-Duelle im Admin: ${duelle.join(' | ')}`);
  await admin.click('.duel-list button[data-nr="1"][data-v="sieg"]'); await admin.waitForTimeout(200);
  await admin.screenshot({ path: `${OUT}/admin-3-showdown.png`, fullPage: true });
  await dennis.waitForTimeout(400);
  await dennis.evaluate(() => document.querySelector('#overlay').click());
  await dennis.waitForTimeout(700);
  // Dennis' Ausrüstung am Gipfel: was leuchtet?
  await dennis.evaluate(() => { document.querySelector('.shoulder-right').click(); });
  await dennis.waitForTimeout(700);
  // Onboarding (erzwungen): Beutel, dann öffnet Dennis ihn und die Spritze kommt heraus
  for (let i = 0; i < 2; i++) { while (await dennis.$('#overlay:not([hidden])')) { await dennis.click('#overlay'); await dennis.waitForTimeout(300); } await dennis.waitForTimeout(1800); }
  while (await dennis.$('#coach:not([hidden])')) { await dennis.click('#coach'); await dennis.waitForTimeout(250); }
  const slots = await dennis.$$eval('.slot', els => els.map(e => `${e.dataset.id}:${e.classList.contains('schatten') ? 'Schatten' : e.classList.contains('usable') ? 'LEUCHTET' : [...e.classList].filter(c => c.startsWith('st-')).join('')}`));
  log(`  Ausrüstung am Gipfel: ${slots.join(', ')}`);
  const hud = await dennis.$eval('#hudNextName', e => e.textContent);
  log(`  HUD nächste Quest: ${hud}`); if (hud === '?') { log('  PROBLEM: HUD bleibt verdeckt'); alleProbleme++; }
  await dennis.screenshot({ path: `${OUT}/dennis-gipfel-ausruestung.png` });
  await ctx.close();
}

await browser.close();
log(`\nKonsolenfehler: ${fehler.length ? fehler.join('\n') : 'keine'}`);
log(`Probleme gesamt: ${alleProbleme}`);
fs.writeFileSync(`${OUT}/bericht.txt`, bericht.join('\n'));
