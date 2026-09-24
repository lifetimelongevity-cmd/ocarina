# Design-Plan: Dennis' Menü von A bis Z

Stand 23.09.2026. **Vorschlag, noch nicht gebaut.** Entschieden: Dennis sieht nur Erledigtes und die nächste Quest (Abschnitt 3.1). Die App (`app/index.html`) ist unverändert. Zum Ansehen gibt es einen klickbaren Entwurf als eigene Seite:

- `app/entwurf.html?demo` zeigt den Beispielstand aus `05-system-plan.md` A9. Unten sind Demo-Knöpfe (nächste Quest bestanden, verloren, zurück), ohne Datenbank.
- `app/entwurf.html?demo=start` und `?demo=ende` zeigen Anfang und Ende des Tages.
- `app/entwurf.html` ohne Zusatz liest den echten Stand aus Firebase und schreibt nichts.

Der Entwurf nutzt `config.js`, `engine.js` und `store.js` unverändert. Neue Inhalte (Texte, Farben, Kartenpunkte) stehen vorerst oben in `app/entwurf.js` und wandern beim Bauen nach `config.js`.

---

## 1. Befund: Was heute nicht passt

### 1.1 Querformat, gemessen

| | iPhone SE, Safari | iPhone 15, Safari | iPhone 15, Home-Bildschirm |
|---|---|---|---|
| Menüfläche am Bildschirm | 47 % | 44 % | 51 % |
| kleinste Texte (Code, Stand, Avatar) | 8,2 bis 8,6 px | 9,1 bis 9,6 px | 10,5 bis 11 px |
| Beschriftung der Karte | ca. 6 px | ca. 7 px | ca. 8 px |
| Sidequest-Steine (Tippfläche) | 26 × 22 px | 29 × 24 px | 33 × 28 px |

Ursachen:

- Das ganze Menü ist eine feste Box im Format 19,5:9, die wie ein Bild skaliert wird. Wird der Bildschirm kleiner, schrumpft alles mit, statt den Platz zu nutzen.
- Um das Menü herum liegt viel Rahmen: Herzen, großer Vollbild-Knopf, große Z- und R-Tasten, Prompt-Leiste, Rubin-Zähler. Das eigentliche Menü bekommt nur die Mitte.
- Die Karte ist eine Grafik im Format 500:275 in einem breiten Feld. Sie wird links und rechts aufgefüllt, ihre Schrift schrumpft auf 6 bis 8 px.
- Hochformat: eine kleine 4:3-Box mitten im Bildschirm.

### 1.2 Seiten und Logik

- **QUEST STATUS** zeigt sechs Medaillons und sieben Steine ohne Namen. Welches Medaillon welche Prüfung ist, sieht man nicht. Die Ziffern stehen als Noten, die Zähler (6, 2, 8/13) sind nicht erklärt.
- **EQUIPMENT** und **SELECT ITEM** zeigen dieselben sieben Items zweimal.
- **Packs** stehen doppelt da: als Herzen oben links und als Rubin (Raute) unten links.
- Beschreibungen erscheinen nur als Einblendung für vier Sekunden.
- Das **Ergebnis einer Buchung** erscheint als kurze Zeile für knapp drei Sekunden. Der wichtigste Moment (Dennis sieht, was er gewonnen oder verloren hat) ist der schwächste.
- Die nächste Quest ist nur auf QUEST STATUS als blinkender Ring zu erkennen.

---

## 2. Von der Spielanleitung zum Menü

Die Spielanleitung sagt in §1: Am Ende zählen drei Dinge, **Packs, Code und Inventar**. Dazu kommt der Weg dorthin, die **13 Quests** in fester Reihenfolge. §2 verlangt: Kästchen, Stand und Inventar sind **jederzeit sichtbar**.

Daraus folgen die Fragen, die Dennis sich unterwegs stellt. Jede Frage bekommt genau einen Ort:

