(() => {
  const pages = [
    { name: "PRÜFUNGEN", prompt: "Zur Ausrüstung" },
    { name: "AUSRÜSTUNG", prompt: "Zum Inventar" },
    { name: "INVENTAR", prompt: "Zur Karte" },
    { name: "KARTE", prompt: "Zu den Prüfungen" }
  ];

  const cube = document.querySelector("#menuCube");
  const promptText = document.querySelector("#promptText");
  const toast = document.querySelector("#toast");
  const game = document.querySelector("#game");
  const fullscreenToggle = document.querySelector("#fullscreenToggle");
  const introScreen = document.querySelector("#introScreen");
  const startQuest = document.querySelector("#startQuest");
  const gameplayElements = [...document.querySelectorAll(".hud, .fullscreen-toggle, .shoulder, .menu-viewport, .rupees, .prompt")];
  let page = 0;
  let selection = [0, 0, 0, 0];
  let toastTimer;
  let audio;

  const itemsForPage = () => [...document.querySelectorAll(`.face[data-page="${page}"] .selectable`)];

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
    if (isStandalone() && !fullscreenElement()) {
      showToast("Bereits ohne Browserleisten geöffnet.", 1800);
      return;
    }

    try {
      if (fullscreenElement()) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) await Promise.resolve(exit.call(document));
        if (screen.orientation?.unlock) screen.orientation.unlock();
        return;
      }

      const target = document.documentElement;
      const request = target.requestFullscreen || target.webkitRequestFullscreen;
      if (!request) {
        showToast("iPhone: Teilen → Zum Home-Bildschirm. Danach von dort öffnen.", 4800);
        return;
      }

      await Promise.resolve(request.call(target));
      try { await screen.orientation?.lock?.("landscape"); } catch (_) {}
    } catch (_) {
      showToast("iPhone: Teilen → Zum Home-Bildschirm. Danach von dort öffnen.", 4800);
    }
  }

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

  function select(index, play = true) {
    const items = itemsForPage();
    if (!items.length) return;
    selection[page] = (index + items.length) % items.length;
    document.querySelectorAll(".selectable.selected").forEach(item => item.classList.remove("selected"));
    const current = items[selection[page]];
    current.classList.add("selected");
    promptText.textContent = current.dataset.name || pages[page].name;
    if (play) tone("move");
  }

  function moveGrid(dx, dy) {
    const items = itemsForPage();
    const columns = page === 2 ? 6 : page === 1 ? 3 : 3;
    let next = selection[page] + dx + dy * columns;
    if (next < 0) next = items.length - 1;
    if (next >= items.length) next = 0;
    select(next);
  }

  function decide() {
    const current = itemsForPage()[selection[page]];
    if (!current || current.classList.contains("empty")) return tone("error");
    const states = ["won", "lost", "locked"];
    const active = states.findIndex(state => current.classList.contains(state));
    states.forEach(state => current.classList.remove(state));
    const next = states[(active + 1) % states.length];
    current.classList.add(next);
    persist();
    tone("confirm");
    showToast(next === "won" ? "Gewonnen" : next === "lost" ? "Verloren" : "Noch offen");
  }

  function persist() {
    const states = [...document.querySelectorAll(".selectable")].map(item => ({
      name: item.dataset.name,
      state: ["won", "lost", "locked"].find(state => item.classList.contains(state)) || "open"
    }));
    localStorage.setItem("dennis-quest-state", JSON.stringify(states));
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem("dennis-quest-state"));
      if (!Array.isArray(saved)) return;
      document.querySelectorAll(".selectable").forEach((item, index) => {
        const state = saved[index]?.state;
        ["won", "lost", "locked"].forEach(value => item.classList.remove(value));
        if (["won", "lost", "locked"].includes(state)) item.classList.add(state);
      });
    } catch (_) {}
  }

  document.querySelectorAll("[data-nav]").forEach(button => button.addEventListener("click", () => turn(button.dataset.nav === "next" ? 1 : -1)));
  startQuest.addEventListener("click", beginQuest);
  fullscreenToggle.addEventListener("click", event => {
    event.stopPropagation();
    toggleFullscreen();
  });
  document.addEventListener("fullscreenchange", updateFullscreenButton);
  document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
  document.querySelectorAll(".selectable[data-name]").forEach(item => {
    if (!item.hasAttribute("aria-label")) item.setAttribute("aria-label", item.dataset.name);
  });
  function activateItem(item) {
    const face = item.closest(".face");
    page = Number(face.dataset.page);
    selection[page] = itemsForPage().indexOf(item);
    select(selection[page], false);
    decide();
  }

  game.addEventListener("click", event => {
    if (!introScreen.hidden) return;
    if (event.target.closest?.("[data-nav], #fullscreenToggle")) return;
    const item = itemsForPage().find(candidate => {
      const rect = candidate.getBoundingClientRect();
      return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    });
    if (item) activateItem(item);
  });

  window.addEventListener("keydown", event => {
    if (!introScreen.hidden) return;
    const key = event.key.toLowerCase();
    const actions = {
      z: () => turn(-1), r: () => turn(1),
      arrowleft: () => moveGrid(-1, 0), arrowright: () => moveGrid(1, 0),
      arrowup: () => moveGrid(0, -1), arrowdown: () => moveGrid(0, 1),
      a: decide, enter: decide, " ": decide
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

  load();
  setGameplayAvailable(false);
  updateFullscreenButton();
  renderPage();
})();
