"use client";

import { useState } from "react";
import { LIFE_SCENARIOS } from "@/lib/learning/content";
import { ChoiceQuiz } from "@/components/learning/ChoiceQuiz";
import { ActivityResult } from "@/components/learning/ActivityResult";
import { useActivitySave } from "@/components/learning/useActivitySave";

export function LifeSkills() {
  const [round, setRound] = useState(0);
  const save = useActivitySave("life-skills");
  const questions = LIFE_SCENARIOS.map((s) => ({
    prompt: s.prompt,
    speech: `${s.story} ${s.prompt}`,
    visual: (
      <div className="w-full rounded-3xl bg-sun-100 p-5">
        <p className="text-6xl" aria-hidden="true">{s.scene.join(" ")}</p>
        <p className="mt-3 text-lg font-semibold text-ink-700">{s.story}</p>
      </div>
    ),
    options: s.options.map((o) => ({ label: o.text, emoji: o.emoji })),
    answer: s.options.find((o) => o.correct)?.text ?? "",
    replies: Object.fromEntries(s.options.map((o) => [o.text, o.reply])),
  }));
  return (
    <div className="p-4 sm:p-6">
      <ChoiceQuiz key={round} questions={questions} color="#f5b700" onFinish={({ score, answers, mistakes }) => void save.finish({ score, max: questions.length, answers, mistakes })} />
      <ActivityResult save={save} onAgain={() => setRound((r) => r + 1)} />
    </div>
  );
}
