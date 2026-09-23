(() => {
  /* Dennis Quest · Spieler-Menü
     Liest den Stand, den der Quest Master speichert, und zeigt ihn an. Schreibt nichts.
     Klick / A / Enter auf ein Feld zeigt die Beschreibung. */
  const C = window.GAME_CONFIG;
  const E = window.QuestEngine;
  const store = window.QuestStore.create(C);

  const pages = [
    { name: "PRÜFUNGEN", prompt: "Zur Ausrüstung" },
    { name: "AUSRÜSTUNG", prompt: "Zum Inventar" },
    { name: "INVENTAR", prompt: "Zur Karte" },
    { name: "KARTE", prompt: "Zu den Prüfungen" }
  ];
  const STATIONS = {};  // aus den Kreisen im SVG gelesen
  const ARROW_REF = { x: 345, y: 88 };  // Position, auf die der Pfeil im SVG gezeichnet ist

  const $ = s => document.querySelector(s);
  const cube = $("#menuCube");
  const promptText = $("#promptText");
  const toast = $("#toast");
  const game = $("#game");
  const fullscreenToggle = $("#fullscreenToggle");
  const introScreen = $("#introScreen");
  const startQuest = $("#startQuest");
  const gameplayElements = [...document.querySelectorAll(".hud, .fullscreen-toggle, .shoulder, .menu-viewport, .rupees, .prompt")];
  let page = 0;
  let selection = [0, 0, 0, 0];
  let toastTimer;
  let audio;
  let state = null;
  let lastState = null;

  const questById = id => C.quests.find(q => q.id === id);
  const itemById = id => C.items.find(i => i.id === id);
  const itemsForPage = () => [...document.querySelectorAll(`.face[data-page="${page}"] .selectable`)];

  /* ---------- Ton, Toast, Vollbild (unverändert) ---------- */
  function tone(kind = "move") {
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = kind === "error" ? "sawtooth" : kind === "confirm" ? "triangle" : "square";
      oscillator.frequency.setValueAtTime(kind === "move" ? 330 : kind === "confirm" ? 620 : 130, audio.currentTime);
      if (kind === "confirm") oscillator.frequency.exponentialRampToValueAtTime(920, audio.currentTime + .08);
      gain.gain.setValueAtTime(.035, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + (kind === "move" ? .055 : .13));
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + .14);
    } catch (_) {}
  }

  function showToast(message, duration = 950) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = setTimeout(() => toast.classList.remove("show"), duration);
  }

  function setGameplayAvailable(available) {
    gameplayElements.forEach(element => {
      element.inert = !available;
      if (available) element.removeAttribute("aria-hidden");
      else element.setAttribute("aria-hidden", "true");
    });
  }

  function beginQuest() {
    if (introScreen.hidden || introScreen.classList.contains("is-leaving")) return;
    tone("confirm");
    introScreen.classList.add("is-leaving");
    window.setTimeout(() => {
      introScreen.hidden = true;
      setGameplayAvailable(true);
      page = 0;
      renderPage();
      focusNext();
      const n = state && state.next ? questById(state.next) : null;
      showToast(n ? "Nächste Quest: " + n.name + " · " + n.ort : "Alle Quests erledigt.", 2600);
      itemsForPage()[selection[page]]?.focus({ preventScroll: true });
    }, 500);
  }

  const isStandalone = () => window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches || window.matchMedia("(display-mode: fullscreen)").matches;
  const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement;

  function updateFullscreenButton() {
    const active = Boolean(fullscreenElement());
    fullscreenToggle.setAttribute("aria-pressed", String(active));
    fullscreenToggle.setAttribute("aria-label", active ? "Vollbild verlassen" : "Vollbild öffnen");
    fullscreenToggle.title = active ? "Vollbild verlassen" : "Vollbild";
    fullscreenToggle.hidden = isStandalone() && !active;
  }

  async function toggleFullscreen() {
    if (isStandalone() && !fullscreenElement()) { showToast("Bereits ohne Browserleisten geöffnet.", 1800); return; }
    try {
      if (fullscreenElement()) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) await Promise.resolve(exit.call(document));
        if (screen.orientation?.unlock) screen.orientation.unlock();
        return;
      }
      const target = document.documentElement;
      const request = target.requestFullscreen || target.webkitRequestFullscreen;
      if (!request) { showToast("iPhone: Teilen → Zum Home-Bildschirm. Danach von dort öffnen.", 4800); return; }
      await Promise.resolve(request.call(target));
      try { await screen.orientation?.lock?.("landscape"); } catch (_) {}
    } catch (_) {
      showToast("iPhone: Teilen → Zum Home-Bildschirm. Danach von dort öffnen.", 4800);
    }
  }

  /* ---------- Aufbau aus der Konfiguration (einmal) ---------- */
  function iconHtml(def) {
    if (def.icon) return `<svg><use href="#icon-${def.icon}"></use></svg>`;
    return `<span>${def.glyph || "?"}</span>`;
  }

  function button(cls, kind, id, name, inner) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = cls + " selectable";
    b.dataset.kind = kind;
    b.dataset.id = id;
    b.dataset.name = name;
    b.setAttribute("aria-label", name);
    b.innerHTML = inner;
    return b;
  }

  function build() {
    // Herzen = Packs, eine Reihe pro 10
    const hearts = $("#hearts");
    for (let r = 0; r < Math.ceil(C.waehrung.max / 10); r++) {
      const row = document.createElement("div");
      row.className = "heart-row";
      row.setAttribute("aria-hidden", "true");
      for (let i = r * 10; i < Math.min(C.waehrung.max, r * 10 + 10); i++) {
        const h = document.createElement("span");
        h.className = "heart empty";
        h.textContent = "♥";
        row.appendChild(h);
      }
      hearts.appendChild(row);
    }

    // Code: eine Note pro Ziffer
    const notes = $("#notes");
    C.code.forEach((_, i) => notes.appendChild(button("note note-" + (i + 1), "ziffer", String(i + 1), "Ziffer " + (i + 1), "<b>?</b><span>♪</span>")));

    // Sechs Medaillons = Kernprüfungen in Reihenfolge, im Uhrzeigersinn ab oben
    const med = $("#medallions");
    C.quests.filter(q => q.typ === "kern").forEach((q, i) => med.appendChild(button("medallion m" + (i + 1), "quest", q.id, q.name, iconHtml(q))));

    // Sidequests als Steine
    const side = $("#sideStones");
    C.quests.filter(q => q.typ === "side").forEach(q => side.appendChild(button("stone", "quest", q.id, q.name, q.glyph || "●")));

    // Ausrüstung: links Startitems, rechts alle anderen Items
    const eStart = $("#equipStart"), eGrid = $("#equipGrid");
    C.items.forEach(it => {
      const target = C.startitems.includes(it.id) ? eStart : eGrid;
      target.appendChild(button("slot", "item", it.id, it.name, iconHtml(it)));
    });

    // Inventar: 18 Plätze, gefüllt in der Reihenfolge, in der Dennis Items bekommt (siehe render)
    const inv = $("#invGrid");
    for (let i = 0; i < 18; i++) {
      const b = button("item empty", "leer", "", "Leerer Platz", "");
      inv.appendChild(b);
    }

    // Kartenstationen
    document.querySelectorAll(".map-stops circle[data-station]").forEach(c => {
      STATIONS[c.dataset.station] = { x: +c.getAttribute("cx"), y: +c.getAttribute("cy"), el: c };
    });
  }

  /* ---------- Darstellung aus dem Zustand ---------- */
  const QUEST_CLASS = { bestanden: "won", verloren: "lost", offen: "" };
  const ITEM_CLASS = { besitz: "won", verloren: "lost", nicht: "locked" };

  function setState(el, cls) {
    el.classList.remove("won", "lost", "locked");
    if (cls) el.classList.add(cls);
  }

  function render() {
    const s = state;

    // HUD
    document.querySelectorAll("#hearts .heart").forEach((h, i) => {
      h.classList.toggle("full", i < s.packs);
      h.classList.toggle("empty", i >= s.packs);
    });
    $("#hearts").setAttribute("aria-label", `${s.packs} von ${s.max} ${C.waehrung.name}`);
    $("#packsVal").textContent = s.packs;

    // Prüfungen
    $("#cntWon").textContent = s.zaehler.bestanden;
    $("#cntLost").textContent = s.zaehler.verloren;
    $("#progress").textContent = `${s.zaehler.erledigt} / ${s.zaehler.gesamt}`;
    document.querySelectorAll('[data-kind="quest"]').forEach(el => {
      setState(el, QUEST_CLASS[s.quests[el.dataset.id]]);
      el.classList.toggle("next", el.dataset.id === s.next);
    });
    document.querySelectorAll('[data-kind="ziffer"]').forEach(el => {
      const i = +el.dataset.id - 1, v = s.ziffern[i];
      setState(el, v == null ? "locked" : "won");
      el.querySelector("b").textContent = v == null ? "?" : v;
    });

    // Ausrüstung
    document.querySelectorAll('#equipStart [data-kind="item"], #equipGrid [data-kind="item"]').forEach(el => setState(el, ITEM_CLASS[s.items[el.dataset.id]]));

    // Inventar: Items in Erhalt-Reihenfolge, danach leere Plätze
    const slots = [...document.querySelectorAll("#invGrid .item")];
    slots.forEach((el, i) => {
      const id = s.erhalten[i];
      const it = id ? itemById(id) : null;
      el.dataset.kind = it ? "item" : "leer";
      el.dataset.id = it ? it.id : "";
      el.dataset.name = it ? it.name : "Leerer Platz";
      el.setAttribute("aria-label", el.dataset.name);
      el.classList.toggle("empty", !it);
      el.innerHTML = it ? iconHtml(it) : "";
      setState(el, it ? ITEM_CLASS[s.items[it.id]] : "");
    });

    // Karte: Stationen nach Status der Kernprüfung dort, Pfeil an der Station der nächsten Quest
    Object.entries(STATIONS).forEach(([key, st]) => {
      const kern = C.quests.filter(q => q.typ === "kern" && q.station === key);
      const alle = C.quests.filter(q => q.station === key);
      const erledigt = alle.length && alle.every(q => s.quests[q.id] !== "offen");
      const verloren = kern.some(q => s.quests[q.id] === "verloren");
      st.el.classList.toggle("done", !!erledigt);
      st.el.classList.toggle("lost", verloren);
    });
    const nq = s.next ? questById(s.next) : null;
    const target = STATIONS[nq ? nq.station : "gipfel"];
    if (target) $("#playerArrow").setAttribute("transform", `translate(${target.x - ARROW_REF.x} ${target.y - ARROW_REF.y})`);
    pages[3].name = nq ? "Nächste: " + nq.ort : "Ziel erreicht";

    renderSync();
    select(selection[page], false);
  }

  let syncInfo = { online: true, stand: 0 };
  function renderSync() {
    const el = $("#sync");
    const t = state && state.stand ? new Date(state.stand).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "–";
    el.textContent = (syncInfo.online ? "Stand " : "Offline · Stand ") + t;
    el.classList.toggle("offline", !syncInfo.online);
  }

  // Was hat der Quest Master gerade geändert? Kurze Meldung für Dennis.
  function announce(prev, next) {
    if (!prev) return;
    const msgs = [];
    C.quests.forEach(q => {
      if (prev.quests[q.id] !== next.quests[q.id] && next.quests[q.id] !== "offen") msgs.push(q.name + ": " + next.quests[q.id]);
    });
    C.items.forEach(it => {
      if (prev.items[it.id] !== next.items[it.id]) {
        if (next.items[it.id] === "besitz") msgs.push("Erhalten: " + it.name);
        if (next.items[it.id] === "verloren") msgs.push("Verloren: " + it.name);
      }
    });
    next.ziffern.forEach((v, i) => { if (v != null && prev.ziffern[i] == null) msgs.push("Ziffer " + (i + 1) + ": " + v); });
    if (next.packs !== prev.packs) msgs.push(C.waehrung.name + ": " + next.packs);
    if (msgs.length) { tone("confirm"); showToast(msgs.slice(0, 3).join(" · "), 2800); }
  }

  /* ---------- Beschreibung eines Feldes ---------- */
  function describe(el) {
    if (!el || !state) return null;
    const k = el.dataset.kind, id = el.dataset.id;
    if (k === "quest") {
      const q = questById(id), st = state.quests[id];
      const next = id === state.next ? " · Nächste Quest" : "";
      return {
        prompt: q.name + (st !== "offen" ? " · " + st : next),
        info: `${q.name} (${q.ort})${next}. ${q.beschreibung} Sieg: ${E.effektText(C, q.win, true)}. Niederlage: ${E.effektText(C, q.lose, false)}.`
      };
    }
    if (k === "item") {
      const it = itemById(id), st = state.items[id];
      const label = { besitz: "im Beutel", verloren: "verloren", nicht: "noch nicht erspielt" }[st];
      const quelle = C.quests.find(q => (q.win.items || []).includes(id));
      return { prompt: it.name, info: `${it.name}, ${label}. ${it.wirkung}` + (quelle && st === "nicht" ? ` Zu holen bei: ${quelle.name}.` : "") };
    }
    if (k === "ziffer") {
      const i = +id - 1, v = state.ziffern[i];
      const quelle = C.quests.find(q => q.win.ziffer === +id);
      return {
        prompt: v == null ? "Ziffer " + id + " · ?" : "Ziffer " + id + " · " + v,
        info: v == null
          ? `Ziffer ${id} ist noch unbekannt. Quelle: ${quelle ? quelle.name : "?"}. Am Kästchen für ${C.ziffer_preis} ${C.waehrung.name} kaufbar.`
          : `Ziffer ${id} ist ${v}${state.gekauft[i] ? " (gekauft)" : ""}.`
      };
    }
    if (k === "zaehler") {
      return id === "bestanden"
        ? { prompt: "Bestanden · " + state.zaehler.bestanden, info: `${state.zaehler.bestanden} Quests bestanden.` }
        : { prompt: "Verloren · " + state.zaehler.verloren, info: `${state.zaehler.verloren} Quests verloren.` };
    }
    return { prompt: el.dataset.name || pages[page].name, info: null };
  }

  /* ---------- Navigation ---------- */
  function renderPage(direction = 0) {
    page = (page + 4) % 4;
    cube.style.transform = `translateZ(-39.2cqw) rotateY(${-page * 90}deg)`;
    promptText.textContent = pages[page].prompt;
    document.querySelectorAll(".face").forEach((face, index) => {
      face.setAttribute("aria-hidden", index === page ? "false" : "true");
      face.inert = index !== page;
    });
    select(selection[page], false);
    if (direction) tone("move");
  }

  function turn(delta) {
    page = (page + delta + 4) % 4;
    renderPage(delta);
  }

  function focusNext() {
    const items = [...document.querySelectorAll('.face[data-page="0"] .selectable')];
    const i = items.findIndex(el => el.dataset.kind === "quest" && el.dataset.id === state?.next);
    if (i >= 0) selection[0] = i;
  }

  function select(index, play = true) {
    const items = itemsForPage();
    if (!items.length) { promptText.textContent = pages[page].name; return; }
    selection[page] = (index + items.length) % items.length;
    document.querySelectorAll(".selectable.selected").forEach(item => item.classList.remove("selected"));
    const current = items[selection[page]];
    current.classList.add("selected");
    const d = describe(current);
    promptText.textContent = (d && d.prompt) || current.dataset.name || pages[page].name;
    if (play) tone("move");
  }

  function moveGrid(dx, dy) {
    const items = itemsForPage();
    const columns = page === 2 ? 6 : 3;
    let next = selection[page] + dx + dy * columns;
    if (next < 0) next = items.length - 1;
    if (next >= items.length) next = 0;
    select(next);
  }

  function info() {
    const current = itemsForPage()[selection[page]];
    const d = describe(current);
    if (!d || !d.info) return tone("error");
    tone("confirm");
    showToast(d.info, 4200);
  }

  document.querySelectorAll("[data-nav]").forEach(b => b.addEventListener("click", () => turn(b.dataset.nav === "next" ? 1 : -1)));
  startQuest.addEventListener("click", beginQuest);
  fullscreenToggle.addEventListener("click", event => { event.stopPropagation(); toggleFullscreen(); });
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  document.addEventListener("webkitfullscreenchange", updateFullscreenButton);

  game.addEventListener("click", event => {
    if (!introScreen.hidden) return;
    if (event.target.closest?.("[data-nav], #fullscreenToggle")) return;
    const item = itemsForPage().find(candidate => {
      const rect = candidate.getBoundingClientRect();
      return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    });
    if (item) {
      selection[page] = itemsForPage().indexOf(item);
      select(selection[page], false);
      info();
    }
  });

  window.addEventListener("keydown", event => {
    if (!introScreen.hidden) return;
    const key = event.key.toLowerCase();
    const actions = {
      z: () => turn(-1), r: () => turn(1),
      arrowleft: () => moveGrid(-1, 0), arrowright: () => moveGrid(1, 0),
      arrowup: () => moveGrid(0, -1), arrowdown: () => moveGrid(0, 1),
      a: info, enter: info, " ": info
    };
    if (actions[key]) { event.preventDefault(); actions[key](); }
  });

  let touchX = null;
  game.addEventListener("pointerdown", event => { if (introScreen.hidden) touchX = event.clientX; });
  game.addEventListener("pointerup", event => {
    if (touchX === null) return;
    const distance = event.clientX - touchX;
    touchX = null;
    if (Math.abs(distance) > 45) turn(distance < 0 ? 1 : -1);
  });

  /* ---------- Start ---------- */
  build();
  setGameplayAvailable(false);
  updateFullscreenButton();
  store.onStatus(st => { syncInfo = st; if (state) renderSync(); });
  store.subscribe((doc, meta) => {
    lastState = state;
    state = E.derive(C, doc);
    if (meta.initial) focusNext();
    render();
    if (!meta.initial && introScreen.hidden) announce(lastState, state);
  });
  renderPage();
})();
