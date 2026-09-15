import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CrabIcon } from "@/components/illustrations/Critters";
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
      <Link href="/dashboard" className="text-sm text-ocean-600 underline underline-offset-2 dark:text-ocean-300">
        ← All visits
      </Link>

      <div className="mt-3 flex items-start gap-3">
        <CrabIcon size={40} className="mt-1 shrink-0 text-ocean-400" />
        <div>
          <h1 className="text-2xl font-semibold">{visit.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {visit.location_name}
            {visit.visit_date ? ` · ${visit.visit_date}` : ""}
          </p>
        </div>
      </div>

      {visit.objectives && (
        <Card className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ocean-500">
            Objectives
          </h2>
          <p className="mt-1 whitespace-pre-wrap text-sm">{visit.objectives}</p>
        </Card>
      )}

      {visit.description && (
        <Card className="mt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ocean-500">
            Description
          </h2>
          <p className="mt-1 whitespace-pre-wrap text-sm">{visit.description}</p>
        </Card>
      )}

      <ButtonLink
        href={
          submission?.status === "complete"
            ? `/visits/${visit.id}/review`
            : `/visits/${visit.id}/run`
        }
        className="mt-8"
      >
        {submission?.status === "in_progress"
          ? "Continue"
          : submission?.status === "complete"
            ? "Review"
            : "Start visit"}
      </ButtonLink>
    </main>
  );
}
