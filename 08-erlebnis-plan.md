# Erlebnis-Plan: Dennis' Menü, Seite für Seite

Stand 26.09.2026. **Plan, noch nicht gebaut.** Grundlage ist ein Durchgang durch die App in iPhone-15-Maßen quer (Demo `?demo=start`, `?demo`, `?demo=ende` und ein Stand kurz vor dem Showdown) und der Code in `app/`. Der Plan baut auf `06-design-plan.md` auf und ändert keine Entscheidung von dort: Nebel, leere Plätze in der Ausrüstung, Dennis sagt an und der Quest Master bucht, so wenig Text wie möglich, drei Seiten im Ring.

Leitfrage je Stelle: **Was erwartet Dennis hier, was braucht er, was ist da?**

---

## 1. Kurzbefund

Die App sieht gut aus und die drei Seiten tragen. Die Lücken liegen weniger im Aussehen als an den Stellen, an denen das Wochenende seine Höhepunkte hat:

| # | Befund | Warum es zählt |
|---|---|---|
| 1 | **Verpasste Momente.** Das Ergebnis-Fenster erscheint nur, wenn die App gerade offen ist und der Startbildschirm schon weg ist. Öffnet Dennis die App nach einer Buchung, sieht er still den neuen Stand. | Am Berg steckt das Handy in der Tasche. Der größte Moment des Spiels fällt dann einfach aus. |
| 2 | **Das Ziel wird nirgends erklärt.** Kästchen, 10 Packs, vierstelliger Code: Das Fenster zu den Packs sagt nur „deins" und „beim Bund". Das Onboarding kommt erst, wenn Dennis zum ersten Mal zur Ausrüstung wischt. | Ohne Ziel sind Packs und Ziffern nur Zahlen. Wer nie nach rechts wischt, sieht auch den Beutel-Gag nie. |
| 3 | **Showdown ohne Duelle.** Auf dem Gipfel steht bei Dennis nur „Drei Duelle, zuerst deine Revanchen". Welche drei, wie es steht und dass zwei Siege reichen, sieht nur der Quest Master. | Das ist der Endkampf. Er braucht eine eigene Bühne. |
| 4 | **Kein Finale.** Nach der letzten Quest steht im HUD „Zum Kästchen", sonst passiert nichts. | Abrechnung und Öffnen des Kästchens sind der Lohn für den ganzen Tag. |
| 5 | **Rike ist nach dem Log-Buch weg.** Der Knopf zum Log-Buch erscheint nur, solange es die nächste Quest ist. Danach sind Dennis' Antworten und Rikes Sprachnachrichten nicht mehr erreichbar. | Das sind die persönlichsten Inhalte der App. |
| 6 | **Karte zeigt eine Prüfung zu wenig.** Die Wiese hat zwei Prüfungen (Kreuzung der Klingen, Podrennen), die Karte zeigt je Station nur ein Medaillon. Rechts steht 6/6, auf der Karte sind 5 zu sehen. | Fehler, fällt spätestens am Ende auf. |
| 7 | **Laufende Quests scrollen weg.** Die Liste springt zur nächsten Quest, der Bereich LÄUFT oben ist dann außer Sicht. | Prophezeiung und Amulett laufen den ganzen Tag, sie sollen immer im Blick sein. |

---

## 2. Die Reise über das Wochenende

| Wann, wo | Dennis fragt sich | Heute | Plan |
|---|---|---|---|
| Freitag, Abfahrt im Zug | Was ist das hier, worum geht es? | Titelbild, dann direkt das Menü | Prolog beim ersten Start (3.2) |
| Freitag, Zug | Was muss ich tun? | Log-Buch mit Knopf, funktioniert gut | Rike spürbar machen (3.8) |
| Freitag, nach dem Urteil | Wie lief es? | Ergebnis nur bei offener App | Verpasste Momente nachholen (3.7) |
| Freitagabend, München | Was kommt morgen? | nächste Quest mit Ort | passt |
| Samstag, Frühstück | Was habe ich vorhergesagt? | Prophezeiung nur als Sterne | Vorhersagen sichtbar (3.9) |
| Samstag, Anstieg | Was ist dran, was hilft mir, wie weit noch? | Quest-Karte, Einsetzbar, Karte | Weg und Fortschritt spürbar (3.5), Ansage-Karte (3.6) |
| zwischen den Quests | Handy in der Tasche | Buchungen laufen ins Leere | Verpasste Momente, Hinweis auf dem Startbildschirm (3.1) |
| Gipfel | Gegen was trete ich an, wie steht es? | ein Satz Text | Duelle mit Spielstand (3.10) |
| Hütte | Wie viel habe ich, was fehlt? | „Zum Kästchen" | Abrechnung und Öffnen (3.11) |
| danach, zu Hause | Nochmal ansehen | Menü bleibt, Log-Buch zu | Abspann, Rikes Nachrichten (3.8, 3.11) |

