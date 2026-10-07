"use client";

import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDay } from "@/lib/dates";
import type { WeekBucket } from "@/lib/stats";

export function WeeklyChart({ weeks }: { weeks: WeekBucket[] }) {
  const data = weeks.map((w) => ({ ...w, label: formatDay(w.week, { weekday: undefined }) }));
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} barCategoryGap="22%">
          <CartesianGrid stroke="#262b34" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#8b929d", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={16} />
          <YAxis allowDecimals={false} domain={[0, (max: number) => Math.max(4, max)]} tick={{ fill: "#8b929d", fontSize: 11 }} axisLine={false} tickLine={false} />
          <ReferenceLine y={4} stroke="#8b929d" strokeDasharray="4 4" label={{ value: "goal", fill: "#8b929d", fontSize: 10, position: "insideTopLeft" }} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            content={({ active, payload }) => {
              const w = payload?.[0]?.payload as (WeekBucket & { label: string }) | undefined;
              return active && w ? (
                <div className="rounded-xl border border-line bg-surface-2/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
                  <p className="text-muted">Week of {w.label}</p>
                  <p className="font-mono text-sm font-semibold text-ink">
                    {w.total} workout{w.total === 1 ? "" : "s"}
                  </p>
                </div>
              ) : null;
            }}
          />
          <Bar dataKey="total" fill="#d4ff4f" radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={900} animationEasing="ease-out" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
