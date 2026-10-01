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
- **GPS:** freiwillig per Knopf, nur solange die Karte offen ist. Feenlicht auf dem Weg, weit weg die Luftlinie, ohne Erlaubnis ein Hinweis. Seit 30.09. gestrichen, siehe Abschnitt 17.
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

## 16. Eine Aufgabe von vorn bis hinten: Ausrüsten beim Spiel, ruhigere Texte (umgesetzt am 29.09.)

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

### 16.4 Entschieden und gebaut (29.09.)

Der Nutzer hat 16.2 und 16.3 so freigegeben: erst die Mechanik, dann die Texte. Dazu kam sein Wunsch: **Jedes Fenster ist immer gleich groß** (ein oder vier Zeilen, nichts springt), und die Schrift ist überall dieselbe.

- **Quest-Karte:** AUSRÜSTEN mit den Symbolen dessen, was hier hilft (pulsiert golden), BESTANDEN und VERLOREN solange nur umrandet. Nach dem Mitnehmen die Zeile DABEI mit Namen, dann leuchten die Knöpfe zum Eintragen. DABEI antippen führt wieder zur Ausrüstung (ein kleines Plus zeigt, was noch dazukönnte). Bei erledigten Quests steht, was dabei war.
- **Ausrüstung:** Plakette „FÜR AUGE DES JÄGERS“ über dem Bogenfenster (am Gipfel „FÜR DUELL 2 · AUGE DES JÄGERS“), drei gelbe C-Tasten unter Dennis. Was hilft, leuchtet. Tippen legt es auf die nächste freie C-Taste (das Ding hüpft hinein, das Feld bekommt einen Haken), nochmal Tippen auf Feld oder Taste legt es zurück. Besiegeltes steht fest (gold). Hilft nichts, gibt es weder Plakette noch C-Tasten. Die Textbox sagt, was es hier heißt: „Hilft hier. Tippen nimmt es mit.“, „Kommt mit. Nochmal tippen legt es zurück.“, „Dabei bei …“, beim Fluch „Hier: …“ und „Jeder Fluch hat seinen Preis.“ (gewählt: „Kommt mit.“), beim Schild „Meldet sich, wenn du ein Duell verlierst.“, beim Segen „Meldet sich am Tor zum Gipfel.“. Rechts ist immer Platz für MITNEHMEN · n.
- **Ein Siegel:** AUSRÜSTEN FÜR, DABEI mit allen Dingen, beim Fluch der Vorteil und „Doch jeder Fluch hat seinen Preis.“. Geschrieben wird je Ding ein Einsatz wie bisher (`e_…`, am Gipfel mit `duell`), in einem Rutsch (`store.js` `setzenAlle`). Moment AUSGERÜSTET mit einer Zeile je Ding („Hol es dir beim Bund.“), mit Fluch erst die Szene mit dem Schattendieb, nur ein Fluch heißt weiter FLUCH GESPROCHEN. Danach dreht das Menü zu QUESTS.
- **Schild:** Tippt Dennis bei einer Quest mit Duell VERLOREN oder im Showdown NIEDERLAGE und hat den Schild, bietet das Siegel-Fenster „Schild einsetzen“ (vorgewählt, violett, NOCHMAL SPIELEN) und „Verloren eintragen“ an, dort wo sonst „Siegel gedrückt halten“ steht. Moment SCHILD DES BUNDES: „Spiel noch einmal und trag dann das neue Ergebnis ein.“
- **Admin:** „… mitgenommen zu … (gib es ihm)“, beim Schild „… eingesetzt …: Duell wiederholen“. Notlösung Einsetzen bucht am Gipfel für das aktuelle Duell.
- **Logik (`engine.js`):** `einsetzbar()` am Gipfel nur für das aktuelle Duell, neu `aktuellesDuell()`, `dabei()`, `mitnehmbar()` (ohne Schild und Segen, am Tor nichts, ein Fluch je Spiel), `rettung()`. `jetztEinsetzbar()` heißt jetzt: was Dennis gerade mitnehmen kann. Der Schild trägt in `config.js` `rettung: true`.
- **Gleich große Fenster:** Ergebnis-Fenster, Siegel-Fenster, Stationstafel, Hinweise der Fee (drei Zeilen, 250 px breit) und Prolog (drei Zeilen) haben feste Höhen, gemessen am längsten Inhalt auf dem iPhone 13 in Safari. Die Textbox der Ausrüstung hat immer Name und zwei Zeilen. Wird etwas doch länger, scrollt es im Fenster. Die Tagebuch-Frage nimmt immer zwei Zeilen Platz.
- **Gleiche Schrift:** Alle Größen hängen an der kleinsten Bildschirmhöhe (`svh` statt `dvh`), damit Safari beim Ein- und Ausblenden seiner Leisten keine Schrift umspringen lässt, und iOS vergrößert Texte nicht mehr von selbst (`text-size-adjust`). Im Siegel-Fenster haben alle Zeilen dieselbe Schrift (vorher war die Zeile neben VORTEIL größer und dünner).
- **Texte** wie in 16.3, dazu vier kürzere Hinweise der Fee, damit jeder in drei Zeilen passt („Was jetzt dran ist und was auf dem Spiel steht. Hier trägst du dein Ergebnis ein.“, „Hier landet, was du dir erspielst. Schatten zeigen, was noch fehlt.“, „Hier stehst du. Tippe eine Station an, dann siehst du, was dort wartet.“, „Höhe und Weg bis zum Gipfel. Mit GPS zeigt dir die Karte, wo du wirklich bist.“).
- **Geprüft:** `node app/engine.test.js` (neu: Ausrüsten, Schild als Rettung, je Duell), neu `tests/ausruesten.mjs` (der ganze Ablauf, Schild, Gipfel, gleiche Größen), angepasst `selbst.mjs`, `glanz.mjs`, `durchlauf.mjs`, `rubine.mjs`, dazu alle übrigen Tests.

