"use client";

import { useState } from "react";
import { FieldShell } from "./FieldShell";
import { useDebouncedCallback } from "@/lib/useDebouncedCallback";
import { measurementOutOfRange } from "@/lib/progress";
import type {
  FieldVisitItem,
  MeasurementConfig,
  ObservationConfig,
  SpeciesListConfig,
  SpeciesListRow,
} from "@/types/visit";

type Value = Record<string, unknown>;

const inputClass =
  "w-full rounded-lg border border-border-soft bg-surface px-3 py-2.5 text-base focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-200 dark:focus:ring-ocean-800";

export function MeasurementField({
  item,
  value,
  answered,
  onSave,
}: {
  item: FieldVisitItem;
  value: Value;
  answered: boolean;
  onSave: (value: Value) => void;
}) {
  const config = item.config as unknown as MeasurementConfig;
  const [text, setText] = useState(
    typeof value.number === "number" ? String(value.number) : "",
  );
  const save = useDebouncedCallback((raw: string) => {
    const num = raw === "" ? null : Number(raw);
    onSave(num == null || Number.isNaN(num) ? {} : { number: num });
  }, 500);

  const num = Number(text);
  const outOfRange = text !== "" && !Number.isNaN(num) && measurementOutOfRange(item, num);

  return (
    <FieldShell
      label={item.label}
      helpText={item.help_text}
      required={item.is_required}
      answered={answered}
      icon="📏"
    >
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          step={config.decimals ? 1 / 10 ** config.decimals : "any"}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            save(e.target.value);
          }}
          className={inputClass}
        />
        <span className="shrink-0 text-sm text-slate-500">{config.unit}</span>
      </div>
      {outOfRange && (
        <p className="mt-1 text-sm text-coral-500">
          Outside expected range ({config.min} – {config.max} {config.unit}) — double-check the reading.
        </p>
      )}
    </FieldShell>
  );
}

export function ObservationField({
  item,
  value,
  answered,
  onSave,
}: {
  item: FieldVisitItem;
  value: Value;
  answered: boolean;
  onSave: (value: Value) => void;
}) {
  const config = item.config as unknown as ObservationConfig;
  const [text, setText] = useState(typeof value.text === "string" ? value.text : "");
  const saveText = useDebouncedCallback((raw: string) => {
    onSave(raw.trim() ? { text: raw } : {});
  }, 500);

  const selected = typeof value.selected === "string" ? value.selected : "";
  const isOther = selected === "other";
  const [otherText, setOtherText] = useState(
    typeof value.other_text === "string" ? value.other_text : "",
  );
  const saveOther = useDebouncedCallback((raw: string) => {
    onSave({ selected: "other", other_text: raw });
  }, 500);

  if (config.input === "select") {
    return (
      <FieldShell
        label={item.label}
        helpText={item.help_text}
        required={item.is_required}
        answered={answered}
        icon="📝"
      >
        <select
          value={selected}
          onChange={(e) => {
            const next = e.target.value;
            if (next === "other") {
              onSave({ selected: "other", other_text: otherText });
            } else {
              onSave(next ? { selected: next } : {});
            }
          }}
          className={inputClass}
        >
          <option value="">Select…</option>
          {config.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {isOther && config.allow_other_text && (
          <input
            type="text"
            placeholder="Describe…"
            value={otherText}
            onChange={(e) => {
              setOtherText(e.target.value);
              saveOther(e.target.value);
            }}
            className={`mt-2 ${inputClass}`}
          />
        )}
      </FieldShell>
    );
  }

  const Tag = config.input === "textarea" ? "textarea" : "input";

  return (
    <FieldShell
      label={item.label}
      helpText={item.help_text}
      required={item.is_required}
      answered={answered}
      icon="📝"
    >
      <Tag
        {...(config.input === "textarea" ? { rows: 4 } : { type: "text" })}
        value={text}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          setText(e.target.value);
          saveText(e.target.value);
        }}
        className={inputClass}
      />
    </FieldShell>
  );
}

export function ChecklistField({
  item,
  value,
  answered,
  onSave,
}: {
  item: FieldVisitItem;
  value: Value;
  answered: boolean;
  onSave: (value: Value) => void;
}) {
  const checked = value.checked === true;

  return (
    <FieldShell
      label={item.label}
      helpText={item.help_text}
      required={item.is_required}
      answered={answered}
      icon="✅"
    >
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onSave({ checked: e.target.checked })}
          className="h-6 w-6 rounded border-border-soft accent-ocean-500"
        />
        <span>{checked ? "Done" : "Mark as done"}</span>
      </label>
    </FieldShell>
  );
}

export function SpeciesListField({
  item,
  value,
  answered,
  onSave,
}: {
  item: FieldVisitItem;
  value: SpeciesListRow[];
  answered: boolean;
  onSave: (value: SpeciesListRow[]) => void;
}) {
  const config = item.config as unknown as SpeciesListConfig;
  const rows = value.length ? value : [];

  function updateRow(index: number, patch: Partial<SpeciesListRow>) {
    const next = rows.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onSave(next);
  }

  function addRow() {
    onSave([...rows, { taxon_name: "" }]);
  }

  function removeRow(index: number) {
    onSave(rows.filter((_, i) => i !== index));
  }

  return (
    <FieldShell
      label={item.label}
      helpText={item.help_text}
      required={item.is_required}
      answered={answered}
      icon="🐟"
    >
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="rounded-lg border border-border-soft bg-surface-muted/60 p-3"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Species / taxon"
                value={row.taxon_name}
                onChange={(e) => updateRow(i, { taxon_name: e.target.value })}
                className={`${inputClass} py-2`}
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                aria-label="Remove row"
                className="shrink-0 rounded-lg px-3 py-2 text-coral-500"
              >
                ✕
              </button>
            </div>
            {config.fields.includes("density") && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="Density"
                  value={row.density ?? ""}
                  onChange={(e) =>
                    updateRow(i, {
                      density: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                  className={`${inputClass} py-2`}
                />
                <span className="shrink-0 text-sm text-slate-500">{config.density_unit}</span>
              </div>
            )}
            {config.fields.includes("notes") && (
              <input
                type="text"
                placeholder="Notes"
                value={row.notes ?? ""}
                onChange={(e) => updateRow(i, { notes: e.target.value })}
                className={`mt-2 ${inputClass} py-2`}
              />
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="w-full rounded-lg border border-dashed border-border-soft py-2.5 text-sm font-medium text-ocean-600 dark:text-ocean-300"
        >
          + Add species
        </button>
      </div>
    </FieldShell>
  );
}
