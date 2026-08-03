import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-ink">Analytics</h1>
      <p className="mb-8 text-sm text-ink-secondary">Search trends, content gaps, and engagement over time.</p>
      <div className="shadow-panel flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface px-6 py-20 text-center">
        <BarChart3 size={28} strokeWidth={1.5} className="text-ink-muted" />
        <p className="text-sm text-ink-secondary">
          Analytics is on the roadmap -- see <code className="text-ink-muted">docs/architecture.md</code> for what's
          deferred past milestone 1.
        </p>
      </div>
    </div>
  );
}
