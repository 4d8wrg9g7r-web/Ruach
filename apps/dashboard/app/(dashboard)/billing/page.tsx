import { CheckCircle2, CreditCard } from "lucide-react";
import { billingService } from "@ruach/database";
import { Card } from "../../../components/ui/Card";
import { getCurrentOrganization } from "../../../lib/session";

const PLAN_FEATURES = [
  "Unlimited resources and widgets",
  "AI-assisted categorization",
  "Public prayer wall",
  "Email support",
];

export default async function BillingPage() {
  const organization = await getCurrentOrganization();
  if (!organization) return null;

  const usage = await billingService.getCurrentUsage(organization.id);
  const usagePercent = Math.min(100, Math.round((usage.queriesUsed / usage.plan.monthlyQueryLimit) * 100));
  const remaining = Math.max(0, usage.plan.monthlyQueryLimit - usage.queriesUsed);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-ink">Billing</h1>
      <p className="mb-8 text-sm text-ink-secondary">Your plan and usage for {organization.name}.</p>

      <Card padding="md" className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink">{usage.plan.name}</h2>
            <p className="text-xs text-ink-muted">
              Current period: {usage.periodStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} &ndash;{" "}
              {usage.periodEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </div>
          <span
            className="cursor-default rounded-sm px-3 py-2 text-xs font-medium text-ink-muted"
            title="Self-serve plan changes aren't available yet -- reach out and we'll help."
          >
            Change plan
          </span>
        </div>

        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-ink-secondary">Widget questions this period</span>
          <span className="font-medium text-ink">
            {usage.queriesUsed.toLocaleString()} / {usage.plan.monthlyQueryLimit.toLocaleString()}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className={`h-full rounded-full ${usagePercent >= 90 ? "bg-danger" : "bg-accent"}`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-ink-muted">{remaining.toLocaleString()} questions remaining this period</p>
      </Card>

      <Card padding="md">
        <h2 className="mb-4 text-sm font-semibold text-ink">What&rsquo;s included</h2>
        <ul className="flex flex-col gap-2.5">
          {PLAN_FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-ink-secondary">
              <CheckCircle2 size={15} className="shrink-0 text-success" /> {feature}
            </li>
          ))}
        </ul>
      </Card>

      <p className="mt-6 flex items-center gap-1.5 text-xs text-ink-muted">
        <CreditCard size={13} /> Payment processing isn&rsquo;t connected yet -- usage above reflects real activity, plan
        changes are handled manually for now.
      </p>
    </div>
  );
}
