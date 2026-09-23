/* Dennis Quest · Logik v0
   Zustand = derive(Konfiguration, gespeichertes Dokument). Reine Funktion, kein DOM, kein Netz.

   Das Dokument enthält nur, was der Quest Master einstellt:
   {
     quests:    { [questId]: "bestanden" | "verloren" }        // fehlt = offen
     buchungen: [ { id, packs, grund, ziffer? } ]              // ziffer = diese Ziffer wurde gekauft
     items:     { [itemId]: "besitz" | "verloren" | "nicht" }  // manuelle Korrektur, schlägt die Regel
     stand:     Zeitstempel der letzten Änderung
   } */
(function (root) {
  const STATUS = ["offen", "bestanden", "verloren"];

  function emptyDoc() {
    return { quests: {}, buchungen: [], items: {}, stand: 0 };
  }

  function normalize(doc) {
    const d = doc && typeof doc === "object" ? doc : {};
    return {
      quests: d.quests && typeof d.quests === "object" ? d.quests : {},
      buchungen: Array.isArray(d.buchungen) ? d.buchungen.filter(Boolean) : (d.buchungen && typeof d.buchungen === "object" ? Object.values(d.buchungen) : []),
      items: d.items && typeof d.items === "object" ? d.items : {},
      stand: Number(d.stand) || 0
    };
  }

  function derive(config, rawDoc) {
    const doc = normalize(rawDoc);
    const max = config.waehrung.max;
    let packs = config.waehrung.start || 0;
    const items = {};
    const erhalten = [];                       // Reihenfolge, in der Items ins Inventar kamen
    const ziffern = config.code.map(() => null);
    const gekauft = config.code.map(() => false);
    const quests = {};
    let bestanden = 0, verloren = 0;

    config.items.forEach(it => { items[it.id] = "nicht"; });
    (config.startitems || []).forEach(id => { items[id] = "besitz"; erhalten.push(id); });

    config.quests.forEach(q => {
      const status = STATUS.includes(doc.quests[q.id]) ? doc.quests[q.id] : "offen";
      quests[q.id] = status;
      if (status === "bestanden") {
        bestanden++;
        packs += q.win.packs || 0;
        (q.win.items || []).forEach(id => {
          items[id] = "besitz";
          if (!erhalten.includes(id)) erhalten.push(id);
        });
        if (q.win.ziffer) ziffern[q.win.ziffer - 1] = config.code[q.win.ziffer - 1];
      } else if (status === "verloren") {
        verloren++;
        packs += q.lose.packs || 0;
        (q.lose.items || []).forEach(id => { if (items[id] === "besitz") items[id] = "verloren"; });
      }
    });

    doc.buchungen.forEach(b => {
      packs += Number(b.packs) || 0;
      const z = Number(b.ziffer);
      if (z >= 1 && z <= config.code.length) {
        ziffern[z - 1] = config.code[z - 1];
        gekauft[z - 1] = true;
      }
    });

    Object.keys(doc.items).forEach(id => {
      if (!(id in items)) return;
      const s = doc.items[id];
      if (s === "besitz" || s === "verloren" || s === "nicht") {
        items[id] = s;
        if (s !== "nicht" && !erhalten.includes(id)) erhalten.push(id);
      }
    });

    packs = Math.max(0, Math.min(max, packs));
    const nextQuest = config.quests.find(q => quests[q.id] === "offen") || null;

    return {
      packs, max, items, erhalten: erhalten.filter(id => items[id] !== "nicht"),
      ziffern, gekauft, quests,
      next: nextQuest ? nextQuest.id : null,
      zaehler: { bestanden, verloren, erledigt: bestanden + verloren, gesamt: config.quests.length },
      stand: doc.stand
    };
  }

  // Kurztext der Effekte einer Quest, für Admin und Beschreibung
  function effektText(config, effekt, gewonnen) {
    const teile = [];
    if (effekt.packs) teile.push((effekt.packs > 0 ? "+" : "−") + Math.abs(effekt.packs) + " " + config.waehrung.name);
    if (gewonnen && effekt.ziffer) teile.push("Ziffer " + effekt.ziffer);
    (effekt.items || []).forEach(id => {
      const it = config.items.find(i => i.id === id);
      teile.push((it ? it.name : id) + (gewonnen ? "" : " weg"));
    });
    return teile.length ? teile.join(", ") : "nichts";
  }

  const api = { derive, emptyDoc, normalize, effektText, STATUS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.QuestEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
