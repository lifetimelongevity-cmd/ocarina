/* Dennis Quest · Logik v1
   Zustand = derive(Konfiguration, gespeichertes Dokument). Reine Funktion, kein DOM, kein Netz.

   Das Dokument enthält nur, was der Quest Master einstellt:
   {
     quests:    { [questId]: "bestanden" | "verloren" | "laeuft" | "beendet" }   // fehlt = offen
     zaehler:   { [questId]: Zahl }                   // Treffer einer Zähler-Quest (Prophezeiung)
     schritte:  { [questId]: { [schrittId]: true } }  // Zwischenschritte einer laufenden Quest (Amulett gefunden)
     einsaetze: [ { id, item, quest } ]               // Dennis hat ein Item oder eine Fähigkeit eingesetzt
     duelle:    { "1": "sieg" | "niederlage", ... }    // Ergebnisse der Showdown-Duelle
     buchungen: [ { id, packs, grund, ziffer?, item?, menge? } ]   // ziffer = gekauft, item/menge = Spruchrolle o. Ä.
     items:     { [itemId]: "besitz" | "verloren" | "nicht" }      // manuelle Korrektur, schlägt die Regel
     stand:     Zeitstempel der letzten Änderung
   } */
(function (root) {
  const STATUS = ["offen", "bestanden", "verloren"];
  const STATUS_LAUF = ["offen", "laeuft", "bestanden", "verloren", "beendet"];

  const obj = x => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
  const list = x => (Array.isArray(x) ? x.filter(Boolean) : x && typeof x === "object" ? Object.values(x).filter(Boolean) : []);

  function emptyDoc() {
    return { quests: {}, zaehler: {}, schritte: {}, einsaetze: [], duelle: {}, buchungen: [], items: {}, stand: 0 };
  }

  function normalize(doc) {
    const d = obj(doc);
    // Firebase liefert Listen mit Lücken als Objekt, Duelle als Liste: beides glätten
    const duelle = {};
    if (Array.isArray(d.duelle)) d.duelle.forEach((v, i) => { if (v) duelle[String(i)] = v; });
    else Object.assign(duelle, obj(d.duelle));
    return {
      quests: obj(d.quests),
      zaehler: obj(d.zaehler),
      schritte: obj(d.schritte),
      einsaetze: list(d.einsaetze),
      duelle,
      buchungen: list(d.buchungen),
      items: obj(d.items),
      stand: Number(d.stand) || 0
    };
  }

  const reihe = config => config.quests.filter(q => q.typ !== "lauf");
  const itemCfg = (config, id) => config.items.find(i => i.id === id);

  function derive(config, rawDoc) {
    const doc = normalize(rawDoc);
    const max = config.waehrung.max;
    let packs = config.waehrung.start || 0;
    const items = {}, anzahl = {}, jeHatte = {};
    const erhalten = [];                        // Reihenfolge, in der Items ins Inventar kamen
    const ziffern = config.code.map(() => null);
    const gekauft = config.code.map(() => false);
    const quests = {}, treffer = {}, schritte = {}, eingesetzt = {};
    let bestanden = 0, verloren = 0;

    config.items.forEach(it => { items[it.id] = "nicht"; if (it.stapel) anzahl[it.id] = 0; });

    const geben = (id, n = 1) => {
      const it = itemCfg(config, id);
      if (!it) return;
      if (it.stapel) anzahl[id] += n;
      else items[id] = "besitz";
      jeHatte[id] = true;
      if (!erhalten.includes(id)) erhalten.push(id);
    };
    const nehmen = id => {
      const it = itemCfg(config, id);
      if (!it) return;
      if (it.stapel) anzahl[id] = Math.max(0, anzahl[id] - 1);
      else if (items[id] === "besitz") items[id] = "verloren";
    };
    (config.startitems || []).forEach(id => geben(id));

    config.quests.forEach(q => {
      const erlaubt = q.typ === "lauf" ? STATUS_LAUF : STATUS;
      const status = erlaubt.includes(doc.quests[q.id]) ? doc.quests[q.id] : "offen";
      quests[q.id] = status;
      if (q.typ !== "lauf") {
        if (status === "bestanden") bestanden++;
        if (status === "verloren") verloren++;
      }
      if (status === "bestanden" && q.win) {
        packs += q.win.packs || 0;
        (q.win.items || []).forEach(id => geben(id));
        if (q.win.ziffer) ziffern[q.win.ziffer - 1] = config.code[q.win.ziffer - 1];
      } else if (status === "verloren" && q.lose) {
        packs += q.lose.packs || 0;
        (q.lose.items || []).forEach(nehmen);
      }
      if (q.zaehler) {
        const n = status === "offen" ? 0 : Math.max(0, Math.min(q.zaehler.max || 99, Math.floor(Number(doc.zaehler[q.id]) || 0)));
        treffer[q.id] = n;
        const pro = q.zaehler.proTreffer || {};
        packs += n * (pro.packs || 0);
        if (n) (pro.items || []).forEach(id => geben(id, n));
      }
      if (q.schritte) {
        const s = obj(doc.schritte[q.id]);
        schritte[q.id] = {};
        q.schritte.forEach(x => { schritte[q.id][x.id] = status !== "offen" && !!s[x.id]; });
      }
    });

    doc.buchungen.forEach(b => {
      packs += Number(b.packs) || 0;
      const z = Number(b.ziffer);
      if (z >= 1 && z <= config.code.length) {
        ziffern[z - 1] = config.code[z - 1];
        gekauft[z - 1] = true;
      }
      const m = Math.trunc(Number(b.menge) || 0);
      if (b.item && m > 0) geben(b.item, m);
      if (b.item && m < 0) for (let i = 0; i < -m; i++) nehmen(b.item);
    });

    // Einsätze: Spruchrolle zählt runter, einmalige Fähigkeiten sind danach verbraucht
    doc.einsaetze.forEach(e => {
      const it = itemCfg(config, e.item);
      if (!it) return;
      (eingesetzt[e.quest] = eingesetzt[e.quest] || []).push(e.item);
      if (!it.einmalig) return;
      if (it.stapel) anzahl[e.item] = Math.max(0, anzahl[e.item] - 1);
      else if (items[e.item] === "besitz") items[e.item] = "verbraucht";
    });

    config.items.forEach(it => {
      if (it.stapel) items[it.id] = anzahl[it.id] > 0 ? "besitz" : jeHatte[it.id] ? "verbraucht" : "nicht";
    });

    Object.keys(doc.items).forEach(id => {
      if (!(id in items)) return;
      const s = doc.items[id];
      if (s === "besitz" || s === "verloren" || s === "nicht") {
        items[id] = s;
        const it = itemCfg(config, id);
        if (it.stapel) anzahl[id] = s === "besitz" ? Math.max(1, anzahl[id]) : 0;
        if (s !== "nicht" && !erhalten.includes(id)) erhalten.push(id);
      }
    });

    packs = Math.max(0, Math.min(max, packs));
    const r = reihe(config);
    const nextQuest = r.find(q => quests[q.id] === "offen") || null;
    const duelle = {};
    Object.keys(doc.duelle).forEach(k => { if (doc.duelle[k] === "sieg" || doc.duelle[k] === "niederlage") duelle[k] = doc.duelle[k]; });

    return {
      packs, max, items, anzahl, erhalten: erhalten.filter(id => items[id] !== "nicht"),
      ziffern, gekauft, quests, treffer, schritte, eingesetzt, duelle,
      next: nextQuest ? nextQuest.id : null,
      laufend: config.quests.filter(q => q.typ === "lauf" && quests[q.id] !== "offen").map(q => q.id),
      zaehler: { bestanden, verloren, erledigt: bestanden + verloren, gesamt: r.length },
      stand: doc.stand
    };
  }

  // Die drei Duelle im Showdown: zuerst verlorene Spiele vom Tag (Revanche), aufgefüllt mit dem Füllspiel
  function showdownDuelle(config, state) {
    const sd = config.quests.find(q => q.showdown);
    if (!sd) return [];
    const n = sd.showdown.duelle || 3;
    const revanchen = reihe(config).filter(q => q.revanche && q.id !== sd.id && state.quests[q.id] === "verloren");
    const out = revanchen.slice(0, n).map(q => ({ quest: q.id, art: "revanche" }));
    while (out.length < n) out.push({ quest: sd.showdown.auffuellen, art: "auffuellen" });
    return out.map((d, i) => ({ ...d, nr: i + 1, ergebnis: state.duelle[String(i + 1)] || null }));
  }

  // Was ist bei dieser Quest einsetzbar? Im Showdown kommt dazu, was bei den Spielen der Duelle hilft.
  function einsetzbar(config, state, questId) {
    const q = config.quests.find(x => x.id === questId);
    if (!q) return [];
    const ids = [...(q.einsetzbar || [])];
    if (q.showdown) showdownDuelle(config, state).forEach(d => {
      const dq = config.quests.find(x => x.id === d.quest);
      (dq && dq.einsetzbar || []).forEach(id => { if (!ids.includes(id)) ids.push(id); });
    });
    return config.items.map(i => i.id).filter(id => ids.includes(id));
  }

  // Wo Dennis gerade steht: die nächste Quest und alle, die gerade laufen
  function aktuelleQuests(config, state) {
    const ids = state.next ? [state.next] : [];
    state.laufend.forEach(id => { if (state.quests[id] === "laeuft") ids.push(id); });
    return ids;
  }

  // Items, die Dennis jetzt besitzt und bei einer aktuellen Quest einsetzen kann
  function jetztEinsetzbar(config, state) {
    const set = new Set();
    aktuelleQuests(config, state).forEach(qid => einsetzbar(config, state, qid).forEach(id => { if (state.items[id] === "besitz") set.add(id); }));
    return set;
  }

  // Kurztext der Effekte einer Quest, für den Admin
  function effektText(config, effekt, gewonnen) {
    const teile = [];
    if (!effekt) return "nichts";
    if (effekt.packs) teile.push((effekt.packs > 0 ? "+" : "−") + Math.abs(effekt.packs) + " " + config.waehrung.name);
    if (gewonnen && effekt.ziffer) teile.push("Ziffer " + effekt.ziffer);
    (effekt.items || []).forEach(id => {
      const it = itemCfg(config, id);
      teile.push((it ? it.name : id) + (gewonnen ? "" : " weg"));
    });
    return teile.length ? teile.join(", ") : "nichts";
  }

  const api = { derive, emptyDoc, normalize, effektText, showdownDuelle, einsetzbar, aktuelleQuests, jetztEinsetzbar, STATUS, STATUS_LAUF };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.QuestEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
