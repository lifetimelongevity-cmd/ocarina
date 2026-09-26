// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/geraete.mjs /tmp/shots
// Braucht Playwright mit Chromium (global oder in einem node_modules neben dieser Datei).
// Playwright-Prüfung für die echten Geräte: iPhone 13, iPhone 15 (Safari und Home-Bildschirm), älteres Samsung (Chrome)
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
];

const UA_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const UA_SAMSUNG = 'Mozilla/5.0 (Linux; Android 13; SM-A525F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36';

const fehler = [];
const bericht = [];
const log = (...a) => { const s = a.join(' '); bericht.push(s); console.log(s); };

async function neueSeite(browser, g, url, { lokal = false, schwach = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: g.w, height: g.h }, deviceScaleFactor: g.dpr, isMobile: true, hasTouch: true,
    userAgent: g.ios ? UA_IOS : UA_SAMSUNG });
  if (lokal) await ctx.route('**/config.js', async r => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace('typ: "firebase"', 'typ: "lokal"') }); });
  await ctx.route('**firebasedatabase.app**', r => r.abort());
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
    for (const el of document.querySelectorAll('.hud button, .shoulder, .foot .sync, .face.active button, .face.active p, .result, .lb-panel, .qc-action')) {
      if (!bereich(el) || !sichtbar(el)) continue;
      const b = el.getBoundingClientRect();
      if (b.left < sa.l - 1 || b.right > W - sa.r + 1 || (b.bottom > H - sa.b + 1 && !el.classList.contains('sync'))) out.inset.push(`${el.className || el.tagName} [${Math.round(b.left)},${Math.round(b.right)},${Math.round(b.bottom)}]`);
      if (b.right > W + 1 || b.bottom > H + 1) out.ausserhalb.push(el.className);
    }
    for (const el of document.querySelectorAll('.face.active *, .hud *, .result *, .lb-panel *')) {
      if (!bereich(el) || !sichtbar(el)) continue;
      const s = getComputedStyle(el);
      const hatText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (hatText && parseFloat(s.fontSize) < 10) out.klein.push(`${el.className || el.tagName} ${s.fontSize} "${el.textContent.trim().slice(0, 20)}"`);
      if (hatText && s.overflow !== 'visible' && s.textOverflow !== 'ellipsis' && el.scrollWidth > el.clientWidth + 2 && !['TEXTAREA'].includes(el.tagName)) out.ueberlauf.push(`${el.className || el.tagName} "${el.textContent.trim().slice(0, 24)}"`);
    }
    for (const el of document.querySelectorAll('.face.active button:not([disabled]), .hud button, .shoulder, .lb-panel button:not([disabled])')) {
      if (!bereich(el) || !sichtbar(el) || el.closest('.slot.empty')) continue;
      const b = el.getBoundingClientRect();
      if (Math.min(b.width, b.height) < 28) out.tipp.push(`${el.className} ${Math.round(b.width)}x${Math.round(b.height)}`);
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
  if (r.quer) probleme.push('Seite scrollt quer');
  log(`  ${name}: ${probleme.length ? 'PROBLEME\n    ' + probleme.join('\n    ') : 'ok'}`);
  return probleme;
}

const shot = (page, g, name) => page.screenshot({ path: `${OUT}/${g.id}-${name}.png` });
const seite = async (page, n) => { for (let i = 0; i < 3; i++) { const p = await page.evaluate(() => +document.querySelector('.face.active').dataset.page); if (p === n) break; await page.click((n - p + 3) % 3 === 1 ? '.shoulder-right' : '.shoulder-left'); await page.waitForTimeout(650); } };

