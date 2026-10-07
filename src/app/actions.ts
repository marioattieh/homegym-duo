"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { isIsoDate, localIsoDate, addDays } from "@/lib/dates";
import { previousSession, setsOn } from "@/lib/data";
import { getDb } from "@/lib/db";
import { completions, setLogs } from "@/lib/db/schema";
import { MEMBERS } from "@/lib/members";
import { findExercise, workoutDay } from "@/lib/routine";
import { requireMember } from "@/lib/session";

const isoDate = z.string().refine(isIsoDate, "Invalid date");
const memberEmail = z.string().refine((e) => MEMBERS.some((m) => m.email === e), "Unknown member");

const finishSchema = z.object({
  day: z.number().int().min(1).max(4),
  doneOn: isoDate,
  participants: z.array(memberEmail).min(1),
  moves: z.array(z.string()),
});

function revalidateApp() {
  for (const path of ["/today", "/dashboard", "/moves"]) revalidatePath(path, "layout");
}

export async function finishDay(input: z.input<typeof finishSchema>) {
  const member = await requireMember();
  const data = finishSchema.parse(input);
  // Allow one day of slack for timezones ahead of the server clock.
  if (data.doneOn > addDays(localIsoDate(), 1)) throw new Error("Date is in the future");
  const allowed = new Set(workoutDay(data.day).moves.map((m) => m.slug));
  await getDb().insert(completions).values({
    workoutDay: data.day,
    doneOn: data.doneOn,
    participants: [...new Set(data.participants)],
    moves: data.moves.filter((m) => allowed.has(m)),
    createdBy: member.email,
  });
  revalidateApp();
}

export async function deleteCompletion(id: string) {
  await requireMember();
  await getDb().delete(completions).where(eq(completions.id, z.uuid().parse(id)));
  revalidateApp();
}

const setSchema = z.object({
  slug: z.string().refine((s) => Boolean(findExercise(s)), "Unknown exercise"),
  doneOn: isoDate,
  setNumber: z.number().int().min(1).max(10),
  weightKg: z.number().min(0).max(999).nullable(),
  reps: z.number().int().min(0).max(999).nullable(),
});

export async function saveSet(input: z.input<typeof setSchema>) {
  const member = await requireMember();
  const data = setSchema.parse(input);
  const db = getDb();
  const key = and(
    eq(setLogs.userEmail, member.email),
    eq(setLogs.exerciseSlug, data.slug),
    eq(setLogs.doneOn, data.doneOn),
    eq(setLogs.setNumber, data.setNumber),
  );
  if (data.weightKg == null && data.reps == null) {
    await db.delete(setLogs).where(key);
  } else {
    await db
      .insert(setLogs)
      .values({
        userEmail: member.email,
        exerciseSlug: data.slug,
        doneOn: data.doneOn,
        setNumber: data.setNumber,
        weightKg: data.weightKg,
        reps: data.reps,
      })
      .onConflictDoUpdate({
        target: [setLogs.userEmail, setLogs.exerciseSlug, setLogs.doneOn, setLogs.setNumber],
        set: { weightKg: data.weightKg, reps: data.reps, updatedAt: new Date() },
      });
  }
  revalidatePath("/dashboard");
}

export async function loadExerciseLog(slug: string, doneOn: string) {
  const member = await requireMember();
  if (!findExercise(slug) || !isIsoDate(doneOn)) throw new Error("Bad request");
  const [current, previous] = await Promise.all([
    setsOn(member.email, doneOn).then((rows) => rows.filter((r) => r.exerciseSlug === slug)),
    previousSession(member.email, slug, doneOn),
  ]);
  return { current, previous };
}

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/today" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
