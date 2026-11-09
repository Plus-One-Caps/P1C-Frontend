import { cn } from "@/lib/utils";

export const fieldClass =
  "w-full rounded-[var(--radius-md)] border border-border bg-white px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-border-strong focus:ring-2 focus:ring-steel/25";

export function Field({
  label,
  htmlFor,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-ink"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-grey-olive">{hint}</p>}
    </div>
  );
}

export function cx(...args: Parameters<typeof cn>) {
  return cn(...args);
}
