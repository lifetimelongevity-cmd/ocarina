// Live-Verbindung mit Wächter (30.09.): Schläft der Stream still ein, verbindet die App nach 40 s ohne Lebenszeichen neu.
// Wird sie wieder sichtbar (Handy entsperrt) oder ist das Netz zurück, verbindet sie sofort neu.
// Ohne Browser: store.js läuft in Node mit nachgemachter EventSource, fetch und Uhr.
// Aufruf: node tests/verbindung.mjs
import fs from 'fs';
import vm from 'vm';
import { fileURLToPath } from 'url';

const APP = fileURLToPath(new URL('../app/', import.meta.url));
const ok = [], fehler = [];
const pruefe = (bed, text) => (bed ? ok : fehler).push(text);

// Uhr und Timer von Hand
let jetzt = 1_000_000;
const timer = [];
const setIntervalF = (fn, ms) => { timer.push({ fn, ms, next: jetzt + ms }); return timer.length; };
const setTimeoutF = (fn, ms) => { timer.push({ fn, ms, next: jetzt + ms, einmal: true }); return timer.length; };
async function spule(ms) {
  const ende = jetzt + ms;
  for (;;) {
    const t = timer.filter(x => !x.weg).sort((a, b) => a.next - b.next)[0];
    if (!t || t.next > ende) break;
    jetzt = t.next;
    if (t.einmal) t.weg = true; else t.next += t.ms;
    t.fn();
    await new Promise(r => setImmediate(r));
  }
  jetzt = ende;
  await new Promise(r => setImmediate(r));
}

// Nachgemachte EventSource: merkt sich alle Verbindungen, der Test schickt Meldungen hinein
const quellen = [];
class FakeES {
  constructor(url) { this.url = url; this.zu = false; this.hoerer = {}; quellen.push(this); }
  addEventListener(typ, fn) { (this.hoerer[typ] ||= []).push(fn); }
  close() { this.zu = true; }
  oeffnen() { this.onopen && this.onopen(); }
  melde(typ, data) { if (!this.zu) (this.hoerer[typ] || []).forEach(fn => fn({ type: typ, data: JSON.stringify(data) })); }
}
const aktiv = () => quellen.filter(q => !q.zu);

// Server-Stand und fetch
let server = { quests: {}, frei: {}, stand: 1 };
let abfragen = 0;
// haengt: Schreiben bleibt hängen wie auf dem Handy nach dem Entsperren (kein Fehler, keine Antwort), bis abgebrochen wird
let haengt = false, haengend = 0;
const geschrieben = [];
const fetchF = async (url, opt = {}) => {
  if ((opt.method || 'GET') === 'GET') { abfragen++; return { ok: true, json: async () => url.includes('-dennis') ? {} : JSON.parse(JSON.stringify(server)) }; }
  if (haengt) { haengend++; return new Promise((_, nein) => opt.signal && opt.signal.addEventListener('abort', () => nein(new Error('abgebrochen')))); }
  geschrieben.push({ url, body: opt.body ? JSON.parse(opt.body) : null });
  return { ok: true, json: async () => ({}) };
};

