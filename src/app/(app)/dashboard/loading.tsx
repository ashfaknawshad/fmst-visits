export default function DashboardLoading() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="bg-ocean-50 dark:bg-ocean-900/40">
        <div className="mx-auto w-full max-w-xl px-4 pb-6 pt-6">
          <div className="h-7 w-40 animate-pulse rounded-lg bg-ocean-200/60 dark:bg-ocean-800/60" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded-lg bg-ocean-200/40 dark:bg-ocean-800/40" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-xl flex-1 space-y-3 px-4 py-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl border border-border-soft bg-surface-muted"
          />
        ))}
      </div>
    </main>
  );
}
