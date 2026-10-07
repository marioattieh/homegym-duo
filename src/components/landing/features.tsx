"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { Check } from "lucide-react";

const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

export function Features() {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <motion.h2
        {...reveal}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl"
      >
        Everything the two of you need. <span className="text-muted">Nothing you don&apos;t.</span>
      </motion.h2>
      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card index={0} title="Today" text="The app knows which day is next. Finish it now, or log one you did yesterday.">
          <TodayDemo />
        </Card>
        <Card index={1} title="Moves" text="Every move with start and end photos, form cues and a video from a coach you can trust.">
          <MovesDemo />
        </Card>
        <Card index={2} title="Stats" text="Weeks trained, streaks, and weight curves for each move. Only if you log them.">
          <StatsDemo />
        </Card>
        <Card index={3} title="Timer" text="Rest timer with presets and an alarm loud enough to hear over the music.">
          <TimerDemo />
        </Card>
      </div>
    </section>
  );
}

function Card({ index, title, text, children }: { index: number; title: string; text: string; children: ReactNode }) {
  return (
    <motion.article
      {...reveal}
      transition={{ duration: 0.8, delay: (index % 2) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-8"
    >
      <div className="relative h-44 overflow-hidden rounded-2xl border border-line bg-bg/60">{children}</div>
      <h3 className="mt-6 font-display text-2xl font-bold">{title}</h3>
      <p className="mt-2 text-muted">{text}</p>
    </motion.article>
  );
}

function useTicker(length: number, ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % length), ms);
    return () => clearInterval(id);
  }, [length, ms]);
  return i;
}

function TodayDemo() {
  const moves = ["Goblet squat", "Band glute bridge", "Bulgarian split squat", "Step-up"];
  const step = useTicker(moves.length + 2, 900);
  return (
    <div className="flex h-full flex-col justify-center gap-2 px-5">
      {moves.map((m, i) => {
        const done = step > i;
        return (
          <div key={m} className="flex items-center gap-3 text-sm">
            <motion.span
              animate={{ backgroundColor: done ? "#d4ff4f" : "rgba(0,0,0,0)", borderColor: done ? "#d4ff4f" : "#262b34" }}
              className="grid size-5 place-items-center rounded-md border"
            >
              <AnimatePresence>
                {done && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Check className="size-3.5 text-volt-ink" strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
            <span className={done ? "text-muted line-through decoration-volt/60" : ""}>{m}</span>
            <span className="ml-auto font-mono text-xs text-muted">3 sets</span>
          </div>
        );
      })}
    </div>
  );
}

function MovesDemo() {
  const frame = useTicker(2, 1100);
  return (
    <div className="relative h-full">
      {[1, 2].map((n) => (
        <motion.div key={n} className="absolute inset-0" animate={{ opacity: frame === n - 1 ? 1 : 0 }} transition={{ duration: 0.5 }}>
          <Image src={`/exercises/goblet-squat/${n}.jpg`} alt="" fill sizes="400px" className="object-cover object-center opacity-90" />
        </motion.div>
      ))}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg to-transparent p-4 pt-10">
        <p className="font-display font-semibold">Goblet squat</p>
        <p className="text-xs text-muted">Quads · Glutes · Adductors</p>
      </div>
    </div>
  );
}

function StatsDemo() {
  const bars = [3, 4, 2, 4, 3, 4, 4, 1];
  return (
    <div className="flex h-full items-end gap-2 px-5 pb-5">
      {bars.map((b, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          whileInView={{ height: `${(b / 4) * 75}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          className={`flex-1 rounded-t-md ${i === bars.length - 1 ? "bg-volt" : "bg-surface-2"}`}
        />
      ))}
    </div>
  );
}

function TimerDemo() {
  const r = 52;
  const len = 2 * Math.PI * r;
  return (
    <div className="grid h-full place-items-center">
      <div className="relative size-32">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#262b34" strokeWidth="8" />
          <motion.circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="#d4ff4f"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={len}
            animate={{ strokeDashoffset: [0, len] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-mono text-2xl">1:30</span>
      </div>
    </div>
  );
}
