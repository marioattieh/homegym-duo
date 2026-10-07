import Link from "next/link";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#d4ff4f" />
      <rect x="6" y="11" width="3.5" height="10" rx="1.5" fill="#11140a" />
      <rect x="22.5" y="11" width="3.5" height="10" rx="1.5" fill="#11140a" />
      <rect x="9.5" y="14.5" width="13" height="3" rx="1.5" fill="#11140a" />
      <circle cx="13.5" cy="16" r="1" fill="#d4ff4f" />
      <circle cx="18.5" cy="16" r="1" fill="#d4ff4f" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight">
      <LogoMark />
      <span>
        Homegym <span className="text-volt">Duo</span>
      </span>
    </Link>
  );
}
