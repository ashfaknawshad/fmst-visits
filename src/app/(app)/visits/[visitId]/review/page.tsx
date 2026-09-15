import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFieldVisitFull, getSubmissionData } from "@/lib/visits";
import { isItemAnsweredForSite } from "@/lib/progress";
import { formatAnswerValue } from "@/lib/formatAnswer";
import { ensureSubmission } from "../run/actions";
import { SubmitBar } from "@/components/runtime/SubmitBar";
import { Card } from "@/components/ui/Card";
import type { FieldVisitSubmission } from "@/types/visit";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const { visitId } = await params;
  const supabase = await createClient();

  const visit = await getFieldVisitFull(supabase, visitId);
  if (!visit) notFound();

  const submissionId = await ensureSubmission(visitId);
  const { data: submission } = await supabase
    .from("field_visit_submissions")
    .select("*")
    .eq("id", submissionId)
    .single<FieldVisitSubmission>();

  const { sites, answers, photos } = await getSubmissionData(supabase, submissionId);

  let incompleteRequiredCount = 0;
  for (const section of visit.sections) {
    for (const item of section.items) {
      if (!item.is_required) continue;
      if (item.repeat_scope === "site") {
        for (const site of sites) {
          if (!isItemAnsweredForSite(item, site.id, answers, photos)) {
            incompleteRequiredCount += 1;
          }
        }
      } else if (!isItemAnsweredForSite(item, null, answers, photos)) {
        incompleteRequiredCount += 1;
      }
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <Link
        href={`/visits/${visitId}/run`}
        className="text-sm text-ocean-600 underline underline-offset-2 dark:text-ocean-300"
      >
        ← Back to sections
      </Link>

      <h1 className="mt-3 text-2xl font-semibold">Review</h1>
      <p className="mt-1 text-sm text-slate-500">{visit.title}</p>

      <div className="mt-6 space-y-6">
        {visit.sections.map((section) => {
          const siteItems = section.items.filter((i) => i.repeat_scope === "site");
          const visitItems = section.items.filter((i) => i.repeat_scope === "visit");

          return (
            <section key={section.id}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">{section.title}</h2>
                <Link
                  href={`/visits/${visitId}/run/${section.id}`}
                  className="text-sm text-ocean-600 underline underline-offset-2 dark:text-ocean-300"
                >
                  Edit
                </Link>
              </div>

              {siteItems.length > 0 &&
                sites.map((site) => (
                  <Card key={site.id} className="mb-3">
                    <p className="mb-2 text-sm font-semibold text-ocean-500">📍 {site.label}</p>
                    <dl className="space-y-1 text-sm">
                      {siteItems.map((item) => {
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
                  </Card>
                ))}

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

      {submission && (
        <SubmitBar
          visitId={visitId}
          submissionId={submissionId}
          status={submission.status}
          incompleteRequiredCount={incompleteRequiredCount}
        />
      )}
    </main>
  );
}
