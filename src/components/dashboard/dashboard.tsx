"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarRange, Flame, Hourglass, Trophy } from "lucide-react";
import type { Series } from "@/components/charts/progress-chart";
import { ProgressChart } from "@/components/charts/progress-chart";
import { PageHeader } from "@/components/page-header";
import { formatDay, localIsoDate } from "@/lib/dates";
import type { Member } from "@/lib/members";
import { exercise } from "@/lib/routine";
import {
  countInWeek,
  daysTraining,
  heatmap,
  trainingSince,
  weekStreak,
  weeklyCounts,
  type CompletionRow,
} from "@/lib/stats";
import { Heatmap } from "./heatmap";
import { History } from "./history";
import { WeeklyChart } from "./weekly-chart";

type Props = {
  completions: CompletionRow[];
  progress: Record<string, Series[]>;
  members: Member[];
};

export function Dashboard({ completions, progress, members }: Props) {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- local date is client-only
    setToday(localIsoDate());
  }, []);

  const slugs = Object.keys(progress);
  const [selected, setSelected] = useState(slugs[0] ?? "");

  const stats = useMemo(() => {
    if (!today) return null;
    const since = trainingSince(completions);
    return {
      since,
      days: daysTraining(since, today),
      total: completions.length,
      thisWeek: countInWeek(completions, today),
      streak: weekStreak(completions, today),
      weeks: weeklyCounts(completions, today, 12, members.map((m) => m.email)),
      heat: heatmap(completions, today, 18),
    };
  }, [completions, today, members]);

  if (!stats) return <PageHeader eyebrow="Since day one" title="Stats" />;

  return (
    <div>
      <PageHeader eyebrow={stats.since ? `Since ${formatDay(stats.since, { weekday: undefined, year: "numeric" })}` : "Since day one"} title="Stats" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile index={0} icon={Hourglass} label="Training for" value={stats.days} suffix={stats.days === 1 ? "day" : "days"} sub={weeksLabel(stats.days)} />
        <Tile index={1} icon={Trophy} label="Workouts" value={stats.total} suffix="done" sub={perPerson(completions, members)} />
        <Tile index={2} icon={CalendarRange} label="This week" value={stats.thisWeek} suffix="/ 4" sub={stats.thisWeek >= 4 ? "Week complete" : `${4 - stats.thisWeek} to go`} />
        <Tile index={3} icon={Flame} label="Week streak" value={stats.streak} suffix={stats.streak === 1 ? "week" : "weeks"} sub="Weeks with a workout" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <Card title="Workouts per week" delay={0.1}>
          <WeeklyChart weeks={stats.weeks} />
        </Card>
        <Card title="Last 18 weeks" delay={0.15}>
          <Heatmap weeks={stats.heat} />
        </Card>
      </div>

      <Card title="Lifts" delay={0.2} className="mt-6">
        {slugs.length > 0 ? (
          <>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              aria-label="Move"
              className="mb-4 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-volt sm:w-auto"
            >
              {slugs.map((s) => (
                <option key={s} value={s}>
                  {exercise(s).name}
                </option>
              ))}
            </select>
            <ProgressChart key={selected} series={progress[selected]} height={300} />
          </>
        ) : (
          <p className="py-10 text-center text-sm text-muted">
            Log weights or reps on any move and the curves will show up here.
          </p>
        )}
      </Card>

      <Card title="History" delay={0.25} className="mt-6">
        <History completions={completions} members={members} />
      </Card>
    </div>
  );
}

function weeksLabel(days: number) {
  if (days === 0) return "Finish a day to start";
  const w = Math.floor(days / 7);
  const d = days % 7;
  return w === 0 ? "First week" : `${w} wk${w > 1 ? "s" : ""}${d ? ` ${d} d` : ""}`;
}

function perPerson(completions: CompletionRow[], members: Member[]) {
  return members.map((m) => `${m.name} ${completions.filter((c) => c.participants.includes(m.email)).length}`).join(" · ");
}

function Card({
  title,
  delay,
  className = "",
  children,
}: {
  title: string;
  delay: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-3xl border border-line bg-surface p-5 ${className}`}
    >
      <h2 className="mb-4 font-display text-lg font-semibold">{title}</h2>
      {children}
    </motion.section>
  );
}

function Tile({
  index,
  icon: Icon,
  label,
  value,
  suffix,
  sub,
}: {
  index: number;
  icon: typeof Flame;
  label: string;
  value: number;
  suffix: string;
  sub: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-3xl border border-line bg-surface p-4 sm:p-5"
    >
      <p className="flex items-center gap-2 text-xs tracking-wider text-muted uppercase">
        <Icon className="size-3.5 text-volt" /> {label}
      </p>
      <p className="mt-3 flex items-baseline gap-1.5">
        <CountUp value={value} className="font-display text-4xl font-bold tabular-nums sm:text-5xl" />
        <span className="text-sm text-muted">{suffix}</span>
      </p>
      <p className="mt-1 truncate text-xs text-muted">{sub}</p>
    </motion.div>
  );
}

function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, { duration: 1.2, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, value, mv]);
  return (
    <motion.span ref={ref} className={className}>
      {rounded}
    </motion.span>
  );
}
