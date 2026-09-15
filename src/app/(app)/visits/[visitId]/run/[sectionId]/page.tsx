import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSubmissionData } from "@/lib/visits";
import { ensureSubmission } from "../actions";
import { SectionRunner } from "@/components/runtime/SectionRunner";
import type { FieldVisitItem, FieldVisitSection } from "@/types/visit";

export default async function RunSectionPage({
  params,
}: {
  params: Promise<{ visitId: string; sectionId: string }>;
}) {
  const { visitId, sectionId } = await params;
  const supabase = await createClient();

  const { data: section } = await supabase
    .from("field_visit_sections")
    .select("*")
    .eq("id", sectionId)
    .eq("field_visit_id", visitId)
    .maybeSingle<FieldVisitSection>();

  if (!section) notFound();

  const { data: items } = await supabase
    .from("field_visit_items")
    .select("*")
    .eq("section_id", sectionId)
    .order("order_index")
    .returns<FieldVisitItem[]>();

  const submissionId = await ensureSubmission(visitId);
  const { sites, answers, photos } = await getSubmissionData(supabase, submissionId);

  const itemIds = new Set((items ?? []).map((i) => i.id));
  const sectionAnswers = answers.filter((a) => itemIds.has(a.item_id));
  const sectionPhotos = photos.filter((p) => p.item_id && itemIds.has(p.item_id));

  const photoUrls: Record<string, string> = {};
  await Promise.all(
    sectionPhotos.map(async (p) => {
      const { data } = await supabase.storage
        .from("field-photos")
        .createSignedUrl(p.storage_path, 3600);
      if (data?.signedUrl) photoUrls[p.id] = data.signedUrl;
    }),
  );

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <Link
        href={`/visits/${visitId}/run`}
        className="text-sm text-ocean-600 underline underline-offset-2 dark:text-ocean-300"
      >
        ← All sections
      </Link>

      <h1 className="mt-3 text-2xl font-semibold">{section.title}</h1>
      {section.instructions && (
        <p className="mt-1 text-sm text-slate-500">{section.instructions}</p>
      )}

      <SectionRunner
        visitId={visitId}
        submissionId={submissionId}
        items={items ?? []}
        initialSites={sites}
        initialAnswers={sectionAnswers}
        initialPhotos={sectionPhotos}
        initialPhotoUrls={photoUrls}
      />
    </main>
  );
}
