# System-Plan: Quest Master, Held und der Zustand des Spiels

Plan für die App hinter dem Game-Menü. Kein Code, nur die Struktur, auf die Code und Menü aufgesetzt werden. Regeln des Spiels stehen in `00-spielanleitung.md`, dieses Dokument beschreibt, **wer** im Spiel **was** am Handy tut und **wie** der Zustand entsteht.

Kernentscheidung: **Der Zustand wird nie direkt umgeschaltet.** Er ist immer die Folge von Ereignissen, die der Quest Master erfasst (Prüfung abgeschlossen, Berry bezahlt, Fluch ausgesprochen). Das Menü von Dennis zeigt nur, was daraus folgt.

---

## 1. Rollen und Geräte

| Rolle | Gerät | Darf | Sieht |
|---|---|---|---|
| **Quest Master (QM)** | eigenes Handy, geschützter Link | Alles erfassen und korrigieren: Prüfungen starten und abschließen, Encounter ziehen, Berry buchen, Items geben und nehmen, Flüche aussprechen und erlösen, Anfragen von Dennis bestätigen oder ablehnen, Position setzen, rückgängig machen | Alles, auch Geheimes: die vier Code-Ziffern, Umschlag-Inhalte, Steckbrief-Texte, Rieke-Antworten, Regel-Spickzettel, Zeitplan, komplette Chronik |
| **Held (Dennis)** | eigenes Handy, Spieler-Link | Nur Spieler-Aktionen: Items wählen (ausrüsten), Fähigkeiten einsetzen, Berry ausgeben (Steckbrief, Fluch erlösen, Hinweis), Proviant und Ring der Rieke einsetzen. Jede Aktion mit Wirkung ist eine **Anfrage**, die der QM bestätigt. | Sein Inventar, Berry-Stand, bekannte Ziffern, Status aller Prüfungen, die **nächste Prüfung** (Name, Ort, öffentliche Beschreibung), aktive Flüche, Karte, öffentliche Chronik |
| **Bund (Zuschauer)** | beliebig, offener Link | Nichts | Dasselbe wie Dennis, ohne Aktionen. Optional. |

Warum Anfrage statt Direktwirkung: Jede Spieler-Aktion hat ein physisches Gegenstück (QM übergibt den Steckbrief, nimmt die Berry-Münze, nimmt das Fluch-Band ab). Die Bestätigung am Handy des QM ist derselbe Handgriff. So kann Dennis nicht versehentlich oder heimlich etwas auslösen, und es gibt genau eine Quelle der Wahrheit.

Ausnahme ohne Bestätigung: **Ausrüsten** (z. B. welche Wasserpistole er in der Hand hält, wenn er beide besitzt). Das ändert keine Ressource und wird sofort übernommen, aber für den QM sichtbar protokolliert.

---

## 2. Drei Schichten: Konfiguration, Ereignisse, Zustand

```
Konfiguration (statisch, vor dem Tag)     Ereignisse (append-only, am Tag)       Zustand (abgeleitet)
game-data.json                             events[]                               state = reduce(config, events)
  Prüfungen + Ergebnisregeln                 trial.result {auge, treffer: 4}        berry, digits, trials,
  Encounter-Karten                           berry.transfer {-1, "Steckbrief"}      equipment, abilities,
  Ausrüstungslinien, Fähigkeiten, Flüche     curse.apply {schwere}                  curses, custody, requests,
  Preisliste, Stationen, Zeitplan            revert {eventId}                       nextQuest, log
  Geheimnisse (Code, Umschläge, ...)
```

- **Konfiguration** ändert sich am Spieltag nicht. Sie enthält auch die Regel „welches Ergebnis führt zu welchen Effekten" (§4).
- **Ereignisse** sind die einzige Schreiboperation. Nichts wird gelöscht, ein Fehler wird durch ein `revert`-Ereignis aufgehoben. Daraus folgen: Undo, nachvollziehbare Chronik für den Abend, und Offline-Betrieb (Ereignisse können lokal gepuffert und später zusammengeführt werden).
- **Zustand** wird bei jeder Änderung neu berechnet. Beide Views (QM, Held) rendern denselben Zustand, nur mit unterschiedlicher **Projektion** (§5): der Held bekommt keine Geheimnisse.

