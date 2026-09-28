/* Dennis Quest · Speicher
   Ein einziges Dokument pro Spiel. Zwei Varianten, gewählt über config.speicher.typ:

   "lokal"    Browser-Speicher. Admin und Spieler im selben Browser (zwei Tabs) sehen sich gegenseitig.
              Zum Bauen und Testen.
   "firebase" Firebase Realtime Database über die REST-Schnittstelle, ohne SDK.
              Lesen live per Server-Sent Events, Schreiben per PUT. Ohne Netz wird lokal gepuffert
              und nachgeschickt, sobald wieder Netz da ist.

   API: const store = QuestStore.create(config, { key })
        store.subscribe(fn)   fn(doc, info) bei jedem neuen Stand, sofort mit dem letzten bekannten Stand
        store.save(doc)       nur Admin
        store.onStatus(fn)    fn({ online, pending, stand })
   Probelauf (?probe): siehe unten, QuestStore.probe(config).
   Dazu die Kanäle, in die Dennis schreibt: QuestStore.logbuch(config) und QuestStore.eintraege(config). */
(function (root) {
  const E = root.QuestEngine;

  function cacheKey(cfg) { return "dennis-quest-doc:" + (cfg.speicher.spielId || "standard"); }
  function readCache(cfg) {
    try { const raw = localStorage.getItem(cacheKey(cfg)); return raw ? JSON.parse(raw) : null; } catch (_) { return null; }
  }
  function writeCache(cfg, doc) {
    try { localStorage.setItem(cacheKey(cfg), JSON.stringify(doc)); } catch (_) {}
  }

  function base(cfg) {
    const subs = [], statusSubs = [];
    const st = { online: true, pending: false, stand: 0 };
    let doc = E.normalize(readCache(cfg) || E.emptyDoc());
    st.stand = doc.stand;
    return {
      get doc() { return doc; },
      set(next, info) {
        doc = E.normalize(next);
        st.stand = doc.stand;
        subs.forEach(fn => fn(doc, info || {}));
        statusSubs.forEach(fn => fn({ ...st }));
      },
      status(patch) { Object.assign(st, patch); statusSubs.forEach(fn => fn({ ...st })); },
      subscribe(fn) { subs.push(fn); fn(doc, { initial: true }); },
      onStatus(fn) { statusSubs.push(fn); fn({ ...st }); }
    };
  }

  function localStore(cfg) {
    const b = base(cfg);
    b.status({ online: true, lokal: true });
    window.addEventListener("storage", e => {
      if (e.key !== cacheKey(cfg)) return;
      try { b.set(e.newValue ? JSON.parse(e.newValue) : E.emptyDoc(), { remote: true }); } catch (_) {}
    });
    return {
      subscribe: b.subscribe, onStatus: b.onStatus,
      save(doc) { const d = { ...doc, stand: Date.now() }; writeCache(cfg, d); b.set(d, { local: true }); return Promise.resolve(); }
    };
  }

  function firebaseStore(cfg, opts) {
    const b = base(cfg);
    const url = cfg.speicher.databaseURL.replace(/\/+$/, "") + "/spiele/" + encodeURIComponent(cfg.speicher.spielId) + ".json";
    const auth = opts && opts.key ? "?auth=" + encodeURIComponent(opts.key) : "";
    const pendingKey = cacheKey(cfg) + ":pending";
    let pending = null;
    try { pending = JSON.parse(localStorage.getItem(pendingKey) || "null"); } catch (_) {}
    b.status({ online: false, pending: !!pending });

    function apply(data) {
      if (pending) return;                           // eigener ungesendeter Stand hat Vorrang
      const next = E.normalize(data || E.emptyDoc());
      if (JSON.stringify(next) === JSON.stringify(b.doc)) return;
      writeCache(cfg, next);
      b.set(next, { remote: true });
    }

    // Lesen, Weg 1: Live-Stream (Server-Sent Events)
    let es, streamOpen = false;
    function connect() {
      try { es && es.close(); } catch (_) {}
      if (typeof EventSource === "undefined") return;
      es = new EventSource(url);
      es.onopen = () => { streamOpen = true; b.status({ online: true }); flush(); };
      es.onerror = () => { streamOpen = false; };
      const onEvent = ev => {
        let msg; try { msg = JSON.parse(ev.data); } catch (_) { return; }
        if (!msg || typeof msg.path !== "string") return;
        if (pending) return;
        let next;
        if (msg.path === "/") next = ev.type === "patch" ? { ...b.doc, ...msg.data } : msg.data;
        else next = setPath(JSON.parse(JSON.stringify(b.doc)), msg.path, msg.data, ev.type === "patch");
        apply(next);
      };
      es.addEventListener("put", onEvent);
      es.addEventListener("patch", onEvent);
    }

    // Schreiben: ganzes Dokument, bei Fehler puffern
    let flushing = false;
    async function flush() {
      if (!pending || flushing) return;
      flushing = true;
      const sending = pending;
      try {
        // Ohne Content-Type-Header: einfacher Request ohne CORS-Vorabfrage, Firebase liest den Body trotzdem als JSON
        const res = await fetch(url + auth, { method: "PUT", body: JSON.stringify(sending) });
        if (!res.ok) throw new Error("HTTP " + res.status);
        if (pending === sending) {                   // nur löschen, wenn in der Zwischenzeit nichts Neues kam
          pending = null;
          try { localStorage.removeItem(pendingKey); } catch (_) {}
        }
        b.status({ online: true, pending: !!pending });
      } catch (err) {
        b.status({ online: false, pending: true, fehler: String(err.message || err) });
      } finally {
        flushing = false;
        if (pending && pending !== sending) flush(); // neuerer Stand wartet: sofort hinterher
      }
    }
    window.addEventListener("online", flush);
    setInterval(flush, 10000);

    // Lesen, Weg 2: Abfrage alle 4 Sekunden, solange der Stream nicht steht (Mobilnetz, Proxys)
    async function poll() {
      if (streamOpen) return;
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        apply(await res.json());
        b.status({ online: true });
        flush();
      } catch (_) { b.status({ online: false }); }
    }
    setInterval(poll, 4000);

    connect();
    poll();
    return {
      subscribe: b.subscribe, onStatus: b.onStatus,
      save(doc) {
        const d = { ...doc, stand: Date.now() };
        pending = d;
        try { localStorage.setItem(pendingKey, JSON.stringify(d)); } catch (_) {}
        writeCache(cfg, d);
        b.set(d, { local: true });
        b.status({ pending: true });
        return flush();
      }
    };
  }

  function setPath(obj, path, value, merge) {
    const parts = path.split("/").filter(Boolean);
    let o = obj;
    for (let i = 0; i < parts.length - 1; i++) { o[parts[i]] = o[parts[i]] && typeof o[parts[i]] === "object" ? o[parts[i]] : {}; o = o[parts[i]]; }
    const last = parts[parts.length - 1];
    if (value === null) delete o[last];
    else o[last] = merge && o[last] && typeof o[last] === "object" ? { ...o[last], ...value } : value;
    return obj;
  }

  function create(cfg, opts) {
    const s = cfg.speicher || {};
    if (s.typ === "firebase" && s.databaseURL) return firebaseStore(cfg, opts);
    return localStore(cfg);
  }

  /* Kanäle, in die Dennis schreibt: eigene Pfade neben dem Spiel (/spiele/<spielId>-<name>), damit das Speichern
     im Admin sie nie überschreibt. Jeder Eintrag wird einzeln unter seinem Schlüssel geschrieben ({ schluessel: eintrag }).
     Ohne Netz bleibt er im Gerät und wird nachgereicht. Der Admin liest mit und kann einzelne Einträge löschen.
     API: const k = kanal(config, name, speicherName)
          k.subscribe(fn)          fn(eintraege) bei jedem neuen Stand
          k.setzen(schluessel, e)  schreiben (Dennis, oder der Admin beim Wiederherstellen)
          k.loeschen(schluessel)   nur Admin: einen Eintrag löschen (Promise, scheitert ohne Netz)
          k.zuruecksetzen()        nur Admin: alle Einträge löschen (Promise, scheitert ohne Netz) */
  function kanal(cfg, name, speicherName) {
    const s = cfg.speicher || {};
    const id = (s.spielId || "standard") + "-" + name;
    const key = "dennis-quest-" + speicherName + ":" + id, pendingKey = key + ":pending";
    const subs = [];
    const lesen = k => { try { return JSON.parse(localStorage.getItem(k) || "null") || {}; } catch (_) { return {}; } };
    const schreiben = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
    let remote = lesen(key), pending = lesen(pendingKey);
    const alle = () => ({ ...remote, ...pending });
    const melden = () => subs.forEach(fn => fn(alle()));
    const firebase = s.typ === "firebase" && s.databaseURL;
    const base = firebase ? s.databaseURL.replace(/\/+$/, "") + "/spiele/" + encodeURIComponent(id) : "";
    const obj = x => {
      if (Array.isArray(x)) { const o = {}; x.forEach((v, i) => { if (v) o[String(i)] = v; }); return o; }
      return x && typeof x === "object" ? x : {};
    };
    // Vergleich ohne Rücksicht auf die Reihenfolge der Schlüssel (Firebase liefert sie sortiert zurück)
    const kanon = x => JSON.stringify(x, (k, v) => v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(y => [y, v[y]])) : v);
    const gleich = (a, b) => kanon(a) === kanon(b);

    function uebernehmen(data) {
      const next = obj(data);
      if (gleich(next, remote)) return;
      remote = next;
      schreiben(key, remote);
      // Angekommen ist ein Eintrag, wenn der Server genau ihn hat (gleiche Zeit)
      Object.keys(pending).forEach(n => { if (remote[n] && gleich(remote[n], pending[n])) delete pending[n]; });
      schreiben(pendingKey, pending);
      melden();
    }

    let flushing = false;
    async function flush() {
      if (!firebase || flushing) return;
      const offen = Object.keys(pending);
      if (!offen.length) return;
      flushing = true;
      let weiter = false;
      try {
        for (const n of offen) {
          const e = pending[n];
          const res = await fetch(base + "/" + encodeURIComponent(n) + ".json", { method: "PUT", body: JSON.stringify(e) });
          if (!res.ok) throw new Error("HTTP " + res.status);
          remote = { ...remote, [n]: e };
          if (gleich(pending[n], e)) delete pending[n];
        }
        schreiben(key, remote); schreiben(pendingKey, pending);
        weiter = Object.keys(pending).length > 0;      // während des Sendens kam mehr dazu (Rückgängig schreibt viele auf einmal)
      } catch (_) { /* später noch einmal */ }
      finally { flushing = false; }
      if (weiter) flush();
    }

    if (firebase) {
      let streamOpen = false;
      if (typeof EventSource !== "undefined") {
        const es = new EventSource(base + ".json");
        es.onopen = () => { streamOpen = true; flush(); };
        es.onerror = () => { streamOpen = false; };
        const onEvent = ev => {
          let msg; try { msg = JSON.parse(ev.data); } catch (_) { return; }
          if (!msg || typeof msg.path !== "string") return;
          let next;
          if (msg.path === "/") next = ev.type === "patch" ? { ...remote, ...obj(msg.data) } : msg.data;
          else next = setPath(JSON.parse(JSON.stringify(remote)), msg.path, msg.data, ev.type === "patch");
          uebernehmen(next);
        };
        es.addEventListener("put", onEvent);
        es.addEventListener("patch", onEvent);
      }
      const poll = async () => {
        if (streamOpen) return;
        try { const res = await fetch(base + ".json", { cache: "no-store" }); if (res.ok) { uebernehmen(await res.json()); flush(); } } catch (_) {}
      };
      setInterval(poll, 5000); poll();
      setInterval(flush, 8000);
      window.addEventListener("online", flush);
    } else {
      window.addEventListener("storage", e => { if (e.key === key) { remote = lesen(key); melden(); } });
    }

    return {
      subscribe(fn) { subs.push(fn); fn(alle()); },
      setzen(n, eintrag) {
        n = String(n);
        if (firebase) { pending[n] = eintrag; schreiben(pendingKey, pending); }
        else { remote = { ...remote, [n]: eintrag }; schreiben(key, remote); }
        melden();
        return flush();
      },
      loeschen(n) {
        n = String(n);
        if (!firebase) { const r = { ...remote }; delete r[n]; delete pending[n]; remote = r; schreiben(key, remote); schreiben(pendingKey, pending); melden(); return Promise.resolve(); }
        return fetch(base + "/" + encodeURIComponent(n) + ".json", { method: "DELETE" }).then(res => {
          if (!res.ok) throw new Error("HTTP " + res.status);
          const r = { ...remote }; delete r[n]; delete pending[n]; remote = r;
          schreiben(key, remote); schreiben(pendingKey, pending); melden();
        });
      },
      zuruecksetzen() {
        pending = {}; schreiben(pendingKey, pending);
        remote = {}; schreiben(key, remote); melden();
        if (firebase) return fetch(base + ".json", { method: "DELETE" }).then(res => { if (!res.ok) throw new Error("HTTP " + res.status); });
        return Promise.resolve();
      }
    };
  }

  /* Log-Buch: Dennis' Antworten, { "1": { antwort, zeit }, … }
     API: const lb = QuestStore.logbuch(config), lb.subscribe(fn), lb.besiegeln(nr, text), lb.zuruecksetzen(), lb.setzen(nr, e) (Rückgängig im Admin) */
  function logbuch(cfg) {
    const k = kanal(cfg, "logbuch", "logbuch");
    return {
      subscribe: k.subscribe, zuruecksetzen: k.zuruecksetzen, setzen: k.setzen,
      besiegeln(nr, text) { return k.setzen(String(nr), { antwort: String(text).slice(0, 500), zeit: Date.now() }); }
    };
  }

  /* Dennis' Einträge: was er selbst besiegelt (Ergebnis, Einsatz, Duell, Amulett, Ziffer). engine.js führt sie mit dem
     Dokument des Admins zusammen (mitEintraegen). Schlüssel: q_<quest>, e_<id>, d_<nr>, s_<quest>_<schritt>, z_<nr>.
     API: const ein = QuestStore.eintraege(config), ein.subscribe(fn), ein.setzen(schluessel, e), ein.loeschen(schluessel) */
  function eintraege(cfg) { return kanal(cfg, "dennis", "eintraege"); }

  /* Probelauf: ?probe in der Adresse (Admin und Dennis). Ein eigenes Spiel neben dem echten
     (<spielId>-probe, Log-Buch <spielId>-probe-logbuch), gleiche Regeln, das echte Spiel bleibt unberührt.
     const C = QuestStore.probe(GAME_CONFIG) */
  const PROBE = new URLSearchParams(location.search).has("probe");
  function probe(cfg) {
    return PROBE ? { ...cfg, speicher: { ...cfg.speicher, spielId: (cfg.speicher.spielId || "standard") + "-probe" } } : cfg;
  }

  root.QuestStore = { create, logbuch, eintraege, probe, PROBE };
})(window);