## 17. Freigabe von Hand, kein GPS (umgesetzt am 30.09.)

Frage vom 29.09.: Dennis macht die erste Aufgabe am Freitag im Zug, die anderen am Samstag, aber jede erst, wenn er an der nächsten Station angekommen ist. Reicht GPS dafür? Entscheidung des Nutzers: Nein, die App hakt ohnehin noch manchmal, GPS kommt komplett raus. Der Quest Master gibt jede Quest von Hand frei, Dennis wandert dann auf der Karte zur Station.

- **Tor je Quest:** Die erste offene Quest „kommt“, dran ist sie für Dennis erst, wenn der Quest Master sie im Admin freigibt (großer Knopf **Nächste Quest freigeben** unter „Jetzt“). Immer von Hand, auch im Zug fürs Tagebuch und zwischen zwei Quests an derselben Station. Gespeichert im Spiel als `frei`.
- **Dennis vorher:** Die Quest bleibt im Nebel. Das HUD sagt „Weiter zur WIESE“ (am Anfang „Die Reise beginnt bald“, an derselben Station „Gleich geht es weiter“), die Nebel-Karte einen Satz dazu. Auf der Karte steht er noch an der Station der zuletzt entschiedenen Quest, der Nebel liegt vor ihm. Es gibt nichts zum Eintragen und nichts leuchtet in der Ausrüstung.
- **Dennis bei der Freigabe:** Die Fee: „WEITER ZUR WIESE. Der Weg führt weiter zur WIESE (Wiese am Anstieg). Dort wartet die nächste Quest.“ Fenster zu, die Karte kommt, Dennis wandert zur Station, der Weg hinter ihm wird golden, am Ziel springt es zu QUESTS und die Quest tritt aus dem Nebel. Ohne Stationswechsel: „ES GEHT WEITER“, im Zug „DIE REISE BEGINNT“, dann gleich das Aufdecken. Ist sein Ergebnis-Fenster noch offen, kommt die Freigabe danach dran. War die App zu, läuft es nach PRESS START nach, in der Reihe der Momente als letztes.
- **Zurück:** Die Freigabe steht im Verlauf des Admins (nur die der offenen Quest). Löschen oder Rückgängig holt sie bei Dennis still in den Nebel zurück, er steht wieder an der alten Station.
- **Weg:** `config.karte.weg` und die `gps`-Stellen der Stationen bleiben für Höhe und Kilometer in der Kartusche. GPS-Knopf, Feenlicht, Standortabfrage und der Speicher `dq-gps` sind weg.
- **Warum nicht GPS:** Es wäre genau genug gewesen (Stationen 500 m bis 2 km auseinander, Handy-GPS 5 bis 30 m, im Wald bis 60 m), aber die Stellen der Stationen sind geschätzt, GPS läuft nur bei offener App und nur mit Erlaubnis, und ein Tor, das manchmal nicht aufgeht, wäre am Berg ärgerlicher als ein Knopf.
- **Geprüft:** `node app/engine.test.js`, `tests/freigabe.mjs` (neu), alle anderen Tests geben die Quests per Helfer frei.

## 18. Buu Huu im Tagebuch: Rikes Antwort wird zur Quest (umgesetzt am 30.09.)