---

## 3. Zustände pro Entität (durchdacht)

Nur diese Werte gibt es. Übergänge passieren ausschließlich durch Ereignisse.

### 3.1 Prüfung

| Status | Bedeutung | Wer setzt |
|---|---|---|
| `offen` | Noch nicht dran | Standard |
| `naechste` | Die nächste im Ablauf, im Menü hervorgehoben | abgeleitet: erste `offen` in Reihenfolge des Zeitplans |
| `aktiv` | QM hat sie gestartet, läuft gerade | `trial.start` |
| `bestanden` | Abgeschlossen mit Gewinn-Bedingung | `trial.result` |
| `verloren` | Abgeschlossen mit Verlust-Bedingung | `trial.result` |

Es gibt höchstens eine `aktiv`. `bestanden` und `verloren` tragen das **Ergebnis** (z. B. `treffer: 4`, `umschlaege: 3`, `siege: 2`) und die daraus **angewendeten Effekte**. Die Prophezeiung hat zusätzlich `abgegeben` (Umschläge versiegelt, Abrechnung kommt später).

### 3.2 Ziffer

| Status | Bedeutung |
|---|---|
| `unbekannt` | Dennis kennt sie nicht |
| `bekannt` | Durch Prüfung erspielt, Wert wird angezeigt |
| `gekauft` | Am Kästchen für 1 Berry gekauft |
| `geraten` | Am Kästchen erraten |

Der QM kennt alle vier Werte von Anfang an (Konfiguration, geheim). `digit.reveal` macht einen Wert für Dennis sichtbar.

### 3.3 Ausrüstungslinie (Waffe, Ziel, Wurf)

| Feld | Werte |
|---|---|
| `stufe2` | `nicht_erspielt`, `im_besitz`, `verloren` |
| `ausgeruestet` | `1` oder `2` (nur `2`, wenn `stufe2 = im_besitz`) |

Stufe 1 kann nicht verloren gehen. `verloren` kann durch Nachkauf wieder `im_besitz` werden.

### 3.4 Fähigkeit (Token, Schwert, Schild, Log-Pose, Ring der Rieke)

| Status | Bedeutung |
|---|---|
| `nicht_erspielt` | |
| `im_besitz` | Dennis hält das Zeichen |
| `eingesetzt` | Verbraucht (Schild nach Wiederholung, Ring nach Ablehnung, Log-Pose nach Einlösung) |
| `verloren` | Abgenommen nach verlorener Prüfung |
| `beim_bund` | In Verwahrung des Bundes, kann gegen Dennis eingesetzt werden (nur Token) |

### 3.5 Verbrauchsgut

`proviant: 0..5`, `steckbriefe: [wächter-ids]`, `berry: 0..10`. Nur Zahlen bzw. Listen, kein Status.

### 3.6 Fluch

| Status | Bedeutung |
|---|---|
| `aktiv` | Wird getragen, mit Zeitpunkt und Auslöser |
| `erloest` | Mit Grund: `pruefung_gewonnen`, `berry`, `qm` |

Höchstens zwei `aktiv` gleichzeitig (Regel §8 der Spielanleitung).

### 3.7 Verwahrtes

`botschaft: beim_bund | freigegeben`, `token: siehe 3.4`.

### 3.8 Anfrage (vom Helden)

| Status | Bedeutung |
|---|---|
| `offen` | Dennis hat gedrückt, QM hat noch nicht reagiert |
| `bestaetigt` | QM hat bestätigt, Effekt angewendet |
| `abgelehnt` | QM hat abgelehnt, mit kurzem Grund |

Höchstens eine offene Anfrage gleichzeitig. Solange sie offen ist, zeigt das Menü „Wartet auf den Quest Master".

### 3.9 Station (Karte)

`erledigt`, `hier`, `offen`. `hier` wird vom QM per `game.position` gesetzt, alles davor wird `erledigt`.

---

## 4. Ereignis-Katalog

