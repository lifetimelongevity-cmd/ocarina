# Dennis Quest · App v1

Zwei Seiten, ein gespeicherter Stand.

| Seite | Wer | Was |
|---|---|---|
| `index.html` | Dennis | Menü im N64-Stil: Startbildschirm, beim ersten Start der Prolog mit Rikes Fee, drei Seiten KARTE, QUESTS, AUSRÜSTUNG, HUD mit Packs, nächster Quest und Code. **Trägt selbst ein** (seit 27.09.): Ergebnis, Einsatz, Duelle, Rikes Amulett, fehlende Ziffern am Tor zum Gipfel, jeweils mit gedrückt gehaltenem Siegel. Ergebnis-Fenster sofort, auch ohne Netz, verpasste Momente nach PRESS START. Schreibt dazu seine Log-Buch-Antworten. |
| `admin.html` | Quest Master | Schiedsrichter, seit 30.09. auf das Nötigste reduziert: oben Packs, Code und **Rückgängig**, dann die nächste Quest mit deiner Notiz, Einsetzbarem, Duellen und Tagebuch-Antworten (Bestanden/Verloren nur als Notfall), darunter ein einziger **Verlauf** mit allem, was Dennis eingetragen und du gebucht hast (**Zurücknehmen**, die Fee sagt es Dennis), dann Rikes Amulett. Zugeklappt unten: Quests (Status korrigieren), Buchen (Schnellbuchungen, Ziffern, eigene Buchung), Ausrüstung, Tagebuch, Spiel (Links, Zurücksetzen). `admin.html?probe` ist der **Probelauf**. |

Adressen: Dennis `https://docarina.vercel.app/`, Quest Master `https://docarina.vercel.app/admin.html`.
Zusätze für Dennis' Seite: `?probe` (liest den Probelauf des Quest Masters, roter Rahmen), `?demo` (Beispielstand mit Demo-Knöpfen, ohne Datenbank, auch `?demo=start`, `?demo=bund` kurz vor dem Showdown, `?demo=ende`), `?direkt` (ohne Startbildschirm), `?onboarding` (Prolog, Hinweise auf der Karte und Beutel-Onboarding noch einmal, auch später am Tag. Ohne diesen Zusatz kommt das Onboarding nur am Anfang des Spiels, solange noch keine Quest entschieden ist, in der Demo also nur mit `?demo=start`), `?schwach` (Sparmodus erzwingen). Die alte Adresse `entwurf.html` leitet auf die Hauptseite um.

## Dateien

| Datei | Inhalt |
|---|---|
| `config.js` | Alles, was das Spiel kennt: Quests (Reihenfolge, Texte, Belohnungen, einsetzbar), Items und Fähigkeiten mit Tarnnamen, Kartenstationen, Log-Buch-Fragen, Code, Packs, Speicher. **Hier wird ergänzt.** |
| `weg.js` | Der echte Weg (Bahnhof Tegernsee, Wanderweg 681a, Neureuth): Höhe an jeder Stelle, Strecke bis zum Gipfel, Stellen der Stationen am Weg. Reine Funktionen, getestet in `engine.test.js`. |
| `engine.js` | Die Logik. Rechnet aus Konfiguration und gespeichertem Stand alles aus: Packs, Ziffern, Items, Anzahl Flüche, Tor zum Gipfel, nächste Quest (`kommt`: die erste offene, `next`: erst wenn du sie freigegeben hast, `ende`: alles erledigt), laufende Quests, Showdown-Duelle, was wo einsetzbar ist. |
| `store.js` | Speicher. `lokal` (ein Browser, zum Testen) oder `firebase` (zwei Handys). Dazu die Kanäle, in die Dennis schreibt: Log-Buch-Antworten und seine Einträge. |
| `app.js`, `styles.css`, `index.html` | Dennis' Menü. |
| `admin.js`, `admin.css`, `admin.html` | Quest-Master-Menü. |
| `sw.js` | Offline-Speicher: Die App startet auch im Funkloch, Rikes Sprachnachrichten werden vorab geladen. |
| `manifest.webmanifest`, `admin.webmanifest` | Für „Zum Home-Bildschirm". Dennis: grünes Icon, Quest Master: rotes Icon mit QM. |
| `assets/` | Titelbild (`intro-titel.webp`, Fee separat `intro-fee.png`), Avatar (`avatar-okarina.webp`), Icons (`icons/`), Schriften, `logbuch/` für Rikes Sprachnachrichten. Originale der Bilder liegen außerhalb der App in `quellen/`. |
| `engine.test.js` | Test der Logik: `node app/engine.test.js` |

