# Erlebnis-Plan: Dennis' Menü Seite für Seite

Stand 26.09.2026. **Vorschlag, in Teilen gebaut** (Prolog 3.2 und Karte 3.7 seit dem 26.09., siehe Abschnitt 12). Entscheidungen vom 26.09. sind eingetragen (Abschnitt 9), dazu der Teil zum visuellen Design (Abschnitt 10). **Umgesetzt am 26.09.:** Aufgabenteilung von KARTE und QUESTS und weniger Text (Abschnitt 11), Stilprobe (10.4). Grundlage ist ein Rundgang durch die App v1, so wie Dennis sie erlebt: iPhone 15 vom Home-Bildschirm und in Safari, jeweils am Anfang, in der Mitte, am Gipfel und am Ende des Tages, dazu Log-Buch, alle Ergebnis-Fenster und die Fenster für Packs und Code. Nachstellen mit `?demo=start`, `?demo` und `?demo=ende`.

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

Seit 26.09. umgedreht (Branch `elegant-ramanujan`, auf `main`): Rike beantwortet sieben Fragen über Dennis, er tippt in ein bis drei Worten, was sie gesagt hat, dann hört er ihre Antwort. Der Plan unten gilt unverändert.

**Heute:** ein Fenster über der Quest-Seite. Frage, Textfeld, BESIEGELN, dann Wachssiegel, Abspielknopf mit tanzenden Balken und RIKE, WEITER. Am Ende „Alle Antworten sind besiegelt. Der Quest Master entscheidet."

| Dennis fragt sich | Heute da | Plan |
|---|---|---|
| Was muss ich tun? | Frage und Textfeld. | bleibt |
| Werde ich Rike hören? | nichts bis zur ersten Antwort | Vorher eine Tafel: „Setz Kopfhörer auf. Rike spricht gleich zu dir." Mit Tonprobe und dem Hinweis „Rikes Stimme ist bereit", sobald alle sieben Dateien geladen sind. Wichtig für Funklöcher im Zug. |
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
| Spruchrolle eingesetzt | rote Zeile „Spruchrolle eingesetzt", als wäre es ein Verlust | violett, Titel FLUCH GESPROCHEN, die Rolle entrollt sich, Runen glühen auf |
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

**Heute (seit 27.09., Abschnitt 13):** links der Lederbeutel mit fünf Items, rechts zwei Fähigkeiten in Runenkreisen, in der Mitte Dennis mit Okarina im Bogenfenster. Noch nicht Erspieltes ist ein Schatten, dessen Form man erkennt. Deins = Farbe mit Goldrand, jetzt einsetzbar = leuchtet mit JETZT, verbraucht oder verloren = grau.

| Dennis fragt sich | Heute da | Plan |
|---|---|---|
| Was habe ich? | Besitz, der gerade nicht hilft, ist so stark ausgegraut, dass er wie „nicht da" wirkt. | drei klare Zustände: leuchtet mit JETZT (einsetzbar), in Farbe ohne Leuchten (im Beutel), grau (verbraucht oder verloren) |
| Was ist das? | Textbox nach Tippen | bleibt. Dazu „Erbeutet bei Kreuzung der Klingen". |
| Wofür ist es gut? | „Hier gerade nicht einsetzbar." | Der Satz entfällt, das graue Feld sagt es (umgesetzt 26.09.). Nennt eine Quest nur, wenn sie schon sichtbar ist. |
| Der Beutel | Das Symbol liest sich eher als Laterne. | neues Beutel-Symbol |
| Warum spielt er Okarina? | Noten schweben | Tippen auf Dennis spielt eine kurze Melodie. Nach dem Log-Buch spielt die Okarina Rikes Lieder: die sieben Sprachnachrichten, einzeln wählbar. |
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
- **Gebaut am 29.09.:** Siegbildschirm, Geschichte als Laufschrift wie bei Star Wars (Wunsch des Nutzers) und Abspann mit THE END, Code und „Öffne jetzt das Kästchen“. Die Chronik steht im Abspann (Quests mit Ergebnis, Beute, Zahlen, ohne Uhrzeit). Noch offen aus diesem Abschnitt: Kästchen-Ansicht mit Öffnen-Moment und Rikes Botschaft vor dem Abspann (braucht die Aufnahme).

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
| 1.10 | Fluch statt roter Zeile | 3.6 | klein |

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

