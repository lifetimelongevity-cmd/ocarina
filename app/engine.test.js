// Test der Logik v1: node app/engine.test.js
const assert = require("assert");
const config = require("./config.js");
const { derive, emptyDoc, normalize, mitEintraegen, showdownDuelle, einsetzbar, abgeloest, jetztEinsetzbar, fluchVorteil, diebWurf } = require("./engine.js");

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
  [q.win, q.lose, q.glanz].filter(Boolean).forEach(e => (e.items || []).forEach(id => assert.ok(itemIds.includes(id), q.id + ": unbekanntes Item " + id)));
});
config.items.forEach(it => assert.ok(it.name && it.kurz && it.symbol && it.text && it.tarn && it.tarn.name, it.id + ": Texte und Tarnung"));
config.items.forEach(it => (it.ersetzt || []).forEach(id => assert.ok(itemIds.includes(id) && id !== it.id, it.id + ": ersetzt unbekanntes Item " + id)));
config.quests.filter(q => q.glanz).forEach(q => assert.ok(q.win && q.glanz.bedingung && q.typ !== "lauf" && !q.showdown, q.id + ": Glanzsieg braucht Sieg und Bedingung"));
assert.deepStrictEqual(config.quests.map(q => q.nr).sort((a, b) => a - b), [1, 2, 3, 4, 5, 7, 9, 12, 14, 15]);
assert.deepStrictEqual(config.items.map(i => i.nr), ["I7", "I8", "I2", "I4", "I5", "I6", "F1", "F3", "F6"]);
assert.strictEqual(reihe.filter(q => q.typ === "kern").length, 6, "sechs Medaillons");
assert.deepStrictEqual(reihe.filter(q => q.win && q.win.ziffer).map(q => q.win.ziffer).sort(), [1, 2, 3, 4], "jede Ziffer genau einmal");
assert.strictEqual(config.logbuch.fragen.length, 7);
// Jedes erspielbare Item wird irgendwo gewonnen und irgendwo eingesetzt
config.items.filter(i => !config.startitems.includes(i.id)).forEach(it => {
  const quelle = config.quests.some(q => [q.win, q.glanz].some(e => e && (e.items || []).includes(it.id)) || (q.zaehler && (q.zaehler.proTreffer.items || []).includes(it.id)));
  assert.ok(quelle, it.id + ": wird nirgends gewonnen");
  assert.ok(it.tor || config.quests.some(q => (q.einsetzbar || []).includes(it.id)), it.id + ": nirgends einsetzbar");
});
// Regel vom 28.09.: Hauptquests geben Packs und Items, Sidequests und laufende Quests nur Fähigkeiten
config.quests.forEach(q => {
  const gibt = (q.win && q.win.items || []).concat(q.zaehler && q.zaehler.proTreffer.items || []).map(id => config.items.find(i => i.id === id).gruppe);
  if (q.typ === "kern") assert.ok(gibt.every(g => g === "item"), q.id + ": Hauptquest gibt nur Items");
  else assert.ok(gibt.every(g => g === "faehigkeit") && !(q.win && q.win.packs), q.id + ": Sidequest gibt nur Fähigkeiten");
});
// Flüche (29.09.): genau zwei Stellen, und überall, wo einer gesprochen werden kann, bringt er einen Vorteil
assert.deepStrictEqual(config.quests.filter(q => (q.win && q.win.items || []).includes("spruchrolle")).map(q => q.id), ["klingen", "kartenwurf"]);
config.quests.filter(q => (q.einsetzbar || []).includes("spruchrolle")).forEach(q => assert.ok(q.fluch || q.showdown, q.id + ": Fluch ohne Vorteil"));
assert.ok(!itemIds.includes("nakama"), "Nakama-Ruf ist gestrichen");
// Alle vier Ziffern liegen vor der Quest mit dem Tor
const torIndex = reihe.findIndex(q => q.tor);
assert.ok(torIndex > 0 && reihe.slice(0, torIndex).filter(q => q.win && q.win.ziffer).length === config.code.length, "alle Ziffern vor dem Tor");