Wunsch des Nutzers: Rike sagt in ihrer Sprachnachricht zu Frage 1, dass Dennis Geduldssachen überhaupt nicht kann, so etwas wie einen Faden durchs Nadelöhr einfädeln. Hat Dennis das gehört, soll ein kleiner Geist kommen: „Interessant, dann machen wir das doch direkt zur nächsten Quest.“ Zuerst sprach das die Fee, dann die Entscheidung: Die Fee ist von Rike geschickt und hilft, das Gemeine macht der Bund mit seinem Geist, der auch die Packs klaut. Der Geist ist **Buu Huu**, vom Bund direkt aus Mario Party angeheuert (dort stiehlt er Münzen und Sterne).

- **Wann:** Frage 1 ist besiegelt und Rikes Nachricht läuft bis zum Ende, gut eine halbe Sekunde später kommt Buu Huu. Tippt Dennis vorher WEITER oder ✕, kommt er sofort (Rike verstummt), danach geht es weiter, wohin Dennis wollte. Hört er Rike noch einmal, kommt er nicht wieder. Wer Frage 1 neu beantwortet (Tagebuch leeren, Alles zurücksetzen), sieht ihn wieder. Blockt das Handy die Wiedergabe („RIKE · TIPP AUF ▶“), wartet er, bis Dennis Rike wirklich gehört hat oder weiterblättert.
- **Wie:** Aufbau wie der Prolog, über dem Tagebuch, das dunkel und violett durchscheint. Buu Huu huscht von rechts herein und kichert, dann spricht er in der Textbox („BUU HUU · IM DIENST DES BUNDES“), Buchstabe für Buchstabe, Tippen blättert. Tipps, während er noch hereinhuscht, zählen nicht.
  1. „Buu huu! Ich bin’s, Buu Huu, direkt aus Mario Party.“ und „Die Jungs vom Bund haben mich angeheuert. Ich werde dein Albtraum sein!“ Er stellt sich vor, es ist sein erster Auftritt (später klaut er beim Fluch die Packs). Dann „Hehehe … interessant. Nicht mal einen Faden durchs Nadelöhr?“ Nur Buu Huu.
  2. „Dann macht der Bund daraus doch direkt eine Quest!“ Das Medaillon von Rikes Rache (Nadel mit Herzfaden) dreht sich herein, Strahlen in Karmin, Fanfare wie bei jeder neuen Quest.
  3. „Sie wartet im Nebel auf dich. Viel Spaß beim Einfädeln!“ Nebel zieht darüber, übrig bleibt das verdeckte Medaillon mit „?“, wie in der Quest-Liste.
  Letzter Tipp: Er flieht nach rechts. Am Laptop blättert Enter, Esc lässt ihn gleich fliehen.
- **Buu Huu ist auch der Dieb:** Der Schattendieb (Kehrseite des Fluchs) ist dieselbe Figur und heißt jetzt Buu Huu, in der Fluch-Szene, im Fenster danach und im Admin („Buu Huu stiehlt 2“). Eigene Zeichnung im Stil von Boo (runder Körper, Stummelärmchen, fiese Brauen, Zahngrinsen, rosa Zunge), keine Originalgrafik, nur privat wie die Zelda-Schriften.
- **„Direkt eine Quest“ statt „die nächste Quest“:** Als Nächstes kommt Die drei Zeichen an der Talstation. Rikes Rache bleibt an der Mittelstation, weil Dennis die Nadeln vorher im Wirbel und am Deku-Baum gewinnen kann. Darum wartet sie im Nebel. Den Namen sagt Buu Huu nicht (der Nebel verrät nichts).
- **Technik:** Sätze und Quest in `config.js` (`logbuch.fragen[0].geist`, beim vorletzten Satz das Medaillon, beim letzten der Nebel, davor spricht er allein), Name in `dieb.name`. `geistRuf` und `geistKommt()` in `app.js`, `#geistRuf` und das Sprite `i-dieb` in `index.html`. Gemerkt wird nichts auf dem Handy: Er hängt am frischen Besiegeln.
- **Idee für später:** Wird Rikes Rache an der Mittelstation freigegeben, könnte Buu Huu daran erinnern („Erinnerst du dich, was Rike im Zug über dich gesagt hat?“).
- **Geprüft:** `node app/engine.test.js`, neu `tests/geist.mjs` (alle Wege, Tastatur, es spricht Buu Huu und nicht die Fee), `tests/geraete.mjs` mit Bild und Layout-Prüfung auf allen Geräten, angepasst `selbst.mjs` (Name des Diebs), `durchlauf.mjs`, `neustart.mjs`.

## 19. Der Morgen: Items in Stufen, die Fee bringt sie am Samstag (umgesetzt am 01.10.)

Wunsch des Nutzers: Jedes Item soll Upgrades haben wie die Wasserspritze (Stufe 1 von 3). Der Götterkreisel passte nicht ins Muster und ist gestrichen, den Beyblade gibt es vor Ort. Die Basis-Items sollen nicht am Freitag da sein, sondern am Samstagmorgen in einer Zwischensequenz kommen, mit Action und Drama, wenn das Abenteuer beginnt.

