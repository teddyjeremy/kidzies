"use client";

import { useEffect, useMemo } from "react";
import { Star } from "lucide-react";
import { useSound } from "@/lib/client/sound";
import { useReducedMotion } from "@/lib/client/hooks";

const COLORS = ["#ff6f59", "#ffd23f", "#2f9cf4", "#1fbf85", "#8a6cf0", "#ff8a1f"];

export function Confetti() {
  const reduced = useReducedMotion();
  const pieces = useMemo(
    () => Array.from({ length: 60 }).map((_, i) => ({
      left: (i * 37) % 100, delay: (i % 10) * 0.12, duration: 2.4 + (i % 5) * 0.4,
      color: COLORS[i % COLORS.length], drift: `${((i % 7) - 3) * 30}px`, round: i % 3 === 0,
    })),
    [],
  );
  if (reduced) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block size-3"
          style={{
            left: `${p.left}%`, background: p.color, borderRadius: p.round ? "9999px" : "3px",
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`, ["--drift" as string]: p.drift,
          }}
        />
      ))}
    </div>
  );
}

export function StarRow({ stars, size = 40 }: { stars: number; size?: number }) {
  return (
    <div className="flex justify-center gap-2" aria-label={`${stars} out of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <Star key={n} size={size} className={n <= stars ? "fill-sun-400 text-sun-500 animate-pop" : "fill-ink-300/30 text-ink-300"} style={{ animationDelay: `${n * 0.15}s` }} />
      ))}
    </div>
  );
}

export interface CelebrationProps {
  title: string;
  message: string;
  stars: number;
  badges?: { key: string; title: string }[];
  saving?: boolean;
  saved?: boolean;
  error?: string | null;
  actions: React.ReactNode;
}

export function Celebration({ title, message, stars, badges = [], saving, saved, error, actions }: CelebrationProps) {
  const { chime, speak } = useSound();
  useEffect(() => {
    chime("celebrate");
    speak(`${title} ${message}`);
  }, [chime, speak, title, message]);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="celebrate-title" className="fixed inset-0 z-40 grid place-items-center bg-ink-900/40 p-4 backdrop-blur-sm">
      <Confetti />
      <div className="card w-full max-w-md animate-pop p-8 text-center">
        <p className="text-6xl" aria-hidden="true">🎉</p>
        <h2 id="celebrate-title" className="mt-2 text-4xl font-bold text-coral-600">{title}</h2>
        <p className="mt-2 text-lg text-ink-700">{message}</p>
        <div className="my-5"><StarRow stars={stars} size={48} /></div>
        {badges.length > 0 && (
          <div className="mb-4 rounded-2xl bg-sun-100 p-3">
            <p className="font-display font-bold">New sticker{badges.length > 1 ? "s" : ""}!</p>
            <p className="text-sm">{badges.map((b) => b.title).join(", ")}</p>
          </div>
        )}
        <p className="mb-4 min-h-6 text-sm font-semibold" role="status" data-testid="save-status">
          {saving ? "Saving your stars…" : error ? <span className="text-coral-700">{error}</span> : saved ? "Saved! Your teacher and family can see it." : ""}
        </p>
        <div className="flex flex-wrap justify-center gap-3">{actions}</div>
      </div>
    </div>
  );
}
