import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentOrganization, requireCurrentUser } from "../../lib/session";
import { noIndexMetadata } from "../../lib/no-index-metadata";

export const metadata: Metadata = noIndexMetadata;

/**
 * No longer an open "create any org for free" form -- org creation is now gated by
 * payment (Stripe Checkout via /signup/plan) or a redeemed FreeTierAccessCode (via
 * /signup). This page is only reachable by an authenticated user with zero orgs (see
 * (dashboard)/layout.tsx's redirect here), which today means someone who created an
 * account but never finished checkout -- send them back to pick a plan rather than
 * either re-registering or handing them a free org.
 */
export default async function OnboardingPage() {
  await requireCurrentUser();
  const existing = await getCurrentOrganization();
  if (existing) redirect("/dashboard");
  redirect("/signup/plan");
}
