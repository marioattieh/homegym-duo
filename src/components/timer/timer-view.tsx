"use client";

import { AnimatePresence, motion } from "motion/react";
import { Bell, BellOff, Minus, Pause, Play, Plus, RotateCcw } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { formatClock, useTimer } from "./timer-context";

const PRESETS = [30, 45, 60, 90, 120, 180];
const R = 140;
const LEN = 2 * Math.PI * R;

export function TimerView() {
  const timer = useTimer();
  const [customMin, setCustomMin] = useState(1);
  const [customSec, setCustomSec] = useState(30);
  const progress = timer.duration > 0 ? timer.left / timer.duration : 0;
  const done = timer.status === "done";
  const running = timer.status === "running";

  return (
    <div>
      <PageHeader eyebrow="Rest between sets" title="Timer" />

      <div className="grid items-start gap-8 md:grid-cols-[1fr_320px]">
        <div className="flex flex-col items-center">
          <motion.div
            className="relative aspect-square w-full max-w-[340px]"
            animate={done ? { scale: [1, 1.04, 1] } : { scale: 1 }}
            transition={done ? { duration: 0.8, repeat: Infinity } : { duration: 0.3 }}
          >
            <svg viewBox="0 0 320 320" className="size-full -rotate-90">
              <circle cx="160" cy="160" r={R} fill="none" stroke="var(--color-surface-2)" strokeWidth="14" />
              <motion.circle
                cx="160"
                cy="160"
                r={R}
                fill="none"
                stroke={done ? "var(--color-volt)" : "url(#ring)"}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={LEN}
                animate={{ strokeDashoffset: LEN * (1 - progress) }}
                transition={{ duration: running ? 0.25 : 0.6, ease: running ? "linear" : [0.16, 1, 0.3, 1] }}
              />
              <defs>
                <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--color-volt)" />
                  <stop offset="100%" stopColor="#8fdc3a" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <AnimatePresence mode="wait" initial={false}>
                  {done ? (
                    <motion.p
                      key="done"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      className="font-display text-6xl font-bold text-volt"
                    >
                      Go!
                    </motion.p>
                  ) : (
                    <motion.p
                      key="clock"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-mono text-6xl font-medium tabular-nums sm:text-7xl"
                    >
                      {formatClock(timer.left)}
                    </motion.p>
                  )}
                </AnimatePresence>
                <p className="mt-2 font-mono text-xs tracking-[0.2em] text-muted uppercase">
                  {done ? "Next set" : running ? "Resting" : timer.status === "paused" ? "Paused" : "Ready"}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="mt-8 flex items-center gap-3">
            <RoundButton label="Minus 15 seconds" onClick={() => timer.add(-15_000)}>
              <Minus className="size-5" />
            </RoundButton>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => (running ? timer.pause() : timer.status === "paused" ? timer.resume() : timer.start())}
              className="grid size-20 place-items-center rounded-full bg-volt text-volt-ink shadow-[0_10px_40px_-10px_rgba(212,255,79,0.6)]"
              aria-label={running ? "Pause timer" : "Start timer"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={running ? "pause" : "play"}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {running ? <Pause className="size-8" /> : <Play className="size-8 translate-x-0.5" />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <RoundButton label="Plus 15 seconds" onClick={() => timer.add(15_000)}>
              <Plus className="size-5" />
            </RoundButton>
          </div>
          <button
            type="button"
            onClick={timer.reset}
            className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <RotateCcw className="size-4" /> Reset
          </button>
        </div>

        <div className="space-y-4">
          <section className="rounded-3xl border border-line bg-surface p-5">
            <h2 className="font-display text-lg font-semibold">Presets</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {PRESETS.map((s) => {
                const selected = timer.duration === s * 1000;
                return (
                  <motion.button
                    key={s}
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => timer.start(s * 1000)}
                    className={`rounded-2xl border py-3 font-mono text-sm transition-colors ${
                      selected ? "border-volt bg-volt/10 text-volt" : "border-line hover:border-muted"
                    }`}
                  >
                    {formatClock(s * 1000)}
                  </motion.button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-line bg-surface p-5">
            <h2 className="font-display text-lg font-semibold">Custom</h2>
            <div className="mt-4 flex items-center gap-2">
              <NumberField label="Minutes" value={customMin} max={59} onChange={setCustomMin} />
              <span className="font-mono text-2xl text-muted">:</span>
              <NumberField label="Seconds" value={customSec} max={59} onChange={setCustomSec} />
              <button
                type="button"
                onClick={() => {
                  const ms = (customMin * 60 + customSec) * 1000;
                  if (ms > 0) timer.start(ms);
                }}
                aria-label="Start custom timer"
                className="ml-auto rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-bg transition-colors hover:bg-volt"
              >
                Start
              </button>
            </div>
          </section>

          <section className="flex items-center justify-between rounded-3xl border border-line bg-surface p-5">
            <div>
              <h2 className="font-display text-lg font-semibold">Alarm</h2>
              <p className="text-sm text-muted">Sound, vibration and a notification</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={timer.alarm}
              aria-label="Alarm"
              onClick={() => timer.setAlarm(!timer.alarm)}
              className={`relative flex h-8 w-14 items-center rounded-full px-1 transition-colors ${
                timer.alarm ? "bg-volt" : "bg-surface-2"
              }`}
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
                className={`grid size-6 place-items-center rounded-full bg-bg ${timer.alarm ? "ml-auto" : ""}`}
              >
                {timer.alarm ? <Bell className="size-3.5 text-volt" /> : <BellOff className="size-3.5 text-muted" />}
              </motion.span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function RoundButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={label}
      className="grid size-14 place-items-center rounded-full border border-line bg-surface transition-colors hover:border-muted"
    >
      {children}
    </motion.button>
  );
}

function NumberField({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      aria-label={label}
      type="number"
      inputMode="numeric"
      min={0}
      max={max}
      value={value}
      onChange={(e) => onChange(Math.min(max, Math.max(0, Number(e.target.value) || 0)))}
      className="w-16 rounded-2xl border border-line bg-bg px-3 py-3 text-center font-mono text-lg outline-none focus:border-volt"
    />
  );
}
