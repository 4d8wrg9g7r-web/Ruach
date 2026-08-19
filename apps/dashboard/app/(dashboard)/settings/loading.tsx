import { Card } from "../../../components/ui/Card";

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-surface-muted ${className}`} />;
}

export default function SettingsLoading() {
  return (
    <div>
      <Block className="mb-6 h-7 w-28" />

      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} padding="md" className="mb-6">
          <Block className="mb-4 h-4 w-32" />
          <Block className="mb-3 h-10 w-full" />
          <Block className="h-10 w-2/3" />
        </Card>
      ))}
    </div>
  );
}
