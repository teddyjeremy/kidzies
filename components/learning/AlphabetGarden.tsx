"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ALPHABET } from "@/lib/learning/content";
import { shuffle } from "@/lib/learning/scoring";
import { useSound } from "@/lib/client/sound";
import { useReducedMotion, useWebGLSupport } from "@/lib/client/hooks";
import { ChoiceQuiz, type ChoiceQuestion } from "@/components/learning/ChoiceQuiz";
import { ActivityResult } from "@/components/learning/ActivityResult";
import { useActivitySave } from "@/components/learning/useActivitySave";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LetterBlock } from "@/components/3d/toys";

const MiniStage = dynamic(() => import("@/components/3d/MiniStage"), { ssr: false });
const COLORS = ["#ff6f59", "#2f9cf4", "#1fbf85", "#8a6cf0", "#ff8a1f", "#e84f8a", "#f5b700"];
const ROUNDS = 5;

function buildQuiz(): ChoiceQuestion[] {
  const targets = shuffle(ALPHABET).slice(0, ROUNDS);
  return targets.map((t) => {
    const distractors = shuffle(ALPHABET.filter((a) => a.letter !== t.letter)).slice(0, 2);
    return {
      prompt: `Which one starts with ${t.letter}?`,
      speech: `${t.letter}. ${t.letter} says ${t.sound}. Which one starts with ${t.letter}?`,
      visual: <span className="toy-tile grid size-28 place-items-center font-display text-7xl font-bold" style={{ ["--tile" as string]: "#ff6f59" }}>{t.letter}</span>,
      options: shuffle([t, ...distractors]).map((o) => ({ label: o.word, emoji: o.emoji })),
      answer: t.word,
    };
  });
}

export function AlphabetGarden({ preview = false }: { preview?: boolean }) {
  const { speak, chime } = useSound();
  const reduced = useReducedMotion();
  const webgl = useWebGLSupport();
  const [phase, setPhase] = useState<"explore" | "quiz">("explore");
  const [selected, setSelected] = useState(ALPHABET[0]);
  const [round, setRound] = useState(0);
  const quiz = useMemo(() => buildQuiz(), [round]); // eslint-disable-line react-hooks/exhaustive-deps
  const save = useActivitySave("abc-garden", { preview });
  const selectedColor = COLORS[ALPHABET.indexOf(selected) % COLORS.length];

  const pick = (l: (typeof ALPHABET)[number]) => {
    setSelected(l);
    chime("pop");
    speak(`${l.letter}. ${l.letter} says ${l.sound}, as in ${l.word}.`);
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      {phase === "explore" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <section className="card overflow-hidden" aria-labelledby="letter-title">
            {webgl === "full" || webgl === "low" ? (
              <ErrorBoundary fallback={null}>
                <MiniStage reducedMotion={reduced}>
                  <LetterBlock letter={selected.letter} color={selectedColor} size={1.5} rotation={[0.1, -0.5, 0]} />
                </MiniStage>
              </ErrorBoundary>
            ) : (
              <div className="grid h-64 place-items-center"><span className="toy-tile grid size-40 place-items-center font-display text-8xl font-bold" style={{ ["--tile" as string]: selectedColor }}>{selected.letter}</span></div>
            )}
            <div className="p-6 text-center">
              <h2 id="letter-title" className="text-4xl font-bold"><span style={{ color: selectedColor }}>{selected.letter}</span> is for {selected.word} <span aria-hidden="true">{selected.emoji}</span></h2>
              <p className="mt-2 text-lg text-ink-700">{selected.letter} says &ldquo;{selected.sound}&rdquo;</p>
              <button type="button" className="btn btn-sky mt-4" onClick={() => pick(selected)}>Hear it</button>
            </div>
          </section>
          <section aria-labelledby="pick-title">
            <h2 id="pick-title" className="mb-3 text-2xl font-bold">Tap a letter to hear its sound</h2>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 sm:gap-3">
              {ALPHABET.map((l, i) => (
                <button key={l.letter} type="button" onClick={() => pick(l)} aria-label={`Letter ${l.letter}`} aria-pressed={selected.letter === l.letter}
                  className={`toy-tile aspect-square font-display text-3xl font-bold sm:text-4xl ${selected.letter === l.letter ? "ring-4 ring-sun-400" : ""}`}
                  style={{ ["--tile" as string]: COLORS[i % COLORS.length] }}>
                  {l.letter}
                </button>
              ))}
            </div>
            <div className="mt-6 card flex flex-col items-center gap-3 p-5 text-center sm:flex-row sm:text-left">
              <span className="text-5xl" aria-hidden="true">🍎</span>
              <p className="flex-1 text-lg"><strong>Matching game:</strong> find the picture that starts with each letter. {ROUNDS} rounds!</p>
              <button type="button" className="btn btn-primary" onClick={() => setPhase("quiz")} data-testid="start-quiz">Let&apos;s play!</button>
            </div>
          </section>
        </div>
      ) : (
        <ChoiceQuiz
          key={round}
          questions={quiz}
          color="#ff6f59"
          onFinish={({ score, answers, mistakes }) => void save.finish({ score, max: quiz.length, answers, mistakes })}
        />
      )}
      <ActivityResult save={save} onAgain={() => { setRound((r) => r + 1); setPhase("quiz"); }} nextHref="/playground/number-playground" nextLabel="Next: Number Playground" />
    </div>
  );
}
