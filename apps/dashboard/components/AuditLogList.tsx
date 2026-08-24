"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/Input";
import { auditActionLabel, timeAgo } from "../lib/format";

export interface AuditLogRow {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: unknown;
  createdAt: Date;
  actorName: string;
}

/** "resourceIds" -> "resources", "campusName" -> "campus name" -- readable for the
 * non-technical church staff this page is actually written for, not a raw dump of
 * the underlying event's field names. */
function humanizeKey(key: string): string {
  return key
    .replace(/Ids?$/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .trim();
}

/** Naive but fine for this vocabulary (resource, campus, forwarding email, ...) --
 * only used to get an array's count label ("1 resource" vs "3 resources") right. */
function singularize(label: string): string {
  return label.endsWith("s") ? label.slice(0, -1) : label;
}

/**
 * Compact "key: value, key: value" rendering -- these are small structured payloads
 * (role changed, email invited, sync counts), not documents worth a full JSON
 * viewer. Arrays in particular (e.g. a bulk-approve's resourceIds) get reduced to a
 * count -- a wall of raw database ids means nothing to the church staff reading
 * this page and buries the one thing they'd actually want to know, how many.
 */
function formatMetadata(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const entries = Object.entries(metadata as Record<string, unknown>);
  if (entries.length === 0) return null;
  return entries
    .map(([key, value]) => {
      const label = humanizeKey(key);
      if (Array.isArray(value)) {
        const singular = singularize(label);
        return `${value.length} ${singular}${value.length === 1 ? "" : "s"}`;
      }
      return `${label}: ${typeof value === "string" ? value : JSON.stringify(value)}`;
    })
    .join(", ");
}

export function AuditLogList({ events }: { events: AuditLogRow[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q
    ? events.filter((e) => {
        const label = auditActionLabel(e.action).toLowerCase();
        return (
          label.includes(q) ||
          e.actorName.toLowerCase().includes(q) ||
          e.targetType.toLowerCase().includes(q)
        );
      })
    : events;

  return (
    <div>
      <div className="relative mb-3 max-w-sm">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Search by action, person, or type..."
          className="pl-9"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-muted">
          {events.length === 0
            ? "No activity yet."
            : "No events match your search."}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {filtered.map((event) => {
            const metadataLabel = formatMetadata(event.metadata);
            return (
              <li key={event.id} className="py-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-ink">
                    <span className="font-medium">{event.actorName}</span>{" "}
                    &middot; {auditActionLabel(event.action)}
                  </span>
                  <span className="shrink-0 text-xs text-ink-muted">
                    {timeAgo(event.createdAt)}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-ink-muted">
                  {event.targetType}
                  {metadataLabel && <span> &mdash; {metadataLabel}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
