"use client";

import { useState } from "react";
import { PricingCard } from "./PricingCard";
import type { MarketingPlan } from "../../lib/marketing/pricing-data";

interface PricingGridProps {
  plans: MarketingPlan[];
  compact?: boolean;
}

/** Owns the monthly/yearly toggle state shared by every card in the grid -- used on both the homepage preview and the full Pricing page. */
export function PricingGrid({ plans, compact = false }: PricingGridProps) {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");

  return (
    <div>
      <div className="mb-8 flex items-center justify-center gap-3">
        <span className={`text-sm ${interval === "monthly" ? "font-medium text-ink" : "text-ink-muted"}`}>Monthly</span>
        <button
          type="button"
          role="switch"
          aria-checked={interval === "yearly"}
          aria-label="Toggle annual billing"
          onClick={() => setInterval((v) => (v === "monthly" ? "yearly" : "monthly"))}
          className="relative h-7 w-12 shrink-0 rounded-full bg-surface-warm transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-accent shadow-panel transition-transform duration-180 ${
              interval === "yearly" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm ${interval === "yearly" ? "font-medium text-ink" : "text-ink-muted"}`}>
          Annual <span className="text-accent-dark">(2 months free)</span>
        </span>
      </div>

      <div className={`grid gap-6 ${plans.length === 4 ? "lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {plans.map((plan) => (
          <PricingCard key={plan.key} plan={plan} billingInterval={interval} compact={compact} />
        ))}
      </div>
    </div>
  );
}
