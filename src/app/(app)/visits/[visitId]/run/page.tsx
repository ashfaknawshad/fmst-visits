import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFieldVisitFull, getSubmissionData } from "@/lib/visits";
import { computeSectionProgress } from "@/lib/progress";
import { ensureSubmission } from "./actions";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  FishIcon,
  TurtleIcon,
  JellyfishIcon,
  CrabIcon,
  SeaweedIcon,
} from "@/components/illustrations/Critters";

const CRITTERS = [FishIcon, TurtleIcon, JellyfishIcon, CrabIcon, SeaweedIcon];

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
        className="text-sm text-ocean-600 underline underline-offset-2 dark:text-ocean-300"
      >
        ← Overview
      </Link>

      <h1 className="mt-3 text-2xl font-semibold">{visit.title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {sites.length} site{sites.length === 1 ? "" : "s"} added
      </p>

      <ul className="mt-6 space-y-3">
        {visit.sections.map((section, i) => {
          const progress = computeSectionProgress(
            section.items,
            siteIds,
            answers,
            photos,
          );
          const isDone =
            progress.totalSlots > 0 && progress.filledSlots === progress.totalSlots;
          const Critter = CRITTERS[i % CRITTERS.length];

          return (
            <li key={section.id}>
              <Link href={`/visits/${visitId}/run/${section.id}`}>
                <Card className="flex items-center gap-3 active:bg-surface-muted">
                  <Critter size={34} className="shrink-0 text-ocean-400" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium">{section.title}</p>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                          isDone
                            ? "bg-seafoam-400/20 text-seafoam-500"
                            : progress.filledSlots > 0
                              ? "bg-sand-300/40 text-ocean-700 dark:text-sand-200"
                              : "bg-surface-muted text-slate-500"
                        }`}
                      >
                        {progress.totalSlots > 0
                          ? `${progress.filledSlots}/${progress.totalSlots}`
                          : "optional"}
                      </span>
                    </div>
                    {progress.needsSites ? (
                      <p className="mt-1 text-xs text-coral-500">Add a site to begin</p>
                    ) : progress.totalSlots > 0 ? (
                      <ProgressBar
                        value={progress.filledSlots}
                        total={progress.totalSlots}
                        className="mt-2"
                      />
                    ) : null}
                  </div>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>

      <ButtonLink href={`/visits/${visitId}/review`} className="mt-8">
        Review & Submit
      </ButtonLink>
    </main>
  );
}