## Karte (seit 26.09.)

- **Weg:** gegangener Weg golden, der Rest gestrichelt. Gibst du die nächste Quest frei (seit 30.09., siehe Ablauf am Spieltag), sagt die Fee, wohin es geht, und Dennis wandert auf der Karte zur Station, bis dahin steht er an der alten. Der Nebel treibt und zieht beim Weiterkommen ab.
- **Station antippen:** Tafel mit Ort, Höhe, Kilometer ab Bahnhof und den Quests der Station (Nebel bleibt dicht, verdeckte Sidequests fehlen ganz). Eine Zeile antippen öffnet die Quest, zweites Tippen auf die Station ebenso. An der Hütte: das Kästchen mit dem Code („Verschlossen, noch N Ziffern“). Was darin liegt (10 Packs als Überraschung), verrät die App nicht.
- **Kartusche oben links:** Höhe, „Noch 2,5 km · 351 Hm bis zum Gipfel“ und das Höhenprofil des echten Wegs.
- **Kein GPS** (seit 30.09., vorher Feenlicht am Weg per Knopf): Die Station wechselt nur, wenn du die nächste Quest freigibst. Das ist verlässlich, auch im Funkloch und mit der App in der Tasche.
- **Daten:** `config.karte.weg` (OpenStreetMap, Höhen EU-DEM) und je Station `gps`, nur noch für Höhe und Kilometer in der Kartusche.
- Test im Browser: `tests/karte.mjs` (Laufen, Tafeln, Prolog), `tests/freigabe.mjs` (Freigabe, Wandern, Nebel).

## Gespeicherter Stand

```
/spiele/dennis-jga-2026            { quests, glanz, zaehler, schritte, einsaetze, duelle, buchungen, items, zeiten, stand, neustart, frei }   schreibt nur der Admin
/spiele/dennis-jga-2026-logbuch    { "1": { antwort, zeit }, … }                                              schreibt Dennis (Log-Buch)
/spiele/dennis-jga-2026-dennis     { q_klingen: { status, zeit }, q_kartenwurf: { status: "bestanden", glanz: true, zeit }, e_…: { item, quest, zeit }, d_2: { ergebnis, zeit },
                                     s_amulett_gefunden: { zeit }, z_3: { zeit } }                            schreibt Dennis, der Admin löscht
```

Dennis' Antworten und Einträge liegen bewusst neben dem Spiel, damit das Speichern im Admin sie nie überschreibt. Jeder Eintrag wird einzeln geschrieben, ohne Netz im Handy gepuffert und nachgeschickt. `engine.js` (`mitEintraegen`) rechnet die Einträge in das Dokument des Admins ein. Hat der Admin selbst etwas entschieden, gilt seine Buchung.

**Packs** zählen Schritt für Schritt in der Reihenfolge, in der gebucht wurde (`zeiten` je Quest, `zeit` je Buchung), und bleiben immer zwischen 0 und `waehrung.max`. Die Zahl sind Dennis' **geschlossene** Packs (seit 29.09., wie Rubine): Öffnet er eins (Buchung mit `offen: true`, von ihm per Siegel oder von dir per Schnellbuchung „Pack geöffnet“), geht sie eins runter. Kostet etwas mehr, als er geschlossen hat, zahlt er den Rest in Karten, pro Pack seine beste aus einem geöffneten, höchstens eine je geöffnetem Pack. Hat er gar nichts, verpufft der Rest, was über den Deckel geht, verfällt. Dennis sieht dann eine Zeile dazu, der Admin zeigt unter „Packs buchen“ die Karten an den Bund und was verpufft ist. Balance nachrechnen: `node tests/balance.js`.

## Probelauf (zwei Handys, echtes Spiel unberührt)

- Quest Master: `admin.html?probe` (oder im Admin unten „Probelauf öffnen“). Oben steht ein rotes Band.
- Zweites Handy: `docarina.vercel.app/?probe`. Dennis' Seite mit rotem Rahmen und „PROBE“ unten links. Vom Home-Bildschirm aus heißt sie „DQ Probe“ und startet wieder im Probelauf.
- Gespeichert wird in eigenen Pfaden (`/spiele/dennis-jga-2026-probe`, Log-Buch `…-probe-logbuch`), das echte Spiel sieht davon nichts.
- Sprungknöpfe: Start, Nach dem Zug, Mitte, Vor dem Bund, Ende, Zufall. Danach ganz normal weiterbuchen.
- Test im Browser: `tests/probe.mjs`.

## Ablauf am Spieltag (Quest Master)

