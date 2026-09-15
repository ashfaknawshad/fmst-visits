export function FieldShell({
  label,
  helpText,
  required,
  answered,
  children,
}: {
  label: string;
  helpText?: string | null;
  required?: boolean;
  answered?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="mb-2 flex items-start justify-between gap-2">
        <label className="font-medium">
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
        </label>
        {answered && (
          <span className="shrink-0 text-xs font-medium text-green-700 dark:text-green-400">
            ✓ Saved
          </span>
        )}
      </div>
      {helpText && <p className="mb-2 text-sm text-slate-500">{helpText}</p>}
      {children}
    </div>
  );
}