// 1. Leeres Dokument: Startzustand
let s = derive(config, emptyDoc());
assert.strictEqual(s.packs, 0);
assert.deepStrictEqual(s.ziffern, [null, null, null, null]);
assert.strictEqual(s.items.beutel, undefined);          // kein eigenes Feld mehr: Der Beutel entpuppt sich als Spritze
assert.strictEqual(s.items.spritze, "besitz");
assert.deepStrictEqual(config.startitems, ["spritze"]);
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
assert.strictEqual(s.items.pistole_klein, "besitz");   // Podrennen gewonnen
assert.strictEqual(s.items.pistole_gross, "nicht");    // nur mit Glanzsieg im Kartenwurf
assert.strictEqual(s.next, "auge");
assert.deepStrictEqual(s.erhalten, ["spritze", "kreisel", "spruchrolle", "pistole_klein"]);   // Die drei Zeichen bringen einen Fluch
assert.deepStrictEqual(s.zaehler, { bestanden: 3, verloren: 2, erledigt: 5, gesamt: 9 });

// 3. Ziffer kaufen über Buchung, Deckel unten bei 0
s = derive(config, { quests: { logbuch: "verloren" }, buchungen: [{ id: "b1", packs: -1, grund: "Ziffer 1 gekauft", ziffer: 1 }] });
assert.strictEqual(s.packs, 0);
assert.deepStrictEqual(s.ziffern, [7, null, null, null]);
assert.deepStrictEqual(s.gekauft, [true, false, false, false]);

// 4. Es gibt nur 20 Packs (29.09.): alle Siege zusammen genau max, also nie ein Sieg, der verpufft
assert.strictEqual(config.quests.reduce((a, q) => a + ((q.win || {}).packs || 0), 0), config.waehrung.max, "Siege zusammen = max");
// Alles gewonnen: Deckel oben, keine nächste Quest
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

// 8. Laufende Quest verlangt einen eigenen Status, "laeuft" gilt in der Reihe nicht
assert.strictEqual(derive(config, { quests: { klingen: "laeuft" } }).quests.klingen, "offen");

// 9. Einsetzen: Spruchrolle zählt runter, Schild ist danach verbraucht, Kreisel bleibt
s = derive(config, {
  quests: { logbuch: "bestanden", klingen: "bestanden", wirbel: "bestanden", podrennen: "bestanden",
            kartenwurf: "bestanden", auge: "bestanden", deku: "bestanden", feuerprobe: "bestanden" },
  buchungen: [{ id: "g", packs: 0, grund: "x", item: "spruchrolle", menge: 1 }],
  einsaetze: [{ id: "e1", item: "spruchrolle", quest: "klingen" }, { id: "e2", item: "kreisel", quest: "wirbel" },
              { id: "e3", item: "schild", quest: "bund" }]
});
assert.strictEqual(s.anzahl.spruchrolle, 2);                 // einer geschenkt, Die drei Zeichen und Kartenwurf, einer eingesetzt
assert.strictEqual(s.items.spruchrolle, "besitz");
assert.strictEqual(s.items.kreisel, "besitz");
assert.strictEqual(s.items.schild, "verbraucht");
assert.deepStrictEqual(s.eingesetzt, { klingen: ["spruchrolle"], wirbel: ["kreisel"], bund: ["schild"] });
// Letzte Rolle eingesetzt: verbraucht, nicht „nie gehabt"
s = derive(config, { buchungen: [{ id: "g", packs: 0, grund: "x", item: "spruchrolle", menge: 1 }], einsaetze: [{ id: "e1", item: "spruchrolle", quest: "logbuch" }] });
assert.strictEqual(s.anzahl.spruchrolle, 0);
assert.strictEqual(s.items.spruchrolle, "verbraucht");
// Spruchrolle per Buchung geschenkt
assert.strictEqual(derive(config, { buchungen: [{ id: "b", packs: 0, grund: "x", item: "spruchrolle", menge: 1 }] }).anzahl.spruchrolle, 1);

