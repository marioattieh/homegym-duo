"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, Lock } from "lucide-react";
import { GoogleButton } from "@/components/google-button";
import { Logo } from "@/components/logo";
import { CycleDial } from "./cycle-dial";
import { Features } from "./features";
import { MoveMarquee } from "./move-marquee";

const words = ["Four days.", "Two of us.", "One routine."];

export function Landing({ signedInAs, error }: { signedInAs: string | null; error: string | null }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const dialY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const dialRotate = useTransform(scrollYProgress, [0, 1], [0, -25]);

  const cta = signedInAs ? (
    <Link
      href="/today"
      className="group inline-flex items-center gap-2 rounded-full bg-volt px-6 py-3.5 text-[15px] font-semibold text-volt-ink transition-transform hover:scale-[1.03] active:scale-[0.97]"
    >
      Open today&apos;s workout
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </Link>
  ) : (
    <GoogleButton />
  );

  return (
    <main className="relative overflow-x-clip">
      <Backdrop />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8">
        <Logo />
        {signedInAs ? (
          <span className="text-sm text-muted">
            Hi, <span className="text-ink">{signedInAs}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-muted">
            <Lock className="size-3" /> Members only
          </span>
        )}
      </header>

      <section
        ref={heroRef}
        className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 pt-14 pb-20 sm:px-8 md:grid-cols-[1.15fr_1fr] md:pt-24 md:pb-28"
      >
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-5 font-mono text-xs tracking-[0.2em] text-volt uppercase"
          >
            Mario &amp; Manuella · Home gym
          </motion.p>
          <h1 className="font-display text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95] font-bold tracking-tight">
            {words.map((word, i) => (
              <span key={word} className="block overflow-hidden pb-1">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                >
                  {i === 2 ? <span className="text-volt">{word}</span> : word}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-md text-lg leading-relaxed text-muted"
          >
            Two upper days, two lower days, a bench, some dumbbells and a few bands. Tick off the day, log the
            weights when you feel like it, and watch the weeks stack up.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            {cta}
            {error && (
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-danger"
                role="alert"
              >
                {error === "AccessDenied"
                  ? "That Google account isn't on the guest list."
                  : "Sign-in failed. Try again."}
              </motion.p>
            )}
          </motion.div>
        </div>

        <motion.div style={{ y: dialY, rotate: dialRotate }} className="mx-auto w-full max-w-[420px]">
          <CycleDial />
        </motion.div>
      </section>

      <MoveMarquee />
      <Features />

      <section className="relative z-10 mx-auto max-w-6xl px-5 pt-10 pb-24 text-center sm:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
        >
          Same time tomorrow?
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex justify-center"
        >
          {cta}
        </motion.div>
      </section>
    </main>
  );
}

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      <motion.div
        className="absolute -top-40 -left-32 size-[520px] rounded-full bg-volt/20 blur-[120px]"
        animate={{ x: [0, 60, -20, 0], y: [0, 40, 80, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 -right-40 size-[460px] rounded-full bg-mario/15 blur-[120px]"
        animate={{ x: [0, -50, 10, 0], y: [0, 60, -30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[520px] left-1/3 size-[380px] rounded-full bg-manuella/10 blur-[120px]"
        animate={{ x: [0, 40, -40, 0], y: [0, -40, 20, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)] bg-[size:56px_56px]" />
    </div>
  );
}
