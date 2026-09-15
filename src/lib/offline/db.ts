import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  FieldVisitFull,
  FieldVisitSubmission,
  SubmissionAnswer,
  SubmissionPhoto,
  SubmissionSite,
} from "@/types/visit";

interface SyncQueueEntry {
  id: string;
  table: "submission_answers" | "submission_photos" | "submission_sites" | "field_visit_submissions";
  recordId: string;
  createdAt: string;
}

interface FieldVisitTrackerDB extends DBSchema {
  visits: {
    key: string;
    value: FieldVisitFull;
  };
  submissions: {
    key: string;
    value: FieldVisitSubmission;
  };
  sites: {
    key: string;
    value: SubmissionSite;
    indexes: { "by-submission": string };
  };
  answers: {
    key: string;
    value: SubmissionAnswer & { dirty: boolean };
    indexes: { "by-submission": string };
  };
  photos: {
    key: string;
    value: SubmissionPhoto & { dirty: boolean; blob?: Blob };
    indexes: { "by-submission": string };
  };
  sync_queue: {
    key: string;
    value: SyncQueueEntry;
  };
}

let dbPromise: Promise<IDBPDatabase<FieldVisitTrackerDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<FieldVisitTrackerDB>("field-visit-tracker", 1, {
      upgrade(db) {
        db.createObjectStore("visits", { keyPath: "id" });
        db.createObjectStore("submissions", { keyPath: "id" });

        const sites = db.createObjectStore("sites", { keyPath: "id" });
        sites.createIndex("by-submission", "submission_id");

        const answers = db.createObjectStore("answers", { keyPath: "id" });
        answers.createIndex("by-submission", "submission_id");

        const photos = db.createObjectStore("photos", { keyPath: "id" });
        photos.createIndex("by-submission", "submission_id");

        db.createObjectStore("sync_queue", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}
