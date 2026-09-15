import type { FieldVisitItem, SpeciesListRow, SubmissionAnswer, SubmissionPhoto } from "@/types/visit";

export function formatAnswerValue(
  item: FieldVisitItem,
  answer: SubmissionAnswer | undefined,
  photos: SubmissionPhoto[],
): string {
  if (item.item_type === "photo") {
    return photos.length ? `${photos.length} photo${photos.length === 1 ? "" : "s"}` : "—";
  }

  if (item.item_type === "gps") {
    if (answer?.gps_lat == null || answer?.gps_lng == null) return "—";
    return `${answer.gps_lat.toFixed(6)}, ${answer.gps_lng.toFixed(6)}`;
  }

  const value = (answer?.value as Record<string, unknown>) ?? {};

  if (item.item_type === "species_list") {
    const rows = (answer?.value as SpeciesListRow[]) ?? [];
    if (!rows.length) return "—";
    return rows
      .map((r) => `${r.taxon_name || "?"}${r.density != null ? ` (${r.density})` : ""}`)
      .join(", ");
  }

  if (item.item_type === "checklist") {
    return value.checked === true ? "Done" : "Not done";
  }

  if (item.item_type === "measurement") {
    return typeof value.number === "number" ? String(value.number) : "—";
  }

  // observation
  if (typeof value.selected === "string") {
    return value.selected === "other" && typeof value.other_text === "string"
      ? `Other: ${value.other_text}`
      : value.selected;
  }
  if (typeof value.text === "string" && value.text.trim()) return value.text;
  return "—";
}
