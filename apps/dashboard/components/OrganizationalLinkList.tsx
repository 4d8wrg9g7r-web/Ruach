"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { buttonClasses } from "./ui/Button";
import { useToast } from "./ui/Toast";

export interface OrganizationalLinkRow {
  id: string;
  label: string;
  url: string;
  description: string | null;
  isActive: boolean;
}

interface OrganizationalLinkListProps {
  links: OrganizationalLinkRow[];
  onToggleActive: (linkId: string, enabled: boolean) => Promise<void>;
  onRemove: (linkId: string) => Promise<void>;
}

/** No reorder control (unlike ActionLinkList) -- these are never displayed to visitors in any order, only ever matched by the chat pipeline, so display order in this admin list is purely cosmetic. */
export function OrganizationalLinkList({ links, onToggleActive, onRemove }: OrganizationalLinkListProps) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function runAction(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "That didn't work. Please try again.", "error");
      }
    });
  }

  if (links.length === 0) {
    return <p className="p-6 text-center text-sm text-ink-muted">No organizational links yet.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {links.map((link) => (
        <li key={link.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{link.label}</p>
            <p className="truncate text-xs text-ink-muted">{link.url}</p>
            {link.description && <p className="mt-0.5 truncate text-xs text-ink-muted italic">{link.description}</p>}
          </div>
          <label className="flex shrink-0 items-center gap-1.5 text-xs text-ink-secondary">
            <input
              type="checkbox"
              checked={link.isActive}
              disabled={isPending}
              onChange={(e) => {
                const enabled = e.currentTarget.checked;
                runAction(() => onToggleActive(link.id, enabled));
              }}
            />
            Active
          </label>
          <button
            type="button"
            disabled={isPending}
            onClick={() => runAction(() => onRemove(link.id))}
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
