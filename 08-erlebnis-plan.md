# Erlebnis-Plan: Dennis' Menü Seite für Seite

Stand 26.09.2026. **Vorschlag, noch nicht gebaut.** Entscheidungen vom 26.09. sind eingetragen (Abschnitt 9), dazu der Teil zum visuellen Design (Abschnitt 10). **Umgesetzt am 26.09.:** Aufgabenteilung von KARTE und QUESTS und weniger Text (Abschnitt 11), Stilprobe (10.4). Grundlage ist ein Rundgang durch die App v1, so wie Dennis sie erlebt: iPhone 15 vom Home-Bildschirm und in Safari, jeweils am Anfang, in der Mitte, am Gipfel und am Ende des Tages, dazu Log-Buch, alle Ergebnis-Fenster und die Fenster für Packs und Code. Nachstellen mit `?demo=start`, `?demo` und `?demo=ende`.

Der Plan baut auf `06-design-plan.md` und `07-spiele-und-items.md` auf und ändert keine Entscheidung von dort.

**Was bleibt:** Titelbild „A Link to Rike", das N64-Pausenmenü mit drei Seiten im Ring und der Drehung in Stufen, die blauen Textboxen, die Farben der Medaillons, die Nebel-Regel (A0 Nr. 16), Einsetzen nur über den Quest Master, so wenig Text wie möglich.

---

## 0. Kurzfassung

- **Befund:** Das Menü sieht stark aus und ist klar. Was fehlt, ist der Bogen des Tages: Dennis erfährt nirgends, worum es geht, der Showdown findet in seiner App nicht statt, und nach der letzten Quest steht nur „Zum Kästchen" im HUD. Der wichtigste Moment, das Ergebnis, geht verloren, wenn der Quest Master bucht, während Dennis' App zu ist oder den Startbildschirm zeigt.
- **Leitidee:** Jede Buchung wird ein Moment aus Ocarina of Time, der dort landet, wo er hingehört. Rike ist den ganzen Tag hörbar dabei.
- **Neu:** Prolog mit der Fee, Duell-Tafel am Gipfel, Rikes Botschaft, Kästchen-Ansicht mit Öffnen und Abspann. Dazu verpasste Momente nachholen, Rikes Stimme später wieder anhören, eine Chronik für jede erledigte Quest.
- **Overdrive, entschieden:** Richtung B „Das Menü lebt" als Grundlage, Richtung A „Kammer der Weisen" nur für die sechs Medaillons, den Bund und das Kästchen (Abschnitt 4).
- **Visuelles Design:** Remaster statt Neubau. Dieselbe Welt, aber zwei eingebettete Schriften, sonnenfester Kontrast, klare Steintafeln mit Titelschild, ein Cursor für alles, ein Satz Symbole (Abschnitt 10).
- **Reihenfolge:** zuerst eine Stilprobe des neuen Looks, dann Grunddesign und Stufe 1 (Fundament) vor dem Test mit echten Handys, danach Stufe 2 und 3, soweit Zeit ist. Stand am Donnerstag, 1.10., einfrieren (Abschnitt 6).

---

## 1. Leitidee

> Dennis soll spüren, dass er der Held eines Spiels ist, das nur für ihn gebaut wurde: Jede Buchung des Quest Masters wird ein Moment wie in Ocarina of Time, den die Gruppe mitfeiert, und Rike begleitet ihn hörbar durch den Tag.

Sechs Regeln daraus:

1. **Kein Moment geht verloren.** Was der Quest Master bucht, sieht Dennis, auch wenn sein Handy gerade in der Tasche war.
2. **Alles landet dort, wo es wohnt.** Packs fliegen ins HUD, Ziffern rasten im Schloss ein, Items fallen in ihr Feld, Dennis läuft auf der Karte weiter. So lernt er das Menü nebenbei.
3. **Groß nur, wenn es groß ist.** Ein Kino-Moment für Medaillons, den Bund und das Kästchen. Alles andere kurz und sicher.
4. **Rike ist dabei.** Ihre Stimme im Zug, als Lieder auf der Okarina, als Botschaft auf dem Gipfel, im Abspann.
5. **Der Nebel bleibt dicht.** Nichts verrät kommende Quests.
6. **Ein Blick reicht.** HUD und Quest-Karte beantworten immer: Was ist jetzt dran, was habe ich, wie stehe ich.

---

## 2. Die Reise an einem Blick

| Phase | Was Dennis erlebt | Was er von der App will | Heute | Neu |
|---|---|---|---|---|
| Vor dem Start | bekommt den Link, installiert | verstehen, worum es geht | Titelbild, Installieren, dann direkt das Menü | Prolog der Fee (einmal), Ton-Knopf |
| Freitag, Zug | allein mit dem Log-Buch | Fragen, Rikes Stimme, die Gewissheit, dass alles klappt | Fenster mit Frage und Textfeld, Platzhalter-Klang | Kopfhörer-Tafel, Buch mit Seiten, echte Wellenform, zurückblättern, Warten auf das Urteil |
| Samstagmorgen | Prophezeiung | seine Vorhersagen im Blick | nur der Zähler | Vorhersagen in der App, versiegelt, Treffer je Vorhersage |
| Aufstieg | Quest für Quest, Handy zwischendurch | was ist dran, was hilft, wie stehe ich, und der Moment beim Ergebnis | Quest-Karte, Ergebnis-Fenster (nur wenn die App gerade offen ist) | verpasste Momente, Beute fliegt an ihren Platz, Titelkarte für jede neue Quest, Chronik |
| Gipfel | Showdown gegen den Bund | welche Duelle, Spielstand, was hilft | Text „Drei Duelle" und einzelne Fenster | Boss-Titelkarte, Duell-Tafel, Kammer der Weisen, Rikes Botschaft |
| Hütte | Abrechnung, Kästchen | Code groß, fehlende Ziffern, Packs, Öffnen | „Zum Kästchen" im HUD | Kästchen-Ansicht, Öffnen-Moment, Abspann |
| Abend, München | Packs öffnen | Erinnerung | nichts | Abspann und Rikes Lieder zum Nachhören |

---

## 3. Seite für Seite

Jede Seite mit denselben Fragen: Was fragt sich Dennis an dieser Stelle, was ist heute da, was fehlt. Danach der Plan nach Reise, UX, Design und UI, Erlebnis.

### 3.1 Startbildschirm

**Heute:** Titelbild mit schwebender Fee, Licht und Glühwürmchen, PRESS START, APP INSTALLIEREN, Vollbild. Sehr stark, bleibt.

| Dennis fragt sich | Heute da | Plan |
|---|---|---|
| Ist seit dem letzten Mal etwas passiert? | Nein. Bucht der Quest Master, während der Startbildschirm offen oder die App zu ist, sieht Dennis später kein Ergebnis-Fenster. Die Werte springen still um. | Die Fee meldet sich: Sie leuchtet golden und schwirrt schneller. Nach PRESS START laufen die verpassten Momente nacheinander (3.6). |
| Hört man das? | Töne starten beim ersten Tippen. Auf dem iPhone kann der Stummschalter die Fanfaren schlucken. | Ton-Knopf neben dem Vollbild-Knopf, die Wahl wird gemerkt. |
| Wie geht es los? | Das Bild blendet aus, das Menü ist da. | Übergang: Die Kamera fährt in den Waldweg, die Fee fliegt voraus, das Menü klappt mit dem Menü-Ton auf. Unter einer Sekunde, Tippen überspringt. |

