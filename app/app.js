(() => {
  /* Dennis Quest · Dennis' Menü (06-design-plan.md, 07-spiele-und-items.md)
     Drei Seiten im Ring: KARTE · QUESTS · AUSRÜSTUNG. HUD: Packs, nächste Quest, Code.
     Liest den Stand. Schreibt nur eins: Dennis' Antworten im Log-Buch (eigener Pfad).
     ?demo zeigt einen Beispielstand ohne Firebase (auch ?demo=start, ?demo=bund, ?demo=ende), ?direkt ohne Startbildschirm,
     ?onboarding zeigt Prolog und Hinweise der Fee auch später am Tag,
     ?probe liest den Probelauf des Quest Masters statt des echten Spiels (roter Rahmen). */
  const C = window.QuestStore.probe(window.GAME_CONFIG);
  const PROBE = window.QuestStore.PROBE;
  const E = window.QuestEngine;

  const STATIONEN = C.karte.stationen;
  const REIHE = C.quests.filter(q => q.typ !== "lauf");
  const LAUF = C.quests.filter(q => q.typ === "lauf");
  const START_PAGE = 1;
  const ZIEL = STATIONEN[STATIONEN.length - 1].id;   // letzte Station: dort steht das Kästchen

  /* ---------- Gerät: schwächere Handys bekommen weniger Effekte ---------- */
  const params = new URLSearchParams(location.search);
  const SCHWACH = params.has("schwach") || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;
  document.documentElement.classList.toggle("schwach", SCHWACH);
  // Ruckel-Messer (01.10.): ?messen schaltet ihn ein, ?messen=aus wieder aus. Das Handy merkt es sich, damit er auch
  // vom Home-Bildschirm aus läuft. Nur dann wird messen.js geladen.
  try {
    if (params.get("messen") === "aus") localStorage.removeItem("dq-messen");
    else if (params.has("messen")) localStorage.setItem("dq-messen", "1");
    if (localStorage.getItem("dq-messen")) { const m = document.createElement("script"); m.src = "messen.js"; document.body.appendChild(m); }
  } catch (_) {}

  /* ---------- Speicher: echt, Probelauf oder Demo ---------- */
  const DEMO = params.has("demo");
  document.documentElement.classList.toggle("probe", PROBE && !DEMO);
  document.documentElement.classList.toggle("demo", DEMO);
  // Onboarding (Prolog, Beutel, Hinweise der Fee) nur am Anfang des Spiels und einmal pro Handy. Ist schon eine Quest
  // entschieden, kennt Dennis das Menü: Ein neues Handy, ein anderer Browser oder der Home-Bildschirm statt Safari
  // (eigener Speicher) zeigen es dann nicht noch einmal. Die Demo merkt sich nichts, zeigt es also nur mit ?demo=start.
  // ?onboarding zeigt es immer. Der Probelauf merkt es sich getrennt.
  const OB_ERZWINGEN = params.has("onboarding");
  const spaeter = () => !OB_ERZWINGEN && !!state && state.zaehler.erledigt > 0;
  const obGemerkt = key => { try { return !DEMO && !OB_ERZWINGEN && localStorage.getItem(key) === "1"; } catch (e) { return false; } };
  const obMerken = key => { try { if (!DEMO) localStorage.setItem(key, "1"); } catch (e) {} };
  const OB_KEY = "dq-onboarding-v1" + (PROBE ? "-probe" : "");
  const BRIEF_KEY = "dq-brief-v1" + (PROBE ? "-probe" : "");   // der Brief vor dem Titelbild (01.10.), einmal pro Handy
  let briefOffen = false;
  let beutelGezeigt = obGemerkt(OB_KEY);
  const onboarded = () => beutelGezeigt || spaeter();
  const DEMO_DOCS = {
    start: { quests: {} },
    mitte: {
      quests: { logbuch: "bestanden", wirbel: "verloren", klingen: "bestanden", podrennen: "bestanden", amulett: "laeuft" },
      buchungen: [{ id: "b1", packs: -1, grund: "Strafe vom Quest Master" }]
    },
    // Kurz vor dem Ende: alles gespielt bis auf den Bund, am Tor fehlt Ziffer 3, danach zwei Revanchen, Amulett gefunden
    bund: {
      quests: { logbuch: "bestanden", klingen: "verloren", wirbel: "bestanden", podrennen: "bestanden", kartenwurf: "bestanden",
                auge: "verloren", deku: "bestanden", feuerprobe: "bestanden", rache: "bestanden", amulett: "laeuft" },
      schritte: { amulett: { gefunden: true } },
      einsaetze: [{ id: "e1", item: "spruchrolle", quest: "auge" }],
      buchungen: [{ id: "o1", packs: -1, grund: "Pack geöffnet", offen: true }]
    },
    ende: {
      quests: Object.fromEntries(C.quests.map(q => [q.id, q.zaehler ? "beendet" : ["wirbel", "kartenwurf"].includes(q.id) ? "verloren" : "bestanden"])),
      schritte: { amulett: { gefunden: true } },
      einsaetze: [{ id: "e1", item: "spruchrolle", quest: "auge" }]
    }
  };

  function demoStore() {
    const subs = [];
    // In der Demo gilt die nächste Quest immer als freigegeben (im echten Spiel gibt sie der Quest Master frei)
    const frei = d => { const k = REIHE.find(q => !["bestanden", "verloren"].includes((d.quests || {})[q.id])); return { ...d, frei: k ? { [k.id]: 1 } : {} }; };
    let doc = E.normalize(frei({ ...(DEMO_DOCS[params.get("demo")] || DEMO_DOCS.mitte), stand: Date.now() }));
    return {
      get doc() { return doc; },
      subscribe(fn) { subs.push(fn); fn(doc, { initial: true }); },
      onStatus(fn) { fn({ online: true, demo: true }); },
      save(next) { doc = E.normalize(frei({ ...next, stand: Date.now() })); subs.forEach(fn => fn(doc, {})); }
    };
  }
  const store = DEMO ? demoStore() : window.QuestStore.create(C);
  const lbStore = window.QuestStore.logbuch(DEMO ? { ...C, speicher: { typ: "lokal", spielId: "demo" } } : C);
  if (DEMO && params.get("demo") !== "logbuch") lbStore.zuruecksetzen();
  // Was Dennis selbst besiegelt (Ergebnis, Einsatz, Duell, Amulett, Ziffer): eigener Kanal, engine.js rechnet es ein
  const einStore = window.QuestStore.eintraege(DEMO ? { ...C, speicher: { typ: "lokal", spielId: "demo" } } : C);
  if (DEMO) einStore.zuruecksetzen();
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  /* ---------- Kleinkram ---------- */
  const $ = s => document.querySelector(s);
  const questById = id => C.quests.find(q => q.id === id);
  const itemById = id => C.items.find(i => i.id === id);
  // Was Dennis von einem Item sieht: Solange er es nicht erspielt hat, nur den Schatten (die Form ist zu erkennen)
  // und die Tarnung als Name. Beim Gewinnen „entpuppt" es sich. Startitems enthüllt der erste Besuch der Ausrüstung
  // (seit 01.10. gibt es keine mehr: Stufe 1 jedes Items bringt die Fee am Samstagmorgen, MORGEN).
  const START = C.startitems || [];
  const MORGEN = (C.morgen && C.morgen.items) || [];
  const verborgen = id => START.includes(id) ? !onboarded() : state.items[id] === "nicht";
  const getarnt = id => !!itemById(id).tarn && verborgen(id);
  const itemSicht = id => {
    const x = itemById(id);
    return getarnt(id) ? { ...x, ...x.tarn, symbol: x.tarnSymbol || x.symbol } : x;
  };
  // Welche Quest ein Item bringt (Sieg oder Treffer), für „Erbeutet bei" und „Zu erbeuten bei"
  const quelle = id => C.quests.find(q => [q.win, q.glanz].some(e => e && (e.items || []).includes(id)) || (q.zaehler && q.zaehler.proTreffer.items || []).includes(id));
  // Nicht erspielt, und die Quest, die es bringt, ist schon vorbei (verloren, oder ohne Treffer beendet)
  const entgangen = id => { const q = verborgen(id) && quelle(id); return !!q && !["offen", "laeuft"].includes(state.quests[q.id]); };
  // Stufen in einem Feld (29.09.): Das Feld zeigt die stärkste Stufe, die Dennis hat. Hat er keine,
  // den Schatten der ersten, die er noch bekommen kann (sonst der letzten).
  const feldItems = feld => C.items.filter(x => x.feld === feld);
  function feldZeigt(feld) {
    const xs = feldItems(feld), hat = xs.filter(x => !verborgen(x.id) && state.items[x.id] !== "nicht");
    return hat.length ? hat[hat.length - 1].id : (xs.find(x => !entgangen(x.id)) || xs[xs.length - 1]).id;
  }
  const slotId = id => { const x = itemById(id); return x && x.feld ? feldZeigt(x.feld) : id; };
  const useSvg = (id, cls = "") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"></use></svg>`;
  const cardSvg = (cls = "") => `<svg class="ic-card ${cls}" aria-hidden="true"><use href="#${cls.includes("empty") ? "i-card-empty" : "i-card"}"></use></svg>`;
  const packsWort = n => Math.abs(n) === 1 ? "Pack" : "Packs";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let state = null, lastDoc = null, syncInfo = { online: true }, antworten = {}, adminDoc = null, eintraege = {};
  let page = START_PAGE, flatTimer = null, drehung = [];
  const sel = { 0: null, 1: null, 2: null };  // Auswahl je Seite: Station, Quest, Item
  let followNext = true;                        // Quest-Seite folgt der nächsten Quest, bis Dennis selbst etwas antippt
  let followHier = true;                        // Karte zeigt die Station der nächsten Quest, bis Dennis eine andere antippt
  let revealPending = null;                     // Quest, die nach dem Ergebnis-Fenster aus dem Nebel tritt
  // Ausrüsten beim Spiel (29.09., 08-erlebnis-plan.md Abschnitt 16)
  let ruestFuer = null;                         // Quest, für die die Ausrüstung rüstet (AUSRÜSTEN auf ihrer Quest-Karte), sonst von selbst
  let cWahl = [], cWahlFuer = "", cNeu = null;  // was auf den C-Tasten liegt und noch nicht besiegelt ist, für welches Spiel, was gerade dazukam
  let zuQuests = false;                         // nach dem Mitnehmen zurück zu QUESTS, sobald der Moment zu ist
  let audio;

  function tone(kind = "move") {
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = kind === "error" ? "sawtooth" : kind === "confirm" ? "triangle" : "square";
      o.frequency.setValueAtTime(kind === "move" ? 330 : kind === "confirm" ? 620 : 130, audio.currentTime);
      if (kind === "confirm") o.frequency.exponentialRampToValueAtTime(920, audio.currentTime + .08);
      g.gain.setValueAtTime(.035, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + (kind === "move" ? .055 : .13));
      o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + .14);
    } catch (_) {}
  }

  // Eigene kurze Melodien im Stil der N64-Fanfaren (keine Originalmusik): [Hz, Sekunden]
  const MELODIE = {
    pruefung: [[392, .1], [523, .1], [659, .1], [784, .12], [1047, .55]],
    side:     [[659, .09], [784, .09], [1047, .34]],
    verloren: [[330, .2], [277, .2], [220, .5]],
    plus:     [[523, .09], [784, .24]],
    minus:    [[392, .12], [262, .32]],
    nebel:    [[1047, .05], [1319, .05], [1568, .05], [2093, .2]],
    zauber:   [[784, .07], [988, .07], [1175, .07], [1568, .07], [1175, .07], [1568, .3]],
    siegel:   [[262, .08], [392, .3]],
    fund:     [[659, .07], [880, .07], [1175, .07], [1760, .32]],
    // Platzhalter, solange Rikes Sprachnachricht fehlt: die ersten Töne eines Liebesthemas (eigene Tonfolge)
    stimme:   [[659, .3], [784, .3], [880, .45], [784, .3], [659, .6]],
    // Der Schattendieb des Bundes kichert (Tagebuch, 30.09.)
    kichern:  [[932, .06], [831, .06], [932, .06], [831, .06], [698, .08], [587, .26]],
    // Sonnenaufgang am Samstagmorgen (01.10.)
    morgen:   [[392, .16], [523, .16], [659, .16], [784, .22], [659, .12], [784, .12], [1047, .6]]
  };
  function melody(name) {
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
      const traurig = name === "verloren" || name === "minus";
      let t = audio.currentTime + .03;
      MELODIE[name].forEach(([f, d], i, alle) => {
        const letzte = i === alle.length - 1;
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = traurig ? "sawtooth" : name === "nebel" || name === "stimme" ? "sine" : "triangle";
        o.frequency.setValueAtTime(f, t);
        if (letzte && !traurig) {                     // leichtes Vibrato auf dem Schlusston
          const v = audio.createOscillator(), vg = audio.createGain();
          v.frequency.value = 6; vg.gain.value = f * .012; v.connect(vg).connect(o.frequency); v.start(t); v.stop(t + d + .3);
        }
        const vol = traurig || name === "nebel" ? .03 : .055;
        g.gain.setValueAtTime(.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + .012);
        g.gain.setValueAtTime(vol, t + d * .7);
        g.gain.exponentialRampToValueAtTime(.0001, t + d + (letzte ? .3 : .03));
        o.connect(g).connect(audio.destination); o.start(t); o.stop(t + d + .35);
        t += d;
      });
      return (t - audio.currentTime) * 1000;
    } catch (_) { return 0; }
  }

  // Thema für Geschichte und Abspann (eigene Komposition, keine Originalmusik): zwei Phrasen zu je acht Takten im Wechsel,
  // Melodie über Bass (Grundton und Quinte). Wird Phrase für Phrase eingeplant, bis musik() zurückgibt, dass sie aufhört.
  const THEMA = {
    schlag: .45,                                                    // Sekunden je Viertel
    a: { melodie: [[659, 1], [784, 1], [1047, 2], [988, 1], [784, 1], [587, 2], [523, 1], [659, 1], [880, 1.5], [784, .5], [698, 1], [880, 1], [1047, 2],
                   [784, 1], [659, 1], [523, 1], [659, 1], [587, 1], [784, 1], [988, 2], [880, 1], [698, 1], [587, 1], [698, 1], [659, 1.5], [587, .5], [523, 2]],
         bass: [131, 98, 110, 87, 131, 98, 87, 131] },
    b: { melodie: [[880, 2], [659, 1], [880, 1], [1047, 2], [880, 1], [698, 1], [784, 2], [659, 1], [1047, 1], [988, 3], [784, 1],
                   [880, 1], [988, 1], [1047, 1], [1319, 1], [1175, 2], [1047, 1], [880, 1], [988, 1], [1047, 1], [1175, 1], [988, 1], [1047, 4]],
         bass: [110, 87, 131, 98, 110, 87, 98, 131] }
  };
  function musik() {
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
      const haupt = audio.createGain(), s = THEMA.schlag;
      haupt.connect(audio.destination);
      const ton = (f, t, d, typ, vol) => {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = typ; o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .02);
        g.gain.setValueAtTime(vol, t + d * .75); g.gain.exponentialRampToValueAtTime(.0001, t + d + .06);
        o.connect(g).connect(haupt); o.start(t); o.stop(t + d + .1);
      };
      let t = audio.currentTime + .1, n = 0, timer = null, aus = false;
      const phrase = () => {
        if (aus) return;
        const p = THEMA[n++ % 2 ? "b" : "a"];
        let m = t;
        p.melodie.forEach(([f, b]) => { ton(f, m, b * s * .94, "triangle", .045); m += b * s; });
        p.bass.forEach((f, i) => { ton(f, t + i * 4 * s, 2 * s * .95, "sine", .08); ton(f * 1.5, t + (i * 4 + 2) * s, 2 * s * .95, "sine", .05); });
        t += 32 * s;
        timer = setTimeout(phrase, (t - audio.currentTime - 1.5) * 1000);   // die nächste kurz vor dem Ende einplanen
      };
      phrase();
      return () => {
        aus = true; clearTimeout(timer);
        try { const j = audio.currentTime; haupt.gain.setValueAtTime(1, j); haupt.gain.linearRampToValueAtTime(0, j + 1.2); setTimeout(() => haupt.disconnect(), 1500); } catch (_) {}
      };
    } catch (_) { return () => {}; }
  }

  /* ---------- Symbole für Quests ---------- */
  function medalHtml(q, st, isNext) {
    const cls = st === "bestanden" || st === "beendet" ? "won" : st === "verloren" ? "lost" : st === "laeuft" ? "running" : "";
    return `<span class="medal ${cls}${q.typ === "lauf" ? " lauf" : ""}${isNext ? " is-next" : ""}" style="--m:${q.farbe || "#c9c3a2"}">${useSvg(q.emblem || "z-triforce")}</span>`;
  }
  function gemHtml(st, isNext) {
    const cls = st === "bestanden" ? "won" : st === "verloren" ? "lost" : "";
    return `<span class="gem ${cls}${isNext ? " is-next" : ""}">${useSvg("i-gem")}</span>`;
  }
  const questIcon = (q, st, isNext) => q.typ === "side" ? gemHtml(st, isNext) : medalHtml(q, st, isNext);
  const STATUS_WORT = { bestanden: "bestanden", verloren: "verloren", offen: "noch offen", laeuft: "läuft", beendet: "beendet" };
  const statusWort = id => id === state.next ? "jetzt dran" : STATUS_WORT[state.quests[id]];
  const artWort = q => q.typ === "kern" ? "Prüfung" : q.typ === "side" ? "Sidequest" : "läuft den ganzen Tag";

  // Sichtbarkeit für Dennis: erledigte Quests und die nächste. Was danach kommt, liegt im Nebel.
  // Verdeckte Prüfungen erscheinen als Medaillon mit „?" (ihre Zahl ist bekannt), verdeckte Sidequests gar nicht.
  // Laufende Quests tauchen auf, sobald der Quest Master sie startet.
  // Spielbeginn blanko (30.09., Wunsch des Nutzers): Beim allerersten Start ist auch die erste Quest noch im Nebel.
  // Sie taucht erst nach dem Rundgang auf, mit etwas Abstand (Abschnitt Erste Quest unten).
  let blanko = false;
  const aufgedeckt = id => state.quests[id] !== "offen" || (id === state.next && !blanko);
  const NEBEL = "nebel";
  const coveredMedal = () => `<span class="medal covered"><b>?</b></span>`;
  const verdeckteKern = () => REIHE.filter(q => q.typ === "kern" && !aufgedeckt(q.id)).length;
  const pruefungen = n => `${n} ${n === 1 ? "Prüfung" : "Prüfungen"}`;
  const aktiv = id => id === state.next || state.quests[id] === "laeuft";

  /* Ausrüsten beim Spiel (29.09.): Vor dem Spiel legt Dennis in der Ausrüstung auf die C-Tasten, was er mitnimmt, und
     besiegelt alles auf einmal (MITNEHMEN). Die Plakette sagt, wofür: die Quest, von der er mit AUSRÜSTEN kam, solange sie
     aktiv ist, sonst die erste aktuelle, bei der er etwas mitnehmen kann oder schon hat, sonst die nächste.
     Im Showdown rüstet er sich für jedes Duell einzeln. Schild und Rikes Segen nimmt er nicht mit, sie melden sich selbst. */
  const kannMit = qid => qid ? E.mitnehmbar(C, state, qid).filter(id => !verborgen(id)) : [];
  const schonDabei = qid => qid ? E.dabei(C, state, qid) : [];
  function fuerQuest() {
    if (!state) return null;
    if (ruestFuer && aktiv(ruestFuer)) return ruestFuer;
    return E.aktuelleQuests(C, state).find(qid => kannMit(qid).length || schonDabei(qid).length) || state.next;
  }
  // Das Spiel, um das es bei einer Quest gerade geht: im Showdown das aktuelle Duell
  function spielVon(qid) {
    const q = questById(qid), d = q && q.showdown ? E.aktuellesDuell(C, state) : null;
    return { q, d, spiel: d ? questById(d.quest) : q, schluessel: qid + (d ? "#" + d.nr : "") };
  }
  // Die Wahl auf den C-Tasten gilt nur für ein Spiel und nur, solange alles darin noch mitnehmbar ist
  function pruefeWahl() {
    const fq = fuerQuest(), k = fq ? spielVon(fq).schluessel : "";
    if (k !== cWahlFuer) { cWahl = []; cWahlFuer = k; }
    const mit = kannMit(fq);
    cWahl = cWahl.filter(id => mit.includes(id));
  }

  // Was eine Quest gibt oder nimmt, als kleine Symbole
  function fxChips(effekt, gewonnen) {
    const out = [];
    if (!effekt) return `<span class="chip none">nichts</span>`;
    if (effekt.packs) out.push(`<span class="chip ${effekt.packs > 0 ? "plus" : "minus"}">${cardSvg()}${effekt.packs > 0 ? "+" : "−"}${Math.abs(effekt.packs)} ${packsWort(effekt.packs)}</span>`);
    if (gewonnen && effekt.ziffer) {
      const v = state.ziffern[effekt.ziffer - 1];
      out.push(`<span class="chip plus"><span class="mini-tumbler">${v == null ? "?" : v}</span>Ziffer ${effekt.ziffer}</span>`);
    }
    (effekt.items || []).forEach(id => {
      // Geheim (Fluch): Dennis soll nicht wissen, dass er ihn bekommt
      if (gewonnen && itemById(id).geheim) { out.push(`<span class="chip geheim"><span class="mini-tumbler">?</span>Geheimnis</span>`); return; }
      const x = itemSicht(id), cls = [gewonnen ? "" : "x-over", verborgen(id) ? "schatten" : ""].join(" ").trim();
      out.push(`<span class="chip${gewonnen ? "" : " minus"}"><span class="${cls}" style="color:${x.farbe}">${useSvg(x.symbol)}</span>${esc(x.kurz)}${gewonnen ? "" : " weg"}</span>`);
    });
    return out.length ? out.join("") : `<span class="chip none">nichts</span>`;
  }

  /* ---------- Aufbau (einmal) ---------- */
  function build() {
    // HUD: eine Karte pro Pack (20 über den Tag), ab 10 in zwei Reihen wie Herzen
    const row = $("#packRow"), max = C.waehrung.max;
    row.style.gridTemplateColumns = `repeat(${max > 10 ? Math.ceil(max / 2) : max}, auto)`;
    row.classList.toggle("two", max > 10);
    row.innerHTML = Array.from({ length: max }, () => cardSvg("empty")).join("");
    $("#tumblers").innerHTML = C.code.map((_, i) => `<span class="tumbler" data-i="${i}">?</span>`).join("");

    // Quests in zwei Kammern (28.09.): oben die Hauptquests mit Medaillon, am Ende der Nebel,
    // unten die Sidequests, zuerst was den ganzen Tag läuft
    const zeile = q => `<li><button type="button" class="q-row ${q.typ}" data-id="${q.id}"><span class="ic"></span><span class="q-name">${esc(q.name)}</span><span class="q-mark"></span></button></li>`;
    const kammer = (id, titel, zeilen) => `<li class="kammer kammer-${id}" data-kammer="${id}"><p class="kammer-kopf">${titel}</p><ol class="kammer-liste">${zeilen}</ol></li>`;
    $("#questList").innerHTML = kammer("haupt", "HAUPTQUESTS", REIHE.filter(q => q.typ === "kern").map(zeile).join("")
        + `<li><button type="button" class="q-row nebel" data-id="${NEBEL}"><span class="ic">${coveredMedal()}</span><span class="q-name"></span><span class="q-mark"></span></button></li>`)
      + kammer("neben", "SIDEQUESTS", LAUF.map(zeile).join("") + REIHE.filter(q => q.typ !== "kern").map(zeile).join(""));
    document.querySelectorAll(".q-row").forEach(b => b.addEventListener("click", () => { followNext = b.dataset.id === state.next; selectQuest(b.dataset.id); }));
    $("#questCard").addEventListener("click", e => {
      if (e.target.closest("[data-logbuch]")) return logbuch.oeffnen();
      const t = e.target.closest("[data-ergebnis], [data-schritt], [data-duell], [data-ausruesten], [data-tor]");
      if (!t) return;
      if (t.dataset.tor) schwurTor(+t.dataset.tor, t.dataset.weg);
      else if (t.dataset.ergebnis) schwurErgebnis(sel[1], t.dataset.ergebnis);
      else if (t.dataset.schritt) schwurSchritt(sel[1], t.dataset.schritt);
      else if (t.dataset.duell) schwurDuell(t.dataset.duell, t.dataset.v);
      else ausruesten(t.dataset.ausruesten);
    });
    $("#itemBox").addEventListener("click", e => { if (e.target.closest("[data-mitnehmen]")) schwurMitnehmen(); });
    document.querySelectorAll(".c-taste").forEach(b => b.addEventListener("click", () => { if (b.dataset.id) tippeFeld(b.dataset.id); else tone("move"); }));

    // Karte: Weg durch die Stationen, eine Marke pro Station. Tippen zeigt die Stationstafel, zweites Tippen die Quest.
    $("#mapRoute").setAttribute("d", pfad(ABSCHNITTE.length));
    $("#mapMarks").innerHTML = STATIONEN.map(s =>
      `<button type="button" class="mark" data-station="${s.id}" style="left:${s.x}%;top:${s.y}%" aria-label="${esc(s.ort)}"><span class="m-medal"></span><span class="gems"></span><span class="m-label">${esc(s.name)}</span></button>`).join("")
      + `<span class="map-lake-label">ISAR</span>`;
    document.querySelectorAll(".mark").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); tippeStation(b.dataset.station); }));
    $("#mapSheet").addEventListener("click", e => { if (!e.target.closest(".station-card, .map-legend")) schliesseStationstafel(); });
    $("#stationCard").addEventListener("click", e => {
      e.stopPropagation();
      const q = e.target.closest("[data-quest]"), zu = e.target.closest(".sc-close");
      if (zu) return schliesseStationstafel();
      if (e.target.closest("[data-code]")) { tone("confirm"); return explainCode(); }
      if (q) oeffneQuest(q.dataset.quest);
    });
    buildLegende();

    // Ausrüstung: links der Beutel mit den Items, rechts Runenkreise mit den Fähigkeiten.
    // Noch nicht Erspieltes ist ein Schatten: Man erkennt die Form, der Name bleibt getarnt.
    const slot = (it, i) => {
      const rune = it.gruppe === "faehigkeit";
      return `<button type="button" class="slot${rune ? " rune" : ""}" data-id="${it.id}"${it.feld ? ` data-feld="${it.feld}"` : ""} style="--i:${i};--c:${it.farbe}"><span class="well">`
        + `${rune ? useSvg("i-rune", "rune-ring") : ""}${useSvg(it.symbol, "ic")}<b class="count"></b></span>`
        + `<span class="funken" aria-hidden="true"></span><span class="neu-tag" aria-hidden="true">NEU</span><span class="haken" aria-hidden="true">${useSvg("i-check")}</span></button>`;
    };
    // Stufen (Wasserwaffen, Nadeln) teilen sich ein Feld (29.09.): nur die erste Stufe bekommt einen Platz
    const gear = C.items.filter(it => it.gruppe !== "faehigkeit" && (!it.feld || C.items.find(x => x.feld === it.feld) === it));
    // Die Rahmen sind nur so groß wie ihr Inhalt (01.10., Wunsch des Nutzers): vier Items im Quadrat, fünf oder sechs in drei Spalten,
    // Fähigkeiten nebeneinander, ab drei in zwei Spalten
    const skills = C.items.filter(it => it.gruppe === "faehigkeit");
    $("#slotsGear").innerHTML = gear.map(slot).join("");
    $("#slotsGear").style.setProperty("--spalten", gear.length <= 4 ? 2 : gear.length <= 6 ? 3 : 4);
    $("#slotsSkill").innerHTML = skills.map(slot).join("");
    $("#slotsSkill").style.gridTemplateColumns = `repeat(${Math.min(2, skills.length)}, var(--rslot))`;
    document.querySelectorAll(".slot").forEach(b => b.addEventListener("click", () => tippeFeld(b.dataset.id)));
  }

  /* ---------- Weg auf der Karte ---------- */
  // Je Abschnitt zwischen zwei Stationen eine kubische Kurve (Catmull-Rom), in Koordinaten der Karten-SVG (1000 × 420).
  // So lassen sich der gegangene Weg und das Laufen genau auf die Linie legen.
  const PUNKTE = STATIONEN.map(s => [s.x * 10, s.y * 4.2]);
  const ABSCHNITTE = PUNKTE.slice(0, -1).map((p1, i) => {
    const p0 = PUNKTE[i - 1] || p1, p2 = PUNKTE[i + 1], p3 = PUNKTE[i + 2] || p2;
    return [p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2];
  });
  const bez = (a, t) => { const u = 1 - t; return [0, 1].map(k => u * u * u * a[0][k] + 3 * u * u * t * a[1][k] + 3 * u * t * t * a[2][k] + t * t * t * a[3][k]); };
  // Erster Teil einer Kurve bis t (de Casteljau)
  function teil(a, t) {
    const L = (p, q) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
    const ab = L(a[0], a[1]), bc = L(a[1], a[2]), cd = L(a[2], a[3]), abc = L(ab, bc), bcd = L(bc, cd);
    return [a[0], ab, abc, L(abc, bcd)];
  }
  // Pfad von der ersten Station: Abschnitte 0 bis bis-1 ganz, Abschnitt bis zum Anteil t
  function pfad(bis, t = 0) {
    if (!bis && !t) return "";
    const c = a => ` C${a[1][0].toFixed(1)} ${a[1][1].toFixed(1)} ${a[2][0].toFixed(1)} ${a[2][1].toFixed(1)} ${a[3][0].toFixed(1)} ${a[3][1].toFixed(1)}`;
    let d = `M${PUNKTE[0][0]} ${PUNKTE[0][1]}`;
    for (let i = 0; i < bis; i++) d += c(ABSCHNITTE[i]);
    if (t > 0 && ABSCHNITTE[bis]) d += c(teil(ABSCHNITTE[bis], Math.min(1, t)));
    return d;
  }
  const alsProzent = ([x, y]) => [x / 10, y / 4.2];

  /* ---------- Darstellung ---------- */
  function render() {
    renderHud();
    renderQuests();
    renderMap();
    renderEquip();
  }

  let diebHalt = null;                          // Packs, die das HUD zeigt, solange der Schattendieb noch würfelt
  function renderHud() {
    const s = state, packs = diebHalt ?? s.packs, offen = s.geoeffnet || 0;
    // Vorn die geschlossenen Packs (Rubine), dahinter die geöffneten, der Rest liegt beim Bund
    document.querySelectorAll("#packRow .ic-card").forEach((c, i) => {
      const leer = i >= packs + offen;
      c.classList.toggle("empty", leer);
      c.classList.toggle("offen", i >= packs && !leer);
      c.querySelector("use").setAttribute("href", leer ? "#i-card-empty" : "#i-card");
    });
    $("#packsVal").textContent = packs;
    $("#hudPacks").setAttribute("aria-label", `${packs} ${packsWort(packs)} geschlossen${offen ? `, ${offen} geöffnet` : ""}, von ${s.max}`);
    document.querySelectorAll("#tumblers .tumbler").forEach((t, i) => {
      const v = s.ziffern[i];
      t.textContent = v == null ? "?" : v;
      t.classList.toggle("known", v != null);
    });
    $("#hudCode").setAttribute("aria-label", "Code des Kästchens: " + s.ziffern.map(v => v == null ? "unbekannt" : v).join(", "));
    const n = s.next ? questById(s.next) : null;
    $("#hudNext").classList.toggle("done", s.ende);
    $("#hudNextName").textContent = s.ende ? "Zum Kästchen" : !n || blanko ? wegText().kurz : n.id === revealPending ? "?" : n.name;
  }

  /* Die nächste Quest ist noch nicht freigegeben (30.09.): Der Quest Master gibt sie von Hand frei, wenn Dennis an ihrer
     Station ankommt. Bis dahin sagt das Menü nur, wohin es geht: kurz fürs HUD, als Satz für die Textbox im Nebel. */
  function wegText() {
    const k = state.kommt ? questById(state.kommt) : null;
    if (!k) return { kurz: "Zum Kästchen", lang: "" };
    const hier = STATIONEN[hierIndex()], ziel = STATIONEN.find(x => x.id === k.station);
    if (!state.zaehler.erledigt) return { kurz: "Die Reise beginnt bald", lang: "Der Quest Master gibt das Zeichen. Dann beginnt deine erste Quest." };
    if (ziel && ziel.id !== hier.id) return { kurz: `Weiter ${ziel.zu} ${ziel.name}`, lang: `Der Weg führt weiter ${ziel.zu} ${ziel.name}. Dort zeigt sich die nächste Quest.` };
    return { kurz: "Gleich geht es weiter", lang: "Die nächste Quest zeigt sich gleich." };
  }

  function renderQuests() {
    const verdeckt = REIHE.filter(q => !aufgedeckt(q.id));
    const ungueltig = sel[1] === NEBEL ? !verdeckt.length : !sel[1] || !aufgedeckt(sel[1]);
    // Ohne freigegebene Quest steht der Nebel vorn (am Ende des Tages die letzte Quest). Spielbeginn blanko: auch dann
    if (followNext || ungueltig) sel[1] = state.next && aufgedeckt(state.next) ? state.next : state.ende ? REIHE[REIHE.length - 1].id : NEBEL;
    document.querySelectorAll(".q-row:not(.nebel)").forEach(b => {
      const q = questById(b.dataset.id), st = state.quests[q.id], isNext = q.id === state.next;
      b.parentElement.hidden = !aufgedeckt(q.id);
      b.className = `q-row ${q.typ} st-${st}${isNext ? " is-next" : ""}${sel[1] === q.id ? " is-selected" : ""}${q.id === revealPending ? " fogged" : ""}`;
      b.querySelector(".ic").innerHTML = questIcon(q, st, isNext);
      const mark = b.querySelector(".q-mark");
      mark.className = "q-mark" + (st === "bestanden" || st === "beendet" ? " won" : st === "verloren" ? " lost" : "");
      mark.innerHTML = isNext ? `<span class="tag now">JETZT</span>`
        : st === "laeuft" ? (q.zaehler ? `<span class="tag run">${state.treffer[q.id]}/${q.zaehler.max}</span>` : "")
        : state.glanz[q.id] ? useSvg("i-star", "glanz") : st === "bestanden" || st === "beendet" ? useSvg("i-check") : st === "verloren" ? useSvg("i-x") : "";
      b.setAttribute("aria-label", `${q.name}, ${artWort(q)}, ${state.glanz[q.id] ? "Glanzsieg" : statusWort(q.id)}`);
    });
    const nebel = $(".q-row.nebel"), nk = verdeckteKern();
    nebel.parentElement.hidden = !verdeckt.length;
    nebel.querySelector(".q-name").textContent = nk ? `Noch ${pruefungen(nk)}` : "Im Nebel";
    nebel.classList.toggle("is-selected", sel[1] === NEBEL);
    nebel.setAttribute("aria-label", nebel.querySelector(".q-name").textContent);
    // Eine Kammer ohne sichtbare Quest bleibt zu (am Anfang des Tages meist die Sidequests)
    document.querySelectorAll(".kammer").forEach(k => { k.hidden = !k.querySelector(".kammer-liste > li:not([hidden])"); });
    renderQuestCard(sel[1]);
  }

  function renderQuestCard(id) {
    const card = $("#questCard");
    card.classList.toggle("fogged", id === revealPending);
    if (id === NEBEL) {
      card.innerHTML = `
        <div class="qc-head">${coveredMedal()}<div><p class="tb-title">Im Nebel</p></div></div>
        <p class="tb-text">${esc(state.ende || (state.next && !blanko) ? "Zeigt sich, wenn es dran ist." : wegText().lang)}</p>`;
      return;
    }
    const q = questById(id), st = state.quests[id], isNext = id === state.next;
    let unten;
    card.classList.remove("showdown");
    if (q.zaehler) {
      const n = state.treffer[id] || 0, max = q.zaehler.max;
      unten = `<div class="fx-rows"><div class="fx-row"><span class="fx-lbl win">${esc(q.zaehler.name.toUpperCase())}</span><span class="fx treffer">${
        Array.from({ length: max }, (_, i) => `<span class="pip${i < n ? " on" : ""}">${useSvg("i-star")}</span>`).join("")}</span></div>
        <div class="fx-row"><span class="fx-lbl win">JE ${esc(q.zaehler.name.toUpperCase())}</span><span class="fx">${fxChips(q.zaehler.proTreffer, true)}</span></div></div>`;
    } else {
      const ein = eintragbar(id), kann = v => (ein.ergebnis || []).includes(v);
      const knopf = (cls, attr, text) => `<button type="button" class="qc-eintrag ${cls}" ${attr}>${esc(text)}</button>`;
      const schritte = (q.schritte || []).map(sx => `<span class="chip${state.schritte[id][sx.id] ? " plus" : " none"}">${state.schritte[id][sx.id] ? useSvg("i-check") : "○"} ${esc(sx.name)}</span>`).join("");
      unten = `<div class="fx-rows">
        ${schritte ? `<div class="fx-row"><span class="fx-lbl">STAND</span><span class="fx">${schritte}</span>${ein.schritt ? knopf("", `data-schritt="${ein.schritt.id}"`, ein.schritt.name.toUpperCase()) : ""}</div>` : ""}
        <div class="fx-row${st === "verloren" ? " dim" : ""}"><span class="fx-lbl win">SIEG</span><span class="fx">${fxChips(q.win, true)}</span>${kann("bestanden") ? knopf("win", `data-ergebnis="bestanden"`, (q.ergebnisWort || "Bestanden").toUpperCase()) : ""}</div>
        ${q.glanz ? `<div class="fx-row glanz${st === "verloren" || (st === "bestanden" && !state.glanz[id]) ? " dim" : ""}"><span class="fx-lbl win"><b>${useSvg("i-star")}GLANZSIEG</b><small>${esc(q.glanz.bedingung)}</small></span><span class="fx">${fxChips(q.glanz, true)}</span>${kann("glanz") ? knopf("win glanz", `data-ergebnis="glanz"`, "GLANZSIEG") : ""}</div>` : ""}
        <div class="fx-row${st === "bestanden" ? " dim" : ""}"><span class="fx-lbl lose">NIEDERLAGE</span><span class="fx">${fxChips(q.lose, false)}</span>${kann("verloren") ? knopf("lose", `data-ergebnis="verloren"`, "VERLOREN") : ""}</div>
      </div>`;
      if (ein.duelle) unten = duellTafel(ein.duelle) + unten;
      if (ein.tor) unten = torTafel(ein.tor) + unten;
      card.classList.toggle("showdown", !!ein.duelle);
    }
    const ruest = ausruestenHtml(id);
    // Eine Farbe pro Schritt: Solange AUSRÜSTEN dran ist, sind die Knöpfe zum Eintragen nur umrandet
    card.classList.toggle("vor-dem-spiel", ruest.vor);
    card.innerHTML = `
      <div class="qc-head">${questIcon(q, st, false)}<div><p class="tb-title">${esc(q.name)}</p></div></div>
      <p class="tb-text">${esc(q.text)}</p>
      ${q.logbuch && isNext ? logbuchKnopf() : ""}
      ${ruest.html}
      ${unten}`;
    // Kleine Handys: Ist ein Knopf zum Eintragen unter dem Rand, rollt die Karte hin (bis zum letzten, sonst fehlt VERLOREN)
    karteRollen();
  }
  // Erst im nächsten Bild rollen und messen, einmal für alle Änderungen (01.10.): Sofort zwang jedes Neuzeichnen den Browser,
  // das ganze Layout mitten im Skript auszurechnen, beim Ergebnis-Fenster mehrmals hintereinander.
  let rollenAngefragt = false, rollenNachher = false;
  function karteRollen() {
    if (rollenAngefragt) return;
    rollenAngefragt = true;
    requestAnimationFrame(() => {
      rollenAngefragt = false;
      if (page !== 1) { rollenNachher = true; return; }   // verdeckt lässt sich nichts messen: beim Hinblättern
      rollenNachher = false;
      const card = $("#questCard"), knopf = card.querySelector(".duell.jetzt") || [...card.querySelectorAll(".qc-eintrag")].pop();
      card.scrollTop = 0;                          // auch das Setzen zwingt zum Layout, darum erst hier
      if (!knopf) return;
      const k = knopf.getBoundingClientRect(), c = card.getBoundingClientRect();
      if (k.bottom > c.bottom - 8) card.scrollTop += k.bottom - c.bottom + 12;
    });
  }

  /* Was Dennis bei einer Quest selbst eintragen kann (er besiegelt, der Quest Master kann zurücknehmen):
     die nächste Quest (das Log-Buch erst, wenn alle Antworten besiegelt sind), am Gipfel erst die Duelle,
     bei laufenden Quests mit Schritten den nächsten Schritt und dann das Ergebnis. */
  const logbuchFertig = () => C.logbuch.fragen.every((_, i) => antworten[String(i + 1)]);
  function showdownStand() {
    const liste = E.showdownDuelle(C, state), noetig = Math.floor(liste.length / 2) + 1;
    const siege = liste.filter(d => d.ergebnis === "sieg").length, nied = liste.filter(d => d.ergebnis === "niederlage").length;
    return { liste, siege, nied, entschieden: siege >= noetig ? "bestanden" : nied >= noetig ? "verloren" : null };
  }
  function eintragbar(id) {
    const q = questById(id), st = state.quests[id];
    if (q.typ === "lauf") {
      if (st !== "laeuft" || !q.schritte) return {};
      const offen = q.schritte.find(sx => !state.schritte[id][sx.id]);
      return offen ? { schritt: offen } : { ergebnis: ["bestanden"] };
    }
    if (id !== state.next || (q.logbuch && !logbuchFertig())) return {};
    if (state.tor && state.tor.quest === id) return { tor: state.tor };   // erst alle vier Ziffern, dann das Finale
    if (q.showdown) { const sd = showdownStand(); return { duelle: sd, ergebnis: sd.entschieden ? [sd.entschieden] : [] }; }
    return { ergebnis: q.glanz ? ["bestanden", "glanz", "verloren"] : ["bestanden", "verloren"] };
  }

  // Duell-Tafel am Gipfel (08-erlebnis-plan.md, 3.9): drei Duelle, Revanchen zuerst. Das nächste offene trägt Dennis ein.
  function duellTafel(sd) {
    const erstes = sd.entschieden ? null : sd.liste.find(d => !d.ergebnis);
    return `<div class="duelle"><p class="fx-head">DIE ${sd.liste.length} DUELLE · ${sd.siege} : ${sd.nied}</p><ol>${sd.liste.map(d => {
      const dq = questById(d.quest);
      const st = d.ergebnis === "sieg" ? `<span class="d-st won">${useSvg("i-check")}</span>` : d.ergebnis === "niederlage" ? `<span class="d-st lost">${useSvg("i-x")}</span>` : "";
      const knoepfe = d === erstes ? `<button type="button" class="qc-eintrag win" data-duell="${d.nr}" data-v="sieg">SIEG</button><button type="button" class="qc-eintrag lose" data-duell="${d.nr}" data-v="niederlage">NIEDERLAGE</button>` : "";
      return `<li class="duell${d.ergebnis ? " " + d.ergebnis : d === erstes ? " jetzt" : " spaeter"}"><span class="d-nr">${d.nr}</span><span class="d-name">${esc(dq.name)} <small>${d.art === "revanche" ? "REVANCHE" : "DAZU"}</small></span>${st}${knoepfe}</li>`;
    }).join("")}</ol></div>`;
  }

  // Das Tor zum Gipfel (28.09.): Ohne alle vier Ziffern kein Finale. Jede fehlende holt Dennis für Packs,
  // mit Rikes Segen oder per Bußprüfung, die der Quest Master bestimmt. Er besiegelt selbst, der Quest Master kann zurücknehmen.
  const torSegen = () => C.items.find(it => it.tor);
  function torTafel(tor) {
    const preis = C.ziffer_preis, segen = torSegen(), hatSegen = segen && state.items[segen.id] === "besitz";
    const knopf = (nr, weg, text, cls) => `<button type="button" class="qc-eintrag ${cls}" data-tor="${nr}" data-weg="${weg}">${text}</button>`;
    return `<div class="tor"><p class="fx-head">DAS TOR · ${C.code.length - tor.fehlend.length} VON ${C.code.length} ZIFFERN</p><ol>${tor.fehlend.map(nr =>
      `<li class="tor-z"><span class="mini-tumbler">?</span><span class="d-name">Ziffer ${nr}</span>`
      + (E.zahlkraft(state) >= preis ? knopf(nr, "packs", `${preis} PACKS`, "win") : "")
      + (hatSegen ? knopf(nr, "segen", "SEGEN", "segen") : "")
      + knopf(nr, "busse", "BUSSE", "lose") + `</li>`).join("")}</ol></div>`;
  }

  // Ausrüsten beim Spiel (29.09.): Bei der Quest, die dran ist oder läuft, steht AUSRÜSTEN mit den Symbolen dessen, was hilft.
  // Ist schon etwas dabei, steht DABEI mit den Namen (antippen führt wieder zur Ausrüstung). Bei erledigten Quests steht,
  // was dabei war. vor: Der nächste Schritt ist das Ausrüsten.
  const dabeiChips = ids => ids.filter((id, i) => ids.indexOf(id) === i).map(i => { const x = itemById(i);
    return `<span class="chip"><svg aria-hidden="true" style="color:${x.farbe}"><use href="#${x.symbol}"></use></svg>${esc(x.kurz || x.name)}</span>`; }).join("");
  function ausruestenHtml(id) {
    if (!aktiv(id)) {
      const schon = state.eingesetzt[id] || [];
      return { vor: false, html: schon.length ? `<p class="dabei-zeile"><span class="fx-lbl">DABEI</span><span class="fx">${dabeiChips(schon)}</span></p>` : "" };
    }
    const mit = kannMit(id), schon = schonDabei(id);
    const minis = ids => ids.map(i => { const x = itemById(i); return `<span class="well mini usable" data-item="${i}" style="--c:${x.farbe}">${useSvg(x.symbol)}</span>`; }).join("");
    if (schon.length) return { vor: false, html: `<button type="button" class="dabei-zeile" data-ausruesten="${id}" aria-label="Dabei: ${esc(schon.map(i => itemById(i).name).join(", "))}. Zur Ausrüstung">`
      + `<span class="fx-lbl">DABEI</span><span class="fx">${dabeiChips(schon)}</span>${mit.length ? `<span class="noch">+${minis(mit)}</span>` : ""}</button>` };
    if (!mit.length) return { vor: false, html: "" };
    return { vor: true, html: `<div class="ruesten"><button type="button" class="qc-action" data-ausruesten="${id}">${useSvg("i-beutel")}AUSRÜSTEN</button>`
      + `<span class="ruest-minis" aria-hidden="true">${minis(mit)}</span></div>` };
  }

  function logbuchKnopf() {
    const n = C.logbuch.fragen.length, fertig = Object.keys(antworten).filter(k => +k >= 1 && +k <= n).length;
    const text = fertig >= n ? `ALLE ${n} BESIEGELT` : fertig ? `WEITER SCHREIBEN · ${fertig}/${n}` : "TAGEBUCH ÖFFNEN";
    return `<button type="button" class="qc-action" data-logbuch>${useSvg("i-scroll")}${text}</button>`;
  }

  function selectQuest(id, play = true) {
    sel[1] = id;
    document.querySelectorAll(".q-row").forEach(b => b.classList.toggle("is-selected", b.dataset.id === id));
    renderQuestCard(id);
    const row = document.querySelector(`.q-row[data-id="${id}"]`);
    if (row && page === 1) scrollIntoList(row);
    if (play) tone("move");
  }

  function scrollIntoList(row) {
    const list = $("#questList");
    const r = row.getBoundingClientRect(), l = list.getBoundingClientRect();
    if (r.top < l.top + 4 || r.bottom > l.bottom - 4) list.scrollTop += (r.top - l.top) - (l.height - r.height) / 2;
  }

  /* ---------- KARTE: Weg, Dennis läuft, Stationstafel, Höhe und Strecke ---------- */
  // Wo Dennis steht: Station der nächsten Quest, am Ende die Hütte. Ist die nächste Quest noch nicht freigegeben, steht er
  // noch an der Station der zuletzt entschiedenen Quest (am Anfang im Zug) und wandert erst mit der Freigabe weiter.
  // Die Karte zeigt die zuletzt erreichte Station, bis sie den Weg dorthin einmal gezeigt hat: Dennis läuft, sobald er die Karte ansieht.
  const STILL = matchMedia("(prefers-reduced-motion: reduce)");
  const hierIndex = () => hierIndexFuer(state);
  let kartenHier = null, laufFrame = null;

  function renderMap() {
    const s = state, hi = hierIndex();
    if (kartenHier === null || hi < kartenHier) kartenHier = hi;          // Start und Rückgängig: ohne Laufen
    const hier = STATIONEN[kartenHier].id;
    if (followHier || !sel[0]) sel[0] = STATIONEN[hi].id;
    document.querySelectorAll(".mark").forEach(m => {
      const id = m.dataset.station;
      const kerne = REIHE.filter(q => q.station === id && q.typ === "kern");
      const sides = REIHE.filter(q => q.station === id && q.typ === "side");
      m.querySelector(".m-medal").innerHTML = id === ZIEL && !kerne.length
        ? `<span class="m-chest${s.ende ? " open" : ""}">${useSvg("i-chest")}</span>`
        : kerne.map(k => aufgedeckt(k.id) ? medalHtml(k, s.quests[k.id], k.id === s.next) : coveredMedal()).join("");
      m.querySelector(".gems").innerHTML = sides.filter(q => aufgedeckt(q.id)).map(q => gemHtml(s.quests[q.id], q.id === s.next)).join("");
      m.classList.toggle("is-selected", id === sel[0]);
      m.querySelector(".you")?.remove();
      if (id === hier) m.insertAdjacentHTML("afterbegin", `<span class="you" title="Du bist hier"></span>`);
    });
    // Gegangener Weg golden, Nebel über dem Weg ab der Mitte zur nächsten Station
    if (!laufFrame) setzeWeg(pfad(kartenHier));
    const weiter = STATIONEN[kartenHier + 1];
    $("#mapFog").hidden = !(!s.ende && weiter);
    if (!s.ende && weiter) $("#mapFog").style.left = ((STATIONEN[kartenHier].x + weiter.x) / 2) + "%";
    renderLegende();
    if (!$("#stationCard").hidden) renderStationstafel();
    if (page === 0) spieleLauf();
  }

  // Dennis läuft von der zuletzt gezeigten Station zur neuen, der Weg hinter ihm wird golden
  // Der gegangene Weg: goldene Linie mit breiterem Rand darunter (eigene Ebene, siehe styles.css)
  const setzeWeg = d => { $("#mapDone").setAttribute("d", d); $("#mapDoneRand").setAttribute("d", d); };
  function spieleLauf() {
    const hi = hierIndex(), von = kartenHier;
    if (laufFrame || von === null || hi <= von) return;
    if (page !== 0 || !$("#introScreen").hidden || !$("#overlay").hidden || !$("#prolog").hidden) return;
    if (STILL.matches || hi - von > 3) { kartenHier = hi; renderMap(); if (revealPending) showNextQuest(); return; }
    const walker = $("#mapWalker"), sheet = $("#mapSheet"), W = sheet.clientWidth, H = sheet.clientHeight;
    const abschnitte = hi - von, dauer = Math.min(2600, 1300 * abschnitte), t0 = performance.now();
    const ease = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    sheet.classList.add("walking");
    walker.hidden = false;
    const schritt = jetzt => {
      const g = Math.min(1, (jetzt - t0) / dauer), x = ease(g) * abschnitte;
      const i = Math.min(von + Math.floor(x), hi - 1), f = Math.min(1, von + x - i);
      const [px, py] = alsProzent(bez(ABSCHNITTE[i], f));
      walker.style.transform = `translate(${(px * W / 100).toFixed(1)}px, ${(py * H / 100).toFixed(1)}px)`;
      setzeWeg(pfad(i, f));
      if (g < 1) { laufFrame = requestAnimationFrame(schritt); return; }
      laufFrame = null; kartenHier = hi;
      walker.hidden = true; sheet.classList.remove("walking");
      renderMap();
      melody("plus");
      // Nach einer Freigabe: angekommen, jetzt tritt die Quest aus dem Nebel
      if (revealPending) showNextQuest(); else kartenHinweis();
    };
    laufFrame = requestAnimationFrame(schritt);
  }

  function selectStation(id, play = true) {
    sel[0] = id;
    document.querySelectorAll(".mark").forEach(m => m.classList.toggle("is-selected", m.dataset.station === id));
    if (!$("#stationCard").hidden) renderStationstafel();
    if (play) tone("move");
  }

  // Erstes Tippen zeigt die Stationstafel, zweites Tippen auf dieselbe Station öffnet ihre Quest
  function tippeStation(id) {
    followHier = false;
    if (!$("#stationCard").hidden && sel[0] === id) return oeffneStation(id);
    selectStation(id, false);
    tone("move");
    $("#stationCard").hidden = false;
    renderStationstafel();
  }
  function schliesseStationstafel() {
    if ($("#stationCard").hidden) return;
    $("#stationCard").hidden = true;
    $("#mapLegend").classList.remove("verdeckt");
  }

  // Die Quest der Station auf QUESTS: die nächste, wenn sie hier ist, sonst die erste erledigte, sonst den Nebel.
  // Am Ziel steht das Kästchen: Code zeigen.
  function oeffneStation(id) {
    followHier = false;
    selectStation(id, false);
    const qs = REIHE.filter(q => q.station === id);
    if (!qs.length) { tone("confirm"); return explainCode(); }
    const q = qs.find(x => x.id === state.next && aufgedeckt(x.id)) || qs.find(x => aufgedeckt(x.id));
    oeffneQuest(q ? q.id : NEBEL);
  }
  function oeffneQuest(qid) {
    followNext = qid === state.next;
    sel[1] = qid;
    renderQuests();
    if (page !== 1) goTo(1); else tone("move");
  }

  const zahl = (n, stellen = 0) => n.toLocaleString("de-DE", { minimumFractionDigits: stellen, maximumFractionDigits: stellen });
  const meter = m => zahl(Math.round(m)) + " m";
  const km = m => zahl(m / 1000, 1) + " km";

  // Stationstafel: was hier war und was hier wartet. Im Nebel nur, was die Karte ohnehin zeigt.
  function renderStationstafel() {
    const id = sel[0], st = STATIONEN.find(x => x.id === id), idx = STATIONEN.indexOf(st), hi = hierIndex();
    const w = WEG && WEG.station[id];
    const lage = idx === hi ? `<span class="tag now">DU BIST HIER</span>` : idx < hi ? `<span class="tag won">GESCHAFFT</span>` : `<span class="tag open">NOCH VOR DIR</span>`;
    const ab = C.karte.ab || "Start";
    const zahlen = w ? `${meter(w.hoehe)} · ${w.s < 50 ? "am " + ab : km(w.s) + " ab " + ab}` : "";
    const qs = REIHE.filter(q => q.station === id), sicht = qs.filter(q => aufgedeckt(q.id));
    const imNebel = qs.filter(q => q.typ === "kern" && !aufgedeckt(q.id)).length;
    const status = qid => qid === state.next ? `<span class="tag now">JETZT</span>`
      : state.quests[qid] === "bestanden" ? `<span class="sc-st won">${useSvg("i-check")}</span>`
      : state.quests[qid] === "verloren" ? `<span class="sc-st lost">${useSvg("i-x")}</span>` : "";
    const zeilen = sicht.map(q => `<button type="button" class="sc-row" data-quest="${q.id}"><span class="ic">${questIcon(q, state.quests[q.id], false)}</span><span class="sc-name">${esc(q.name)}</span>${status(q.id)}</button>`);
    if (imNebel) zeilen.push(`<button type="button" class="sc-row nebel" data-quest="${NEBEL}"><span class="ic">${coveredMedal()}</span><span class="sc-name">${pruefungen(imNebel)} im Nebel</span></button>`);
    if (!qs.length) {
      const fehlt = state.ziffern.filter(v => v == null).length;
      zeilen.push(`<button type="button" class="sc-row sc-chest" data-code><span class="ic">${useSvg("i-chest")}</span><span class="sc-name">Das Kästchen<small>${fehlt ? `Verschlossen, noch ${fehlt === 1 ? "eine Ziffer" : fehlt + " Ziffern"}` : "Code komplett"}</small></span>`
        + `<span class="sc-code">${state.ziffern.map(v => `<span class="tumbler${v == null ? "" : " known"}">${v == null ? "?" : v}</span>`).join("")}</span></button>`);
    }
    // Die Tafel liegt auf der anderen Seite als die Station, damit sie die Station nicht verdeckt
    const rechts = st.x < 50;
    $("#stationCard").classList.toggle("rechts", rechts);
    $("#mapLegend").classList.toggle("verdeckt", !rechts);
    $("#stationCard").innerHTML = `<div class="sc-head"><div class="sc-titel"><p class="tb-title">${esc(st.name)} ${lage}</p><p class="tb-meta">${esc(st.ort)}${zahlen ? " · " + zahlen : ""}</p></div>`
      + `<button type="button" class="sc-close" aria-label="Tafel schließen">${useSvg("i-x")}</button></div>`
      + `<div class="sc-rows">${zeilen.join("")}</div>`;
  }

  /* Kartusche: Höhe, Strecke bis zum Gipfel und das Höhenprofil des echten Wegs (weg.js, config.karte.weg).
     GPS gab es bis 30.09. (Feenlicht am Weg), gestrichen: Die Station wechselt nur mit der Freigabe des Quest Masters. */
  const WEG = window.QuestWeg ? window.QuestWeg.aufbauen(C.karte) : null;
  let profilY = null;

  function buildLegende() {
    if (!WEG) { $("#mapLegend").hidden = true; return; }
    const hs = WEG.weg.map(p => p[2]), lo = Math.min(...hs) - 25, top = Math.max(WEG.ziel.hoehe, ...hs) + 12;
    const X = s => s / WEG.laenge * 200;
    profilY = h => 40 - (h - lo) / (top - lo) * 38;
    const pts = WEG.weg.map((p, i) => `${X(WEG.cum[i]).toFixed(1)} ${profilY(p[2]).toFixed(1)}`);
    $("#mlLine").setAttribute("d", "M" + pts.join(" L"));
    $("#mlArea").setAttribute("d", "M0 40 L" + pts.join(" L") + " L200 40Z");
    // Stationen als Rauten auf dem Profil, dazu der Punkt, wo Dennis gerade ist
    $("#mlProfil").insertAdjacentHTML("beforeend", STATIONEN.filter(st => WEG.station[st.id]).map(st =>
      `<i class="p-st" data-station="${st.id}" style="left:${X(WEG.station[st.id].s) / 2}%;top:${profilY(WEG.station[st.id].hoehe) / 40 * 100}%"></i>`).join("") + `<i class="p-du" id="mlDu"></i>`);
  }

  function renderLegende() {
    if (!WEG) return;
    let wert, wo, rest, s = null;
    const hi = kartenHier ?? hierIndex(), st = STATIONEN[hi], w = WEG.station[st.id];
    const bisGipfel = (s, h) => s >= WEG.ziel.s - 40 ? "Gipfel erreicht." : `Noch ${km(WEG.ziel.s - s)} · ${zahl(Math.max(0, WEG.ziel.hoehe - h))} Hm bis zum Gipfel`;
    if (w) { s = w.s; wert = meter(w.hoehe); wo = st.name; rest = bisGipfel(w.s, w.hoehe); }
    else { wert = km(WEG.ziel.s); wo = "am Samstag"; rest = `${zahl(WEG.ziel.hoehe - WEG.hoeheBei(0))} Hm vom ${C.karte.start} zum Gipfel`; }
    $("#mlWert").textContent = wert;
    $("#mlWo").textContent = wo;
    $("#mlRest").textContent = rest;
    document.querySelectorAll("#mlProfil .p-st").forEach(el => {
      const i = STATIONEN.findIndex(x => x.id === el.dataset.station);
      el.classList.toggle("done", i < hi);
      el.classList.toggle("hier", i === hi);
    });
    const du = $("#mlDu");
    du.hidden = s == null;
    if (s != null) { du.style.left = s / WEG.laenge * 100 + "%"; du.style.top = profilY(WEG.hoeheBei(s)) / 40 * 100 + "%"; }
  }

  // Ausrüstung: Zustände, überall gleich (08-erlebnis-plan.md, 3.8, 3.12 und 16): Schatten = noch nicht erspielt,
  // Farbe mit Goldrand = deins, leuchtet = hilft beim Spiel, für das gerade gerüstet wird, Haken = liegt auf einer C-Taste
  // oder ist schon dabei, grau = verbraucht oder verloren.
  function renderEquip() {
    pruefeWahl();
    const fq = fuerQuest(), mit = new Set(kannMit(fq)), schon = schonDabei(fq);
    if (!sel[2]) sel[2] = [...mit][0] || state.erhalten[state.erhalten.length - 1] || START[0] || C.items[0].id;
    sel[2] = slotId(sel[2]);
    document.querySelectorAll(".slot").forEach(b => {
      if (b.dataset.feld) { b.dataset.id = feldZeigt(b.dataset.feld); b.style.setProperty("--c", itemById(b.dataset.id).farbe); }
      const id = b.dataset.id, st = state.items[id], x = itemSicht(id), schatten = verborgen(id);
      const gewaehlt = !schatten && cWahl.includes(id), drin = gewaehlt || (!schatten && schon.includes(id));
      b.className = `slot${b.classList.contains("rune") ? " rune" : ""} st-${schatten ? "nicht" : st}${schatten ? " schatten" : ""}${entgangen(id) ? " entgangen" : ""}`
        + `${!schatten && mit.has(id) && !gewaehlt ? " usable" : ""}${drin ? " dabei" : ""}${neuMarke.has(id) ? " neu" : ""}${fundLaeuft.has(id) ? " fund" : ""}${sel[2] === id ? " is-selected" : ""}`;
      b.querySelector(".ic use").setAttribute("href", "#" + x.symbol);
      b.querySelector(".count").textContent = x.stapel && !schatten && st === "besitz" ? "×" + state.anzahl[id] : "";
      b.setAttribute("aria-label", `${x.name}, ${schatten ? "noch nicht erspielt" : { besitz: gewaehlt ? "auf einer C-Taste" : drin ? "dabei" : mit.has(id) ? "hilft jetzt, tippen nimmt es mit" : "im Beutel", verloren: "verloren", verbraucht: "verbraucht" }[st]}`);
    });
    renderCTasten(fq, schon);
    renderItemBox(sel[2]);
  }

  // Plakette und C-Tasten: wofür Dennis sich rüstet und was er mitnimmt. Besiegeltes steht fest, Gewähltes lässt sich zurücklegen.
  const C_NAME = ["links", "unten", "rechts"];
  function renderCTasten(fq, schon) {
    const auf = [...schon, ...cWahl].slice(0, 3);
    const zeigen = !!fq && (auf.length > 0 || kannMit(fq).length > 0);
    $("#ruestFuer").hidden = !zeigen;
    $("#cTasten").hidden = !zeigen;
    $("#charWindow").classList.toggle("ruesten", zeigen);
    if (!zeigen) return;
    const { d, spiel } = spielVon(fq);
    $("#ruestFuer").textContent = d ? `FÜR DUELL ${d.nr} · ${spiel.name.toUpperCase()}` : `FÜR ${spiel.name.toUpperCase()}`;
    document.querySelectorAll(".c-taste").forEach((b, i) => {
      const id = auf[i], x = id ? itemById(id) : null, fest = !!id && schon.includes(id);
      b.dataset.id = id || "";
      b.className = `c-taste ${["l", "d", "r"][i]}${id ? "" : " leer"}${fest ? " fest" : ""}${id && id === cNeu ? " neu" : ""}`;
      b.style.setProperty("--c", x ? x.farbe : "");
      b.querySelector("use").setAttribute("href", "#" + (x ? x.symbol : "i-card"));
      b.setAttribute("aria-label", !x ? `C-Taste ${C_NAME[i]}, frei` : `${x.name}, ${fest ? "dabei" : "nochmal tippen legt es zurück"}`);
    });
    cNeu = null;
  }

  // Textbox zum gewählten Feld: Name, was es bewirkt, und ein Satz dazu, was es jetzt heißt (hilft hier, dabei, meldet sich
  // selbst) oder woher es kommt. Eine Quest steht nur da, wenn sie schon aus dem Nebel getreten ist.
  // Rechts ist immer Platz für MITNEHMEN, damit der Text nicht umbricht, wenn der Knopf kommt oder geht.
  function renderItemBox(id) {
    const box = $("#itemBox");
    const x = itemSicht(id), st = state.items[id], schatten = verborgen(id), q = quelle(id);
    const fq = fuerQuest(), mit = kannMit(fq), schon = schonDabei(fq);
    const em = qid => `<em>${esc(questById(qid).name)}</em>`;
    // Beim Fluch, der hier hilft, steht statt des allgemeinen Satzes, was er hier bringt (so passt alles in zwei Zeilen)
    const v = !schatten && x.dieb && fq && (cWahl.includes(id) || mit.includes(id)) ? E.fluchVorteil(C, state, fq) : null;
    const satz = v ? `Hier: ${v.text}` : x.text;
    let tag = "", extra = "";
    if (schatten) {
      const wie = q && q.glanz && (q.glanz.items || []).includes(id) ? "mit einem Glanzsieg " : "";
      if (q) extra = entgangen(id) ? `Entgangen bei ${em(q.id)}.` : aufgedeckt(q.id) ? `Zu holen ${wie}bei ${em(q.id)}.` : "Wartet im Nebel.";
      else if (MORGEN.includes(id)) extra = "Kommt bald.";
    } else if (st === "verloren") {
      tag = `<span class="tag lost">VERLOREN</span>`;
      const nahm = C.quests.find(k => (k.lose && k.lose.items || []).includes(id) && state.quests[k.id] === "verloren");
      if (nahm) extra = `Verloren bei ${em(nahm.id)}.`;
    } else if (st === "verbraucht") {
      tag = `<span class="tag open">VERBRAUCHT</span>`;
      const bei = Object.keys(state.eingesetzt).filter(k => state.eingesetzt[k].includes(id)).pop();
      if (bei) extra = `Eingesetzt bei ${em(bei)}.`;
    } else if (x.dieb && st === "besitz") {
      // Fluch (01.10.): immer das kleine Rad, wie groß ALLES gerade ist
      const quote = E.allesChance(C, state);
      extra = `${cWahl.includes(id) ? "Kommt mit. " : schon.includes(id) ? "Dabei. " : ""}${radMini(quote)}${esc(radSatz(quote))}`;
    } else if (cWahl.includes(id)) extra = v ? "Kommt mit." : "Kommt mit. Nochmal tippen: zurück.";
    else if (schon.includes(id)) extra = `Dabei bei ${em(spielVon(fq).spiel.id)}.`;
    else if (mit.includes(id)) extra = v ? "Jeder Fluch hat seinen Preis." : "Hilft hier. Antippen zum Mitnehmen.";
    else if (x.rettung) extra = "Meldet sich, wenn du ein Duell verlierst.";
    else if (x.tor) extra = "Meldet sich am Tor zum Gipfel.";
    else if (E.abgeloest(C, state, id)) extra = `Abgelöst von ${esc(itemById(E.abgeloest(C, state, id)).name)}.`;
    else if (q && state.quests[q.id] !== "offen") extra = `Erbeutet bei ${em(q.id)}${state.glanz[q.id] && (q.glanz.items || []).includes(id) ? " (Glanzsieg)" : ""}.`;
    else if (START.includes(id)) extra = "Steckte in deinem Beutel.";
    else if (MORGEN.includes(id)) extra = "Von Rikes Fee.";
    // Stufen in einem Feld: welche Stufe gerade drin ist
    if (x.feld && !schatten) { const xs = feldItems(x.feld); extra = `Stufe ${xs.findIndex(y => y.id === id) + 1} von ${xs.length}.${extra ? " " + extra : ""}`; }
    if (!schatten && neuMarke.has(id)) tag = `<span class="tag won">NEU</span>` + tag;
    box.style.setProperty("--c", x.farbe);
    box.classList.toggle("schatten", schatten);
    box.innerHTML = `<span class="ib-stage">${useSvg(x.symbol, "ib-icon")}</span><p class="tb-title">${esc(x.name)}${tag}</p>`
      + `<p class="tb-text">${esc(satz)}${extra ? ` <span class="ib-use">${extra}</span>` : ""}</p>`
      + `<button type="button" class="qc-action ib-mitnehmen" data-mitnehmen${cWahl.length ? "" : " hidden"}>${useSvg("i-seal")}MITNEHMEN · ${cWahl.length}</button>`;
  }

  // Pfeiltasten: nur auswählen
  function selectItem(id, play = true) {
    sel[2] = id;
    if (play && neuMarke.delete(id)) { renderEquip(); tone("move"); return; }   // Antippen nimmt die Marke NEU
    document.querySelectorAll(".slot").forEach(b => b.classList.toggle("is-selected", b.dataset.id === id));
    renderItemBox(id);
    if (play) tone("move");
  }
  // Tippen: Was hier hilft, kommt auf die nächste freie C-Taste, liegt es schon dort, geht es zurück in den Beutel.
  // Alles andere zeigt nur, was es ist.
  function tippeFeld(id) {
    const fq = fuerQuest(), schon = schonDabei(fq);
    sel[2] = id;
    neuMarke.delete(id);
    if (cWahl.includes(id)) { cWahl = cWahl.filter(x => x !== id); tone("move"); }
    else if (kannMit(fq).includes(id) && schon.length + cWahl.length < 3) { cWahl.push(id); cNeu = id; tone("confirm"); }
    else tone("move");
    renderEquip();
  }

  // AUSRÜSTEN auf der Quest-Karte: zur Ausrüstung, gerüstet wird für diese Quest. Gewählt ist, was als Erstes hilft.
  function ausruesten(qid) {
    if (!state || !aktiv(qid)) return;
    ruestFuer = qid;
    pruefeWahl();
    const mit = kannMit(qid), schon = schonDabei(qid);
    sel[2] = mit[0] || schon[0] || sel[2];
    renderEquip();
    if (page !== 2) goTo(2); else tone("move");
  }

  /* Funde: Was seit dem letzten Besuch dazugekommen ist, tritt beim nächsten Besuch der Ausrüstung aus dem Schatten.
     Gemerkt wird pro Handy, wie viel Dennis von jedem Item hier schon gesehen hat. Beim ersten Besuch gilt alles als gesehen. */
  const FUND_KEY = "dq-funde-v1" + (PROBE ? "-probe" : "");
  const neuMarke = new Set(), fundLaeuft = new Set();
  let gesehen = null;
  try { if (!DEMO) gesehen = JSON.parse(localStorage.getItem(FUND_KEY) || "null"); } catch (e) {}
  const besitzZahl = id => state.items[id] !== "besitz" || verborgen(id) ? 0 : itemById(id).stapel ? state.anzahl[id] : 1;
  function funde() {
    const jetzt = Object.fromEntries(C.items.map(it => [it.id, besitzZahl(it.id)]));
    const neu = gesehen ? C.items.map(it => it.id).filter(id => jetzt[id] > (gesehen[id] || 0)) : [];
    gesehen = jetzt;
    try { if (!DEMO) localStorage.setItem(FUND_KEY, JSON.stringify(gesehen)); } catch (e) {}
    if (neu.length) aufleuchten(neu);
  }
  function aufleuchten(ids) {
    const still = STILL.matches;
    ids.forEach(id => { neuMarke.add(id); if (!still) fundLaeuft.add(id); });
    sel[2] = ids[ids.length - 1];
    document.querySelectorAll(".slot").forEach(b => { const i = ids.indexOf(b.dataset.id); if (i >= 0) b.style.setProperty("--fd", i * .38 + "s"); });
    renderEquip();
    melody("fund");
    setTimeout(() => { ids.forEach(id => fundLaeuft.delete(id)); renderEquip(); }, 1500 + ids.length * 380);
  }

  /* ---------- Ergebnis-Fenster ---------- */
  let overlayAfter = null;
  let fensterQuest = null;                     // { id, status }: Quest, deren Ergebnis das offene Fenster zeigt
  function showOverlay(html, after) {
    const r = $("#overlay .result");
    $("#resultHead").innerHTML = html.head;
    $("#resultLines").innerHTML = html.lines || "";
    $("#resultNext").textContent = html.next || "";
    r.classList.toggle("big-moment", !!html.gross);
    [...$("#resultLines").children].forEach((li, i) => li.style.setProperty("--d", i));
    // Kommt ein neues Fenster, solange das alte offen ist, bleibt dessen Folge (Quest aus dem Nebel holen) erhalten
    const offen = overlayAfter && !$("#overlay").hidden ? overlayAfter : null;
    // War das Fenster schon offen, die Animation neu starten. Ohne erzwungenes Layout (01.10.): Ein verstecktes Fenster
    // startet sie beim Erscheinen ohnehin von vorn.
    if (!$("#overlay").hidden) r.getAnimations().forEach(a => { a.cancel(); a.play(); });
    $("#overlay").hidden = false;
    overlayAfter = after || offen;
  }
  function closeOverlay() {
    if ($("#overlay").hidden) return;
    $("#overlay").hidden = true;
    fensterQuest = null;
    const f = overlayAfter; overlayAfter = null;
    if (schlange.length) { setTimeout(naechsterMoment, 220); return; }   // nachgeholte Momente: der nächste
    if (f) f();
    else if (revealPending) showNextQuest();
    // Kam etwas dazu, während Dennis in der Ausrüstung steht (Treffer, Geschenk): gleich hier aus dem Schatten holen
    if (page === 2 && onboarded() && $("#overlay").hidden) funde();
    setTimeout(abspannPruefen, 600);
  }

  /* ---------- Verpasste Momente nachholen (08-erlebnis-plan.md, 3.6) ---------- */
  // Jedes Handy merkt sich den Stand, den Dennis zuletzt im Menü gesehen hat. Ist seitdem etwas passiert (App war zu,
  // Startbildschirm offen, kein Netz), laufen die Momente nach PRESS START nacheinander: jede Quest einzeln in der
  // Reihenfolge, in der sie entschieden wurde, danach alles andere. Die nächste Quest tritt erst am Ende aus dem Nebel.
  const GESEHEN_KEY = "dq-gesehen-v1" + (PROBE ? "-probe" : "");
  let gesehenDoc = null, schlange = [];
  try { if (!DEMO) gesehenDoc = JSON.parse(localStorage.getItem(GESEHEN_KEY) || "null"); } catch (e) {}
  function merkeGesehen(d = lastDoc) {
    gesehenDoc = d;
    try { if (!DEMO && d) localStorage.setItem(GESEHEN_KEY, JSON.stringify(d)); } catch (e) {}
  }
  // Neustart des Quest Masters (neustart im Spiel, engine.js), den dieses Handy zuletzt kannte. Fehlt er, aber das Handy
  // hat schon etwas gesehen, stammt es von vor dem Zeitstempel (0).
  const NEUSTART_KEY = "dq-neustart-v1" + (PROBE ? "-probe" : "");
  let neustartBekannt = null;
  try { if (!DEMO) { const v = localStorage.getItem(NEUSTART_KEY); neustartBekannt = v !== null ? Number(v) || 0 : gesehenDoc ? 0 : null; } } catch (e) {}
  function nachholen() {
    const alt = gesehenDoc && E.normalize(gesehenDoc), neu = lastDoc && E.normalize(lastDoc);
    merkeGesehen();
    // Neues Handy, und der Morgen war schon: einmal zeigen
    if (!alt && state && !DEMO && morgenFaellig(null, state)) return morgen.start(state.morgen, () => {});
    if (!alt || !neu || JSON.stringify({ ...alt, stand: 0 }) === JSON.stringify({ ...neu, stand: 0 })) return;
    const reihe = C.quests.map(q => q.id), zeit = id => Number(neu.zeiten[id]) || 9e15;
    // Einzeln nachgeholt wird nur, was neu entschieden oder gestartet ist. Was zurückgenommen wurde, kommt gesammelt
    // im letzten Schritt (ein Fenster statt einem je Quest)
    const ids = reihe.filter(id => neu.quests[id] && ((alt.quests[id] || "offen") !== neu.quests[id] || !alt.glanz[id] !== !neu.glanz[id]))
      .sort((x, y) => zeit(x) - zeit(y) || reihe.indexOf(x) - reihe.indexOf(y));
    const docs = [alt];
    ids.forEach(id => {
      const d = JSON.parse(JSON.stringify(docs[docs.length - 1]));
      if (neu.quests[id]) d.quests[id] = neu.quests[id]; else delete d.quests[id];
      if (neu.zeiten[id]) d.zeiten[id] = neu.zeiten[id]; else delete d.zeiten[id];
      if (neu.glanz[id]) d.glanz[id] = true; else delete d.glanz[id];
      docs.push(d);
    });
    docs.push(neu);
    // Der Morgen ist ein eigener Schritt, bevor die Quests ab dem Samstag nachgeholt werden (Items erst, dann Upgrades)
    const mz = E.morgenZeit(C, neu);
    if (mz && !E.morgenZeit(C, alt)) {
      const ab = docs.findIndex(d => E.morgenZeit(C, E.normalize(d)));   // der erste Schritt mit dem Morgen (nie der alte Stand)
      const vorher = { ...JSON.parse(JSON.stringify(docs[ab - 1])), morgen: mz };
      docs.splice(ab, 0, vorher);
    }
    schlange = docs.slice(1).map((d, i) => [docs[i], d]);
    // Die neue nächste Quest bleibt im Nebel, bis alle Momente gelaufen sind
    const vorher = E.derive(C, alt);
    if (state.next && vorher.quests[state.next] === "offen" && vorher.next !== state.next) revealPending = state.next;
    renderHud(); renderQuests();
    naechsterMoment();
  }
  function naechsterMoment() {
    while (schlange.length) {
      const [p, q] = schlange.shift();
      if (announce(E.derive(C, p), E.derive(C, q), p, q, { kette: true })) return;
    }
    if (revealPending && $("#overlay").hidden) showNextQuest();
  }

  // Der Quest Master hat das Ergebnis zurückgenommen, solange das Fenster noch offen ist: Fenster still zu, Nebel bleibt
  function fensterZuruecknehmen() {
    if (!fensterQuest || $("#overlay").hidden) return;
    if (state.quests[fensterQuest.id] === fensterQuest.status) return;
    fensterQuest = null; overlayAfter = null; revealPending = null;
    $("#overlay").hidden = true;
    renderHud(); renderQuests();
  }

  const itemZeile = (id, text, cls, tarn) => {
    const x = itemById(id);
    return `<li class="${cls}${tarn ? " reveal" : ""}"><span class="ri${cls === "minus" ? " x-over" : ""}" style="color:${x.farbe}">${useSvg(x.symbol)}</span><span>${tarn ? `<small class="tarn">${esc(x.tarn.name)} entpuppt sich als</small>` : ""}${text}</span></li>`;
  };
  const stage = (q, won, farbe) => `<span class="medal-stage ${won ? "won" : "lost"}" style="--m:${farbe}">${q ? questIcon(q, won ? (q.typ === "lauf" ? "beendet" : "bestanden") : "verloren", false) : ""}</span>`;

  // Was hat der Quest Master gerade geändert? Nur echte Neuigkeiten melden:
  // Quest entschieden oder gestartet, Treffer, Schritt, Einsatz, Duell, neue Buchung, Item von Hand.
  // Zurückstellen oder Löschen aktualisiert still.
  // Zeigt den Moment und gibt true zurück, wenn ein Fenster aufgeht. opt.kette: nachgeholter Moment in einer Reihe,
  // dann tritt die nächste Quest erst am Ende der Reihe aus dem Nebel.
  function announce(prev, next, prevDoc, doc, opt = {}) {
    prevDoc = E.normalize(prevDoc); doc = E.normalize(doc);
    // Läuft gerade der Morgen, kommt alles Neue danach dran
    if (morgen.offen() && !opt.kette) { schlange.push([prevDoc, doc]); return true; }
    // Der Morgen (01.10.): erst die Zwischensequenz, dann der Rest dieses Schritts (meist die Freigabe der ersten Quest am
    // Samstag), als hätte Dennis die Items schon vorher gehabt. Ist ein Fenster offen, kommt er danach.
    if (morgenFaellig(prev, next)) {
      if (!opt.kette && !$("#overlay").hidden) { schlange.push([prevDoc, doc]); return true; }
      morgen.start(next.morgen, () => {
        const mitMorgen = { ...prevDoc, morgen: next.morgen };
        if (!announce(E.derive(C, mitMorgen), next, mitMorgen, doc, opt) && (schlange.length || revealPending)) naechsterMoment();
        renderHud(); renderQuests();
      });
      return true;
    }
    const glanzNeu = q => next.glanz[q.id] && !prev.glanz[q.id];
    const fertig = C.quests.filter(q => (prev.quests[q.id] !== next.quests[q.id] && ["bestanden", "verloren", "beendet"].includes(next.quests[q.id])) || glanzNeu(q));
    const gestartet = LAUF.filter(q => prev.quests[q.id] === "offen" && next.quests[q.id] === "laeuft");
    const treffer = LAUF.filter(q => q.zaehler && (next.treffer[q.id] || 0) > (prev.treffer[q.id] || 0));
    const schritte = LAUF.filter(q => q.schritte && q.schritte.some(sx => next.schritte[q.id][sx.id] && !prev.schritte[q.id][sx.id]));
    const alteE = new Set(prevDoc.einsaetze.map(e => e.id)), neueE = doc.einsaetze.filter(e => !alteE.has(e.id));
    const neueD = Object.keys(next.duelle).filter(k => next.duelle[k] !== prev.duelle[k]);
    const alteB = new Set(prevDoc.buchungen.map(b => b.id)), neueB = doc.buchungen.filter(b => !alteB.has(b.id));
    const handItems = JSON.stringify(prevDoc.items) !== JSON.stringify(doc.items);
    // Zurückgenommen (vom Quest Master): Ergebnis, Einsatz, Duell, Schritt oder Buchung ist wieder weg
    const neuIds = liste => new Set(liste.map(x => x.id));
    const nE = neuIds(doc.einsaetze), nB = neuIds(doc.buchungen), ENTSCH = ["bestanden", "verloren", "beendet"];
    const weg = {
      q: C.quests.filter(q => ENTSCH.includes(prev.quests[q.id]) && !ENTSCH.includes(next.quests[q.id])),
      e: prevDoc.einsaetze.filter(e => !nE.has(e.id)),
      d: Object.keys(prev.duelle).filter(k => !next.duelle[k]),
      s: LAUF.filter(q => q.schritte && q.schritte.some(sx => prev.schritte[q.id][sx.id] && !next.schritte[q.id][sx.id])),
      g: C.quests.filter(q => prev.glanz[q.id] && !next.glanz[q.id] && next.quests[q.id] === "bestanden"),
      b: prevDoc.buchungen.filter(b => !nB.has(b.id))
    };
    const vorwaerts = fertig.length || gestartet.length || treffer.length || schritte.length || neueE.length || neueD.length || neueB.length;
    // Mitgenommen oder eingesetzt, und sonst nichts Großes: eigener Moment (AUSGERÜSTET, FLUCH GESPROCHEN, Schild)
    const eMoment = !fertig.length && !gestartet.length && !treffer.length && !schritte.length && !neueB.some(b => b.ziffer) && neueE.length > 0;
    const eIds = new Set(neueE.map(e => e.item));
    // Fluch gesprochen (29.09.): Der Moment zeigt erst den Vorteil, dann würfelt der Schattendieb. Die Packs nennt erst er.
    const fluchE = eMoment ? neueE.find(e => itemById(e.item).dieb) || null : null;
    // Nur ein Pack geöffnet (29.09.): eigener kleiner Moment
    const nurOffen = !fertig.length && !gestartet.length && !treffer.length && !schritte.length && !neueE.length && !neueD.length
      && neueB.length && neueB.every(b => b.offen);
    if (!vorwaerts && Object.values(weg).some(x => x.length)) return zurueckgenommen(prev, next, weg);
    // Nur freigegeben (30.09.): Der Quest Master schickt Dennis weiter, sonst hat sich nichts getan
    if (!vorwaerts && !handItems) return next.next && !prev.next && prev.quests[next.next] === "offen" ? freigegeben(prev, next, prevDoc, doc, opt) : false;

    // Zeilen: Packs, Ziffern, Items (mit Enthüllung beim ersten Fund)
    const lines = [];
    const dPacks = next.packs - prev.packs;
    if (dPacks && !fluchE && !nurOffen) lines.push(`<li class="${dPacks > 0 ? "plus" : "minus"}"><span class="ri">${cardSvg()}</span>${dPacks > 0 ? "+" : "−"}${Math.abs(dPacks)} ${packsWort(dPacks)}</li>`);
    // Reichten die geschlossenen Packs nicht, zahlt er in Karten (29.09.)
    const dKarten = (next.karten || 0) - (prev.karten || 0);
    if (dKarten > 0 && !fluchE) lines.push(`<li class="minus"><span class="ri">${cardSvg("offen")}</span><span>−${dKarten} ${dKarten === 1 ? "Karte" : "Karten"}, blind gezogen aus deinen glänzenden und seltenen. Keine geschlossenen Packs mehr.</span></li>`);
    next.ziffern.forEach((v, i) => {
      if (v != null && prev.ziffern[i] == null) lines.push(`<li class="plus"><span class="ri"><span class="tumbler known" style="--hud-h:30px">${v}</span></span>Ziffer ${i + 1}: ${v}</li>`);
    });
    C.items.forEach(it => {
      const erstmals = prev.items[it.id] === "nicht";
      if (it.stapel) {
        const d = next.anzahl[it.id] - prev.anzahl[it.id];
        if (d > 0 && it.gefunden) lines.push(fundZeile(it, d, erstmals));
        else if (d > 0) lines.push(itemZeile(it.id, `+${d} ${esc(it.name)}`, "plus", erstmals));
        if (d < 0 && !eIds.has(it.id)) lines.push(itemZeile(it.id, `${esc(it.name)} eingesetzt`, "minus"));
        return;
      }
      if (prev.items[it.id] !== "besitz" && next.items[it.id] === "besitz") lines.push(itemZeile(it.id, esc(it.name), "plus", erstmals));
      if (prev.items[it.id] === "besitz" && next.items[it.id] === "verloren") lines.push(itemZeile(it.id, `${esc(it.name)} weg`, "minus"));
      if (prev.items[it.id] === "besitz" && next.items[it.id] === "verbraucht" && !eIds.has(it.id)) lines.push(itemZeile(it.id, `${esc(it.name)} eingesetzt`, "minus"));
    });
    // Geschenk (01.10.): Buu Huu spielt bei Die drei Zeichen mit und schenkt einen Fluch, bei Sieg und Niederlage
    const ENTSCH2 = ["bestanden", "verloren"];
    fertig.filter(q => q.geschenk && ENTSCH2.includes(next.quests[q.id]) && !ENTSCH2.includes(prev.quests[q.id])).forEach(q => {
      const id = (q.geschenk.items || [])[0], dazu = id && itemById(id).stapel ? next.anzahl[id] - prev.anzahl[id] : 1;
      lines.push(`<li class="dieb geschenk kommt"><span class="ri dieb-ic">${useSvg("i-dieb")}</span><span>${esc(dazu > 1 && q.geschenk.mehr ? q.geschenk.mehr : q.geschenk.text)}</span></li>`);
    });
    // Einsätze: Was Dennis mitnimmt, holt er sich beim Bund. Schild und Segen setzt er ein. Kommen sie mit anderem (nachgeholt),
    // stehen sie als Zeilen darunter, sonst baut der eigene Moment sie unten.
    const eZeile = e => { const x = itemById(e.item), ein = x.rettung || x.tor; return itemZeile(e.item, `${esc(x.name)} ${ein ? "eingesetzt" : "mitgenommen"}`, ein ? "minus" : "plus"); };
    if (!eMoment) neueE.forEach(e => lines.push(eZeile(e)));
    // Packs zählen nur zwischen 0 und max (engine.js): sagen, warum Dennis weniger verloren hat als gedacht.
    // Über max kommt er mit den Quests nicht (alle Siege zusammen sind genau max), nur mit einem Bonus des Quest Masters.
    if (next.kappung.unten > prev.kappung.unten && !fluchE) lines.push(`<li><span class="ri">${cardSvg("empty")}</span>Mehr Packs hattest du nicht.</li>`);

    // Neue Packs und Ziffern im HUD aufblinken lassen
    document.querySelectorAll("#packRow .ic-card").forEach((c, i) => c.classList.toggle("gain", i >= prev.packs && i < next.packs));
    document.querySelectorAll("#tumblers .tumbler").forEach((t, i) => t.classList.toggle("gain", next.ziffern[i] != null && prev.ziffern[i] == null));

    let head, klang = dPacks < 0 ? "minus" : "plus", gross = false;
    if (fertig.length) {
      const q = fertig[0], st = next.quests[q.id], won = st !== "verloren", glanz = !!next.glanz[q.id];
      const art = q.typ === "kern" ? "PRÜFUNG" : q.typ === "side" ? "SIDEQUEST" : "QUEST";
      const farbe = q.typ === "side" ? "#3ddc97" : q.farbe;
      klang = !won ? "verloren" : q.typ === "kern" || glanz ? "pruefung" : "side";
      gross = true;
      head = `${stage(q, won, farbe)}<p class="big${won ? "" : " lost"}${glanz ? " glanz" : ""}">${glanz ? "GLANZSIEG" : `${art} ${st === "beendet" ? "BEENDET" : won ? "BESTANDEN" : "VERLOREN"}`}</p>
              <p class="sub">${esc(q.name)}${fertig.length > 1 ? ` und ${fertig.length - 1} weitere` : ""}</p>`;
      if (!lines.length) lines.push(`<li><span class="ri"></span>Keine Folgen</li>`);
    } else if (gestartet.length) {
      const q = gestartet[0];
      klang = "side"; gross = true;
      head = `<span class="medal-stage won" style="--m:${q.farbe}">${medalHtml(q, "laeuft", false)}</span><p class="big">NEUE QUEST</p><p class="sub">${esc(q.name)}</p>`;
      lines.unshift(`<li><span class="ri"></span>${esc(q.text)}</li>`);
    } else if (treffer.length) {
      const q = treffer[0];
      klang = "zauber"; gross = true;
      head = `<span class="medal-stage won" style="--m:${q.farbe}">${medalHtml(q, "laeuft", false)}</span><p class="big">PROPHEZEIUNG ERFÜLLT</p><p class="sub">${next.treffer[q.id]} von ${q.zaehler.max} ${esc(q.zaehler.name)}</p>`;
    } else if (schritte.length) {
      const q = schritte[0], sx = q.schritte.find(x => next.schritte[q.id][x.id] && !prev.schritte[q.id][x.id]);
      klang = "side"; gross = true;
      head = `<span class="medal-stage won" style="--m:${q.farbe}">${medalHtml(q, "laeuft", false)}</span><p class="big">${esc(sx.name.toUpperCase())}</p><p class="sub">${esc(q.name)}</p>`;
      if (!lines.length) lines.push(`<li><span class="ri"></span>Jetzt zusammensetzen. Bis zum Gipfel!</li>`);
    } else if (nurOffen) {
      klang = "plus";
      head = `<span class="ri-big">${cardSvg("offen")}</span><p class="big">PACK GEÖFFNET</p><p class="sub">Viel Glück!</p>`;
      lines.push(`<li><span class="ri">${cardSvg()}</span><span>Noch ${next.packs} geschlossen</span></li>`);
    } else if (neueB.some(b => b.ziffer)) {
      const b = neueB.filter(x => x.ziffer).pop(), weg = b.weg || "packs";
      klang = weg === "packs" ? "plus" : "zauber";
      const ic = weg === "segen" ? `<span class="ri-big" style="color:${torSegen().farbe}">${useSvg(torSegen().symbol)}</span>` : `<span class="ri-big lock">${useSvg("i-lock")}</span>`;
      head = `${ic}<p class="big">${weg === "busse" ? "BUSSE BESTANDEN" : weg === "segen" ? "RIKES SEGEN" : "ZIFFER GEKAUFT"}</p><p class="sub">${esc(b.grund || "")}</p>`;
      if (prev.tor && !next.tor && next.next) lines.push(`<li class="plus"><span class="ri">${useSvg("z-triforce")}</span>Das Tor ist offen. Der Bund erwartet dich.</li>`);
    } else if (eMoment) {
      // Ausrüsten beim Spiel (29.09.): Mitgenommenes je eine Zeile, beim Fluch danach Vorteil und Schattendieb.
      // Nur ein Fluch: FLUCH GESPROCHEN wie bisher. Nur der Schild: noch einmal spielen.
      const spielName = e => { const dq = e.duell && questById(e.quest).showdown ? E.showdownDuelle(C, prev).find(x => x.nr === e.duell) : null;
        return dq ? `Duell ${dq.nr} · ${questById(dq.quest).name}` : questById(e.quest).name; };
      const mitE = neueE.filter(e => !itemById(e.item).rettung && !itemById(e.item).tor), andere = mitE.filter(e => e !== fluchE);
      const e0 = neueE[neueE.length - 1], x0 = itemById(e0.item);
      klang = fluchE || !mitE.length ? "zauber" : "side";
      if (!mitE.length) {
        head = `<span class="ri-big" style="color:${x0.farbe}">${useSvg(x0.symbol)}</span><p class="big">${esc(x0.name.toUpperCase())}</p><p class="sub">${esc(spielName(e0))}</p>`;
        lines.push(`<li><span class="ri"></span><span>Noch einmal spielen, dann neu eintragen.</span></li>`);
      } else if (fluchE && !andere.length) {
        const it = itemById(fluchE.item);
        head = `<span class="ri-big" style="color:${it.farbe}">${useSvg(it.symbol)}</span><p class="big">FLUCH GESPROCHEN</p><p class="sub">${esc(spielName(fluchE))}</p>`;
      } else {
        head = `<span class="ri-big">${useSvg("i-beutel")}</span><p class="big">AUSGERÜSTET</p><p class="sub">${esc(spielName(mitE[0]))}</p>`;
        andere.forEach(e => lines.push(itemZeile(e.item, esc(itemById(e.item).name), "plus")));
        if (!fluchE) lines.push(`<li class="dim"><span class="ri"></span><span>Hol ${andere.length === 1 ? "es" : "sie"} dir beim Bund.</span></li>`);
      }
      if (fluchE) {
        const v = E.fluchVorteil(C, prev, fluchE.quest), r = raubVon(next, fluchE);
        if (v) lines.push(`<li class="plus"><span class="ri" style="color:${itemById(fluchE.item).farbe}">${useSvg(itemById(fluchE.item).symbol)}</span><span>${esc(v.text)}</span></li>`);
        lines.push(`<li class="dieb kommt fertig ${r.packs || r.karten ? "minus" : "plus"}${r.alles ? " alles" : ""}"><span class="ri dieb-ic">${useSvg("i-dieb")}</span>`
          + `<span class="dieb-txt">${esc(diebSatz(r))}</span><b class="dieb-zahl" aria-hidden="true">${r.alles ? "ALLES" : r.raub ? "−" + r.raub : "0"}</b></li>`);
      }
    } else if (neueD.length) {
      const k = neueD[0], sieg = next.duelle[k] === "sieg";
      klang = sieg ? "plus" : "minus";
      head = `<span class="ri-big">${useSvg(sieg ? "i-check" : "i-x")}</span><p class="big${sieg ? "" : " lost"}">DUELL ${k} ${sieg ? "GEWONNEN" : "VERLOREN"}</p><p class="sub">Prüfung des Bundes</p>`;
    } else if (neueB.length) {
      const b = neueB[neueB.length - 1];
      const weniger = dPacks < 0 || dKarten > 0;
      const titel = b.ziffer ? "ZIFFER GEKAUFT" : b.item ? "GESCHENK" : weniger ? "PACKS WEG" : dPacks > 0 ? "PACKS DAZU" : "BUCHUNG";
      head = `<span class="ri-big">${cardSvg()}</span><p class="big${weniger && !b.ziffer ? " lost" : ""}">${titel}</p><p class="sub">${esc(b.grund || "Buchung vom Quest Master")}</p>`;
      if (!lines.length) lines.push(`<li><span class="ri"></span>Keine Packs mehr, es bleibt bei 0.</li>`);
    } else {
      head = `<span class="ri-big">${useSvg("i-beutel")}</span><p class="big">DEIN BEUTEL</p><p class="sub">Der Quest Master hat etwas geändert.</p>`;
      if (!lines.length) return false;
    }
    // Die nächste Quest wird erst nach dem Fenster aufgedeckt, darum steht ihr Name hier nicht
    const warSichtbar = id => prev.quests[id] !== "offen" || prev.next === id;
    if (!opt.kette && next.next && !warSichtbar(next.next)) revealPending = next.next;
    const fq = fertig[0] || gestartet[0];
    if (fq) fensterQuest = { id: fq.id, status: next.quests[fq.id] };
    const zeigen = () => {
      melody(klang);
      // Nach dem Mitnehmen geht es zurück zu QUESTS: dort wird gespielt und eingetragen
      const danach = !opt.kette && (fertig.length || gestartet.length) ? showNextQuest
        : eMoment && zuQuests ? () => { zuQuests = false; if (page !== 1) goTo(1); } : null;
      showOverlay({ head, lines: lines.join(""), next: !next.ende || !fertig.length ? "" : "Zum Kästchen", gross }, danach);
      renderHud(); renderQuests();
    };
    if (fluchE && !STILL.matches) {
      diebHalt = prev.packs;
      renderHud(); renderQuests();
      fluchSzene({ id: fluchE.id, it: itemById(fluchE.item), v: E.fluchVorteil(C, prev, fluchE.quest), r: raubVon(next, fluchE), vorher: prev.packs,
        offen: prev.geoeffnet || 0, rad: fluchE.rad, quote: fluchE.quote ?? E.allesChance(C, prev), erstesAlles: prev.raube.length === 1 }, zeigen);
    } else zeigen();
    return true;
  }

  // Ein Item mit Fund-Sätzen (Fluch): „Du hast etwas gefunden …“, dann der Name, darunter die Warnung
  const fundZeile = (it, d, tarn) => `<li class="plus${tarn ? " reveal" : ""}"><span class="ri" style="color:${it.farbe}">${useSvg(it.symbol)}</span>`
    + `<span><small class="tarn">${esc(it.gefunden.titel)}</small>${d > 1 ? `+${d} ` : ""}${esc(it.name)}<small class="warnung">${esc(it.gefunden.warnung)}</small></span></li>`;

  const diebName = () => ((C.items.find(i => i.dieb) || {}).dieb || {}).name || "Dieb";
  const raubVon = (st, e) => st.raube.find(x => x.id === e.id) || { raub: 0, packs: 0, karten: 0 };
  // Was Buu Huu bekommen hat, als Satz (r aus state.raube: raub, alles, packs = geschlossene, karten = statt fehlender Packs)
  function diebSatz(r) {
    const n = diebName(), p = r.packs || 0, k = r.karten || 0, kw = x => `${x} ${x === 1 ? "Karte" : "Karten"}`;
    const karten = k ? ` Dafür zieht der Bund ${kw(k)} blind aus deinen glänzenden und seltenen.` : "";
    if (r.alles) return !p && !k ? `ALLES! Doch du hattest nichts mehr.`
      : !k ? `ALLES! ${n} holt sich ${p === 1 ? "dein letztes Pack" : `alle ${p} Packs`}.`
      : `ALLES! ${p ? `${n} holt sich ${p === 1 ? "dein letztes Pack" : `alle ${p} Packs`}.` : "Keine Packs mehr."}${karten}`;
    if (!r.raub) return `Glück gehabt! ${n} ist leer abgezogen.`;
    if (p >= r.raub) return `${n} hat dir ${p} ${packsWort(p)} gestohlen.`;
    return `${n} wollte ${r.raub} ${packsWort(r.raub)}, ${p ? `du hattest nur ${p}` : "doch du hattest keine"}.${karten}`;
  }

  /* ---------- Buu Huus Rad (01.10.) ----------
     Felder 0, 1, 2, 3 und ALLES, so groß, wie wahrscheinlich sie sind (engine.js radFelder): Grün für Glück, dann immer
     dunkleres Violett, ALLES rot. Groß in der Fluch-Szene (mit Zahlen und Stiften am Rand), klein im Siegel und in der Ausrüstung. */
  const RAD_FARBE = ["#3b9c5a", "#7d58c8", "#5e3ba3", "#45237e"], RAD_ALLES = "#d22a1f";
  const radPunkt = (u, r) => { const w = u * 2 * Math.PI - Math.PI / 2; return [50 + r * Math.cos(w), 50 + r * Math.sin(w)]; };
  function radSvg(quote, gross = false) {
    const felder = E.radFelder(C, quote), f2 = x => x.toFixed(2);
    const teile = felder.map((f, i) => {
      const farbe = f.alles ? RAD_ALLES : RAD_FARBE[f.wert % RAD_FARBE.length], breite = f.bis - f.von;
      const [x0, y0] = radPunkt(f.von, 48), [x1, y1] = radPunkt(f.bis, 48);
      const form = breite > .9999 ? `<circle cx="50" cy="50" r="48" fill="${farbe}"/>`
        : `<path d="M50 50L${f2(x0)} ${f2(y0)}A48 48 0 ${breite > .5 ? 1 : 0} 1 ${f2(x1)} ${f2(y1)}Z" fill="${farbe}"/>`;
      if (!gross) return form;
      // Die Zahl steht quer zum Rand, oben lesbar, wenn das Feld unter dem Zeiger liegt
      const mitte = (f.von + f.bis) / 2, [lx, ly] = radPunkt(mitte, breite > .9999 ? 0 : f.alles ? 31 : 35);
      const wort = f.alles ? "ALLES" : String(f.wert), klein = f.alles ? Math.min(13, 8 + breite * 30) : 15;
      return `<g class="rad-feld" data-i="${i}">${form}<text x="${f2(lx)}" y="${f2(ly)}" transform="rotate(${f2(mitte * 360)} ${f2(lx)} ${f2(ly)})"`
        + ` font-size="${f2(klein)}" text-anchor="middle" dominant-baseline="central" class="rad-wort${f.alles ? " alles" : ""}">${wort}</text></g>`;
    }).join("");
    const grenzen = felder.length > 1 ? felder.map(f => { const [x, y] = radPunkt(f.von, 48); return `<line x1="50" y1="50" x2="${f2(x)}" y2="${f2(y)}"/>`; }).join("") : "";
    const stifte = gross && felder.length > 1 ? felder.map(f => { const [x, y] = radPunkt(f.von, 46.5); return `<circle cx="${f2(x)}" cy="${f2(y)}" r="1.9"/>`; }).join("") : "";
    return `<svg class="rad-svg" viewBox="0 0 100 100" aria-hidden="true">${teile}<g class="rad-grenzen">${grenzen}</g>`
      + `<circle class="rad-rand" cx="50" cy="50" r="48.5"/><g class="rad-stifte">${stifte}</g></svg>`;
  }
  // Kleines Rad für Siegel und Ausrüstung: zeigt, wie groß ALLES gerade ist
  const radMini = quote => `<span class="rad-mini" title="Buu Huus Rad">${radSvg(quote)}<i class="rad-mini-zeiger"></i></span>`;
  // Der Satz zum Rad, vor dem Siegel: 0 bis 3 Packs, ab dem zweiten Fluch auch ALLES
  const radSatz = quote => `${diebName()} dreht am Rad: 0 bis 3 Packs${quote > 0 ? " oder ALLES!" : "."}`;

  // Klänge der Szene (eigene, keine Originalmusik): Klicken des Zeigers an den Stiften, Herzschlag, Trommelwirbel, Donner
  function klang(art) {
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
      const t = audio.currentTime + .005;
      const ton = (f, f2, d, typ, vol, start = t) => {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = typ; o.frequency.setValueAtTime(f, start); if (f2) o.frequency.exponentialRampToValueAtTime(f2, start + d);
        g.gain.setValueAtTime(vol, start); g.gain.exponentialRampToValueAtTime(.0001, start + d);
        o.connect(g).connect(audio.destination); o.start(start); o.stop(start + d + .02);
      };
      const rauschen = (d, vol, tief, start = t) => {
        const n = Math.ceil(audio.sampleRate * d), b = audio.createBuffer(1, n, audio.sampleRate), x = b.getChannelData(0);
        for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / n);
        const q = audio.createBufferSource(), f = audio.createBiquadFilter(), g = audio.createGain();
        q.buffer = b; f.type = "lowpass"; f.frequency.value = tief; g.gain.value = vol;
        q.connect(f).connect(g).connect(audio.destination); q.start(start);
      };
      if (art === "tick") ton(1700, 900, .025, "square", .03);
      else if (art === "herz") { ton(70, 42, .16, "sine", .32); ton(62, 38, .13, "sine", .2, t + .2); }
      else if (art === "wirbel") for (let i = 0; i < 22; i++) rauschen(.05, .05 + i * .006, 900, t + i * .045);
      else if (art === "donner") { rauschen(1.1, .45, 260); ton(110, 38, .9, "sawtooth", .07); }
      else if (art === "glueck") ton(880, 1760, .25, "triangle", .06);
      else if (art === "bruch") { rauschen(.16, .5, 4200); ton(190, 55, .3, "sine", .3); }     // das Siegel des Briefs bricht
      else if (art === "grollen") { rauschen(1.3, .16, 140); ton(55, 48, 1.2, "sine", .12); }   // beim Halten des Siegels
    } catch (_) {}
  }

  /* Fluch gesprochen (01.10., Wunsch des Nutzers: ein Moment, bei dem alle zusammen draufschauen, etwa 8 Sekunden bis zur
     Auflösung). Erst greift der Fluch (Ringe, der Vorteil). Dann geht das Licht aus, nur Dennis' Packs leuchten noch, Buu Huu
     kichert und kreist um sie. Dann dreht er am Rad: es rattert, wird langsamer, der Herzschlag setzt ein, manchmal bleibt es
     fast stehen und ruckt dann doch noch ein Feld weiter. Auflösung: 0 (greift ins Leere, Glück gehabt), 1 bis 3 (holt die
     Karten einzeln aus der Leiste) oder ALLES (Bild wackelt, rot, er räumt die ganze Leiste leer). Fehlen geschlossene Packs,
     holt er Karten. Überspringen erst nach der Auflösung, damit niemand den Moment aus Versehen wegtippt.
     o: { it, v (Vorteil), r (Raub aus state.raube), vorher (geschlossene Packs davor), offen (geöffnete), rad (Stelle 0 bis 1,
     sonst zufällig im Feld), quote (Chance auf ALLES in %), erstesAlles (der erste Fluch, bei dem ALLES möglich ist) } */
  let szene = null;                            // laufende Szene: { id des Einsatzes, still() bricht sie ohne Fenster ab }
  function fluchSzene(o, fertig) {
    const el = $("#fluchSzene"), txt = $("#fsText"), radEl = $("#fsRad"), scheibe = $("#fsScheibe"), erg = $("#fsErgebnis");
    const timer = [], ABBRUCH = {};
    let aus = false, fertigGerufen = false;
    const r = o.r, felder = E.radFelder(C, o.quote);
    const ziel = felder.findIndex(f => r.alles ? f.alles : !f.alles && f.wert === r.raub);
    const base = () => el.getBoundingClientRect();
    const warte = ms => new Promise((ok, nein) => timer.push(setTimeout(() => aus ? nein(ABBRUCH) : ok(), ms)));
    const sag = (html, cls = "") => { txt.className = "fs-text " + cls; txt.innerHTML = html; txt.getAnimations().forEach(a => { a.cancel(); a.play(); }); };
    const ende = still => {
      if (fertigGerufen) return;
      fertigGerufen = true; aus = true; szene = null;
      timer.forEach(clearTimeout);
      el.hidden = true; el.onclick = null;
      el.classList.remove("nacht", "rad-da", "steht", "wackelt", "rot", "gold");
      document.documentElement.classList.remove("fs-wackelt");
      el.querySelectorAll(".fs-geist, .fs-karte").forEach(x => x.remove());
      diebHalt = null;
      if (still === true) { renderHud(); renderQuests(); } else fertig();
    };
    szene = { id: o.id, still: () => ende(true) };

    // Aufbau: Fluch-Symbol, Rad mit den Feldern dieses Fluchs, Scheinwerfer auf die Pack-Leiste
    $("#fsIcon").innerHTML = `<span style="color:${o.it.farbe}">${useSvg(o.it.symbol)}</span>`;
    scheibe.innerHTML = radSvg(o.quote, true);
    scheibe.style.transform = "";
    delete radEl.dataset.ziel; delete radEl.dataset.steht; delete radEl.dataset.ruck;
    erg.textContent = ""; erg.className = "fs-ergebnis";
    el.querySelectorAll(".fs-geist, .fs-karte").forEach(x => x.remove());
    el.classList.remove("nacht", "rad-da", "steht", "wackelt", "rot", "gold");
    el.onclick = null;
    el.hidden = false;
    const leiste = $("#packRow").getBoundingClientRect(), b0 = base();
    el.style.setProperty("--sx", `${leiste.left - b0.left + leiste.width / 2}px`);
    el.style.setProperty("--sy", `${leiste.top - b0.top + leiste.height / 2}px`);
    el.style.setProperty("--sw", `${leiste.width * .62 + 26}px`);
    el.style.setProperty("--sh", `${leiste.height * .62 + 22}px`);
    el.style.setProperty("--lx", `${leiste.left - b0.left - 5}px`);
    el.style.setProperty("--ly", `${leiste.top - b0.top - 4}px`);
    el.style.setProperty("--lw", `${leiste.width + 10}px`);
    el.style.setProperty("--lh", `${leiste.height + 8}px`);

    // Wo liegt eine Karte der Leiste, relativ zur Szene
    const kartenPos = i => {
      const c = document.querySelectorAll("#packRow .ic-card")[Math.max(0, i)], q = c.getBoundingClientRect(), b = base();
      return { x: q.left - b.left + q.width / 2, y: q.top - b.top + q.height / 2 };
    };
    const radMitte = () => { const q = radEl.getBoundingClientRect(), b = base(); return { x: q.left - b.left + q.width / 2, y: q.top - b.top + q.height / 2, w: q.width }; };
    const geist = document.createElement("span");
    geist.className = "fs-geist";
    geist.innerHTML = useSvg("i-dieb");
    const setzen = (x, y, ms, frei) => {
      if (ms != null) geist.style.transitionDuration = ms + "ms";
      if (!frei) { const b = base(); x = Math.max(30, Math.min(b.width - 30, x)); y = Math.max(28, Math.min(b.height - 28, y)); }
      geist.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    };

    // Das Rad dreht: rattert an jedem Stift, wird langsamer, Herzschlag zum Schluss. Wo es stehen bleibt: im Zielfeld,
    // meist knapp hinter der Kante, über die der Zeiger zuletzt kam. Manchmal bleibt es davor fast stehen und ruckt dann weiter.
    const drehen = () => new Promise((ok, nein) => {
      // vor: das Feld, über das der Zeiger ins Ziel kommt (er läuft rückwärts über die Scheibe, kommt also vom Feld dahinter)
      const f = felder[ziel], breite = f.bis - f.von, vor = felder[(ziel + 1) % felder.length];
      const zufall = (a, z) => a + Math.random() * (z - a);
      const imFeld = o.rad >= f.von && o.rad < f.bis ? o.rad : null;
      const ruck = felder.length > 1 && breite * 360 > 7 && (vor.bis - vor.von) * 360 > 7 && Math.random() < .45;
      // Zeiger oben zeigt auf die Stelle phi der Scheibe (0 bis 1 im Uhrzeigersinn), wenn die Scheibe um -phi gedreht ist
      const phiEnde = felder.length < 2 ? (imFeld ?? Math.random()) : ruck ? f.bis - breite * .3 : f.bis - breite * zufall(.06, imFeld != null ? .3 : .22);
      const phiStop = ruck ? Math.min(f.bis + (vor.bis - vor.von) * .25, f.bis + 4 / 360) : phiEnde;
      const start = Math.random() * 360, T = 3400;
      // Am Ende soll der Zeiger auf phiStop zeigen: Drehung ≡ −phiStop (mod 360), mindestens fünf volle Runden
      const gesamt = 360 * 5 + (((-start - phiStop * 360) % 360) + 360) % 360;
      const feldBei = deg => { const phi = (((-deg) % 360) + 360) % 360 / 360; return felder.findIndex(x => phi >= x.von && phi < x.bis); };
      const zeiger = radEl.querySelector(".fs-zeiger");
      let letztes = feldBei(start), t0 = 0, herz = 0, fertigGedreht = false;
      const zeigen = deg => { scheibe.style.transform = `rotate(${deg.toFixed(2)}deg)`; const i = feldBei(deg); if (i !== letztes) { letztes = i; klang("tick"); zeiger.animate([{ transform: "rotate(-26deg)" }, { transform: "none" }], { duration: 110, easing: "ease-out" }); } };
      scheibe.style.transform = `rotate(${start}deg)`;
      const schluss = async () => {
        if (fertigGedreht) return;
        fertigGedreht = true;
        zeigen(start + gesamt);
        let endlage = start + gesamt;
        try {
          if (ruck) {
            await warte(650); klang("herz");
            await warte(380);
            endlage = start + gesamt + (phiStop - phiEnde) * 360;
            scheibe.animate([{ transform: `rotate(${start + gesamt}deg)` }, { transform: `rotate(${endlage}deg)` }], { duration: 240, easing: "cubic-bezier(.2, .9, .3, 1.2)" });
            scheibe.style.transform = `rotate(${endlage}deg)`;
            await warte(120); klang("tick");
            await warte(160);
          }
          // Für die Tests: auf welchem Feld der Zeiger steht und welches gewürfelt war
          radEl.dataset.ziel = ziel; radEl.dataset.steht = feldBei(endlage); radEl.dataset.ruck = ruck ? "1" : "";
          ok();
        } catch (e) { nein(e); }
      };
      const bild = jetzt => {
        if (aus) return nein(ABBRUCH);
        if (!t0) t0 = jetzt;
        const p = Math.min(1, (jetzt - t0) / T), e = 1 - Math.pow(1 - p, 4);
        zeigen(start + gesamt * e);
        if (p > .5 && jetzt - herz > 560) { herz = jetzt; klang("herz"); }
        if (p < 1) requestAnimationFrame(bild); else schluss();
      };
      requestAnimationFrame(bild);
      timer.push(setTimeout(() => { if (!aus) schluss(); }, T + 900));   // falls das Handy die Bilder angehalten hat
    });

    // Karte aus der Leiste nehmen (geschlossenes Pack) oder eine Karte aus einem geöffneten Pack ziehen
    const nimm = (pos, k, offenKarte) => {
      const karte = document.createElement("span");
      karte.className = "fs-karte" + (offenKarte ? " offen" : "");
      karte.innerHTML = offenKarte ? useSvg("i-cards") : cardSvg();
      karte.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
      el.appendChild(karte);
      requestAnimationFrame(() => { karte.style.transform = `translate(${pos.x + 14 + (k % 6) * 5}px, ${pos.y + 34 - (k % 6) * 3}px) translate(-50%, -50%) rotate(${-12 + (k % 6) * 9}deg) scale(.8)`; });
      geist._karten = (geist._karten || []).concat(karte);
    };

    (async () => {
      try {
        // 1. Der Fluch greift
        sag(`<b>DER FLUCH GREIFT</b>${o.v ? `<span>${esc(o.v.text)}</span>` : ""}`);
        melody("zauber");
        await warte(1700);
        // 2. Licht aus, nur die Packs leuchten, Buu Huu kichert und kreist um sie
        el.classList.add("nacht");
        sag(`<b>DOCH JEDER FLUCH HAT SEINEN PREIS …</b>`, "oben");
        await warte(500);
        const b = base(), lp = kartenPos(Math.max(0, Math.min(o.vorher, 10) - 1)), mitte = { x: b.width * .5, y: b.height * .58 };
        el.appendChild(geist);
        setzen(mitte.x, mitte.y, 0);
        geist.classList.add("erscheint");
        melody("kichern");
        await warte(700);
        const sx = parseFloat(el.style.getPropertyValue("--sx")), sy = parseFloat(el.style.getPropertyValue("--sy"));
        const sw = parseFloat(el.style.getPropertyValue("--sw")), sh = parseFloat(el.style.getPropertyValue("--sh"));
        const bahn = [[1.15, .15], [.25, 1.3], [-.9, .6], [.95, -.1]];
        for (const [dx, dy] of bahn) { setzen(sx + dx * sw, sy + dy * sh + 18, 400); await warte(360); }
        // 3. Das Rad
        el.classList.add("rad-da");
        const erstmals = o.quote > 0 && o.erstesAlles;
        sag(`<b>${esc(diebName().toUpperCase())} DREHT AM RAD …</b>${erstmals ? "<span>Diesmal will er mehr …</span>" : ""}`, "oben");
        await warte(350);
        const rm = radMitte();
        setzen(rm.x + rm.w / 2 + 36, rm.y - rm.w * .18, 600);
        klang("wirbel");
        await warte(520);
        await drehen();
        // 4. Auflösung
        el.classList.add("steht");
        radEl.querySelectorAll(".rad-feld").forEach(g => g.classList.toggle("ziel", +g.dataset.i === ziel));
        const holt = r.packs || 0, karten = r.karten || 0;
        el.onclick = () => ende();                                 // ab jetzt darf man überspringen
        if (r.alles) {
          erg.textContent = "ALLES!"; erg.className = "fs-ergebnis alles";
          el.classList.add("wackelt", "rot"); document.documentElement.classList.add("fs-wackelt"); klang("donner");
          sag(`<b>${esc(diebName().toUpperCase())} WILL ALLES!</b>`, "oben rot");
          await warte(1100);
          el.classList.remove("wackelt"); document.documentElement.classList.remove("fs-wackelt");
        } else if (!r.raub) {
          erg.textContent = "0"; erg.className = "fs-ergebnis null";
          el.classList.add("gold"); klang("glueck"); melody("fund");
          sag(`<b>GLÜCK GEHABT!</b>`, "oben gold");
          await warte(900);
        } else {
          erg.textContent = "−" + r.raub; erg.className = "fs-ergebnis minus";
          melody("minus");
          sag(`<b>${esc(diebName().toUpperCase())} WILL ${r.raub} ${packsWort(r.raub).toUpperCase()}</b>`, "oben");
          await warte(900);
        }
        // Buu Huu holt sich die Beute: erst geschlossene Packs aus der Leiste, dann Karten aus geöffneten
        const ziele = Array.from({ length: holt }, (_, k) => o.vorher - 1 - k);
        const erstes = ziele.length ? kartenPos(ziele[0]) : lp;
        setzen(erstes.x, erstes.y + 26, 700);
        await warte(760);
        if (!holt && !karten) {
          geist.classList.add("sucht");
          sag(`<b>${esc(diebSatz(r).toUpperCase())}</b>`, "oben" + (r.raub || r.alles ? "" : " gold"));
          await warte(1500);
        }
        let k = 0;
        for (const ci of ziele) {
          const p = kartenPos(ci);
          setzen(p.x, p.y + 26, r.alles ? 260 : 420);
          await warte(r.alles ? 140 : 260);
          nimm(p, k++, false);
          diebHalt = ci; renderHud(); tone("error");
          await warte(r.alles ? 230 : 420);
        }
        if (karten) {
          sag(`<b>KEINE PACKS? MACHT NICHTS …</b><span>Er zieht ${karten} ${karten === 1 ? "Karte" : "Karten"} aus deinen glänzenden und seltenen.</span>`, "oben");
          await warte(900);
          for (let j = 0; j < karten; j++) {
            const p = kartenPos(Math.min(o.vorher - holt + j, o.vorher + o.offen - 1));
            setzen(p.x, p.y + 26, 360); await warte(260);
            nimm(p, k++, true); tone("error");
            await warte(420);
          }
        }
        if (holt || karten) { sag(`<b>${esc(diebSatz(r).toUpperCase())}</b>`, "oben" + (r.alles ? " rot" : "")); await warte(600); }
        // Mit der Beute davon, nach rechts oben aus dem Bild
        const w = base().width;
        geist.classList.add("flieht");
        setzen(w + 80, -40, 1100, true);
        (geist._karten || []).forEach((x, i) => { x.classList.add("flieht"); x.style.transform = `translate(${w + 90 + i * 6}px, ${-10 - i * 4}px) translate(-50%, -50%) rotate(${20 + i * 15}deg) scale(.6)`; });
        await warte(1300);
        ende();
      } catch (e) {
        if (e !== ABBRUCH) { console.error(e); ende(); }
      }
    })();
  }

  /* Der Quest Master hat die nächste Quest freigegeben (30.09.): Liegt sie an einer anderen Station, sagt die Fee, wohin es
     geht, danach wandert Dennis auf der Karte dorthin, und am Ziel tritt die Quest aus dem Nebel. An derselben Station
     (oder im Zug ganz am Anfang) tritt sie gleich nach dem Fenster aus dem Nebel. */
  function freigegeben(prev, next, prevDoc, doc, opt) {
    // Spielbeginn blanko: Die erste Freigabe wartet, bis der Rundgang durch ist (ersteQuestZeigen bringt sie dann)
    if (blanko) { renderHud(); renderQuests(); return false; }
    // Ist noch ein Fenster offen (etwa das Ergebnis, das Dennis gerade besiegelt hat), kommt die Freigabe danach dran
    if (!opt.kette && !$("#overlay").hidden) { schlange.push([prevDoc, doc]); return true; }
    const q = questById(next.next), ziel = STATIONEN.find(x => x.id === q.station);
    const vorher = STATIONEN[hierIndexFuer(prev)], wandern = !!ziel && !!vorher && ziel.id !== vorher.id;
    revealPending = next.next;
    const erste = !prev.zaehler.erledigt;
    const titel = wandern ? `WEITER ${ziel.zu.toUpperCase()} ${esc(ziel.name)}` : erste ? "DIE REISE BEGINNT" : "ES GEHT WEITER";
    const zeile = wandern ? `Der Weg führt weiter ${esc(ziel.zu)} ${esc(ziel.name)}${ziel.ort ? ` (${esc(ziel.ort)})` : ""}. Dort wartet die nächste Quest.`
      : erste ? "Der Quest Master gibt das Zeichen. Deine erste Quest wartet." : "Die nächste Quest tritt aus dem Nebel.";
    melody(wandern ? "plus" : "nebel");
    showOverlay({
      head: `<span class="ri-big fee"><img src="assets/fee.png" alt=""></span><p class="big">${titel}</p><p class="sub">vom Quest Master</p>`,
      lines: `<li><span class="ri">${useSvg(wandern ? "i-mountain" : "z-triforce")}</span><span>${zeile}</span></li>`, next: ""
    }, wandern ? () => { if (page === 0) spieleLauf(); else goTo(0); } : null);   // erst wandern, das Aufdecken folgt am Ziel (spieleLauf)
    renderHud(); renderQuests();
    return true;
  }
  // Wo Dennis in einem Stand steht (siehe hierIndex), auch für den Vergleich vor und nach einer Freigabe
  function hierIndexFuer(s) {
    let st = ZIEL;
    if (s.next) st = questById(s.next).station;
    else if (!s.ende) { const letzte = [...REIHE].reverse().find(q => s.quests[q.id] !== "offen"); st = letzte ? letzte.station : STATIONEN[0].id; }
    return STATIONEN.findIndex(x => x.id === st);
  }

  // Der Quest Master hat etwas zurückgenommen: Die Fee sagt es Dennis. Packs, Items und Nebel springen still mit zurück.
  function zurueckgenommen(prev, next, weg) {
    if (szene && weg.e.some(e => e.id === szene.id)) szene.still();
    const zeilen = [];
    weg.q.forEach(q => zeilen.push([questIcon(q, "offen", false), `Ergebnis von <b>${esc(q.name)}</b>.`
      + (q.id === next.next ? " Trag es neu ein." : next.quests[q.id] === "laeuft" ? " Die Quest läuft wieder." : "")]));
    weg.g.forEach(q => zeilen.push([questIcon(q, "bestanden", false), `Glanzsieg bei <b>${esc(q.name)}</b>. Es bleibt ein Sieg.`]));
    weg.d.forEach(k => zeilen.push([useSvg("z-triforce"), `Duell ${esc(k)} ist wieder offen. Trag es neu ein.`]));
    weg.s.forEach(q => q.schritte.filter(sx => prev.schritte[q.id][sx.id] && !next.schritte[q.id][sx.id])
      .forEach(sx => zeilen.push([questIcon(q, "laeuft", false), `${esc(q.name)}: „${esc(sx.name)}“.`])));
    weg.e.forEach(e => { const it = itemById(e.item); if (it) zeilen.push([`<span style="color:${it.farbe}">${useSvg(it.symbol)}</span>`, `Einsatz von <b>${esc(it.name)}</b>.`
      + (it.dieb && (Number(e.raub) > 0 || e.alles) ? ` Was ${esc(it.dieb.name)} stahl, ist zurück.` : "")]); });
    weg.b.forEach(b => zeilen.push([cardSvg(), b.ziffer ? `Kauf von Ziffer ${esc(b.ziffer)}.` : `„${esc(b.grund || "Buchung")}“.`]));
    const mehr = zeilen.length > 4 ? zeilen.length - 3 : 0;
    const lines = zeilen.slice(0, mehr ? 3 : 4).map(([ic, t]) => `<li><span class="ri">${ic}</span><span>${t}</span></li>`).join("")
      + (mehr ? `<li><span class="ri"></span><span>und ${mehr} weitere Einträge</span></li>` : "");
    melody("minus");
    showOverlay({ head: `<span class="ri-big fee"><img src="assets/fee.png" alt=""></span><p class="big">ZURÜCKGENOMMEN</p><p class="sub">vom Quest Master</p>`, lines, next: "" });
    renderHud(); renderQuests();
    return true;
  }

  function explainPacks() {
    const s = state, offen = s.geoeffnet || 0, bund = Math.max(0, s.max - s.packs - offen);
    const oeffnen = s.packs > 0 ? `<button type="button" class="qc-eintrag win kauf" data-oeffnen>PACK ÖFFNEN</button>` : "";
    showOverlay({
      head: `<span class="ri-big">${cardSvg()}</span><p class="big">${s.packs} ${s.packs === 1 ? "PACK" : "PACKS"}</p><p class="sub">geschlossen</p>`,
      lines: `<li><span class="ri">${cardSvg()}</span><span>${s.packs} geschlossen</span>${oeffnen}</li>`
        + (offen ? `<li><span class="ri">${cardSvg("offen")}</span><span>${offen} geöffnet</span></li>` : "")
        + (s.karten ? `<li class="minus"><span class="ri">${cardSvg("offen")}</span><span>${s.karten} ${s.karten === 1 ? "Karte" : "Karten"} an den Bund</span></li>` : "")
        + `<li><span class="ri">${cardSvg("empty")}</span><span>${bund} beim Bund</span></li>`
        + `<li class="dim"><span class="ri"></span><span>Ohne geschlossene Packs zahlst du mit Karten, blind gezogen aus deinen glänzenden und seltenen.</span></li>`,
      next: ""
    });
  }

  function explainCode() {
    const s = state;
    const lines = C.code.map((_, i) => {
      const v = s.ziffern[i];
      const q = REIHE.find(x => x.win && x.win.ziffer === i + 1);
      const wo = q ? esc(q.name) : "?";
      const offen = !q || !aufgedeckt(q.id) ? "im Nebel"
        : s.quests[q.id] === "verloren" ? "verloren, am Tor zu holen" : `jetzt: ${wo}`;
      // Nach der letzten Quest tauscht Dennis fehlende Ziffern selbst gegen Packs
      const kauf = v == null && s.ende ? (E.zahlkraft(s) >= C.ziffer_preis
        ? `<button type="button" class="qc-eintrag win kauf" data-kauf="${i + 1}">KAUFEN · ${C.ziffer_preis} ${packsWort(C.ziffer_preis).toUpperCase()}</button>` : `<small class="kauf-fehlt">zu wenig Packs</small>`) : "";
      return `<li class="${v == null ? "" : "plus"}"><span class="ri"><span class="tumbler${v == null ? "" : " known"}" style="--hud-h:30px">${v == null ? "?" : v}</span></span><span>${v == null ? (s.ende ? "fehlt" : offen) : s.gekauft[i] ? { busse: "durch Bußprüfung", segen: "durch Rikes Segen" }[s.zifferWeg[i]] || "gekauft" : wo}</span>${kauf}</li>`;
    }).join("");
    // Am Ende: den Abspann noch einmal ansehen (zum Beispiel abends in München)
    const nochmal = spielEnde() ? `<li><span class="ri">${useSvg("z-triforce")}</span><span>Deine Legende</span><button type="button" class="qc-eintrag win kauf" data-abspann>ABSPANN ▶</button></li>` : "";
    showOverlay({
      head: `<span class="ri-big lock">${useSvg("i-lock")}</span><p class="big">CODE</p>`,
      lines: lines + nochmal,
      next: ""
    });
  }

  /* ---------- Navigation: drei Seiten, Z und R drehen weiter ---------- */
  // Seit 30.09. ohne 3D (ließ das Galaxy S24 hängen, Teile blieben schwarz): Die alte Seite gleitet hinaus, die neue von
  // der anderen Seite herein, in Stufen wie vorher. Nur verschieben und abdunkeln, das rechnet die Grafik allein.
  // Kein Stauchen: Bei fast null Breite malt Chrome Ebenen auf das Zehnfache aufgebläht.
  function setActiveFace() {
    document.querySelectorAll(".face").forEach(f => {
      const on = +f.dataset.page === page;
      f.classList.toggle("active", on);
      f.inert = !on;
      f.setAttribute("aria-hidden", String(!on));
    });
  }

  function goTo(target, dir) {
    if (target === page) return;
    if (!dir) dir = (target - page + 3) % 3 === 1 ? 1 : -1;
    const face = n => document.querySelector(`.face[data-page="${n}"]`);
    const alt = face(page), neu = face(target);
    // Eine laufende Drehung (schnelles Tippen) sofort beenden, dann die neue starten
    drehung.forEach(a => a.cancel()); drehung = [];
    document.querySelectorAll(".face.geht").forEach(f => f.classList.remove("geht"));
    $("#game").classList.add("dreht");
    page = target;
    setActiveFace();
    if (!STILL.matches && alt.animate) {
      alt.classList.add("geht");
      const art = { duration: 430, easing: "steps(9, end)", fill: "both" }, weit = dir * 115;
      drehung = [
        alt.animate([{ transform: "translateX(0)", opacity: 1 }, { transform: `translateX(${-weit}%)`, opacity: .3 }], art),
        neu.animate([{ transform: `translateX(${weit}%)`, opacity: .3 }, { transform: "translateX(0)", opacity: 1 }], art)
      ];
    }
    if (coachZu) coachZu();                       // R im Rundgang angetippt: Hinweise zu, weiter geht es auf der neuen Seite
    if (page !== 0) schliesseStationstafel();
    tone("move");
    clearTimeout(flatTimer);
    flatTimer = setTimeout(() => {
      drehung.forEach(a => a.cancel()); drehung = [];
      alt.classList.remove("geht");
      $("#game").classList.remove("dreht");
      if (page === 1) { const row = document.querySelector(".q-row.is-selected"); if (row) scrollIntoList(row); if (rollenNachher) karteRollen(); }
      if (page === 2 && $("#overlay").hidden) { if (!onboarded()) onboarding(); else funde(); }
      if (page === 0) { spieleLauf(); if (!laufFrame) kartenHinweis(); }
      ersteQuestPruefen();
    }, 470);
  }

  /* ---------- Onboarding: erster Besuch der Ausrüstung ---------- */
  // Mit Startitem zeigt das Fundfenster, wie es sich entpuppt, danach tritt es in seinem Feld aus dem Schatten.
  // Seit 01.10. gibt es keins: Am Freitag ist der Beutel leer, die Fee kündigt an, dass sie am Morgen etwas bringt.
  // Danach kurze Hinweise der Fee.
  let obLaeuft = false;
  function onboarding() {
    if (obLaeuft) return;
    obLaeuft = true;
    const id = START[0], x = id && itemById(id);
    const fertig = () => {
      beutelGezeigt = true; obLaeuft = false;
      obMerken(OB_KEY);
      funde();                                   // erster Besuch: alles, was da ist, gilt als gesehen
      if (x) aufleuchten([id]);
      const leer = !x && !C.items.some(it => state.items[it.id] !== "nicht");
      setTimeout(() => coach([
        [$("#slotsGear").parentElement, leer ? "Noch ist dein Beutel leer. Morgen früh bringe ich dir etwas!" : "Hier landet, was du dir erspielst. Schatten zeigen, was noch fehlt."],
        [$(".equip-body"), "Vor jedem Spiel: Tipp an, was du mitnimmst."],
        ...(karteGesehen || spaeter() ? [] : [[$(".shoulder-right"), "Tipp auf R. Weiter zur Karte!"]])
      ]), STILL.matches || !x ? 0 : 1100);
    };
    if (!x) return fertig();
    melody("pruefung");
    showOverlay({
      // 30.09. (Wunsch des Nutzers): nur Titel und ein Satz, ohne den Namen der Tarnung
      head: `<span class="medal-stage won" style="--m:${x.farbe}"><span class="medal">${useSvg(x.tarnSymbol || x.symbol)}</span></span><p class="big">ERSTES ITEM GEFUNDEN</p>`,
      lines: `<li class="plus reveal"><span class="ri" style="color:${x.farbe}">${useSvg(x.symbol)}</span><span>${esc(x.fund || x.name)}</span></li>`,
      next: "", gross: true
    }, fertig);
  }
  /* ---------- Onboarding: erster Besuch der Karte ---------- */
  // Zwei Hinweise der Fee, einmal pro Handy und nur am Anfang des Spiels (wie das Onboarding oben)
  const KARTE_KEY = "dq-karte-v1" + (PROBE ? "-probe" : "");
  let karteGesehen = obGemerkt(KARTE_KEY);
  function kartenHinweis() {
    if (karteGesehen || spaeter() || page !== 0 || !$("#overlay").hidden || !$("#prolog").hidden || !$("#coach").hidden) return;
    karteGesehen = true;
    obMerken(KARTE_KEY);
    const hier = document.querySelector(`.mark[data-station="${STATIONEN[kartenHier ?? hierIndex()].id}"]`);
    coach([
      [hier, "Hier stehst du. Tipp auf eine Station, dann siehst du, was dort wartet."],
      ...(WEG ? [[$("#mapLegend"), "Höhe und Weg bis zum Gipfel. Der Quest Master schickt dich von Station zu Station."]] : []),
      [$(".shoulder-right"), "Mit R zurück zu deinen Quests. Dort wartet bald etwas auf dich!"]
    ]);
  }

  /* ---------- Erste Quest: Spielbeginn blanko (30.09., Wunsch des Nutzers) ----------
     Beim ersten PRESS START ist das Menü leer, auch die erste Quest liegt im Nebel, selbst wenn der Quest Master sie schon
     freigegeben hat (Freigabe, 30.09.). Erst wenn der Rundgang durch ist (Quests, Ausrüstung, Karte, zurück zu Quests),
     taucht sie nach einer kurzen Pause auf: eigener Moment, dann tritt sie aus dem Nebel. Ist sie dann noch nicht
     freigegeben, endet der leere Anfang still, und die Freigabe des Quest Masters bringt sie wie sonst auch.
     Prolog übersprungen: gleich danach. Bleibt Dennis irgendwo hängen: spätestens 90 s nach dem Prolog.
     Einmal pro Handy (lädt er zwischendurch neu, kommt sie nach PRESS START). Entscheidet der Quest Master schon etwas, ist
     der Spuk vorbei. Mit ?direkt nie (Tests und Laptop). */
  const ERSTE_KEY = "dq-erste-quest-v1" + (PROBE ? "-probe" : "");
  let ersteSofort = false, ersteTimer = null, ersteNotfall = null;
  const ersteOffen = () => !DEMO && !spaeter() && !obGemerkt(ERSTE_KEY) && obGemerkt(PROLOG_KEY) && !!state && !state.ende;
  function blankoStart(sofort) {
    if (spaeter() || !state || state.ende) return;
    blanko = true; ersteSofort = sofort; followNext = true;
    render();
    if (sofort) ersteQuestPruefen();
  }
  const frei = () => page === 1 && intro.hidden && $("#overlay").hidden && $("#coach").hidden && $("#prolog").hidden
    && $("#schwur").hidden && $("#logbuch").hidden && $("#fluchSzene").hidden && $("#morgen").hidden;
  function ersteQuestPruefen() {
    if (!blanko || ersteTimer) return;
    if (spaeter() || !state || state.ende) { blanko = false; render(); return; }
    if (!ersteSofort && !(beutelGezeigt && karteGesehen)) return;
    // Erst wenn Dennis 2 s ruhig auf QUESTS ist (nichts offen, keine Drehung), dann taucht sie auf
    let ruhig = 0;
    const warten = () => { ersteTimer = setTimeout(() => {
      ersteTimer = null;
      if (!blanko) return;
      ruhig = frei() && !$("#game").classList.contains("dreht") ? ruhig + 250 : 0;
      if (ruhig < (STILL.matches ? 500 : 2000)) return warten();
      if (state.next) return ersteQuestZeigen();
      blanko = false; obMerken(ERSTE_KEY); clearTimeout(ersteNotfall); render();   // noch nicht freigegeben: „Die Reise beginnt bald“
    }, 250); };
    warten();
  }
  function ersteQuestZeigen() {
    blanko = false; clearTimeout(ersteNotfall);
    obMerken(ERSTE_KEY);
    const q = questById(state.next);
    revealPending = q.id;
    render();
    melody("pruefung");
    showOverlay({
      head: `<span class="medal-stage won" style="--m:${q.farbe || "#c9c3a2"}">${questIcon(q, "offen", false)}</span><p class="big">DEINE ERSTE QUEST</p><p class="sub">${esc(q.name)}</p>`,
      lines: `<li><span class="ri"></span><span>${esc(q.text)}</span></li>`,
      next: "", gross: true
    }, showNextQuest);
  }

  /* ---------- Prolog: einmal pro Handy nach dem ersten PRESS START (08-erlebnis-plan.md, 3.2) ---------- */
  // Rikes Fee stellt sich vor, heißt Dennis willkommen und erklärt in sechs Tafeln, worum es geht, danach zeigt sie
  // kurz das Menü. Tippen blättert, ÜBERSPRINGEN beendet. Nur am Anfang des Spiels (siehe Onboarding oben).
  const PROLOG_KEY = "dq-prolog-v2" + (PROBE ? "-probe" : "");   // v2 (28.09.): sechs Tafeln, wer die alten vier kennt, sieht sie neu
  const prolog = (() => {
    const el = $("#prolog"), text = $("#prologText"), bild = $("#prologBild"), dots = $("#prologDots");
    let gesehen = obGemerkt(PROLOG_KEY), i = -1, tippen = null;
    const karten = (n, cls = "") => Array.from({ length: n }, () => cardSvg(cls)).join("");
    const TAFELN = () => {
      const max = C.waehrung.max, halb = Math.round(max / 2);
      const pruefungen = C.quests.filter(q => q.typ === "kern").length;
      return [
        { bild: "fee", text: "Hey, wach auf, Dennis! Ich bin die Fee. Rike hat mich zu dir geschickt." },
        // Der Titel vom Startbild (29.09., statt „Mini-JGA“)
        { bild: `<span class="pb-titel"><small>Willkommen in</small><b>The Legend of Dennis<span aria-hidden="true"></span></b></span>`, ton: "pruefung",
          text: "Willkommen in deiner eigenen Legende! Ab jetzt weiche ich dir nicht mehr von der Seite." },
        // Die Reise: vom Zug bis zum Gipfel, jede Prüfung noch im Nebel
        { bild: `<span class="pb-reise"><span class="pb-ort">${useSvg("i-train")}</span>${Array.from({ length: pruefungen }, (_, k) =>
            `<span class="medal covered" style="--k:${k + 1}"><b>?</b></span>`).join("")}<span class="pb-ort gipfel" style="--k:${pruefungen + 1}">${useSvg("i-mountain")}</span></span>`,
          text: "Das wird eine Reise, vom Zug bis auf den Gipfel. Und unterwegs wirst du geprüft werden." },
        // Die 20 Packs hütet der Bund, das Kästchen am Ende bleibt ein Geheimnis (29.09.: darin liegt eine Überraschung)
        { bild: `<span class="pb-cards${max > 10 ? " two" : ""}" style="--n:${max > 10 ? Math.ceil(max / 2) : max}">${karten(max)}</span>`,
          text: `Der Bund hütet ${max} Packs. Hauptquests bringen dir Packs und Ziffern, Sidequests Fähigkeiten.` },
        { bild: `<span class="pb-chest">${useSvg("i-chest")}${useSvg("i-lock", "pb-lock")}</span><span class="pb-tumblers">${C.code.map(() => `<span class="tumbler">?</span>`).join("")}</span>`,
          text: "Die vier Ziffern öffnen am Ende ein verschlossenes Kästchen. Was darin liegt, verrät dir niemand. Ohne alle vier kein Gipfel." },
        { bild: `<span class="pb-split"><span class="pb-cards mine" style="--n:${Math.min(halb, 10)}">${karten(halb)}</span><small>deins</small></span><span class="pb-split"><span class="pb-cards" style="--n:${Math.min(max - halb, 10)}">${karten(max - halb, "empty")}</span><small>beim Bund</small></span>`,
          text: `Verlierst du, holt sich der Bund Packs zurück. Deine darfst du jederzeit öffnen.` }
      ];
    };
    let tafeln = [];

    // Text erscheint Buchstabe für Buchstabe wie in der N64-Textbox. Erster Tipp zeigt alles, zweiter blättert.
    function schreibe(t) {
      clearInterval(tippen);
      if (STILL.matches) { text.textContent = t; tippen = null; return; }
      let n = 0;
      text.textContent = "";
      tippen = setInterval(() => { n += 2; text.textContent = t.slice(0, n); if (n >= t.length) { clearInterval(tippen); tippen = null; } }, 28);
    }
    function zeige() {
      const t = tafeln[i];
      el.dataset.tafel = i === 0 ? "fee" : "bild";
      bild.innerHTML = i === 0 ? "" : t.bild;
      bild.style.animation = "none"; void bild.offsetWidth; bild.style.animation = "";
      dots.innerHTML = tafeln.map((_, k) => `<i class="${k === i ? "on" : k < i ? "done" : ""}"></i>`).join("");
      schreibe(t.text);
      if (i === 0) melody("zauber"); else if (t.ton) melody(t.ton); else tone("move");
    }
    function weiter() {
      if (tippen) { clearInterval(tippen); tippen = null; text.textContent = tafeln[i].text; return; }
      if (++i >= tafeln.length) return ende(false);
      zeige();
    }
    function ende(uebersprungen) {
      clearInterval(tippen); tippen = null;
      el.hidden = true;
      gesehen = true;
      obMerken(PROLOG_KEY);
      if (uebersprungen === "still") return;
      // Übersprungen: kein Rundgang, die erste Quest kommt gleich. Sonst nach dem Rundgang, spätestens nach 90 s.
      if (uebersprungen) { ersteSofort = true; ersteQuestPruefen(); return tone("move"); }
      clearTimeout(ersteNotfall);
      ersteNotfall = setTimeout(() => { ersteSofort = true; ersteQuestPruefen(); }, 90000);
      tone("confirm");
      // Kurzer Rundgang durch das Menü, gesprochen von der Fee
      setTimeout(() => coach([
        [$("#hudPacks"), "Deine geschlossenen Packs. Tipp drauf, um eins zu öffnen."],
        [$("#hudCode"), "Der Code des Kästchens. Hier rastet jede Ziffer ein."],
        [$("#questCard"), "Hier erscheint, was dran ist und was auf dem Spiel steht. Und hier trägst du dein Ergebnis ein."],
        // Zuletzt R (30.09.): Der Rundgang geht auf der nächsten Seite weiter, das muss Dennis wissen
        [$(".shoulder-right"), "Blättern mit Z und R oder Wischen. Tipp jetzt auf R!"]
      ]), 250);
    }
    function start() {
      if (gesehen || spaeter()) return false;
      tafeln = TAFELN(); i = -1;
      el.hidden = false;
      weiter();
      return true;
    }
    // Neues Handy ohne gespeicherten Stand: Kommt der echte Stand erst nach PRESS START und ist der Tag schon weiter,
    // verschwindet der Prolog still
    function pruefen() { if (!el.hidden && spaeter()) ende("still"); }
    el.addEventListener("click", e => { if (!e.target.closest(".prolog-skip")) weiter(); });
    $("#prologSkip").addEventListener("click", e => { e.stopPropagation(); ende(true); });
    function vergessen() { gesehen = false; try { localStorage.removeItem(PROLOG_KEY); } catch (e) {} }
    return { start, weiter, ende, pruefen, vergessen };
  })();

  // Hinweise der Fee, einer nach dem anderen. Tippen irgendwo zeigt den nächsten. Zeigt ein Hinweis auf Z oder R,
  // lässt sich die Taste selbst antippen: Das blättert weiter und schließt die Hinweise (goTo ruft coachZu).
  let coachZu = null;
  function coach(schritte) {
    const bubble = $("#coach"), ring = $("#coachRing");
    let i = -1, ziel = null;
    const weiter = () => {
      if (ziel) ziel.classList.remove("coach-focus");
      if (++i >= schritte.length) { bubble.hidden = true; ring.hidden = true; bubble.onclick = null; coachZu = null; ersteQuestPruefen(); return; }
      const [el, text] = schritte[i];
      ziel = el; el.classList.add("coach-focus");
      const b = bubble.querySelector(".coach-bubble");
      b.querySelector(".coach-text").textContent = text;
      bubble.hidden = false;
      const box = bubble.getBoundingClientRect(), r = el.getBoundingClientRect(), unten = r.top - box.top < box.height / 2;
      const w = b.offsetWidth || 240;
      // Nicht in die Notch oder die Dynamic Island: Rand wie das Spielfeld (Safe Area)
      const rand = getComputedStyle($("#game")), links = Math.max(12, parseFloat(rand.paddingLeft) || 0), rechts = Math.max(12, parseFloat(rand.paddingRight) || 0);
      b.style.left = Math.max(links, Math.min(box.width - w - rechts, r.left - box.left + r.width / 2 - w / 2)) + "px";
      b.style.top = unten ? Math.min(box.height - b.offsetHeight - 8, r.bottom - box.top + 10) + "px" : "";
      b.style.bottom = unten ? "" : Math.min(box.height - b.offsetHeight - 8, box.bottom - r.top + 10) + "px";
      if (el.classList.contains("equip-body")) { b.style.top = ""; b.style.bottom = "12px"; }
      // Leuchtring um das Ziel (eigene Ebene, pulsiert nur in der Deckkraft)
      Object.assign(ring.style, { left: r.left - box.left - 4 + "px", top: r.top - box.top - 4 + "px", width: r.width + 8 + "px", height: r.height + 8 + "px" });
      ring.hidden = false;
      b.style.animation = "none"; void b.offsetWidth; b.style.animation = "";
      tone("move");
    };
    bubble.onclick = weiter;
    coachZu = () => { i = schritte.length; weiter(); };
    weiter();
  }

  const turn = d => goTo((page + d + 3) % 3, d);

  function showNextQuest() {
    followNext = true; followHier = true;
    renderQuests(); renderMap();
    const warte = page !== 1 ? 480 : 0;
    if (page !== 1) goTo(1);
    else { const row = document.querySelector(".q-row.is-selected"); if (row) scrollIntoList(row); }
    if (revealPending) setTimeout(reveal, warte + 150);
  }

  // Die nächste Quest tritt aus dem Nebel: Zeile und Karte klären sich, HUD zeigt den Namen
  function reveal() {
    const id = revealPending;
    if (!id) return;
    revealPending = null;
    // Inzwischen zurückgenommen (die Quest ist nicht mehr dran): nichts aufdecken
    if (id !== state.next) { renderHud(); renderQuests(); return; }
    const row = document.querySelector(`.q-row[data-id="${id}"]`), card = $("#questCard");
    if (row) { scrollIntoList(row); row.classList.remove("fogged"); row.classList.add("revealing"); }
    if (sel[1] === id) { card.classList.remove("fogged"); card.classList.add("revealing"); }
    renderHud();
    melody("nebel");
    setTimeout(() => { row?.classList.remove("revealing"); card.classList.remove("revealing"); }, 1400);
  }

  document.querySelectorAll("[data-nav]").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); turn(b.dataset.nav === "next" ? 1 : -1); }));
  $("#hudNext").addEventListener("click", () => { if (state && state.ende) { tone("confirm"); explainCode(); } else showNextQuest(); });   // am Ende: zum Kästchen
  $("#hudPacks").addEventListener("click", explainPacks);
  $("#hudCode").addEventListener("click", explainCode);
  $("#overlay").addEventListener("click", e => {
    const k = e.target.closest("[data-kauf]"), ab = e.target.closest("[data-abspann]"), o = e.target.closest("[data-oeffnen]");
    closeOverlay();
    if (k) schwurZiffer(+k.dataset.kauf);
    if (o) schwurOeffnen();
    if (ab) abspann.start(true);
  });

  // Wischen: nur waagerecht zählt, senkrecht scrollt die Liste
  let touch = null, swiped = false;
  const stageEl = $(".stage");
  stageEl.addEventListener("pointerdown", e => { touch = { x: e.clientX, y: e.clientY }; swiped = false; });
  stageEl.addEventListener("pointercancel", () => { touch = null; });
  stageEl.addEventListener("pointerup", e => {
    if (!touch) return;
    const dx = e.clientX - touch.x, dy = e.clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) { swiped = true; turn(dx < 0 ? 1 : -1); }
  });
  stageEl.addEventListener("click", e => { if (swiped) { e.stopPropagation(); e.preventDefault(); swiped = false; } }, true);

  // Tastatur (Laptop): Z/R Seite, Pfeile Auswahl, Enter/Esc schließt das Fenster
  window.addEventListener("keydown", e => {
    const k = e.key.toLowerCase();
    // Der Schattendieb im Tagebuch: Enter blättert, Esc lässt ihn gleich fliehen
    if (geistRuf.offen()) { if (["enter", " ", "a"].includes(k)) { e.preventDefault(); geistRuf.weiter(); } else if (k === "escape") geistRuf.ende(); return; }
    if (!$("#introScreen").hidden || !$("#logbuch").hidden) return;
    if (abspann.offen()) { if (["enter", " ", "escape"].includes(k)) { e.preventDefault(); if ($("#abspann").dataset.phase === "ende") abspann.schliessen(); else abspann.weiter(); } return; }
    if (!$("#schwur").hidden) { if (k === "escape") schwur.schliessen(); return; }
    if (!$("#prolog").hidden) { if (["enter", " ", "a"].includes(k)) { e.preventDefault(); prolog.weiter(); } else if (k === "escape") prolog.ende(true); return; }
    if (!$("#overlay").hidden) { if (["enter", " ", "escape", "a"].includes(k)) { e.preventDefault(); closeOverlay(); } return; }
    if (page === 0 && k === "escape") return schliesseStationstafel();
    if (k === "z" || k === "q") return turn(-1);
    if (k === "r" || k === "e") return turn(1);
    if (page === 0 && k === "enter" && !e.target.closest("button")) { e.preventDefault(); return tippeStation(sel[0]); }
    const step = { arrowdown: 1, arrowright: 1, arrowup: -1, arrowleft: -1 }[k];
    if (!step) return;
    e.preventDefault();
    if (page === 1) { const ids = [...document.querySelectorAll(".kammer-liste > li:not([hidden]) > .q-row")].map(b => b.dataset.id); followNext = false; selectQuest(ids[(ids.indexOf(sel[1]) + step + ids.length) % ids.length]); }
    if (page === 0) { const ids = STATIONEN.map(s => s.id); selectStation(ids[(ids.indexOf(sel[0]) + step + ids.length) % ids.length]); }
    if (page === 2) { const ids = [...document.querySelectorAll(".slot")].map(b => b.dataset.id); selectItem(ids[(ids.indexOf(sel[2]) + step + ids.length) % ids.length]); }
  });

  /* ---------- Der Morgen: Zwischensequenz am Samstagmorgen (01.10., Wunsch des Nutzers) ----------
     Am Freitag hat Dennis noch kein Item. Am Samstagmorgen geht die Sonne auf, Rikes Fee bringt den Beutel, den sie in der
     Nacht bei ihm zu Hause geholt hat, Buu Huu will ihn stehlen und zerrt daran, ein Lichtblitz der Fee jagt ihn davon. Dann
     springen die vier Basis-Items heraus (Stufe 1), zum Schluss „DAS ABENTEUER BEGINNT“. Der Quest Master stößt sie an
     (morgen im Spiel), sonst kommt sie mit der Freigabe der ersten Quest am Samstag, immer vor deren Fenster.
     Tippen zeigt erst den ganzen Satz, dann den nächsten Schritt. ÜBERSPRINGEN springt zu den Items, dort beendet es.
     Einmal pro Handy und Morgen (gemerkt wird der Zeitstempel). Mit ?direkt nur zusammen mit ?morgen (Tests und Laptop). */
  const MORGEN_KEY = "dq-morgen-v1" + (PROBE ? "-probe" : "");
  const MORGEN_SZENE = !!C.morgen && (!params.has("direkt") || params.has("morgen"));
  let morgenGesehen = 0;
  try { if (!DEMO) morgenGesehen = Number(localStorage.getItem(MORGEN_KEY)) || 0; } catch (e) {}
  const morgenFaellig = (prev, next) => MORGEN_SZENE && !!next.morgen && !(prev && prev.morgen) && next.morgen !== morgenGesehen;
  const morgen = (() => {
    const el = $("#morgen"), text = $("#mgText"), wer = $("#mgWer"), items = $("#mgItems");
    let i = -1, tippen = null, timer = [], danach = null, schritte = [];
    const warte = (ms, f) => timer.push(setTimeout(f, ms));
    const SCHRITTE = () => {
      const s = C.morgen.szenen;
      return [
        { phase: "nacht", text: s.nacht, auto: 2400 },
        { phase: "morgen", wer: "fee", text: s.fee[0], ton: "morgen" },
        { phase: "morgen", wer: "fee", text: s.fee[1] },
        { phase: "geist", wer: "geist", text: s.geist[0], ton: "kichern" },
        { phase: "zerrt", wer: "geist", text: s.geist[1], ton: "error" },
        { phase: "abwehr", wer: "fee", text: s.abwehr, ton: "zauber" },
        { phase: "flucht", wer: "geist", text: s.flucht, ton: "minus", auto: 1800 },
        { phase: "beutel", wer: "fee", text: s.beutel, ton: "side" },
        { phase: "items", wer: "fee", text: s.stufe },
        { phase: "titel", text: "", ton: "pruefung", auto: 3200 }
      ];
    };
    const WER = { fee: "RIKES FEE", geist: "BUU HUU · IM DIENST DES BUNDES" };
    function schreibe(t, fertig) {
      clearInterval(tippen); tippen = null;
      if (STILL.matches || !t) { text.textContent = t; if (fertig) fertig(); return; }
      let n = 0;
      text.textContent = "";
      tippen = setInterval(() => { n += 2; text.textContent = t.slice(0, n); if (n >= t.length) { clearInterval(tippen); tippen = null; if (fertig) fertig(); } }, 28);
    }
    function zeige() {
      const sx = schritte[i];
      timer.forEach(clearTimeout); timer = [];
      el.dataset.phase = sx.phase;
      el.dataset.wer = sx.wer || "";
      wer.textContent = WER[sx.wer] || "";
      if (sx.ton === "error") tone("error"); else if (sx.ton) melody(sx.ton); else tone("move");
      if (sx.phase === "items") {
        // Ein Item nach dem anderen, jedes mit einem kleinen Klang, zum Schluss die Fanfare
        [...items.children].forEach((x, k) => warte(250 + k * 420, () => { x.classList.add("da"); tone("confirm"); }));
        warte(250 + items.children.length * 420, () => melody("fund"));
      }
      schreibe(sx.text, sx.auto ? () => warte(sx.auto, weiter) : null);
    }
    function weiter() {
      if (el.hidden) return;
      if (tippen) { clearInterval(tippen); tippen = null; text.textContent = schritte[i].text; if (schritte[i].auto) warte(schritte[i].auto, weiter); return; }
      if (++i >= schritte.length) return ende();
      zeige();
    }
    // Überspringen: das Drama weg, die Items zeigt sie trotzdem. Bei den Items oder danach ist Schluss.
    function ueberspringen() {
      const k = schritte.findIndex(sx => sx.phase === "items");
      if (i >= k) return ende();
      clearInterval(tippen); tippen = null;
      i = k; zeige();
    }
    function ende(still) {
      if (el.hidden) return;
      clearInterval(tippen); tippen = null; timer.forEach(clearTimeout); timer = [];
      el.hidden = true;
      const f = danach; danach = null;
      if (f && still !== true) f();
    }
    function start(zeit, dann) {
      morgenGesehen = zeit;
      try { if (!DEMO) localStorage.setItem(MORGEN_KEY, String(zeit)); } catch (e) {}
      if (!C.morgen) return dann && dann();
      $("#coach").hidden = true;
      schritte = SCHRITTE(); i = -1; danach = dann || null;
      const ids = C.morgen.items;
      items.innerHTML = ids.map((id, k) => {
        const x = itemById(id), n = x.feld ? feldItems(x.feld).length : 1;
        return `<span class="mg-item" style="--c:${x.farbe};--k:${k}"><span class="mg-well">${useSvg(x.symbol)}</span><b>${esc(x.name)}</b><small>STUFE 1 VON ${n}</small></span>`;
      }).join("");
      el.querySelector(".mg-titel b").textContent = C.morgen.szenen.titel;
      el.dataset.phase = "nacht"; text.textContent = ""; wer.textContent = "";
      el.hidden = false;
      // Die Figuren stehen erst draußen, dann geht es los (sonst sprängen sie gleich an ihren Platz)
      requestAnimationFrame(() => requestAnimationFrame(weiter));
    }
    el.addEventListener("click", e => { if (!e.target.closest("#mgSkip")) weiter(); });
    $("#mgSkip").addEventListener("click", e => { e.stopPropagation(); tone("move"); ueberspringen(); });
    function vergessen() { morgenGesehen = 0; try { localStorage.removeItem(MORGEN_KEY); } catch (e) {} }
    return { start, weiter, ende, vergessen, offen: () => !el.hidden };
  })();

  /* ---------- Schattendieb im Tagebuch: Rikes Antwort wird zur Quest (30.09., Wunsch des Nutzers) ----------
     Rike hat auf Frage 1 verraten, dass Dennis keinen Faden durchs Nadelöhr bekommt. Ist ihre Antwort vorbei, huscht der
     Schattendieb des Bundes herein (das Gemeine macht der Bund, die Fee hilft nur) und macht daraus eine Quest: Beim vorletzten
     Satz erscheint das Medaillon von Rikes Rache, beim letzten verschwindet es im Nebel. Den Namen sagt er nicht. Sätze und Quest in
     config.js (logbuch.fragen[].geist), wann er kommt, entscheidet das Log-Buch (unten). Tippen blättert wie im Prolog. */
  const geistRuf = (() => {
    const el = $("#geistRuf"), text = $("#grText"), bild = $("#grBild");
    let saetze = [], quest = null, danach = null, i = -1, tippen = null, timer = null, bereit = false, geht = false;
    // Text erscheint Buchstabe für Buchstabe wie im Prolog. Erster Tipp zeigt alles, zweiter blättert.
    function schreibe(t) {
      clearInterval(tippen);
      if (STILL.matches) { text.textContent = t; tippen = null; return; }
      let n = 0;
      text.textContent = "";
      tippen = setInterval(() => { n += 2; text.textContent = t.slice(0, n); if (n >= t.length) { clearInterval(tippen); tippen = null; } }, 28);
    }
    function zeige() {
      const n = saetze.length, stufe = !quest || i < n - 2 ? "geist" : i === n - 2 ? "quest" : "nebel";
      if (stufe === "quest" && el.dataset.bild === "geist") {
        bild.innerHTML = `<span class="gr-medaillon" style="--m:${quest.farbe || "#c9c3a2"}"><span class="medal-stage won">${medalHtml(quest, "offen", false)}</span><span class="medal covered gr-nebel"><b>?</b></span></span>`;
        bild.style.animation = "none"; void bild.offsetWidth; bild.style.animation = "";
        melody("pruefung");
      } else if (stufe === "nebel" && el.dataset.bild === "quest") {
        bild.firstElementChild.classList.add("im-nebel");
        melody("nebel");
      } else if (i > 0) tone("move");
      el.dataset.bild = stufe;
      schreibe(saetze[i]);
    }
    function weiter() {
      if (!bereit || geht) return;
      if (tippen) { clearInterval(tippen); tippen = null; text.textContent = saetze[i]; return; }
      if (++i >= saetze.length) return ende();
      zeige();
    }
    // Er flieht, dann geht es im Tagebuch weiter
    function ende() {
      if (el.hidden || geht) return;
      geht = true;
      clearInterval(tippen); tippen = null; clearTimeout(timer);
      el.classList.add("geht");
      tone("move");
      timer = setTimeout(() => { const f = danach; schliessen(); if (f) f(); }, STILL.matches ? 0 : 450);
    }
    function schliessen() {
      clearInterval(tippen); tippen = null; clearTimeout(timer); timer = null;
      el.hidden = true; el.classList.remove("geht");
      bereit = false; geht = false; danach = null;
    }
    function zeigen(fee, dann) {
      schliessen();
      saetze = fee.saetze || []; quest = fee.quest ? questById(fee.quest) : null; danach = dann || null; i = -1;
      el.dataset.bild = "geist"; bild.innerHTML = ""; text.textContent = "";
      el.hidden = false;
      $("#grBox").focus({ preventScroll: true });
      melody("kichern");
      // Erst huscht er herein, dann spricht er. Tipps davor zählen nicht (etwa ein zweiter Tipp auf WEITER).
      timer = setTimeout(() => { bereit = true; weiter(); }, STILL.matches ? 0 : 650);
    }
    el.addEventListener("click", weiter);
    return { zeigen, weiter, ende, schliessen, offen: () => !el.hidden };
  })();

  /* ---------- Log-Buch: Dennis tippt, besiegelt, dann spricht Rike ---------- */
  const logbuch = (() => {
    const el = $("#logbuch"), fragen = C.logbuch.fragen;
    const quellen = {};             // nr → Blob-URL (vorab geladen) oder false (Datei fehlt noch)
    let nr = 1, spieler = null, laeuft = false, wiedergabe = 0, geistFrage = 0, geistTimer = null;

    // Alle Dateien beim Start vorab laden, damit ein Funkloch im Zug nicht stört
    function vorladen() {
      fragen.forEach((f, i) => {
        if (quellen[i + 1] !== undefined) return;
        quellen[i + 1] = null;
        fetch(f.audio).then(r => (r.ok ? r.blob() : Promise.reject(r.status)))
          .then(b => { quellen[i + 1] = b.size > 200 && /audio|octet/.test(b.type || "audio") ? URL.createObjectURL(b) : false; })
          .catch(() => { quellen[i + 1] = false; });
      });
    }
    const beantwortet = n => !!antworten[String(n)];
    const ersteOffene = () => { for (let i = 1; i <= fragen.length; i++) if (!beantwortet(i)) return i; return null; };

    function zeigen() {
      const fertig = nr > fragen.length;
      $("#lbStep").textContent = fertig ? "" : `${nr} / ${fragen.length}`;
      if (fertig) {
        $("#lbFrage").textContent = "Alle sieben besiegelt. Trag dein Ergebnis auf der Quest-Karte ein.";
        $("#lbForm").hidden = true; $("#lbSealed").hidden = true;
        return;
      }
      $("#lbFrage").textContent = fragen[nr - 1].frage;
      const a = antworten[String(nr)];
      $("#lbForm").hidden = !!a;
      $("#lbSealed").hidden = !a;
      if (a) {
        $("#lbAntwort").textContent = a.antwort;
        $("#lbNext").textContent = nr < fragen.length ? "WEITER" : "FERTIG";
        $("#lbWho").textContent = quellen[nr] === false ? "RIKE · FOLGT NOCH" : "RIKE";
      } else {
        $("#lbInput").value = "";
        $("#lbSeal").disabled = true;
      }
    }

    function spielen() {
      stoppen();
      const url = quellen[nr], n = nr, w = wiedergabe;
      el.classList.add("playing"); laeuft = true;
      // gehoert: Die Nachricht lief bis zum Ende, dann meldet sich kurz danach der Schattendieb (falls er zu der Antwort etwas sagt).
      // Eine gestoppte oder neu gestartete Wiedergabe meldet nichts mehr.
      const ende = gehoert => {
        if (w !== wiedergabe) return;
        laeuft = false; el.classList.remove("playing");
        if (gehoert) geistTimer = setTimeout(() => geistKommt(n), 600);
      };
      if (url) {
        spieler = new Audio(url);
        spieler.addEventListener("ended", () => ende(true));
        spieler.play().catch(() => { if (w !== wiedergabe) return; ende(false); $("#lbWho").textContent = "RIKE · TIPP AUF ▶"; });
      } else {
        // Platzhalter, solange Rikes Sprachnachricht fehlt (oder noch lädt)
        $("#lbWho").textContent = quellen[nr] === null ? "RIKE · LÄDT NOCH" : "RIKE · FOLGT NOCH";
        const ms = melody("stimme");
        setTimeout(() => ende(true), ms + 300);
      }
    }
    // Stoppt Rikes Stimme. Hört Dennis noch einmal hin, wartet auch der Schattendieb bis zum neuen Ende.
    function stoppen() { wiedergabe++; clearTimeout(geistTimer); if (spieler) { spieler.pause(); spieler = null; } laeuft = false; el.classList.remove("playing"); }

    // Der Schattendieb meldet sich nach Rikes Antwort (geist bei der Frage in config.js, 30.09.). Hat Dennis die Frage gerade
    // besiegelt (geistFrage), kommt er, wenn die Nachricht zu Ende ist, spätestens wenn er weiterblättert oder das Tagebuch schließt
    // (das geht danach weiter). Also einmal, und nach Tagebuch leeren oder Alles zurücksetzen wieder.
    function geistKommt(n, danach) {
      clearTimeout(geistTimer);
      if (geistFrage !== n || !beantwortet(n) || el.hidden) return danach && danach();
      geistFrage = 0;
      stoppen();
      geistRuf.zeigen(fragen[n - 1].geist, danach);
    }

    function oeffnen() {
      nr = ersteOffene() || fragen.length + 1;
      vorladen();
      el.hidden = false;
      zeigen();
      tone("confirm");
      passen();
    }
    function schliessen() { stoppen(); geistRuf.schliessen(); geistFrage = 0; el.hidden = true; el.classList.remove("schreibt"); renderQuests(); }

    // Tastatur auf dem Handy: das Fenster bleibt über der Tastatur
    function passen() {
      const vv = window.visualViewport;
      if (!vv || el.hidden) return;
      el.style.setProperty("--vv-top", vv.offsetTop + "px");
      el.style.setProperty("--vv-h", vv.height + "px");
    }
    window.visualViewport?.addEventListener("resize", passen);
    window.visualViewport?.addEventListener("scroll", passen);

    $("#lbInput").addEventListener("input", () => { $("#lbSeal").disabled = !$("#lbInput").value.trim(); });
    // Schreibmodus (30.09.): Solange die Tastatur offen ist, bleibt nur ein schmaler Streifen oben: Frage, Eingabe, Siegel.
    // Quer auf dem iPhone bleiben über der Tastatur kaum 130 px, das volle Fenster wäre dort gequetscht.
    // Beim Verlassen erst kurz warten, sonst springt BESIEGELN weg, bevor der Tipp darauf ankommt.
    let schreibTimer = null;
    $("#lbInput").addEventListener("focus", () => { clearTimeout(schreibTimer); el.classList.add("schreibt"); passen(); });
    $("#lbInput").addEventListener("blur", () => { clearTimeout(schreibTimer); schreibTimer = setTimeout(() => el.classList.remove("schreibt"), 250); });
    $("#lbForm").addEventListener("submit", e => {
      e.preventDefault();
      const text = $("#lbInput").value.trim();
      if (!text) return;
      $("#lbInput").blur();
      antworten = { ...antworten, [String(nr)]: { antwort: text, zeit: Date.now() } };
      lbStore.besiegeln(nr, text);
      geistFrage = fragen[nr - 1].geist ? nr : 0;
      melody("siegel");
      zeigen();
      el.classList.add("sealing");
      setTimeout(() => el.classList.remove("sealing"), 900);
      spielen();                      // direkt in der Tipp-Geste starten, sonst blockt iOS die Wiedergabe
    });
    $("#lbPlay").addEventListener("click", () => (laeuft ? stoppen() : spielen()));
    $("#lbNext").addEventListener("click", () => geistKommt(nr, () => { stoppen(); nr = ersteOffene() || fragen.length + 1; zeigen(); tone("move"); }));
    $("#lbClose").addEventListener("click", () => geistKommt(nr, schliessen));
    return { oeffnen, schliessen, vorladen };
  })();

  /* ---------- Siegel: Dennis besiegelt selbst (Ergebnis, Einsatz, Duell, Amulett, Ziffer) ---------- */
  // Das Fenster zeigt, was passiert. Das Siegel muss gedrückt gehalten werden, bis sich der Ring schließt: Ein versehentlicher
  // Tipp löst nichts aus. Danach läuft sofort der Moment, auch ohne Netz (der Eintrag wird nachgeschickt).
  // Der Quest Master kann jeden Eintrag im Admin zurücknehmen.
  const schwur = (() => {
    const el = $("#schwur"), siegel = $("#swSiegel"), DAUER = 900;
    let aktuell = null, timer = null, wahl = null;
    function oeffnen(o) {
      aktuell = o; wahl = o.wahlen ? o.wahlen[0].id : null;
      $("#swArt").textContent = o.art;
      $("#swWahl").innerHTML = o.wahlen && o.wahlen.length > 1
        ? o.wahlen.map(w => `<button type="button" class="sw-w${w.id === wahl ? " an" : ""}" data-w="${w.id}"${w.ton ? ` style="--ton:${{ magie: "#c9a4ff", lose: "#ff6b5e", win: "var(--gold)" }[w.ton] || w.ton}"` : ""}>${w.symbol || ""}${esc(w.name)}</button>`).join("") : "";
      zeigen();
      el.classList.remove("halten", "besiegelt");
      el.hidden = false;
      tone("confirm");
    }
    // Eine Wahl (zum Beispiel Schild oder Verloren) kann Untertitel, Ton, Folgen und Symbol ändern
    function zeigen() {
      const o = aktuell, w = (o.wahlen || []).find(x => x.id === wahl) || {};
      const sub = w.sub ?? o.sub, ton = w.ton ?? o.ton, folgen = w.folgen ?? o.folgen, icon = w.icon ?? o.icon;
      $("#swKopf").innerHTML = `<span class="sw-ic">${icon}</span><div><p class="tb-title">${esc(o.titel)}</p>${sub ? `<p class="sw-sub ${ton || ""}">${esc(sub)}</p>` : ""}</div>`;
      $("#swFolgen").innerHTML = (folgen || []).map(f => `<li>${f}</li>`).join("");
      el.dataset.ton = ton || "";
    }
    function schliessen() { abbrechen(); el.hidden = true; aktuell = null; }
    function start(e) {
      if (!aktuell || timer || el.classList.contains("besiegelt")) return;
      if (e) e.preventDefault();
      el.classList.add("halten"); tone("move");
      timer = setTimeout(fertig, STILL.matches ? DAUER / 2 : DAUER);
    }
    function abbrechen() { clearTimeout(timer); timer = null; el.classList.remove("halten"); }
    function fertig() {
      timer = null;
      const o = aktuell, w = wahl;
      el.classList.add("besiegelt");
      melody("siegel");
      setTimeout(() => { el.hidden = true; el.classList.remove("halten", "besiegelt"); aktuell = null; o.ausfuehren(w); }, 380);
    }
    // Ist der Anlass inzwischen weg (der Quest Master hat schon gebucht, das Item ist verbraucht), geht das Fenster still zu
    function pruefen() { if (aktuell && !timer && !el.classList.contains("besiegelt") && aktuell.gueltig && !aktuell.gueltig()) schliessen(); }
    siegel.addEventListener("pointerdown", start);
    ["pointerup", "pointerleave", "pointercancel"].forEach(t => siegel.addEventListener(t, () => { if (timer) abbrechen(); }));
    siegel.addEventListener("contextmenu", e => e.preventDefault());
    siegel.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) start(e); });
    siegel.addEventListener("keyup", e => { if ((e.key === "Enter" || e.key === " ") && timer) abbrechen(); });
    $("#swZurueck").addEventListener("click", () => { schliessen(); tone("move"); });
    $("#swWahl").addEventListener("click", e => {
      const b = e.target.closest("[data-w]");
      if (!b) return;
      wahl = b.dataset.w;
      document.querySelectorAll("#swWahl .sw-w").forEach(x => x.classList.toggle("an", x === b));
      zeigen();
      tone("move");
    });
    el.addEventListener("click", e => { if (e.target === el) { schliessen(); tone("move"); } });
    return { oeffnen, schliessen, pruefen };
  })();

  const eintrag = (schluessel, e) => einStore.setzen(schluessel, { ...e, zeit: Date.now() });
  const fxZeile = (lbl, cls, inhalt) => `<span class="fx-lbl ${cls}">${lbl}</span><span class="fx">${inhalt}</span>`;

  // status: "bestanden", "verloren" oder "glanz" (Glanzsieg: bestanden und besonders deutlich)
  function schwurErgebnis(qid, status) {
    const q = questById(qid), glanz = status === "glanz", won = status === "bestanden" || glanz;
    if (!(eintragbar(qid).ergebnis || []).includes(status)) return;
    const folgen = [fxZeile(won ? "SIEG" : "NIEDERLAGE", won ? "win" : "lose", fxChips(won ? q.win : q.lose, won))];
    if (glanz) folgen.push(fxZeile("GLANZSIEG", "win", fxChips(q.glanz, true)), `<span class="fx dim">Nur mit ${esc(q.glanz.bedingung)}.</span>`);
    const schild = !won && !q.showdown ? E.rettung(C, state, qid) : null;
    schwur.oeffnen({
      art: q.typ === "kern" ? "PRÜFUNG" : q.typ === "side" ? "SIDEQUEST" : "QUEST",
      icon: questIcon(q, won ? "bestanden" : "verloren", false), titel: q.name,
      sub: (glanz ? "Glanzsieg" : won ? q.ergebnisWort || "Bestanden" : "Verloren").toUpperCase(), ton: won ? "win" : "lose", folgen,
      wahlen: schild ? schildWahl(schild) : null,
      gueltig: () => (eintragbar(qid).ergebnis || []).includes(status),
      ausfuehren: w => w === "schild" ? schildEinsetzen(schild, qid) : eintrag("q_" + qid, glanz ? { status: "bestanden", glanz: true } : { status })
    });
  }
  // Der Schild meldet sich selbst (29.09.): Wer ein Duell verliert und ihn hat, spielt statt zu verlieren noch einmal.
  // Vorgewählt ist der Schild, „Verloren eintragen“ daneben.
  function schildWahl(schild) {
    const x = itemById(schild);
    return [
      { id: "schild", name: "Schild einsetzen", symbol: `<svg aria-hidden="true" style="color:${x.farbe}"><use href="#${x.symbol}"></use></svg>`, ton: "magie", sub: "NOCHMAL SPIELEN",
        icon: `<span class="sw-item" style="color:${x.farbe}">${useSvg(x.symbol)}</span>`, folgen: [fxZeile("SCHILD", "magie", esc(x.einsatz || x.text))] },
      { id: "verloren", name: "Verloren eintragen" }
    ];
  }
  function schildEinsetzen(schild, qid, duell) {
    if (state.items[schild] !== "besitz") return;
    eintrag("e_" + uid(), { item: schild, quest: qid, ...(duell ? { duell: +duell } : {}) });
  }
  function schwurSchritt(qid, schritt) {
    const q = questById(qid), sx = (q.schritte || []).find(x => x.id === schritt);
    if (!sx || eintragbar(qid).schritt !== sx) return;
    schwur.oeffnen({
      art: "LÄUFT DEN GANZEN TAG", icon: medalHtml(q, "laeuft", false), titel: q.name, sub: sx.name.toUpperCase(), ton: "win",
      gueltig: () => eintragbar(qid).schritt === sx,
      ausfuehren: () => eintrag(`s_${qid}_${schritt}`, {})
    });
  }
  function schwurDuell(nr, v) {
    const sd = showdownStand(), d = sd.liste.find(x => String(x.nr) === String(nr)), sieg = v === "sieg";
    if (!d || d.ergebnis || sd.entschieden) return;
    const dq = questById(d.quest), folgen = [fxZeile("STAND DANACH", "", `${sd.siege + (sieg ? 1 : 0)} : ${sd.nied + (sieg ? 0 : 1)}`)];
    const qid = state.next, schild = !sieg ? E.rettung(C, state, qid) : null;
    schwur.oeffnen({
      art: `DUELL ${d.nr} VON ${sd.liste.length}`, icon: questIcon(dq, sieg ? "bestanden" : "verloren", false), titel: dq.name,
      sub: sieg ? "SIEG" : "NIEDERLAGE", ton: sieg ? "win" : "lose", folgen,
      wahlen: schild ? schildWahl(schild) : null,
      gueltig: () => { const x = showdownStand(); return state.next && questById(state.next).showdown && !x.entschieden && !state.duelle[String(nr)]; },
      ausfuehren: w => w === "schild" ? schildEinsetzen(schild, qid, d.nr) : eintrag("d_" + d.nr, { ergebnis: v })
    });
  }
  // MITNEHMEN (29.09.): alles auf den C-Tasten mit einem Siegel. Das Fenster zeigt, was dabei ist, beim Fluch den Vorteil.
  // Geschrieben wird ein Einsatz je Ding, in einem Rutsch (der Fluch zuletzt, dann würfelt der Schattendieb).
  function schwurMitnehmen() {
    const fq = fuerQuest();
    if (!fq) return;
    const ids = cWahl.filter(id => kannMit(fq).includes(id)).sort((x, y) => !!itemById(x).dieb - !!itemById(y).dieb);
    if (!ids.length) return;
    const { d, spiel } = spielVon(fq), fluch = ids.find(id => itemById(id).dieb), v = fluch ? E.fluchVorteil(C, state, fq) : null;
    const chip = id => { const x = itemById(id); return `<span class="chip">${`<svg aria-hidden="true" style="color:${x.farbe}"><use href="#${x.symbol}"></use></svg>`}${esc(x.kurz || x.name)}</span>`; };
    // Fluch (01.10.): Vorteil, dann Buu Huus Rad mit dem aktuellen Feld ALLES, und was passiert, wenn Packs fehlen.
    // DABEI nennt dann nur, was außer dem Fluch mitkommt, damit alles ins Fenster passt.
    const quote = E.allesChance(C, state), sonst = ids.filter(id => id !== fluch);
    const folgen = sonst.length || !v ? [fxZeile("DABEI", "", (v ? sonst : ids).map(chip).join(""))] : [];
    if (v) folgen.push(fxZeile("FLUCH", "magie", esc(v.text)), fxZeile("PREIS", "lose", `${radMini(quote)}${esc(radSatz(quote))}`),
      `<span class="fx dim">Ohne Packs zieht er blind aus deinen glänzenden und seltenen Karten.</span>`);
    const schluessel = spielVon(fq).schluessel;
    schwur.oeffnen({
      art: d ? `AUSRÜSTEN FÜR DUELL ${d.nr}` : "AUSRÜSTEN FÜR", icon: questIcon(spiel, "offen", false), titel: spiel.name,
      ton: fluch ? "magie" : "win", folgen,
      gueltig: () => fuerQuest() === fq && spielVon(fq).schluessel === schluessel && ids.every(id => kannMit(fq).includes(id)),
      ausfuehren: () => {
        const zeit = Date.now(), neu = {};
        ids.forEach((id, i) => {
          const x = itemById(id);
          // Buu Huu dreht hier am Rad, mit der Chance auf ALLES, die jetzt gilt
          const q = x.dieb ? E.allesChance(C, state) : 0, w = x.dieb ? E.diebWurf(C, Math.random, q) : null;
          neu["e_" + uid() + i] = { item: id, quest: fq, ...(d ? { duell: d.nr } : {}), zeit: zeit + i,
            ...(w ? { raub: w.raub, ...(w.alles ? { alles: true } : {}), rad: +w.rad.toFixed(4), quote: q, ...(v ? { fuer: v.quest } : {}) } : {}) };
        });
        cWahl = [];
        zuQuests = true;
        einStore.setzenAlle(neu);
      }
    });
  }
  function schwurTor(nr, weg) {
    const preis = C.ziffer_preis, segen = torSegen();
    const gueltig = () => !!state.tor && state.tor.fehlend.includes(nr) && state.ziffern[nr - 1] == null
      && (weg !== "packs" || E.zahlkraft(state) >= preis) && (weg !== "segen" || (segen && state.items[segen.id] === "besitz"));
    if (!gueltig()) return;
    const ziffer = `<span class="chip plus"><span class="mini-tumbler">?</span>Ziffer ${nr}</span>`;
    const o = {
      packs: { sub: `FÜR ${preis} ${packsWort(preis).toUpperCase()}`, ton: "win",
        folgen: [`<span class="fx">${preisChips(preis)}${ziffer}</span>`] },
      segen: { sub: "RIKES SEGEN", ton: "magie",
        folgen: [`<span class="fx">${ziffer}</span>`, `<span class="fx">${esc(segen ? segen.einsatz : "")} Danach ist er verbraucht.</span>`] },
      busse: { sub: "BUSSPRÜFUNG", ton: "lose",
        folgen: [`<span class="fx">${ziffer}</span>`, `<span class="fx">Der Bund stellt dir eine Bußprüfung. Erst besiegeln, wenn sie bestanden ist.</span>`] }
    }[weg];
    if (!o) return;
    schwur.oeffnen({
      art: "AM TOR ZUM GIPFEL", icon: weg === "segen" ? `<span class="sw-item" style="color:${segen.farbe}">${useSvg(segen.symbol)}</span>` : `<span class="sw-item lock">${useSvg("i-lock")}</span>`,
      titel: `Ziffer ${nr}`, ...o, gueltig,
      ausfuehren: () => eintrag("z_" + nr, { weg })
    });
  }
  // Was ein Preis kostet: erst geschlossene Packs, der Rest in Karten aus geöffneten Packs
  function preisChips(preis) {
    const p = Math.min(state.packs, preis), k = preis - p;
    return (p ? `<span class="chip minus">${cardSvg()}−${p} ${packsWort(p)}</span>` : "")
      + (k ? `<span class="chip minus">${cardSvg("offen")}−${k} ${k === 1 ? "Karte" : "Karten"}</span>` : "");
  }
  // Ein Pack öffnen (29.09.): Die Zahl oben sind seine geschlossenen Packs, wie Rubine. Der Bund gibt ihm das Pack.
  function schwurOeffnen() {
    if (!state || state.packs < 1) return;
    const n = state.packs;
    schwur.oeffnen({
      art: "DEINE PACKS", icon: `<span class="sw-item">${cardSvg()}</span>`, titel: "Pack öffnen",
      sub: `${n} geschlossen, danach ${n - 1}`.toUpperCase(), ton: "win",
      folgen: [`<span class="fx"><span class="chip minus">${cardSvg()}−1 Pack</span><span class="chip plus">${cardSvg("offen")}zum Aufmachen</span></span>`,
        `<span class="fx dim">Der Bund gibt es dir.</span>`],
      gueltig: () => !!state && state.packs >= 1,
      ausfuehren: () => eintrag("o_" + uid(), {})
    });
  }
  function schwurZiffer(nr) {
    if (!state.ende || state.ziffern[nr - 1] != null || E.zahlkraft(state) < C.ziffer_preis) return;
    schwur.oeffnen({
      art: "AM KÄSTCHEN", icon: `<span class="sw-item lock">${useSvg("i-lock")}</span>`, titel: `Ziffer ${nr} kaufen`,
      sub: `für ${C.ziffer_preis} ${packsWort(C.ziffer_preis)}`, ton: "win",
      folgen: [`<span class="fx">${preisChips(C.ziffer_preis)}<span class="chip plus"><span class="mini-tumbler">?</span>Ziffer ${nr}</span></span>`],
      gueltig: () => state.ende && state.ziffern[nr - 1] == null && E.zahlkraft(state) >= C.ziffer_preis,
      ausfuehren: () => eintrag("z_" + nr, {})
    });
  }

  /* ---------- Finale: Siegbildschirm, Geschichte wie im Kino, Abspann (29.09.) ---------- */
  // Nach der Prüfung des Bundes einmal pro Handy von selbst: Siegbildschirm, „Vor langer Zeit …“, der Titel fliegt davon,
  // die Geschichte von Rike und Dennis zieht schräg in die Tiefe, dann rollt der Abspann (45 s) und bleibt bei THE END
  // mit dem Code stehen. ÜBERSPRINGEN springt einen Teil weiter. Später noch einmal über das Code-Fenster (ABSPANN).
  // Texte und Namen in config.js (abspann). Nimmt der Quest Master den Bund zurück, geht alles still zu.
  const ABSPANN_KEY = "dq-abspann-v1" + (PROBE ? "-probe" : "");
  const FINALE = REIHE[REIHE.length - 1];
  const spielEnde = () => !!state && state.ende && ["bestanden", "verloren"].includes(state.quests[FINALE.id]);
  const abspann = (() => {
    const el = $("#abspann"), A = C.abspann || {}, G = A.geschichte || {};
    const DAUER = { sieg: 6500, vorlange: 4200, logo: 7500, crawl: 48000, credits: 45000 };
    let gezeigt = obGemerkt(ABSPANN_KEY), warEnde = false, timer = [], anim = [], stopMusik = null;
    const warte = (ms, f) => timer.push(setTimeout(f, ms));
    // Hylia Serif kennt keine Umlaute: nur reine ASCII-Namen bekommen die Zelda-Schrift
    const schrift = t => /^[\x20-\x7e]*$/.test(t) ? "hy" : "";
    const code = () => `<span class="ab-code">${state.ziffern.map(v => `<span class="tumbler${v == null ? "" : " known"}">${v == null ? "?" : v}</span>`).join("")}</span>`;
    function stille() { timer.forEach(clearTimeout); timer = []; anim.forEach(a => { try { a.cancel(); } catch (_) {} }); anim = []; }
    function musikAus() { if (stopMusik) { stopMusik(); stopMusik = null; } }
    const phase = p => { el.dataset.phase = p; $("#abSkip").hidden = p === "ende"; };

    function bauen() {
      const s = state, won = s.quests[FINALE.id] === "bestanden", doc = E.normalize(lastDoc || {});
      $("#abSieg").innerHTML = `<span class="ab-triforce${won ? "" : " matt"}">${useSvg("z-triforce")}</span>
        <p class="ab-sieg-titel">${won ? "DIE LEGENDE IST VOLLBRACHT" : "DER BUND HAT GESIEGT"}</p>
        <p class="ab-sieg-sub">${won ? "Du hast die Prüfung des Bundes bestanden." : "Doch deine Legende ist geschrieben."}</p>
        <p class="ab-sieg-packs">${cardSvg()}<span><b>${s.packs + (s.geoeffnet || 0)}</b> von ${s.max} ${packsWort(s.max)} gehören dir${s.geoeffnet ? `, ${s.geoeffnet} schon geöffnet` : ""}</span></p>${code()}`;
      $("#abVorlange").textContent = G.vorlange || "";
      $("#abCrawlText").innerHTML = `<p class="ab-episode">${esc(G.episode || "")}</p><p class="ab-ep-titel">${esc(G.titel || "")}</p>`
        + [...(G.absaetze || []), won ? G.sieg : G.niederlage].filter(Boolean).map(t => `<p>${esc(t)}</p>`).join("");
      // Abspann: Rollen, der Tag in Quests, Beute und Zahlen, Dank, THE END
      const rolle = (titel, namen) => (namen || []).filter(Boolean).length
        ? `<div class="ab-rolle"><small>${esc(titel)}</small>${namen.filter(Boolean).map(n => `<b class="${schrift(n)}">${esc(n)}</b>`).join("")}</div>` : "";
      const zeit = id => Number(doc.zeiten[id]) || 9e15, ordnung = C.quests.map(q => q.id);
      const gespielt = C.quests.filter(q => ["bestanden", "verloren", "beendet"].includes(s.quests[q.id]))
        .sort((x, y) => zeit(x.id) - zeit(y.id) || ordnung.indexOf(x.id) - ordnung.indexOf(y.id));
      const quests = gespielt.map(q => {
        const st = s.quests[q.id], erg = st === "verloren" ? useSvg("i-x") : useSvg("i-check");
        return `<li><span class="ab-ic">${questIcon(q, st, false)}</span><span class="ab-name">${esc(q.name)}${s.glanz[q.id] ? " · Glanzsieg" : ""}</span><span class="ab-erg ${st === "verloren" ? "lost" : "won"}">${erg}</span></li>`;
      }).join("");
      // Je Feld nur die stärkste Stufe (01.10.: jedes Item hat Stufen, die abgelösten zählen nicht mehr)
      const beute = C.items.filter(it => s.items[it.id] && s.items[it.id] !== "nicht" && !E.abgeloest(C, s, it.id))
        .map(it => `<li><span class="ab-ic" style="color:${it.farbe}">${useSvg(it.symbol)}</span><span class="ab-name">${esc(it.name)}</span></li>`).join("");
      const zahl = (label, wert) => `<li><span class="ab-ic"></span><span class="ab-name">${label}</span><b>${wert}</b></li>`;
      const typ = t => REIHE.filter(q => q.typ === t), bestanden = l => l.filter(q => s.quests[q.id] === "bestanden").length;
      const duelle = Object.values(s.duelle), siege = duelle.filter(d => d === "sieg").length;
      const zahlen = zahl("Prüfungen bestanden", `${bestanden(typ("kern"))} von ${typ("kern").length}`)
        + zahl("Sidequests bestanden", `${bestanden(typ("side"))} von ${typ("side").length}`)
        + (duelle.length ? zahl("Duelle am Gipfel", `${siege} : ${duelle.length - siege}`) : "")
        + zahl(C.waehrung.name, `${s.packs + (s.geoeffnet || 0)} von ${s.max}`)
        + (s.geoeffnet ? zahl("Unterwegs geöffnet", s.geoeffnet) : "")
        + (s.karten ? zahl("Karten an den Bund", s.karten) : "");
      const block = (titel, inhalt) => inhalt ? `<div class="ab-block"><small>${esc(titel)}</small><ul>${inhalt}</ul></div>` : "";
      $("#abRoll").innerHTML = `<div class="ab-kopf"><b class="hy">The Legend of Dennis</b><small>A Link to Rike</small></div>`
        + rolle("Der Held", [A.held || "Dennis"]) + rolle("Die Fee", ["gesandt von Rike"]) + rolle("Quest Master", [A.questMaster]) + rolle("Der Bund", A.bund)
        + block("Die Prüfungen des Tages", quests) + block("Die Beute", beute) + block("Der Tag in Zahlen", zahlen)
        + rolle("Drehort", [A.drehort]) + rolle("Besonderer Dank", A.dank)
        + `<div class="ab-ende" id="abEnde"><b class="hy">THE END</b><p class="ab-folgt">Fortsetzung folgt …</p>${A.fortsetzung ? `<p class="ab-fortsetzung">${esc(A.fortsetzung)}</p>` : ""}
           ${code()}<p class="ab-oeffne">Öffne jetzt das Kästchen.</p>
           <div class="ab-knoepfe"><button type="button" data-ab="nochmal">NOCHMAL</button><button type="button" data-ab="zu">ZUM MENÜ</button></div></div>`;
    }

    function start(nochmal) {
      if (!spielEnde()) return false;
      gezeigt = true; obMerken(ABSPANN_KEY);
      stille(); musikAus(); bauen();
      el.hidden = false; $("#coach").hidden = true;
      if (nochmal) geschichte(); else sieg();
      return true;
    }
    function sieg() {
      stille(); phase("sieg");
      melody(state.quests[FINALE.id] === "bestanden" ? "pruefung" : "verloren");
      if (!STILL.matches) warte(DAUER.sieg, geschichte);
    }
    // „Vor langer Zeit …“, dann der Titel, der in die Tiefe fliegt, und die Laufschrift, die schräg davonzieht
    function geschichte() {
      stille(); phase("geschichte");
      if (STILL.matches) { musikAus(); stopMusik = musik(); return; }   // ohne Bewegung: die Geschichte steht still da
      anim.push($("#abVorlange").animate([{ opacity: 0 }, { opacity: 1, offset: .15 }, { opacity: 1, offset: .8 }, { opacity: 0 }], { duration: DAUER.vorlange, fill: "both" }));
      $("#abLogo").style.opacity = 0; $("#abCrawlText").style.transform = "translateY(0)";
      warte(DAUER.vorlange, () => {
        musikAus(); stopMusik = musik();
        anim.push($("#abLogo").animate([{ transform: "translate(-50%, -50%) scale(2.2)", opacity: 1 }, { transform: "translate(-50%, -50%) scale(.1)", opacity: 1, offset: .88 },
          { transform: "translate(-50%, -50%) scale(.05)", opacity: 0 }], { duration: DAUER.logo, easing: "cubic-bezier(.25,.1,.6,1)", fill: "both" }));
        warte(1600, () => {
          const t = $("#abCrawlText"), weg = t.offsetHeight + t.parentElement.offsetHeight * .95;
          const a = t.animate([{ transform: "translateY(0)" }, { transform: `translateY(${-weg}px)` }], { duration: DAUER.crawl, fill: "both" });
          anim.push(a); a.onfinish = () => credits();
        });
      });
    }
    // Der Abspann rollt von unten herauf und bleibt stehen, wenn THE END in der Mitte ist
    function credits() {
      stille(); phase("credits");
      if (!stopMusik) stopMusik = musik();
      const roll = $("#abRoll"), ende = $("#abEnde"), H = $("#abCredits").clientHeight;
      const ziel = -(ende.offsetTop - Math.max(0, (H - ende.offsetHeight) / 2));
      if (STILL.matches) { roll.style.transform = "none"; return fertig(); }
      const a = roll.animate([{ transform: `translateY(${H}px)` }, { transform: `translateY(${ziel}px)` }], { duration: DAUER.credits, fill: "both" });
      anim.push(a); a.onfinish = fertig;
    }
    function fertig() {
      phase("ende");
      musikAus();
      setTimeout(() => { if (!el.hidden) melody("pruefung"); }, 900);
    }
    function weiter() {
      const p = el.dataset.phase;
      if (p === "sieg") geschichte();
      else if (p === "geschichte") { musikAus(); credits(); }
      else if (p === "credits") { const a = anim[anim.length - 1]; if (a) a.finish(); else fertig(); }
    }
    function schliessen() {
      if (el.hidden) return;
      stille(); musikAus();
      el.hidden = true; delete el.dataset.phase;
      renderHud(); renderQuests();
    }
    // Bei jedem neuen Stand: Wird der Bund zurückgenommen, geht der Abspann still zu und kommt beim nächsten Ende wieder
    function pruefen() {
      const ende = spielEnde();
      if (warEnde && !ende) { schliessen(); vergessen(); }
      warEnde = ende;
    }
    function vergessen() { gezeigt = false; try { localStorage.removeItem(ABSPANN_KEY); } catch (_) {} }

    $("#abSkip").addEventListener("click", e => { e.stopPropagation(); tone("confirm"); weiter(); });
    el.addEventListener("click", e => {
      const k = e.target.closest("[data-ab]");
      if (k) { tone("confirm"); if (k.dataset.ab === "nochmal") start(true); else schliessen(); return; }
      if (el.dataset.phase === "sieg") weiter();               // Siegbildschirm: Tippen geht weiter
    });
    return { start, weiter, schliessen, pruefen, vergessen, offen: () => !el.hidden, gezeigt: () => gezeigt };
  })();
  // Von selbst nur, wenn Dennis im Menü ist und gerade nichts anderes offen hat
  function abspannPruefen() {
    if (!spielEnde() || abspann.offen() || abspann.gezeigt() || schlange.length) return;
    if (!intro.hidden || !$("#overlay").hidden || !$("#prolog").hidden || !$("#schwur").hidden || !$("#logbuch").hidden || !$("#morgen").hidden) return;
    abspann.start();
  }

  /* ---------- Startbildschirm und Vollbild ---------- */
  const intro = $("#introScreen");
  const playElements = [...document.querySelectorAll(".hud, .shoulder, .stage, .foot")];
  function setPlayable(on) { playElements.forEach(el => { el.inert = !on; if (on) el.removeAttribute("aria-hidden"); else el.setAttribute("aria-hidden", "true"); }); }
  function beginQuest() {
    if (intro.hidden || intro.classList.contains("is-leaving")) return;
    tone("confirm");
    intro.classList.add("is-leaving");
    setTimeout(() => {
      intro.hidden = true;
      introFx.stop();
      setPlayable(true);
      const row = document.querySelector(".q-row.is-selected");
      if (row) scrollIntoList(row);
      // Beim ersten Mal erklärt Rikes Fee, worum es geht. Sonst laufen die Momente, die Dennis verpasst hat.
      if (prolog.start()) { merkeGesehen(); blankoStart(false); }
      else { if (ersteOffen()) blankoStart(true); nachholen(); }
      setTimeout(abspannPruefen, 900);
    }, 500);
  }
  intro.addEventListener("click", beginQuest);        // PRESS START: Tippen irgendwo startet
  if (params.has("direkt")) { intro.hidden = true; }

  /* ---------- Startbildschirm belebt: Fee schwebt, Feenstaub, Glühwürmchen, Staub im Lichtstrahl ---------- */
  // Alles in Koordinaten des Titelbilds (1672 × 941). Läuft nur, solange der Startbildschirm zu sehen ist.
  // Schwächere Handys: halbe Teilchenzahl, 30 Bilder pro Sekunde, einfache Auflösung.
  const introFx = (() => {
    const BW = 1672, FEE = { x: 649, y: 337 };          // Mitte der Fee im Bild
    const canvas = $("#introFx"), fee = $("#introFee"), ctx = canvas.getContext("2d");
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    const rnd = (a, b) => a + Math.random() * (b - a);
    const RATE = SCHWACH ? 7 : 15, FPS_MS = SCHWACH ? 1000 / 31 : 0;
    let raf = 0, last = 0, t = 0, k = 1, dpr = 1, emit = 0, alt = { x: 0, y: 0 }, lastDraw = 0;
    // Leuchtpunkte einmal vorzeichnen, danach nur noch kopieren
    function glow(r, g, b, kern = true) {
      const c = document.createElement("canvas"); c.width = c.height = 64;
      const x = c.getContext("2d"), grd = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, kern ? "rgba(255,255,255,1)" : `rgba(${r},${g},${b},.5)`); grd.addColorStop(.2, `rgba(${r},${g},${b},${kern ? .9 : .35})`);
      grd.addColorStop(.5, `rgba(${r},${g},${b},${kern ? .25 : .12})`); grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
      x.fillStyle = grd; x.fillRect(0, 0, 64, 64); return c;
    }
    const SPR = { flieder: glow(236, 214, 255), blau: glow(190, 232, 255), gold: glow(255, 226, 150), gruen: glow(196, 255, 104), schein: glow(196, 170, 255, false) };
    const staub = [];
    // Glühwürmchen kreisen um ihren Platz, nie über Logo, Gesicht oder PRESS START
    const wuermchen = [[70, 230], [150, 520], [40, 640], [230, 90], [260, 760], [120, 860], [840, 120], [980, 60], [1120, 130], [790, 560], [1330, 875], [1500, 860], [1625, 700], [1560, 120], [1400, 60], [860, 870]]
      .filter((_, i) => !SCHWACH || i % 2 === 0)
      .map(([x, y]) => ({ x, y, a: rnd(0, 6.3), b: rnd(0, 6.3), s: rnd(.25, .5), r: rnd(5, 8), p: rnd(0, 6.3), f: rnd(.5, 1) }));
    // Staub im Lichtstrahl über dem Weg (der Strahl fällt wie im Bild leicht nach links)
    const inStrahl = (m, neu) => { m.y = neu ? rnd(0, 700) : m.y; m.x = rnd(640, 880) - m.y * .149; return m; };
    const licht = Array.from({ length: SCHWACH ? 14 : 34 }, () => inStrahl({ vx: rnd(-6, 4), vy: rnd(-5, 3), r: rnd(1.3, 2.5), p: rnd(0, 6.3) }, true));

    function size() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w) return;
      dpr = SCHWACH ? 1 : Math.min(1.5, window.devicePixelRatio || 1);    // weiche Lichtpunkte brauchen keine volle Auflösung
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      k = w / BW;
    }
    const dot = (spr, x, y, r, a) => { if (a <= 0) return; ctx.globalAlpha = Math.min(1, a); ctx.drawImage(spr, x - r, y - r, r * 2, r * 2); };
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (FPS_MS && now - lastDraw < FPS_MS) return;
      lastDraw = now;
      const dt = Math.min(.05, (now - (last || now)) / 1000); last = now; t += dt;
      // Fee schwebt in einer ruhigen Acht um ihren Platz
      const d = { x: Math.sin(t * .8) * 12 + Math.sin(t * 1.9) * 4, y: Math.sin(t * 1.3) * 8 + Math.cos(t * .55) * 5 };
      fee.style.transform = `translate3d(${(d.x * k).toFixed(2)}px, ${(d.y * k).toFixed(2)}px, 0)`;
      const fx = FEE.x + d.x, fy = FEE.y + d.y, vfx = dt ? (d.x - alt.x) / dt : 0; alt = d;
      for (emit += dt * RATE; emit >= 1; emit--) {             // Staub fällt unter der Fee heraus, nicht aus ihrem Körper
        const farbe = Math.random();
        staub.push({ x: fx + rnd(-16, 18), y: fy + rnd(12, 26), vx: rnd(-14, 14) - vfx * .4, vy: rnd(0, 16), r: rnd(1.4, 3.2), life: 0, max: rnd(1.6, 3.4), p: rnd(0, 6.3),
          spr: farbe < .6 ? SPR.flieder : farbe < .88 ? SPR.blau : SPR.gold, glanz: !SCHWACH && Math.random() < .18 });
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
      ctx.globalCompositeOperation = "lighter";
      // Lichtstaub
      for (const m of licht) {
        m.x += m.vx * dt; m.y += m.vy * dt;
        const links = 640 - m.y * .149;
        if (m.y < 0 || m.y > 700 || m.x < links || m.x > links + 240) inStrahl(m, true);
        dot(SPR.gold, m.x, m.y, m.r * 2.4, (.22 + .2 * Math.sin(t * 1.8 + m.p)) * (1 - m.y / 900));
      }
      // Glühwürmchen
      for (const g of wuermchen) {
        const x = g.x + Math.sin(t * g.s + g.a) * 28 + Math.sin(t * g.s * 2.3 + g.b) * 10;
        const y = g.y + Math.cos(t * g.s * .9 + g.b) * 22 + Math.sin(t * g.s * 1.7 + g.a) * 8;
        const an = Math.max(0, Math.sin(t * g.f + g.p));
        dot(SPR.gruen, x, y, g.r * 3.2, an * an * .9);
      }
      // leiser Schein um die Fee, pulsiert
      dot(SPR.schein, fx, fy, 70, .2 + .1 * Math.sin(t * 3.1));
      // Feenstaub rieselt, schwankt und funkelt
      for (let i = staub.length - 1; i >= 0; i--) {
        const s = staub[i];
        s.life += dt;
        if (s.life >= s.max) { staub.splice(i, 1); continue; }
        s.vy += 14 * dt; s.vx *= .985;
        s.x += (s.vx + Math.sin(s.life * 3 + s.p) * 7) * dt; s.y += s.vy * dt;
        const a = Math.min(1, s.life / .35) * Math.min(1, (s.max - s.life) / (s.max * .4)) * (.5 + .4 * Math.sin(s.life * 14 + s.p));
        dot(s.spr, s.x, s.y, s.r * 2.6, a);
        if (s.glanz && a > .3) {
          ctx.globalAlpha = a * .8; ctx.strokeStyle = "#fff"; ctx.lineWidth = .9;
          ctx.beginPath(); ctx.moveTo(s.x - s.r * 3, s.y); ctx.lineTo(s.x + s.r * 3, s.y); ctx.moveTo(s.x, s.y - s.r * 3); ctx.lineTo(s.x, s.y + s.r * 3); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
    function start() { if (raf || still.matches || intro.hidden || briefOffen) return; size(); last = 0; raf = requestAnimationFrame(frame); }
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    if ("ResizeObserver" in window) new ResizeObserver(size).observe(canvas);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    return { start, stop };
  })();
  introFx.start();

  // Vorwärmen (28.09.): Solange der Startbildschirm alles verdeckt, alle Seiten einmal kurz zeigen. Dann liegen
  // Bilder, Symbole und Ebenen schon bereit, und das erste Blättern zur Karte hängt nicht. Unsichtbar, dauert zwei Bilder.
  setTimeout(() => {
    if (intro.hidden) return;
    const cube = $("#menuCube");
    cube.classList.add("warm");
    requestAnimationFrame(() => requestAnimationFrame(() => cube.classList.remove("warm")));
  }, 1200);

  const fsBtn = $("#fullscreenToggle");
  const isStandalone = () => navigator.standalone === true || matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: fullscreen)").matches;
  const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement;
  function updateFs() {
    const on = Boolean(fsElement());
    fsBtn.setAttribute("aria-pressed", String(on));
    fsBtn.setAttribute("aria-label", on ? "Vollbild verlassen" : "Vollbild öffnen");
    fsBtn.hidden = isStandalone() && !on;
    document.documentElement.classList.toggle("standalone", isStandalone());
  }
  async function toggleFs() {
    const hinweis = () => showOverlay({ head: `<p class="big">VOLLBILD</p><p class="sub">Auf dem iPhone geht das so:</p>`,
      lines: `<li><span class="ri">1</span>In Safari unten auf Teilen tippen.</li><li><span class="ri">2</span>Zum Home-Bildschirm wählen.</li><li><span class="ri">3</span>Dennis Quest dort öffnen und quer halten.</li>` });
    try {
      if (fsElement()) { const x = document.exitFullscreen || document.webkitExitFullscreen; if (x) await Promise.resolve(x.call(document)); return; }
      const el = document.documentElement, req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (!req) return hinweis();
      await Promise.resolve(req.call(el, { navigationUI: "hide" }));
      try { await screen.orientation?.lock?.("landscape"); } catch (_) {}
    } catch (_) { hinweis(); }
  }
  fsBtn.addEventListener("click", e => { e.stopPropagation(); toggleFs(); });

  /* ---------- App installieren (Startbildschirm) ---------- */
  // Android (Chrome, Samsung Internet): ein Tipp öffnet das Fenster „App installieren?".
  // iPhone: Apple erlaubt das keiner Webseite, der Knopf zeigt stattdessen die Anleitung.
  const installBtn = $("#installBtn");
  const IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const ANDROID = /Android/i.test(navigator.userAgent);
  let installEvent = window.__installEvent || null, installiert = false;
  const INST_KEY = "dq-installiert" + (PROBE ? "-probe" : "");
  try { installiert = localStorage.getItem(INST_KEY) === "1"; } catch (_) {}
  function updateInstall() { installBtn.hidden = isStandalone() || (installiert && !installEvent) || !(installEvent || IOS || ANDROID); }
  const iosAnleitung = () => showOverlay({
    head: `<span class="ri-big">${useSvg("i-star")}</span><p class="big">APP INSTALLIEREN</p><p class="sub">Auf dem iPhone in Safari:</p>`,
    lines: `<li><span class="ri">1</span>Unten auf Teilen tippen (bei neuem iOS erst auf „…“).</li><li><span class="ri">2</span>„Zum Home-Bildschirm“ wählen, dann „Hinzufügen“.</li><li><span class="ri">3</span>Dennis Quest dort öffnen und quer halten.</li>` });
  // Ersatz, falls Android das Fenster gerade nicht anbietet (zum Beispiel nach einmal Abbrechen)
  const androidAnleitung = () => showOverlay({
    head: `<span class="ri-big">${useSvg("i-star")}</span><p class="big">APP INSTALLIEREN</p><p class="sub">So geht es von Hand:</p>`,
    lines: `<li><span class="ri">1</span>Chrome: oben rechts auf ⋮ tippen. Samsung Internet: unten auf ≡.</li><li><span class="ri">2</span>„Zum Startbildschirm hinzufügen“ bzw. „Seite hinzufügen zu“, dann „Startbildschirm“.</li><li><span class="ri">3</span>Dennis Quest dort öffnen.</li>` });
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvent = e; updateInstall(); });
  addEventListener("appinstalled", () => {
    installEvent = null; installiert = true;
    try { localStorage.setItem(INST_KEY, "1"); } catch (_) {}
    updateInstall();
    if (briefOffen) return brief.installiert();          // im Brief sagt es das P.S.
    melody("side");
    showOverlay({ head: `<span class="ri-big">${useSvg("i-check")}</span><p class="big">INSTALLIERT</p><p class="sub">Dennis Quest liegt jetzt auf deinem Startbildschirm.</p>`,
      lines: `<li><span class="ri">▶</span>Ab jetzt dort öffnen, dann läuft es im Vollbild.</li>` });
  });
  installBtn.addEventListener("click", async e => {
    e.stopPropagation();
    tone("confirm");
    if (!installEvent) return IOS ? iosAnleitung() : androidAnleitung();
    const ev = installEvent;
    installEvent = null;                     // das Fenster lässt sich nur einmal öffnen
    try { await ev.prompt(); await ev.userChoice; } catch (_) { androidAnleitung(); }
    updateInstall();
  });
  updateInstall();
  document.addEventListener("fullscreenchange", updateFs);
  document.addEventListener("webkitfullscreenchange", updateFs);

  /* ---------- Der Brief (01.10., Wunsch des Nutzers) ----------
     Dennis weiß nichts vom Spiel, er bekommt nur den Link, meist aus WhatsApp und hochkant. Beim allerersten Öffnen liegt vor
     dem Titelbild ein versiegelter Brief von Fabio und Bene (Texte in config.js, brief). Er hält das Siegel gedrückt (so lernt
     er gleich die Geste, die er den ganzen Tag braucht, und das Handy darf ab da Klang spielen), das Siegel bricht, der Brief
     entfaltet sich. „Mach den Ton an“ steht schon auf dem verschlossenen Brief. Tippen zeigt das P.S.: auf den Startbildschirm,
     „Jetzt dreh dein Handy“. Dreht er (oder tippt
     LOS), geht das Titelbild auf. Einmal pro Handy (gemerkt, sobald er das P.S. sieht), nie mit ?direkt, in der Demo nur mit
     ?brief, ?brief zeigt ihn immer. Alles zurücksetzen vergisst ihn. */
  const brief = (() => {
    const B = C.brief, el = $("#brief"), zu = $("#briefZu"), offen = $("#briefOffen"), ps = $("#briefPs"), siegel = $("#briefSiegel");
    const HALTEN = (B && B.halten) || 15000, hinweis = $("#briefHinweis");
    const SAMSUNG = /SamsungBrowser/i.test(navigator.userAgent);
    const quer = matchMedia("(orientation: landscape)");
    let timer = null, schritt = "zu", fertigTimer = null, texte = [], brumm = null;
    const gemerkt = () => { try { return localStorage.getItem(BRIEF_KEY) === "1"; } catch (_) { return false; } };
    const zeigen = !!B && !params.has("direkt") && (params.has("brief") || (!DEMO && !gemerkt()));

    function aufbauen() {
      $("#briefAn").textContent = B.an;
      $("#briefGeheim").textContent = B.geheim;
      $("#briefTon").textContent = B.ton;
      $("#briefHinweis").textContent = B.hinweis;
      const zeilen = [`<p class="anrede">${esc(B.anrede)}</p>`, ...B.absaetze.map(a => `<p>${esc(a)}</p>`),
        `<p class="gruss">${esc(B.gruss)}<small>${esc(B.wer)}</small></p>`];
      $("#briefText").innerHTML = zeilen.map((z, i) => z.replace("<p", `<p style="--i:${i}"`)).join("");
      $("#briefPsText").textContent = B.ps;
    }

    // Siegel gedrückt halten, bis sich der Ring schließt. Mit Absicht viel zu lang (config.js, brief.halten): Der Ring füllt
    // sich langsam, ein Brummen schwillt an, der Hinweis wechselt. Lässt er zu früh los: „Ey, gedrückt halten, du Waldschrat!“
    function start(e) {
      if (schritt !== "zu" || timer) return;
      if (e) e.preventDefault();
      el.style.setProperty("--halten", HALTEN / 1000 + "s");
      el.classList.add("halten");
      hinweis.classList.remove("schimpf");
      tone("move"); klang("grollen"); brummen(true);
      const t = B.haltenTexte || [];
      texte = t.map((x, i) => setTimeout(() => { hinweis.textContent = x; }, i * HALTEN / t.length));
      timer = setTimeout(brechen, HALTEN);
    }
    function aufhoeren() { clearTimeout(timer); timer = null; texte.forEach(clearTimeout); texte = []; brummen(false); el.classList.remove("halten"); }
    function abbrechen() {
      if (!timer) return;
      aufhoeren();
      hinweis.textContent = B.losgelassen || B.hinweis;
      hinweis.classList.remove("schimpf"); void hinweis.offsetWidth; hinweis.classList.add("schimpf");
      tone("error");
    }
    // Brummen beim Halten (eigener Klang): tief und leise, wird höher und lauter, bis das Siegel bricht
    function brummen(an) {
      try {
        if (brumm) {
          const { o, g } = brumm, t = audio.currentTime;
          g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(Math.max(g.gain.value, .0001), t); g.gain.exponentialRampToValueAtTime(.0001, t + .15);
          o.stop(t + .2); brumm = null;
        }
        if (!an) return;
        audio ??= new (window.AudioContext || window.webkitAudioContext)();
        if (audio.state === "suspended") audio.resume();
        const t = audio.currentTime, d = HALTEN / 1000;
        const o = audio.createOscillator(), f = audio.createBiquadFilter(), g = audio.createGain();
        o.type = "sawtooth"; o.frequency.setValueAtTime(46, t); o.frequency.exponentialRampToValueAtTime(150, t + d);
        f.type = "lowpass"; f.frequency.setValueAtTime(180, t); f.frequency.exponentialRampToValueAtTime(1100, t + d);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.012, t + d * .3); g.gain.exponentialRampToValueAtTime(.07, t + d);
        o.connect(f).connect(g).connect(audio.destination); o.start(t); o.stop(t + d + .4);
        brumm = { o, g };
      } catch (_) {}
    }
    function brechen() {
      aufhoeren(); schritt = "bricht";
      el.classList.add("gebrochen");
      klang("bruch"); melody("siegel");
      setTimeout(() => melody("zauber"), 420);
      setTimeout(entfalten, STILL.matches ? 200 : 750);
    }
    function entfalten() {
      schritt = "offen";
      zu.hidden = true; offen.hidden = false;
      el.querySelector(".brief-papier").classList.add("auf");
      const n = offen.querySelectorAll(".brief-text p").length;
      fertigTimer = setTimeout(fertig, STILL.matches ? 0 : 500 + (n - 1) * 1100 + 900);
    }
    function fertig() { clearTimeout(fertigTimer); offen.classList.add("alles", "fertig"); }
    // Tippen (auf den Brief oder daneben): erst alles zeigen, dann das P.S.
    el.addEventListener("click", () => {
      if (schritt !== "offen") return;
      if (!offen.classList.contains("fertig")) return fertig();
      tone("move");
      nachschrift();
    });

    // P.S.: Startbildschirm und Drehen. Ab hier hat er den Brief gelesen, das Handy merkt es sich.
    function nachschrift() {
      schritt = "ps";
      try { localStorage.setItem(BRIEF_KEY, "1"); } catch (_) {}
      offen.hidden = true; ps.hidden = false;
      installZeigen();
      drehZeigen();
    }
    function installZeigen() {
      const da = isStandalone() || (installiert && !installEvent);
      $("#briefInstall").hidden = da || !(installEvent || IOS || ANDROID);
      $("#briefOk").hidden = !da;
      $("#briefOk").textContent = B.installiert;
    }
    function installiertMelden() { $("#briefSchritte").hidden = true; installZeigen(); melody("side"); }
    $("#briefInstall").addEventListener("click", async e => {
      e.stopPropagation();
      tone("confirm");
      if (installEvent) {
        const ev = installEvent;
        installEvent = null;                     // das Fenster lässt sich nur einmal öffnen
        try { await ev.prompt(); const w = await ev.userChoice; if (w && w.outcome === "accepted") return; } catch (_) {}
        updateInstall();
      }
      // Kein Fenster vom Handy (iPhone, abgebrochen, Samsung Internet ohne Angebot): die Schritte von Hand
      const s = IOS ? ["Unten auf Teilen tippen (bei neuem iOS erst auf „…“).", "„Zum Home-Bildschirm“, dann „Hinzufügen“."]
        : SAMSUNG ? ["Unten rechts auf ≡ tippen.", "„Seite hinzufügen zu“, dann „Startbildschirm“."]
        : ["Oben rechts auf ⋮ tippen.", "„Zum Startbildschirm hinzufügen“ oder „App installieren“."];
      $("#briefSchritte").innerHTML = s.map(x => `<li><span>${esc(x)}</span></li>`).join("");
      $("#briefSchritte").hidden = false;
      $("#briefInstall").hidden = true;
    });

    // Hochkant: „Jetzt dreh dein Handy“, Drehen öffnet das Titelbild. Android kann auch LOS: Vollbild und quer, selbst wenn
    // das automatische Drehen aus ist. Quer: „Bereit? Dann los.“ und LOS.
    const vollbildGeht = () => ANDROID && !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
    function drehZeigen() {
      const q = quer.matches;
      $(".brief-handy").hidden = q;
      $("#briefDrehText").textContent = q ? B.quer : B.dreh;
      $("#briefSperre").textContent = q ? "" : IOS ? B.sperreIos : B.sperre;
      $("#briefLos").hidden = !q && !vollbildGeht();
    }
    quer.addEventListener?.("change", () => {
      if (schritt === "ps" && quer.matches) return schliessen();
      if (schritt === "ps") drehZeigen();
    });
    $("#briefLos").addEventListener("click", async e => {
      e.stopPropagation();
      if (schritt !== "ps") return;
      if (quer.matches) return schliessen();
      try {
        const d = document.documentElement, req = d.requestFullscreen || d.webkitRequestFullscreen;
        await Promise.resolve(req.call(d, { navigationUI: "hide" }));
        await screen.orientation.lock("landscape");    // dreht das Bild, das Ereignis oben schließt den Brief
      } catch (_) {}
      setTimeout(() => { if (schritt === "ps" && quer.matches) schliessen(); }, 400);
    });

    // Der Brief geht, das Titelbild geht mit Klang auf
    function schliessen() {
      if (schritt === "weg") return;
      schritt = "weg";
      el.classList.add("zu-ende");
      melody("zauber");
      setTimeout(() => {
        el.hidden = true; el.classList.remove("zu-ende", "gebrochen", "halten");
        briefOffen = false;
        introFx.start();
      }, STILL.matches ? 0 : 700);
    }

    siegel.addEventListener("pointerdown", start);
    ["pointerup", "pointerleave", "pointercancel"].forEach(t => siegel.addEventListener(t, abbrechen));
    siegel.addEventListener("contextmenu", e => e.preventDefault());
    siegel.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) start(e); });
    siegel.addEventListener("keyup", e => { if (e.key === "Enter" || e.key === " ") abbrechen(); });

    if (zeigen) {
      aufbauen();
      briefOffen = true;
      introFx.stop();
      el.hidden = false;
    }
    return { installiert: installiertMelden, offen: () => briefOffen };
  })();

  /* ---------- Demo: Buchungen simulieren, ohne Firebase ---------- */
  if (DEMO) {
    $("#demoBar").hidden = false;
    $("#demoBar").addEventListener("click", e => {
      const a = e.target.closest("[data-demo]")?.dataset.demo;
      if (!a) return;
      const d = JSON.parse(JSON.stringify(store.doc));
      if (a === "zurueck") {
        // Wie der Quest Master: erst Dennis' letzten eigenen Eintrag zurücknehmen, sonst die letzte gebuchte Quest
        const neuester = Object.keys(eintraege).sort((x, y) => (eintraege[y].zeit || 0) - (eintraege[x].zeit || 0))[0];
        if (neuester) return einStore.loeschen(neuester);
        const last = [...REIHE].reverse().find(q => d.quests[q.id]);
        if (last) delete d.quests[last.id];
      } else if (a === "amulett") {
        if (d.quests.amulett !== "laeuft") d.quests.amulett = "laeuft";
        else if (!(d.schritte.amulett || {}).gefunden) d.schritte.amulett = { gefunden: true };
        else d.quests.amulett = "bestanden";
      } else if (a === "einsetzen") {
        const s = E.derive(C, d), qid = E.aktuelleQuests(C, s).find(id => E.mitnehmbar(C, s, id).length);
        const item = qid && E.mitnehmbar(C, s, qid)[0], dl = qid && questById(qid).showdown ? E.aktuellesDuell(C, s) : null;
        const rad = () => { const q = E.allesChance(C, s), w = E.diebWurf(C, Math.random, q); return { raub: w.raub, ...(w.alles ? { alles: true } : {}), rad: w.rad, quote: q }; };
        if (item) d.einsaetze.push({ id: uid(), item, quest: qid, zeit: Date.now(), ...(dl ? { duell: dl.nr } : {}), ...(itemById(item).dieb ? rad() : {}) });
      } else if (a === "glanz") {
        if (state.kommt && questById(state.kommt).glanz) { d.quests[state.kommt] = "bestanden"; d.glanz = { ...d.glanz, [state.kommt]: true }; }
      } else if (state.kommt) d.quests[state.kommt] = a;
      store.save(d);
    });
  }

  /* ---------- Start ---------- */
  build();
  setActiveFace();
  setPlayable(intro.hidden);
  updateFs();
  function renderSync() {
    const el = $("#sync");
    const t = state && state.stand ? new Date(state.stand).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "";
    // Mit Netz ist der Stand aktuell, dann steht hier nichts
    el.textContent = syncInfo.online || syncInfo.demo ? "" : t ? "Offline · Stand " + t : "Offline";
    el.classList.toggle("offline", !syncInfo.online && !syncInfo.demo);
  }
  store.onStatus(st => { syncInfo = st; renderSync(); });
  // Der Stand kommt aus zwei Quellen: dem Dokument des Quest Masters und Dennis' eigenen Einträgen.
  // Ändert sich eins davon, wird neu gerechnet. Ist das Menü offen, zeigt announce() den Moment,
  // sonst holt nachholen() ihn nach PRESS START nach.
  function neuBerechnen(meta) {
    if (!adminDoc) return;
    const doc = E.mitEintraegen(C, adminDoc, eintraege);
    const prev = state, prevDoc = lastDoc;
    state = E.derive(C, doc);
    lastDoc = JSON.parse(JSON.stringify(doc));
    render();
    renderSync();
    fensterZuruecknehmen();
    prolog.pruefen();
    if (blanko && spaeter()) ersteQuestPruefen();
    abspann.pruefen();
    setTimeout(abspannPruefen, 900);        // Spielende: Finale, sobald nichts anderes mehr offen ist
    if (!$("#schwur").hidden) schwur.pruefen();
    // Log-Buch-Sprachnachrichten vorladen, solange das Log-Buch noch nicht entschieden ist
    if (state.quests.logbuch === "offen") logbuch.vorladen();
    // Alles zurückgesetzt (der Quest Master hat im Admin neu angefangen, neuer Zeitstempel in neustart): ein Fenster,
    // das Handy vergisst, was es sich gemerkt hat. Die Einzelteile (Dennis' Einträge, Tagebuch) kommen danach still an.
    // Ein neues Handy übernimmt den Zeitstempel erst vom Netz, nicht vom leeren Startstand (sonst hielte es ihn für neu)
    const ns = adminDoc.neustart || 0;
    if (ns !== neustartBekannt && !(neustartBekannt === null && meta.initial)) {
      const alt = neustartBekannt;
      neustartBekannt = ns;
      try { if (!DEMO) localStorage.setItem(NEUSTART_KEY, String(ns)); } catch (e) {}
      if (alt !== null) {
        stilleBis = Date.now() + 10000;
        if (ns > alt) return neuerAnfang(!!prev && !meta.initial && intro.hidden);
      }
    }
    if (Date.now() < stilleBis) { merkeGesehen(); return; }
    if (meta.initial && intro.hidden) { requestAnimationFrame(() => { const row = document.querySelector(".q-row.is-selected"); if (row) scrollIntoList(row); }); nachholen(); }
    if (prev && !meta.initial && intro.hidden) melden(prev, prevDoc);
  }

  // Nimmt der Quest Master mehreres auf einmal zurück, kommen die Einzelteile nacheinander an (Spiel und Dennis' Einträge
  // getrennt). Rücknahmen werden darum kurz gesammelt und in einem Fenster gezeigt, Neuigkeiten sofort.
  // Nach einem Neustart (auch wenn er zurückgenommen wird) bleibt es kurz still, bis alles angekommen ist.
  let sammel = null, stilleBis = 0;
  // Nur weggenommen: Alles im neuen Stand stand schon genauso im alten (nichts entschieden, gestartet, gezählt, eingesetzt, gebucht)
  function nurWeniger(alt, neu) {
    alt = E.normalize(alt); neu = E.normalize(neu);
    const gleich = (x, y) => JSON.stringify(x) === JSON.stringify(y);
    const teil = (a, b) => Object.keys(b || {}).every(k => a && k in a && gleich(a[k], b[k]));
    const ids = l => new Set(l.map(x => x.id));
    return teil(alt.quests, neu.quests) && teil(alt.glanz, neu.glanz) && teil(alt.duelle, neu.duelle) && teil(alt.items, neu.items)
      && Object.keys(neu.zaehler).every(k => (Number(neu.zaehler[k]) || 0) <= (Number(alt.zaehler[k]) || 0))
      && Object.keys(neu.schritte).every(k => teil(alt.schritte[k], neu.schritte[k]))
      && neu.einsaetze.every(e => ids(alt.einsaetze).has(e.id)) && neu.buchungen.every(x => ids(alt.buchungen).has(x.id));
  }
  function melden(prev, prevDoc) {
    if (sammel) { clearTimeout(sammel.t); prev = sammel.prev; prevDoc = sammel.prevDoc; sammel = null; }
    if (nurWeniger(prevDoc, lastDoc)) {
      sammel = { prev, prevDoc, t: setTimeout(() => { const x = sammel; sammel = null; if (x && intro.hidden) { announce(x.prev, state, x.prevDoc, lastDoc); merkeGesehen(); } }, 700) };
      return;
    }
    announce(prev, state, prevDoc, lastDoc); merkeGesehen();
  }

  // Neuer Anfang: Das Handy vergisst alles vom alten Spiel: Prolog, Beutel, Hinweise, Funde, den zuletzt gesehenen
  // Stand und seine Kopien von Dennis' Einträgen und Tagebuch-Antworten (auch was ohne Netz noch nicht gesendet war).
  // Beim nächsten PRESS START läuft alles wie beim ersten Mal. Ist das Menü offen, sagt es die Fee in einem einzigen Fenster.
  // Bleibt: ob die App auf dem Home-Bildschirm liegt.
  function neuerAnfang(zeigen) {
    if (sammel) { clearTimeout(sammel.t); sammel = null; }
    if (szene) szene.still();
    try { [OB_KEY, KARTE_KEY, FUND_KEY, ERSTE_KEY, BRIEF_KEY, "dq-gps" + (PROBE ? "-probe" : "")].forEach(k => localStorage.removeItem(k)); } catch (e) {}
    abspann.schliessen(); abspann.vergessen();
    morgen.ende(true); morgen.vergessen();
    beutelGezeigt = false; karteGesehen = false; gesehen = null; neuMarke.clear();
    prolog.vergessen();
    einStore.vergessen(); lbStore.vergessen();
    schlange = []; revealPending = null; fensterQuest = null;
    // Gesehen ist der leere Anfang: Was von Dennis' Einträgen noch nachkommt oder schon weg ist, meldet niemand mehr
    merkeGesehen(E.normalize(adminDoc));
    if (!zeigen) return;
    schwur.schliessen();
    if (!$("#logbuch").hidden) logbuch.schliessen();
    $("#coach").hidden = true;
    melody("zauber");
    showOverlay({
      head: `<span class="ri-big fee"><img src="assets/fee.png" alt=""></span><p class="big">NEUER ANFANG</p><p class="sub">vom Quest Master</p>`,
      lines: `<li><span class="ri"></span><span>Alles zurückgesetzt. Die Reise beginnt von vorn.</span></li>`,
      next: ""
    }, () => { if (!DEMO) location.reload(); });
    renderHud(); renderQuests();
  }
  einStore.subscribe(e => { eintraege = e; neuBerechnen({}); });
  store.subscribe((doc, meta) => { adminDoc = doc; neuBerechnen(meta); });
  lbStore.subscribe(a => { antworten = a; if (state) { const id = sel[1]; if (id && questById(id)?.logbuch) renderQuestCard(id); } });

  // Offline-Speicher für Funklöcher (sw.js). Lokal beim Entwickeln nicht nötig.
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
