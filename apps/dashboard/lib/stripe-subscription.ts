import type Stripe from "stripe";
import { billingService } from "@ruach/database";

/**
 * Maps a Stripe subscription status onto our narrower SubscriptionStatus enum.
 * 'paused'/'incomplete_expired' aren't modeled separately (no feature in this app
 * distinguishes them yet) -- folded into the closest status we do track rather than
 * throwing on a value Stripe is free to send at any time.
 */
function mapSubscriptionStatus(
  status: Stripe.Subscription.Status,
): "INCOMPLETE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID" {
  switch (status) {
    case "trialing":
      return "TRIALING";
    case "active":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "incomplete_expired":
      return "CANCELED";
    case "unpaid":
      return "UNPAID";
    case "paused":
      return "PAST_DUE";
    case "incomplete":
    default:
      return "INCOMPLETE";
  }
}

/**
 * Reads the fields our Organization row cares about off a Stripe subscription
 * object -- shared by the webhook (async, Stripe-initiated updates) and the billing
 * Server Actions (which call stripe.subscriptions.update() directly and want to
 * apply the result immediately rather than wait on the webhook round trip).
 */
export function subscriptionBillingFields(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];
  const priceId = item?.price.id;
  const planKey = priceId ? billingService.getPlanKeyByStripePriceId(priceId) : null;
  const interval = item?.price.recurring?.interval === "year" ? ("YEARLY" as const) : ("MONTHLY" as const);
  return {
    planKey,
    billingInterval: interval,
    subscriptionStatus: mapSubscriptionStatus(subscription.status),
    currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : undefined,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}
