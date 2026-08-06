"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { PRAYER_CATEGORY_OPTIONS, timeAgo } from "../lib/format";
import { Badge } from "./ui/Badge";
import { buttonClasses } from "./ui/Button";
import { Select, Textarea } from "./ui/Input";

export interface PrayerModerationRow {
  id: string;
  message: string;
  requesterName: string;
  isAnonymous: boolean;
  isPublic: boolean;
  status: "SUBMITTED" | "ANSWERED";
  category: string | null;
  internalNotes: string | null;
  createdAt: Date;
  /** Which campus's wall this was submitted through, if any -- null means the org-level default wall. */
  campusName: string | null;
}

interface PrayerModerationListProps {
  requests: PrayerModerationRow[];
  canEditCategory: boolean;
  canEditNotes: boolean;
  onTogglePublic: (requestId: string, isPublic: boolean) => Promise<void>;
  onMarkAnswered: (requestId: string) => Promise<void>;
  onDelete: (requestId: string) => Promise<void>;
  onSetCategory: (requestId: string, category: string) => Promise<void>;
  onSaveNotes: (requestId: string, notes: string) => Promise<void>;
}

/**
 * Staff-facing prayer moderation surface -- see prayer-service.ts's staff* functions.
 * Unlike the public-visitor-facing prayer wall components, every action here acts on
 * behalf of church staff (requireOrgRole), not the requester's own accountId.
 */
export function PrayerModerationList({
  requests,
  canEditCategory,
  canEditNotes,
  onTogglePublic,
  onMarkAnswered,
  onDelete,
  onSetCategory,
  onSaveNotes,
}: PrayerModerationListProps) {
  const [isPending, startTransition] = useTransition();
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  if (requests.length === 0) {
    return <p className="p-6 text-center text-sm text-ink-muted">No prayer requests yet.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {requests.map((request) => (
        <li key={request.id} className="flex flex-col gap-3 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="whitespace-pre-wrap text-sm text-ink">{request.message}</p>
              <p className="mt-1.5 text-xs text-ink-muted">
                {request.isAnonymous ? "Anonymous" : request.requesterName} &middot; {timeAgo(request.createdAt)}
                {request.campusName && <> &middot; {request.campusName}</>}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              <Badge variant={request.isPublic ? "success" : "neutral"}>{request.isPublic ? "Public" : "Private"}</Badge>
              <Badge variant={request.status === "ANSWERED" ? "info" : "neutral"}>
                {request.status === "ANSWERED" ? "Answered" : "Submitted"}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => onTogglePublic(request.id, !request.isPublic))}
              className={buttonClasses("secondary", "sm")}
            >
              {request.isPublic ? "Make private" : "Make public"}
            </button>
            {request.status !== "ANSWERED" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => onMarkAnswered(request.id))}
                className={buttonClasses("secondary", "sm")}
              >
                Mark answered
              </button>
            )}
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                if (confirm("Delete this prayer request? This can't be undone.")) {
                  startTransition(() => onDelete(request.id));
                }
              }}
              className={`${buttonClasses("secondary", "sm")} text-danger`}
            >
              <Trash2 size={13} /> Delete
            </button>

            {canEditCategory && (
              <Select
                aria-label="Category"
                defaultValue={request.category ?? ""}
                disabled={isPending}
                onChange={(e) => startTransition(() => onSetCategory(request.id, e.currentTarget.value))}
                className="w-auto py-1.5 text-xs"
              >
                <option value="">No category</option>
                {PRAYER_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          </div>

          {canEditNotes && (
            <div className="flex items-start gap-2">
              <Textarea
                aria-label="Internal notes"
                placeholder="Internal notes (staff only, never shown publicly)"
                rows={2}
                defaultValue={request.internalNotes ?? ""}
                onChange={(e) => setNotesDraft((prev) => ({ ...prev, [request.id]: e.currentTarget.value }))}
                className="flex-1 text-xs"
              />
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => onSaveNotes(request.id, notesDraft[request.id] ?? request.internalNotes ?? ""))}
                className={buttonClasses("secondary", "sm")}
              >
                Save note
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
