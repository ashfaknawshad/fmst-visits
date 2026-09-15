import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  FieldVisit,
  FieldVisitFull,
  FieldVisitItem,
  FieldVisitSection,
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
