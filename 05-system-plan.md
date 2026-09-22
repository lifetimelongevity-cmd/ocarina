# System-Plan: Kernlogik v0 und Ausbaustufen

Ziel: eine kleine, in sich geschlossene Logik, auf der das Menü und die Quest-Master-Konsole aufsetzen. Erst wenn v0 mit zwei Handys rund läuft, kommen Aufgaben, konkrete Items und weitere Regeln dazu (Teil B). Nichts in Teil B darf v0 umbauen, es kommt nur obendrauf.

---

## Teil A: Kernlogik v0

### A1. Vier Begriffe, mehr nicht

| Begriff | Was es ist | Zustand |
|---|---|---|
| **Quest** | Eine Aufgabe in fester Reihenfolge (Kernprüfung oder kleine Aufgabe, in v0 kein Unterschied) | `offen`, `aktiv`, `bestanden`, `verloren` |
| **Item** | Ein Gegenstand oder eine Fähigkeit mit einem Satz Wirkung. In v0 kein Unterschied zwischen Ausrüstung, Fähigkeit, Startitem. | `nicht`, `besitz`, `verloren` |
| **Berry** | Dennis' Anteil an den 10 Packs | Zahl 0 bis 10, Rest gehört dem Bund |
| **Ziffer** | Eine der vier Stellen des Kästchen-Codes | `unbekannt` oder `bekannt` (mit Wert) |

Abgeleitet, nicht gespeichert: **nächste Quest** = die erste Quest mit Status `offen`. Es gibt höchstens eine `aktiv`.

### A2. Konfiguration (vor dem Tag, ändert sich am Spieltag nicht)

```
config = {
  start:  { berry: 3, items: ["ring_rieke", "proviant", "logpose"] },
  code:   [7, 4, 2, 9],                       // geheim, nur der Quest Master sieht es
  items:  [ { id, name, wirkung, icon } ],     // Liste aller Items, die es im Spiel gibt
  quests: [                                    // in Spielreihenfolge
    { id, name, ort, beschreibung,             // beschreibung ist öffentlich (Dennis sieht sie)
      win:  { berry: +1, items: ["token"], ziffer: 2 },
      lose: { berry: -1, items: ["token"] }    // items bei lose = werden ihm abgenommen
    }
  ]
}
```

Regel: Alles, was eine Quest bewirken kann, steht in `win` und `lose`. Drei Felder: `berry` (Zahl), `items` (Liste), `ziffer` (Index 1 bis 4, nur bei win). Keine anderen Effekte in v0.

### A3. Drei Ereignisse

Der Quest Master schreibt, sonst niemand. Ereignisse werden nur angehängt, nie geändert.

| Ereignis | Payload | Wirkung |
|---|---|---|
| `quest` | `{ id, outcome: "bestanden" \| "verloren" }` | Quest bekommt den Status. Effekte aus `win` bzw. `lose` werden angewendet: Berry addieren (Deckel 0 bis 10), Items auf `besitz` bzw. `verloren`, Ziffer auf `bekannt`. |
| `korrektur` | `{ berry?: ±n, item?: {id, status}, grund }` | Freie Buchung: Käufe, Strafen, Nachbesserung. Alles, was v0 nicht als Regel kennt, läuft hier durch, mit Grund im Text. |
| `undo` | leer | Das letzte Ereignis, das kein `undo` ist, wird ignoriert. |

Optional als viertes, wenn man es am Tag will: `start { id }` setzt eine Quest auf `aktiv`. Ohne dieses Ereignis ist die nächste Quest einfach die erste offene.

### A4. Zustand = Konfiguration + Ereignisse

```
function reduce(config, events) {
  state = { berry: config.start.berry, items: {}, quests: {}, ziffern: [null, null, null, null] }
  für jedes Item in config.items:   state.items[id] = "nicht"
  für jedes Startitem:              state.items[id] = "besitz"
  für jede Quest in config.quests:  state.quests[id] = "offen"

  aktive = events ohne die von undo aufgehobenen
  für jedes Ereignis e in aktive:
    wenn e.type == "quest":
      effekt = outcome == "bestanden" ? quest.win : quest.lose
      state.quests[e.id] = e.outcome
      state.berry = clamp(state.berry + (effekt.berry || 0), 0, 10)
      für item in effekt.items:  state.items[item] = outcome == "bestanden" ? "besitz" : "verloren"
      wenn effekt.ziffer:        state.ziffern[effekt.ziffer - 1] = config.code[effekt.ziffer - 1]
    wenn e.type == "korrektur":
      berry und item wie angegeben
  state.next = erste Quest mit Status "offen"
  return state
}
```

Das ist die ganze Logik. Sie ist eine reine Funktion, läuft ohne Netz und ohne Browser, und lässt sich mit einer Beispiel-Ereignisliste testen.

### A5. Zwei Sichten auf denselben Zustand

| | Quest Master | Dennis |
|---|---|---|
| Berry | ja | ja |
| Items | alle mit Status | alle mit Status (grau = nicht, Kreuz = verloren) |
| Quests | alle, mit Buttons „bestanden" / „verloren" | alle mit Status, die nächste hervorgehoben, mit Ort und Beschreibung |
| Ziffern | alle vier Werte | nur bekannte, Rest `?` |
| Ereignisse | Liste, „Rückgängig", „Korrektur" | nichts |

