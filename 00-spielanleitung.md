# Spielanleitung: „Die Prüfungen"

Regelwerk für den JGA von Dennis.

> **Hinweis zur Währung:** Dieses Regelwerk spricht von "Berry". Entscheidung vom 22.09.: Die Währung sind direkt die **Packs** (1 Berry = 1 Pack, 10 Stück, Start 0, nur in der App gezählt). Für v0 gilt `05-system-plan.md` und `game-config-v0.json`. Das Regelwerk wird beim Ausbau nachgezogen. Dieses Dokument ist die **eine** Struktur, auf der alles andere aufsetzt: die Detail-Docs (01 bis 04), das Game-Menü (`preview-menu.html`) und die Datendatei (`game-data.json`). Wo Inhalte noch nicht feststehen, steht **[PLATZHALTER]**. Die Struktur drumherum ist gesetzt.

Lesehilfe: §1 bis §3 sind das Spiel in drei Minuten. §4 bis §9 sind die Bausteine. §10 ist das Mapping aufs Menü.

---

## 1. Spielziel

Dennis (der **Held**) muss über ein Wochenende beweisen, dass er würdig ist, den **Bund** (seine Freunde) für einen neuen Bund (Rieke) zu verlassen. Am Ende steht ein verschlossenes **Kästchen** mit zehn One-Piece-Booster-Packs. Dennis gewinnt, was er sich erspielt hat. Der Rest gehört dem Bund.

Drei Dinge zählen am Ende:

1. **Berry** (Währung): Wie viele der zehn Packs gehören Dennis.
2. **Ziffern** (Code): Ob er das Kästchen überhaupt aufbekommt.
3. **Inventar** (Items, Fähigkeiten, Flüche): Ob er das Finale gegen den Bund gewinnt, das über Ziffer 4 und den letzten Berry-Schwung entscheidet.

---

## 2. Grundprinzipien

| Prinzip | Bedeutung |
|---|---|
| **Roguelike** | Was Dennis früh gewinnt oder verliert, wirkt bis zum Ende. Nichts wird zurückgesetzt. |
| **Verzahnung** | Jede Prüfung gibt oder nimmt etwas, das in einer späteren Prüfung messbar wirkt. Was nirgends wirkt, wird gestrichen. |
| **Zwei Schichten** | Berry ist Geld (weg ist weg). Inventar ist bleibend (wirkt ab Freischaltung auf alles Folgende, kann aber verloren gehen). |
| **Sichtbarkeit** | Kästchen, Berry-Stand und Inventar-Tafel sind jederzeit sichtbar. Jede Änderung wird laut angesagt. |
| **Der Bund spielt mit** | Der Bund ist Gegner, Schiedsrichter und Publikum. Er kann selbst Dinge halten (Token, Riekes Botschaft) und gegen Dennis einsetzen. |
| **Tricksen erlaubt** | Manipulation ist Teil des Spiels, außer bei Sicherheit und Wetter. Der Spielleiter hat das letzte Wort. |

---

## 3. Der Ablauf in Akten

| Akt | Wann / Wo | Was passiert | Prüfungen und Encounter |
|---|---|---|---|
| **0 · Aufbruch** | Freitag, Zug nach München | Einführung, Kästchen und Berry werden gezeigt, Startinventar ausgegeben. Erste Prüfung. | Log-Buch |
| **1 · Ausrüstung** | Samstag früh, Wohnung bis Wiese vor dem Anstieg | Prophezeiungen versiegeln. Erstes Duell, erster Handel. | Prophezeiung (Abgabe), Kreuzung der Klingen, Encounter 1 |
| **2 · Aufstieg** | Samstag, Weg auf die Neureuth | Geschicklichkeit, Mut, Encounter. Hier wird das Inventar für das Finale gebaut. | Auge des Jägers, Feuerprobe, Encounter 2 bis 4 |
| **3 · Gipfel** | Samstag, Gipfelwiese | Finale gegen den Bund. Items werden eingelöst. | Prüfung des Bundes |
| **4 · Rast** | Samstag, Berggasthaus | Abrechnung, Prophezeiung, Toast, Kästchen öffnen. | Rast der Ahnen (Bestellung, Trank, Toast, Öffnung) |
| **Epilog** | Samstagabend, München | Packs öffnen. Kein Spiel mehr. | keine |

