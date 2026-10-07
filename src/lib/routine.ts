import exercisesJson from "@/data/exercises.json";

export type Exercise = {
  slug: string;
  name: string;
  muscles: string[];
  equipment: string;
  cues: string[];
  images: string[];
  imageSource: { type: string; id?: string; url?: string; author?: string; license?: string };
  video: { url: string; title: string; channel: string };
};

export type WorkoutDay = {
  day: 1 | 2 | 3 | 4;
  title: string;
  focus: "Lower" | "Upper";
  moves: { slug: string; sets: number }[];
};

export const EXERCISES: Exercise[] = exercisesJson as Exercise[];

const bySlug = new Map(EXERCISES.map((e) => [e.slug, e]));

export function exercise(slug: string): Exercise {
  const found = bySlug.get(slug);
  if (!found) throw new Error(`Unknown exercise: ${slug}`);
  return found;
}

export function findExercise(slug: string): Exercise | undefined {
  return bySlug.get(slug);
}

const threeSets = (...slugs: string[]) => slugs.map((slug) => ({ slug, sets: 3 }));

export const ROUTINE: WorkoutDay[] = [
  {
    day: 1,
    title: "Lower A",
    focus: "Lower",
    moves: threeSets(
      "goblet-squat",
      "band-glute-bridge",
      "bulgarian-split-squat",
      "band-lateral-walk",
      "step-up",
      "hamstring-leg-curl",
    ),
  },
  {
    day: 2,
    title: "Upper A",
    focus: "Upper",
    moves: threeSets(
      "dumbbell-bench-press",
      "band-pull-apart",
      "seated-dumbbell-shoulder-press",
      "one-arm-dumbbell-row",
      "incline-dumbbell-bench-press",
      "dumbbell-lateral-raise",
    ),
  },
  {
    day: 3,
    title: "Lower B",
    focus: "Lower",
    moves: threeSets(
      "dumbbell-reverse-lunge",
      "leg-extension",
      "sumo-squat",
      "glute-bridge",
      "romanian-deadlift",
    ),
  },
  {
    day: 4,
    title: "Upper B",
    focus: "Upper",
    moves: threeSets(
      "seated-dumbbell-shoulder-press",
      "dumbbell-chest-fly",
      "seated-bench-row",
      "dumbbell-bicep-curl",
      "overhead-tricep-extension",
    ),
  },
];

export function workoutDay(day: number): WorkoutDay {
  return ROUTINE[(((day - 1) % 4) + 4) % 4];
}

export function daysUsing(slug: string): number[] {
  return ROUTINE.filter((d) => d.moves.some((m) => m.slug === slug)).map((d) => d.day);
}

export type CompletionLike = { workoutDay: number; doneOn: string; createdAt: Date | string };

export function latestCompletion<T extends CompletionLike>(completions: T[]): T | undefined {
  return [...completions].sort((a, b) => {
    if (a.doneOn !== b.doneOn) return a.doneOn < b.doneOn ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })[0];
}

export function nextDayAfter(latest: CompletionLike | undefined): 1 | 2 | 3 | 4 {
  if (!latest) return 1;
  return ((latest.workoutDay % 4) + 1) as 1 | 2 | 3 | 4;
}

export function imageUrl(ex: Exercise, index: number): string {
  return `/exercises/${ex.slug}/${ex.images[index]}`;
}
