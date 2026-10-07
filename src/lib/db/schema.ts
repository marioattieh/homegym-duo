import { date, numeric, pgSchema, smallint, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const app = pgSchema("app");

export const completions = app.table("completions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workoutDay: smallint("workout_day").notNull(),
  doneOn: date("done_on").notNull(),
  participants: text("participants").array().notNull(),
  moves: text("moves").array().notNull().default([]),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const setLogs = app.table(
  "set_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userEmail: text("user_email").notNull(),
    exerciseSlug: text("exercise_slug").notNull(),
    doneOn: date("done_on").notNull(),
    setNumber: smallint("set_number").notNull(),
    weightKg: numeric("weight_kg", { precision: 6, scale: 2, mode: "number" }),
    reps: smallint("reps"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.userEmail, t.exerciseSlug, t.doneOn, t.setNumber)],
);

export const heartbeat = app.table("heartbeat", {
  id: smallint("id").primaryKey(),
  pingedAt: timestamp("pinged_at", { withTimezone: true }).notNull().defaultNow(),
});
