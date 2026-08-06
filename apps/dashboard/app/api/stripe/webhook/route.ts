import { NextResponse } from "next/server";
import type Stripe from "stripe";
import * as Sentry from "@sentry/nextjs";
import { auditService, organizationService } from "@ruach/database";
import { stripe } from "../../../../lib/stripe";
import { subscriptionBillingFields } from "../../../../lib/stripe-subscription";
import { slugify } from "../../../../lib/slug";

export const runtime = "nodejs";

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const flow = session.metadata?.flow;
  if (flow !== "signup" && flow !== "upgrade") return;
  if (typeof session.customer !== "string" || typeof session.subscription !== "string") return;

  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  const billing = subscriptionBillingFields(subscription);
  if (!billing.planKey) {
    console.error(`Checkout session ${session.id} completed with an unrecognized Stripe price -- cannot resolve a planKey.`);
    return;
  }

  if (flow === "signup") {
    const userId = session.metadata?.userId;
    const orgName = session.metadata?.orgName;
    if (!userId || !orgName) return;

    // Idempotency: Stripe retries webhooks. If this user already has an org (a
    // prior delivery of this same event already ran), don't create a second one.
    const existing = await organizationService.getMembershipsForUser(userId);
    if (existing.length > 0) return;

    let slug = slugify(orgName);
    let suffix = 0;
    while (await organizationService.getOrganizationBySlug(slug)) {
      suffix += 1;
      slug = `${slugify(orgName)}-${suffix}`;
    }

    const organization = await organizationService.createOrganizationFromCheckout({
      name: orgName,
      slug,
      ownerUserId: userId,
      planKey: billing.planKey,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      subscriptionStatus: billing.subscriptionStatus,
      billingInterval: billing.billingInterval,
      currentPeriodEnd: billing.currentPeriodEnd ?? new Date(),
    });
    await auditService.recordAuditEvent({
      organizationId: organization.id,
      actorUserId: userId,
      action: "organization.created",
      targetType: "Organization",
      targetId: organization.id,
      metadata: { plan: billing.planKey, viaStripeCheckout: true },
    });
    return;
  }

  // flow === "upgrade"
  const organizationId = session.metadata?.organizationId;
  if (!organizationId) return;
  // Idempotency: skip if this exact subscription was already applied.
  const org = await organizationService.getOrganization(organizationId);
  if (org?.stripeSubscriptionId === session.subscription) return;

  await organizationService.applySubscriptionToOrganization(organizationId, {
    planKey: billing.planKey,
    stripeCustomerId: session.customer,
    stripeSubscriptionId: session.subscription,
    subscriptionStatus: billing.subscriptionStatus,
    billingInterval: billing.billingInterval,
    currentPeriodEnd: billing.currentPeriodEnd,
    cancelAtPeriodEnd: billing.cancelAtPeriodEnd,
  });
  await auditService.recordAuditEvent({
    organizationId,
    action: "billing.plan_changed",
    targetType: "Organization",
    targetId: organizationId,
    metadata: { plan: billing.planKey, viaStripeCheckout: true },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const organization = await organizationService.getOrganizationByStripeSubscriptionId(subscription.id);
  if (!organization) return;
  const billing = subscriptionBillingFields(subscription);
  await organizationService.applySubscriptionToOrganization(organization.id, {
    planKey: billing.planKey ?? undefined,
    subscriptionStatus: billing.subscriptionStatus,
    billingInterval: billing.billingInterval,
    currentPeriodEnd: billing.currentPeriodEnd,
    cancelAtPeriodEnd: billing.cancelAtPeriodEnd,
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const organization = await organizationService.getOrganizationByStripeSubscriptionId(subscription.id);
  if (!organization) return;
  await organizationService.applySubscriptionToOrganization(organization.id, {
    subscriptionStatus: "CANCELED",
    cancelAtPeriodEnd: false,
  });
}

/**
 * Stripe requires the RAW request body for signature verification -- req.json()
 * would parse-then-reserialize, which no longer byte-matches what Stripe signed.
 * runtime = "nodejs" (like cron/sync/route.ts) since the Stripe SDK needs Node, not Edge.
 */
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
    }
  } catch (err) {
    console.error(`Stripe webhook handler failed for event ${event.id} (${event.type}):`, err);
    // Still 200 -- Stripe would otherwise retry indefinitely on a bug that isn't
    // transient. Reported to Sentry (rather than just console.error) since a failed
    // webhook can silently desync a customer's plan/status until someone notices.
    Sentry.captureException(err, { tags: { stripeEventType: event.type, stripeEventId: event.id } });
  }

  return NextResponse.json({ received: true });
}
