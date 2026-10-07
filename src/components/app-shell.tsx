"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { CalendarCheck, ChartSpline, Dumbbell, LogOut, Timer } from "lucide-react";
import { signOutAction } from "@/app/actions";
import { Logo } from "@/components/logo";
import { MiniTimer } from "@/components/timer/mini-timer";
import type { Member } from "@/lib/members";

const NAV = [
  { href: "/today", label: "Today", icon: CalendarCheck },
  { href: "/moves", label: "Moves", icon: Dumbbell },
  { href: "/dashboard", label: "Stats", icon: ChartSpline },
  { href: "/timer", label: "Timer", icon: Timer },
] as const;

export function AppShell({ member, children }: { member: Member; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = NAV.find((n) => pathname.startsWith(n.href))?.href;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo href="/today" />
          <nav className="hidden items-center gap-1 rounded-full border border-line bg-surface p-1 md:flex">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active === href ? "text-volt-ink" : "text-muted hover:text-ink"
                }`}
              >
                {active === href && (
                  <motion.span
                    layoutId="nav-pill-desktop"
                    className="absolute inset-0 rounded-full bg-volt"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon className="relative size-4" />
                <span className="relative">{label}</span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span
              className="grid size-8 place-items-center rounded-full font-display text-sm font-bold text-bg"
              style={{ background: member.color }}
              title={member.email}
            >
              {member.name[0]}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-32 sm:px-6 md:pb-16">{children}</main>

      <MiniTimer />

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-bg/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 px-2 py-2">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="relative flex flex-col items-center gap-1 py-1.5">
              {active === href && (
                <motion.span
                  layoutId="nav-pill-mobile"
                  className="absolute inset-x-3 inset-y-0 rounded-2xl bg-volt/12"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon className={`relative size-5 transition-colors ${active === href ? "text-volt" : "text-muted"}`} />
              <span className={`relative text-[11px] font-medium ${active === href ? "text-ink" : "text-muted"}`}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
