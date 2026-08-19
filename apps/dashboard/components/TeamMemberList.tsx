"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { Select } from "./ui/Input";
import { useToast } from "./ui/Toast";
import { timeAgo } from "../lib/format";

export interface TeamMemberRow {
  userId: string;
  name: string | null;
  email: string;
  role: "OWNER" | "ADMIN" | "CONTENT_MANAGER" | "ANALYTICS_VIEWER" | "PRAYER_MODERATOR";
  joinedAt: Date;
}

const ROLE_LABELS: Record<TeamMemberRow["role"], string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  CONTENT_MANAGER: "Content Manager",
  ANALYTICS_VIEWER: "Analytics Viewer",
  // Assignability from either role picker (invite form or this row's Select) is
  // gated by the org's plan (advancedRolesPermissions, Multi-Site+ only) -- see
  // team/page.tsx's assignableRoles. This label is still needed unconditionally so
  // an org that's since downgraded can still render an existing PRAYER_MODERATOR
  // member's current role correctly, even though they can no longer assign it.
  PRAYER_MODERATOR: "Prayer Moderator",
};

interface TeamMemberListProps {
  members: TeamMemberRow[];
  currentUserId: string;
  /** Whether the signed-in user can change roles / remove members (OWNER or ADMIN). */
  canManage: boolean;
  /** Whether PRAYER_MODERATOR is offered as an option in this row's role Select -- see team/page.tsx's assignableRoles. */
  canAssignModerator: boolean;
  onUpdateRole: (userId: string, role: TeamMemberRow["role"]) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
}

export function TeamMemberList({ members, currentUserId, canManage, canAssignModerator, onUpdateRole, onRemove }: TeamMemberListProps) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const [memberToRemove, setMemberToRemove] = useState<TeamMemberRow | null>(null);

  function runAction(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "That didn't work. Please try again.", "error");
      }
    });
  }

  return (
    <>
      <ul className="flex flex-col divide-y divide-border">
      {members.map((member) => {
        const isSelf = member.userId === currentUserId;
        return (
          <li key={member.userId} className="flex items-center justify-between gap-4 py-3.5">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-ink">
                {member.name || member.email}
                {isSelf && <span className="ml-1.5 text-xs font-normal text-ink-muted">(you)</span>}
              </div>
              <div className="truncate text-xs text-ink-muted">
                {member.email} &middot; Joined {timeAgo(member.joinedAt)}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {canManage && !isSelf ? (
                <Select
                  aria-label={`Role for ${member.email}`}
                  defaultValue={member.role}
                  disabled={isPending}
                  onChange={(e) => {
                    const role = e.currentTarget.value as TeamMemberRow["role"];
                    runAction(() => onUpdateRole(member.userId, role));
                  }}
                  className="w-auto py-1.5 text-xs"
                >
                  {Object.entries(ROLE_LABELS)
                    .filter(([value]) => canAssignModerator || value !== "PRAYER_MODERATOR" || member.role === "PRAYER_MODERATOR")
                    .map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                </Select>
              ) : (
                <span className="text-xs font-medium text-ink-secondary">{ROLE_LABELS[member.role]}</span>
              )}
              {canManage && !isSelf && (
                <button
                  type="button"
                  disabled={isPending}
                  aria-label={`Remove ${member.email}`}
                  onClick={() => setMemberToRemove(member)}
                  className="rounded-sm p-1.5 text-ink-muted transition-colors duration-180 hover:bg-danger-bg hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </li>
        );
      })}
      </ul>

      <ConfirmDialog
        open={memberToRemove !== null}
        title="Remove team member?"
        description={memberToRemove ? `Remove ${memberToRemove.email} from this organization?` : ""}
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => {
          if (memberToRemove) runAction(() => onRemove(memberToRemove.userId));
          setMemberToRemove(null);
        }}
        onCancel={() => setMemberToRemove(null)}
      />
    </>
  );
}
