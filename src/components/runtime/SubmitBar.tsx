"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markSubmissionComplete, reopenSubmission } from "@/app/visits/[visitId]/run/actions";

export function SubmitBar({
  visitId,
  submissionId,
  status,
  incompleteRequiredCount,
}: {
  visitId: string;
  submissionId: string;
  status: string;
  incompleteRequiredCount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (status === "complete") {
    return (
      <div className="mt-8 space-y-2">
        <p className="text-center text-sm text-green-700 dark:text-green-400">
          This visit is marked complete. You can still edit any answer.
        </p>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await reopenSubmission(submissionId, visitId);
              router.refresh();
            })
          }
          className="w-full rounded-lg border border-slate-300 py-3 text-sm font-medium disabled:opacity-50 dark:border-slate-700"
        >
          Reopen
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-2">
      {incompleteRequiredCount > 0 && !confirming && (
        <p className="text-center text-sm text-amber-600 dark:text-amber-400">
          {incompleteRequiredCount} required item{incompleteRequiredCount === 1 ? "" : "s"} still missing.
        </p>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (incompleteRequiredCount > 0 && !confirming) {
            setConfirming(true);
            return;
          }
          startTransition(async () => {
            await markSubmissionComplete(submissionId, visitId);
            router.refresh();
          });
        }}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
      >
        {confirming ? "Submit anyway" : "Mark complete"}
      </button>
    </div>
  );
}
