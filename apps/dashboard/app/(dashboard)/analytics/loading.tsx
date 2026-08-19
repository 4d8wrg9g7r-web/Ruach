import { Card } from "../../../components/ui/Card";

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-surface-muted ${className}`} />;
}

export default function AnalyticsLoading() {
  return (
    <div>
      <Block className="mb-6 h-7 w-32" />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <Block className="mb-3 h-4 w-24" />
            <Block className="h-8 w-16" />
          </Card>
        ))}
      </div>

      <Card>
        <Block className="mb-4 h-4 w-40" />
        <Block className="h-56 w-full" />
      </Card>
    </div>
  );
}
