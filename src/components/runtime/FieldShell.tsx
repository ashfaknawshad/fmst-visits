import { Card } from "@/components/ui/Card";

export function FieldShell({
  label,
  helpText,
  required,
  answered,
  icon,
  children,
}: {
  label: string;
  helpText?: string | null;
  required?: boolean;
  answered?: boolean;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="mb-2 flex items-start justify-between gap-2">
        <label className="flex items-start gap-2 font-medium">
          {icon && <span className="text-lg leading-none">{icon}</span>}
          <span>
            {label}
            {required && <span className="ml-1 text-coral-500">*</span>}
          </span>
        </label>
        {answered && (
          <span className="shrink-0 text-xs font-medium text-seafoam-500">
            ✓ Saved
          </span>
        )}
      </div>
      {helpText && <p className="mb-2 text-sm text-slate-500">{helpText}</p>}
      {children}
    </Card>
  );
}
