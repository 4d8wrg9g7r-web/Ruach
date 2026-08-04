"use client";

import { useState, useTransition } from "react";
import { buttonClasses } from "./ui/Button";

export interface BulkImportSummary {
  totalFound: number;
  created: number;
  alreadyExisted: number;
  failed: number;
  autoApproved: boolean;
}

interface BulkImportFormProps {
  action: (formData: FormData) => Promise<BulkImportSummary>;
  fieldName: string;
  fieldLabel: string;
  placeholder: string;
  buttonLabel: string;
  itemNoun: string;
  pendingNote: string;
}

/**
 * Shared by every "paste a URL, import everything found there" flow (YouTube
 * channels, RSS feeds). No granular per-item progress -- there's no background queue
 * or websocket channel to stream real progress over (by design, see
 * docs/architecture.md), and a fake ticking counter would misrepresent actual
 * progress. This shows an honest "working on it" state for the duration of the real
 * request, then the real result counts once the server action resolves.
 */
export function BulkImportForm({
  action,
  fieldName,
  fieldLabel,
  placeholder,
  buttonLabel,
  itemNoun,
  pendingNote,
}: BulkImportFormProps) {
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState<BulkImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSummary(null);
    setError(null);
    startTransition(async () => {
      try {
        const result = await action(formData);
        setSummary(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import failed.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grow text-sm text-ink-secondary">
          {fieldLabel}
          <input
            name={fieldName}
            required
            disabled={isPending}
            placeholder={placeholder}
            className="mt-1 block w-full rounded border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors duration-180 focus:border-accent disabled:opacity-60"
          />
        </label>
        <button type="submit" disabled={isPending} className={buttonClasses("secondary", "md")}>
          {isPending ? "Importing..." : buttonLabel}
        </button>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-secondary">
        <input type="checkbox" name="autoApprove" disabled={isPending} />
        Approve automatically (skip individual review -- indexes every imported {itemNoun} right away)
      </label>
      <label className="flex items-center gap-2 text-sm text-ink-secondary">
        <input type="checkbox" name="trackAutoSync" disabled={isPending} />
        Keep checking for new {itemNoun}s automatically (manage tracked sources below)
      </label>

      {isPending && <p className="rounded-md bg-surface-muted p-3 text-xs text-ink-secondary">{pendingNote}</p>}

      {error && <p className="rounded-md bg-danger-bg p-3 text-xs text-danger">{error}</p>}

      {summary && (
        <p className="rounded-md bg-success-bg p-3 text-xs text-success">
          Imported {summary.created} new {itemNoun}
          {summary.created === 1 ? "" : "s"}
          {summary.alreadyExisted > 0 ? `, ${summary.alreadyExisted} already imported` : ""}
          {summary.failed > 0 ? `, ${summary.failed} failed` : ""} out of {summary.totalFound} found.
          {summary.autoApproved && summary.created > 0 ? " Approved and indexed automatically." : ""}
        </p>
      )}
    </form>
  );
}