- **Vier Felder, jedes mit Stufen:** Wasser (Spritze, kleine Pistole, große Pistole), Karten (Leere Hülle, Gepanzerte Karte: eine Karte darf in die Hülle), Klinge (Verrostete Klinge mit 2 Würfen, Stich mit 4), Nadel (Feine Nadel, Dicke Nadel). Die Stopfnadel ist gestrichen. Tabelle in `07-spiele-und-items.md`, Abschnitt Items.
- **Freitag:** kein Item, auch das Tagebuch bringt keins mehr. Beim ersten Besuch der Ausrüstung sagt die Fee: „Noch ist dein Beutel leer. Morgen früh bringe ich dir etwas!“ Die Felder zeigen Schatten mit Tarnnamen (Zoras Tropfen, Hohle Schale, Alter Griff, Splitter) und „Kommt bald“. Der alte Moment „ERSTES ITEM GEFUNDEN“ (Beutel wird Spritze) entfällt.
- **Die Zwischensequenz** (`#morgen` in `index.html`, `morgen` in `app.js`, Texte in `config.js` unter `morgen.szenen`): Nacht mit Sternen, „Die Nacht vor der großen Prüfung …“. Die Sonne geht hinter den Bergen auf (eigene Melodie), Rikes Fee fliegt mit dem Beutel herein: „Dennis! Wach auf, der Tag ist da!“, „Ich war heute Nacht bei dir zu Hause. Rike hat mir etwas für dich mitgegeben.“ Buu Huu huscht herein, alles wird violett: „Buu huu! Was hast du denn da, kleine Fee?“, dann zerrt er am Beutel: „Das gehört jetzt dem Bund! Hehehe …“. Lichtblitz der Fee: „Finger weg, Geist! Das ist für Dennis!“, er wirbelt davon: „Buu … das merk ich mir!“. Der Beutel kommt in die Mitte und pocht, die vier Items springen nacheinander heraus (Name, „STUFE 1 VON N“), die Fee: „Noch sind sie schwach. Gewinne, und sie werden stärker!“. Zum Schluss Triforce und „DAS ABENTEUER BEGINNT“. Gut 30 Sekunden, Tippen zeigt erst den ganzen Satz, dann den nächsten Schritt. ÜBERSPRINGEN springt zu den Items, dort beendet es. Nur transform und opacity, jede Figur ist eine Ebene so groß wie die Bühne. In der Ausrüstung tragen die vier danach NEU.
- **Wann:** Der Quest Master drückt im Admin **☀ Der Morgen beginnt** (erscheint, sobald als Nächstes der Wirbel kommt), gespeichert als `morgen` im Spiel. Vergisst er es, gilt der Morgen mit der Freigabe des Wirbels (oder sobald ab dem Wirbel etwas entschieden ist, `morgenZeit()` in `engine.js`), dann läuft die Szene vor dem Fenster der Fee. War die App zu, läuft sie nach dem Öffnen als eigener Schritt vor allem, was danach kam. Einmal pro Handy und Morgen (`dq-morgen-v1`). Mit `?direkt` nur zusammen mit `?morgen` (Tests und Laptop). Im Verlauf des Admins steht der Morgen, Löschen nimmt ihn zurück. Im Probelauf bleibt der Wirbel nach „Nach dem Zug“ zu.
- **Reihenfolge:** Der Wirbel ist das erste Spiel am Samstag, vor Die drei Zeichen. Jedes Upgrade gewinnt Dennis nach dem Morgen und vor dem Spiel, bei dem es hilft (Hülle im Wirbel für den Kartenwurf, Pistolen im Podrennen und Kartenwurf für das Auge, Stich im Auge für den Deku-Baum, dicke Nadel am Deku-Baum für Rikes Rache). `engine.test.js` prüft das.
- **Admin:** Unter „Einsetzbar“ steht „Es gilt: … (Stufe k von n)“, auch wenn Dennis nicht eigens ausrüstet.
- **Glanz nur noch auf dem gewählten Item:** Ab dem Morgen gehören Dennis vier Items. Lief der Glanz wie bisher über jedes besessene Feld, wurde das Blättern auf dem S24 messbar zäher (lange Aufgaben 230 bis 490 ms statt 110 bis 230 ms, `tests/blaettern.mjs`). Jetzt läuft er nur über das gewählte Feld, damit ist es so flüssig wie vorher.
- **Abspann:** Unter „Die Beute“ steht je Feld nur die stärkste Stufe.
- **Geprüft:** `node app/engine.test.js`, neu `tests/morgen.mjs` (Freitag ohne Items, Knopf, alle Phasen der Reihe nach mit Bildern, Freigabe ohne Knopf, Überspringen, nachgeholt, nicht doppelt, ohne `?morgen`, Löschen im Verlauf), `tests/geraete.mjs` prüft die Szene auf allen Geräten, angepasst `freigabe`, `ausruesten`, `glanz`, `selbst`, `durchlauf` (der ganze Tag jetzt mit dem Morgen), `rubine`, `karte`. Auf dem echten Handy noch nicht gesehen.

