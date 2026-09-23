(() => {
  /* Dennis Quest · Entwurf der Spieler-Ansicht (siehe 06-design-plan.md)
     Drei Seiten im Ring: KARTE · QUESTS · AUSRÜSTUNG. HUD: Packs, nächste Quest, Code.
     Liest den Stand, schreibt nichts. entwurf.html?demo zeigt einen Beispielstand ohne Firebase. */
  const C = window.GAME_CONFIG;
  const E = window.QuestEngine;

  /* ---------- Entwurf-Inhalte (wandern beim Bauen nach config.js) ---------- */
  // Sechs Prüfungen = sechs Medaillons, jedes mit eigener Farbe und eigenem Zeichen
  const MEDAILLON = {
    logbuch:      { farbe: "#4a8fe8", emblem: "z-water" },     // Wasser, blau
    klingen:      { farbe: "#ec8f2e", emblem: "z-spirit" },    // Geist, orange
    auge:         { farbe: "#48b454", emblem: "z-forest" },    // Wald, grün
    feuerprobe:   { farbe: "#e2472f", emblem: "e-flame" },     // Feuer, rot (fehlt in der Schrift, eigene Flamme)
    bund:         { farbe: "#f2c94c", emblem: "z-triforce" },  // Licht, gold
    prophezeiung: { farbe: "#a468e6", emblem: "z-shadow" }     // Schatten, violett
  };
  // Beschreibungen im Spielton: Du-Form, höchstens zwei kurze Sätze
  const QUEST_TEXT = {
    logbuch:       "Zehn Fragen über Rieke. Ihre Stimme verrät, ob du ihr zugehört hast.",
    waffenschmied: "Ein Schmied bietet dir die große Wasserpistole an. Sein Preis ist ein Duell.",
    klingen:       "Wähle deinen Gegner, bevor du die Disziplin kennst. Der Sieger hält den Token.",
    auge:          "Fünf Flammen, ein Tank, drei Meter. Lösch sie, bevor dir das Wasser ausgeht.",
    ringschmied:   "Drei Steine, ein Seilring am Boden. Triffst du, flicht dir der Schmied einen größeren.",
    kartenwurf:    "Zehn Karten, ein Hut, drei Meter. Wer trifft, bekommt gepanzerte Karten.",
    nakama:        "Drei Fragen über deine Trauzeugen. Wie gut kennst du deine Crew?",
    feuerprobe:    "Drei versiegelte Umschläge. Sag vorher, wie viele du öffnest. Wer zu viel wagt, verliert alles.",
    sss:           "Schnick, Schnack, Schnuck. Best of three gegen einen Wächter, den der Bund bestimmt.",
    steinwurf:     "Ein Stein, ein Baum. Wirf so nah heran, wie du kannst.",
    bund:          "Der Bund stellt sich dir auf dem Gipfel. Drei Duelle. Jetzt zählt, was du gesammelt hast.",
    rast:          "Die Ahnen warten in der Hütte. Bestell für alle, leer den Trank, sprich den Toast.",
    prophezeiung:  "Deine versiegelten Vorhersagen vom Morgen. In der Hütte wird abgerechnet."
  };
  // Verzahnung: welche Items bei welcher Quest helfen (aus 00-spielanleitung.md und 01-showdown)
  const HILFT = {
    auge: ["pistole_gross"],
    bund: ["token", "schwert", "schild", "pistole_gross", "ring_gross", "karten_gepanzert"]
  };
  // Items: links Ausrüstung (Gegenstände), rechts Fähigkeiten (Regeln im Showdown)
  const ITEM = {
    beutel:           { gruppe: "item",       kurz: "Beutel",        farbe: "#d9a441", symbol: "i-backpack", text: "Dein Beutel. Hier landet alles, was du dir erspielst." },
    pistole_gross:    { gruppe: "item",       kurz: "Pistole",       farbe: "#4fb8e8", symbol: "i-pistol",   text: "Dreifacher Tank. Du kannst länger schießen als jeder andere." },
    ring_gross:       { gruppe: "item",       kurz: "Großer Ring",   farbe: "#d6b278", symbol: "i-ropering", text: "Ein Seilring mit 60 cm. Beim Ringwurf wird dein Ziel größer." },
    karten_gepanzert: { gruppe: "item",       kurz: "Karten",        farbe: "#9fd0f0", symbol: "i-cards",    text: "Karten in Hüllen. Sie fliegen weiter und stabiler." },
    token:            { gruppe: "faehigkeit", kurz: "Token",         farbe: "#f2c94c", symbol: "i-token",    text: "Lass im Showdown einen Wächter deiner Wahl für dich kämpfen." },
    schwert:          { gruppe: "faehigkeit", kurz: "Schwert",       farbe: "#e05a4f", symbol: "i-sword",    text: "Streiche im Showdown den Wächter, den der Bund schickt." },
    schild:           { gruppe: "faehigkeit", kurz: "Schild",        farbe: "#7aa7ff", symbol: "i-shield",   text: "Wiederhole im Showdown ein verlorenes Duell. Einmal." }
  };
  // Stationen auf der Karte in Prozent der Kartenfläche, Reihenfolge = Weg
  const STATIONEN = [
    { id: "start",      name: "ZUG",      ort: "Freitag im Zug",   x: 10, y: 79 },
    { id: "klingen",    name: "WIESE",    ort: "Wiese am Anstieg", x: 27, y: 66 },
    { id: "auge",       name: "WALD",     ort: "Erstes Waldstück", x: 45, y: 55 },
    { id: "feuerprobe", name: "AUSSICHT", ort: "Aussichtspunkt",   x: 62, y: 43 },
    { id: "bund",       name: "GIPFEL",   ort: "Gipfel Neureuth",  x: 78, y: 28 },
    { id: "gipfel",     name: "HÜTTE",    ort: "Berggasthaus",     x: 91, y: 52 }
  ];
  const START_PAGE = 1;

  /* ---------- Speicher: echt oder Demo ---------- */
  const params = new URLSearchParams(location.search);
  const DEMO = params.has("demo");
  const DEMO_DOCS = {
    start: { quests: {}, buchungen: [], items: {} },
    mitte: {                                   // Beispielstand aus 05-system-plan.md A9
      quests: { logbuch: "bestanden", waffenschmied: "bestanden", klingen: "bestanden", auge: "verloren",
                ringschmied: "bestanden", kartenwurf: "verloren", nakama: "bestanden", feuerprobe: "bestanden" },
      buchungen: [{ id: "b1", packs: -1, grund: "Steckbrief Benne" }], items: {}
    },
    ende: {
      quests: Object.fromEntries(C.quests.map(q => [q.id, ["auge", "kartenwurf", "steinwurf"].includes(q.id) ? "verloren" : "bestanden"])),
      buchungen: [], items: {}
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

  /* ---------- Kleinkram ---------- */
  const $ = s => document.querySelector(s);
  const questById = id => C.quests.find(q => q.id === id);
  const itemById = id => C.items.find(i => i.id === id);
  const itemInfo = id => ITEM[id] || { gruppe: "item", kurz: itemById(id).name, farbe: "#f2c94c", symbol: "i-backpack", text: itemById(id).wirkung };
  const useSvg = (id, cls = "") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"></use></svg>`;
  const cardSvg = (cls = "") => `<svg class="ic-card ${cls}" aria-hidden="true"><use href="#${cls.includes("empty") ? "i-card-empty" : "i-card"}"></use></svg>`;
  const packsWort = n => Math.abs(n) === 1 ? "Pack" : "Packs";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let state = null, lastDoc = null, syncInfo = { online: true };
  let page = START_PAGE, angle = START_PAGE * 120, flatTimer = null;
  const sel = { 0: null, 1: null, 2: null };  // Auswahl je Seite: Station, Quest, Item
  let followNext = true;                        // Quest-Seite folgt der nächsten Quest, bis Dennis selbst etwas antippt
  let followHier = true;                        // Karte zeigt die Station der nächsten Quest, bis Dennis eine andere antippt
  let revealPending = null;                     // Quest, die nach dem Ergebnis-Fenster aus dem Nebel tritt
  let audio;

  function tone(kind = "move") {
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)();
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
    nebel:    [[1047, .05], [1319, .05], [1568, .05], [2093, .2]]
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
        o.type = traurig ? "sawtooth" : name === "nebel" ? "sine" : "triangle";
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
    } catch (_) {}
  }

  /* ---------- Symbole für Quests ---------- */
  function medalHtml(q, st, isNext) {
    const m = MEDAILLON[q.id] || { farbe: "#c9c3a2", emblem: "z-triforce" };
    const cls = st === "bestanden" ? "won" : st === "verloren" ? "lost" : "";
    return `<span class="medal ${cls}${isNext ? " is-next" : ""}" style="--m:${m.farbe}">${useSvg(m.emblem)}</span>`;
  }
  function gemHtml(st, isNext) {
    const cls = st === "bestanden" ? "won" : st === "verloren" ? "lost" : "";
    return `<span class="gem ${cls}${isNext ? " is-next" : ""}">${useSvg("i-gem")}</span>`;
  }
  const questIcon = (q, st, isNext) => q.typ === "kern" ? medalHtml(q, st, isNext) : gemHtml(st, isNext);
  const statusWort = (id) => id === state.next ? "jetzt dran" : { bestanden: "bestanden", verloren: "verloren", offen: "noch offen" }[state.quests[id]];

  // Sichtbarkeit für Dennis: erledigte Quests und die nächste. Was danach kommt, liegt im Nebel.
  // Verdeckte Prüfungen erscheinen als Medaillon mit „?" (ihre Zahl ist bekannt), verdeckte Sidequests gar nicht.
  const aufgedeckt = id => state.quests[id] !== "offen" || id === state.next;
  const NEBEL = "nebel";
  const coveredMedal = () => `<span class="medal covered"><b>?</b></span>`;
  const verdeckteKern = () => C.quests.filter(q => q.typ === "kern" && !aufgedeckt(q.id)).length;
  const pruefungen = n => `${n} ${n === 1 ? "Prüfung" : "Prüfungen"}`;

  // Was eine Quest gibt oder nimmt, als kleine Symbole
  function fxChips(effekt, gewonnen) {
    const out = [];
    if (effekt.packs) out.push(`<span class="chip ${effekt.packs > 0 ? "plus" : "minus"}">${cardSvg()}${effekt.packs > 0 ? "+" : "−"}${Math.abs(effekt.packs)} ${packsWort(effekt.packs)}</span>`);
    if (gewonnen && effekt.ziffer) {
      const v = state.ziffern[effekt.ziffer - 1];
      out.push(`<span class="chip plus"><span class="mini-tumbler">${v == null ? "?" : v}</span>Ziffer ${effekt.ziffer}</span>`);
    }
    (effekt.items || []).forEach(id => {
      const x = itemInfo(id);
      out.push(`<span class="chip${gewonnen ? "" : " minus"}"><span class="${gewonnen ? "" : "x-over"}" style="color:${x.farbe}">${useSvg(x.symbol)}</span>${esc(x.kurz)}${gewonnen ? "" : " weg"}</span>`);
    });
    return out.length ? out.join("") : `<span class="chip none">nichts</span>`;
  }

  /* ---------- Aufbau (einmal) ---------- */
  function build() {
    // HUD: eine Karte pro Pack im Kästchen, ab 10 in zwei Reihen wie Herzen
    const row = $("#packRow"), max = C.waehrung.max;
    row.style.gridTemplateColumns = `repeat(${Math.min(max, 10)}, auto)`;
    row.classList.toggle("two", max > 10);
    row.innerHTML = Array.from({ length: max }, () => cardSvg("empty")).join("");
    $("#tumblers").innerHTML = C.code.map((_, i) => `<span class="tumbler" data-i="${i}">?</span>`).join("");

    // Quests: eine Zeile pro Quest, in Spielreihenfolge
    $("#questList").innerHTML = C.quests.map(q =>
      `<li><button type="button" class="q-row ${q.typ}" data-id="${q.id}"><span class="ic"></span><span class="q-name">${esc(q.name)}</span><span class="q-mark"></span></button></li>`).join("")
      + `<li><button type="button" class="q-row nebel" data-id="${NEBEL}"><span class="ic">${coveredMedal()}</span><span class="q-name"></span><span class="q-mark"></span></button></li>`;
    document.querySelectorAll(".q-row").forEach(b => b.addEventListener("click", () => { followNext = b.dataset.id === state.next; selectQuest(b.dataset.id); }));

    // Karte: Weg durch die Stationen, eine Marke pro Station
    const pts = STATIONEN.map(s => [s.x * 10, s.y * 4.2]);
    $("#mapRoute").setAttribute("d", smoothPath(pts));
    $("#mapMarks").innerHTML = STATIONEN.map(s =>
      `<button type="button" class="mark" data-station="${s.id}" style="left:${s.x}%;top:${s.y}%" aria-label="${s.ort}"><span class="m-medal"></span><span class="gems"></span><span class="m-label">${s.name}</span></button>`).join("")
      + `<span class="map-lake-label">TEGERNSEE</span>`;
    document.querySelectorAll(".mark").forEach(b => b.addEventListener("click", () => { followHier = false; selectStation(b.dataset.station, true); }));

    // Ausrüstung: links Items, rechts Fähigkeiten
    const slot = it => {
      const x = itemInfo(it.id);
      return `<button type="button" class="slot" data-id="${it.id}"><span class="well" style="--c:${x.farbe}">${useSvg(x.symbol)}</span></button>`;
    };
    const gear = C.items.filter(it => itemInfo(it.id).gruppe !== "faehigkeit");
    const skill = C.items.filter(it => itemInfo(it.id).gruppe === "faehigkeit");
    $("#slotsGear").innerHTML = gear.map(slot).join("");
    $("#slotsSkill").innerHTML = skill.map(slot).join("");
    [$("#slotsGear"), $("#slotsSkill")].forEach(g => { if (g.children.length % 2) g.lastElementChild.classList.add("solo"); });
    document.querySelectorAll(".slot").forEach(b => b.addEventListener("click", () => selectItem(b.dataset.id)));
  }

  function smoothPath(p) {
    let d = `M${p[0][0]} ${p[0][1]}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
    }
    return d;
  }

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
    const verdeckt = C.quests.filter(q => !aufgedeckt(q.id));
    const ungueltig = sel[1] === NEBEL ? !verdeckt.length : !sel[1] || !aufgedeckt(sel[1]);
    if (followNext || ungueltig) sel[1] = state.next || C.quests[C.quests.length - 1].id;
    document.querySelectorAll(".q-row:not(.nebel)").forEach(b => {
      const q = questById(b.dataset.id), st = state.quests[q.id], isNext = q.id === state.next;
      b.parentElement.hidden = !aufgedeckt(q.id);
      b.className = `q-row ${q.typ} st-${st}${isNext ? " is-next" : ""}${sel[1] === q.id ? " is-selected" : ""}${q.id === revealPending ? " fogged" : ""}`;
      b.querySelector(".ic").innerHTML = questIcon(q, st, isNext);
      const mark = b.querySelector(".q-mark");
      mark.className = "q-mark" + (st === "bestanden" ? " won" : st === "verloren" ? " lost" : "");
      mark.innerHTML = isNext ? `<span class="tag now">JETZT</span>` : st === "bestanden" ? useSvg("i-check") : st === "verloren" ? useSvg("i-x") : "";
      b.setAttribute("aria-label", `${q.name}, ${q.typ === "kern" ? "Prüfung" : "Sidequest"}, ${statusWort(q.id)}`);
    });
    const nebel = $(".q-row.nebel"), nk = verdeckteKern();
    nebel.parentElement.hidden = !verdeckt.length;
    nebel.querySelector(".q-name").textContent = nk ? `Noch ${pruefungen(nk)}` : "Im Nebel";
    nebel.classList.toggle("is-selected", sel[1] === NEBEL);
    nebel.setAttribute("aria-label", nebel.querySelector(".q-name").textContent);
    // Prüfungen mit Gesamtzahl, Sidequests nur die erledigten (wie viele noch kommen, bleibt offen)
    const kern = C.quests.filter(q => q.typ === "kern"), side = C.quests.filter(q => q.typ === "side");
    const done = list => list.filter(q => state.quests[q.id] !== "offen").length;
    $("#listLegend").innerHTML = `<span title="Prüfungen"><span class="medal won" style="--m:#d9b54a"></span><b>${done(kern)}/${kern.length}</b></span>`
      + `<span title="Sidequests">${gemHtml("bestanden", false)}<b>${done(side)}</b></span>`;
    renderQuestCard(sel[1]);
  }

  function renderQuestCard(id) {
    $("#questCard").classList.toggle("fogged", id === revealPending);
    if (id === NEBEL) {
      const nk = verdeckteKern();
      $("#questCard").innerHTML = `
        <div class="qc-head">${coveredMedal()}<div><p class="tb-title">Im Nebel</p></div></div>
        <p class="tb-text">Zeigt sich, wenn es dran ist.</p>`;
      return;
    }
    const q = questById(id), st = state.quests[id], isNext = id === state.next;
    const tag = isNext ? `<span class="tag now">JETZT</span>` : st === "bestanden" ? `<span class="tag won">BESTANDEN</span>`
      : st === "verloren" ? `<span class="tag lost">VERLOREN</span>` : `<span class="tag open">NOCH OFFEN</span>`;
    $("#questCard").innerHTML = `
      <div class="qc-head">${questIcon(q, st, false)}<div><p class="tb-title">${esc(q.name)}</p><p class="tb-meta">${tag} ${esc(q.ort)}</p></div></div>
      <p class="tb-text">${esc(QUEST_TEXT[id] || q.beschreibung)}</p>
      ${hilftHtml(id)}
      <div class="fx-rows">
        <div class="fx-row${st === "verloren" ? " dim" : ""}"><span class="fx-lbl win">SIEG</span><span class="fx">${fxChips(q.win, true)}</span></div>
        <div class="fx-row${st === "bestanden" ? " dim" : ""}"><span class="fx-lbl lose">NIEDERLAGE</span><span class="fx">${fxChips(q.lose, false)}</span></div>
      </div>`;
  }

  // Welche Items hier helfen: im Beutel hell, verloren mit X, noch nicht erspielt dunkel
  function hilftHtml(id) {
    const ids = HILFT[id];
    if (!ids) return "";
    const hat = ids.filter(i => state.items[i] === "besitz").length;
    return `<div class="helps"><span class="fx-head">HILFT · ${hat}/${ids.length}</span><span class="helps-row">${ids.map(i => {
      const x = itemInfo(i), st = state.items[i];
      return `<span class="well mini st-${st}${st === "verloren" ? " lost" : ""}" style="--c:${x.farbe}" title="${esc(itemById(i).name)}">${useSvg(x.symbol)}</span>`;
    }).join("")}</span></div>`;
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

  function renderMap() {
    const s = state;
    const kern = C.quests.filter(q => q.typ === "kern"), side = C.quests.filter(q => q.typ === "side");
    $("#pipsKern").innerHTML = kern.map(q => aufgedeckt(q.id) ? medalHtml(q, s.quests[q.id], q.id === s.next) : coveredMedal()).join("");
    const sichtbareSide = side.filter(q => aufgedeckt(q.id));
    $("#pipsSide").innerHTML = sichtbareSide.length ? sichtbareSide.map(q => gemHtml(s.quests[q.id], q.id === s.next)).join("") : "";
    const offenK = kern.filter(q => s.quests[q.id] === "offen").length, offenS = side.filter(q => s.quests[q.id] === "offen").length;
    $("#cntKern").textContent = `${kern.length - offenK}/${kern.length}`;
    $("#cntSide").textContent = `${side.length - offenS}`;

    const nq = s.next ? questById(s.next) : null;
    const hier = nq ? nq.station : STATIONEN[STATIONEN.length - 1].id;
    if (followHier || !sel[0]) sel[0] = hier;
    document.querySelectorAll(".mark").forEach(m => {
      const id = m.dataset.station;
      const k = C.quests.find(q => q.station === id && q.typ === "kern");
      const sides = C.quests.filter(q => q.station === id && q.typ === "side");
      m.querySelector(".m-medal").innerHTML = !k ? `<span class="no-medal"></span>` : aufgedeckt(k.id) ? medalHtml(k, s.quests[k.id], k.id === s.next) : coveredMedal();
      m.querySelector(".gems").innerHTML = sides.filter(q => aufgedeckt(q.id)).map(q => gemHtml(s.quests[q.id], q.id === s.next)).join("");
      m.classList.toggle("is-selected", id === sel[0]);
      m.querySelector(".you")?.remove();
      if (id === hier) m.insertAdjacentHTML("afterbegin", `<span class="you" title="Du bist hier"></span>`);
    });
    // Nebel liegt über dem Weg ab der Mitte zur nächsten Station
    const hi = STATIONEN.findIndex(x => x.id === hier), weiter = STATIONEN[hi + 1];
    $("#mapFog").hidden = !(s.next && weiter);
    if (s.next && weiter) $("#mapFog").style.left = ((STATIONEN[hi].x + weiter.x) / 2) + "%";
    renderStationBox(sel[0]);
  }

  function renderStationBox(id) {
    const st = STATIONEN.find(x => x.id === id), idx = STATIONEN.indexOf(st);
    const qs = C.quests.filter(q => q.station === id);
    const nq = state.next ? questById(state.next) : null;
    const sichtbar = qs.filter(q => aufgedeckt(q.id));
    const kernImNebel = qs.some(q => q.typ === "kern" && !aufgedeckt(q.id));
    const hierText = nq && nq.station === id ? "DU BIST HIER" : "";
    if (!sichtbar.length) {
      $("#stationBox").innerHTML = `<p class="tb-title">${esc(st.ort)}</p><p class="tb-meta">${hierText}</p>
        <p class="tb-text">Im Nebel</p>`;
      return;
    }
    $("#stationBox").innerHTML = `<p class="tb-title">${esc(st.ort)}</p><p class="tb-meta">${hierText}</p>
      <ul class="st-list">${sichtbar.map(q => {
        const w = state.quests[q.id], isNext = q.id === state.next;
        const mark = isNext ? `<span class="tag now">JETZT</span>` : w === "bestanden" ? `<span class="st won">${useSvg("i-check")}</span>` : `<span class="st lost">${useSvg("i-x")}</span>`;
        return `<li>${questIcon(q, w, false)}<span>${esc(q.name)}</span>${mark}</li>`;
      }).join("")}${kernImNebel ? `<li>${coveredMedal()}<span>Im Nebel</span></li>` : ""}</ul>`;
  }

  function selectStation(id, play = true) {
    sel[0] = id;
    document.querySelectorAll(".mark").forEach(m => m.classList.toggle("is-selected", m.dataset.station === id));
    renderStationBox(id);
    if (play) tone("move");
  }

  function renderEquip() {
    if (!sel[2]) sel[2] = state.erhalten[state.erhalten.length - 1] || C.items[0].id;
    document.querySelectorAll(".slot").forEach(b => {
      const st = state.items[b.dataset.id];
      b.classList.remove("st-besitz", "st-verloren", "st-nicht");
      b.classList.add("st-" + st);
      b.querySelector(".well").classList.toggle("lost", st === "verloren");
      b.classList.toggle("is-selected", sel[2] === b.dataset.id);
      b.setAttribute("aria-label", `${itemById(b.dataset.id).name}, ${{ besitz: "im Beutel", verloren: "verloren", nicht: "noch nicht erspielt" }[st]}`);
    });
    renderItemBox(sel[2]);
  }

  function renderItemBox(id) {
    const box = $("#itemBox");
    if (!id) id = sel[2] = state.erhalten[state.erhalten.length - 1] || C.items[0].id;
    const it = itemById(id), x = itemInfo(id), st = state.items[id];
    const tag = st === "besitz" ? `<span class="tag won">IM BEUTEL</span>` : st === "verloren" ? `<span class="tag lost">VERLOREN</span>` : `<span class="tag open">NOCH NICHT</span>`;
    const quelle = C.quests.find(q => (q.win.items || []).includes(id));
    const nahm = C.quests.find(q => (q.lose.items || []).includes(id) && state.quests[q.id] === "verloren");
    const gefahr = C.quests.find(q => (q.lose.items || []).includes(id) && state.quests[q.id] === "offen" && aufgedeckt(q.id));
    let extra = "";
    if (st === "nicht" && quelle) extra = aufgedeckt(quelle.id) ? ` Zu holen bei <em>${esc(quelle.name)}</em>.` : "";
    if (st === "verloren" && nahm) extra = ` Verloren bei <em>${esc(nahm.name)}</em>.`;
    if (st === "besitz" && gefahr) extra = ` Vorsicht: <em>${esc(gefahr.name)}</em> kann es dir nehmen.`;
    box.style.setProperty("--c", x.farbe);
    box.innerHTML = `${useSvg(x.symbol, "ib-icon")}<p class="tb-title">${esc(it.name)}${tag}</p><p class="tb-text">${esc(x.text)}${extra}</p>`;
  }

  function selectItem(id, play = true) {
    sel[2] = id;
    document.querySelectorAll(".slot").forEach(b => b.classList.toggle("is-selected", b.dataset.id === id));
    renderItemBox(id);
    if (play) tone("move");
  }

  /* ---------- Ergebnis-Fenster ---------- */
  let overlayAfter = null;
  function showOverlay(html, after) {
    const r = $("#overlay .result");
    $("#resultHead").innerHTML = html.head;
    $("#resultLines").innerHTML = html.lines || "";
    $("#resultNext").textContent = html.next || "";
    r.classList.toggle("big-moment", !!html.gross);
    [...$("#resultLines").children].forEach((li, i) => li.style.setProperty("--d", i));
    $("#overlay").hidden = false;
    r.style.animation = "none"; void r.offsetWidth; r.style.animation = "";
    overlayAfter = after || null;
  }
  function closeOverlay() {
    if ($("#overlay").hidden) return;
    $("#overlay").hidden = true;
    const f = overlayAfter; overlayAfter = null;
    if (f) f();
  }

  // Was hat der Quest Master gerade geändert? Nur echte Neuigkeiten melden:
  // eine Quest ist entschieden, eine neue Buchung ist da oder ein Item wurde von Hand gegeben oder genommen.
  // Zurückstellen oder Löschen aktualisiert still.
  function announce(prev, next, prevDoc, doc) {
    const fertig = C.quests.filter(q => prev.quests[q.id] !== next.quests[q.id] && next.quests[q.id] !== "offen");
    const alteIds = new Set((prevDoc ? prevDoc.buchungen : []).map(b => b.id));
    const neueBuchungen = doc.buchungen.filter(b => !alteIds.has(b.id));
    const lines = [];
    const dPacks = next.packs - prev.packs;
    if (dPacks) lines.push(`<li class="${dPacks > 0 ? "plus" : "minus"}"><span class="ri">${cardSvg()}</span>${dPacks > 0 ? "+" : "−"}${Math.abs(dPacks)} ${packsWort(dPacks)}</li>`);
    next.ziffern.forEach((v, i) => {
      if (v != null && prev.ziffern[i] == null) lines.push(`<li class="plus"><span class="ri"><span class="tumbler known" style="--hud-h:30px">${v}</span></span>Ziffer ${i + 1}: ${v}</li>`);
    });
    const itemLines = [];
    C.items.forEach(it => {
      const x = itemInfo(it.id);
      if (prev.items[it.id] !== "besitz" && next.items[it.id] === "besitz") itemLines.push(`<li class="plus"><span class="ri" style="color:${x.farbe}">${useSvg(x.symbol)}</span>${esc(it.name)}</li>`);
      if (prev.items[it.id] === "besitz" && next.items[it.id] === "verloren") itemLines.push(`<li class="minus"><span class="ri x-over" style="color:${x.farbe}">${useSvg(x.symbol)}</span>${esc(it.name)} weg</li>`);
    });
    lines.push(...itemLines);
    const zurueck = C.quests.some(q => prev.quests[q.id] !== "offen" && next.quests[q.id] === "offen");
    if (!fertig.length && (zurueck || (!neueBuchungen.length && !itemLines.length))) return;

    // Neue Packs und Ziffern im HUD aufblinken lassen
    document.querySelectorAll("#packRow .ic-card").forEach((c, i) => c.classList.toggle("gain", i >= prev.packs && i < next.packs));
    document.querySelectorAll("#tumblers .tumbler").forEach((t, i) => t.classList.toggle("gain", next.ziffern[i] != null && prev.ziffern[i] == null));

    let head, klang = dPacks < 0 ? "minus" : "plus";
    if (fertig.length) {
      const q = fertig[0], won = next.quests[q.id] === "bestanden";
      const art = q.typ === "kern" ? "PRÜFUNG" : "SIDEQUEST";
      const farbe = q.typ === "kern" ? (MEDAILLON[q.id] || {}).farbe : "#3ddc97";
      klang = !won ? "verloren" : q.typ === "kern" ? "pruefung" : "side";
      head = `<span class="medal-stage ${won ? "won" : "lost"}" style="--m:${farbe}">${questIcon(q, next.quests[q.id], false)}</span><p class="big${won ? "" : " lost"}">${art} ${won ? "BESTANDEN" : "VERLOREN"}</p>
              <p class="sub">${esc(q.name)}${fertig.length > 1 ? ` und ${fertig.length - 1} weitere` : ""}</p>`;
      if (!lines.length) lines.push(`<li><span class="ri"></span>Keine Folgen</li>`);
    } else if (neueBuchungen.length) {
      const b = neueBuchungen[neueBuchungen.length - 1];
      const titel = b.ziffer ? "ZIFFER GEKAUFT" : dPacks < 0 ? "PACKS WEG" : dPacks > 0 ? "PACKS DAZU" : "BUCHUNG";
      head = `<span class="ri-big">${cardSvg()}</span><p class="big${dPacks < 0 && !b.ziffer ? " lost" : ""}">${titel}</p><p class="sub">${esc(b.grund || "Buchung vom Quest Master")}</p>`;
      if (!lines.length) lines.push(`<li><span class="ri"></span>Du hattest keine Packs mehr, es bleibt bei 0.</li>`);
    } else {
      head = `<span class="ri-big">${useSvg("i-backpack")}</span><p class="big">DEIN BEUTEL</p><p class="sub">Der Quest Master hat etwas geändert.</p>`;
    }
    // Die nächste Quest wird erst nach dem Fenster aufgedeckt, darum steht ihr Name hier nicht
    const warSichtbar = id => prev.quests[id] !== "offen" || prev.next === id;
    if (next.next && !warSichtbar(next.next)) revealPending = next.next;
    melody(klang);
    showOverlay({ head, lines: lines.join(""), next: next.next ? "" : "Zum Kästchen", gross: fertig.length > 0 }, showNextQuest);
    renderHud(); renderQuests();
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
      const q = C.quests.find(x => x.win.ziffer === i + 1);
      const wo = q ? esc(q.name) : "?";
      const offen = !q || !aufgedeckt(q.id) ? "im Nebel"
        : s.quests[q.id] === "verloren" ? `verloren, am Kästchen ${C.ziffer_preis} ${packsWort(C.ziffer_preis)}` : `jetzt: ${wo}`;
      return `<li class="${v == null ? "" : "plus"}"><span class="ri"><span class="tumbler${v == null ? "" : " known"}" style="--hud-h:30px">${v == null ? "?" : v}</span></span>${v == null ? offen : s.gekauft[i] ? "gekauft" : wo}</li>`;
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
    tone("move");
    clearTimeout(flatTimer);
    flatTimer = setTimeout(() => {
      cube.classList.add("flat");
      if (page === 1) { const row = document.querySelector(".q-row.is-selected"); if (row) scrollIntoList(row); }
    }, 470);
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
  $("#hudNext").addEventListener("click", showNextQuest);
  $("#hudPacks").addEventListener("click", explainPacks);
  $("#hudCode").addEventListener("click", explainCode);
  $("#overlay").addEventListener("click", closeOverlay);

  // Wischen: nur waagerecht zählt, senkrecht scrollt die Liste
  let touch = null, swiped = false;
  const stage = $(".stage");
  stage.addEventListener("pointerdown", e => { touch = { x: e.clientX, y: e.clientY }; swiped = false; });
  stage.addEventListener("pointercancel", () => { touch = null; });
  stage.addEventListener("pointerup", e => {
    if (!touch) return;
    const dx = e.clientX - touch.x, dy = e.clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) { swiped = true; turn(dx < 0 ? 1 : -1); }
  });
  stage.addEventListener("click", e => { if (swiped) { e.stopPropagation(); e.preventDefault(); swiped = false; } }, true);

  // Tastatur (Laptop): Z/R Seite, Pfeile Auswahl, Enter/Esc schließt das Fenster
  window.addEventListener("keydown", e => {
    if (!$("#introScreen").hidden) return;
    const k = e.key.toLowerCase();
    if (!$("#overlay").hidden) { if (["enter", " ", "escape", "a"].includes(k)) { e.preventDefault(); closeOverlay(); } return; }
    if (k === "z" || k === "q") return turn(-1);
    if (k === "r" || k === "e") return turn(1);
    const step = { arrowdown: 1, arrowright: 1, arrowup: -1, arrowleft: -1 }[k];
    if (!step) return;
    e.preventDefault();
    if (page === 1) { const ids = [...document.querySelectorAll(".quest-list li:not([hidden]) .q-row")].map(b => b.dataset.id); followNext = false; selectQuest(ids[(ids.indexOf(sel[1]) + step + ids.length) % ids.length]); }
    if (page === 0) { const ids = STATIONEN.map(s => s.id); selectStation(ids[(ids.indexOf(sel[0]) + step + ids.length) % ids.length]); }
    if (page === 2) { const ids = [...document.querySelectorAll(".slot")].map(b => b.dataset.id); selectItem(ids[(ids.indexOf(sel[2]) + step + ids.length) % ids.length]); }
  });

  /* ---------- Startbildschirm und Vollbild (wie bisher) ---------- */
  const intro = $("#introScreen");
  const playElements = [...document.querySelectorAll(".hud, .shoulder, .stage, .foot")];
  function setPlayable(on) { playElements.forEach(el => { el.inert = !on; if (on) el.removeAttribute("aria-hidden"); else el.setAttribute("aria-hidden", "true"); }); }
  function beginQuest() {
    if (intro.hidden || intro.classList.contains("is-leaving")) return;
    tone("confirm");
    intro.classList.add("is-leaving");
    setTimeout(() => {
      intro.hidden = true;
      setPlayable(true);
      const row = document.querySelector(".q-row.is-selected");
      if (row) scrollIntoList(row);
    }, 500);
  }
  intro.addEventListener("click", beginQuest);        // PRESS START: Tippen irgendwo startet
  if (params.has("direkt")) { intro.hidden = true; }

  const fsBtn = $("#fullscreenToggle");
  const isStandalone = () => navigator.standalone === true || matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: fullscreen)").matches;
  const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement;
  function updateFs() {
    const on = Boolean(fsElement());
    fsBtn.setAttribute("aria-pressed", String(on));
    fsBtn.setAttribute("aria-label", on ? "Vollbild verlassen" : "Vollbild öffnen");
    fsBtn.hidden = isStandalone() && !on;
  }
  async function toggleFs() {
    const hinweis = () => showOverlay({ head: `<p class="big">VOLLBILD</p><p class="sub">Auf dem iPhone geht das so:</p>`,
      lines: `<li><span class="ri">1</span>In Safari unten auf Teilen tippen.</li><li><span class="ri">2</span>Zum Home-Bildschirm wählen.</li><li><span class="ri">3</span>Dennis Quest dort öffnen und quer halten.</li>` });
    try {
      if (fsElement()) { const x = document.exitFullscreen || document.webkitExitFullscreen; if (x) await Promise.resolve(x.call(document)); return; }
      const el = document.documentElement, req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (!req) return hinweis();
      await Promise.resolve(req.call(el));
      try { await screen.orientation?.lock?.("landscape"); } catch (_) {}
    } catch (_) { hinweis(); }
  }
  fsBtn.addEventListener("click", e => { e.stopPropagation(); toggleFs(); });
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
        const last = [...C.quests].reverse().find(q => d.quests[q.id]);
        if (last) delete d.quests[last.id];
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
    const t = state && state.stand ? new Date(state.stand).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "–";
    el.textContent = (syncInfo.demo ? "Demo · Stand " : syncInfo.online ? "Stand " : "Offline · Stand ") + t;
    el.classList.toggle("offline", !syncInfo.online && !syncInfo.demo);
  }
  store.onStatus(st => { syncInfo = st; renderSync(); });
  store.subscribe((doc, meta) => {
    const prev = state, prevDoc = lastDoc;
    state = E.derive(C, doc);
    lastDoc = JSON.parse(JSON.stringify(doc));
    render();
    renderSync();
    if (meta.initial && intro.hidden) requestAnimationFrame(() => { const row = document.querySelector(".q-row.is-selected"); if (row) scrollIntoList(row); });
    if (prev && !meta.initial && intro.hidden) announce(prev, state, prevDoc, doc);
  });
})();
