import { formatAnswerValue } from "@/lib/formatAnswer";
import { isItemAnsweredForSite } from "@/lib/progress";
import { Card } from "@/components/ui/Card";
import { SubmitBar } from "./SubmitBar";
import { StreamProfileChart } from "./StreamProfileChart";
import type {
  CrossSectionConfig,
  CrossSectionPoint,
  FieldVisitFull,
  FieldVisitSubmission,
  SubmissionAnswer,
  SubmissionPhoto,
  SubmissionSite,
} from "@/types/visit";

export function ReviewView({
  visit,
  submission,
  sites,
  answers,
  photos,
  onEditSection,
  onMarkComplete,
  onReopen,
}: {
  visit: FieldVisitFull;
  submission: FieldVisitSubmission;
  sites: SubmissionSite[];
  answers: SubmissionAnswer[];
  photos: SubmissionPhoto[];
  onEditSection: (sectionId: string) => void;
  onMarkComplete: () => void;
  onReopen: () => void;
}) {
  let incompleteRequiredCount = 0;
  for (const section of visit.sections) {
    for (const item of section.items) {
      if (!item.is_required) continue;
      if (item.repeat_scope === "site") {
        for (const site of sites) {
          if (!isItemAnsweredForSite(item, site.id, answers, photos)) incompleteRequiredCount += 1;
        }
      } else if (!isItemAnsweredForSite(item, null, answers, photos)) {
        incompleteRequiredCount += 1;
      }
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Review</h1>
      <p className="mt-1 text-sm text-slate-500">{visit.title}</p>

      <div className="mt-6 space-y-6">
        {visit.sections.map((section) => {
          const siteItems = section.items.filter((i) => i.repeat_scope === "site");
          const visitItems = section.items.filter((i) => i.repeat_scope === "visit");

          return (
            <section key={section.id}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">{section.title}</h2>
                <button
                  type="button"
                  onClick={() => onEditSection(section.id)}
                  className="text-sm text-ocean-600 underline underline-offset-2 dark:text-ocean-300"
                >
                  Edit
                </button>
              </div>

              {siteItems.length > 0 &&
                sites.map((site) => {
                  const chartItems = siteItems.filter((i) => i.item_type === "cross_section");
                  const otherItems = siteItems.filter((i) => i.item_type !== "cross_section");

                  return (
                    <Card key={site.id} className="mb-3">
                      <p className="mb-2 text-sm font-semibold text-ocean-500">📍 {site.label}</p>
                      <dl className="space-y-1 text-sm">
                        {otherItems.map((item) => {
                          const answer = answers.find(
                            (a) => a.item_id === item.id && a.site_id === site.id,
                          );
                          const itemPhotos = photos.filter(
                            (p) => p.item_id === item.id && p.site_id === site.id,
                          );
                          return (
                            <div key={item.id} className="flex justify-between gap-2">
                              <dt className="text-slate-500">{item.label}</dt>
                              <dd className="text-right">
                                {formatAnswerValue(item, answer, itemPhotos)}
                              </dd>
                            </div>
                          );
                        })}
                      </dl>

                      {chartItems.map((item) => {
                        const answer = answers.find(
                          (a) => a.item_id === item.id && a.site_id === site.id,
                        );
                        const config = item.config as unknown as CrossSectionConfig;
                        return (
                          <div key={item.id} className="mt-3">
                            <p className="mb-1 text-xs font-medium text-slate-500">{item.label}</p>
                            <StreamProfileChart
                              points={(answer?.value as CrossSectionPoint[]) ?? []}
                              distanceUnit={config.distance_unit}
                              depthUnit={config.depth_unit}
                              className="w-full"
                            />
                          </div>
                        );
                      })}
                    </Card>
                  );
                })}

              {siteItems.length > 0 && sites.length === 0 && (
                <p className="text-sm text-slate-500">No sites added yet.</p>
              )}

              {visitItems.length > 0 && (
                <dl className="space-y-1 rounded-2xl border border-border-soft bg-surface p-3 text-sm shadow-sm">
                  {visitItems.map((item) => {
                    const answer = answers.find(
                      (a) => a.item_id === item.id && a.site_id === null,
                    );
                    const itemPhotos = photos.filter(
                      (p) => p.item_id === item.id && p.site_id === null,
                    );
                    return (
                      <div key={item.id} className="flex justify-between gap-2">
                        <dt className="text-slate-500">{item.label}</dt>
                        <dd className="text-right">
                          {formatAnswerValue(item, answer, itemPhotos)}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              )}
            </section>
          );
        })}
      </div>

      <SubmitBar
        status={submission.status}
        incompleteRequiredCount={incompleteRequiredCount}
        onMarkComplete={onMarkComplete}
        onReopen={onReopen}
      />
    </div>
  );
}
