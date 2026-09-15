import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFieldVisitFull, getSubmissionData } from "@/lib/visits";
import { computeSectionProgress } from "@/lib/progress";
import { ensureSubmission } from "./actions";

export default async function RunVisitPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const { visitId } = await params;
  const supabase = await createClient();

  const visit = await getFieldVisitFull(supabase, visitId);
  if (!visit) notFound();

  const submissionId = await ensureSubmission(visitId);
  const { sites, answers, photos } = await getSubmissionData(supabase, submissionId);
  const siteIds = sites.map((s) => s.id);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <Link
        href={`/visits/${visitId}`}
        className="text-sm text-slate-500 underline underline-offset-2"
      >
        ← Overview
      </Link>

      <h1 className="mt-3 text-2xl font-semibold">{visit.title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {sites.length} site{sites.length === 1 ? "" : "s"} added
      </p>

      <ul className="mt-6 space-y-3">
        {visit.sections.map((section) => {
          const progress = computeSectionProgress(
            section.items,
            siteIds,
            answers,
            photos,
          );
          const isDone =
            progress.totalSlots > 0 && progress.filledSlots === progress.totalSlots;

          return (
            <li key={section.id}>
              <Link
                href={`/visits/${visitId}/run/${section.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 active:bg-slate-50 dark:border-slate-800 dark:active:bg-slate-900"
              >
                <div>
                  <p className="font-medium">{section.title}</p>
                  {progress.needsSites && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Add a site to begin
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    isDone
                      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                      : progress.filledSlots > 0
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {progress.totalSlots > 0
                    ? `${progress.filledSlots}/${progress.totalSlots}`
                    : "optional"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href={`/visits/${visitId}/review`}
        className="mt-8 block w-full rounded-lg bg-slate-900 px-4 py-3 text-center text-base font-medium text-white dark:bg-slate-100 dark:text-slate-900"
      >
        Review & Submit
      </Link>
    </main>
  );
}
