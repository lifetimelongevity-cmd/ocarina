# System-Plan: Kernlogik v0 und Ausbaustufen

Ziel: eine kleine, in sich geschlossene Logik, auf der das Menü und die Quest-Master-Konsole aufsetzen. Erst wenn v0 mit zwei Handys rund läuft, kommen weitere Regeln dazu (Teil B). Nichts in Teil B darf v0 umbauen, es kommt nur obendrauf.

Die konkrete Konfiguration zu diesem Plan liegt in `game-config-v0.json`.

---

## Teil A: Kernlogik v0

### A0. Entscheidungen (gesetzt am 22.09.)

| # | Entscheidung | Gewählt |
|---|---|---|
| 1 | Währung | **Packs**, direkt. Kein Berry, keine Umrechnung. 10 Packs im Kästchen, Zähler von 0 bis 10. |
| 2 | Startstand | **0 Packs.** Dennis verdient alles. |
| 3 | Untergrenze | Packs fallen nicht unter 0. Ein Verlust bei 0 verpufft (Empfehlung übernommen). |
| 4 | Physisch oder App | **Nur App.** Keine Münzen. Das Kästchen mit den Packs ist die einzige physische Währung und bleibt zu. |
| 5 | Ziffern | **Feste Zuordnung**, eine Ziffer je Kernprüfung, Stelle im Code = Reihenfolge. |
| 6 | Verlorene Ziffer | Bleibt unbekannt. Am Kästchen: **1 Pack pro Ziffer kaufen** (Korrektur-Buchung). Kein Raten in v0. |
| 7 | Quest-Ausgänge | **Nur bestanden / verloren.** Kein „übersprungen". Fällt eine Quest aus, wird sie nicht gebucht und bleibt offen. |
| 8 | Umfang | **6 Kernprüfungen + 7 Sidequests** = 13 Quests in fester Reihenfolge. |
| 9 | Balance | Siehe A2. Alle Siege ergeben mehr als 10 (gedeckelt), alle Niederlagen ergeben 0. Normaler Tag: 4 bis 6 Packs. |
| 10 | Items | 9 Items: 3 Startitems, 3 aus Kernprüfungen, 3 aus Sidequests. Keine Stufen (Empfehlung übernommen). |
| 11 | Verlorenes Item | Kommt nur per Korrektur zurück. |
| 12 | Undo | Nur das letzte Ereignis, beliebig oft hintereinander. |
| 13 | Ereignis „start" | Weggelassen. Nächste Quest = erste offene. |
| 14 | Quest Master | Eine feste Person, im Showdown kein Wächter. |
| 15 | Zwei Handys | Erst ein Gerät mit Umschalter, vor dem Probelauf Firebase oder Supabase. |

### A1. Vier Begriffe, mehr nicht

| Begriff | Was es ist | Zustand |
|---|---|---|
| **Quest** | Eine Aufgabe in fester Reihenfolge. `typ` ist `kern` oder `side`, die Logik ist dieselbe. | `offen`, `bestanden`, `verloren` |
| **Item** | Ein Gegenstand oder eine Fähigkeit mit einem Satz Wirkung. Kein Unterschied zwischen Ausrüstung, Fähigkeit, Startitem. | `nicht`, `besitz`, `verloren` |
| **Packs** | Dennis' Anteil an den 10 Packs im Kästchen | Zahl 0 bis 10, Rest gehört dem Bund |
| **Ziffer** | Eine der vier Stellen des Kästchen-Codes | `unbekannt` oder `bekannt` (mit Wert) |

Abgeleitet, nicht gespeichert: **nächste Quest** = die erste Quest mit Status `offen`.

### A2. Die 13 Quests und ihre Effekte

Kernprüfungen tragen die Ziffern, Sidequests tragen Packs und Items. Sidequest-Inhalte sind Platzhalter aus dem Encounter-Pool und werden in Stufe 1 festgezogen.

| # | Quest | Typ | win | lose |
|---|---|---|---|---|
| 1 | Log-Buch | kern | +1, Ziffer 1 | ein Startitem weg (QM wählt per Korrektur) |
| 2 | Prophezeiung | kern | +1 (Abrechnung in der Hütte, wird dort gebucht) | 0 |
| 3 | Waffenschmied | side | +1, Große Wasserpistole | 0 |
| 4 | Kreuzung der Klingen | kern | +1, Ziffer 2, Token | −1, Token weg |
| 5 | Auge des Jägers | kern | +1, Schwert der Verdammnis | −1, Große Wasserpistole weg |
| 6 | Ringschmied | side | +1, Großer Ring | −1 |
| 7 | Kartenwurf | side | +1, Gepanzerte Karten | −1 |
| 8 | Nakama-Quiz | side | +1 | −1 |
| 9 | Feuerprobe | kern | +1, Ziffer 3, Schild des Bundes | −1, Schild weg |
| 10 | Schnick Schnack Schnuck | side | +1 | −1 |
| 11 | Steinwurf | side | +1 | 0 |
| 12 | Prüfung des Bundes | kern | +2, Ziffer 4 | −2, Schwert weg |
| 13 | Rast der Ahnen | side | +1 | −1 |

