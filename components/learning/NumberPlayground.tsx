"use client";

import { useMemo, useState } from "react";
import { COUNTABLE_OBJECTS } from "@/lib/learning/content";
import { CountingActivity, type CountingRound } from "@/components/learning/CountingActivity";
import { ActivityResult } from "@/components/learning/ActivityResult";
import { useActivitySave } from "@/components/learning/useActivitySave";

function buildRounds(seed: number): CountingRound[] {
  const targets = [[3, 5, 4], [2, 4, 6], [5, 3, 7], [4, 6, 2]][seed % 4];
  return targets.map((t, i) => ({ object: COUNTABLE_OBJECTS[(i + seed) % COUNTABLE_OBJECTS.length], target: t }));
}

export function NumberPlayground() {
  const [game, setGame] = useState(0);
  const rounds = useMemo(() => buildRounds(game), [game]);
  const save = useActivitySave("number-playground");
  return (
    <>
      <CountingActivity key={game} rounds={rounds} onFinish={({ score, answers, mistakes }) => void save.finish({ score, max: rounds.length, answers, mistakes })} />
      <ActivityResult save={save} onAgain={() => setGame((g) => g + 1)} nextHref="/playground/shapes-colours" nextLabel="Next: Shapes & Colours" />
    </>
  );
}
