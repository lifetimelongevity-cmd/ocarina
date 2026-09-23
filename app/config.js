/* Dennis Quest · Konfiguration v0
   Alles, was das Spiel kennt. Ändert sich am Spieltag nicht.
   Reihenfolge der Quests = Reihenfolge, in der sie dran sind. Die nächste Quest ist immer die erste offene. */
(function (root) {
  const GAME_CONFIG = {
    version: "v0",

    waehrung: { name: "Packs", max: 10, start: 0 },   // max ist noch offen, kann größer werden

    code: [7, 4, 2, 9],                                // geheim, nur der Quest Master sieht alle vier

    speicher: {
      typ: "firebase",                                 // "lokal" (ein Gerät, zum Testen) oder "firebase"
      spielId: "dennis-jga-2026",
      databaseURL: "https://dennis-quest-default-rtdb.europe-west1.firebasedatabase.app"
    },

    startitems: ["beutel"],

    // icon: Name eines Sprites aus index.html (sword, backpack, ring, medal, envelope, scroll, water, cards)
    // glyph: alternativ ein Zeichen
    items: [
      { id: "beutel",           name: "Beutel",                 icon: "backpack", wirkung: "Hält alles, was du erspielst." },
      { id: "pistole_gross",    name: "Große Wasserpistole",    icon: "water",    wirkung: "Mehr Tank beim Auge des Jägers und im Wasserduell." },
      { id: "ring_gross",       name: "Großer Ring",            icon: "ring",     wirkung: "Leichteres Ziel beim Ringwurf." },
      { id: "karten_gepanzert", name: "Gepanzerte Karten",      icon: "cards",    wirkung: "Stabilere Karten beim Kartenwurf." },
      { id: "token",            name: "Herausforderungs-Token", glyph: "★",       wirkung: "Im Showdown ein Duell an einen anderen abgeben." },
      { id: "schwert",          name: "Schwert der Verdammnis", icon: "sword",    wirkung: "Im Showdown einen Gegner streichen." },
      { id: "schild",           name: "Schild des Bundes",      glyph: "⬟",       wirkung: "Im Showdown ein verlorenes Duell wiederholen." }
    ],

    // station: Punkt auf der Karte (start, klingen, auge, feuerprobe, bund, gipfel)
    // win / lose: packs (Zahl), items (Liste), ziffer (1 bis 4, nur bei win)
    quests: [
      { id: "logbuch",       typ: "kern", name: "Log-Buch",                ort: "Zug nach München",           station: "start",      icon: "medal",
        beschreibung: "Zehn Fragen über Rieke. Ihre Stimme ist der Beweis.",
        win:  { packs: 1, items: [], ziffer: 1 },
        lose: { packs: 0, items: [] } },

      { id: "waffenschmied", typ: "side", name: "Waffenschmied",           ort: "Wiese vor dem Anstieg",      station: "klingen",    glyph: "◒",
        beschreibung: "[PLATZHALTER] Ein Handel um die große Wasserpistole.",
        win:  { packs: 1, items: ["pistole_gross"] },
        lose: { packs: 0, items: [] } },

      { id: "klingen",       typ: "kern", name: "Kreuzung der Klingen",    ort: "Wiese vor dem Anstieg",      station: "klingen",    glyph: "⚔",
        beschreibung: "Wähle deinen Gegner, bevor du die Disziplin kennst.",
        win:  { packs: 1, items: ["token"], ziffer: 2 },
        lose: { packs: -1, items: ["token"] } },

      { id: "auge",          typ: "kern", name: "Auge des Jägers",         ort: "Erstes Waldstück",           station: "auge",       glyph: "◉",
        beschreibung: "Fünf Teelichter, eine Wasserpistole, ein Tank.",
        win:  { packs: 1, items: ["schwert"] },
        lose: { packs: -1, items: ["pistole_gross"] } },

      { id: "ringschmied",   typ: "side", name: "Ringschmied",             ort: "Am Weg",                     station: "auge",       glyph: "♦",
        beschreibung: "[PLATZHALTER] Drei Steine, ein Seilring.",
        win:  { packs: 1, items: ["ring_gross"] },
        lose: { packs: -1, items: [] } },

      { id: "kartenwurf",    typ: "side", name: "Kartenwurf",              ort: "Am Weg",                     station: "auge",       glyph: "▲",
        beschreibung: "[PLATZHALTER] Zehn Karten, ein Hut, drei Meter.",
        win:  { packs: 1, items: ["karten_gepanzert"] },
        lose: { packs: -1, items: [] } },

      { id: "nakama",        typ: "side", name: "Nakama-Quiz",             ort: "Am Weg",                     station: "feuerprobe", glyph: "●",
        beschreibung: "[PLATZHALTER] Drei Fragen über die Trauzeugen.",
        win:  { packs: 1, items: [] },
        lose: { packs: -1, items: [] } },

      { id: "feuerprobe",    typ: "kern", name: "Feuerprobe",              ort: "Aussichtspunkt, halbe Höhe", station: "feuerprobe", glyph: "♨",
        beschreibung: "Drei versiegelte Umschläge. Sag vorher, wie viele du nimmst.",
        win:  { packs: 1, items: ["schild"], ziffer: 3 },
        lose: { packs: -1, items: ["schild"] } },

      { id: "sss",           typ: "side", name: "Schnick Schnack Schnuck", ort: "Am Weg",                     station: "bund",       glyph: "■",
        beschreibung: "[PLATZHALTER] Best of 3 gegen einen vom Bund bestimmten Gegner.",
        win:  { packs: 1, items: [] },
        lose: { packs: -1, items: [] } },

      { id: "steinwurf",     typ: "side", name: "Steinwurf",               ort: "Am Weg",                     station: "bund",       glyph: "✚",
        beschreibung: "[PLATZHALTER] Ein Stein, ein Baum, so nah wie möglich.",
        win:  { packs: 1, items: [] },
        lose: { packs: 0, items: [] } },

      { id: "bund",          typ: "kern", name: "Prüfung des Bundes",      ort: "Gipfel Neureuth",            station: "bund",       glyph: "◇",
        beschreibung: "Drei Duelle gegen den Bund. Hier zählt, was du gesammelt hast.",
        win:  { packs: 2, items: [], ziffer: 4 },
        lose: { packs: -2, items: ["schwert"] } },

      { id: "rast",          typ: "side", name: "Rast der Ahnen",          ort: "Berggasthaus Neureuth",      station: "gipfel",     glyph: "◉",
        beschreibung: "[PLATZHALTER] Bestellung, Trank, Toast.",
        win:  { packs: 1, items: [] },
        lose: { packs: -1, items: [] } },

      { id: "prophezeiung",  typ: "kern", name: "Prophezeiung",            ort: "Abrechnung in der Hütte",    station: "gipfel",     glyph: "✦",
        beschreibung: "Zwei Vorhersagen pro Trauzeuge, morgens versiegelt. Wird in der Hütte abgerechnet.",
        win:  { packs: 1, items: [] },
        lose: { packs: 0, items: [] } }
    ],

    // Schnellbuchungen im Admin-Menü (Packs, Grund)
    schnellbuchungen: [
      { packs: -1, grund: "Steckbrief gekauft" },
      { packs: 1,  grund: "Bonus vom Quest Master" },
      { packs: -1, grund: "Strafe vom Quest Master" }
    ],
    ziffer_preis: 1
  };

  if (typeof module !== "undefined" && module.exports) module.exports = GAME_CONFIG;
  else root.GAME_CONFIG = GAME_CONFIG;
})(typeof window !== "undefined" ? window : globalThis);
