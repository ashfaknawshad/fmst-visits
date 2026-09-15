"use client";

import { isItemAnsweredForSite } from "@/lib/progress";
import { SiteManager } from "./SiteManager";
import {
  MeasurementField,
  ObservationField,
  ChecklistField,
  SpeciesListField,
} from "./ItemFields";
import { GpsField } from "./GpsField";
import { PhotoField } from "./PhotoField";
import { CrossSectionField } from "./CrossSectionField";
import type {
  CrossSectionPoint,
  FieldVisitItem,
  SpeciesListRow,
  SubmissionAnswer,
  SubmissionPhoto,
  SubmissionSite,
} from "@/types/visit";

export function SectionRunner({
  items,
  sites,
  answers,
  photos,
  photoUrls,
  uploadingKeys,
  activeSiteId,
  onSelectSite,
  onAddSite,
  onRemoveSite,
  onSaveValue,
  onSaveGps,
  onAddPhoto,
  onRemovePhoto,
}: {
  items: FieldVisitItem[];
  sites: SubmissionSite[];
  answers: SubmissionAnswer[];
  photos: SubmissionPhoto[];
  photoUrls: Record<string, string>;
  uploadingKeys: Set<string>;
  activeSiteId: string | null;
  onSelectSite: (siteId: string) => void;
  onAddSite: (label: string) => void;
  onRemoveSite: (siteId: string) => void;
  onSaveValue: (
    itemId: string,
    siteId: string | null,
    value: Record<string, unknown> | SpeciesListRow[] | CrossSectionPoint[],
  ) => void;
  onSaveGps: (
    itemId: string,
    siteId: string | null,
    fix: { lat: number; lng: number; accuracy: number; capturedAt: string },
  ) => void;
  onAddPhoto: (itemId: string, siteId: string | null, file: File) => void;
  onRemovePhoto: (photoId: string) => void;
}) {
  const siteItems = items.filter((i) => i.repeat_scope === "site");
  const visitItems = items.filter((i) => i.repeat_scope === "visit");

  function findAnswer(itemId: string, siteId: string | null) {
    return answers.find((a) => a.item_id === itemId && (a.site_id ?? null) === siteId);
  }

  function renderItem(item: FieldVisitItem, siteId: string | null) {
    const answer = findAnswer(item.id, siteId);
    const answered = isItemAnsweredForSite(item, siteId, answers, photos);

    switch (item.item_type) {
      case "measurement":
        return (
          <MeasurementField
            key={item.id}
            item={item}
            value={(answer?.value as Record<string, unknown>) ?? {}}
            answered={answered}
            onSave={(v) => onSaveValue(item.id, siteId, v)}
          />
        );
      case "observation":
        return (
          <ObservationField
            key={item.id}
            item={item}
            value={(answer?.value as Record<string, unknown>) ?? {}}
            answered={answered}
            onSave={(v) => onSaveValue(item.id, siteId, v)}
          />
        );
      case "checklist":
        return (
          <ChecklistField
            key={item.id}
            item={item}
            value={(answer?.value as Record<string, unknown>) ?? {}}
            answered={answered}
            onSave={(v) => onSaveValue(item.id, siteId, v)}
          />
        );
      case "species_list":
        return (
          <SpeciesListField
            key={item.id}
            item={item}
            value={(answer?.value as SpeciesListRow[]) ?? []}
            answered={answered}
            onSave={(v) => onSaveValue(item.id, siteId, v)}
          />
        );
      case "cross_section":
        return (
          <CrossSectionField
            key={item.id}
            item={item}
            value={(answer?.value as CrossSectionPoint[]) ?? []}
            answered={answered}
            onSave={(v) => onSaveValue(item.id, siteId, v)}
          />
        );
      case "gps":
        return (
          <GpsField
            key={item.id}
            item={item}
            lat={answer?.gps_lat ?? null}
            lng={answer?.gps_lng ?? null}
            accuracy={answer?.gps_accuracy_m ?? null}
            answered={answered}
            onSave={(fix) => onSaveGps(item.id, siteId, fix)}
          />
        );
      case "photo": {
        const itemPhotos = photos.filter(
          (p) => p.item_id === item.id && (p.site_id ?? null) === siteId,
        );
        return (
          <PhotoField
            key={item.id}
            item={item}
            photos={itemPhotos}
            photoUrls={photoUrls}
            uploading={uploadingKeys.has(`${item.id}:${siteId ?? "visit"}`)}
            onAdd={(file) => onAddPhoto(item.id, siteId, file)}
            onRemove={onRemovePhoto}
          />
        );
      }
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {siteItems.length > 0 && (
        <>
          <SiteManager
            sites={sites}
            activeSiteId={activeSiteId}
            onSelect={onSelectSite}
            onAdd={onAddSite}
            onRemove={onRemoveSite}
          />

          {activeSiteId ? (
            <div className="space-y-4">
              {siteItems.map((item) => renderItem(item, activeSiteId))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-border-soft p-4 text-sm text-slate-500">
              Add a site above to start recording data for it.
            </p>
          )}
        </>
      )}

      {visitItems.length > 0 && (
        <div className="space-y-4">
          {siteItems.length > 0 && (
            <p className="text-sm font-semibold uppercase tracking-wide text-ocean-500">
              General
            </p>
          )}
          {visitItems.map((item) => renderItem(item, null))}
        </div>
      )}
    </div>
  );
}
