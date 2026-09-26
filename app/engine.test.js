// Test der Logik v1: node app/engine.test.js
const assert = require("assert");
const config = require("./config.js");
const { derive, emptyDoc, normalize, showdownDuelle, einsetzbar, jetztEinsetzbar } = require("./engine.js");

const reihe = config.quests.filter(q => q.typ !== "lauf");
const itemIds = config.items.map(i => i.id);
const stationen = config.karte.stationen.map(s => s.id);

// 0. Konfiguration ist in sich stimmig
config.quests.forEach(q => {
  assert.ok(["kern", "side", "lauf"].includes(q.typ), q.id + ": typ");
  assert.ok(q.text && q.name && q.nr, q.id + ": Name, Nummer und Text");
  if (q.typ !== "lauf") assert.ok(stationen.includes(q.station), q.id + ": Station fehlt");
  if (q.typ !== "side") assert.ok(q.farbe && q.emblem, q.id + ": Medaillon braucht Farbe und Emblem");
  (q.einsetzbar || []).forEach(id => assert.ok(itemIds.includes(id), q.id + ": unbekanntes Item " + id));
  [q.win, q.lose].filter(Boolean).forEach(e => (e.items || []).forEach(id => assert.ok(itemIds.includes(id), q.id + ": unbekanntes Item " + id)));
});
config.items.forEach(it => assert.ok(it.name && it.kurz && it.symbol && it.text && it.tarn && it.tarn.name, it.id + ": Texte und Tarnung"));
assert.deepStrictEqual(config.quests.map(q => q.nr).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 9, 12, 14, 15]);
assert.deepStrictEqual(config.items.map(i => i.nr), ["I1", "I2", "I4", "I5", "I6", "F1", "F3"]);
assert.strictEqual(reihe.filter(q => q.typ === "kern").length, 6, "sechs Medaillons");
assert.deepStrictEqual(reihe.filter(q => q.win && q.win.ziffer).map(q => q.win.ziffer).sort(), [1, 2, 3, 4], "jede Ziffer genau einmal");
assert.strictEqual(config.logbuch.fragen.length, 7);
// Jedes erspielbare Item wird irgendwo gewonnen und irgendwo eingesetzt
config.items.filter(i => !config.startitems.includes(i.id)).forEach(it => {
  const quelle = config.quests.some(q => (q.win && (q.win.items || []).includes(it.id)) || (q.zaehler && (q.zaehler.proTreffer.items || []).includes(it.id)));
  assert.ok(quelle, it.id + ": wird nirgends gewonnen");
  assert.ok(config.quests.some(q => (q.einsetzbar || []).includes(it.id)), it.id + ": nirgends einsetzbar");
});

// 1. Leeres Dokument: Startzustand
let s = derive(config, emptyDoc());
assert.strictEqual(s.packs, 0);
assert.deepStrictEqual(s.ziffern, [null, null, null, null]);
assert.strictEqual(s.items.beutel, "besitz");
assert.strictEqual(s.items.stich, "nicht");
assert.strictEqual(s.items.spruchrolle, "nicht");
assert.strictEqual(s.anzahl.spruchrolle, 0);
assert.strictEqual(s.next, "logbuch");
assert.deepStrictEqual(s.laufend, []);
assert.strictEqual(s.zaehler.gesamt, 9);

// Packs einer Quest laut Konfiguration, und Packs Schritt für Schritt zwischen 0 und max
const P = (id, k) => (config.quests.find(q => q.id === id)[k] || {}).packs || 0;
const stufen = xs => xs.reduce((n, x) => Math.max(0, Math.min(config.waehrung.max, n + x)), 0);

// 2. Belohnungskette und feste Reihenfolge
s = derive(config, {
  quests: { logbuch: "bestanden", klingen: "bestanden", wirbel: "verloren", podrennen: "bestanden", kartenwurf: "verloren" },
  buchungen: [{ id: "b1", packs: -1, grund: "Strafe" }]
});
assert.strictEqual(s.packs, stufen([P("logbuch", "win"), P("klingen", "win"), P("wirbel", "lose"), P("podrennen", "win"), P("kartenwurf", "lose"), -1]));
assert.deepStrictEqual(s.ziffern, [7, 4, null, null]);
assert.strictEqual(s.items.kreisel, "besitz");
assert.strictEqual(s.items.karten_gepanzert, "nicht");   // Wirbel verloren
assert.strictEqual(s.items.pistole_gross, "besitz");
assert.strictEqual(s.next, "auge");
assert.deepStrictEqual(s.erhalten, ["beutel", "kreisel", "pistole_gross"]);
assert.deepStrictEqual(s.zaehler, { bestanden: 3, verloren: 2, erledigt: 5, gesamt: 9 });

// 3. Ziffer kaufen über Buchung, Deckel unten bei 0
s = derive(config, { quests: { logbuch: "verloren" }, buchungen: [{ id: "b1", packs: -1, grund: "Ziffer 1 gekauft", ziffer: 1 }] });
assert.strictEqual(s.packs, 0);
assert.deepStrictEqual(s.ziffern, [7, null, null, null]);
assert.deepStrictEqual(s.gekauft, [true, false, false, false]);

