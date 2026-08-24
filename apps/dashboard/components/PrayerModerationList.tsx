"use client";

import { useState, useTransition } from "react";
import { Mail, Trash2 } from "lucide-react";
import { PRAYER_CATEGORY_OPTIONS, timeAgo } from "../lib/format";
import { Badge } from "./ui/Badge";
import { buttonClasses } from "./ui/Button";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { Select, Textarea } from "./ui/Input";
import { useToast } from "./ui/Toast";

export interface PrayerReplyRow {
  id: string;
  message: string;
  createdAt: Date;
  /** Display name, falling back to email -- null only if the sending staff account has since been removed. */
  staffName: string | null;
}

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
  /** Newest first. Every entry was actually emailed to the requester -- see onSendReply. */
  replies: PrayerReplyRow[];
}

interface PrayerModerationListProps {
  requests: PrayerModerationRow[];
  canEditCategory: boolean;
  canEditNotes: boolean;
  canReply: boolean;
  onTogglePublic: (requestId: string, isPublic: boolean) => Promise<void>;
  onMarkAnswered: (requestId: string) => Promise<void>;
  onDelete: (requestId: string) => Promise<void>;
  onSetCategory: (requestId: string, category: string) => Promise<void>;
  onSaveNotes: (requestId: string, notes: string) => Promise<void>;
  onSendReply: (requestId: string, message: string) => Promise<void>;
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
  canReply,
  onTogglePublic,
  onMarkAnswered,
  onDelete,
  onSetCategory,
  onSaveNotes,
  onSendReply,
}: PrayerModerationListProps) {
  const [isPending, startTransition] = useTransition();
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [requestToDelete, setRequestToDelete] =
    useState<PrayerModerationRow | null>(null);
  const { showToast } = useToast();

  function sendReply(requestId: string) {
    const message = (replyDraft[requestId] ?? "").trim();
    if (!message) return;
    startTransition(async () => {
      try {
        await onSendReply(requestId, message);
        setReplyDraft((prev) => ({ ...prev, [requestId]: "" }));
        showToast("Reply sent");
      } catch (err) {
        showToast(
          err instanceof Error
            ? err.message
            : "Couldn't send that reply. Please try again.",
          "error",
        );
      }
    });
  }

  if (requests.length === 0) {
    return (
      <p className="p-6 text-center text-sm text-ink-muted">
        No prayer requests yet.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col divide-y divide-border">
        {requests.map((request) => (
          <li key={request.id} className="flex flex-col gap-3 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap text-sm text-ink">
                  {request.message}
                </p>
                <p className="mt-1.5 text-xs text-ink-muted">
                  {request.isAnonymous ? "Anonymous" : request.requesterName}{" "}
                  &middot; {timeAgo(request.createdAt)}
                  {request.campusName && <> &middot; {request.campusName}</>}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                <Badge variant={request.isPublic ? "success" : "neutral"}>
                  {request.isPublic ? "Public" : "Private"}
                </Badge>
                <Badge
                  variant={request.status === "ANSWERED" ? "info" : "neutral"}
                >
                  {request.status === "ANSWERED" ? "Answered" : "Submitted"}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(() =>
                    onTogglePublic(request.id, !request.isPublic),
                  )
                }
                className={buttonClasses("secondary", "sm")}
              >
                {request.isPublic ? "Make private" : "Make public"}
              </button>
              {request.status !== "ANSWERED" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(() => onMarkAnswered(request.id))
                  }
                  className={buttonClasses("secondary", "sm")}
                >
                  Mark answered
                </button>
              )}
              <button
                type="button"
                disabled={isPending}
                onClick={() => setRequestToDelete(request)}
                className={`${buttonClasses("secondary", "sm")} text-danger`}
              >
                <Trash2 size={13} /> Delete
              </button>

              {canEditCategory && (
                <Select
                  aria-label="Category"
                  defaultValue={request.category ?? ""}
                  disabled={isPending}
                  onChange={(e) => {
                    // Capture the value synchronously -- currentTarget is only valid for
                    // the duration of the native event dispatch (standard DOM behavior),
                    // and startTransition's callback runs deferred, after React has
                    // already released it.
                    const value = e.currentTarget.value;
                    startTransition(() => onSetCategory(request.id, value));
                  }}
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
                  onChange={(e) => {
                    // Same currentTarget-lifetime reasoning as the category Select above --
                    // capture the value before it's read inside the setState updater,
                    // which React can invoke on a later tick (e.g. Strict Mode's dev-only
                    // double-invoke), by which point currentTarget is already null.
                    const value = e.currentTarget.value;
                    setNotesDraft((prev) => ({ ...prev, [request.id]: value }));
                  }}
                  className="flex-1 text-xs"
                />
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(() =>
                      onSaveNotes(
                        request.id,
                        notesDraft[request.id] ?? request.internalNotes ?? "",
                      ),
                    )
                  }
                  className={buttonClasses("secondary", "sm")}
                >
                  Save note
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2 border-t border-border pt-3">
              {request.replies.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {request.replies.map((reply) => (
                    <li
                      key={reply.id}
                      className="rounded-md bg-surface-warm px-2.5 py-1.5 text-xs text-ink-secondary"
                    >
                      <span className="font-medium text-ink">
                        {reply.staffName ?? "Staff"}
                      </span>{" "}
                      replied {timeAgo(reply.createdAt)}: {reply.message}
                    </li>
                  ))}
                </ul>
              )}
              {canReply ? (
                <div className="flex items-start gap-2">
                  <Textarea
                    aria-label={`Reply to ${request.isAnonymous ? "this requester" : request.requesterName}`}
                    placeholder={`Reply to ${request.isAnonymous ? "this requester" : request.requesterName} by email...`}
                    rows={2}
                    value={replyDraft[request.id] ?? ""}
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      setReplyDraft((prev) => ({
                        ...prev,
                        [request.id]: value,
                      }));
                    }}
                    className="flex-1 text-xs"
                  />
                  <button
                    type="button"
                    disabled={
                      isPending || !(replyDraft[request.id] ?? "").trim()
                    }
                    onClick={() => sendReply(request.id)}
                    className={buttonClasses("secondary", "sm")}
                  >
                    <Mail size={13} /> Send reply
                  </button>
                </div>
              ) : (
                <p className="text-xs text-ink-muted">
                  Upgrade your plan to reply to requests by email.
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={requestToDelete !== null}
        title="Delete this prayer request?"
        description="This can't be undone -- the request and any staff replies to it will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => {
          if (requestToDelete)
            startTransition(() => onDelete(requestToDelete.id));
          setRequestToDelete(null);
        }}
        onCancel={() => setRequestToDelete(null)}
      />
    </>
  );
}
