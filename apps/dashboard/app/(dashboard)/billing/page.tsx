import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AlertTriangle, CheckCircle2, CreditCard } from "lucide-react";
import { auditService, billingService, organizationService } from "@ruach/database";
import { CancelPlanCard } from "../../../components/CancelPlanCard";
import { PlanPicker } from "../../../components/PlanPicker";
import { Badge } from "../../../components/ui/Badge";
import { buttonClasses } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { formatPlanFeatures, getFormattedPlans } from "../../../lib/plan-prices";
import { getCurrentOrganization, getCurrentUser, requireOrgRole } from "../../../lib/session";
import { stripe } from "../../../lib/stripe";
import { subscriptionBillingFields } from "../../../lib/stripe-subscription";

async function manageBillingAction() {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization?.stripeCustomerId) throw new Error("No billing account on file for this organization yet.");

  const appOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer: organization.stripeCustomerId,
    return_url: `${appOrigin}/billing`,
    // Explicit rather than relying on whichever configuration Stripe treats as
    // "default" -- see scripts/stripe-portal-setup.ts. Omitted (falls back to
    // Stripe's own default) when unset, which is fine for local test-mode dev.
    configuration: process.env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID || undefined,
  });
  redirect(session.url);
}

/** First-time subscribe (free tier, or a fully lapsed/CANCELED org with no live Stripe subscription to modify) -- goes through Stripe Checkout. */
async function upgradeCheckoutAction(formData: FormData) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  const user = await getCurrentUser();

  const planKey = String(formData.get("planKey") ?? "");
  const interval = String(formData.get("interval") ?? "monthly") === "yearly" ? "yearly" : "monthly";
  if (!billingService.isPlanKey(planKey)) throw new Error("Invalid plan");
  const plan = billingService.PLANS[planKey];
  if (plan.isFree) throw new Error("The free plan isn't purchasable -- it requires an access code.");
  const priceId = interval === "yearly" ? plan.priceIdYearly : plan.priceIdMonthly;
  if (!priceId) throw new Error(`${plan.name} (${interval}) isn't configured yet -- missing Stripe price id.`);

  // Reached only when !hasLiveSubscription (this org has never had a paid
  // subscription, or its last one was fully canceled) -- the same "first paid
  // subscription" moment signup/plan/page.tsx's checkout session covers, so it gets
  // the same trial. Known, accepted edge case: an org that cancels and later
  // resubscribes gets a fresh trial too -- no "has this org ever trialed before"
  // tracking exists, and building it isn't worth it for how rarely that happens.
  const appOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: organization.stripeCustomerId ?? undefined,
    customer_email: organization.stripeCustomerId ? undefined : user?.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appOrigin}/billing?upgraded=1`,
    cancel_url: `${appOrigin}/billing`,
    metadata: { flow: "upgrade", organizationId: organization.id, planKey },
    subscription_data: { trial_period_days: billingService.TRIAL_PERIOD_DAYS },
    payment_method_collection: "if_required",
  });

  if (!session.url) throw new Error("Failed to create checkout session");
  redirect(session.url);
}

/** Already-subscribed org switching tiers/intervals -- updates the existing Stripe subscription in place (prorated) instead of creating a second one. Applies the result to our DB immediately rather than waiting on the webhook round trip. */
async function changePlanAction(formData: FormData) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN"]);
  if (!organization.stripeSubscriptionId) throw new Error("No active subscription to change -- use Subscribe instead.");

  const planKey = String(formData.get("planKey") ?? "");
  const interval = String(formData.get("interval") ?? "monthly") === "yearly" ? "yearly" : "monthly";
  if (!billingService.isPlanKey(planKey)) throw new Error("Invalid plan");
  const plan = billingService.PLANS[planKey];
  if (plan.isFree || plan.isCustom) throw new Error(`${plan.name} isn't available as a self-serve plan change.`);
  const priceId = interval === "yearly" ? plan.priceIdYearly : plan.priceIdMonthly;
  if (!priceId) throw new Error(`${plan.name} (${interval}) isn't configured yet -- missing Stripe price id.`);

  const subscription = await stripe.subscriptions.retrieve(organization.stripeSubscriptionId);
  const currentItem = subscription.items.data[0];
  if (!currentItem) throw new Error("Subscription has no line items -- cannot change plan.");

  const updated = await stripe.subscriptions.update(organization.stripeSubscriptionId, {
    items: [{ id: currentItem.id, price: priceId }],
    proration_behavior: "create_prorations",
    cancel_at_period_end: false,
  });

  const billing = subscriptionBillingFields(updated);
  await organizationService.applySubscriptionToOrganization(organization.id, {
    planKey: billing.planKey ?? planKey,
    subscriptionStatus: billing.subscriptionStatus,
    billingInterval: billing.billingInterval,
    currentPeriodEnd: billing.currentPeriodEnd,
    cancelAtPeriodEnd: billing.cancelAtPeriodEnd,
  });

  const user = await getCurrentUser();
  await auditService.recordAuditEvent({
    organizationId: organization.id,
    actorUserId: user?.id,
    action: "billing.plan_changed",
    targetType: "Organization",
    targetId: organization.id,
    metadata: { plan: planKey, interval },
  });

  revalidatePath("/billing");
}

/** Schedules cancellation at the end of the current billing period -- never immediate, since there's no refund logic for time already paid for. */
async function cancelSubscriptionAction() {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN"]);
  if (!organization.stripeSubscriptionId) throw new Error("No active subscription to cancel.");

  await stripe.subscriptions.update(organization.stripeSubscriptionId, { cancel_at_period_end: true });
  await organizationService.applySubscriptionToOrganization(organization.id, { cancelAtPeriodEnd: true });

  const user = await getCurrentUser();
  await auditService.recordAuditEvent({
    organizationId: organization.id,
    actorUserId: user?.id,
    action: "billing.cancel_scheduled",
    targetType: "Organization",
    targetId: organization.id,
  });

  revalidatePath("/billing");
}

