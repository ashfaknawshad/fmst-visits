export default function VisitOverviewLoading() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <div className="h-4 w-20 animate-pulse rounded bg-surface-muted" />
      <div className="mt-4 h-7 w-3/4 animate-pulse rounded-lg bg-surface-muted" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-surface-muted" />
      <div className="mt-6 h-24 animate-pulse rounded-2xl border border-border-soft bg-surface-muted" />
      <div className="mt-4 h-24 animate-pulse rounded-2xl border border-border-soft bg-surface-muted" />
      <div className="mt-8 h-12 animate-pulse rounded-xl bg-surface-muted" />
    </main>
  );
}
