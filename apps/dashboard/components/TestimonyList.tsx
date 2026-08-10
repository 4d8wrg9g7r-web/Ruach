import { Sparkles } from "lucide-react";
import { timeAgo } from "../lib/format";
import { EmptyState } from "./ui/EmptyState";

export interface PublicTestimonyRow {
  id: string;
  message: string;
  authorDisplayName: string;
  isFeatured: boolean;
  youtubeEmbedUrl: string | null;
  createdAt: Date;
}

/**
 * Featured (staff-curated) rows first in their own display order, then visitor
 * submissions newest first -- the two arrays are already split and ordered by
 * testimonyService.listPublicTestimonies, this just renders them back to back.
 * No "pray"-style interaction here (unlike PrayerWallList) -- testimonies are
 * read-only once posted.
 */
export function TestimonyList({
  featured,
  submitted,
  brandColor,
}: {
  featured: PublicTestimonyRow[];
  submitted: PublicTestimonyRow[];
  brandColor: string;
}) {
  if (featured.length === 0 && submitted.length === 0) {
    return (
      <EmptyState
        bare={false}
        icon={<Sparkles size={26} strokeWidth={1.5} style={{ color: brandColor }} />}
        title="No testimonies yet"
        description="Be the first to share what God has done."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {[...featured, ...submitted].map((testimony) => (
        <li
          key={testimony.id}
          className="shadow-panel rounded-lg border border-l-4 border-border bg-surface p-5"
          style={{ borderLeftColor: brandColor }}
        >
          {testimony.youtubeEmbedUrl && (
            <div className="mb-4 aspect-video overflow-hidden rounded-md">
              <iframe
                src={testimony.youtubeEmbedUrl}
                title={testimony.authorDisplayName}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{testimony.message}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            {testimony.isFeatured && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium"
                style={{ backgroundColor: `${brandColor}1f`, color: brandColor }}
              >
                <Sparkles size={11} /> Featured
              </span>
            )}
            <span className="font-medium text-ink-secondary">{testimony.authorDisplayName}</span>
            <span>&middot;</span>
            <span>{timeAgo(testimony.createdAt)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
