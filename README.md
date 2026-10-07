# Homegym Duo

Workout tracker for a two-person, four-day home gym routine (2 upper, 2 lower days).

- **Today** – the next day in the shared 1→4 cycle. Tick moves, log optional kg/reps per set, finish the day for today or a past date.
- **Moves** – all 21 moves with start/finish photos, form cues and a YouTube tutorial.
- **Stats** – time training, weekly streak, workouts per week, an 18-week heatmap and per-move progress charts.
- **Timer** – rest timer with presets, alarm sound, vibration and notification. Keeps running across pages.

## Stack

Next.js 16 (App Router, server actions) · Tailwind CSS 4 · Motion · Recharts · Auth.js v5 (Google) · Drizzle ORM · Supabase Postgres (free tier) · Vercel (Hobby).

Only the two emails in `src/lib/members.ts` can sign in. The database is reached only from the server through a dedicated `homegym_app` role whose tables live in a private `app` schema (not exposed by the Supabase Data API). A daily Vercel cron hits `/api/cron/keepalive` so the free Supabase project never pauses.

## Environment

| Variable | What |
| --- | --- |
| `AUTH_SECRET` | Random string for Auth.js session encryption |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth web client |
| `DATABASE_URL` | Supavisor transaction-pooler URL for the `homegym_app` role |
| `CRON_SECRET` | Bearer token Vercel Cron sends to the keep-alive route |

Google OAuth redirect URIs:

- `https://homegym-duo.vercel.app/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/google`

## Develop

```bash
pnpm install
pnpm dev
pnpm test
```

## Credits

Exercise photos from [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (public domain, Unlicense). Videos link to their creators on YouTube.
