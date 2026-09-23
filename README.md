# JGA Dennis: "Die Prüfungen" (Arbeitstitel)

Projektordner für das Quest-System zum JGA-Wochenende von Dennis (2. bis 4. Oktober, München / Tegernsee). Nicht Teil des Shopify-Themes, liegt nur im selben Repo.

## Dateien

| Datei | Inhalt | Status |
|---|---|---|
| `README.md` | Projektbeschreibung (Original-Briefing, unverändert) | gesetzt |
| `00-spielanleitung.md` | Regelwerk: Akte, Ressourcen, Prüfungen, Encounter, Ausrüstung, Fähigkeiten, Flüche, Kästchen | Entwurf |
| `05-system-plan.md` | Kernlogik v0 (Quest, Item, Packs, Ziffer, drei Ereignisse, reduce), Entscheidungen, Ausbaustufen | Plan v0 |
| `app/` | Die App v0: Dennis' Menü (`index.html`), Quest-Master-Menü (`admin.html`), Konfiguration (`config.js`), Logik mit Tests. Anleitung in `app/README.md`. | v0 |
| `01-showdown-pruefung-des-bundes.md` | Prüfung 5, das Finale auf dem Gipfel. Definiert, was jedes Item wert ist. | Vorschlag v1 |
| `02-items-und-oekonomie.md` | Item-Liste, Berry-Währung, Ziffern-Logik, Kästchen | Vorschlag v1 |
| `03-offene-pruefungen.md` | Prüfung 4 (Mut), Rast der Ahnen, weitere Geschicklichkeitsspiele, Encounter-Pool | Vorschlag v1 |
| `04-ablauf-und-material.md` | Zeitplan Freitag/Samstag, Kategorien-Namen, Spielleiter-Checkliste, Packliste | Vorschlag v1 |
| `preview-menu.html` | Frühe Preview des Pausenmenüs. Überholt durch den eigenen Umbau (dennis-quest-pausenmenue.tissler.chatgpt.site). | überholt |

Lesereihenfolge für Neueinsteiger: README, dann 00 (Regeln), dann 05 (App-Struktur), dann 01 und 02. Die 01 ist zuerst gebaut, weil der Showdown festlegt, wofür die Items während des Tages gesammelt werden.

---

## Projektbeschreibung (Original)

**Rahmen:** JGA-Wochenende für Dennis, 2.–4. Oktober, bei einem Freund in München. Kern ist der Samstag: eine Wanderung am Tegernsee (voraussichtlich auf die Neureuth), die als Gerüst für ein selbstgebautes Quest-System dient. Kein klassischer JGA-Style, sondern Gaming-/Zelda-/Anime-inspiriert – die Gruppe ist gaming-affin (N64 bis PS5), Dennis und BJ sammeln One Piece Trading Cards. Zusätzlich gibt es eine erste Prüfung schon am Freitag im Zug als Intro.

**Grundmechanik:** Dennis durchläuft über den Tag verteilt Prüfungen. Er kann Items/Fähigkeiten gewinnen und wieder verlieren – was er früh verkackt, spürt er später (Roguelike-Prinzip). Verzahnung ist das Leitprinzip: Prüfungen und Items sollen ineinandergreifen, nicht nebeneinander stehen.

**Währung:** 10 One-Piece-Booster-Packs. Sie sind von Anfang an sichtbar (z.B. in einer Schatulle, die mitläuft) und wandern je nach Prüfungsergebnis zwischen Dennis' Seite und der Gruppe. Was Dennis am Ende erspielt hat, gehört ihm – den Rest bekommt die Gruppe. Er kann Packs auch aktiv einsetzen (z.B. um Informationen zu kaufen oder eine Prüfung zu wiederholen). Geöffnet wird gemeinsam am Abend als Finale.

**Tagesklammer:** Ein verschlossenes Kästchen bzw. Vorhängeschloss mit vierstelligem Code. Jede gewonnene Prüfung verrät Dennis eine Ziffer. Verlorene Ziffern muss er oben erraten oder mit Packs zurückkaufen. Im Kästchen liegen die Packs / der Hauptgewinn.

**Zwei Schichten von Belohnungen:**

