"use client";

import { motion } from "motion/react";

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-2 font-mono text-xs tracking-[0.2em] text-volt uppercase"
          >
            {eyebrow}
          </motion.p>
        )}
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}
