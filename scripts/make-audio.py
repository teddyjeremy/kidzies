"""Renders the Kidzies sound effects and music loop from scratch.

Every sound is synthesised here from sine waves and noise, so the output files are
original works released under CC0. Run: python3 scripts/make-audio.py (needs numpy and ffmpeg).
"""
import subprocess, wave, os
import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
rng = np.random.default_rng(7)

def t(d): return np.arange(int(SR * d)) / SR
def hz(n): return 440.0 * 2 ** ((n - 69) / 12)

def env(n, a=0.005, dec=0.3):
    x = np.arange(n) / SR
    e = np.minimum(1, x / a) * np.exp(-x / dec)
    return e

def bell(f, d=1.2, dec=0.35, bright=1.0):
    x = t(d)
    s = np.sin(2*np.pi*f*x) + 0.35*bright*np.sin(2*np.pi*f*2.0*x)*np.exp(-x/0.12) + 0.12*bright*np.sin(2*np.pi*f*3.01*x)*np.exp(-x/0.06)
    return s * env(len(x), 0.004, dec)

def mix(parts, d):
    out = np.zeros(int(SR*d))
    for start, sig in parts:
        i = int(start*SR); j = min(len(out), i+len(sig)); out[i:j] += sig[:j-i]
    return out

def soften(x, cutoff=6000):
    # one-pole low-pass for warmth
    a = np.exp(-2*np.pi*cutoff/SR); y = np.zeros_like(x); p = 0.0
    for i, v in enumerate(x):
        p = (1-a)*v + a*p; y[i] = p
    return y

def reverb(x, mixamt=0.18):
    y = x.copy()
    for delay, g in [(0.031, .5), (0.047, .4), (0.073, .3), (0.109, .22), (0.151, .15)]:
        k = int(delay*SR); y[k:] += x[:-k]*g*mixamt*2
    return y

def save(name, x, peak=0.5, q="2"):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    fade = int(0.01*SR); x[-fade:] *= np.linspace(1, 0, fade)
    wav = f"/tmp/{name}.wav"
    with wave.open(wav, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x*32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-c:a", "libvorbis", "-q:a", q, os.path.join(OUT, f"{name}.ogg")], check=True)

# Soft UI click: short muted wooden tick
x = t(0.08); click = (np.sin(2*np.pi*1400*x) * env(len(x), 0.001, 0.012) + 0.3*rng.standard_normal(len(x))*env(len(x), 0.0005, 0.004))
save("click", soften(click, 4000), 0.35)

# Bubble pop: quick upward pitch sweep
x = t(0.16); f = 500 + 900*(x/0.16)**0.6; ph = 2*np.pi*np.cumsum(f)/SR
save("pop", soften(np.sin(ph)*env(len(x), 0.002, 0.04), 5000), 0.4)

# Warm success chime: C-E-G bells
save("correct", reverb(mix([(0, bell(hz(72), 1.0, .3)), (0.09, bell(hz(76), 1.0, .3)), (0.18, bell(hz(79), 1.2, .45))], 1.5)), 0.5)

# Gentle try-again: soft descending two-note, mellow
save("try-again", reverb(soften(mix([(0, bell(hz(67), .7, .22, .3)), (0.16, bell(hz(64), .9, .3, .3))], 1.1), 2500)), 0.35)

# Celebration sparkle: rising arpeggio with shimmer
parts = [(i*0.07, bell(hz(n), 1.2, .4)) for i, n in enumerate([72, 76, 79, 84, 88, 91])]
parts += [(0.3 + i*0.045, bell(hz(96 + (i % 3)*2), .4, .12, .5)*0.35) for i in range(10)]
save("celebrate", reverb(mix(parts, 2.2), 0.3), 0.5)

# Calm music loop: 8 bars, 84 bpm, music box melody over a soft pad (C - Am - F - G)
bpm = 84; beat = 60/bpm; bars = 8; d = bars*4*beat
chords = [[48, 55, 64], [45, 52, 60], [41, 48, 57], [43, 50, 59]]
melody = [76, None, 79, 76, 74, None, 72, None, 72, 76, 74, None, 72, None, 69, None,
          69, None, 72, 74, 76, None, 74, 72, 74, None, 71, None, 67, None, None, None]
parts = []
for b in range(bars):
    ch = chords[b % 4]
    xx = t(4*beat + 0.5)
    pad = sum(np.sin(2*np.pi*hz(n)*xx) + 0.2*np.sin(2*np.pi*hz(n)*2*xx) for n in ch)
    pad *= np.minimum(1, xx/0.6) * np.minimum(1, np.maximum(0, (4*beat + 0.5 - xx)/0.6))
    parts.append((b*4*beat, pad*0.10))
    for k in range(4):  # gentle plucked bass/arpeggio
        parts.append((b*4*beat + k*beat, bell(hz(ch[k % 3] + 12), 0.9, 0.25, 0.4)*0.18))
for i, n in enumerate(melody*2):
    if n is not None: parts.append((i*beat/2*1.0, bell(hz(n), 1.4, 0.5, 0.8)*0.30))
music = mix(parts, d + 1.5)
tail = music[int(d*SR):]; music = music[:int(d*SR)]; music[:len(tail)] += tail  # seamless loop
save("playground-loop", reverb(soften(music, 5000), 0.25), 0.45, "1")
print("ok")
