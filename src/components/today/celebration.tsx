"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo } from "react";
import { workoutDay } from "@/lib/routine";

const COLORS = ["#d4ff4f", "#5cc8ff", "#ff8fb1", "#f2f1ec"];

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function Celebration({ data, onClose }: { data: { day: number; next: number } | null; onClose: () => void }) {
  useEffect(() => {
    if (!data) return;
    const id = setTimeout(onClose, 4200);
    return () => clearTimeout(id);
  }, [data, onClose]);

  const pieces = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => ({
        x: (pseudoRandom(i) - 0.5) * 700,
        y: -pseudoRandom(i + 100) * 420 - 80,
        rotate: pseudoRandom(i + 200) * 720 - 360,
        color: COLORS[i % COLORS.length],
        size: 6 + pseudoRandom(i + 300) * 8,
        round: i % 3 === 0,
      })),
    [],
  );

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key="celebrate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] grid place-items-center bg-bg/80 backdrop-blur-md"
          role="dialog"
          aria-live="polite"
        >
          <div className="relative">
            {pieces.map((p, i) => (
              <motion.span
                key={i}
                className="absolute top-1/2 left-1/2"
                style={{
                  width: p.size,
                  height: p.round ? p.size : p.size * 0.5,
                  background: p.color,
                  borderRadius: p.round ? 999 : 2,
                }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{ x: p.x, y: [0, p.y, p.y + 600], opacity: [1, 1, 0], rotate: p.rotate }}
                transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1], times: [0, 0.35, 1] }}
              />
            ))}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative flex flex-col items-center text-center"
            >
              <svg viewBox="0 0 120 120" className="size-36">
                <motion.circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#d4ff4f"
                  strokeWidth="8"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.path
                  d="M38 62 L54 77 L84 45"
                  fill="none"
                  stroke="#d4ff4f"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.45, delay: 0.5, ease: "easeOut" }}
                />
              </svg>
              <motion.h2
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 font-display text-4xl font-bold"
              >
                Day {data.day} done
              </motion.h2>
              <motion.p
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.75 }}
                className="mt-2 text-muted"
              >
                Next up: Day {data.next} · {workoutDay(data.next).title}
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
