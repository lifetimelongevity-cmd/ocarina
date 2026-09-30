# Rikes Sprachnachrichten für das Log-Buch

Hier gehören sieben Dateien hin, eine pro Frage: `frage1.m4a` bis `frage7.m4a`.
Die Fragen stehen in `app/config.js` unter `logbuch.fragen` (gleiche Reihenfolge, dort an Dennis gerichtet).

## So bekommt Rike die Fragen (festgelegt 26.09.)

| Datei | Frage an Rike |
|---|---|
| `frage1.m4a` | Was kann Dennis überhaupt nicht? |
| `frage2.m4a` | Womit bringt dich Dennis auf die Palme? |
| `frage3.m4a` | Was ist Dennis' ulkigste Eigenart? |
| `frage4.m4a` | Was hat Dennis bei eurem ersten Treffen gesagt oder getan, das du nie vergisst? |
| `frage5.m4a` | An welchem Ort wusstest du, dass er der Richtige ist? |
| `frage6.m4a` | Was soll Dennis in eurer Ehe nie ändern? |
| `frage7.m4a` | Was schätzt du an Dennis am meisten? |

Nach Frage 1 meldet sich bei Dennis Buu Huu, der Geist des Bundes, und macht aus Rikes Antwort eine Quest (Rikes Rache, seit 30.09.).
Er geht davon aus, dass Rike dort die Nadel nennt („Geduldssachen, so was wie einen Faden durchs Nadelöhr einfädeln“).
Sagt Rike etwas anderes, seine Sätze in `app/config.js` anpassen (`logbuch.fragen`, erste Frage, `geist`).

Dennis tippt in ein bis drei Worten, was Rike gesagt hat. Damit der Quest Master schnell prüfen kann,
sagt Rike am Anfang jeder Nachricht ihre Antwort kurz („Meine Antwort: …“) und erzählt erst danach.
Eine Sprachnachricht pro Frage, und bitte bei jeder Frage eine andere Antwort.

## Dateien

- Format: **m4a (AAC)** spielt auf iPhone und Android. WhatsApp-Sprachnachrichten (`.opus`) vorher umwandeln,
  zum Beispiel mit `ffmpeg -i nachricht.opus -c:a aac -b:a 64k frage1.m4a`. Mono, 64 kbit/s reicht.
- Solange eine Datei fehlt, spielt die App einen kurzen Platzhalter-Klang und zeigt „RIKE · FOLGT NOCH".
- Andere Dateinamen oder Formate: Pfad in `config.js` (`audio`) anpassen.
- Achtung: Alles in `app/` ist über die Netlify-Adresse für jeden mit dem Link abrufbar.
