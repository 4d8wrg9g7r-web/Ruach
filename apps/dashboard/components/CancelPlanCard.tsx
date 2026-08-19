"use client";

import { useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import { buttonClasses } from "./ui/Button";
import { Card } from "./ui/Card";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { useToast } from "./ui/Toast";

interface CancelPlanCardProps {
  planName: string;
  periodEndLabel: string | null;
  cancelAtPeriodEnd: boolean;
  onCancel: () => Promise<void>;
  onResume: () => Promise<void>;
}

/**
 * Cancellation is always end-of-period, never immediate (no refund logic exists) --
 * so this shows one of two clear states rather than a single ambiguous "Cancel"
 * button: either "cancel, keep access until X" or "already ending on X, undo?".
 */
export function CancelPlanCard({ planName, periodEndLabel, cancelAtPeriodEnd, onCancel, onResume }: CancelPlanCardProps) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  function runAction(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "That didn't work. Please try again.", "error");
      }
    });
  }

  if (cancelAtPeriodEnd) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md bg-warning-bg px-4 py-3">
        <div className="flex items-start gap-2 text-sm text-ink">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warning" />
          <span>
            Your {planName} plan is set to cancel{periodEndLabel ? ` on ${periodEndLabel}` : ""}. You&rsquo;ll keep full
            access until then.
          </span>
        </div>
        <button type="button" disabled={isPending} onClick={() => runAction(onResume)} className={buttonClasses("secondary", "sm")}>
          Resume subscription
        </button>
      </div>
    );
  }

  return (
    <Card padding="md" className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">Cancel plan</h2>
          <p className="text-xs text-ink-muted">
            You&rsquo;ll keep full access to {planName}{periodEndLabel ? ` until ${periodEndLabel}` : ""}, then your
            organization drops to view-only until you resubscribe.
          </p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setConfirmCancelOpen(true)}
          className={`${buttonClasses("secondary", "sm")} text-danger hover:bg-danger-bg`}
        >
          Cancel plan
        </button>
      </div>

      <ConfirmDialog
        open={confirmCancelOpen}
        title="Cancel your plan?"
        description={`You'll keep access until${periodEndLabel ? ` ${periodEndLabel}` : " the end of your current billing period"}, then it won't renew.`}
        confirmLabel="Cancel plan"
        variant="danger"
        onConfirm={() => {
          setConfirmCancelOpen(false);
          runAction(onCancel);
        }}
        onCancel={() => setConfirmCancelOpen(false)}
      />
    </Card>
  );
}