Jedes Ereignis: `id`, `ts`, `actor` (`qm` | `held` | `system`), `type`, `payload`. Ereignisse mit Wirkung tragen zusätzlich `effects[]`, die zum Zeitpunkt der Bestätigung aus der Konfiguration berechnet und **festgeschrieben** werden (spätere Regeländerungen ändern die Chronik nicht).

| Typ | Payload | Wer | Effekte |
|---|---|---|---|
| `game.start` | | qm | Startinventar, Berry 3/7 |
| `game.position` | `station` | qm | Karte |
| `trial.start` | `trial` | qm | Status `aktiv` |
| `trial.result` | `trial`, `outcome`, `result{}` | qm | aus Regeltabelle (§4.1), vom QM vor Bestätigung editierbar |
| `encounter.draw` | `card` | qm | Karte gilt als gezogen |
| `encounter.result` | `card`, `outcome` | qm | aus Regeltabelle |
| `berry.transfer` | `amount`, `to`, `reason` | qm | Berry |
| `item.grant` / `item.lose` | `line` oder `ability` | qm | Korrektur-Werkzeug |
| `item.equip` | `line`, `stufe` | held | keine, nur Anzeige |
| `consumable.use` | `proviant` | qm (nach Anfrage) | Zähler |
| `digit.reveal` / `digit.buy` / `digit.guess` | `index`, `value` / `attempt`, `correct` | qm | Ziffer, Berry |
| `curse.apply` / `curse.lift` | `curse`, `reason` | qm | Fluch |
| `custody.transfer` | `thing`, `to` | qm | Verwahrung |
| `request.create` | `action`, `payload` | held | Anfrage `offen` |
| `request.resolve` | `requestId`, `bestaetigt|abgelehnt`, `reason?` | qm | wendet die Aktion an oder nicht |
| `note` | `text` | qm | nur Chronik |
| `revert` | `eventId` | qm | hebt ein Ereignis auf |

### 4.1 Regeltabelle: Ergebnis zu Effekten (Beispiele)

Diese Tabelle lebt in der Konfiguration. Der QM gibt nur das Rohergebnis ein, die Effekte werden vorgeschlagen.

| Prüfung | Eingabe des QM | Effekte |
|---|---|---|
| Log-Buch | `richtig: 0..10` | ≥7: Ziffer 1 bekannt. Pro falscher ab der vierten: QM wählt Startitem für `item.lose`. ≤3: Fluch des Vergessens. |
| Kreuzung der Klingen | `outcome` | bestanden: Ziffer 2, Token `im_besitz`. verloren: Token `beim_bund`, Fluch der Stille. |
| Auge des Jägers | `treffer: 0..5` | 0–1: −1 Berry, Waffe Stufe 2 `verloren`, bei 0 Fluch des Jägers. 2–3: +1. 4: +2. 5: +3, Schwert. |
| Feuerprobe | `gewaehlt: 1..3`, `geschafft: 0..3` | alle geschafft: Ziffer 3 (ab 1), +1 Berry (ab 2), Schild und +1 (bei 3). Sonst: alles weg, −1 Berry, `item.lose` (QM wählt), Fluch der Schwere. |
| Prüfung des Bundes | `siege: 0..3` | 3: Ziffer 4, Botschaft frei, +2, eine verlorene Ziffer zurück (QM wählt). 2: Ziffer 4, Botschaft, +1. 1: Botschaft. 0: −2, `item.lose`, Botschaft bleibt beim Bund. |
| Prophezeiung (Abrechnung) | `eingetreten: 0..6` | min(n, 3) Berry |
| Rast: Bestellung | `fehler: n` | n=0: +1, sonst −n |
| Rast: Trank | `getrunken: ja/nein` | +1 / 0 |

### 4.2 Spieler-Aktionen (Anfragen)

| Aktion | Kosten | Wirkung nach Bestätigung |
|---|---|---|
| Steckbrief kaufen | 1 Berry (oder Log-Pose) | Steckbrief in Liste, Inhalt wird für Dennis sichtbar |
| Fluch erlösen | 1 Berry | Fluch `erloest` |
| Hinweis (Prophezeiung / Umschlag-Titel) | 1 Berry | QM sagt es mündlich, Ereignis nur für Chronik |
| Wiederholung (Encounter 1, Kernprüfung 2) | 1 / 2 Berry | Prüfung wieder `aktiv` |
| Proviant nutzen | 1 Gummibärchen | freier Schlossversuch |
| Ring der Rieke einsetzen | Ring | Encounter abgelehnt |
| Fähigkeit einsetzen (Token, Schwert, Schild) | keine | im Showdown: Regel-Effekt, Status `eingesetzt` |
| Ziffer kaufen / raten | 1 Berry / 1 pro Fehlversuch | Ziffer `gekauft` / `geraten` |

