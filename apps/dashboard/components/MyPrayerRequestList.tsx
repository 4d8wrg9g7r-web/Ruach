"use client";

import { useTransition } from "react";
import { CheckCircle2, NotebookPen } from "lucide-react";
import { buttonClasses } from "./ui/Button";
import { EmptyState } from "./ui/EmptyState";
import { timeAgo } from "../lib/format";

export interface MyPrayerRow {
  id: string;
  message: string;
  status: string;
  isPublic: boolean;
  isAnonymous: boolean;
  prayerCount: number;
  createdAt: Date;
}

interface MyPrayerRequestListProps {
  requests: MyPrayerRow[];
  onMarkAnswered: (requestId: string) => Promise<void>;
  onTogglePublic: (requestId: string, isPublic: boolean) => Promise<void>;
  onToggleAnonymous: (requestId: string, isAnonymous: boolean) => Promise<void>;
  brandColor: string;
}

export function MyPrayerRequestList({ requests, onMarkAnswered, onTogglePublic, onToggleAnonymous, brandColor }: MyPrayerRequestListProps) {
  const [isPending, startTransition] = useTransition();

  if (requests.length === 0) {
    return (
      <EmptyState
        bare={false}
        icon={<NotebookPen size={26} strokeWidth={1.5} style={{ color: brandColor }} />}
        title="No requests yet"
        description="Anything you submit will show up here so you can track it and update its status."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {requests.map((request) => {
        const isAnswered = request.status === "ANSWERED";
        return (
          <li
            key={request.id}
            className="shadow-panel rounded-lg border border-l-4 border-border bg-surface p-5"
            style={{ borderLeftColor: brandColor }}
          >
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{request.message}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                {isAnswered ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 font-medium text-success">
                    <CheckCircle2 size={11} /> Answered
                  </span>
                ) : (
                  <span>Submitted</span>
                )}
                <span>{timeAgo(request.createdAt)}</span>
                <span>{request.prayerCount} praying</span>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={request.isPublic}
                    disabled={isPending}
                    onChange={(e) => {
                      const isPublic = e.currentTarget.checked;
                      startTransition(async () => onTogglePublic(request.id, isPublic));
                    }}
                  />
                  Public on the wall
                </label>
                {request.isPublic && (
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={request.isAnonymous}
                      disabled={isPending}
                      onChange={(e) => {
                        const isAnonymous = e.currentTarget.checked;
                        startTransition(async () => onToggleAnonymous(request.id, isAnonymous));
                      }}
                    />
                    Anonymous
                  </label>
                )}
              </div>
              {!isAnswered && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startTransition(async () => onMarkAnswered(request.id))}
                  className={buttonClasses("secondary", "sm")}
                >
                  Mark as answered
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
