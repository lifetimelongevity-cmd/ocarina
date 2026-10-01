// Ruckeln (01.10.): Leerlauf ohne Arbeit für den Hauptprozessor, keine Dauer-Animation, die neu malen muss,
// verdeckte Seiten ruhen, das Ergebnis-Fenster ohne langen Block, Quest-Karte rollt weiter zum letzten Knopf,
// Ruckel-Messer mit ?messen.
// Aufruf: cd app && python3 -m http.server 8765 &   dann   node tests/leerlauf.mjs
// Wie auf Dennis' Galaxy S24: 780 × 360, dreifache Pixeldichte, alle Effekte an (kein html.schwach).
import { chromium } from 'playwright';
import fs from 'fs';
import { fileURLToPath } from 'url';

const BASE = 'http://localhost:8765/';
const ok = [], fehler = [];
const pruefe = (bed, text) => (bed ? ok : fehler).push(text);

// 1. Ohne Browser: Jede endlose Animation ändert nur transform und opacity (das rechnet der Grafikchip allein)
{
  const css = fs.readFileSync(fileURLToPath(new URL('../app/styles.css', import.meta.url)), 'utf8');
  const kf = {};
  const re = /@keyframes\s+([\w-]+)\s*\{/g; let m;
  while ((m = re.exec(css))) {
    let d = 1, j = m.index + m[0].length;
    while (d) { if (css[j] === '{') d++; else if (css[j] === '}') d--; j++; }
    kf[m[1]] = new Set([...css.slice(m.index + m[0].length, j - 1).replace(/\([^)]*\)/g, '').matchAll(/([a-z-]+)\s*:/g)].map(x => x[1]));
  }
  const schlecht = new Set();
  for (const a of css.matchAll(/animation(?:-name)?\s*:\s*([^;}]*)/g))
    for (const teil of a[1].split(',')) if (teil.includes('infinite'))
      for (const w of teil.match(/[\w-]+/g) || []) if (kf[w] && [...kf[w]].some(p => !['transform', 'opacity'].includes(p))) schlecht.add(`${w} (${[...kf[w]].join(', ')})`);
  pruefe(!schlecht.size, `Endlose Animationen nur mit transform und opacity${schlecht.size ? ': ' + [...schlecht].join('; ') : ''}`);
}

const b = await chromium.launch();
async function neu(url, { w = 780, h = 360 } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 }); Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 }); });
  await ctx.route('**firebasedatabase.app**', r => r.abort());
  const p = await ctx.newPage();
  p.on('pageerror', e => fehler.push('Seitenfehler: ' + e.message));
  await p.goto(BASE + url); await p.waitForTimeout(1000);
  await p.click('#introScreen'); await p.waitForTimeout(1500);
  while (await p.$('#coach:not([hidden])')) { await p.click('#coach'); await p.waitForTimeout(200); }
  return { ctx, p, cdp: await ctx.newCDPSession(p) };
}
// Hauptprozessor in einer Spur: Summe der Aufgaben und die längste
async function spur(cdp, fn) {
  const ev = []; const h = e => ev.push(...e.value); cdp.on('Tracing.dataCollected', h);
  await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline', transferMode: 'ReportEvents' });
  const t0 = Date.now(); await fn(); const s = (Date.now() - t0) / 1000;
  await new Promise(r => { cdp.once('Tracing.tracingComplete', r); cdp.send('Tracing.end'); }); cdp.off('Tracing.dataCollected', h);
  const main = ev.find(e => e.name === 'thread_name' && e.args.name === 'CrRendererMain');
  const tasks = ev.filter(e => e.ph === 'X' && e.name === 'RunTask' && e.pid === main.pid && e.tid === main.tid);
  return { proSek: tasks.reduce((a, e) => a + e.dur, 0) / 1000 / s, laengste: Math.max(0, ...tasks.map(e => e.dur / 1000)) };
}

