(() => {
  /* Dennis Quest · Quest-Master-Menü
     Schreibt das Dokument: Status je Quest, Packs-Buchungen, Item-Korrekturen.
     Alles andere (Packs, Ziffern, Items, nächste Quest) rechnet engine.js daraus. */
  const C = window.GAME_CONFIG;
  const E = window.QuestEngine;

  // Schlüssel für geschütztes Schreiben (Firebase): admin.html#key=GEHEIM, wird im Gerät gemerkt
  let key = null;
  try {
    const m = location.hash.match(/key=([^&]+)/);
    if (m) { key = decodeURIComponent(m[1]); localStorage.setItem("dennis-quest-admin-key", key); history.replaceState(null, "", location.pathname); }
    else key = localStorage.getItem("dennis-quest-admin-key");
  } catch (_) {}

  const store = window.QuestStore.create(C, { key });
  const $ = s => document.querySelector(s);
  let doc = E.emptyDoc();
  let state = E.derive(C, doc);
  let toastTimer;

  const questById = id => C.quests.find(q => q.id === id);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  function toast(msg) {
    clearTimeout(toastTimer);
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    toastTimer = setTimeout(() => t.classList.remove("show"), 1600);
  }

  function commit(mutate, msg) {
    const next = JSON.parse(JSON.stringify(doc));
    mutate(next);
    store.save(next);
    if (msg) toast(msg);
  }

  function setQuest(id, v) {
    commit(d => { if (v === "offen") delete d.quests[id]; else d.quests[id] = v; }, questById(id).name + ": " + v);
  }

  function fxHtml(q) {
    return `<span class="w">Sieg: ${E.effektText(C, q.win, true)}</span> · <span class="l">Niederlage: ${E.effektText(C, q.lose, false)}</span>`;
  }

  /* ---------- Aufbau ---------- */
  function build() {
    $("#packsMax").textContent = "/ " + C.waehrung.max;
    $("#total").textContent = "/ " + C.quests.length;

    const list = $("#quests");
    C.quests.forEach(q => {
      const li = document.createElement("li");
      li.dataset.id = q.id;
      li.innerHTML = `
        <div class="q-head"><span class="q-name">${q.name}</span><span class="badge ${q.typ}">${q.typ === "kern" ? "Kern" : "Side"}</span><span class="badge jetzt" hidden>Jetzt</span></div>
        <div class="q-fx">${q.ort} · ${fxHtml(q)}</div>
        <div class="seg" role="group" aria-label="Status ${q.name}">
          <button type="button" data-v="offen">Offen</button>
          <button type="button" data-v="bestanden">Bestanden</button>
          <button type="button" data-v="verloren">Verloren</button>
        </div>`;
      li.querySelectorAll(".seg button").forEach(b => b.addEventListener("click", () => setQuest(q.id, b.dataset.v)));
      list.appendChild(li);
    });

    const quick = $("#quick");
    (C.schnellbuchungen || []).forEach(sb => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn";
      b.textContent = `${sb.packs > 0 ? "+" : "−"}${Math.abs(sb.packs)} ${sb.grund}`;
      b.addEventListener("click", () => commit(d => d.buchungen.push({ id: uid(), packs: sb.packs, grund: sb.grund }), "Gebucht: " + sb.grund));
      quick.appendChild(b);
    });

    $("#customForm").addEventListener("submit", ev => {
      ev.preventDefault();
      const n = parseInt($("#customAmount").value, 10);
      const g = $("#customReason").value.trim() || "Buchung";
      if (!n) { toast("Menge eingeben, z. B. -1 oder 2"); return; }
      commit(d => d.buchungen.push({ id: uid(), packs: n, grund: g }), "Gebucht: " + g);
      $("#customReason").value = "";
    });

    const items = $("#items");
    C.items.forEach(it => {
      const li = document.createElement("li");
      li.dataset.id = it.id;
      li.innerHTML = `<span class="it">${it.name}<small></small></span>
        <select id="ov-${it.id}" aria-label="Korrektur ${it.name}">
          <option value="">nach Regel</option>
          <option value="besitz">im Besitz</option>
          <option value="verloren">verloren</option>
          <option value="nicht">nicht erspielt</option>
        </select>`;
      li.querySelector("select").addEventListener("change", e => {
        const v = e.target.value;
        commit(d => { if (v) d.items[it.id] = v; else delete d.items[it.id]; }, it.name + ": " + (v || "nach Regel"));
      });
      items.appendChild(li);
    });

    $("#nextWin").addEventListener("click", () => state.next && setQuest(state.next, "bestanden"));
    $("#nextLose").addEventListener("click", () => state.next && setQuest(state.next, "verloren"));
    $("#reset").addEventListener("click", () => {
      if (!confirm("Wirklich alles zurücksetzen? Alle Quests werden offen, alle Buchungen gelöscht.")) return;
      commit(d => { d.quests = {}; d.buchungen = []; d.items = {}; }, "Zurückgesetzt");
    });

    const s = C.speicher;
    $("#storageInfo").textContent = s.typ === "firebase" && s.databaseURL
      ? `Speicher: Firebase, Spiel „${s.spielId}". ${key ? "Schreibschlüssel ist gesetzt." : "Kein Schreibschlüssel gesetzt."}`
      : "Speicher: nur dieses Gerät (Testmodus). Dennis' Ansicht sieht Änderungen nur im selben Browser.";
  }

  /* ---------- Darstellung ---------- */
  function render() {
    $("#packs").textContent = state.packs;
    $("#done").textContent = state.zaehler.erledigt;
    $("#code").innerHTML = C.code.map((v, i) => `<i class="${state.ziffern[i] != null ? "known" : ""}" title="Ziffer ${i + 1}">${v}</i>`).join("");

    const n = state.next ? questById(state.next) : null;
    $("#nextCard").classList.toggle("all-done", !n);
    $("#nextTitle").textContent = n ? n.name : "Alle Quests erledigt";
    $("#nextMeta").textContent = n ? `${n.ort} · ${n.typ === "kern" ? "Kernprüfung" : "Sidequest"} · ${n.beschreibung}` : "Jetzt fehlende Ziffern kaufen und das Kästchen öffnen.";
    $("#nextFx").innerHTML = n ? fxHtml(n) : "";

    document.querySelectorAll("#quests li").forEach(li => {
      const v = state.quests[li.dataset.id];
      li.querySelectorAll(".seg button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === v)));
      li.querySelector(".badge.jetzt").hidden = li.dataset.id !== state.next;
    });

    const buy = $("#buyDigits");
    buy.innerHTML = "";
    C.code.forEach((_, i) => {
      if (state.ziffern[i] != null) return;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn";
      b.textContent = `Ziffer ${i + 1} kaufen (−${C.ziffer_preis})`;
      b.disabled = state.packs < C.ziffer_preis;
      b.addEventListener("click", () => commit(d => d.buchungen.push({ id: uid(), packs: -C.ziffer_preis, grund: `Ziffer ${i + 1} gekauft`, ziffer: i + 1 }), `Ziffer ${i + 1} gekauft`));
      buy.appendChild(b);
    });

    const ledger = $("#ledger");
    ledger.innerHTML = "";
    if (!doc.buchungen.length) ledger.innerHTML = '<li class="empty">Noch keine Buchungen.</li>';
    doc.buchungen.slice().reverse().forEach(b => {
      const li = document.createElement("li");
      const amt = Number(b.packs) || 0;
      li.innerHTML = `<span class="amt ${amt >= 0 ? "plus" : "minus"}">${amt > 0 ? "+" : amt < 0 ? "−" : ""}${Math.abs(amt)}</span><span class="why"></span><button type="button" class="del" aria-label="Buchung löschen">✕</button>`;
      li.querySelector(".why").textContent = b.grund || "";
      li.querySelector(".del").addEventListener("click", () => commit(d => { d.buchungen = d.buchungen.filter(x => x.id !== b.id); }, "Buchung gelöscht"));
      ledger.appendChild(li);
    });

    document.querySelectorAll("#items li").forEach(li => {
      const id = li.dataset.id, st = state.items[id];
      const small = li.querySelector("small");
      small.textContent = { besitz: "im Besitz", verloren: "verloren", nicht: "nicht erspielt" }[st];
      small.className = "st-" + st;
      li.querySelector("select").value = doc.items[id] || "";
    });
  }

  store.onStatus(st => {
    const el = $("#sync");
    const t = st.stand ? new Date(st.stand).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "–";
    if (st.lokal) el.textContent = "Testmodus · " + t;
    else if (st.pending) el.textContent = "Nicht gesendet, wird nachgeschickt · " + t;
    else el.textContent = (st.online ? "Online · " : "Offline · ") + t;
    el.classList.toggle("off", !st.lokal && (!st.online || st.pending));
  });

  build();
  store.subscribe(d => { doc = d; state = E.derive(C, doc); render(); });
})();
