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
        store.onStatus(fn)    fn({ online, pending, stand }) */
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

  root.QuestStore = { create };
})(window);
