// Balance-Rechner: node tests/balance.js
// Spielt 50 000 Tage mit der echten Logik (app/engine.js) und den Werten aus app/config.js durch.
// Jede Quest wird mit Chance p gewonnen, in Spielreihenfolge, das Amulett vor dem Bund. Am Ende kauft Dennis
// fehlende Ziffern für ziffer_preis, solange die Packs reichen.
const C = require("../app/config.js");
const E = require("../app/engine.js");

const reihe = C.quests.filter(q => q.typ !== "lauf").map(q => q.id);
const amulett = C.quests.filter(q => q.typ === "lauf" && q.win && q.win.packs).map(q => q.id);
const ORDER = [...reihe.slice(0, -1), ...amulett, reihe[reihe.length - 1]];
const N = 50000;

function tag(p) {
  const d = E.emptyDoc();
  ORDER.forEach((id, i) => { d.quests[id] = Math.random() < p ? "bestanden" : "verloren"; d.zeiten[id] = i + 1; });
  const s = E.derive(C, d);
  const fehlend = s.ziffern.filter(z => z == null).length;
  const kauf = Math.min(fehlend, Math.floor(s.packs / C.ziffer_preis));
  return { rest: s.packs - kauf * C.ziffer_preis, zu: kauf < fehlend };
}

const summe = k => ORDER.reduce((a, id) => a + ((C.quests.find(q => q.id === id)[k] || {}).packs || 0), 0);
console.log(`Kästchen ${C.waehrung.max} Packs, Ziffer ${C.ziffer_preis} Pack(s). Alle Siege zusammen ${summe("win")}, alle Niederlagen ${summe("lose")}.`);
console.log("Chance je Quest | Packs am Ende: Ø   schlechtestes Zehntel  Mitte  bestes Zehntel | Kästchen bleibt zu");
[0.3, 0.4, 0.5, 0.6, 0.7, 0.8].forEach(p => {
  const r = Array.from({ length: N }, () => tag(p));
  const rest = r.map(x => x.rest).sort((a, b) => a - b), at = k => rest[Math.floor(k * (N - 1))];
  const avg = rest.reduce((a, b) => a + b, 0) / N, zu = r.filter(x => x.zu).length / N;
  console.log(`${String(Math.round(p * 100)).padStart(13)} % | ${avg.toFixed(1).padStart(18)} ${String(at(.1)).padStart(22)} ${String(at(.5)).padStart(6)} ${String(at(.9)).padStart(15)} | ${(zu * 100).toFixed(0).padStart(4)} %`);
});
