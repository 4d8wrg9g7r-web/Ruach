import { tenantDb } from "../client";

/** Every gate-able capability across the tiers below (see the plan doc's table). */
export type FeatureFlag =
  | "removeBranding"
  | "advancedWidgetCustomization"
  | "prayerCategories"
  | "prayerTeamNotifications"
  | "internalPrayerNotes"
  | "multipleModerators"
  | "advancedRolesPermissions"
  | "campusScopedContentLibraries"
  | "campusScopedPrayerWalls"
  | "orgWideAnalytics"
  | "priorityIndexing"
  | "guidedOnboarding";

const GROWTH_FEATURES: FeatureFlag[] = [
  "removeBranding",
  "advancedWidgetCustomization",
  "prayerCategories",
  "prayerTeamNotifications",
  "internalPrayerNotes",
  "multipleModerators",
  "guidedOnboarding",
];

const MULTISITE_FEATURES: FeatureFlag[] = [
  ...GROWTH_FEATURES,
  "advancedRolesPermissions",
  "campusScopedContentLibraries",
  "campusScopedPrayerWalls",
  "orgWideAnalytics",
  "priorityIndexing",
];

/**
 * Plan tiers as code-level config, not a DB table -- there's no self-serve plan
 * creation/editing need (a fixed, small set of tiers), so a table + migration +
 * admin CRUD would be overhead for something that changes rarely and by hand.
 * Stripe Price ids are environment-specific (test vs live), so they're read
 * straight from env vars here rather than hardcoded, matching this codebase's
 * existing "no config-abstraction module, direct process.env.X access" convention
 * (see CRON_SECRET, OPENAI_API_KEY). Real dollar amounts live entirely in Stripe --
 * change the env vars, not this file, to update pricing.
 *
 * Caps are `number | null`, where `null` means unlimited. The free tier
 * ("Founding Church Program" -- invite-only beta testers, see FreeTierAccessCode)
 * gets Growth-level caps/features by design, not Essential-level.
 */
