# Design-Plan: Dennis' Menü von A bis Z

Stand 23.09.2026. **Vorschlag, noch nicht gebaut.** Die App (`app/index.html`) ist unverändert. Zum Ansehen gibt es einen klickbaren Entwurf als eigene Seite:

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

---

## 4. Die Seiten

### 4.1 QUESTS (Startseite)

- **Links die Liste aller 13 Quests** in Spielreihenfolge. Prüfungen mit Medaillon und fetter Schrift, Sidequests mit Stein. Rechts in jeder Zeile: goldener Haken (bestanden), rotes X (verloren), JETZT (nächste Quest). Darüber: PRÜFUNGEN 4/6 · SIDEQUESTS 4/7. Die Liste scrollt von selbst zur nächsten Quest.
- **Rechts die Quest-Karte** der gewählten Quest, beim Öffnen immer die nächste:
  - Name, Status, Art und Ort
  - Beschreibung im Spielton (Abschnitt 6)
  - **Hilft dir hier:** welche Items bei dieser Quest wirken, mit Stand (im Beutel, fehlt, verloren). Nur bei Auge des Jägers und Prüfung des Bundes. So wird die Verzahnung aus §2 der Spielanleitung sichtbar.
  - **Einsatz:** Sieg und Niederlage als Symbole (Karte +1, Zahlenrad Ziffer 2, Item, Item weg). Was nicht eingetreten ist, wird blass.

### 4.2 KARTE

- **Links die Karte** vom Tegernsee zur Neureuth mit sechs Stationen: Zug, Wiese, Wald, Aussicht, Gipfel, Hütte. An jeder Station das Medaillon der Prüfung dort und kleine Steine für die Sidequests dort. Dennis' Kopf zeigt „Du bist hier" (Station der nächsten Quest).
- **Rechts der Fortschritt:** alle sechs Medaillons (PRÜFUNGEN 4/6), alle sieben Steine (SIDEQUESTS 4/7) und der Satz „Noch 2 Prüfungen und 3 Sidequests." Darunter die gewählte Station mit ihren Quests und deren Stand.
- Beschriftungen sind Text im Menü, keine Grafik. Sie schrumpfen nicht mehr mit.

### 4.3 AUSRÜSTUNG

- **Mitte:** Avatar mit „DENNIS · STUFE VERLOBTER".
- **Links ITEMS:** Beutel, Pistole, Großer Ring, Karten (Gegenstände für Geschicklichkeit).
- **Rechts FÄHIGKEITEN:** Token, Schwert, Schild (Regeln im Showdown). Die Trennung folgt §4.3 der Spielanleitung.
- **Unten die Textbox:** Name, Stand, Wirkung und je nach Lage „Zu holen bei Kartenwurf", „Verloren bei Auge des Jägers" oder „Vorsicht: Feuerprobe kann es dir nehmen". Ohne Auswahl steht dort „4 von 7 im Beutel".

### 4.4 HUD

| Stelle | Inhalt | Tippen |
|---|---|---|
| oben links | eine Karte je Pack im Kästchen (bei `max` über 10 zwei Reihen wie Herzen), gefüllt = deins, gestrichelt = noch beim Bund, dazu „3/10" | erklärt die Packs |
| oben Mitte | NÄCHSTE QUEST mit Namen, am Ende „Alle Quests erledigt" | springt zur Quest-Seite |
| oben rechts | Schloss mit vier Zahlenrädern, unbekannt = ? | zeigt jede Ziffer mit Herkunft und Preis am Kästchen |
| unten rechts | „Stand 13:05" oder „Offline · Stand 13:05" | |

### 4.5 Ergebnis-Fenster

Bucht der Quest Master etwas, erscheint bei Dennis ein Fenster wie beim Item-Fund in Ocarina of Time:

- Kopf: Medaillon oder Stein, **PRÜFUNG BESTANDEN** (gold) oder **SIDEQUEST VERLOREN** (rot), Name der Quest.
- Zeilen: „+1 Pack · jetzt 4 von 10", „Ziffer 2 des Codes: 4", „Erhalten: Herausforderungs-Token", „Verloren: Große Wasserpistole".
- Fuß: „Nächste Quest: … · Ort". Tippen schließt und dreht zur Quest-Seite mit der nächsten Quest.
- Buchungen ohne Quest (Steckbrief, Bonus, Ziffer gekauft) zeigen Grund und Folge. Zurückstellen und Löschen aktualisiert still, ohne Fenster.
- Neue Karten und Ziffern blinken im HUD kurz auf.

### 4.6 Startbildschirm und Hochformat

- Startbildschirm bleibt wie gebaut, nur mit der neuen Größenlogik.
- Hochformat zeigt „Dreh dein Handy ins Querformat." mit drehendem Handy. Eine eigene Hochformat-Ansicht ist möglich, aber doppelte Arbeit (Entscheidung 5).

---

## 5. Bildsprache

| Begriff | Symbol | Zustände |
|---|---|---|
| **Pack** | Spielkarte im Goldrahmen mit Totenkopf (One Piece), statt Herz und Rubin | gefüllt = deins, gestrichelter Rahmen = noch beim Bund |
| **Ziffer** | Zahlenrad im Schloss | ? = unbekannt, Gold = bekannt |
| **Prüfung** | Medaillon mit eigener Farbe und eigenem Zeichen | dunkel mit farbigem Zeichen = offen, leuchtend = bestanden, grau mit rotem X = verloren, pulsierender Ring = jetzt |
| **Sidequest** | Stein | dunkel = offen, grün = bestanden, grau mit rotem X = verloren |
| **Item, Fähigkeit** | Feld mit Symbol | hell = im Beutel, dunkler Umriss = noch nicht, grau mit rotem X = verloren |

