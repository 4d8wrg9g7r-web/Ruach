import type { ComparisonRow } from "../../components/marketing/ComparisonTable";

/**
 * Marketing copy for the 4 public plans -- numbers here must stay in sync with
 * packages/database/src/services/billing-service.ts's PLANS (the actual enforced
 * caps). This file exists separately because marketing needs narrative copy
 * ("Best for church plants...") that billing-service has no reason to carry.
 */
export interface MarketingPlan {
  key: "essential" | "growth" | "multisite" | "enterprise";
  name: string;
  tagline: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  isCustom: boolean;
  mostPopular?: boolean;
  features: string[];
  cta: string;
  ctaHref: string;
}

export const MARKETING_PLANS: MarketingPlan[] = [
  {
    key: "essential",
    name: "Essential",
    tagline: "Best for church plants and smaller churches.",
    priceMonthly: 29,
    priceYearly: 290,
    isCustom: false,
    features: [
      "1 website",
      "1 widget",
      "500 indexed resources",
      "3 team members",
      "1,500 AI questions per month",
      "Public Prayer Wall",
      "Basic branding",
      "Basic analytics",
      "Email support",
    ],
    cta: "Start Essential",
    ctaHref: "/signup?plan=essential",
  },
  {
    key: "growth",
    name: "Growth",
    tagline: "Best for established and growing churches.",
    priceMonthly: 89,
    priceYearly: 890,
    isCustom: false,
    mostPopular: true,
    features: [
      "Everything in Essential, plus:",
      "3 websites",
      "3 widgets",
      "2,500 indexed resources",
      "10 team members",
      "6,000 AI questions per month",
      "Remove Ruach branding",
      "Advanced customization",
      "Advanced analytics",
      "Scheduled content syncing",
      "Prayer categories",
      "Prayer-team notifications",
      "Internal prayer notes",
      "Priority email support",
    ],
    cta: "Start Growth",
    ctaHref: "/signup?plan=growth",
  },
  {
    key: "multisite",
    name: "Multi-Site",
    tagline: "Best for larger and multi-campus churches.",
    priceMonthly: 179,
    priceYearly: 1790,
    isCustom: false,
    features: [
      "Everything in Growth, plus:",
      "10 websites",
      "10 widgets",
      "10,000 indexed resources",
      "Unlimited team members",
      "20,000 AI questions per month",
      "Campus-specific content",
      "Campus-specific Prayer Walls",
      "Roles and permissions",
      "Organization-wide analytics",
      "Priority indexing",
      "Guided onboarding",
      "Priority support",
    ],
    cta: "Start Multi-Site",
    ctaHref: "/signup?plan=multisite",
  },
  {
    key: "enterprise",
    name: "Enterprise",
    tagline: "For church networks, denominations, and large ministries.",
    priceMonthly: null,
    priceYearly: null,
    isCustom: true,
    features: [
      "Additional websites and usage",
      "API access",
      "Single sign-on",
      "Custom integrations",
      "Dedicated implementation",
      "Contractual support options",
    ],
    cta: "Contact Us",
    ctaHref: "/demo",
  },
];

/**
 * Backs the comparison table on both /pricing and /features -- one dataset so the
 * two pages can never drift. Values mirror billing-service.ts's PLANS exactly
 * (websites/widgets/resources/team/questions caps, and which FeatureFlag gates
 * which row) -- "Additional moderator roles" reflects advancedRolesPermissions
 * (Multi-Site+), which is the plan a PRAYER_MODERATOR role can actually be assigned
 * on from the Team page, not multipleModerators (Growth+), which only affects who's
 * allowed to moderate if such a role already existed on the account.
 */
export const COMPARISON_ROWS: ComparisonRow[] = [
  { label: "Websites (campuses)", values: ["1", "3", "10", "Unlimited"] },
  { label: "Widgets", values: ["1", "3", "10", "Unlimited"] },
  { label: "Indexed resources", values: ["500", "2,500", "10,000", "Unlimited"] },
  { label: "Team members", values: ["3", "10", "Unlimited", "Unlimited"] },
  { label: "AI questions per month", values: ["1,500", "6,000", "20,000", "Unlimited"] },
  { label: "Public Prayer Wall", values: [true, true, true, true] },
  { label: "Private requests", values: [true, true, true, true] },
  { label: "Anonymous requests", values: [true, true, true, true] },
  { label: "Prayer moderation", values: [true, true, true, true] },
  { label: "“I Prayed” + answered prayers", values: [true, true, true, true] },
  { label: "Prayer categories", values: [false, true, true, true] },
  { label: "Prayer-team notifications", values: [false, true, true, true] },
  { label: "Internal prayer notes", values: [false, true, true, true] },
  { label: "Advanced widget customization", values: [false, true, true, true] },
  { label: "Remove Ruach branding", values: [false, true, true, true] },
  { label: "Scheduled content sync", values: [false, true, true, true] },
  { label: "Campus-scoped content & Prayer Walls", values: [false, false, true, true] },
  { label: "Organization-wide analytics", values: [false, false, true, true] },
  { label: "Additional moderator roles", values: [false, false, true, true] },
  { label: "Priority indexing", values: [false, false, true, true] },
  { label: "Guided onboarding", values: [true, true, true, true] },
  { label: "Support level", values: ["Email", "Priority email", "Priority", "Dedicated"] },
];