1. Packs = Geld (ausgeben, weg ist weg)
2. Fähigkeiten/Items = bleibend, wirken ab Freischaltung auf alles Folgende (z.B. "Schwert der Verdammnis": darf bei jedem Duell einen Gegner aus der Auswahl streichen). Items können bei komplett verkackten Prüfungen wieder verloren gehen. Bestes Item-Kriterium: physische Gegenstände mit Upgrade-Logik, die in einer späteren Prüfung messbar helfen.

**Die 5 Kernprüfungen (Dramaturgie-Bogen):**

1. **Wissen über Rieke** (Freitag im Zug, Intro): Fragen über Dennis' Verlobte Rieke. Die Fragen werden vorab an Rieke geschickt, sie beantwortet sie per Sprachnachricht – ihre Stimme ist der Beweis. Dennis muss sagen, was Rieke geantwortet hat, bzw. Detailfragen beantworten. Falsche Antworten kosten Startitems.
2. **Die Prophezeiung** (Samstagmorgen, vor dem Aufstieg): Dennis schreibt für jeden Trauzeugen zwei Vorhersagen auf ("Benne wird in den ersten zwei Stunden anhalten und sich dehnen"). Zettel werden versiegelt abgegeben. Tritt eine Prophezeiung ein, gibt es eine Belohnung. Tricksen/Manipulieren ist erlaubt und Teil des Spaßes.
3. **Das blinde Duell** (vor dem Anstieg, körperlich aber kurz): Dennis wählt einen Gegner, OHNE die Disziplin zu kennen. Erst danach wird gezogen: Schnick Schnack Schnuck (Best of 3, hat Geschichte in der Runde), Stein möglichst nah an einen Baum werfen / durch einen Ring in weniger Versuchen, o.ä. Belohnung: Herausforderungs-Token – damit kann Dennis später eine Aufgabe an jemanden abgeben oder jemanden zwingen, mitzumachen. Verliert er, geht das Token an den Gewinner, der es gegen ihn einsetzen kann.
4. **Mut-Prüfung unterwegs** (noch offen, auf halber Strecke)
5. **Showdown "Prüfung des Bundes"** (auf dem Gipfel, noch offen): Finale gegen die Gruppe, bei dem die gesammelten Items entscheiden. Wird bewusst zuletzt ausgearbeitet.

**Encounter-Pool** (kleine Aufgaben zwischen den Kernprüfungen, wird blind gezogen): Quizfragen, Fragen über die Trauzeugen, Schnick Schnack Schnuck, Steinzielwurf, Geschicklichkeitsspiele.

**Gesetzte Geschicklichkeitsprüfung:** Wasserpistole auf Teelichter. Fünf Teelichter, begrenzter Tank – je mehr Treffer, desto mehr Ziffern/Packs. Verzahnung: Es gibt zwei Wasserpistolen, eine kleine (Default) und eine große mit mehr Tank. Die große kann sich Dennis in einem früheren Spiel erspielen (Waffen-Upgrade) – und bei einer verkackten Prüfung auch wieder verlieren.

**Kategorien-Namen (Stand):**

* Auge des Jägers = Geschicklichkeit (gesetzt)
* Prophezeiung = die versiegelten Vorhersagen (gesetzt)
* Rast der Ahnen = alles in der Hütte: Trank, Bestellung, Toast, ggf. Kästchen-Öffnung (gesetzt, noch auszubauen)
* Namen für Wissens-Kategorie, Duelle und Showdown: noch offen

**Offene Punkte:**

* Prüfung 4 (Mut) und 5 (Showdown) inhaltlich definieren
* Weitere Geschicklichkeitsspiele (Kriterium: physischer Gegenstand, upgradebar, wirkt in späterer Prüfung – abgelehnt wurden: Becherstapeln, Balancieren, Zielspucken, Kordel-Spiele, Zelda-Mechaniken wie Spiegel/Druckplatten)
* Rast der Ahnen ausgestalten
* Item-/Fähigkeiten-Liste finalisieren
* Restliche Kategorien-Namen
* Ziel: insgesamt ca. 6–8 Aufgaben, davon 5 Kernprüfungen
