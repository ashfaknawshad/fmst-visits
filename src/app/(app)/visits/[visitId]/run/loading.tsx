export default function RunVisitLoading() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <div className="h-4 w-20 animate-pulse rounded bg-surface-muted" />
      <div className="mt-4 h-7 w-2/3 animate-pulse rounded-lg bg-surface-muted" />
      <div className="mt-2 h-4 w-32 animate-pulse rounded bg-surface-muted" />
      <div className="mt-6 space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl border border-border-soft bg-surface-muted"
          />
        ))}
      </div>
    </main>
  );
}