- Rikes sieben Sprachnachrichten `frage1.m4a` bis `frage7.m4a` (Fragen seit 26.09. fest, Liste für Rike in `app/assets/logbuch/LIESMICH.md`).
- Rikes Botschaft als achte Aufnahme, `app/assets/botschaft.m4a` (entschieden am 26.09.).
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
2. **Finale mit Rikes Botschaft:** Rike nimmt zusätzlich zu den sieben Log-Buch-Antworten eine Botschaft auf. Sie spielt nach dem gewonnenen Bund, erst danach rollt die vierte Ziffer ins Schloss. Dann Kästchen-Ansicht, Öffnen-Moment und Abspann (3.9, 3.10).
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

---

## 12. Onboarding und Karte (umgesetzt am 26.09., zweiter Teil)

Auf Wunsch des Nutzers: „am Anfang noch einen Ticken mehr Onboarding“ und mehr Interaktion und Funktion auf der Karte. Gewählt: Karte lebt, Stationen antippen, echte Position per GPS, Höhe und Strecke.

- **Prolog (3.2):** nach dem ersten PRESS START, einmal pro Handy und nur am Anfang des Spiels (seit 27.09., Abschnitt 13; `?onboarding` jedes Mal). Rikes Fee fliegt ein, vier Tafeln wie in 3.2 (Text erscheint Buchstabe für Buchstabe, erster Tipp zeigt alles), Punkte zeigen den Fortschritt, ÜBERSPRINGEN oben rechts. Danach ein Rundgang in vier Schritten: Packs, Code, Z und R, Quest-Karte. Die Fee hat keinen Namen („Rike schickt mich“), Entscheidung 6 bleibt offen.
- **Die Fee spricht alle Hinweise** (3.12): Sie sitzt in jeder Hinweisblase, auch im Onboarding der Ausrüstung. Freigestellt als `assets/fee.png`.
- **Karte (3.7, Richtung B):** gegangener Weg golden, Dennis läuft zur neuen Station, sobald er die Karte ansieht (Rückgängig springt ohne Laufen), der Nebel treibt.
- **Stationstafel:** Tippen auf eine Station zeigt Ort, Höhe, Kilometer ab Bahnhof, die Quests mit Status und im Nebel nur „1 Prüfung im Nebel“. Zeile oder zweites Tippen öffnet die Quest. An der Hütte das Kästchen mit Code, Packs und fehlenden Ziffern. Die Tafel liegt immer auf der anderen Seite als die Station.
- **Kartusche:** Höhe, Strecke und Höhenmeter bis zum Gipfel, Höhenprofil des echten Wegs mit den Stationen.
- **GPS:** freiwillig per Knopf, nur solange die Karte offen ist. Feenlicht auf dem Weg, weit weg die Luftlinie, ohne Erlaubnis ein Hinweis.
- **Getestet:** `tests/karte.mjs`, `tests/nebel.mjs` prüft auch alle Stationstafeln, `tests/geraete.mjs` mit Prolog, Rundgang und Tafeln auf allen sechs Geräten.

---

## 13. Ausrüstung mit Schatten, Fluch statt Zauber, Onboarding nur am Anfang (umgesetzt am 27.09.)

Wünsche vom 27.09.: Items und Fähigkeiten am Anfang leer, aber so, dass man erkennt, was es ist. Aufbewahrung spannender, das animierte Bild in der Mitte bleibt. Spruchrolle mystischer und Fluch statt Zauber. Onboarding lief später am Tag noch einmal.

