export default function RunSectionLoading() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
      <div className="mt-4 h-7 w-1/2 animate-pulse rounded-lg bg-surface-muted" />
      <div className="mt-6 space-y-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-border-soft bg-surface-muted"
          />
        ))}
      </div>
    </main>
  );
}
