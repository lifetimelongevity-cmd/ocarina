# Umbauplan: Das Menü auf das Niveau des Startbildschirms

Stand 24.09.2026. **Freigegeben und im Entwurf gebaut** (Stufen 1 bis 5, Stufe 6 ohne Bilder, Stufe 7 im Browser geprüft, siehe Abschnitt 12). Die App unter der Hauptadresse ist unverändert. Baut auf `06-design-plan.md` auf: Seiten, HUD, Nebel, Texte und Logik bleiben, wie sie dort stehen. Dieser Plan ändert nur **Optik, Bewegung und Übergänge**. Geprüft am Entwurf (`app/entwurf.html?demo`) in iPhone SE und iPhone 15 quer.

---

## 1. Befund: zwei verschiedene Spiele

Der Startbildschirm sieht aus wie ein neues Zelda. Tippt Dennis auf PRESS START, landet er in einem Menü von 1998.

| | Startbildschirm | Menü heute |
|---|---|---|
| Stil | gemaltes 3D-Bild, weiches Licht, Tiefe | flache olivgrüne Steinplatte, blaue N64-Tafeln |
| Hintergrund | der Wald, hell und lebendig | Pixelbild eines Bergpfads bei 40 % Helligkeit, wirkt schwarz |
| Schrift | Hylia Serif, dazu das goldene Logo | Georgia, Courier New und Trebuchet gemischt |
| Farben | Waldgrün, Gold, Feenlicht | Oliv, N64-Blau, Signalgelb |
| Symbole | gerendertes Schild und Schwert im Logo | flache Vektorzeichen |
| Dennis | als Link | als Wanderer mit Rucksack, anderer Stil (`dennis-v9.png`) |
| Bewegung | fließend: Licht, Fee, Glühwürmchen | ruckelt absichtlich: Drehung in 9 Stufen, Blinken in 2 Stufen |

Im Detail aufgefallen:

1. **Kein Übergang.** Nach PRESS START ist der Wald weg, die Steinplatte ist einfach da.
2. **Punktraster über allem.** Der N64-Filter (`.dither`) liegt auch über dem Titelbild und macht es körnig.
3. **Seitentitel** wie QUESTS sind dunkel in die Platte geprägt und schwer zu lesen.
4. **HUD in drei Stilen:** zehn winzige Karten (13 × 18 px, leere gestrichelt), eine blaue Leiste mit Schreibmaschinenschrift, graue Zahlenkästchen.
5. **Z- und R-Tasten** sind graue Metallkeile, das Auffälligste am ganzen Rahmen, und kosten links und rechts je bis zu 42 px.
6. **Quest-Karte:** zwischen Text und Sieg/Niederlage klafft ein Loch von etwa einem Drittel der Höhe.
7. **Auswahl** ist ein gelbes Rechteck. Funktioniert, sieht aber nach Tabelle aus.
8. **Ausrüstung:** Der Beutel ist als Beutel nicht zu erkennen, das Schwert (noch nicht erspielt) ist dunkel auf dunkel fast unsichtbar, das Schild steht allein und schief unter dem Token.
9. **Karte:** flache Hügel aus Vektorflächen, der Nebel ist ein weißer Balken am rechten Rand, Dennis' Kopf ist 26 px groß und im Wanderer-Stil.
10. **Ergebnis-Fenster:** schwarze Box mit Goldrand, auf dem iPhone 15 gut die Hälfte der Breite. Für den wichtigsten Moment des Spiels zu klein und zu nüchtern.
11. **Töne:** Rechteck-Piepser wie ein alter Taschenrechner, die Fanfaren sind dünn.

Was schon gut ist und bleibt: Aufbau und Größen aus 06 (Lesbarkeit im Querformat), Nebel-Logik, Medaillonfarben, Texte, drehendes Medaillon im Ergebnis, die Melodien als Idee.

---

## 2. Leitidee: Das Menü spielt im selben Wald

