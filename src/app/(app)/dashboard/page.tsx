import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/dashboard";
import { allCompletions, allSets } from "@/lib/data";
import { MEMBERS } from "@/lib/members";
import { exerciseProgress, loggedExercises } from "@/lib/stats";

export const metadata: Metadata = { title: "Stats" };

export default async function DashboardPage() {
  const [completions, sets] = await Promise.all([allCompletions(), allSets()]);
  const progress = Object.fromEntries(
    loggedExercises(sets).map((slug) => [
      slug,
      MEMBERS.map((m) => ({ member: m, points: exerciseProgress(sets, slug, m.email) })),
    ]),
  );
  return (
    <Dashboard
      completions={completions.map((c) => ({ ...c, createdAt: new Date(c.createdAt).toISOString() }))}
      progress={progress}
      members={MEMBERS}
    />
  );
}
