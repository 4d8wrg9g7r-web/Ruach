import Stripe from "stripe";

/**
 * Direct process.env.STRIPE_SECRET_KEY access, no config-abstraction module --
 * matches the rest of this codebase's convention for third-party secrets
 * (CRON_SECRET, OPENAI_API_KEY). apiVersion pinned so a future Stripe account
 * default-version bump can't silently change webhook event shapes underneath us.
 *
 * Constructed lazily behind a Proxy rather than at module scope: Stripe's
 * constructor throws immediately on an empty apiKey, and Next.js imports route
 * modules during `next build`'s page-data collection step (not just at request
 * time). Billing is meant to degrade gracefully when STRIPE_SECRET_KEY is unset
 * (see .env.example), so the throw must wait until something actually calls a
 * Stripe method.
 */
let client: Stripe | null = null;

function getClient(): Stripe {
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2026-07-29.dahlia" });
  }
  return client;
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});
