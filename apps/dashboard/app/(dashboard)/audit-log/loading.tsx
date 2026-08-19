import { Card } from "../../../components/ui/Card";

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-surface-muted ${className}`} />;
}

export default function AuditLogLoading() {
  return (
    <div>
      <Block className="mb-6 h-7 w-32" />

      <Card padding="none">
        <div className="flex items-center gap-5 border-b border-border px-5 py-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Block key={i} className="h-4 w-20" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-border px-5 py-3 last:border-0">
            <Block className="h-4 w-1/4" />
            <Block className="h-4 w-1/3" />
          </div>
        ))}
      </Card>
    </div>
  );
}
