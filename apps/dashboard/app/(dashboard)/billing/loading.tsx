import { Card } from "../../../components/ui/Card";

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-surface-muted ${className}`} />;
}

export default function BillingLoading() {
  return (
    <div>
      <Block className="mb-1 h-7 w-24" />
      <Block className="mb-8 h-4 w-56" />

      <Card padding="md" className="mb-6">
        <Block className="mb-4 h-4 w-32" />
        <Block className="mb-2 h-6 w-40" />
        <Block className="h-2 w-full" />
      </Card>

      <Card padding="md">
        <Block className="mb-4 h-4 w-28" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Block key={i} className="mb-2 h-4 w-2/3" />
        ))}
      </Card>
    </div>
  );
}
