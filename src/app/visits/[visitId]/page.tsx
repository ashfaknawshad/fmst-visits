import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FieldVisit, FieldVisitSubmission } from "@/types/visit";

export default async function VisitOverviewPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const { visitId } = await params;
  const supabase = await createClient();

  const { data: visit } = await supabase
    .from("field_visits")
    .select("*")
    .eq("id", visitId)
    .maybeSingle<FieldVisit>();

  if (!visit) notFound();

  const { data: submission } = await supabase
    .from("field_visit_submissions")
    .select("*")
    .eq("field_visit_id", visitId)
    .maybeSingle<FieldVisitSubmission>();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <Link href="/dashboard" className="text-sm text-slate-500 underline underline-offset-2">
        ← All visits
      </Link>

      <h1 className="mt-3 text-2xl font-semibold">{visit.title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {visit.location_name}
        {visit.visit_date ? ` · ${visit.visit_date}` : ""}
      </p>

      {visit.objectives && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Objectives
          </h2>
          <p className="mt-1 whitespace-pre-wrap">{visit.objectives}</p>
        </section>
      )}

      {visit.description && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Description
          </h2>
          <p className="mt-1 whitespace-pre-wrap">{visit.description}</p>
        </section>
      )}

      <Link
        href={
          submission?.status === "complete"
            ? `/visits/${visit.id}/review`
            : `/visits/${visit.id}/run`
        }
        className="mt-8 block w-full rounded-lg bg-slate-900 px-4 py-3 text-center text-base font-medium text-white dark:bg-slate-100 dark:text-slate-900"
      >
        {submission?.status === "in_progress"
          ? "Continue"
          : submission?.status === "complete"
            ? "Review"
            : "Start visit"}
      </Link>
    </main>
  );
}
