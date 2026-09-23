// Test der Logik v0: node engine.test.js
const assert = require("assert");
const config = require("./config.js");
const { derive, emptyDoc } = require("./engine.js");

// 1. Leeres Dokument: Startzustand
let s = derive(config, emptyDoc());
assert.strictEqual(s.packs, 0);
assert.deepStrictEqual(s.ziffern, [null, null, null, null]);
assert.strictEqual(s.items.beutel, "besitz");
assert.strictEqual(s.items.schwert, "nicht");
assert.strictEqual(s.next, "logbuch");

// 2. Beispielstand aus 05-system-plan.md A9
s = derive(config, {
  quests: { logbuch: "bestanden", waffenschmied: "bestanden", klingen: "bestanden",
            auge: "verloren", ringschmied: "bestanden", kartenwurf: "verloren",
            nakama: "bestanden", feuerprobe: "bestanden" },
  buchungen: [{ id: "b1", packs: -1, grund: "Steckbrief Benne" }],
  items: {}
});
assert.strictEqual(s.packs, 3);
assert.deepStrictEqual(s.ziffern, [7, 4, 2, null]);
assert.strictEqual(s.items.pistole_gross, "verloren");   // Waffenschmied gibt sie, Auge des Jägers nimmt sie
assert.strictEqual(s.items.token, "besitz");
assert.strictEqual(s.items.ring_gross, "besitz");
assert.strictEqual(s.items.schild, "besitz");
assert.strictEqual(s.items.schwert, "nicht");
assert.strictEqual(s.items.karten_gepanzert, "nicht");
assert.strictEqual(s.next, "sss");
assert.deepStrictEqual(s.zaehler, { bestanden: 6, verloren: 2, erledigt: 8, gesamt: 13 });
assert.deepStrictEqual(s.erhalten, ["beutel", "pistole_gross", "token", "ring_gross", "schild"]);

// 3. Ziffer kaufen über Buchung, Deckel unten bei 0
s = derive(config, { quests: { logbuch: "verloren" }, buchungen: [{ id: "b1", packs: -1, grund: "Ziffer 1 gekauft", ziffer: 1 }] });
assert.strictEqual(s.packs, 0);
assert.deepStrictEqual(s.ziffern, [7, null, null, null]);
assert.deepStrictEqual(s.gekauft, [true, false, false, false]);

// 4. Alles gewonnen: Deckel oben, keine nächste Quest
const alle = {}; config.quests.forEach(q => { alle[q.id] = "bestanden"; });
s = derive(config, { quests: alle });
assert.strictEqual(s.packs, config.waehrung.max);
assert.deepStrictEqual(s.ziffern, config.code);
assert.strictEqual(s.next, null);

// 5. Manuelle Korrektur schlägt die Regel
s = derive(config, { quests: { klingen: "bestanden" }, items: { token: "verloren", schwert: "besitz" } });
assert.strictEqual(s.items.token, "verloren");
assert.strictEqual(s.items.schwert, "besitz");

// 6. Zurückschalten ist sauber: Quest wieder offen = Effekte weg
s = derive(config, { quests: { klingen: "offen" } });
assert.strictEqual(s.items.token, "nicht");
assert.strictEqual(s.packs, 0);

// 7. Buchungen als Objekt (so liefert Firebase Listen manchmal zurück)
s = derive(config, { buchungen: { a: { packs: 2, grund: "x" } } });
assert.strictEqual(s.packs, 2);

console.log("Alle Tests bestanden.");
