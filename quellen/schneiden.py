"""Rikes Sprachnachrichten (WhatsApp, Ordner quellen/) auf die wichtigen Stellen kürzen, für das Tagebuch in der App.

Aufruf aus dem Repo-Ordner:  python3 quellen/schneiden.py        (alle)
                             python3 quellen/schneiden.py 4 6     (nur Frage 4 und 6)
Braucht ffmpeg. Schreibt app/assets/logbuch/frageN.m4a (AAC, mono, 64 kbit/s, gleich laut).
Die Teile sind Sekunden in der Original-Nachricht und liegen immer in einer Sprechpause.
Zwischen zwei Teilen kommt eine kurze Pause, jeder Teil wird weich ein- und ausgeblendet.
Was in jedem Schnitt bleibt und was fehlt: app/assets/logbuch/LIESMICH.md
"""
import os, subprocess, sys

HIER = os.path.dirname(os.path.abspath(__file__))
ZIEL = os.path.join(HIER, "..", "app", "assets", "logbuch")

# Frage: (Original, [(von, bis), ...])
FRAGEN = {
    1: ("WhatsApp Ptt 2026-09-29 at 11.27.11.ogg", [(0.95, 32.55)]),
    2: ("WhatsApp Ptt 2026-09-29 at 11.35.04.ogg", [(0.80, 33.62)]),
    3: ("WhatsApp Ptt 2026-09-30 at 12.58.36.ogg", [(1.20, 42.30)]),
    4: ("WhatsApp Ptt 2026-09-28 at 13.43.32.ogg", [(8.90, 17.32), (24.90, 48.55)]),
    5: ("WhatsApp Ptt 2026-10-01 at 09.42.32.ogg", [(0.45, 40.80)]),
    6: ("WhatsApp Ptt 2026-09-30 at 13.02.51.ogg", [(2.30, 31.30), (79.05, 87.20), (88.20, 99.33), (108.02, 116.95), (155.55, 165.90)]),
    7: ("WhatsApp Ptt 2026-09-30 at 13.06.26.ogg", [(1.05, 12.62), (73.10, 85.00), (93.22, 109.20), (162.40, 183.78)]),
}
PAUSE = 0.30   # Sekunden Stille zwischen zwei Teilen
FADE = 0.04    # weiches Ein- und Ausblenden je Teil, gegen Knacken

for nr in [int(a) for a in sys.argv[1:]] or sorted(FRAGEN):
    datei, teile = FRAGEN[nr]
    f, kette = [], ""
    for i, (a, b) in enumerate(teile):
        f.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d={FADE},afade=t=out:st={b - a - FADE:.3f}:d={FADE}[t{i}]")
        kette += f"[t{i}]"
        if i < len(teile) - 1:
            f.append(f"anullsrc=r=48000:cl=mono,atrim=0:{PAUSE}[p{i}]")
            kette += f"[p{i}]"
    f.append(f"{kette}concat=n={2 * len(teile) - 1}:v=0:a=1,highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[out]")
    ziel = os.path.join(ZIEL, f"frage{nr}.m4a")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", os.path.join(HIER, datei), "-filter_complex", ";".join(f),
                    "-map", "[out]", "-ac", "1", "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", ziel], check=True)
    print(f"frage{nr}.m4a", f"{sum(b - a for a, b in teile):.0f} s aus", datei)