- **Das Titelbild bleibt der Hintergrund.** Nach PRESS START fliegt die Kamera weiter den Weg hinein, das Bild wird unscharf und dunkler, die Glühwürmchen treiben weiter. Darüber erscheinen die Menüplatten. Ein Ort, kein Bruch.
- **Die Fee kommt mit und ist der Cursor**, wie Navi in Ocarina of Time. Sie fliegt zu allem, was Dennis antippt, und zieht Feenstaub hinter sich her. Der Code dafür (Fee, Feenstaub) existiert schon vom Startbildschirm.
- **Gold aus dem Logo** wird die Linie, die alles zusammenhält: Rahmen, Titel, Auswahl, gewonnene Dinge.

So sehen auch die neuen Zelda-Menüs aus: Die Welt bleibt unscharf sichtbar, darüber dunkle, leicht durchsichtige Platten mit feinen Goldlinien, große Symbole, kurze weiche Bewegungen.

---

## 3. Bausteine

### 3.1 Farben, aus dem Titelbild gemessen

| Name | Wert | Stelle im Titelbild | Wofür |
|---|---|---|---|
| Waldnacht | `#07120d` | tiefster Schatten im Wald | Grund der Platten, 75 % deckend |
| Moos | `#173723` | Laub im Schatten | Zeilen, Felder |
| Dunst | `#8caea4` | Dunst über dem Weg | Nebenschrift, Nebel, Verdecktes |
| Pergament | `#ece4c4` | Licht auf dem Weg | Fließtext |
| Gold hell | `#f6dc7a` | Glanzkante im Logo | Titel, Auswahl, Gewonnenes |
| Gold | `#e6bb38` | Buchstaben im Logo | Linien, Zahlen |
| Gold dunkel | `#9f7211`, `#593d09` | Kanten im Logo | Rahmen, Prägung |
| Rot | `#a4191d`, als Schrift `#ef5a4c` | roter Vogel auf dem Schild | Verloren, Verlust |
| Feenlicht | `#d9ccff` | die Fee | Cursor, Feenstaub |

Fällt weg: N64-Blau, Oliv, Signalgelb. Die sechs Medaillonfarben aus 06 Abschnitt 5 bleiben.

Farbregeln: **Gold** = gewonnen, **Rot** = verloren, **Feenlicht** = ausgewählt, **Goldschimmer, der atmet** = jetzt dran, **Dunst** = im Nebel.

### 3.2 Schrift

- **Hylia Serif** (liegt schon im Projekt) für alles, was Titel ist: Seitennamen, Quest-Namen in der Karte, Item-Namen, Ergebnis-Titel, Zahlen im HUD. Gold mit Verlauf und dunkler Kante wie das Logo.
- **Systemschrift des iPhones** für Fließtext. Klar, gut lesbar, lädt nichts.
- Courier New, Georgia und Trebuchet fallen weg.
- **Lücke:** Hylia Serif hat keine Umlaute und kein ß (geprüft: Ä Ö Ü ä ö ü ß fehlen). AUSRÜSTUNG, Prüfung des Bundes und Auge des Jägers brauchen sie. Ich baue Ä Ö Ü ä ö ü als Buchstabe mit zwei Punkten in die Schrift ein, ß wird in Großbuchstaben zu SS. Ohne das würde das Ü in einer anderen Schrift erscheinen.

### 3.3 Platten

- Dunkles, leicht durchsichtiges Glas (Waldnacht) über dem unscharfen Titelbild, der Wald schimmert durch.
- Innen eine feine Goldlinie, oben in der Mitte ein kleines Schmuckstück (Triforce oder Raute), in den Ecken feine Ornamente wie am Schild im Logo.
- Weicher Schatten statt harter N64-Kante. Kein Punktraster mehr, auch nicht über dem Startbildschirm.
- Für die Leistung auf dem iPhone: Das unscharfe Titelbild wird einmal vorgerechnet (eigene kleine Datei), nicht jede Platte rechnet eigene Unschärfe.

### 3.4 Auswahl