---

## 3. Seite für Seite

### 3.1 Startbildschirm

**Erwartet:** Das Spiel beginnt. Hat sich etwas getan, seit ich zuletzt drin war?
**Ist da:** Titelbild mit schwebender Fee, Licht, Feenstaub, PRESS START, Vollbild und App installieren. Stark, bleibt so.
**Fehlt:** Ein Zeichen, dass Neues wartet. Ein Klang beim Start.

**Plan**
- *UX:* Warten verpasste Momente (3.7), steht unter PRESS START klein „3 Neuigkeiten". Kein Inhalt, nur die Zahl. Die Fee blinkt dann heller.
- *Erlebnis:* PRESS START spielt eine kurze eigene Titelmelodie (vier Töne), dann öffnet sich das Menü mit dem Pausenmenü-Klang. Heute gibt es nur einen kurzen Bestätigungston.

### 3.2 Erster Start: Prolog (neu)

**Erwartet:** Worum geht es, was ist mein Ziel?
**Ist da:** nichts. Die Erklärung steckt im Onboarding der Ausrüstung (`app.js:630`) und läuft nur beim ersten Besuch dort.
**Fehlt:** Das Ziel. Kästchen, Packs, Code, Weg.

**Plan:** Einmal pro Handy nach dem ersten PRESS START, vier Textboxen, jede ein Tipp, überspringbar. Text tippt sich Buchstabe für Buchstabe wie in Ocarina of Time. Dazu leuchtet jeweils das Passende auf.

| # | Text | leuchtet |
|---|---|---|
| 1 | „Hör mal, Dennis. Rike schickt mich. Ich begleite dich." | die Fee |
| 2 | „Der Bund hat ein Kästchen verschlossen. Darin liegen 10 Packs." | Packs im HUD |
| 3 | „Jede Prüfung bringt dir Packs und vielleicht eine Ziffer." | Schloss im HUD |
| 4 | „Was dir gehört, öffnest du am Ende. Dein Weg führt auf die Neureuth." | Karte mit Kästchen am Ziel |

Danach das bekannte Fundfenster „ERSTES ITEM GEFUNDEN" mit dem Beutel, dann landet Dennis auf QUESTS beim Log-Buch. Das Onboarding der Ausrüstung schrumpft auf einen Hinweis: „Was leuchtet, kannst du jetzt einsetzen." Satz 1 setzt Entscheidung 1 voraus, sonst spricht eine neutrale Textbox.

### 3.3 HUD (immer sichtbar)

**Erwartet:** Wie viel habe ich, was fehlt mir noch, was ist dran?
**Ist da:** 10 Karten mit Zahl, Name der nächsten Quest, Schloss mit vier Zahlenrädern, Stand und Offline unten rechts. Tippen erklärt Packs und Code.
**Fehlt:** Wofür die Packs sind, woher sie kamen. Ein Symbol zur nächsten Quest. Eine Uhr, wenn eine Frist läuft.