| Dennis fragt | Antwort | Ort |
|---|---|---|
| Was ist als Nächstes dran? | Name, Ort, Beschreibung, was auf dem Spiel steht | Seite **QUESTS** (Startseite), dazu oben in der Mitte |
| Wie viele Prüfungen gibt es noch? Wo bin ich? | Weg mit Stationen, Zähler, „Du bist hier" | Seite **KARTE** |
| Was habe ich dabei, was kann es? | Items und Fähigkeiten mit Wirkung | Seite **AUSRÜSTUNG** mit Avatar |
| Wie steht es ums Kästchen? | Packs und Code | **HUD**, immer sichtbar |
| Was ist gerade passiert? | Ergebnis nach jeder Buchung | **Ergebnis-Fenster** |

---

## 3. Aufbau

```
        Z ◂                                              ▸ R
   KARTE  ◂──────────▸  QUESTS  ◂──────────▸  AUSRÜSTUNG
   wo bin ich            was ist dran           womit
                         (Startseite)
```

- **Drei Seiten im Ring.** Wechsel mit Z und R, durch Wischen oder durch Tippen auf den Nachbarnamen in der Titelzeile. Die Drehung aus dem Original bleibt, jetzt als Dreieck (120° je Seite).
- **HUD oben:** links die Packs als Spielkarten, Mitte die nächste Quest, rechts der Code als Zahlenschloss. Tippen auf Packs oder Code erklärt sie. Tippen auf die nächste Quest springt zur Quest-Seite.
- **Fällt weg:** QUEST STATUS (aufgeteilt auf Quests und Karte), SELECT ITEM (doppelt), Herzen und Rubin (ersetzt durch die Karten), die Prompt-Leiste unten (Erklärungen stehen jetzt in der Seite).
- **Bleibt:** Startbildschirm, Hintergrund, Steinplatten in eigener Farbe je Seite, die blauen N64-Tafeln (jetzt als Textbox), Z- und R-Tasten, Drehung, Töne, Avatar.

### 3.1 Was Dennis sieht: nur die nächste Quest (entschieden am 23.09.)

Dennis sieht, was erledigt ist, und die nächste Quest. Alles danach liegt **im Nebel**. Jede Quest tritt aus dem Nebel, sobald die vorige entschieden ist. Gespeichert wird dafür nichts Neues: sichtbar ist eine Quest, wenn sie bestanden oder verloren ist oder die nächste ist.

