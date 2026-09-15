import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { computeSectionProgress } from "@/lib/progress";
import {
  FishIcon,
  TurtleIcon,
  JellyfishIcon,
  CrabIcon,
  SeaweedIcon,
} from "@/components/illustrations/Critters";
import type {
  FieldVisitFull,
  SubmissionAnswer,
  SubmissionPhoto,
  SubmissionSite,
} from "@/types/visit";

const CRITTERS = [FishIcon, TurtleIcon, JellyfishIcon, CrabIcon, SeaweedIcon];

export function SectionListView({
  visit,
  sites,
  answers,
  photos,
  onOpenSection,
  onOpenReview,
}: {
  visit: FieldVisitFull;
  sites: SubmissionSite[];
  answers: SubmissionAnswer[];
  photos: SubmissionPhoto[];
  onOpenSection: (sectionId: string) => void;
  onOpenReview: () => void;
}) {
  const siteIds = sites.map((s) => s.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold">{visit.title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {sites.length} site{sites.length === 1 ? "" : "s"} added
      </p>

      <ul className="mt-6 space-y-3">
        {visit.sections.map((section, i) => {
          const progress = computeSectionProgress(section.items, siteIds, answers, photos);
          const isDone =
            progress.totalSlots > 0 && progress.filledSlots === progress.totalSlots;
          const Critter = CRITTERS[i % CRITTERS.length];

          return (
            <li key={section.id}>
              <button type="button" className="w-full text-left" onClick={() => onOpenSection(section.id)}>
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
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-8">
        <Button onClick={onOpenReview}>Review & Submit</Button>
      </div>
    </div>
  );
}
