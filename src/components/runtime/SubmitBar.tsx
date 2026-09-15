"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markSubmissionComplete, reopenSubmission } from "@/app/(app)/visits/[visitId]/run/actions";
import { Button } from "@/components/ui/Button";

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
        <p className="text-center text-sm text-seafoam-500">
          🎉 This visit is marked complete. You can still edit any answer.
        </p>
        <Button
          variant="secondary"
          loading={isPending}
          onClick={() =>
            startTransition(async () => {
              await reopenSubmission(submissionId, visitId);
              router.refresh();
            })
          }
        >
          Reopen
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-2">
      {incompleteRequiredCount > 0 && !confirming && (
        <p className="text-center text-sm text-coral-500">
          {incompleteRequiredCount} required item{incompleteRequiredCount === 1 ? "" : "s"} still missing.
        </p>
      )}
      <Button
        loading={isPending}
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
      >
        {confirming ? "Submit anyway" : "Mark complete"}
      </Button>
    </div>
  );
}
