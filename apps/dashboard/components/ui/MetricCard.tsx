export function MetricCard({
  label,
  value,
  helperText,
  icon,
}: {
  label: string;
  value: string | number;
  helperText?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="shadow-panel flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 transition-shadow duration-180 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</span>
        {icon && <span className="text-ink-muted">{icon}</span>}
      </div>
      <div className="text-3xl font-semibold tracking-tight text-ink">{value}</div>
      {helperText && <div className="text-sm text-ink-secondary">{helperText}</div>}
    </div>
  );
}
