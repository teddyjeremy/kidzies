"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

interface SoundApi {
  enabled: boolean;
  toggle: () => void;
  speak: (text: string) => void;
  chime: (kind: "correct" | "wrong" | "pop" | "celebrate") => void;
}

const SoundContext = createContext<SoundApi | null>(null);
const STORAGE_KEY = "kidzies-sound";

/** Sound effects are synthesised with Web Audio and narration uses the browser's speech voice, so nothing is downloaded. */
export function SoundProvider({ children, initialEnabled = true, onChange }: {
  children: React.ReactNode; initialEnabled?: boolean; onChange?: (enabled: boolean) => void;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preference is only readable in the browser
    if (stored === "off") setEnabled(false);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((v) => {
      const next = !v;
      window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      if (!next && "speechSynthesis" in window) window.speechSynthesis.cancel();
      onChange?.(next);
      return next;
    });
  }, [onChange]);

  const speak = useCallback(
    (text: string) => {
      if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.92;
        u.pitch = 1.15;
        const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("en"));
        if (voice) u.voice = voice;
        window.speechSynthesis.speak(u);
      } catch {
        /* Speech is optional. */
      }
    },
    [enabled],
  );

  const chime = useCallback(
    (kind: "correct" | "wrong" | "pop" | "celebrate") => {
      if (!enabled || typeof window === "undefined") return;
      try {
        const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        ctxRef.current ??= new Ctor();
        const ctx = ctxRef.current;
        const notes: Record<typeof kind, number[]> = {
          correct: [523.25, 659.25, 783.99],
          wrong: [392, 330],
          pop: [880],
          celebrate: [523.25, 659.25, 783.99, 1046.5, 1318.5],
        };
        notes[kind].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = kind === "wrong" ? "triangle" : "sine";
          osc.frequency.value = freq;
          const start = ctx.currentTime + i * (kind === "pop" ? 0 : 0.11);
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
          osc.connect(gain).connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.3);
        });
      } catch {
        /* Audio is optional. */
      }
    },
    [enabled],
  );

  const value = useMemo(() => ({ enabled, toggle, speak, chime }), [enabled, toggle, speak, chime]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundApi {
  const ctx = useContext(SoundContext);
  if (!ctx) return { enabled: false, toggle: () => undefined, speak: () => undefined, chime: () => undefined };
  return ctx;
}
