"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Heart, HeartHandshake } from "lucide-react";
import { hexToRgba } from "../lib/color";
import { timeAgo } from "../lib/format";
import { EmptyState } from "./ui/EmptyState";
import { useToast } from "./ui/Toast";

export interface PublicPrayerRow {
  id: string;
  message: string;
  status: string;
  prayerCount: number;
  createdAt: Date;
  /** Already resolved by the caller to "Anonymous" / the account's display name / a neutral fallback -- this component doesn't need to know about the isAnonymous flag itself. */
  authorName: string;
}

interface PrayerWallListProps {
  requests: PublicPrayerRow[];
  onPray: (requestId: string) => Promise<void>;
  brandColor: string;
}

/**
 * "Already prayed" state is client-side-only (resets on reload) -- the real abuse
 * guard is the per-IP rate limit on the server action, this is just a lightweight UX
 * nicety so a visitor can't obviously double-tap the same card in one sitting.
 */
export function PrayerWallList({ requests, onPray, brandColor }: PrayerWallListProps) {
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  if (requests.length === 0) {
    return (
      <EmptyState
        bare={false}
        icon={<HeartHandshake size={26} strokeWidth={1.5} style={{ color: brandColor }} />}
        title="No public requests yet"
        description="Be the first to share what's on your heart with the community."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {requests.map((request) => {
        const alreadyPrayed = prayedIds.has(request.id);
        const isAnswered = request.status === "ANSWERED";
        return (
          <li
            key={request.id}
            className="shadow-panel rounded-lg border border-l-4 border-border bg-surface p-5"
            style={{ borderLeftColor: brandColor }}
          >
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{request.message}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                {isAnswered && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 font-medium text-success">
                    <CheckCircle2 size={11} /> Answered
                  </span>
                )}
                <span className="font-medium text-ink-secondary">{request.authorName}</span>
                <span>&middot;</span>
                <span>{timeAgo(request.createdAt)}</span>
              </div>
              <button
                type="button"
                disabled={isPending || alreadyPrayed}
                aria-pressed={alreadyPrayed}
                aria-label={alreadyPrayed ? "Praying for this request" : "Pray for this request"}
                onClick={() => {
                  setPrayedIds((prev) => new Set(prev).add(request.id));
                  startTransition(async () => {
                    try {
                      await onPray(request.id);
                    } catch (err) {
                      // Roll back the optimistic "Praying" state on failure (most
                      // often the per-IP rate limit) -- without this, a failed
                      // request still looked exactly like a successful one.
                      setPrayedIds((prev) => {
                        const next = new Set(prev);
                        next.delete(request.id);
                        return next;
                      });
                      showToast(err instanceof Error ? err.message : "Couldn't send that. Please try again.", "error");
                    }
                  });
                }}
                style={
                  {
                    borderColor: alreadyPrayed ? brandColor : hexToRgba(brandColor, 0.3),
                    color: brandColor,
                    backgroundColor: alreadyPrayed ? hexToRgba(brandColor, 0.14) : undefined,
                    "--tw-ring-color": brandColor,
                  } as React.CSSProperties
                }
                className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors duration-180 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
              >
                <Heart size={13} fill={alreadyPrayed ? "currentColor" : "none"} />
                {alreadyPrayed ? "Praying" : `Pray for this${request.prayerCount > 0 ? ` (${request.prayerCount})` : ""}`}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
