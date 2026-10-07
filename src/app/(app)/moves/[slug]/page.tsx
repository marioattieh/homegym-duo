import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MoveDetail } from "@/components/moves/move-detail";
import { allSets } from "@/lib/data";
import { MEMBERS } from "@/lib/members";
import { findExercise } from "@/lib/routine";
import { exerciseProgress, personalBests } from "@/lib/stats";

export async function generateMetadata({ params }: PageProps<"/moves/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: findExercise(slug)?.name ?? "Move" };
}

export default async function MovePage({ params }: PageProps<"/moves/[slug]">) {
  const { slug } = await params;
  const ex = findExercise(slug);
  if (!ex) notFound();
  const sets = (await allSets()).filter((s) => s.exerciseSlug === slug);
  const bests = personalBests(sets);
  const series = MEMBERS.map((m) => ({
    member: m,
    points: exerciseProgress(sets, slug, m.email),
    best: bests.find((b) => b.email === m.email) ?? null,
  }));
  return <MoveDetail slug={slug} series={series} />;
}
