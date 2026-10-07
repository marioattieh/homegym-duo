"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { formatDay } from "@/lib/dates";
import type { HeatCell } from "@/lib/stats";

const ROW_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

function fill(cell: HeatCell) {
  if (cell.future) return "transparent";
  if (cell.count === 0) return "#1b1f26";
  return cell.count === 1 ? "rgba(212,255,79,0.7)" : "#d4ff4f";
}

export function Heatmap({ weeks }: { weeks: HeatCell[][] }) {
  const [hover, setHover] = useState<HeatCell | null>(null);

  return (
    <div>
      <div className="flex gap-1.5">
        <div className="grid grid-rows-7 gap-1 pr-1 text-[10px] text-muted">
          {ROW_LABELS.map((l, i) => (
            <span key={i} className="flex h-full items-center leading-none">
              {l}
            </span>
          ))}
        </div>
        <div className="grid flex-1 grid-flow-col grid-rows-7 gap-1" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
          {weeks.flatMap((week, w) =>
            week.map((cell, d) => (
              <motion.button
                key={cell.date}
                type="button"
                disabled={cell.future}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: w * 0.025 + d * 0.01 }}
                onPointerEnter={() => setHover(cell)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(cell)}
                onBlur={() => setHover(null)}
                aria-label={`${formatDay(cell.date)}: ${cell.count} workout${cell.count === 1 ? "" : "s"}`}
                className="aspect-square w-full rounded-[4px] outline-offset-1 transition-[outline] hover:outline hover:outline-2 hover:outline-ink/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-volt"
                style={{ background: fill(cell), border: cell.future ? "1px dashed #262b34" : undefined }}
              />
            )),
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span className="h-4">
          {hover && !hover.future
            ? `${formatDay(hover.date, { year: "numeric" })} · ${hover.count ? `${hover.count} workout${hover.count > 1 ? "s" : ""}` : "rest day"}`
            : "Hover a day"}
        </span>
        <span className="flex items-center gap-1.5">
          Rest
          {[0, 1, 2].map((c) => (
            <span key={c} className="size-3 rounded-[3px]" style={{ background: fill({ date: "", count: c, future: false }) }} />
          ))}
          Trained
        </span>
      </div>
    </div>
  );
}
