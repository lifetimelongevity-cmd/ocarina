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
| 10 | Items | **Ein Startitem: der Beutel.** Dazu 6 erspielbare (3 aus Kernprüfungen, 3 aus Sidequests). Keine Stufen. |
| 11 | Verlorenes Item | **Weg.** Kommt in v0 nicht zurück. |
| 12 | Undo | Entfällt als eigene Funktion: Der Quest Master schaltet den Toggle zurück. |
| 13 | Nächste Quest | **Immer die nächste in der Liste**, die noch offen ist. Kein „aktiv". |
| 14 | Quest Master | **Du.** Eine Person, den ganzen Tag. |
| 15 | Zwei Handys | **Deployen, Admin-Menü mit Toggles, Stand wird online gespeichert.** Dennis' Menü liest den gespeicherten Stand. Siehe A7. |

### A1. Vier Begriffe, mehr nicht

| Begriff | Was es ist | Zustand |
|---|---|---|
| **Quest** | Eine Aufgabe in fester Reihenfolge. `typ` ist `kern` oder `side`, die Logik ist dieselbe. | `offen`, `bestanden`, `verloren` |
| **Item** | Ein Gegenstand oder eine Fähigkeit mit einem Satz Wirkung. Kein Unterschied zwischen Ausrüstung und Fähigkeit. | `nicht`, `besitz`, `verloren` |
| **Packs** | Dennis' Anteil an den 10 Packs im Kästchen | Zahl 0 bis 10, Rest gehört dem Bund |
| **Ziffer** | Eine der vier Stellen des Kästchen-Codes | `unbekannt` oder `bekannt` (mit Wert) |

Abgeleitet, nicht gespeichert: **nächste Quest** = die erste Quest mit Status `offen`.

### A2. Die 13 Quests und ihre Effekte

Kernprüfungen tragen die Ziffern, Sidequests tragen Packs und Items. Sidequest-Inhalte sind Platzhalter aus dem Encounter-Pool und werden in Stufe 1 festgezogen.

| # | Quest | Typ | win | lose |
|---|---|---|---|---|
| 1 | Log-Buch | kern | +1, Ziffer 1 | 0 (Ziffer 1 fehlt, muss später gekauft werden) |
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

Verlorene Items: Eine verlorene Quest nimmt nur Items, die in `lose.items` stehen. Hat Dennis das Item nicht, passiert nichts. Weg ist weg.

### A3. Die 7 Items

| Item | Woher | Wirkung (ein Satz, wird in Stufe 1 zur Regel) |
|---|---|---|
| Beutel | Start | Hält alles, was Dennis erspielt. Keine Spielwirkung, das einzige Startitem. |
| Herausforderungs-Token | Kreuzung der Klingen | Im Showdown ein Duell abgeben. |
| Schwert der Verdammnis | Auge des Jägers | Im Showdown einen Gegner streichen. |
| Schild des Bundes | Feuerprobe | Im Showdown ein Duell wiederholen. |
| Große Wasserpistole | Waffenschmied | Mehr Tank beim Auge des Jägers und im Wasserduell. |
| Großer Ring | Ringschmied | Leichteres Ziel beim Ringwurf. |
| Gepanzerte Karten | Kartenwurf | Stabilere Karten beim Kartenwurf. |

Ring der Rieke, Proviant und Log-Pose sind gestrichen, bis Dennis eigene Aktionen hat (Stufe 2).

### A4. Das gespeicherte Dokument (was der Quest Master schaltet)

Es gibt keine Ereignisliste. Gespeichert wird genau das, was der Quest Master im Admin-Menü einstellt:

```
doc = {
  quests: { logbuch: "bestanden", waffenschmied: "verloren", klingen: "offen", ... },   // ein Toggle je Quest
  items:  { schwert: "verloren" },          // nur manuelle Korrekturen, sonst leer
  buchungen: [ { packs: -1, grund: "Steckbrief Benne" }, ... ],   // freie Packs-Buchungen mit Grund
  ziffern_gekauft: [1]                      // welche Ziffern Dennis gekauft hat
}
```

Bedienelemente im Admin-Menü:

| Element | Schreibt | Rückgängig |
|---|---|---|
| Toggle je Quest: offen / bestanden / verloren | `doc.quests[id]` | Toggle zurückstellen |
| Buchung: Packs ±n mit Grund (Buttons für die üblichen Gründe) | `doc.buchungen[]` | Eintrag löschen |
| Ziffer gekauft | `doc.ziffern_gekauft[]` plus Buchung −1 | Eintrag löschen |
| Item manuell geben oder nehmen (selten) | `doc.items[id]` | Eintrag löschen |

### A5. Zustand = Konfiguration + Dokument

```
function derive(config, doc) {
  packs = config.waehrung.start
  items = {}; für jedes Item: items[id] = "nicht"; für jedes Startitem: items[id] = "besitz"
  ziffern = [null, null, null, null]

  für jede Quest q in config.quests (in Reihenfolge):
    status = doc.quests[q.id] || "offen"
    wenn status == "bestanden":
      packs += q.win.packs
      für item in q.win.items:  items[item] = "besitz"
      wenn q.win.ziffer:        ziffern[q.win.ziffer - 1] = config.code[q.win.ziffer - 1]
    wenn status == "verloren":
      packs += q.lose.packs
      für item in q.lose.items: wenn items[item] == "besitz": items[item] = "verloren"

  für jede Buchung b in doc.buchungen:      packs += b.packs
  für jede Ziffer z in doc.ziffern_gekauft: ziffern[z - 1] = config.code[z - 1]
  für jedes id in doc.items:                items[id] = doc.items[id]   // Korrektur schlägt Regel

  packs = clamp(packs, 0, 10)
  next  = erste Quest in Reihenfolge mit status "offen"
  return { packs, items, ziffern, quests: status je Quest, next }
}
```

