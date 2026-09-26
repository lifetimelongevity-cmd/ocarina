/* Dennis Quest · Weg
   Rechnet mit dem echten Weg aus config.karte.weg ([Breite, Länge, Höhe], Bahnhof Tegernsee bis Berggasthof).
   Reine Funktionen, kein DOM, kein Netz.

   const W = QuestWeg.aufbauen(config.karte)
     W.laenge               Meter vom Start bis zum Ende des Wegs
     W.station[id]          { s, hoehe } für jede Station mit gps (s = Meter ab Start)
     W.hoeheBei(s)          Höhe in m an der Stelle s
     W.projizieren(lat,lon) { s, abstand }: nächste Stelle am Weg und wie weit daneben (m)
     W.luftlinie(lat,lon)   Meter bis zum Start des Wegs
     W.ziel                 { id, s, hoehe } der höchste Punkt (Gipfel) */
(function (root) {
  const R = 6371000, rad = x => x * Math.PI / 180;

  function aufbauen(karte) {
    const weg = (karte && karte.weg) || [];
    if (weg.length < 2) return null;
    const lat0 = rad(weg[0][0]);
    // Ebene Näherung in Metern, für ein paar Kilometer genau genug
    const xy = (lat, lon) => [rad(lon) * R * Math.cos(lat0), rad(lat) * R];
    const pts = weg.map(p => xy(p[0], p[1]));
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const laenge = cum[cum.length - 1];

    function projizieren(lat, lon) {
      const q = xy(lat, lon);
      let best = { s: 0, abstand: Infinity };
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1];
        const t = Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
        const d = Math.hypot(q[0] - a[0] - t * dx, q[1] - a[1] - t * dy);
        if (d < best.abstand) best = { s: cum[i] + t * (cum[i + 1] - cum[i]), abstand: d };
      }
      return best;
    }

    function hoeheBei(s) {
      s = Math.max(0, Math.min(laenge, s));
      let i = 0;
      while (i < cum.length - 2 && cum[i + 1] < s) i++;
      const t = (s - cum[i]) / ((cum[i + 1] - cum[i]) || 1);
      return weg[i][2] + (weg[i + 1][2] - weg[i][2]) * t;
    }

    function luftlinie(lat, lon) {
      const a = xy(lat, lon), b = pts[0];
      return Math.hypot(a[0] - b[0], a[1] - b[1]);
    }

    const station = {};
    (karte.stationen || []).forEach(st => {
      if (!st.gps) return;
      const p = projizieren(st.gps[0], st.gps[1]);
      station[st.id] = { s: p.s, hoehe: Math.round(st.hoehe || hoeheBei(p.s)) };
    });
    const ids = Object.keys(station);
    const zielId = ids.reduce((m, id) => (!m || station[id].hoehe > station[m].hoehe ? id : m), null);
    const ziel = zielId ? { id: zielId, ...station[zielId] } : { id: null, s: laenge, hoehe: Math.round(hoeheBei(laenge)) };

    return { laenge, cum, weg, station, ziel, projizieren, hoeheBei, luftlinie };
  }

  const api = { aufbauen };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.QuestWeg = api;
})(typeof window !== "undefined" ? window : globalThis);
