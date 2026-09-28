/* Dennis Quest · Logik v1
   Zustand = derive(Konfiguration, gespeichertes Dokument). Reine Funktion, kein DOM, kein Netz.

   Das Dokument enthält nur, was der Quest Master einstellt:
   {
     quests:    { [questId]: "bestanden" | "verloren" | "laeuft" | "beendet" }   // fehlt = offen
     glanz:     { [questId]: true }                   // Glanzsieg: bestanden und besonders deutlich (nur Quests mit glanz)
     zaehler:   { [questId]: Zahl }                   // Treffer einer Zähler-Quest (Prophezeiung)
     schritte:  { [questId]: { [schrittId]: true } }  // Zwischenschritte einer laufenden Quest (Amulett gefunden)
     einsaetze: [ { id, item, quest } ]               // Dennis hat ein Item oder eine Fähigkeit eingesetzt
     duelle:    { "1": "sieg" | "niederlage", ... }    // Ergebnisse der Showdown-Duelle
     buchungen: [ { id, packs, grund, zeit?, ziffer?, item?, menge? } ]   // ziffer = gekauft, item/menge = Spruchrolle o. Ä.
     items:     { [itemId]: "besitz" | "verloren" | "nicht" }      // manuelle Korrektur, schlägt die Regel
     zeiten:    { [questId]: Zeitstempel }             // wann die Quest entschieden wurde (für die Reihenfolge der Packs)
     stand:     Zeitstempel der letzten Änderung
   }

   Packs zählen Schritt für Schritt in der Reihenfolge, in der sie passiert sind (zeiten, buchung.zeit),
   und bleiben dabei immer zwischen 0 und max: Wer bei 0 verliert, verliert nichts, was über den Deckel geht, verfällt.
   Ohne Zeit (ältere Stände, Demo) gilt die Reihenfolge der Konfiguration, danach die Buchungen. */