- **Schatten statt leerer Plätze** (ersetzt die Entscheidung „leere Plätze“ vom 25.09.): Was Dennis noch nicht hat, steht als dunkler Schatten mit offener Naht im Feld. Antippen zeigt den Tarnnamen und den Tarntext, dazu „Zu erbeuten bei …“ (nur wenn die Quest schon aus dem Nebel ist), sonst „Wartet noch im Nebel.“, nach einer Niederlage „Entgangen bei …“ (blasser Schatten). Die Belohnung auf der Quest-Karte zeigt denselben Schatten statt der Truhe, das Ergebnis-Fenster lässt ihn beim Entpuppen hell werden.
- **Vier Zustände** (3.8 und 3.12): Schatten, Farbe mit Goldrand (deins, dazu ab und zu ein Glanz), leuchtet mit pulsierendem Ring und JETZT in der Textbox (einsetzbar), grau (verbraucht oder verloren). Besitz, der gerade nicht hilft, ist nicht mehr ausgegraut.
- **Aufbewahrung:** Items in einem Lederbeutel mit Naht und Plakette, Fähigkeiten in Runenkreisen auf Nachthimmel (der Kreis dreht sich, das Zeichen schwebt). Dennis im Bogenfenster mit Steinrahmen, Licht von oben und schwebendem Staub (10.3). Auswahl mit goldenen Eckklammern (G.5). Neues Beutel-Symbol (2.5).
- **Fund:** Was seit dem letzten Besuch dazugekommen ist, tritt beim nächsten Besuch der Ausrüstung aus dem Schatten (Lichtblitz, Funken, kurze Melodie) und trägt NEU, bis Dennis es antippt. Gemerkt pro Handy, beim ersten Besuch gilt alles als gesehen. Die Textbox nennt die Herkunft: „Erbeutet bei …“, „Eingesetzt bei …“.
- **Spruchrolle:** „In dieser Rolle schläft ein alter Fluch. Entrolle sie in einem Spiel, und er erwacht. Welche Gestalt er annimmt, weiß niemand, bis er gesprochen ist.“ Beim Einsetzen: „Der Fluch ist gesprochen. Welche Gestalt er annimmt, enthüllt dir der Quest Master.“
- **Onboarding nur am Anfang:** Prolog, Beutel-Fund und Hinweise der Fee kommen nur, solange noch keine Quest entschieden ist. Ein neues Handy, ein anderer Browser oder der Home-Bildschirm statt Safari (eigener Speicher) zeigen es später am Tag nicht mehr. Kommt der echte Stand erst nach PRESS START, verschwindet der Prolog still. Demo: nur mit `?demo=start`, `?onboarding` erzwingt es.
- **Stilprobe repariert:** Seit dem Onboarding vom 26.09. fehlten ihr Prolog, Kartusche und Stationstafel, sie brach beim Laden ab. Jetzt wieder auf dem Stand von `index.html`.
- **Geprüft:** `node app/engine.test.js`, `tests/karte.mjs` (neu: später am Tag kein Onboarding, auch auf einem neuen Handy mit echtem Stand), `tests/nebel.mjs` (neu: jedes Feld der Ausrüstung angetippt, nichts verraten), `tests/geraete.mjs` (0 Probleme auf allen sechs Geräten), `tests/probe.mjs`.

---

## 14. Dennis trägt selbst ein, du bist Schiedsrichter (umgesetzt am 27.09., zweiter Teil)

Wunsch vom 27.09.: Die Momente hängen davon ab, dass der Quest Master bucht, und Dennis sieht sie nur, wenn er gerade das Menü offen hat. Er soll selbst sagen, ob er bestanden hat, mit Bestätigung, und Items und Fähigkeiten selbst einlösen. Der Quest Master kann zurücknehmen.

Entschieden am 27.09.: Siegel gedrückt halten, Dennis trägt auch Duelle, Rikes Amulett und Ziffern am Kästchen ein, beim Zurücknehmen sagt es ihm die Fee, direkt bauen.

- **Siegel:** Jede Eingabe öffnet ein Fenster mit dem, was passiert (Sieg- oder Niederlage-Zeile, beim Einsetzen die Wirkung). Das Siegel wird gedrückt gehalten, bis sich der Ring schließt (knapp eine Sekunde). Ein kurzer Tipp löst nichts aus. Danach läuft sofort der Moment, auch ohne Netz.
- **Quest-Karte:** BESTANDEN in der Zeile SIEG, VERLOREN in der Zeile NIEDERLAGE, nur bei der Quest, die dran ist. Das Log-Buch erst, wenn alle sieben Antworten besiegelt sind. Rikes Amulett: GEFUNDEN in der Zeile STAND, danach ZUSAMMENGESETZT (`ergebnisWort` in `config.js`).
- **Einsetzen:** Die leuchtenden Symbole unter EINSETZBAR sind Knöpfe, in der Ausrüstung steht EINSETZEN in der Textbox. Passt ein Item bei mehreren laufenden Quests, fragt das Fenster wo. Der Text im Fenster kommt aus `einsatz` in `config.js` (Spruchrolle: „Der Fluch erwacht …“).
- **Gipfel (3.9):** Duell-Tafel mit den drei Duellen, das nächste offene hat SIEG und NIEDERLAGE. Nach der Mehrheit erscheint nur noch der passende Knopf für die Prüfung. Der Quest-Text weicht der Tafel.
- **Kästchen:** Nach der letzten Quest führt „Zum Kästchen“ im HUD zum Code. Fehlende Ziffern tauscht Dennis dort gegen Packs, solange sie reichen.
- **Zurücknehmen:** Der Admin zeigt Dennis' Einträge live mit Uhrzeit und Zurücknehmen, dazu eine kurze Meldung bei jedem neuen Eintrag. Bei Dennis erscheint die Fee mit ZURÜCKGENOMMEN und dem Satz „Der Quest Master hat das Ergebnis von … zurückgenommen. Trag es neu ein.“ Das gilt auch für Rückgängig im Admin (vorher still).
- **Verpasste Momente (3.6, Stufe 1.1):** Jedes Handy merkt sich den zuletzt gesehenen Stand. Nach PRESS START laufen verpasste Momente nacheinander, jede Quest einzeln in der Reihenfolge, in der sie entschieden wurde. Die nächste Quest bleibt so lange im Nebel.
- **Technik:** eigener Kanal `/spiele/<spiel>-dennis` (wie das Log-Buch, Einträge einzeln, offline gepuffert). `engine.js` `mitEintraegen()` rechnet sie ein, was der Admin entschieden hat, gilt vor. Rückgängig im Admin stellt zurückgenommene Einträge wieder her. Firebase-Regeln in `app/README.md`.
- **Geprüft:** `node app/engine.test.js` (neue Fälle für Einträge), `tests/selbst.mjs` (Admin und Dennis zusammen: Siegel, kurzer Tipp, Moment, Zurücknehmen, Rückgängig, Einsatz, verpasster Moment nach PRESS START, Duelle, Amulett, Ziffer), `tests/geraete.mjs` mit dem Siegel-Fenster auf allen sechs Geräten, `tests/probe.mjs`, `tests/nebel.mjs`, `tests/karte.mjs`.

