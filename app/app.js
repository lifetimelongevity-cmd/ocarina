(() => {
  /* Dennis Quest · Dennis' Menü (06-design-plan.md, 07-spiele-und-items.md)
     Drei Seiten im Ring: KARTE · QUESTS · AUSRÜSTUNG. HUD: Packs, nächste Quest, Code.
     Liest den Stand. Schreibt nur eins: Dennis' Antworten im Log-Buch (eigener Pfad).
     ?demo zeigt einen Beispielstand ohne Firebase (auch ?demo=start, ?demo=ende), ?direkt ohne Startbildschirm. */
  const C = window.GAME_CONFIG;
  const E = window.QuestEngine;

  const STATIONEN = C.karte.stationen;
  const REIHE = C.quests.filter(q => q.typ !== "lauf");
  const LAUF = C.quests.filter(q => q.typ === "lauf");
  const START_PAGE = 1;

  /* ---------- Gerät: schwächere Handys bekommen weniger Effekte ---------- */
  const params = new URLSearchParams(location.search);
  const SCHWACH = params.has("schwach") || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;
  document.documentElement.classList.toggle("schwach", SCHWACH);

  /* ---------- Speicher: echt oder Demo ---------- */
  const DEMO = params.has("demo");
  // Onboarding einmal pro Handy. In der Demo und mit ?onboarding jedes Mal neu.
  const OB_KEY = "dq-onboarding-v1";
  let onboarded = false;
  try { onboarded = !DEMO && !params.has("onboarding") && localStorage.getItem(OB_KEY) === "1"; } catch (e) {}
  const DEMO_DOCS = {
    start: { quests: {} },
    mitte: {
      quests: { logbuch: "bestanden", klingen: "bestanden", wirbel: "verloren", podrennen: "bestanden", prophezeiung: "laeuft", amulett: "laeuft" },
      zaehler: { prophezeiung: 1 },
      einsaetze: [{ id: "e1", item: "kreisel", quest: "wirbel" }],
      buchungen: [{ id: "b1", packs: -1, grund: "Strafe vom Quest Master" }]
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

  /* ---------- Kleinkram ---------- */
  const $ = s => document.querySelector(s);
  const questById = id => C.quests.find(q => q.id === id);
  const itemById = id => C.items.find(i => i.id === id);
  // Was Dennis von einem Item sieht: vor dem ersten Erspielen die Tarnung (nur in der Vorschau einer Belohnung),
  // danach das echte Ding. Der Beutel ist Startitem: seine Tarnung fällt beim ersten Besuch der Ausrüstung.
  const getarnt = id => !!itemById(id).tarn && (id === "beutel" ? !onboarded : state.items[id] === "nicht");
  const itemSicht = id => {
    const x = itemById(id);
    return getarnt(id) ? { ...x, ...x.tarn, symbol: "i-chest" } : x;
  };
  const useSvg = (id, cls = "") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"></use></svg>`;
  const cardSvg = (cls = "") => `<svg class="ic-card ${cls}" aria-hidden="true"><use href="#${cls.includes("empty") ? "i-card-empty" : "i-card"}"></use></svg>`;
  const packsWort = n => Math.abs(n) === 1 ? "Pack" : "Packs";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let state = null, lastDoc = null, syncInfo = { online: true }, antworten = {};
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
      const x = itemSicht(id);
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

    // Quests: oben was gerade läuft, dann die feste Reihe, am Ende der Nebel
    const zeile = q => `<li><button type="button" class="q-row ${q.typ}" data-id="${q.id}"><span class="ic"></span><span class="q-name">${esc(q.name)}</span><span class="q-mark"></span></button></li>`;
    $("#questList").innerHTML = `<li class="q-sep" data-sep="lauf">LÄUFT</li>` + LAUF.map(zeile).join("")
      + `<li class="q-sep" data-sep="reihe">DEIN WEG</li>` + REIHE.map(zeile).join("")
      + `<li><button type="button" class="q-row nebel" data-id="${NEBEL}"><span class="ic">${coveredMedal()}</span><span class="q-name"></span><span class="q-mark"></span></button></li>`;
    document.querySelectorAll(".q-row").forEach(b => b.addEventListener("click", () => { followNext = b.dataset.id === state.next; selectQuest(b.dataset.id); }));
    $("#questCard").addEventListener("click", e => { if (e.target.closest("[data-logbuch]")) logbuch.oeffnen(); });

    // Karte: Weg durch die Stationen, eine Marke pro Station
    const pts = STATIONEN.map(s => [s.x * 10, s.y * 4.2]);
    $("#mapRoute").setAttribute("d", smoothPath(pts));
    $("#mapMarks").innerHTML = STATIONEN.map(s =>
      `<button type="button" class="mark" data-station="${s.id}" style="left:${s.x}%;top:${s.y}%" aria-label="${esc(s.ort)}"><span class="m-medal"></span><span class="gems"></span><span class="m-label">${esc(s.name)}</span></button>`).join("")
      + `<span class="map-lake-label">TEGERNSEE</span>`;
    document.querySelectorAll(".mark").forEach(b => b.addEventListener("click", () => { followHier = false; selectStation(b.dataset.station, true); }));

    // Ausrüstung: links Items, rechts Fähigkeiten. Noch nicht Erspieltes ist ein leerer Platz.
    const slot = it => `<button type="button" class="slot" data-id="${it.id}"><span class="well" style="--c:${it.farbe}">${useSvg(it.symbol)}<b class="count"></b></span></button>`;
    $("#slotsGear").innerHTML = C.items.filter(it => it.gruppe !== "faehigkeit").map(slot).join("");
    $("#slotsSkill").innerHTML = C.items.filter(it => it.gruppe === "faehigkeit").map(slot).join("");
    [$("#slotsGear"), $("#slotsSkill")].forEach(g => { if (g.children.length % 2) g.lastElementChild.classList.add("solo"); });
    document.querySelectorAll(".slot").forEach(b => b.addEventListener("click", () => { if (!b.classList.contains("empty")) selectItem(b.dataset.id); }));
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
        : st === "laeuft" ? (q.zaehler ? `<span class="tag run">${state.treffer[q.id]}/${q.zaehler.max}</span>` : `<span class="tag run">LÄUFT</span>`)
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
    // Prüfungen mit Gesamtzahl, Sidequests nur die erledigten (wie viele noch kommen, bleibt offen)
    const kern = REIHE.filter(q => q.typ === "kern"), side = REIHE.filter(q => q.typ === "side");
    const done = list => list.filter(q => state.quests[q.id] !== "offen").length;
    const rollen = state.anzahl.spruchrolle || 0;
    $("#listLegend").innerHTML = `<span title="Prüfungen"><span class="medal won" style="--m:#d9b54a"></span><b>${done(kern)}/${kern.length}</b></span>`
      + `<span title="Sidequests">${gemHtml("bestanden", false)}<b>${done(side)}</b></span>`
      + (rollen ? `<span title="Spruchrollen" class="leg-roll">${useSvg("i-scroll")}<b>${rollen}</b></span>` : "");
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
    const tag = isNext ? `<span class="tag now">JETZT</span>` : st === "laeuft" ? `<span class="tag run">LÄUFT</span>`
      : st === "bestanden" ? `<span class="tag won">BESTANDEN</span>` : st === "beendet" ? `<span class="tag won">BEENDET</span>`
      : st === "verloren" ? `<span class="tag lost">VERLOREN</span>` : `<span class="tag open">NOCH OFFEN</span>`;
    let unten;
    if (q.zaehler) {
      const n = state.treffer[id] || 0, max = q.zaehler.max;
      unten = `<div class="fx-rows"><div class="fx-row"><span class="fx-lbl win">${esc(q.zaehler.name.toUpperCase())}</span><span class="fx treffer">${
        Array.from({ length: max }, (_, i) => `<span class="pip${i < n ? " on" : ""}">${useSvg("i-star")}</span>`).join("")}</span></div>
        <div class="fx-row"><span class="fx-lbl win">JE ${esc(q.zaehler.name.toUpperCase())}</span><span class="fx">${fxChips(q.zaehler.proTreffer, true)}</span></div></div>`;
    } else {
      const schritte = (q.schritte || []).map(sx => `<span class="chip${state.schritte[id][sx.id] ? " plus" : " none"}">${state.schritte[id][sx.id] ? useSvg("i-check") : "○"} ${esc(sx.name)}</span>`).join("");
      unten = `<div class="fx-rows">
        ${schritte ? `<div class="fx-row"><span class="fx-lbl">STAND</span><span class="fx">${schritte}</span></div>` : ""}
        <div class="fx-row${st === "verloren" ? " dim" : ""}"><span class="fx-lbl win">SIEG</span><span class="fx">${fxChips(q.win, true)}</span></div>
        <div class="fx-row${st === "bestanden" ? " dim" : ""}"><span class="fx-lbl lose">NIEDERLAGE</span><span class="fx">${fxChips(q.lose, false)}</span></div>
      </div>`;
    }
    card.innerHTML = `
      <div class="qc-head">${questIcon(q, st, false)}<div><p class="tb-title">${esc(q.name)}</p><p class="tb-meta">${tag} ${esc(q.ort)}</p></div></div>
      <p class="tb-text">${esc(q.text)}</p>
      ${q.logbuch && isNext ? logbuchKnopf() : ""}
      ${einsatzHtml(id)}
      ${unten}`;
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
        return `<span class="well mini usable" style="--c:${x.farbe}" title="${esc(x.name)}">${useSvg(x.symbol)}${x.stapel ? `<b class="count">${state.anzahl[i]}</b>` : ""}</span>`;
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

  function renderMap() {
    const s = state;
    const kern = REIHE.filter(q => q.typ === "kern"), side = REIHE.filter(q => q.typ === "side");
    $("#pipsKern").innerHTML = kern.map(q => aufgedeckt(q.id) ? medalHtml(q, s.quests[q.id], q.id === s.next) : coveredMedal()).join("");
    const sichtbareSide = side.filter(q => aufgedeckt(q.id));
    $("#pipsSide").innerHTML = sichtbareSide.map(q => gemHtml(s.quests[q.id], q.id === s.next)).join("");
    const offenK = kern.filter(q => s.quests[q.id] === "offen").length, offenS = side.filter(q => s.quests[q.id] === "offen").length;
    $("#cntKern").textContent = `${kern.length - offenK}/${kern.length}`;
    $("#cntSide").textContent = `${side.length - offenS}`;

    const nq = s.next ? questById(s.next) : null;
    const hier = nq ? nq.station : STATIONEN[STATIONEN.length - 1].id;
    if (followHier || !sel[0]) sel[0] = hier;
    document.querySelectorAll(".mark").forEach(m => {
      const id = m.dataset.station;
      const k = REIHE.find(q => q.station === id && q.typ === "kern");
      const sides = REIHE.filter(q => q.station === id && q.typ === "side");
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
    const st = STATIONEN.find(x => x.id === id);
    const qs = REIHE.filter(q => q.station === id);
    const nq = state.next ? questById(state.next) : null;
    const sichtbar = qs.filter(q => aufgedeckt(q.id));
    const kernImNebel = qs.some(q => q.typ === "kern" && !aufgedeckt(q.id));
    const hierText = nq && nq.station === id ? "DU BIST HIER" : !nq && id === STATIONEN[STATIONEN.length - 1].id ? "ZUM KÄSTCHEN" : "";
    if (!sichtbar.length) {
      $("#stationBox").innerHTML = `<p class="tb-title">${esc(st.ort)}</p><p class="tb-meta">${hierText}</p>
        <p class="tb-text">${qs.length ? "Im Nebel" : "Hier wird abgerechnet und das Kästchen geöffnet."}</p>`;
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

  // Ausrüstung: leerer Platz, bis ein Item erspielt ist. Bei der aktuellen Quest leuchtet, was dort einsetzbar ist,
  // alles andere, was Dennis besitzt, ist ausgegraut.
  function renderEquip() {
    const jetzt = E.jetztEinsetzbar(C, state);
    const sichtbar = id => state.items[id] !== "nicht" || (id === "beutel" && !onboarded);
    if (!sel[2] || !sichtbar(sel[2])) sel[2] = [...jetzt][0] || state.erhalten[state.erhalten.length - 1] || "beutel";
    document.querySelectorAll(".slot").forEach(b => {
      const id = b.dataset.id, st = state.items[id], x = itemSicht(id), leer = !sichtbar(id);
      b.className = `slot st-${st}${leer ? " empty" : ""}${jetzt.has(id) ? " usable" : ""}${!leer && st === "besitz" && !jetzt.has(id) ? " idle" : ""}${sel[2] === id && !leer ? " is-selected" : ""}${b.classList.contains("solo") ? " solo" : ""}`;
      b.disabled = leer;
      b.querySelector(".well").classList.toggle("lost", st === "verloren");
      b.querySelector("use").setAttribute("href", "#" + x.symbol);
      b.querySelector(".count").textContent = x.stapel && !leer ? "×" + state.anzahl[id] : "";
      b.setAttribute("aria-label", leer ? "Leerer Platz" : `${x.name}, ${{ besitz: jetzt.has(id) ? "jetzt einsetzbar" : "im Beutel", verloren: "verloren", verbraucht: "verbraucht", nicht: "getarnt" }[st]}`);
    });
    renderItemBox(sel[2]);
  }

  function renderItemBox(id) {
    const box = $("#itemBox");
    const x = itemSicht(id), st = state.items[id], jetzt = E.jetztEinsetzbar(C, state);
    const tag = st === "besitz" ? (x.stapel ? `<span class="tag won">×${state.anzahl[id]}</span>` : `<span class="tag won">IM BEUTEL</span>`)
      : st === "verloren" ? `<span class="tag lost">VERLOREN</span>` : st === "verbraucht" ? `<span class="tag open">VERBRAUCHT</span>` : "";
    let extra = "";
    if (st === "besitz") {
      const wo = E.aktuelleQuests(C, state).filter(qid => E.einsetzbar(C, state, qid).includes(id)).map(qid => questById(qid).name);
      if (jetzt.has(id)) extra = `<span class="ib-use">Einsetzbar bei <em>${wo.map(esc).join("</em> und <em>")}</em>. Sag es dem Quest Master.</span>`;
      else if (id !== "beutel") extra = `<span class="ib-use dim">Hier gerade nicht einsetzbar.</span>`;
    }
    const nahm = C.quests.find(q => (q.lose && q.lose.items || []).includes(id) && state.quests[q.id] === "verloren");
    if (st === "verloren" && nahm) extra = `<span class="ib-use">Verloren bei <em>${esc(nahm.name)}</em>.</span>`;
    box.style.setProperty("--c", x.farbe);
    box.innerHTML = `${useSvg(x.symbol, "ib-icon")}<p class="tb-title">${esc(x.name)}${tag}</p><p class="tb-text">${esc(x.text)} ${extra}</p>`;
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
    // Kommt ein neues Fenster, solange das alte offen ist, bleibt dessen Folge (Quest aus dem Nebel holen) erhalten
    const offen = overlayAfter && !$("#overlay").hidden ? overlayAfter : null;
    $("#overlay").hidden = false;
    r.style.animation = "none"; void r.offsetWidth; r.style.animation = "";
    overlayAfter = after || offen;
  }
  function closeOverlay() {
    if ($("#overlay").hidden) return;
    $("#overlay").hidden = true;
    const f = overlayAfter; overlayAfter = null;
    if (f) f();
    else if (revealPending) showNextQuest();
  }

  const itemZeile = (id, text, cls, tarn) => {
    const x = itemById(id);
    return `<li class="${cls}${tarn ? " reveal" : ""}"><span class="ri${cls === "minus" ? " x-over" : ""}" style="color:${x.farbe}">${useSvg(x.symbol)}</span><span>${tarn ? `<small class="tarn">${esc(x.tarn.name)} entpuppt sich als</small>` : ""}${text}</span></li>`;
  };
  const stage = (q, won, farbe) => `<span class="medal-stage ${won ? "won" : "lost"}" style="--m:${farbe}">${q ? questIcon(q, won ? (q.typ === "lauf" ? "beendet" : "bestanden") : "verloren", false) : ""}</span>`;

  // Was hat der Quest Master gerade geändert? Nur echte Neuigkeiten melden:
  // Quest entschieden oder gestartet, Treffer, Schritt, Einsatz, Duell, neue Buchung, Item von Hand.
  // Zurückstellen oder Löschen aktualisiert still.
  function announce(prev, next, prevDoc, doc) {
    prevDoc = E.normalize(prevDoc);
    const fertig = C.quests.filter(q => prev.quests[q.id] !== next.quests[q.id] && ["bestanden", "verloren", "beendet"].includes(next.quests[q.id]));
    const gestartet = LAUF.filter(q => prev.quests[q.id] === "offen" && next.quests[q.id] === "laeuft");
    const treffer = LAUF.filter(q => q.zaehler && (next.treffer[q.id] || 0) > (prev.treffer[q.id] || 0));
    const schritte = LAUF.filter(q => q.schritte && q.schritte.some(sx => next.schritte[q.id][sx.id] && !prev.schritte[q.id][sx.id]));
    const alteE = new Set(prevDoc.einsaetze.map(e => e.id)), neueE = doc.einsaetze.filter(e => !alteE.has(e.id));
    const neueD = Object.keys(next.duelle).filter(k => next.duelle[k] !== prev.duelle[k]);
    const alteB = new Set(prevDoc.buchungen.map(b => b.id)), neueB = doc.buchungen.filter(b => !alteB.has(b.id));
    const handItems = JSON.stringify(prevDoc.items) !== JSON.stringify(doc.items);
    const zurueck = C.quests.some(q => prev.quests[q.id] !== "offen" && next.quests[q.id] === "offen");
    if (zurueck && !fertig.length) return;
    if (!fertig.length && !gestartet.length && !treffer.length && !schritte.length && !neueE.length && !neueD.length && !neueB.length && !handItems) return;

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
      if (it.id === "spruchrolle") lines.push(`<li><span class="ri"></span>Der Zauber wirkt. Der Quest Master verrät dir, wie.</li>`);
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
      head = `<span class="ri-big">${useSvg("i-backpack")}</span><p class="big">DEIN BEUTEL</p><p class="sub">Der Quest Master hat etwas geändert.</p>`;
      if (!lines.length) return;
    }
    // Die nächste Quest wird erst nach dem Fenster aufgedeckt, darum steht ihr Name hier nicht
    const warSichtbar = id => prev.quests[id] !== "offen" || prev.next === id;
    if (next.next && !warSichtbar(next.next)) revealPending = next.next;
    melody(klang);
    showOverlay({ head, lines: lines.join(""), next: next.next || !fertig.length ? "" : "Zum Kästchen", gross }, fertig.length || gestartet.length ? showNextQuest : null);
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
      const q = REIHE.find(x => x.win && x.win.ziffer === i + 1);
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
      if (page === 2 && !onboarded && $("#overlay").hidden) onboarding();
    }, 470);
  }

  /* ---------- Onboarding: erster Besuch der Ausrüstung ---------- */
  // Erst das Fundfenster mit Enthüllung des Beutels, dann kurze Hinweise nacheinander.
  function onboarding() {
    const x = itemById("beutel");
    melody("pruefung");
    showOverlay({
      head: `<span class="medal-stage won" style="--m:${x.farbe}"><span class="medal">${useSvg(x.symbol)}</span></span><p class="big">ERSTES ITEM GEFUNDEN</p><p class="sub">${esc(x.tarn.name)}</p>`,
      lines: `<li class="plus reveal"><span class="ri" style="color:${x.farbe}">${useSvg(x.symbol)}</span><span><small class="tarn">${esc(x.tarn.name)} entpuppt sich als</small>${esc(x.name)}</span></li>`,
      next: "", gross: true
    }, () => {
      onboarded = true;
      try { if (!DEMO) localStorage.setItem(OB_KEY, "1"); } catch (e) {}
      renderEquip();
      coach([
        [$("#slotsGear").parentElement, "Hier landet, was du dir erspielst. Leere Plätze füllen sich unterwegs."],
        [$("#slotsSkill").parentElement, "Hier landen deine Zauber."],
        [$(".equip-body"), "Was leuchtet, kannst du bei der aktuellen Quest einsetzen. Sag es dem Quest Master."],
        [$(".hud"), "Packs und Ziffern für dein Kästchen."]
      ]);
    });
  }
  function coach(schritte) {
    const bubble = $("#coach");
    let i = -1, ziel = null;
    const weiter = () => {
      if (ziel) ziel.classList.remove("coach-focus");
      if (++i >= schritte.length) { bubble.hidden = true; bubble.onclick = null; return; }
      const [el, text] = schritte[i];
      ziel = el; el.classList.add("coach-focus");
      const b = bubble.querySelector(".coach-bubble");
      b.firstElementChild.textContent = text;
      bubble.hidden = false;
      const box = bubble.getBoundingClientRect(), r = el.getBoundingClientRect(), unten = r.top - box.top < box.height / 2;
      const w = b.offsetWidth || 240;
      b.style.left = Math.max(12, Math.min(box.width - w - 12, r.left - box.left + r.width / 2 - w / 2)) + "px";
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
  $("#hudNext").addEventListener("click", showNextQuest);
  $("#hudPacks").addEventListener("click", explainPacks);
  $("#hudCode").addEventListener("click", explainCode);
  $("#overlay").addEventListener("click", closeOverlay);

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
    if (!$("#overlay").hidden) { if (["enter", " ", "escape", "a"].includes(k)) { e.preventDefault(); closeOverlay(); } return; }
    if (k === "z" || k === "q") return turn(-1);
    if (k === "r" || k === "e") return turn(1);
    const step = { arrowdown: 1, arrowright: 1, arrowup: -1, arrowleft: -1 }[k];
    if (!step) return;
    e.preventDefault();
    if (page === 1) { const ids = [...document.querySelectorAll(".quest-list li:not([hidden]) .q-row")].map(b => b.dataset.id); followNext = false; selectQuest(ids[(ids.indexOf(sel[1]) + step + ids.length) % ids.length]); }
    if (page === 0) { const ids = STATIONEN.map(s => s.id); selectStation(ids[(ids.indexOf(sel[0]) + step + ids.length) % ids.length]); }
    if (page === 2) { const ids = [...document.querySelectorAll(".slot:not(.empty)")].map(b => b.dataset.id); selectItem(ids[(ids.indexOf(sel[2]) + step + ids.length) % ids.length]); }
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
        $("#lbFrage").textContent = "Alle Antworten sind besiegelt. Der Quest Master entscheidet.";
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
  document.addEventListener("fullscreenchange", updateFs);
  document.addEventListener("webkitfullscreenchange", updateFs);

  /* ---------- Demo: Buchungen simulieren, ohne Firebase ---------- */
  if (DEMO) {
    $("#demoBar").hidden = false;
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    $("#demoBar").addEventListener("click", e => {
      const a = e.target.closest("[data-demo]")?.dataset.demo;
      if (!a) return;
      const d = JSON.parse(JSON.stringify(store.doc));
      if (a === "zurueck") {
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
    // Log-Buch-Sprachnachrichten vorladen, solange das Log-Buch noch nicht entschieden ist
    if (state.quests.logbuch === "offen") logbuch.vorladen();
    if (meta.initial && intro.hidden) requestAnimationFrame(() => { const row = document.querySelector(".q-row.is-selected"); if (row) scrollIntoList(row); });
    if (prev && !meta.initial && intro.hidden) announce(prev, state, prevDoc, doc);
  });
  lbStore.subscribe(a => { antworten = a; if (state) { const id = sel[1]; if (id && questById(id)?.logbuch) renderQuestCard(id); } });

  // Offline-Speicher für Funklöcher (sw.js). Lokal beim Entwickeln nicht nötig.
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