// 10. Was ist wo einsetzbar?
assert.deepStrictEqual(einsetzbar(config, derive(config, {}), "auge"), ["spritze", "pistole_klein", "pistole_gross", "spruchrolle"]);
assert.deepStrictEqual([...jetztEinsetzbar(config, derive(config, { quests: { logbuch: "bestanden", klingen: "bestanden", wirbel: "bestanden", podrennen: "verloren", kartenwurf: "verloren" } }))], ["spritze", "spruchrolle"]);   // der Fluch aus Die drei Zeichen
assert.deepStrictEqual(einsetzbar(config, derive(config, {}), "logbuch"), []);
s = derive(config, { quests: { logbuch: "bestanden", klingen: "bestanden", wirbel: "bestanden", podrennen: "bestanden", kartenwurf: "bestanden" } });
assert.strictEqual(s.next, "auge");
assert.deepStrictEqual([...jetztEinsetzbar(config, s)], ["pistole_klein", "spruchrolle"]);   // Kreisel und Karten helfen hier nicht, die Spritze ist abgelöst
assert.strictEqual(abgeloest(config, s, "spritze"), "pistole_klein");
assert.strictEqual(abgeloest(config, s, "pistole_klein"), null);
s = derive(config, { quests: { amulett: "laeuft", logbuch: "bestanden" }, buchungen: [{ id: "g", packs: 0, grund: "x", item: "spruchrolle", menge: 1 }] });
assert.deepStrictEqual([...jetztEinsetzbar(config, s)], ["spruchrolle"]);       // Amulett läuft, dort hilft die Rolle

// 11. Showdown: erst Revanchen in Spielreihenfolge, dann Wirbel der Götter; Rikes Tagebuch und Hüter der Flamme kommen nicht wieder
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
assert.deepStrictEqual(einsetzbar(config, s, "bund"), ["spritze", "pistole_klein", "pistole_gross", "kreisel", "spruchrolle", "schild"]);

// 12. Amulett: Schritt „gefunden" zählt nur, solange die Quest gestartet ist
s = derive(config, { quests: { amulett: "laeuft" }, schritte: { amulett: { gefunden: true } } });
assert.strictEqual(s.schritte.amulett.gefunden, true);
assert.strictEqual(derive(config, { schritte: { amulett: { gefunden: true } } }).schritte.amulett.gefunden, false);
assert.strictEqual(derive(config, { quests: { amulett: "bestanden" } }).packs, P("amulett", "win"));
assert.strictEqual(derive(config, { quests: { amulett: "bestanden" } }).items.segen, "besitz");

// 13. Keine Schulden: Wer bei 0 verliert, verliert nichts. Der nächste Sieg zählt voll.
s = derive(config, { quests: { logbuch: "verloren", klingen: "verloren", wirbel: "bestanden" } });
assert.strictEqual(s.packs, P("wirbel", "win"));
assert.strictEqual(s.kappung.unten, -P("klingen", "lose"));
assert.strictEqual(s.kappung.oben, 0);

// 14. Deckel: Was über max geht, verfällt (mit den Quests allein nie, nur mit einem Bonus). Eine Strafe danach zählt sofort.
s = derive(config, { quests: alle, zeiten: Object.fromEntries(reihe.map((q, i) => [q.id, i + 1])),
  buchungen: [{ id: "bonus", packs: 3, grund: "Bonus", zeit: 50 }, { id: "b", packs: -1, grund: "Strafe", zeit: 99 }] });
assert.strictEqual(s.packs, config.waehrung.max - 1);
assert.strictEqual(s.kappung.oben, 3);

// 15. Reihenfolge nach Zeit: dieselbe Strafe vor oder nach dem Sieg
const strafe = zeit => derive(config, { quests: { logbuch: "bestanden" }, zeiten: { logbuch: 200 }, buchungen: [{ id: "b", packs: -1, grund: "Strafe", zeit }] }).packs;
assert.strictEqual(strafe(100), P("logbuch", "win"));        // bei 0: verpufft
assert.strictEqual(strafe(300), P("logbuch", "win") - 1);    // danach: zieht ab
// Ohne Zeit (ältere Stände, Demo): erst Quests in Spielreihenfolge, dann Buchungen, danach alles mit Zeit
assert.strictEqual(derive(config, { quests: { logbuch: "bestanden" }, buchungen: [{ id: "b", packs: -1, grund: "x" }] }).packs, P("logbuch", "win") - 1);
assert.strictEqual(derive(config, { quests: { logbuch: "bestanden" }, buchungen: [{ id: "b", packs: -1, grund: "x", zeit: 5 }] }).packs, P("logbuch", "win") - 1);
assert.deepStrictEqual(normalize({}).zeiten, {});

