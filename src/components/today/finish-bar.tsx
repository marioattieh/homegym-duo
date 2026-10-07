"use client";

import { motion } from "motion/react";
import { CalendarDays, Check, Loader2 } from "lucide-react";
import { useRef } from "react";
import { formatDay, localIsoDate } from "@/lib/dates";
import type { Member } from "@/lib/members";

type Props = {
  day: number;
  doneOn: string;
  onDoneOn: (d: string) => void;
  members: Member[];
  me: Member;
  participants: string[];
  onParticipants: (p: string[]) => void;
  pending: boolean;
  onFinish: () => void;
};

export function FinishBar({ day, doneOn, onDoneOn, members, me, participants, onParticipants, pending, onFinish }: Props) {
  const dateInput = useRef<HTMLInputElement>(null);
  const today = doneOn ? localIsoDate() : "";
  const isToday = doneOn === today;

  function toggleMember(email: string) {
    const next = participants.includes(email) ? participants.filter((e) => e !== email) : [...participants, email];
    if (next.length > 0) onParticipants(next);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="mt-8 rounded-3xl border border-line bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <div>
          <p className="mb-2 text-xs tracking-wider text-muted uppercase">Who trained</p>
          <div className="flex gap-2">
            {members.map((m) => {
              const on = participants.includes(m.email);
              return (
                <motion.button
                  key={m.email}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => toggleMember(m.email)}
                  aria-pressed={on}
                  className={`flex items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-1.5 text-sm transition-all ${
                    on ? "border-transparent bg-surface-2" : "border-line text-muted opacity-60"
                  }`}
                >
                  <span
                    className="grid size-6 place-items-center rounded-full text-xs font-bold text-bg transition-opacity"
                    style={{ background: m.color, opacity: on ? 1 : 0.35 }}
                  >
                    {m.name[0]}
                  </span>
                  {m.email === me.email ? "Me" : m.name}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs tracking-wider text-muted uppercase">When</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onDoneOn(localIsoDate())}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                isToday ? "border-volt bg-volt/10 text-volt" : "border-line text-muted hover:text-ink"
              }`}
            >
              Today
            </button>
            <label
              className={`relative flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                !isToday && doneOn ? "border-volt bg-volt/10 text-volt" : "border-line text-muted hover:text-ink"
              }`}
            >
              <CalendarDays className="size-4" />
              {!isToday && doneOn ? formatDay(doneOn) : "Earlier day"}
              <input
                ref={dateInput}
                type="date"
                value={doneOn}
                max={today}
                onChange={(e) => e.target.value && onDoneOn(e.target.value)}
                onClick={() => dateInput.current?.showPicker?.()}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Pick the date you trained"
              />
            </label>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={onFinish}
          disabled={pending || !doneOn}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="ml-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-volt px-6 py-4 font-display text-lg font-bold text-volt-ink shadow-[0_10px_40px_-12px_rgba(212,255,79,0.6)] disabled:opacity-60 sm:w-auto"
        >
          {pending ? <Loader2 className="size-5 animate-spin" /> : <Check className="size-5" strokeWidth={3} />}
          Finish Day {day}
        </motion.button>
      </div>
    </motion.section>
  );
}
