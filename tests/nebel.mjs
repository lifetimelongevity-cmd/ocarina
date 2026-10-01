// Nebel-Test: Taucht im Menü irgendwo der Name einer verdeckten Quest auf?
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/nebel.mjs
import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 852, height: 393 } });
await ctx.addInitScript(() => { try { localStorage.setItem('dq-brief-v1', '1'); localStorage.setItem('dq-brief-v1-probe', '1'); } catch (e) {} });   // ohne den Brief vor dem Titelbild (eigener Test: brief.mjs)
await ctx.route('**firebasedatabase.app**', r => r.abort());
const p = await ctx.newPage();
const err = []; p.on('pageerror', e => err.push(e.message));
await p.goto('http://localhost:8765/?demo=start&direkt&schwach');
await p.waitForTimeout(500);
const C = await p.evaluate(() => window.GAME_CONFIG.quests.filter(q => q.typ !== 'lauf').map(q => q.name));
let fund = [], tafeln = 0, felder = 0;
for (let schritt = 0; schritt < C.length; schritt++) {
  for (let seite = 0; seite < 3; seite++) {
    const text = await p.evaluate(() => [...document.querySelectorAll('.face.active, .hud, #overlay:not([hidden])')].map(e => e.innerText).join(' '));
    C.slice(schritt + 1).forEach(n => { if (text.includes(n)) fund.push(`Schritt ${schritt}, Seite ${seite}: ${n}`); });
    await p.evaluate(() => document.querySelector('.shoulder-right').click()); await p.waitForTimeout(550);
    while (await p.$('#overlay:not([hidden])')) { await p.click('#overlay'); await p.waitForTimeout(250); }
    while (await p.$('#coach:not([hidden])')) { await p.click('#coach'); await p.waitForTimeout(150); }
  }
  // Stationstafeln auf der Karte: jede Station antippen, der Text darf nichts aus dem Nebel nennen
  while (await p.evaluate(() => document.querySelector('.face.active').dataset.page !== '0')) { await p.evaluate(() => document.querySelector('.shoulder-right').click()); await p.waitForTimeout(550); }
  while (await p.$('#coach:not([hidden])')) { await p.click('#coach'); await p.waitForTimeout(150); }
  for (const st of await p.$$eval('.mark', els => els.map(e => e.dataset.station))) {
    await p.evaluate(id => document.querySelector(`.mark[data-station="${id}"]`).click(), st); await p.waitForTimeout(120);
    const t = await p.evaluate(() => document.querySelector('#stationCard').innerText);
    if (t.trim()) tafeln++;
    C.slice(schritt + 1).forEach(n => { if (t.includes(n)) fund.push(`Schritt ${schritt}, Tafel ${st}: ${n}`); });
    await p.evaluate(() => document.querySelector('#mapSheet').click());
  }
  // Ausrüstung: jedes Feld antippen, auch die Schatten. Die Textbox darf nur Quests nennen, die schon aus dem Nebel sind.
  while (await p.evaluate(() => document.querySelector('.face.active').dataset.page !== '2')) { await p.evaluate(() => document.querySelector('.shoulder-right').click()); await p.waitForTimeout(550); }
  while (await p.$('#overlay:not([hidden])')) { await p.click('#overlay'); await p.waitForTimeout(250); }
  while (await p.$('#coach:not([hidden])')) { await p.click('#coach'); await p.waitForTimeout(150); }
  for (const id of await p.$$eval('.slot', els => els.map(e => e.dataset.id))) {
    await p.evaluate(i => document.querySelector(`.slot[data-id="${i}"]`).click(), id); await p.waitForTimeout(60);
    const t = await p.evaluate(() => document.querySelector('#itemBox').innerText);
    C.slice(schritt + 1).forEach(n => { if (t.includes(n)) fund.push(`Schritt ${schritt}, Feld ${id}: ${n}`); });
    felder++;
  }
  await p.click('[data-demo="bestanden"]'); await p.waitForTimeout(300);
  const t = await p.evaluate(() => document.querySelector('#overlay').innerText);
  C.slice(schritt + 2).forEach(n => { if (t.includes(n)) fund.push(`Ergebnis ${schritt}: ${n}`); });
  await p.click('#overlay'); await p.waitForTimeout(900);
}
console.log('Nebel verraten:', fund.length ? fund : 'nichts', '| Stationstafeln geprüft:', tafeln, '| Felder der Ausrüstung:', felder, '| schwach-Klasse:', await p.evaluate(() => document.documentElement.className), '| Fehler:', err.length ? err : 'keine');
await b.close();