Regel: Akte werden in dieser Reihenfolge gespielt. Innerhalb eines Akts darf der Spielleiter die Reihenfolge anpassen (Wetter, Tempo, Laune), mit einer Ausnahme: Der **Waffenschmied** (Encounter) muss vor dem **Auge des Jägers** kommen, sonst ist das Waffen-Upgrade wertlos.

---

## 4. Die drei Ressourcen

### 4.1 Berry (Währung)

- 10 Berry-Münzen entsprechen den 10 Packs im Kästchen. Die Packs bleiben den ganzen Tag im Kästchen sichtbar, gehandelt wird mit Münzen. Der Spielleiter führt ein Kontobuch.
- **Start:** 3 Berry bei Dennis, 7 beim Bund.
- Dennis kann nicht unter 0 fallen. Muss er zahlen und hat nichts, verliert er ein Item seiner Wahl. Hat er keins, verliert er eine bekannte Ziffer.
- Berry wandern durch: Prüfungsergebnisse, Encounter, Käufe (siehe Preisliste §9.2), Showdown, Rast.
- **Ende:** Berry-Stand = Packs für Dennis.

### 4.2 Ziffern (Code)

Vier Ziffern, feste Reihenfolge, je eine Quelle:

| Ziffer | Quelle | Bedingung |
|---|---|---|
| 1 | Log-Buch (Akt 0) | mindestens 7 von 10 Fragen |
| 2 | Kreuzung der Klingen (Akt 1) | Duell gewonnen |
| 3 | Feuerprobe (Akt 2) | Umschlag 1 geschafft |
| 4 | Prüfung des Bundes (Akt 3) | mindestens 2 von 3 Duellen, versteckt in Riekes Botschaft |

Status einer Ziffer: **unbekannt**, **bekannt** (erspielt), **gekauft** (am Kästchen für 1 Berry), **geraten**. Eine bekannte Ziffer geht nur über die Berry-Regel (§4.1) oder eine Encounter-Karte verloren.

### 4.3 Inventar

Das Inventar hat vier Kategorien. Sie unterscheiden sich darin, *wie* sie wirken und *wo* sie im Menü stehen.

| Kategorie | Was es ist | Wirkung | Kann verloren gehen? | Menü |
|---|---|---|---|---|
| **Ausrüstung** | Physischer Gegenstand mit **Stufen** (Standard, Upgrade) | Messbarer Vorteil in einer Disziplin | Ja, Downgrade auf Standard | Ausrüstung |
| **Fähigkeit** | Regel-Effekt, durch ein physisches **Zeichen** repräsentiert (Schwert, Schild, Münze) | Verändert eine Regel, meist im Showdown | Ja, Zeichen wird abgegeben | Ausrüstung |
| **Verbrauchsgut** | Zählbares Ding (Proviant, Steckbriefe) | Einmal-Effekt, dann weg | Wird verbraucht | Inventar |
| **Fluch** | Negativer Regel-Effekt nach verlorener Prüfung, physisch sichtbar getragen | Nachteil bis zur Erlösung | Wird erlöst (§8) | Inventar |

Dazu kommen **Verwahrtes**: Dinge, die der Bund hält und Dennis erst freigeben muss (Riekes Botschaft, ggf. das Token).

Status eines Inventar-Eintrags: **nicht erspielt**, **im Besitz**, **verloren**, **verbraucht**, **verwahrt** (beim Bund).

---

## 5. Prüfungen (Kern)

Jede Prüfung folgt derselben Karte: Kategorie, Akt, Dauer, Ablauf, Gewinn, Verlust, Wirkt auf. „Wirkt auf" ist die Verzahnung: Ohne einen Eintrag dort ist die Prüfung nicht fertig.

