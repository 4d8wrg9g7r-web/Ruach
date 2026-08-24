/**
 * Fails if the marketing site's advertised prices (lib/marketing/pricing-data.ts)
 * ever drift from what Stripe actually charges -- the exact bug a pre-launch UX
 * review caught by hand (Growth advertised at $89/mo, Stripe billing $79/mo;
 * Multi-Site advertised at $179/mo, Stripe billing $199/mo). The Billing page
 * already reads live from Stripe for this reason (see lib/plan-prices.ts's own
 * comment); this script is the same guarantee applied to the static marketing copy,
 * which can't fetch Stripe on every page load without hurting cacheability.
 *
 * Usage: pnpm --filter @ruach/dashboard check:pricing (needs STRIPE_SECRET_KEY and
 * the STRIPE_PRICE_* env vars set -- degrades to a skipped warning, not a failure,
 * for any plan whose price id isn't configured, matching how the app itself treats
 * an unconfigured Stripe as "billing not set up yet" rather than an error).
 */
import { billingService } from "@ruach/database";
import { stripe } from "../lib/stripe";
import { MARKETING_PLANS } from "../lib/marketing/pricing-data";

const { PLANS } = billingService;
const CHECKED_PLANS: billingService.PlanKey[] = ["essential", "growth", "multisite"];

async function amountFor(priceId: string | null): Promise<number | null> {
  if (!priceId) return null;
  const price = await stripe.prices.retrieve(priceId);
  if (typeof price.unit_amount !== "number") return null;
  return price.unit_amount / 100;
}

async function main() {
  let mismatches = 0;
  let skipped = 0;

  for (const key of CHECKED_PLANS) {
    const plan = PLANS[key];
    const marketing = MARKETING_PLANS.find((p) => p.key === key);
    if (!marketing) {
      console.error(`No MARKETING_PLANS entry for "${key}" -- add one or remove it from CHECKED_PLANS.`);
      mismatches += 1;
      continue;
    }

    if (!plan.priceIdMonthly || !plan.priceIdYearly) {
      console.warn(`Skipping "${key}": Stripe price ids not configured in this environment.`);
      skipped += 1;
      continue;
    }

    const [liveMonthly, liveYearly] = await Promise.all([
      amountFor(plan.priceIdMonthly),
      amountFor(plan.priceIdYearly),
    ]);

    if (liveMonthly !== null && liveMonthly !== marketing.priceMonthly) {
      console.error(
        `"${key}" monthly price mismatch: marketing says $${marketing.priceMonthly}, Stripe charges $${liveMonthly}.`,
      );
      mismatches += 1;
    }
    if (liveYearly !== null && liveYearly !== marketing.priceYearly) {
      console.error(
        `"${key}" yearly price mismatch: marketing says $${marketing.priceYearly}, Stripe charges $${liveYearly}.`,
      );
      mismatches += 1;
    }
  }

  if (mismatches > 0) {
    console.error(`\n${mismatches} pricing mismatch(es) found -- update lib/marketing/pricing-data.ts to match Stripe.`);
    process.exit(1);
  }

  console.log(skipped > 0 ? `Pricing in sync (${skipped} plan(s) skipped -- no Stripe price ids configured).` : "Pricing in sync.");
}

main().catch((err) => {
  console.error("check-pricing-sync failed to run:", err);
  process.exit(1);
});