Summe aller win: 14, gedeckelt auf 10. Summe aller lose: −10, gedeckelt auf 0. Bei 60 Prozent Siegquote landet Dennis bei etwa 5 Packs, bevor er Ziffern kauft.

Verlorene Items: In v0 kann eine verlorene Quest nur Items nehmen, die in `lose.items` stehen. Hat Dennis das Item nicht, passiert nichts. Alles andere (welches Startitem beim Log-Buch) bucht der Quest Master per Korrektur.

### A3. Die 9 Items

| Item | Woher | Wirkung (ein Satz, wird in Stufe 1 zur Regel) |
|---|---|---|
| Ring der Rieke | Start | Einmal eine Sidequest ablehnen. |
| Proviant | Start | Freie Fehlversuche am Kästchen. |
| Log-Pose | Start | Ein Steckbrief gratis. |
| Herausforderungs-Token | Kreuzung der Klingen | Im Showdown ein Duell abgeben. |
| Schwert der Verdammnis | Auge des Jägers | Im Showdown einen Gegner streichen. |
| Schild des Bundes | Feuerprobe | Im Showdown ein Duell wiederholen. |
| Große Wasserpistole | Waffenschmied | Mehr Tank beim Auge des Jägers und im Wasserduell. |
| Großer Ring | Ringschmied | Leichteres Ziel beim Ringwurf. |
| Gepanzerte Karten | Kartenwurf | Stabilere Karten beim Kartenwurf. |

### A4. Drei Ereignisse

Der Quest Master schreibt, sonst niemand. Ereignisse werden nur angehängt, nie geändert.

| Ereignis | Payload | Wirkung |
|---|---|---|
| `quest` | `{ id, outcome: "bestanden" \| "verloren" }` | Quest bekommt den Status. Effekte aus `win` bzw. `lose` werden angewendet: Packs addieren (Deckel 0 bis 10), Items auf `besitz` bzw. `verloren`, Ziffer auf `bekannt`. |
| `korrektur` | `{ packs?: ±n, item?: { id, status }, grund }` | Freie Buchung: Ziffer kaufen, Steckbrief kaufen, Startitem nach Log-Buch nehmen, Nachbesserung. Alles, was v0 nicht als Regel kennt, läuft hier durch, mit Grund im Text. |
| `undo` | leer | Das letzte Ereignis, das kein `undo` ist, wird ignoriert. |

### A5. Zustand = Konfiguration + Ereignisse

```
function reduce(config, events) {
  state = { packs: 0, items: {}, quests: {}, ziffern: [null, null, null, null] }
  für jedes Item in config.items:   state.items[id] = "nicht"
  für jedes Startitem:              state.items[id] = "besitz"
  für jede Quest in config.quests:  state.quests[id] = "offen"

  aktive = events ohne die von undo aufgehobenen
  für jedes Ereignis e in aktive:
    wenn e.type == "quest":
      quest  = config.quests[e.id]
      effekt = e.outcome == "bestanden" ? quest.win : quest.lose
      state.quests[e.id] = e.outcome
      state.packs = clamp(state.packs + (effekt.packs || 0), 0, 10)
      für item in effekt.items:
        wenn e.outcome == "bestanden":              state.items[item] = "besitz"
        sonst wenn state.items[item] == "besitz":   state.items[item] = "verloren"
      wenn effekt.ziffer:  state.ziffern[effekt.ziffer - 1] = config.code[effekt.ziffer - 1]
    wenn e.type == "korrektur":
      wenn e.packs: state.packs = clamp(state.packs + e.packs, 0, 10)
      wenn e.item:  state.items[e.item.id] = e.item.status
  state.next = erste Quest mit Status "offen"
  return state
}
```

Reine Funktion, läuft ohne Netz und ohne Browser, testbar mit der Ereignisliste aus A8.

### A6. Zwei Sichten auf denselben Zustand

| | Quest Master | Dennis |
|---|---|---|
| Packs | ja | ja |
| Items | alle mit Status | alle mit Status (grau = nicht, Kreuz = verloren) |
| Quests | alle, mit Buttons „bestanden" / „verloren" | alle mit Status, die nächste hervorgehoben, mit Ort und Beschreibung |
| Ziffern | alle vier Werte | nur bekannte, Rest `?` |
| Ereignisse | Liste, „Rückgängig", „Korrektur" | nichts |

Dennis schreibt in v0 nichts. Er wählt Items nur zum Ansehen. Alles, was er im Spiel tut, sagt er dem Quest Master, der es bucht. Eigene Aktionen für Dennis sind Stufe 2.

### A7. Zwei Handys

