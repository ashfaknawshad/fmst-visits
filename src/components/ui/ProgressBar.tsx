import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  total,
  className,
}: {
  value: number;
  total: number;
  className?: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const done = total > 0 && value === total;

  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-surface-muted",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all",
          done ? "bg-seafoam-500" : "bg-ocean-400",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
