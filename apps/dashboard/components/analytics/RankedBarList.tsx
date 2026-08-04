interface RankedBarListItem {
  key: string;
  label: string;
  count: number;
}

export function RankedBarList({ items }: { items: RankedBarListItem[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-sm text-ink-secondary" title={item.label}>
            {item.label}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }} />
          </div>
          <span className="w-6 shrink-0 text-right text-xs font-medium text-ink-muted">{item.count}</span>
        </li>
      ))}
    </ul>
  );
}
