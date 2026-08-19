import { Card } from "../../../components/ui/Card";

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-surface-muted ${className}`} />;
}

export default function PrayerWallLoading() {
  return (
    <div>
      <Block className="mb-6 h-7 w-32" />

      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="mb-4">
          <Block className="mb-2 h-4 w-full" />
          <Block className="h-4 w-2/3" />
        </Card>
      ))}
    </div>
  );
}
