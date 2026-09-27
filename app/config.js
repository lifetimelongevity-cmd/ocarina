/* Dennis Quest · Konfiguration v1 (Stand 25.09.2026, siehe 07-spiele-und-items.md)
   Alles, was das Spiel kennt. Ändert sich am Spieltag nicht.

   Quests mit typ "kern" (Prüfung, Medaillon) und "side" (Sidequest, Stein) laufen in fester Reihenfolge:
   dran ist immer die erste offene. Quests mit typ "lauf" laufen den ganzen Tag daneben (Bereich „Läuft"),
   der Quest Master startet sie.

   Nach jeder Änderung: node app/engine.test.js */
(function (root) {
  const GAME_CONFIG = {
    version: "v1",

    waehrung: { name: "Packs", max: 20, start: 0 },    // Packs im Kästchen, eher 20+ (26.09.). Siege ergeben zusammen 24

    code: [7, 4, 2, 9],                                 // geheim, nur der Quest Master sieht alle vier
    ziffer_preis: 1,                                    // Packs für eine fehlende Ziffer am Kästchen

    speicher: {
      typ: "firebase",                                  // "lokal" (ein Gerät, zum Testen) oder "firebase"
      spielId: "dennis-jga-2026",
      databaseURL: "https://dennis-quest-default-rtdb.europe-west1.firebasedatabase.app"
    },

    startitems: ["beutel"],

    /* Items und Fähigkeiten
       gruppe:   "item" (Gegenstand, links in der Ausrüstung) oder "faehigkeit" (Magie, rechts)
       stapel:   kann mehrfach besessen werden (Anzahl wird gezählt)
       einmalig: ist nach dem Einsetzen verbraucht
       einsatz:  was im Siegel-Fenster steht, wenn Dennis es einsetzt (sonst text)
       symbol:   Sprite aus index.html
       tarn:     So heißt das Item, solange Dennis es nicht erspielt hat (Ausrüstung und Vorschau einer Belohnung).
                 Beim Gewinnen „entpuppt" es sich. Bis dahin zeigt die Ausrüstung seinen Schatten: Die Form ist zu erkennen.
       Texte nennen keine Quest beim Namen, sonst verraten sie, was im Nebel liegt. */
    items: [
      { id: "beutel", nr: "I1", gruppe: "item", name: "Dennis' Eier", kurz: "Eier", farbe: "#d9a441", symbol: "i-beutel",
        text: "Klein, aber oho. Hier landet alles, was du dir erspielst.",
        tarn: { name: "Heiliger Beutel des Helden", kurz: "Beutel", text: "Seit jeher an deiner Seite. Was steckt wohl darin?" } },
      { id: "pistole_gross", nr: "I2", gruppe: "item", name: "Große Wasserpistole", kurz: "Pistole", farbe: "#4fb8e8", symbol: "i-pistol",
        text: "Dreifacher Tank. Du kannst länger schießen als jeder andere.",
        tarn: { name: "Zoras Quellstab", kurz: "Quellstab", text: "Ein Relikt aus Zoras Reich. Wer es führt, hat den längsten Atem." } },
      { id: "karten_gepanzert", nr: "I4", gruppe: "item", name: "Gepanzerte Karten", kurz: "Karten", farbe: "#9fd0f0", symbol: "i-cards",
        text: "Zwei Karten mehr, in festen Hüllen. Sie fliegen weiter und stabiler.",
        tarn: { name: "Federn der Eule", kurz: "Federn", text: "Leicht und doch zielsicher. Sie fliegen, wohin du sie schickst." } },
      { id: "kreisel", nr: "I5", gruppe: "item", name: "Götterkreisel", kurz: "Kreisel", farbe: "#e7a14a", symbol: "i-top",
        text: "Dein eigener Kreisel. Du darfst vorher üben und wählst zuerst.",
        tarn: { name: "Kern der Goronen", kurz: "Kern", text: "Rund, schwer und nie ganz still." } },
      { id: "stich", nr: "I6", gruppe: "item", name: "Stich", kurz: "Stich", farbe: "#b8d4ff", symbol: "i-sword",
        text: "Eine Elbenklinge. Ein Schwert mehr heißt ein Versuch mehr.",
        tarn: { name: "Verrostete Klinge", kurz: "Klinge", text: "Alt und stumpf. Doch sie wartet auf ihren Moment." } },
      { id: "spruchrolle", nr: "F1", gruppe: "faehigkeit", stapel: true, einmalig: true, name: "Spruchrolle", kurz: "Rolle", farbe: "#c9a4ff", symbol: "i-scroll",
        text: "In dieser Rolle schläft ein alter Fluch. Entrolle sie in einem Spiel, und er erwacht. Welche Gestalt er annimmt, weiß niemand, bis er gesprochen ist.",
        einsatz: "Der Fluch erwacht. Welche Gestalt er annimmt, enthüllt dir der Quest Master.",
        tarn: { name: "Versiegeltes Pergament", kurz: "Pergament", text: "Niemand weiß, was darauf steht." } },
      { id: "schild", nr: "F3", gruppe: "faehigkeit", einmalig: true, name: "Schild des Bundes", kurz: "Schild", farbe: "#7aa7ff", symbol: "i-shield",
        text: "Wiederhole ein verlorenes Duell. Einmal.",
        einsatz: "Du spielst ein verlorenes Duell noch einmal. Besiegle danach das neue Ergebnis.",
        tarn: { name: "Zerbrochenes Wappen", kurz: "Wappen", text: "Ein Bruchstück eines alten Bundes. Es schützt, wer es heilt." } }
    ],

    /* Karte
       stationen: Lage in Prozent der Kartenfläche, Reihenfolge = Weg.
                  gps: echte Stelle am Weg [Breite, Länge], ungefähr. Wo der Quest Master am Samstag wirklich
                  aufbaut, kann er hier nachtragen (auf dem Handy lange auf die Stelle in Google Maps drücken).
                  hoehe: nur, wenn das Schild etwas anderes sagt als das Höhenmodell.
       weg:       der echte Weg vom Bahnhof Tegernsee über den Wanderweg 681a zum Gipfel und zum Berggasthof,
                  [Breite, Länge, Höhe in m]. Quelle: © OpenStreetMap-Mitwirkende (ODbL), Höhen EU-DEM (opentopodata.org).
                  Für GPS, Höhe und Strecke auf der Karte. */
    karte: {
      stationen: [
        { id: "zug",      name: "ZUG",      ort: "Freitag im Zug",   x: 10, y: 79 },
        { id: "wiese",    name: "WIESE",    ort: "Wiese am Anstieg", x: 27, y: 66, gps: [47.71836, 11.75569] },
        { id: "wald",     name: "WALD",     ort: "Erstes Waldstück", x: 45, y: 55, gps: [47.72257, 11.75415] },
        { id: "aussicht", name: "AUSSICHT", ort: "Aussichtspunkt",   x: 62, y: 43, gps: [47.72736, 11.76612] },
        { id: "gipfel",   name: "GIPFEL",   ort: "Gipfel Neureuth",  x: 78, y: 28, gps: [47.72846, 11.77209], hoehe: 1261 },
        { id: "huette",   name: "HÜTTE",    ort: "Berggasthaus",     x: 91, y: 52, gps: [47.72858, 11.77199] }
      ],
      start: "Bahnhof Tegernsee",
      weg: [
        [47.71437, 11.75690, 763], [47.71772, 11.75551, 796], [47.71836, 11.75569, 815], [47.71903, 11.75531, 821], [47.72086, 11.75377, 852], [47.72158, 11.75364, 869],
        [47.72190, 11.75427, 891], [47.72218, 11.75449, 906], [47.72248, 11.75434, 912], [47.72271, 11.75385, 907], [47.72269, 11.75411, 913], [47.72293, 11.75381, 913],
        [47.72326, 11.75383, 925], [47.72329, 11.75396, 930], [47.72306, 11.75419, 929], [47.72310, 11.75444, 938], [47.72368, 11.75433, 956], [47.72351, 11.75454, 956],
        [47.72363, 11.75456, 961], [47.72356, 11.75481, 966], [47.72413, 11.75459, 977], [47.72389, 11.75524, 988], [47.72388, 11.75574, 997], [47.72403, 11.75547, 996],
        [47.72394, 11.75631, 1007], [47.72417, 11.75589, 1006], [47.72460, 11.75563, 1010], [47.72424, 11.75675, 1027], [47.72419, 11.75699, 1033], [47.72432, 11.75695, 1035],
        [47.72416, 11.75736, 1043], [47.72466, 11.75709, 1048], [47.72434, 11.75784, 1063], [47.72482, 11.75767, 1068], [47.72460, 11.75810, 1076], [47.72486, 11.75797, 1077],
        [47.72472, 11.75823, 1082], [47.72490, 11.75818, 1083], [47.72479, 11.75847, 1089], [47.72496, 11.75837, 1089], [47.72483, 11.75877, 1098], [47.72510, 11.75866, 1098],
        [47.72468, 11.75950, 1119], [47.72478, 11.75957, 1123], [47.72480, 11.75996, 1136], [47.72469, 11.76014, 1140], [47.72536, 11.75969, 1134], [47.72521, 11.76013, 1147],
        [47.72527, 11.76082, 1161], [47.72509, 11.76092, 1162], [47.72534, 11.76176, 1169], [47.72541, 11.76273, 1175], [47.72555, 11.76305, 1177], [47.72662, 11.76403, 1201],
        [47.72683, 11.76460, 1204], [47.72708, 11.76488, 1204], [47.72727, 11.76605, 1204], [47.72764, 11.76723, 1205], [47.72777, 11.76855, 1216], [47.72812, 11.77032, 1238],
        [47.72863, 11.77094, 1248], [47.72850, 11.77144, 1252], [47.72851, 11.77187, 1255], [47.72837, 11.77192, 1253], [47.72846, 11.77209, 1255], [47.72858, 11.77199, 1256]
      ]
    },

    /* Quests
       nr:         feste Nummer aus 07-spiele-und-items.md
       text:       was Dennis liest (Du-Form, höchstens zwei kurze Sätze)
       qm:         Notiz nur für den Quest Master
       farbe, emblem: Medaillon einer Prüfung (Sprite aus index.html)
       win / lose: packs (Zahl), items (Liste), ziffer (1 bis 4, nur bei win)
       einsetzbar: Items und Fähigkeiten, die Dennis hier einsetzen kann (er besiegelt selbst, der Quest Master kann zurücknehmen)
       ergebnisWort: Wort auf dem Knopf, mit dem Dennis den Sieg besiegelt (sonst „Bestanden")
       duell:      ein Spiel gegen einen aus dem Bund
       revanche:   kann im Showdown als Revanche wiederkommen, wenn Dennis es verloren hat
       Belohnungskette (Vorschlag 25.09.): jeder Sieg bringt das Item für ein späteres Spiel.
       Packs (26.09.): Je weiter der Weg, desto mehr steht auf dem Spiel. Vorne 1 bis 2, hinten 3, der Bund +5 / −4.
       Alle Siege zusammen 24: Ein perfekter Tag füllt das Kästchen, ein halb gewonnener bringt etwa ein Viertel.
       Werte ändern, dann node tests/balance.js (rechnet 50 000 Tage durch). */
    quests: [
      { id: "logbuch", nr: 1, typ: "kern", name: "Log-Buch", ort: "Zug nach München", station: "zug",
        farbe: "#4a8fe8", emblem: "z-water",
        text: "Rike hat sieben Fragen über dich beantwortet. Schreib, was sie gesagt hat, dann hörst du ihre Antwort.",
        qm: "Dennis tippt seine Antworten im Menü, danach spielt Rikes Sprachnachricht. Seine Antworten stehen unten im Admin. Das Ergebnis trägt er danach selbst ein.",
        win:  { packs: 1, ziffer: 1 },
        lose: { packs: 0 },
        einsetzbar: [], logbuch: true },

      { id: "klingen", nr: 4, typ: "kern", name: "Kreuzung der Klingen", ort: "Wiese am Anstieg", station: "wiese",
        farbe: "#ec8f2e", emblem: "z-spirit",
        text: "Wähle deinen Gegner aus dem Bund. Erst dann erfährst du die Disziplin.",
        qm: "Disziplin nach der Wahl verraten: Schnick Schnack Schnuck, Best of 3.",
        win:  { packs: 2, ziffer: 2, items: ["kreisel"] },
        lose: { packs: -1 },
        einsetzbar: ["spruchrolle", "schild"], duell: true, revanche: true },

      { id: "wirbel", nr: 14, typ: "side", name: "Wirbel der Götter", ort: "Wiese am Anstieg", station: "wiese",
        text: "Zwei Kreisel, eine Arena. Wer sich länger dreht, gewinnt.",
        qm: "Beyblade, nur zwei Kreisel. Gegner und Best of 3 offen. Füllt auch den Showdown auf.",
        win:  { packs: 1, items: ["karten_gepanzert"] },
        lose: { packs: -1 },
        einsetzbar: ["kreisel", "spruchrolle", "schild"], duell: true, revanche: true },

      { id: "podrennen", nr: 7, typ: "kern", name: "Das Podrennen", ort: "Wiese am Anstieg", station: "wiese",
        farbe: "#a468e6", emblem: "z-shadow",
        text: "Ein kleiner Gleiter, ein Parcours, eine Uhr. Fahr schneller als die Zeit.",
        qm: "RC-Auto auf Zeit. Parcours und Zeitgrenze legst du fest.",
        win:  { packs: 2, items: ["pistole_gross"] },
        lose: { packs: -1 },
        einsetzbar: ["spruchrolle"], revanche: true },

      { id: "kartenwurf", nr: 9, typ: "side", name: "Kartenwurf", ort: "Erstes Waldstück", station: "wald",
        text: "Ein Duell mit Karten aus deinen Packs. Wer mehr ins Ziel bringt, gewinnt.",
        qm: "Duell mit Karten aus schon geöffneten Packs, fester Abstand, je 3 Karten. Gepanzerte Karten geben +2.",
        win:  { packs: 2 },
        lose: { packs: -1 },
        einsetzbar: ["karten_gepanzert", "spruchrolle", "schild"], duell: true, revanche: true },

      { id: "auge", nr: 2, typ: "kern", name: "Auge des Jägers", ort: "Erstes Waldstück", station: "wald",
        farbe: "#48b454", emblem: "z-forest",
        text: "Fünf Flammen, ein Tank. Lösch sie, bevor dir das Wasser ausgeht.",
        qm: "5 Teelichter, Wasserpistole, ein Tank. Grenze für bestanden legst du fest.",
        win:  { packs: 3, items: ["stich"] },
        lose: { packs: -2 },
        einsetzbar: ["pistole_gross", "spruchrolle"], revanche: true },

      { id: "deku", nr: 12, typ: "side", name: "Klingen des Deku-Baums", ort: "Erstes Waldstück", station: "wald",
        text: "Wirf deine Klingen in den alten Baum. Nur was stecken bleibt, zählt.",
        qm: "Mini-Schwerter auf einen Baum. 1 bis 4 Schwerter je nachdem, wie gut ein anderes Spiel lief (offen). Stich gibt eins mehr.",
        win:  { packs: 2 },
        lose: { packs: -1 },
        einsetzbar: ["stich", "spruchrolle"], revanche: true },

      { id: "feuerprobe", nr: 3, typ: "kern", name: "Feuerprobe", ort: "Aussichtspunkt", station: "aussicht",
        farbe: "#e2472f", emblem: "e-flame",
        text: "Der Ruf. Bring eine fremde Wandergruppe dazu, mit dir eine Botschaft für Rike aufzunehmen.",
        qm: "Mutprobe „Der Ruf“: Video mit einer fremden Wandergruppe für Rike.",
        win:  { packs: 3, ziffer: 3, items: ["schild"] },
        lose: { packs: -2 },
        einsetzbar: ["spruchrolle"] },

      { id: "bund", nr: 5, typ: "kern", name: "Prüfung des Bundes", ort: "Gipfel Neureuth", station: "gipfel",
        farbe: "#f2c94c", emblem: "z-triforce",
        text: "Der Bund stellt sich dir auf dem Gipfel. Drei Duelle, zuerst deine Revanchen.",
        qm: "3 Duelle: erst verlorene Spiele vom Tag, aufgefüllt mit Wirbel der Götter. Die App zeigt sie unten.",
        win:  { packs: 5, ziffer: 4 },
        lose: { packs: -4 },
        einsetzbar: ["spruchrolle", "schild"],
        showdown: { duelle: 3, auffuellen: "wirbel" } },

      /* Laufende Quests: sichtbar, sobald der Quest Master sie startet */
      { id: "prophezeiung", nr: 6, typ: "lauf", name: "Prophezeiung", ort: "Den ganzen Tag",
        farbe: "#8e7cf0", emblem: "i-eye",
        text: "Sag voraus, was der Bund heute tun wird. Jede Vorhersage, die eintrifft, bringt dir eine Spruchrolle.",
        qm: "Morgens 2 bis 3 Vorhersagen. Jede erfüllte buchst du mit +1 Treffer.",
        zaehler: { name: "Treffer", max: 3, proTreffer: { items: ["spruchrolle"] } },
        einsetzbar: [] },

      { id: "amulett", nr: 15, typ: "lauf", name: "Rikes Amulett", ort: "Den ganzen Tag",
        farbe: "#e56aa0", emblem: "i-amulet",
        text: "Rikes Brosche ist versteckt. Finde sie rechtzeitig und setz sie zusammen, bevor der Tag endet.",
        qm: "Erst finden (Frist), dann den ganzen Tag knobeln. Gelöst = bestanden. Dennis meldet Gefunden und Zusammengesetzt selbst, Verloren buchst du. Versteck, Frist und Packs offen.",
        schritte: [{ id: "gefunden", name: "Gefunden" }], ergebnisWort: "Zusammengesetzt",
        win:  { packs: 3 },
        lose: { packs: 0 },
        einsetzbar: ["spruchrolle"] }
    ],

    /* Log-Buch (Quest 1): Rike beantwortet sieben Fragen über Dennis per Sprachnachricht.
       Dennis tippt in ein bis drei Worten, was sie gesagt hat, besiegelt es, dann spielt ihre Antwort.
       Fragen festgelegt am 26.09. Wie Rike sie gestellt bekommt: app/assets/logbuch/LIESMICH.md.
       Dateien: app/assets/logbuch/frage1.m4a bis frage7.m4a. Fehlt eine, spielt die App einen Platzhalter-Klang. */
    logbuch: {
      fragen: [
        { frage: "Was kannst du laut Rike überhaupt nicht?",                                       audio: "assets/logbuch/frage1.m4a" },
        { frage: "Womit bringst du Rike auf die Palme?",                                           audio: "assets/logbuch/frage2.m4a" },
        { frage: "Was ist laut Rike deine ulkigste Eigenart?",                                     audio: "assets/logbuch/frage3.m4a" },
        { frage: "Was hast du bei eurem ersten Treffen gesagt oder getan, das Rike nie vergisst?", audio: "assets/logbuch/frage4.m4a" },
        { frage: "An welchem Ort wusste Rike, dass du der Richtige bist?",                         audio: "assets/logbuch/frage5.m4a" },
        { frage: "Was sollst du laut Rike in eurer Ehe nie ändern?",                               audio: "assets/logbuch/frage6.m4a" },
        { frage: "Was schätzt Rike an dir am meisten?",                                            audio: "assets/logbuch/frage7.m4a" }
      ]
    },

    // Schnellbuchungen im Admin-Menü (Packs, Grund)
    schnellbuchungen: [
      { packs: 1,  grund: "Bonus vom Quest Master" },
      { packs: -1, grund: "Strafe vom Quest Master" },
      { packs: 0,  grund: "Spruchrolle geschenkt", item: "spruchrolle", menge: 1 }
    ]
  };

  if (typeof module !== "undefined" && module.exports) module.exports = GAME_CONFIG;
  else root.GAME_CONFIG = GAME_CONFIG;
})(typeof window !== "undefined" ? window : globalThis);
