"use client";

import { useState } from "react";
import { FieldShell } from "./FieldShell";
import type { FieldVisitItem, GpsConfig } from "@/types/visit";

export function GpsField({
  item,
  lat,
  lng,
  accuracy,
  answered,
  onSave,
}: {
  item: FieldVisitItem;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  answered: boolean;
  onSave: (fix: { lat: number; lng: number; accuracy: number; capturedAt: string }) => void;
}) {
  const config = item.config as unknown as GpsConfig;
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accuracyThreshold = config.require_accuracy_under_m;
  const accuracyTooLow =
    accuracy != null && accuracyThreshold != null && accuracy > accuracyThreshold;

  function capture() {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not available on this device.");
      return;
    }
    setCapturing(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCapturing(false);
        onSave({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: new Date(position.timestamp).toISOString(),
        });
      },
      (err) => {
        setCapturing(false);
        setError(err.message || "Could not get location.");
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  }

  return (
    <FieldShell
      label={item.label}
      helpText={item.help_text}
      required={item.is_required}
      answered={answered}
    >
      {lat != null && lng != null && (
        <p className="mb-2 text-sm">
          {lat.toFixed(6)}, {lng.toFixed(6)}
          {accuracy != null && (
            <span
              className={`ml-2 ${accuracyTooLow ? "text-amber-600 dark:text-amber-400" : "text-slate-500"}`}
            >
              ±{accuracy.toFixed(0)}m
            </span>
          )}
        </p>
      )}
      {accuracyTooLow && (
        <p className="mb-2 text-sm text-amber-600 dark:text-amber-400">
          Accuracy is worse than {accuracyThreshold}m — try again in the open if possible.
        </p>
      )}
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={capture}
        disabled={capturing}
        className="w-full rounded-lg border border-slate-300 py-2.5 text-sm font-medium disabled:opacity-50 dark:border-slate-700"
      >
        {capturing ? "Capturing…" : lat != null ? "Recapture location" : "Capture location"}
      </button>
    </FieldShell>
  );
}
