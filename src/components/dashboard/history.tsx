"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCompletion } from "@/app/actions";
import { formatDay } from "@/lib/dates";
import type { Member } from "@/lib/members";
import { workoutDay } from "@/lib/routine";
import type { CompletionRow } from "@/lib/stats";

const PAGE = 12;

export function History({ completions, members }: { completions: CompletionRow[]; members: Member[] }) {
  const [shown, setShown] = useState(PAGE);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (completions.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">No finished days yet. Day 1 is waiting.</p>;
  }

  function remove(id: string) {
    startTransition(async () => {
      try {
        await deleteCompletion(id);
        toast.success("Removed");
      } catch {
        toast.error("Couldn't remove that day.");
      }
      setConfirming(null);
    });
  }

  return (
    <div>
      <ul className="divide-y divide-line">
        <AnimatePresence initial={false}>
          {completions.slice(0, shown).map((c) => {
            const plan = workoutDay(c.workoutDay);
            return (
              <motion.li
                key={c.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 py-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 font-display font-bold">
                    D{c.workoutDay}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{plan.title}</p>
                    <p className="text-xs text-muted">
                      {formatDay(c.doneOn, { year: "numeric" })} · {c.moves.length || plan.moves.length}/{plan.moves.length} moves
                    </p>
                  </div>
                  <div className="flex -space-x-1.5">
                    {members
                      .filter((m) => c.participants.includes(m.email))
                      .map((m) => (
                        <span
                          key={m.email}
                          title={m.name}
                          className="grid size-7 place-items-center rounded-full border-2 border-surface text-[11px] font-bold text-bg"
                          style={{ background: m.color }}
                        >
                          {m.name[0]}
                        </span>
                      ))}
                  </div>
                  {confirming === c.id ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => remove(c.id)}
                      onBlur={() => setConfirming(null)}
                      autoFocus
                      className="rounded-full bg-danger px-3 py-1.5 text-xs font-semibold text-bg"
                    >
                      Delete?
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirming(c.id)}
                      aria-label={`Delete ${plan.title} on ${c.doneOn}`}
                      className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      {completions.length > shown && (
        <button
          type="button"
          onClick={() => setShown((s) => s + PAGE)}
          className="mt-3 w-full rounded-xl border border-line py-2 text-sm text-muted transition-colors hover:text-ink"
        >
          Show more
        </button>
      )}
    </div>
  );
}
