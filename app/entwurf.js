(() => {
  /* Dennis Quest · Entwurf der Spieler-Ansicht (siehe 06-design-plan.md, Optik nach 07-menue-umbau.md)
     Drei Seiten: KARTE · QUESTS · AUSRÜSTUNG, dazwischen gleiten. HUD: Packs, nächste Quest, Code.
     Die Fee ist der Cursor. Liest den Stand, schreibt nichts. entwurf.html?demo zeigt einen Beispielstand ohne Firebase. */
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
  const STEIN_FARBE = "#86dc6e";                               // Sidequests: Glühwürmchen-Grün
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
  // Items: links Ausrüstung (Gegenstände), rechts Fähigkeiten (Regeln im Showdown). farbe = Schein hinter dem Symbol
  const ITEM = {
    beutel:           { gruppe: "item",       kurz: "Beutel",      farbe: "#d9a441", symbol: "i-pouch",    text: "Dein Beutel. Hier landet alles, was du dir erspielst." },
    pistole_gross:    { gruppe: "item",       kurz: "Pistole",     farbe: "#4fb8e8", symbol: "i-pistol",   text: "Dreifacher Tank. Du kannst länger schießen als jeder andere." },
    ring_gross:       { gruppe: "item",       kurz: "Großer Ring", farbe: "#d6b278", symbol: "i-ropering", text: "Ein Seilring mit 60 cm. Beim Ringwurf wird dein Ziel größer." },
    karten_gepanzert: { gruppe: "item",       kurz: "Karten",      farbe: "#e2493a", symbol: "i-cards",    text: "Karten in Hüllen. Sie fliegen weiter und stabiler." },
    token:            { gruppe: "faehigkeit", kurz: "Token",       farbe: "#f2c94c", symbol: "i-token",    text: "Lass im Showdown einen Wächter deiner Wahl für dich kämpfen." },
    schwert:          { gruppe: "faehigkeit", kurz: "Schwert",     farbe: "#8f86f0", symbol: "i-sword",    text: "Streiche im Showdown den Wächter, den der Bund schickt." },
    schild:           { gruppe: "faehigkeit", kurz: "Schild",      farbe: "#5a74ff", symbol: "i-shield",   text: "Wiederhole im Showdown ein verlorenes Duell. Einmal." }
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
  const SEITEN = ["KARTE", "QUESTS", "AUSRÜSTUNG"];
  const PARALLAXE = ["2.2%", "0%", "-2.2%"];                   // der Wald im Hintergrund wandert beim Seitenwechsel leicht mit
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
  const game = $("#game");
  const questById = id => C.quests.find(q => q.id === id);
  const itemById = id => C.items.find(i => i.id === id);
  const itemInfo = id => ITEM[id] || { gruppe: "item", kurz: itemById(id).name, farbe: "#f2c94c", symbol: "i-pouch", text: itemById(id).wirkung };
  const useSvg = (id, cls = "") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"></use></svg>`;
  const cardSvg = (cls = "") => `<svg class="ic-card ${cls}" viewBox="0 0 22 30" aria-hidden="true"><use href="#${cls.includes("empty") ? "i-card-empty" : "i-card"}"></use></svg>`;
  const packsWort = n => Math.abs(n) === 1 ? "Pack" : "Packs";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

  let state = null, lastDoc = null, syncInfo = { online: true };
  let page = START_PAGE;
  const sel = { 0: null, 1: null, 2: null };  // Auswahl je Seite: Station, Quest, Item
  let followNext = true;                        // Quest-Seite folgt der nächsten Quest, bis Dennis selbst etwas antippt
  let followHier = true;                        // Karte zeigt die Station der nächsten Quest, bis Dennis eine andere antippt
  let revealPending = null;                     // Quest, die nach dem Ergebnis-Fenster aus dem Nebel tritt
  let hudHold = null;                           // Stand, den das HUD zeigt, bis gewonnene Packs und Ziffern gelandet sind

  // Leuchtpunkt einmal vorzeichnen, danach nur noch kopieren (Feenstaub, Glühwürmchen, Funken)
  function makeGlow(r, g, b, kern = true) {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const x = c.getContext("2d"), grd = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, kern ? "rgba(255,255,255,1)" : `rgba(${r},${g},${b},.5)`); grd.addColorStop(.2, `rgba(${r},${g},${b},${kern ? .9 : .35})`);
    grd.addColorStop(.5, `rgba(${r},${g},${b},${kern ? .25 : .12})`); grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = grd; x.fillRect(0, 0, 64, 64); return c;
  }
  const SPR = { flieder: makeGlow(236, 214, 255), blau: makeGlow(190, 232, 255), gold: makeGlow(255, 226, 150), gruen: makeGlow(196, 255, 104),
                schein: makeGlow(196, 170, 255, false), grau: makeGlow(170, 168, 160) };
  const farbGlow = {};
  const glowFor = hex => (farbGlow[hex] ??= makeGlow(...hexRgb(hex)));
  function dot(ctx, spr, x, y, r, a) { if (a <= 0) return; ctx.globalAlpha = Math.min(1, a); ctx.drawImage(spr, x - r, y - r, r * 2, r * 2); }
  function glint(ctx, x, y, r, a) {
    ctx.globalAlpha = a; ctx.strokeStyle = "#fff"; ctx.lineWidth = .9;
    ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke();
  }

  /* ---------- Ton: Glöckchen, Luftzug, Fanfaren mit Hall. Eigene Tonfolgen, keine Musik aus dem Spiel ---------- */
  let audio, master, hall;
  function ac() {
    if (!audio) {
      audio = new (window.AudioContext || window.webkitAudioContext)();
      master = audio.createGain(); master.connect(audio.destination);
      const len = Math.floor(audio.sampleRate * 1.6), buf = audio.createBuffer(2, len, audio.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
      const conv = audio.createConvolver(); conv.buffer = buf;
      hall = audio.createGain(); hall.gain.value = .3; hall.connect(conv); conv.connect(master);
    }
    if (audio.state === "suspended") audio.resume();
    return audio;
  }
  function note(f, t, d, { type = "triangle", vol = .05, wet = true, vib = false, tail = .03 } = {}) {
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (vib) { const v = audio.createOscillator(), vg = audio.createGain(); v.frequency.value = 5.5; vg.gain.value = f * .01; v.connect(vg); vg.connect(o.frequency); v.start(t); v.stop(t + d + tail + .1); }
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .012);
    g.gain.setValueAtTime(vol, t + d * .7); g.gain.exponentialRampToValueAtTime(.0001, t + d + tail);
    o.connect(g); g.connect(master); if (wet) g.connect(hall);
    o.start(t); o.stop(t + d + tail + .05);
  }
  function whoosh(t) {
    const len = Math.floor(audio.sampleRate * .36), buf = audio.createBuffer(1, len, audio.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = audio.createBufferSource(), bp = audio.createBiquadFilter(), g = audio.createGain();
    src.buffer = buf; bp.type = "bandpass"; bp.Q.value = 1.1;
    bp.frequency.setValueAtTime(380, t); bp.frequency.exponentialRampToValueAtTime(2000, t + .3);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.045, t + .09); g.gain.exponentialRampToValueAtTime(.0001, t + .34);
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t); src.stop(t + .36);
  }
  function sfx(kind) {
    try {
      const t = ac().currentTime + .01;
      if (kind === "move") { note(1568, t, .03, { type: "sine", vol: .028, tail: .24 }); note(3136, t, .02, { type: "sine", vol: .007, tail: .12 }); }
      else if (kind === "page") whoosh(t);
      else if (kind === "start") [1047, 1319, 1568, 2093].forEach((f, i) => note(f, t + i * .06, .05, { type: "sine", vol: .04, tail: .6 }));
      else if (kind === "pling") note(2093, t, .03, { type: "sine", vol: .03, tail: .28 });
      else if (kind === "loss") note(196, t, .1, { type: "triangle", vol: .045, tail: .3 });
      else if (kind === "tick") note(2600, t, .008, { type: "square", vol: .005, wet: false, tail: .02 });
    } catch (_) {}
  }
  // Melodien [Hz, Sekunden, Begleitung]. Der Schlusston bekommt Vibrato und einen Akkord
  const MELODIE = {
    pruefung: [[392, .1], [523, .1], [659, .1], [784, .12], [1047, .62, [659, 784]]],
    side:     [[659, .09], [784, .09], [1047, .38, [784]]],
    verloren: [[330, .2], [277, .2], [220, .56, [165]]],
    plus:     [[523, .09], [784, .26, [659]]],
    minus:    [[392, .12], [262, .34]],
    nebel:    [[1047, .05], [1319, .05], [1568, .05], [2093, .22]]
  };
  function melody(name) {
    try {
      let t = ac().currentTime + .03;
      const traurig = name === "verloren" || name === "minus";
      MELODIE[name].forEach(([f, d, begleit = []], i, alle) => {
        const letzte = i === alle.length - 1;
        const opt = { type: traurig ? "sawtooth" : name === "nebel" ? "sine" : "triangle", vol: traurig || name === "nebel" ? .024 : .05, vib: letzte && !traurig, tail: letzte ? .5 : .03 };
        note(f, t, d, opt);
        if (!traurig && name !== "nebel") note(f * 2, t, d, { ...opt, type: "sine", vol: opt.vol * .22 });   // Oktave darüber macht den Ton voller
        begleit.forEach(h => note(h, t, d, { ...opt, vol: opt.vol * .5 }));
        t += d;
      });
    } catch (_) {}
  }

  /* ---------- Symbole für Quests ---------- */
  function medalHtml(q, st, isNext, extra = "") {
    const m = MEDAILLON[q.id] || { farbe: "#c9c3a2", emblem: "z-triforce" };
    const cls = st === "bestanden" ? "won" : st === "verloren" ? "lost" : "open";
    return `<span class="medal ${cls}${isNext ? " is-next" : ""}${extra}" style="--m:${m.farbe}"><i class="m-face"></i>${useSvg(m.emblem)}</span>`;
  }
  function gemHtml(st, isNext) {
    const cls = st === "bestanden" ? "won" : st === "verloren" ? "lost" : "open";
    return `<span class="gem ${cls}${isNext ? " is-next" : ""}">${useSvg("i-gem")}</span>`;
  }
  const questIcon = (q, st, isNext, extra) => q.typ === "kern" ? medalHtml(q, st, isNext, extra) : gemHtml(st, isNext);
  const statusWort = (id) => id === state.next ? "jetzt dran" : { bestanden: "bestanden", verloren: "verloren", offen: "noch offen" }[state.quests[id]];

  // Sichtbarkeit für Dennis: erledigte Quests und die nächste. Was danach kommt, liegt im Nebel.
  // Verdeckte Prüfungen erscheinen als Medaillon mit „?" (ihre Zahl ist bekannt), verdeckte Sidequests gar nicht.
  const aufgedeckt = id => state.quests[id] !== "offen" || id === state.next;
  const NEBEL = "nebel";
  const coveredMedal = () => `<span class="medal covered"><i class="m-face"></i><b>?</b></span>`;
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
      out.push(`<span class="chip${gewonnen ? "" : " minus"}"><span class="${gewonnen ? "" : "x-over"}">${useSvg(x.symbol)}</span>${esc(x.kurz)}${gewonnen ? "" : " weg"}</span>`);
    });
    return out.length ? out.join("") : `<span class="chip none">nichts</span>`;
  }

  /* ---------- Aufbau (einmal) ---------- */
  function build() {
    // Schmuck an jeder Glasplatte: vier Ecken und ein Stein oben in der Mitte
    document.querySelectorAll(".glass").forEach(g => g.insertAdjacentHTML("afterbegin",
      ["tl", "tr", "bl", "br"].map(k => `<svg class="orn ${k}" viewBox="0 0 28 28" aria-hidden="true"><use href="#o-corner"></use></svg>`).join("") + `<i class="orn-mid" aria-hidden="true"></i>`));

    // HUD: eine Karte pro Pack im Kästchen, ab 10 in zwei Reihen wie Herzen
    const row = $("#packRow"), max = C.waehrung.max;
    row.style.gridTemplateColumns = `repeat(${Math.min(max, 10)}, auto)`;
    row.classList.toggle("two", max > 10);
    row.innerHTML = Array.from({ length: max }, () => cardSvg("empty")).join("");
    $("#tumblers").innerHTML = C.code.map((_, i) => `<span class="tumbler" data-i="${i}"><span>?</span></span>`).join("");

    // Quests: eine Zeile pro Quest, in Spielreihenfolge
    $("#questList").innerHTML = C.quests.map(q =>
      `<li><button type="button" class="q-row ${q.typ}" data-id="${q.id}"><span class="ic"></span><span class="q-name">${esc(q.name)}</span><span class="q-mark"></span></button></li>`).join("")
      + `<li><button type="button" class="q-row nebel" data-id="${NEBEL}"><span class="ic">${coveredMedal()}</span><span class="q-name"></span><span class="q-mark"></span></button></li>`;
    document.querySelectorAll(".q-row").forEach(b => b.addEventListener("click", () => { followNext = b.dataset.id === state.next; selectQuest(b.dataset.id); }));

    // Karte: Weg durch die Stationen, eine Marke pro Station
    $("#mapRoute").setAttribute("d", smoothPath(kartenPunkte()));
    $("#mapMarks").innerHTML = STATIONEN.map(s =>
      `<button type="button" class="mark" data-station="${s.id}" style="left:${s.x}%;top:${s.y}%" aria-label="${s.ort}"><span class="m-medal"></span><span class="gems"></span><span class="m-label">${s.name}</span></button>`).join("")
      + `<span class="map-lake-label">TEGERNSEE</span>`;
    document.querySelectorAll(".mark").forEach(b => b.addEventListener("click", () => { followHier = false; selectStation(b.dataset.station, true); }));

    // Ausrüstung: links Items im Quadrat, rechts Fähigkeiten im Dreieck
    const slot = it => {
      const x = itemInfo(it.id);
      return `<button type="button" class="slot" data-id="${it.id}"><span class="well" style="--c:${x.farbe}">${useSvg(x.symbol)}</span></button>`;
    };
    $("#slotsGear").innerHTML = C.items.filter(it => itemInfo(it.id).gruppe !== "faehigkeit").map(slot).join("");
    $("#slotsSkill").innerHTML = C.items.filter(it => itemInfo(it.id).gruppe === "faehigkeit").map(slot).join("");
    document.querySelectorAll(".slot").forEach(b => b.addEventListener("click", () => selectItem(b.dataset.id)));
  }

  const kartenPunkte = () => STATIONEN.map(s => [s.x * 10, s.y * 4.2]);
  // Weicher Weg durch die Punkte. bis = Anzahl Abschnitte (für den schon gegangenen Teil, gleiche Kurve)
  function smoothPath(p, bis = p.length - 1) {
    let d = `M${p[0][0]} ${p[0][1]}`;
    for (let i = 0; i < bis; i++) {
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
    menuFx.retarget();
  }

  function renderHud() {
    const s = state, zeige = hudHold || s;
    document.querySelectorAll("#packRow .ic-card").forEach((c, i) => {
      const leer = i >= zeige.packs;
      c.classList.toggle("empty", leer);
      c.querySelector("use").setAttribute("href", leer ? "#i-card-empty" : "#i-card");
    });
    $("#packsVal").textContent = zeige.packs;
    $("#hudPacks").setAttribute("aria-label", `${s.packs} von ${s.max} Packs gehören dir`);
    document.querySelectorAll("#tumblers .tumbler").forEach((t, i) => {
      if (t.classList.contains("rolling")) return;
      const v = zeige.ziffern[i];
      t.firstElementChild.textContent = v == null ? "?" : v;
      t.classList.toggle("known", v != null);
    });
    $("#hudCode").setAttribute("aria-label", "Code des Kästchens: " + s.ziffern.map(v => v == null ? "unbekannt" : v).join(", "));
    const n = s.next ? questById(s.next) : null, verdeckt = n && n.id === revealPending;
    $("#hudNext").classList.toggle("done", !n);
    $("#hudNextIc").innerHTML = !n ? "" : verdeckt ? (n.typ === "kern" ? coveredMedal() : "") : questIcon(n, "offen", false);
    $("#hudNextName").textContent = !n ? "Zum Kästchen" : verdeckt ? "?" : n.name;
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
    $("#listLegend").innerHTML = `<span title="Prüfungen"><span class="medal won" style="--m:#e6bb38"><i class="m-face"></i>${useSvg("z-triforce")}</span><b>${done(kern)}/${kern.length}</b></span>`
      + `<span title="Sidequests">${gemHtml("bestanden", false)}<b>${done(side)}</b></span>`;
    renderQuestCard(sel[1]);
  }

  function renderQuestCard(id) {
    const card = $("#questCard");
    card.classList.toggle("fogged", id === revealPending);
    if (id === NEBEL) {
      card.style.setProperty("--m", "#8caea4");
      card.innerHTML = `
        <span class="qc-mark" aria-hidden="true">${useSvg("z-triforce")}</span>
        <div class="qc-head">${coveredMedal()}<div><p class="tb-title">Im Nebel</p></div></div>
        <p class="tb-text">Zeigt sich, wenn es dran ist.</p>`;
      return;
    }
    const q = questById(id), st = state.quests[id], isNext = id === state.next;
    const m = q.typ === "kern" ? MEDAILLON[id] : null;
    card.style.setProperty("--m", m ? m.farbe : STEIN_FARBE);
    const tag = isNext ? `<span class="tag now">JETZT</span>` : st === "bestanden" ? `<span class="tag won">BESTANDEN</span>`
      : st === "verloren" ? `<span class="tag lost">VERLOREN</span>` : `<span class="tag open">NOCH OFFEN</span>`;
    card.innerHTML = `
      <span class="qc-mark" aria-hidden="true">${useSvg(m ? m.emblem : "i-gem")}</span>
      <div class="qc-head">${questIcon(q, st, false, st === "bestanden" ? " shine" : "")}<div><p class="tb-title">${esc(q.name)}</p><p class="tb-meta">${tag}${useSvg("i-pin", "pin")}<span class="ort">${esc(q.ort)}</span></p></div></div>
      <p class="tb-text">${esc(QUEST_TEXT[id] || q.beschreibung)}</p>
      ${hilftHtml(id)}
      <div class="stakes">
        <div class="stake win${st === "verloren" ? " dim" : ""}"><span class="st-lbl">SIEG</span><span class="fx">${fxChips(q.win, true)}</span></div>
        <div class="stake lose${st === "bestanden" ? " dim" : ""}"><span class="st-lbl">NIEDERLAGE</span><span class="fx">${fxChips(q.lose, false)}</span></div>
      </div>`;
  }

  // Welche Items hier helfen: im Beutel leuchtend, verloren mit X, noch nicht erspielt als Schattenriss
  function hilftHtml(id) {
    const ids = HILFT[id];
    if (!ids) return "";
    const hat = ids.filter(i => state.items[i] === "besitz").length;
    return `<div class="helps"><span class="fx-head">HILFT ${hat}/${ids.length}</span><span class="helps-row">${ids.map(i => {
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
    if (play) sfx("move");
    menuFx.retarget();
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
    $("#pipsSide").innerHTML = side.filter(q => aufgedeckt(q.id)).map(q => gemHtml(s.quests[q.id], q.id === s.next)).join("");
    $("#cntKern").textContent = `${kern.filter(q => s.quests[q.id] !== "offen").length}/${kern.length}`;
    $("#cntSide").textContent = `${side.filter(q => s.quests[q.id] !== "offen").length}`;

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
    // Gegangener Weg in Gold bis „Du bist hier", Nebel ab der Mitte zur nächsten Station
    const hi = STATIONEN.findIndex(x => x.id === hier), weiter = STATIONEN[hi + 1];
    const gegangen = hi > 0 ? smoothPath(kartenPunkte(), hi) : "";
    $("#mapWalked").setAttribute("d", gegangen);
    $("#mapWalkedGlow").setAttribute("d", gegangen);
    $("#mapFog").hidden = !(s.next && weiter);
    if (s.next && weiter) $("#mapFog").style.left = ((STATIONEN[hi].x + weiter.x) / 2) + "%";
    renderStationBox(sel[0]);
  }

  function renderStationBox(id) {
    const st = STATIONEN.find(x => x.id === id);
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
    if (play) sfx("move");
    menuFx.retarget();
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
    box.innerHTML = `${useSvg(x.symbol, "ib-icon st-" + st)}<p class="tb-title">${esc(it.name)}${tag}</p><p class="tb-text">${esc(x.text)}${extra}</p>`;
  }

  function selectItem(id, play = true) {
    sel[2] = id;
    document.querySelectorAll(".slot").forEach(b => b.classList.toggle("is-selected", b.dataset.id === id));
    renderItemBox(id);
    if (play) sfx("move");
    menuFx.retarget();
  }

  /* ---------- Ergebnis-Fenster ---------- */
  let overlayAfter = null, overlayAt = 0, moment = null;
  function showOverlay(o, after) {
    const ov = $("#overlay"), r = $("#overlay .result");
    $("#resultHead").innerHTML = o.head;
    $("#resultLines").innerHTML = o.lines || "";
    $("#resultNext").textContent = o.next || "";
    ov.classList.toggle("gross", !!o.gross);
    ov.classList.toggle("lost", !!o.lost);
    r.classList.toggle("moment", !!o.gross);
    [...$("#resultLines").children].forEach((li, i) => li.style.setProperty("--d", i));
    ov.hidden = false;
    overlayAfter = after || null;
    overlayAt = performance.now();
    if (o.gross) burst.play(o.lost, o.farbe);
  }
  function closeOverlay() {
    if ($("#overlay").hidden) return;
    if (performance.now() - overlayAt < 650) return;       // der große Moment soll nicht aus Versehen weggetippt werden
    finishMoment();
    burst.stop();
    $("#overlay").hidden = true;
    const f = overlayAfter; overlayAfter = null;
    if (f) f();
  }

  /* ---------- Nach dem Fenster: Packs fliegen ins HUD, neue Ziffern drehen sich ein ---------- */
  function startMoment(prev, next) {
    hudHold = { packs: prev.packs, ziffern: prev.ziffern.slice() };
    moment = { timers: [], anims: [] };
    game.classList.add("moment");
    renderHud();
    const zeilen = $("#resultLines").children.length;
    let t = still.matches ? 150 : 900 + zeilen * 160 + 300;
    const diff = next.packs - prev.packs;
    if (diff > 0) {
      const quelle = $("#resultLines .ic-card") || $("#resultHead .ic-card");
      for (let k = 0; k < diff; k++) {
        const idx = prev.packs + k;
        later(t + k * 200, () => flyCard(quelle, idx, () => {
          if (!hudHold) return;
          hudHold.packs = Math.max(hudHold.packs, idx + 1); renderHud();
          blink(document.querySelectorAll("#packRow .ic-card")[idx], "gain"); sfx("pling");
        }));
      }
      t += diff * 200 + 800;
    } else if (diff < 0) {
      later(t, () => {
        const karten = document.querySelectorAll("#packRow .ic-card");
        for (let i = next.packs; i < prev.packs; i++) blink(karten[i], "loss");
        sfx("loss");
        later(380, () => { if (hudHold) { hudHold.packs = next.packs; renderHud(); } });
      });
      t += 600;
    }
    next.ziffern.forEach((v, i) => {
      if (v == null || prev.ziffern[i] != null) return;
      later(t, () => rollTumbler(i, v));
      t += 300;
    });
    later(t + 1000, () => { hudHold = null; renderHud(); });
  }
  function later(ms, fn) { if (moment) moment.timers.push(setTimeout(fn, ms)); }
  function blink(el, cls) { if (!el) return; el.classList.remove(cls); void el.getBoundingClientRect(); el.classList.add(cls); }
  function finishMoment() {
    if (!moment) return;
    moment.timers.forEach(clearTimeout);
    moment.anims.forEach(a => a.cancel());
    document.querySelectorAll(".fly-card").forEach(el => el.remove());
    document.querySelectorAll(".tumbler.rolling").forEach(el => { clearInterval(el._roll); el.classList.remove("rolling"); });
    moment = null; hudHold = null;
    game.classList.remove("moment");
    renderHud();
  }
  function flyCard(von, idx, landen) {
    const ziel = document.querySelectorAll("#packRow .ic-card")[idx];
    if (!von || !ziel || still.matches || !moment) return landen();
    const a = von.getBoundingClientRect(), b = ziel.getBoundingClientRect();
    const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    el.setAttribute("viewBox", "0 0 22 30"); el.setAttribute("class", "fly-card");
    el.innerHTML = `<use href="#i-card"></use>`;
    el.style.width = a.width + "px"; el.style.height = a.height + "px";
    game.appendChild(el);
    const dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    const x0 = a.left, y0 = a.top, sc = b.width / a.width;
    const anim = el.animate([
      { transform: `translate(${x0}px, ${y0}px) scale(1)`, opacity: 0 },
      { transform: `translate(${x0}px, ${y0 - 16}px) scale(1.4)`, opacity: 1, offset: .16 },
      { transform: `translate(${x0 + dx * .5}px, ${y0 + dy * .5 - 44}px) scale(1.15) rotate(200deg)`, offset: .56 },
      { transform: `translate(${x0 + dx}px, ${y0 + dy}px) scale(${sc}) rotate(360deg)`, opacity: 1 }
    ], { duration: 780, easing: "cubic-bezier(.45, 0, .25, 1)", fill: "forwards" });
    moment.anims.push(anim);
    anim.onfinish = () => { el.remove(); landen(); };
  }
  function rollTumbler(i, v) {
    const t = document.querySelectorAll("#tumblers .tumbler")[i];
    const fertig = () => { if (hudHold) hudHold.ziffern[i] = v; renderHud(); blink(t, "gain"); sfx("pling"); };
    if (!t || still.matches) return fertig();
    t.classList.add("rolling");
    let n = v + 3;
    t._roll = setInterval(() => { t.firstElementChild.textContent = n++ % 10; if (n % 2) sfx("tick"); }, 60);
    later(800, () => { clearInterval(t._roll); t.classList.remove("rolling"); fertig(); });
  }

  /* ---------- Funken im großen Moment ---------- */
  const burst = (() => {
    const canvas = $("#ovFx"), ctx = canvas.getContext("2d");
    let raf = 0, last = 0, dpr = 1, parts = [], quelle = null, verloren = false, farbe = null, zeit = 0, timer = 0;
    function size() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    }
    function play(lost, hex) {
      stop();
      if (still.matches) return;
      verloren = lost; farbe = glowFor(hex || "#f6dc7a"); zeit = 0;
      size();
      timer = setTimeout(() => {
        const st = $(".medal-stage");
        if (!st) return;
        const r = st.getBoundingClientRect();
        quelle = { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 };
        const n = lost ? 24 : 96;
        for (let i = 0; i < n; i++) {
          const w = rnd(0, Math.PI * 2), v = lost ? rnd(15, 55) : rnd(90, 330);
          parts.push({ x: quelle.x + Math.cos(w) * quelle.r * .3, y: quelle.y + Math.sin(w) * quelle.r * .3, vx: Math.cos(w) * v, vy: Math.sin(w) * v - (lost ? -10 : 50),
            life: 0, max: rnd(.9, 2.1), r: rnd(1.6, 3.6), spr: lost ? SPR.grau : Math.random() < .55 ? farbe : SPR.gold, glanz: !lost && Math.random() < .22, g: lost ? 110 : 70 });
        }
        last = 0; raf = requestAnimationFrame(frame);
      }, lost ? 420 : 640);
    }
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(.05, (now - (last || now)) / 1000); last = now; zeit += dt;
      // danach steigen noch eine Weile leise Funken vom Medaillon auf
      if (!verloren && quelle && Math.random() < dt * 9) parts.push({ x: quelle.x + rnd(-quelle.r, quelle.r) * .8, y: quelle.y + rnd(-quelle.r, quelle.r) * .4, vx: rnd(-8, 8), vy: rnd(-40, -18),
        life: 0, max: rnd(1.4, 2.6), r: rnd(1.2, 2.4), spr: Math.random() < .5 ? farbe : SPR.gold, glanz: Math.random() < .15, g: -4 });
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalCompositeOperation = "lighter";
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += dt;
        if (p.life >= p.max) { parts.splice(i, 1); continue; }
        p.vx *= .965; p.vy = p.vy * .965 + p.g * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        const a = Math.min(1, p.life / .12) * (1 - p.life / p.max) * (.7 + .3 * Math.sin(p.life * 18));
        dot(ctx, p.spr, p.x, p.y, p.r * 3, a);
        if (p.glanz && a > .3) glint(ctx, p.x, p.y, p.r * 3.2, a * .8);
      }
      ctx.globalAlpha = 1;
    }
    function stop() { clearTimeout(timer); cancelAnimationFrame(raf); raf = 0; parts = []; quelle = null; ctx.clearRect(0, 0, canvas.width, canvas.height); }
    return { play, stop };
  })();

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
      if (v != null && prev.ziffern[i] == null) lines.push(`<li class="plus"><span class="ri"><span class="mini-tumbler">${v}</span></span>Ziffer ${i + 1}: ${v}</li>`);
    });
    const itemLines = [];
    C.items.forEach(it => {
      const x = itemInfo(it.id);
      if (prev.items[it.id] !== "besitz" && next.items[it.id] === "besitz") itemLines.push(`<li class="plus"><span class="ri">${useSvg(x.symbol)}</span>${esc(it.name)}</li>`);
      if (prev.items[it.id] === "besitz" && next.items[it.id] === "verloren") itemLines.push(`<li class="minus"><span class="ri x-over">${useSvg(x.symbol)}</span>${esc(it.name)} weg</li>`);
    });
    lines.push(...itemLines);
    const zurueck = C.quests.some(q => prev.quests[q.id] !== "offen" && next.quests[q.id] === "offen");
    if (!fertig.length && (zurueck || (!neueBuchungen.length && !itemLines.length))) return;

    let head, klang = dPacks < 0 ? "minus" : "plus", won = true, farbe = null;
    if (fertig.length) {
      const q = fertig[0];
      won = next.quests[q.id] === "bestanden";
      const art = q.typ === "kern" ? "PRÜFUNG" : "SIDEQUEST";
      farbe = q.typ === "kern" ? (MEDAILLON[q.id] || {}).farbe : STEIN_FARBE;
      klang = !won ? "verloren" : q.typ === "kern" ? "pruefung" : "side";
      const riss = won ? "" : `<svg class="crack" viewBox="0 0 100 100" aria-hidden="true"><path d="M56 6 48 26l10 10-14 16 8 12-12 14 6 16" fill="none" stroke="#1d1a17" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" pathLength="1"/><path d="M58 36l14 6M44 52 30 50M52 64l14 8" fill="none" stroke="#1d1a17" stroke-width="2" stroke-linecap="round" pathLength="1"/></svg>`;
      head = `<span class="medal-stage ${won ? "won" : "lost"}" style="--m:${farbe}">${questIcon(q, next.quests[q.id], false, won ? " shine" : "")}${riss}</span>
              <div class="band${won ? "" : " lost"}"><p class="big${won ? "" : " lost"}" id="resultTitle">${art} ${won ? "BESTANDEN" : "VERLOREN"}</p></div>
              <p class="sub">${esc(q.name)}${fertig.length > 1 ? ` und ${fertig.length - 1} weitere` : ""}</p>`;
      if (!lines.length) lines.push(`<li><span class="ri"></span>Keine Folgen</li>`);
    } else if (neueBuchungen.length) {
      const b = neueBuchungen[neueBuchungen.length - 1];
      const titel = b.ziffer ? "ZIFFER GEKAUFT" : dPacks < 0 ? "PACKS WEG" : dPacks > 0 ? "PACKS DAZU" : "BUCHUNG";
      head = `<span class="ri-big">${cardSvg()}</span><p class="big${dPacks < 0 && !b.ziffer ? " lost" : ""}" id="resultTitle">${titel}</p><p class="sub">${esc(b.grund || "Buchung vom Quest Master")}</p>`;
      if (!lines.length) lines.push(`<li><span class="ri"></span>Du hattest keine Packs mehr, es bleibt bei 0.</li>`);
    } else {
      head = `<span class="ri-big">${useSvg("i-pouch")}</span><p class="big" id="resultTitle">DEIN BEUTEL</p><p class="sub">Der Quest Master hat etwas geändert.</p>`;
    }
    // Die nächste Quest wird erst nach dem Fenster aufgedeckt, darum steht ihr Name hier nicht
    const warSichtbar = id => prev.quests[id] !== "offen" || prev.next === id;
    if (next.next && !warSichtbar(next.next)) revealPending = next.next;
    melody(klang);
    showOverlay({ head, lines: lines.join(""), next: next.next ? "" : "Zum Kästchen", gross: fertig.length > 0, lost: fertig.length > 0 && !won, farbe }, showNextQuest);
    finishMoment();
    startMoment(prev, next);
    renderQuests();
  }

  function explainPacks() {
    const s = state;
    showOverlay({
      head: `<span class="ri-big">${cardSvg()}</span><p class="big" id="resultTitle">${s.packs} / ${s.max} PACKS</p>`,
      lines: `<li><span class="ri">${cardSvg()}</span>deins</li>
              <li><span class="ri">${cardSvg("empty")}</span>beim Bund</li>`
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
      return `<li class="${v == null ? "" : "plus"}"><span class="ri"><span class="tumbler${v == null ? "" : " known"}"><span>${v == null ? "?" : v}</span></span></span>${v == null ? offen : s.gekauft[i] ? "gekauft" : wo}</li>`;
    }).join("");
    showOverlay({ head: `<span class="ri-big lock">${useSvg("i-lock")}</span><p class="big" id="resultTitle">CODE</p>`, lines });
  }

  /* ---------- Navigation: drei Seiten, die seitlich gleiten ---------- */
  const faceOf = i => document.querySelector(`.face[data-page="${i}"]`);
  function setActiveFace() {
    document.querySelectorAll(".face").forEach(f => {
      const on = +f.dataset.page === page;
      f.classList.toggle("active", on);
      f.inert = !on;
      f.setAttribute("aria-hidden", String(!on));
    });
  }
  function updateTabs(dir = 0) {
    $("#tabNow").textContent = SEITEN[page];
    $("#tabPrev").textContent = SEITEN[(page + 2) % 3];
    $("#tabNext").textContent = SEITEN[(page + 1) % 3];
    $(".tab-prev").setAttribute("aria-label", "Zur Seite " + SEITEN[(page + 2) % 3]);
    $(".tab-next").setAttribute("aria-label", "Zur Seite " + SEITEN[(page + 1) % 3]);
    if (dir && !still.matches) { const t = $("#tabs"); t.style.setProperty("--dir", dir); t.classList.remove("swap"); void t.offsetWidth; t.classList.add("swap"); }
  }

  function goTo(target, dir) {
    if (target === page) return;
    if (!dir) dir = (target - page + 3) % 3 === 1 ? 1 : -1;
    const alt = faceOf(page), neu = faceOf(target);
    page = target;
    setActiveFace();
    if (!still.matches) {
      alt.classList.add("leaving");
      const a = alt.animate([{ transform: "none", opacity: 1 }, { transform: `translateX(${-dir * 14}%) scale(.97)`, opacity: 0 }], { duration: 300, easing: "cubic-bezier(.4, 0, .2, 1)" });
      a.onfinish = a.oncancel = () => alt.classList.remove("leaving");
      neu.animate([{ transform: `translateX(${dir * 14}%) scale(.97)`, opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 400, delay: 50, easing: "cubic-bezier(.2, .8, .2, 1)", fill: "backwards" });
    }
    $("#worldCam").style.setProperty("--par", PARALLAXE[page]);
    updateTabs(dir);
    sfx("page");
    if (page === 1) { const row = document.querySelector(".q-row.is-selected"); if (row) scrollIntoList(row); }
    menuFx.retarget();
  }
  const turn = d => goTo((page + d + 3) % 3, d);

  function showNextQuest() {
    followNext = true; followHier = true;
    renderQuests(); renderMap();
    const warte = page !== 1 ? 450 : 0;
    if (page !== 1) goTo(1);
    else { const row = document.querySelector(".q-row.is-selected"); if (row) scrollIntoList(row); menuFx.retarget(); }
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
    menuFx.retarget();
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
  $("#questList").addEventListener("scroll", () => menuFx.follow(), { passive: true });

  // Tastatur (Laptop): Z/R Seite, Pfeile Auswahl, Enter/Esc schließt das Fenster
  window.addEventListener("keydown", e => {
    if (!intro.hidden) return;
    const k = e.key.toLowerCase();
    if (!$("#overlay").hidden) { if (["enter", " ", "escape", "a"].includes(k)) { e.preventDefault(); closeOverlay(); } return; }
    if (k === "z" || k === "q") return turn(-1);
    if (k === "r" || k === "e") return turn(1);
    const step = { arrowdown: 1, arrowright: 1, arrowup: -1, arrowleft: -1 }[k];
    if (!step) return;
    e.preventDefault();
    if (page === 1) { const ids = [...document.querySelectorAll(".quest-list li:not([hidden]) .q-row")].map(b => b.dataset.id); followNext = false; selectQuest(ids[(ids.indexOf(sel[1]) + step + ids.length) % ids.length]); }
    if (page === 0) { const ids = STATIONEN.map(s => s.id); followHier = false; selectStation(ids[(ids.indexOf(sel[0]) + step + ids.length) % ids.length]); }
    if (page === 2) { const ids = [...document.querySelectorAll(".slot")].map(b => b.dataset.id); selectItem(ids[(ids.indexOf(sel[2]) + step + ids.length) % ids.length]); }
  });

  /* ---------- Die Fee im Menü: Cursor mit Feenstaub, dazu Glühwürmchen hinter den Platten ---------- */
  const menuFx = (() => {
    const bg = $("#bgFx"), fx = $("#fairyFx"), fee = $("#fairy");
    const bctx = bg.getContext("2d"), fctx = fx.getContext("2d");
    let raf = 0, last = 0, t = 0, dpr = 1, W = 0, H = 0, fw = 40, fh = 46, emit = 0, running = false;
    const pos = { x: -200, y: -200, s: 1 };
    let flug = null;
    const staub = [];
    const wuermchen = Array.from({ length: 12 }, () => ({ x: Math.random(), y: Math.random(), a: rnd(0, 6.3), b: rnd(0, 6.3), s: rnd(.12, .3), r: rnd(4, 7), p: rnd(0, 6.3), f: rnd(.35, .8) }));

    // Wo die Fee sitzt: an der Auswahl der aktiven Seite
    function anker() {
      if (page === 1) {
        const row = document.querySelector(".q-row.is-selected");
        if (!row) return null;
        const r = row.getBoundingClientRect(), l = $("#questList").getBoundingClientRect();
        return { x: r.left - 1, y: clamp(r.top + 3, l.top + 2, l.bottom - 10) };
      }
      if (page === 2) {
        const w = document.querySelector(".slot.is-selected .well");
        if (!w) return null;
        const r = w.getBoundingClientRect();
        return { x: r.right - 3, y: r.top + 2 };
      }
      const m = document.querySelector(".mark.is-selected .m-medal > *");
      if (!m) return null;
      const r = m.getBoundingClientRect();
      return { x: r.right + 2, y: r.top };
    }
    function size() {
      W = fx.clientWidth; H = fx.clientHeight;
      if (!W) return;
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      for (const c of [bg, fx]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
      fw = fee.offsetWidth || 40; fh = fee.offsetHeight || fw * 162 / 142;
    }
    function place() { fee.style.transform = `translate(${(pos.x - fw * .49).toFixed(1)}px, ${(pos.y - fh * .485).toFixed(1)}px) scale(${pos.s.toFixed(3)})`; }
    // still: die Fee sitzt ohne Flug an der Auswahl (auch bei „Bewegung reduzieren")
    function setzen() {
      const a = anker();
      if (!a) return;
      pos.x = a.x; pos.y = a.y; pos.s = 1; place();
    }
    function retarget() {
      if (!fee.classList.contains("on")) return;
      if (!running) return setzen();
      const a = anker();
      if (!a) return;
      const dist = Math.hypot(a.x - pos.x, a.y - pos.y);
      if (dist < 8 && !flug) return;
      flug = { x0: pos.x, y0: pos.y, s0: pos.s, t0: performance.now(), dur: clamp(260 + dist * .9, 320, 700), bogen: clamp(dist * .22, 10, 46) };
    }
    function follow() { if (!running) setzen(); }
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(.05, (now - (last || now)) / 1000); last = now; t += dt;
      const alt = { x: pos.x, y: pos.y };
      const a = anker();
      if (a && flug) {
        const k = Math.min(1, (now - flug.t0) / flug.dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const mx = (flug.x0 + a.x) / 2, my = (flug.y0 + a.y) / 2 - flug.bogen;   // Bogen nach oben
        pos.x = (1 - e) * (1 - e) * flug.x0 + 2 * (1 - e) * e * mx + e * e * a.x;
        pos.y = (1 - e) * (1 - e) * flug.y0 + 2 * (1 - e) * e * my + e * e * a.y;
        pos.s = flug.s0 + (1 - flug.s0) * e;
        if (k >= 1) flug = null;
      } else if (a) {
        // schweben: kleine Acht um die Auswahl, folgt beim Scrollen weich
        const tx = a.x + Math.sin(t * 1.6) * 3 + Math.sin(t * .7) * 1.5, ty = a.y + Math.sin(t * 2.4) * 2.4;
        const k = 1 - Math.exp(-dt * 9);
        pos.x += (tx - pos.x) * k; pos.y += (ty - pos.y) * k;
      }
      place();
      const tempo = dt ? Math.hypot(pos.x - alt.x, pos.y - alt.y) / dt : 0;

      bctx.setTransform(1, 0, 0, 1, 0, 0); bctx.clearRect(0, 0, bg.width, bg.height);
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0); bctx.globalCompositeOperation = "lighter";
      for (const g of wuermchen) {
        const x = g.x * W + Math.sin(t * g.s + g.a) * 46 + Math.sin(t * g.s * 2.3 + g.b) * 14;
        const y = g.y * H + Math.cos(t * g.s * .9 + g.b) * 30 + Math.sin(t * g.s * 1.7 + g.a) * 10;
        const an = Math.max(0, Math.sin(t * g.f + g.p));
        dot(bctx, SPR.gruen, x, y, g.r * 3, an * an * .85);
      }
      bctx.globalAlpha = 1;

      fctx.setTransform(1, 0, 0, 1, 0, 0); fctx.clearRect(0, 0, fx.width, fx.height);
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0); fctx.globalCompositeOperation = "lighter";
      dot(fctx, SPR.schein, pos.x, pos.y, fw * .95 * pos.s, .22 + .08 * Math.sin(t * 3.1));
      for (emit += dt * (6 + Math.min(70, tempo * .12)); emit >= 1; emit--) {
        const f = Math.random();
        staub.push({ x: pos.x + rnd(-4, 5) * pos.s, y: pos.y + rnd(3, 9) * pos.s, vx: rnd(-10, 10) - (pos.x - alt.x) / (dt || 1) * .15, vy: rnd(0, 10), r: rnd(.8, 1.8) * pos.s, life: 0, max: rnd(.7, 1.6), p: rnd(0, 6.3),
          spr: f < .6 ? SPR.flieder : f < .88 ? SPR.blau : SPR.gold, glanz: Math.random() < .15 });
      }
      for (let i = staub.length - 1; i >= 0; i--) {
        const s = staub[i];
        s.life += dt;
        if (s.life >= s.max) { staub.splice(i, 1); continue; }
        s.vy += 16 * dt; s.vx *= .98;
        s.x += (s.vx + Math.sin(s.life * 3 + s.p) * 5) * dt; s.y += s.vy * dt;
        const al = Math.min(1, s.life / .2) * Math.min(1, (s.max - s.life) / (s.max * .45)) * (.55 + .4 * Math.sin(s.life * 14 + s.p));
        dot(fctx, s.spr, s.x, s.y, s.r * 2.6, al);
        if (s.glanz && al > .3) glint(fctx, s.x, s.y, s.r * 3, al * .75);
      }
      fctx.globalAlpha = 1;
    }
    // start({x, y, s}): die Fee kommt vom Startbildschirm und fliegt zur Auswahl
    function start(von) {
      size();
      fee.classList.add("on");
      if (still.matches) return setzen();
      if (von) { pos.x = von.x; pos.y = von.y; pos.s = von.s || 1; flug = { x0: pos.x, y0: pos.y, s0: pos.s, t0: performance.now() + 250, dur: 1050, bogen: 60 }; }
      else setzen();
      if (!running) { running = true; last = 0; raf = requestAnimationFrame(frame); }
    }
    function stop() { cancelAnimationFrame(raf); raf = 0; running = false; }
    if ("ResizeObserver" in window) new ResizeObserver(() => { size(); if (!running) setzen(); }).observe(fx);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else if (fee.classList.contains("on") && !still.matches && !running) { running = true; last = 0; raf = requestAnimationFrame(frame); }
    });
    return { start, stop, retarget, follow };
  })();

  /* ---------- Startbildschirm und Übergang ins Menü ---------- */
  const intro = $("#introScreen");
  const playElements = [...document.querySelectorAll(".hud, .tabs, .stage, .foot")];
  function setPlayable(on) { playElements.forEach(el => { el.inert = !on; if (on) el.removeAttribute("aria-hidden"); else el.setAttribute("aria-hidden", "true"); }); }
  // PRESS START: Lichtblitz, die Kamera fährt den Weg hinein und das Bild geht in den unscharfen Wald hinter dem Menü über.
  // Die Fee löst sich und fliegt zur nächsten Quest, danach erscheinen HUD, Seitenleiste und Platte.
  function beginQuest() {
    if (intro.hidden || intro.classList.contains("is-leaving")) return;
    sfx("start");
    const cam = $("#introCam"), wcam = $("#worldCam"), feeIntro = $("#introFee");
    const fr = feeIntro.getBoundingClientRect();
    if (still.matches) {
      intro.hidden = true; introFx.stop(); setPlayable(true); menuFx.start(); nachDemStart();
      return;
    }
    let s0 = 1;                                                        // aktuelle Zoomstufe des Titelbilds
    try { s0 = new DOMMatrix(getComputedStyle(cam).transform).a || 1; } catch (_) {}
    cam.style.animation = "none"; cam.style.transform = `scale(${s0})`;
    wcam.style.transition = "none"; wcam.style.setProperty("--zoom", s0);
    void cam.offsetWidth; void wcam.offsetWidth;
    wcam.style.transition = "";
    game.classList.add("entering");
    intro.classList.add("is-leaving");
    cam.style.transform = "scale(1.2)";
    wcam.style.removeProperty("--zoom");
    feeIntro.style.visibility = "hidden";
    setPlayable(true);
    nachDemStart();
    menuFx.start({ x: fr.left + fr.width * .49, y: fr.top + fr.height * .485, s: fr.width / ($("#fairy").offsetWidth || 40) });
    setTimeout(() => { intro.hidden = true; introFx.stop(); }, 1000);
    setTimeout(() => game.classList.remove("entering"), 1600);
  }
  function nachDemStart() { const row = document.querySelector(".q-row.is-selected"); if (row) scrollIntoList(row); }
  intro.addEventListener("click", beginQuest);        // PRESS START: Tippen irgendwo startet
  if (params.has("direkt")) { intro.hidden = true; }

  /* ---------- Startbildschirm belebt: Fee schwebt, Feenstaub, Glühwürmchen, Staub im Lichtstrahl ---------- */
  // Alles in Koordinaten des Titelbilds (1672 × 941). Läuft nur, solange der Startbildschirm zu sehen ist.
  const introFx = (() => {
    const BW = 1672, FEE = { x: 649, y: 337 };          // Mitte der Fee im Bild
    const canvas = $("#introFx"), fee = $("#introFee"), ctx = canvas.getContext("2d");
    let raf = 0, last = 0, t = 0, k = 1, dpr = 1, emit = 0, alt = { x: 0, y: 0 };
    const staub = [];
    // Glühwürmchen kreisen um ihren Platz, nie über Logo, Gesicht oder PRESS START
    const wuermchen = [[70, 230], [150, 520], [40, 640], [230, 90], [260, 760], [120, 860], [840, 120], [980, 60], [1120, 130], [790, 560], [1330, 875], [1500, 860], [1625, 700], [1560, 120], [1400, 60], [860, 870]]
      .map(([x, y]) => ({ x, y, a: rnd(0, 6.3), b: rnd(0, 6.3), s: rnd(.25, .5), r: rnd(5, 8), p: rnd(0, 6.3), f: rnd(.5, 1) }));
    // Staub im Lichtstrahl über dem Weg (der Strahl fällt wie im Bild leicht nach links)
    const inStrahl = (m, neu) => { m.y = neu ? rnd(0, 700) : m.y; m.x = rnd(640, 880) - m.y * .149; return m; };
    const licht = Array.from({ length: 34 }, () => inStrahl({ vx: rnd(-6, 4), vy: rnd(-5, 3), r: rnd(1.3, 2.5), p: rnd(0, 6.3) }, true));

    function size() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w) return;
      dpr = Math.min(1.5, window.devicePixelRatio || 1);    // weiche Lichtpunkte brauchen keine volle Auflösung
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      k = w / BW;
    }
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(.05, (now - (last || now)) / 1000); last = now; t += dt;
      // Fee schwebt in einer ruhigen Acht um ihren Platz
      const d = { x: Math.sin(t * .8) * 12 + Math.sin(t * 1.9) * 4, y: Math.sin(t * 1.3) * 8 + Math.cos(t * .55) * 5 };
      fee.style.transform = `translate(${(d.x * k).toFixed(2)}px, ${(d.y * k).toFixed(2)}px)`;
      const fx = FEE.x + d.x, fy = FEE.y + d.y, vfx = dt ? (d.x - alt.x) / dt : 0; alt = d;
      for (emit += dt * 15; emit >= 1; emit--) {               // Staub fällt unter der Fee heraus, nicht aus ihrem Körper
        const farbe = Math.random();
        staub.push({ x: fx + rnd(-16, 18), y: fy + rnd(12, 26), vx: rnd(-14, 14) - vfx * .4, vy: rnd(0, 16), r: rnd(1.4, 3.2), life: 0, max: rnd(1.6, 3.4), p: rnd(0, 6.3),
          spr: farbe < .6 ? SPR.flieder : farbe < .88 ? SPR.blau : SPR.gold, glanz: Math.random() < .18 });
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
        dot(ctx, SPR.gold, m.x, m.y, m.r * 2.4, (.22 + .2 * Math.sin(t * 1.8 + m.p)) * (1 - m.y / 900));
      }
      // Glühwürmchen
      for (const g of wuermchen) {
        const x = g.x + Math.sin(t * g.s + g.a) * 28 + Math.sin(t * g.s * 2.3 + g.b) * 10;
        const y = g.y + Math.cos(t * g.s * .9 + g.b) * 22 + Math.sin(t * g.s * 1.7 + g.a) * 8;
        const an = Math.max(0, Math.sin(t * g.f + g.p));
        dot(ctx, SPR.gruen, x, y, g.r * 3.2, an * an * .9);
      }
      // leiser Schein um die Fee, pulsiert
      dot(ctx, SPR.schein, fx, fy, 70, .2 + .1 * Math.sin(t * 3.1));
      // Feenstaub rieselt, schwankt und funkelt
      for (let i = staub.length - 1; i >= 0; i--) {
        const s = staub[i];
        s.life += dt;
        if (s.life >= s.max) { staub.splice(i, 1); continue; }
        s.vy += 14 * dt; s.vx *= .985;
        s.x += (s.vx + Math.sin(s.life * 3 + s.p) * 7) * dt; s.y += s.vy * dt;
        const a = Math.min(1, s.life / .35) * Math.min(1, (s.max - s.life) / (s.max * .4)) * (.5 + .4 * Math.sin(s.life * 14 + s.p));
        dot(ctx, s.spr, s.x, s.y, s.r * 2.6, a);
        if (s.glanz && a > .3) glint(ctx, s.x, s.y, s.r * 3, a * .8);
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
  }
  async function toggleFs() {
    const hinweis = () => showOverlay({ head: `<p class="big" id="resultTitle">VOLLBILD</p><p class="sub">Auf dem iPhone geht das so:</p>`,
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
  updateTabs();
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
    if (meta.initial && intro.hidden) requestAnimationFrame(() => { nachDemStart(); menuFx.start(); });
    if (prev && !meta.initial && intro.hidden) announce(prev, state, prevDoc, doc);
  });
})();
