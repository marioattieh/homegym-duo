import { describe, expect, it } from "vitest";
import { isIsoDate, weekStart } from "./dates";
import {
  countInWeek,
  daysTraining,
  exerciseProgress,
  heatmap,
  personalBests,
  trainingSince,
  weekStreak,
  weeklyCounts,
  type CompletionRow,
  type SetRow,
} from "./stats";

const A = "a@x.com";
const B = "b@x.com";

const done = (doneOn: string, participants = [A, B]): CompletionRow => ({
  id: doneOn,
  workoutDay: 1,
  doneOn,
  participants,
  moves: [],
  createdAt: `${doneOn}T10:00:00Z`,
});

const set = (doneOn: string, setNumber: number, weightKg: number | null, reps: number | null, userEmail = A): SetRow => ({
  userEmail,
  exerciseSlug: "goblet-squat",
  doneOn,
  setNumber,
  weightKg,
  reps,
});

describe("dates", () => {
  it("starts weeks on Monday", () => {
    expect(weekStart("2026-10-07")).toBe("2026-10-05");
    expect(weekStart("2026-10-11")).toBe("2026-10-05");
    expect(weekStart("2026-10-05")).toBe("2026-10-05");
  });

  it("rejects impossible dates", () => {
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-02-28")).toBe(true);
    expect(isIsoDate("26-2-28")).toBe(false);
  });
});

describe("training time", () => {
  it("counts days inclusively from the first workout", () => {
    const rows = [done("2026-10-03"), done("2026-09-28")];
    expect(trainingSince(rows)).toBe("2026-09-28");
    expect(daysTraining("2026-09-28", "2026-10-07")).toBe(10);
    expect(daysTraining(null, "2026-10-07")).toBe(0);
  });

  it("counts this week's workouts only", () => {
    const rows = [done("2026-10-04"), done("2026-10-05"), done("2026-10-07")];
    expect(countInWeek(rows, "2026-10-07")).toBe(2);
  });
});

describe("weekStreak", () => {
  it("does not break the streak on a quiet start of the week", () => {
    const rows = [done("2026-09-22"), done("2026-09-29"), done("2026-10-01")];
    expect(weekStreak(rows, "2026-10-05")).toBe(2);
  });

  it("includes the current week once it has a workout", () => {
    const rows = [done("2026-09-29"), done("2026-10-06")];
    expect(weekStreak(rows, "2026-10-07")).toBe(2);
  });

  it("stops at a gap", () => {
    const rows = [done("2026-09-15"), done("2026-10-06")];
    expect(weekStreak(rows, "2026-10-07")).toBe(1);
  });

  it("is zero with no recent workouts", () => {
    expect(weekStreak([done("2026-08-01")], "2026-10-07")).toBe(0);
  });
});

describe("weeklyCounts and heatmap", () => {
  it("buckets per week and per member, oldest first", () => {
    const rows = [done("2026-09-29", [A]), done("2026-10-06"), done("2026-10-07", [B])];
    const weeks = weeklyCounts(rows, "2026-10-07", 2, [A, B]);
    expect(weeks).toEqual([
      { week: "2026-09-28", total: 1, byMember: { [A]: 1, [B]: 0 } },
      { week: "2026-10-05", total: 2, byMember: { [A]: 1, [B]: 2 } },
    ]);
  });

  it("lays out full Monday-first weeks and marks the future", () => {
    const grid = heatmap([done("2026-10-06")], "2026-10-07", 2);
    expect(grid).toHaveLength(2);
    expect(grid[0][0].date).toBe("2026-09-28");
    expect(grid[1][1]).toEqual({ date: "2026-10-06", count: 1, future: false });
    expect(grid[1][3].future).toBe(true);
  });
});

describe("exercise progress", () => {
  const sets = [
    set("2026-10-01", 1, 10, 12),
    set("2026-10-01", 2, 12, 10),
    set("2026-10-01", 3, null, 8),
    set("2026-10-05", 1, 14, 8),
    set("2026-10-05", 1, 20, 5, B),
  ];

  it("summarises each session for one person", () => {
    expect(exerciseProgress(sets, "goblet-squat", A)).toEqual([
      { date: "2026-10-01", topWeight: 12, reps: 30, volume: 240 },
      { date: "2026-10-05", topWeight: 14, reps: 8, volume: 112 },
    ]);
  });

  it("finds each person's heaviest set", () => {
    const bests = personalBests(sets);
    expect(bests.find((b) => b.email === A)).toMatchObject({ weightKg: 14, reps: 8, date: "2026-10-05" });
    expect(bests.find((b) => b.email === B)).toMatchObject({ weightKg: 20, reps: 5 });
  });
});
