"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Check, ChevronDown, ExternalLink, PlayCircle } from "lucide-react";
import { SetLogger } from "@/components/set-logger";
import { exercise, imageUrl } from "@/lib/routine";

type Props = {
  index: number;
  slug: string;
  sets: number;
  checked: boolean;
  onToggle: () => void;
  logDate: string;
};

export function MoveRow({ index, slug, sets, checked, onToggle, logDate }: Props) {
  const ex = exercise(slug);
  const [open, setOpen] = useState(false);

  return (
    <motion.li
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      layout
      className={`overflow-hidden rounded-3xl border transition-colors duration-300 ${
        checked ? "border-volt/40 bg-volt/[0.04]" : "border-line bg-surface"
      }`}
    >
      <div className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
        <motion.button
          type="button"
          onClick={onToggle}
          whileTap={{ scale: 0.85 }}
          aria-pressed={checked}
          aria-label={checked ? `Unmark ${ex.name}` : `Mark ${ex.name} done`}
          className={`grid size-11 shrink-0 place-items-center rounded-2xl border-2 transition-colors duration-200 ${
            checked ? "border-volt bg-volt text-volt-ink" : "border-line text-transparent hover:border-muted"
          }`}
        >
          <AnimatePresence initial={false}>
            {checked && (
              <motion.span
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
              >
                <Check className="size-6" strokeWidth={3} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <button type="button" onClick={() => setOpen((o) => !o)} className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-surface-2">
            <Image src={imageUrl(ex, 0)} alt="" fill sizes="56px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] text-muted">{String(index + 1).padStart(2, "0")}</p>
            <p className={`truncate font-display text-lg font-semibold transition-colors ${checked ? "text-muted" : ""}`}>
              {ex.name}
            </p>
            <p className="truncate text-sm text-muted">
              {sets} sets · {ex.muscles.slice(0, 2).join(", ")}
            </p>
          </div>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }} className="shrink-0 text-muted">
            <ChevronDown className="size-5" />
          </motion.span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid grid-cols-1 gap-5 border-t border-line p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:p-5">
              <div>
                <div className="grid grid-cols-2 gap-2">
                  {ex.images.map((_, i) => (
                    <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-2">
                      <Image src={imageUrl(ex, i)} alt={`${ex.name} ${i === 0 ? "start" : "finish"} position`} fill sizes="200px" className="object-cover" />
                    </div>
                  ))}
                </div>
                <ul className="mt-4 space-y-1.5 text-sm text-ink/85">
                  {ex.cues.map((c) => (
                    <li key={c} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-volt" />
                      {c}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={ex.video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-sm transition-colors hover:bg-line"
                  >
                    <PlayCircle className="size-4 text-danger" /> Watch how
                  </a>
                  <Link
                    href={`/moves/${ex.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:text-ink"
                  >
                    Details <ExternalLink className="size-3.5" />
                  </Link>
                </div>
              </div>
              <SetLogger slug={ex.slug} sets={sets} doneOn={logDate} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
