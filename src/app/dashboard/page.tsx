import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { FieldVisit, FieldVisitSubmission } from "@/types/visit";

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
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Field Visits</h1>

      {!visits?.length && (
        <p className="text-slate-500">No field visits published yet.</p>
      )}

      <ul className="space-y-3">
        {visits?.map((visit) => {
          const submission = submissionByVisit.get(visit.id);
          return (
            <li key={visit.id}>
              <Link
                href={`/visits/${visit.id}`}
                className="block rounded-xl border border-slate-200 p-4 active:bg-slate-50 dark:border-slate-800 dark:active:bg-slate-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{visit.title}</span>
                  <StatusPill status={submission?.status} />
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {visit.location_name}
                  {visit.visit_date ? ` · ${visit.visit_date}` : ""}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

function StatusPill({ status }: { status?: string }) {
  const label = status === "complete" ? "Complete" : status === "in_progress" ? "In progress" : "Not started";
  const color =
    status === "complete"
      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
      : status === "in_progress"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
