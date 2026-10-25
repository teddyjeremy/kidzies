"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { STORIES, type Story } from "@/lib/learning/content";
import { useSound } from "@/lib/client/sound";
import { ChoiceQuiz } from "@/components/learning/ChoiceQuiz";
import { ActivityResult } from "@/components/learning/ActivityResult";
import { useActivitySave } from "@/components/learning/useActivitySave";

function Reader({ story, onDone }: { story: Story; onDone: () => void }) {
  const { speak } = useSound();
  const [page, setPage] = useState(0);
  const p = story.pages[page];
  useEffect(() => { speak(p.text); }, [p, speak]);
  return (
    <div className="mx-auto max-w-4xl">
      <div className="card overflow-hidden">
        <div className="relative grid min-h-72 place-items-center p-8" style={{ background: p.background }}>
          <div className="flex flex-wrap items-end justify-center gap-4" aria-hidden="true">
            {p.scene.map((e, i) => (
              <span key={`${page}-${i}`} className="animate-pop text-7xl sm:text-8xl" style={{ animationDelay: `${i * 0.12}s` }}>{e}</span>
            ))}
          </div>
          <span className="absolute right-4 top-4 rounded-full bg-white/80 px-3 py-1 text-sm font-bold">Page {page + 1} / {story.pages.length}</span>
        </div>
        <div className="p-6 sm:p-8">
          <p className="font-display text-2xl leading-relaxed sm:text-3xl" data-testid="story-text">{p.text}</p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button type="button" className="btn btn-secondary" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft aria-hidden="true" /> Back</button>
            <button type="button" className="btn btn-ghost" onClick={() => speak(p.text)}><Volume2 aria-hidden="true" /> Read to me</button>
            {page < story.pages.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={() => setPage(page + 1)} data-testid="story-next">Next <ChevronRight aria-hidden="true" /></button>
            ) : (
              <button type="button" className="btn btn-mint" onClick={onDone} data-testid="story-questions">Questions time!</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Storytime() {
  const [story, setStory] = useState<Story | null>(null);
  const [phase, setPhase] = useState<"read" | "quiz">("read");
  const [round, setRound] = useState(0);
  const save = useActivitySave("storytime");

  if (!story) {
    return (
      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        <h2 className="mb-4 text-center text-3xl font-bold">Pick a story</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {STORIES.map((s, i) => (
            <button key={s.key} type="button" onClick={() => { setStory(s); setPhase("read"); }} className="toy-tile flex flex-col items-center gap-3 p-8" style={{ ["--tile" as string]: i ? "#ff8a1f" : "#8a6cf0" }}>
              <span className="text-7xl" aria-hidden="true">{s.cover}</span>
              <span className="font-display text-2xl font-bold">{s.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 sm:p-6">
      {phase === "read" ? (
        <Reader story={story} onDone={() => setPhase("quiz")} />
      ) : (
        <ChoiceQuiz key={round} questions={story.questions.map((q) => ({ prompt: q.prompt, options: q.options.map((o) => ({ label: o })), answer: q.answer }))} color="#8a6cf0"
          onFinish={({ score, answers, mistakes }) => void save.finish({ score, max: story.questions.length, answers, mistakes })} />
      )}
      <ActivityResult save={save} onAgain={() => { setRound((r) => r + 1); setStory(null); }} />
    </div>
  );
}