---

## 5. Was jede Rolle sieht (Projektion)

Aus demselben Zustand entstehen zwei Sichten. Die Held-Sicht ist eine **Teilmenge**, nie eine andere Wahrheit.

| Feld | QM | Held |
|---|---|---|
| Berry-Stand | ja | ja |
| Ziffern | alle vier Werte | nur `bekannt`/`gekauft`/`geraten` mit Wert, Rest `?` |
| Prüfungen | Status, Ergebnis, Effekte, Regel-Spickzettel, Geheiminhalte | Status, Name, Ort, öffentliche Beschreibung, Belohnung in Aussicht |
| Nächste Prüfung | mit Vorbereitungs-Checkliste | Name, Ort, Beschreibung, was er dafür braucht |
| Inventar | alles inkl. `beim_bund` | eigenes, Verwahrtes als gesperrt |
| Steckbriefe | alle Texte | nur gekaufte Texte |
| Flüche | alle, mit Erlösungsbedingung | aktive, mit Erlösungsbedingung |
| Anfragen | Liste offen/erledigt | eigene, mit Status |
| Chronik | vollständig | öffentliche Einträge (ohne QM-Notizen und Geheimnisse) |
| Karte | alle Stationen inkl. Zeitplan | Stationen, Position, nächste |

---

## 6. Screens

### 6.1 QM-Konsole (schlicht, große Buttons, Listen. Kein Zelda-Look nötig.)

1. **Übersicht:** Berry Dennis/Bund, Position, aktive und nächste Prüfung, offene Anfrage (rot), aktive Flüche, letzte drei Ereignisse.
2. **Prüfung:** pro Prüfung eine Karte: Spickzettel der Regeln, Eingabe des Rohergebnisses (Stepper, Buttons), Vorschau der Effekte, „Bestätigen". Bei Effekten mit Wahl (welches Item verliert er) ein Auswahlschritt.
3. **Encounter:** Karte aus dem Beutel wählen (der Beutel ist physisch, die App zeichnet nach), Ergebnis, Bestätigen.
4. **Kasse:** Preisliste als Buttons, freie Buchung mit Grund.
5. **Inventar und Flüche:** manuelles Geben und Nehmen (Korrektur), Fluch aussprechen und erlösen, Verwahrung umbuchen.
6. **Anfragen:** offene Anfrage von Dennis mit Bestätigen / Ablehnen.
7. **Chronik:** alle Ereignisse, „Letztes rückgängig", gezielter Revert.
8. **Geheimfach:** Code, Umschlag-Inhalte, Steckbriefe, Rieke-Fragen mit Audio-Links, Zeitplan, Packliste.

### 6.2 Held-Menü (das bestehende Pausenmenü)

Bleibt optisch, ändert die Logik:

- **Kein Umschalten per Klick.** Die drei Klassen `won/lost/locked` verschwinden als Eingabe, sie werden aus dem Zustand gerendert. `decide()` und `persist()` in der aktuellen `app.js` entfallen.
- **Prüfungen:** Medaillons nach Status. Die `naechste` blinkt (Cursor), die Textbox zeigt Name, Ort, öffentliche Beschreibung und „Belohnung in Aussicht".
- **Ausrüstung:** Linien mit Stufen, weißer Rahmen = `ausgeruestet`. Aktion „Ausrüsten" (sofort). Fähigkeiten mit Aktion „Einsetzen" (Anfrage).
- **Inventar:** Verbrauchsgüter mit „Kaufen" und „Nutzen" (Anfrage), eine Reihe **Flüche** mit „Erlösen 1 Berry" (Anfrage), Verwahrtes gesperrt.
- **Karte:** Position und nächste Station.
- **HUD:** Berry als Herzen, Tank aus `ausgeruestet` Waffe. Toast: „Anfrage gesendet", „Bestätigt vom Quest Master", „Abgelehnt: Grund".
- **Chronik** als fünfte Seite oder in der Textbox: die letzten öffentlichen Ereignisse.

