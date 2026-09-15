import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FieldVisit,
  FieldVisitFull,
  FieldVisitItem,
  FieldVisitSection,
  SubmissionAnswer,
  SubmissionPhoto,
  SubmissionSite,
} from "@/types/visit";

export async function getFieldVisitFull(
  supabase: SupabaseClient,
  visitId: string,
): Promise<FieldVisitFull | null> {
  const { data: visit } = await supabase
    .from("field_visits")
    .select("*")
    .eq("id", visitId)
    .maybeSingle<FieldVisit>();

  if (!visit) return null;

  const { data: sections } = await supabase
    .from("field_visit_sections")
    .select("*")
    .eq("field_visit_id", visitId)
    .order("order_index")
    .returns<FieldVisitSection[]>();

  const sectionIds = (sections ?? []).map((s) => s.id);

  const { data: items } = sectionIds.length
    ? await supabase
        .from("field_visit_items")
        .select("*")
        .in("section_id", sectionIds)
        .order("order_index")
        .returns<FieldVisitItem[]>()
    : { data: [] as FieldVisitItem[] };

  const itemsBySection = new Map<string, FieldVisitItem[]>();
  for (const item of items ?? []) {
    const list = itemsBySection.get(item.section_id) ?? [];
    list.push(item);
    itemsBySection.set(item.section_id, list);
  }

  return {
    ...visit,
    sections: (sections ?? []).map((s) => ({
      ...s,
      items: itemsBySection.get(s.id) ?? [],
    })),
  };
}

export async function getSubmissionData(
  supabase: SupabaseClient,
  submissionId: string,
): Promise<{
  sites: SubmissionSite[];
  answers: SubmissionAnswer[];
  photos: SubmissionPhoto[];
}> {
  const [{ data: sites }, { data: answers }, { data: photos }] = await Promise.all([
    supabase
      .from("submission_sites")
      .select("*")
      .eq("submission_id", submissionId)
      .order("order_index")
      .returns<SubmissionSite[]>(),
    supabase
      .from("submission_answers")
      .select("*")
      .eq("submission_id", submissionId)
      .returns<SubmissionAnswer[]>(),
    supabase
      .from("submission_photos")
      .select("*")
      .eq("submission_id", submissionId)
      .returns<SubmissionPhoto[]>(),
  ]);

  return {
    sites: sites ?? [],
    answers: answers ?? [],
    photos: photos ?? [],
  };
}
