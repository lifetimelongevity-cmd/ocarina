// Nebel-Test: Taucht im Menü irgendwo der Name einer verdeckten Quest auf?
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/nebel.mjs
import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 852, height: 393 } });
await ctx.route('**firebasedatabase.app**', r => r.abort());
const p = await ctx.newPage();
const err = []; p.on('pageerror', e => err.push(e.message));
await p.goto('http://localhost:8765/?demo=start&direkt&schwach');
await p.waitForTimeout(500);
const C = await p.evaluate(() => window.GAME_CONFIG.quests.filter(q => q.typ !== 'lauf').map(q => q.name));
let fund = [];
for (let schritt = 0; schritt < C.length; schritt++) {
  for (let seite = 0; seite < 3; seite++) {
    const text = await p.evaluate(() => [...document.querySelectorAll('.face.active, .hud, #overlay:not([hidden])')].map(e => e.innerText).join(' '));
    C.slice(schritt + 1).forEach(n => { if (text.includes(n)) fund.push(`Schritt ${schritt}, Seite ${seite}: ${n}`); });
    await p.evaluate(() => document.querySelector('.shoulder-right').click()); await p.waitForTimeout(550);
    while (await p.$('#overlay:not([hidden])')) { await p.click('#overlay'); await p.waitForTimeout(250); }
    while (await p.$('#coach:not([hidden])')) { await p.click('#coach'); await p.waitForTimeout(150); }
  }
  await p.click('[data-demo="bestanden"]'); await p.waitForTimeout(300);
  const t = await p.evaluate(() => document.querySelector('#overlay').innerText);
  C.slice(schritt + 2).forEach(n => { if (t.includes(n)) fund.push(`Ergebnis ${schritt}: ${n}`); });
  await p.click('#overlay'); await p.waitForTimeout(900);
}
console.log('Nebel verraten:', fund.length ? fund : 'nichts', '| schwach-Klasse:', await p.evaluate(() => document.documentElement.className), '| Fehler:', err.length ? err : 'keine');
await b.close();
