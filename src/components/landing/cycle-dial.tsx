"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ROUTINE } from "@/lib/routine";

const SIZE = 360;
const R = 150;
const C = SIZE / 2;
const GAP_DEG = 10;

function arcPath(index: number) {
  const start = index * 90 - 90 + GAP_DEG / 2;
  const end = start + 90 - GAP_DEG;
  const toXY = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return [C + R * Math.cos(rad), C + R * Math.sin(rad)];
  };
  const [x1, y1] = toXY(start);
  const [x2, y2] = toXY(end);
  return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
}

function labelPos(index: number) {
  const rad = ((index * 90 - 45) * Math.PI) / 180;
  return { left: `${50 + 31 * Math.cos(rad)}%`, top: `${50 + 31 * Math.sin(rad)}%` };
}

export function CycleDial() {
  const [tick, setTick] = useState(0);
  const active = tick % 4;

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2400);
    return () => clearInterval(id);
  }, []);

  const day = ROUTINE[active];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative aspect-square w-full"
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 size-full">
        <circle cx={C} cy={C} r={R - 28} fill="none" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 6" />
        {ROUTINE.map((d, i) => (
          <motion.path
            key={d.day}
            d={arcPath(i)}
            fill="none"
            strokeWidth={14}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: 1,
              stroke: i === active ? "#d4ff4f" : i < active ? "rgba(212,255,79,0.35)" : "#262b34",
            }}
            transition={{
              pathLength: { duration: 1.1, delay: 0.4 + i * 0.15, ease: [0.16, 1, 0.3, 1] },
              stroke: { duration: 0.5 },
            }}
          />
        ))}
        <motion.g animate={{ rotate: tick * 90 }} transition={{ type: "spring", stiffness: 60, damping: 14 }}>
          <circle cx={C} cy={C} r={R + 10} fill="transparent" />
          <circle cx={C + R * Math.cos(-Math.PI / 4)} cy={C + R * Math.sin(-Math.PI / 4)} r={9} fill="#0b0d10" stroke="#d4ff4f" strokeWidth={3} />
        </motion.g>
      </svg>

      {ROUTINE.map((d, i) => (
        <span
          key={d.day}
          style={labelPos(i)}
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-wider whitespace-nowrap uppercase backdrop-blur transition-colors duration-500 ${
            i === active ? "border-volt/60 bg-volt/10 text-volt" : "border-line bg-bg/70 text-muted"
          }`}
        >
          {d.title}
        </span>
      ))}

      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-mono text-[11px] tracking-[0.25em] text-muted uppercase">Today is</p>
          <div className="relative h-[92px] w-48 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={day.day}
                initial={{ y: 60, opacity: 0, filter: "blur(6px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -60, opacity: 0, filter: "blur(6px)" }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-x-0 font-display text-7xl font-bold tracking-tight"
              >
                Day {day.day}
              </motion.p>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={day.day}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-muted"
            >
              {day.moves.length} moves · {day.moves.length * 3} sets
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
