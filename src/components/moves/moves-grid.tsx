"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { EXERCISES, ROUTINE, daysUsing, imageUrl } from "@/lib/routine";

const FILTERS = [{ key: 0, label: "All" }, ...ROUTINE.map((d) => ({ key: d.day, label: `D${d.day} · ${d.title}` }))];

export function MovesGrid() {
  const [filter, setFilter] = useState(0);
  const list =
    filter === 0
      ? EXERCISES
      : ROUTINE[filter - 1].moves.map((m) => EXERCISES.find((e) => e.slug === m.slug)!);

  return (
    <div>
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`relative shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.key ? "border-transparent text-volt-ink" : "border-line text-muted hover:text-ink"
            }`}
          >
            {filter === f.key && (
              <motion.span
                layoutId="moves-filter"
                className="absolute inset-0 rounded-full bg-volt"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{f.label}</span>
          </button>
        ))}
      </div>

      <motion.ul layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((ex, i) => (
            <motion.li
              key={ex.slug}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.03, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/moves/${ex.slug}`}
                className="group block overflow-hidden rounded-3xl border border-line bg-surface transition-colors hover:border-muted/60"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
                  <Image
                    src={imageUrl(ex, 0)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                  />
                  <Image
                    src={imageUrl(ex, 1)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="absolute top-3 left-3 flex gap-1">
                    {daysUsing(ex.slug).map((d) => (
                      <span key={d} className="rounded-full bg-bg/80 px-2 py-0.5 font-mono text-[10px] backdrop-blur">
                        D{d}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-display text-lg font-semibold">{ex.name}</p>
                  <p className="mt-0.5 text-sm text-muted">{ex.muscles.join(" · ")}</p>
                </div>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
