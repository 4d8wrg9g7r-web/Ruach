import { Check, Minus } from "lucide-react";

export interface ComparisonRow {
  label: string;
  values: [string | boolean, string | boolean, string | boolean, string | boolean];
}

const PLAN_NAMES = ["Essential", "Growth", "Multi-Site", "Enterprise"];

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check size={16} className="mx-auto text-accent" aria-label="Included" />;
  if (value === false) return <Minus size={14} className="mx-auto text-ink-muted" aria-label="Not included" />;
  return <span className="text-sm text-ink-secondary">{value}</span>;
}

/**
 * Desktop: full table. Mobile: stacked per-plan cards (a wide table with 5 columns
 * doesn't fit a phone screen and forces horizontal scrolling on a row-by-row basis,
 * which is hard to read; per-plan stacking keeps every row's label next to its value).
 */
export function ComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted">
              <th className="px-4 py-3 text-left font-medium text-ink-secondary">Feature</th>
              {PLAN_NAMES.map((name) => (
                <th key={name} className="px-4 py-3 text-center font-medium text-ink-secondary">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-0 even:bg-surface-muted/50">
                <td className="px-4 py-3 text-ink">{row.label}</td>
                {(row.values as (string | boolean)[]).map((value, i) => (
                  <td key={i} className="px-4 py-3 text-center">
                    <Cell value={value} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 md:hidden">
        {PLAN_NAMES.map((name, planIndex) => (
          <div key={name} className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-3 text-sm font-semibold text-ink">{name}</h3>
            <dl className="flex flex-col divide-y divide-border">
              {rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-sm text-ink-secondary">{row.label}</dt>
                  <dd>
                    <Cell value={(row.values as (string | boolean)[])[planIndex]!} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}
