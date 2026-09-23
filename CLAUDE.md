# JGA Dennis · „Die Prüfungen" (Übergabe für neue Chats)

Repo `lifetimelongevity-cmd/ocarina`, Branch `main`. Sprache: Deutsch, Du-Form, keine Gedankenstriche in Texten.

Das Projekt lag bis zum 23.09.2026 im Ordner `jga-dennis/` des Repos `lifetime-health-theme` und ist mit Historie hierher umgezogen.

## Worum es geht

JGA-Wochenende für Dennis, 2. bis 4. Oktober 2026, München und Wanderung am Tegernsee auf die Neureuth (Samstag). Die Gruppe spielt ein selbstgebautes Quest-System im Zelda-/Ocarina-of-Time-Stil. Dennis durchläuft Quests, gewinnt oder verliert Packs (One-Piece-Booster-Packs im Kästchen), Items und Ziffern für den vierstelligen Code des Kästchens. Der Nutzer ist der **Quest Master**: Er bucht Ergebnisse auf seinem Handy, Dennis sieht auf seinem Handy ein Pausenmenü im N64-Stil mit dem Ergebnis.

## Stand (23.09.2026)

- **Live:** Dennis `https://dd-ocarina.netlify.app/`, Quest Master `https://dd-ocarina.netlify.app/admin.html`. Hosting auf Netlify, Projekt `dd-ocarina`. `netlify.toml` setzt den Veröffentlichungsordner auf `app`. Ist das Netlify-Projekt mit diesem Repo verknüpft, geht jeder Push auf `main` automatisch live. Sonst lädt der Nutzer den Ordner `app/` per Drag-and-drop hoch.
- **Speicher:** Firebase Realtime Database, Projekt `dennis-quest`, URL `https://dennis-quest-default-rtdb.europe-west1.firebasedatabase.app`, Pfad `/spiele/dennis-jga-2026`. Zugriff per REST ohne SDK. Datenbank war beim letzten Check noch im offenen Testmodus, empfohlene Regel steht in `app/README.md`.
- **Getestet:** Logik per `node app/engine.test.js`, Synchronisation Admin zu Dennis mit zwei getrennten Browsern über die Live-Adresse. Noch nicht mit zwei echten Handys getestet.
- **Design (23.09.):** Der Nutzer will Dennis' Menü neu ordnen und im iPhone-Querformat lesbar machen. Plan in `06-design-plan.md`, klickbarer Entwurf in `app/entwurf.html` (mit `?demo` ohne Datenbank). Drei Seiten KARTE, QUESTS, AUSRÜSTUNG, HUD mit Packs als Spielkarten und Code als Zahlenschloss, Ergebnis-Fenster nach jeder Buchung. Entschieden: Dennis sieht nur Erledigtes und die nächste Quest, der Rest liegt im Nebel (`06-design-plan.md` 3.1). Startbildschirm im Stil des Ocarina-of-Time-Covers mit Logo THE LEGEND OF DENNIS · A LINK TO RIEKE in den Zelda-Schriften, Vollbild-Knopf nur dort (`06-design-plan.md` 4.6). Ergebnis-Fenster als großer Moment mit drehendem Medaillon und kurzer Melodie, danach tritt die nächste Quest aus dem Nebel (4.5). Texte überall auf das Nötigste gekürzt (Wunsch des Nutzers: so wenig wie möglich, so viel wie nötig). **Plan noch nicht freigegeben, die App ist unverändert.** Weitere Entscheidungen offen in `06-design-plan.md` Abschnitt 9.

## Wo was liegt