### 5.1 Log-Buch (Wissen)

- **Akt 0**, Zug, 20 Minuten.
- **Ablauf:** 10 Fragen über Rieke. Dennis antwortet, dann wird Riekes Sprachnachricht abgespielt. Der Bund entscheidet, ob es zählt.
- **Gewinn:** ab 7 richtig: Ziffer 1. Alle Startitems bleiben.
- **Verlust:** pro falscher Antwort ab der vierten: ein Startitem (Dennis wählt). Unter 5 richtig: keine Ziffer, keine Startitems.
- **Wirkt auf:** Startitems (Ring der Rieke, Proviant, Log-Pose) und damit auf Encounter, Kästchen, Showdown.
- **Fluch bei Totalversagen (0 bis 3 richtig):** [PLATZHALTER: Fluch des Vergessens, siehe §8].

### 5.2 Prophezeiung (Vorhersage)

- **Akt 1** Abgabe, **Akt 4** Abrechnung. Abgabe 10 Minuten.
- **Ablauf:** Zwei Vorhersagen pro Trauzeuge, versiegelt. In der Hütte werden sie geöffnet, der Bund stimmt per Handzeichen ab.
- **Gewinn:** +1 Berry pro eingetretener Prophezeiung, Deckel +3.
- **Verlust:** keiner. Diese Prüfung ist bewusst nur Aufwärts.
- **Wirkt auf:** Berry-Endstand. Für 1 Berry darf Dennis unterwegs fragen, ob eine bestimmte Prophezeiung noch möglich ist.

### 5.3 Kreuzung der Klingen (Duell, blind)

- **Akt 1**, Wiese vor dem Anstieg, 10 Minuten.
- **Ablauf:** Dennis wählt einen Gegner, *dann* wird die Disziplin gezogen (Schnick Schnack Schnuck Best of 3, Steinwurf, Ringwurf, [PLATZHALTER: weitere]).
- **Gewinn:** Ziffer 2 und die Fähigkeit **Herausforderungs-Token**.
- **Verlust:** Das Token geht an den Gewinner. Der Bund kann es gegen Dennis einsetzen (§7).
- **Wirkt auf:** Showdown (Token), Encounter „Der Bund fordert".

### 5.4 Auge des Jägers (Geschicklichkeit)

- **Akt 2**, erstes Waldstück, 10 Minuten.
- **Ablauf:** Wasserpistole auf fünf Teelichter, Abstand 3 Meter, ein Tank, kein Nachfüllen. Welche Pistole Dennis hat, entscheidet seine Ausrüstungsstufe.
- **Gewinn:** 2 bis 3 Treffer +1 Berry, 4 Treffer +2, 5 Treffer +3 und Fähigkeit **Schwert der Verdammnis**.
- **Verlust:** 0 bis 1 Treffer: −1 Berry und Downgrade der Waffe auf Standard (kleine Pistole).
- **Wirkt auf:** Ausrüstung Waffe, Showdown (Schwert).

### 5.5 Feuerprobe (Mut)

