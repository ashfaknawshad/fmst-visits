"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getFieldVisitFull } from "@/lib/visits";
import { getDB, answerKey } from "@/lib/offline/db";
import {
  cacheVisit,
  getCachedVisit,
  getLocalSubmissionForVisit,
  createLocalSubmission,
  setSubmissionStatus,
  listSites,
  addSite as repoAddSite,
  removeSite as repoRemoveSite,
  updateSiteGps,
  listAnswers,
  saveAnswerValue,
  saveAnswerGps,
  listPhotos,
  addPhoto as repoAddPhoto,
  removePhoto as repoRemovePhoto,
} from "@/lib/offline/repo";
import { runSync } from "@/lib/offline/sync";
import { SectionListView } from "./SectionListView";
import { SectionRunner } from "./SectionRunner";
import { ReviewView } from "./ReviewView";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { TurtleIcon } from "@/components/illustrations/Critters";
import type {
  CrossSectionPoint,
  FieldVisitFull,
  FieldVisitSubmission,
  SpeciesListRow,
  SubmissionAnswer,
  SubmissionPhoto,
  SubmissionSite,
} from "@/types/visit";
import type { LocalPhoto, LocalSubmission } from "@/lib/offline/db";

type Step = { type: "list" } | { type: "section"; sectionId: string } | { type: "review" };

