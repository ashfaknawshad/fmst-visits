import Link from "next/link";
import { NetworkStatusBadge } from "./NetworkStatusBadge";
import { SignOutButton } from "./SignOutButton";
import { InstallPrompt } from "./InstallPrompt";
import { WaveIcon } from "./illustrations/WaveIcon";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border-soft bg-surface/90 backdrop-blur">
      <div
        className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))" }}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <WaveIcon className="h-7 w-7 text-ocean-500" />
          <span className="font-semibold">Field Tracker</span>
        </Link>
        <div className="flex items-center gap-3">
          <InstallPrompt />
          <NetworkStatusBadge />
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
