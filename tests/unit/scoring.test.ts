import { describe, expect, it } from "vitest";
import { listJoin, nextUnlock, percent, scoreLesson, shuffle, starsFor, strengthsAndPractice, unlockedItems, weeklySummary } from "@/lib/learning/scoring";

describe("starsFor", () => {
  it("awards 3 stars for 90% or more", () => expect(starsFor(9, 10)).toBe(3));
  it("awards 2 stars from 60%", () => expect(starsFor(3, 5)).toBe(2));
  it("always awards at least 1 star for effort", () => expect(starsFor(0, 5)).toBe(1));
  it("handles empty activities", () => expect(starsFor(0, 0)).toBe(0));
});

describe("scoreLesson", () => {
  const qs = [{ prompt: "Which is A?", answer: "A" }, { prompt: "Count", target: "3" }, { prompt: "Shape", answer: "circle" }];
  it("is case and space insensitive", () => {
    expect(scoreLesson(qs, [" a", "3", "Circle "])).toEqual({ score: 3, max: 3, mistakes: [] });
  });
  it("lists mistakes by prompt", () => {
    expect(scoreLesson(qs, ["B", "3"]).mistakes).toEqual(["Which is A?", "Shape"]);
  });
});

describe("progress helpers", () => {
  it("percent rounds", () => expect(percent(2, 3)).toBe(67));
  it("unlocks decorations by stars", () => {
    expect(unlockedItems(6)).toEqual(["balloons", "kite"]);
    expect(nextUnlock(6)?.key).toBe("carousel");
    expect(nextUnlock(100)).toBeNull();
  });
  it("writes a weekly summary from real counts", () => {
    expect(weeklySummary("Amara", 4, ["Letters", "Counting"])).toBe("Amara completed four activities this week and is practising letters and counting.");
    expect(weeklySummary("Leo", 0, [])).toMatch(/not completed any/);
  });
  it("joins lists naturally", () => expect(listJoin(["a", "b", "c"])).toBe("a, b and c"));
  it("splits strengths and practice", () => {
    expect(strengthsAndPractice([{ area_name: "ABC", avg_pct: 90, attempts: 2 }, { area_name: "123", avg_pct: 40, attempts: 1 }])).toEqual({ strengths: ["ABC"], practice: ["123"] });
  });
  it("shuffle keeps all items", () => expect(shuffle([1, 2, 3, 4], () => 0.3).sort()).toEqual([1, 2, 3, 4]));
});