- **Reise:** Beim allerersten Start folgt auf PRESS START der Prolog (3.2).
- **UX:** Der Startbildschirm hält keine Neuigkeit mehr zurück, er kündigt sie an.
- **Design und UI:** Ton-Knopf im Stil des Vollbild-Knopfs, Symbol Lautsprecher an oder aus.
- **Erlebnis:** Die Fee als Zeichen „Hey, hör zu!", ohne ein Wort über den Inhalt. Das ist nebelsicher und fühlt sich an wie Navi.

### 3.2 Prolog (neu, einmal pro Handy)

**Heute:** Das Ziel des Spiels steht nirgends. Nur das Packs-Fenster sagt „deins" und „beim Bund".

Nach dem ersten PRESS START fliegt die Fee ins Bild. Vier Tafeln im Stil der N64-Textbox, Tippen blättert, ÜBERSPRINGEN oben rechts.

| Tafel | Text | Bild |
|---|---|---|
| 1 | Hey! Wach auf, Dennis! | Die Fee fliegt ein. |
| 2 | Der Bund hat ein Kästchen verschlossen. Darin liegen zehn Packs. | Kästchen mit Schloss, die Pack-Karten dahinter. Die Zahl kommt aus `waehrung.max`. |
| 3 | Gewinnst du, bekommst du Packs und die Ziffern des Codes. | Eine Karte fliegt ins HUD, eine Ziffer rastet ein. |
| 4 | Was am Ende dir gehört, nimmst du mit. Deine erste Prüfung wartet. | Das Menü öffnet sich auf QUESTS. |

- **Wer ist die Fee?** Entschieden am 26.09.: Rikes Botin. So trägt „A Link to Rike" durch den ganzen Tag, und die Fee leuchtet rosa, wenn Rike spricht. Name offen (Entscheidung 6).
- Die Fee spricht auch das Onboarding der Ausrüstung (heute neutrale blaue Blasen) und die wenigen Hinweise danach.

### 3.3 HUD

**Heute:** links zehn Pack-Karten (etwa 13 × 18 px) und die Zahl, in der Mitte der Name der nächsten Quest, rechts das Schloss mit vier Rädern. Tippen erklärt.

| Dennis fragt sich | Heute da | Plan |
|---|---|---|
| Wie viele Packs habe ich? | Die Zahl ist gut lesbar, leere Karten sind kaum zu sehen. | Karten etwas größer, leere als dunkle Kartenrücken, die neue leuchtet auf. |
| Woher kommen meine Packs? | Fenster „0 / 10 PACKS" mit „deins" und „beim Bund". | Kassenbuch: jede Änderung mit Grund, zum Beispiel „+1 Log-Buch", „−1 Kreuzung der Klingen", „−1 Strafe vom Quest Master". Darüber ein Satz zum Ziel. Zeigt nur Vergangenes, also nebelsicher. |
| Was ist jetzt dran? | Name in der blauen Box. | Medaillon oder Stein der Quest vor dem Namen. Nach der letzten Quest: ZUM KÄSTCHEN mit Truhe, pulsiert, öffnet die Kästchen-Ansicht (3.10). |
| Wie steht der Code? | Vier Räder, Tippen zeigt die Herkunft. | Neue Ziffer: Das Rad rollt wie ein Zahlenschloss und rastet mit einem Klick ein. Alle vier bekannt: Das Schloss glänzt golden. |

- **Reise:** Das HUD ist der Kontostand des Tages. Es bewegt sich bei jeder Buchung und springt nie still um.
- **UX:** Tippflächen bleiben wie sie sind.
- **Design und UI:** Kartenrücken im One-Piece-Stil, die Zahl bleibt in Georgia.
- **Erlebnis:** Belohnungen fliegen aus dem Ergebnis ins HUD (Richtung B).

### 3.4 QUESTS (Startseite)

**Heute:** links die Liste mit LÄUFT, DEIN WEG und der Nebel-Zeile, rechts die Karte der gewählten Quest mit Text, Log-Buch-Knopf, EINSETZBAR (nur Symbole) und SIEG und NIEDERLAGE.