const browser = await chromium.launch();
let alleProbleme = 0;
for (const g of GERAETE) {
  log(`\n== ${g.id} (${g.w}×${g.h}, Insets l${g.sa.l} r${g.sa.r} b${g.sa.b}${g.cpu ? ', CPU ÷' + g.cpu : ''})`);
  // Startbildschirm
  let { ctx, page } = await neueSeite(browser, g, '?demo');
  await page.waitForTimeout(900);
  await shot(page, g, '0-intro');
  // Bildrate auf dem Startbildschirm messen
  const fps = await page.evaluate(() => new Promise(res => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else res(n / 3); }; requestAnimationFrame(f); }));
  log(`  Intro: ${fps.toFixed(0)} Bilder/s${g.cpu ? ' (CPU gedrosselt)' : ''}`);
  const pressStart = await page.$eval('#startQuest', el => { const b = el.getBoundingClientRect(); return { l: b.left, r: b.right, b: b.bottom, fs: getComputedStyle(el).fontSize }; });
  if (pressStart.r > g.w - g.sa.r || pressStart.b > g.h - g.sa.b) { log('  PROBLEM: PRESS START in Safe Area', JSON.stringify(pressStart)); alleProbleme++; }
  await page.click('#introScreen');
  await page.waitForTimeout(700);
  await shot(page, g, '1-quests');
  alleProbleme += (await pruefen(page, g, 'QUESTS')).length;
  await seite(page, 0); await shot(page, g, '2-karte');
  alleProbleme += (await pruefen(page, g, 'KARTE')).length;
  await seite(page, 2); await page.waitForTimeout(300);
  // Onboarding durchklicken
  if (!(await page.$('#overlay[hidden]'))) { await shot(page, g, '3a-onboarding'); await page.click('#overlay'); await page.waitForTimeout(400); }
  for (let i = 0; i < 4; i++) { if (await page.$('#coach:not([hidden])')) { if (i === 2) await shot(page, g, '3b-coach'); await page.click('#coach'); await page.waitForTimeout(300); } }
  await shot(page, g, '3-ausruestung');
  alleProbleme += (await pruefen(page, g, 'AUSRÜSTUNG')).length;
  // Buchung: nächste Quest bestanden → Ergebnis-Fenster
  await page.click('[data-demo="bestanden"]');
  await page.waitForTimeout(1600);
  await shot(page, g, '4-ergebnis');
  alleProbleme += (await pruefen(page, g, 'ERGEBNIS')).length;
  await page.click('#overlay'); await page.waitForTimeout(1500);
  await shot(page, g, '5-nebel');
  // Prophezeiung +1 → Spruchrolle mit Enthüllung
  await page.click('[data-demo="treffer"]'); await page.waitForTimeout(1500);
  await shot(page, g, '6-prophezeiung');
  await page.click('#overlay'); await page.waitForTimeout(300);
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
  admin.on('dialog', d => d.accept());
  await admin.click('#reset'); await admin.click('#resetLb'); await admin.waitForTimeout(300);
  // Dennis beantwortet zwei Fragen im Log-Buch
  await dennis.reload(); await dennis.waitForTimeout(300);
  await dennis.click('[data-logbuch]');
  for (const a of ['Im Café am Gärtnerplatz', 'Meine Socken']) { await dennis.fill('#lbInput', a); await dennis.click('#lbSeal'); await dennis.waitForTimeout(400); await dennis.click('#lbNext'); await dennis.waitForTimeout(200); }
  await dennis.click('#lbClose');
  await admin.waitForTimeout(500);
  const lb = await admin.$$eval('#lbList .lb-a', els => els.map(e => e.textContent));
  log(`\n== Admin + Dennis: Log-Buch-Antworten im Admin: ${JSON.stringify(lb.slice(0, 3))}`);
  if (lb[0] !== 'Im Café am Gärtnerplatz' || lb[1] !== 'Meine Socken') { log('  PROBLEM: Antworten kommen nicht an'); alleProbleme++; }
  await admin.screenshot({ path: `${OUT}/admin-1-logbuch.png`, fullPage: true });
  // Log-Buch bestanden, Prophezeiung starten, zwei Treffer
  await admin.click('#nextWin'); await dennis.waitForTimeout(600);
  const titel1 = await dennis.$eval('#resultHead .big', e => e.textContent).catch(() => '');
  log(`  Dennis sieht nach „Bestanden": ${titel1}`);
  await dennis.click('#overlay'); await dennis.waitForTimeout(800);
  await admin.click('.lauf-q[data-id="prophezeiung"] [data-a="start"]'); await dennis.waitForTimeout(600);
  log(`  Dennis sieht nach Start: ${await dennis.$eval('#resultHead .big', e => e.textContent).catch(() => '')}`);
  await dennis.click('#overlay'); await dennis.waitForTimeout(300);
  await admin.click('.lauf-q[data-id="prophezeiung"] [data-a="plus"]'); await dennis.waitForTimeout(700);
  const zeilen = await dennis.$$eval('#resultLines li', els => els.map(e => e.textContent.replace(/\s+/g, ' ').trim()));
  log(`  Treffer: ${await dennis.$eval('#resultHead .big', e => e.textContent)} · ${zeilen.join(' | ')}`);
  await dennis.screenshot({ path: `${OUT}/dennis-treffer.png` });
  await dennis.click('#overlay'); await dennis.waitForTimeout(300);
  // Einsetzen: Spruchrolle bei Kreuzung der Klingen
  await admin.screenshot({ path: `${OUT}/admin-2-naechste.png`, fullPage: true });
  await admin.click('#nextUse .use-btn[data-item="spruchrolle"]'); await dennis.waitForTimeout(700);
  log(`  Einsatz: ${await dennis.$eval('#resultHead .big', e => e.textContent).catch(() => '–')} ${await dennis.$eval('#resultHead .sub', e => e.textContent).catch(() => '')}`);
  await dennis.click('#overlay'); await dennis.waitForTimeout(300);
  const rolle = await admin.$eval('#items li[data-id="spruchrolle"] small', e => e.textContent);
  log(`  Admin zeigt Spruchrolle: ${rolle}`);
  // Showdown: alles bis zum Gipfel, zwei verloren
  for (const v of ['bestanden', 'verloren', 'bestanden', 'bestanden', 'verloren', 'bestanden', 'bestanden']) { await admin.click(v === 'bestanden' ? '#nextWin' : '#nextLose'); await admin.waitForTimeout(150); }
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
  while (await dennis.$('#overlay:not([hidden])')) { await dennis.click('#overlay'); await dennis.waitForTimeout(300); }
  while (await dennis.$('#coach:not([hidden])')) { await dennis.click('#coach'); await dennis.waitForTimeout(250); }
  const slots = await dennis.$$eval('.slot', els => els.map(e => `${e.dataset.id}:${e.classList.contains('empty') ? 'leer' : e.classList.contains('usable') ? 'LEUCHTET' : e.classList.contains('idle') ? 'grau' : [...e.classList].filter(c => c.startsWith('st-')).join('')}`));
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
