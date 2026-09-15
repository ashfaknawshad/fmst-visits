"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { SubmissionSite } from "@/types/visit";

export function SiteManager({
  sites,
  activeSiteId,
  onSelect,
  onAdd,
  onRemove,
}: {
  sites: SubmissionSite[];
  activeSiteId: string | null;
  onSelect: (siteId: string) => void;
  onAdd: (label: string) => void;
  onRemove: (siteId: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");

  function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setLabel("");
    setAdding(false);
  }

  return (
    <div className="mb-4">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-ocean-500">
        📍 Sites
      </p>
      <div className="flex flex-wrap gap-2">
        {sites.map((site) => (
          <div key={site.id} className="flex items-center">
            <button
              type="button"
              onClick={() => onSelect(site.id)}
              className={`rounded-l-full rounded-r-full px-4 py-2 text-sm font-medium transition-colors ${
                site.id === activeSiteId
                  ? "bg-ocean-500 text-white"
                  : "border border-border-soft bg-surface"
              }`}
            >
              {site.label}
            </button>
            <button
              type="button"
              onClick={() => onRemove(site.id)}
              aria-label={`Remove ${site.label}`}
              className="-ml-2 text-slate-400"
            >
              ✕
            </button>
          </div>
        ))}

        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-full border border-dashed border-border-soft px-4 py-2 text-sm font-medium text-ocean-600 dark:text-ocean-300"
          >
            + Add site
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={submitAdd} className="mt-2 flex gap-2">
          <input
            autoFocus
            type="text"
            placeholder="e.g. Upstream"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full rounded-lg border border-border-soft bg-surface px-3 py-2 text-base focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200 dark:focus:ring-ocean-800"
          />
          <Button type="submit" fullWidth={false} className="shrink-0 px-4">
            Add
          </Button>
        </form>
      )}
    </div>
  );
}