---

## 15. Etwas kleiner, die Fee stellt sich vor (umgesetzt am 28.09.)

Wünsche vom 28.09.: In der App alles etwas kleiner, weil es an manchen Stellen gequetscht wirkt. Ganz am Anfang des Onboardings ein oder zwei Elemente mehr: Rike hat die Fee geschickt, „Willkommen auf deinem Mini-JGA“, das wird eine Reise, du wirst geprüft werden.

- **Kleiner:** Schriften, HUD, Quest-Zeilen, Quest-Karte, Kartusche und Stationstafel auf der Karte, Felder der Ausrüstung, Ergebnis-, Siegel- und Log-Buch-Fenster, Prolog und Hinweise der Fee, jeweils gut 10 %. Die Seiten haben mehr Luft: Am Gipfel passen Duell-Tafel, SIEG und NIEDERLAGE jetzt auch im kleinsten Safari-Fenster ohne Scrollen, die Kartusche kürzt die Station nicht mehr ab. Untergrenzen bleiben: Schrift mindestens 10 px, Tippflächen mindestens 28 px, das Eingabefeld im Log-Buch 16 px (sonst zoomt das iPhone).
- **Gemessen (iPhone 15):** Text der Quest-Karte in Safari 12,3 px (vorher 14 px), vom Home-Bildschirm 14,1 px (vorher 16,1 px). Quest-Zeile 32 px und 35 px hoch (vorher 34 px und 39 px), Item-Feld 40 px und 46 px (vorher 45 px und 52 px).
- **Prolog mit sechs Tafeln** (vorher vier, 3.2 und 12):
  1. Die Fee allein: „Hey, wach auf, Dennis! Ich bin die Fee. Rike hat mich zu dir geschickt.“
  2. Titel wie ein Gebietsname im Spiel, „Willkommen auf deinem“ und groß „Mini-JGA“ in Hylia Serif mit Goldlicht (die Schrift hat keine Umlaute, der Titel braucht keine), dazu die Fanfare der Prüfungen: „Willkommen auf deinem Mini-JGA! Ab jetzt weiche ich dir nicht mehr von der Seite.“ Seit 29.09. stattdessen der Titel vom Startbild: „Willkommen in“ und groß „The Legend of Dennis“, die Fee sagt „Willkommen in deiner eigenen Legende! Ab jetzt weiche ich dir nicht mehr von der Seite.“
  3. Die Reise: Zug, sechs Medaillons mit Fragezeichen, die ansteigen, oben der Gipfel. „Das wird eine Reise, vom Zug bis auf den Gipfel. Und unterwegs wirst du geprüft werden.“ Die Zahl der Medaillons kommt aus `config.js` (Prüfungen), der Nebel bleibt gewahrt.
  4. bis 6. wie bisher: Kästchen mit den Packs, Packs und Ziffern gewinnen und verlieren, was am Ende dir gehört.
