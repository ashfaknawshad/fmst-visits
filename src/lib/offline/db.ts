import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  FieldVisitFull,
  FieldVisitSubmission,
  SubmissionAnswer,
  SubmissionPhoto,
  SubmissionSite,
} from "@/types/visit";

export type LocalSubmission = FieldVisitSubmission & { dirty: boolean };
export type LocalSite = SubmissionSite & { dirty: boolean };
/**
 * local_key is a deterministic string ("submissionId:itemId:siteId|visit") used as the
 * IndexedDB primary key, so repeated saves to the same (submission, item, site) always
 * overwrite the same local record. `id` is a real UUID, generated once on first save and
 * reused for every later update — it's what gets written as the row's primary key in
 * Supabase, so sync is a plain upsert-by-id with no local/remote id remapping.
 */
export type LocalAnswer = SubmissionAnswer & { dirty: boolean; local_key: string };
export type LocalPhoto = SubmissionPhoto & { dirty: boolean; blob: Blob };

export interface PendingDelete {
  id: string;
  table: "submission_sites" | "submission_photos";
  recordId: string;
  storagePath?: string;
}

interface FieldVisitTrackerDB extends DBSchema {
  visits: {
    key: string;
    value: FieldVisitFull;
  };
  submissions: {
    key: string;
    value: LocalSubmission;
    indexes: { "by-visit": string };
  };
  sites: {
    key: string;
    value: LocalSite;
    indexes: { "by-submission": string };
  };
  answers: {
    key: string;
    value: LocalAnswer;
    indexes: { "by-submission": string };
  };
  photos: {
    key: string;
    value: LocalPhoto;
    indexes: { "by-submission": string };
  };
  pending_deletes: {
    key: string;
    value: PendingDelete;
  };
}

let dbPromise: Promise<IDBPDatabase<FieldVisitTrackerDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<FieldVisitTrackerDB>("field-visit-tracker", 1, {
      upgrade(db) {
        db.createObjectStore("visits", { keyPath: "id" });

        const submissions = db.createObjectStore("submissions", { keyPath: "id" });
        submissions.createIndex("by-visit", "field_visit_id");

        const sites = db.createObjectStore("sites", { keyPath: "id" });
        sites.createIndex("by-submission", "submission_id");

        const answers = db.createObjectStore("answers", { keyPath: "local_key" });
        answers.createIndex("by-submission", "submission_id");

        const photos = db.createObjectStore("photos", { keyPath: "id" });
        photos.createIndex("by-submission", "submission_id");

        db.createObjectStore("pending_deletes", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

/** Stable local key so repeated saves to the same (submission,item,site) overwrite in place. */
export function answerKey(submissionId: string, itemId: string, siteId: string | null) {
  return `${submissionId}:${itemId}:${siteId ?? "visit"}`;
}