| Dennis fragt sich | Heute da | Plan |
|---|---|---|
| Was ist dran, wo, was muss ich tun? | Name, JETZT, Ort, Text. | bleibt |
| Was steht auf dem Spiel? | SIEG und NIEDERLAGE mit Symbolen. | bleibt |
| Was kann ich hier einsetzen? | Symbole ohne Namen. Der Hinweis „Sag es dem Quest Master" steht nur in der Ausrüstung. | Symbol mit Kurzname und Anzahl („Rolle ×1") und die Zeile „Sag dem Quest Master, was du einsetzt." |
| Wie läuft die Prophezeiung, wo ist das Amulett? | Abschnitt LÄUFT oben in der Liste. Beim Öffnen springt die Liste zur nächsten Quest, LÄUFT liegt dann meist außerhalb des Blicks. | eigene Zeile über der Liste, immer sichtbar: Auge mit ★☆☆, Amulett mit „versteckt" oder „gefunden". Tippen öffnet die Karte. |
| Was habe ich bei einer erledigten Quest bekommen? | derselbe Text wie vorher („Wähle deinen Gegner …"), die Sieg-Zeile hell, die andere blass | Chronik-Eintrag: Uhrzeit, was er bekommen hat, was er eingesetzt hat, „▶ Moment ansehen". Was nicht eingetreten ist, bleibt blass: Er sieht, was er verpasst hat (der Roguelike-Gedanke aus dem Briefing). |
| Log-Buch fertig, und jetzt? | Knopf „ALLE 6 BESIEGELT". | „Der Quest Master liest deine Antworten." mit Sanduhr. Nach dem Urteil „Log-Buch lesen". |
| Was kommt im Showdown? | nur „Drei Duelle, zuerst deine Revanchen". | Duell-Tafel (3.9). |
| Was kommt noch? | „Noch 3 Prüfungen", Karte „Im Nebel. Zeigt sich, wenn es dran ist." | bleibt. Die Nebel-Karte zeigt die verdeckten Medaillons und am Ende des Wegs das Kästchen. |

- **Reise:** Vor dem Spiel ist die Quest-Karte die Einsatzbesprechung, danach die Chronik.
- **UX:** Laufende Quests angeheftet. Beim Öffnen ist immer die nächste Quest gewählt, wie heute.
- **Design und UI:** Einsetzbar als kleine Chips mit Namen. Chronik mit Uhrzeit neben dem Status.
- **Erlebnis:** „▶ Moment ansehen" spielt den Ergebnis-Moment jeder erledigten Quest noch einmal, zum Herzeigen.

### 3.5 Log-Buch (Freitag im Zug)

**Heute:** ein Fenster über der Quest-Seite. Frage, Textfeld, BESIEGELN, dann Wachssiegel, Abspielknopf mit tanzenden Balken und RIKE, WEITER. Am Ende „Alle Antworten sind besiegelt. Der Quest Master entscheidet."

| Dennis fragt sich | Heute da | Plan |
|---|---|---|
| Was muss ich tun? | Frage und Textfeld. | bleibt |
| Werde ich Rike hören? | nichts bis zur ersten Antwort | Vorher eine Tafel: „Setz Kopfhörer auf. Rike spricht gleich zu dir." Mit Tonprobe und dem Hinweis „Rikes Stimme ist bereit", sobald alle sechs Dateien geladen sind. Wichtig für Funklöcher im Zug. |
| Spricht sie gerade? | tanzende Balken, immer gleich | Wellenform aus der echten Datei, ein Lichtpunkt läuft mit. |
| Nochmal hören, zurück zu Frage 2? | nur die aktuelle Nachricht, zurück geht nicht | Blättern vor und zurück durch besiegelte Seiten. Die Antwort bleibt fest, jede Nachricht lässt sich wieder abspielen. |
| Und jetzt? | ein Satz | Das Buch schließt sich, das große Siegel prägt sich ein, die Fee sagt: „Jetzt urteilt der Quest Master." |
| Später nochmal hören? | Nein. Nach dem Urteil verschwindet der Knopf. | „Log-Buch lesen" auf der erledigten Quest und Rikes Lieder auf der Okarina (3.8). |

- **Reise:** Das ist der Auftakt des Tages und der emotionalste Teil. Er bekommt eine eigene Bühne statt eines Fensters.
- **UX:** Bleibt über der Tastatur (heute schon gelöst), Antworten werden wie heute ohne Netz nachgereicht.
- **Design und UI:** Aufgeschlagenes Buch auf Pergament: links die Frage, rechts seine Antwort in Tinte mit Siegel. Rikes Teil in ihrem Rosa wie heute.
- **Erlebnis:** Die Seite blättert nach WEITER um (CSS-3D). Die Wellenform wird einmal aus der Datei berechnet, abgespielt wird über das normale Audio-Element. So schluckt der Stummschalter des iPhones Rikes Stimme nicht (am echten iPhone prüfen).

### 3.6 Der Ergebnis-Moment

**Heute:** Fenster mit Medaillon, das sich hineindreht, Strahlen, Titel wie PRÜFUNG BESTANDEN, Zeilen nacheinander, Melodie. Tippen schließt, das Menü dreht zu QUESTS, die nächste Quest tritt aus dem Nebel.

| Dennis fragt sich | Heute da | Plan |
|---|---|---|
| Habe ich gewonnen? | Titel, Farbe, Melodie | Kammer der Weisen für Prüfungen (Richtung A, Abschnitt 4). |
| Was bekomme ich? | Zeilen im Fenster | Die Zeilen bleiben, danach fliegt jede Beute an ihren Platz (Richtung B). |
| Ich habe gerade nicht aufs Handy geschaut. | Der Moment ist weg (3.1). | Warteschlange: Jedes Handy merkt sich, was Dennis zuletzt gesehen hat. Verpasste Momente laufen einzeln in Spielreihenfolge, kleine Änderungen gesammelt in einem Fenster „Außerdem". |
| Aus Versehen weggetippt | Das Fenster schließt beim ersten Tippen, auch nach 0,1 Sekunden. | wie eine N64-Textbox: Der erste Tipp zeigt sofort alles, der zweite schließt. Später „▶ Moment ansehen". |
| Drei Dinge auf einmal gebucht | ein Fenster „… und 2 weitere" | jede Quest ihr eigener Moment |
| Verloren, und jetzt? | rot, „−1 Pack" | eine Zeile Trost: „Das ist noch nicht vorbei." bei Spielen, die als Revanche wiederkommen können, sonst „Kopf hoch. Weiter geht's." (Entscheidung 7) |
| Spruchrolle eingesetzt | rote Zeile „Spruchrolle eingesetzt", als wäre es ein Verlust | violett, Titel ZAUBER GEWIRKT, die Rolle entrollt sich, Runen glühen auf |
| Was kommt jetzt? | Der Nebel lichtet sich über der Zeile. | Dazu eine Titelkarte wie beim Betreten eines Ortes: groß „ERSTES WALDSTÜCK", darunter „Auge des Jägers". 1,5 Sekunden, verschwindet von selbst. |

- **Reise:** Das ist der Herzschlag des Tages: neun Quests, zwei laufende, drei Duelle, das Kästchen.
- **UX:** Nie etwas verpassen, nie aus Versehen verlieren, jede Neuigkeit genau einmal.
- **Design und UI:** Große Titel in Hylia Serif als Kapitälchen: Ihre großen Umlaute haben keine Punkte, ihre Kleinbuchstaben sind Kapitälchen mit Punkten. Titel werden deshalb klein geschrieben dargestellt, nur der erste Buchstabe groß („Prüfung bestanden"). ß fehlt ganz. Sidequests und laufende Quests behalten das kompakte Fenster.
- **Erlebnis:** Richtung A und B (Abschnitt 4). Android vibriert beim Sieg kurz, das iPhone kann das im Browser nicht.

### 3.7 KARTE

**Heute:** Karte vom Zug bis zur Hütte mit Medaillons, Steinen, Nebel und Dennis' Kopf. Rechts PRÜFUNGEN 3/6, SIDEQUESTS und die Stationsbox.

| Dennis fragt sich | Heute da | Plan |
|---|---|---|
| Wo bin ich? | Kopf über der Station | bleibt. Nach einem Ergebnis läuft er den Weg zur nächsten Station. |
| Wie weit noch? | Zähler, Nebel ab der Mitte zur nächsten Station | Gegangener Weg golden, kommender gestrichelt. Der Nebel treibt langsam und zieht beim Fortschritt sichtbar ab. |
| Welche Prüfung war wo? | pro Station nur ein Medaillon | Stationen mit zwei Prüfungen zeigen beide (umgesetzt 26.09.). Vorher fehlte das Medaillon des Podrennens, weil die Wiese zwei Prüfungen hat. |
| Was ist dort passiert? | Liste der Quests der Station | Tippen auf die Station öffnet die Quest auf QUESTS, dort steht die Chronik (umgesetzt 26.09., Abschnitt 11) |
| Wo endet der Weg? | Hütte als kleiner Punkt | Das Kästchen steht an der Hütte, als Ziel des Wegs. Es zeigt, wie viele Ziffern schon bekannt sind, und leuchtet, wenn der Weg dort ankommt. |
| Verlorener Stein | roter Stein ohne X, sieht aus wie ein Herz | grau (umgesetzt 26.09.) |

- **Reise:** Die Karte ist Rückblick und Vorfreude. Hier sieht Dennis, wie weit er gekommen ist.
- **UX:** Umgesetzt am 26.09. (Abschnitt 11): keine Stationsbox mehr. Tippen auf eine Station öffnet ihre Quest auf QUESTS, die Karte hat die volle Breite.
- **Design und UI:** Optional die sechs Medaillons wie im Quest-Status von Ocarina of Time: fünf im Kreis um das Triforce des Bundes statt einer Reihe.
- **Erlebnis:** lebender Nebel, Dennis läuft (Richtung B).

### 3.8 AUSRÜSTUNG

**Heute:** links fünf Item-Felder, rechts zwei Fähigkeiten, in der Mitte Dennis mit Okarina. Noch nicht Erspieltes ist ein leerer Platz. Was bei der aktuellen Quest geht, leuchtet, der restliche Besitz ist grau.

| Dennis fragt sich | Heute da | Plan |
|---|---|---|
| Was habe ich? | Besitz, der gerade nicht hilft, ist so stark ausgegraut, dass er wie „nicht da" wirkt. | drei klare Zustände: leuchtet mit JETZT (einsetzbar), in Farbe ohne Leuchten (im Beutel), grau (verbraucht oder verloren) |
| Was ist das? | Textbox nach Tippen | bleibt. Dazu „Erbeutet bei Kreuzung der Klingen". |
| Wofür ist es gut? | „Hier gerade nicht einsetzbar." | Der Satz entfällt, das graue Feld sagt es (umgesetzt 26.09.). Nennt eine Quest nur, wenn sie schon sichtbar ist. |
| Der Beutel | Das Symbol liest sich eher als Laterne. | neues Beutel-Symbol |
| Warum spielt er Okarina? | Noten schweben | Tippen auf Dennis spielt eine kurze Melodie. Nach dem Log-Buch spielt die Okarina Rikes Lieder: die sechs Sprachnachrichten, einzeln wählbar. |
| Neues Item bekommen | Zeile im Ergebnis-Fenster | Das Item fliegt in sein Feld, das Feld blitzt auf. Optional hält Dennis es über den Kopf (braucht ein Bild, Entscheidung 8). |

- **Reise:** Hier wird der Roguelike-Gedanke sichtbar: was er hat, was er verbraucht hat, was er noch gewinnen kann (die leeren Plätze).
- **UX:** Onboarding bleibt, gesprochen von der Fee.
- **Design und UI:** einheitliche Symbole im N64-Stil (flach, zwei Töne, dunkle Kontur).
- **Erlebnis:** Rikes Lieder. In Ocarina of Time lernt Link Lieder, hier lernt Dennis Rikes Stimme.

### 3.9 Gipfel: Showdown (neu auf Dennis' Seite)

**Heute:** Dennis sieht die Prüfung des Bundes wie jede andere Quest. Welche drei Duelle kommen, sieht nur der Quest Master. Jedes Duell-Ergebnis erscheint als eigenes Fenster „DUELL 1 GEWONNEN".

| Dennis fragt sich | Heute da | Plan |
|---|---|---|
| Was kommt jetzt? | der Text der Quest | Boss-Titelkarte, sobald der Bund die nächste Quest ist: „PRÜFUNG DES BUNDES", darunter „Die Wächter des Bundes", Triforce, tiefer Ton. |
| Welche Duelle? | nichts | Duell-Tafel auf der Quest-Karte: drei Felder mit Spiel, Symbol und der Marke REVANCHE. Die Logik rechnet das schon aus (`showdownDuelle()` in `engine.js`). |
| Wie steht es? | einzelne Fenster | Spielstand „1 : 0", jedes Feld bekommt Haken oder X, darunter „Noch ein Sieg". |
| Was hilft mir? | EINSETZBAR | bleibt, mit Namen |
| Und dann? | Ergebnis-Fenster | Kammer der Weisen mit dem Triforce, danach Rikes Botschaft (entschieden am 26.09.). |

- **Reise:** Der Endkampf, auf den der ganze Tag zuläuft („Der Bund steht als Endboss auf dem Gipfel", `01-showdown-pruefung-des-bundes.md` §1).
- **UX:** Die Tafel zeigt nur, was feststeht, und erst, wenn der Bund dran ist.
- **Erlebnis:** Rikes Botschaft als Lohn des Endkampfs, so wie in `01` §1 und `04` §4 schon geplant (entschieden am 26.09.). Die vierte Ziffer rollt erst nach ihrer Nachricht ins Schloss.

### 3.10 Hütte: Kästchen und Abspann (neu)

**Heute:** Nach der letzten Quest zeigt das HUD „Zum Kästchen". Sonst passiert nichts.

| Dennis fragt sich | Heute da | Plan |
|---|---|---|
| Wie lautet der Code? | die HUD-Räder | Kästchen-Ansicht: der Code groß, zum Einstellen am echten Schloss |
| Fehlt eine Ziffer? | im Code-Fenster „verloren, am Kästchen 1 Pack" | im Kästchen: „? kostet 1 Pack". Den Kauf bucht der Quest Master wie heute, das Rad rollt zur Ziffer. |
| Wie viele Packs sind meins? | die Zahl im HUD | „8 von 10 Packs sind deins." |
| Und jetzt? | nichts | ÖFFNEN: Die Räder rollen nacheinander auf den Code, der Bügel springt auf, der Deckel öffnet sich, die Karten fächern auf, seine zu ihm, der Rest zum Bund. |
| War's das? | ja | Abspann: Die Chronik des Tages läuft durch (jede Quest mit Medaillon, Uhrzeit, Beute), am Ende die Zahlen des Tages, Rikes Botschaft zum Nachhören und „Fortsetzung folgt". |

- **Reise:** Das Ende braucht ein Ende. Der Abspann taugt abends in München zum Zeigen.
- **UX:** Die Ansicht öffnet sich nach der letzten Quest einmal von selbst und danach über ZUM KÄSTCHEN im HUD.
- **Erlebnis:** Öffnen-Moment (Richtung A), Abspann mit eigener Melodie.

### 3.11 Rahmen: Navigation, Ton, Netz, Hochformat

| Punkt | Heute | Plan |
|---|---|---|
| Wo bin ich im Menü? | Seitentitel, Z und R ohne Hinweis | Z und R zeigen das Symbol der Nachbarseite (Karte, Liste, Beutel), drei Punkte unter dem Titel. Kein zusätzliches Wort. |
| Ton | Töne bei jedem Tippen, Fanfaren | Ton-Knopf auf dem Startbildschirm. Ist Ton an, stellt die App auf dem iPhone die Audio-Sitzung auf „playback" (neuere Safari-Versionen), damit der Stummschalter die Fanfaren nicht schluckt. Am echten iPhone prüfen. |
| Kein Netz am Berg | „Offline · Stand 11:42" klein unten rechts | bleibt, dazu seit wann: „Kein Netz seit 12 Min". Die Warteschlange (3.6) sorgt dafür, dass nichts verloren geht. |
| Hochformat | „Handy quer halten" auf Schwarz | dazu die Fee und das Titelbild im Hintergrund |
| Bewegung reduzieren, schwache Handys | beachtet | Jede neue Wirkung bekommt eine stille und eine leichte Fassung (Abschnitt 8). |

### 3.12 Bildsprache

Seit dem 26.09. ein eigener Teil: Abschnitt 10 (Remaster des ganzen Menüs). Zwei Regeln gelten dort und hier:

- **Zustände überall gleich:** leuchtet = jetzt, Farbe = deins, grau = verbraucht oder verloren, „?" = im Nebel. Gilt in Liste, Karte, Ausrüstung und HUD.
- **Die Fee** ist die einzige Stimme für Hinweise. Keine anonymen Sprechblasen mehr.

---

## 4. Overdrive: drei Richtungen

Was heißt hier außergewöhnlich? Das Handy liegt draußen in der Sonne, fünf Leute schauen drauf, und es muss auf einem gedrosselten Samsung genauso laufen wie auf einem iPhone. Außergewöhnlich ist nicht der teuerste Effekt, sondern dass sich das Menü anfühlt wie ein echtes N64-Spiel, das auf die Buchungen des Quest Masters reagiert.

### Richtung A: Kammer der Weisen (Kino für die großen Momente)

- **So wirkt es:** Das Menü versinkt im Dunkel. Eine Lichtsäule in der Farbe des Medaillons fällt von oben, Funken steigen auf. Das Medaillon sinkt drehend herab, in echtem 3D mit Kante und wanderndem Glanz, landet, eine Lichtwelle läuft aus. Dann schiebt sich die N64-Textbox von unten herein und schreibt: „Du hast das Medaillon des Wassers erhalten!" Darunter die Beute. Bei einer Niederlage kein Licht: Das Medaillon wird grau, bekommt einen Riss und sinkt.
- **Wo:** sechs Prüfungen, der Bund, das Öffnen des Kästchens. Sonst nirgends.
- **Technik:** Canvas 2D (die Teilchen vom Startbildschirm), CSS-3D, `@property` für den Glanz, Web Animations für die Abfolge. Keine neue Bibliothek.
- **Zeit:** Text lesbar nach spätestens 1,8 Sekunden, ganz fertig nach 4 Sekunden. Der erste Tipp springt zur Textbox.
- **Aufwand** mittel, **Risiko** mittel (Feinschliff der Abfolge), **Rückfall** das heutige Fenster.

### Richtung B: Das Menü lebt (alles landet dort, wo es hingehört)

- **So wirkt es:** Das Ergebnis-Fenster bleibt kompakt, aber jede Folge ist eine Bewegung. Pack-Karten fliegen ins HUD und drehen sich von hinten nach vorn. Das Ziffernrad rollt wie ein Zahlenschloss und rastet ein. Ein neues Item fällt in sein Feld. Das Menü dreht sich von selbst zur passenden Seite. Auf der Karte wird der Weg golden, Dennis läuft zur nächsten Station, der Nebel zieht ab.
- **Technik:** FLIP und Web Animations, View Transitions (iPhone ab iOS 18, sonst Rückfall), SVG-Weg, Nebel als kleines Canvas mit Rauschen (20 Bilder pro Sekunde, hochskaliert).
- **Aufwand** mittel, **Risiko** gering, **Rückfall** die Werte springen wie heute.
- **Nebeneffekt:** Dennis lernt das Menü, weil er sieht, wohin alles fliegt.

### Richtung C: Echtes N64 (WebGL)

- **So wirkt es:** Das Pausenmenü als echtes Low-Poly-3D, gerechnet in N64-Auflösung und hochskaliert: das Prisma mit Licht, Medaillons als 3D-Münzen, der Cursor, eine kleine Szene beim Item-Fund. Text bleibt HTML, damit er lesbar ist.
- **Technik:** WebGL mit eigenen Shadern.
- **Aufwand** groß, **Risiko** hoch eine Woche vor dem JGA (Kontextverlust auf dem iPhone, Akku am Berg, Lesbarkeit in der Sonne), **Rückfall** das heutige Menü.

### Entschieden am 26.09.

**B als Grundlage, A für die sechs Medaillons, den Bund und das Kästchen. C nicht vor dem JGA.** So gibt es je Prüfung genau einen großen Moment, und die Effekte machen sich keine Konkurrenz. B löst nebenbei ein echtes UX-Problem: Heute springen Werte still um.

---

## 5. Fehler, die heute schon stören

1. **Verpasste Ergebnisse.** Ist der Startbildschirm offen oder die App zu, wenn der Quest Master bucht, erscheint kein Ergebnis-Fenster, die Werte springen still um (`app/app.js` Z. 1059, nur wenn `intro.hidden`). Eine App vom Home-Bildschirm lädt auf dem iPhone nach einem Wechsel oft neu und zeigt dann den Startbildschirm. Der Fall ist also häufig.
2. **Das Ergebnis-Fenster schließt beim ersten Tippen**, auch nach 0,1 Sekunden (`app/app.js` Z. 707). Wenn fünf Leute aufs Handy schauen, ist der Moment schnell weg.
3. **Das Podrennen fehlt auf der Karte.** Pro Station zeigte die Karte nur die erste Prüfung, die Wiese hat zwei. **Behoben am 26.09.**
4. **Laufende Quests aus dem Blick.** Die Liste springt zur nächsten Quest, der Abschnitt LÄUFT liegt dann darüber.
5. **Das Log-Buch ist nach dem Urteil weg.** Der Knopf erscheint nur, solange das Log-Buch die nächste Quest ist (`app/app.js` Z. 308). Rikes Nachrichten sind danach nicht mehr zu hören.
6. **Showdown ohne Tafel.** Dennis sieht nicht, welche drei Duelle kommen.
7. **Kleinere:** Eine eingesetzte Spruchrolle erscheint rot wie ein Verlust (`app/app.js` Z. 507 und 512). Ein verlorener Stein sieht auf der Karte aus wie ein Herz (`app/styles.css` Z. 283 und 284). Das Beutel-Symbol ist schwer zu lesen.

---

## 6. Bauplan

Jede Stufe ist für sich fertig und spielbar. Nichts davon baut die Kernlogik um: `derive()` bleibt, neu ist fast nur Darstellung in `app.js`, `styles.css` und `index.html`.

### Grunddesign (Abschnitt 10, parallel zu Stufe 1)

| Nr. | Was | Aufwand |
|---|---|---|
| G.1 | Stilprobe: QUESTS in der Mitte des Tages im neuen Look, als eigene Seite `app/stilprobe.html`. Die App bleibt live unverändert. **Gebaut am 26.09.** (10.4) | klein |
| G.2 | Schriften einbetten, Rollen festlegen, Courier und Trebuchet raus | klein |
| G.3 | Farben als feste Rollen, Stein je Seite dunkler, helle Schrift darauf, Kontrast gemessen | mittel |
| G.4 | Steintafeln mit Fase und Titelschild, Mulden, Textbox-Kante | mittel |
| G.5 | Ein Cursor (goldene Eckklammern) für Liste, Karte, Ausrüstung | klein |
| G.6 | Symbole neu: Beutel, Truhe, Hütte, Seitenzeichen, Medaillons mit Metallrand | mittel |
| G.7 | HUD-Band, größere Pack-Karten, schmalere Z- und R-Tasten | klein |
| G.8 | Karte als Pergament mit Tinte, Ausrüstung mit Bogenfenster | mittel |

Alles Neue aus Stufe 1 bis 3 entsteht gleich im neuen Look.

### Stufe 1: Fundament (vor dem Test mit echten Handys)

| Nr. | Was | Seite | Aufwand |
|---|---|---|---|
| 1.1 | Verpasste Momente nachholen: Warteschlange, gemerkt pro Handy, die Fee leuchtet auf dem Startbildschirm | 3.1, 3.6 | mittel |
| 1.2 | Ergebnis-Fenster wie eine N64-Textbox: erster Tipp zeigt alles, zweiter schließt | 3.6 | klein |
| 1.3 | Karte: mehrere Medaillons pro Station, verlorener Stein grau. **Umgesetzt 26.09.** | 3.7 | klein |
| 1.4 | Laufende Quests als feste Zeile über der Liste | 3.4 | klein |
| 1.5 | Einsetzbar mit Namen und dem Hinweis an den Quest Master | 3.4 | klein |
| 1.6 | Duell-Tafel am Gipfel | 3.9 | mittel |
| 1.7 | Log-Buch: Kopfhörer-Tafel, zurückblättern, nach dem Urteil lesen und hören | 3.5 | mittel |
| 1.8 | Ton-Knopf, Audio-Sitzung auf dem iPhone | 3.1, 3.11 | klein |
| 1.9 | Kästchen-Ansicht ohne Öffnen-Moment: Code groß, Packs, fehlende Ziffern mit Preis | 3.10 | mittel |
| 1.10 | Zauber statt roter Zeile | 3.6 | klein |

### Stufe 2: Erlebnis

| Nr. | Was | Seite | Aufwand |
|---|---|---|---|
| 2.1 | Die Fee: Prolog, Onboarding, Hinweise | 3.2 | mittel |
| 2.2 | Titelkarten für jede neue Quest und die Boss-Titelkarte | 3.6, 3.9 | klein |
| 2.3 | Chronik: Uhrzeit, Beute, „▶ Moment ansehen". Der Admin speichert dafür die Uhrzeit je Quest. | 3.4, 3.7 | mittel |
| 2.4 | Kassenbuch im Packs-Fenster | 3.3 | klein |
| 2.5 | Ausrüstung: drei Zustände, Herkunft, neues Beutel-Symbol | 3.8 | klein |
| 2.6 | Rikes Lieder auf der Okarina | 3.8 | mittel |
| 2.7 | Log-Buch als Buch mit echter Wellenform und Umblättern | 3.5 | mittel |
| 2.8 | Trostzeile bei Niederlagen | 3.6 | klein |
| 2.9 | Rikes Botschaft nach dem Bund und der Abspann | 3.9, 3.10 | mittel, braucht die Aufnahme |
| 2.10 | Vorhersagen in der App, versiegelt, Treffer je Vorhersage | 2 | mittel, dazu Admin |

### Stufe 3: Overdrive (B und A, entschieden in Abschnitt 4)

| Nr. | Was | Richtung | Aufwand |
|---|---|---|---|
| 3.1 | Beute fliegt, Ziffernräder rollen, das Menü dreht sich selbst zur richtigen Seite | B | mittel |
| 3.2 | Karte lebt: Weg golden, Dennis läuft, Nebel treibt und zieht ab | B | mittel |
| 3.3 | Kammer der Weisen | A | mittel |
| 3.4 | Kästchen öffnen | A | mittel |
| 3.5 | Übergang vom Startbildschirm ins Menü | A und B | klein |

Nach jeder Stufe: `node app/engine.test.js`, dazu `tests/geraete.mjs` und `tests/nebel.mjs` erweitern (Warteschlange, Duell-Tafel, Kästchen, Nebel bleibt dicht in allen neuen Ansichten) und Screenshots auf allen sechs Geräten.

Beim Grunddesign zusätzlich: Kontrast aller Texte messen (mindestens 4,5 : 1) und die Bildrate auf dem gedrosselten Samsung.

**Vorschlag zum Zeitplan:** zuerst die Stilprobe zum Absegnen. Dann Grunddesign und Stufe 1 bis Dienstag, 29.09., danach der Test mit zwei echten Handys (offener Punkt 4 in `CLAUDE.md`). Stufe 2 und 3 nach Lust und Zeit. Am Donnerstag, 1.10., einfrieren, danach nur noch Inhalte in `config.js`.

---

## 7. Was es dafür braucht

**In `config.js`** (neue Felder, alle optional):

- `fee`: Name und die Texte des Prologs.
- `botschaft`: `{ audio: "assets/botschaft.m4a" }`, freigeschaltet, wenn der Bund bestanden ist.
- `abspann`: die Schlusszeile.
- je Quest optional `titel` für die Titelkarte, sonst Ort und Questname.
- beim Amulett optional `frist` (zum Beispiel „12:00"), dann läuft auf seiner Karte eine Uhr (Frist ist in 07 Nr. 15 noch offen).

**Im gespeicherten Dokument:**

- `zeiten: { [questId]: Zeitstempel }`, schreibt der Admin beim Buchen. Die Logik reicht es nur durch. Das entspricht Stufe 7 (Karte und Chronik) in `05-system-plan.md` Teil B.
- Die Vorhersagen als eigener Pfad neben dem Spiel, wie beim Log-Buch (`/spiele/dennis-jga-2026-prophezeiung`), und Treffer je Vorhersage statt nur „+1". Die geschützte Firebase-Regel in `app/README.md` muss Dennis dann auch dort schreiben lassen.

**Dateien, die ich besorge oder zeichne:**

- eine runde Sans für Text und Beschriftungen als `woff2` in `app/assets/` (frei nutzbar, Vorschlag Nunito, OFL), Herkunft in `SCHRIFTEN.md`.
- neue Symbole als Vektor im Sprite von `index.html`, keine Bilddateien.

**Dateien von dir:**

- Rikes sechs Sprachnachrichten (stehen schon aus).
- Rikes Botschaft als siebte Datei, `app/assets/botschaft.m4a` (entschieden am 26.09.).
- Optional ein zweites Avatar-Bild: Dennis hält mit beiden Händen etwas über den Kopf, wie Link beim Item-Fund (Entscheidung 8).

---

## 8. Leitplanken

- **Überspringen:** Jeder Moment ist mit einem Tipp übersprungen. Keine Information wartet länger als 1,8 Sekunden auf eine Animation.
- **Ton:** nur, wenn er an ist. Rikes Stimme läuft über das normale Audio-Element.
- **Bewegung reduzieren:** gleiche Information, keine Flüge, kein Drehen, Farben und Zustände bleiben.
- **Schwache Handys** (`html.schwach`): halbe Teilchen, kein Canvas-Nebel, keine 3D-Kanten.
- **Nebel:** `tests/nebel.mjs` prüft jede neue Ansicht: Titelkarten, Chronik, Kassenbuch, Duell-Tafel, Abspann.
- **Lesbar in der Sonne:** Text mindestens 4,5 : 1, Symbole und Cursor mindestens 3 : 1, gemessen im Test.
- **Texte:** Du-Form, höchstens zwei kurze Sätze, keine Gedankenstriche, keine Quest-Namen in Item-Texten.
- **Technik:** keine neue Bibliothek, kein Build-Schritt, alles läuft wie heute direkt aus `app/`.

---

## 9. Entscheidungen

**Entschieden am 26.09.:**

1. **Overdrive:** B „Das Menü lebt" als Grundlage, A „Kammer der Weisen" für die sechs Medaillons, den Bund und das Kästchen (Abschnitt 4).
2. **Finale mit Rikes Botschaft:** Rike nimmt eine siebte Nachricht auf. Sie spielt nach dem gewonnenen Bund, erst danach rollt die vierte Ziffer ins Schloss. Dann Kästchen-Ansicht, Öffnen-Moment und Abspann (3.9, 3.10).
3. **Prophezeiung in der App:** Dennis tippt seine Vorhersagen morgens ein und besiegelt sie wie im Log-Buch. Der Quest Master bucht Treffer je Vorhersage, bei Dennis bricht genau dieses Siegel.
4. **Die Fee führt Dennis,** als Rikes Botin (3.2).
5. **Das visuelle Design des ganzen Menüs wird überarbeitet** (Abschnitt 10).

**Noch offen:**

6. **Name der Fee.**
7. **Trostzeile.** „Das ist noch nicht vorbei." deutet die Revanche an, ohne den Showdown zu nennen. Passt das zur Nebel-Regel?
8. **Item-Fund-Bild.** Lieferst du ein zweites Avatar-Bild, auf dem Dennis etwas über den Kopf hält?
9. **Schrift für Text.** Nunito oder eine andere runde Sans. Die Stilprobe zeigt den Vorschlag.
10. **Zeitplan.** Erst die Stilprobe, dann Grunddesign und Stufe 1 bis 29.09., Einfrieren am 1.10.?

---

## 10. Visuelles Design: Remaster (neu, 26.09.)

Wunsch vom 26.09.: Das visuelle Design des ganzen Menüs soll besser werden.

**Richtung: Remaster, kein Neubau.** So wie Ocarina of Time 3D das N64-Original neu gebaut hat: dieselbe Welt, dieselben drei Seiten, dieselben Farben der Medaillons, aber klare Materialien, eigene Schriften, saubere Symbole und genug Kontrast für die Sonne am Berg. Wer das Menü heute kennt, erkennt alles wieder. Titelbild und Avatar bleiben, wie sie sind.

### 10.1 Befund

| Bereich | Heute | Problem |
|---|---|---|
| Schrift | drei Systemschriften: Georgia (Titel), Trebuchet MS (Text), Courier New (Beschriftungen). Die Zelda-Schrift Hylia Serif nur bei PRESS START. | Auf dem Samsung gibt es keine der drei. Dort springt alles auf Ersatzschriften, das Menü sieht anders aus als auf dem iPhone. Courier wirkt nach Büro, nicht nach Hyrule. |
| Kontrast | gemessen: Seitentitel QUESTS und KARTE etwa 3 : 1, auf AUSRÜSTUNG noch weniger. Abschnitte wie DEIN WEG 2,2 : 1, Zahlen der Legende 3 : 1, TEGERNSEE 2,4 : 1. | Draußen in der Sonne kaum lesbar. Ziel für Text: mindestens 4,5 : 1. |
| Stein | olivgrüne Verläufe mit Punktraster, dunkle Schrift direkt darauf | wirkt matt, fast schmutzig. Die drei Seiten (Ocker, Oliv, Graugrün) unterscheiden sich kaum. |
| Seitentitel | dunkle Serifenschrift direkt auf dem Stein | kein Gewicht, kein Schild, geht unter |
| Auswahl | vier verschiedene Zeichen: gelber Rahmen (Liste), weißer Ring (Karte), weiß blinkender Rahmen (Ausrüstung), gelb blinkender Ring (JETZT) | Das Auge muss auf jeder Seite neu lernen, was gewählt ist. |
| HUD | Pack-Karten 13 × 18 px, leere als dünne gestrichelte Umrisse | Der Kontostand des Tages ist das kleinste Element am Bildschirm. |
| Z und R | große graue Keile | nehmen Platz und sagen nichts über die Nachbarseite |
| Karte | flache Flächen, Hütte als Punkt, Weg überall gleich gestrichelt | sieht nach Skizze aus, nicht nach Schatzkarte |
| Ausrüstung | Avatar in einem harten schwarzen Rechteck, leere Felder als dunkle Quadrate, viel leerer Stein | Der Held wirkt ausgeschnitten, die Seite leer. |
| Symbole | gemischte Herkunft und Strichstärken, der Beutel liest sich als Laterne | kein einheitlicher Satz |

### 10.2 Die Bausteine

**Schrift: zwei Familien, eingebettet, gleich auf iPhone und Samsung**

| Rolle | Schrift | Wo |
|---|---|---|
| Titel | Hylia Serif als Kapitälchen (große Umlaute ohne Punkte, kein ß, siehe 3.6) | Seitentitel, Quest-Namen auf der Quest-Karte, Ergebnis, Titelkarten, Prolog, Kästchen |
| Text und Beschriftung | eine runde, kräftige Sans wie die Textboxen im Spiel, als eigene Datei in `app/assets/`. Vorschlag: Nunito (frei nutzbar, OFL), zwei Stärken | alles andere. Beschriftungen in Großbuchstaben und leicht gesperrt, Zahlen gleich breit |

Courier New und Trebuchet MS fallen weg, Georgia bleibt nur als Ersatz. Namen mit ß („Große Wasserpistole") stehen immer in der Sans.

**Farben: feste Rollen**

| Rolle | Farbe |
|---|---|
| Stein je Seite | dunkler und klar getrennt: KARTE warmes Braun, QUESTS Moosgrün, AUSRÜSTUNG Schiefer. Schrift darauf immer hell (Creme), nie mehr dunkel auf Stein. |
| Gold | gewonnen, Rahmen, Titelschild |
| Gelb | Cursor und JETZT |
| Rot | verloren |
| Violett | Magie und laufende Quests |
| Rosa | Rike |
| Blau | Textbox, Erklärung |

Text mindestens 4,5 : 1, Symbole und Cursor mindestens 3 : 1, gemessen im Test statt nach Augenmaß.

**Material**

- **Tafeln:** Stein mit Fase (heller Rand oben links, dunkler unten rechts) und feiner Körnung statt Punktraster, innen eine dünne Goldleiste.
- **Titelschild:** Jede Seite trägt ihren Namen auf einer kleinen Plakette mit Goldrand, oben in der Mitte, in Hylia Serif.
- **Mulden:** Liste, Item-Felder, Kartenrahmen und Stationsbox als eingelassene Mulden mit Innenschatten, überall gleich.
- **Textbox:** bleibt blau, mit sauberer Doppelkante.

**Ein Cursor für alles:** die vier goldenen Eckklammern aus Ocarina of Time, die sanft atmen. Gleich in Liste, Karte, Ausrüstung, Log-Buch und Kästchen. Die nächste Quest leuchtet, statt zu blinken.

**Ein Satz Symbole:** eine Strichstärke, zwei Töne, dunkle Kontur, wie die Item-Symbole im Spiel. Neu gezeichnet: Beutel, Truhe für das Kästchen, Hütte, die Zeichen der drei Seiten für Z und R. Medaillons bekommen einen Metallrand mit Glanz.

### 10.3 Seite für Seite

| Seite | Heute | Remaster |
|---|---|---|
| HUD | kleine Karten, blaue Box, Schloss | dunkles Band über die ganze Breite, Karten 1,5-mal so groß mit Kartenrücken, Name der Quest mit Medaillon, Schloss mit Metallglanz |
| QUESTS | Liste und Karte auf Oliv | Liste in einer Mulde, Zeilen etwas höher, Medaillons größer, Haken in Gold. Quest-Karte mit großem Medaillon und dem Namen in Hylia Serif. |
| KARTE | flache Skizze | Pergament mit Papierstruktur und Tintenlinien, Höhenlinien, kleine Tannen, See mit Wellenlinien, Gipfelkreuz auf der Neureuth, Hütte als Zeichen, das Kästchen am Ende des Wegs. Stationsnamen auf kleinen Schildern, TEGERNSEE lesbar. |
| AUSRÜSTUNG | Avatar im Rechteck, leere Quadrate | Avatar in einem Bogenfenster mit Steinrahmen und Licht von oben. Felder als Steinmulden, Besitz mit Goldrand. ITEMS und FÄHIGKEITEN auf kleinen Plaketten. Avatar und Felder werden größer, der leere Stein schrumpft. |
| Z und R | große graue Keile | schmaler, mit dem Zeichen der Nachbarseite |
| Fenster | schwarzer Kasten mit Goldrand, Titel in Georgia | Titel in Hylia Serif, Kante wie das Titelschild |
| Log-Buch | blaues Fenster | Pergament und Tinte (3.5) |

### 10.4 Vorgehen

1. **Stilprobe (gebaut am 26.09.):** `app/stilprobe.html` mit `app/stilprobe.css` als Schicht über `styles.css`, gleiche Logik wie die App, die live unverändert bleibt. Ohne Zusatz Mitte des Tages, auch `?demo=start&direkt` und `?demo=ende&direkt`. Umgesetzt sind Schriften (Nunito eingebettet, Hylia Serif als Kapitälchen), Stein je Seite mit Fase, Körnung und Goldleiste, Titelschild, Mulden, Textbox mit Doppelkante, Cursor mit Eckklammern, Medaillons mit Metallrand, HUD-Band mit Kartenrücken, schmalere Z und R mit Zeichen der Nachbarseite. Noch nicht: Pergament-Karte, Bogenfenster, neue Item-Symbole.
   Gemessen: Kontrast vorher 2,2 bis 3,4 : 1 bei Titeln und Beschriftungen auf dem Stein, nachher mindestens 4,7 : 1, die meisten 7 bis 17 : 1. `tests/geraete.mjs` auf der Stilprobe: 0 Probleme auf allen sechs Geräten. Umblättern auf dem gedrosselten Samsung gleich schnell wie vorher (95 % der Bilder unter 17 ms).
   Du schaust sie auf dem Handy an und sagst ja oder was anders soll.
2. **Grunddesign** auf alle Seiten übertragen, parallel zu Stufe 1 (Abschnitt 6, Tabelle G). Alles Neue aus Stufe 1 bis 3 entsteht gleich im neuen Look.
3. **Prüfen:** Kontrast aller Texte gemessen in `tests/geraete.mjs`, Screenshots auf allen sechs Geräten, Bildrate auf dem gedrosselten Samsung. Danach wird die Stilprobe gelöscht.

---

## 11. Aufgabenteilung und weniger Text (umgesetzt am 26.09.)

Wunsch vom 26.09.: KARTE und QUESTS überschneiden sich inhaltlich. Dazu überall prüfen, welcher Text wegfallen kann, weil er sich von selbst erklärt oder doppelt ist. Gilt für die App und die Stilprobe (gemeinsamer Code).

**Regel: Die Karte zeigt nur das Wo, QUESTS nur das Was.** Die Karte ist zugleich der Fortschritt: Medaillons, Steine, Nebel und Dennis' Kopf zeigen, wie weit er ist. Alles zum Inhalt einer Quest steht auf QUESTS. Tippen auf eine Station öffnet dort ihre Quest: die nächste, wenn sie an dieser Station ist, sonst die erste erledigte, im Nebel die Nebel-Karte. An der Hütte steht das Kästchen, Tippen zeigt den Code.

| Information | Bisher an | Jetzt nur noch |
|---|---|---|
| Wie viele Prüfungen geschafft | Legende auf QUESTS (3/6), Zähler neben der Karte mit Medaillon-Reihe, Medaillons auf der Karte, Liste | Liste (Haken und „Noch 3 Prüfungen") und Medaillons auf der Karte |
| Sidequests geschafft | Legende, Zähler neben der Karte, Karte, Liste | Liste und Karte |
| Welche Quests an einer Station, mit Ergebnis | Stationsbox neben der Karte, Liste | Liste. Die Station auf der Karte führt dorthin |
| Du bist hier | Kopf auf der Karte und „DU BIST HIER" in der Stationsbox | Kopf auf der Karte |
| Im Nebel | Nebel und „?" auf der Karte, „Im Nebel" in der Stationsbox | Karte |
| Anzahl Spruchrollen | Legende, Feld in der Ausrüstung, Einsetzbar | Feld in der Ausrüstung und Einsetzbar |
| Status der gewählten Quest | Haken, X oder JETZT in der Liste, dazu eine Marke auf der Quest-Karte | Liste und Medaillon |
| Läuft | Überschrift LÄUFT und Marke LÄUFT in Zeile und Quest-Karte | Überschrift. Die Prophezeiung behält ihren Zähler (1/3) |
| Dein Weg | Überschrift | feine Linie |
| Im Beutel | Feld zeigt das Item, dazu Marke IM BEUTEL | Feld |
| Anzahl eines Items | „×1" im Feld und in der Textbox | Feld |
| Gerade nicht einsetzbar | graues Feld und Satz „Hier gerade nicht einsetzbar." | graues Feld |
| Stand hh:mm | immer unten rechts | nur ohne Netz: „Offline · Stand 11:42" |

**Bewusst geblieben:**

- Name der nächsten Quest im HUD: auf KARTE und AUSRÜSTUNG der einzige Hinweis, Tippen springt zu QUESTS.
- Zahl neben den Pack-Karten: zehn Karten zählt niemand auf einen Blick.
- SIEG und NIEDERLAGE: der einzige Ort, der zeigt, was auf dem Spiel steht.
- EINSETZBAR: Symbole allein sind mehrdeutig.
- ITEMS und FÄHIGKEITEN: erklären die zwei Gruppen.
- Ort auf der Quest-Karte: steht nirgends sonst.

**Nebenbei:** An einer Station stehen jetzt alle Prüfungen (Fehler 3 in Abschnitt 5), ein verlorener Stein ist auf der Karte grau statt rot, die Karte hat die volle Breite, Enter öffnet auf dem Laptop die gewählte Station.

**Geprüft:** `node app/engine.test.js`, `tests/nebel.mjs` (verrät nichts), `tests/geraete.mjs` für App und Stilprobe ohne Probleme auf allen sechs Geräten, Admin und Dennis zusammen wie vorher, Klicktest der Stationen (Wiese öffnet Kreuzung der Klingen, Wald die nächste Quest, Gipfel den Nebel, Hütte den Code).