Ein gemeinsames Dokument: `{ config, events[] }`. Der Quest Master hängt Ereignisse an, Dennis' Menü liest und rechnet `reduce` selbst.

1. **Zum Bauen und Testen:** beide Sichten auf einem Gerät, Umschalter, Dokument im Browser-Speicher.
2. **Vor dem Probelauf:** ein Dokument in Firebase Realtime Database oder Supabase. Zwei Links, der QM-Link mit Schlüssel.
3. **Ohne Netz:** QM-Handy schreibt lokal weiter, lädt nach. Dennis sieht „Stand von hh:mm". QR-Übergabe ist Stufe 8.

### A8. Was das Menü konkret ändert

- `won / lost / locked` werden aus `state` gesetzt, nicht per Klick. `decide()` und `persist()` in `app.js` entfallen.
- Jeder `selectable` bekommt eine `data-id`, die in `game-config-v0.json` existiert.
- Die nächste Quest wird hervorgehoben, die Textbox zeigt Name, Ort, Beschreibung.
- Herzen = Packs (10 Herzen, gefüllt = Dennis). Der Rest des HUD bleibt Deko bis Teil B.
- Sechs Medaillons = die sechs Kernprüfungen. Sidequests bekommen eine eigene Reihe oder die Steine.

### A9. Beispieltag als Ereignisliste (Test)

```
Start: 0 Packs, Items ring_rieke, proviant, logpose
 1. quest logbuch     bestanden -> 1 Pack, Ziffer 1
 2. quest prophezeiung  (wird erst in der Hütte gebucht, bleibt offen)
 3. quest waffenschmied bestanden -> 2, pistole_gross besitz
 4. quest klingen     bestanden -> 3, Ziffer 2, token besitz
 5. korrektur packs -1 "Steckbrief Benne"        -> 2
 6. quest auge        verloren  -> 1, pistole_gross verloren
 7. undo                         -> Ereignis 6 aufgehoben: 2, pistole_gross besitz
 8. quest auge        bestanden -> 3, schwert besitz
 9. quest ringschmied verloren  -> 2
10. quest kartenwurf  bestanden -> 3, karten_gepanzert besitz
11. quest nakama      bestanden -> 4
12. quest feuerprobe  bestanden -> 5, Ziffer 3, schild besitz
13. quest sss         verloren  -> 4
14. quest steinwurf   bestanden -> 5
15. quest bund        bestanden -> 7, Ziffer 4
16. quest prophezeiung bestanden -> 8
17. quest rast        bestanden -> 9
Endstand: 9 Packs, Ziffern 4/4, next = keine
Items besitz: ring_rieke, proviant, logpose, token, schwert, schild, pistole_gross, karten_gepanzert
Items nicht: ring_gross
```

Hinweis: Die Prophezeiung steht an Position 2, wird aber erst in der Hütte gebucht. Deshalb ist „nächste Quest = erste offene" in v0 leicht falsch, solange sie offen ist. Lösung ohne neue Logik: Die Prophezeiung wird in der Konfiguration ans Ende sortiert (Position 13, nach der Rast) und im Menü trotzdem als Medaillon 2 gezeigt. Reihenfolge in der Konfiguration ist Buchungsreihenfolge, nicht Erzählreihenfolge.

---

## Teil B: Ausbaustufen (später, in dieser Reihenfolge)

| Stufe | Was dazukommt | Was es an v0 anhängt |
|---|---|---|
| **1 · Inhalte** | Sidequests konkret, Beschreibungen, Icons, Orte | Nur Konfiguration |
| **2 · Aktionen von Dennis** | Items einsetzen, Packs ausgeben, als Anfrage mit Bestätigung | Ereignisse `anfrage` und `antwort` |
| **3 · Ergebnisse mit Zahlen** | Treffer 0 bis 5, Umschläge 1 bis 3, Siege 0 bis 3, Raten am Kästchen | `quest` bekommt `wert`, Konfiguration bekommt `wert -> Effekt` |
| **4 · Stufen bei Items** | Kleine und große Pistole als Linie mit „ausgerüstet" | `linie`, `stufe`, Ereignis `ausruesten` |
| **5 · Flüche** | Negative Effekte nach verlorener Quest, erlösbar | Status-Typ `fluch`, `lose.fluch` |
| **6 · Verwahrung** | Token beim Bund, Riekes Botschaft | Item-Status `beim_bund` |
| **7 · Karte und Chronik** | Position, öffentliche Chronik im Menü | Ereignis `position`, Projektion |
| **8 · Funkloch** | QR-Übergabe des Zustands | Nur Transport |

Detailideen zu Stufe 2 bis 8 stehen in der Git-Historie dieser Datei (Commit „Add system plan") und in `00-spielanleitung.md`.

---

## Nächster Schritt

`reduce` als reine Funktion gegen `game-config-v0.json` mit der Liste aus A9 als Test. Danach das Menü an den Zustand hängen.
