"use client";

import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDay } from "@/lib/dates";
import type { Member } from "@/lib/members";
import type { ProgressPoint } from "@/lib/stats";

export type Series = { member: Member; points: ProgressPoint[] };

const METRICS = [
  { key: "topWeight", label: "Top weight", unit: "kg" },
  { key: "volume", label: "Volume", unit: "kg" },
  { key: "reps", label: "Total reps", unit: "" },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

export function ProgressChart({ series, height = 260 }: { series: Series[]; height?: number }) {
  const [metric, setMetric] = useState<MetricKey>("topWeight");
  const unit = METRICS.find((m) => m.key === metric)!.unit;

  const rows = useMemo(() => {
    const dates = [...new Set(series.flatMap((s) => s.points.map((p) => p.date)))].sort();
    return dates.map((date) => {
      const row: Record<string, string | number | null> = { date };
      for (const s of series) {
        const p = s.points.find((x) => x.date === date);
        row[s.member.name] = p ? (p[metric] as number | null) : null;
      }
      return row;
    });
  }, [series, metric]);

  const visible = series.filter((s) => s.points.length > 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full border border-line bg-bg/60 p-1">
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMetric(m.key)}
              className={`relative rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                metric === m.key ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {metric === m.key && (
                <motion.span layoutId={`metric-${series.map((s) => s.member.name).join()}`} className="absolute inset-0 rounded-full bg-surface-2" />
              )}
              <span className="relative">{m.label}</span>
            </button>
          ))}
        </div>
        {visible.length > 1 && (
          <div className="flex gap-4 text-xs text-muted">
            {visible.map((s) => (
              <span key={s.member.email} className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded-full" style={{ background: s.member.hex }} />
                {s.member.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyChart height={height} />
      ) : (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
              <CartesianGrid stroke="#262b34" strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(d: string) => formatDay(d, { weekday: undefined })}
                tick={{ fill: "#8b929d", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                tick={{ fill: "#8b929d", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={44}
                tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : String(v))}
              />
              <Tooltip
                cursor={{ stroke: "#8b929d", strokeWidth: 1 }}
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="rounded-xl border border-line bg-surface-2/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
                      <p className="mb-1 text-muted">{formatDay(String(label))}</p>
                      {payload.map((p) => (
                        <p key={String(p.dataKey)} className="flex items-center gap-2">
                          <span className="h-0.5 w-3 rounded-full" style={{ background: p.color }} />
                          <span className="font-mono font-semibold text-ink">
                            {p.value == null ? "–" : `${p.value}${unit ? ` ${unit}` : ""}`}
                          </span>
                          <span className="text-muted">{String(p.dataKey)}</span>
                        </p>
                      ))}
                    </div>
                  ) : null
                }
              />
              {visible.map((s) => (
                <Line
                  key={s.member.email}
                  type="monotone"
                  dataKey={s.member.name}
                  stroke={s.member.hex}
                  strokeWidth={2}
                  dot={{ r: 4, fill: s.member.hex, stroke: "#13161b", strokeWidth: 2 }}
                  activeDot={{ r: 6, stroke: "#13161b", strokeWidth: 2 }}
                  connectNulls
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function EmptyChart({ height }: { height: number }) {
  return (
    <div
      style={{ height }}
      className="grid place-items-center rounded-2xl border border-dashed border-line text-center text-sm text-muted"
    >
      <p className="max-w-60">
        No weights logged yet. Open a move on the Today page and fill in kg and reps.
      </p>
    </div>
  );
}