// 4. Alles gewonnen: Deckel oben, keine nächste Quest
const alle = {}; reihe.forEach(q => { alle[q.id] = "bestanden"; });
s = derive(config, { quests: alle });
assert.strictEqual(s.packs, config.waehrung.max);
assert.deepStrictEqual(s.ziffern, config.code);
assert.strictEqual(s.next, null);

// 5. Manuelle Korrektur schlägt die Regel
s = derive(config, { quests: { klingen: "bestanden" }, items: { kreisel: "verloren", stich: "besitz" } });
assert.strictEqual(s.items.kreisel, "verloren");
assert.strictEqual(s.items.stich, "besitz");

// 6. Zurückschalten ist sauber: Quest wieder offen = Effekte weg
s = derive(config, { quests: { klingen: "offen" } });
assert.strictEqual(s.items.kreisel, "nicht");
assert.strictEqual(s.packs, 0);

// 7. Firebase-Formen: Listen als Objekt, Duelle als Liste mit Lücke
s = derive(config, { buchungen: { a: { packs: 2, grund: "x" } }, einsaetze: { a: { id: "a", item: "schild", quest: "bund" } }, duelle: [null, "sieg"] });
assert.strictEqual(s.packs, 2);
assert.deepStrictEqual(s.duelle, { "1": "sieg" });
assert.deepStrictEqual(normalize({ duelle: [null, "sieg", "niederlage"] }).duelle, { "1": "sieg", "2": "niederlage" });

// 8. Prophezeiung: läuft neben der Reihe, jeder Treffer ist eine Spruchrolle
s = derive(config, { quests: { prophezeiung: "laeuft" }, zaehler: { prophezeiung: 2 } });
assert.deepStrictEqual(s.laufend, ["prophezeiung"]);
assert.strictEqual(s.next, "logbuch");                   // die Reihe bleibt unberührt
assert.strictEqual(s.anzahl.spruchrolle, 2);
assert.strictEqual(s.items.spruchrolle, "besitz");
assert.strictEqual(s.treffer.prophezeiung, 2);
// Zähler zählt nur, solange die Quest gestartet ist, und nie über max
assert.strictEqual(derive(config, { zaehler: { prophezeiung: 2 } }).anzahl.spruchrolle, 0);
assert.strictEqual(derive(config, { quests: { prophezeiung: "laeuft" }, zaehler: { prophezeiung: 9 } }).anzahl.spruchrolle, 3);
// Beendet: Rollen bleiben
assert.strictEqual(derive(config, { quests: { prophezeiung: "beendet" }, zaehler: { prophezeiung: 1 } }).anzahl.spruchrolle, 1);
// Laufende Quest verlangt einen eigenen Status, "laeuft" gilt in der Reihe nicht
assert.strictEqual(derive(config, { quests: { klingen: "laeuft" } }).quests.klingen, "offen");

// 9. Einsetzen: Spruchrolle zählt runter, Schild ist danach verbraucht, Kreisel bleibt
s = derive(config, {
  quests: { prophezeiung: "laeuft", logbuch: "bestanden", klingen: "bestanden", wirbel: "bestanden", podrennen: "bestanden",
            kartenwurf: "bestanden", auge: "bestanden", deku: "bestanden", feuerprobe: "bestanden" },
  zaehler: { prophezeiung: 2 },
  einsaetze: [{ id: "e1", item: "spruchrolle", quest: "klingen" }, { id: "e2", item: "kreisel", quest: "wirbel" },
              { id: "e3", item: "schild", quest: "bund" }]
});
assert.strictEqual(s.anzahl.spruchrolle, 1);
assert.strictEqual(s.items.spruchrolle, "besitz");
assert.strictEqual(s.items.kreisel, "besitz");
assert.strictEqual(s.items.schild, "verbraucht");
assert.deepStrictEqual(s.eingesetzt, { klingen: ["spruchrolle"], wirbel: ["kreisel"], bund: ["schild"] });
// Letzte Rolle eingesetzt: verbraucht, nicht „nie gehabt"
s = derive(config, { quests: { prophezeiung: "laeuft" }, zaehler: { prophezeiung: 1 }, einsaetze: [{ id: "e1", item: "spruchrolle", quest: "logbuch" }] });
assert.strictEqual(s.anzahl.spruchrolle, 0);
assert.strictEqual(s.items.spruchrolle, "verbraucht");
// Spruchrolle per Buchung geschenkt
assert.strictEqual(derive(config, { buchungen: [{ id: "b", packs: 0, grund: "x", item: "spruchrolle", menge: 1 }] }).anzahl.spruchrolle, 1);