// 16. Weg (weg.js): echte Stationen liegen am Weg, in der Reihenfolge der Karte, der Gipfel ist das Ziel
const W = require("./weg.js").aufbauen(config.karte);
const amWeg = config.karte.stationen.filter(st => st.gps);
amWeg.forEach(st => assert.ok(W.projizieren(st.gps[0], st.gps[1]).abstand < 30, st.id + ": gps liegt nicht am Weg"));
amWeg.slice(1).forEach((st, i) => assert.ok(W.station[st.id].s > W.station[amWeg[i].id].s, st.id + ": Reihenfolge am Weg"));
assert.strictEqual(W.ziel.id, "gipfel");
assert.ok(W.laenge > 3000 && W.laenge < 4500, "Weg etwa 3,5 km");
assert.ok(W.hoeheBei(0) < 800 && W.ziel.hoehe > 1200, "Höhen vom See zum Gipfel");
assert.ok(W.projizieren(48.1402, 11.5586).abstand > 40000, "München ist weit weg vom Weg");

// 17. Dennis trägt selbst ein (Kanal „dennis"): Ergebnis, Einsatz, Duell, Amulett, Ziffer. Was der Admin entschieden hat, gilt vor.
const mit = (doc, ein) => derive(config, mitEintraegen(config, doc, ein));
s = mit({}, { q_logbuch: { status: "bestanden", zeit: 10 }, q_klingen: { status: "verloren", zeit: 20 } });
assert.strictEqual(s.quests.logbuch, "bestanden");
assert.strictEqual(s.quests.klingen, "verloren");
assert.strictEqual(s.next, "wirbel");
assert.strictEqual(s.packs, stufen([P("logbuch", "win"), P("klingen", "lose")]));
// Der Admin hat schon anders entschieden: seine Buchung zählt
assert.strictEqual(mit({ quests: { logbuch: "verloren" } }, { q_logbuch: { status: "bestanden", zeit: 10 } }).quests.logbuch, "verloren");
// Unsinn wird ignoriert
s = mit({}, { q_gibtsnicht: { status: "bestanden" }, q_logbuch: { status: "vielleicht" }, e_1: { item: "zauberstab", quest: "auge" }, d_1: { ergebnis: "remis" }, z_9: { zeit: 1 }, x_1: {} });
assert.strictEqual(s.quests.logbuch, "offen");
assert.deepStrictEqual(s.duelle, {});
assert.deepStrictEqual(s.ziffern, [null, null, null, null]);
// Einsatz: geschenkte Spruchrolle wird verbraucht, der Einsatz steht bei der Quest
s = mit({ buchungen: [{ id: "g", packs: 0, grund: "x", item: "spruchrolle", menge: 1 }] }, { e_a: { item: "spruchrolle", quest: "logbuch", zeit: 5 } });
assert.strictEqual(s.anzahl.spruchrolle, 0);
assert.deepStrictEqual(s.eingesetzt.logbuch, ["spruchrolle"]);
// Laufende Quest: Amulett gefunden und zusammengesetzt, obwohl der Admin nur „läuft" gesetzt hat
s = mit({ quests: { amulett: "laeuft" } }, { s_amulett_gefunden: { zeit: 5 }, q_amulett: { status: "bestanden", zeit: 9 } });
assert.strictEqual(s.schritte.amulett.gefunden, true);
assert.strictEqual(s.quests.amulett, "bestanden");
assert.strictEqual(s.packs, P("amulett", "win"));
// Duelle: Dennis füllt Lücken, der Admin hat Vorrang
s = mit({ duelle: { "1": "niederlage" } }, { d_1: { ergebnis: "sieg", zeit: 1 }, d_2: { ergebnis: "sieg", zeit: 2 } });
assert.deepStrictEqual(s.duelle, { "1": "niederlage", "2": "sieg" });
// Ziffer am Kästchen gekauft: kostet Packs in zeitlicher Reihenfolge, zweimal dieselbe Ziffer zählt einmal
s = mit({ quests: { logbuch: "bestanden", klingen: "bestanden" }, zeiten: { logbuch: 1, klingen: 2 }, buchungen: [{ id: "b", packs: 0, grund: "x", ziffer: 1 }] }, { z_3: { zeit: 5 }, z_1: { zeit: 6 } });
assert.deepStrictEqual(s.ziffern, [7, null, 2, null]);   // Die drei Zeichen geben seit 28.09. keine Ziffer
assert.deepStrictEqual(s.gekauft, [true, false, true, false]);
assert.strictEqual(s.packs, P("logbuch", "win") + P("klingen", "win") - config.ziffer_preis);
// Das Dokument des Admins bleibt unverändert
const adminDoc = { quests: { logbuch: "bestanden" } };
mitEintraegen(config, adminDoc, { q_klingen: { status: "bestanden", zeit: 1 } });
assert.deepStrictEqual(adminDoc, { quests: { logbuch: "bestanden" } });

