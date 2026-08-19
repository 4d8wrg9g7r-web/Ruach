import { Card } from "../../../components/ui/Card";

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-surface-muted ${className}`} />;
}

export default function GettingStartedLoading() {
  return (
    <div>
      <Block className="mb-6 h-7 w-48" />

      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="mb-5">
          <Block className="mb-3 h-4 w-40" />
          <Block className="mb-2 h-3 w-full" />
          <Block className="h-3 w-2/3" />
        </Card>
      ))}
    </div>
  );
}
