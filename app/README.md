# Dennis Quest · App v1

Zwei Seiten, ein gespeicherter Stand.

| Seite | Wer | Was |
|---|---|---|
| `index.html` | Dennis | Menü im N64-Stil: Startbildschirm, drei Seiten KARTE, QUESTS, AUSRÜSTUNG, HUD mit Packs, nächster Quest und Code. Ergebnis-Fenster nach jeder Buchung. Schreibt nur seine Antworten im Log-Buch. |
| `admin.html` | Quest Master | Nächste Quest mit Bestanden/Verloren, Einsetzen, Showdown-Duellen und Log-Buch-Antworten. Laufende Quests (Prophezeiung mit Zähler, Rikes Amulett), Packs buchen, Ziffern kaufen, Items korrigieren, Zurücksetzen. Oben rechts **Rückgängig** für jede Änderung. `admin.html?probe` ist der **Probelauf**. |

Adressen: Dennis `https://dd-ocarina.netlify.app/`, Quest Master `https://dd-ocarina.netlify.app/admin.html`.
Zusätze für Dennis' Seite: `?probe` (liest den Probelauf des Quest Masters, roter Rahmen), `?demo` (Beispielstand mit Demo-Knöpfen, ohne Datenbank, auch `?demo=start`, `?demo=ende`), `?direkt` (ohne Startbildschirm), `?onboarding` (Beutel-Onboarding noch einmal), `?schwach` (Sparmodus erzwingen). Die alte Adresse `entwurf.html` leitet auf die Hauptseite um.

## Dateien

| Datei | Inhalt |
|---|---|
| `config.js` | Alles, was das Spiel kennt: Quests (Reihenfolge, Texte, Belohnungen, einsetzbar), Items und Fähigkeiten mit Tarnnamen, Kartenstationen, Log-Buch-Fragen, Code, Packs, Speicher. **Hier wird ergänzt.** |
| `engine.js` | Die Logik. Rechnet aus Konfiguration und gespeichertem Stand alles aus: Packs, Ziffern, Items, Anzahl Spruchrollen, nächste Quest, laufende Quests, Showdown-Duelle, was wo einsetzbar ist. |
| `store.js` | Speicher. `lokal` (ein Browser, zum Testen) oder `firebase` (zwei Handys). Dazu der Kanal für Dennis' Log-Buch-Antworten. |
| `app.js`, `styles.css`, `index.html` | Dennis' Menü. |
| `admin.js`, `admin.css`, `admin.html` | Quest-Master-Menü. |
| `sw.js` | Offline-Speicher: Die App startet auch im Funkloch, Rikes Sprachnachrichten werden vorab geladen. |
| `manifest.webmanifest`, `admin.webmanifest` | Für „Zum Home-Bildschirm". Dennis: grünes Icon, Quest Master: rotes Icon mit QM. |
| `assets/` | Titelbild (`intro-titel.webp`, Fee separat `intro-fee.png`), Avatar (`avatar-okarina.webp`), Icons (`icons/`), Schriften, `logbuch/` für Rikes Sprachnachrichten. Originale der Bilder liegen außerhalb der App in `quellen/`. |
| `engine.test.js` | Test der Logik: `node app/engine.test.js` |

## Gespeicherter Stand

```
/spiele/dennis-jga-2026            { quests, zaehler, schritte, einsaetze, duelle, buchungen, items, zeiten, stand }   schreibt nur der Admin
/spiele/dennis-jga-2026-logbuch    { "1": { antwort, zeit }, … }                                              schreibt nur Dennis (Log-Buch)
```

Die Log-Buch-Antworten liegen bewusst neben dem Spiel, damit das Speichern im Admin sie nie überschreibt.

**Packs** zählen Schritt für Schritt in der Reihenfolge, in der gebucht wurde (`zeiten` je Quest, `zeit` je Buchung), und bleiben immer zwischen 0 und `waehrung.max`: Wer bei 0 verliert, verliert nichts, was über den Deckel geht, verfällt. Dennis sieht dann eine Zeile dazu, der Admin zeigt unter „Packs buchen“, wie viel davon betroffen war. Balance nachrechnen: `node tests/balance.js`.

## Probelauf (zwei Handys, echtes Spiel unberührt)

- Quest Master: `admin.html?probe` (oder im Admin unten „Probelauf öffnen“). Oben steht ein rotes Band.
- Zweites Handy: `dd-ocarina.netlify.app/?probe`. Dennis' Seite mit rotem Rahmen und „PROBE“ unten links. Vom Home-Bildschirm aus heißt sie „DQ Probe“ und startet wieder im Probelauf.
- Gespeichert wird in eigenen Pfaden (`/spiele/dennis-jga-2026-probe`, Log-Buch `…-probe-logbuch`), das echte Spiel sieht davon nichts.
- Sprungknöpfe: Start, Nach dem Zug, Mitte, Vor dem Bund, Ende, Zufall. Danach ganz normal weiterbuchen.
- Test im Browser: `tests/probe.mjs`.

## Ablauf am Spieltag (Quest Master)

