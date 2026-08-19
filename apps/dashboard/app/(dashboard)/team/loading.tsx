import { Card } from "../../../components/ui/Card";

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-surface-muted ${className}`} />;
}

export default function TeamLoading() {
  return (
    <div>
      <Block className="mb-6 h-7 w-24" />

      <Card padding="none">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 border-b border-border px-5 py-3.5 last:border-0">
            <div className="flex-1">
              <Block className="mb-1.5 h-4 w-1/3" />
              <Block className="h-3 w-1/2" />
            </div>
            <Block className="h-8 w-24" />
          </div>
        ))}
      </Card>
    </div>
  );
}
