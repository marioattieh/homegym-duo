# Homegym Duo — design (approved 2026-10-07)

## Goal
Track a couple's 4-day home-gym routine: which day was finished, which moves were done, and optional kg/reps per set.

## Decisions
- **Users**: Google sign-in, allow-list of two emails (`src/lib/members.ts`), enforced in the Auth.js `signIn` callback and on every page/server action.
- **Cycle**: one shared cycle. Next day = (day of the completion with the latest `done_on`, ties by `created_at`) % 4 + 1; first ever is Day 1. Any day can be picked manually.
- **Finishing**: records `workout_day`, `done_on` (today or a picked past date), participants (default both), checked moves (default all).
- **Sets**: per person, per move, per date, per set number; weight (kg) and reps both optional. Upsert on blur; clearing both deletes.
- **Data**: Supabase free Postgres, private `app` schema, server-only `homegym_app` role via Supavisor transaction pooler. Daily Vercel cron keeps the project from pausing.
- **Media**: two public-domain photos per move from free-exercise-db stored in `public/exercises`; one verified YouTube tutorial per move.
- **Stats**: training days since first workout, total workouts, this week x/4, weekly streak (weeks with ≥1 workout, current week counts once it has one), workouts/week bars (12 weeks), 18-week heatmap, per-move top weight/volume/reps lines per person, history with delete.
- **Timer**: countdown with presets and custom time, ±15 s, alarm (Web Audio beeps + vibration + notification when hidden), wake lock, state persisted locally, mini timer on other pages.
- **Units**: kg only. Dark theme only.
