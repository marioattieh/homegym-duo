"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { BellRing, Pause, Play, X } from "lucide-react";
import { formatClock, useTimer } from "./timer-context";

export function MiniTimer() {
  const timer = useTimer();
  const pathname = usePathname();
  const visible = pathname !== "/timer" && timer.status !== "idle";
  const done = timer.status === "done";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="fixed right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 md:right-6 md:bottom-6"
        >
          <motion.div
            animate={done ? { scale: [1, 1.06, 1] } : { scale: 1 }}
            transition={done ? { duration: 0.8, repeat: Infinity } : undefined}
            className={`flex items-center gap-1 rounded-full border p-1.5 pl-4 shadow-2xl backdrop-blur-xl ${
              done ? "border-volt bg-volt text-volt-ink" : "border-line bg-surface-2/90"
            }`}
          >
            <Link href="/timer" className="flex items-center gap-2 pr-2 font-mono text-lg tabular-nums">
              {done && <BellRing className="size-4" />}
              {done ? "Go!" : formatClock(timer.left)}
            </Link>
            {timer.status === "running" && (
              <IconButton label="Pause timer" onClick={timer.pause}>
                <Pause className="size-4" />
              </IconButton>
            )}
            {timer.status === "paused" && (
              <IconButton label="Resume timer" onClick={timer.resume}>
                <Play className="size-4" />
              </IconButton>
            )}
            <IconButton label="Stop timer" onClick={timer.reset} dark={done}>
              <X className="size-4" />
            </IconButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function IconButton({
  label,
  onClick,
  children,
  dark,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`grid size-9 place-items-center rounded-full transition-colors ${
        dark ? "bg-volt-ink/10 hover:bg-volt-ink/20" : "bg-bg/60 hover:bg-bg"
      }`}
    >
      {children}
    </button>
  );
}
