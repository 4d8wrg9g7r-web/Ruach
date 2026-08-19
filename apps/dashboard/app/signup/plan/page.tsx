import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { billingService } from "@ruach/database";
import { noIndexMetadata } from "../../../lib/no-index-metadata";

export const metadata: Metadata = noIndexMetadata;
import { PlanPicker } from "../../../components/PlanPicker";
import { getFormattedPlans } from "../../../lib/plan-prices";
import { requireCurrentUser } from "../../../lib/session";
import { stripe } from "../../../lib/stripe";

async function subscribeAction(formData: FormData) {
  "use server";
  const user = await requireCurrentUser();
  const planKey = String(formData.get("planKey") ?? "");
  const interval = String(formData.get("interval") ?? "monthly") === "yearly" ? "yearly" : "monthly";
  const orgName = String(formData.get("orgName") ?? "").trim() || "My Organization";

  if (!billingService.isPlanKey(planKey)) throw new Error("Invalid plan");
  const plan = billingService.PLANS[planKey];
  if (plan.isFree) throw new Error("The free plan isn't purchasable -- it requires an access code.");

  const priceId = interval === "yearly" ? plan.priceIdYearly : plan.priceIdMonthly;
  if (!priceId) throw new Error(`${plan.name} (${interval}) isn't configured yet -- missing Stripe price id.`);

  const appOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appOrigin}/signup/finishing`,
    cancel_url: `${appOrigin}/signup/plan?orgName=${encodeURIComponent(orgName)}`,
    metadata: { flow: "signup", userId: user.id, orgName, planKey },
    subscription_data: { trial_period_days: billingService.TRIAL_PERIOD_DAYS },
    // "if_required" -- nothing is due today during a full trial, so Checkout skips
    // asking for a card at all. The tradeoff (documented, not accidental): this
    // maximizes trial starts, but a trial with no card on file can't auto-convert to
    // paid when it ends -- Stripe will fail the first invoice and the subscription
    // becomes PAST_DUE. billing/page.tsx already surfaces PAST_DUE with an "Update
    // payment method" call to action, which is what actually converts these once the
    // trial ends -- it's an existing path, not new to trials.
    payment_method_collection: "if_required",
  });

  if (!session.url) throw new Error("Failed to create checkout session");
  redirect(session.url);
}

export default async function SignupPlanPage({ searchParams }: { searchParams: Promise<{ orgName?: string }> }) {
  await requireCurrentUser();
  const sp = await searchParams;
  const orgName = sp.orgName ?? "My Organization";

  const plans = await getFormattedPlans();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-1 text-center text-2xl font-semibold text-ink">Choose a plan</h1>
      <p className="mb-8 text-center text-sm text-ink-secondary">
        Pick a plan for {orgName}. Every plan starts with a {billingService.TRIAL_PERIOD_DAYS}-day free trial &mdash; no
        card required, change or cancel anytime.
      </p>
      <PlanPicker orgName={orgName} plans={plans} action={subscribeAction} />
    </main>
  );
}