(function (root) {
  const STATUS = ["offen", "bestanden", "verloren"];
  const STATUS_LAUF = ["offen", "laeuft", "bestanden", "verloren", "beendet"];

  const obj = x => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
  const list = x => (Array.isArray(x) ? x.filter(Boolean) : x && typeof x === "object" ? Object.values(x).filter(Boolean) : []);

  function emptyDoc() {
    return { quests: {}, glanz: {}, zaehler: {}, schritte: {}, einsaetze: [], duelle: {}, buchungen: [], items: {}, zeiten: {}, stand: 0 };
  }

  function normalize(doc) {
    const d = obj(doc);
    // Firebase liefert Listen mit Lücken als Objekt, Duelle als Liste: beides glätten
    const duelle = {};
    if (Array.isArray(d.duelle)) d.duelle.forEach((v, i) => { if (v) duelle[String(i)] = v; });
    else Object.assign(duelle, obj(d.duelle));
    return {
      quests: obj(d.quests),
      glanz: obj(d.glanz),
      zaehler: obj(d.zaehler),
      schritte: obj(d.schritte),
      einsaetze: list(d.einsaetze),
      duelle,
      buchungen: list(d.buchungen),
      items: obj(d.items),
      zeiten: obj(d.zeiten),
      stand: Number(d.stand) || 0
    };
  }

  const reihe = config => config.quests.filter(q => q.typ !== "lauf");
  const itemCfg = (config, id) => config.items.find(i => i.id === id);

  function derive(config, rawDoc) {
    const doc = normalize(rawDoc);
    const max = config.waehrung.max;
    const schrittePacks = [];                   // { t, seq, packs }: jede Änderung der Packs mit ihrem Zeitpunkt
    const items = {}, anzahl = {}, jeHatte = {};
    const erhalten = [];                        // Reihenfolge, in der Items ins Inventar kamen
    const ziffern = config.code.map(() => null);
    const gekauft = config.code.map(() => false);
    const quests = {}, glanz = {}, treffer = {}, schritte = {}, eingesetzt = {};
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

    config.quests.forEach((q, i) => {
      const erlaubt = q.typ === "lauf" ? STATUS_LAUF : STATUS;
      const status = erlaubt.includes(doc.quests[q.id]) ? doc.quests[q.id] : "offen";
      quests[q.id] = status;
      if (q.typ !== "lauf") {
        if (status === "bestanden") bestanden++;
        if (status === "verloren") verloren++;
      }
      let dp = 0;
      if (status === "bestanden" && q.win) {
        dp += q.win.packs || 0;
        (q.win.items || []).forEach(id => geben(id));
        if (q.win.ziffer) ziffern[q.win.ziffer - 1] = config.code[q.win.ziffer - 1];
        if (q.glanz && doc.glanz[q.id]) {         // Glanzsieg: zusätzlich zum Sieg
          glanz[q.id] = true;
          dp += q.glanz.packs || 0;
          (q.glanz.items || []).forEach(id => geben(id));
        }
      } else if (status === "verloren" && q.lose) {
        dp += q.lose.packs || 0;
        (q.lose.items || []).forEach(nehmen);
      }
      if (q.zaehler) {
        const n = status === "offen" ? 0 : Math.max(0, Math.min(q.zaehler.max || 99, Math.floor(Number(doc.zaehler[q.id]) || 0)));
        treffer[q.id] = n;
        const pro = q.zaehler.proTreffer || {};
        dp += n * (pro.packs || 0);
        if (n) (pro.items || []).forEach(id => geben(id, n));
      }
      if (dp) schrittePacks.push({ t: Number(doc.zeiten[q.id]) || 0, seq: i, packs: dp });
      if (q.schritte) {
        const s = obj(doc.schritte[q.id]);
        schritte[q.id] = {};
        q.schritte.forEach(x => { schritte[q.id][x.id] = status !== "offen" && !!s[x.id]; });
      }
    });

    doc.buchungen.forEach((b, i) => {
      if (Number(b.packs)) schrittePacks.push({ t: Number(b.zeit) || 0, seq: config.quests.length + i, packs: Number(b.packs) });
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

    // Packs in zeitlicher Reihenfolge, nach jedem Schritt zwischen 0 und max
    let packs = Math.max(0, Math.min(max, config.waehrung.start || 0));
    const kappung = { unten: 0, oben: 0 };      // was bei 0 nicht mehr abgezogen wurde, was über den Deckel verfallen ist
    schrittePacks.sort((a, b) => a.t - b.t || a.seq - b.seq).forEach(x => {
      const roh = packs + x.packs;
      if (roh < 0) kappung.unten -= roh;
      if (roh > max) kappung.oben += roh - max;
      packs = Math.max(0, Math.min(max, roh));
    });
    const r = reihe(config);
    const nextQuest = r.find(q => quests[q.id] === "offen") || null;
    const duelle = {};
    Object.keys(doc.duelle).forEach(k => { if (doc.duelle[k] === "sieg" || doc.duelle[k] === "niederlage") duelle[k] = doc.duelle[k]; });

    return {
      packs, max, kappung, items, anzahl, erhalten: erhalten.filter(id => items[id] !== "nicht"),
      ziffern, gekauft, quests, glanz, treffer, schritte, eingesetzt, duelle,
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
    return config.items.map(i => i.id).filter(id => ids.includes(id) && !abgeloest(config, state, id));
  }

  // Hat Dennis ein stärkeres Item, das dieses ablöst (ersetzt)? Dann das stärkste davon, sonst null.
  function abgeloest(config, state, id) {
    const neu = config.items.filter(i => (i.ersetzt || []).includes(id) && state.items[i.id] === "besitz");
    return neu.length ? neu[neu.length - 1].id : null;
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

  /* Dennis' Einträge (store.js, Kanal „dennis") in das Dokument des Admins einrechnen. Ergibt ein Dokument wie vom Admin,
     derive() rechnet damit wie immer. Was der Admin selbst entschieden hat, gilt vor Dennis' Eintrag.
       q_<quest>             { status: "bestanden" | "verloren", glanz?, zeit }   Ergebnis einer Quest (bei laufenden auch nach „läuft"),
                                                                          glanz: true = Glanzsieg (nur Quests mit glanz)
       e_<id>                { item, quest, zeit }                          Einsatz eines Items oder einer Fähigkeit
       d_<nr>                { ergebnis: "sieg" | "niederlage", zeit }      Duell im Showdown
       s_<quest>_<schritt>   { zeit }                                      Schritt einer laufenden Quest (Amulett gefunden)
       z_<nr>                { zeit }                                      Ziffer am Kästchen gegen Packs getauscht
     Eingerechnete Einsätze und Käufe tragen von: "dennis" und ihren Schlüssel als id. */
  const ENTSCHIEDEN = ["bestanden", "verloren", "beendet"];
  function mitEintraegen(config, rawDoc, eintraege) {
    const out = JSON.parse(JSON.stringify(normalize(rawDoc)));
    const ein = obj(eintraege);
    const quest = id => config.quests.find(q => q.id === id);
    Object.keys(ein).sort((a, b) => (Number(obj(ein[a]).zeit) || 0) - (Number(obj(ein[b]).zeit) || 0)).forEach(k => {
      const e = obj(ein[k]), zeit = Number(e.zeit) || 0, i = k.indexOf("_");
      const art = k.slice(0, i), rest = k.slice(i + 1);
      if (art === "q") {
        if (!quest(rest) || !["bestanden", "verloren"].includes(e.status) || ENTSCHIEDEN.includes(out.quests[rest])) return;
        out.quests[rest] = e.status;
        out.zeiten[rest] = zeit;
        if (e.status === "bestanden" && e.glanz === true && quest(rest).glanz) out.glanz[rest] = true;
        else delete out.glanz[rest];
      } else if (art === "e") {
        if (!itemCfg(config, e.item) || !quest(e.quest)) return;
        out.einsaetze.push({ id: k, item: e.item, quest: e.quest, zeit, von: "dennis" });
      } else if (art === "d") {
        if (!["sieg", "niederlage"].includes(e.ergebnis) || out.duelle[rest]) return;
        out.duelle[rest] = e.ergebnis;
      } else if (art === "s") {
        const j = rest.indexOf("_"), qid = rest.slice(0, j), schritt = rest.slice(j + 1), q = quest(qid);
        if (!q || !(q.schritte || []).some(x => x.id === schritt)) return;
        out.schritte[qid] = { ...obj(out.schritte[qid]), [schritt]: true };
      } else if (art === "z") {
        const nr = Math.trunc(Number(rest));
        if (!(nr >= 1 && nr <= config.code.length) || out.buchungen.some(b => Number(b.ziffer) === nr)) return;
        out.buchungen.push({ id: k, packs: -(config.ziffer_preis || 0), grund: `Ziffer ${nr} gekauft`, ziffer: nr, zeit, von: "dennis" });
      }
    });
    return out;
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

  const api = { derive, emptyDoc, normalize, mitEintraegen, effektText, showdownDuelle, einsetzbar, abgeloest, aktuelleQuests, jetztEinsetzbar, STATUS, STATUS_LAUF };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.QuestEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