- **Wieder neu:** Der Prolog merkt sich unter einem neuen Namen, dass er gesehen wurde. Wer die alten vier Tafeln schon auf seinem Handy gesehen hat, bekommt am Anfang des Spiels die neuen sechs.
- **Geprüft:** `node app/engine.test.js`, `tests/karte.mjs` (neu: sechs Tafeln, Fee, Willkommen, Reise), `tests/geraete.mjs` (0 Probleme auf allen sechs Geräten), `tests/nebel.mjs`, `tests/selbst.mjs`, `tests/probe.mjs`. Die Stilprobe zeigt die neuen Tafeln ebenfalls.

---

## 16. Eine Aufgabe von vorn bis hinten: Ausrüsten beim Spiel, ruhigere Texte (Vorschlag, 29.09.)

Wunsch vom 29.09.: Den Ablauf einer Aufgabe aus Dennis' Sicht prüfen. Items und Fähigkeiten werden heute auf der Quest-Karte eingesetzt, dadurch braucht es die Ausrüstung kaum. Dennis soll **beim** Spiel (nicht vorher) auf die Ausrüstung gehen: „Das kann ich einsetzen, das habe ich. Klick, klick.“ Dazu überall den Text beruhigen, Informationen vereinfachen und weglassen, was es nicht braucht (impeccable clarify).

Bilder in `entwuerfe/ablauf-aufgabe/` (nicht veröffentlicht): `heute-…` ist die App wie jetzt, `neu-…` ist die echte App im Demo-Stand, in der nur die Inhalte für die Vorschau ausgetauscht sind. Die App selbst ist unverändert.

### 16.1 Durchgespielt: Auge des Jägers, wie es heute ist

| Schritt | Was Dennis sieht | Was hakt |
|---|---|---|
| 1 | Der Kartenwurf ist besiegelt, der Moment läuft, das Menü dreht zu QUESTS, Auge des Jägers tritt aus dem Nebel. | nichts, das sitzt |
| 2 | Quest-Karte (`heute-1-quest`): Titel, zwei Sätze, EINSETZBAR mit zwei Symbolen ohne Namen, SIEG mit BESTANDEN, NIEDERLAGE mit VERLOREN. | „Was ist das blaue Ding?“ Tippen erklärt nicht, sondern öffnet sofort ein Siegel. Drei laute Knöpfe, bevor das Spiel begonnen hat. |
| 3 | Ausrüstung (`heute-3-ausruestung`): dieselben zwei leuchten, die Textbox hat drei Sätze und EINSETZEN. | Zweiter Weg zum selben Ziel. Die Seite ist nur noch ein Lexikon. |
| 4 | Pistole einsetzen (`heute-2-einsetzen` zeigt das Fenster beim Fluch): „ITEM EINSETZEN … Bleibt in deinem Beutel.“, dann der Moment „KLEINE WASSERPISTOLE, eingesetzt bei Auge des Jägers“. | Ritual ohne Entscheidung: Die Pistole hilft immer, verbraucht wird nichts. Zwei Dinge heißen zwei Siegel und zwei Momente. |
| 5 | Fluch sprechen: Siegel mit VORTEIL, „Jeder Fluch hat seinen Preis. Welchen, erfährst du, wenn er gesprochen ist.“ und „Du hast 2, danach 1.“, dann die Fluch-Szene. | Die einzige echte Entscheidung, gut so. Drei Sätze, wo einer reicht. |
| 6 | Spiel, dann BESTANDEN, Siegel halten, Moment. | nichts, das sitzt |

Dazu der **Schild**: Dennis setzt ihn heute vor dem Duell ein („Setz ihn vorher ein, dann spielst du das Duell noch einmal.“). Gewinnt er, ist der Schild trotzdem weg.

### 16.2 Die Mechanik: Ausrüsten beim Spiel, wie mit den C-Tasten

Wie in Ocarina of Time: Vor dem Kampf öffnet Link das Menü und legt, was er braucht, auf die C-Tasten. Genau das wird die Ausrüstung.

