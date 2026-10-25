"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import type { CountableObject } from "@/lib/learning/content";
import { numberWord } from "@/lib/learning/scoring";
import { useSound } from "@/lib/client/sound";
import { useReducedMotion, useWebGLSupport } from "@/lib/client/hooks";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const CountingScene = dynamic(() => import("@/components/3d/CountingScene"), { ssr: false, loading: () => <div className="grid h-full place-items-center font-display text-xl">Getting the toys ready…</div> });

const EMOJI: Record<CountableObject, string> = { apple: "🍎", star: "⭐", balloon: "🎈", block: "🧱" };
const PLURAL: Record<CountableObject, string> = { apple: "apples", star: "stars", balloon: "balloons", block: "blocks" };

export interface CountingRound { prompt?: string; object: CountableObject; target: number }

/** Collect-and-count game. Each round is right only if the first "Done" press has the right number. */
export function CountingActivity({ rounds, onFinish }: {
  rounds: CountingRound[];
  onFinish: (r: { score: number; answers: string[]; mistakes: string[] }) => void;
}) {
  const { speak, chime } = useSound();
  const reduced = useReducedMotion();
  const webgl = useWebGLSupport();
  const [index, setIndex] = useState(0);
  const [collected, setCollected] = useState<number[]>([]);
  const [firstAnswers, setFirstAnswers] = useState<string[]>([]);
  const [message, setMessage] = useState<{ text: string; good: boolean } | null>(null);
  const round = rounds[index];
  const total = useMemo(() => Math.min(10, (round?.target ?? 3) + 3), [round]);
  const prompt = round ? round.prompt ?? `Can you collect ${round.target} ${PLURAL[round.object]}?` : "";

  const toggle = (i: number) => {
    if (message?.good) return;
    setCollected((c) => {
      if (c.includes(i)) return c.filter((x) => x !== i);
      const next = [...c, i];
      chime("pop");
      speak(numberWord(next.length));
      return next;
    });
  };

  const done = () => {
    if (!round) return;
    const answers = [...firstAnswers];
    if (answers[index] === undefined) answers[index] = String(collected.length);
    setFirstAnswers(answers);
    if (collected.length === round.target) {
      chime("correct");
      const text = `Yes! ${round.target} ${PLURAL[round.object]}. Well counted!`;
      setMessage({ text, good: true });
      speak(text);
      window.setTimeout(() => {
        setMessage(null);
        setCollected([]);
        if (index + 1 >= rounds.length) {
          const score = rounds.reduce((s, r, i) => s + (answers[i] === String(r.target) ? 1 : 0), 0);
          onFinish({ score, answers, mistakes: rounds.filter((r, i) => answers[i] !== String(r.target)).map((r) => r.prompt ?? `Collect ${r.target} ${PLURAL[r.object]}`) });
        } else setIndex(index + 1);
      }, 1500);
    } else {
      chime("wrong");
      const text = collected.length < round.target ? `You have ${collected.length}. We need ${round.target}. Collect some more!` : `You have ${collected.length}. That's too many! Tap one to put it back.`;
      setMessage({ text, good: false });
      speak(text);
    }
  };

  if (!round) return null;
  return (
    <div className="mx-auto grid max-w-6xl gap-4 p-4 sm:p-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="card relative h-[48dvh] min-h-80 overflow-hidden lg:h-[64dvh]">
        {webgl === "full" || webgl === "low" ? (
          <ErrorBoundary fallback={<p className="p-6">The 3D toys could not load. Use the buttons to collect.</p>}>
            <CountingScene kind={round.object} total={total} collected={collected} onCollect={toggle} reducedMotion={reduced} />
          </ErrorBoundary>
        ) : (
          <div className="grid h-full place-items-center p-4 text-center text-ink-700">Use the big buttons to collect toys.</div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="card p-6 text-center">
          <p className="text-sm font-bold text-ink-500">Round {index + 1} of {rounds.length}</p>
          <h2 className="mt-1 text-3xl font-bold" data-testid="count-prompt">{prompt}</h2>
          <p className="mt-4 font-display text-7xl font-bold text-sky-500" aria-live="polite" data-testid="count-value">{collected.length}</p>
          <p className="text-ink-700">in the basket</p>
        </div>
        <div className="card p-4">
          <p className="mb-2 text-sm font-bold text-ink-500">Tap to collect (or tap the toys in the picture)</p>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <button key={i} type="button" onClick={() => toggle(i)} aria-pressed={collected.includes(i)} aria-label={`${round.object} ${i + 1}${collected.includes(i) ? ", in basket" : ""}`}
                data-testid="collect-btn"
                className={`grid aspect-square place-items-center rounded-2xl text-3xl transition ${collected.includes(i) ? "bg-mint-100 opacity-50" : "bg-cream hover:bg-sun-100"}`}>
                {EMOJI[round.object]}
              </button>
            ))}
          </div>
        </div>
        <p className="min-h-8 text-center font-display text-xl font-bold" role="status" style={{ color: message?.good ? "#0e7a55" : "#c23f2c" }}>{message?.text}</p>
        <div className="flex gap-3">
          <button type="button" className="btn btn-secondary flex-1" onClick={() => { setCollected([]); setMessage(null); }}><RotateCcw size={18} aria-hidden="true" /> Start over</button>
          <button type="button" className="btn btn-mint flex-1" onClick={done} data-testid="count-done"><Check size={20} aria-hidden="true" /> Done!</button>
        </div>
      </div>
    </div>
  );
}
