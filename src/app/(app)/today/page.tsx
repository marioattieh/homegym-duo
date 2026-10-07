import type { Metadata } from "next";
import { TodayView } from "@/components/today/today-view";
import { allCompletions } from "@/lib/data";
import { MEMBERS } from "@/lib/members";
import { latestCompletion, nextDayAfter } from "@/lib/routine";
import { requireMember } from "@/lib/session";

export const metadata: Metadata = { title: "Today" };

export default async function TodayPage() {
  const [member, completions] = await Promise.all([requireMember(), allCompletions()]);
  const latest = latestCompletion(completions);
  return (
    <TodayView
      suggestedDay={nextDayAfter(latest)}
      latest={latest ? { day: latest.workoutDay, doneOn: latest.doneOn } : null}
      totalWorkouts={completions.length}
      me={member}
      members={MEMBERS}
    />
  );
}
