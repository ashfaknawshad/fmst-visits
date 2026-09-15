"use client";

import { FieldShell } from "./FieldShell";
import { StreamProfileChart } from "./StreamProfileChart";
import type { CrossSectionConfig, CrossSectionPoint, FieldVisitItem } from "@/types/visit";

export function CrossSectionField({
  item,
  value,
  answered,
  onSave,
}: {
  item: FieldVisitItem;
  value: CrossSectionPoint[];
  answered: boolean;
  onSave: (value: CrossSectionPoint[]) => void;
}) {
  const config = item.config as unknown as CrossSectionConfig;
  const distanceUnit = config.distance_unit ?? "m";
  const depthUnit = config.depth_unit ?? "m";
  const minPoints = config.min_points ?? 2;
  const points = value ?? [];

  function updatePoint(index: number, patch: Partial<CrossSectionPoint>) {
    const next = points.map((p, i) => (i === index ? { ...p, ...patch } : p));
    onSave(next);
  }

  function addPoint() {
    const lastDistance = points.length ? points[points.length - 1].distance : 0;
    onSave([...points, { distance: lastDistance + 1, depth: 0 }]);
  }

  function removePoint(index: number) {
    onSave(points.filter((_, i) => i !== index));
  }

  return (
    <FieldShell
      label={item.label}
      helpText={item.help_text}
      required={item.is_required}
      answered={answered}
      icon="📉"
    >
      <p className="mb-2 text-xs text-slate-500">
        Enter at least {minPoints} points, from one bank to the other, including the deepest spot.
      </p>

      <div className="space-y-2">
        {points.map((point, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-4 shrink-0 text-xs text-slate-400">{i + 1}</span>
            <div className="flex flex-1 items-center gap-1">
              <input
                type="number"
                inputMode="decimal"
                placeholder={`Distance (${distanceUnit})`}
                value={point.distance}
                onChange={(e) => updatePoint(i, { distance: Number(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border-soft bg-surface px-2 py-2 text-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200 dark:focus:ring-ocean-800"
              />
            </div>
            <div className="flex flex-1 items-center gap-1">
              <input
                type="number"
                inputMode="decimal"
                placeholder={`Depth (${depthUnit})`}
                value={point.depth}
                onChange={(e) => updatePoint(i, { depth: Number(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border-soft bg-surface px-2 py-2 text-sm focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200 dark:focus:ring-ocean-800"
              />
            </div>
            <button
              type="button"
              onClick={() => removePoint(i)}
              aria-label="Remove point"
              className="shrink-0 rounded-lg px-2 py-2 text-coral-500"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addPoint}
          className="w-full rounded-lg border border-dashed border-border-soft py-2.5 text-sm font-medium text-ocean-600 dark:text-ocean-300"
        >
          + Add point
        </button>
      </div>

      <div className="mt-4">
        <StreamProfileChart
          points={points}
          distanceUnit={distanceUnit}
          depthUnit={depthUnit}
          className="w-full"
        />
      </div>
    </FieldShell>
  );
}
