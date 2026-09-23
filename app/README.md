# Dennis Quest · App v0

Zwei Seiten, ein gespeicherter Stand.

| Seite | Wer | Was |
|---|---|---|
| `index.html` | Dennis | Pausenmenü. Zeigt Packs, Ziffern, Quests, Items, Karte und die nächste Quest. Schreibt nichts. Tippen auf ein Feld zeigt die Beschreibung. |
| `admin.html` | Quest Master | Status je Quest (offen, bestanden, verloren), Packs buchen, Ziffern kaufen, Items korrigieren, Zurücksetzen. |

## Dateien

| Datei | Inhalt |
|---|---|
| `config.js` | Alles, was das Spiel kennt: Packs (max, Start), Code, Items, Quests mit Sieg und Niederlage, Speicher. **Hier werden Quests und Items ergänzt.** |
| `engine.js` | Die Logik. Rechnet aus Konfiguration und gespeichertem Stand alles aus, was angezeigt wird. |
| `store.js` | Speicher. `lokal` (ein Browser, zum Testen) oder `firebase` (zwei Handys). |
| `app.js`, `styles.css` | Dennis' Menü. Navigation und Optik aus der ursprünglichen Version, Anzeige jetzt aus dem Stand. |
| `admin.js`, `admin.css` | Quest-Master-Menü. |
| `engine.test.js` | Test der Logik: `node engine.test.js` |

## Lokal ausprobieren

```
cd jga-dennis/app
python3 -m http.server 8000
```

Dann `http://localhost:8000/admin.html` und `http://localhost:8000/` in zwei Tabs desselben Browsers öffnen. Was du im Admin schaltest, erscheint sofort im Menü.

## Aktueller Stand

Firebase ist eingerichtet und in `config.js` eingetragen (`dennis-quest-default-rtdb.europe-west1.firebasedatabase.app`, Spiel `dennis-jga-2026`). Lesen und Schreiben aus zwei getrennten Browsern ist getestet. Für einen reinen Test auf einem Gerät ohne Datenbank in `config.js` `typ: "lokal"` setzen.

Verbindung: Die App nutzt den Live-Stream von Firebase. Kommt der nicht zustande (schwaches Netz), fragt sie alle 4 Sekunden ab. Nicht gesendete Änderungen am Admin-Handy werden gespeichert und automatisch nachgeschickt, auch nach Neuladen der Seite.

## Für zwei Handys: Firebase einrichten (einmalig, etwa 20 Minuten)

1. Auf console.firebase.google.com ein Projekt anlegen (Analytics kann aus bleiben).
2. Links „Realtime Database" öffnen, „Datenbank erstellen", Standort Europa, im **gesperrten Modus** starten.
3. Unter „Regeln" eine der beiden Varianten eintragen und veröffentlichen.

   Einfach (jeder mit Link könnte technisch schreiben, für einen JGA meist genug):
   ```
   { "rules": { "spiele": { "$spiel": { ".read": true, ".write": true } } } }
   ```

   Geschützt (nur der Admin-Link mit Schlüssel schreibt):
   ```
   { "rules": { "spiele": { "$spiel": { ".read": true, ".write": false } } } }
   ```
   Den Schlüssel findest du unter Projekteinstellungen → Dienstkonten → Datenbank-Secrets. Dein Admin-Link lautet dann `…/admin.html#key=DEIN_SECRET`. Das Handy merkt sich den Schlüssel, der Link wird danach ohne ihn angezeigt. Den Link niemandem schicken.
4. Oben in der Realtime Database steht die URL (z. B. `https://dennis-quest-default-rtdb.europe-west1.firebasedatabase.app`). In `config.js` eintragen:
   ```
   speicher: { typ: "firebase", spielId: "dennis-jga-2026", databaseURL: "https://…firebasedatabase.app" }
   ```
5. Ordner neu deployen.

Ohne Netz puffert das Admin-Handy Änderungen und schickt sie nach, sobald wieder Netz da ist. Dennis' Menü zeigt unten rechts „Stand hh:mm" bzw. „Offline".

## Deployen

Den ganzen Ordner `app/` auf denselben Host hochladen wie bisher. Dennis bekommt die Startadresse, du nutzt `/admin.html`.

## Neue Quests oder Items

Nur `config.js` ändern. Eine Quest hat `typ` (`kern` für die sechs Medaillons, `side` für die Steine), `station` (Punkt auf der Karte), `win` und `lose` mit `packs`, `items` und bei `win` optional `ziffer`. Danach `node engine.test.js` laufen lassen. Die Tests prüfen den Beispielstand aus `05-system-plan.md` und müssen bei Änderungen an Werten angepasst werden.
