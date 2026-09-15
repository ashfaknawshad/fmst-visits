"use client";

import { useRef, useState } from "react";
import { FieldShell } from "./FieldShell";
import { Button } from "@/components/ui/Button";
import type { FieldVisitItem, PhotoConfig, SubmissionPhoto } from "@/types/visit";

export function PhotoField({
  item,
  photos,
  photoUrls,
  uploading,
  onAdd,
  onRemove,
}: {
  item: FieldVisitItem;
  photos: SubmissionPhoto[];
  photoUrls: Record<string, string>;
  uploading: boolean;
  onAdd: (file: File) => void;
  onRemove: (photoId: string) => void;
}) {
  const config = item.config as unknown as PhotoConfig;
  const minCount = config.min_count ?? (item.is_required ? 1 : 0);
  const maxCount = config.max_count;
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const answered = photos.length >= minCount;
  const atMax = maxCount != null && photos.length >= maxCount;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("Image is larger than 15MB.");
      return;
    }
    setError(null);
    onAdd(file);
  }

  return (
    <FieldShell
      label={item.label}
      helpText={item.help_text}
      required={item.is_required}
      answered={answered}
      icon="📸"
    >
      {photos.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <div
              key={p.id}
              className="relative aspect-square overflow-hidden rounded-lg bg-surface-muted"
            >
              {photoUrls[p.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrls[p.id]} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  Uploading…
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                aria-label="Remove photo"
                className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mb-2 text-sm text-coral-500">{error}</p>}

      {!atMax && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            loading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Add photo"}
          </Button>
        </>
      )}
    </FieldShell>
  );
}
