export default function ReviewLoading() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <div className="h-4 w-28 animate-pulse rounded bg-surface-muted" />
      <div className="mt-4 h-7 w-32 animate-pulse rounded-lg bg-surface-muted" />
      <div className="mt-2 h-4 w-48 animate-pulse rounded bg-surface-muted" />
      <div className="mt-6 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div className="mb-2 h-5 w-32 animate-pulse rounded bg-surface-muted" />
            <div className="h-20 animate-pulse rounded-2xl border border-border-soft bg-surface-muted" />
          </div>
        ))}
      </div>
      <div className="mt-8 h-12 animate-pulse rounded-xl bg-surface-muted" />
    </main>
  );
}
