/* Dennis Quest · Offline-Speicher für Funklöcher
   Eigene Dateien: erst Netz (damit Änderungen sofort ankommen), ohne Netz aus dem Speicher.
   Bilder, Schriften, Töne: aus dem Speicher, im Hintergrund aufgefrischt.
   Firebase und alles von anderen Adressen läuft am Speicher vorbei. */
const CACHE = "dennis-quest-v1";
const KERN = ["./", "index.html", "styles.css", "app.js", "config.js", "engine.js", "store.js",
  "assets/intro-titel.webp", "assets/intro-fee.png", "assets/hylia-serif.woff2", "assets/alpine-trail.webp", "assets/avatar-okarina.webp"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(KERN)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  const statisch = /\.(webp|png|jpg|woff2|m4a|mp3|ogg|aac)$/i.test(url.pathname);
  if (statisch) {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(req);
      const netz = fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || netz;
    }));
    return;
  }
  e.respondWith(fetch(req).then(res => {
    if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true })));
});