Reine Funktion, beide Sichten rechnen sie selbst aus demselben Dokument. Das Dokument beschreibt den Stand, nicht den Weg dorthin. Deshalb ist Zurückschalten immer sauber, und der Deckel 0 bis 10 gilt einmal am Ende.

### A6. Zwei Sichten auf denselben Zustand

| | Quest Master | Dennis |
|---|---|---|
| Packs | ja | ja |
| Items | alle mit Status | alle mit Status (grau = nicht, Kreuz = verloren) |
| Quests | alle, mit Buttons „bestanden" / „verloren" | alle mit Status, die nächste hervorgehoben, mit Ort und Beschreibung |
| Ziffern | alle vier Werte | nur bekannte, Rest `?` |
| Ereignisse | Liste, „Rückgängig", „Korrektur" | nichts |

Dennis schreibt in v0 nichts. Er wählt Items nur zum Ansehen. Alles, was er im Spiel tut, sagt er dem Quest Master, der es bucht. Eigene Aktionen für Dennis sind Stufe 2.

### A7. Deployen und speichern

Genau so, wie du es beschrieben hast: Die Seite wird einmal deployt, es gibt ein Admin-Menü mit Toggles, jede Änderung wird online gespeichert, Dennis' Menü liest den gespeicherten Stand.

- **Eine Seite, zwei Ansichten.** `index.html` ist Dennis' Menü (liest). `admin.html` ist dein Menü (schreibt). Der Admin-Link enthält einen langen Schlüssel, ohne den die Seite nicht schreibt.
- **Speicher:** ein einziges JSON-Dokument (`doc` aus A4) in Firebase Realtime Database. Kostenlos, Echtzeit, JS ohne Build-Schritt, läuft auf statischem Hosting wie deiner jetzigen Seite. Supabase ginge genauso. Dennis' Seite abonniert das Dokument und rechnet `derive` bei jeder Änderung neu.
- **Ohne Netz:** Firebase puffert Schreibzugriffe lokal und schickt sie nach, sobald Netz da ist. Dennis' Menü zeigt „Stand von hh:mm".
- **Einrichtung:** Firebase-Projekt anlegen, Realtime Database aktivieren, Regel „lesen für alle, schreiben nur unter einem Pfad mit Schlüssel", leeres Dokument anlegen. Eine Stunde, einmalig.

Alternative ohne eigenes Backend wäre ein Claude-Artifact mit geteilter Datenbank. Nachteil: Dennis bräuchte am Berg einen claude.ai-Login mit Zugriff. Für den Spieltag nicht empfohlen, zum schnellen Ausprobieren der Logik möglich.

### A8. Was das Menü konkret ändert

- `won / lost / locked` werden aus `state` gesetzt, nicht per Klick. `decide()` und `persist()` in `app.js` entfallen.
- Jeder `selectable` bekommt eine `data-id`, die in `game-config-v0.json` existiert.
- Die nächste Quest wird hervorgehoben, die Textbox zeigt Name, Ort, Beschreibung.
- Herzen = Packs (10 Herzen, gefüllt = Dennis). Der Rest des HUD bleibt Deko bis Teil B.
- Sechs Medaillons = die sechs Kernprüfungen in Konfigurationsreihenfolge (Prophezeiung zuletzt, weil sie in der Hütte gebucht wird). Sidequests bekommen eine eigene Reihe oder die Steine.

### A9. Beispielstand (Test für `derive`)

```
doc = {
  quests: { logbuch: "bestanden", waffenschmied: "bestanden", klingen: "bestanden",
            auge: "verloren", ringschmied: "bestanden", kartenwurf: "verloren",
            nakama: "bestanden", feuerprobe: "bestanden" },
  items: {},
  buchungen: [ { packs: -1, grund: "Steckbrief Benne" } ],
  ziffern_gekauft: []
}
Packs:    +1 +1 +1 -1 +1 -1 +1 +1 = 4, Buchung -1 = 3
Ziffern:  [7, 4, 2, null]
Items:    besitz  beutel, token, ring_gross, schild
          verloren pistole_gross (Waffenschmied gibt sie, Auge des Jägers nimmt sie)
          nicht   schwert, karten_gepanzert
next:     "sss"
```

Wenn `derive` genau das liefert, ist v0 fertig. Der Test zeigt auch die Reihenfolge-Regel: Waffenschmied steht vor dem Auge des Jägers.

---

## Teil B: Ausbaustufen (später, in dieser Reihenfolge)

| Stufe | Was dazukommt | Was es an v0 anhängt |
|---|---|---|
| **1 · Inhalte** | Sidequests konkret, Beschreibungen, Icons, Orte | Nur Konfiguration |
| **1b · Startitems** | Ring der Rieke, Proviant, Log-Pose zurück, sobald Dennis Aktionen hat | Konfiguration plus Stufe 2 |
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

`derive` als reine Funktion gegen `game-config-v0.json` mit dem Stand aus A9 als Test. Dann `admin.html` mit den Toggles, dann Dennis' Menü an `derive` hängen, dann Firebase dazwischen.