- **Vertippt:** Oben rechts **Rückgängig**. Darunter steht, was zurückgenommen wird. Nimmt jede Änderung zurück, auch Sprünge und „Alles zurücksetzen“, bis zu 40 Schritte, und merkt sich das auch nach dem Neuladen. Ist bei Dennis das Ergebnis-Fenster noch offen, geht es still zu.

- **Freigeben** (seit 30.09., kein GPS): Dennis sieht die nächste Quest erst, wenn du sie freigibst. Oben unter „Jetzt“ steht die Quest, die kommt, mit dem großen Knopf **Nächste Quest freigeben**. Drück ihn, wenn ihr an der Station seid (am Freitag im Zug fürs Tagebuch, am Samstag an jeder Station, auch zwischen zwei Quests an derselben Station). Bei Dennis sagt die Fee „Weiter zur WIESE“, er wandert auf der Karte dorthin, dann tritt die Quest aus dem Nebel. Bis dahin steht in seinem HUD nur „Weiter zur WIESE“ (am Anfang „Die Reise beginnt bald“). Die Freigabe steht im Verlauf, **Löschen** holt sie still zurück, Rückgängig ebenso. Ist bei Dennis noch das Ergebnis-Fenster offen, kommt die Freigabe danach dran. Notfall-Knöpfe und Einsetzen wirken auch ohne Freigabe auf die Quest, die kommt.
- **Dennis trägt selbst ein** (seit 27.09.): Auf seiner Quest-Karte stehen BESTANDEN und VERLOREN, er hält das Siegel gedrückt, bis sich der Ring schließt, dann läuft sofort der Moment. Genauso setzt er Items und Fähigkeiten ein (antippen, Siegel halten), trägt am Gipfel jedes Duell ein, meldet bei Rikes Amulett „Gefunden“ und „Zusammengesetzt“ und holt am Tor zum Gipfel fehlende Ziffern. Du siehst alles im Admin im **Verlauf** mit Uhrzeit, dazu eine kurze Meldung unten.
- **Zurücknehmen:** Stimmt etwas nicht, tippst du bei seinem Eintrag auf **Zurücknehmen**. Die Quest ist wieder offen, Packs und Items springen zurück, und die Fee sagt es Dennis („Der Quest Master hat das Ergebnis von Kartenwurf zurückgenommen. Trag es neu ein.“). Rückgängig oben holt den Eintrag zurück. Auch „Offen“ bei einer Quest, ein zweiter Tipp auf ein gesetztes Duell und das Ausschalten von „Gefunden“ nehmen seinen Eintrag mit zurück.
- **Notfall:** Unter der nächsten Quest stehen klein Bestanden und Verloren, dazu Einsetzen und die Duelle, zum Beispiel wenn sein Akku leer ist. Was du buchst, gilt vor seinem Eintrag und steht auch im Verlauf (Löschen nimmt es zurück).
- **Belohnungen (seit 28.09.):** Hauptquests geben Packs und eine Ziffer oder ein Item, Sidequests und die laufenden Quests eine Fähigkeit (Fluch, Schild, Rikes Segen). Jede Niederlage kostet nur Packs.
- **Fluch (seit 29.09.):** Dennis gewinnt zwei (Die drei Zeichen, Kartenwurf). Spricht er einen, gibst du ihm beim Spiel den Vorteil, der im Admin unter „Fluch hier“ und im Verlauf steht (zum Beispiel 3 Sekunden mehr im Podrennen). Danach stiehlt ihm der Schattendieb 0 bis 3 Packs, das Handy würfelt. Zurücknehmen gibt die Packs zurück.
- **Packs unterwegs öffnen (seit 29.09.):** Dennis tippt oben auf seine Packs, dann PACK ÖFFNEN und hält das Siegel. Du siehst „Pack geöffnet (−1, gib ihm eins)“ und gibst ihm ein Pack. Oben im Admin steht neben den Packs, wie viele offen sind. Verliert er später und hat keine geschlossenen mehr, steht über dem Verlauf: **Karten an den Bund: N**. Dann nimmst du dir pro Pack seine beste Karte aus einem geöffneten. Du kannst das Öffnen auch selbst buchen (Schnellbuchung „Pack geöffnet“).
- **Rikes Rache (seit 29.09.):** Hauptquest am Aussichtspunkt nach Hüter der Flamme, Faden durchs Nadelöhr auf Zeit, trägt Ziffer 4. Es zählt die dickste Nadel, die Dennis hat: ohne Item feine Nadeln, mit der Stopfnadel (Sieg im Wirbel) oder der dicken Nadel (Sieg am Deku-Baum) entsprechend dickere. Das genaue Spiel legst du fest, der Vorschlag steht im Admin als Notiz.
- **Tor zum Gipfel:** Ohne alle vier Ziffern kein Finale. Fehlt eine, zeigt Dennis' Quest-Karte am Gipfel das Tor: Er holt die Ziffer für 2 Packs (fehlen ihm geschlossene, zahlt er den Rest in Karten), mit Rikes Segen (aus dem Amulett) oder per Bußprüfung. Die Buße bestimmst du, er besiegelt sie erst, wenn er sie bestanden hat. Du kannst die Ziffer auch selbst buchen (unter „Buchen“: kaufen oder per Buße). Erst dann erscheinen bei ihm die Duelle.
- **Rikes Amulett:** „Starten", wenn die Brosche versteckt ist. Dennis meldet „Gefunden“ und „Zusammengesetzt“. Verpasst er die Frist, buchst du Verloren.
- **Showdown:** Dennis sieht am Gipfel die Duell-Tafel (verlorene Spiele vom Tag zuerst, aufgefüllt mit Wirbel der Götter) und trägt jedes Duell ein. Nach der Mehrheit trägt er die Prüfung ein. Den Schild setzt er vor dem Besiegeln einer Niederlage ein und spielt das Duell noch einmal.
- **Rikes Tagebuch** (intern Log-Buch, hieß bis 28.09. so): Dennis' Antworten erscheinen live unter der Quest und unter „Tagebuch“. Sind alle sieben besiegelt, trägt er das Ergebnis selbst ein.
- **Die drei Zeichen** (Schnick Schnack Schnuck, zwei Gegner nacheinander, jeweils Best of 3) und **Hüter der Flamme** (offenes Teelicht 100 Schritte bergauf, der Bund lenkt ab, pustet nicht) ersetzen seit 28.09. Kreuzung der Klingen und Feuerprobe. Für Hüter der Flamme Feuerzeug und Ersatz-Teelicht einpacken.
- **Glanzsieg (Kartenwurf):** Gewinnt Dennis mit mindestens 2 Karten Vorsprung, trägt er GLANZSIEG ein und bekommt zusätzlich zum Fluch die Große Wasserpistole (Monsterpistole). Du siehst „Kartenwurf: Glanzsieg“. Stimmt es nicht, tippst du beim Kartenwurf auf **Bestanden**: Es bleibt ein Sieg, die Pistole ist weg, die Fee sagt es ihm. Umgekehrt bucht **Glanzsieg** (unter „Quests“ oder bei der nächsten Quest neben Bestanden) ihn nachträglich.
- **Wasserwaffen:** Spritze (hat Dennis von Anfang an: Beim ersten Besuch der Ausrüstung entpuppt sich der Heilige Beutel des Helden als Spritze, im selben Feld), kleine Pistole (Podrennen), große Pistole (Glanzsieg im Kartenwurf). Im Auge des Jägers zählt die stärkste, nur sie leuchtet bei ihm.
- **Verpasste Momente:** War Dennis' App zu oder ohne Netz, laufen die Momente nach PRESS START nacheinander ab. Die nächste Quest tritt erst danach aus dem Nebel. Was du in der Zeit zurückgenommen hast, kommt gesammelt in einem Fenster.
- **Finale** (seit 29.09.): Ist die Prüfung des Bundes entschieden und Dennis schließt das Ergebnis-Fenster, kommt der Siegbildschirm, dann die Geschichte von Rike und Dennis als Laufschrift wie bei Star Wars (knapp eine Minute) und der Abspann (45 s), der bei THE END mit dem Code stehen bleibt. Das läuft einmal pro Handy von selbst, danach über das Code-Fenster (ABSPANN). Ton an, dann läuft die eigene Musik mit. Namen, Geschichte und „Fortsetzung folgt“ stehen in `config.js` unter `abspann`. Nimmst du den Bund zurück, geht das Finale bei Dennis still zu. Anschauen ohne Spiel: `docarina.vercel.app/?demo=ende&direkt`.
- **Alles zurücksetzen** (unter „Spiel“, seit 28.09.): Alle Quests offen, Packs, Einsätze, Zähler, Dennis' Einträge und seine **Tagebuch-Antworten** sind weg. Dennis' Handy zeigt ein einziges Fenster („NEUER ANFANG“), lädt neu und fängt von vorn an: Titelbild, Prolog mit der Fee, Beutel, Hinweise auf der Karte. Es vergisst alles vom alten Spiel, auch seine Kopien von Einträgen und Antworten, nur ob die App auf dem Home-Bildschirm liegt, bleibt. Die App muss dafür nicht offen sein: Steht sie auf dem Titelbild oder ist sie zu, passiert das still beim nächsten Öffnen mit Netz. Erkannt wird das am Zeitstempel `neustart` im Spiel. Rückgängig holt alles zurück (auch die Antworten), ohne dass bei Dennis eine Kette von Fenstern aufgeht.
- **Tagebuch leeren** (unter „Spiel“): leert nur das Tagebuch, Dennis kann neu antworten. Rückgängig holt die Antworten zurück.

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