Die sechs Medaillons tragen die sechs Medaillonfarben aus Ocarina of Time. So erkennt man jede Prüfung überall wieder, auf der Liste, der Karte und im Ergebnis:

| Prüfung | Farbe | Zeichen |
|---|---|---|
| Log-Buch | Blau | aufgeschlagenes Buch |
| Kreuzung der Klingen | Orange | gekreuzte Klingen |
| Auge des Jägers | Grün | Auge |
| Feuerprobe | Rot | Flamme |
| Prüfung des Bundes | Gold | drei Dreiecke |
| Prophezeiung | Violett | versiegelter Brief |

Farbregeln: **Gold** = gewonnen, **Rot** = verloren oder Verlust, **Gelb pulsierend** = jetzt dran, **Blau** = Erklärung (Textbox).

---

## 6. Texte im Spielton

Regeln: Du-Form, höchstens zwei kurze Sätze, keine Gedankenstriche, keine Regeldetails (die kennt der Quest Master). Sidequests mit `[PLATZHALTER]` bekommen hier schon einen Text, der Inhalt kann sich in Stufe 1 noch ändern.

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
| Große Wasserpistole | Pistole | Dreifacher Tank. Hilft beim Auge des Jägers und im Wasserduell. |
| Großer Ring | Großer Ring | Ein Seilring mit 60 cm. Beim Ringwurf wird dein Ziel größer. |
| Gepanzerte Karten | Karten | Karten in Hüllen. Sie fliegen beim Kartenwurf stabiler. |
| Herausforderungs-Token | Token | Lass im Showdown einen Wächter deiner Wahl für dich kämpfen. |
| Schwert der Verdammnis | Schwert | Streiche im Showdown den Wächter, den der Bund schickt. |
| Schild des Bundes | Schild | Wiederhole im Showdown ein verlorenes Duell. Einmal. |

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

Geprüft in allen vier Größen mit Start, Mitte und Ende des Tages: kein Text läuft über, jede Quest-Karte passt ohne Scrollen. Getestet mit Chromium in iPhone-Maßen. Ein Test auf einem echten iPhone in Safari steht noch aus.

---

## 8. Was sich beim Bauen im Code ändert

| Datei | Änderung |
|---|---|
| `config.js` | Neue Felder. Quest: `beschreibung` (Text aus Abschnitt 6), `farbe`, `emblem`, `hilft` (Liste von Items). Item: `kurz`, `gruppe` (`item` oder `faehigkeit`), `symbol`, `farbe`, `wirkung` (Text aus Abschnitt 6). Neuer Block `karte.stationen` (Name, Ort, Lage in Prozent). `icon` und `glyph` entfallen. |
| `index.html`, `app.js`, `styles.css` | werden durch den Entwurf ersetzt. Die Demo-Knöpfe gibt es dann nur mit `?demo`. |
| `engine.js`, `store.js` | unverändert |
| `admin.html`, `admin.js`, `admin.css` | unverändert. Der Quest Master sieht die neuen Beschreibungen in der Karte „Nächste Quest". |
| `engine.test.js` | unverändert, dazu ein Test, dass jede Quest eine Station und jede Prüfung Farbe und Emblem hat |

Anschluss an Teil B von `05-system-plan.md`: Stufe 2 (Aktionen von Dennis) bekommt ihren Platz in der Textbox der Ausrüstung (Knopf „Einsetzen"). Stufe 5 (Flüche) wird eine dritte Gruppe FLÜCHE auf der Ausrüstung. Stufe 7 (Karte) ist mit „Du bist hier" schon angelegt, ohne neues Feld im Dokument.

---

## 9. Entscheidungen für dich

1. **Drei Seiten plus HUD** wie im Entwurf? Empfehlung: ja.
2. **Seitennamen** deutsch (KARTE, QUESTS, AUSRÜSTUNG) oder englisch wie im N64-Original (MAP, QUEST LOG, EQUIPMENT)? Empfehlung: deutsch, alles andere ist auch deutsch.
3. **Kommende Quests** mit Namen und Beschreibung sichtbar oder als „???" bis sie dran sind? Empfehlung: sichtbar. Dennis soll planen können, zum Beispiel dass der Waffenschmied vor dem Auge des Jägers kommt.
4. **Texte** aus Abschnitt 6 so übernehmen oder anpassen?
5. **Hochformat**: nur Hinweis zum Drehen oder eine eigene Ansicht? Empfehlung: Hinweis.

---

## 10. Bauplan, wenn du „bauen" sagst

1. Texte, Farben, Stationen nach `config.js`, Tests laufen lassen.
2. Entwurf wird zu `index.html`, `app.js`, `styles.css`.
3. Test mit zwei echten Handys (offener Punkt 2 in `CLAUDE.md`): iPhone quer in Safari und vom Home-Bildschirm, Admin bucht, Ergebnis-Fenster erscheint.
4. `CLAUDE.md` und `app/README.md` nachziehen, `entwurf.*` löschen.
