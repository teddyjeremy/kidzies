"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { recordAttempt } from "@/app/actions/student";
import { starsFor } from "@/lib/learning/scoring";
import type { AreaKey, AttemptResult } from "@/types";

export interface FinishPayload {
  score: number;
  max: number;
  answers: (string | number | Record<string, string>)[];
  mistakes: string[];
}

/** Saves a finished activity for the signed-in student. In preview mode nothing is stored. */
export function useActivitySave(area: AreaKey, opts: { assignmentId?: string | null; preview?: boolean } = {}) {
  const started = useRef(0);
  useEffect(() => {
    started.current = Date.now();
  }, []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [finished, setFinished] = useState<FinishPayload | null>(null);

  const finish = useCallback(
    async (payload: FinishPayload) => {
      setFinished(payload);
      if (opts.preview) {
        setResult({ attempt_id: "preview", score: payload.score, max_score: payload.max, stars: starsFor(payload.score, payload.max), mistakes: payload.mistakes, new_achievements: [], total_stars: 0 });
        return;
      }
      setSaving(true);
      setError(null);
      const res = await recordAttempt({
        area, assignmentId: opts.assignmentId ?? null, score: payload.score, max: payload.max,
        answers: payload.answers, mistakes: payload.mistakes, durationSeconds: Math.round((Date.now() - started.current) / 1000),
      });
      setSaving(false);
      if (res.ok) {
        setSaved(true);
        setResult(res.data);
      } else {
        setError(res.error);
      }
    },
    [area, opts.assignmentId, opts.preview],
  );

  const reset = useCallback(() => {
    started.current = Date.now();
    setSaved(false);
    setError(null);
    setResult(null);
    setFinished(null);
  }, []);

  return { finish, reset, saving, saved, error, result, finished, preview: Boolean(opts.preview) };
}