- Statt gelbem Rechteck: vier goldene Eckklammern, die leicht atmen, dazu ein sanftes Leuchten.
- **Die Fee** schwebt neben der Auswahl, fliegt beim Antippen in einem kurzen Bogen hinüber (etwa 0,35 s) und hinterlässt Feenstaub. Beim Seitenwechsel fliegt sie mit.

### 3.5 Symbole: gerendert statt flach

- **Medaillons** wie Münzen: Goldrand mit Glanz, farbige Emaille in der Mitte, das Weisen-Zeichen geprägt. Gewonnen: Lichtreflex, der ab und zu darüber streicht. Verdeckt: dunkles Metall mit „?", leicht im Dunst.
- **Steine** (Sidequests) als geschliffene Kristalle mit Lichtkante, gewonnen in Glühwürmchen-Grün.
- **Items und Fähigkeiten** mit Verläufen, Glanzlicht und Kante, so dass sie wie Gegenstände wirken. Der Beutel wird ein Lederbeutel, das Schwert erinnert an das Schwert im Logo.
- **Pack-Karten** als kleine glänzende Spielkarten mit Goldrand. Leere Plätze als blasser Umriss, nicht gestrichelt.
- **Zahlenräder** des Codes als Messingräder mit Ziffern in Hylia Serif.
- Alles als Vektor in Code. Optional ersetzen Bilder des Nutzers die Symbole (Abschnitt 8).

### 3.6 Bewegung

- Weich und kurz: 150 bis 300 ms, auslaufend. Alle ruckelnden Stufen-Animationen fallen weg.
- Ruhige Dauerbewegung nur im Hintergrund: Glühwürmchen, Lichtstrahl, die Fee. Im Menü weniger als auf dem Startbildschirm, damit nichts vom Lesen ablenkt.
- „Bewegung reduzieren" am iPhone: alles steht, die Fee sitzt still neben der Auswahl.

### 3.7 Ton

- Menü: weiches Glöckchen statt Piepser beim Tippen, leiser Luftzug beim Seitenwechsel.
- Fanfaren mit zweiter Stimme und etwas Hall, damit sie voller klingen. Weiter eigene Tonfolgen, keine Musik aus dem Spiel.

---

## 4. Übergang: vom Startbild ins Menü

1. Tippen auf PRESS START: kurzer heller Lichtblitz, Glöckchen.
2. Die Kamera fährt den Weg hinein (etwa 0,7 s), das Bild wird unscharf und dunkler.
3. Die Fee löst sich von ihrem Platz und fliegt zur nächsten Quest.
4. HUD und Platten blenden nacheinander ein, von oben nach unten.

Zurück zum Startbildschirm gibt es nicht, wie bisher.

---

## 5. Rahmen: HUD und Navigation

```
 ▰▰▰▱▱▱▱▱▱▱ 3        ═══  ◆ Schnick Schnack Schnuck  ═══         Code 7 4 2 ?
                    ‹ KARTE     Q U E S T S     AUSRÜSTUNG ›
 ┌──────────────────────────────┐ ┌───────────────────────────────────────┐
 │  Liste                       │ │  Quest-Karte                          │
 └──────────────────────────────┘ └───────────────────────────────────────┘
                              Titelbild unscharf, Glühwürmchen
```

- **Oben links, Packs:** die Karten etwas größer und glänzend, leere Plätze blass. Neue Karten fliegen aus dem Ergebnis-Fenster hierher.
- **Oben Mitte, nächste Quest:** wie ein Ortsname in Zelda. Name in Hylia Serif, davor Medaillon oder Stein, links und rechts feine Goldlinien, die ausblenden. Keine blaue Leiste mehr.
- **Oben rechts, Code:** Schloss und vier Messingräder. Neue Ziffer dreht sich ein.
- **Seitenleiste statt Z und R:** darunter die drei Seitennamen, die aktive groß und in Gold, die Nachbarn klein und blass mit Pfeil. Tippen auf den Nachbarn oder Wischen wechselt. Die Metallkeile entfallen, das Menü gewinnt gut 80 px Breite.
- **Seitenwechsel:** Die Seite gleitet weich zur Seite, der Hintergrund bewegt sich leicht mit (Tiefe). Die ruckelnde Prisma-Drehung entfällt (Entscheidung 2).
- **Unten:** „Stand 13:05" klein und blass. Die Demo-Knöpfe als kleine Glasknöpfe.

