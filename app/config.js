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

    // Einziges Startitem (28.09.): Der Heilige Beutel des Helden entpuppt sich beim ersten Besuch der Ausrüstung
    // als Wasserspritze. Ein Feld, kein zusätzliches.
    startitems: ["spritze"],

    /* Items und Fähigkeiten (Regel vom 28.09.: Hauptquests geben Items, Sidequests und laufende Quests Fähigkeiten)
       gruppe:   "item" (Gegenstand, links in der Ausrüstung, hilft bei genau einem späteren Spiel und bleibt)
                 oder "faehigkeit" (Magie, rechts, einmalig bei Duellen und im Showdown)
       stapel:   kann mehrfach besessen werden (Anzahl wird gezählt)
       einmalig: ist nach dem Einsetzen verbraucht
       tor:      wird am Tor zum Gipfel eingesetzt statt bei einer Quest (Rikes Segen), meldet sich dort selbst
       rettung:  wird nicht vorher mitgenommen, sondern meldet sich selbst, wenn Dennis ein Duell verliert (Schild, 29.09.)
       ersetzt:  Items, die dieses ablöst (Stufen wie Zoras Schuppe): Wer es hat, setzt die schwächeren nicht mehr ein
       feld:     Stufen teilen sich ein Feld in der Ausrüstung (29.09., Wunsch des Nutzers). Es zeigt die stärkste, die Dennis hat,
                 sonst den Schatten der ersten, die er noch bekommen kann. Reihenfolge der Stufen = Reihenfolge hier
       einsatz:  was im Siegel-Fenster steht, wenn Dennis es einsetzt (Schild, Segen am Tor)
       fund:     Startitem: Satz, wenn es sich beim ersten Besuch der Ausrüstung entpuppt
       tarnSymbol: Sprite, solange es getarnt ist (sonst der Schatten von symbol)
       geheim:   Dennis soll nicht wissen, dass er es bekommt: Die Vorschau einer Belohnung zeigt nur „Geheimnis“
       gefunden: Sätze im Moment, in dem er es bekommt (titel über dem Namen, warnung darunter)
       dieb:     Kehrseite beim Einsetzen (Fluch, 29.09.): Der Schattendieb stiehlt Packs. gewichte[n] = Gewicht für n Packs,
                 gewürfelt auf dem Handy, das den Einsatz besiegelt
       symbol:   Sprite aus index.html
       tarn:     So heißt das Item, solange Dennis es nicht erspielt hat (Ausrüstung und Vorschau einer Belohnung).
                 Beim Gewinnen „entpuppt" es sich. Bis dahin zeigt die Ausrüstung seinen Schatten: Die Form ist zu erkennen.
       Texte nennen keine Quest beim Namen, sonst verraten sie, was im Nebel liegt.
       Wasserwaffen in drei Stufen (28.09.): Spritze (Start), kleine Pistole (Sieg im Podrennen),
       große Pistole (Glanzsieg im Kartenwurf). Im Auge des Jägers zählt die stärkste.
       Nadeln (29.09.): Stopfnadel (Sieg im Wirbel), dicke Nadel (Sieg am Deku-Baum). In Rikes Rache zählt die dickste. */
    items: [
      // Startitem: getarnt als Beutel (tarnSymbol), entpuppt sich als Spritze. Hieß bis 28.09. „Dennis' Eier“ (Beutel, I1).
      { id: "spritze", nr: "I7", gruppe: "item", feld: "wasser", name: "Wasserspritze", kurz: "Spritze", farbe: "#a8e4f5", symbol: "i-spritze", tarnSymbol: "i-beutel",
        text: "Klein und schnell leer. Deine erste Wasserwaffe.",
        fund: "Deine erste Wasserwaffe. Stärkere landen im selben Feld.",
        tarn: { name: "Heiliger Beutel des Helden", kurz: "Beutel", text: "Seit jeher an deiner Seite. Was steckt wohl darin?" } },
      { id: "pistole_klein", nr: "I8", gruppe: "item", feld: "wasser", name: "Kleine Wasserpistole", kurz: "Kleine Pistole", farbe: "#7fd0ee", symbol: "i-pistol-klein",
        ersetzt: ["spritze"],
        text: "Mehr Wasser, mehr Reichweite.",
        tarn: { name: "Silberne Schuppe", kurz: "Schuppe", text: "Kühl und glatt. Ein erster Hauch von Zoras Macht." } },
      { id: "pistole_gross", nr: "I2", gruppe: "item", feld: "wasser", name: "Große Wasserpistole", kurz: "Große Pistole", farbe: "#4fb8e8", symbol: "i-pistol",
        ersetzt: ["spritze", "pistole_klein"],
        text: "Die Monsterpistole: elektrisch, mit Dauerfeuer.",
        tarn: { name: "Zoras Quellstab", kurz: "Quellstab", text: "Ein Relikt aus Zoras Reich. Wer es führt, hat den längsten Atem." } },
      { id: "karten_gepanzert", nr: "I4", gruppe: "item", name: "Gepanzerte Karten", kurz: "Karten", farbe: "#9fd0f0", symbol: "i-cards",
        text: "Zwei Karten mehr, in festen Hüllen.",
        tarn: { name: "Federn der Eule", kurz: "Federn", text: "Leicht und doch zielsicher. Sie fliegen, wohin du sie schickst." } },
      { id: "kreisel", nr: "I5", gruppe: "item", name: "Götterkreisel", kurz: "Kreisel", farbe: "#e7a14a", symbol: "i-top",
        text: "Du übst vorher und wählst zuerst.",
        tarn: { name: "Kern der Goronen", kurz: "Kern", text: "Rund, schwer und nie ganz still." } },
      { id: "stich", nr: "I6", gruppe: "item", name: "Stich", kurz: "Stich", farbe: "#b8d4ff", symbol: "i-sword",
        text: "Eine Elbenklinge: ein Schwert mehr.",
        tarn: { name: "Verrostete Klinge", kurz: "Klinge", text: "Alt und stumpf. Doch sie wartet auf ihren Moment." } },
      // Nadeln für Rikes Rache (29.09.): Ohne Nadel-Item fädelt Dennis feine Nadeln. Die dickste, die er hat, zählt.
      { id: "nadel_stopf", nr: "I9", gruppe: "item", feld: "nadel", name: "Stopfnadel", kurz: "Stopfnadel", farbe: "#d6dde8", symbol: "i-nadel-stopf",
        text: "Größeres Öhr, der Faden findet leichter durch.",
        tarn: { name: "Eisendorn", kurz: "Dorn", text: "Kräftiger als ein Splitter. Wer weiß, was er aufspießt." } },
      { id: "nadel_dick", nr: "I10", gruppe: "item", feld: "nadel", name: "Dicke Nadel", kurz: "Dicke Nadel", farbe: "#eef2f8", symbol: "i-nadel-dick",
        ersetzt: ["nadel_stopf"],
        text: "Das größte Öhr von allen.",
        tarn: { name: "Uralter Dorn", kurz: "Dorn", text: "Hart wie altes Holz, mit einem Loch, durch das Licht fällt." } },
      // Hieß bis 28.09. Spruchrolle (id bleibt, damit gespeicherte Stände passen).
      // Seit 29.09. zweischneidig: Vor einem Spiel gesprochen bringt er dort einen Vorteil (fluch bei der Quest),
      // danach stiehlt der Schattendieb 0 bis 3 Packs (gewichtet 30/35/25/10). Zwei gibt es: Die drei Zeichen und Kartenwurf.
      { id: "spruchrolle", nr: "F1", gruppe: "faehigkeit", stapel: true, einmalig: true, geheim: true, name: "Fluch", kurz: "Fluch", farbe: "#c9a4ff", symbol: "i-fluch",
        text: "Bringt dir bei einem Spiel einen Vorteil. Doch jeder Fluch hat seinen Preis.",
        gefunden: { titel: "Du hast etwas gefunden …", warnung: "Sei vorsichtig. Flüche haben es in sich." },
        dieb: { name: "Schattendieb", gewichte: [30, 35, 25, 10] },
        tarn: { name: "Versiegeltes Pergament", kurz: "Pergament", text: "Niemand weiß, was darauf steht." } },
      { id: "schild", nr: "F3", gruppe: "faehigkeit", einmalig: true, rettung: true, name: "Schild des Bundes", kurz: "Schild", farbe: "#7aa7ff", symbol: "i-shield",
        text: "Verlierst du ein Duell, spielst du es noch einmal.",
        einsatz: "Statt zu verlieren, spielst du noch einmal. Danach ist er weg.",
        tarn: { name: "Zerbrochenes Wappen", kurz: "Wappen", text: "Ein Bruchstück eines alten Bundes. Es schützt, wer es heilt." } },
      { id: "segen", nr: "F6", gruppe: "faehigkeit", einmalig: true, tor: true, name: "Rikes Segen", kurz: "Segen", farbe: "#f08cbc", symbol: "i-segen",
        text: "Rike wacht über dich. Am Tor schenkt ihr Segen dir eine fehlende Ziffer.",
        einsatz: "Rikes Segen schenkt dir eine fehlende Ziffer.",
        tarn: { name: "Versiegelter Brief", kurz: "Brief", text: "Öffne ihn, wenn du ihn am meisten brauchst." } }
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
       text:       was Dennis liest (Du-Form, ein Satz: was zu tun ist. Die genauen Regeln erklärt der Bund vor Ort, 29.09.)
       qm:         Notiz nur für den Quest Master, mit der Grenze für bestanden
       farbe, emblem: Medaillon einer Hauptquest (Sprite aus index.html)
       win / lose: packs (Zahl), items (Liste), ziffer (1 bis 4, nur bei win)
       glanz:      Glanzsieg (28.09.): ein besonders deutlicher Sieg bringt zusätzlich zu win noch das hier.
                   bedingung steht bei Dennis auf der Quest-Karte. Er trägt ihn selbst ein, der Quest Master kann ihn zurücknehmen.
       einsetzbar: Items und Fähigkeiten, die hier helfen. Items und Flüche nimmt Dennis vor dem Spiel in der Ausrüstung mit
                   (C-Tasten, ein Siegel, 29.09.), der Schild meldet sich bei einer Niederlage. Der Quest Master kann zurücknehmen.
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
      { id: "logbuch", nr: 1, typ: "kern", name: "Rikes Tagebuch", ort: "Zug nach München", station: "zug",
        farbe: "#4a8fe8", emblem: "z-water",
        text: "Sieben Fragen über dich: Errate, was Rike geantwortet hat.",
        qm: "Bestanden ab 5 von 7 Treffern, du urteilst, ob sinngemäß. Dennis tippt seine Antworten im Menü, danach spielt Rikes Sprachnachricht. Seine Antworten stehen unten im Admin. Das Ergebnis trägt er danach selbst ein.",
        win:  { packs: 1, ziffer: 1, items: ["kreisel"] },
        lose: { packs: 0 },
        einsetzbar: [], logbuch: true },

      // Hieß bis 28.09. „Kreuzung der Klingen“ und war eine Prüfung (id bleibt, damit gespeicherte Stände passen)
      { id: "klingen", nr: 4, typ: "side", name: "Die drei Zeichen", ort: "Wiese am Anstieg", station: "wiese",
        text: "Schlag beide aus dem Bund im Schnick Schnack Schnuck, jeweils Best of 3.",
        qm: "Bestanden, wenn Dennis zwei Gegner nacheinander schlägt, jeweils Best of 3. Er wählt die Gegner selbst.",
        win:  { items: ["spruchrolle"] },
        lose: { packs: -1 },
        einsetzbar: ["schild"], duell: true, revanche: true },

      { id: "wirbel", nr: 14, typ: "kern", name: "Wirbel der Götter", ort: "Wiese am Anstieg", station: "wiese",
        farbe: "#ec8f2e", emblem: "z-spirit",
        text: "Zwei Kreisel, eine Arena. Wer sich länger dreht, gewinnt.",
        qm: "Beyblade gegen den besten Blader des Bundes, bestanden bei 2 von 3. Mit Götterkreisel übt Dennis vorher und wählt zuerst. Füllt auch den Showdown auf. Der Sieg bringt auch die Stopfnadel für Rikes Rache.",
        win:  { packs: 2, items: ["karten_gepanzert", "nadel_stopf"] },
        lose: { packs: -2 },
        fluch: "Dein Gegner muss den Kreisel mit der schwachen Hand starten.",
        einsetzbar: ["kreisel", "spruchrolle", "schild"], duell: true, revanche: true },

      { id: "podrennen", nr: 7, typ: "kern", name: "Das Podrennen", ort: "Wiese am Anstieg", station: "wiese",
        farbe: "#a468e6", emblem: "z-shadow",
        text: "Fahr den Gleiter durch den Parcours, schneller als die Uhr.",
        qm: "RC-Auto auf Zeit, ein Versuch, auf festem Boden (auf Gras bleibt das kleine Auto hängen). Zeitgrenze so, dass du es beim Testen nur jedes zweite Mal schaffst.",
        win:  { packs: 2, ziffer: 2, items: ["pistole_klein"] },
        lose: { packs: -2 },
        fluch: "3 Sekunden mehr auf der Uhr.",
        einsetzbar: ["spruchrolle"], revanche: true },

      { id: "kartenwurf", nr: 9, typ: "side", name: "Kartenwurf", ort: "Erstes Waldstück", station: "wald",
        text: "Wirf Karten aus deinen Packs ins Ziel, mehr als dein Gegner.",
        qm: "Duell mit Karten aus schon geöffneten Packs, fester Abstand, je 3 Karten. Gleichstand zählt als verloren. Gepanzerte Karten geben +2. Glanzsieg: mindestens 2 Karten mehr im Ziel als der Gegner, bringt die Große Wasserpistole.",
        win:  { items: ["spruchrolle"] },
        glanz: { bedingung: "2 Karten Vorsprung", items: ["pistole_gross"] },   // einzige Sidequest mit Item, nur als Glanzsieg
        lose: { packs: -2 },
        fluch: "5 Karten statt 3.",
        einsetzbar: ["karten_gepanzert", "spruchrolle", "schild"], duell: true, revanche: true },

      { id: "auge", nr: 2, typ: "kern", name: "Auge des Jägers", ort: "Erstes Waldstück", station: "wald",
        farbe: "#e2472f", emblem: "e-flame",
        text: "Lösch fünf Flammen mit einem Tank.",
        qm: "5 Teelichter aus 4 m, ein Tank. Bestanden nur, wenn alle 5 aus sind. Es zählt die stärkste Wasserwaffe, die Dennis hat: Spritze, kleine Pistole oder große Pistole.",
        win:  { packs: 3, ziffer: 3, items: ["stich"] },
        lose: { packs: -2 },
        fluch: { stufen: ["spritze", "pistole_klein", "pistole_gross"], sonst: "Du darfst 1 m näher ran." },
        einsetzbar: ["spritze", "pistole_klein", "pistole_gross", "spruchrolle"], revanche: true },

      { id: "deku", nr: 12, typ: "kern", name: "Klingen des Deku-Baums", ort: "Erstes Waldstück", station: "wald",
        farbe: "#48b454", emblem: "z-forest",
        text: "Wirf deine Klingen in den alten Baum. Nur was stecken bleibt, zählt.",
        qm: "4 Mini-Schwerter aus 4 m auf einen Baum, bestanden, wenn 2 stecken. Stich gibt ein Schwert mehr. Der Sieg bringt die dicke Nadel für Rikes Rache (Ziffer 4 liegt seit 29.09. bei Rikes Rache).",
        win:  { packs: 3, items: ["nadel_dick"] },
        lose: { packs: -2 },
        fluch: "Ein Schwert mehr.",
        einsetzbar: ["stich", "spruchrolle"], revanche: true },

      // Ersetzt am 28.09. die Feuerprobe („Der Ruf“) und ist eine Sidequest, id bleibt
      { id: "feuerprobe", nr: 3, typ: "side", name: "Hüter der Flamme", ort: "Aussichtspunkt", station: "aussicht",
        text: "Trag ein Teelicht 100 Schritte bergauf, ohne dass es ausgeht.",
        qm: "Offenes Teelicht ohne Glas, 100 Schritte bergauf. Erlischt es, verloren. Der Bund lenkt ab, pustet nicht, berührt nicht. Feuerzeug und Ersatzlicht mitnehmen.",
        win:  { items: ["schild"] },
        lose: { packs: -2 },
        fluch: "Nur die halbe Strecke: 50 statt 100 Schritte.",
        einsetzbar: ["spruchrolle"] },

      // Neu am 29.09.: Rike hat im Tagebuch verraten, dass Dennis keine Nadel einfädeln kann. Trägt Ziffer 4.
      { id: "rache", nr: 16, typ: "kern", name: "Rikes Rache", ort: "Aussichtspunkt", station: "aussicht",
        farbe: "#d8405e", emblem: "i-nadel",
        text: "Rike hat verraten, was du überhaupt nicht kannst. Fädle ein, bevor die Zeit abläuft.",
        qm: "Faden durchs Nadelöhr auf Zeit, das genaue Spiel legst du fest. Vorschlag: fünf Nadeln an fünf Stellen rund um den Aussichtspunkt, eine Uhr für alle, 20 Sekunden je Treffer im Tagebuch (mindestens 60). Es zählt die dickste Nadel, die Dennis hat: ohne Nadel-Item feine Nadeln, sonst Stopfnadeln oder dicke Nadeln. Anlecken und Zwirbeln erlaubt, keine Einfädelhilfe.",
        win:  { packs: 4, ziffer: 4 },
        lose: { packs: -2 },
        fluch: "30 Sekunden mehr auf der Uhr.",
        einsetzbar: ["nadel_stopf", "nadel_dick", "spruchrolle"], revanche: true },

      { id: "bund", nr: 5, typ: "kern", name: "Prüfung des Bundes", ort: "Gipfel Neureuth", station: "gipfel",
        farbe: "#f2c94c", emblem: "z-triforce",
        text: "Drei Duelle gegen den Bund. Zwei musst du gewinnen.",
        qm: "Erst das Tor: Fehlt eine Ziffer, holt Dennis sie für 2 Packs, mit Rikes Segen oder per Bußprüfung, die du bestimmst. Dann 3 Duelle, bestanden bei 2 Siegen: erst verlorene Spiele vom Tag, aufgefüllt mit Wirbel der Götter. Die App zeigt sie unten.",
        win:  { packs: 5 },
        lose: { packs: -4 },
        einsetzbar: ["spruchrolle", "schild"], tor: true,
        showdown: { duelle: 3, auffuellen: "wirbel" } },

      /* Laufende Quests: sichtbar, sobald der Quest Master sie startet */
      { id: "amulett", nr: 15, typ: "lauf", name: "Rikes Amulett", ort: "Den ganzen Tag",
        farbe: "#e56aa0", emblem: "i-amulet",
        text: "Finde Rikes versteckte Brosche und setz sie bis zum Gipfel zusammen.",
        qm: "Erst finden (Frist), dann knobeln bis zum Gipfel. Gelöst = bestanden, bringt Rikes Segen (eine fehlende Ziffer am Tor). Dennis meldet Gefunden und Zusammengesetzt selbst, Verloren buchst du. Versteck und Frist offen.",
        schritte: [{ id: "gefunden", name: "Gefunden" }], ergebnisWort: "Zusammengesetzt",
        win:  { items: ["segen"] },
        lose: { packs: 0 },
        fluch: "Der Quest Master gibt dir einen Tipp zum Knobelspiel.",
        einsetzbar: ["spruchrolle"] }
    ],

    /* Log-Buch (Quest 1, für Dennis „Rikes Tagebuch“): Rike beantwortet sieben Fragen über Dennis per Sprachnachricht.
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

    /* Finale (29.09.): Nach der Prüfung des Bundes kommen Siegbildschirm, die Geschichte als Laufschrift wie im Kino
       und der Abspann (etwa 45 s), der bei THE END mit dem Code stehen bleibt. Hier stehen alle Namen und Texte.
       In der Geschichte keine Gedankenstriche. Ein leerer questMaster lässt die Zeile weg. */
    abspann: {
      held: "Dennis",
      questMaster: "Bene",
      bund: ["Bene", "Fabio"],
      dank: ["Rike"],
      drehort: "Tegernsee und die Neureuth, 1261 m",
      fortsetzung: "Episode II · Die Hochzeit",
      geschichte: {
        vorlange: "Vor langer Zeit, in einem Tal gar nicht so weit entfernt …",
        episode: "EPISODE I",
        titel: "DIE LETZTEN PRÜFUNGEN",
        absaetze: [
          "Es ist eine Zeit großer Gefühle. Der tapfere Held DENNIS hat das Herz von RIKE gewonnen, und sie hat seines schon lange. Der Tag, an dem die beiden sich das Ja-Wort geben, rückt unaufhaltsam näher.",
          "Doch ein uraltes Gesetz der Junggesellen verlangt, dass kein Held vor den Altar tritt, ehe er sich in den Bergen bewiesen hat. Die finsteren Ritter BENE und FABIO haben dafür zehn Prüfungen ersonnen, und sie kennen keine Gnade.",
          "Bewaffnet mit einer Wasserspritze, dem Mut eines Piraten und einer Fee, die Rike ihm zur Seite schickte, zog Dennis vom Tegernsee hinauf zum Gipfel der Neureuth, um sich als würdig zu erweisen …"
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