| | Dennis sieht |
|---|---|
| Erledigte Quests | Name, Ergebnis, Beschreibung, Einsatz |
| Nächste Quest | Name, Ort, Beschreibung, Einsatz, was hilft |
| Kommende Prüfungen | nur als verdecktes Medaillon mit „?". Ihre Zahl ist bekannt („Noch 2 Prüfungen"), weil die Karte zeigen soll, wie viele Prüfungen noch kommen |
| Kommende Sidequests | gar nicht, auch nicht ihre Zahl. Sie tauchen auf, wenn sie dran sind, wie gezogene Begegnungen in der Spielanleitung §6 |
| Items | alle Felder, noch nicht erspielte als dunkler Umriss. Kein Hinweis auf verdeckte Quests („Wo es das gibt, zeigt sich unterwegs") |
| Code | Herkunft einer Ziffer nur bei aufgedeckten Prüfungen, sonst „noch im Nebel" |

Grenze: Die Namen aller Quests und der Code stehen in `config.js`, das jedes Handy lädt. Wer den Quelltext öffnet, sieht alles. Für den Code lohnt eine Lösung vor dem Spieltag (offener Punkt in `CLAUDE.md`).

---

## 4. Die Seiten

### 4.1 QUESTS (Startseite)

- **Links die Liste**: die erledigten Quests in Spielreihenfolge, dann die nächste. Prüfungen mit Medaillon und fetter Schrift, Sidequests mit Stein. Rechts in jeder Zeile: goldener Haken (bestanden), rotes X (verloren), JETZT (nächste Quest). Als letzte Zeile „Noch 2 Prüfungen" mit verdecktem Medaillon. Darüber nur Symbol und Zahl: Medaillon 4/6, Stein 4. Die Liste scrollt von selbst zur nächsten Quest.
- **Rechts die Quest-Karte** der gewählten Quest, beim Öffnen immer die nächste:
  - Name, Status, Art und Ort
  - Beschreibung im Spielton (Abschnitt 6)
  - **Hilft dir hier:** welche Items bei dieser Quest wirken, mit Stand (im Beutel, fehlt, verloren). Nur bei Auge des Jägers und Prüfung des Bundes. So wird die Verzahnung aus §2 der Spielanleitung sichtbar.
  - **Einsatz:** Sieg und Niederlage als Symbole (Karte +1, Zahlenrad Ziffer 2, Item, Item weg). Was nicht eingetreten ist, wird blass.

### 4.2 KARTE

- **Links die Karte** vom Tegernsee zur Neureuth mit sechs Stationen: Zug, Wiese, Wald, Aussicht, Gipfel, Hütte. Der Weg und die Ortsnamen sind immer sichtbar, ihr lauft ihn ja. An jeder Station das Medaillon ihrer Prüfung, verdeckt mit „?", solange sie im Nebel liegt. Steine nur für erledigte Sidequests und die nächste. Dennis' Kopf zeigt „Du bist hier" (Station der nächsten Quest). Ab der Mitte zur nächsten Station liegt Nebel über dem Weg.
- **Rechts der Fortschritt:** sechs Medaillons (PRÜFUNGEN 4/6, verdeckte mit „?"), die Steine der erledigten Sidequests (SIDEQUESTS 4). Darunter die gewählte Station mit ihren sichtbaren Quests und denselben Zeichen wie in der Liste. Eine Station im Nebel sagt nur „Im Nebel".
- Beschriftungen sind Text im Menü, keine Grafik. Sie schrumpfen nicht mehr mit.

### 4.3 AUSRÜSTUNG

- **Mitte:** Avatar, ohne Beschriftung.
- **Links ITEMS:** Beutel, Pistole, Großer Ring, Karten (Gegenstände für Geschicklichkeit).
- **Rechts FÄHIGKEITEN:** Token, Schwert, Schild (Regeln im Showdown). Die Trennung folgt §4.3 der Spielanleitung.
- **Unten die Textbox:** Name, Stand, Wirkung und je nach Lage „Zu holen bei Kartenwurf", „Verloren bei Auge des Jägers" oder „Vorsicht: Feuerprobe kann es dir nehmen". Diese Hinweise erscheinen nur, wenn die genannte Quest schon sichtbar ist, sonst nichts. Beim Öffnen ist das zuletzt erhaltene Item gewählt. Unter den Feldern steht kein Name, den zeigt die Textbox.

### 4.4 HUD

| Stelle | Inhalt | Tippen |
|---|---|---|
| oben links | eine Karte je Pack im Kästchen (bei `max` über 10 zwei Reihen wie Herzen), gefüllt = deins, gestrichelt = noch beim Bund, dazu die Zahl | erklärt die Packs |
| oben Mitte | Name der nächsten Quest, am Ende „Zum Kästchen" | springt zur Quest-Seite |
| oben rechts | Schloss mit vier Zahlenrädern, unbekannt = ? | zeigt jede Ziffer mit Herkunft (bei verdeckten Prüfungen „noch im Nebel") und Preis am Kästchen |
| unten rechts | „Stand 13:05" oder „Offline · Stand 13:05" | |

### 4.5 Ergebnis-Fenster

Bucht der Quest Master etwas, erscheint bei Dennis ein Fenster wie beim Item-Fund in Ocarina of Time. Nach einer entschiedenen Quest ist es **der große Moment** des Spiels:

- Kopf: Medaillon oder Stein, **PRÜFUNG BESTANDEN** (gold) oder **SIDEQUEST VERLOREN** (rot), Name der Quest.
- Gewonnen: Das Medaillon dreht sich ins Bild, dahinter gehen Strahlen auf und es leuchtet nach. Verloren: Es fällt grau mit rotem X herab.
- Dazu eine kurze Melodie: Fanfare bei einer Prüfung, kürzere bei einer Sidequest, abfallend bei Verlust. Eigene Tonfolgen, keine Musik aus dem Spiel.
- Zeilen erscheinen nacheinander: „+1 Pack", „Ziffer 2: 4", Item-Name, „Große Wasserpistole weg". Ohne Folgen steht „Keine Folgen".
- Die nächste Quest steht **nicht** im Fenster. Auch das HUD zeigt bis dahin „?". Tippen schließt, das Menü dreht zur Quest-Seite und die nächste Quest **tritt aus dem Nebel**: Die Zeile wird scharf, der Nebel zieht ab, ein kurzer Ton. Erst dann steht ihr Name im HUD. Nach der letzten Quest steht im Fenster „Zum Kästchen".
- Buchungen ohne Quest (Steckbrief, Bonus, Ziffer gekauft) zeigen Grund und Folge, ohne Drehen und Strahlen. Zurückstellen und Löschen aktualisiert still, ohne Fenster.
- Neue Karten und Ziffern blinken im HUD kurz auf.
- Wer „Bewegung reduzieren" eingestellt hat, sieht alles ohne Animation.

### 4.6 Startbildschirm und Hochformat

- **Startbildschirm: Titelbild vom Nutzer** (24.09.): Dennis als Link von hinten auf dem Waldweg, daneben die Fee, rechts das Logo THE LEGEND OF DENNIS · A LINK TO RIEKE mit Schild und Schwert (`app/assets/intro-titel.webp`). **PRESS START** blinkt unter dem Logo, auf Höhe von Dennis' Stiefeln, in der Schrift Hylia Serif. Tippen irgendwo startet.
- **Leicht belebt:** Das Licht oben pulsiert, schräge Lichtstrahlen wie im Bild werden heller und dunkler und wandern ein wenig, der Lichtfleck auf dem Weg atmet. Die Fee ist aus dem Bild gelöst (`intro-fee.png`) und schwebt in einer ruhigen Acht, unter ihr rieselt funkelnder Feenstaub. Glühwürmchen blinken am Rand, nie über Logo, Gesicht oder PRESS START, im Lichtstrahl treibt Staub. Dazu ein langsamer Kamera-Zoom von 3 %. Alles läuft nur, solange der Startbildschirm zu sehen ist. Wer „Bewegung reduzieren" eingestellt hat, sieht das stille Bild.
- **Zuschnitt:** Das Bild ist 16 : 9, Handys quer sind breiter. Es füllt den Bildschirm, abgeschnitten wird oben etwas mehr als unten, Schwertspitze und Stiefel bleiben sichtbar.
- **Schriften von zeldauniverse.net:** PRESS START in **Hylia Serif**, die Zeichen auf den Medaillons aus **Hylian Symbols** (als Vektorpfad eingebaut). Herkunft und Bedingungen in `app/assets/SCHRIFTEN.md`: Fan-Schriften, nur privat und nicht kommerziell. Für den JGA passt das. Die Netlify-Seite ist aber öffentlich erreichbar, damit werden die Dateien streng genommen verbreitet.
- **Vollbild-Knopf nur hier**, oben rechts. Er startet das Spiel nicht, dafür tippt man auf PRESS START oder irgendwo ins Bild. Im Menü selbst gibt es keinen Vollbild-Knopf mehr.
- Hochformat zeigt „Handy quer halten" mit drehendem Handy. Eine eigene Hochformat-Ansicht ist möglich, aber doppelte Arbeit (Entscheidung 5).

---

## 5. Bildsprache

| Begriff | Symbol | Zustände |
|---|---|---|
| **Pack** | Spielkarte im Goldrahmen mit Totenkopf (One Piece), statt Herz und Rubin | gefüllt = deins, gestrichelter Rahmen = noch beim Bund |
| **Ziffer** | Zahlenrad im Schloss | ? = unbekannt, Gold = bekannt |
| **Prüfung** | Medaillon mit eigener Farbe und eigenem Zeichen | dunkles Medaillon mit „?" = im Nebel, pulsierender Ring = jetzt, leuchtend = bestanden, grau mit rotem X = verloren |
| **Sidequest** | Stein | unsichtbar = im Nebel, dunkel mit pulsierendem Ring = jetzt, grün = bestanden, grau mit rotem X = verloren |
| **Item, Fähigkeit** | Feld mit Symbol | hell = im Beutel, dunkler Umriss = noch nicht, grau mit rotem X = verloren |

Die sechs Medaillons tragen die sechs Medaillonfarben aus Ocarina of Time. So erkennt man jede Prüfung überall wieder, auf der Liste, der Karte und im Ergebnis:

| Prüfung | Farbe | Zeichen |
|---|---|---|
| Log-Buch | Blau | Zeichen des Wassers |
| Kreuzung der Klingen | Orange | Zeichen der Geister |
| Auge des Jägers | Grün | Zeichen des Waldes |
| Feuerprobe | Rot | Flamme (eigenes Zeichen, das Feuer fehlt in der Schrift) |
| Prüfung des Bundes | Gold | Triforce |
| Prophezeiung | Violett | Zeichen der Schatten |

Die Zeichen sind die Weisen-Zeichen der Medaillons aus Ocarina of Time, entnommen aus der Schrift Hylian Symbols und als Vektorpfad eingebaut.

Farbregeln: **Gold** = gewonnen, **Rot** = verloren oder Verlust, **Gelb pulsierend** = jetzt dran, **Blau** = Erklärung (Textbox).

---

## 6. Texte im Spielton

**So wenig Text wie möglich, so viel wie nötig** (Wunsch vom 23.09.). Was ein Symbol oder eine Zahl schon sagt, steht nicht noch einmal als Wort da. Gestrichen wurden: Seitenhinweise neben dem Titel, „NÄCHSTE QUEST" im HUD, „/10" neben den Packs, die Wörter in der Legende, „EINSATZ", Art der Quest neben dem Ort, der Satz „Noch 2 Prüfungen vor dir", die Beschriftung unter den Item-Feldern und unter dem Avatar, der Bedienhinweis unten, Erklärsätze in den Fenstern für Packs, Code und Ergebnis.

Regeln: Du-Form, höchstens zwei kurze Sätze, keine Gedankenstriche, keine Regeldetails (die kennt der Quest Master). Item-Texte nennen keine Quest beim Namen, sonst verraten sie, was im Nebel liegt. Sidequests mit `[PLATZHALTER]` bekommen hier schon einen Text, der Inhalt kann sich in Stufe 1 noch ändern.

| Quest | Text |
|---|---|
| Log-Buch | Zehn Fragen über Rieke. Ihre Stimme verrät, ob du ihr zugehört hast. |
| Waffenschmied | Ein Schmied bietet dir die große Wasserpistole an. Sein Preis ist ein Duell. |
| Kreuzung der Klingen | Wähle deinen Gegner, bevor du die Disziplin kennst. Der Sieger hält den Token. |
| Auge des Jägers | Fünf Flammen, ein Tank, drei Meter. Lösch sie, bevor dir das Wasser ausgeht. |
| Ringschmied | Drei Steine, ein Seilring am Boden. Triffst du, flicht dir der Schmied einen größeren. |
| Kartenwurf | Zehn Karten, ein Hut, drei Meter. Wer trifft, bekommt gepanzerte Karten. |
| Nakama-Quiz | Drei Fragen über deine Trauzeugen. Wie gut kennst du deine Crew? |
| Feuerprobe | Drei versiegelte Umschläge. Sag vorher, wie viele du öffnest. Wer zu viel wagt, verliert alles. |
| Schnick Schnack Schnuck | Schnick, Schnack, Schnuck. Best of three gegen einen Wächter, den der Bund bestimmt. |
| Steinwurf | Ein Stein, ein Baum. Wirf so nah heran, wie du kannst. |
| Prüfung des Bundes | Der Bund stellt sich dir auf dem Gipfel. Drei Duelle. Jetzt zählt, was du gesammelt hast. |
| Rast der Ahnen | Die Ahnen warten in der Hütte. Bestell für alle, leer den Trank, sprich den Toast. |
| Prophezeiung | Deine versiegelten Vorhersagen vom Morgen. In der Hütte wird abgerechnet. |

| Item | Kurzname | Text |
|---|---|---|
| Beutel | Beutel | Dein Beutel. Hier landet alles, was du dir erspielst. |
| Große Wasserpistole | Pistole | Dreifacher Tank. Du kannst länger schießen als jeder andere. |
| Großer Ring | Großer Ring | Ein Seilring mit 60 cm. Beim Ringwurf wird dein Ziel größer. |
| Gepanzerte Karten | Karten | Karten in Hüllen. Sie fliegen weiter und stabiler. |
| Herausforderungs-Token | Token | Lass im Showdown einen Wächter deiner Wahl für dich kämpfen. |
| Schwert der Verdammnis | Schwert | Streiche im Showdown den Wächter, den der Bund schickt. |
| Schild des Bundes | Schild | Wiederhole im Showdown ein verlorenes Duell. Einmal. |

**Tarnung** (so heißt ein Item, bis Dennis es erspielt; Symbol ist eine Truhe):

| Item | Tarnname | Kurzname | Text |
|---|---|---|---|
| Große Wasserpistole | Zoras Quellstab | Quellstab | Ein Relikt aus Zoras Reich. Wer es führt, hat den längsten Atem. |
| Großer Ring | Reif der Goronen | Reif | Schwer, rund und größer, als er sein müsste. |
| Gepanzerte Karten | Schriftrollen der Shiekah | Rollen | Blätter, die kein Wind aus der Bahn wirft. |
| Herausforderungs-Token | Leere Maske | Maske | Wer sie trägt, muss nicht selbst kämpfen. |
| Schwert der Verdammnis | Verrostete Klinge | Klinge | Alt und stumpf. Doch sie wartet auf ihren Moment. |
| Schild des Bundes | Zerbrochenes Wappen | Wappen | Ein Bruchstück eines alten Bundes. Es schützt, wer es heilt. |

---

## 7. Querformat-Regeln

- **Ganzer Bildschirm statt Box.** Notch, Dynamic Island und Home-Balken bleiben frei (Safe Areas).
- **Größen richten sich nach der Bildschirmhöhe**, der knappen Seite im Querformat, mit festen Untergrenzen.
- **Beschriftungen sind Text, keine Grafik**, auch auf der Karte.
- **Die Drehung läuft nur beim Seitenwechsel.** Danach liegt die Seite flach. Das hält Tippen und Scrollen auf dem iPhone sauber.
- **Hochformat:** Hinweis zum Drehen.

Ergebnis im Entwurf, gemessen wie in 1.1:

| | iPhone SE, Safari | iPhone 15, Safari | iPhone 15, Home-Bildschirm | Pro Max, Home-Bildschirm |
|---|---|---|---|---|
| Menüfläche | 71 % (vorher 47 %) | 72 % (vorher 44 %) | 73 % (vorher 51 %) | 75 % |
| Beschreibungstext | 13,6 px | 13,9 px | 16,1 px | 17 px |
| kleinste Beschriftung | 10,5 px | 10,5 px | 12 px | 12 px |
| Beschriftung der Karte | 10,5 px (vorher ca. 6) | 10,5 px (vorher ca. 7) | 12 px (vorher ca. 8) | 12 px |
| Tippfläche Quest-Zeile, Station | 33 px, 36 px | 34 px, 37 px | 39 px, 41 px | 40 px, 41 px |
| Item-Feld | 48 px | 50 px | 57 px | 60 px |

Geprüft in allen vier Größen mit Start, Mitte und Ende des Tages: kein Text läuft über, jede Quest-Karte passt ohne Scrollen. Nebel-Test: in 14 Spielständen vom Start bis zum Ende taucht auf keiner Seite, in keiner Textbox und in keinem Fenster der Name einer verdeckten Quest auf. Getestet mit Chromium in iPhone-Maßen. Ein Test auf einem echten iPhone in Safari steht noch aus.

---

## 8. Was sich beim Bauen im Code ändert

| Datei | Änderung |
|---|---|
| `config.js` | Neue Felder. Quest: `beschreibung` (Text aus Abschnitt 6), `farbe`, `emblem`, `hilft` (Liste von Items). Item: `tarn` (Name, Kurzname, Text), `kurz`, `gruppe` (`item` oder `faehigkeit`), `symbol`, `farbe`, `wirkung` (Text aus Abschnitt 6). Neuer Block `karte.stationen` (Name, Ort, Lage in Prozent). `icon` und `glyph` entfallen. |
| `index.html`, `app.js`, `styles.css` | werden durch den Entwurf ersetzt. Die Demo-Knöpfe gibt es dann nur mit `?demo`. |
| `engine.js`, `store.js` | unverändert |
| `admin.html`, `admin.js`, `admin.css` | unverändert. Der Quest Master sieht die neuen Beschreibungen in der Karte „Nächste Quest". |
| `engine.test.js` | unverändert, dazu ein Test, dass jede Quest eine Station und jede Prüfung Farbe und Emblem hat |

Anschluss an Teil B von `05-system-plan.md`: Stufe 2 (Aktionen von Dennis) bekommt ihren Platz in der Textbox der Ausrüstung (Knopf „Einsetzen"). Stufe 5 (Flüche) wird eine dritte Gruppe FLÜCHE auf der Ausrüstung. Stufe 7 (Karte) ist mit „Du bist hier" schon angelegt, ohne neues Feld im Dokument.

---

## 9. Entscheidungen für dich

1. **Drei Seiten plus HUD** wie im Entwurf? Empfehlung: ja.
2. **Seitennamen** deutsch (KARTE, QUESTS, AUSRÜSTUNG) oder englisch wie im N64-Original (MAP, QUEST LOG, EQUIPMENT)? Empfehlung: deutsch, alles andere ist auch deutsch.
3. ~~Kommende Quests sichtbar oder verdeckt?~~ **Entschieden am 23.09.: nur die nächste ist sichtbar** (Abschnitt 3.1).
6. ~~Noch nicht erspielte Items zeigen oder leer lassen?~~ **Entschieden am 24.09.: sie stehen da, aber getarnt.** Solange Dennis ein Item nicht erspielt hat, sieht er eine dunkle Truhe mit einem Namen aus der Welt (Tabelle „Tarnung" in Abschnitt 6). Beim Gewinnen fällt die Tarnung im Ergebnis-Fenster: „Zoras Quellstab entpuppt sich als Große Wasserpistole". Danach, auch nach einem Verlust, zeigt das Feld das echte Item. Der Quest Master sieht immer die echten Namen.
4. **Texte** aus Abschnitt 6 so übernehmen oder anpassen?
5. **Hochformat**: nur Hinweis zum Drehen oder eine eigene Ansicht? Empfehlung: Hinweis.

---

## 10. Bauplan, wenn du „bauen" sagst

1. Texte, Farben, Stationen nach `config.js`, Tests laufen lassen.
2. Entwurf wird zu `index.html`, `app.js`, `styles.css`.
3. Test mit zwei echten Handys (offener Punkt 2 in `CLAUDE.md`): iPhone quer in Safari und vom Home-Bildschirm, Admin bucht, Ergebnis-Fenster erscheint.
4. `CLAUDE.md` und `app/README.md` nachziehen, `entwurf.*` löschen.
