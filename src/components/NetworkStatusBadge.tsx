"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export function NetworkStatusBadge() {
  const [online, setOnline] = useState(
    () => typeof navigator === "undefined" || navigator.onLine,
  );

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        online
          ? "bg-seafoam-400/20 text-seafoam-500"
          : "bg-coral-500/15 text-coral-500",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          online ? "bg-seafoam-500" : "bg-coral-500",
        )}
      />
      {online ? "Online" : "Offline"}
    </span>
  );
}