---

## 6. Die Seiten

### 6.1 QUESTS

- **Liste:** Zeilen als dunkle Glasstreifen, Medaillons und Steine im neuen Stil, Haken und X in Gold und Rot. Die JETZT-Zeile schimmert golden. „Noch 2 Prüfungen" liegt in echtem, langsam ziehendem Dunst.
- **Quest-Karte:** oben groß das Medaillon, daneben Name in Hylia Serif und Ort. Im Hintergrund der Karte das Zeichen des Medaillons riesig und kaum sichtbar als Wasserzeichen. Das füllt das Loch und sagt sofort, welche Prüfung das ist.
- **Einsatz** als zwei Felder nebeneinander: SIEG mit goldenem Rand, NIEDERLAGE mit rotem. Was nicht eingetreten ist, wird blass.

### 6.2 AUSRÜSTUNG

- **Mitte:** Dennis als Link (neues Bild, Abschnitt 8) steht in einem weichen Lichtkegel, Glühwürmchen um ihn herum. Bis das Bild da ist, bleibt der Wanderer, aber ohne schwarzen Kasten.
- **Links ITEMS** im Raster 2 × 2.
- **Rechts FÄHIGKEITEN** als Dreieck angeordnet wie das Triforce: Token oben, Schwert und Schild darunter. Behebt das schiefe Schild und passt zum Zelda-Thema.
- **Felder:** abgerundetes dunkles Glas mit Goldhaarlinie. Im Beutel: Symbol leuchtet. Noch nicht: Schattenriss mit blassem Umriss (06 Entscheidung 6). Verloren: grau, gesprungen, rotes X.
- **Textbox unten:** Glas statt Blau, Name in Hylia Serif, Symbol groß links.

### 6.3 KARTE

- **Karte als Gemälde** im Stil des Titelbilds (Bild vom Nutzer, Abschnitt 8): Tegernsee, Weg durch Wiese und Wald, Gipfel, Hütte. Ohne Bild: die Vektorkarte bekommt Papierstruktur, Höhenlinien, gezeichnete Bäume und einen gemalten Rand.
- **Weg:** bis „Du bist hier" als leuchtende goldene Punktlinie, danach blass.
- **Nebel:** echte, langsam ziehende Nebelschwaden statt weißem Balken. Wenn eine Quest aus dem Nebel tritt, reißt er an der Stelle auf.
- **Du bist hier:** Dennis' Kopf als Link im Goldring, die Fee kreist darüber.
- Ortsnamen in Hylia Serif mit dunklem Schein, gut lesbar auf dem Bild.

---

## 7. Ergebnis als Vollbild-Moment

Der wichtigste Moment des Spiels bekommt den ganzen Bildschirm, wie ein Item-Fund in Zelda:

1. Das Menü tritt zurück: dunkler und unschärfer.
2. Von oben fällt ein Lichtstrahl (derselbe wie auf dem Startbildschirm).
3. Das Medaillon dreht sich groß in die Mitte, etwa ein Drittel der Bildschirmhöhe, und sprüht Funken in seiner Farbe (der Feenstaub-Code in Medaillonfarbe).
4. Darunter ein Band in Hylia Serif: **PRÜFUNG BESTANDEN**, darunter der Name der Quest.
5. Die Folgen erscheinen nacheinander als große Symbole. Gewonnene Packs **fliegen danach ins HUD** und landen auf ihrem Platz, eine neue Ziffer dreht sich ins Zahlenrad. So sieht Dennis, wo das Gewonnene hingeht.
6. **Verloren:** Das Bild wird kurz entsättigt, das Medaillon fällt grau herab und bekommt einen Sprung, ein roter Schimmer am Rand, der abfallende Ton.
7. Tippen schließt, die Fee fliegt zur nächsten Quest, die aus dem Nebel tritt (wie in 06 Abschnitt 4.5).

