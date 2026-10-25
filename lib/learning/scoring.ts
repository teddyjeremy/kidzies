/** Mirrors app.stars_for in the database. */
export function starsFor(score: number, max: number): number {
  if (max <= 0) return 0;
  const ratio = score / max;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}

export function percent(score: number, max: number): number {
  return max > 0 ? Math.round((score / max) * 100) : 0;
}

/** Decorations that appear on the playground as stars are collected. */
export const UNLOCKABLES = [
  { key: "balloons", title: "Party balloons", stars: 3 },
  { key: "kite", title: "Rainbow kite", stars: 6 },
  { key: "carousel", title: "Spinning carousel", stars: 10 },
  { key: "rainbow", title: "Big rainbow", stars: 15 },
] as const;

export function unlockedItems(totalStars: number): string[] {
  return UNLOCKABLES.filter((u) => totalStars >= u.stars).map((u) => u.key);
}

export function nextUnlock(totalStars: number) {
  return UNLOCKABLES.find((u) => totalStars < u.stars) ?? null;
}

/** Scores answers for a teacher lesson the same way the database does. */
export function scoreLesson(
  questions: { answer?: string; target?: string; prompt: string }[],
  answers: string[],
  pointsPerQuestion = 1,
): { score: number; max: number; mistakes: string[] } {
  let score = 0;
  const mistakes: string[] = [];
  questions.forEach((q, i) => {
    const expected = (q.answer ?? q.target ?? "").trim().toLowerCase();
    const given = (answers[i] ?? "").trim().toLowerCase();
    if (expected !== "" && expected === given) score += pointsPerQuestion;
    else mistakes.push(q.prompt);
  });
  return { score, max: Math.max(questions.length, 1) * pointsPerQuestion, mistakes };
}

/** Plain-language weekly summary for parents, built only from saved records. */
export function weeklySummary(name: string, weekCount: number, weekAreas: string[]): string {
  if (weekCount === 0) return `${name} has not completed any activities this week yet. A short session together is a great way to start!`;
  const word = weekCount === 1 ? "activity" : "activities";
  const areas = weekAreas.length > 0 ? ` and is practising ${listJoin(weekAreas.map((a) => a.toLowerCase()))}` : "";
  return `${name} completed ${numberWord(weekCount)} ${word} this week${areas}.`;
}

export function numberWord(n: number): string {
  const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  return n >= 0 && n <= 10 ? words[n] : String(n);
}

export function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function strengthsAndPractice(areaAverages: { area_name: string; avg_pct: number; attempts: number }[]) {
  return {
    strengths: areaAverages.filter((a) => a.avg_pct >= 80).map((a) => a.area_name),
    practice: areaAverages.filter((a) => a.avg_pct < 60).map((a) => a.area_name),
  };
}

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