Geräte-Test (iPhone 13 und 15 in Safari und vom Home-Bildschirm, Samsung mit gedrosselter CPU): `tests/geraete.mjs`, siehe Kopf der Datei. Dazu `tests/nebel.mjs` (verrät nichts, auch nicht in den Stationstafeln und der Ausrüstung), `tests/probe.mjs` (Probelauf, Rückgängig), `tests/karte.mjs` (Karte, GPS, Prolog), `tests/selbst.mjs` (Dennis trägt selbst ein, Zurücknehmen, verpasste Momente, Tor, Duelle), `tests/glanz.mjs` (Beutel wird Spritze, Wasserwaffen in Stufen, Glanzsieg eintragen, zurücknehmen, nachholen) und `tests/durchlauf.mjs` (der ganze Tag vom Tagebuch bis zum offenen Kästchen) `tests/neustart.mjs` (Alles zurücksetzen, ein Fenster, das Handy vergisst alles) und `tests/abspann.mjs` (Finale: Siegbildschirm, Geschichte, Abspann).

## Firebase

Eingerichtet und in `config.js` eingetragen (`dennis-quest-default-rtdb.europe-west1.firebasedatabase.app`, Spiel `dennis-jga-2026`). Regeln unter „Realtime Database → Regeln":

Einfach (jeder mit Link könnte technisch schreiben, für einen JGA meist genug):
```
{ "rules": { "spiele": { "$spiel": { ".read": true, ".write": true } } } }
```