- **Akt 2**, Aussichtspunkt auf halber Höhe, 10 bis 20 Minuten.
- **Ablauf:** Drei versiegelte Umschläge, aufsteigend schwer. Dennis sagt **vorher**, wie viele er nimmt. Für 1 Berry erfährt er vorher einen Titel.
- **Gewinn:** Umschlag 1: Ziffer 3. Umschlag 2: +1 Berry. Umschlag 3: Fähigkeit **Schild des Bundes** und +1 Berry.
- **Verlust:** Scheitert er an einem gewählten Umschlag, verliert er alles aus dieser Prüfung, zahlt 1 Berry und gibt ein Item ab.
- **Wirkt auf:** Showdown (Schild), Kästchen (Ziffer 3), Toast (Video aus dem „Ruf").
- **Inhalte:** Taufe, Ruf, Opening (Vorschlag in `03-offene-pruefungen.md`), [PLATZHALTER: finale Auswahl durch das Team].

### 5.6 Prüfung des Bundes (Showdown)

- **Akt 3**, Gipfelwiese, 25 bis 35 Minuten.
- **Ablauf:** Drei Duelle. Pro Duell: Disziplin aus dem Bund-Deck ziehen, der Bund nominiert seinen besten Wächter (jeder nur einmal), Dennis setzt Fähigkeiten ein, Duell. Details in `01-showdown-pruefung-des-bundes.md`.
- **Gewinn:** 3 Siege: Ziffer 4, Riekes Botschaft, eine verlorene Ziffer zurück, +2 Berry. 2 Siege: Ziffer 4, Riekes Botschaft, +1 Berry. 1 Sieg: nur Riekes Botschaft.
- **Verlust:** 0 Siege: −2 Berry, ein Item weg, keine Botschaft. Ziffer 4 muss gekauft oder geraten werden.
- **Wirkt auf:** Kästchen (Ziffer 4), Berry-Endstand, Rucksack-Forfeit beim Abstieg.
- **Bund-Deck:** Schnick Schnack Schnuck, Wasserduell, Ringwurf, Kartenwurf, Log-Buch, Eiserne Faust. Zwei Karten ohne Item-Bezug sind Absicht.

### 5.7 Rast der Ahnen (Abschluss, keine Prüfung im engeren Sinn)

- **Akt 4**, Hütte, läuft nebenbei.
- **Stationen:** Bestellung (±1 Berry), Trank (+1 Berry), Prophezeiung und Toast (Abrechnung, kein Berry für den Toast), Öffnung.
- **Wirkt auf:** Berry-Endstand, Kästchen.

---

## 6. Encounter (Pool)

Kleine Aufgaben zwischen den Prüfungen. Ein Beutel mit 10 Karten, 4 bis 5 Züge über den Tag, immer an Rastpunkten, blind gezogen. Jede Karte hat Einsatz und Ausgang. Karten, die Items oder Fähigkeiten geben, bleiben nach dem Ziehen draußen. Karten mit reiner Berry-Wirkung gehen zurück.

| Karte | Typ | Gewinn | Verlust |
|---|---|---|---|
| Kreuzung der Klingen (klein) | Duell | Schwert der Verdammnis (oder +1 Berry) | −1 Berry, Schwert weg falls vorhanden |
| Waffenschmied | Handel | Ausrüstung Waffe Stufe 2 | Nachkauf nur für 2 Berry |
| Ringschmied | Geschicklichkeit | Ausrüstung Ziel Stufe 2, +1 Berry | −1 Berry |
| Kartenwurf | Geschicklichkeit | Ausrüstung Wurf Stufe 2, +1 Berry | −1 Berry |
| Log-Buch: Rieke | Wissen | +1 Berry | −1 Berry |
| Log-Buch: Nakama | Wissen | +1 Berry | −1 Berry |
| Schnick Schnack Schnuck | Duell | +1 Berry | −1 Berry |
| Diebstahl | Ereignis | nichts | Würfel 4 bis 6: ein Ausrüstungs-Upgrade weg |
| Schatzkarte | Ereignis | 1 Steckbrief | nichts |
| Der Bund fordert | Ereignis | Token-Besitzer setzt es ein | siehe §7 |

**Ring der Rieke:** Dennis darf genau einen Encounter ablehnen (Ring abgeben), außer „Der Bund fordert" mit Token beim Bund.

Erweiterungen: [PLATZHALTER: bis zu 2 weitere Geschicklichkeits-Karten, Kriterium: physisch, upgradebar, wirkt im Showdown].

---

## 7. Ausrüstung und Fähigkeiten (Detail)

### 7.1 Ausrüstungslinien (Stufen)

| Linie | Stufe 1 (Standard) | Stufe 2 (Upgrade) | Upgrade woher | Downgrade wodurch | Wirkt in |
|---|---|---|---|---|---|
| **Waffe** | Kleine Wasserpistole | Große Wasserpistole (dreifacher Tank) | Encounter Waffenschmied | Auge des Jägers 0 bis 1 Treffer | Auge des Jägers, Showdown Wasserduell |
| **Ziel** | Kleiner Seilring (35 cm) | Großer Seilring (60 cm) | Encounter Ringschmied | Encounter Diebstahl | Kreuzung der Klingen, Showdown Ringwurf |
| **Wurf** | 10 Karten ohne Sleeves | Gepanzerte Karten (Sleeves) | Encounter Kartenwurf | Encounter Diebstahl | Showdown Kartenwurf |
| [PLATZHALTER Linie 4] | | | | | |

Regel: Dennis hat pro Linie immer genau eine Stufe „ausgerüstet". Stufe 1 kann nicht verloren gehen.

### 7.2 Fähigkeiten (Regel-Effekte mit Zeichen)

| Fähigkeit | Zeichen | Woher | Effekt | Verlust |
|---|---|---|---|---|
| **Herausforderungs-Token** | große Münze | Kreuzung der Klingen | Showdown: ein Duell von einem Wächter seiner Wahl austragen lassen. Unterwegs: einen Wächter zu einem Encounter zwingen. | Duell verloren: geht an den Bund |
| **Schwert der Verdammnis** | Wanderstock mit rotem Tape | Auge des Jägers 5/5 oder Encounter | Showdown: pro Duell den nominierten Wächter streichen | Encounter Kreuzung der Klingen verloren, Showdown 0 Siege |
| **Schild des Bundes** | Frisbee mit Sticker | Feuerprobe, drei Umschläge | Showdown: ein verlorenes Duell einmal wiederholen | Showdown 0 Siege (vor dem Einsatz) |
| **Log-Pose** (Startitem) | Kompass-Anhänger | Start | Ein Steckbrief gratis | Log-Buch |
| **Ring der Rieke** (Startitem) | Holzring am Band | Start | Einen Encounter ablehnen | Log-Buch, Einsatz |
| [PLATZHALTER Fähigkeit 6] | | | | |

**Token beim Bund:** Einmal im Showdown die gezogene Disziplin zurücklegen und neu ziehen, nachdem Dennis seine Fähigkeiten gesetzt hat. Oder einmal am Tag Dennis zu einem Encounter zwingen (schlägt den Ring der Rieke).

### 7.3 Verbrauchsgüter

| Gut | Menge | Effekt | Woher |
|---|---|---|---|
| **Proviant** (Gummibärchen) | 5 | Je ein freier Fehlversuch am Schloss | Start |
| **Steckbriefe** | 0 bis n (einer je Wächter) | Stärke, Schwäche, SSS-Eröffnung, Lieblingsgetränk eines Wächters | Log-Pose, Schatzkarte, Kauf für 1 Berry |
| **Berry** | 0 bis 10 | Währung | siehe §4.1 |

---

## 8. Flüche

Flüche sind die Kehrseite der Fähigkeiten: ein negativer Regel-Effekt, der nach einer **verlorenen** Prüfung ausgesprochen wird und **physisch sichtbar** getragen wird (ein Band, ein Hut, ein Schild). So bleibt Verlieren nicht folgenlos, ohne dass jede Niederlage nur Berry kostet.

**Regeln (gesetzt):**

- Ein Fluch wird ausgesprochen, wenn die Verlust-Bedingung einer Prüfung eintritt und die Prüfung einen Fluch definiert.
- Dennis trägt höchstens **zwei** Flüche gleichzeitig. Kommt ein dritter, wählt der Bund, welcher alte erlischt.
- **Erlösung:** Ein Fluch erlischt mit der nächsten gewonnenen Prüfung (nicht Encounter) oder gegen 1 Berry, jederzeit.
- Flüche wirken nie im Showdown selbst (der ist hart genug), aber sie können bis dahin Berry und Items kosten.

**Inhalte [PLATZHALTER, Vorschläge]:**

| Fluch | Ausgelöst durch | Effekt | Zeichen |
|---|---|---|---|
| Fluch des Vergessens | Log-Buch unter 4 richtig | Dennis muss jeden Wächter bis zur Erlösung mit vollem Namen und Titel ansprechen („Wächter Benne"). Jeder Verstoß: der Bund darf ihm 1 Berry abnehmen (max. 2). | Namensschild „Ich vergesse" |
| Fluch der Schwere | Feuerprobe gescheitert | Dennis trägt das Kästchen bis zur Erlösung selbst. | Kästchen am Rucksack |
| Fluch der Stille | Kreuzung der Klingen verloren | Beim nächsten Encounter darf Dennis nicht sprechen. | Bandana über dem Mund |
| Fluch des Jägers | Auge des Jägers 0 Treffer | Beim nächsten Duell muss Dennis mit der schwachen Hand antreten. | Band am Handgelenk |

---

## 9. Kästchen und Finale

### 9.1 Öffnung (Akt 4)

1. Der Spielleiter liest die bekannten Ziffern vor.
2. Für jede fehlende Ziffer wählt Dennis: **kaufen** (1 Berry), **raten** (1 Berry pro Fehlversuch, Proviant macht Versuche frei) oder **aufgeben** (Kästchen bleibt zu, alle Packs an den Bund).
3. Kästchen öffnen. Dennis nimmt so viele Packs, wie er Berry hat.
4. Packs werden abends in München geöffnet.

### 9.2 Preisliste (Käufe mit Berry)

| Kauf | Preis |
|---|---|
| Steckbrief | 1 |
| Encounter wiederholen | 1 |
| Kernprüfung wiederholen (nur Auge des Jägers, Kreuzung der Klingen) | 2 |
| Fluch erlösen | 1 |
| Titel eines Feuerprobe-Umschlags vorab | 1 |
| Hinweis, ob eine Prophezeiung noch möglich ist | 1 |
| Fehlende Ziffer am Kästchen | 1 pro Ziffer |
| Fehlversuch am Schloss | 1 pro Versuch (außer Proviant) |

---

## 10. Rollen, Zustände und Menü

Wie das Spiel am Handy läuft, steht in `05-system-plan.md`. Kurzfassung: Der Quest Master bucht Ergebnisse auf seinem Handy, Dennis' Menü zeigt nur die Folgen. In der ersten Version (v0) gibt es genau vier Begriffe (Quest, Item, Berry, Ziffer) und drei Ereignisse (quest, korrektur, undo). Flüche, Anfragen, Stufen und Verwahrung aus diesem Regelwerk kommen als Ausbaustufen dazu.

---

## 11. Spielleitung

- **Ein Spielleiter**, nicht Wächter im Showdown (bei kleiner Gruppe: Wächter nur für „Log-Buch").
- **Ansagen:** Jede Änderung an Berry, Ziffern oder Inventar wird laut vorgelesen und auf der Inventar-Tafel notiert.
- **Streitfälle:** Der Bund stimmt per Handzeichen ab, der Spielleiter entscheidet bei Gleichstand. Zugunsten von Dennis runden ist erlaubt, nie so, dass ein Verlust folgenlos bleibt.
- **Tempo:** Kernprüfungen werden nie gestrichen, Encounter schon. Ziel bis zum Gipfel: 3 Stunden.
- **Sicherheit:** Keine Prüfung am Hang, kein Alkohol vor dem Gipfel, Wetter schlägt Regel.

---

## 12. Platzhalter-Liste

Alles, was inhaltlich noch fehlt, in einer Liste. Die Struktur bleibt auch ohne diese Inhalte spielbar.

1. §5.1 Fluch bei Totalversagen im Log-Buch (Vorschlag §8)
2. §5.3 Weitere Disziplinen für das blinde Duell
3. §5.5 Finale Auswahl der drei Feuerprobe-Umschläge
4. §6 Bis zu zwei weitere Geschicklichkeits-Encounter
5. §7.1 Vierte Ausrüstungslinie (optional)
6. §7.2 Sechste Fähigkeit (optional)
7. §8 Endgültige Fluch-Liste und ihre Zeichen
8. Namen der Wächter, Steckbriefe, Rieke-Fragen
9. Teilnehmerzahl und Bund-Deck-Größe
