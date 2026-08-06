import Link from "next/link";
import { Check, X } from "lucide-react";
import { Card } from "./ui/Card";
import { buttonClasses } from "./ui/Button";

export interface OnboardingStep {
  label: string;
  done: boolean;
  href: string;
  actionLabel: string;
}

interface OnboardingChecklistProps {
  steps: OnboardingStep[];
  onDismiss: () => Promise<void>;
}

/**
 * Dashboard Overview's guided-onboarding checklist -- completion is entirely derived
 * from real data (see dashboard/page.tsx), not a separate stateful "progress" record,
 * so it can never drift out of sync with what the org has actually done.
 */
export function OnboardingChecklist({ steps, onDismiss }: OnboardingChecklistProps) {
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <Card className="mb-8">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">Get started with Ruach</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            {doneCount} of {steps.length} steps complete
          </p>
        </div>
        <form action={onDismiss}>
          <button
            type="submit"
            aria-label="Dismiss checklist"
            className="rounded-sm p-1 text-ink-muted transition-colors duration-180 hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <X size={15} />
          </button>
        </form>
      </div>
      <ul className="flex flex-col divide-y divide-border">
        {steps.map((step) => (
          <li key={step.label} className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  step.done ? "bg-success-bg text-success" : "border border-border-strong text-transparent"
                }`}
              >
                <Check size={12} strokeWidth={3} />
              </span>
              <span className={`text-sm ${step.done ? "text-ink-muted line-through" : "text-ink"}`}>{step.label}</span>
            </div>
            {!step.done && (
              <Link
                href={step.href}
                className={`${buttonClasses("secondary", "sm")} shrink-0`}
              >
                {step.actionLabel}
              </Link>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-4 border-t border-border pt-3">
        <Link
          href="/getting-started"
          className="rounded-sm text-xs font-medium text-accent hover:text-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          View the full setup guide &rarr;
        </Link>
      </div>
    </Card>
  );
}