- **Quest-Karte ohne Einsatz-Knöpfe** (`neu-1-quest-vor-dem-spiel`): Sie sagt, was dran ist und was auf dem Spiel steht. Hat Dennis etwas, das hier hilft, steht dort **AUSRÜSTEN**, daneben die Symbole dessen, was hilft. Tippen dreht zur Ausrüstung.
- **Die Ausrüstung weiß, wofür** (`neu-2-ausruesten`): Plakette „FÜR AUGE DES JÄGERS“ über dem Bogenfenster, unter Dennis drei gelbe C-Tasten mit den Pfeilen vom N64-Controller. Was hier hilft, leuchtet. **Tippen legt es auf die nächste freie C-Taste** (Haken am Feld), nochmal Tippen legt es zurück. Nichts ist endgültig.
- **Ein Siegel für alles** (`neu-3-ausruesten-beides`, `neu-4-siegel`): In der Textbox steht MITNEHMEN mit der Zahl. Das Siegel-Fenster zeigt DABEI und beim Fluch seinen Vorteil. Einmal halten besiegelt alles. Danach ein Moment AUSGERÜSTET („Der Bund gibt dir die Kleine Pistole.“), beim Fluch danach die Fluch-Szene mit dem Schattendieb wie heute. Das Menü dreht zurück zu QUESTS. In echt heißt MITNEHMEN: Der Bund gibt Dennis das Ding in die Hand (Pistole, Kreisel, Schwert, Nadel).
- **Quest-Karte danach** (`neu-5-quest-nach-dem-ausruesten`): Zeile DABEI mit Namen, beim Fluch mit dem, was er hier bewirkt. Tippen auf DABEI führt wieder zur Ausrüstung, falls er noch etwas dazunehmen will.
- **Eine Farbe pro Schritt:** Die Karte hebt immer nur den nächsten Schritt hervor. Vor dem Spiel ist AUSRÜSTEN golden, BESTANDEN und VERLOREN sind nur umrandet. Nach dem Mitnehmen umgekehrt. Hat Dennis nichts, was hier hilft, gibt es kein AUSRÜSTEN und alles bleibt wie heute. Gesperrt wird nichts, eintragen kann er jederzeit.
- **Schild und Segen melden sich selbst** (`neu-6-schild`): Sie retten, sie bereiten nicht vor, darum liegen sie nicht auf den C-Tasten. Tippt Dennis bei einem Duell VERLOREN (auch im Showdown) und hat einen Schild, bietet das Siegel-Fenster „Schild einsetzen“ neben „Verloren eintragen“ an: „Statt zu verlieren, spielst du noch einmal. Danach ist er weg.“ Kein Schild geht mehr umsonst verloren. Rikes Segen bleibt, wo er heute schon ist: am Tor.
- **Am Gipfel** rüstet Dennis für das aktuelle Duell („FÜR DUELL 2 · AUGE DES JÄGERS“). So sind es nie mehr als zwei Dinge, drei C-Tasten reichen immer.
- **Rikes Amulett:** AUSRÜSTEN auf seiner Quest-Karte öffnet die Ausrüstung für das Amulett (Fluch: ein Tipp vom Quest Master). Die Plakette sagt immer, wofür.

**Technik, kurz:** keine neuen Daten. MITNEHMEN schreibt je Ding einen Einsatz wie heute (`e_…`, beim Fluch mit `raub`), nur in einem Rutsch. Der Admin sieht alles wie bisher. `engine.js`: `einsetzbar()` am Gipfel nur für das aktuelle Duell, der Schild nicht mehr in `einsetzbar` der Quests, sondern im Siegel der Niederlage. `app.js`: Die Auswahl auf den C-Tasten lebt nur auf dem Handy, bis sie besiegelt ist. Moment AUSGERÜSTET für mehrere Einsätze. Tests: `selbst.mjs`, `glanz.mjs`, `durchlauf.mjs` und `rubine.mjs` setzen heute auf der Quest-Karte ein und ziehen um, neu `tests/ausruesten.mjs`.

### 16.3 Ruhigere Texte

Regeln (clarify):

1. Jeder Gedanke nur einmal. Was ein Symbol, eine Zahl oder die Farbe schon sagt, sagt kein Satz.
2. Die Quest-Karte sagt in einem Satz, was zu tun ist. Die genauen Regeln erklärt der Bund vor Ort.
3. Ein Item sagt zuerst, was es bewirkt, in einem Satz. Stufe und Herkunft stehen darunter in der Textbox.
4. In Dennis' Fenstern kein Satz über den Quest Master, außer wenn er etwas zurücknimmt.
5. Gleiche Dinge, gleiche Wörter: Items und den Fluch **nimmt** Dennis **mit**, Schild und Segen **setzt** er **ein**. SIEG und NIEDERLAGE zeigen, was auf dem Spiel steht, BESTANDEN und VERLOREN, was passiert ist.

**Quest-Texte** (`text` in `config.js`):