## 20. Buu Huus Rad: der Fluch-Moment, den alle zusammen anschauen (umgesetzt am 01.10.)

Wunsch des Nutzers: Der Moment, in dem Dennis einen Fluch spricht, war zu schnell und zu kurz. Er soll ausgekostet werden, eine lange Sequenz, bei der alle zusammen draufschauen: „Oh mein Gott, was passiert jetzt? Kriegt er welche oder nicht?“ Gut acht Sekunden bis zur Auflösung. Dazu mehr Flüche über den Tag (etwa drei, erst ab der dritten Aufgabe) und ein Feld ALLES, damit es einmal am Tag richtig weh tut (Regeln in `07-spiele-und-items.md`, Abschnitt Buu Huus Rad).

- **Vorher:** Tippt Dennis in der Ausrüstung den Fluch an, steht in der Textbox neben dem Vorteil ein kleines Rad: „Buu Huu dreht am Rad: 0 bis 3 Packs.“ Ab dem zweiten Fluch „… oder ALLES!“, das rote Feld ist zu sehen (immer ein Fünftel des Rads, 20 %, bis zum Testlauf am 01.10. 30 %). Dasselbe Rad steht im Siegel-Fenster unter PREIS, darunter „Ohne Packs zieht er blind aus deinen glänzenden und seltenen Karten.“ Prozente nennt die App nicht.
- **Die Szene** (nach dem Siegel):
  1. *Der Fluch greift* (knapp 2 s): violette Ringe um das Symbol, der Vorteil steht darunter.
  2. *Licht aus* (gut 2 s): „DOCH JEDER FLUCH HAT SEINEN PREIS …“, alles wird dunkel, nur Dennis' Pack-Leiste bleibt hell und leuchtet golden. Buu Huu taucht kichernd aus dem Dunkeln auf und kreist um die Packs.
  3. *Das Rad* (gut 4 s): „BUU HUU DREHT AM RAD …“ (beim ersten ALLES dazu „Diesmal will er mehr …“), Trommelwirbel, das Rad dreht fünf Runden, der Zeiger klickt an jedem Stift, es wird immer langsamer, ab der Hälfte setzt der Herzschlag ein. Manchmal bleibt es kurz vor der Kante fast stehen, ein Herzschlag, dann ruckt es doch noch ins nächste Feld. Es bleibt immer auf dem Feld stehen, das gewürfelt wurde, meist knapp hinter der Kante.
  4. *Auflösung:* Die übrigen Felder werden dunkel, das Ergebnis springt in die Mitte. Bei **0** golden „GLÜCK GEHABT!“, Buu Huu greift ins Leere und zieht ab. Bei **1 bis 3** „BUU HUU WILL 2 PACKS“, er holt die Karten einzeln aus der Leiste. Bei **ALLES** Donner, roter Blitz, Rad und HUD wackeln, „BUU HUU WILL ALLES!“, er räumt die ganze Leiste leer. Fehlen geschlossene Packs: „KEINE PACKS? MACHT NICHTS …“, er zieht Karten aus den geöffneten Packs. Dann flieht er mit der Beute, danach das Fenster FLUCH GESPROCHEN wie bisher.
- **Überspringen** erst nach der Auflösung, damit niemand den Moment aus Versehen wegtippt. Nimmt der Quest Master den Fluch zurück, während die Szene läuft, bricht sie still ab und die Fee sagt es. Bei „Weniger Bewegung“ im System gibt es die Szene nicht, nur das Fenster.
- **Klänge:** eigene, keine Originalmusik (`klang()` in `app.js`): Klicken, Herzschlag, Trommelwirbel, Donner.
- **Die drei Zeichen:** Im Ergebnis-Fenster steht unter dem Fund die Zeile mit Buu Huu: „Buu Huu spielt mit und schenkt dir einen Fluch. Hehehe …“, bei mehreren „Einen davon schenkt dir Buu Huu.“
- **Ausrüstung:** Ohne den Schild hat Dennis rechts nur noch zwei Runenkreise (Fluch, Rikes Segen). Die Rahmen sind jetzt nur so groß wie ihr Inhalt: rechts zwei nebeneinander, links die vier Felder mit Stufen (Abschnitt 19) im Quadrat.
- **Technik:** `radSvg()`, `radMini()`, `fluchSzene()` in `app.js`, `#fluchSzene` mit `#fsRad` in `index.html`. Nur transform und opacity bewegen sich, das Rad dreht per requestAnimationFrame (für das Klicken an den Stiften). `#fsRad` trägt nach dem Stehenbleiben `data-ziel` und `data-steht` für die Tests.
- **Geprüft:** `node app/engine.test.js`, neu `tests/rad.mjs` (Rad bleibt auf dem gewürfelten Feld stehen, ALLES, Karten, Überspringen erst nach der Auflösung), angepasst `tests/selbst.mjs` und die übrigen Tests (Reihenfolge, ohne Schild).

