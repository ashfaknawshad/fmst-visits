import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { WaveHero } from "@/components/illustrations/Waves";
import { FishIcon, TurtleIcon, JellyfishIcon } from "@/components/illustrations/Critters";
import type { FieldVisit, FieldVisitSubmission } from "@/types/visit";

const CRITTERS = [FishIcon, TurtleIcon, JellyfishIcon];

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: visits } = await supabase
    .from("field_visits")
    .select("*")
    .order("visit_date", { ascending: false })
    .returns<FieldVisit[]>();

  const { data: submissions } = await supabase
    .from("field_visit_submissions")
    .select("*")
    .returns<FieldVisitSubmission[]>();

  const submissionByVisit = new Map(
    (submissions ?? []).map((s) => [s.field_visit_id, s]),
  );

  return (
    <main className="flex flex-1 flex-col">
      <div className="relative bg-ocean-50 dark:bg-ocean-900/40">
        <div className="mx-auto w-full max-w-xl px-4 pb-2 pt-6">
          <h1 className="text-2xl font-semibold">Field Visits</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your field notebook — offline-ready, always yours.
          </p>
        </div>
        <WaveHero className="h-10 text-ocean-200" />
      </div>

      <div className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
        {!visits?.length ? (
          <EmptyState
            icon={<TurtleIcon size={56} />}
            title="No field visits yet"
            description="Once a visit is published, it will show up here."
          />
        ) : (
          <ul className="space-y-3">
            {visits.map((visit, i) => {
              const submission = submissionByVisit.get(visit.id);
              const Critter = CRITTERS[i % CRITTERS.length];
              return (
                <li key={visit.id}>
                  <Link href={`/visits/${visit.id}`}>
                    <Card className="flex items-center gap-3 active:bg-surface-muted">
                      <Critter size={36} className="shrink-0 text-ocean-400" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium">{visit.title}</span>
                          <StatusPill status={submission?.status} />
                        </div>
                        <p className="mt-0.5 truncate text-sm text-slate-500">
                          {visit.location_name}
                          {visit.visit_date ? ` · ${visit.visit_date}` : ""}
                        </p>
                      </div>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}

function StatusPill({ status }: { status?: string }) {
  const label =
    status === "complete" ? "Complete" : status === "in_progress" ? "In progress" : "Not started";
  const color =
    status === "complete"
      ? "bg-seafoam-400/20 text-seafoam-500"
      : status === "in_progress"
        ? "bg-sand-300/40 text-ocean-700 dark:text-sand-200"
        : "bg-surface-muted text-slate-500";

  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
