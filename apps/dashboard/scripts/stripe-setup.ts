/**
 * One-time, manual bootstrap: creates the 3 paid-tier Stripe Products, each with a
 * monthly + yearly recurring Price, in whatever Stripe account STRIPE_SECRET_KEY
 * points at (use a *test-mode* key locally). Prints the resulting STRIPE_PRICE_*
 * lines to paste into .env -- avoids clicking through the Stripe Dashboard by hand.
 * Safe to re-run: it always creates new Products/Prices rather than mutating
 * existing ones, so only run it once per Stripe account (test or live).
 *
 * Usage (run from apps/dashboard -- plain tsx doesn't auto-load .env the way
 * `next build`/`next dev` do, so source it first):
 *   set -a && source ../../.env && set +a && pnpm exec tsx scripts/stripe-setup.ts
 */
import Stripe from "stripe";

const TIERS = [
  { key: "ESSENTIAL", name: "Essential", monthlyCents: 2900, yearlyCents: 29000 },
  { key: "GROWTH", name: "Growth", monthlyCents: 8900, yearlyCents: 89000 },
  { key: "MULTISITE", name: "Multi-Site", monthlyCents: 17900, yearlyCents: 179000 },
] as const;

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("Set STRIPE_SECRET_KEY (a test-mode secret key) before running this script.");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-07-29.dahlia" });
  const envLines: string[] = [];

  for (const tier of TIERS) {
    const product = await stripe.products.create({ name: `Ruach ${tier.name}` });

    const monthly = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: tier.monthlyCents,
      recurring: { interval: "month" },
      nickname: `${tier.name} Monthly`,
    });
    const yearly = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: tier.yearlyCents,
      recurring: { interval: "year" },
      nickname: `${tier.name} Yearly`,
    });

    console.log(`Created ${tier.name}: product=${product.id} monthly=${monthly.id} yearly=${yearly.id}`);
    envLines.push(`STRIPE_PRICE_${tier.key}_MONTHLY="${monthly.id}"`);
    envLines.push(`STRIPE_PRICE_${tier.key}_YEARLY="${yearly.id}"`);
  }

  console.log("\nPaste these into .env:\n");
  console.log(envLines.join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