export const PLANS = {
  free: {
    name: "Founding Church Program",
    isFree: true,
    isCustom: false,
    monthlyQueryLimit: 6000,
    maxWebsites: 3,
    maxWidgets: 3,
    maxIndexedResources: 2500,
    maxTeamMembers: 10,
    features: GROWTH_FEATURES,
    priceIdMonthly: null,
    priceIdYearly: null,
  },
  essential: {
    name: "Essential",
    isFree: false,
    isCustom: false,
    monthlyQueryLimit: 1500,
    maxWebsites: 1,
    maxWidgets: 1,
    maxIndexedResources: 500,
    maxTeamMembers: 3,
    features: ["guidedOnboarding"] as FeatureFlag[],
    priceIdMonthly: process.env.STRIPE_PRICE_ESSENTIAL_MONTHLY ?? null,
    priceIdYearly: process.env.STRIPE_PRICE_ESSENTIAL_YEARLY ?? null,
  },
  growth: {
    name: "Growth",
    isFree: false,
    isCustom: false,
    monthlyQueryLimit: 6000,
    maxWebsites: 3,
    maxWidgets: 3,
    maxIndexedResources: 2500,
    maxTeamMembers: 10,
    features: GROWTH_FEATURES,
    priceIdMonthly: process.env.STRIPE_PRICE_GROWTH_MONTHLY ?? null,
    priceIdYearly: process.env.STRIPE_PRICE_GROWTH_YEARLY ?? null,
  },
  multisite: {
    name: "Multi-Site",
    isFree: false,
    isCustom: false,
    monthlyQueryLimit: 20000,
    maxWebsites: 10,
    maxWidgets: 10,
    maxIndexedResources: 10000,
    maxTeamMembers: null,
    features: MULTISITE_FEATURES,
    priceIdMonthly: process.env.STRIPE_PRICE_MULTISITE_MONTHLY ?? null,
    priceIdYearly: process.env.STRIPE_PRICE_MULTISITE_YEARLY ?? null,
  },
  enterprise: {
    name: "Enterprise",
    isFree: false,
    // Never purchasable via Checkout (no price ids, excluded from PAID_PLAN_KEYS) --
    // contact-us only. Assignable to an org by hand (directly via rawDb) once a deal
    // is signed; see PlanPicker's static "contact us" card.
    isCustom: true,
    monthlyQueryLimit: null,
    maxWebsites: null,
    maxWidgets: null,
    maxIndexedResources: null,
    maxTeamMembers: null,
    features: MULTISITE_FEATURES,
    priceIdMonthly: null,
    priceIdYearly: null,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
export type Plan = (typeof PLANS)[PlanKey];

/** The 3 self-serve paid tiers in display order, for pricing/upgrade UI. Enterprise is deliberately excluded -- it's contact-us only. */
export const PAID_PLAN_KEYS: PlanKey[] = ["essential", "growth", "multisite"];

export function isPlanKey(value: string): value is PlanKey {
  return value in PLANS;
}

export function getPlan(planKey: string): Plan {
  return isPlanKey(planKey) ? PLANS[planKey] : PLANS.multisite;
}

export function planHasFeature(planKey: string, feature: FeatureFlag): boolean {
  return (getPlan(planKey).features as FeatureFlag[]).includes(feature);
}

/** Throws a friendly, user-facing error if `current` is already at or past `max` (null max = unlimited, never throws). */
export function assertUnderCap(current: number, max: number | null, label: string): void {
  if (max !== null && current >= max) {
    throw new Error(`You've reached your plan's ${label} limit (${max}). Upgrade to add more.`);
  }
}

/** How many more of something can be created before hitting `max` (null = unlimited). Used to slice a bulk batch down to what the plan allows, rather than throwing -- see the bulk-approve enqueue action. */
/**
 * Bulk-operation worker-pool size for resource-pipeline.ts's mapWithConcurrency --
 * Multi-Site+ orgs (priorityIndexing feature) get a larger pool, so their own large
 * batches finish faster in wall-clock time. There's no shared cross-tenant queue to
 * "jump ahead" in (every org's jobs already run independently via next/server's
 * after()), so this is the honest, concrete version of "priority indexing": your
 * bulk jobs get more concurrent workers, not a higher spot in someone else's line.
 */
export function bulkConcurrency(planKey: string): number {
  return planHasFeature(planKey, "priorityIndexing") ? 10 : 5;
}

export function remainingCapacity(current: number, max: number | null): number | null {
  if (max === null) return null;
  return Math.max(0, max - current);
}

/** Reverse lookup from a Stripe Price id (as seen on a subscription/checkout event) back to our planKey, for syncing webhook events. */
export function getPlanKeyByStripePriceId(priceId: string): PlanKey | null {
  for (const key of Object.keys(PLANS) as PlanKey[]) {
    const plan = PLANS[key];
    if (plan.priceIdMonthly === priceId || plan.priceIdYearly === priceId) return key;
  }
  return null;
}

function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function startOfNextMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

export interface UsageSummary {
  plan: Plan;
  queriesUsed: number;
  periodStart: Date;
  periodEnd: Date;
}

/** "Queries used" = visitor questions sent to any widget this calendar month. */
export async function getCurrentUsage(organizationId: string, planKey: string): Promise<UsageSummary> {
  const periodStart = startOfCurrentMonth();
  const periodEnd = startOfNextMonth();

  const queriesUsed = await tenantDb.conversationMessage.count({
    where: { organizationId, role: "USER", createdAt: { gte: periodStart, lt: periodEnd } },
  });

  return { plan: getPlan(planKey), queriesUsed, periodStart, periodEnd };
}

/** 0-1 fraction of the plan's monthly question quota used so far this period (0 for unlimited plans). */
export function usageRatio(usage: UsageSummary): number {
  if (usage.plan.monthlyQueryLimit === null) return 0;
  return usage.queriesUsed / usage.plan.monthlyQueryLimit;
}
