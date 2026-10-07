import { describe, expect, it } from "vitest";
import { EXERCISES, ROUTINE, daysUsing, latestCompletion, nextDayAfter } from "./routine";

describe("routine", () => {
  it("has every routine move in the exercise library with two images and a video", () => {
    for (const day of ROUTINE) {
      for (const move of day.moves) {
        const ex = EXERCISES.find((e) => e.slug === move.slug);
        expect(ex, move.slug).toBeDefined();
        expect(ex!.images).toHaveLength(2);
        expect(ex!.video.url).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/);
      }
    }
  });

  it("matches the agreed day sizes", () => {
    expect(ROUTINE.map((d) => d.moves.length)).toEqual([6, 6, 5, 5]);
  });

  it("shares the seated shoulder press between days 2 and 4", () => {
    expect(daysUsing("seated-dumbbell-shoulder-press")).toEqual([2, 4]);
  });
});

describe("nextDayAfter", () => {
  it("starts at day 1", () => {
    expect(nextDayAfter(undefined)).toBe(1);
  });

  it("cycles 1→2→3→4→1", () => {
    const next = [1, 2, 3, 4].map((d) => nextDayAfter({ workoutDay: d, doneOn: "2026-10-01", createdAt: new Date() }));
    expect(next).toEqual([2, 3, 4, 1]);
  });
});

describe("latestCompletion", () => {
  it("uses the most recent date, not the most recently entered row", () => {
    const rows = [
      { workoutDay: 2, doneOn: "2026-10-05", createdAt: "2026-10-05T10:00:00Z" },
      { workoutDay: 1, doneOn: "2026-10-01", createdAt: "2026-10-06T10:00:00Z" },
    ];
    expect(latestCompletion(rows)?.workoutDay).toBe(2);
  });

  it("breaks same-day ties by entry time", () => {
    const rows = [
      { workoutDay: 1, doneOn: "2026-10-05", createdAt: "2026-10-05T10:00:00Z" },
      { workoutDay: 2, doneOn: "2026-10-05", createdAt: "2026-10-05T18:00:00Z" },
    ];
    expect(latestCompletion(rows)?.workoutDay).toBe(2);
  });
});
