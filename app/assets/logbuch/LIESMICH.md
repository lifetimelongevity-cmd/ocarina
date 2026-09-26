# Rikes Sprachnachrichten für das Log-Buch

Hier gehören sechs Dateien hin, eine pro Frage: `frage1.m4a` bis `frage6.m4a`.
Die Fragen stehen in `app/config.js` unter `logbuch.fragen` (gleiche Reihenfolge, dort an Dennis gerichtet).

## So bekommt Rike die Fragen (festgelegt 26.09.)

| Datei | Frage an Rike |
|---|---|
| `frage1.m4a` | Was kann Dennis überhaupt nicht? |
| `frage2.m4a` | Womit bringt dich Dennis auf die Palme? |
| `frage3.m4a` | Was hat Dennis bei eurem ersten Treffen gesagt oder getan, das du nie vergisst? |
| `frage4.m4a` | An welchem Ort wusstest du, dass er der Richtige ist? |
| `frage5.m4a` | Was soll Dennis in eurer Ehe nie ändern? |
| `frage6.m4a` | Was schätzt du an Dennis am meisten? |

Dennis tippt in ein bis drei Worten, was Rike gesagt hat. Damit der Quest Master schnell prüfen kann,
sagt Rike am Anfang jeder Nachricht ihre Antwort kurz („Meine Antwort: …“) und erzählt erst danach.
Eine Sprachnachricht pro Frage, und für Frage 5 und 6 bitte zwei verschiedene Antworten.

## Dateien

- Format: **m4a (AAC)** spielt auf iPhone und Android. WhatsApp-Sprachnachrichten (`.opus`) vorher umwandeln,
  zum Beispiel mit `ffmpeg -i nachricht.opus -c:a aac -b:a 64k frage1.m4a`. Mono, 64 kbit/s reicht.
- Solange eine Datei fehlt, spielt die App einen kurzen Platzhalter-Klang und zeigt „RIKE · FOLGT NOCH".
- Andere Dateinamen oder Formate: Pfad in `config.js` (`audio`) anpassen.
- Achtung: Alles in `app/` ist über die Netlify-Adresse für jeden mit dem Link abrufbar.
