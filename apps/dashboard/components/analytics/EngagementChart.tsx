interface EngagementPoint {
  date: string;
  conversations: number;
  messages: number;
}

/**
 * Plain CSS bars, no charting library -- the dataset here is at most ~30 points and
 * this avoids pulling in a chart dependency for what's still a small, static shape.
 */
export function EngagementChart({ data }: { data: EngagementPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.messages));
  const labelEvery = data.length > 14 ? 5 : 2;

  return (
    <div>
      <div className="flex h-32 items-end gap-1">
        {data.map((point) => (
          // h-full is load-bearing: a percentage `height` only resolves against a parent with
          // a definite height, and a flex item under `items-end` has an auto (content-based)
          // height by default -- without this the bars silently render at zero height.
          <div key={point.date} className="group relative h-full flex-1">
            <div
              className="absolute inset-x-0 bottom-0 rounded-t-sm bg-accent/70 transition-colors duration-180 group-hover:bg-accent"
              style={{ height: `${Math.max(2, (point.messages / max) * 100)}%` }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-sm bg-ink px-2 py-1 text-xs text-white group-hover:block">
              {point.messages} question{point.messages === 1 ? "" : "s"}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1 text-[10px] text-ink-muted">
        {data.map((point, i) => (
          <div key={point.date} className="flex-1 text-center">
            {i % labelEvery === 0 ? new Date(point.date).toLocaleDateString("en-US", { month: "numeric", day: "numeric" }) : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
