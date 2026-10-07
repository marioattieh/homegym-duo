import "server-only";
import { and, asc, desc, eq, lt } from "drizzle-orm";
import { getDb } from "./db";
import { completions, setLogs } from "./db/schema";
import type { CompletionRow, SetRow } from "./stats";

const setColumns = {
  userEmail: setLogs.userEmail,
  exerciseSlug: setLogs.exerciseSlug,
  doneOn: setLogs.doneOn,
  setNumber: setLogs.setNumber,
  weightKg: setLogs.weightKg,
  reps: setLogs.reps,
};

export async function allCompletions(): Promise<CompletionRow[]> {
  return getDb().select().from(completions).orderBy(desc(completions.doneOn), desc(completions.createdAt));
}

export async function allSets(): Promise<SetRow[]> {
  return getDb()
    .select(setColumns)
    .from(setLogs)
    .orderBy(asc(setLogs.doneOn), asc(setLogs.setNumber));
}

export async function setsOn(email: string, doneOn: string): Promise<SetRow[]> {
  return getDb()
    .select(setColumns)
    .from(setLogs)
    .where(and(eq(setLogs.userEmail, email), eq(setLogs.doneOn, doneOn)));
}

export async function previousSession(email: string, slug: string, before: string): Promise<SetRow[]> {
  const db = getDb();
  const [last] = await db
    .select({ doneOn: setLogs.doneOn })
    .from(setLogs)
    .where(and(eq(setLogs.userEmail, email), eq(setLogs.exerciseSlug, slug), lt(setLogs.doneOn, before)))
    .orderBy(desc(setLogs.doneOn))
    .limit(1);
  if (!last) return [];
  return db
    .select(setColumns)
    .from(setLogs)
    .where(and(eq(setLogs.userEmail, email), eq(setLogs.exerciseSlug, slug), eq(setLogs.doneOn, last.doneOn)))
    .orderBy(asc(setLogs.setNumber));
}
