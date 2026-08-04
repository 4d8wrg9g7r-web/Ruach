import { tenantDb } from "../client";

/**
 * No real billing/subscription tables exist yet (see docs/architecture.md's
 * "deferred past milestone 1" list -- Stripe integration needs a real account and a
 * pricing decision this codebase can't make on its own). This is the mock-provider
 * pattern applied to billing: a single static plan tier, but real usage numbers
 * pulled from actual conversation data instead of a hardcoded constant, so the UI is
 * honest today and the plan-tier logic is a contained swap once real billing lands.
 */
export const CURRENT_PLAN = {
  name: "Pro Plan",
  monthlyQueryLimit: 25000,
} as const;

function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function startOfNextMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

export interface UsageSummary {
  plan: typeof CURRENT_PLAN;
  queriesUsed: number;
  periodStart: Date;
  periodEnd: Date;
}

/** "Queries used" = visitor questions sent to any widget this calendar month. */
export async function getCurrentUsage(organizationId: string): Promise<UsageSummary> {
  const periodStart = startOfCurrentMonth();
  const periodEnd = startOfNextMonth();

  const queriesUsed = await tenantDb.conversationMessage.count({
    where: { organizationId, role: "USER", createdAt: { gte: periodStart, lt: periodEnd } },
  });

  return { plan: CURRENT_PLAN, queriesUsed, periodStart, periodEnd };
}