// 18. Das Tor zum Gipfel: ohne alle vier Ziffern kein Finale. Fehlende holt Dennis für Packs, per Buße oder mit Rikes Segen.
const bisGipfel = { logbuch: "bestanden", klingen: "bestanden", wirbel: "bestanden", podrennen: "verloren", kartenwurf: "bestanden",
                    auge: "bestanden", deku: "verloren", feuerprobe: "bestanden" };
s = derive(config, { quests: bisGipfel });
assert.strictEqual(s.next, "bund");
assert.deepStrictEqual(s.tor, { quest: "bund", fehlend: [2, 4] });
assert.deepStrictEqual([...jetztEinsetzbar(config, s)], []);                   // am Tor hilft nur Rikes Segen
assert.strictEqual(derive(config, { quests: { ...bisGipfel, podrennen: "bestanden", deku: "bestanden" } }).tor, null);
assert.strictEqual(derive(config, { quests: { logbuch: "verloren" } }).tor, null);   // das Tor gibt es nur am Gipfel
const vorher = s.packs;
s = mit({ quests: { ...bisGipfel, amulett: "bestanden" } }, { z_2: { weg: "busse", zeit: 1 }, z_4: { weg: "segen", zeit: 2 } });
assert.strictEqual(s.tor, null);
assert.deepStrictEqual(s.ziffern, config.code);
assert.deepStrictEqual(s.zifferWeg, [null, "busse", null, "segen"]);
assert.strictEqual(s.packs, vorher);                                          // Buße und Segen kosten keine Packs
assert.strictEqual(s.items.segen, "verbraucht");
s = mit({ quests: bisGipfel }, { z_2: { zeit: 1 } });
assert.strictEqual(s.packs, vorher - config.ziffer_preis);
assert.deepStrictEqual(s.tor, { quest: "bund", fehlend: [4] });
assert.strictEqual(s.zifferWeg[1], "packs");

