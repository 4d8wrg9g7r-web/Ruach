"use client";

import { useTransition } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { buttonClasses } from "./ui/Button";

export interface ActionLinkRow {
  id: string;
  label: string;
  url: string;
  type: string;
  isActive: boolean;
}

interface ActionLinkListProps {
  links: ActionLinkRow[];
  onToggleActive: (linkId: string, enabled: boolean) => Promise<void>;
  onRemove: (linkId: string) => Promise<void>;
  onReorder: (linkId: string, direction: "up" | "down") => Promise<void>;
}

export function ActionLinkList({ links, onToggleActive, onRemove, onReorder }: ActionLinkListProps) {
  const [isPending, startTransition] = useTransition();

  if (links.length === 0) {
    return <p className="p-6 text-center text-sm text-ink-muted">No links yet.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {links.map((link, index) => (
        <li key={link.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
          <div className="flex shrink-0 flex-col gap-0.5">
            <button
              type="button"
              disabled={isPending || index === 0}
              onClick={() => startTransition(async () => onReorder(link.id, "up"))}
              className="rounded-sm p-1 text-ink-secondary hover:bg-surface-muted hover:text-ink disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              aria-label={`Move ${link.label} up`}
            >
              <ArrowUp size={20} strokeWidth={2.75} />
            </button>
            <button
              type="button"
              disabled={isPending || index === links.length - 1}
              onClick={() => startTransition(async () => onReorder(link.id, "down"))}
              className="rounded-sm p-1 text-ink-secondary hover:bg-surface-muted hover:text-ink disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              aria-label={`Move ${link.label} down`}
            >
              <ArrowDown size={20} strokeWidth={2.75} />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{link.label}</p>
            <p className="truncate text-xs text-ink-muted">{link.url}</p>
          </div>
          <label className="flex shrink-0 items-center gap-1.5 text-xs text-ink-secondary">
            <input
              type="checkbox"
              checked={link.isActive}
              disabled={isPending}
              onChange={(e) => {
                const enabled = e.currentTarget.checked;
                startTransition(async () => onToggleActive(link.id, enabled));
              }}
            />
            Active
          </label>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(async () => onRemove(link.id))}
            className={buttonClasses("ghost", "sm")}
            aria-label={`Remove ${link.label}`}
          >
            <Trash2 size={14} />
          </button>
        </li>
      ))}
    </ul>
  );
}
