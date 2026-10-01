/* Dennis Quest · Konfiguration v1 (Stand 25.09.2026, siehe 07-spiele-und-items.md)
   Alles, was das Spiel kennt. Ändert sich am Spieltag nicht.

   Quests mit typ "kern" (Hauptquest, Prüfung mit Medaillon) und "side" (Sidequest, Stein) laufen in fester Reihenfolge:
   dran ist immer die erste offene. Quests mit typ "lauf" laufen den ganzen Tag daneben (Bereich „Läuft"),
   der Quest Master startet sie.

   Nach jeder Änderung: node app/engine.test.js */
(function (root) {
  const GAME_CONFIG = {
    version: "v1",

    waehrung: { name: "Packs", max: 20, start: 0 },    // 20 Packs über den Tag (in der Leiste), alle Siege zusammen genau 20 (29.09.).
                                                       // Die 10 Packs im Kästchen am Ende sind eine Überraschung, die App erwähnt sie nicht

    code: [7, 4, 2, 9],                                 // geheim, nur der Quest Master sieht alle vier
    ziffer_preis: 2,                                    // Packs für eine fehlende Ziffer am Tor zum Gipfel (oder Bußprüfung, oder Rikes Segen)

    speicher: {
      typ: "firebase",                                  // "lokal" (ein Gerät, zum Testen) oder "firebase"
      spielId: "dennis-jga-2026",
      databaseURL: "https://dennis-quest-default-rtdb.europe-west1.firebasedatabase.app"
    },

    // Keine Startitems mehr (01.10.): Am Freitag im Zug hat Dennis noch nichts, die Basis-Items bringt die Fee am Samstagmorgen
    startitems: [],

    /* Der Morgen (01.10., Wunsch des Nutzers): Zwischensequenz am Samstagmorgen. Rikes Fee hat in der Nacht bei Dennis zu Hause
       ein paar Dinge geholt, Buu Huu will sie ihr abjagen, sie verjagt ihn, dann kommen die vier Basis-Items aus dem Beutel.
       Ab da hat Dennis in jedem Feld der Ausrüstung Stufe 1 und spielt den Tag über die Upgrades frei.
       Der Quest Master stößt sie im Admin an („Der Morgen beginnt“, gespeichert als morgen im Spiel). Vergisst er es, gilt sie
       mit der Freigabe der Quest vor (oder sobald dort oder danach etwas entschieden ist), die Szene läuft dann vor der Quest.
       szenen: was die Fee und Buu Huu sagen, der Reihe nach (wer: fee, geist oder erzaehler). */
    morgen: {
      vor: "wirbel",
      items: ["spritze", "huelle", "klinge_rost", "nadel_fein"],
      szenen: {
        nacht:   "Die Nacht vor der großen Prüfung …",
        fee:     ["Dennis! Wach auf, der Tag ist da!", "Ich war heute Nacht bei dir zu Hause. Rike hat mir etwas für dich mitgegeben."],
        geist:   ["Buu huu! Was hast du denn da, kleine Fee?", "Das gehört jetzt dem Bund! Hehehe …"],
        abwehr:  "Finger weg, Geist! Das ist für Dennis!",
        flucht:  "Buu … das merk ich mir!",
        beutel:  "Hier, das ist für dich. Ohne das überstehst du den Tag nicht.",
        stufe:   "Noch sind sie schwach. Gewinne, und sie werden stärker!",
        titel:   "DAS ABENTEUER BEGINNT"
      }
    },

    /* Items und Fähigkeiten (Regel vom 28.09.: Hauptquests geben Items, Sidequests und laufende Quests Fähigkeiten)
       gruppe:   "item" (Gegenstand, links in der Ausrüstung, hilft bei genau einem späteren Spiel und bleibt)
                 oder "faehigkeit" (Magie, rechts, einmalig bei Duellen und im Showdown)
       stapel:   kann mehrfach besessen werden (Anzahl wird gezählt)
       einmalig: ist nach dem Einsetzen verbraucht
       tor:      wird am Tor zum Gipfel eingesetzt statt bei einer Quest (Rikes Segen), meldet sich dort selbst
       rettung:  wird nicht vorher mitgenommen, sondern meldet sich selbst, wenn Dennis ein Duell verliert (war der Schild,
                 gestrichen am 01.10., die Logik bleibt)
       ersetzt:  Items, die dieses ablöst (Stufen wie Zoras Schuppe): Wer es hat, setzt die schwächeren nicht mehr ein
       feld:     Stufen teilen sich ein Feld in der Ausrüstung (29.09., Wunsch des Nutzers). Es zeigt die stärkste, die Dennis hat,
                 sonst den Schatten der ersten, die er noch bekommen kann. Reihenfolge der Stufen = Reihenfolge hier
       einsatz:  was im Siegel-Fenster steht, wenn Dennis es einsetzt (Segen am Tor)
       geheim:   Dennis soll nicht wissen, dass er es bekommt: Die Vorschau einer Belohnung zeigt nur „Geheimnis“
       gefunden: Sätze im Moment, in dem er es bekommt (titel über dem Namen, warnung darunter)
       dieb:     Kehrseite beim Einsetzen (Fluch, 29.09.): Buu Huu dreht am Rad und stiehlt Packs (01.10.). gewichte[n] = Gewicht
                 für n Packs. alles[k] = Chance in % auf ALLES beim k-ten Fluch seit dem letzten ALLES, k = 0 ist der allererste
                 Fluch (nie ALLES, Dennis soll erst mutig werden), ab dem letzten Wert bleibt es dabei. ALLES nimmt alle
                 geschlossenen Packs, mindestens allesMin (fehlt etwas, zahlt Dennis in Karten). Gedreht wird auf dem Handy,
                 das den Einsatz besiegelt
       symbol:   Sprite aus index.html
       tarn:     So heißt das Item, solange Dennis es nicht erspielt hat (Ausrüstung und Vorschau einer Belohnung).
                 Beim Gewinnen „entpuppt" es sich. Bis dahin zeigt die Ausrüstung seinen Schatten: Die Form ist zu erkennen.
       Texte nennen keine Quest beim Namen, sonst verraten sie, was im Nebel liegt.
       Jedes Item hat Stufen in einem Feld (01.10., Wunsch des Nutzers): Stufe 1 bringt die Fee am Samstagmorgen (morgen oben),
       die Upgrades spielt Dennis frei, jedes vor dem Spiel, bei dem es hilft. Es zählt immer die stärkste Stufe.
         Wasser: Spritze, kleine Pistole (Sieg im Podrennen), große Pistole (Glanzsieg im Kartenwurf). Für das Auge des Jägers.
         Karten: leere Hülle (bringt nichts), Gepanzerte Karte (Sieg im Wirbel: eine Karte darf in die Hülle). Für den Kartenwurf.
         Klinge: Verrostete Klinge (2 Würfe), Stich (Sieg im Auge des Jägers: 4 Würfe). Für den Deku-Baum.
         Nadel: feine Nadel, dicke Nadel (Sieg am Deku-Baum). Für Rikes Rache.
       Götterkreisel (I5) und Stopfnadel (I9) sind seit 01.10. gestrichen, den Beyblade gibt es vor Ort. */
    items: [
      // Hieß bis 28.09. „Dennis' Eier“ (Beutel, I1), bis 01.10. Startitem (getarnt als Beutel)
      { id: "spritze", nr: "I7", gruppe: "item", feld: "wasser", name: "Wasserspritze", kurz: "Spritze", farbe: "#a8e4f5", symbol: "i-spritze",
        text: "Klein und schnell leer.",
        tarn: { name: "Zoras Tropfen", kurz: "Tropfen", text: "Kühl und klein. Was wird wohl daraus?" } },
      { id: "pistole_klein", nr: "I8", gruppe: "item", feld: "wasser", name: "Kleine Wasserpistole", kurz: "Kleine Pistole", farbe: "#7fd0ee", symbol: "i-pistol-klein",
        ersetzt: ["spritze"],
        text: "Mehr Wasser, mehr Reichweite.",
        tarn: { name: "Silberne Schuppe", kurz: "Schuppe", text: "Kühl und glatt. Ein erster Hauch von Zoras Macht." } },
      { id: "pistole_gross", nr: "I2", gruppe: "item", feld: "wasser", name: "Große Wasserpistole", kurz: "Große Pistole", farbe: "#4fb8e8", symbol: "i-pistol",
        ersetzt: ["spritze", "pistole_klein"],
        text: "Die Monsterpistole. Elektrisch, mit Dauerfeuer.",
        tarn: { name: "Zoras Quellstab", kurz: "Quellstab", text: "Relikt aus Zoras Reich. Wer ihn führt, hat den längsten Atem." } },
      // Karten (01.10.): Die Basis ist gemein, eine leere Hülle. Das Upgrade erlaubt eine Karte darin.
      { id: "huelle", nr: "I11", gruppe: "item", feld: "karten", name: "Leere Hülle", kurz: "Hülle", farbe: "#c8dcea", symbol: "i-huelle",
        text: "Eine Kartenhülle. Leider ohne Karte.",
        tarn: { name: "Hohle Schale", kurz: "Schale", text: "Leicht und leer. Wartet darauf, gefüllt zu werden." } },
      { id: "karten_gepanzert", nr: "I4", gruppe: "item", feld: "karten", name: "Gepanzerte Karte", kurz: "Karte", farbe: "#9fd0f0", symbol: "i-cards",
        ersetzt: ["huelle"],
        text: "Eine deiner Karten darf in die Hülle.",
        tarn: { name: "Federn der Eule", kurz: "Federn", text: "Leicht und zielsicher. Fliegen, wohin du sie schickst." } },
      { id: "klinge_rost", nr: "I12", gruppe: "item", feld: "klinge", name: "Verrostete Klinge", kurz: "Klinge", farbe: "#c99a6b", symbol: "i-klinge-rost",
        text: "Alt und stumpf. Zwei Würfe.",
        tarn: { name: "Alter Griff", kurz: "Griff", text: "Schwer in der Hand. Was hing einmal daran?" } },
      { id: "stich", nr: "I6", gruppe: "item", feld: "klinge", name: "Stich", kurz: "Stich", farbe: "#b8d4ff", symbol: "i-sword",
        ersetzt: ["klinge_rost"],
        text: "Eine Elbenklinge. Vier Würfe statt zwei.",
        tarn: { name: "Schimmernde Klinge", kurz: "Klinge", text: "Leuchtet blau, wenn Gefahr naht." } },
      // Nadeln für Rikes Rache (29.09., seit 01.10. zwei Stufen): Die dickste, die Dennis hat, zählt.
      { id: "nadel_fein", nr: "I13", gruppe: "item", feld: "nadel", name: "Feine Nadel", kurz: "Feine Nadel", farbe: "#d6dde8", symbol: "i-nadel-fein",
        text: "Ein winziges Öhr. Viel Glück.",
        tarn: { name: "Splitter", kurz: "Splitter", text: "Fein wie ein Haar. Wer weiß, was er aufspießt." } },
      { id: "nadel_dick", nr: "I10", gruppe: "item", feld: "nadel", name: "Dicke Nadel", kurz: "Dicke Nadel", farbe: "#eef2f8", symbol: "i-nadel-dick",
        ersetzt: ["nadel_fein"],
        text: "Das große Öhr. Viel leichter einzufädeln.",
        tarn: { name: "Eisendorn", kurz: "Dorn", text: "Kräftiger als ein Splitter. Durch ein Loch fällt Licht." } },
      // Hieß bis 28.09. Spruchrolle (id bleibt, damit gespeicherte Stände passen).
      // Seit 29.09. zweischneidig: Vor einem Spiel gesprochen bringt er dort einen Vorteil (fluch bei der Quest),
      // danach dreht Buu Huu am Rad: 0 bis 3 Packs (gewichtet 30/35/25/10), ab dem zweiten Fluch auch ALLES mit 30 %
      // (01.10., höchstens 30 %, Wunsch des Nutzers: mehr wäre zu viel fürs Alles-Wegnehmen).
      // Seit 01.10. etwa drei am Tag, erst ab der dritten Aufgabe: Bei Die drei Zeichen schenkt Buu Huu einen, dazu einer je
      // geschlagenem Gegner, einer beim Sieg im Kartenwurf und einer bei Hüter der Flamme.
      { id: "spruchrolle", nr: "F1", gruppe: "faehigkeit", stapel: true, einmalig: true, geheim: true, name: "Fluch", kurz: "Fluch", farbe: "#c9a4ff", symbol: "i-fluch",
        text: "Ein Vorteil bei einem Spiel. Doch jeder Fluch hat seinen Preis.",
        gefunden: { titel: "Du hast etwas gefunden …", warnung: "Vorsicht, Flüche haben es in sich." },
        dieb: { name: "Buu Huu", gewichte: [30, 35, 25, 10], alles: [0, 30], allesMin: 3 },   // hieß bis 30.09. Schattendieb
        tarn: { name: "Versiegeltes Pergament", kurz: "Pergament", text: "Niemand weiß, was darauf steht." } },
      { id: "segen", nr: "F6", gruppe: "faehigkeit", einmalig: true, tor: true, name: "Rikes Segen", kurz: "Segen", farbe: "#f08cbc", symbol: "i-segen",
        text: "Rike wacht über dich. Am Tor schenkt sie dir eine fehlende Ziffer.",
        einsatz: "Rikes Segen schenkt dir eine fehlende Ziffer.",
        tarn: { name: "Versiegelter Brief", kurz: "Brief", text: "Öffne ihn, wenn du ihn am meisten brauchst." } }
    ],

    /* Karte (seit 30.09. der Blomberg bei Bad Tölz, vorher Tegernsee und Neureuth)
       stationen: Lage in Prozent der Kartenfläche, Reihenfolge = Weg. Von Station zu Station schickt der Quest Master
                  Dennis von Hand (Freigabe der nächsten Quest im Admin, 30.09.), kein GPS.
                  Die ids bleiben (wiese, wald, aussicht), auch wenn die Stationen jetzt anders heißen.
                  zu: „zur“ oder „zum“, für „Weiter zur TALSTATION“.
                  gps: Stelle am Weg [Breite, Länge]. Nur für Höhe und Kilometer in der Kartusche.
                  hoehe: nur, wenn das Schild etwas anderes sagt als das Höhenmodell.
       start, ab: wo der Weg am Samstag beginnt („vom Parkplatz Blombergbahn zum Gipfel“, „1,3 km ab Parkplatz“).
                  Freitag fährt Dennis im Zug von Düsseldorf nach München, am Samstag geht es von München zum Blomberg.
       weg:       der echte Weg: der klassische Wanderweg vom Parkplatz an der Talstation über den Entdeckerpfad und die
                  Mittelstation hinauf, kurz zum Blombergkreuz und zurück zum Blomberghaus, [Breite, Länge, Höhe in m].
                  Gut 4,4 km, knapp 570 Hm (bis zum Blomberghaus ohne Gipfel 3 km, laut der-blomberg.de 3,5 km und 460 Hm).
                  Quelle: © OpenStreetMap-Mitwirkende (ODbL), Weg per BRouter, Höhen EU-DEM (opentopodata.org).
                  Für Höhe und Strecke auf der Karte. */
    karte: {
      stationen: [
        { id: "zug",      name: "ZUG",           ort: "Zug Düsseldorf nach München", zu: "zum", x: 10, y: 79 },
        { id: "wiese",    name: "TALSTATION",    ort: "Wiese an der Talstation",     zu: "zur", x: 27, y: 66, gps: [47.74776, 11.51595] },
        { id: "wald",     name: "WALD",          ort: "Entdeckerpfad",               zu: "zum", x: 45, y: 55, gps: [47.74369, 11.51120] },
        { id: "aussicht", name: "MITTELSTATION", ort: "Mittelstation der Blombergbahn", zu: "zur", x: 62, y: 43, gps: [47.74027, 11.51087] },
        { id: "gipfel",   name: "GIPFEL",        ort: "Blombergkreuz",               zu: "zum", x: 78, y: 28, gps: [47.73360, 11.50726], hoehe: 1237 },
        { id: "huette",   name: "HÜTTE",         ort: "Blomberghaus",                zu: "zur", x: 91, y: 52, gps: [47.73513, 11.49752], hoehe: 1203 }
      ],
      start: "Parkplatz Blombergbahn",
      ab: "Parkplatz",
      weg: [
        [47.74776, 11.51595, 711], [47.74729, 11.51570, 717], [47.74715, 11.51554, 720], [47.74749, 11.51507, 718], [47.74547, 11.51360, 788], [47.74558, 11.51312, 789],
        [47.74539, 11.51211, 800], [47.74518, 11.51184, 807], [47.74491, 11.51163, 814], [47.74482, 11.51139, 818], [47.74447, 11.51141, 826], [47.74430, 11.51130, 830],
        [47.74369, 11.51120, 842], [47.74298, 11.51086, 861], [47.74275, 11.51051, 866], [47.74252, 11.50985, 870], [47.74235, 11.50957, 873], [47.74192, 11.50915, 883],
        [47.74142, 11.50895, 896], [47.74112, 11.50830, 908], [47.74098, 11.50835, 912], [47.74074, 11.50902, 917], [47.74043, 11.50967, 926], [47.74033, 11.50998, 929],
        [47.74027, 11.51087, 928], [47.74032, 11.51022, 929], [47.73970, 11.51033, 946], [47.73946, 11.51058, 951], [47.73913, 11.51057, 958], [47.73888, 11.51034, 963],
        [47.73869, 11.50977, 967], [47.73869, 11.50916, 969], [47.73855, 11.50814, 988], [47.73859, 11.50771, 996], [47.73884, 11.50716, 999], [47.73883, 11.50698, 1002],
        [47.73876, 11.50690, 1005], [47.73836, 11.50691, 1014], [47.73819, 11.50701, 1017], [47.73797, 11.50732, 1021], [47.73792, 11.50689, 1027], [47.73804, 11.50650, 1025],
        [47.73764, 11.50657, 1038], [47.73738, 11.50652, 1049], [47.73700, 11.50624, 1067], [47.73674, 11.50626, 1083], [47.73608, 11.50546, 1119], [47.73600, 11.50550, 1125],
        [47.73573, 11.50449, 1144], [47.73549, 11.50402, 1162], [47.73503, 11.50269, 1184], [47.73509, 11.50203, 1179], [47.73490, 11.50108, 1184], [47.73509, 11.50008, 1182],
        [47.73504, 11.49974, 1184], [47.73494, 11.49984, 1184], [47.73429, 11.50000, 1183], [47.73414, 11.50014, 1183], [47.73399, 11.50034, 1184], [47.73356, 11.50131, 1193],
        [47.73360, 11.50169, 1195], [47.73401, 11.50261, 1202], [47.73450, 11.50350, 1201], [47.73457, 11.50428, 1199], [47.73436, 11.50520, 1211], [47.73415, 11.50579, 1224],
        [47.73393, 11.50622, 1232], [47.73375, 11.50630, 1233], [47.73374, 11.50685, 1235], [47.73355, 11.50707, 1235], [47.73360, 11.50726, 1235], [47.73355, 11.50707, 1235],
        [47.73374, 11.50685, 1235], [47.73375, 11.50630, 1233], [47.73393, 11.50622, 1232], [47.73415, 11.50579, 1224], [47.73436, 11.50520, 1211], [47.73457, 11.50428, 1199],
        [47.73450, 11.50350, 1201], [47.73401, 11.50261, 1202], [47.73360, 11.50169, 1195], [47.73356, 11.50131, 1193], [47.73399, 11.50034, 1184], [47.73414, 11.50014, 1183],
        [47.73429, 11.50000, 1183], [47.73494, 11.49984, 1184], [47.73504, 11.49974, 1184], [47.73498, 11.49867, 1192], [47.73464, 11.49751, 1202], [47.73472, 11.49723, 1206],
        [47.73508, 11.49717, 1205], [47.73513, 11.49752, 1203]
      ]
    },

    /* Quests
       nr:         feste Nummer aus 07-spiele-und-items.md
       text:       was Dennis liest (Du-Form, ein Satz: was zu tun ist. Die genauen Regeln erklärt der Bund vor Ort, 29.09.)
       qm:         Notiz nur für den Quest Master, mit der Grenze für bestanden
       farbe, emblem: Medaillon einer Hauptquest (Sprite aus index.html)
       win / lose: packs (Zahl), items (Liste), ziffer (1 bis 4, nur bei win)
       glanz:      Glanzsieg (28.09.): ein besonders deutlicher Sieg bringt zusätzlich zu win noch das hier.
                   bedingung steht bei Dennis auf der Quest-Karte. Er trägt ihn selbst ein, der Quest Master kann ihn zurücknehmen.
       geschenk:   bekommt Dennis in jedem Fall, sobald die Quest entschieden ist, ob Sieg oder Niederlage (01.10.: Buu Huu
                   schenkt bei Die drei Zeichen einen Fluch). text steht im Ergebnis-Fenster, mehr, wenn er dort mehrere bekommt
       einsetzbar: Items und Fähigkeiten, die hier helfen. Items und Flüche nimmt Dennis vor dem Spiel in der Ausrüstung mit
                   (C-Tasten, ein Siegel, 29.09.). Der Quest Master kann zurücknehmen.
       ergebnisWort: Wort auf dem Knopf, mit dem Dennis den Sieg besiegelt (sonst „Bestanden")
       duell:      ein Spiel gegen einen aus dem Bund
       revanche:   kann im Showdown als Revanche wiederkommen, wenn Dennis es verloren hat
       tor:        Dennis darf erst antreten, wenn er alle vier Ziffern hat (fehlende holt er am Tor)
       fluch:      Vorteil, wenn Dennis hier einen Fluch spricht (29.09.). Text, oder { stufen, sonst }: Die Waffe wird eine Stufe
                   stärker, hat er schon die stärkste, gilt sonst. Im Showdown gilt der Vorteil des Spiels im aktuellen Duell.
       Regel (28.09.): Hauptquests geben Packs und eine Ziffer oder ein Item, Sidequests und laufende Quests eine Fähigkeit.
       Jede Niederlage kostet nur Packs. Die vier Ziffern liegen vor dem Gipfel, ohne sie kein Finale.
       Packs (29.09.): Siege zusammen 20 (1, 2, 2, 3, 3, 4, 5), Niederlagen −19. Werte ändern, dann node tests/balance.js (rechnet 50 000 Tage durch). */
    quests: [
      { id: "logbuch", nr: 1, typ: "kern", name: "Rikes Tagebuch", ort: "Zug Düsseldorf nach München", station: "zug",
        farbe: "#4a8fe8", emblem: "z-water",
        text: "Sieben Fragen über dich. Was hat Rike geantwortet?",
        qm: "Bestanden ab 5 von 7 Treffern, du urteilst, ob sinngemäß. Dennis tippt seine Antworten im Menü, danach spielt Rikes Sprachnachricht. Seine Antworten stehen unten im Admin. Das Ergebnis trägt er danach selbst ein.",
        win:  { packs: 1, ziffer: 1 },           // seit 01.10. ohne Item: Am Freitag gibt es keins, die Fee bringt sie Samstag früh
        lose: { packs: 0 },
        einsetzbar: [], logbuch: true },

      // Seit 01.10. das erste Spiel am Samstag, gleich nach der Zwischensequenz (morgen), vor Die drei Zeichen
      { id: "wirbel", nr: 14, typ: "kern", name: "Wirbel der Götter", ort: "Wiese an der Talstation", station: "wiese",
        farbe: "#ec8f2e", emblem: "z-spirit",
        text: "Zwei Kreisel, eine Arena. Wer sich länger dreht, gewinnt.",
        qm: "Beyblade gegen den besten Blader des Bundes, bestanden bei 2 von 3. Die Kreisel gibt es vor Ort, kein Item. Füllt auch den Showdown auf. Der Sieg bringt die Gepanzerte Karte für den Kartenwurf.",
        win:  { packs: 2, items: ["karten_gepanzert"] },
        lose: { packs: -2 },
        fluch: "Du darfst vorher üben.",
        einsetzbar: ["spruchrolle"], duell: true, revanche: true },

      // Hieß bis 28.09. „Kreuzung der Klingen“ und war eine Prüfung (id bleibt, damit gespeicherte Stände passen).
      // Seit 01.10. die dritte Aufgabe (nach dem Wirbel), hier beginnen die Flüche: Buu Huu spielt mit und schenkt Dennis
      // in jedem Fall einen, dazu einen je geschlagenem Gegner (einer = Sieg, beide = Glanzsieg).
      { id: "klingen", nr: 4, typ: "side", name: "Die drei Zeichen", ort: "Wiese an der Talstation", station: "wiese",
        text: "Schnick Schnack Schnuck gegen beide aus dem Bund. Je Best of 3.",
        qm: "Dennis spielt gegen beide, je Best of 3, er wählt die Reihenfolge. Einen geschlagen: bestanden. Beide: Glanzsieg. Keinen: verloren. Buu Huu schenkt ihm in jedem Fall einen Fluch, dazu einen je geschlagenem Gegner (bis zu drei). Der erste Fluch des Tages kann noch kein ALLES.",
        win:  { items: ["spruchrolle"] },
        glanz: { bedingung: "beide geschlagen", items: ["spruchrolle"] },
        geschenk: { items: ["spruchrolle"], text: "Buu Huu spielt mit und schenkt dir einen Fluch. Hehehe …", mehr: "Einen davon schenkt dir Buu Huu. Hehehe …" },
        lose: { packs: -1 },
        einsetzbar: [], duell: true, revanche: true },

      { id: "podrennen", nr: 7, typ: "kern", name: "Speed Flip", ort: "Wiese an der Talstation", station: "wiese",
        farbe: "#a468e6", emblem: "z-shadow",
        text: "Fahr deinen Octane durch den Parcours, schneller als der Bund.",
        qm: "RC-Auto auf Zeit, ein Versuch, auf festem Boden (auf Gras bleibt das kleine Auto hängen). Erst fahren Fabio und du je eine Runde, Dennis muss die bessere der beiden Zeiten schlagen. Mit Fluch sabotiert Dennis den Bund: Ihr klebt euch vor euren Runden einen kleinen Stein aufs Auto (Klebeband mitnehmen), danach fährt Dennis ohne.",
        win:  { packs: 2, ziffer: 2, items: ["pistole_klein"] },
        lose: { packs: -2 },
        fluch: "Sabotage! Der Bund fährt mit einem Stein auf dem Dach.",
        einsetzbar: ["spruchrolle"], revanche: true },

      { id: "kartenwurf", nr: 9, typ: "side", name: "Kartenwurf", ort: "Entdeckerpfad", station: "wald",
        text: "Karten aus deinen Packs ins Ziel. Mehr als dein Gegner.",
        qm: "Duell mit Karten aus schon geöffneten Packs, fester Abstand, je 3 Karten. Gleichstand zählt als verloren. Mit der Leeren Hülle wirft Dennis nur nackte Karten (die Hülle bringt nichts), mit der Gepanzerten Karte darf eine seiner Karten in die Hülle. Glanzsieg: mindestens 2 Karten mehr im Ziel als der Gegner, bringt die Große Wasserpistole.",
        win:  { items: ["spruchrolle"] },
        glanz: { bedingung: "2 Karten Vorsprung", items: ["pistole_gross"] },   // einzige Sidequest mit Item, nur als Glanzsieg
        lose: { packs: -2 },
        fluch: "5 Karten statt 3.",
        einsetzbar: ["huelle", "karten_gepanzert", "spruchrolle"], duell: true, revanche: true },

      { id: "auge", nr: 2, typ: "kern", name: "Auge des Jägers", ort: "Entdeckerpfad", station: "wald",
        farbe: "#e2472f", emblem: "e-flame",
        text: "Lösch fünf Flammen mit einem Tank.",
        qm: "5 Teelichter aus 4 m, ein Tank. Bestanden nur, wenn alle 5 aus sind. Es zählt die stärkste Wasserwaffe, die Dennis hat: Spritze, kleine Pistole oder große Pistole.",
        win:  { packs: 3, ziffer: 3, items: ["stich"] },
        lose: { packs: -2 },
        fluch: { stufen: ["spritze", "pistole_klein", "pistole_gross"], sonst: "1 m näher ran." },
        einsetzbar: ["spritze", "pistole_klein", "pistole_gross", "spruchrolle"], revanche: true },

      { id: "deku", nr: 12, typ: "kern", name: "Klingen des Deku-Baums", ort: "Entdeckerpfad", station: "wald",
        farbe: "#48b454", emblem: "z-forest",
        text: "Wirf deine Klingen in den alten Baum. Nur was stecken bleibt, zählt.",
        qm: "Mini-Schwerter aus 4 m auf einen Baum, es zählen Würfe: mit der Verrosteten Klinge 2, mit Stich 4 (es gibt 4 Schwerter, für mehr Würfe sammelt ihr sie wieder ein). Bestanden, wenn mindestens eins stecken bleibt (Vorschlag, vorher testen). Der Sieg bringt die Dicke Nadel für Rikes Rache.",
        win:  { packs: 3, items: ["nadel_dick"] },
        lose: { packs: -2 },
        fluch: "Ein Wurf mehr.",
        einsetzbar: ["klinge_rost", "stich", "spruchrolle"], revanche: true },

      // Ersetzt am 28.09. die Feuerprobe („Der Ruf“) und ist eine Sidequest, id bleibt. Gibt seit 01.10. einen Fluch statt des Schilds
      { id: "feuerprobe", nr: 3, typ: "side", name: "Hüter der Flamme", ort: "Mittelstation", station: "aussicht",
        text: "Ein Teelicht, 100 Schritte bergauf. Es darf nicht ausgehen.",
        qm: "Offenes Teelicht ohne Glas, 100 Schritte bergauf. Erlischt es, verloren. Der Bund lenkt ab, pustet nicht, berührt nicht. Feuerzeug und Ersatzlicht mitnehmen.",
        win:  { items: ["spruchrolle"] },
        lose: { packs: -2 },
        fluch: "Halbe Strecke: 50 statt 100 Schritte.",
        einsetzbar: ["spruchrolle"] },

      // Neu am 29.09.: Rike hat im Tagebuch verraten, dass Dennis keine Nadel einfädeln kann. Trägt Ziffer 4.
      { id: "rache", nr: 16, typ: "kern", name: "Rikes Rache", ort: "Mittelstation", station: "aussicht",
        farbe: "#d8405e", emblem: "i-nadel",
        text: "Rike hat verraten, was du gar nicht kannst. Einfädeln, bevor die Zeit abläuft.",
        qm: "Faden durchs Nadelöhr auf Zeit, das genaue Spiel legst du fest. Vorschlag: fünf Nadeln an fünf Stellen rund um die Mittelstation, eine Uhr für alle, 20 Sekunden je Treffer im Tagebuch (mindestens 60). Es zählt die dickste Nadel, die Dennis hat: feine Nadeln, mit der Dicken Nadel dicke. Anlecken und Zwirbeln erlaubt, keine Einfädelhilfe.",
        win:  { packs: 4, ziffer: 4 },
        lose: { packs: -2 },
        fluch: "Mehr Zeit auf der Uhr.",
        einsetzbar: ["nadel_fein", "nadel_dick", "spruchrolle"], revanche: true },

      { id: "bund", nr: 5, typ: "kern", name: "Prüfung des Bundes", ort: "Blombergkreuz", station: "gipfel",
        farbe: "#f2c94c", emblem: "z-triforce",
        text: "Drei Duelle gegen den Bund. Zwei musst du gewinnen.",
        qm: "Erst das Tor: Fehlt eine Ziffer, holt Dennis sie für 2 Packs, mit Rikes Segen oder per Bußprüfung, die du bestimmst. Dann 3 Duelle, bestanden bei 2 Siegen: erst verlorene Spiele vom Tag, aufgefüllt mit Wirbel der Götter. Die App zeigt sie unten.",
        win:  { packs: 5 },
        lose: { packs: -4 },
        einsetzbar: ["spruchrolle"], tor: true,
        showdown: { duelle: 3, auffuellen: "wirbel" } },

      /* Laufende Quests: sichtbar, sobald der Quest Master sie startet */
      { id: "amulett", nr: 15, typ: "lauf", name: "Rikes Amulett", ort: "Den ganzen Tag",
        farbe: "#e56aa0", emblem: "i-amulet",
        text: "Finde Rikes versteckte Brosche. Setz sie bis zum Gipfel zusammen.",
        qm: "Erst finden (Frist), dann knobeln bis zum Gipfel. Gelöst = bestanden, bringt Rikes Segen (eine fehlende Ziffer am Tor). Dennis meldet Gefunden und Zusammengesetzt selbst, Verloren buchst du. Versteck und Frist offen.",
        schritte: [{ id: "gefunden", name: "Gefunden" }], ergebnisWort: "Zusammengesetzt",
        win:  { items: ["segen"] },
        lose: { packs: 0 },
        fluch: "Ein Tipp vom Quest Master zum Knobelspiel.",
        einsetzbar: ["spruchrolle"] }
    ],

    /* Log-Buch (Quest 1, für Dennis „Rikes Tagebuch“): Rike beantwortet sieben Fragen über Dennis per Sprachnachricht.
       Dennis tippt in ein bis drei Worten, was sie gesagt hat, besiegelt es, dann spielt ihre Antwort.
       Fragen festgelegt am 26.09. Wie Rike sie gestellt bekommt: app/assets/logbuch/LIESMICH.md.
       Dateien: app/assets/logbuch/frage1.m4a bis frage7.m4a. Fehlt eine, spielt die App einen Platzhalter-Klang.
       geist: Der Schattendieb des Bundes meldet sich, sobald Rikes Antwort vorbei ist (30.09., Wunsch des Nutzers: das Gemeine
            macht der Bund, die Fee hilft nur): am Ende der Nachricht, spätestens wenn Dennis weiterblättert oder das Tagebuch
            schließt. Er huscht herein, stellt sich vor (sein erster Auftritt) und macht aus der Antwort eine Quest. Beim vorletzten
            Satz erscheint das Medaillon der Quest (quest), beim letzten verschwindet es im Nebel, davor spricht er allein. Den Namen der Quest sagt er nicht. Er kommt einmal,
            gleich nach dem Besiegeln (nach „Tagebuch leeren“ oder „Alles zurücksetzen“ wieder). */
    logbuch: {
      fragen: [
        // Rike (30.09.): Filigrane Arbeiten mit Fingerspitzengefühl, „einen Faden in so einem Nadelöhr zu bekommen“. Daraus wird Rikes Rache.
        { frage: "Was kannst du laut Rike überhaupt nicht?",                                       audio: "assets/logbuch/frage1.m4a",
          geist: { quest: "rache", saetze: ["Buu huu! Ich bin’s, Buu Huu, direkt aus Mario Party.", "Die Jungs vom Bund haben mich angeheuert. Ich werde dein Albtraum sein!", "Hehehe … interessant. Nicht mal einen Faden durchs Nadelöhr?", "Dann macht der Bund daraus doch direkt eine Quest!", "Sie wartet im Nebel auf dich. Viel Spaß beim Einfädeln!"] } },
        { frage: "Womit bringst du Rike auf die Palme?",                                           audio: "assets/logbuch/frage2.m4a" },
        { frage: "Was ist laut Rike deine ulkigste Eigenart?",                                     audio: "assets/logbuch/frage3.m4a" },
        { frage: "Was hast du bei eurem ersten Treffen gesagt oder getan, das Rike nie vergisst?", audio: "assets/logbuch/frage4.m4a" },
        { frage: "An welchem Ort wusste Rike, dass du der Richtige bist?",                         audio: "assets/logbuch/frage5.m4a" },
        { frage: "Was sollst du laut Rike in eurer Ehe nie ändern?",                               audio: "assets/logbuch/frage6.m4a" },
        { frage: "Was schätzt Rike an dir am meisten?",                                            audio: "assets/logbuch/frage7.m4a" }
      ]
    },

    /* Finale (29.09.): Nach der Prüfung des Bundes kommen Siegbildschirm, die Geschichte als Laufschrift wie im Kino
       und der Abspann (etwa 45 s), der bei THE END mit dem Code stehen bleibt. Hier stehen alle Namen und Texte.
       In der Geschichte keine Gedankenstriche. Ein leerer questMaster lässt die Zeile weg. */
    abspann: {
      held: "Dennis",
      questMaster: "Bene",
      bund: ["Bene", "Fabio"],
      dank: ["Rike"],
      drehort: "Der Blomberg bei Bad Tölz, 1237 m",
      fortsetzung: "Episode II · Die Hochzeit",
      geschichte: {
        vorlange: "Vor langer Zeit, in einem Tal gar nicht so weit entfernt …",
        episode: "EPISODE I",
        titel: "DIE LETZTEN PRÜFUNGEN",
        absaetze: [
          "Es ist eine Zeit großer Gefühle. Der tapfere Held DENNIS hat das Herz von RIKE gewonnen, und sie hat seines schon lange. Der Tag, an dem die beiden sich das Ja-Wort geben, rückt unaufhaltsam näher.",
          "Doch ein uraltes Gesetz der Junggesellen verlangt, dass kein Held vor den Altar tritt, ehe er sich in den Bergen bewiesen hat. Die finsteren Ritter BENE und FABIO haben dafür zehn Prüfungen ersonnen, und sie kennen keine Gnade.",
          "Bewaffnet mit einer Wasserspritze, dem Mut eines Piraten und einer Fee, die Rike ihm zur Seite schickte, fuhr Dennis von Düsseldorf nach München und stieg hinauf zum Kreuz des Blombergs, um sich als würdig zu erweisen …"
        ],
        // Letzter Absatz, je nachdem, wie die Prüfung des Bundes ausgeht
        sieg: "Er hat den Bund bezwungen. Die vier Ziffern sind sein, das Kästchen wartet. Doch die größte Quest seines Lebens beginnt erst: an Rikes Seite.",
        niederlage: "Der Bund hat ihn am Gipfel bezwungen, doch aufgegeben hat er nie. Das Kästchen wartet. Und die größte Quest seines Lebens beginnt erst: an Rikes Seite."
      }
    },

    // Schnellbuchungen im Admin-Menü (Packs, Grund). offen: Dennis hat ein Pack geöffnet (29.09., zählt wie sein Siegel „Pack öffnen“)
    schnellbuchungen: [
      { packs: -1, grund: "Pack geöffnet", offen: true },
      { packs: 1,  grund: "Bonus vom Quest Master" },
      { packs: -1, grund: "Strafe vom Quest Master" },
      { packs: 0,  grund: "Fluch geschenkt", item: "spruchrolle", menge: 1 }
    ]
  };

  if (typeof module !== "undefined" && module.exports) module.exports = GAME_CONFIG;
  else root.GAME_CONFIG = GAME_CONFIG;
})(typeof window !== "undefined" ? window : globalThis);
