"use client";

import { useState } from "react";
import { Badge } from "./ui/Badge";
import { buttonClasses } from "./ui/Button";

export interface PlanPickerOption {
  key: string;
  name: string;
  /** Pre-formatted display bullets (caps + gated features) -- see lib/plan-prices.ts's formatPlanFeatures, shared with the Billing page so marketing copy can't drift from what's actually enforced. */
  features: string[];
  /** Formatted price strings ("$29", "$290"), or null when that interval's Stripe price isn't configured yet. */
  priceMonthly: string | null;
  priceYearly: string | null;
}

interface PlanPickerProps {
  orgName: string;
  plans: PlanPickerOption[];
  action: (formData: FormData) => Promise<void>;
  /**
   * The org's current plan/interval, when it already has a live subscription --
   * turns this from a first-time "Subscribe" picker into a "Change plan" picker:
   * the matching card is marked Current plan (disabled), and every other card is
   * labeled Upgrade/Downgrade based on its position in `plans` relative to the
   * current one (plans is always in tier order, low to high). Omit both for a
   * first-time subscribe flow (free tier, or a fully lapsed/canceled org).
   */
  currentPlanKey?: string | null;
  currentInterval?: "monthly" | "yearly" | null;
}

/** Monthly/yearly toggle + the paid tier cards, each a tiny form posting straight to the Server Action passed in (a Checkout-session-creating action for a first subscribe, or a subscription-update action for an existing one), plus a static Enterprise "contact us" card. */
export function PlanPicker({ orgName, plans, action, currentPlanKey, currentInterval }: PlanPickerProps) {
  const [interval, setInterval] = useState<"monthly" | "yearly">(currentInterval ?? "monthly");
  const currentIndex = currentPlanKey ? plans.findIndex((p) => p.key === currentPlanKey) : -1;

  return (
    <div>
      <div className="mx-auto mb-8 flex w-fit gap-1 rounded-full border border-border-strong bg-surface p-1">
        <button
          type="button"
          onClick={() => setInterval("monthly")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-180 ${
            interval === "monthly" ? "bg-ink text-white" : "text-ink-secondary hover:text-ink"
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setInterval("yearly")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-180 ${
            interval === "yearly" ? "bg-ink text-white" : "text-ink-secondary hover:text-ink"
          }`}
        >
          Yearly <span className="text-xs opacity-80">(2 months free)</span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan, i) => {
          const price = interval === "monthly" ? plan.priceMonthly : plan.priceYearly;
          const isCurrentPlan = plan.key === currentPlanKey;
          const isExactCurrent = isCurrentPlan && currentInterval === interval;

          let label = "Subscribe";
          let isDowngrade = false;
          if (currentIndex !== -1) {
            if (isExactCurrent) label = "Current plan";
            else if (isCurrentPlan) label = interval === "yearly" ? "Switch to yearly billing" : "Switch to monthly billing";
            else if (i > currentIndex) label = "Upgrade";
            else {
              label = "Downgrade";
              isDowngrade = true;
            }
          }

          return (
            <div
              key={plan.key}
              className={`shadow-panel flex flex-col rounded-lg border p-5 ${
                isExactCurrent ? "border-accent ring-1 ring-accent" : "border-border"
              }`}
            >
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-ink">{plan.name}</h2>
                {isExactCurrent && <Badge variant="info">Current plan</Badge>}
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                {price ?? "--"}
                <span className="text-sm font-normal text-ink-muted">/{interval === "monthly" ? "mo" : "yr"}</span>
              </p>
              <ul className="mt-3 flex flex-1 flex-col gap-1.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-xs text-ink-muted">
                    {feature}
                  </li>
                ))}
              </ul>
              <form
                action={action}
                className="mt-4 flex flex-col justify-end"
                onSubmit={(e) => {
                  if (isDowngrade && !window.confirm(`Downgrade to ${plan.name}? You'll lose access to features only available on your current plan.`)) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="planKey" value={plan.key} />
                <input type="hidden" name="interval" value={interval} />
                <input type="hidden" name="orgName" value={orgName} />
                <button
                  type="submit"
                  disabled={!price || isExactCurrent}
                  className={buttonClasses(isExactCurrent ? "secondary" : "primary", "md")}
                >
                  {label}
                </button>
              </form>
            </div>
          );
        })}

        <div className="shadow-panel flex flex-col rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-ink">Enterprise</h2>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">Custom</p>
          <p className="mt-3 flex-1 text-xs text-ink-muted">
            For church networks, denominations, universities, and organizations with custom infrastructure or
            integration needs.
          </p>
          <a
            href="mailto:isaiah.short@victorychurch.nu?subject=Ruach%20Enterprise"
            className={`mt-4 ${buttonClasses("secondary", "md")}`}
          >
            Contact us
          </a>
        </div>
      </div>
    </div>
  );
}
