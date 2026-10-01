/* Dennis Quest · Ruckel-Messer (01.10.)
   Einschalten mit ?messen in der Adresse, das Handy merkt es sich (auch vom Home-Bildschirm), ausschalten mit ?messen=aus.
   Unten links zählt eine kleine Anzeige Bilder pro Sekunde und Ruckler (ein Bild länger als 50 ms). Antippen klappt die
   Liste auf: wann, auf welcher Seite, nach welchem Tippen, wie lange und, wo der Browser es verrät, welche Funktion.
   Die letzten 40 Ruckler bleiben im Gerät gespeichert, LEEREN löscht sie. Ändert nichts am Spiel. */
(function () {
  const LOG_KEY = "dq-messen-log";
  const GRENZE = 50;
  let log = [];
  try { log = JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); } catch (_) {}
  const merken = () => { try { localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(-40))); } catch (_) {} };

  const box = document.createElement("div");
  box.id = "messer";
  box.setAttribute("aria-hidden", "true");
  box.style.cssText = "position:fixed;left:max(6px,env(safe-area-inset-left));bottom:6px;z-index:9999;max-width:min(92vw,560px);"
    + "font:600 11px/1.35 ui-monospace,Menlo,Consolas,monospace;color:#e8ffe0;background:rgba(0,0,0,.78);border:1px solid #6c8;"
    + "border-radius:6px;padding:4px 7px;pointer-events:auto;user-select:none;-webkit-user-select:none;";
  box.innerHTML = '<div id="messerKopf"></div><div id="messerListe" hidden style="max-height:52vh;overflow:auto;margin-top:4px;'
    + 'border-top:1px solid #6c8;padding-top:3px;white-space:pre-wrap"></div>';
  document.body.appendChild(box);
  const kopf = box.querySelector("#messerKopf"), liste = box.querySelector("#messerListe");

  // Wo ist Dennis gerade? Offene Fenster gehen vor der Seite
  const ort = () => {
    const offen = id => { const e = document.getElementById(id); return e && !e.hidden; };
    if (offen("introScreen")) return "START";
    if (offen("abspann")) return "ABSPANN";
    if (offen("prolog")) return "PROLOG";
    if (offen("logbuch")) return "TAGEBUCH";
    if (offen("fluchSzene")) return "FLUCH";
    if (offen("schwur")) return "SIEGEL";
    if (offen("overlay")) return "FENSTER";
    if (offen("coach")) return "RUNDGANG";
    const f = document.querySelector(".face.active");
    return f ? ["KARTE", "QUESTS", "AUSRÜSTUNG"][+f.dataset.page] || "?" : "?";
  };
  // Was zuletzt angetippt wurde, kurz beschrieben
  let getippt = "", getipptZeit = 0;
  document.addEventListener("pointerdown", e => {
    if (box.contains(e.target)) return;
    const el = e.target.closest("button, [data-id], [data-station], .q-row, .slot, .mark, .shoulder, a") || e.target;
    const text = (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 28);
    getippt = text || el.className && String(el.className.baseVal ?? el.className).split(" ")[0] || el.tagName.toLowerCase();
    getipptZeit = performance.now();
  }, true);

  function eintragen(ms, ursache) {
    const t = new Date();
    const vorher = performance.now() - getipptZeit < 3000 && getippt ? getippt : "";
    log.push({ z: t.toTimeString().slice(0, 8), ms: Math.round(ms), ort: ort(), nach: vorher, u: ursache || "" });
    if (log.length > 40) log = log.slice(-40);
    merken();
    if (!liste.hidden) zeigeListe();
  }

  // Bildabstände messen (nur bei sichtbarer Seite: im Hintergrund pausiert der Browser absichtlich)
  let letztes = 0, bilder = [];
  const minute = [];
  function schritt(t) {
    if (letztes && !document.hidden) {
      const d = t - letztes;
      bilder.push(t);
      if (d > GRENZE) {
        minute.push(t);
        // Hat der Browser kein langes Bild gemeldet, lag es nicht am Skript: Grafik oder System (wie beim alten 3D-Blättern)
        const von = t - d;
        if (!loaf) eintragen(d);
        else setTimeout(() => { if (!lange.some(e => e.start < t && e.ende > von)) eintragen(d, "Grafik oder System, nicht das Skript"); }, 200);
      }
    }
    letztes = t;
    requestAnimationFrame(schritt);
  }
  document.addEventListener("visibilitychange", () => { letztes = 0; });
  requestAnimationFrame(schritt);

  // Wo der Browser es kann (Chrome auf Android), sagt er, welche Funktion das Bild aufgehalten hat
  let loaf = false;
  const lange = [];                              // zuletzt gemeldete lange Bilder (Start und Ende)
  try {
    if (PerformanceObserver.supportedEntryTypes.includes("long-animation-frame")) {
      loaf = true;
      new PerformanceObserver(l => l.getEntries().forEach(e => {
        if (e.duration <= GRENZE) return;
        lange.push({ start: e.startTime, ende: e.startTime + e.duration });
        if (lange.length > 20) lange.shift();
        const ende = e.startTime + e.duration;
        const s = (e.scripts || []).slice().sort((a, b) => b.duration - a.duration)[0];
        const layout = e.styleAndLayoutStart ? Math.round(ende - e.styleAndLayoutStart) : 0;
        const u = (s ? `${s.sourceFunctionName || s.invoker || "Skript"} ${(s.sourceURL || "").split("/").pop()}:${s.sourceCharPosition ?? ""} ${Math.round(s.duration)} ms` : "kein Skript")
          + (layout ? `, Stil und Layout ${layout} ms` : "");
        eintragen(e.duration, u);
      })).observe({ type: "long-animation-frame", buffered: false });
    }
  } catch (_) { loaf = false; }

  function zeigeKopf() {
    const jetzt = performance.now();
    bilder = bilder.filter(t => jetzt - t < 1000);
    while (minute.length && jetzt - minute[0] > 60000) minute.shift();
    const schlimm = log.length ? Math.max(...log.slice(-10).map(x => x.ms)) : 0;
    const fps = document.hidden ? "–" : bilder.length;
    const farbe = minute.length ? (minute.length > 5 ? "#ff8a80" : "#ffd27a") : "#9f9";
    kopf.innerHTML = `<span style="color:${farbe}">●</span> ${fps} B/s · Ruckler ${minute.length}/min · ${ort()}`
      + (schlimm ? ` · max ${schlimm} ms` : "") + (liste.hidden ? " ▸" : " ▾");
  }
  function zeigeListe() {
    liste.textContent = log.length ? log.slice().reverse().map(x =>
      `${x.z}  ${String(x.ms).padStart(4)} ms  ${x.ort}${x.nach ? `  nach „${x.nach}“` : ""}${x.u ? `\n          ${x.u}` : ""}`).join("\n") : "Noch keine Ruckler.";
    if (!liste.querySelector("button")) {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = "LEEREN";
      b.style.cssText = "display:block;margin-top:5px;font:inherit;color:#000;background:#9f9;border:0;border-radius:3px;padding:2px 8px";
      b.addEventListener("click", e => { e.stopPropagation(); log = []; merken(); zeigeListe(); });
      liste.appendChild(b);
    }
  }
  box.addEventListener("click", e => { e.stopPropagation(); liste.hidden = !liste.hidden; if (!liste.hidden) zeigeListe(); zeigeKopf(); });
  setInterval(zeigeKopf, 500);
  zeigeKopf();
})();
