import { Card } from "../../../components/ui/Card";

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-surface-muted ${className}`} />;
}

export default function WebsitesLoading() {
  return (
    <div>
      <Block className="mb-6 h-7 w-32" />

      <Card padding="none">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-border px-5 py-4 last:border-0">
            <Block className="h-9 w-9 rounded-md" />
            <div className="flex-1">
              <Block className="mb-1.5 h-4 w-1/3" />
              <Block className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