export function RunClient({ visitId }: { visitId: string }) {
  const supabase = useMemo(() => createClient(), []);

  async function hydrateFromRemote(submissionId: string) {
    const [{ data: remoteSites }, { data: remoteAnswers }, { data: remotePhotos }] =
      await Promise.all([
        supabase
          .from("submission_sites")
          .select("*")
          .eq("submission_id", submissionId)
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

    const db = await getDB();

    for (const s of remoteSites ?? []) {
      await db.put("sites", { ...s, dirty: false });
    }
    for (const a of remoteAnswers ?? []) {
      await db.put("answers", {
        ...a,
        dirty: false,
        local_key: answerKey(a.submission_id, a.item_id, a.site_id),
      });
    }
    for (const p of remotePhotos ?? []) {
      const { data: blob } = await supabase.storage.from("field-photos").download(p.storage_path);
      if (blob) {
        await db.put("photos", { ...p, dirty: false, blob });
      }
    }
  }

  const [loading, setLoading] = useState(true);
  const [visit, setVisit] = useState<FieldVisitFull | null>(null);
  const [submission, setSubmission] = useState<LocalSubmission | null>(null);
  const [sites, setSites] = useState<SubmissionSite[]>([]);
  const [answers, setAnswers] = useState<SubmissionAnswer[]>([]);
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [uploadingKeys, setUploadingKeys] = useState<Set<string>>(new Set());
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>({ type: "list" });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      let cachedVisit = await getCachedVisit(visitId);
      if (navigator.onLine) {
        const fetched = await getFieldVisitFull(supabase, visitId);
        if (fetched) {
          await cacheVisit(fetched);
          cachedVisit = fetched;
        }
      }
      if (cancelled) return;
      setVisit(cachedVisit ?? null);

      let sub = await getLocalSubmissionForVisit(visitId);

      if (!sub) {
        const { data: sessionData } = await supabase.auth.getSession();
        const studentId = sessionData.session?.user.id;

        if (studentId && navigator.onLine) {
          const { data: remote } = await supabase
            .from("field_visit_submissions")
            .select("*")
            .eq("field_visit_id", visitId)
            .eq("student_id", studentId)
            .maybeSingle<FieldVisitSubmission>();
          if (remote) {
            const db = await getDB();
            const local = { ...remote, dirty: false };
            await db.put("submissions", local);
            sub = local;
            // First time this device has seen this submission — pull down
            // whatever's already on the server so nothing looks lost.
            await hydrateFromRemote(remote.id);
          }
        }

        if (!sub && studentId) {
          sub = await createLocalSubmission(visitId, studentId);
        }
      }

      if (cancelled) return;
      setSubmission(sub ?? null);

      if (sub) {
        const [s, a, p] = await Promise.all([
          listSites(sub.id),
          listAnswers(sub.id),
          listPhotos(sub.id),
        ]);
        if (cancelled) return;
        setSites(s);
        setAnswers(a);
        setPhotos(p);
        if (s.length > 0) setActiveSiteId(s[0].id);
      }

      setLoading(false);
      void runSync();
    }

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitId]);

  // Object URLs for locally-stored photo blobs — works fully offline, no signed URLs needed.
  const photoUrls = useMemo(() => {
    const urls: Record<string, string> = {};
    for (const p of photos) {
      if (p.blob) urls[p.id] = URL.createObjectURL(p.blob);
    }
    return urls;
  }, [photos]);

  useEffect(() => {
    return () => {
      Object.values(photoUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoUrls]);

  async function refreshSubmissionState(submissionId: string) {
    const [s, a, p] = await Promise.all([
      listSites(submissionId),
      listAnswers(submissionId),
      listPhotos(submissionId),
    ]);
    setSites(s);
    setAnswers(a);
    setPhotos(p);
  }

  async function handleSaveValue(
    itemId: string,
    siteId: string | null,
    value: Record<string, unknown> | SpeciesListRow[] | CrossSectionPoint[],
  ) {
    if (!submission) return;
    await saveAnswerValue(submission.id, itemId, siteId, value);
    setAnswers(await listAnswers(submission.id));
    void runSync();
  }

  async function handleSaveGps(
    itemId: string,
    siteId: string | null,
    fix: { lat: number; lng: number; accuracy: number; capturedAt: string },
  ) {
    if (!submission) return;
    await saveAnswerGps(submission.id, itemId, siteId, fix);
    if (siteId) await updateSiteGps(siteId, fix.lat, fix.lng);
    await refreshSubmissionState(submission.id);
    void runSync();
  }

  async function handleAddSite(label: string) {
    if (!submission) return;
    const site = await repoAddSite(submission.id, label, sites.length);
    setSites(await listSites(submission.id));
    setActiveSiteId(site.id);
    void runSync();
  }

  async function handleRemoveSite(siteId: string) {
    if (!submission) return;
    if (!confirm("Remove this site and all data recorded for it?")) return;
    await repoRemoveSite(siteId);
    await refreshSubmissionState(submission.id);
    setActiveSiteId((prev) => (prev === siteId ? null : prev));
    void runSync();
  }

  async function handleAddPhoto(itemId: string, siteId: string | null, file: File) {
    if (!submission) return;
    const key = `${itemId}:${siteId ?? "visit"}`;
    setUploadingKeys((prev) => new Set(prev).add(key));
    await repoAddPhoto(submission.id, itemId, siteId, file);
    setUploadingKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setPhotos(await listPhotos(submission.id));
    void runSync();
  }

  async function handleRemovePhoto(photoId: string) {
    if (!submission) return;
    await repoRemovePhoto(photoId);
    setPhotos(await listPhotos(submission.id));
    void runSync();
  }

  async function handleMarkComplete() {
    if (!submission) return;
    const updated = await setSubmissionStatus(submission.id, "complete");
    if (updated) setSubmission(updated);
    void runSync();
  }

  async function handleReopen() {
    if (!submission) return;
    const updated = await setSubmissionStatus(submission.id, "in_progress");
    if (updated) setSubmission(updated);
    void runSync();
  }

  if (loading) return <PageSpinner label="Loading visit…" />;

  if (!visit) {
    return (
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
        <EmptyState
          icon={<TurtleIcon size={56} />}
          title="This visit isn't available offline yet"
          description="Open this visit once while you have a connection, then it'll work anywhere."
        />
      </main>
    );
  }

  if (!submission) {
    return (
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
        <EmptyState
          icon={<TurtleIcon size={56} />}
          title="Sign in required"
          description="You need to have signed in at least once online before starting this visit offline."
        />
      </main>
    );
  }

  const backTarget =
    step.type === "section"
      ? { label: "← All sections", onClick: () => setStep({ type: "list" }) }
      : step.type === "review"
        ? { label: "← All sections", onClick: () => setStep({ type: "list" }) }
        : null;

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      {backTarget ? (
        <button
          type="button"
          onClick={backTarget.onClick}
          className="text-sm text-ocean-600 underline underline-offset-2 dark:text-ocean-300"
        >
          {backTarget.label}
        </button>
      ) : (
        <Link
          href={`/visits/${visitId}`}
          className="text-sm text-ocean-600 underline underline-offset-2 dark:text-ocean-300"
        >
          ← Overview
        </Link>
      )}

      {step.type === "list" && (
        <div className="mt-3">
          <SectionListView
            visit={visit}
            sites={sites}
            answers={answers}
            photos={photos}
            onOpenSection={(sectionId) => setStep({ type: "section", sectionId })}
            onOpenReview={() => setStep({ type: "review" })}
          />
        </div>
      )}

      {step.type === "section" &&
        (() => {
          const section = visit.sections.find((s) => s.id === step.sectionId);
          if (!section) return null;
          return (
            <div className="mt-3">
              <h1 className="text-2xl font-semibold">{section.title}</h1>
              {section.instructions && (
                <p className="mt-1 text-sm text-slate-500">{section.instructions}</p>
              )}
              <SectionRunner
                items={section.items}
                sites={sites}
                answers={answers}
                photos={photos}
                photoUrls={photoUrls}
                uploadingKeys={uploadingKeys}
                activeSiteId={activeSiteId}
                onSelectSite={setActiveSiteId}
                onAddSite={handleAddSite}
                onRemoveSite={handleRemoveSite}
                onSaveValue={handleSaveValue}
                onSaveGps={handleSaveGps}
                onAddPhoto={handleAddPhoto}
                onRemovePhoto={handleRemovePhoto}
              />
            </div>
          );
        })()}

      {step.type === "review" && (
        <div className="mt-3">
          <ReviewView
            visit={visit}
            submission={submission}
            sites={sites}
            answers={answers}
            photos={photos}
            onEditSection={(sectionId) => setStep({ type: "section", sectionId })}
            onMarkComplete={handleMarkComplete}
            onReopen={handleReopen}
          />
        </div>
      )}
    </main>
  );
}
