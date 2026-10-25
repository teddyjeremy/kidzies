"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type SoundKind = "click" | "pop" | "correct" | "wrong" | "celebrate";

interface SoundApi {
  enabled: boolean;
  toggle: () => void;
  speak: (text: string) => void;
  chime: (kind: SoundKind) => void;
  setMusic: (wanted: boolean) => void;
}

const SoundContext = createContext<SoundApi | null>(null);
const STORAGE_KEY = "kidzies-sound";

const FILES: Record<SoundKind | "music", string> = {
  click: "click", pop: "pop", correct: "correct", wrong: "try-again", celebrate: "celebrate", music: "playground-loop",
};
const VOLUME: Record<SoundKind, number> = { click: 0.35, pop: 0.45, correct: 0.6, wrong: 0.4, celebrate: 0.6 };
const MUSIC_VOLUME = 0.12;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Sound effects and the playground music are small audio files in /public/audio,
 * fetched only the first time they are needed. Narration uses the browser's speech voice.
 */
export function SoundProvider({ children, initialEnabled = true, onChange }: {
  children: React.ReactNode; initialEnabled?: boolean; onChange?: (enabled: boolean) => void;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [musicWanted, setMusicWanted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const buffers = useRef(new Map<string, Promise<AudioBuffer | null>>());
  const music = useRef<{ src: AudioBufferSourceNode; gain: GainNode } | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preference is only readable in the browser
    if (stored === "off") setEnabled(false);
  }, []);

  // Browsers only allow audio after the first tap or key press.
  useEffect(() => {
    const unlock = () => setUnlocked(true);
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => { window.removeEventListener("pointerdown", unlock); window.removeEventListener("keydown", unlock); };
  }, []);

  const context = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctxRef.current ??= new Ctor();
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume().catch(() => undefined);
    return ctxRef.current;
  }, []);

  const load = useCallback((name: string): Promise<AudioBuffer | null> => {
    const ctx = context();
    if (!ctx) return Promise.resolve(null);
    let p = buffers.current.get(name);
    if (!p) {
      const ext = new Audio().canPlayType('audio/ogg; codecs="vorbis"') ? "ogg" : "mp3";
      p = fetch(`/audio/${name}.${ext}`)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error("missing"))))
        .then((data) => ctx.decodeAudioData(data))
        .catch(() => null);
      buffers.current.set(name, p);
    }
    return p;
  }, [context]);

  const chime = useCallback((kind: SoundKind) => {
    if (!enabled) return;
    if (kind === "celebrate" && prefersReducedMotion()) kind = "correct";
    const ctx = context();
    if (!ctx) return;
    void load(FILES[kind]).then((buf) => {
      if (!buf) return;
      const src = ctx.createBufferSource();
      const gain = ctx.createGain();
      gain.gain.value = VOLUME[kind];
      src.buffer = buf;
      src.connect(gain).connect(ctx.destination);
      src.start();
    });
  }, [enabled, context, load]);

  // Background music: quiet, only while a page asks for it, the sound switch is on,
  // the child has interacted, and reduced motion is not requested.
  useEffect(() => {
    const shouldPlay = enabled && musicWanted && unlocked && !prefersReducedMotion();
    const ctx = shouldPlay ? context() : ctxRef.current;
    if (!ctx) return;
    let cancelled = false;
    if (shouldPlay && !music.current) {
      void load(FILES.music).then((buf) => {
        if (!buf || cancelled || music.current) return;
        const src = ctx.createBufferSource();
        const gain = ctx.createGain();
        src.buffer = buf;
        src.loop = true;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(MUSIC_VOLUME, ctx.currentTime + 2.5);
        src.connect(gain).connect(ctx.destination);
        src.start();
        music.current = { src, gain };
      });
    } else if (!shouldPlay && music.current) {
      const { src, gain } = music.current;
      music.current = null;
      gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3);
      src.stop(ctx.currentTime + 1.2);
    }
    return () => { cancelled = true; };
  }, [enabled, musicWanted, unlocked, context, load]);

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

  const value = useMemo(() => ({ enabled, toggle, speak, chime, setMusic: setMusicWanted }), [enabled, toggle, speak, chime]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundApi {
  const ctx = useContext(SoundContext);
  if (!ctx) return { enabled: false, toggle: () => undefined, speak: () => undefined, chime: () => undefined, setMusic: () => undefined };
  return ctx;
}

/** Plays the quiet playground music while the calling component is on screen. */
export function usePlaygroundMusic(): void {
  const { setMusic } = useSound();
  useEffect(() => {
    setMusic(true);
    return () => setMusic(false);
  }, [setMusic]);
}
