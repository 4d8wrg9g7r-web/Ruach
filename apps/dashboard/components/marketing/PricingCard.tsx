import Link from "next/link";
import { Check } from "lucide-react";
import { buttonClasses } from "../ui/Button";
import type { MarketingPlan } from "../../lib/marketing/pricing-data";

interface PricingCardProps {
  plan: MarketingPlan;
  billingInterval: "monthly" | "yearly";
  /** Collapses the feature list to the first few items -- used by the homepage preview, not the full pricing page. */
  compact?: boolean;
}

export function PricingCard({ plan, billingInterval, compact = false }: PricingCardProps) {
  const price = billingInterval === "monthly" ? plan.priceMonthly : plan.priceYearly;
  const features = compact ? plan.features.slice(0, 5) : plan.features;

  return (
    <div
      id={plan.key}
      className={`relative flex scroll-mt-24 flex-col rounded-lg border bg-surface p-6 ${
        plan.mostPopular ? "border-accent shadow-panel ring-1 ring-accent/30" : "border-border"
      }`}
    >
      {plan.mostPopular && (
        <span className="absolute -top-3 left-6 rounded-full bg-[linear-gradient(135deg,var(--accent)_0%,var(--accent-light)_100%)] px-3 py-1 text-xs font-medium text-white shadow-panel">
          Most Popular
        </span>
      )}

      <h3 className="text-base font-semibold text-ink">{plan.name}</h3>
      <p className="mt-1 min-h-[2.5rem] text-sm text-ink-secondary">{plan.tagline}</p>

      <div className="mt-4 mb-1">
        {plan.isCustom ? (
          <span className="text-2xl font-semibold text-ink">Custom pricing</span>
        ) : (
          <>
            <span className="text-3xl font-semibold tracking-tight text-ink">${price}</span>
            <span className="text-sm text-ink-muted">/{billingInterval === "monthly" ? "month" : "year"}</span>
          </>
        )}
      </div>
      {!plan.isCustom && billingInterval === "yearly" && (
        <p className="mb-4 text-xs text-accent-dark">Two months free with annual billing.</p>
      )}
      {plan.isCustom && <div className="mb-4" />}

      <Link href={plan.ctaHref} className={`${buttonClasses(plan.mostPopular ? "primary" : "secondary", "md")} mb-6 w-full`}>
        {plan.cta}
      </Link>

      <ul className="flex flex-1 flex-col gap-2.5 text-sm">
        {features.map((feature) => {
          const isHeader = feature.startsWith("Everything in");
          return (
            <li key={feature} className={isHeader ? "pt-1 text-xs font-medium uppercase tracking-wide text-ink-muted" : "flex items-start gap-2 text-ink-secondary"}>
              {!isHeader && <Check size={15} className="mt-0.5 shrink-0 text-accent" />}
              <span>{feature}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
