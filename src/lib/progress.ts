import type {
  CrossSectionConfig,
  CrossSectionPoint,
  FieldVisitItem,
  MeasurementConfig,
  PhotoConfig,
  SpeciesListRow,
  SubmissionAnswer,
  SubmissionPhoto,
} from "@/types/visit";

export function isItemAnsweredForSite(
  item: FieldVisitItem,
  siteId: string | null,
  answers: SubmissionAnswer[],
  photos: SubmissionPhoto[],
): boolean {
  if (item.item_type === "photo") {
    const config = item.config as unknown as PhotoConfig;
    const minCount = config.min_count ?? 1;
    const count = photos.filter(
      (p) => p.item_id === item.id && (p.site_id ?? null) === siteId,
    ).length;
    return count >= minCount;
  }

  const answer = answers.find(
    (a) => a.item_id === item.id && (a.site_id ?? null) === siteId,
  );
  if (!answer) return false;

  if (item.item_type === "gps") {
    return answer.gps_lat != null && answer.gps_lng != null;
  }

  if (item.item_type === "species_list") {
    return Array.isArray(answer.value) && (answer.value as SpeciesListRow[]).length > 0;
  }

  if (item.item_type === "cross_section") {
    const config = item.config as unknown as CrossSectionConfig;
    const minPoints = config.min_points ?? 2;
    return (
      Array.isArray(answer.value) && (answer.value as CrossSectionPoint[]).length >= minPoints
    );
  }

  const value = (answer.value as Record<string, unknown>) ?? {};

  if (item.item_type === "checklist") {
    return value.checked === true;
  }

  if (item.item_type === "measurement") {
    return typeof value.number === "number" && !Number.isNaN(value.number);
  }

  // observation
  if (typeof value.selected === "string" && value.selected.length > 0) return true;
  if (typeof value.text === "string" && value.text.trim().length > 0) return true;
  return false;
}

export function measurementOutOfRange(item: FieldVisitItem, num: number): boolean {
  const config = item.config as unknown as MeasurementConfig;
  if (config.min != null && num < config.min) return true;
  if (config.max != null && num > config.max) return true;
  return false;
}

export interface SectionProgress {
  totalSlots: number;
  filledSlots: number;
  needsSites: boolean;
}

export function computeSectionProgress(
  items: FieldVisitItem[],
  siteIds: string[],
  answers: SubmissionAnswer[],
  photos: SubmissionPhoto[],
): SectionProgress {
  const requiredItems = items.filter((i) => i.is_required);
  const hasSiteScoped = requiredItems.some((i) => i.repeat_scope === "site");

  let totalSlots = 0;
  let filledSlots = 0;

  for (const item of requiredItems) {
    if (item.repeat_scope === "site") {
      for (const siteId of siteIds) {
        totalSlots += 1;
        if (isItemAnsweredForSite(item, siteId, answers, photos)) filledSlots += 1;
      }
    } else {
      totalSlots += 1;
      if (isItemAnsweredForSite(item, null, answers, photos)) filledSlots += 1;
    }
  }

  return {
    totalSlots,
    filledSlots,
    needsSites: hasSiteScoped && siteIds.length === 0,
  };
}