/** Undoes a scheduled cancel -- available any time before the period actually ends. */
async function resumeSubscriptionAction() {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN"]);
  if (!organization.stripeSubscriptionId) throw new Error("No subscription to resume.");

  await stripe.subscriptions.update(organization.stripeSubscriptionId, { cancel_at_period_end: false });
  await organizationService.applySubscriptionToOrganization(organization.id, { cancelAtPeriodEnd: false });

  const user = await getCurrentUser();
  await auditService.recordAuditEvent({
    organizationId: organization.id,
    actorUserId: user?.id,
    action: "billing.cancel_undone",
    targetType: "Organization",
    targetId: organization.id,
  });

  revalidatePath("/billing");
}

export default async function BillingPage() {
  const organization = await getCurrentOrganization();
  if (!organization) return null;

  const usage = await billingService.getCurrentUsage(organization.id, organization.planKey);
  const usagePercent = Math.min(100, Math.round(billingService.usageRatio(usage) * 100));
  const remaining = usage.plan.monthlyQueryLimit === null ? null : Math.max(0, usage.plan.monthlyQueryLimit - usage.queriesUsed);
  const isFree = usage.plan.isFree;
  // A CANCELED org's Stripe subscription object is gone (or on its way out) -- there's
  // nothing left to update in place, so it goes through the same first-time Checkout
  // flow as the free tier rather than changePlanAction.
  const hasLiveSubscription = Boolean(organization.stripeSubscriptionId) && organization.subscriptionStatus !== "CANCELED";
  const needsAttention = organization.subscriptionStatus === "PAST_DUE" || organization.subscriptionStatus === "CANCELED";
  const periodEndLabel = organization.currentPeriodEnd
    ? organization.currentPeriodEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  const changePlanHeading = isFree ? "Upgrade to a paid plan" : hasLiveSubscription ? "Change plan" : "Resubscribe";

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-ink">Billing</h1>
      <p className="mb-8 text-sm text-ink-secondary">Your plan and usage for {organization.name}.</p>

      {needsAttention && (
        <div className="mb-6 flex items-center gap-2 rounded-md bg-danger-bg px-4 py-3 text-sm text-danger">
          <AlertTriangle size={15} className="shrink-0" />
          {organization.subscriptionStatus === "PAST_DUE"
            ? "Your last payment failed. Update your card below, or your plan will be canceled."
            : "Your subscription was canceled. Resubscribe below to restore full access."}
        </div>
      )}

      {hasLiveSubscription && (
        <CancelPlanCard
          planName={usage.plan.name}
          periodEndLabel={periodEndLabel}
          cancelAtPeriodEnd={organization.cancelAtPeriodEnd}
          onCancel={cancelSubscriptionAction}
          onResume={resumeSubscriptionAction}
        />
      )}

      <Card padding="md" className="mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-ink">{usage.plan.name}</h2>
              {!isFree && organization.billingInterval && (
                <Badge variant="neutral">{organization.billingInterval === "YEARLY" ? "Yearly" : "Monthly"}</Badge>
              )}
            </div>
            <p className="text-xs text-ink-muted">
              {isFree
                ? "Invite-only free tier"
                : periodEndLabel
                  ? organization.cancelAtPeriodEnd
                    ? `Ends ${periodEndLabel}`
                    : `Renews ${periodEndLabel}`
                  : "Usage resets monthly"}
            </p>
          </div>
          {isFree ? (
            <span className="text-xs text-ink-muted">Free plans can&rsquo;t be self-served -- pick a paid plan below to upgrade.</span>
          ) : (
            <form action={manageBillingAction}>
              <button type="submit" className={buttonClasses("secondary", "sm")}>
                Payment method &amp; invoices
              </button>
            </form>
          )}
        </div>

        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-ink-secondary">Widget questions this period</span>
          <span className="font-medium text-ink">
            {usage.queriesUsed.toLocaleString()} /{" "}
            {usage.plan.monthlyQueryLimit === null ? "unlimited" : usage.plan.monthlyQueryLimit.toLocaleString()}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className={`h-full rounded-full ${usagePercent >= 90 ? "bg-danger" : "bg-accent"}`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-ink-muted">
          {remaining === null ? "Unlimited questions this period" : `${remaining.toLocaleString()} questions remaining this period`}
        </p>
      </Card>

      <Card padding="md" className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">{changePlanHeading}</h2>
        <PlanPicker
          orgName={organization.name}
          plans={await getFormattedPlans()}
          action={hasLiveSubscription ? changePlanAction : upgradeCheckoutAction}
          currentPlanKey={hasLiveSubscription ? organization.planKey : null}
          currentInterval={hasLiveSubscription ? (organization.billingInterval === "YEARLY" ? "yearly" : "monthly") : null}
        />
      </Card>

      <Card padding="md">
        <h2 className="mb-4 text-sm font-semibold text-ink">What&rsquo;s included</h2>
        <ul className="flex flex-col gap-2.5">
          {formatPlanFeatures(usage.plan).map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-ink-secondary">
              <CheckCircle2 size={15} className="shrink-0 text-success" /> {feature}
            </li>
          ))}
        </ul>
      </Card>

      {!isFree && (
        <p className="mt-6 flex items-center gap-1.5 text-xs text-ink-muted">
          <CreditCard size={13} /> Update your card and view past invoices from the Stripe-hosted billing portal above.
        </p>
      )}
    </div>
  );
}
