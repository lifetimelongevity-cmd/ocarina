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
Rike nennt dort wirklich den Faden im Nadelöhr (siehe unten), seine Sätze passen.

Dennis tippt in ein bis drei Worten, was Rike gesagt hat, besiegelt es, dann hört er ihre Nachricht.

## Stand (30.09.): sechs von sieben da, Frage 5 fehlt

Die Originale von WhatsApp liegen in `quellen/` (nicht veröffentlicht). `quellen/schneiden.py` kürzt sie auf die
wichtigen Stellen, schneidet nur in Sprechpausen, blendet weich über und macht alle gleich laut. Andere Schnitte:
Sekunden dort ändern, `python3 quellen/schneiden.py 4` (braucht ffmpeg). Die Abschrift stammt von einer Spracherkennung.

| Frage | Original | In der App | Rikes Antwort | Was fehlt |
|---|---|---|---|---|
| 1 | 0:34 | 0:32 | Filigrane Sachen mit Fingerspitzengefühl: Faden ins Nadelöhr, zarten Schmuck machen. Motorik oder Geduld verabschieden sich, meist beides, „kurz vor dem Nervenzusammenbruch“ | nur Stille |
| 2 | 0:34 | 0:33 | Vergesslichkeit: Bei jedem Besuch bleibt was liegen oder er nimmt was mit. Wichtiges schreibt sie ihm auf oder erinnert zwei, drei Mal | nur Stille |
| 3 | 0:50 | 0:41 | Ihr fiel nichts ein, darum hat sie Laurenz gefragt: Dennis ist unglaublich gutgläubig und glaubt ihm trotzdem jeden Quatsch | Ende, dort bricht die Aufnahme mitten im Satz ab |
| 4 | 3:16 | 0:32 | Erstes Date bei Vapiano: Nach wenigen Minuten wirft Dennis die Cola um. Sie dachte Nervosität, heute weiß sie: Tollpatschigkeit | „Drei Momente“ als Einleitung, das Treffen nachts in Göttingen, der Heimweg in der Orientierungswoche, auf dem er einer gestürzten Radfahrerin hilft |
| 5 | fehlt | | | |
| 6 | 2:47 | 1:09 | Dass er sich nicht so ernst nimmt (steht auf und erzählt schlechte Witze, jung geblieben), mehr noch seine Fürsorglichkeit: Chips am Abend, kocht nach der Arbeit, wird ein fürsorglicher Papa | „Egal wie alt er wird“, Singen, Akzente, Tanzen im Wohnzimmer, der Satz zur Erkrankung, Einkaufen, Massage |
| 7 | 3:05 | 1:02 | Er ist der Allerbeste, am meisten schätzt sie, wie viel Mühe er sich mit ihrer Familie gibt: versteht sich mit ihren Brüdern, Familienupdates kommen inzwischen von Dennis | Offenes Ohr, hilft ihren Freunden, bringt sie zum Lachen, Anruf um 17 Uhr, Kuchen für die Eltern, Tennisspiele, Fotojobs für den Bruder („sein persönlicher Agent“), Tennisclub |

## Dateien

- Format: **m4a (AAC)** spielt auf iPhone und Android. WhatsApp-Sprachnachrichten (`.ogg`, Opus) vorher umwandeln,
  am besten mit `quellen/schneiden.py`. Mono, 64 kbit/s reicht.
- Solange eine Datei fehlt, spielt die App einen kurzen Platzhalter-Klang und zeigt „RIKE · FOLGT NOCH".
- Andere Dateinamen oder Formate: Pfad in `config.js` (`audio`) anpassen.
- Achtung: Alles in `app/` ist über die Vercel-Adresse für jeden mit dem Link abrufbar, die Originale in `quellen/` nicht.
- Die Tests spielen weiter den Platzhalter (das Chromium der Tests kann kein AAC).