**Plan**
- *UI:* Vor dem Namen der nächsten Quest ihr Medaillon oder Stein, klein. Läuft eine Frist (3.9), rechts daneben „38 Min.".
- *UX:* Tippen auf die Packs öffnet **DEIN KÄSTCHEN**: das Kästchen mit 10 Plätzen, darunter der Verlauf in Spielreihenfolge („+1 Log-Buch", „−1 Wirbel der Götter", „−1 Strafe vom Quest Master"). Ergibt sich aus dem Stand, nichts Neues wird gespeichert. Ein Satz dazu: „Fehlt dir eine Ziffer, kostet sie am Kästchen 1 Pack."
- *Erlebnis:* Neue Packs fliegen aus dem Ergebnis-Fenster in ihre Karte im HUD. Eine neue Ziffer rollt am Zahlenrad durch und rastet mit Klick ein, statt nur aufzublinken.
- *Offline:* „Funkloch · Stand 13:05" statt „Offline". Beruhigt, statt zu warnen.

### 3.4 QUESTS (Startseite)

**Erwartet:** Was ist jetzt dran, was muss ich tun, was kann ich gewinnen, was hilft mir? Was habe ich schon geschafft?
**Ist da:** Zähler (Medaillons, Steine, Spruchrollen), Liste mit LÄUFT und DEIN WEG, Nebelzeile „Noch 3 Prüfungen", Quest-Karte mit Name, Status, Ort, Text, Einsetzbar, Sieg und Niederlage.
**Fehlt:** laufende Quests im Blick (Befund 7). Was ich bei einer verlorenen Quest noch erwarten darf. Log-Buch nach dem Urteil. Die Duelle im Showdown. Die Symbole bei Einsetzbar sind nicht antippbar und ohne Namen.

**Plan**
- *UI:* Laufende Quests wandern aus der Liste in die Zählerzeile oben: kleines Medaillon mit Zähler (Prophezeiung 1/3, Amulett mit Uhr). Immer sichtbar, Tippen zeigt sie in der Karte. Die Liste enthält dann nur noch DEIN WEG.
- *UI:* Leerraum in der Mitte der Karte nutzen: Text etwas größer, darunter eine Zeile mit Abzeichen, was es für ein Spiel ist (zwei gekreuzte Schwerter bei `duell`, „gegen einen aus dem Bund"). Lange Namen wie „Klingen des Deku-Baums" bekommen eine kleinere Stufe statt Umbruch.
- *UX:* Einsetzbar-Symbole werden Knöpfe: Tippen springt zur Ausrüstung mit dem Item gewählt.
- *UX:* Erledigte Quests zeigen, was passiert ist, statt was hätte passieren können: Stempel BESTANDEN oder VERLOREN schräg über der Karte, darunter nur die eingetretene Zeile und „Eingesetzt" (heute steht die andere Zeile blass daneben). Bei verlorenen Quests mit `revanche`: „Vielleicht bekommst du noch eine Chance." (Entscheidung 3, verrät keinen Namen.)
- *UX:* Log-Buch bleibt nach dem Urteil offen, als Erinnerung: Knopf „RIKES NACHRICHTEN" (3.8).
- *Erlebnis:* Nebelzeile und Nebelkarte bekommen echten Nebel, der langsam zieht. Tippen darauf: tiefer Ton, die Fee sagt „Geduld, Held."
- *Erlebnis:* Tritt die nächste Quest aus dem Nebel, dreht sich ihr Medaillon wie eine Münze vom „?" zum Zeichen, der Name tippt sich ins HUD.

### 3.5 KARTE

**Erwartet:** Wo bin ich, wie weit ist es noch, was liegt wo, wie viel habe ich geschafft?
**Ist da:** Weg vom Tegernsee zur Hütte mit sechs Stationen, Medaillons, Dennis' Kopf als „Du bist hier", Nebel ab der nächsten Station, rechts Fortschritt und die gewählte Station.
**Fehlt:** Das Ziel ist nicht zu sehen, die Hütte ist ein Punkt. Gegangener und kommender Weg sehen gleich aus. Die untere Hälfte der Stationsbox ist leer. Eine Prüfung fehlt (Befund 6). Verlorene Steine sind hier rot, sonst überall grau mit X (`styles.css:284`).

**Plan**
- *Fehler:* Stationen mit zwei Prüfungen zeigen beide Medaillons nebeneinander (`app.js:365`).
- *UI:* An der Hütte steht von Anfang an das **Kästchen**, verschlossen, mit der Zahl der Packs darauf. Das Ziel ist immer im Blick.
- *UI:* Gegangener Weg durchgezogen in Gold, kommender gestrichelt. Steine auf der Karte wie überall: grün, grau mit X.
- *UI:* Stationsbox: Name, Quests der Station (wie heute), darunter Höhe und ungefähre Gehzeit zur nächsten Station, die Werte trägst du in `config.js` ein (Entscheidung 8). Am Berg ist das echte Hilfe.
- *Erlebnis:* Nach jedem Ergebnis, das zu einer neuen Station führt, **wandert Dennis' Kopf** den Weg entlang zur nächsten Station, der Nebel zieht dabei ein Stück zurück, kurzer Entdeckerklang. Das ist die Karte aus Ocarina of Time, die sich beim Laufen füllt.
- *Erlebnis:* Die Karte bekommt mehr Pergament: Kompassrose, Tannen, Wellen im See, gezeichnete Ränder. Beschriftungen bleiben Text.

### 3.6 AUSRÜSTUNG

**Erwartet:** Was habe ich, was kann es, was kann ich jetzt einsetzen, woher habe ich es?
**Ist da:** Items links, Fähigkeiten rechts, Avatar in der Mitte, Textbox mit Name, Stand und „Einsetzbar bei … Sag es dem Quest Master." Was jetzt geht, leuchtet.
**Fehlt:** Ausgegraute Items sind alle gleich grau, ohne Tippen ist nicht zu erkennen, was was ist. Woher ein Item kommt. Der Avatar steht in einem harten schwarzen Kasten. Die rechte Spalte wirkt verloren.

**Plan**
- *UI:* Items im Besitz, die gerade nicht gehen, behalten ihre Farbe, nur gedämpft. Leuchten bleibt für „jetzt einsetzbar".
- *UI:* Avatar mit weicher Vignette statt Kasten, er schwebt vor der Steinplatte. Fähigkeiten stehen im selben Raster wie Items, beide Seiten gleich breit.
- *UX:* Textbox nennt die Herkunft: „Gewonnen bei Kreuzung der Klingen." Bei Spruchrollen: „Je erfüllte Prophezeiung eine."
- *Erlebnis:* **Ansage-Karte.** Ist ein leuchtendes Item gewählt, steht in der Textbox der Knopf ANSAGEN. Er füllt den Bildschirm: großes Symbol, „ICH SETZE EIN", Name, „bei Kartenwurf". Dennis hält das Handy hoch wie Link sein Item, der Quest Master bucht. Der Knopf speichert nichts, die Entscheidung „Dennis sagt an, der Quest Master bucht" bleibt.
- *Erlebnis:* Tippen auf den Avatar spielt eine kurze eigene Okarina-Melodie, die Noten steigen dichter auf.

### 3.7 Ergebnis-Fenster und verpasste Momente

**Erwartet:** Was ist passiert, was habe ich bekommen oder verloren, wo stehe ich jetzt?
**Ist da:** Medaillon dreht sich ein, Strahlen, Titel, Zeilen nacheinander, Fanfare. Bei Verlust fällt das Medaillon grau herab. Tippen schließt, danach tritt die nächste Quest aus dem Nebel.
**Fehlt:** Verpasste Momente (Befund 1, `app.js:1059`). Wo ich jetzt stehe. Die Enthüllung einer Tarnung ist nur eine kleine Zeile. Eine eingesetzte Spruchrolle steht rot da wie ein Verlust (`app.js:507`). Mehrere Ergebnisse auf einmal werden zu „und 1 weitere" (`app.js:529`). Ein schneller Tipp schließt alles sofort.

**Plan**
- *UX, Pflicht:* **Verpasste Momente nachholen.** Das Handy merkt sich den zuletzt gesehenen Stand (nur im Browser, nichts in Firebase). Nach PRESS START und beim Zurückkehren in die App laufen alle Neuigkeiten seitdem als Fenster nacheinander, in Spielreihenfolge. Oben klein „1 / 3".
- *UX:* Mehrere Ergebnisse gleichzeitig werden ebenso nacheinander gezeigt.
- *UI:* Fußzeile im Fenster: „2 von 10 Packs · 2 von 4 Ziffern". Der Stand nach dem Ereignis, sofort einzuordnen.
- *UI:* Spruchrolle einsetzen ist Magie: violett, Zauberkreis, Zauberklang. Kein Rot.
- *UX:* Schließen erst nach dem letzten Takt möglich (etwa 1,2 Sekunden), damit ein Jubeltipp nichts wegwischt. Das ▼ erscheint, wenn es geht.
- *Erlebnis:* **Tarnung fällt als eigener Takt.** Erst Titel und Packs, dann dunkelt das Fenster, eine Truhe erscheint mit dem Tarnnamen „Kern der Goronen", sie springt auf, Licht, das echte Item steigt auf: „GÖTTERKREISEL". Der klassische Item-Fund, mit eigener Tonfolge.
- *Erlebnis:* Beim Sieg rieselt der Feenstaub vom Startbildschirm über das Fenster (dieselbe Technik, auf schwachen Handys halbiert). Bei Verlust eine kurze Erschütterung und ein tröstender Satz: „Kopf hoch. Weiter geht es."
- *Erlebnis:* Android vibriert kurz mit: kurz, kurz, lang bei Sieg, einmal lang bei Verlust. iPhones können das im Browser nicht.

### 3.8 Log-Buch

**Erwartet:** Rike ist dabei, obwohl sie nicht da ist.
**Ist da:** Frage, Antwort tippen, BESIEGELN mit Wachssiegel, dann Rikes Sprachnachricht, weiter. Zwischendurch schließen und später weiterschreiben geht.
**Fehlt:** Rikes Nachrichten selbst (Offener Punkt 2, Blocker). Ein Auftakt. Nach der sechsten Antwort nur ein nüchterner Satz. Nach dem Urteil ist alles weg (Befund 5, `app.js:308`).

**Plan**
- *Erlebnis:* Auftakt vor Frage 1: „Rike hat dir sechs Nachrichten hinterlassen. Erst deine Antwort, dann ihre." Leiser Klang, die Fee schwebt ins Bild.
- *UI:* Die Welle neben dem Abspielknopf folgt Rikes echter Stimme statt einer festen Animation.
- *UX:* Nach der sechsten Antwort eine Übersicht: sechs Fragen, seine Antworten, je ein Knopf für Rikes Nachricht. „Das Urteil fällt der Quest Master."
- *UX:* Nach dem Urteil bleibt diese Übersicht über die erledigte Quest erreichbar, nur zum Lesen und Hören.

### 3.9 Laufende Quests: Prophezeiung und Rikes Amulett

**Erwartet:** Was habe ich vorhergesagt, was ist schon eingetroffen? Wie viel Zeit bleibt für das Amulett?
**Ist da:** Prophezeiung mit drei Sternen und „je Treffer eine Rolle". Amulett mit Schritt „Gefunden". Beide nur in der Liste, die wegscrollt.
**Fehlt:** Dennis' eigene Vorhersagen. Die Frist fürs Amulett (in 07 noch offen).

**Plan**
- *Prophezeiung (Entscheidung 5):* Beim Frühstück schreibt Dennis seine zwei bis drei Vorhersagen in die App und versiegelt sie, wie im Log-Buch (eigener Pfad, wie beim Log-Buch). In der Quest-Karte stehen sie als versiegelte Rollen. Trifft eine ein, bricht ihr Siegel mit dem Zauberklang. Der Quest Master sieht die Sätze im Admin und bucht wie bisher +1.
- *Amulett (Entscheidung 6):* Mit dem Start durch den Quest Master läuft eine Frist, im HUD und in der Karte als Uhr. Unter fünf Minuten pulsiert sie rot. Nach dem Fund wird aus der Uhr „Gefunden, jetzt zusammensetzen." Braucht die Frist in `config.js` und die Startzeit im Dokument.

### 3.10 Showdown am Gipfel

**Erwartet:** Gegen was trete ich an, wie steht es, was brauche ich zum Sieg, was kann ich einsetzen?
**Ist da:** Text, Einsetzbar, Sieg und Niederlage.
**Fehlt:** Die drei Duelle und der Spielstand (Befund 3). Die App kennt sie schon (`showdownDuelle()` in `engine.js`), nur Dennis sieht sie nicht.

**Plan**
- *UI:* In der Quest-Karte drei Duell-Plätze: „1 · Revanche · Wirbel der Götter", „2 · Revanche · Auge des Jägers", „3 · Wirbel der Götter", jeder mit offen, Haken oder X. Darüber „Zwei Siege reichen" und ein Spielstand 1 : 0. Je Duell leuchtet, was dort einsetzbar ist.
- *Erlebnis:* **Boss-Titelkarte.** Tritt die Prüfung des Bundes aus dem Nebel, kommt statt der normalen Enthüllung eine Titelkarte wie vor einem Endgegner: Bildschirm dunkel, Name in großen Lettern, darunter „Der Bund, Hüter des Kästchens", tiefer Klang.
- *Erlebnis:* Jedes Duell-Ergebnis zeigt den neuen Spielstand groß. Beim entscheidenden zweiten Sieg bebt das Fenster.

### 3.11 Finale in der Hütte (neu)

**Erwartet:** Wie viel habe ich, was fehlt mir, jetzt öffnen!
**Ist da:** „Zum Kästchen" im HUD, in der Stationsbox „Hier wird abgerechnet und das Kästchen geöffnet."
**Fehlt:** alles Weitere (Befund 4).

**Plan:** Eine Abfolge, die über dem Menü liegt, keine vierte Seite.
1. **Abrechnung.** Titel „DIE HÜTTE". Die Packs zählen einzeln hoch und fliegen ins Kästchen, am Ende „8 von 10 Packs gehören dir."
2. **Code.** Die bekannten Ziffern stehen im Schloss. Fehlt eine: „Ziffer 3 fehlt. Kauf sie für 1 Pack." Der Quest Master bucht den Kauf wie heute, das Rad rollt ein.
3. **Öffnen.** Sind alle vier da: „Der Code ist vollständig. Öffne das Kästchen." Das Schloss springt auf, große Fanfare. Auf Wunsch spielt hier **Rikes Botschaft** (Entscheidung 4), im alten Ablauf in `04-ablauf-und-material.md` war sie für den Gipfel vorgesehen.
4. **Abspann.** Der Tag läuft als Chronik wie Credits durch: jede Quest mit Ergebnis, gefundene Items, erfüllte Prophezeiungen, dazu die Namen des Bundes (Entscheidung 7). Am Ende „THE LEGEND OF DENNIS · A LINK TO RIKE". Bleibt danach über das Kästchen im HUD abrufbar.

Schritt 1 und 2 kommen automatisch nach dem Showdown. Schritt 3 und 4 startet der Quest Master mit einem Knopf, damit der Moment zum echten Öffnen am Tisch passt.

### 3.12 Hochformat

**Ist da:** schwarzer Bildschirm, Handy-Umriss, „Handy quer halten".
**Plan:** Die Fee schwebt über dem drehenden Handy, dahinter das Titelbild abgedunkelt statt Schwarz. Klein, aber es ist der erste Eindruck, wenn jemand die App hochkant öffnet.

---

## 4. Querschnitt

| Thema | Plan |
|---|---|
| **Die Fee** | Die Fee vom Titelbild wird Dennis' Begleiterin im Menü (Entscheidung 1): Sie spricht den Prolog, die Hinweise und die tröstenden Sätze, als kleines Bild neben der Textbox. Verbindet Titelbild und Menü, gibt Rike eine Stimme im Spiel. |
| **Text** | Textboxen tippen sich Buchstabe für Buchstabe mit leisem Klick, ein Tipp zeigt sofort alles. Weiter höchstens zwei kurze Sätze, keine Namen verdeckter Quests. |
| **Klang** | Eine Klangfamilie: Blättern, Wählen, Öffnen, Schließen, Enthüllen, Fanfare, Zauber. Beim Handytest prüfen, ob das iPhone mit Stummschalter Töne und Rikes Stimme spielt. |
| **Bewegung** | Alles Neue folgt „Bewegung reduzieren" und läuft auf schwachen Handys mit weniger Teilchen, wie der Startbildschirm heute. |
| **Nebel** | Jede neue Ansicht (Kästchen, Showdown, Abrechnung, verpasste Momente) kommt in `tests/nebel.mjs`. |

---

## 5. Bauplan in drei Paketen

Größe: **S** eine Stelle im Code, **M** mehrere Stellen, **L** neue Ansicht. „Daten" heißt: braucht ein neues Feld im Dokument, im Admin oder in `config.js`.

**Paket 1 · Lücken schließen (vor Freitag Pflicht, keine neuen Daten)**

| Was | Abschnitt | Größe |
|---|---|---|
| Verpasste Momente nachholen, mehrere Ergebnisse nacheinander | 3.7 | M |
| Karte: zwei Medaillons je Station, Steine einheitlich | 3.5 | S |
| Laufende Quests in die Zählerzeile | 3.4 | S |
| Spruchrolle einsetzen violett statt rot | 3.7 | S |
| Log-Buch nach dem Urteil erreichbar | 3.8 | S |
| Showdown: drei Duelle mit Spielstand | 3.10 | M |
| Prolog beim ersten Start, Onboarding kürzer | 3.2 | M |
| DEIN KÄSTCHEN mit Verlauf, Kästchen am Ziel der Karte | 3.3, 3.5 | M |
| Fußzeile im Ergebnis, Sperre gegen Wegtippen | 3.7 | S |

**Paket 2 · Erlebnis (lohnt vor Freitag, keine neuen Daten)**

| Was | Abschnitt | Größe |
|---|---|---|
| Tarnung fällt als eigener Takt, Feenstaub beim Sieg | 3.7 | M |
| Packs fliegen ins HUD, Zahlenrad rollt ein | 3.3 | S |
| Dennis wandert auf der Karte, Nebel zieht zurück, Weg in Gold | 3.5 | M |
| Boss-Titelkarte vor dem Showdown | 3.10 | S |
| Abrechnung in der Hütte (Schritt 1 und 2) | 3.11 | L |
| Ansage-Karte, Okarina am Avatar, Items in eigener Farbe | 3.6 | M |
| Textbox tippt, Titelmelodie, Neuigkeiten unter PRESS START, Vibration | 3.1, 3.7, 4 | M |
| Nebel zieht in der Liste, Münzdrehung bei der Enthüllung | 3.4 | S |

**Paket 3 · Overdrive (braucht deine Entscheidungen, teils neue Daten)**

| Was | Abschnitt | Daten |
|---|---|---|
| Fee als Begleiterin mit eigenen Sätzen | 4 | Texte |
| Prophezeiungen schreiben und versiegeln | 3.9 | eigener Pfad wie Log-Buch, Admin zeigt sie |
| Amulett mit Frist | 3.9 | Frist in `config.js`, Startzeit im Dokument |
| Öffnen und Abspann auf Knopf des Quest Masters, Rikes Botschaft | 3.11 | ein Feld im Dokument, Datei `finale.m4a`, Namen des Bundes |
| Höhe und Gehzeit je Station | 3.5 | Werte in `config.js` |

Reihenfolge: Paket 1, dann Paket 2, dann der Test mit zwei echten Handys (Offener Punkt 4), Paket 3 nur mit deinen Antworten. Nach jedem Paket laufen `node app/engine.test.js`, `tests/geraete.mjs` und `tests/nebel.mjs`. Betroffen sind fast nur `app.js`, `styles.css` und `index.html`, bei Paket 3 dazu `store.js`, `admin.js` und `config.js`.

---

## 6. Entscheidungen für dich

1. **Die Fee** wird Rikes Begleiterin im Menü und spricht Prolog und Hinweise? Empfehlung: ja. Soll sie einen Namen haben?
2. **Prolog** mit den vier Sätzen aus 3.2? Anpassen, kürzen?
3. **Verlorene Quest mit Revanche:** der Satz „Vielleicht bekommst du noch eine Chance." Verrät keinen Namen, aber dass es weitergeht. Empfehlung: ja.
4. **Rikes Botschaft** als Sprachnachricht im Finale? Dann braucht es eine siebte Datei von Rike.
5. **Prophezeiung:** Vorhersagen in der App schreiben oder bleibt es bei Papier und Umschlag?
6. **Amulett:** Frist als Uhr in der App? Wenn ja, wie viele Minuten?
7. **Abspann:** Namen des Bundes nennen? Dann brauche ich die Namen.
8. **Karte:** Höhe und Gehzeit je Station zeigen? Dann brauche ich deine Werte oder du lässt sie mich nachschlagen.
