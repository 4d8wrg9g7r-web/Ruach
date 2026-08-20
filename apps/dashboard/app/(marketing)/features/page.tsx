import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { ComparisonTable } from "../../../components/marketing/ComparisonTable";
import { EyebrowLabel } from "../../../components/marketing/EyebrowLabel";
import { FadeIn } from "../../../components/marketing/FadeIn";
import { buttonClasses } from "../../../components/ui/Button";
import { COMPARISON_ROWS } from "../../../lib/marketing/pricing-data";
import { pageMetadata } from "../../../lib/marketing/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Ruach Features | Conversational Search and Prayer Tools for Churches",
  absoluteTitle: true,
  description: "Every Ruach feature, grouped by category -- conversational assistant, content library, branding, Prayer Wall, analytics, team administration, and support.",
  path: "/features",
});

interface FeatureCategory {
  title: string;
  items: { name: string; plan?: string }[];
}

const CATEGORIES: FeatureCategory[] = [
  {
    title: "Conversational Assistant",
    items: [
      { name: "Natural-language questions" },
      { name: "Recommendations based on church-approved content" },
      { name: "Source-linked answers" },
      { name: "Suggested questions", plan: "Growth+" },
      { name: "Custom welcome message" },
      { name: "Custom assistant name" },
      { name: "Configurable fallback messages" },
      { name: "Resource filtering" },
      { name: "Conversation analytics" },
      { name: "Mobile-responsive widget" },
      { name: "Embeddable website installation" },
    ],
  },
  {
    title: "Content Library",
    items: [
      { name: "Sermon videos" },
      { name: "Podcast episodes" },
      { name: "Website pages" },
      { name: "Blog posts" },
      { name: "Ministry pages" },
      { name: "Event pages" },
      { name: "Sermon notes" },
      { name: "External links" },
      { name: "Content from other ministries or speakers" },
      { name: "Manual resource entry" },
      { name: "Resource editing" },
      { name: "Resource removal" },
      { name: "Categories and tags" },
      { name: "Content-status visibility" },
      { name: "Search and filtering" },
      { name: "Scheduled synchronization", plan: "Growth+" },
    ],
  },
  {
    title: "Branding and Appearance",
    items: [
      { name: "10 widget display styles" },
      { name: "Accent color", plan: "Growth+" },
      { name: "Church logo", plan: "Growth+" },
      { name: "Assistant name" },
      { name: "Welcome message" },
      { name: "Suggested questions", plan: "Growth+" },
      { name: "Widget placement" },
      { name: "Remove Ruach branding", plan: "Growth+" },
      { name: "Separate branding per widget", plan: "Growth+" },
    ],
  },
  {
    title: "Prayer Wall",
    items: [
      { name: "Public prayer requests" },
      { name: "Private prayer requests" },
      { name: "Anonymous submissions" },
      { name: "Moderation before publishing" },
      { name: "“I Prayed” interaction" },
      { name: "Answered prayer status" },
      { name: "Prayer categories", plan: "Growth+" },
      { name: "Moderator notes", plan: "Growth+" },
      { name: "Prayer-team notifications", plan: "Growth+" },
      { name: "Campus-specific walls", plan: "Multi-Site+" },
      { name: "Spam and rate-limit protection" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { name: "Questions asked" },
      { name: "Most requested topics" },
      { name: "Resources opened" },
      { name: "Resource engagement" },
      { name: "Widget usage" },
      { name: "Prayer submissions and engagement" },
      { name: "Trends over time" },
      { name: "Website or campus breakdown", plan: "Multi-Site+" },
    ],
  },
  {
    title: "Team and Administration",
    items: [
      { name: "Multiple team members" },
      { name: "Roles and permissions" },
      { name: "Multi-site management", plan: "Multi-Site+" },
      { name: "Separate websites and widgets" },
      { name: "Central organization dashboard" },
      { name: "Account and billing management" },
      { name: "Usage monitoring" },
      { name: "Notifications before reaching limits" },
    ],
  },
  {
    title: "Support and Onboarding",
    items: [
      { name: "Installation guidance" },
      { name: "Content-import assistance" },
      { name: "Knowledge base" },
      { name: "Email support" },
      { name: "Priority support", plan: "Growth+" },
      { name: "Guided onboarding", plan: "Multi-Site" },
      { name: "Enterprise implementation options", plan: "Enterprise" },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-5 pb-12 pt-16 text-center">
        <FadeIn>
          <EyebrowLabel>Features</EyebrowLabel>
          <h1 className="text-4xl font-semibold tracking-tight text-ink">Everything ministry needs.</h1>
          <p className="mt-5 text-base leading-relaxed text-ink-secondary">
            Every Ruach feature, grouped by what it does for your church -- from the conversational assistant to the
            Prayer Wall to team administration.
          </p>
        </FadeIn>
      </section>

      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-5xl px-5">
          <div className="flex flex-col gap-14">
            {CATEGORIES.map((category, i) => (
              <FadeIn key={category.title} delay={Math.min(i * 0.05, 0.2)}>
                <h2 className="mb-5 text-lg font-semibold text-ink">{category.title}</h2>
                <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {category.items.map((item) => (
                    <li key={item.name} className="flex items-start justify-between gap-3 text-sm text-ink-secondary">
                      <span className="flex items-start gap-2">
                        <Check size={14} className="mt-0.5 shrink-0 text-accent" />
                        {item.name}
                      </span>
                      {item.plan && (
                        <span className="shrink-0 rounded-full bg-surface-warm px-2 py-0.5 text-[11px] font-medium text-accent-dark">
                          {item.plan}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-muted/60 py-16">
        <div className="mx-auto max-w-5xl px-5">
          <FadeIn>
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">Compare every plan.</h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <ComparisonTable rows={COMPARISON_ROWS} />
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="mt-8 text-center">
              <Link href="/pricing" className={buttonClasses("primary", "md")}>
                See pricing
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