Buchungen ohne Quest (Steckbrief, Bonus, Ziffer gekauft) und die Fenster zu Packs und Code bekommen dieselbe Optik in klein: Glasplatte, Goldrand, ohne Lichtstrahl.

---

## 8. Bilder vom Nutzer: der größte Sprung

Code allein bringt das Menü weit. Den Abstand zum Titelbild schließen aber erst Bilder im selben Stil. Das Titelbild als Vorlage mitgeben, dann passt der Stil. Freistellen und Zuschneiden mache ich.

| Bild | Wofür | Vorgabe |
|---|---|---|
| **1. Dennis als Link von vorn** (wichtigstes) | Ausrüstung Mitte, Kopf auf der Karte | ganzer Körper, stehend, leicht gedreht, gleiche Kleidung wie im Titelbild (Mütze, Tunika, Schild auf dem Rücken, Okarina in der Hand), gleicher Render-Stil, ruhiger dunkler Hintergrund, Hochformat |
| **2. Karte als Gemälde** | Seite KARTE | gemalte Fantasy-Landkarte, Blick schräg von oben, unten links der Tegernsee, ein Weg durch Wiese und Wald hinauf zum Gipfel der Neureuth, rechts daneben ein Berggasthaus, warmes Licht, **ohne Schrift**, Querformat 2 : 1 |
| 3. Sieben Item-Symbole (Kür) | Felder der Ausrüstung | jedes einzeln, gleiches Licht, dunkler Hintergrund: Lederbeutel, große Wasserpistole, Seilring, Spielkarten in Schutzhüllen, goldene Münze mit Stern, Schwert, Schild |

Die Medaillons baue ich im Code, damit alle sechs exakt zusammenpassen.

---

## 9. Was bleibt, was geht

| Bleibt | Geht |
|---|---|
| Startbildschirm unverändert | Steinplatten in Oliv, Ocker, Graugrün |
| Aufbau aus 06: drei Seiten, HUD, Ergebnis-Fenster | blaue N64-Tafeln |
| Nebel-Logik, Texte, Medaillonfarben | Punktraster (`.dither`) |
| Größen und Tippflächen aus 06 Abschnitt 7 | Z- und R-Metallkeile |
| `config.js`, `engine.js`, `store.js`, Admin | Courier New, Georgia, Trebuchet |
| Melodien als Grundlage | ruckelnde Stufen-Animationen, Pixel-Bergpfad als Hintergrund |

---

## 10. Bauplan in Stufen

Jede Stufe landet in `app/entwurf.html`. Die App unter der Hauptadresse bleibt unverändert, bis du den Entwurf übernimmst (06 Abschnitt 10). Nach jeder Stufe kannst du live schauen und umlenken.

| Stufe | Inhalt | Wirkung |
|---|---|---|
| 1. Fundament | Titelbild unscharf als Hintergrund, Glasplatten, Farben, Hylia Serif mit Umlauten, Punktraster und Ruckeln weg | größter Sprung auf einen Schlag |
| 2. Rahmen | HUD neu, Seitenleiste statt Z und R, weicher Seitenwechsel | was immer zu sehen ist |
| 3. Symbole | Medaillons, Steine, Items, Karten, Zahlenräder im neuen Stil | überall sichtbar |
| 4. Übergang und Fee | Kamerafahrt nach PRESS START, Fee als Cursor, Glühwürmchen im Menü | verbindet Start und Menü |
| 5. Ergebnis | Vollbild-Moment, Packs fliegen ins HUD, vollere Fanfaren | der wichtigste Moment |
| 6. Seiten | Quest-Karte mit Wasserzeichen, Ausrüstung im Triforce, Karte mit echtem Nebel, dazu deine Bilder | Feinschliff |
| 7. Prüfen | vier Handygrößen, Nebel-Test in 14 Spielständen, Bewegung reduziert, Leistung auf dem iPhone | Sicherheit |

