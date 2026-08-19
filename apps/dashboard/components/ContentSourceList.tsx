"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { buttonClasses } from "./ui/Button";
import { useToast } from "./ui/Toast";
import { timeAgo } from "../lib/format";

export interface ContentSourceRow {
  id: string;
  provider: string;
  sourceUrl: string;
  autoSyncEnabled: boolean;
  autoApprove: boolean;
  lastSyncedAt: Date | null;
  lastSyncStatus: string | null;
}

interface ContentSourceListProps {
  sources: ContentSourceRow[];
  onToggleAutoSync: (contentSourceId: string, enabled: boolean) => Promise<void>;
  onToggleAutoApprove: (contentSourceId: string, enabled: boolean) => Promise<void>;
  onRemove: (contentSourceId: string) => Promise<void>;
}

export function ContentSourceList({ sources, onToggleAutoSync, onToggleAutoApprove, onRemove }: ContentSourceListProps) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  // A thrown error here (permission race, stale row, network hiccup) used to fail
  // completely silently -- the toggle/remove just wouldn't happen, with no
  // indication why. Centralizing the try/catch here means every action below gets
  // the same error surface for free.
  function runAction(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "That didn't work. Please try again.", "error");
      }
    });
  }

  if (sources.length === 0) {
    return <p className="p-6 text-center text-sm text-ink-muted">No tracked sources yet.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {sources.map((source) => (
        <li key={source.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{source.sourceUrl}</p>
            <p className="truncate text-xs text-ink-muted">
              {source.provider === "YOUTUBE" ? "YouTube channel" : "RSS feed"} &middot;{" "}
              {source.lastSyncedAt ? `Last synced ${timeAgo(source.lastSyncedAt)}` : "Never synced yet"}
              {source.lastSyncStatus === "FAILED" ? " (last sync failed)" : ""}
            </p>
          </div>
          <label className="flex shrink-0 items-center gap-1.5 text-xs text-ink-secondary">
            <input
              type="checkbox"
              checked={source.autoSyncEnabled}
              disabled={isPending}
              onChange={(e) => {
                const enabled = e.currentTarget.checked;
                runAction(() => onToggleAutoSync(source.id, enabled));
              }}
            />
            Auto-sync
          </label>
          <label className="flex shrink-0 items-center gap-1.5 text-xs text-ink-secondary">
            <input
              type="checkbox"
              checked={source.autoApprove}
              disabled={isPending}
              onChange={(e) => {
                const enabled = e.currentTarget.checked;
                runAction(() => onToggleAutoApprove(source.id, enabled));
              }}
            />
            Auto-approve
          </label>
          <button
            type="button"
            disabled={isPending}
            onClick={() => runAction(() => onRemove(source.id))}
            className={buttonClasses("ghost", "sm")}
            aria-label={`Stop tracking ${source.sourceUrl}`}
          >
            <Trash2 size={14} />
          </button>
        </li>
      ))}
    </ul>
  );
}
