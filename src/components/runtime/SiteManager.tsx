"use client";

import { useState } from "react";
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
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Sites
      </p>
      <div className="flex flex-wrap gap-2">
        {sites.map((site) => (
          <div key={site.id} className="flex items-center">
            <button
              type="button"
              onClick={() => onSelect(site.id)}
              className={`rounded-l-full rounded-r-full px-4 py-2 text-sm font-medium ${
                site.id === activeSiteId
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "border border-slate-300 dark:border-slate-700"
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
            className="rounded-full border border-dashed border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 dark:border-slate-700 dark:text-slate-400"
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Add
          </button>
        </form>
      )}
    </div>
  );
}