Stufen 1 bis 5 sind der Kern und gehen ohne neue Bilder. Stufe 6 wird mit deinen Bildern richtig gut. Bis zum JGA am 2. Oktober ist das machbar, der Test mit zwei echten Handys (offener Punkt 2) sollte danach noch Platz haben.

---

## 11. Entscheidungen (24.09.)

1. **Richtung „neues Zelda"** statt N64-Steinplatte: ja.
2. **Seitenwechsel:** gleiten.
3. **Fee als Cursor:** ja.
4. **Seitenleiste oben** statt Z und R: ja. Auf dem Laptop gehen Z und R weiter über die Tastatur.
5. **Bilder** (Abschnitt 8) kommen nachträglich. Bis dahin steht der Wanderer in der Ausrüstung und die Karte ist im Code gezeichnet.
6. Offene Entscheidungen aus 06 Abschnitt 9: noch nicht beantwortet.

---

## 12. Gebaut (24.09.)

Alles in `app/entwurf.html`, `entwurf.css`, `entwurf.js`. `config.js`, `engine.js`, `store.js` und der Admin sind unverändert.

- **Stufe 1:** Hintergrund ist das Titelbild, vorgerechnet unscharf (`assets/menue-wald.webp`, 12 KB). Glasplatten mit Goldlinie, Ecken und Stein oben. Farben aus 3.1. Hylia Serif für alle Titel, Fließtext in der Systemschrift. Umlaute, ß (als SS), · und − sind in `assets/hylia-serif.woff2` ergänzt. Punktraster und Stufen-Animationen sind weg.
- **Stufe 2:** HUD mit glänzenden Karten, Ortsname der nächsten Quest mit Medaillon, Schloss und Messingrädern. Seitenleiste mit den drei Namen, die Seiten gleiten, der Wald dahinter wandert leicht mit.
- **Stufe 3:** Medaillons als Münzen (Goldrand, Emaille, geprägtes Zeichen, Glanz bei großen gewonnenen), Steine als Kristalle, alle sieben Items neu gezeichnet. Noch nicht erspielt: Schattenriss mit Goldumriss. Verloren: grau mit rotem X.
- **Stufe 4:** PRESS START blitzt, die Kamera fährt den Weg hinein und geht in den unscharfen Wald über, die Fee fliegt zur nächsten Quest und bleibt Cursor mit Feenstaub. Glühwürmchen hinter den Platten. Menütöne als Glöckchen und Luftzug.
- **Stufe 5:** Nach einer Quest Vollbild mit Lichtstrahl, großem Medaillon, Strahlenkranz und Funken in seiner Farbe, Band in Hylia Serif. Gewonnene Packs fliegen ins HUD, eine neue Ziffer dreht sich im Zahlenrad ein. Verloren: Bild wird grau, Medaillon fällt und bekommt einen Riss, roter Rand. Fanfaren mit Begleitung und Hall. Das Fenster lässt sich erst nach 0,65 s wegtippen.
- **Stufe 6 ohne Bilder:** Quest-Karte mit großem Zeichen als Wasserzeichen und Einsatz in zwei Feldern (Sieg gold, Niederlage rot). Fähigkeiten im Triforce-Dreieck, Dennis im Lichtkegel. Karte auf Papier mit Höhenlinien und Bäumen, gegangener Weg in Gold, ziehende Nebelschwaden.
- **Stufe 7, geprüft mit Chromium:** vier Größen (iPhone SE und 15 in Safari, 15 und Pro Max vom Home-Bildschirm), je 14 Spielstände vom Start bis zum Ende, alle Quests, Stationen und Items angetippt. Kein Name einer verdeckten Quest auf einer Seite, im Ergebnis- oder Code-Fenster. Keine Tafel läuft über. Kleinste Schrift 10,5 px. Keine Fehler in der Konsole. Dasselbe mit „Bewegung reduzieren". `node app/engine.test.js` grün.

Offen: deine zwei Bilder (Abschnitt 8), Test auf einem echten iPhone in Safari (vor allem Unschärfe, additive Fee, Ton), dann Übernahme in die App nach 06 Abschnitt 10.
