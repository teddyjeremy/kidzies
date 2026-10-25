"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { useSound } from "@/lib/client/sound";

export interface ChoiceOption { label: string; emoji?: string }
export interface ChoiceQuestion {
  prompt: string;
  speech?: string;
  visual?: React.ReactNode;
  options: ChoiceOption[];
  answer: string;
  replies?: Record<string, string>;
}

/**
 * One question at a time with big buttons. Wrong answers can be retried;
 * a question only counts as correct when it is right first time.
 */
export function ChoiceQuiz({ questions, color, onFinish }: {
  questions: ChoiceQuestion[];
  color: string;
  onFinish: (r: { score: number; answers: string[]; mistakes: string[] }) => void;
}) {
  const { speak, chime } = useSound();
  const [index, setIndex] = useState(0);
  const [firstAnswers, setFirstAnswers] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [correct, setCorrect] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const q = questions[index];

  useEffect(() => {
    if (q) speak(q.speech ?? q.prompt);
  }, [q, speak]);

  if (!q) return null;

  const choose = (label: string) => {
    if (correct) return;
    const answers = [...firstAnswers];
    if (answers[index] === undefined) answers[index] = label;
    setFirstAnswers(answers);
    const reply = q.replies?.[label];
    if (label === q.answer) {
      chime("correct");
      setCorrect(label);
      setWrong(null);
      const msg = reply ?? ["Brilliant!", "Well done!", "You got it!", "Super star!"][index % 4];
      setMessage(msg);
      speak(msg);
      window.setTimeout(() => {
        setCorrect(null);
        setMessage(null);
        if (index + 1 >= questions.length) {
          const score = questions.reduce((s, qq, i) => s + (answers[i] === qq.answer ? 1 : 0), 0);
          const mistakes = questions.filter((qq, i) => answers[i] !== qq.answer).map((qq) => qq.prompt);
          onFinish({ score, answers, mistakes });
        } else {
          setIndex(index + 1);
        }
      }, reply ? 2200 : 1100);
    } else {
      chime("wrong");
      setWrong(label);
      const msg = reply ?? "Oops, not quite. Try again!";
      setMessage(msg);
      speak(msg);
      window.setTimeout(() => setWrong(null), 600);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-4 flex items-center justify-between text-sm font-bold text-ink-500">
        <span>Question {index + 1} of {questions.length}</span>
        <div className="flex gap-1" aria-hidden="true">
          {questions.map((_, i) => (
            <span key={i} className="size-3 rounded-full" style={{ background: i < index ? color : i === index ? `${color}88` : "#a6abc855" }} />
          ))}
        </div>
      </div>
      <div className="card p-6 text-center sm:p-8">
        {q.visual && <div className="mb-4 flex justify-center">{q.visual}</div>}
        <h2 className="text-3xl font-bold sm:text-4xl" data-testid="quiz-prompt">{q.prompt}</h2>
        <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={() => speak(q.speech ?? q.prompt)}>
          <Volume2 size={18} aria-hidden="true" /> Hear it again
        </button>
        <div className={`mt-6 grid gap-4 ${q.options.length > 3 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
          {q.options.map((o) => (
            <button
              key={o.label}
              type="button"
              onClick={() => choose(o.label)}
              data-answer={o.label === q.answer ? "true" : "false"}
              className={`toy-tile flex min-h-28 flex-col items-center justify-center gap-1 p-4 ${wrong === o.label ? "animate-wiggle" : ""} ${correct === o.label ? "ring-4 ring-sun-400" : ""}`}
              style={{ ["--tile" as string]: correct === o.label ? "#1fbf85" : color }}
            >
              {o.emoji && <span className="text-5xl" aria-hidden="true">{o.emoji}</span>}
              <span className="font-display text-2xl font-bold">{o.label}</span>
            </button>
          ))}
        </div>
        <p className="mt-5 min-h-8 font-display text-xl font-bold" role="status" aria-live="polite" style={{ color: correct ? "#0e7a55" : "#c23f2c" }}>
          {message}
        </p>
      </div>
    </div>
  );
}