| Quest | Heute | Neu |
|---|---|---|
| Rikes Tagebuch | Rike hat sieben Fragen über dich beantwortet. Schreib, was sie gesagt hat, dann hörst du ihre Antwort. | Sieben Fragen über dich: Errate, was Rike geantwortet hat. |
| Die drei Zeichen | Schlag zwei aus dem Bund nacheinander im Schnick Schnack Schnuck. Wer zuerst zwei Runden gewinnt, siegt. | Schlag beide aus dem Bund im Schnick Schnack Schnuck, jeweils Best of 3. |
| Wirbel der Götter | Zwei Kreisel, eine Arena. Wer sich länger dreht, gewinnt. | bleibt |
| Das Podrennen | Ein kleiner Gleiter, ein Parcours, eine Uhr. Fahr schneller als die Zeit. | Fahr den Gleiter durch den Parcours, schneller als die Uhr. |
| Kartenwurf | Ein Duell mit Karten aus deinen Packs. Wer mehr ins Ziel bringt, gewinnt. | Wirf Karten aus deinen Packs ins Ziel, mehr als dein Gegner. |
| Auge des Jägers | Fünf Flammen, ein Tank, deine stärkste Wasserwaffe. Lösch sie, bevor dir das Wasser ausgeht. | Lösch fünf Flammen mit einem Tank. |
| Klingen des Deku-Baums | Wirf deine Klingen in den alten Baum. Nur was stecken bleibt, zählt. | bleibt |
| Hüter der Flamme | Trag ein brennendes Teelicht 100 Schritte bergauf, ohne dass es erlischt. Der Bund darf dich ablenken, aber nicht anpusten. | Trag ein Teelicht 100 Schritte bergauf, ohne dass es ausgeht. |
| Rikes Rache | Rike hat verraten, was du überhaupt nicht kannst. Fädle ein, bevor die Zeit abläuft. | bleibt |
| Prüfung des Bundes | Drei Duelle gegen den Bund, zuerst deine Revanchen. Antreten darfst du nur mit allen vier Ziffern. | Drei Duelle gegen den Bund. Zwei musst du gewinnen. (Revanchen und Tor zeigen ihre Tafeln selbst.) |
| Rikes Amulett | Rikes Brosche ist versteckt. Finde sie und setz sie zusammen, bevor du am Gipfel stehst. | Finde Rikes versteckte Brosche und setz sie bis zum Gipfel zusammen. |

**Items und Fähigkeiten** (`text`, `einsatz`, `fund` in `config.js`, die Tarntexte bleiben):

| Was | Heute | Neu |
|---|---|---|
| Wasserspritze, Fund | Deine erste Wasserwaffe. Stärkere erspielst du dir, sie nehmen in diesem Feld ihren Platz ein. | Deine erste Wasserwaffe. Stärkere landen im selben Feld. |
| Kleine Wasserpistole | Mehr Wasser, mehr Reichweite. Sie löst die Spritze ab. | Mehr Wasser, mehr Reichweite. („Stufe 2 von 3“ sagt den Rest) |
| Große Wasserpistole | Die Monsterpistole: elektrisch, mit Dauerfeuer und Licht. Keiner schießt so lange wie du. | Die Monsterpistole: elektrisch, mit Dauerfeuer. |
| Gepanzerte Karten | Zwei Karten mehr, in festen Hüllen. Sie fliegen weiter und stabiler. | Zwei Karten mehr, in festen Hüllen. |
| Götterkreisel | Dein eigener Kreisel. Du darfst vorher üben und wählst zuerst. | Du übst vorher und wählst zuerst. |
| Stich | Eine Elbenklinge. Ein Schwert mehr heißt ein Versuch mehr. | Eine Elbenklinge: ein Schwert mehr. |
| Stopfnadel | Ein größeres Öhr als bei einer feinen Nadel. Da findet der Faden leichter hindurch. | Größeres Öhr, der Faden findet leichter durch. |
| Dicke Nadel | Das größte Öhr von allen. Sie löst die Stopfnadel ab. | Das größte Öhr von allen. |
| Fluch | Ein alter Fluch. Sprich ihn vor einem Spiel, und er verschafft dir dort einen Vorteil. Doch jeder Fluch hat seinen Preis. | Bringt dir bei einem Spiel einen Vorteil. Doch jeder Fluch hat seinen Preis. |
| Fluch, im Siegel | Jeder Fluch hat seinen Preis. Welchen, erfährst du, wenn er gesprochen ist. Du hast 2, danach 1. | nur der Vorteil und „Doch jeder Fluch hat seinen Preis.“ |
| Schild des Bundes | Wiederhole ein verlorenes Duell. Einmal. | Verlierst du ein Duell, spielst du es noch einmal. |
| Rikes Segen | Rike wacht über dich. Am Tor zum Gipfel schenkt dir ihr Segen eine fehlende Ziffer. | Rike wacht über dich. Am Tor schenkt ihr Segen dir eine fehlende Ziffer. |