| Datei | Inhalt |
|---|---|
| `app/` | **Die App.** `index.html` + `app.js` + `styles.css` (Dennis' Menü, Optik vom Nutzer gebaut), `admin.html` + `admin.js` + `admin.css` (Quest Master), `config.js` (alle Quests, Items, Code, Packs), `engine.js` (Logik), `store.js` (Firebase oder lokal), `README.md` (Einrichtung, Deploy) |
| `05-system-plan.md` | **Maßgeblicher Plan.** Kernlogik v0, alle Entscheidungen (Tabelle A0), Ausbaustufen (Teil B) |
| `06-design-plan.md` | **Design-Plan für Dennis' Menü** (Vorschlag): Befund, Seitenaufbau aus der Spielanleitung, Bildsprache, Texte im Spielton, Querformat-Regeln, Bauplan |
| `app/assets/intro-wald.jpg`, `triforce.woff2`, `hylia-serif.woff2`, `hylian-symbols.woff2`, `SCHRIFTEN.md` | Hintergrund des Startbildschirms (aus dem Bild des Nutzers, Link und Logo entfernt) und die Zelda-Schriften von zeldauniverse.net: Triforce für DENNIS, Hylia Serif für die kleinen Zeilen, Hylian Symbols als Quelle für Wappen und Medaillon-Zeichen. Fan-Schriften, nur privat und nicht kommerziell, Details in `SCHRIFTEN.md` |
| `app/entwurf.html`, `entwurf.css`, `entwurf.js` | Klickbarer Entwurf zu 06. Nutzt `config.js`, `engine.js`, `store.js` unverändert. Neue Texte, Farben und Kartenpunkte stehen oben in `entwurf.js` und wandern beim Bauen nach `config.js` |
| `00-spielanleitung.md` | Ausführliches Regelwerk (Ideen für später: Flüche, Anfragen, Stufen). Spricht noch von „Berry", gemeint sind Packs |
| `01` bis `04` | Frühe Detailentwürfe: Showdown, Items und Ökonomie, offene Prüfungen, Zeitplan und Packliste. Teilweise überholt durch 05 |
| `README.md` | Original-Briefing des Nutzers |
| `preview-menu.html` | Erste Menü-Preview, überholt |

## Kernlogik v0 (kurz)

- Vier Begriffe: Quest (offen, bestanden, verloren), Item (nicht, besitz, verloren), Packs (0 bis `max`, Start 0), Ziffer (unbekannt, bekannt).
- 13 Quests in fester Reihenfolge: 6 Kernprüfungen (Medaillons, tragen die Ziffern) und 7 Sidequests (Steine). Nächste Quest = erste offene.
- Gespeichert wird nur, was der Quest Master einstellt: `{ quests: {id: status}, buchungen: [{packs, grund, ziffer?}], items: {Korrekturen}, stand }`. Alles andere berechnet `derive()` in `engine.js`. Ziffer kaufen = Buchung mit Feld `ziffer`.
- Dennis schreibt nichts, er sieht nur. Tippen zeigt Beschreibung. Er sieht nur erledigte Quests und die nächste, alles danach ist verdeckt (A0 Nr. 16).

## Wichtige Entscheidungen des Nutzers

Währung sind direkt Packs (keine Umrechnung), Start 0, nur in der App gezählt. Anzahl der Packs noch offen (`waehrung.max`, derzeit 10). Einziges Startitem ist der Beutel. Verlorenes Item ist weg. Nur bestanden oder verloren. Der Nutzer ist Quest Master. Für Dennis ist immer nur die nächste Quest sichtbar (erledigte bleiben sichtbar, kommende Prüfungen nur als „?", kommende Sidequests gar nicht).

## Arbeitsweise

Der Nutzer will es **einfach und in sich geschlossen** halten und schrittweise ausbauen. Erst Plan, dann bauen, wenn er es sagt. Neue Inhalte (Quests, Items) nur in `app/config.js`, danach `node app/engine.test.js`. Ausbau in der Reihenfolge von `05-system-plan.md` Teil B.

## Offene Punkte

0. Design-Plan `06-design-plan.md` freigeben (Entscheidungen in Abschnitt 9), dann nach Abschnitt 10 bauen.
1. Firebase-Regeln setzen (siehe `app/README.md`).
2. Test mit zwei echten Handys.
3. Sidequest-Inhalte sind Platzhalter (`[PLATZHALTER]` in `config.js`).
4. Anzahl der Packs festlegen, dann Balance anpassen (Faustregel in `05-system-plan.md` A2).
5. Danach Ausbaustufe 1 und 2: Inhalte, dann Aktionen für Dennis.
6. Der Code des Kästchens und alle Quest-Namen stehen in `app/config.js`, das jedes Handy lädt. Wer den Quelltext öffnet, sieht sie. Vor dem Spieltag entscheiden, ob der Code aus der öffentlichen Konfiguration raus soll.
