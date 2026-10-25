"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Celebration } from "@/components/learning/Celebration";
import type { useActivitySave } from "@/components/learning/useActivitySave";

export function ActivityResult({ save, onAgain, nextHref = "/playground", nextLabel = "Back to playground" }: {
  save: ReturnType<typeof useActivitySave>;
  onAgain: () => void;
  nextHref?: string;
  nextLabel?: string;
}) {
  if (!save.finished) return null;
  const stars = save.result?.stars ?? Math.max(1, Math.round((save.finished.score / save.finished.max) * 3));
  const perfect = save.finished.score === save.finished.max;
  return (
    <Celebration
      title={perfect ? "Amazing!" : "Great job!"}
      message={`You got ${save.finished.score} out of ${save.finished.max}.${save.preview ? " (Preview only: nothing was saved.)" : ""}`}
      stars={stars}
      badges={save.result?.new_achievements ?? []}
      saving={save.saving}
      saved={save.saved}
      error={save.error}
      actions={
        <>
          <button type="button" className="btn btn-secondary" onClick={() => { save.reset(); onAgain(); }}>
            <RotateCcw size={18} aria-hidden="true" /> Play again
          </button>
          <Link href={nextHref} className="btn btn-primary" data-testid="result-continue">{nextLabel}</Link>
        </>
      }
    />
  );
}