**In der App** (`app.js`):

| Wo | Heute | Neu |
|---|---|---|
| Siegel, Item | Bleibt in deinem Beutel. / Einmalig, danach verbraucht. / Du hast 1, danach 0. | entfällt, die Zahl steht am Symbol |
| Siegel, Glanzsieg | Nur mit 2 Karten Vorsprung. Der Quest Master kann es zurücknehmen. | Nur mit 2 Karten Vorsprung. |
| Siegel, Duell verloren | Du hast den Schild des Bundes. Setz ihn vorher ein, dann spielst du das Duell noch einmal. | Wahl „Schild einsetzen“ oder „Verloren eintragen“ (16.2) |
| Siegel, Pack öffnen | Der Bund gibt es dir. Verlierst du später und hast keine geschlossenen Packs mehr, zahlst du mit Karten: pro Pack deine beste aus einem geöffneten. | Der Bund gibt es dir. |
| Fenster Packs | fünf Zeilen, darunter „8 geschlossen: Damit zahlst du, wenn du verlierst.“ und „Keine geschlossenen mehr? Dann zahlst du mit Karten: pro Pack deine beste aus einem geöffneten.“ | „8 geschlossen“ mit PACK ÖFFNEN, „2 geöffnet“, „10 beim Bund“, eine Regel: „Ohne geschlossene Packs zahlst du mit deiner besten Karte.“ |
| Moment, mit Karten gezahlt | −1 Karte: Mehr geschlossene Packs hattest du nicht. Der Bund nimmt sich deine beste Karte. | −1 Karte, deine beste. Geschlossene Packs hattest du keine mehr. |
| Moment, nichts mehr zu verlieren | Du hattest keine Packs mehr, die du verlieren konntest. / Mehr hattest du nicht. | Mehr Packs hattest du nicht. |
| Moment, Item eingesetzt | KLEINE WASSERPISTOLE, eingesetzt bei Auge des Jägers | AUSGERÜSTET, Auge des Jägers, eine Zeile je Ding |
| Textbox Ausrüstung | Einsetzbar bei Kartenwurf und Rikes Amulett. | Leuchtet: „Hilft hier.“, auf der C-Taste: „Nimmst du mit. Nochmal tippen legt es zurück.“, beim Fluch der Vorteil für dieses Spiel |
| Tagebuch fertig | Alle Antworten sind besiegelt. Trag jetzt auf der Quest-Karte ein, ob du bestanden hast. | Alle sieben besiegelt. Trag dein Ergebnis auf der Quest-Karte ein. |
| Fee in der Ausrüstung | vier Hinweise, darunter „Was leuchtet, kannst du bei der aktuellen Quest einsetzen: antippen, dann das Siegel halten.“ | drei: „Hier landet, was du dir erspielst. Die Schatten zeigen, was noch zu holen ist.“, „Vor jedem Spiel: Tippe, was du mitnimmst.“, „Deine Packs und die Ziffern für das Kästchen.“ |
| Prolog, Tafel 6 | Verlierst du, holt sich der Bund Packs zurück. Unterwegs darfst du welche öffnen. Hast du dann keine geschlossenen mehr, zahlst du mit Karten. | Verlierst du, holt sich der Bund Packs zurück. Öffnen darfst du deine jederzeit. (Das mit den Karten sagt der Moment, wenn es passiert.) |

**Bewusst geblieben:** Tarnnamen und Tarntexte der Schatten (das Geheimnis ist der Spaß, und sie stehen nur da, wenn Dennis danach fragt), „Siegel gedrückt halten“, die Sätze des Schattendiebs, alle Texte von Rike, der Fee im Prolog und im Abspann, SIEG und NIEDERLAGE als einzige Stelle, die zeigt, was auf dem Spiel steht.

### 16.4 Zu entscheiden

1. Mechanik wie in 16.2: C-Tasten auf der Ausrüstung, ein Siegel MITNEHMEN, Schild und Segen melden sich selbst?
2. Texte wie in 16.3, auch Prolog-Tafel 6?
3. Danach bauen: erst die Mechanik, dann die Texte, jeweils mit Tests auf allen Geräten.
