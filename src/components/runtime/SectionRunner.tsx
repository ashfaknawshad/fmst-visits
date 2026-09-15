"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
  submissionId,
  items,
  initialSites,
  initialAnswers,
  initialPhotos,
  initialPhotoUrls,
}: {
  visitId: string;
  submissionId: string;
  items: FieldVisitItem[];
  initialSites: SubmissionSite[];
  initialAnswers: SubmissionAnswer[];
  initialPhotos: SubmissionPhoto[];
  initialPhotoUrls: Record<string, string>;
}) {
  const supabase = createClient();

  const [sites, setSites] = useState(initialSites);
  const [activeSiteId, setActiveSiteId] = useState<string | null>(
    initialSites[0]?.id ?? null,
  );
  const [answers, setAnswers] = useState(initialAnswers);
  const [photos, setPhotos] = useState(initialPhotos);
  const [photoUrls, setPhotoUrls] = useState(initialPhotoUrls);
  const [uploading, setUploading] = useState<Set<string>>(new Set());

  const siteItems = items.filter((i) => i.repeat_scope === "site");
  const visitItems = items.filter((i) => i.repeat_scope === "visit");

  function findAnswer(itemId: string, siteId: string | null) {
    return answers.find(
      (a) => a.item_id === itemId && (a.site_id ?? null) === siteId,
    );
  }

  async function saveValue(
    itemId: string,
    siteId: string | null,
    value: Record<string, unknown> | SpeciesListRow[] | CrossSectionPoint[],
  ) {
    const { data, error } = await supabase
      .from("submission_answers")
      .upsert(
        {
          submission_id: submissionId,
          item_id: itemId,
          site_id: siteId,
          value,
          client_updated_at: new Date().toISOString(),
        },
        { onConflict: "submission_id,item_id,site_id" },
      )
      .select("*")
      .single<SubmissionAnswer>();

    if (error) {
      console.error(error);
      return;
    }

    setAnswers((prev) => {
      const idx = prev.findIndex(
        (a) => a.item_id === itemId && (a.site_id ?? null) === siteId,
      );
      if (idx === -1) return [...prev, data];
      const next = [...prev];
      next[idx] = data;
      return next;
    });
  }

  async function saveGps(
    itemId: string,
    siteId: string | null,
    fix: { lat: number; lng: number; accuracy: number; capturedAt: string },
  ) {
    const { data, error } = await supabase
      .from("submission_answers")
      .upsert(
        {
          submission_id: submissionId,
          item_id: itemId,
          site_id: siteId,
          value: {},
          gps_lat: fix.lat,
          gps_lng: fix.lng,
          gps_accuracy_m: fix.accuracy,
          gps_captured_at: fix.capturedAt,
          client_updated_at: new Date().toISOString(),
        },
        { onConflict: "submission_id,item_id,site_id" },
      )
      .select("*")
      .single<SubmissionAnswer>();

    if (error) {
      console.error(error);
      return;
    }

    setAnswers((prev) => {
      const idx = prev.findIndex(
        (a) => a.item_id === itemId && (a.site_id ?? null) === siteId,
      );
      if (idx === -1) return [...prev, data];
      const next = [...prev];
      next[idx] = data;
      return next;
    });

    if (siteId) {
      await supabase
        .from("submission_sites")
        .update({ gps_lat: fix.lat, gps_lng: fix.lng })
        .eq("id", siteId);
    }
  }

  async function addSite(label: string) {
    const { data, error } = await supabase
      .from("submission_sites")
      .insert({ submission_id: submissionId, label, order_index: sites.length })
      .select("*")
      .single<SubmissionSite>();

    if (error) {
      alert(error.message);
      return;
    }

    setSites((prev) => [...prev, data]);
    setActiveSiteId(data.id);
  }

  async function removeSite(siteId: string) {
    if (!confirm("Remove this site and all data recorded for it?")) return;

    const { error } = await supabase.from("submission_sites").delete().eq("id", siteId);
    if (error) {
      alert(error.message);
      return;
    }

    setSites((prev) => prev.filter((s) => s.id !== siteId));
    setAnswers((prev) => prev.filter((a) => a.site_id !== siteId));
    setPhotos((prev) => prev.filter((p) => p.site_id !== siteId));
    setActiveSiteId((prev) => (prev === siteId ? null : prev));
  }

  async function addPhoto(itemId: string, siteId: string | null, file: File) {
    const key = `${itemId}:${siteId ?? "visit"}`;
    setUploading((prev) => new Set(prev).add(key));

    const ext = file.name.split(".").pop() || "jpg";
    const clientLocalId = crypto.randomUUID();
    const path = `${submissionId}/${clientLocalId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("field-photos")
      .upload(path, file);

    if (uploadError) {
      setUploading((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      alert(uploadError.message);
      return;
    }

    const { data, error } = await supabase
      .from("submission_photos")
      .insert({
        submission_id: submissionId,
        item_id: itemId,
        site_id: siteId,
        storage_path: path,
        client_local_id: clientLocalId,
        taken_at: new Date().toISOString(),
      })
      .select("*")
      .single<SubmissionPhoto>();

    setUploading((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });

    if (error) {
      alert(error.message);
      return;
    }

    setPhotos((prev) => [...prev, data]);

    const { data: signed } = await supabase.storage
      .from("field-photos")
      .createSignedUrl(path, 3600);
    if (signed?.signedUrl) {
      setPhotoUrls((prev) => ({ ...prev, [data.id]: signed.signedUrl }));
    }
  }

  async function removePhoto(photoId: string) {
    const photo = photos.find((p) => p.id === photoId);
    if (!photo) return;

    await supabase.storage.from("field-photos").remove([photo.storage_path]);
    await supabase.from("submission_photos").delete().eq("id", photoId);

    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
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
            onSave={(v) => saveValue(item.id, siteId, v)}
          />
        );
      case "observation":
        return (
          <ObservationField
            key={item.id}
            item={item}
            value={(answer?.value as Record<string, unknown>) ?? {}}
            answered={answered}
            onSave={(v) => saveValue(item.id, siteId, v)}
          />
        );
      case "checklist":
        return (
          <ChecklistField
            key={item.id}
            item={item}
            value={(answer?.value as Record<string, unknown>) ?? {}}
            answered={answered}
            onSave={(v) => saveValue(item.id, siteId, v)}
          />
        );
      case "species_list":
        return (
          <SpeciesListField
            key={item.id}
            item={item}
            value={(answer?.value as SpeciesListRow[]) ?? []}
            answered={answered}
            onSave={(v) => saveValue(item.id, siteId, v)}
          />
        );
      case "cross_section":
        return (
          <CrossSectionField
            key={item.id}
            item={item}
            value={(answer?.value as CrossSectionPoint[]) ?? []}
            answered={answered}
            onSave={(v) => saveValue(item.id, siteId, v)}
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
            onSave={(fix) => saveGps(item.id, siteId, fix)}
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
            uploading={uploading.has(`${item.id}:${siteId ?? "visit"}`)}
            onAdd={(file) => addPhoto(item.id, siteId, file)}
            onRemove={removePhoto}
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
            onSelect={setActiveSiteId}
            onAdd={addSite}
            onRemove={removeSite}
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