- **Vertippt:** Oben rechts **Rückgängig**. Darunter steht, was zurückgenommen wird. Nimmt jede Änderung zurück, auch Sprünge und „Alles zurücksetzen“, bis zu 40 Schritte, und merkt sich das auch nach dem Neuladen. Ist bei Dennis das Ergebnis-Fenster noch offen, geht es still zu.

- **Reihe:** Oben steht die nächste Quest. Bestanden oder Verloren tippen. Dennis sieht das Ergebnis-Fenster, danach tritt die nächste Quest aus dem Nebel.
- **Einsetzen:** Dennis sagt an, was er einsetzt. Unter der nächsten Quest (und bei laufenden Quests) stehen die Knöpfe, aktiv nur, was er hat. Spruchrolle und Schild sind danach weg. Falsch gebucht: im Bereich „Eingesetzt" mit ✕ zurücknehmen.
- **Prophezeiung:** morgens „Starten", jede erfüllte Vorhersage „+1 Treffer" (gibt eine Spruchrolle), abends „Beenden".
- **Rikes Amulett:** „Starten", wenn die Brosche versteckt ist, „Gefunden", dann Bestanden oder Verloren.
- **Showdown:** Die App zeigt die drei Duelle (verlorene Spiele vom Tag zuerst, aufgefüllt mit Wirbel der Götter). Je Duell Sieg oder Niederlage tippen, dann die Prüfung buchen.
- **Log-Buch:** Dennis' Antworten erscheinen live unter der Quest und unten im Bereich Log-Buch.

## Auf den Startbildschirm (App installieren)

Auf dem Startbildschirm des Spiels steht oben rechts **APP INSTALLIEREN**, solange die App nicht installiert ist.

- **Android (Chrome, Samsung Internet):** Ein Tipp öffnet das Fenster „App installieren?", noch ein Tipp, fertig. Wurde das Fenster einmal weggetippt, zeigt der Knopf bis zum nächsten Laden die Handgriffe von Hand.
- **iPhone:** Apple erlaubt keiner Webseite, sich selbst zu installieren. Der Knopf zeigt die Anleitung (Teilen, „Zum Home-Bildschirm").
- Vom Startbildschirm aus geöffnet, ist der Knopf weg.

## Lokal ausprobieren

```
cd app
python3 -m http.server 8000
```

`http://localhost:8000/?demo` zeigt Dennis' Menü mit Demo-Knöpfen ohne Datenbank. Für Admin und Dennis zusammen in `config.js` `typ: "lokal"` setzen und beide Seiten in zwei Tabs desselben Browsers öffnen.

Geräte-Test (iPhone 13 und 15 in Safari und vom Home-Bildschirm, Samsung mit gedrosselter CPU): `tests/geraete.mjs`, siehe Kopf der Datei.

## Firebase

Eingerichtet und in `config.js` eingetragen (`dennis-quest-default-rtdb.europe-west1.firebasedatabase.app`, Spiel `dennis-jga-2026`). Regeln unter „Realtime Database → Regeln":

Einfach (jeder mit Link könnte technisch schreiben, für einen JGA meist genug):
```
{ "rules": { "spiele": { "$spiel": { ".read": true, ".write": true } } } }
```

Geschützt (nur der Admin-Link mit Schlüssel schreibt das Spiel, Dennis darf nur ins Log-Buch):
```
{ "rules": { "spiele": {
    "$spiel": { ".read": true, ".write": "$spiel.endsWith('-logbuch')" }
} } }
```
Den Schlüssel findest du unter Projekteinstellungen → Dienstkonten → Datenbank-Secrets. Dein Admin-Link lautet dann `…/admin.html#key=DEIN_SECRET`. Das Handy merkt sich den Schlüssel. Den Link niemandem schicken.

Ohne Netz puffert das Admin-Handy Änderungen und schickt sie nach. Dennis' Antworten im Log-Buch werden genauso nachgereicht. Dennis' Menü zeigt unten rechts „Stand hh:mm" bzw. „Offline".

## Deployen

Netlify ist mit dem Repo verknüpft: Jeder Push auf `main` ist nach wenigen Sekunden live (`netlify.toml` veröffentlicht den Ordner `app/`).

## Neue Quests oder Items

Nur `config.js` ändern, danach `node app/engine.test.js`. Die Tests prüfen auch die Konfiguration selbst: jede Quest hat Station und Text, jede Prüfung Farbe und Emblem, jedes Item wird irgendwo gewonnen und irgendwo eingesetzt.

- Quest: `typ` (`kern` Prüfung mit Medaillon, `side` Sidequest, `lauf` läuft neben der Reihe), `station`, `text`, `qm` (Notiz nur für dich), `win`/`lose` mit `packs`, `items`, bei `win` optional `ziffer`, `einsetzbar` (Liste von Item-IDs), `duell`, `revanche` (kommt im Showdown wieder, wenn verloren).
- Item: `gruppe` (`item` links, `faehigkeit` rechts), `stapel` (mehrfach), `einmalig` (nach dem Einsetzen weg), `symbol`, `farbe`, `text`, `tarn` (Name, bis Dennis es erspielt).