// 2. Leerlauf je Seite und ruhende verdeckte Seiten
{
  const { ctx, p, cdp } = await neu('?demo');
  for (const [name, taste] of [['QUESTS', null], ['KARTE', '.shoulder-left'], ['AUSRÜSTUNG', '.shoulder-left']]) {
    if (taste) { await p.click(taste); await p.waitForTimeout(900); }
    const r = await spur(cdp, () => p.waitForTimeout(3000));
    pruefe(r.proSek < 30, `${name}: Leerlauf ${r.proSek.toFixed(0)} ms Arbeit pro Sekunde (unter 30, vorher 100 bis 135)`);
    // Verdeckte Seiten: nicht durchgerechnet (content-visibility) und ihre Animationen pausiert
    const r2 = await p.evaluate(() => {
      const verdeckt = [...document.querySelectorAll('.face:not(.active)')];
      const laufen = document.getAnimations().filter(a => a.effect.target.closest('.face') && !a.effect.target.closest('.face.active')
        && getComputedStyle(a.effect.target, a.effect.pseudoElement).animationPlayState !== 'paused').length;
      return { cv: verdeckt.every(f => getComputedStyle(f).contentVisibility === 'hidden'), laufen };
    });
    pruefe(r2.cv && r2.laufen === 0, `${name}: Verdeckte Seiten ruhen (nicht durchgerechnet ${r2.cv}, laufende Animationen ${r2.laufen})`);
  }
  // 3. Ergebnis-Fenster: kein langer Block mehr (vorher gut 200 ms bei vierfach gedrosseltem Prozessor)
  await p.click('.shoulder-left'); await p.waitForTimeout(900);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const r = await spur(cdp, async () => { await p.click('text=Nächste bestanden'); await p.waitForTimeout(2500); });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  pruefe(r.laengste < 160, `Ergebnis-Moment: längster Block ${r.laengste.toFixed(0)} ms (unter 160, vorher gut 200)`);
  pruefe(await p.isVisible('#overlay'), 'Ergebnis-Fenster ist offen');
  await ctx.close();
}

// 4. Quest-Karte rollt weiter zum letzten Knopf, auch wenn sie neu gezeichnet wurde, während sie verdeckt war
{
  const { ctx, p } = await neu('?demo', { w: 780, h: 280 });
  const sichtbar = () => p.evaluate(() => {
    const c = document.querySelector('#questCard'), k = [...c.querySelectorAll('.qc-eintrag')].pop();
    if (!k) return null;
    return k.getBoundingClientRect().bottom <= c.getBoundingClientRect().bottom + 1;
  });
  await p.waitForTimeout(300);
  const v1 = await sichtbar();
  pruefe(v1 !== false, `Kleines S24 (780 × 280): letzter Knopf der Quest-Karte im Blick (${v1})`);
  await p.click('.shoulder-right'); await p.waitForTimeout(700);
  await p.click('text=Nächste bestanden'); await p.waitForTimeout(1500);
  while (await p.isVisible('#overlay')) { await p.click('#overlay'); await p.waitForTimeout(600); }
  if (await p.evaluate(() => document.querySelector('.face.active').dataset.page) !== '1') { await p.click('.shoulder-left'); await p.waitForTimeout(900); }
  await p.waitForTimeout(400);
  const v2 = await sichtbar();
  pruefe(v2 !== false, `Nach Neuzeichnen im Verdeckten: letzter Knopf im Blick (${v2})`);
  await ctx.close();
}

// 5. Ruckel-Messer: ?messen schaltet ein (auch nach dem Neuladen ohne Zusatz), zählt einen Ruckler, ?messen=aus schaltet aus
{
  const { ctx, p } = await neu('?demo&messen');
  pruefe(await p.isVisible('#messer'), 'Ruckel-Messer erscheint mit ?messen');
  await p.evaluate(() => { const t = performance.now(); while (performance.now() - t < 160) {} });
  await p.waitForTimeout(800);
  const n = await p.evaluate(() => JSON.parse(localStorage.getItem('dq-messen-log') || '[]').length);
  pruefe(n >= 1, `Ruckel-Messer zählt einen künstlichen Ruckler (${n})`);
  await p.click('#messer'); await p.waitForTimeout(200);
  pruefe((await p.textContent('#messerListe')).includes('ms'), 'Antippen zeigt die Liste mit Dauer');
  await p.goto(BASE + '?demo'); await p.waitForTimeout(800);
  pruefe(await p.isVisible('#messer'), 'Messer bleibt nach dem Neuladen ohne ?messen (Home-Bildschirm)');
  await p.goto(BASE + '?demo&messen=aus'); await p.waitForTimeout(800);
  pruefe(!(await p.$('#messer')), '?messen=aus schaltet ihn aus');
  await ctx.close();
}
{
  const { ctx, p } = await neu('?demo');
  pruefe(!(await p.$('#messer')) && !(await p.evaluate(() => [...document.scripts].some(s => s.src.includes('messen.js')))), 'Ohne ?messen: kein Messer, messen.js wird nicht geladen');
  await ctx.close();
}

await b.close();
ok.forEach(t => console.log('ok   ', t));
fehler.forEach(t => console.log('FEHLER', t));
console.log(fehler.length ? `${fehler.length} Fehler` : 'Alles in Ordnung.');
process.exit(fehler.length ? 1 : 0);