const hoerer = {};
const doc = { hidden: false, addEventListener: (t, fn) => (hoerer['doc:' + t] ||= []).push(fn) };
const win = {
  addEventListener: (t, fn) => (hoerer['win:' + t] ||= []).push(fn),
};
const feuer = (k, e = {}) => (hoerer[k] || []).forEach(fn => fn(e));
const speicher = {};
const ctx = {
  window: win, document: doc, location: { search: '' }, URLSearchParams,
  localStorage: { getItem: k => speicher[k] ?? null, setItem: (k, v) => { speicher[k] = String(v); }, removeItem: k => { delete speicher[k]; } },
  EventSource: FakeES, fetch: fetchF, AbortController, setInterval: setIntervalF, setTimeout: setTimeoutF, clearTimeout: () => {}, console,
  Date: class extends Date { static now() { return jetzt; } }, JSON, Object, Array, String, Promise, encodeURIComponent,
};
ctx.window = Object.assign(win, ctx);
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(APP + 'engine.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync(APP + 'store.js', 'utf8'), ctx);
const cfg = { speicher: { typ: 'firebase', databaseURL: 'https://beispiel.firebasedatabase.app', spielId: 'test' }, quests: [], items: [] };
const store = ctx.window.QuestStore.create(cfg);
let letzter = null;
store.subscribe(d => { letzter = d; });

// Verbindung steht, erster Stand kommt
await spule(100);
pruefe(aktiv().length === 1, 'Eine Live-Verbindung zum Spiel');
let es = aktiv()[0];
es.oeffnen();
es.melde('put', { path: '/', data: server });

// Firebase schickt alle 30 s ein Lebenszeichen: keine neue Verbindung
for (let i = 0; i < 4; i++) { await spule(30_000); es.melde('keep-alive', null); }
pruefe(aktiv().length === 1 && aktiv()[0] === es, 'Mit Lebenszeichen alle 30 s bleibt die Verbindung (2 Minuten)');

// Die Verbindung schläft still ein (Handy in der Tasche, Netzwechsel): nichts kommt mehr, kein Fehler
server = { ...server, frei: { zug: jetzt }, stand: 2 };
const t0 = jetzt, vorher = quellen.length;
let neuNach = null;
for (let s = 0; s < 120 && neuNach == null; s++) { await spule(1000); if (quellen.length > vorher) neuNach = (jetzt - t0) / 1000; }
pruefe(neuNach != null && neuNach <= 45, `Stumme Verbindung: nach ${neuNach} s neu verbunden (höchstens 45 s)`);
pruefe(es.zu, 'Die alte Verbindung ist geschlossen');
await spule(100);
pruefe(letzter && letzter.frei && letzter.frei.zug, 'Die Freigabe kommt per Abfrage an, noch bevor der neue Stream steht');

// Handy entsperrt: sofort neu verbinden, ohne auf den Wächter zu warten
es = aktiv()[0]; es.oeffnen(); es.melde('put', { path: '/', data: server });
await spule(3000);
const vorEntsperren = quellen.length;
doc.hidden = true; feuer('doc:visibilitychange');
await spule(60_000);
pruefe(quellen.length === vorEntsperren, 'Gesperrt: kein Neuverbinden im Hintergrund');
server = { ...server, frei: { ...server.frei, wiese: jetzt }, stand: 3 };
doc.hidden = false; feuer('doc:visibilitychange');
await spule(50);
pruefe(quellen.length > vorEntsperren, 'Entsperrt: sofort neu verbunden');
pruefe(letzter.frei && letzter.frei.wiese, 'Entsperrt: die neue Freigabe ist sofort da');

// Netz zurück: ebenfalls sofort neu verbinden
es = aktiv()[aktiv().length - 1]; es.oeffnen(); es.melde('put', { path: '/', data: server });
await spule(3000);
const vorNetz = quellen.length;
feuer('win:online');
await spule(50);
pruefe(quellen.length > vorNetz, 'Netz zurück: sofort neu verbunden');

// Eine späte Abfrage überschreibt den frischeren Stand des Streams nicht
es = aktiv()[aktiv().length - 1];
es.oeffnen();
server = { ...server, frei: { ...server.frei, wald: jetzt }, stand: 4 };
es.melde('put', { path: '/', data: server });
pruefe(letzter.frei.wald, 'Stream liefert den neuesten Stand');

// Schreiben hängt (02.10., beim Test im Admin: „Nicht gesendet“, die erste Quest kam bei Dennis nicht an):
// Nach 8 s bricht die App ab und schickt es neu, statt minutenlang hinter der hängenden Anfrage zu warten
let status = null;
store.onStatus(st => { status = st; });
haengt = true;
store.save({ ...letzter, frei: { ...letzter.frei, gipfel: jetzt } });
await spule(1000);
pruefe(status.pending && haengend >= 1, 'Freigabe hängt: im Admin steht „Nicht gesendet“');
await spule(15_000);
pruefe(haengend >= 2, `Hängende Anfrage abgebrochen und neu versucht (${haengend} Versuche in 16 s, vorher einer)`);
haengt = false;
let angekommen = null;
for (let s = 0; s < 30 && angekommen == null; s++) { await spule(1000); if (!status.pending) angekommen = s + 1; }
pruefe(angekommen != null && angekommen <= 20, `Netz wieder gut: Freigabe nach ${angekommen} s gesendet (höchstens 20)`);
pruefe(geschrieben.some(g => g.body && g.body.frei && g.body.frei.gipfel), 'Server hat die Freigabe');

// Dasselbe für Dennis' Einträge (sein Siegel)
const ein = ctx.window.QuestStore.eintraege(cfg);
haengt = true; haengend = 0;
ein.setzen('q_zug', { status: 'bestanden', zeit: jetzt });
await spule(20_000);
pruefe(haengend >= 2, `Dennis' Eintrag: hängende Anfrage abgebrochen und neu versucht (${haengend} Versuche)`);
haengt = false;
await spule(20_000);
pruefe(geschrieben.some(g => g.url.includes('-dennis/q_zug')), 'Dennis\' Eintrag kommt an, sobald das Netz wieder geht');

pruefe(aktiv().length <= 3, `Nie mehr als eine Verbindung je Kanal offen (${aktiv().length})`);

ok.forEach(t => console.log('ok   ', t));
fehler.forEach(t => console.log('FEHLER', t));
console.log(fehler.length ? `${fehler.length} Fehler` : 'Alles in Ordnung.');
process.exit(fehler.length ? 1 : 0);
