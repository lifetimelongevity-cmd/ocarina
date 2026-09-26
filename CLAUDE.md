# JGA Dennis · „Die Prüfungen" (Übergabe für neue Chats)

Repo `lifetimelongevity-cmd/ocarina`, Branch `main`. Sprache: Deutsch, Du-Form, keine Gedankenstriche in Texten.

Das Projekt lag bis zum 23.09.2026 im Ordner `jga-dennis/` des Repos `lifetime-health-theme` und ist mit Historie hierher umgezogen.

## Worum es geht

JGA-Wochenende für Dennis, 2. bis 4. Oktober 2026, München und Wanderung am Tegernsee auf die Neureuth (Samstag). Die Gruppe spielt ein selbstgebautes Quest-System im Zelda-/Ocarina-of-Time-Stil. Dennis durchläuft Quests, gewinnt oder verliert Packs (One-Piece-Booster-Packs im Kästchen), Items und Ziffern für den vierstelligen Code des Kästchens. Der Nutzer ist der **Quest Master**: Er bucht Ergebnisse auf seinem Handy, Dennis sieht auf seinem Handy ein Pausenmenü im N64-Stil mit dem Ergebnis.

## Stand (25.09.2026)

- **Live:** Dennis `https://dd-ocarina.netlify.app/`, Quest Master `https://dd-ocarina.netlify.app/admin.html`. Hosting auf Netlify, Projekt `dd-ocarina`. `netlify.toml` setzt den Veröffentlichungsordner auf `app` und leitet das alte `entwurf.html` auf die Hauptseite um. Jeder Push auf `main` ist nach wenigen Sekunden live.
- **App v1 (25.09.):** Der Entwurf aus `06-design-plan.md` ist die Haupt-App (`index.html`, `app.js`, `styles.css`). Spiele, Items und Fähigkeiten aus `07-spiele-und-items.md` stehen in `config.js` (Tabelle „Umsetzung" in 07). Neu: pro Quest `einsetzbar` (bei Dennis leuchtet, was bei der aktuellen Quest geht, der Rest ist ausgegraut, noch nicht Erspieltes ist ein leerer Platz), Einsetzen bucht der Quest Master, laufende Quests Prophezeiung (Zähler, Treffer = Spruchrolle) und Rikes Amulett, Showdown mit drei Duellen (Revanchen zuerst, aufgefüllt mit Wirbel der Götter), Log-Buch (Dennis tippt, besiegelt, dann spielt Rikes Sprachnachricht, Dateien fehlen noch, Platzhalter-Klang). Neues Titelbild „A Link to Rike", Avatar mit Okarina, eigene Icons für Dennis (grün) und Quest Master (rot, QM). Service Worker für Funklöcher.
- **Speicher:** Firebase Realtime Database, Projekt `dennis-quest`, URL `https://dennis-quest-default-rtdb.europe-west1.firebasedatabase.app`, Pfade `/spiele/dennis-jga-2026` (Spiel, schreibt nur der Admin) und `/spiele/dennis-jga-2026-logbuch` (Dennis' Antworten). Zugriff per REST ohne SDK. Datenbank war beim letzten Check im offenen Testmodus, Regeln in `app/README.md`.
- **Getestet:** Logik per `node app/engine.test.js`. In Playwright (`tests/geraete.mjs`, `tests/nebel.mjs`): iPhone 13 und 15 quer in Safari und vom Home-Bildschirm mit Notch- bzw. Dynamic-Island-Insets, Samsung mit vierfach gedrosselter CPU und langsamem Netz, Admin und Dennis zusammen, Nebel verrät nichts. Noch nicht mit echten Handys getestet.
- **26.09.:** Erlebnis-Plan `08-erlebnis-plan.md`. Live umgesetzt: KARTE zeigt nur das Wo (volle Breite, alle Medaillons je Station, Kästchen an der Hütte, Tippen auf eine Station öffnet ihre Quest), QUESTS nur das Was (ohne Legende und doppelte Marken), weniger doppelter Text (Abschnitt 11). Stilprobe des Remasters unter `https://dd-ocarina.netlify.app/stilprobe.html`.
- Der Name der Braut ist **Rike** (ohne e).

## Wo was liegt

| Datei | Inhalt |
|---|---|
| `app/` | **Die App.** `index.html` + `app.js` + `styles.css` (Dennis' Menü), `admin.html` + `admin.js` + `admin.css` (Quest Master), `config.js` (alle Quests, Items, Texte, Stationen, Log-Buch-Fragen, Code, Packs), `engine.js` (Logik), `store.js` (Firebase oder lokal, Log-Buch-Kanal), `sw.js` (offline), `README.md` (Einrichtung, Ablauf am Spieltag, Deploy). Dazu bis zur Freigabe `stilprobe.html` + `stilprobe.css`: Stilprobe des Remasters aus `08-erlebnis-plan.md` Abschnitt 10, ändert die App nicht |
| `05-system-plan.md` | **Maßgeblicher Plan.** Kernlogik v0, alle Entscheidungen (Tabelle A0), Ausbaustufen (Teil B) |
| `07-spiele-und-items.md` | **Arbeitsstand Spiele, Items, Fähigkeiten** (ab 25.09.), feste Nummern zum Referenzieren |
| `06-design-plan.md` | **Design-Plan für Dennis' Menü** (gebaut 25.09., Änderungen in Abschnitt 10): Befund, Seitenaufbau, Bildsprache, Texte im Spielton, Querformat-Regeln |
| `08-erlebnis-plan.md` | **Erlebnis-Plan** (26.09., umgesetzt ist Abschnitt 11 und die Stilprobe): jede Menüseite aus Dennis' Sicht, Fehler, Bauplan (Grunddesign und drei Stufen), Overdrive B mit A, visuelles Remaster (Abschnitt 10), Entscheidungen in Abschnitt 9 |
| `app/assets/` | Titelbild `intro-titel.webp` (Fee herausgelöst, schwebt als `intro-fee.png`), Avatar `avatar-okarina.webp`, Icons in `icons/`, Zelda-Schriften (Fan-Schriften, nur privat), `logbuch/` für Rikes Sprachnachrichten. Herkunft in `SCHRIFTEN.md` |
| `quellen/` | Originale der hochgeladenen Bilder (nicht veröffentlicht) |
| `tests/` | Playwright-Prüfungen für Geräte und Nebel |
| `00-spielanleitung.md` | Ausführliches Regelwerk (Ideen für später: Flüche, Anfragen, Stufen). Spricht noch von „Berry", gemeint sind Packs |
| `01` bis `04` | Frühe Detailentwürfe: Showdown, Items und Ökonomie, offene Prüfungen, Zeitplan und Packliste. Teilweise überholt durch 05 |
| `README.md` | Original-Briefing des Nutzers |
| `preview-menu.html` | Erste Menü-Preview, überholt |

## Kernlogik v1 (kurz)

- Begriffe: Quest (offen, bestanden, verloren, bei laufenden auch läuft, beendet), Item (nicht, besitz, verloren, verbraucht), Packs (0 bis `max`, Start 0), Ziffer (unbekannt, bekannt), Spruchrollen (Anzahl).
- 9 Quests in fester Reihenfolge: 6 Prüfungen (Medaillons, 4 tragen die Ziffern) und 3 Sidequests (Steine). Nächste Quest = erste offene. Dazu 2 laufende Quests (`typ: "lauf"`), sichtbar ab Start.
- Gespeichert wird nur, was der Quest Master einstellt: `{ quests, zaehler, schritte, einsaetze, duelle, buchungen, items, stand }`. Alles andere berechnet `derive()` in `engine.js`, dazu `einsetzbar()`, `jetztEinsetzbar()`, `showdownDuelle()`.
- Dennis schreibt nur seine Log-Buch-Antworten (eigener Pfad). Er sieht nur erledigte Quests und die nächste, alles danach ist verdeckt (A0 Nr. 16).

## Wichtige Entscheidungen des Nutzers

Währung sind direkt Packs (keine Umrechnung), Start 0, nur in der App gezählt. Anzahl der Packs noch offen (`waehrung.max`, derzeit 10). Einziges Startitem ist der Beutel. Verlorenes Item ist weg (derzeit verliert keine Quest ein Item). Nur bestanden oder verloren. Einsetzen: Dennis sagt an, der Quest Master bucht. Noch nicht erspielte Items sind in der Ausrüstung leere Plätze. Der Nutzer ist Quest Master. Für Dennis ist immer nur die nächste Quest sichtbar (erledigte bleiben sichtbar, kommende Prüfungen nur als „?", kommende Sidequests gar nicht).

## Arbeitsweise

Der Nutzer will es **einfach und in sich geschlossen** halten und schrittweise ausbauen. Erst Plan, dann bauen, wenn er es sagt. Neue Inhalte (Quests, Items) nur in `app/config.js`, danach `node app/engine.test.js`. Ausbau in der Reihenfolge von `05-system-plan.md` Teil B.

## Offene Punkte

1. Reihenfolge und Belohnungskette in `config.js` bestätigen (Vorschlag in `07-spiele-und-items.md`, Abschnitt Umsetzung).
2. Log-Buch: Die 7 Fragen stehen (26.09., Rike antwortet über Dennis, er errät ihre Antwort in ein bis drei Worten). Liste für Rike in `app/assets/logbuch/LIESMICH.md`. An Rike schicken, Sprachnachrichten als `app/assets/logbuch/frage1.m4a` bis `frage7.m4a` ablegen.
3. Firebase-Regeln setzen (siehe `app/README.md`, Dennis muss ins Log-Buch schreiben dürfen).
4. Test mit zwei echten Handys (iPhone vom Home-Bildschirm, Samsung).
5. Anzahl der Packs festlegen, dann Balance anpassen (Faustregel in `05-system-plan.md` A2).
6. Offene Details aus 07: Parcours Podrennen, Schwerter für 12, Versteck und Frist für 15, Grenzen für bestanden.
7. Der Code des Kästchens und alle Quest-Namen stehen in `app/config.js`, das jedes Handy lädt. Vor dem Spieltag entscheiden, ob der Code aus der öffentlichen Konfiguration raus soll.
8. Erlebnis-Plan `08-erlebnis-plan.md`: Entschieden am 26.09.: Overdrive B mit A, Finale mit Rikes Botschaft (achte Aufnahme neben den sieben Log-Buch-Antworten, `app/assets/botschaft.m4a`), Vorhersagen in der App, die Fee als Rikes Botin, visuelles Remaster. Offen: Name der Fee, Trostzeile, Item-Fund-Bild, Schrift, Zeitplan. Stilprobe gebaut am 26.09. und live unter `/stilprobe.html`, wartet auf Freigabe durch den Nutzer. Abschnitt 11 (Aufgabenteilung, weniger Text) ist live. Danach Grunddesign nach `styles.css` übertragen und Stufe 1.
