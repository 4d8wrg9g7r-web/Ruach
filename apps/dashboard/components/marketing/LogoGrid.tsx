import { FileText, Globe, Headphones, Link2, Newspaper, Video } from "lucide-react";

const SOURCES = [
  { label: "YouTube", icon: Video },
  { label: "Vimeo", icon: Globe },
  { label: "Podcasts", icon: Headphones },
  { label: "Church websites", icon: Globe },
  { label: "Blog posts", icon: Newspaper },
  { label: "Ministry pages", icon: FileText },
  { label: "Sermon notes", icon: FileText },
  { label: "External links", icon: Link2 },
];

/**
 * Deliberately not real brand logos -- we don't claim native/official integrations
 * with any of these platforms, just that their content (imported by URL/feed) can be
 * brought in. Plain labeled chips avoid implying a partnership that doesn't exist.
 */
export function LogoGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {SOURCES.map(({ label, icon: Icon }) => (
        <div
          key={label}
          className="flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-3 text-sm text-ink-secondary"
        >
          <Icon size={16} className="shrink-0 text-ink-muted" />
          {label}
        </div>
      ))}
    </div>
  );
}
