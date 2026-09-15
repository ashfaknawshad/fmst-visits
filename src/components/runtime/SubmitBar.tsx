"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function SubmitBar({
  status,
  incompleteRequiredCount,
  onMarkComplete,
  onReopen,
}: {
  status: string;
  incompleteRequiredCount: number;
  onMarkComplete: () => void;
  onReopen: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  if (status === "complete") {
    return (
      <div className="mt-8 space-y-2">
        <p className="text-center text-sm text-seafoam-500">
          🎉 This visit is marked complete. You can still edit any answer.
        </p>
        <Button variant="secondary" onClick={onReopen}>
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
        onClick={() => {
          if (incompleteRequiredCount > 0 && !confirming) {
            setConfirming(true);
            return;
          }
          onMarkComplete();
        }}
      >
        {confirming ? "Submit anyway" : "Mark complete"}
      </Button>
    </div>
  );
}