## 21. Der Brief: Dennis abholen, bevor das Spiel beginnt (umgesetzt am 01.10.)

Wunsch des Nutzers: Dennis weiß nichts vom Spiel. Er bekommt nur den Link mit „Mach das mal“. Bisher sah er als Erstes das Titelbild (oder, hochkant aus WhatsApp, einen schwarzen Bildschirm „Handy quer halten“), und nirgends stand, von wem das ist und was es soll. Jetzt liegt beim allerersten Öffnen ein versiegelter Brief von Fabio und Bene vor dem Titelbild. Entschieden: vor dem Titelbild, nicht nach PRESS START (erst die echte Welt, dann die Spielwelt; das Siegel ist der erste Tipp, danach darf das Handy Klang spielen; der Brief passt hochkant und ersetzt den toten Moment). Nur von Fabio und Bene, Rike kommt nicht vor, kurz und persönlich (die frechen Sätze „keine Spaßveranstaltung“ und „Ab jetzt beobachten wir dich“ hat der Nutzer wieder gestrichen).

- **Verschlossen:** Nacht, Kerzenschein, ein gefaltetes Pergament „An Dennis“, „Nur für deine Augen“, gleich darunter „🔊 Mach den Ton an“ (Wunsch des Nutzers: gleich am Anfang, damit Siegelbruch und Titelbild klingen), in der Falz ein rotes Wachssiegel mit Triforce. „Halte das Siegel gedrückt“, mit Absicht **15 Sekunden** lang (Wunsch des Nutzers: unverhältnismäßig lang). Beim Halten füllt sich langsam ein goldener Ring, das Siegel zittert, ein Brummen schwillt an, der Hinweis wechselt („Halten …“, „Weiter halten …“, „Nicht loslassen …“, „Noch nicht …“, „Fast …“, „Gleich …“). Lässt er zu früh los, springt der Ring zurück und da steht rot und wackelnd **„Ey, gedrückt halten, du Waldschrat!“**, ab dem zweiten Mal **„Jaaa, genau!! Bro, GEDRÜCKT HALTEN …“**. Hält er durch, bricht das Siegel in zwei Hälften, ein Lichtblitz, das Papier entfaltet sich. Dauer und Sätze in `config.js` (`brief.halten`, `haltenTexte`, `losgelassen`).
- **Der Brief** (Text in `config.js`, `brief`): „Dennis, auch wenn nicht viel Zeit war … sollst du doch ein letztes Abenteuer als freier Mann haben. Fabio und Bene, Der Bund.“ Tippen zeigt alles, noch ein Tipp das P.S.
- **P.S.:** „Zieh dir das Spiel auf deinen Startbildschirm. Dann läuft es im Vollbild und ist immer griffbereit.“ Knopf **AUF DEN STARTBILDSCHIRM**: Bietet das Handy das Installieren an (Chrome, oft auch Samsung Internet), kommt das Fenster des Handys. Sonst stehen die zwei Schritte von Hand da, passend zum Browser (Samsung Internet ≡, Chrome ⋮, iPhone Teilen). Nach dem Installieren: „Liegt auf deinem Startbildschirm. Ab jetzt öffnest du es dort.“ Die installierte App startet quer und im Vollbild, auch wenn das automatische Drehen aus ist.
- **Drehen:** Hochkant steht darunter „Jetzt dreh dein Handy.“ mit dem kleinen Handy, das sich dreht, und „Dreht sich nichts? Automatisch drehen einschalten.“ (iPhone: Ausrichtungssperre). Dreht er, geht der Brief aus und das Titelbild mit Klang auf, dann PRESS START, Prolog und Rundgang wie bisher. Android hat zusätzlich **LOS**: Vollbild und quer, auch bei gesperrtem Drehen. Hält er das Handy schon quer: „Bereit? Dann los.“ und LOS.
- **Einmal pro Handy:** gemerkt, sobald er das P.S. sieht (`dq-brief-v1`, im Probelauf eigener Schlüssel, also auf dem Handy des Quest Masters mit `?probe` einmal zu sehen). Nie mit `?direkt`, in der Demo nur mit `?brief`, `?brief` zeigt ihn immer. Alles zurücksetzen vergisst ihn, der nächste Start zeigt ihn wieder.
- **Technik:** `brief` in `app.js`, `#brief` in `index.html` (über allem, auch über „Handy quer halten“), Stil unter „Der Brief“ in `styles.css`, Klänge `bruch` und `grollen` in `klang()`. Solange der Brief offen ist, ruhen die Teilchen des Titelbilds. Nur transform und opacity bewegen sich.
- **Geprüft:** neu `tests/brief.mjs` (Galaxy S24 hochkant und quer bis 780 × 280, iPhone, kleiner Browser von WhatsApp: alles passt ins Bild, kurzer Tipp öffnet nicht, Schritte je Browser, Drehen und LOS öffnen das Titelbild, einmal pro Handy, nicht mit ?direkt und in der Demo), `tests/neustart.mjs` (Zurücksetzen vergisst den Brief). Die übrigen Tests starten ohne Brief.

