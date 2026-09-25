# Rikes Sprachnachrichten für das Log-Buch

Hier gehören sechs Dateien hin, eine pro Frage: `frage1.m4a` bis `frage6.m4a`.
Die Fragen stehen in `app/config.js` unter `logbuch.fragen` (gleiche Reihenfolge).

- Format: **m4a (AAC)** spielt auf iPhone und Android. WhatsApp-Sprachnachrichten (`.opus`) vorher umwandeln,
  zum Beispiel mit `ffmpeg -i nachricht.opus -c:a aac -b:a 64k frage1.m4a`. Mono, 64 kbit/s reicht.
- Solange eine Datei fehlt, spielt die App einen kurzen Platzhalter-Klang und zeigt „RIKE · FOLGT NOCH".
- Andere Dateinamen oder Formate: Pfad in `config.js` (`audio`) anpassen.
- Achtung: Alles in `app/` ist über die Netlify-Adresse für jeden mit dem Link abrufbar.