// 19. Glanzsieg (Kartenwurf): bringt zusätzlich die Große Wasserpistole, die löst Spritze und kleine Pistole ab
const bisKarten = { logbuch: "bestanden", klingen: "bestanden", wirbel: "bestanden", podrennen: "bestanden", kartenwurf: "bestanden" };
s = derive(config, { quests: bisKarten, glanz: { kartenwurf: true } });
assert.strictEqual(s.glanz.kartenwurf, true);
assert.strictEqual(s.items.pistole_gross, "besitz");
assert.strictEqual(s.packs, derive(config, { quests: bisKarten }).packs);   // gleiche Packs wie ein normaler Sieg
assert.deepStrictEqual([...jetztEinsetzbar(config, s)], ["pistole_gross", "spruchrolle"]);   // der Sieg im Kartenwurf bringt auch einen Fluch
assert.strictEqual(abgeloest(config, s, "spritze"), "pistole_gross");
assert.strictEqual(abgeloest(config, s, "pistole_klein"), "pistole_gross");
// Auch ohne kleine Pistole (Podrennen verloren) bringt der Glanzsieg die große
s = derive(config, { quests: { ...bisKarten, podrennen: "verloren" }, glanz: { kartenwurf: true } });
assert.strictEqual(s.items.pistole_gross, "besitz");
assert.strictEqual(s.items.pistole_klein, "nicht");
// Glanz zählt nur bei bestanden und nur bei Quests mit glanz
assert.strictEqual(derive(config, { quests: { ...bisKarten, kartenwurf: "verloren" }, glanz: { kartenwurf: true } }).items.pistole_gross, "nicht");
assert.deepStrictEqual(derive(config, { quests: bisKarten, glanz: { klingen: true } }).glanz, {});
assert.deepStrictEqual(normalize({}).glanz, {});
// Dennis trägt den Glanzsieg selbst ein. Der Admin hat Vorrang: sein „bestanden" ohne Glanz gilt.
s = mit({ quests: { logbuch: "bestanden", klingen: "bestanden", wirbel: "bestanden", podrennen: "bestanden" } }, { q_kartenwurf: { status: "bestanden", glanz: true, zeit: 5 } });
assert.strictEqual(s.quests.kartenwurf, "bestanden");
assert.strictEqual(s.items.pistole_gross, "besitz");
assert.strictEqual(mit({ quests: bisKarten }, { q_kartenwurf: { status: "bestanden", glanz: true, zeit: 5 } }).items.pistole_gross, "nicht");
assert.strictEqual(mit({}, { q_logbuch: { status: "bestanden", glanz: true, zeit: 5 } }).glanz.logbuch, undefined);   // Log-Buch kennt keinen Glanz
assert.strictEqual(mit({}, { q_kartenwurf: { status: "verloren", glanz: true, zeit: 5 } }).glanz.kartenwurf, undefined);

// 20. Fluch mit Kehrseite (29.09.): Vorteil je Spiel, danach stiehlt der Schattendieb 0 bis 3 Packs
const fluch = config.items.find(i => i.id === "spruchrolle");
assert.deepStrictEqual(fluch.dieb.gewichte, [30, 35, 25, 10]);
// Würfel: gewichtet, die Ränder stimmen
assert.strictEqual(diebWurf(config, () => 0), 0);
assert.strictEqual(diebWurf(config, () => 0.2999), 0);
assert.strictEqual(diebWurf(config, () => 0.30), 1);
assert.strictEqual(diebWurf(config, () => 0.6499), 1);
assert.strictEqual(diebWurf(config, () => 0.65), 2);
assert.strictEqual(diebWurf(config, () => 0.90), 3);
assert.strictEqual(diebWurf(config, () => 0.99999), 3);
const zaehl = [0, 0, 0, 0];
for (let i = 0; i < 20000; i++) zaehl[diebWurf(config)]++;
[30, 35, 25, 10].forEach((g, n) => assert.ok(Math.abs(zaehl[n] / 200 - g) < 2, `Würfel ${n}: ${zaehl[n] / 200} % statt ${g} %`));
// Vorteil je Spiel
s = derive(config, {});
assert.strictEqual(fluchVorteil(config, s, "podrennen").text, "3 Sekunden mehr auf der Uhr.");
assert.strictEqual(fluchVorteil(config, s, "logbuch"), null);
assert.strictEqual(fluchVorteil(config, s, "klingen"), null);
// Auge des Jägers: die stärkste Waffe wird eine Stufe stärker, mit der großen darf er näher ran
assert.ok(fluchVorteil(config, s, "auge").text.includes("Kleine Wasserpistole"));
assert.ok(fluchVorteil(config, derive(config, { quests: { ...bisKarten } }), "auge").text.includes("Große Wasserpistole"));
assert.strictEqual(fluchVorteil(config, derive(config, { quests: bisKarten, glanz: { kartenwurf: true } }), "auge").text, "Du darfst 1 m näher ran.");
// Showdown: es gilt der Vorteil des Spiels im ersten offenen Duell
s = derive(config, { quests: { podrennen: "verloren" }, duelle: {} });
assert.deepStrictEqual(fluchVorteil(config, s, "bund"), { quest: "podrennen", text: "3 Sekunden mehr auf der Uhr.", duell: 1 });
s = derive(config, { quests: { podrennen: "verloren" }, duelle: { "1": "sieg" } });
assert.deepStrictEqual(fluchVorteil(config, s, "bund"), { quest: "wirbel", text: "Dein Gegner muss den Kreisel mit der schwachen Hand starten.", duell: 2 });
// Raub: kostet Packs zum Zeitpunkt des Einsatzes, der Fluch ist danach verbraucht
const dreiZ = { logbuch: "bestanden", klingen: "bestanden", wirbel: "bestanden", podrennen: "bestanden" };
const vorRaub = derive(config, { quests: dreiZ, zeiten: { logbuch: 1, klingen: 2, wirbel: 3, podrennen: 4 } });
assert.strictEqual(vorRaub.anzahl.spruchrolle, 1);
s = derive(config, { quests: dreiZ, zeiten: { logbuch: 1, klingen: 2, wirbel: 3, podrennen: 4 },
                     einsaetze: [{ id: "f1", item: "spruchrolle", quest: "podrennen", zeit: 5, raub: 2, fuer: "podrennen" }] });
