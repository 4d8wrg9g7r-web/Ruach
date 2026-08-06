/**
 * One-time, manual bootstrap: creates a Stripe Customer Portal configuration for
 * whatever account STRIPE_SECRET_KEY points at (use the *live* secret key to
 * configure production -- test mode already has Stripe's own permissive default
 * configuration, so this isn't needed locally).
 *
 * Scoped to payment-method updates + invoice history only -- plan changes and
 * cancellation are already handled in-app (see billing/page.tsx's changePlanAction
 * / cancelSubscriptionAction), so the portal isn't given those features too, which
 * would just be a second, differently-worded surface for the same two actions.
 *
 * Prints a STRIPE_BILLING_PORTAL_CONFIGURATION_ID line to paste into .env --
 * manageBillingAction passes it explicitly to billingPortal.sessions.create()
 * rather than relying on whichever configuration Stripe treats as "default",
 * which isn't reliably controllable from the API alone.
 *
 * Usage (run from apps/dashboard):
 *   STRIPE_SECRET_KEY=sk_live_... pnpm exec tsx scripts/stripe-portal-setup.ts
 */
import Stripe from "stripe";

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("Set STRIPE_SECRET_KEY (the live secret key, to configure production) before running this script.");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-07-29.dahlia" });

  const configuration = await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: "Manage your Ruach payment method and invoices.",
    },
    features: {
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      customer_update: { enabled: false },
      subscription_cancel: { enabled: false },
      subscription_update: { enabled: false },
    },
  });

  console.log(`Created billing portal configuration: ${configuration.id}`);
  console.log("\nPaste this into .env (and Vercel's Production env vars):\n");
  console.log(`STRIPE_BILLING_PORTAL_CONFIGURATION_ID="${configuration.id}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
