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

  /* Log-Buch: die einzige Stelle, an der Dennis schreibt. Eigener Pfad neben dem Spiel
     (/spiele/<spielId>-logbuch), damit das Speichern im Admin seine Antworten nie überschreibt.
     Jede Antwort wird einzeln geschrieben: { "1": { antwort, zeit }, … }. Ohne Netz bleibt sie im
     Gerät und wird nachgereicht.
     API: const lb = QuestStore.logbuch(config)
          lb.subscribe(fn)     fn(antworten) bei jedem neuen Stand
          lb.besiegeln(nr, text) */
  function logbuch(cfg) {
    const s = cfg.speicher || {};
    const id = (s.spielId || "standard") + "-logbuch";
    const key = "dennis-quest-logbuch:" + id, pendingKey = key + ":pending";
    const subs = [];
    const lesen = k => { try { return JSON.parse(localStorage.getItem(k) || "null") || {}; } catch (_) { return {}; } };
    const schreiben = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
    let remote = lesen(key), pending = lesen(pendingKey);
    const alle = () => ({ ...remote, ...pending });
    const melden = () => subs.forEach(fn => fn(alle()));
    const firebase = s.typ === "firebase" && s.databaseURL;
    const base = firebase ? s.databaseURL.replace(/\/+$/, "") + "/spiele/" + encodeURIComponent(id) : "";

    function uebernehmen(data) {
      const next = obj(data);
      if (JSON.stringify(next) === JSON.stringify(remote)) return;
      remote = next;
      schreiben(key, remote);
      Object.keys(pending).forEach(n => { if (remote[n]) delete pending[n]; });
      schreiben(pendingKey, pending);
      melden();
    }
    const obj = x => {
      if (Array.isArray(x)) { const o = {}; x.forEach((v, i) => { if (v) o[String(i)] = v; }); return o; }
      return x && typeof x === "object" ? x : {};
    };

    let flushing = false;
    async function flush() {
      if (!firebase || flushing) return;
      const offen = Object.keys(pending);
      if (!offen.length) return;
      flushing = true;
      try {
        for (const n of offen) {
          const res = await fetch(base + "/" + encodeURIComponent(n) + ".json", { method: "PUT", body: JSON.stringify(pending[n]) });
          if (!res.ok) throw new Error("HTTP " + res.status);
          remote = { ...remote, [n]: pending[n] };
          delete pending[n];
        }
        schreiben(key, remote); schreiben(pendingKey, pending);
      } catch (_) { /* später noch einmal */ }
      finally { flushing = false; }
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
      besiegeln(nr, text) {
        const eintrag = { antwort: String(text).slice(0, 500), zeit: Date.now() };
        if (firebase) { pending[String(nr)] = eintrag; schreiben(pendingKey, pending); }
        else { remote = { ...remote, [String(nr)]: eintrag }; schreiben(key, remote); }
        melden();
        return flush();
      },
      zuruecksetzen() {                              // nur Admin: alle Antworten löschen
        pending = {}; schreiben(pendingKey, pending);
        remote = {}; schreiben(key, remote); melden();
        if (firebase) return fetch(base + ".json", { method: "DELETE" }).catch(() => {});
        return Promise.resolve();
      }
    };
  }

  root.QuestStore = { create, logbuch };
})(window);
