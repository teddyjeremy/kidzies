"use client";

import { useState } from "react";
import type { Lesson } from "@/types";
import { COUNTABLE_OBJECTS, type CountableObject } from "@/lib/learning/content";
import { ChoiceQuiz } from "@/components/learning/ChoiceQuiz";
import { CountingActivity } from "@/components/learning/CountingActivity";
import { ActivityResult } from "@/components/learning/ActivityResult";
import { useActivitySave } from "@/components/learning/useActivitySave";
import { AREA_BY_KEY } from "@/lib/learning/areas";

/** Plays a teacher-made lesson. Used by students (saved, scored on the server) and teachers (preview, never saved). */
export function LessonPlayer({ lesson, assignmentId, preview = false, exitHref }: {
  lesson: Lesson; assignmentId?: string; preview?: boolean; exitHref: string;
}) {
  const [round, setRound] = useState(0);
  const save = useActivitySave(lesson.location, { assignmentId, preview });
  const color = AREA_BY_KEY[lesson.location]?.color ?? "#ff6f59";
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <div className="card p-8 text-center">
          <p className="text-6xl" aria-hidden="true">{AREA_BY_KEY[lesson.location]?.emoji}</p>
          <h2 className="mt-3 text-4xl font-bold">{lesson.title}</h2>
          {lesson.description && <p className="mt-3 text-lg text-ink-700">{lesson.description}</p>}
          {lesson.instructions && <p className="mt-3 rounded-2xl bg-sun-100 p-4 font-semibold">{lesson.instructions}</p>}
          {lesson.media_url && (
            <p className="mt-3 text-sm">
              <a className="font-bold text-sky-700 underline" href={lesson.media_url} target="_blank" rel="noopener noreferrer">Open the lesson media (with a grown-up)</a>
            </p>
          )}
          <button type="button" className="btn btn-primary mt-6 text-xl" onClick={() => setStarted(true)} data-testid="lesson-start">Start!</button>
        </div>
      </div>
    );
  }

  const finish = ({ answers, mistakes, score }: { score: number; answers: string[]; mistakes: string[] }) =>
    void save.finish({ score, max: lesson.questions.length, answers, mistakes });

  return (
    <div className="p-4 sm:p-6">
      {lesson.activity_type === "counting" ? (
        <CountingActivity
          key={round}
          rounds={lesson.questions.map((q) => ({
            prompt: q.prompt,
            object: (COUNTABLE_OBJECTS as readonly string[]).includes(q.object ?? "") ? (q.object as CountableObject) : "apple",
            target: Math.max(1, Math.min(10, Number(q.target) || 1)),
          }))}
          onFinish={finish}
        />
      ) : (
        <ChoiceQuiz
          key={round}
          color={color}
          questions={lesson.questions.map((q) => ({
            prompt: q.prompt,
            visual: q.emoji ? <span className="text-8xl" aria-hidden="true">{q.emoji}</span> : undefined,
            options: (q.options ?? []).map((o) => ({ label: o })),
            answer: q.answer ?? "",
          }))}
          onFinish={finish}
        />
      )}
      <ActivityResult save={save} onAgain={() => setRound((r) => r + 1)} nextHref={exitHref} nextLabel={preview ? "Back to lesson" : "Back to playground"} />
    </div>
  );
}