---

## 7. Synchronisation und Funkloch

Der Tegernsee-Aufstieg hat kein durchgehendes Netz. Der Plan muss ohne Netz funktionieren.

**Grundsatz:** Das QM-Handy ist die Wahrheit. Es schreibt Ereignisse immer zuerst lokal (Puffer) und lädt sie hoch, sobald Netz da ist. Die Held-Sicht zeigt immer „Stand von hh:mm" und aktualisiert, wenn sie darf.

Drei Stufen, von bequem bis notfalls:

| Stufe | Wann | Wie |
|---|---|---|
| **A · Live** | Netz vorhanden | Gemeinsames Spiel-Dokument in einer Echtzeit-Datenbank (z. B. Firebase Realtime DB oder Supabase, beides kostenlos). QM schreibt Ereignisse, Held abonniert. Rollen über Link mit Schlüssel. |
| **B · Übergabe per QR** | kein Netz, beide Handys da | QM-Konsole zeigt den aktuellen Zustand als QR-Code (komprimiert, wenige hundert Bytes). Dennis scannt mit der Kamera, der Link öffnet sein Menü mit diesem Stand. Anfragen von Dennis laufen dann mündlich, der QM bucht sie. Thematisch passt es: „Log-Pose synchronisieren". |
| **C · Ein Gerät** | Notfall | QM zeigt Dennis die Held-Sicht auf dem QM-Handy (Rollenwechsel per Button, Geheimfach hinter PIN). |

Beide Views werden als **PWA** installiert (die aktuelle Seite hat schon ein Manifest), damit sie ohne Netz starten.

Alternative für einen schnellen Prototyp ohne eigenes Backend: ein Claude-Artifact mit geteilter Datenbank (`db`). Das reicht für Stufe A zum Testen mit zwei Handys, ist aber an claude.ai-Logins gebunden und deshalb nicht der Zielzustand für den Spieltag.

---

## 8. Bauphasen

| Phase | Ergebnis | Abnahme |
|---|---|---|
| 1 | `game-data.json`: Konfiguration inkl. Regeltabelle §4.1, Preisliste, Stationen, Geheimnisse als Platzhalter | Jede Prüfung hat Eingabeschema und Effekte |
| 2 | Engine: `reduce(config, events)` und `project(state, role)`, reine Funktionen, Tests in Node | Ein kompletter Beispieltag als Ereignisliste ergibt den erwarteten Endstand |
| 3 | QM-Konsole (Stufe C: alles auf einem Gerät, lokal) | QM kann einen ganzen Tag durchbuchen und rückgängig machen |
| 4 | Held-Menü rendert aus Zustand, Anfragen als Ereignisse | Menü zeigt nächste Prüfung, Inventar, Flüche, keine Klick-Toggles mehr |
| 5 | Sync Stufe A und QR-Übergabe Stufe B | Zwei Handys, Flugmodus-Test |
| 6 | Trockenlauf mit Spielleiter und einem Wächter | Fehlerliste, Regeln nachziehen |

Reihenfolge ist bewusst: Erst Konfiguration und Engine (Phase 1 bis 2), weil beide Views nur davon leben. Das Menü wird zuletzt angebunden, damit es sich nicht an ein Zwischenmodell klammert.

---

## 9. Entscheidungen, die noch offen sind

1. **Backend für Stufe A:** Firebase, Supabase oder etwas, das ihr schon habt.
2. **Schutz des QM-Links:** geheimer Link reicht, oder PIN zusätzlich.
3. **Anfrage-Timeout:** Wenn der QM nicht reagiert, bleibt die Anfrage offen oder verfällt nach 5 Minuten.
4. **Bund-Sicht:** ja oder nein. Kostet nichts, ist derselbe Link ohne Aktionen.
5. **Chronik am Abend:** als fünfte Menü-Seite oder als separater Screen beim Pack-Öffnen.
