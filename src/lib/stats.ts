import { addDays, daysBetween, weekStart } from "./dates";

export type CompletionRow = {
  id: string;
  workoutDay: number;
  doneOn: string;
  participants: string[];
  moves: string[];
  createdAt: Date | string;
};

export type SetRow = {
  userEmail: string;
  exerciseSlug: string;
  doneOn: string;
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
};

export function trainingSince(completions: CompletionRow[]): string | null {
  if (completions.length === 0) return null;
  return completions.reduce((min, c) => (c.doneOn < min ? c.doneOn : min), completions[0].doneOn);
}

export function countInWeek(completions: CompletionRow[], today: string): number {
  const start = weekStart(today);
  return completions.filter((c) => c.doneOn >= start && c.doneOn <= addDays(start, 6)).length;
}

// The current week only extends the streak once it has a workout, so a quiet Monday does not reset it.
export function weekStreak(completions: CompletionRow[], today: string): number {
  const weeks = new Set(completions.map((c) => weekStart(c.doneOn)));
  let cursor = weekStart(today);
  if (!weeks.has(cursor)) cursor = addDays(cursor, -7);
  let streak = 0;
  while (weeks.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -7);
  }
  return streak;
}

export type WeekBucket = { week: string; total: number; byMember: Record<string, number> };

export function weeklyCounts(
  completions: CompletionRow[],
  today: string,
  weeks: number,
  memberEmails: string[],
): WeekBucket[] {
  const current = weekStart(today);
  const buckets: WeekBucket[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const week = addDays(current, -7 * i);
    const inWeek = completions.filter((c) => weekStart(c.doneOn) === week);
    buckets.push({
      week,
      total: inWeek.length,
      byMember: Object.fromEntries(
        memberEmails.map((e) => [e, inWeek.filter((c) => c.participants.includes(e)).length]),
      ),
    });
  }
  return buckets;
}

export type HeatCell = { date: string; count: number; future: boolean };

export function heatmap(completions: CompletionRow[], today: string, weeks: number): HeatCell[][] {
  const counts = new Map<string, number>();
  for (const c of completions) counts.set(c.doneOn, (counts.get(c.doneOn) ?? 0) + 1);
  const first = addDays(weekStart(today), -7 * (weeks - 1));
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = addDays(first, w * 7 + d);
      return { date, count: counts.get(date) ?? 0, future: date > today };
    }),
  );
}

export type ProgressPoint = { date: string; topWeight: number | null; reps: number; volume: number };

export function exerciseProgress(sets: SetRow[], slug: string, email: string): ProgressPoint[] {
  const byDate = new Map<string, ProgressPoint>();
  for (const s of sets) {
    if (s.exerciseSlug !== slug || s.userEmail !== email) continue;
    if (s.weightKg == null && s.reps == null) continue;
    const point = byDate.get(s.doneOn) ?? { date: s.doneOn, topWeight: null, reps: 0, volume: 0 };
    if (s.weightKg != null) point.topWeight = Math.max(point.topWeight ?? 0, s.weightKg);
    point.reps += s.reps ?? 0;
    point.volume += (s.weightKg ?? 0) * (s.reps ?? 0);
    byDate.set(s.doneOn, point);
  }
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}

export type PersonalBest = { slug: string; email: string; weightKg: number; reps: number | null; date: string };

export function personalBests(sets: SetRow[]): PersonalBest[] {
  const best = new Map<string, PersonalBest>();
  for (const s of sets) {
    if (s.weightKg == null) continue;
    const key = `${s.userEmail}|${s.exerciseSlug}`;
    const current = best.get(key);
    const better =
      !current ||
      s.weightKg > current.weightKg ||
      (s.weightKg === current.weightKg && (s.reps ?? 0) > (current.reps ?? 0));
    if (better) {
      best.set(key, { slug: s.exerciseSlug, email: s.userEmail, weightKg: s.weightKg, reps: s.reps, date: s.doneOn });
    }
  }
  return [...best.values()];
}

export function loggedExercises(sets: SetRow[]): string[] {
  return [...new Set(sets.filter((s) => s.weightKg != null || s.reps != null).map((s) => s.exerciseSlug))];
}

export function daysTraining(since: string | null, today: string): number {
  return since ? daysBetween(since, today) + 1 : 0;
}
