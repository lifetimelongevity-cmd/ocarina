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
  let beutelGezeigt = obGemerkt(OB_KEY);
  const onboarded = () => beutelGezeigt || spaeter();
  const DEMO_DOCS = {
    start: { quests: {} },
    mitte: {
      quests: { logbuch: "bestanden", klingen: "bestanden", wirbel: "verloren", podrennen: "bestanden", prophezeiung: "laeuft", amulett: "laeuft" },
      zaehler: { prophezeiung: 1 },
      einsaetze: [{ id: "e1", item: "kreisel", quest: "wirbel" }],
      buchungen: [{ id: "b1", packs: -1, grund: "Strafe vom Quest Master" }]
    },
    // Kurz vor dem Ende: alles gespielt bis auf den Bund, zwei Revanchen stehen an, Amulett gefunden
    bund: {
      quests: { logbuch: "bestanden", klingen: "verloren", wirbel: "bestanden", podrennen: "bestanden", kartenwurf: "bestanden",
                auge: "verloren", deku: "bestanden", feuerprobe: "bestanden", prophezeiung: "laeuft", amulett: "laeuft" },
      zaehler: { prophezeiung: 2 }, schritte: { amulett: { gefunden: true } },
      einsaetze: [{ id: "e1", item: "spruchrolle", quest: "auge" }]
    },
    ende: {
      quests: Object.fromEntries(C.quests.map(q => [q.id, q.zaehler ? "beendet" : ["wirbel", "auge"].includes(q.id) ? "verloren" : "bestanden"])),
      zaehler: { prophezeiung: 2 }, schritte: { amulett: { gefunden: true } },
      einsaetze: [{ id: "e1", item: "spruchrolle", quest: "auge" }]
    }
  };

  function demoStore() {
    const subs = [];
    let doc = E.normalize({ ...(DEMO_DOCS[params.get("demo")] || DEMO_DOCS.mitte), stand: Date.now() });
    return {
      get doc() { return doc; },
      subscribe(fn) { subs.push(fn); fn(doc, { initial: true }); },
      onStatus(fn) { fn({ online: true, demo: true }); },
      save(next) { doc = E.normalize({ ...next, stand: Date.now() }); subs.forEach(fn => fn(doc, {})); }
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
  // und die Tarnung als Name. Beim Gewinnen „entpuppt" es sich. Der Beutel ist Startitem: seine Tarnung fällt beim
  // ersten Besuch der Ausrüstung.
  const verborgen = id => id === "beutel" ? !onboarded() : state.items[id] === "nicht";
  const getarnt = id => !!itemById(id).tarn && verborgen(id);
  const itemSicht = id => {
    const x = itemById(id);
    return getarnt(id) ? { ...x, ...x.tarn } : x;
  };
  // Welche Quest ein Item bringt (Sieg oder Treffer), für „Erbeutet bei" und „Zu erbeuten bei"
  const quelle = id => C.quests.find(q => (q.win && q.win.items || []).includes(id) || (q.zaehler && q.zaehler.proTreffer.items || []).includes(id));
  // Nicht erspielt, und die Quest, die es bringt, ist schon vorbei (verloren, oder ohne Treffer beendet)
  const entgangen = id => { const q = verborgen(id) && quelle(id); return !!q && !["offen", "laeuft"].includes(state.quests[q.id]); };
  const useSvg = (id, cls = "") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"></use></svg>`;
  const cardSvg = (cls = "") => `<svg class="ic-card ${cls}" aria-hidden="true"><use href="#${cls.includes("empty") ? "i-card-empty" : "i-card"}"></use></svg>`;
  const packsWort = n => Math.abs(n) === 1 ? "Pack" : "Packs";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let state = null, lastDoc = null, syncInfo = { online: true }, antworten = {}, adminDoc = null, eintraege = {};
  let page = START_PAGE, angle = START_PAGE * 120, flatTimer = null;
  const sel = { 0: null, 1: null, 2: null };  // Auswahl je Seite: Station, Quest, Item
  let followNext = true;                        // Quest-Seite folgt der nächsten Quest, bis Dennis selbst etwas antippt
  let followHier = true;                        // Karte zeigt die Station der nächsten Quest, bis Dennis eine andere antippt
  let revealPending = null;                     // Quest, die nach dem Ergebnis-Fenster aus dem Nebel tritt
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
    stimme:   [[659, .3], [784, .3], [880, .45], [784, .3], [659, .6]]
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
  const aufgedeckt = id => state.quests[id] !== "offen" || id === state.next;
  const NEBEL = "nebel";
  const coveredMedal = () => `<span class="medal covered"><b>?</b></span>`;
  const verdeckteKern = () => REIHE.filter(q => q.typ === "kern" && !aufgedeckt(q.id)).length;
  const pruefungen = n => `${n} ${n === 1 ? "Prüfung" : "Prüfungen"}`;
  const aktiv = id => id === state.next || state.quests[id] === "laeuft";

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
      const x = itemSicht(id), cls = [gewonnen ? "" : "x-over", verborgen(id) ? "schatten" : ""].join(" ").trim();
      out.push(`<span class="chip${gewonnen ? "" : " minus"}"><span class="${cls}" style="color:${x.farbe}">${useSvg(x.symbol)}</span>${esc(x.kurz)}${gewonnen ? "" : " weg"}</span>`);
    });
    return out.length ? out.join("") : `<span class="chip none">nichts</span>`;
  }

  /* ---------- Aufbau (einmal) ---------- */
  function build() {
    // HUD: eine Karte pro Pack im Kästchen, ab 10 in zwei Reihen wie Herzen
    const row = $("#packRow"), max = C.waehrung.max;
    row.style.gridTemplateColumns = `repeat(${max > 10 ? Math.ceil(max / 2) : max}, auto)`;
    row.classList.toggle("two", max > 10);
    row.innerHTML = Array.from({ length: max }, () => cardSvg("empty")).join("");
    $("#tumblers").innerHTML = C.code.map((_, i) => `<span class="tumbler" data-i="${i}">?</span>`).join("");

    // Quests: oben was gerade läuft, dann die feste Reihe, am Ende der Nebel
    const zeile = q => `<li><button type="button" class="q-row ${q.typ}" data-id="${q.id}"><span class="ic"></span><span class="q-name">${esc(q.name)}</span><span class="q-mark"></span></button></li>`;
    $("#questList").innerHTML = `<li class="q-sep" data-sep="lauf">LÄUFT</li>` + LAUF.map(zeile).join("")
      + `<li class="q-sep q-div" data-sep="reihe" aria-hidden="true"></li>` + REIHE.map(zeile).join("")
      + `<li><button type="button" class="q-row nebel" data-id="${NEBEL}"><span class="ic">${coveredMedal()}</span><span class="q-name"></span><span class="q-mark"></span></button></li>`;
    document.querySelectorAll(".q-row").forEach(b => b.addEventListener("click", () => { followNext = b.dataset.id === state.next; selectQuest(b.dataset.id); }));
    $("#questCard").addEventListener("click", e => {
      if (e.target.closest("[data-logbuch]")) return logbuch.oeffnen();
      const t = e.target.closest("[data-ergebnis], [data-schritt], [data-duell], [data-einsetzen]");
      if (!t) return;
      if (t.dataset.ergebnis) schwurErgebnis(sel[1], t.dataset.ergebnis);
      else if (t.dataset.schritt) schwurSchritt(sel[1], t.dataset.schritt);
      else if (t.dataset.duell) schwurDuell(t.dataset.duell, t.dataset.v);
      else schwurEinsatz(t.dataset.einsetzen, t.dataset.quest);
    });
    $("#itemBox").addEventListener("click", e => { const b = e.target.closest("[data-einsetzen]"); if (b) schwurEinsatz(b.dataset.einsetzen); });

    // Karte: Weg durch die Stationen, eine Marke pro Station. Tippen zeigt die Stationstafel, zweites Tippen die Quest.
    $("#mapRoute").setAttribute("d", pfad(ABSCHNITTE.length));
    $("#mapMarks").innerHTML = STATIONEN.map(s =>
      `<button type="button" class="mark" data-station="${s.id}" style="left:${s.x}%;top:${s.y}%" aria-label="${esc(s.ort)}"><span class="m-medal"></span><span class="gems"></span><span class="m-label">${esc(s.name)}</span></button>`).join("")
      + `<span class="map-lake-label">TEGERNSEE</span>`;
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
      return `<button type="button" class="slot${rune ? " rune" : ""}" data-id="${it.id}" style="--i:${i};--c:${it.farbe}"><span class="well">`
        + `${rune ? useSvg("i-rune", "rune-ring") : ""}${useSvg(it.symbol, "ic")}<b class="count"></b></span>`
        + `<span class="funken" aria-hidden="true"></span><span class="neu-tag" aria-hidden="true">NEU</span></button>`;
    };
    $("#slotsGear").innerHTML = C.items.filter(it => it.gruppe !== "faehigkeit").map(slot).join("");
    $("#slotsSkill").innerHTML = C.items.filter(it => it.gruppe === "faehigkeit").map(slot).join("");
    document.querySelectorAll(".slot").forEach(b => b.addEventListener("click", () => selectItem(b.dataset.id)));
  }

  /* ---------- Weg auf der Karte ---------- */
  // Je Abschnitt zwischen zwei Stationen eine kubische Kurve (Catmull-Rom), in Koordinaten der Karten-SVG (1000 × 420).
  // So lassen sich der gegangene Weg, das Laufen und der GPS-Punkt genau auf die Linie legen.
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

  function renderHud() {
    const s = state;
    document.querySelectorAll("#packRow .ic-card").forEach((c, i) => {
      const leer = i >= s.packs;
      c.classList.toggle("empty", leer);
      c.querySelector("use").setAttribute("href", leer ? "#i-card-empty" : "#i-card");
    });
    $("#packsVal").textContent = s.packs;
    $("#hudPacks").setAttribute("aria-label", `${s.packs} von ${s.max} Packs gehören dir`);
    document.querySelectorAll("#tumblers .tumbler").forEach((t, i) => {
      const v = s.ziffern[i];
      t.textContent = v == null ? "?" : v;
      t.classList.toggle("known", v != null);
    });
    $("#hudCode").setAttribute("aria-label", "Code des Kästchens: " + s.ziffern.map(v => v == null ? "unbekannt" : v).join(", "));
    const n = s.next ? questById(s.next) : null;
    $("#hudNext").classList.toggle("done", !n);
    $("#hudNextName").textContent = !n ? "Zum Kästchen" : n.id === revealPending ? "?" : n.name;
  }

  function renderQuests() {
    const verdeckt = REIHE.filter(q => !aufgedeckt(q.id));
    const ungueltig = sel[1] === NEBEL ? !verdeckt.length : !sel[1] || !aufgedeckt(sel[1]);
    if (followNext || ungueltig) sel[1] = state.next || REIHE[REIHE.length - 1].id;
    document.querySelectorAll(".q-row:not(.nebel)").forEach(b => {
      const q = questById(b.dataset.id), st = state.quests[q.id], isNext = q.id === state.next;
      b.parentElement.hidden = !aufgedeckt(q.id);
      b.className = `q-row ${q.typ} st-${st}${isNext ? " is-next" : ""}${sel[1] === q.id ? " is-selected" : ""}${q.id === revealPending ? " fogged" : ""}`;
      b.querySelector(".ic").innerHTML = questIcon(q, st, isNext);
      const mark = b.querySelector(".q-mark");
      mark.className = "q-mark" + (st === "bestanden" || st === "beendet" ? " won" : st === "verloren" ? " lost" : "");
      mark.innerHTML = isNext ? `<span class="tag now">JETZT</span>`
        : st === "laeuft" ? (q.zaehler ? `<span class="tag run">${state.treffer[q.id]}/${q.zaehler.max}</span>` : "")
        : st === "bestanden" || st === "beendet" ? useSvg("i-check") : st === "verloren" ? useSvg("i-x") : "";
      b.setAttribute("aria-label", `${q.name}, ${artWort(q)}, ${statusWort(q.id)}`);
    });
    const laufSichtbar = LAUF.some(q => aufgedeckt(q.id));
    document.querySelector('.q-sep[data-sep="lauf"]').hidden = !laufSichtbar;
    document.querySelector('.q-sep[data-sep="reihe"]').hidden = !laufSichtbar;
    const nebel = $(".q-row.nebel"), nk = verdeckteKern();
    nebel.parentElement.hidden = !verdeckt.length;
    nebel.querySelector(".q-name").textContent = nk ? `Noch ${pruefungen(nk)}` : "Im Nebel";
    nebel.classList.toggle("is-selected", sel[1] === NEBEL);
    nebel.setAttribute("aria-label", nebel.querySelector(".q-name").textContent);
    renderQuestCard(sel[1]);
  }

  function renderQuestCard(id) {
    const card = $("#questCard");
    card.classList.toggle("fogged", id === revealPending);
    if (id === NEBEL) {
      card.innerHTML = `
        <div class="qc-head">${coveredMedal()}<div><p class="tb-title">Im Nebel</p></div></div>
        <p class="tb-text">Zeigt sich, wenn es dran ist.</p>`;
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
        <div class="fx-row${st === "bestanden" ? " dim" : ""}"><span class="fx-lbl lose">NIEDERLAGE</span><span class="fx">${fxChips(q.lose, false)}</span>${kann("verloren") ? knopf("lose", `data-ergebnis="verloren"`, "VERLOREN") : ""}</div>
      </div>`;
      if (ein.duelle) unten = duellTafel(ein.duelle) + unten;
      card.classList.toggle("showdown", !!ein.duelle);
    }
    card.innerHTML = `
      <div class="qc-head">${questIcon(q, st, false)}<div><p class="tb-title">${esc(q.name)}</p><p class="tb-meta">${esc(q.ort)}</p></div></div>
      <p class="tb-text">${esc(q.text)}</p>
      ${q.logbuch && isNext ? logbuchKnopf() : ""}
      ${einsatzHtml(id)}
      ${unten}`;
    // Kleine Handys: Ist der Knopf zum Eintragen unter dem Rand, rollt die Karte hin
    const knopf = card.querySelector(".duell.jetzt, .qc-eintrag");
    card.scrollTop = 0;
    if (knopf) {
      const k = knopf.getBoundingClientRect(), c = card.getBoundingClientRect();
      if (k.bottom > c.bottom - 8) card.scrollTop += k.bottom - c.bottom + 12;
    }
  }

  /* Was Dennis bei einer Quest selbst eintragen kann (er besiegelt, der Quest Master kann zurücknehmen):
     die nächste Quest (das Log-Buch erst, wenn alle Antworten besiegelt sind), am Gipfel erst die Duelle,
     bei laufenden Quests mit Schritten den nächsten Schritt und dann das Ergebnis. Treffer der Prophezeiung bucht der Quest Master. */
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
    if (q.showdown) { const sd = showdownStand(); return { duelle: sd, ergebnis: sd.entschieden ? [sd.entschieden] : [] }; }
    return { ergebnis: ["bestanden", "verloren"] };
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

  // Einsetzbar: nur bei der Quest, die gerade dran ist oder läuft. Leuchtet, was Dennis dabeihat.
  // Schon Eingesetztes steht darunter, auch bei erledigten Quests.
  function einsatzHtml(id) {
    const schon = state.eingesetzt[id] || [];
    const teile = [];
    if (aktiv(id)) {
      const hier = E.einsetzbar(C, state, id).filter(i => state.items[i] === "besitz");
      if (hier.length) teile.push(`<div class="helps"><span class="fx-head">EINSETZBAR</span><span class="helps-row">${hier.map(i => {
        const x = itemById(i);
        return `<button type="button" class="well mini usable" data-einsetzen="${i}" data-quest="${id}" style="--c:${x.farbe}" aria-label="${esc(x.name)} einsetzen" title="${esc(x.name)}">${useSvg(x.symbol)}${x.stapel ? `<b class="count">${state.anzahl[i]}</b>` : ""}</button>`;
      }).join("")}</span></div>`);
    }
    if (schon.length) teile.push(`<p class="used-line">${useSvg("i-star")}Eingesetzt: ${schon.map(i => esc(itemById(i).name)).join(", ")}</p>`);
    return teile.join("");
  }

  function logbuchKnopf() {
    const n = C.logbuch.fragen.length, fertig = Object.keys(antworten).filter(k => +k >= 1 && +k <= n).length;
    const text = fertig >= n ? `ALLE ${n} BESIEGELT` : fertig ? `WEITER SCHREIBEN · ${fertig}/${n}` : "LOG-BUCH ÖFFNEN";
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

  /* ---------- KARTE: Weg, Dennis läuft, Stationstafel, Höhe und Strecke, GPS ---------- */
  // Wo Dennis steht: Station der nächsten Quest, am Ende die Hütte. Die Karte zeigt die zuletzt erreichte Station,
  // bis sie den Weg dorthin einmal gezeigt hat: Dennis läuft, sobald er die Karte ansieht.
  const STILL = matchMedia("(prefers-reduced-motion: reduce)");
  const hierIndex = () => { const nq = state.next ? questById(state.next) : null; return STATIONEN.findIndex(x => x.id === (nq ? nq.station : ZIEL)); };
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
        ? `<span class="m-chest${s.next ? "" : " open"}">${useSvg("i-chest")}</span>`
        : kerne.map(k => aufgedeckt(k.id) ? medalHtml(k, s.quests[k.id], k.id === s.next) : coveredMedal()).join("");
      m.querySelector(".gems").innerHTML = sides.filter(q => aufgedeckt(q.id)).map(q => gemHtml(s.quests[q.id], q.id === s.next)).join("");
      m.classList.toggle("is-selected", id === sel[0]);
      m.querySelector(".you")?.remove();
      if (id === hier) m.insertAdjacentHTML("afterbegin", `<span class="you" title="Du bist hier"></span>`);
    });
    // Gegangener Weg golden, Nebel über dem Weg ab der Mitte zur nächsten Station
    if (!laufFrame) $("#mapDone").setAttribute("d", pfad(kartenHier));
    const weiter = STATIONEN[kartenHier + 1];
    $("#mapFog").hidden = !(s.next && weiter);
    if (s.next && weiter) $("#mapFog").style.left = ((STATIONEN[kartenHier].x + weiter.x) / 2) + "%";
    renderLegende();
    renderGpsPunkt();
    if (!$("#stationCard").hidden) renderStationstafel();
    if (page === 0) spieleLauf();
  }

  // Dennis läuft von der zuletzt gezeigten Station zur neuen, der Weg hinter ihm wird golden
  function spieleLauf() {
    const hi = hierIndex(), von = kartenHier;
    if (laufFrame || von === null || hi <= von) return;
    if (page !== 0 || !$("#introScreen").hidden || !$("#overlay").hidden || !$("#prolog").hidden) return;
    if (STILL.matches || hi - von > 3) { kartenHier = hi; renderMap(); return; }
    const walker = $("#mapWalker"), sheet = $("#mapSheet");
    const abschnitte = hi - von, dauer = Math.min(2600, 1300 * abschnitte), t0 = performance.now();
    const ease = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    sheet.classList.add("walking");
    walker.hidden = false;
    const schritt = jetzt => {
      const g = Math.min(1, (jetzt - t0) / dauer), x = ease(g) * abschnitte;
      const i = Math.min(von + Math.floor(x), hi - 1), f = Math.min(1, von + x - i);
      const [px, py] = alsProzent(bez(ABSCHNITTE[i], f));
      walker.style.left = px + "%"; walker.style.top = py + "%";
      $("#mapDone").setAttribute("d", pfad(i, f));
      if (g < 1) { laufFrame = requestAnimationFrame(schritt); return; }
      laufFrame = null; kartenHier = hi;
      walker.hidden = true; sheet.classList.remove("walking");
      renderMap();
      melody("plus");
      kartenHinweis();
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
    const q = qs.find(x => x.id === state.next) || qs.find(x => aufgedeckt(x.id));
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
    const zahlen = w ? `${meter(w.hoehe)} · ${km(w.s)} ab Bahnhof` : "";
    const qs = REIHE.filter(q => q.station === id), sicht = qs.filter(q => aufgedeckt(q.id));
    const imNebel = qs.filter(q => q.typ === "kern" && !aufgedeckt(q.id)).length;
    const status = qid => qid === state.next ? `<span class="tag now">JETZT</span>`
      : state.quests[qid] === "bestanden" ? `<span class="sc-st won">${useSvg("i-check")}</span>`
      : state.quests[qid] === "verloren" ? `<span class="sc-st lost">${useSvg("i-x")}</span>` : "";
    const zeilen = sicht.map(q => `<button type="button" class="sc-row" data-quest="${q.id}"><span class="ic">${questIcon(q, state.quests[q.id], false)}</span><span class="sc-name">${esc(q.name)}</span>${status(q.id)}</button>`);
    if (imNebel) zeilen.push(`<button type="button" class="sc-row nebel" data-quest="${NEBEL}"><span class="ic">${coveredMedal()}</span><span class="sc-name">${pruefungen(imNebel)} im Nebel</span></button>`);
    if (!qs.length) {
      const fehlt = state.ziffern.filter(v => v == null).length;
      zeilen.push(`<button type="button" class="sc-row sc-chest" data-code><span class="ic">${useSvg("i-chest")}</span><span class="sc-name">Das Kästchen<small>${state.packs} von ${state.max} Packs gehören dir${fehlt ? ` · ${fehlt === 1 ? "eine Ziffer fehlt" : fehlt + " Ziffern fehlen"}` : ""}</small></span>`
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

  /* Kartusche: Höhe, Strecke bis zum Gipfel und das Höhenprofil des echten Wegs (weg.js, config.karte.weg) */
  const WEG = window.QuestWeg ? window.QuestWeg.aufbauen(C.karte) : null;
  const GPS_KEY = "dq-gps" + (PROBE ? "-probe" : "");
  const gps = { an: false, watch: null, lage: null, genau: null, hinweis: "" };
  try { gps.an = localStorage.getItem(GPS_KEY) === "1"; } catch (_) {}
  let profilY = null;

  function buildLegende() {
    if (!WEG) { $("#mapLegend").hidden = true; return; }
    if (!("geolocation" in navigator)) $("#gpsBtn").hidden = true;
    const hs = WEG.weg.map(p => p[2]), lo = Math.min(...hs) - 25, top = Math.max(WEG.ziel.hoehe, ...hs) + 12;
    const X = s => s / WEG.laenge * 200;
    profilY = h => 40 - (h - lo) / (top - lo) * 38;
    const pts = WEG.weg.map((p, i) => `${X(WEG.cum[i]).toFixed(1)} ${profilY(p[2]).toFixed(1)}`);
    $("#mlLine").setAttribute("d", "M" + pts.join(" L"));
    $("#mlArea").setAttribute("d", "M0 40 L" + pts.join(" L") + " L200 40Z");
    // Stationen als Rauten auf dem Profil, dazu der Punkt, wo Dennis gerade ist
    $("#mlProfil").insertAdjacentHTML("beforeend", STATIONEN.filter(st => WEG.station[st.id]).map(st =>
      `<i class="p-st" data-station="${st.id}" style="left:${X(WEG.station[st.id].s) / 2}%;top:${profilY(WEG.station[st.id].hoehe) / 40 * 100}%"></i>`).join("") + `<i class="p-du" id="mlDu"></i>`);
    $("#gpsBtn").addEventListener("click", e => { e.stopPropagation(); gpsUmschalten(); });
  }

  function renderLegende() {
    if (!WEG) return;
    let wert, wo, rest, s = null;
    const hi = kartenHier ?? hierIndex(), st = STATIONEN[hi], w = WEG.station[st.id];
    const bisGipfel = (s, h) => s >= WEG.ziel.s - 40 ? "Gipfel erreicht." : `Noch ${km(WEG.ziel.s - s)} · ${zahl(Math.max(0, WEG.ziel.hoehe - h))} Hm bis zum Gipfel`;
    if (gps.an && gps.lage) {
      const { abstand, luft } = gps.lage;
      if (abstand <= 250) { s = gps.lage.s; const h = WEG.hoeheBei(s); wert = meter(h); wo = gps.genau > 60 ? `GPS ±${Math.round(gps.genau)} m` : "GPS"; rest = bisGipfel(s, h); }
      else if (luft > 2000) { wert = km(luft); wo = "Luftlinie"; rest = `bis zum ${C.karte.start}`; }
      else { wert = meter(abstand); wo = "neben dem Weg"; rest = "Am Weg zeigt dich die Karte."; }
    } else if (w) { s = w.s; wert = meter(w.hoehe); wo = st.name; rest = bisGipfel(w.s, w.hoehe); }
    else { wert = km(WEG.ziel.s); wo = "am Samstag"; rest = `${zahl(WEG.ziel.hoehe - WEG.hoeheBei(0))} Hm vom ${C.karte.start} zum Gipfel`; }
    if (gps.an && !gps.lage) rest = "GPS sucht dich …";
    if (gps.hinweis) rest = gps.hinweis;
    $("#mlWert").textContent = wert;
    $("#mlWo").textContent = wo;
    $("#mlRest").textContent = rest;
    const b = $("#gpsBtn");
    b.setAttribute("aria-pressed", String(gps.an));
    b.classList.toggle("sucht", gps.an && !gps.lage);
    document.querySelectorAll("#mlProfil .p-st").forEach(el => {
      const i = STATIONEN.findIndex(x => x.id === el.dataset.station);
      el.classList.toggle("done", i < hi);
      el.classList.toggle("hier", i === hi);
    });
    const du = $("#mlDu");
    du.hidden = s == null;
    du.classList.toggle("gps", !!(gps.an && gps.lage && gps.lage.abstand <= 250));
    if (s != null) { du.style.left = s / WEG.laenge * 100 + "%"; du.style.top = profilY(WEG.hoeheBei(s)) / 40 * 100 + "%"; }
  }

  // GPS-Stelle am Weg (Meter ab Bahnhof) auf die gezeichnete Karte: zwischen zwei Stationen anteilig auf ihrem Abschnitt.
  // Vom Bahnhof bis zur ersten Station liegt der Punkt auf der zweiten Hälfte des Abschnitts davor (Anreise).
  function kartenPunkt(s) {
    const mit = STATIONEN.map((st, i) => ({ i, s: WEG.station[st.id] && WEG.station[st.id].s })).filter(x => x.s != null);
    const erste = mit[0];
    if (s <= erste.s) return erste.i ? bez(ABSCHNITTE[erste.i - 1], .5 + .5 * Math.max(0, s) / erste.s) : PUNKTE[erste.i];
    for (let k = 0; k < mit.length - 1; k++) {
      const a = mit[k], b = mit[k + 1];
      if (s > b.s) continue;
      const x = a.i + (s - a.s) / (b.s - a.s) * (b.i - a.i), i = Math.min(Math.floor(x), ABSCHNITTE.length - 1);
      return bez(ABSCHNITTE[i], x - i);
    }
    return PUNKTE[mit[mit.length - 1].i];
  }
  function renderGpsPunkt() {
    const p = $("#mapGps"), l = gps.lage;
    p.hidden = !(WEG && gps.an && l && l.abstand <= 250);
    if (p.hidden) return;
    const [x, y] = alsProzent(kartenPunkt(l.s));
    p.style.left = x + "%"; p.style.top = y + "%";
  }

  // GPS läuft nur, solange die Karte offen ist (Akku). Die Wahl merkt sich das Handy.
  function gpsStart() {
    if (!WEG || !gps.an || gps.watch !== null || !("geolocation" in navigator)) return;
    gps.watch = navigator.geolocation.watchPosition(pos => {
      const { latitude: la, longitude: lo, accuracy } = pos.coords, p = WEG.projizieren(la, lo);
      gps.lage = { s: p.s, abstand: p.abstand, luft: WEG.luftlinie(la, lo) };
      gps.genau = accuracy; gps.hinweis = "";
      renderLegende(); renderGpsPunkt();
    }, err => {
      if (err.code === 1) {
        gpsStopp(); gps.an = false; gps.lage = null;
        gps.hinweis = "Standort ist aus. Erlaube ihn in den Einstellungen.";
        try { localStorage.setItem(GPS_KEY, "0"); } catch (_) {}
      } else if (!gps.lage) gps.hinweis = "Kein GPS-Signal. Ich suche weiter.";
      renderLegende(); renderGpsPunkt();
    }, { enableHighAccuracy: true, maximumAge: 15000, timeout: 30000 });
  }
  function gpsStopp() {
    if (gps.watch !== null) navigator.geolocation.clearWatch(gps.watch);
    gps.watch = null;
  }
  function gpsUmschalten() {
    gps.an = !gps.an; gps.hinweis = "";
    try { localStorage.setItem(GPS_KEY, gps.an ? "1" : "0"); } catch (_) {}
    if (gps.an) { tone("confirm"); gpsStart(); }
    else { tone("move"); gpsStopp(); gps.lage = null; }
    renderLegende(); renderGpsPunkt();
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden) gpsStopp(); else if (page === 0) gpsStart(); });

  // Ausrüstung: vier Zustände, überall gleich (08-erlebnis-plan.md, 3.8 und 3.12):
  // Schatten = noch nicht erspielt, Farbe mit Goldrand = deins, leuchtet = jetzt einsetzbar, grau = verbraucht oder verloren.
  function renderEquip() {
    const jetzt = E.jetztEinsetzbar(C, state);
    if (!sel[2]) sel[2] = [...jetzt][0] || state.erhalten[state.erhalten.length - 1] || "beutel";
    document.querySelectorAll(".slot").forEach(b => {
      const id = b.dataset.id, st = state.items[id], x = itemSicht(id), schatten = verborgen(id);
      b.className = `slot${b.classList.contains("rune") ? " rune" : ""} st-${schatten ? "nicht" : st}${schatten ? " schatten" : ""}${entgangen(id) ? " entgangen" : ""}`
        + `${!schatten && jetzt.has(id) ? " usable" : ""}${neuMarke.has(id) ? " neu" : ""}${fundLaeuft.has(id) ? " fund" : ""}${sel[2] === id ? " is-selected" : ""}`;
      b.querySelector(".ic use").setAttribute("href", "#" + x.symbol);
      b.querySelector(".count").textContent = x.stapel && !schatten && st === "besitz" ? "×" + state.anzahl[id] : "";
      b.setAttribute("aria-label", `${x.name}, ${schatten ? "noch nicht erspielt" : { besitz: jetzt.has(id) ? "jetzt einsetzbar" : "im Beutel", verloren: "verloren", verbraucht: "verbraucht" }[st]}`);
    });
    renderItemBox(sel[2]);
  }

  // Textbox zum gewählten Feld: Name, Beschreibung und ein Satz dazu, woher es kommt oder wo es jetzt hilft.
  // Eine Quest steht nur da, wenn sie schon aus dem Nebel getreten ist.
  function renderItemBox(id) {
    const box = $("#itemBox");
    const x = itemSicht(id), st = state.items[id], jetzt = E.jetztEinsetzbar(C, state), schatten = verborgen(id), q = quelle(id);
    const em = qid => `<em>${esc(questById(qid).name)}</em>`;
    let tag = "", extra = "";
    if (schatten) {
      if (q) extra = entgangen(id) ? `Entgangen bei ${em(q.id)}.` : aufgedeckt(q.id) ? `Zu erbeuten bei ${em(q.id)}.` : "Wartet noch im Nebel.";
    } else if (st === "verloren") {
      tag = `<span class="tag lost">VERLOREN</span>`;
      const nahm = C.quests.find(k => (k.lose && k.lose.items || []).includes(id) && state.quests[k.id] === "verloren");
      if (nahm) extra = `Verloren bei ${em(nahm.id)}.`;
    } else if (st === "verbraucht") {
      tag = `<span class="tag open">VERBRAUCHT</span>`;
      const bei = Object.keys(state.eingesetzt).filter(k => state.eingesetzt[k].includes(id)).pop();
      if (bei) extra = `Eingesetzt bei ${em(bei)}.`;
    } else if (jetzt.has(id)) {
      tag = `<span class="tag now">JETZT</span>`;
      const wo = E.aktuelleQuests(C, state).filter(qid => E.einsetzbar(C, state, qid).includes(id));
      extra = `Einsetzbar bei ${wo.map(em).join(" und ")}.`;
    } else if (q && state.quests[q.id] !== "offen") extra = `Erbeutet bei ${em(q.id)}.`;
    if (!schatten && neuMarke.has(id)) tag = `<span class="tag won">NEU</span>` + tag;
    box.style.setProperty("--c", x.farbe);
    box.classList.toggle("schatten", schatten);
    box.innerHTML = `<span class="ib-stage">${useSvg(x.symbol, "ib-icon")}</span><p class="tb-title">${esc(x.name)}${tag}</p>`
      + `<p class="tb-text">${esc(x.text)}${extra ? ` <span class="ib-use">${extra}</span>` : ""}</p>`
      + (!schatten && jetzt.has(id) ? `<button type="button" class="qc-action ib-einsetzen" data-einsetzen="${id}">${useSvg("i-seal")}EINSETZEN</button>` : "");
    box.classList.toggle("mit-knopf", !schatten && jetzt.has(id));
  }

  function selectItem(id, play = true) {
    sel[2] = id;
    if (play && neuMarke.delete(id)) { renderEquip(); tone("move"); return; }   // Antippen nimmt die Marke NEU
    document.querySelectorAll(".slot").forEach(b => b.classList.toggle("is-selected", b.dataset.id === id));
    renderItemBox(id);
    if (play) tone("move");
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
    $("#overlay").hidden = false;
    r.style.animation = "none"; void r.offsetWidth; r.style.animation = "";
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
  }

  /* ---------- Verpasste Momente nachholen (08-erlebnis-plan.md, 3.6) ---------- */
  // Jedes Handy merkt sich den Stand, den Dennis zuletzt im Menü gesehen hat. Ist seitdem etwas passiert (App war zu,
  // Startbildschirm offen, kein Netz), laufen die Momente nach PRESS START nacheinander: jede Quest einzeln in der
  // Reihenfolge, in der sie entschieden wurde, danach alles andere. Die nächste Quest tritt erst am Ende aus dem Nebel.
  const GESEHEN_KEY = "dq-gesehen-v1" + (PROBE ? "-probe" : "");
  let gesehenDoc = null, schlange = [];
  try { if (!DEMO) gesehenDoc = JSON.parse(localStorage.getItem(GESEHEN_KEY) || "null"); } catch (e) {}
  function merkeGesehen() {
    gesehenDoc = lastDoc;
    try { if (!DEMO && lastDoc) localStorage.setItem(GESEHEN_KEY, JSON.stringify(lastDoc)); } catch (e) {}
  }
  function nachholen() {
    const alt = gesehenDoc && E.normalize(gesehenDoc), neu = lastDoc && E.normalize(lastDoc);
    merkeGesehen();
    if (!alt || !neu || JSON.stringify({ ...alt, stand: 0 }) === JSON.stringify({ ...neu, stand: 0 })) return;
    const reihe = C.quests.map(q => q.id), zeit = id => Number(neu.zeiten[id]) || 9e15;
    const ids = reihe.filter(id => (alt.quests[id] || "offen") !== (neu.quests[id] || "offen"))
      .sort((x, y) => zeit(x) - zeit(y) || reihe.indexOf(x) - reihe.indexOf(y));
    const docs = [alt];
    ids.forEach(id => {
      const d = JSON.parse(JSON.stringify(docs[docs.length - 1]));
      if (neu.quests[id]) d.quests[id] = neu.quests[id]; else delete d.quests[id];
      if (neu.zeiten[id]) d.zeiten[id] = neu.zeiten[id]; else delete d.zeiten[id];
      docs.push(d);
    });
    docs.push(neu);
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
    const fertig = C.quests.filter(q => prev.quests[q.id] !== next.quests[q.id] && ["bestanden", "verloren", "beendet"].includes(next.quests[q.id]));
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
      b: prevDoc.buchungen.filter(b => !nB.has(b.id))
    };
    const vorwaerts = fertig.length || gestartet.length || treffer.length || schritte.length || neueE.length || neueD.length || neueB.length;
    if (!vorwaerts && Object.values(weg).some(x => x.length)) return zurueckgenommen(prev, next, weg);
    if (!vorwaerts && !handItems) return false;

    // Zeilen: Packs, Ziffern, Items (mit Enthüllung beim ersten Fund)
    const lines = [];
    const dPacks = next.packs - prev.packs;
    if (dPacks) lines.push(`<li class="${dPacks > 0 ? "plus" : "minus"}"><span class="ri">${cardSvg()}</span>${dPacks > 0 ? "+" : "−"}${Math.abs(dPacks)} ${packsWort(dPacks)}</li>`);
    next.ziffern.forEach((v, i) => {
      if (v != null && prev.ziffern[i] == null) lines.push(`<li class="plus"><span class="ri"><span class="tumbler known" style="--hud-h:30px">${v}</span></span>Ziffer ${i + 1}: ${v}</li>`);
    });
    C.items.forEach(it => {
      const erstmals = prev.items[it.id] === "nicht";
      if (it.stapel) {
        const d = next.anzahl[it.id] - prev.anzahl[it.id];
        if (d > 0) lines.push(itemZeile(it.id, `+${d} ${esc(it.name)}`, "plus", erstmals));
        if (d < 0) lines.push(itemZeile(it.id, `${esc(it.name)} eingesetzt`, "minus"));
        return;
      }
      if (prev.items[it.id] !== "besitz" && next.items[it.id] === "besitz") lines.push(itemZeile(it.id, esc(it.name), "plus", erstmals));
      if (prev.items[it.id] === "besitz" && next.items[it.id] === "verloren") lines.push(itemZeile(it.id, `${esc(it.name)} weg`, "minus"));
      if (prev.items[it.id] === "besitz" && next.items[it.id] === "verbraucht") lines.push(itemZeile(it.id, `${esc(it.name)} eingesetzt`, "minus"));
    });
    // Nicht verbrauchende Einsätze (Kreisel, Pistole …) bekommen trotzdem eine Zeile
    neueE.forEach(e => { if (!itemById(e.item).einmalig) lines.push(itemZeile(e.item, `${esc(itemById(e.item).name)} eingesetzt`, "plus")); });
    // Packs zählen nur zwischen 0 und max (engine.js): sagen, warum sich weniger bewegt hat als gedacht
    if (next.kappung.unten > prev.kappung.unten) lines.push(`<li><span class="ri">${cardSvg("empty")}</span>${prev.packs ? "Mehr Packs hattest du nicht." : "Du hattest keine Packs mehr, die du verlieren konntest."}</li>`);
    if (next.kappung.oben > prev.kappung.oben) lines.push(`<li class="plus"><span class="ri">${cardSvg()}</span>Alle Packs im Kästchen gehören schon dir.</li>`);

    // Neue Packs und Ziffern im HUD aufblinken lassen
    document.querySelectorAll("#packRow .ic-card").forEach((c, i) => c.classList.toggle("gain", i >= prev.packs && i < next.packs));
    document.querySelectorAll("#tumblers .tumbler").forEach((t, i) => t.classList.toggle("gain", next.ziffern[i] != null && prev.ziffern[i] == null));

    let head, klang = dPacks < 0 ? "minus" : "plus", gross = false;
    if (fertig.length) {
      const q = fertig[0], st = next.quests[q.id], won = st !== "verloren";
      const art = q.typ === "kern" ? "PRÜFUNG" : q.typ === "side" ? "SIDEQUEST" : "QUEST";
      const farbe = q.typ === "side" ? "#3ddc97" : q.farbe;
      klang = !won ? "verloren" : q.typ === "kern" ? "pruefung" : "side";
      gross = true;
      head = `${stage(q, won, farbe)}<p class="big${won ? "" : " lost"}">${art} ${st === "beendet" ? "BEENDET" : won ? "BESTANDEN" : "VERLOREN"}</p>
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
      if (!lines.length) lines.push(`<li><span class="ri"></span>Jetzt zusammensetzen, bevor der Tag endet.</li>`);
    } else if (neueE.length) {
      const e = neueE[neueE.length - 1], it = itemById(e.item);
      klang = "zauber";
      head = `<span class="ri-big" style="color:${it.farbe}">${useSvg(it.symbol)}</span><p class="big">${esc(it.name.toUpperCase())}</p><p class="sub">eingesetzt bei ${esc(questById(e.quest).name)}</p>`;
      if (it.id === "spruchrolle") lines.push(`<li><span class="ri"></span>Der Fluch ist gesprochen. Welche Gestalt er annimmt, enthüllt dir der Quest Master.</li>`);
    } else if (neueD.length) {
      const k = neueD[0], sieg = next.duelle[k] === "sieg";
      klang = sieg ? "plus" : "minus";
      head = `<span class="ri-big">${useSvg(sieg ? "i-check" : "i-x")}</span><p class="big${sieg ? "" : " lost"}">DUELL ${k} ${sieg ? "GEWONNEN" : "VERLOREN"}</p><p class="sub">Prüfung des Bundes</p>`;
    } else if (neueB.length) {
      const b = neueB[neueB.length - 1];
      const titel = b.ziffer ? "ZIFFER GEKAUFT" : b.item ? "GESCHENK" : dPacks < 0 ? "PACKS WEG" : dPacks > 0 ? "PACKS DAZU" : "BUCHUNG";
      head = `<span class="ri-big">${cardSvg()}</span><p class="big${dPacks < 0 && !b.ziffer ? " lost" : ""}">${titel}</p><p class="sub">${esc(b.grund || "Buchung vom Quest Master")}</p>`;
      if (!lines.length) lines.push(`<li><span class="ri"></span>Du hattest keine Packs mehr, es bleibt bei 0.</li>`);
    } else {
      head = `<span class="ri-big">${useSvg("i-beutel")}</span><p class="big">DEIN BEUTEL</p><p class="sub">Der Quest Master hat etwas geändert.</p>`;
      if (!lines.length) return false;
    }
    // Die nächste Quest wird erst nach dem Fenster aufgedeckt, darum steht ihr Name hier nicht
    const warSichtbar = id => prev.quests[id] !== "offen" || prev.next === id;
    if (!opt.kette && next.next && !warSichtbar(next.next)) revealPending = next.next;
    const fq = fertig[0] || gestartet[0];
    if (fq) fensterQuest = { id: fq.id, status: next.quests[fq.id] };
    melody(klang);
    showOverlay({ head, lines: lines.join(""), next: next.next || !fertig.length ? "" : "Zum Kästchen", gross }, !opt.kette && (fertig.length || gestartet.length) ? showNextQuest : null);
    renderHud(); renderQuests();
    return true;
  }

  // Der Quest Master hat etwas zurückgenommen: Die Fee sagt es Dennis. Packs, Items und Nebel springen still mit zurück.
  function zurueckgenommen(prev, next, weg) {
    const zeilen = [];
    weg.q.forEach(q => zeilen.push([questIcon(q, "offen", false), `Der Quest Master hat das Ergebnis von <b>${esc(q.name)}</b> zurückgenommen.`
      + (q.id === next.next ? " Trag es neu ein." : next.quests[q.id] === "laeuft" ? " Die Quest läuft wieder." : "")]));
    weg.d.forEach(k => zeilen.push([useSvg("z-triforce"), `Duell ${esc(k)} ist wieder offen. Trag es neu ein.`]));
    weg.s.forEach(q => q.schritte.filter(sx => prev.schritte[q.id][sx.id] && !next.schritte[q.id][sx.id])
      .forEach(sx => zeilen.push([questIcon(q, "laeuft", false), `${esc(q.name)}: „${esc(sx.name)}“ ist zurückgenommen.`])));
    weg.e.forEach(e => { const it = itemById(e.item); if (it) zeilen.push([`<span style="color:${it.farbe}">${useSvg(it.symbol)}</span>`, `Der Einsatz von <b>${esc(it.name)}</b> ist zurückgenommen.`]); });
    weg.b.forEach(b => zeilen.push([cardSvg(), b.ziffer ? `Der Kauf von Ziffer ${esc(b.ziffer)} ist zurückgenommen.` : `Die Buchung „${esc(b.grund || "Buchung")}“ ist zurückgenommen.`]));
    const mehr = zeilen.length > 4 ? zeilen.length - 3 : 0;
    const lines = zeilen.slice(0, mehr ? 3 : 4).map(([ic, t]) => `<li><span class="ri">${ic}</span><span>${t}</span></li>`).join("")
      + (mehr ? `<li><span class="ri"></span><span>und ${mehr} weitere Einträge</span></li>` : "");
    melody("minus");
    showOverlay({ head: `<span class="ri-big fee"><img src="assets/fee.png" alt=""></span><p class="big">ZURÜCKGENOMMEN</p><p class="sub">vom Quest Master</p>`, lines, next: "" });
    renderHud(); renderQuests();
    return true;
  }

  function explainPacks() {
    const s = state;
    showOverlay({
      head: `<span class="ri-big">${cardSvg()}</span><p class="big">${s.packs} / ${s.max} PACKS</p>`,
      lines: `<li><span class="ri">${cardSvg()}</span>deins</li>
              <li><span class="ri">${cardSvg("empty")}</span>beim Bund</li>`,
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
        : s.quests[q.id] === "verloren" ? `verloren, am Kästchen ${C.ziffer_preis} ${packsWort(C.ziffer_preis)}` : `jetzt: ${wo}`;
      // Nach der letzten Quest tauscht Dennis fehlende Ziffern selbst gegen Packs
      const kauf = v == null && !s.next ? (s.packs >= C.ziffer_preis
        ? `<button type="button" class="qc-eintrag win kauf" data-kauf="${i + 1}">KAUFEN · ${C.ziffer_preis} ${packsWort(C.ziffer_preis).toUpperCase()}</button>` : `<small class="kauf-fehlt">zu wenig Packs</small>`) : "";
      return `<li class="${v == null ? "" : "plus"}"><span class="ri"><span class="tumbler${v == null ? "" : " known"}" style="--hud-h:30px">${v == null ? "?" : v}</span></span><span>${v == null ? (s.next ? offen : "fehlt") : s.gekauft[i] ? "gekauft" : wo}</span>${kauf}</li>`;
    }).join("");
    showOverlay({
      head: `<span class="ri-big lock">${useSvg("i-lock")}</span><p class="big">CODE</p>`,
      lines,
      next: ""
    });
  }

  /* ---------- Navigation: drei Seiten, Drehung um 120° ---------- */
  // Abstand jeder Seite zur Drehachse = Breite / (2 · tan 60°), in px gesetzt
  const setApo = () => document.documentElement.style.setProperty("--apo", ($(".stage").clientWidth * 0.288675).toFixed(1) + "px");
  new ResizeObserver(setApo).observe($(".stage"));
  setApo();
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
    const cube = $("#menuCube");
    cube.style.transition = "none";
    cube.classList.remove("flat");
    cube.style.transform = `translateZ(calc(-1 * var(--apo))) rotateY(${-angle}deg)`;
    void cube.offsetWidth;
    angle += dir * 120;
    cube.style.transition = "";
    cube.style.transform = `translateZ(calc(-1 * var(--apo))) rotateY(${-angle}deg)`;
    page = target;
    setActiveFace();
    if (page !== 0) { gpsStopp(); schliesseStationstafel(); }
    tone("move");
    clearTimeout(flatTimer);
    flatTimer = setTimeout(() => {
      cube.classList.add("flat");
      if (page === 1) { const row = document.querySelector(".q-row.is-selected"); if (row) scrollIntoList(row); }
      if (page === 2 && $("#overlay").hidden) { if (!onboarded()) onboarding(); else funde(); }
      if (page === 0) { gpsStart(); spieleLauf(); if (!laufFrame) kartenHinweis(); }
    }, 470);
  }

  /* ---------- Onboarding: erster Besuch der Ausrüstung ---------- */
  // Erst das Fundfenster mit Enthüllung des Beutels, dann tritt er in seinem Feld aus dem Schatten, dann kurze Hinweise.
  function onboarding() {
    const x = itemById("beutel");
    melody("pruefung");
    showOverlay({
      head: `<span class="medal-stage won" style="--m:${x.farbe}"><span class="medal">${useSvg(x.symbol)}</span></span><p class="big">ERSTES ITEM GEFUNDEN</p><p class="sub">${esc(x.tarn.name)}</p>`,
      lines: `<li class="plus reveal"><span class="ri" style="color:${x.farbe}">${useSvg(x.symbol)}</span><span><small class="tarn">${esc(x.tarn.name)} entpuppt sich als</small>${esc(x.name)}</span></li>`,
      next: "", gross: true
    }, () => {
      beutelGezeigt = true;
      obMerken(OB_KEY);
      funde();                                   // erster Besuch: alles, was da ist, gilt als gesehen
      aufleuchten(["beutel"]);
      setTimeout(() => coach([
        [$("#slotsGear").parentElement, "Hier landet, was du dir erspielst. Die Schatten zeigen, was noch zu holen ist."],
        [$("#slotsSkill").parentElement, "Hier ruhen Flüche und Segen, sobald du sie dir verdient hast."],
        [$(".equip-body"), "Was leuchtet, kannst du bei der aktuellen Quest einsetzen: antippen, dann das Siegel halten."],
        [$(".hud"), "Packs und Ziffern für dein Kästchen."]
      ]), STILL.matches ? 0 : 1100);
    });
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
      [hier, "Hier stehst du. Tippe eine Station an: Du siehst, was dort war und was dort wartet."],
      ...(WEG ? [[$("#mapLegend"), "Höhe und Weg bis zum Gipfel. Tippe GPS, dann zeigt dir die Karte am Berg, wo du wirklich bist."]] : [])
    ]);
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
        { bild: `<span class="pb-titel"><small>Willkommen auf deinem</small><b>Mini-JGA</b></span>`, ton: "pruefung",
          text: "Willkommen auf deinem Mini-JGA! Ab jetzt weiche ich dir nicht mehr von der Seite." },
        // Die Reise: vom Zug bis zum Gipfel, jede Prüfung noch im Nebel
        { bild: `<span class="pb-reise"><span class="pb-ort">${useSvg("i-train")}</span>${Array.from({ length: pruefungen }, (_, k) =>
            `<span class="medal covered" style="--k:${k + 1}"><b>?</b></span>`).join("")}<span class="pb-ort gipfel" style="--k:${pruefungen + 1}">${useSvg("i-mountain")}</span></span>`,
          text: "Das wird eine Reise, vom Zug bis auf den Gipfel. Und unterwegs wirst du geprüft werden." },
        { bild: `<span class="pb-chest">${useSvg("i-chest")}${useSvg("i-lock", "pb-lock")}</span><span class="pb-cards${max > 10 ? " two" : ""}" style="--n:${max > 10 ? Math.ceil(max / 2) : max}">${karten(max)}</span>`,
          text: `Der Bund hat ein Kästchen verschlossen. Darin liegen ${max} Packs.` },
        { bild: `<span class="pb-gain">${cardSvg()}<b>+</b></span><span class="pb-tumblers">${C.code.map(() => `<span class="tumbler">?</span>`).join("")}</span>`,
          text: "Jede Prüfung bringt dir Packs, manche eine Ziffer des Codes. Verlierst du, holt sich der Bund Packs zurück." },
        { bild: `<span class="pb-split"><span class="pb-cards mine" style="--n:${Math.min(halb, 10)}">${karten(halb)}</span><small>deins</small></span><span class="pb-split"><span class="pb-cards" style="--n:${Math.min(max - halb, 10)}">${karten(max - halb, "empty")}</span><small>beim Bund</small></span>`,
          text: `Was am Ende dir gehört, nimmst du mit. Deine ${state && state.zaehler.erledigt ? "nächste" : "erste"} Prüfung wartet schon.` }
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
      if (uebersprungen) return tone("move");
      tone("confirm");
      // Kurzer Rundgang durch das Menü, gesprochen von der Fee
      setTimeout(() => coach([
        [$("#hudPacks"), "Deine Packs. Jede Karte, die leuchtet, gehört dir."],
        [$("#hudCode"), "Der Code des Kästchens. Hier rastet jede Ziffer ein."],
        [$(".shoulder-right"), "Mit Z und R oder Wischen blätterst du: Karte, Quests, Ausrüstung."],
        [$("#questCard"), "Hier steht, was jetzt dran ist und was auf dem Spiel steht. Dein Ergebnis trägst du hier selbst ein."]
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
    return { start, weiter, ende, pruefen };
  })();

  function coach(schritte) {
    const bubble = $("#coach");
    let i = -1, ziel = null;
    const weiter = () => {
      if (ziel) ziel.classList.remove("coach-focus");
      if (++i >= schritte.length) { bubble.hidden = true; bubble.onclick = null; return; }
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
      b.style.animation = "none"; void b.offsetWidth; b.style.animation = "";
      tone("move");
    };
    bubble.onclick = weiter;
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
    const row = document.querySelector(`.q-row[data-id="${id}"]`), card = $("#questCard");
    if (row) { scrollIntoList(row); row.classList.remove("fogged"); row.classList.add("revealing"); }
    if (sel[1] === id) { card.classList.remove("fogged"); card.classList.add("revealing"); }
    renderHud();
    melody("nebel");
    setTimeout(() => { row?.classList.remove("revealing"); card.classList.remove("revealing"); }, 1400);
  }

  document.querySelectorAll("[data-nav]").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); turn(b.dataset.nav === "next" ? 1 : -1); }));
  $("#hudNext").addEventListener("click", () => { if (state && !state.next) { tone("confirm"); explainCode(); } else showNextQuest(); });   // am Ende: zum Kästchen
  $("#hudPacks").addEventListener("click", explainPacks);
  $("#hudCode").addEventListener("click", explainCode);
  $("#overlay").addEventListener("click", e => {
    const k = e.target.closest("[data-kauf]");
    closeOverlay();
    if (k) schwurZiffer(+k.dataset.kauf);
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
    if (!$("#introScreen").hidden || !$("#logbuch").hidden) return;
    const k = e.key.toLowerCase();
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
    if (page === 1) { const ids = [...document.querySelectorAll(".quest-list li:not([hidden]) .q-row")].map(b => b.dataset.id); followNext = false; selectQuest(ids[(ids.indexOf(sel[1]) + step + ids.length) % ids.length]); }
    if (page === 0) { const ids = STATIONEN.map(s => s.id); selectStation(ids[(ids.indexOf(sel[0]) + step + ids.length) % ids.length]); }
    if (page === 2) { const ids = [...document.querySelectorAll(".slot")].map(b => b.dataset.id); selectItem(ids[(ids.indexOf(sel[2]) + step + ids.length) % ids.length]); }
  });

  /* ---------- Log-Buch: Dennis tippt, besiegelt, dann spricht Rike ---------- */
  const logbuch = (() => {
    const el = $("#logbuch"), fragen = C.logbuch.fragen;
    const quellen = {};             // nr → Blob-URL (vorab geladen) oder false (Datei fehlt noch)
    let nr = 1, spieler = null, laeuft = false;

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
        $("#lbFrage").textContent = "Alle Antworten sind besiegelt. Trag jetzt auf der Quest-Karte ein, ob du bestanden hast.";
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
      const url = quellen[nr];
      el.classList.add("playing"); laeuft = true;
      const ende = () => { laeuft = false; el.classList.remove("playing"); };
      if (url) {
        spieler = new Audio(url);
        spieler.addEventListener("ended", ende);
        spieler.play().catch(() => { ende(); $("#lbWho").textContent = "RIKE · TIPP AUF ▶"; });
      } else {
        // Platzhalter, solange Rikes Sprachnachricht fehlt (oder noch lädt)
        $("#lbWho").textContent = quellen[nr] === null ? "RIKE · LÄDT NOCH" : "RIKE · FOLGT NOCH";
        const ms = melody("stimme");
        setTimeout(ende, ms + 300);
      }
    }
    function stoppen() { if (spieler) { spieler.pause(); spieler = null; } laeuft = false; el.classList.remove("playing"); }

    function oeffnen() {
      nr = ersteOffene() || fragen.length + 1;
      vorladen();
      el.hidden = false;
      zeigen();
      tone("confirm");
      passen();
    }
    function schliessen() { stoppen(); el.hidden = true; renderQuests(); }

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
    $("#lbInput").addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("#lbForm").requestSubmit(); } });
    $("#lbForm").addEventListener("submit", e => {
      e.preventDefault();
      const text = $("#lbInput").value.trim();
      if (!text) return;
      $("#lbInput").blur();
      antworten = { ...antworten, [String(nr)]: { antwort: text, zeit: Date.now() } };
      lbStore.besiegeln(nr, text);
      melody("siegel");
      zeigen();
      el.classList.add("sealing");
      setTimeout(() => el.classList.remove("sealing"), 900);
      spielen();                      // direkt in der Tipp-Geste starten, sonst blockt iOS die Wiedergabe
    });
    $("#lbPlay").addEventListener("click", () => (laeuft ? stoppen() : spielen()));
    $("#lbNext").addEventListener("click", () => { stoppen(); nr = ersteOffene() || fragen.length + 1; zeigen(); tone("move"); });
    $("#lbClose").addEventListener("click", schliessen);
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
      $("#swKopf").innerHTML = `<span class="sw-ic">${o.icon}</span><div><p class="tb-title">${esc(o.titel)}</p>${o.sub ? `<p class="sw-sub ${o.ton || ""}">${esc(o.sub)}</p>` : ""}</div>`;
      $("#swFolgen").innerHTML = (o.folgen || []).map(f => `<li>${f}</li>`).join("");
      $("#swWahl").innerHTML = o.wahlen && o.wahlen.length > 1
        ? o.wahlen.map(w => `<button type="button" class="sw-w${w.id === wahl ? " an" : ""}" data-w="${w.id}">${esc(w.name)}</button>`).join("") : "";
      el.dataset.ton = o.ton || "";
      el.classList.remove("halten", "besiegelt");
      el.hidden = false;
      tone("confirm");
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
      tone("move");
    });
    el.addEventListener("click", e => { if (e.target === el) { schliessen(); tone("move"); } });
    return { oeffnen, schliessen, pruefen };
  })();

  const eintrag = (schluessel, e) => einStore.setzen(schluessel, { ...e, zeit: Date.now() });
  const fxZeile = (lbl, cls, inhalt) => `<span class="fx-lbl ${cls}">${lbl}</span><span class="fx">${inhalt}</span>`;

  function schwurErgebnis(qid, status) {
    const q = questById(qid), won = status === "bestanden";
    if (!(eintragbar(qid).ergebnis || []).includes(status)) return;
    schwur.oeffnen({
      art: q.typ === "kern" ? "PRÜFUNG" : q.typ === "side" ? "SIDEQUEST" : "QUEST",
      icon: questIcon(q, won ? "bestanden" : "verloren", false), titel: q.name,
      sub: (won ? q.ergebnisWort || "Bestanden" : "Verloren").toUpperCase(), ton: won ? "win" : "lose",
      folgen: [fxZeile(won ? "SIEG" : "NIEDERLAGE", won ? "win" : "lose", fxChips(won ? q.win : q.lose, won))],
      gueltig: () => (eintragbar(qid).ergebnis || []).includes(status),
      ausfuehren: () => eintrag("q_" + qid, { status })
    });
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
    if (!sieg && state.items.schild === "besitz") folgen.push(`<span class="fx">Du hast den Schild des Bundes. Setz ihn vorher ein, dann spielst du das Duell noch einmal.</span>`);
    schwur.oeffnen({
      art: `DUELL ${d.nr} VON ${sd.liste.length}`, icon: questIcon(dq, sieg ? "bestanden" : "verloren", false), titel: dq.name,
      sub: sieg ? "SIEG" : "NIEDERLAGE", ton: sieg ? "win" : "lose", folgen,
      gueltig: () => { const x = showdownStand(); return state.next && questById(state.next).showdown && !x.entschieden && !state.duelle[String(nr)]; },
      ausfuehren: () => eintrag("d_" + d.nr, { ergebnis: v })
    });
  }
  function schwurEinsatz(item, quest) {
    const x = itemById(item);
    const orte = E.aktuelleQuests(C, state).filter(qid => (!quest || qid === quest) && E.einsetzbar(C, state, qid).includes(item));
    if (!x || !orte.length || state.items[item] !== "besitz") return;
    const n = state.anzahl[item];
    const folgen = [`<span class="fx">${esc(x.einsatz || x.text)}</span>`,
      `<span class="fx dim">${x.einmalig ? (x.stapel ? `Du hast ${n}, danach ${n - 1}.` : "Einmalig, danach verbraucht.") : "Bleibt in deinem Beutel."}</span>`];
    schwur.oeffnen({
      art: x.gruppe === "faehigkeit" ? "FÄHIGKEIT EINSETZEN" : "ITEM EINSETZEN",
      icon: `<span class="sw-item" style="color:${x.farbe}">${useSvg(x.symbol)}</span>`, titel: x.name,
      sub: orte.length === 1 ? "bei " + questById(orte[0]).name : "Wo setzt du es ein?", ton: "magie",
      wahlen: orte.map(id => ({ id, name: questById(id).name })), folgen,
      gueltig: () => state.items[item] === "besitz",
      ausfuehren: w => eintrag("e_" + uid(), { item, quest: w || orte[0] })
    });
  }
  function schwurZiffer(nr) {
    if (state.next || state.ziffern[nr - 1] != null || state.packs < C.ziffer_preis) return;
    schwur.oeffnen({
      art: "AM KÄSTCHEN", icon: `<span class="sw-item lock">${useSvg("i-lock")}</span>`, titel: `Ziffer ${nr} kaufen`,
      sub: `für ${C.ziffer_preis} ${packsWort(C.ziffer_preis)}`, ton: "win",
      folgen: [`<span class="fx"><span class="chip minus">${cardSvg()}−${C.ziffer_preis} ${packsWort(C.ziffer_preis)}</span><span class="chip plus"><span class="mini-tumbler">?</span>Ziffer ${nr}</span></span>`],
      gueltig: () => !state.next && state.ziffern[nr - 1] == null && state.packs >= C.ziffer_preis,
      ausfuehren: () => eintrag("z_" + nr, {})
    });
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
      if (prolog.start()) merkeGesehen(); else nachholen();
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
    function start() { if (raf || still.matches || intro.hidden) return; size(); last = 0; raf = requestAnimationFrame(frame); }
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    if ("ResizeObserver" in window) new ResizeObserver(size).observe(canvas);
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    return { start, stop };
  })();
  introFx.start();

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
      } else if (a === "treffer") {
        if (d.quests.prophezeiung !== "laeuft") d.quests.prophezeiung = "laeuft";
        else d.zaehler.prophezeiung = Math.min(3, (d.zaehler.prophezeiung || 0) + 1);
      } else if (a === "amulett") {
        if (d.quests.amulett !== "laeuft") d.quests.amulett = "laeuft";
        else if (!(d.schritte.amulett || {}).gefunden) d.schritte.amulett = { gefunden: true };
        else d.quests.amulett = "bestanden";
      } else if (a === "einsetzen") {
        const s = E.derive(C, d), qid = E.aktuelleQuests(C, s).find(id => E.einsetzbar(C, s, id).some(i => s.items[i] === "besitz"));
        const item = qid && E.einsetzbar(C, s, qid).find(i => s.items[i] === "besitz");
        if (item) d.einsaetze.push({ id: uid(), item, quest: qid });
      } else if (state.next) d.quests[state.next] = a;
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
    if (!$("#schwur").hidden) schwur.pruefen();
    // Log-Buch-Sprachnachrichten vorladen, solange das Log-Buch noch nicht entschieden ist
    if (state.quests.logbuch === "offen") logbuch.vorladen();
    if (meta.initial && intro.hidden) { requestAnimationFrame(() => { const row = document.querySelector(".q-row.is-selected"); if (row) scrollIntoList(row); }); nachholen(); }
    if (prev && !meta.initial && intro.hidden) { announce(prev, state, prevDoc, doc); merkeGesehen(); }
  }
  einStore.subscribe(e => { eintraege = e; neuBerechnen({}); });
  store.subscribe((doc, meta) => { adminDoc = doc; neuBerechnen(meta); });
  lbStore.subscribe(a => { antworten = a; if (state) { const id = sel[1]; if (id && questById(id)?.logbuch) renderQuestCard(id); } });

  // Offline-Speicher für Funklöcher (sw.js). Lokal beim Entwickeln nicht nötig.
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