assert.strictEqual(s.packs, vorRaub.packs - 2);
assert.strictEqual(s.items.spruchrolle, "verbraucht");
assert.deepStrictEqual(s.raube, [{ id: "f1", quest: "podrennen", raub: 2 }]);
// Mehr als er hat, kann der Dieb nicht stehlen (Packs bleiben bei 0), Unsinn wird auf 0 bis 3 begrenzt
s = derive(config, { quests: { logbuch: "verloren", klingen: "bestanden" }, einsaetze: [{ id: "f", item: "spruchrolle", quest: "wirbel", zeit: 9, raub: 3 }] });
assert.strictEqual(s.packs, 0);
assert.strictEqual(s.kappung.unten, 3);
assert.strictEqual(derive(config, { quests: dreiZ, einsaetze: [{ id: "f", item: "spruchrolle", quest: "podrennen", raub: 99 }] }).raube[0].raub, 3);
assert.strictEqual(derive(config, { quests: dreiZ, einsaetze: [{ id: "f", item: "spruchrolle", quest: "podrennen", raub: -4 }] }).raube[0].raub, 0);
// Ohne Fluch im Besitz stiehlt der Dieb nichts
assert.strictEqual(derive(config, { quests: { logbuch: "bestanden" }, einsaetze: [{ id: "f", item: "spruchrolle", quest: "wirbel", raub: 2 }] }).packs, P("logbuch", "win"));
// Andere Items haben keinen Dieb
assert.deepStrictEqual(derive(config, { quests: dreiZ, einsaetze: [{ id: "k", item: "kreisel", quest: "wirbel", raub: 2 }] }).raube, []);
// Dennis spricht den Fluch selbst: raub und fuer kommen mit, zurückgenommen ist auch der Raub weg
s = mit({ quests: dreiZ, zeiten: { logbuch: 1, klingen: 2, wirbel: 3, podrennen: 4 } }, { e_x: { item: "spruchrolle", quest: "podrennen", raub: 1, fuer: "podrennen", zeit: 5 } });
assert.strictEqual(s.packs, vorRaub.packs - 1);
assert.deepStrictEqual(s.raube, [{ id: "e_x", quest: "podrennen", raub: 1 }]);
const mitDoc = mitEintraegen(config, { quests: dreiZ }, { e_x: { item: "spruchrolle", quest: "bund", raub: 2, fuer: "gibtsnicht", zeit: 5 } });
assert.strictEqual(mitDoc.einsaetze[0].raub, 2);
assert.strictEqual(mitDoc.einsaetze[0].fuer, undefined);
assert.strictEqual(mitEintraegen(config, {}, { e_k: { item: "kreisel", quest: "wirbel", raub: 2, zeit: 5 } }).einsaetze[0].raub, undefined);
assert.strictEqual(mit({ quests: dreiZ }, {}).packs, derive(config, { quests: dreiZ }).packs);

console.log("Alle Tests bestanden.");