## 22. Musik auf dem Startbildschirm (umgesetzt am 01.10.)

Wunsch des Nutzers: eine Intro-Musik auf dem Titelbild. Eigene Komposition, keine Originalmusik (wie das Thema im Abspann): ein ruhiges Waldthema im Dreiertakt, gut 85 Schläge pro Minute. Harfe in gezupften Achteln durch den Akkord, darüber eine Flöte mit leichtem Vibrato, darunter ein weicher Bass. Zwei Takte Vorspiel nur mit Harfe, dann 16 Takte (G, e, C, D, G, h, C, D, e, C, G, D, C, D, G, G), gut 34 Sekunden, dann von vorn, solange das Titelbild zu sehen ist.

- **Wann sie läuft:** Handys spielen Klang erst, wenn man einmal getippt hat. Beim ersten Öffnen ist das kein Problem: Das Siegel des Briefs ist dieser Tipp, und sobald der Brief geht und das Titelbild aufgeht, setzt die Musik ein. Die installierte App auf dem Startbildschirm darf meist ohnehin Klang spielen. Sonst leuchtet oben links ein goldener **Notenknopf**, ein Tipp darauf startet die Musik (ohne PRESS START auszulösen).
- **Immer an:** Ausschalten lässt sie sich nicht (Wunsch des Nutzers: Ton immer an, im Spiel und davor), der Knopf erscheint nur, solange das Handy noch keinen Klang erlaubt. PRESS START blendet sie in gut anderthalb Sekunden aus. Wird das Handy gesperrt, hält sie an und läuft beim Zurückkommen weiter. Auf dem iPhone setzt die App die Audio-Sitzung auf „playback“, damit der Stummschalter sie nicht verschluckt.
- **Technik:** `TITEL` und `titelThema()` in `app.js` (Web Audio, vier Takte im Voraus eingeplant), Steuerung `titelMusik` (`intro.dataset.musik`: an, aus, gesperrt), Knopf `#musikBtn` in `index.html`. Geprüft in `tests/brief.mjs` (läuft nach dem Brief, ohne Tipp gesperrt mit leuchtendem Knopf, der Knopf schaltet um, ohne das Spiel zu starten, PRESS START blendet aus).

## 23. Zwei Plätze statt drei C-Tasten (umgesetzt am 01.10.)

Befund: Seit den Items in Stufen kennt jedes Spiel höchstens ein Item (die stärkste Stufe seines Felds) und vielleicht den Fluch. Die dritte C-Taste blieb immer leer, und welche Taste wofür ist, war nicht klar. Wunsch des Nutzers: Der Weg bleibt (von der Quest einmal in die Ausrüstung, Waffe und vielleicht Fluch einsetzen, zurück), nur die C-Tasten sind nicht intuitiv und drei sind zu viele.

- **Unter Dennis zwei beschriftete Plätze:** links das Item, benannt nach seinem Feld (WAFFE beim Auge des Jägers, KARTE beim Kartenwurf, KLINGE am Deku-Baum, NADEL bei Rikes Rache), rechts FLUCH (rund). Ein Platz erscheint nur, wenn etwas hineinpasst: Bei Wirbel, Speed Flip oder Hüter der Flamme gibt es nur den Fluch-Platz, ohne Fluch geht es dort nicht in die Ausrüstung.
- **Leer** zeigt der Platz gestrichelt und blass den Umriss dessen, was hineingehört. **Tippen** auf das leuchtende Feld im Beutel oder auf den leeren Platz legt es hinein, es fliegt sichtbar hinein, der Platz pulsiert, das Feld trägt einen Haken. Nochmal Tippen nimmt es heraus. **Besiegelt** (MITNEHMEN, Siegel halten) steht der Platz fest im Goldglanz.
- Alles andere bleibt: Plakette „FÜR …“, MITNEHMEN in der Textbox, Moment AUSGERÜSTET, zurück zu QUESTS mit DABEI, am Gipfel je Duell.
- **Technik:** `renderPlaetze()` in `app.js` (statt `renderCTasten`), `#plaetze` mit `.platz.item` und `.platz.fluch` in `index.html`, keine neuen Daten. Geprüft in `tests/ausruesten.mjs` und `tests/selbst.mjs`.

