import { getDB } from "./db";
import { clearPendingDelete, listPendingDeletes } from "./repo";
import { createClient } from "@/lib/supabase/client";

let syncing = false;

export interface SyncResult {
  ranOffline: boolean;
  synced: number;
  failed: number;
}

export async function runSync(): Promise<SyncResult> {
  if (syncing) return { ranOffline: false, synced: 0, failed: 0 };
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { ranOffline: true, synced: 0, failed: 0 };
  }

  syncing = true;
  let synced = 0;
  let failed = 0;

  try {
    const supabase = createClient();
    const db = await getDB();

    // Submissions first — sites/answers/photos all FK to them.
    const submissions = (await db.getAll("submissions")).filter((s) => s.dirty);
    for (const s of submissions) {
      const { error } = await supabase.from("field_visit_submissions").upsert(
        {
          id: s.id,
          field_visit_id: s.field_visit_id,
          student_id: s.student_id,
          status: s.status,
          client_submission_id: s.client_submission_id,
          started_at: s.started_at,
          submitted_at: s.submitted_at,
        },
        { onConflict: "id" },
      );
      if (error) {
        failed++;
        continue;
      }
      await db.put("submissions", { ...s, dirty: false });
      synced++;
    }

    // Sites next — answers/photos FK to them.
    const sites = (await db.getAll("sites")).filter((s) => s.dirty);
    for (const site of sites) {
      const { error } = await supabase.from("submission_sites").upsert(
        {
          id: site.id,
          submission_id: site.submission_id,
          label: site.label,
          order_index: site.order_index,
          gps_lat: site.gps_lat,
          gps_lng: site.gps_lng,
        },
        { onConflict: "id" },
      );
      if (error) {
        failed++;
        continue;
      }
      await db.put("sites", { ...site, dirty: false });
      synced++;
    }

    const answers = (await db.getAll("answers")).filter((a) => a.dirty);
    for (const answer of answers) {
      const syncedAt = new Date().toISOString();
      const { error } = await supabase.from("submission_answers").upsert(
        {
          id: answer.id,
          submission_id: answer.submission_id,
          item_id: answer.item_id,
          site_id: answer.site_id,
          value: answer.value,
          gps_lat: answer.gps_lat,
          gps_lng: answer.gps_lng,
          gps_accuracy_m: answer.gps_accuracy_m,
          gps_captured_at: answer.gps_captured_at,
          client_updated_at: answer.client_updated_at,
          synced_at: syncedAt,
        },
        { onConflict: "id" },
      );
      if (error) {
        failed++;
        continue;
      }
      await db.put("answers", { ...answer, dirty: false, synced_at: syncedAt });
      synced++;
    }

    const photos = (await db.getAll("photos")).filter((p) => p.dirty);
    for (const photo of photos) {
      const syncedAt = new Date().toISOString();

      const { error: uploadError } = await supabase.storage
        .from("field-photos")
        .upload(photo.storage_path, photo.blob, { upsert: true });
      if (uploadError) {
        failed++;
        continue;
      }

      const { error: dbError } = await supabase.from("submission_photos").upsert(
        {
          id: photo.id,
          submission_id: photo.submission_id,
          item_id: photo.item_id,
          site_id: photo.site_id,
          storage_path: photo.storage_path,
          caption: photo.caption,
          taken_at: photo.taken_at,
          gps_lat: photo.gps_lat,
          gps_lng: photo.gps_lng,
          client_local_id: photo.client_local_id,
          synced_at: syncedAt,
        },
        { onConflict: "id" },
      );
      if (dbError) {
        failed++;
        continue;
      }
      await db.put("photos", { ...photo, dirty: false, synced_at: syncedAt });
      synced++;
    }

    // Deletes — safe to run after creates/updates since they target already-synced rows.
    const pendingDeletes = await listPendingDeletes();
    for (const del of pendingDeletes) {
      if (del.table === "submission_sites") {
        const { error } = await supabase.from("submission_sites").delete().eq("id", del.recordId);
        if (error) {
          failed++;
          continue;
        }
      } else {
        if (del.storagePath) {
          await supabase.storage.from("field-photos").remove([del.storagePath]);
        }
        const { error } = await supabase.from("submission_photos").delete().eq("id", del.recordId);
        if (error) {
          failed++;
          continue;
        }
      }
      await clearPendingDelete(del.id);
      synced++;
    }
  } finally {
    syncing = false;
  }

  return { ranOffline: false, synced, failed };
}

export async function countPending(): Promise<number> {
  const db = await getDB();
  const [submissions, sites, answers, photos, deletes] = await Promise.all([
    db.getAll("submissions"),
    db.getAll("sites"),
    db.getAll("answers"),
    db.getAll("photos"),
    listPendingDeletes(),
  ]);
  return (
    submissions.filter((s) => s.dirty).length +
    sites.filter((s) => s.dirty).length +
    answers.filter((a) => a.dirty).length +
    photos.filter((p) => p.dirty).length +
    deletes.length
  );
}
