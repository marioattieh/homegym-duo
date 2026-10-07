"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { finishDay } from "@/app/actions";
import { PageHeader } from "@/components/page-header";
import { formatDay, localIsoDate } from "@/lib/dates";
import type { Member } from "@/lib/members";
import { ROUTINE, workoutDay } from "@/lib/routine";
import { Celebration } from "./celebration";
import { FinishBar } from "./finish-bar";
import { MoveRow } from "./move-row";

type Props = {
  suggestedDay: number;
  latest: { day: number; doneOn: string } | null;
  totalWorkouts: number;
  me: Member;
  members: Member[];
};

const checkedKey = (day: number) => `hgd-checked-${day}`;

function readChecked(day: number): string[] {
  try {
    return JSON.parse(localStorage.getItem(checkedKey(day)) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function TodayView({ suggestedDay, latest, totalWorkouts, me, members }: Props) {
  const [day, setDay] = useState(suggestedDay);
  const [shownSuggestion, setShownSuggestion] = useState(suggestedDay);
  const [checked, setChecked] = useState<string[]>([]);
  const [doneOn, setDoneOn] = useState("");
  const [participants, setParticipants] = useState(members.map((m) => m.email));
  const [celebrate, setCelebrate] = useState<{ day: number; next: number } | null>(null);
  const [pending, startTransition] = useTransition();
  const closeCelebration = useCallback(() => setCelebrate(null), []);

  if (shownSuggestion !== suggestedDay) {
    setShownSuggestion(suggestedDay);
    setDay(suggestedDay);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- local date and storage are client-only
    setDoneOn((d) => d || localIsoDate());
    setChecked(readChecked(day));
  }, [day]);

  const plan = workoutDay(day);

  function toggle(slug: string) {
    setChecked((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      try {
        localStorage.setItem(checkedKey(day), JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function finish() {
    const moves = checked.length > 0 ? checked : plan.moves.map((m) => m.slug);
    startTransition(async () => {
      try {
        await finishDay({ day, doneOn, participants, moves });
        try {
          localStorage.removeItem(checkedKey(day));
        } catch {}
        setChecked([]);
        setCelebrate({ day, next: (day % 4) + 1 });
        if ("vibrate" in navigator) navigator.vibrate?.([30, 40, 60]);
      } catch {
        toast.error("Couldn't save that. Check your connection and try again.");
      }
    });
  }

  const progress = checked.length / plan.moves.length;

  return (
    <div>
      <PageHeader
        eyebrow={latest ? `Last: Day ${latest.day} · ${formatDay(latest.doneOn)}` : "Let's start the cycle"}
        title={
          <span className="flex items-baseline gap-3">
            <span className="relative inline-block h-[1.1em] overflow-hidden align-bottom">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={day}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="block"
                >
                  Day {day}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="text-muted">· {plan.title}</span>
          </span>
        }
      >
        <DayPicker day={day} suggested={suggestedDay} onPick={setDay} />
      </PageHeader>

      <div className="mb-5 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className="h-full rounded-full bg-volt"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <span className="font-mono text-xs text-muted tabular-nums">
          {checked.length}/{plan.moves.length} moves
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.ul
          key={day}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          className="space-y-3"
        >
          {plan.moves.map((m, i) => (
            <MoveRow
              key={m.slug}
              index={i}
              slug={m.slug}
              sets={m.sets}
              checked={checked.includes(m.slug)}
              onToggle={() => toggle(m.slug)}
              logDate={doneOn}
            />
          ))}
        </motion.ul>
      </AnimatePresence>

      <FinishBar
        day={day}
        doneOn={doneOn}
        onDoneOn={setDoneOn}
        members={members}
        me={me}
        participants={participants}
        onParticipants={setParticipants}
        pending={pending}
        onFinish={finish}
      />

      {totalWorkouts === 0 && (
        <p className="mt-6 text-center text-sm text-muted">
          Your first finished day starts the clock on the Stats page.
        </p>
      )}

      <Celebration data={celebrate} onClose={closeCelebration} />
    </div>
  );
}

function DayPicker({ day, suggested, onPick }: { day: number; suggested: number; onPick: (d: number) => void }) {
  return (
    <div className="flex gap-1 rounded-full border border-line bg-surface p-1" role="tablist" aria-label="Workout day">
      {ROUTINE.map((d) => (
        <button
          key={d.day}
          type="button"
          role="tab"
          aria-selected={day === d.day}
          onClick={() => onPick(d.day)}
          className={`relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            day === d.day ? "text-volt-ink" : "text-muted hover:text-ink"
          }`}
        >
          {day === d.day && (
            <motion.span
              layoutId="day-pill"
              className="absolute inset-0 rounded-full bg-volt"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            />
          )}
          <span className="relative">D{d.day}</span>
          {suggested === d.day && day !== d.day && (
            <span className="absolute top-1 right-1 size-1.5 rounded-full bg-volt" aria-label="Up next" />
          )}
        </button>
      ))}
    </div>
  );
}
