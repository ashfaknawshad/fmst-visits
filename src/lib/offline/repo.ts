import { getDB, answerKey, type LocalAnswer, type LocalPhoto, type LocalSite } from "./db";
import type {
  CrossSectionPoint,
  FieldVisitFull,
  SpeciesListRow,
  SubmissionStatus,
} from "@/types/visit";

// ---------------------------------------------------------------------------
// Visit definition cache (read-mostly, refreshed opportunistically online)
// ---------------------------------------------------------------------------

export async function cacheVisit(visit: FieldVisitFull) {
  const db = await getDB();
  await db.put("visits", visit);
}

export async function getCachedVisit(visitId: string) {
  const db = await getDB();
  return db.get("visits", visitId);
}

// ---------------------------------------------------------------------------
// Submission
// ---------------------------------------------------------------------------

export async function getLocalSubmissionForVisit(visitId: string) {
  const db = await getDB();
  const all = await db.getAllFromIndex("submissions", "by-visit", visitId);
  return all[0];
}

export async function createLocalSubmission(visitId: string, studentId: string) {
  const db = await getDB();
  const id = crypto.randomUUID();
  const submission = {
    id,
    field_visit_id: visitId,
    student_id: studentId,
    status: "in_progress" as SubmissionStatus,
    client_submission_id: id,
    started_at: new Date().toISOString(),
    submitted_at: null,
    updated_at: new Date().toISOString(),
    dirty: true,
  };
  await db.put("submissions", submission);
  return submission;
}

export async function setSubmissionStatus(submissionId: string, status: SubmissionStatus) {
  const db = await getDB();
  const submission = await db.get("submissions", submissionId);
  if (!submission) return;
  submission.status = status;
  submission.submitted_at = status === "complete" ? new Date().toISOString() : null;
  submission.updated_at = new Date().toISOString();
  submission.dirty = true;
  await db.put("submissions", submission);
  return submission;
}

// ---------------------------------------------------------------------------
// Sites
// ---------------------------------------------------------------------------

export async function listSites(submissionId: string) {
  const db = await getDB();
  const sites = await db.getAllFromIndex("sites", "by-submission", submissionId);
  return sites.sort((a, b) => a.order_index - b.order_index);
}

export async function addSite(submissionId: string, label: string, orderIndex: number) {
  const db = await getDB();
  const site: LocalSite = {
    id: crypto.randomUUID(),
    submission_id: submissionId,
    label,
    order_index: orderIndex,
    gps_lat: null,
    gps_lng: null,
    dirty: true,
  };
  await db.put("sites", site);
  return site;
}

export async function removeSite(siteId: string) {
  const db = await getDB();
  const site = await db.get("sites", siteId);
  if (!site) return;

  // Cascade: drop local answers/photos tied to this site.
  const tx = db.transaction(["answers", "photos", "sites", "pending_deletes"], "readwrite");
  const answers = await tx.objectStore("answers").index("by-submission").getAll(site.submission_id);
  for (const a of answers) {
    if (a.site_id === siteId) await tx.objectStore("answers").delete(a.local_key);
  }
  const photos = await tx.objectStore("photos").index("by-submission").getAll(site.submission_id);
  for (const p of photos) {
    if (p.site_id === siteId) await tx.objectStore("photos").delete(p.id);
  }
  await tx.objectStore("sites").delete(siteId);

  // Only worth telling the server if this site had ever synced there before.
  if (!site.dirty) {
    await tx.objectStore("pending_deletes").put({
      id: crypto.randomUUID(),
      table: "submission_sites",
      recordId: siteId,
    });
  }
  await tx.done;
}

export async function updateSiteGps(siteId: string, lat: number, lng: number) {
  const db = await getDB();
  const site = await db.get("sites", siteId);
  if (!site) return;
  site.gps_lat = lat;
  site.gps_lng = lng;
  site.dirty = true;
  await db.put("sites", site);
}

// ---------------------------------------------------------------------------
// Answers
// ---------------------------------------------------------------------------

export async function listAnswers(submissionId: string) {
  const db = await getDB();
  return db.getAllFromIndex("answers", "by-submission", submissionId);
}

async function upsertAnswer(
  submissionId: string,
  itemId: string,
  siteId: string | null,
  patch: Partial<LocalAnswer>,
) {
  const db = await getDB();
  const key = answerKey(submissionId, itemId, siteId);
  const existing = await db.get("answers", key);

  const record: LocalAnswer = {
    local_key: key,
    id: existing?.id ?? crypto.randomUUID(),
    submission_id: submissionId,
    item_id: itemId,
    site_id: siteId,
    value: existing?.value ?? {},
    gps_lat: existing?.gps_lat ?? null,
    gps_lng: existing?.gps_lng ?? null,
    gps_accuracy_m: existing?.gps_accuracy_m ?? null,
    gps_captured_at: existing?.gps_captured_at ?? null,
    client_updated_at: new Date().toISOString(),
    synced_at: null,
    dirty: true,
    ...patch,
  };

  await db.put("answers", record);
  return record;
}

export async function saveAnswerValue(
  submissionId: string,
  itemId: string,
  siteId: string | null,
  value: Record<string, unknown> | SpeciesListRow[] | CrossSectionPoint[],
) {
  return upsertAnswer(submissionId, itemId, siteId, { value });
}

export async function saveAnswerGps(
  submissionId: string,
  itemId: string,
  siteId: string | null,
  fix: { lat: number; lng: number; accuracy: number; capturedAt: string },
) {
  return upsertAnswer(submissionId, itemId, siteId, {
    gps_lat: fix.lat,
    gps_lng: fix.lng,
    gps_accuracy_m: fix.accuracy,
    gps_captured_at: fix.capturedAt,
  });
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

export async function listPhotos(submissionId: string) {
  const db = await getDB();
  return db.getAllFromIndex("photos", "by-submission", submissionId);
}

export async function addPhoto(
  submissionId: string,
  itemId: string,
  siteId: string | null,
  blob: Blob,
) {
  const db = await getDB();
  const clientLocalId = crypto.randomUUID();
  const photo: LocalPhoto = {
    id: clientLocalId,
    submission_id: submissionId,
    item_id: itemId,
    site_id: siteId,
    storage_path: `${submissionId}/${clientLocalId}.jpg`,
    caption: null,
    taken_at: new Date().toISOString(),
    gps_lat: null,
    gps_lng: null,
    client_local_id: clientLocalId,
    synced_at: null,
    dirty: true,
    blob,
  };
  await db.put("photos", photo);
  return photo;
}

export async function removePhoto(photoId: string) {
  const db = await getDB();
  const photo = await db.get("photos", photoId);
  if (!photo) return;

  const tx = db.transaction(["photos", "pending_deletes"], "readwrite");
  await tx.objectStore("photos").delete(photoId);
  if (!photo.dirty) {
    await tx.objectStore("pending_deletes").put({
      id: crypto.randomUUID(),
      table: "submission_photos",
      recordId: photoId,
      storagePath: photo.storage_path,
    });
  }
  await tx.done;
}

// ---------------------------------------------------------------------------
// Pending deletes
// ---------------------------------------------------------------------------

export async function listPendingDeletes() {
  const db = await getDB();
  return db.getAll("pending_deletes");
}

export async function clearPendingDelete(id: string) {
  const db = await getDB();
  await db.delete("pending_deletes", id);
}
