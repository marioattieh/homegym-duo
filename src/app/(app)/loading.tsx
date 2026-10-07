export default function Loading() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-32 rounded-full bg-surface-2" />
      <div className="h-12 w-64 rounded-2xl bg-surface-2" />
      <div className="mt-8 space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-20 rounded-3xl border border-line bg-surface" />
        ))}
      </div>
    </div>
  );
}