Geschützt (nur der Admin-Link mit Schlüssel schreibt das Spiel, Dennis darf nur ins Log-Buch und in seine Einträge):
```
{ "rules": { "spiele": {
    "$spiel": { ".read": true, ".write": "$spiel.endsWith('-logbuch') || $spiel.endsWith('-dennis')" }
} } }
```
Den Schlüssel findest du unter Projekteinstellungen → Dienstkonten → Datenbank-Secrets. Dein Admin-Link lautet dann `…/admin.html#key=DEIN_SECRET`. Das Handy merkt sich den Schlüssel. Den Link niemandem schicken.

Ohne Netz puffert das Admin-Handy Änderungen und schickt sie nach. Dennis' Antworten im Log-Buch und seine Einträge werden genauso nachgereicht. Zurücknehmen braucht Netz, sonst meldet der Admin es und du tippst noch einmal. Dennis' Menü zeigt unten rechts „Stand hh:mm" bzw. „Offline".

## Deployen

Vercel (Projekt `docarina`, Hobby-Plan, kostenlos) ist mit dem Repo verknüpft: Jeder Push auf `main` ist nach wenigen Sekunden unter `docarina.vercel.app` live, jeder andere Branch bekommt eine eigene Vorschau-Adresse. `vercel.json` veröffentlicht den Ordner `app/` (in Vercel bleibt das Root Directory auf `./`). Grenze: 100 Deploys am Tag.

Bis zum 28.09. lief die App auf Netlify (`dd-ocarina.netlify.app`, `netlify.toml`). Der Free-Plan dort kostet 15 Credits pro Deploy bei 300 im Monat und pausiert die Seite, wenn sie aufgebraucht sind. Die alte Adresse nicht mehr verwenden und in Netlify „Stop builds“ einschalten.

## Neue Quests oder Items

Nur `config.js` ändern, danach `node app/engine.test.js`. Die Tests prüfen auch die Konfiguration selbst: jede Quest hat Station und Text, jede Prüfung Farbe und Emblem, jedes Item wird irgendwo gewonnen und irgendwo eingesetzt.

- Quest: `typ` (`kern` Prüfung mit Medaillon, `side` Sidequest, `lauf` läuft neben der Reihe), `station`, `text`, `qm` (Notiz nur für dich), `win`/`lose` mit `packs`, `items`, bei `win` optional `ziffer`, `einsetzbar` (Liste von Item-IDs), `duell`, `revanche` (kommt im Showdown wieder, wenn verloren).
- Item: `gruppe` (`item` links, `faehigkeit` rechts), `stapel` (mehrfach), `einmalig` (nach dem Einsetzen weg), `symbol`, `farbe`, `text`, `tarn` (Name, bis Dennis es erspielt).
