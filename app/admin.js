(() => {
  /* Dennis Quest · Quest-Master-Menü
     Schreibt das Dokument: Status je Quest, Zähler, Schritte, Einsätze, Duelle, Buchungen, Item-Korrekturen.
     Alles andere (Packs, Ziffern, Items, nächste Quest) rechnet engine.js daraus.
     Liest zusätzlich Dennis' Log-Buch-Antworten (eigener Pfad, schreibt dort nur beim Löschen) und Dennis' eigene Einträge
     (Ergebnis, Einsatz, Duell, Amulett, Ziffer, Kanal „dennis"). engine.js rechnet sie ein, deine Buchung gilt vor.
     Zurücknehmen löscht seinen Eintrag, Rückgängig stellt ihn wieder her.
     admin.html?probe: Probelauf in einem eigenen Spiel neben dem echten, mit Sprungknöpfen. */
  const C = window.QuestStore.probe(window.GAME_CONFIG);
  const PROBE = window.QuestStore.PROBE;
  const E = window.QuestEngine;

  // Schlüssel für geschütztes Schreiben (Firebase): admin.html#key=GEHEIM, wird im Gerät gemerkt
  let key = null;
  try {
    const m = location.hash.match(/key=([^&]+)/);
    if (m) { key = decodeURIComponent(m[1]); localStorage.setItem("dennis-quest-admin-key", key); history.replaceState(null, "", location.pathname + location.search); }
    else key = localStorage.getItem("dennis-quest-admin-key");
  } catch (_) {}

  const store = window.QuestStore.create(C, { key });
  const lbStore = window.QuestStore.logbuch(C);
  const einStore = window.QuestStore.eintraege(C);
  let eintraege = {}, mdoc = E.emptyDoc();     // Dennis' Einträge und das Dokument mit ihnen (so sieht Dennis es)
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
  const STATUS_WORT = { offen: "offen", laeuft: "läuft", bestanden: "bestanden", verloren: "verloren", beendet: "beendet", glanz: "Glanzsieg" };

  function toast(msg) {
    clearTimeout(toastTimer);
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    toastTimer = setTimeout(() => t.classList.remove("show"), 1600);
  }

  /* Rückgängig: Vor jeder Änderung wird der Stand gemerkt, mit einem Wort dazu, was passiert ist.
     Pro Spiel im Gerät gespeichert, weil das iPhone die App oft neu lädt. Die letzten 40 Schritte. */
  const VERLAUF_KEY = "dennis-quest-verlauf:" + C.speicher.spielId;
  let verlauf = [];
  try { verlauf = JSON.parse(localStorage.getItem(VERLAUF_KEY) || "[]"); } catch (_) {}
  const verlaufMerken = () => { try { localStorage.setItem(VERLAUF_KEY, JSON.stringify(verlauf)); } catch (_) {} };
  // Vergleichbarer Stand ohne Zeitstempel, Schlüssel sortiert (Firebase liefert sie sortiert zurück)
  const kanon = d => JSON.stringify({ ...E.normalize(d), stand: 0 }, (k, v) =>
    v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(x => [x, v[x]])) : v);

  // o.dennis: Schlüssel von Dennis' Einträgen, die mit weg sollen (Zurücknehmen), o.alle: alle auf einmal (ein einziges
  // Löschen, bei Dennis kommt es in einem Stück an), o.tagebuch: seine Tagebuch-Antworten auch. Rückgängig schreibt alles wieder.
  function commit(mutate, msg, o = {}) {
    const vorher = JSON.parse(JSON.stringify(doc));
    const next = JSON.parse(JSON.stringify(doc));
    mutate(next);
    const weg = {};
    (o.alle ? Object.keys(eintraege) : o.dennis || []).forEach(k => { if (eintraege[k]) weg[k] = eintraege[k]; });
    const tagebuch = o.tagebuch ? JSON.parse(JSON.stringify(antworten)) : null;
    verlauf = [...verlauf, { doc: vorher, was: msg || "Änderung", nach: kanon(next), dennis: weg, ...(tagebuch ? { tagebuch } : {}) }].slice(-40);
    verlaufMerken();
    // Erst das Spiel, dann das Löschen: So kommt bei Dennis der neue Stand (etwa der Neustart) vor den Einzelteilen an
    const gespeichert = Promise.resolve(kanon(vorher) !== kanon(next) ? store.save(next) : null);
    const keinNetz = was => () => setTimeout(() => toast(`Kein Netz: ${was} noch nicht gelöscht. Bitte nochmal.`), 1700);
    gespeichert.then(() => {
      if (o.alle) einStore.zuruecksetzen().catch(keinNetz("Dennis' Einträge sind"));
      else Object.keys(weg).forEach(k => einStore.loeschen(k).catch(keinNetz("Dennis' Eintrag ist")));
      if (tagebuch) lbStore.zuruecksetzen().catch(keinNetz("Die Tagebuch-Antworten sind"));
    });
    if (msg) toast(msg);
    renderUndo();
  }

  function rueckgaengig() {
    const letzter = verlauf[verlauf.length - 1];
    if (!letzter) return;
    // Hat ein anderes Gerät inzwischen etwas geändert, würde Rückgängig das mit überschreiben
    if (letzter.nach && letzter.nach !== kanon(doc) && !confirm(`Seit „${letzter.was}“ hat sich der Stand geändert, vielleicht auf einem anderen Gerät. Trotzdem zurücknehmen? Die neuere Änderung geht dann verloren.`)) return;
    verlauf.pop();
    verlaufMerken();
    store.save(letzter.doc);
    Object.entries(letzter.dennis || {}).forEach(([k, e]) => einStore.setzen(k, e));
    Object.entries(letzter.tagebuch || {}).forEach(([k, e]) => lbStore.setzen(k, e));
    toast("Zurückgenommen: " + letzter.was);
    renderUndo();
  }

  function renderUndo() {
    const l = verlauf[verlauf.length - 1];
    $("#undo").disabled = !l;
    $("#undoWas").textContent = l ? l.was : "";
    $("#undo").setAttribute("aria-label", l ? "Rückgängig: " + l.was : "Nichts zum Zurücknehmen");
  }

  // Wann eine Quest entschieden wurde: bestimmt die Reihenfolge der Packs (engine.js). Umbuchen behält die Zeit.
  const ENTSCHIEDEN = ["bestanden", "verloren", "beendet"];
  // Offen oder „läuft“ nimmt auch Dennis' Ergebnis zurück (bei „offen“ auch seine Schritte). Bestanden, Glanzsieg oder
  // Verloren von dir gilt vor seinem Eintrag. Glanzsieg = bestanden plus glanz (nur Quests mit glanz in config.js).
  function setQuest(id, v) {
    const dennis = ENTSCHIEDEN.includes(v) || v === "glanz" ? [] : ["q_" + id, ...(v === "offen" ? Object.keys(eintraege).filter(k => k.startsWith(`s_${id}_`)) : [])];
    const status = v === "glanz" ? "bestanden" : v;
    commit(d => {
      const vorher = d.quests[id];
      d.glanz = { ...d.glanz };
      if (v === "glanz") d.glanz[id] = true; else delete d.glanz[id];
      if (status === "offen") delete d.quests[id]; else d.quests[id] = status;
      if (!ENTSCHIEDEN.includes(status)) delete d.zeiten[id];
      else if (!ENTSCHIEDEN.includes(vorher) || !d.zeiten[id]) d.zeiten[id] = Date.now();
    }, questById(id).name + ": " + STATUS_WORT[v], { dennis });
  }
  const buchung = b => ({ id: uid(), zeit: Date.now(), ...b });

  // Fluch (29.09.): Auch als Notlösung würfelt der Schattendieb, und das Spiel mit dem Vorteil wird gemerkt
  function einsetzen(item, quest) {
    const it = itemById(item);
    if (!it.dieb) return commit(d => d.einsaetze.push({ id: uid(), item, quest, zeit: Date.now() }), `${it.name} eingesetzt (${questById(quest).name})`);
    const v = E.fluchVorteil(C, state, quest), raub = E.diebWurf(C);
    commit(d => d.einsaetze.push({ id: uid(), item, quest, zeit: Date.now(), raub, ...(v ? { fuer: v.quest } : {}) }),
      `${it.name} gesprochen (${questById(quest).name}), ${it.dieb.name} stiehlt ${raub}`);
  }
  // Vorteil und Raub eines gesprochenen Fluchs, als Text für Liste und Meldung
  function fluchFolgen(e) {
    const it = C.items.find(i => i.dieb), v = E.fluchVorteil(C, state, e.fuer || e.quest);
    const raub = Math.max(0, Math.min(it.dieb.gewichte.length - 1, Math.trunc(Number(e.raub)) || 0));
    return `${v ? ` · Vorteil${e.fuer && e.fuer !== e.quest ? ` (${questById(e.fuer)?.name})` : ""}: ${v.text}` : ""} · ${it.dieb.name} stiehlt ${raub}`;
  }
  // Was ein Fluch hier bringt, als Zeile für dich
  const fluchZeile = qid => {
    const v = E.fluchVorteil(C, state, qid);
    return v ? `<p class="used">Fluch hier: ${v.duell ? `Duell ${v.duell}, ${esc(questById(v.quest).name)}: ` : ""}${esc(v.text)}</p>` : "";
  };

  function fxHtml(q) {
    if (q.zaehler) return `<span class="w">Pro ${esc(q.zaehler.name)}: ${esc(E.effektText(C, q.zaehler.proTreffer, true))}</span>`;
    return `<span class="w">Sieg: ${esc(E.effektText(C, q.win, true))}</span>`
      + (q.glanz ? ` · <span class="w">Glanzsieg (${esc(q.glanz.bedingung)}): dazu ${esc(E.effektText(C, q.glanz, true))}</span>` : "")
      + ` · <span class="l">Niederlage: ${esc(E.effektText(C, q.lose, false))}</span>`;
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
    return `<p class="sub-h">Einsetzbar</p><div class="chips">${knoepfe || '<span class="hint">nichts</span>'}</div>${ids.some(id => itemById(id).dieb) ? fluchZeile(qid) : ""}${liste}`;
  }

  function bindUse(root) {
    root.querySelectorAll(".use-btn").forEach(b => b.addEventListener("click", () => einsetzen(b.dataset.item, b.dataset.quest)));
  }

  /* ---------- Aufbau ---------- */
  function build() {
    $("#packsMax").textContent = "/ " + C.waehrung.max;
    $("#total").textContent = " / " + reihe.length;

    const list = $("#quests");
    reihe.forEach(q => {
      const li = document.createElement("li");
      li.dataset.id = q.id;
      li.innerHTML = `
        <div class="q-head"><span class="q-nr">${q.nr}</span><span class="q-name">${esc(q.name)}</span><span class="badge jetzt" hidden>Jetzt</span></div>
        <div class="seg${q.glanz ? " vier" : ""}" role="group" aria-label="Status ${esc(q.name)}">
          <button type="button" data-v="offen">Offen</button>
          <button type="button" data-v="bestanden">Bestanden</button>
          ${q.glanz ? `<button type="button" data-v="glanz">Glanzsieg</button>` : ""}
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
      b.addEventListener("click", () => commit(d => d.buchungen.push(buchung({ packs: sb.packs, grund: sb.grund, ...(sb.item ? { item: sb.item, menge: sb.menge } : {}), ...(sb.offen ? { offen: true } : {}) })), "Gebucht: " + sb.grund));
      quick.appendChild(b);
    });

    $("#customForm").addEventListener("submit", ev => {
      ev.preventDefault();
      const n = parseInt($("#customAmount").value, 10);
      const g = $("#customReason").value.trim() || "Buchung";
      if (!n) { toast("Menge eingeben, z. B. -1 oder 2"); return; }
      commit(d => d.buchungen.push(buchung({ packs: n, grund: g })), "Gebucht: " + g);
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
    $("#nextGlanz").addEventListener("click", () => state.next && questById(state.next).glanz && setQuest(state.next, "glanz"));
    $("#nextLose").addEventListener("click", () => state.next && setQuest(state.next, "verloren"));
    // Alles zurücksetzen: neuer Zeitstempel in neustart, daran erkennt Dennis' Handy den neuen Anfang (ein Fenster, dann von vorn)
    $("#reset").addEventListener("click", () => {
      if (!confirm("Wirklich alles zurücksetzen? Alle Quests werden offen, Packs, Einsätze, Zähler und Dennis' Tagebuch-Antworten werden gelöscht. Sein Handy fängt von vorn an, mit der Fee. Rückgängig holt den Stand zurück.")) return;
      commit(d => { Object.assign(d, E.emptyDoc()); d.neustart = Date.now(); }, "Alles zurückgesetzt", { alle: true, tagebuch: true });
    });
    $("#undo").addEventListener("click", rueckgaengig);
    renderUndo();
    buildProbe();
    $("#resetLb").addEventListener("click", () => {
      if (!Object.keys(antworten).length) return toast("Das Tagebuch ist schon leer");
      if (!confirm("Alle Tagebuch-Antworten von Dennis löschen? Er kann dann neu antworten. Rückgängig holt sie zurück.")) return;
      commit(() => {}, "Tagebuch geleert", { tagebuch: true });
    });

    const s = C.speicher;
    $("#storageInfo").textContent = s.typ === "firebase" && s.databaseURL
      ? `Firebase, Spiel „${s.spielId}“, ${key ? "mit" : "ohne"} Schreibschlüssel.`
      : "Nur dieses Gerät (Testmodus).";
  }

  /* ---------- Probelauf (admin.html?probe) ---------- */
  // Zeitpunkte des Tages, aus der Konfiguration gebaut. Muster: zwei Siege, eine Niederlage (gibt Revanchen im Showdown).
  const SZENARIEN = [
    { name: "Start", doc: () => E.emptyDoc() },
    { name: "Nach dem Zug", doc: () => probeStand(1, { treffer: 0 }) },
    { name: "Mitte", doc: () => probeStand(Math.ceil(reihe.length / 2), { treffer: 1 }) },
    { name: "Vor dem Bund", doc: () => probeStand(reihe.length - 1, { treffer: 2, schritte: true }) },
    { name: "Ende", doc: () => probeStand(reihe.length, { treffer: 2, schritte: true, ende: true }) },
    { name: "Zufall", doc: () => probeStand(1 + Math.floor(Math.random() * reihe.length), { zufall: true }) }
  ];
  function probeStand(n, o) {
    const d = E.emptyDoc();
    let t = Date.now() - 3600e3;
    const zeit = id => { d.zeiten[id] = t; t += 60e3; };
    const wurf = () => Math.random() < .5 ? "bestanden" : "verloren";
    reihe.slice(0, n).forEach((q, i) => {
      d.quests[q.id] = o.zufall ? wurf() : i % 3 === 2 ? "verloren" : "bestanden"; zeit(q.id);
      if (o.zufall && q.glanz && d.quests[q.id] === "bestanden" && Math.random() < .5) d.glanz[q.id] = true;
    });
    lauf.forEach(q => {
      const ende = o.ende || (o.zufall && Math.random() < .3);
      d.quests[q.id] = !ende ? "laeuft" : q.zaehler ? "beendet" : o.zufall ? wurf() : "bestanden";
      if (ende) zeit(q.id);
      if (q.zaehler) d.zaehler[q.id] = o.zufall ? Math.floor(Math.random() * ((q.zaehler.max || 3) + 1)) : Math.min(o.treffer, q.zaehler.max || 99);
      if (q.schritte && (o.schritte || ende || (o.zufall && Math.random() < .5))) d.schritte[q.id] = Object.fromEntries(q.schritte.map(x => [x.id, true]));
    });
    // Am Ende war Dennis durch das Tor: fehlende Ziffern per Buße geholt
    if (o.ende) E.derive(C, d).ziffern.forEach((z, i) => { if (z == null) d.buchungen.push({ id: "busse" + (i + 1), packs: 0, grund: E.zifferGrund(i + 1, "busse"), ziffer: i + 1, weg: "busse", zeit: t }); });
    return d;
  }

  function buildProbe() {
    document.body.classList.toggle("probe", PROBE);
    $("#probeBand").hidden = !PROBE;
    $("#probeCard").hidden = !PROBE;
    $("#dennisLink").href = PROBE ? "./?probe" : "./";
    $("#probeLink").href = PROBE ? "admin.html" : "admin.html?probe";
    $("#probeLink").textContent = PROBE ? "Zum echten Spiel" : "Probelauf öffnen";
    if (!PROBE) return;
    document.title = "Probe · " + document.title;
    $("#probeUrl").textContent = location.host + location.pathname.replace(/admin(\.html)?$/, "") + "?probe";   // Netlify kürzt admin.html zu /admin
    SZENARIEN.forEach(sz => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn";
      b.textContent = sz.name;
      // Start ist ein neuer Anfang wie „Alles zurücksetzen“ (auch das Tagebuch), die anderen Sprünge behalten den Zeitstempel
      const start = sz.name === "Start";
      b.addEventListener("click", () => commit(d => { const ns = d.neustart; Object.assign(d, E.emptyDoc(), sz.doc()); d.neustart = start ? Date.now() : ns || 0; },
        "Probe: " + sz.name, { alle: true, tagebuch: start }));
      $("#szenarien").appendChild(b);
    });
  }

  /* ---------- Darstellung ---------- */
  function render() {
    // Die Zahl sind Dennis' geschlossene Packs (29.09.). Dahinter, wie viele er schon geöffnet hat.
    $("#packs").textContent = state.packs;
    $("#packsMax").textContent = "/ " + C.waehrung.max + (state.geoeffnet ? ` · ${state.geoeffnet} offen` : "");
    const k = state.kappung;
    $("#kappung").hidden = !(k.unten || k.oben || state.karten);
    $("#kappung").textContent = [
      state.karten ? `Karten an den Bund: ${state.karten} (jeweils seine beste aus einem geöffneten Pack, weil geschlossene fehlten)` : "",
      k.unten ? `Verpufft, weil Dennis nichts mehr hatte: ${k.unten}` : "",
      k.oben ? `Verfallen, weil alle Packs schon seine waren: ${k.oben}` : ""].filter(Boolean).join(" · ");
    $("#done").textContent = state.zaehler.erledigt;
    $("#code").innerHTML = C.code.map((v, i) => `<i class="${state.ziffern[i] != null ? "known" : ""}" title="Ziffer ${i + 1}">${v}</i>`).join("");
    $("#inv").innerHTML = C.items.filter(it => state.items[it.id] !== "nicht").map(it =>
      `<span class="inv-i st-${state.items[it.id]}">${esc(it.kurz)}${it.stapel ? " " + state.anzahl[it.id] + "×" : ""}</span>`).join("");

    renderNext();
    renderLauf();

    document.querySelectorAll("#quests li").forEach(li => {
      const g = !!state.glanz[li.dataset.id], v = g ? "glanz" : state.quests[li.dataset.id];
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
      b.addEventListener("click", () => commit(d => d.buchungen.push(buchung({ packs: -C.ziffer_preis, grund: E.zifferGrund(i + 1, "packs"), ziffer: i + 1, weg: "packs" })), `Ziffer ${i + 1} gekauft`));
      buy.appendChild(b);
      // Tor zum Gipfel: Bußprüfung bestanden, die Ziffer kostet keine Packs
      const bu = document.createElement("button");
      bu.type = "button";
      bu.className = "btn";
      bu.textContent = `Ziffer ${i + 1} per Buße`;
      bu.addEventListener("click", () => commit(d => d.buchungen.push(buchung({ packs: 0, grund: E.zifferGrund(i + 1, "busse"), ziffer: i + 1, weg: "busse" })), `Ziffer ${i + 1} per Buße`));
      buy.appendChild(bu);
    });

    renderVerlauf();

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
    $("#nextTitle").textContent = n ? n.name : "Alle Quests erledigt";
    $("#nextMeta").textContent = n ? `${typWort(n)} ${n.nr} · ${n.ort}` : "Jetzt das Kästchen öffnen.";
    $("#nextQm").textContent = n && n.qm ? n.qm : "";
    $("#nextFx").innerHTML = n ? fxHtml(n) : "";
    $("#nextGlanz").hidden = !(n && n.glanz);
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
      const tor = state.tor ? `<p class="hint tor">Tor zum Gipfel: Es fehlt noch ${state.tor.fehlend.map(z => "Ziffer " + z).join(" und ")}. Dennis holt sie für ${C.ziffer_preis} Packs, mit Rikes Segen oder per Buße. Selbst buchen unter „Buchen“.</p>` : "";
      duels.innerHTML = tor + `<p class="sub-h">Duelle</p><ol class="duel-list">${liste.map(d => `
        <li><span class="d-name">${esc(questById(d.quest).name)} <small>${d.art === "revanche" ? "Revanche" : "aufgefüllt"}</small></span>
          <span class="seg two" role="group" aria-label="Duell ${d.nr}">
            <button type="button" data-nr="${d.nr}" data-v="sieg" aria-pressed="${d.ergebnis === "sieg"}">Sieg</button>
            <button type="button" data-nr="${d.nr}" data-v="niederlage" aria-pressed="${d.ergebnis === "niederlage"}">Niederlage</button>
          </span></li>`).join("")}</ol><p class="hint">${rat}</p>`;
      duels.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
        const nr = b.dataset.nr, v = b.dataset.v;
        const an = state.duelle[nr] === v;
        commit(d => { if (an) delete d.duelle[nr]; else d.duelle[nr] = v; }, `Duell ${nr}: ${an ? "zurückgesetzt" : v === "sieg" ? "Sieg" : "Niederlage"}`, { dennis: an ? ["d_" + nr] : [] });
      }));
    }
    const lb = $("#nextLogbuch");
    lb.hidden = !(n && n.logbuch);
    if (n && n.logbuch) lb.innerHTML = `<p class="sub-h">Dennis' Antworten</p>` + logbuchHtml();
  }

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
        <div class="q-head"><span class="q-name">${esc(q.name)}</span><span class="badge st-${st}">${STATUS_WORT[st]}</span>${q.zaehler && st !== "offen" ? `<span class="badge">${state.treffer[q.id]} ${esc(q.zaehler.name)}</span>` : ""}</div>
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
          const an = state.schritte[id][s];
          commit(d => { d.schritte[id] = d.schritte[id] || {}; if (an) delete d.schritte[id][s]; else d.schritte[id][s] = true; },
            `${q.name}: ${q.schritte.find(x => x.id === s).name}${an ? " zurückgenommen" : ""}`, { dennis: an ? [`s_${id}_${s}`] : [] });
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
    if (n && n.logbuch) $("#nextLogbuch").innerHTML = `<p class="sub-h">Dennis' Antworten</p>` + logbuchHtml();
  }

  store.onStatus(st => {
    const el = $("#sync");
    const t = st.stand ? new Date(st.stand).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "–";
    if (st.lokal) el.textContent = "Testmodus · " + t;
    else if (st.pending) el.textContent = "Nicht gesendet, wird nachgeschickt · " + t;
    else el.textContent = (st.online ? "Online · " : "Offline · ") + t;
    el.classList.toggle("off", !st.lokal && (!st.online || st.pending));
  });

  /* Was Dennis selbst besiegelt hat: live mit Uhrzeit, jeder Eintrag lässt sich zurücknehmen */
  function eintragText(k, e) {
    const i = k.indexOf("_"), art = k.slice(0, i), rest = k.slice(i + 1);
    if (art === "q") return `${questById(rest)?.name || rest}: ${e.glanz && e.status === "bestanden" ? "Glanzsieg" : STATUS_WORT[e.status] || e.status}`;
    if (art === "e" && itemById(e.item)?.dieb) return `Fluch gesprochen bei ${questById(e.quest)?.name || e.quest}${fluchFolgen(e)}`;
    if (art === "e") return `${itemById(e.item)?.name || e.item} eingesetzt bei ${questById(e.quest)?.name || e.quest}`;
    if (art === "d") return `Duell ${rest}: ${e.ergebnis === "sieg" ? "Sieg" : "Niederlage"}`;
    if (art === "s") { const j = rest.indexOf("_"), q = questById(rest.slice(0, j)), sx = q && (q.schritte || []).find(x => x.id === rest.slice(j + 1)); return `${q ? q.name : rest}: ${sx ? sx.name : rest}`; }
    if (art === "z") return E.zifferGrund(rest, e.weg) + (e.weg === "busse" || e.weg === "segen" ? "" : ` (−${C.ziffer_preis})`);
    if (art === "o") return "Pack geöffnet (−1, gib ihm eins)";
    return k;
  }
  // Gilt der Eintrag, oder hast du selbst schon anders gebucht?
  function eintragGilt(k, e) {
    const i = k.indexOf("_"), art = k.slice(0, i), rest = k.slice(i + 1);
    if (art === "q") return !ENTSCHIEDEN.includes(doc.quests[rest]) || (doc.quests[rest] === e.status && !doc.glanz[rest] === !(e.glanz && e.status === "bestanden"));
    if (art === "d") return !doc.duelle[rest] || doc.duelle[rest] === e.ergebnis;
    return true;
  }
  /* Ein Verlauf für alles, neuestes oben: Dennis' Einträge (Zurücknehmen, die Fee sagt es ihm) und deine eigenen
     Buchungen, Einsätze und Ergebnisse (Löschen). data-art wie der Schlüssel der Einträge: q, e, d, s, z, o, b (Buchung). */
  function renderVerlauf() {
    const zeilen = [];
    Object.entries(eintraege).forEach(([k, e]) => zeilen.push({
      zeit: e.zeit || 0, art: k[0], von: "dennis", text: eintragText(k, e) + (eintragGilt(k, e) ? "" : " · gilt nicht, du hast anders gebucht"),
      weg: () => commit(() => {}, "Zurückgenommen: " + eintragText(k, e), { dennis: [k] })
    }));
    doc.buchungen.filter(b => b.von !== "dennis").forEach(b => {
      const n = Number(b.packs) || 0;
      zeilen.push({
        zeit: b.zeit || 0, art: "b", von: "qm", text: `${n > 0 ? "+" : n < 0 ? "−" : ""}${n ? Math.abs(n) + " " : ""}${b.grund || ""}${b.item ? ` (${b.menge > 0 ? "+" : ""}${b.menge} ${itemById(b.item)?.name || b.item})` : ""}`,
        weg: () => commit(d => { d.buchungen = d.buchungen.filter(x => x.id !== b.id); }, "Buchung gelöscht")
      });
    });
    doc.einsaetze.filter(e => e.von !== "dennis").forEach(e => {
      const it = itemById(e.item);
      zeilen.push({
        zeit: e.zeit || 0, art: "e", von: "qm", text: `${it?.name || e.item} bei ${questById(e.quest)?.name || e.quest}${it && it.dieb ? fluchFolgen(e) : ""}`,
        weg: () => commit(d => { d.einsaetze = d.einsaetze.filter(x => x.id !== e.id); }, "Einsatz gelöscht")
      });
    });
    Object.entries(doc.quests).filter(([, st]) => ENTSCHIEDEN.includes(st)).forEach(([id, st]) => {
      const q = questById(id);
      if (!q) return;
      zeilen.push({ zeit: doc.zeiten[id] || 0, art: "q", von: "qm", text: `${q.name}: ${doc.glanz[id] ? "Glanzsieg" : STATUS_WORT[st]}`, weg: () => setQuest(id, "offen") });
    });
    zeilen.sort((a, b) => b.zeit - a.zeit);
    const liste = $("#verlauf");
    liste.innerHTML = zeilen.length ? "" : '<li class="empty">Noch nichts passiert.</li>';
    zeilen.forEach(z => {
      const li = document.createElement("li");
      li.dataset.art = z.art; li.dataset.von = z.von;
      const zeit = z.zeit ? new Date(z.zeit).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "";
      li.innerHTML = `<time>${zeit}</time><span class="why"></span><button type="button" class="btn ghost zurueck">${z.von === "dennis" ? "Zurücknehmen" : "Löschen"}</button>`;
      li.querySelector(".why").textContent = z.text;
      li.querySelector(".zurueck").addEventListener("click", z.weg);
      liste.appendChild(li);
    });
  }

  function neuRechnen() { mdoc = E.mitEintraegen(C, doc, eintraege); state = E.derive(C, mdoc); render(); }
  build();
  let einGelesen = false;
  einStore.subscribe(e => {
    // Neue Einträge von Dennis kurz melden (nicht beim ersten Laden)
    if (einGelesen) Object.keys(e).filter(k => !eintraege[k] || eintraege[k].zeit !== e[k].zeit).forEach(k => toast("Dennis: " + eintragText(k, e[k])));
    einGelesen = true;
    eintraege = e;
    neuRechnen();
  });
  store.subscribe(d => { doc = d; neuRechnen(); });
  lbStore.subscribe(a => { antworten = a; renderLogbuch(); });
})();
