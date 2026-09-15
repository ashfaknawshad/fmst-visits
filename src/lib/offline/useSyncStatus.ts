"use client";

import { useEffect, useState } from "react";
import { runSync, countPending } from "./sync";

export function useSyncStatus() {
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    async function tick() {
      setSyncing(true);
      try {
        await runSync();
      } finally {
        setPending(await countPending());
        setSyncing(false);
      }
    }

    // Deferred so the very first run isn't a synchronous setState call
    // reachable directly from the effect body — later calls (from the
    // 'online' listener and the interval below) are already async-safe.
    const initialRun = setTimeout(tick, 0);

    const onOnline = () => {
      tick();
    };
    window.addEventListener("online", onOnline);

    const interval = setInterval(() => {
      if (navigator.onLine) tick();
    }, 30000);

    return () => {
      clearTimeout(initialRun);
      window.removeEventListener("online", onOnline);
      clearInterval(interval);
    };
  }, []);

  return { pending, syncing };
}
