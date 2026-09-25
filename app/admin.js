(() => {
  /* Dennis Quest · Quest-Master-Menü
     Schreibt das Dokument: Status je Quest, Zähler, Schritte, Einsätze, Duelle, Buchungen, Item-Korrekturen.
     Alles andere (Packs, Ziffern, Items, nächste Quest) rechnet engine.js daraus.
     Liest zusätzlich Dennis' Log-Buch-Antworten (eigener Pfad, schreibt dort nur beim Löschen). */
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
  const lbStore = window.QuestStore.logbuch(C);
  const $ = s => document.querySelector(s);
  let doc = E.emptyDoc();
  let state = E.derive(C, doc);
  let antworten = {};
  let toastTimer;

  const questById = id => C.quests.find(q => q.id === id);
  const itemById = id => C.items.find(i => i.id === id);
  const reihe = C.quests.filter(q => q.typ !== "lauf");
  const lauf = C.quests.filter(q => q.typ === "lauf");
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const typWort = q => q.typ === "kern" ? "Prüfung" : q.typ === "side" ? "Sidequest" : "Läuft";
  const STATUS_WORT = { offen: "offen", laeuft: "läuft", bestanden: "bestanden", verloren: "verloren", beendet: "beendet" };

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
    commit(d => { if (v === "offen") delete d.quests[id]; else d.quests[id] = v; }, questById(id).name + ": " + STATUS_WORT[v]);
  }

  function einsetzen(item, quest) {
    const it = itemById(item);
    commit(d => d.einsaetze.push({ id: uid(), item, quest }), `${it.name} eingesetzt (${questById(quest).name})`);
  }

  function fxHtml(q) {
    if (q.zaehler) return `<span class="w">Pro ${esc(q.zaehler.name)}: ${esc(E.effektText(C, q.zaehler.proTreffer, true))}</span>`;
    return `<span class="w">Sieg: ${esc(E.effektText(C, q.win, true))}</span> · <span class="l">Niederlage: ${esc(E.effektText(C, q.lose, false))}</span>`;
  }

  const besitzText = id => {
    const it = itemById(id), st = state.items[id];
    if (it.stapel) return st === "besitz" ? `${state.anzahl[id]}×` : st === "verbraucht" ? "aufgebraucht" : "keine";
    return { besitz: "im Besitz", verloren: "verloren", nicht: "noch nicht", verbraucht: "verbraucht" }[st];
  };

  // Knöpfe zum Einsetzen: alles, was hier einsetzbar ist. Nur aktiv, wenn Dennis es hat.
  function useHtml(qid) {
    const ids = E.einsetzbar(C, state, qid);
    const schon = state.eingesetzt[qid] || [];
    if (!ids.length && !schon.length) return "";
    const knoepfe = ids.map(id => {
      const it = itemById(id), hat = state.items[id] === "besitz";
      return `<button type="button" class="btn use-btn" data-item="${id}" data-quest="${qid}" ${hat ? "" : "disabled"}>${esc(it.name)} einsetzen <small>${esc(besitzText(id))}</small></button>`;
    }).join("");
    const liste = schon.length ? `<p class="used">Eingesetzt: ${schon.map(id => esc(itemById(id).name)).join(", ")}</p>` : "";
    return `<p class="sub-h">Einsetzbar</p><div class="chips">${knoepfe || '<span class="hint">nichts</span>'}</div>${liste}`;
  }

  function bindUse(root) {
    root.querySelectorAll(".use-btn").forEach(b => b.addEventListener("click", () => einsetzen(b.dataset.item, b.dataset.quest)));
  }

  /* ---------- Aufbau ---------- */
  function build() {
    $("#packsMax").textContent = "/ " + C.waehrung.max;
    $("#total").textContent = "/ " + reihe.length;

    const list = $("#quests");
    reihe.forEach(q => {
      const li = document.createElement("li");
      li.dataset.id = q.id;
      li.innerHTML = `
        <div class="q-head"><span class="q-nr">${q.nr}</span><span class="q-name">${esc(q.name)}</span><span class="badge ${q.typ}">${typWort(q)}</span><span class="badge jetzt" hidden>Jetzt</span></div>
        <div class="q-fx">${esc(q.ort)} · ${fxHtml(q)}</div>
        <div class="seg" role="group" aria-label="Status ${esc(q.name)}">
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
      b.textContent = sb.packs ? `${sb.packs > 0 ? "+" : "−"}${Math.abs(sb.packs)} ${sb.grund}` : sb.grund;
      b.addEventListener("click", () => commit(d => d.buchungen.push({ id: uid(), packs: sb.packs, grund: sb.grund, ...(sb.item ? { item: sb.item, menge: sb.menge } : {}) }), "Gebucht: " + sb.grund));
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
      li.innerHTML = `<span class="it">${esc(it.name)} <em>${esc(it.tarn ? "getarnt: " + it.tarn.name : "")}</em><small></small></span>
        <select aria-label="Korrektur ${esc(it.name)}">
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
      if (!confirm("Wirklich alles zurücksetzen? Alle Quests werden offen, Buchungen, Einsätze und Zähler gelöscht. Die Log-Buch-Antworten bleiben.")) return;
      commit(d => Object.assign(d, E.emptyDoc()), "Zurückgesetzt");
    });
    $("#resetLb").addEventListener("click", () => {
      if (!confirm("Alle Log-Buch-Antworten von Dennis löschen? Er kann dann neu antworten.")) return;
      lbStore.zuruecksetzen().then(() => toast("Log-Buch geleert"));
    });

    const s = C.speicher;
    $("#storageInfo").textContent = s.typ === "firebase" && s.databaseURL
      ? `Speicher: Firebase, Spiel „${s.spielId}“. ${key ? "Schreibschlüssel ist gesetzt." : "Kein Schreibschlüssel gesetzt."}`
      : "Speicher: nur dieses Gerät (Testmodus). Dennis' Ansicht sieht Änderungen nur im selben Browser.";
  }

  /* ---------- Darstellung ---------- */
  function render() {
    $("#packs").textContent = state.packs;
    $("#done").textContent = state.zaehler.erledigt;
    $("#code").innerHTML = C.code.map((v, i) => `<i class="${state.ziffern[i] != null ? "known" : ""}" title="Ziffer ${i + 1}">${v}</i>`).join("");
    $("#inv").innerHTML = C.items.filter(it => state.items[it.id] !== "nicht").map(it =>
      `<span class="inv-i st-${state.items[it.id]}">${esc(it.kurz)}${it.stapel ? " " + state.anzahl[it.id] + "×" : ""}</span>`).join("");

    renderNext();
    renderLauf();

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
      li.querySelector(".why").textContent = (b.grund || "") + (b.item ? ` (${b.menge > 0 ? "+" : ""}${b.menge} ${itemById(b.item)?.name || b.item})` : "");
      li.querySelector(".del").addEventListener("click", () => commit(d => { d.buchungen = d.buchungen.filter(x => x.id !== b.id); }, "Buchung gelöscht"));
      ledger.appendChild(li);
    });

    const eins = $("#einsaetze");
    eins.innerHTML = "";
    if (!doc.einsaetze.length) eins.innerHTML = '<li class="empty">Noch nichts eingesetzt.</li>';
    doc.einsaetze.slice().reverse().forEach(e => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="why"></span><button type="button" class="del" aria-label="Einsatz rückgängig">✕</button>`;
      li.querySelector(".why").textContent = `${itemById(e.item)?.name || e.item} bei ${questById(e.quest)?.name || e.quest}`;
      li.querySelector(".del").addEventListener("click", () => commit(d => { d.einsaetze = d.einsaetze.filter(x => x.id !== e.id); }, "Einsatz rückgängig"));
      eins.appendChild(li);
    });

    document.querySelectorAll("#items li").forEach(li => {
      const id = li.dataset.id, st = state.items[id];
      const small = li.querySelector("small");
      small.textContent = besitzText(id);
      small.className = "st-" + st;
      li.querySelector("select").value = doc.items[id] || "";
    });

    renderLogbuch();
  }

  function renderNext() {
    const n = state.next ? questById(state.next) : null;
    $("#nextCard").classList.toggle("all-done", !n);
    $("#nextEyebrow").textContent = n ? `Nächste Quest · Nr. ${n.nr} · ${typWort(n)}` : "Geschafft";
    $("#nextTitle").textContent = n ? n.name : "Alle Quests erledigt";
    $("#nextMeta").textContent = n ? `${n.ort} · ${n.text}` : "Jetzt fehlende Ziffern kaufen und das Kästchen öffnen.";
    $("#nextQm").textContent = n && n.qm ? n.qm : "";
    $("#nextFx").innerHTML = n ? fxHtml(n) : "";
    $("#nextUse").innerHTML = n ? useHtml(n.id) : "";
    bindUse($("#nextUse"));

    // Showdown: die drei Duelle mit Ergebnis je Duell
    const duels = $("#duels");
    duels.hidden = !(n && n.showdown);
    if (n && n.showdown) {
      const liste = E.showdownDuelle(C, state);
      const siege = liste.filter(d => d.ergebnis === "sieg").length, nied = liste.filter(d => d.ergebnis === "niederlage").length;
      const noetig = Math.floor(liste.length / 2) + 1;
      const rat = siege >= noetig ? "Genug Siege: Bestanden buchen." : nied >= noetig ? "Zu viele Niederlagen: Verloren buchen." : `Stand ${siege} : ${nied}. Nötig: ${noetig} Siege.`;
      duels.innerHTML = `<p class="sub-h">Die ${liste.length} Duelle</p><ol class="duel-list">${liste.map(d => `
        <li><span class="d-name">${esc(questById(d.quest).name)} <small>${d.art === "revanche" ? "Revanche" : "aufgefüllt"}</small></span>
          <span class="seg two" role="group" aria-label="Duell ${d.nr}">
            <button type="button" data-nr="${d.nr}" data-v="sieg" aria-pressed="${d.ergebnis === "sieg"}">Sieg</button>
            <button type="button" data-nr="${d.nr}" data-v="niederlage" aria-pressed="${d.ergebnis === "niederlage"}">Niederlage</button>
          </span></li>`).join("")}</ol><p class="hint">${rat} Schild: verlorenes Duell auf offen stellen und neu spielen.</p>`;
      duels.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
        const nr = b.dataset.nr, v = b.dataset.v;
        commit(d => { if (d.duelle[nr] === v) delete d.duelle[nr]; else d.duelle[nr] = v; }, `Duell ${nr}: ${d0(v, doc.duelle[nr])}`);
      }));
    }
    const lb = $("#nextLogbuch");
    lb.hidden = !(n && n.logbuch);
    if (n && n.logbuch) lb.innerHTML = `<p class="sub-h">Dennis' Antworten (live)</p>` + logbuchHtml();
  }
  const d0 = (v, alt) => alt === v ? "zurückgesetzt" : v === "sieg" ? "Sieg" : "Niederlage";

  function renderLauf() {
    const box = $("#lauf");
    box.innerHTML = lauf.map(q => {
      const st = state.quests[q.id];
      let knoepfe = "";
      if (st === "offen") knoepfe = `<button type="button" class="btn" data-a="start">Starten</button>`;
      else {
        if (q.zaehler && st === "laeuft") knoepfe += `<span class="counter"><button type="button" class="btn" data-a="minus" aria-label="Ein Treffer weniger">−</button><b>${state.treffer[q.id]}</b><button type="button" class="btn win" data-a="plus">+1 ${esc(q.zaehler.name)}</button></span>`;
        (q.schritte || []).forEach(sx => {
          const an = state.schritte[q.id][sx.id];
          knoepfe += `<button type="button" class="btn${an ? " on" : ""}" data-a="schritt" data-s="${sx.id}" aria-pressed="${an}">${esc(sx.name)}${an ? " ✓" : ""}</button>`;
        });
        if (st === "laeuft") knoepfe += q.zaehler ? `<button type="button" class="btn" data-a="beendet">Beenden</button>`
          : `<button type="button" class="btn win" data-a="bestanden">Bestanden</button><button type="button" class="btn lose" data-a="verloren">Verloren</button>`;
        else knoepfe += `<button type="button" class="btn ghost" data-a="laeuft">Wieder laufen lassen</button>`;
        knoepfe += `<button type="button" class="btn ghost" data-a="offen">Nicht gestartet</button>`;
      }
      return `<div class="lauf-q" data-id="${q.id}">
        <div class="q-head"><span class="q-nr">${q.nr}</span><span class="q-name">${esc(q.name)}</span><span class="badge st-${st}">${STATUS_WORT[st]}</span>${q.zaehler && st !== "offen" ? `<span class="badge">${state.treffer[q.id]} ${esc(q.zaehler.name)}</span>` : ""}</div>
        <div class="q-fx">${fxHtml(q)}</div>
        ${q.qm ? `<p class="qm">${esc(q.qm)}</p>` : ""}
        <div class="chips">${knoepfe}</div>
        ${st === "laeuft" ? `<div class="use">${useHtml(q.id)}</div>` : ""}
      </div>`;
    }).join("");
    box.querySelectorAll(".lauf-q").forEach(el => {
      const id = el.dataset.id, q = questById(id);
      el.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", () => {
        const a = b.dataset.a;
        if (a === "plus" || a === "minus") {
          const n = Math.max(0, Math.min(q.zaehler.max || 99, (state.treffer[id] || 0) + (a === "plus" ? 1 : -1)));
          commit(d => { d.zaehler[id] = n; }, `${q.name}: ${n} ${q.zaehler.name}`);
        } else if (a === "schritt") {
          const s = b.dataset.s;
          commit(d => { d.schritte[id] = d.schritte[id] || {}; if (d.schritte[id][s]) delete d.schritte[id][s]; else d.schritte[id][s] = true; }, `${q.name}: ${q.schritte.find(x => x.id === s).name}`);
        } else if (a === "start") setQuest(id, "laeuft");
        else setQuest(id, a);
      }));
      bindUse(el);
    });
  }

  function logbuchHtml() {
    return `<ol class="lb-list">${C.logbuch.fragen.map((f, i) => {
      const a = antworten[String(i + 1)];
      return `<li><span class="lb-q">${esc(f.frage)}</span><span class="lb-a${a ? "" : " leer"}">${a ? esc(a.antwort) : "noch keine Antwort"}</span></li>`;
    }).join("")}</ol>`;
  }
  function renderLogbuch() {
    $("#lbList").outerHTML = `<ol class="lb-list" id="lbList">${logbuchHtml().replace(/^<ol class="lb-list">|<\/ol>$/g, "")}</ol>`;
    const n = state.next ? questById(state.next) : null;
    if (n && n.logbuch) $("#nextLogbuch").innerHTML = `<p class="sub-h">Dennis' Antworten (live)</p>` + logbuchHtml();
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
  lbStore.subscribe(a => { antworten = a; renderLogbuch(); });
})();