// 10. Was ist wo einsetzbar?
assert.deepStrictEqual(einsetzbar(config, derive(config, {}), "auge"), ["pistole_gross", "spruchrolle"]);
assert.deepStrictEqual(einsetzbar(config, derive(config, {}), "logbuch"), []);
s = derive(config, { quests: { logbuch: "bestanden", klingen: "bestanden", wirbel: "bestanden", podrennen: "bestanden", kartenwurf: "bestanden" } });
assert.strictEqual(s.next, "auge");
assert.deepStrictEqual([...jetztEinsetzbar(config, s)], ["pistole_gross"]);   // Kreisel und Karten helfen hier nicht
s = derive(config, { quests: { amulett: "laeuft", prophezeiung: "laeuft", logbuch: "bestanden" }, zaehler: { prophezeiung: 1 } });
assert.deepStrictEqual([...jetztEinsetzbar(config, s)], ["spruchrolle"]);       // Amulett läuft, dort hilft die Rolle

// 11. Showdown: erst Revanchen in Spielreihenfolge, dann Wirbel der Götter; Log-Buch und Feuerprobe kommen nicht wieder
s = derive(config, { quests: { logbuch: "verloren", klingen: "bestanden", wirbel: "bestanden", podrennen: "verloren",
                              kartenwurf: "bestanden", auge: "verloren", feuerprobe: "verloren" }, duelle: { "1": "sieg" } });
assert.deepStrictEqual(showdownDuelle(config, s).map(d => [d.quest, d.art, d.ergebnis]),
  [["podrennen", "revanche", "sieg"], ["auge", "revanche", null], ["wirbel", "auffuellen", null]]);
s = derive(config, {});
assert.deepStrictEqual(showdownDuelle(config, s).map(d => d.quest), ["wirbel", "wirbel", "wirbel"]);
s = derive(config, { quests: { klingen: "verloren", wirbel: "verloren", podrennen: "verloren", kartenwurf: "verloren" } });
assert.deepStrictEqual(showdownDuelle(config, s).map(d => d.quest), ["klingen", "wirbel", "podrennen"]);
// Im Showdown hilft auch, was bei den Spielen der Duelle hilft
s = derive(config, { quests: { auge: "verloren" } });
assert.deepStrictEqual(einsetzbar(config, s, "bund"), ["pistole_gross", "kreisel", "spruchrolle", "schild"]);

// 12. Amulett: Schritt „gefunden" zählt nur, solange die Quest gestartet ist
s = derive(config, { quests: { amulett: "laeuft" }, schritte: { amulett: { gefunden: true } } });
assert.strictEqual(s.schritte.amulett.gefunden, true);
assert.strictEqual(derive(config, { schritte: { amulett: { gefunden: true } } }).schritte.amulett.gefunden, false);
assert.strictEqual(derive(config, { quests: { amulett: "bestanden" } }).packs, P("amulett", "win"));

// 13. Keine Schulden: Wer bei 0 verliert, verliert nichts. Der nächste Sieg zählt voll.
s = derive(config, { quests: { logbuch: "verloren", klingen: "verloren", wirbel: "bestanden" } });
assert.strictEqual(s.packs, P("wirbel", "win"));
assert.strictEqual(s.kappung.unten, -P("klingen", "lose"));
assert.strictEqual(s.kappung.oben, 0);

// 14. Deckel: Was über max geht, verfällt. Eine Strafe danach zählt sofort.
s = derive(config, { quests: alle, zeiten: Object.fromEntries(reihe.map((q, i) => [q.id, i + 1])), buchungen: [{ id: "b", packs: -1, grund: "Strafe", zeit: 99 }] });
const siege = reihe.reduce((n, q) => n + P(q.id, "win"), 0);
assert.ok(siege > config.waehrung.max, "Test braucht mehr Siege als Platz im Kästchen");
assert.strictEqual(s.packs, config.waehrung.max - 1);
assert.strictEqual(s.kappung.oben, siege - config.waehrung.max);

// 15. Reihenfolge nach Zeit: dieselbe Strafe vor oder nach dem Sieg
const strafe = zeit => derive(config, { quests: { klingen: "bestanden" }, zeiten: { klingen: 200 }, buchungen: [{ id: "b", packs: -1, grund: "Strafe", zeit }] }).packs;
assert.strictEqual(strafe(100), P("klingen", "win"));        // bei 0: verpufft
assert.strictEqual(strafe(300), P("klingen", "win") - 1);    // danach: zieht ab
// Ohne Zeit (ältere Stände, Demo): erst Quests in Spielreihenfolge, dann Buchungen, danach alles mit Zeit
assert.strictEqual(derive(config, { quests: { klingen: "bestanden" }, buchungen: [{ id: "b", packs: -1, grund: "x" }] }).packs, P("klingen", "win") - 1);
assert.strictEqual(derive(config, { quests: { klingen: "bestanden" }, buchungen: [{ id: "b", packs: -1, grund: "x", zeit: 5 }] }).packs, P("klingen", "win") - 1);
assert.deepStrictEqual(normalize({}).zeiten, {});

console.log("Alle Tests bestanden.");
