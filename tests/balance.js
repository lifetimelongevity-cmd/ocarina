// Balance-Rechner: node tests/balance.js
// Spielt 50 000 Tage mit der echten Logik (app/engine.js) und den Werten aus app/config.js durch.
// Jede Quest wird mit Chance p gewonnen, in Spielreihenfolge, die laufenden Quests vor dem Gipfel.
// Am Tor zum Gipfel (seit 28.09.) holt Dennis fehlende Ziffern: erst mit Rikes Segen, dann für ziffer_preis Packs,
// solange sie reichen, den Rest per Bußprüfung. Danach das Finale.
// Flüche (29.09.): Dennis spricht jeden gleich bei der nächsten Quest, der Schattendieb stiehlt gewürfelt 0 bis 3 Packs.
// Dass der Vorteil die Siegchance hebt, rechnet der Rechner nicht mit. Zum Vergleich steht der Schnitt ohne Flüche daneben.
const C = require("../app/config.js");
const E = require("../app/engine.js");

const reihe = C.quests.filter(q => q.typ !== "lauf").map(q => q.id);
const lauf = C.quests.filter(q => q.typ === "lauf" && q.win && (q.win.packs || (q.win.items || []).length)).map(q => q.id);
const vorGipfel = [...reihe.slice(0, -1), ...lauf], gipfel = reihe[reihe.length - 1];
const segen = (C.items.find(it => it.tor) || {}).id;
const N = 50000;

const fluch = (C.items.find(it => it.dieb) || {}).id;
function tag(p, mitFluch = true) {
  const d = E.emptyDoc();
  let t = 1, offen = 0;
  vorGipfel.forEach(id => {
    if (mitFluch && offen) { d.einsaetze.push({ id: "f" + t, item: fluch, quest: id, zeit: t++, raub: E.diebWurf(C) }); offen--; }
    d.quests[id] = Math.random() < p ? "bestanden" : "verloren"; d.zeiten[id] = t++;
    const q = C.quests.find(x => x.id === id);
    if (d.quests[id] === "bestanden" && (q.win.items || []).includes(fluch)) offen++;
  });
  if (mitFluch && offen) { d.einsaetze.push({ id: "fg", item: fluch, quest: gipfel, zeit: t++, raub: E.diebWurf(C) }); offen--; }
  let s = E.derive(C, d), busse = 0;
  const fehlend = s.ziffern.map((z, i) => (z == null ? i + 1 : 0)).filter(Boolean);
  let packs = s.packs, hatSegen = segen && s.items[segen] === "besitz";
  fehlend.forEach(nr => {
    const weg = hatSegen ? "segen" : packs >= C.ziffer_preis ? "packs" : "busse";
    if (weg === "segen") { hatSegen = false; d.einsaetze.push({ id: "s", item: segen, quest: gipfel }); }
    if (weg === "packs") packs -= C.ziffer_preis;
    if (weg === "busse") busse++;
    d.buchungen.push({ id: "z" + nr, packs: weg === "packs" ? -C.ziffer_preis : 0, grund: "Tor", ziffer: nr, weg, zeit: t++ });
  });
  d.quests[gipfel] = Math.random() < p ? "bestanden" : "verloren"; d.zeiten[gipfel] = t++;
  s = E.derive(C, d);
  const geraubt = s.raube.reduce((a, x) => a + x.raub, 0);
  return { rest: s.packs, busse, fehlten: fehlend.length, geraubt };
}

const summe = k => [...vorGipfel, gipfel].reduce((a, id) => a + ((C.quests.find(q => q.id === id)[k] || {}).packs || 0), 0);
console.log(`${C.waehrung.max} Packs über den Tag, fehlende Ziffer am Tor ${C.ziffer_preis} Packs. Alle Siege zusammen ${summe("win")}, alle Niederlagen ${summe("lose")}.`);
console.log("Chance je Quest | Packs am Ende: Ø   schlechtestes Zehntel  Mitte  bestes Zehntel | am Tor fehlt Ø  Bußprüfung nötig  ohne Packs | Dieb würfelt Ø  Ø ohne Flüche");
[0.3, 0.4, 0.5, 0.6, 0.7, 0.8].forEach(p => {
  const r = Array.from({ length: N }, () => tag(p));
  const rest = r.map(x => x.rest).sort((a, b) => a - b), at = k => rest[Math.floor(k * (N - 1))];
  const avg = rest.reduce((a, b) => a + b, 0) / N, anteil = f => (r.filter(f).length / N * 100).toFixed(0).padStart(3) + " %";
  const fehlten = (r.reduce((a, x) => a + x.fehlten, 0) / N).toFixed(1);
  const geraubt = (r.reduce((a, x) => a + x.geraubt, 0) / N).toFixed(1);
  const ohne = (Array.from({ length: N }, () => tag(p, false).rest).reduce((a, b) => a + b, 0) / N).toFixed(1);
  console.log(`${String(Math.round(p * 100)).padStart(13)} % | ${avg.toFixed(1).padStart(18)} ${String(at(.1)).padStart(22)} ${String(at(.5)).padStart(6)} ${String(at(.9)).padStart(15)} | ${fehlten.padStart(14)} ${anteil(x => x.busse > 0).padStart(17)} ${anteil(x => x.rest === 0).padStart(11)} | ${geraubt.padStart(14)} ${ohne.padStart(14)}`);
});