Dennis kann in v0 **nichts schreiben**. Er wählt Items nur zum Ansehen (Cursor, Beschreibung). Alles, was er im Spiel tut (Item einsetzen, Steckbrief kaufen), sagt er dem Quest Master, der es als `korrektur` bucht. Das ist bewusst: Erst wenn der Kern läuft, bekommt Dennis eigene Aktionen (Teil B, Stufe 2).

### A6. Zwei Handys

Ein gemeinsames Dokument: `{ config, events[] }`. Der Quest Master hängt Ereignisse an, Dennis' Menü liest und rechnet `reduce` selbst.

- **Einfachster Start:** ein Dokument in Firebase Realtime Database oder Supabase (kostenlos, ein Tag Arbeit inklusive Einrichtung). Beide Views abonnieren dasselbe Dokument. Rollen über zwei Links: der QM-Link enthält einen Schlüssel, der Spieler-Link nicht.
- **Ohne Netz:** Das QM-Handy schreibt lokal weiter und lädt nach, sobald Netz da ist. Dennis' Menü zeigt „Stand von hh:mm". Für den Berg reicht das in v0. Die QR-Übergabe kommt in Teil B.
- **Noch einfacher zum Testen:** beide Sichten auf einem Gerät, Umschalter oben rechts, Dokument im Browser-Speicher. Damit lässt sich die Logik komplett prüfen, bevor ein Backend angefasst wird.

### A7. Was das Menü konkret ändert

- Die Klassen `won / lost / locked` werden aus `state` gesetzt, nicht mehr per Klick. `decide()` und `persist()` in `app.js` entfallen.
- Jeder `selectable` bekommt eine `data-id`, die in `config` existiert (Quest-ID oder Item-ID). Damit ist das Menü an die Konfiguration gebunden und nicht an Texte.
- Die nächste Quest wird hervorgehoben, die Textbox zeigt Name, Ort, Beschreibung.
- Herzen = Berry. Der Rest des HUD bleibt Deko, bis Teil B etwas daraus macht.

### A8. Beispieltag als Ereignisliste (Test für die Logik)

```
config.start.berry = 3, Startitems ring_rieke, proviant, logpose
1. quest  logbuch   bestanden   -> Ziffer 1 bekannt
2. quest  klingen   bestanden   -> Ziffer 2 bekannt, token besitz
3. korrektur berry -1 "Steckbrief Benne"        -> Berry 2
4. quest  auge      bestanden   -> Berry 4 (win.berry +2)
5. quest  feuerprobe verloren   -> Berry 3, logpose verloren (lose.items)
6. undo                          -> Ereignis 5 aufgehoben: Berry 4, logpose besitz
7. quest  feuerprobe bestanden  -> Ziffer 3 bekannt, schild besitz
8. quest  bund      bestanden   -> Ziffer 4 bekannt, Berry 5
Endstand: Berry 5, Ziffern 4/4, Items: ring_rieke, proviant, logpose, token, schild
```

Wenn `reduce` diese Liste so ausrechnet, ist v0 fertig.

---

## Teil B: Ausbaustufen (später, in dieser Reihenfolge)

Jede Stufe fügt hinzu, keine ersetzt etwas aus Teil A.

| Stufe | Was dazukommt | Was es an v0 anhängt |
|---|---|---|
| **1 · Inhalte** | Konkrete Quests, Items, Beschreibungen, Icons. Encounter als Quests mit `typ: "encounter"`. | Nur Konfiguration, keine neue Logik |
| **2 · Aktionen von Dennis** | Er kann Items einsetzen und Berry ausgeben. Jede Aktion ist eine **Anfrage**, die der Quest Master bestätigt. | Neues Ereignis `anfrage` (Dennis) und `antwort` (QM). Bestätigte Anfrage wirkt wie `korrektur`. |
| **3 · Ergebnisse mit Zahlen** | Auge des Jägers 0 bis 5 Treffer, Feuerprobe 1 bis 3 Umschläge, Showdown 0 bis 3 Siege | `quest` bekommt optional `wert`, die Konfiguration bekommt pro Quest eine Tabelle `wert -> Effekt` statt nur win/lose |
| **4 · Stufen bei Items** | Kleine und große Wasserpistole als eine Linie mit „ausgerüstet" | Item bekommt optional `linie` und `stufe`, Dennis darf `ausrüsten` (schreibt ohne Bestätigung) |
| **5 · Flüche** | Negative Effekte nach verlorener Quest, erlösbar | Neuer Status-Typ `fluch` (aktiv, erlöst), `lose.fluch` in der Konfiguration |
| **6 · Verwahrung und Bund** | Token beim Bund, Riekes Botschaft | Item-Status `beim_bund` |
| **7 · Karte und Chronik** | Stationen mit Position, öffentliche Chronik im Menü | Ereignis `position`, Projektion der Ereignisse für Dennis |
| **8 · Funkloch** | QR-Übergabe des Zustands vom QM-Handy an Dennis | Nur Transport, keine Logik |

Die Detailideen zu Stufe 2 bis 8 (Zustandswerte, Ereigniskatalog, Regeltabellen, Screens) stehen in der Git-Historie dieser Datei (Commit „Add system plan") und in `00-spielanleitung.md`. Sie werden geholt, wenn die jeweilige Stufe dran ist, nicht vorher.

---

## Nächster Schritt

Phase 1 aus Teil A: `config` für v0 mit den fünf Kernprüfungen als Quests (win/lose mit Berry, Items, Ziffer) und einer kurzen Item-Liste, plus `reduce` als reine Funktion mit dem Beispieltag aus A8 als Test. Das ist ein Nachmittag und danach lässt sich das Menü daran hängen.
