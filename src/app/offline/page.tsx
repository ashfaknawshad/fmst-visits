import { TurtleIcon } from "@/components/illustrations/Critters";

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <TurtleIcon size={72} className="text-ocean-400" />
      <h1 className="text-xl font-semibold">You&apos;re offline</h1>
      <p className="max-w-xs text-sm text-slate-500">
        This page hasn&apos;t been loaded before, so it isn&apos;t available without a
        connection yet. Reconnect and try again.
      </p>
    </main>
  );
}
