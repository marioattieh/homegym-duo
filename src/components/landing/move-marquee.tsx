import { EXERCISES } from "@/lib/routine";

export function MoveMarquee() {
  const names = EXERCISES.map((e) => e.name);
  const row = [...names, ...names];
  return (
    <div className="relative z-10 border-y border-line bg-surface/60 py-5 backdrop-blur [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="flex w-max animate-[marquee_60s_linear_infinite] hover:[animation-play-state:paused]">
        {row.map((name, i) => (
          <span key={i} className="flex items-center gap-8 pr-8 font-display text-xl font-semibold whitespace-nowrap text-ink/80">
            {name}
            <span className="size-1.5 rounded-full bg-volt" />
          </span>
        ))}
      </div>
    </div>
  );
}
