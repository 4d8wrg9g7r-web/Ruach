import { Card } from "../../../components/ui/Card";

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-surface-muted ${className}`} />;
}

export default function ResourcesLoading() {
  return (
    <div>
      <Block className="mb-6 h-7 w-40" />

      <Card className="mb-8">
        <Block className="mb-4 h-4 w-48" />
        <Block className="h-24 w-full" />
      </Card>

      <Card padding="none">
        <div className="flex items-center gap-5 border-b border-border px-5 py-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Block key={i} className="h-4 w-16" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-border px-5 py-3 last:border-0">
            <Block className="h-9 w-12" />
            <Block className="h-4 w-1/3" />
          </div>
        ))}
      </Card>
    </div>
  );
}
