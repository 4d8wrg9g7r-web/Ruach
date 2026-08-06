import { billingService } from "@ruach/database";
import type { PlanPickerOption } from "../components/PlanPicker";
import { stripe } from "./stripe";

/** Live prices from Stripe (not hardcoded) so what's shown always matches what a card actually gets charged. Missing/unconfigured price ids degrade to null rather than crashing the page. Shared by /signup/plan and the Billing page's upgrade flow. */
async function formatPrice(priceId: string | null): Promise<string | null> {
  if (!priceId) return null;
  try {
    const price = await stripe.prices.retrieve(priceId);
    if (typeof price.unit_amount !== "number") return null;
    const amount = price.unit_amount / 100;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: price.currency.toUpperCase(), maximumFractionDigits: 0 }).format(
      amount,
    );
  } catch (err) {
    console.error(`Failed to fetch Stripe price ${priceId}:`, err);
    return null;
  }
}

const FEATURE_LABELS: Record<billingService.FeatureFlag, string> = {
  removeBranding: "Remove Ruach branding",
  advancedWidgetCustomization: "Advanced widget customization",
  prayerCategories: "Prayer request categories",
  prayerTeamNotifications: "Prayer team notifications",
  internalPrayerNotes: "Internal prayer notes",
  multipleModerators: "Multiple prayer moderators",
  advancedRolesPermissions: "Advanced roles & permissions",
  campusScopedContentLibraries: "Campus-specific content libraries",
  campusScopedPrayerWalls: "Campus-specific prayer walls",
  orgWideAnalytics: "Organization-wide analytics",
  priorityIndexing: "Priority resource indexing",
  guidedOnboarding: "Guided setup",
};

/** Turns a plan's structured caps/flags into a display bullet list -- shared by the plan-picker cards and the Billing page's "what's included" section, so marketing copy can never drift from what's actually enforced. */
export function formatPlanFeatures(plan: billingService.Plan): string[] {
  const lines: string[] = [
    `${plan.maxWebsites === null ? "Unlimited" : plan.maxWebsites} website${plan.maxWebsites === 1 ? "" : "s"}`,
    `${plan.maxWidgets === null ? "Unlimited" : plan.maxWidgets} widget${plan.maxWidgets === 1 ? "" : "s"}`,
    `${plan.maxIndexedResources === null ? "Unlimited" : plan.maxIndexedResources.toLocaleString()} indexed resources`,
    `${plan.maxTeamMembers === null ? "Unlimited" : plan.maxTeamMembers} team members`,
    `${plan.monthlyQueryLimit === null ? "Unlimited" : plan.monthlyQueryLimit.toLocaleString()} AI questions/month`,
    "Public Prayer Wall",
  ];
  for (const feature of plan.features) {
    lines.push(FEATURE_LABELS[feature]);
  }
  return lines;
}

export async function getFormattedPlans(): Promise<PlanPickerOption[]> {
  return Promise.all(
    billingService.PAID_PLAN_KEYS.map(async (key) => {
      const plan = billingService.PLANS[key];
      const [priceMonthly, priceYearly] = await Promise.all([formatPrice(plan.priceIdMonthly), formatPrice(plan.priceIdYearly)]);
      return { key, name: plan.name, features: formatPlanFeatures(plan), priceMonthly, priceYearly };
    }),
  );
}
