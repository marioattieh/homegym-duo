"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Check, CopyPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loadExerciseLog, saveSet } from "@/app/actions";
import { formatDay } from "@/lib/dates";
import type { SetRow } from "@/lib/stats";

type Draft = { weight: string; reps: string };
type SaveState = "idle" | "saving" | "saved";

const toDraft = (rows: SetRow[], count: number): Draft[] =>
  Array.from({ length: count }, (_, i) => {
    const row = rows.find((r) => r.setNumber === i + 1);
    return { weight: row?.weightKg != null ? String(row.weightKg) : "", reps: row?.reps != null ? String(row.reps) : "" };
  });

const parse = (v: string, integer: boolean): number | null => {
  const n = Number(v.replace(",", "."));
  if (v.trim() === "" || !Number.isFinite(n) || n < 0) return null;
  return integer ? Math.round(n) : Math.round(n * 100) / 100;
};

export function SetLogger({ slug, sets, doneOn }: { slug: string; sets: number; doneOn: string }) {
  const [drafts, setDrafts] = useState<Draft[]>(() => toDraft([], sets));
  const [saved, setSaved] = useState<Draft[]>(() => toDraft([], sets));
  const [previous, setPrevious] = useState<SetRow[]>([]);
  const [status, setStatus] = useState<SaveState[]>(() => Array(sets).fill("idle"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doneOn) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- show spinner while the log for this date loads
    setLoading(true);
    loadExerciseLog(slug, doneOn)
      .then(({ current, previous }) => {
        if (cancelled) return;
        const d = toDraft(current, sets);
        setDrafts(d);
        setSaved(d);
        setPrevious(previous);
      })
      .catch(() => !cancelled && toast.error("Couldn't load your sets."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug, doneOn, sets]);

  function update(i: number, patch: Partial<Draft>) {
    setDrafts((d) => d.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  }

  async function commit(i: number, row: Draft = drafts[i]) {
    if (row.weight === saved[i].weight && row.reps === saved[i].reps) return;
    setStatus((s) => s.map((v, j) => (j === i ? "saving" : v)));
    try {
      await saveSet({ slug, doneOn, setNumber: i + 1, weightKg: parse(row.weight, false), reps: parse(row.reps, true) });
      setSaved((s) => s.map((v, j) => (j === i ? row : v)));
      setStatus((s) => s.map((v, j) => (j === i ? "saved" : v)));
      setTimeout(() => setStatus((s) => s.map((v, j) => (j === i && v === "saved" ? "idle" : v))), 1600);
    } catch {
      setStatus((s) => s.map((v, j) => (j === i ? "idle" : v)));
      toast.error("Couldn't save that set.");
    }
  }

  function copyPrevious() {
    const prev = toDraft(previous, sets);
    setDrafts(prev);
    prev.forEach((row, i) => void commit(i, row));
  }

  return (
    <div className="rounded-2xl border border-line bg-bg/50 p-4">
      <div className="flex items-center justify-between">
        <p className="font-display font-semibold">Your sets</p>
        <p className="text-xs text-muted">{doneOn ? formatDay(doneOn) : ""} · optional</p>
      </div>

      <div className="mt-3 grid grid-cols-[auto_1fr_1fr_20px] items-center gap-x-2 gap-y-2">
        <span />
        <span className="text-[11px] tracking-wider text-muted uppercase">kg</span>
        <span className="text-[11px] tracking-wider text-muted uppercase">reps</span>
        <span />
        {drafts.map((row, i) => (
          <SetInputs
            key={i}
            index={i}
            row={row}
            disabled={loading}
            status={status[i]}
            onChange={(patch) => update(i, patch)}
            onCommit={() => void commit(i)}
          />
        ))}
      </div>

      {loading && (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted">
          <Loader2 className="size-3 animate-spin" /> Loading…
        </p>
      )}

      {!loading && previous.length > 0 && (
        <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-surface px-3 py-2">
          <p className="min-w-0 truncate text-xs text-muted">
            Last · {formatDay(previous[0].doneOn, { weekday: undefined })}:{" "}
            <span className="text-ink/80">
              {previous.map((p) => `${p.weightKg ?? "–"}×${p.reps ?? "–"}`).join("  ")}
            </span>
          </p>
          <button
            type="button"
            onClick={copyPrevious}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-volt hover:underline"
          >
            <CopyPlus className="size-3.5" /> Copy
          </button>
        </div>
      )}
    </div>
  );
}

function SetInputs({
  index,
  row,
  disabled,
  status,
  onChange,
  onCommit,
}: {
  index: number;
  row: Draft;
  disabled: boolean;
  status: SaveState;
  onChange: (patch: Partial<Draft>) => void;
  onCommit: () => void;
}) {
  const field =
    "w-full min-w-0 rounded-xl border border-line bg-surface px-3 py-2.5 font-mono text-base tabular-nums outline-none transition-colors focus:border-volt disabled:opacity-50";
  return (
    <>
      <span className="pr-1 font-mono text-xs text-muted">S{index + 1}</span>
      <input
        aria-label={`Set ${index + 1} weight in kg`}
        inputMode="decimal"
        placeholder="—"
        value={row.weight}
        disabled={disabled}
        onChange={(e) => onChange({ weight: e.target.value })}
        onBlur={onCommit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className={field}
      />
      <input
        aria-label={`Set ${index + 1} reps`}
        inputMode="numeric"
        placeholder="—"
        value={row.reps}
        disabled={disabled}
        onChange={(e) => onChange({ reps: e.target.value })}
        onBlur={onCommit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className={field}
      />
      <span className="grid place-items-center">
        <AnimatePresence mode="wait">
          {status === "saving" && (
            <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Loader2 className="size-4 animate-spin text-muted" />
            </motion.span>
          )}
          {status === "saved" && (
            <motion.span
              key="saved"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              <Check className="size-4 text-volt" strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </>
  );
}
