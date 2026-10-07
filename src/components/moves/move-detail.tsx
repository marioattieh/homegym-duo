"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowLeft, PlayCircle, Trophy } from "lucide-react";
import { ProgressChart } from "@/components/charts/progress-chart";
import { SetLogger } from "@/components/set-logger";
import { formatDay, localIsoDate } from "@/lib/dates";
import type { Member } from "@/lib/members";
import { daysUsing, exercise, imageUrl, workoutDay } from "@/lib/routine";
import type { PersonalBest, ProgressPoint } from "@/lib/stats";

type Props = {
  slug: string;
  series: { member: Member; points: ProgressPoint[]; best: PersonalBest | null }[];
};

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
});

export function MoveDetail({ slug, series }: Props) {
  const ex = exercise(slug);
  const [logDate, setLogDate] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- local date is client-only
    setLogDate(localIsoDate());
  }, []);

  return (
    <div>
      <Link href="/moves" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
        <ArrowLeft className="size-4" /> All moves
      </Link>

      <motion.div {...rise(0)} className="mb-8">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {daysUsing(slug).map((d) => (
            <span key={d} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-muted">
              Day {d} · {workoutDay(d).title}
            </span>
          ))}
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{ex.name}</h1>
        <p className="mt-2 text-muted">
          {ex.muscles.join(" · ")} — {ex.equipment}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <motion.div {...rise(0.08)} className="grid grid-cols-2 items-start gap-3">
          {ex.images.map((_, i) => (
            <figure key={i} className="overflow-hidden rounded-3xl border border-line bg-surface">
              <div className="relative aspect-[4/3]">
                <Image
                  src={imageUrl(ex, i)}
                  alt={`${ex.name}, ${i === 0 ? "start" : "finish"} position`}
                  fill
                  sizes="(min-width: 1024px) 30vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
              <figcaption className="px-3 py-2 font-mono text-[11px] tracking-wider text-muted uppercase">
                {i === 0 ? "Start" : "Finish"}
              </figcaption>
            </figure>
          ))}
        </motion.div>

        <motion.div {...rise(0.16)} className="rounded-3xl border border-line bg-surface p-5">
          <h2 className="font-display text-lg font-semibold">Form cues</h2>
          <ol className="mt-3 space-y-3">
            {ex.cues.map((c, i) => (
              <li key={c} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-volt/10 font-mono text-xs text-volt">
                  {i + 1}
                </span>
                <span className="text-ink/90">{c}</span>
              </li>
            ))}
          </ol>
          <a
            href={ex.video.url}
            target="_blank"
            rel="noreferrer"
            className="group mt-5 flex items-center gap-3 rounded-2xl bg-surface-2 p-3 transition-colors hover:bg-line"
          >
            <PlayCircle className="size-9 shrink-0 text-danger transition-transform group-hover:scale-110" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{ex.video.title}</span>
              <span className="block truncate text-xs text-muted">{ex.video.channel} · YouTube</span>
            </span>
          </a>
        </motion.div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <motion.div {...rise(0.24)}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Log a session</h2>
            <input
              type="date"
              value={logDate}
              max={logDate ? localIsoDate() : undefined}
              onChange={(e) => e.target.value && setLogDate(e.target.value)}
              aria-label="Date to log"
              className="rounded-xl border border-line bg-surface px-3 py-1.5 text-sm outline-none focus:border-volt"
            />
          </div>
          {logDate && <SetLogger slug={slug} sets={3} doneOn={logDate} />}
        </motion.div>

        <motion.div {...rise(0.32)} className="rounded-3xl border border-line bg-surface p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Progress</h2>
            <div className="flex flex-wrap gap-2">
              {series.map(
                (s) =>
                  s.best && (
                    <span key={s.member.email} className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs">
                      <Trophy className="size-3.5 text-volt" />
                      <span className="text-muted">{s.member.name}</span>
                      <span className="font-mono font-semibold">
                        {s.best.weightKg} kg{s.best.reps ? ` × ${s.best.reps}` : ""}
                      </span>
                      <span className="text-muted">· {formatDay(s.best.date, { weekday: undefined })}</span>
                    </span>
                  ),
              )}
            </div>
          </div>
          <ProgressChart series={series} />
        </motion.div>
      </div>
    </div>
  );
}
