"use client";

import { useSyncStatus } from "@/lib/offline/useSyncStatus";

export function SyncStatusBadge() {
  const { pending, syncing } = useSyncStatus();

  if (syncing) {
    return (
      <span className="rounded-full bg-sand-300/40 px-2.5 py-1 text-xs font-medium text-ocean-700 dark:text-sand-200">
        Syncing…
      </span>
    );
  }

  if (pending > 0) {
    return (
      <span className="rounded-full bg-coral-500/15 px-2.5 py-1 text-xs font-medium text-coral-500">
        {pending} pending
      </span>
    );
  }

  return null;
}