## 24. Die finale Schlacht: Fee gegen Buu Huu vor der Prüfung des Bundes (umgesetzt am 01.10.)

Wunsch des Nutzers: Am Ende, vor der letzten Prüfung am Gipfel, eine Animation, in der die Fee gegen Buu Huu kämpft, danach beginnt die finale Schlacht. Gebaut als zweite Zwischensequenz nach dem Vorbild des Morgens (gleiche Bühne, gleiche Textbox, Tippen blättert, ÜBERSPRINGEN), gut 40 Sekunden.

- **Ablauf:** Nacht am Gipfelkreuz, Sturmwolken, Wetterleuchten („Das Kreuz am Gipfel. Der Wind wird kalt. Ein Schatten zieht auf …“). Die Fee fliegt herein („Dennis, du hast es geschafft! Ganz oben, am Kreuz des Blombergs.“, „Nur noch eine Prüfung, dann gehört die Legende dir.“). Donner, Buu Huu kommt, der Himmel wird violett („Buu huu! Weißt du noch, Fee? Heute Morgen? Ich hab’s mir gemerkt!“, „Hier oben endet eure Reise. Der Bund hat mich fürs Finale angeheuert!“). Die Fee: „Dann musst du erst an mir vorbei, Geist!“ Dann der **Kampf** ohne Worte: Aus beiden wächst ein Strahl, hell gegen violett, in der Mitte sprüht ein Funke, die Strahlen ringen hin und her, beide zittern, dazu ein anschwellendes Surren (gut 3 s). **Knall:** weißes Licht, die Bühne wackelt, beide fliegen zurück. Buu Huu: „Buu … du bist stärker als heute Morgen.“ Die Fee: „Ich halte ihn auf, so gut ich kann. Den Bund musst du selbst bezwingen.“ Buu Huu: „Drei Duelle, Dennis. Zwei musst du gewinnen. Hehehe … viel Glück!“ Hinter dem Kreuz geht ein goldenes Licht auf, die **drei Duelle** erscheinen nacheinander wie die Items am Morgen (Symbol, Name, „DUELL 1 · REVANCHE“, aufgefüllte ohne Revanche), die Fee: „Rike glaubt an dich. Zeig ihnen, wer du bist!“ Zum Schluss Triforce und **„DIE FINALE SCHLACHT BEGINNT“**, Buu Huu verschwindet, dann QUESTS mit der Prüfung des Bundes.
- **Wann:** von selbst, sobald die Prüfung des Bundes dran ist (freigegeben) und das Tor offen ist (alle vier Ziffern), wenn Dennis im Menü nichts anderes offen hat. Also mit allen Ziffern nach dem Fenster der Freigabe, dem Weg zum Gipfel auf der Karte und dem Aufdecken aus dem Nebel. Fehlen Ziffern, erst das Tor, die Szene kommt nach dem Fenster der letzten Ziffer. Nicht mehr, sobald ein Duell eingetragen ist. Einmal pro Handy und Freigabe (`dq-schlacht-v1`, gemerkt wird der Zeitstempel der Freigabe), Alles zurücksetzen vergisst es. War die App zu, kommt sie nach PRESS START. Mit `?direkt` und in der Demo nur zusammen mit `?schlacht`. Im Admin steht bei der Freigabe des Bundes ein Hinweis darauf.
- **Technik:** Texte in `config.js` (`schlacht`), `#schlacht` in `index.html` (nutzt die Klassen des Morgens, dazu Himmel mit Wolken, Wetterleuchten und Berg mit Gipfelkreuz, Strahlen und Funke), Stil unter „Die finale Schlacht“ in `styles.css` (nur transform und opacity bewegen sich). In `app.js` teilen sich Morgen und Schlacht jetzt `zwischensequenz()`, dazu `schlacht`, `schlachtZeit()`, `schlachtPruefen()` und der Klang `strahl` in `klang()`.
- **Geprüft:** neu `tests/schlacht.mjs` (Tor zu: keine Szene, letzte Ziffer: erst das Fenster, dann die Szene, alle Phasen der Reihe nach, Strahlen, drei Duelle, Titel, danach QUESTS, kein zweites Mal nach dem Neuladen, neues Handy, ÜBERSPRINGEN, kein Auftritt mehr nach einem Duell; Galaxy S24 780 × 280, mit `GROESSE=852x393` auch iPhone). `tests/morgen.mjs` für den Umbau.
