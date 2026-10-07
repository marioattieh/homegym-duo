import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-xs tracking-[0.2em] text-volt uppercase">404</p>
        <h1 className="mt-3 font-display text-5xl font-bold">Skipped this one.</h1>
        <p className="mt-3 text-muted">That page isn&apos;t part of the routine.</p>
        <Link href="/today" className="mt-8 inline-block rounded-full bg-volt px-6 py-3 font-semibold text-volt-ink">
          Back to today
        </Link>
      </div>
    </main>
  );
}
