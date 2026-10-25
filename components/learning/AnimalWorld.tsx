"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ANIMALS, HOMES, type AnimalKey } from "@/lib/learning/content";
import { shuffle } from "@/lib/learning/scoring";
import { useSound } from "@/lib/client/sound";
import { useReducedMotion, useWebGLSupport } from "@/lib/client/hooks";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ChoiceQuiz, type ChoiceQuestion } from "@/components/learning/ChoiceQuiz";
import { ActivityResult } from "@/components/learning/ActivityResult";
import { useActivitySave } from "@/components/learning/useActivitySave";

const AnimalStage = dynamic(() => import("@/components/3d/AnimalStage"), { ssr: false });
const EMOJI: Record<AnimalKey, string> = { duck: "🦆", pig: "🐷", frog: "🐸", bear: "🐻", sheep: "🐑", owl: "🦉" };

export function AnimalWorld() {
  const { speak, chime } = useSound();
  const reduced = useReducedMotion();
  const webgl = useWebGLSupport();
  const [selected, setSelected] = useState<AnimalKey | null>(null);
  const [met, setMet] = useState<AnimalKey[]>([]);
  const [phase, setPhase] = useState<"meet" | "sort">("meet");
  const [round, setRound] = useState(0);
  const save = useActivitySave("animal-world");
  const animal = ANIMALS.find((a) => a.key === selected);

  const quiz: ChoiceQuestion[] = useMemo(
    () => shuffle(ANIMALS).slice(0, 4).map((a) => ({
      prompt: `Where does the ${a.name.toLowerCase()} live?`,
      visual: <span className="text-8xl" aria-hidden="true">{EMOJI[a.key]}</span>,
      options: HOMES.map((h) => ({ label: h.name, emoji: h.emoji })),
      answer: HOMES.find((h) => h.key === a.home)?.name ?? "Farm",
    })),
    [round], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const meet = (k: AnimalKey) => {
    const a = ANIMALS.find((x) => x.key === k);
    if (!a) return;
    setSelected(k);
    setMet((m) => (m.includes(k) ? m : [...m, k]));
    chime("pop");
    speak(`This is a ${a.name}. The ${a.name} says ${a.sound} ${a.fact}`);
  };

  if (phase === "sort") {
    return (
      <div className="p-4 sm:p-6">
        <ChoiceQuiz key={round} questions={quiz} color="#1fbf85" onFinish={({ score, answers, mistakes }) => void save.finish({ score, max: quiz.length, answers, mistakes })} />
        <ActivityResult save={save} onAgain={() => setRound((r) => r + 1)} />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-4 p-4 sm:p-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="card h-[44dvh] min-h-72 overflow-hidden lg:h-[60dvh]">
        {webgl === "full" || webgl === "low" ? (
          <ErrorBoundary fallback={<p className="p-6">The animals are napping. Use the buttons instead!</p>}>
            <AnimalStage selected={selected} onSelect={meet} reducedMotion={reduced} />
          </ErrorBoundary>
        ) : (
          <div className="grid h-full place-items-center text-8xl" aria-hidden="true">{animal ? EMOJI[animal.key] : "🐾"}</div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="card p-5">
          <h2 className="text-2xl font-bold">Say hello to the animals!</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {ANIMALS.map((a) => (
              <button key={a.key} type="button" onClick={() => meet(a.key)} aria-pressed={selected === a.key}
                className={`flex flex-col items-center rounded-2xl p-2 font-bold ${selected === a.key ? "bg-mint-100 ring-2 ring-mint-500" : "bg-cream hover:bg-mint-100"}`}>
                <span className="text-4xl" aria-hidden="true">{EMOJI[a.key]}</span> {a.name} {met.includes(a.key) ? "✓" : ""}
              </button>
            ))}
          </div>
        </div>
        <div className="card min-h-36 p-5" aria-live="polite">
          {animal ? (
            <>
              <p className="font-display text-3xl font-bold">{animal.name}: &ldquo;{animal.sound}&rdquo;</p>
              <p className="mt-2 text-lg text-ink-700">{animal.fact}</p>
              <p className="mt-2 text-sm font-bold text-mint-700">Home: {HOMES.find((h) => h.key === animal.home)?.name}</p>
            </>
          ) : (
            <p className="text-lg text-ink-700">Tap an animal to hear its sound and learn a fact.</p>
          )}
        </div>
        <button type="button" className="btn btn-mint" disabled={met.length < 3} onClick={() => { setPhase("sort"); speak("Let's help the animals find their homes!"); }}>
          {met.length < 3 ? `Meet ${3 - met.length} more to play the home game` : "Play: help animals find home"}
        </button>
      </div>
    </div>
  );
}
