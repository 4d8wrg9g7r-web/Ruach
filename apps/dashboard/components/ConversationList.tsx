"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "./ui/Input";
import { timeAgo } from "../lib/format";

export interface ConversationRow {
  id: string;
  widgetName: string;
  messageCount: number;
  lastMessagePreview: string | null;
  updatedAt: Date;
}

/** Search is client-side over the current page's rows only (matches AuditLogList's convention) -- full-text search across all conversations would need a dedicated query, not worth it until someone actually asks for it. */
export function ConversationList({ conversations }: { conversations: ConversationRow[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q
    ? conversations.filter(
        (c) => c.widgetName.toLowerCase().includes(q) || (c.lastMessagePreview ?? "").toLowerCase().includes(q),
      )
    : conversations;

  return (
    <div>
      <div className="relative mb-3 max-w-sm">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Search by widget or message..."
          className="pl-9"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-muted">
          {conversations.length === 0 ? "No conversations yet." : "No conversations match your search."}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {filtered.map((c) => (
            <li key={c.id}>
              <Link
                href={`/conversations/${c.id}`}
                className="flex items-center justify-between gap-4 rounded-sm py-3 text-sm hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{c.widgetName}</span>
                    <span className="text-xs text-ink-muted">
                      {c.messageCount} {c.messageCount === 1 ? "message" : "messages"}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink-secondary">
                    {c.lastMessagePreview ?? "No messages yet"}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-ink-muted">{timeAgo(c.updatedAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
