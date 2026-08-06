import type { Metadata } from "next";
import { Bell, Gauge, Layers, ShieldCheck } from "lucide-react";
import { ComparisonTable } from "../../../components/marketing/ComparisonTable";
import { EyebrowLabel } from "../../../components/marketing/EyebrowLabel";
import { FadeIn } from "../../../components/marketing/FadeIn";
import { PricingGrid } from "../../../components/marketing/PricingGrid";
import { COMPARISON_ROWS, MARKETING_PLANS } from "../../../lib/marketing/pricing-data";
import { pageMetadata } from "../../../lib/marketing/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Ruach Pricing | Plans for Churches of Every Size",
  description: "Ruach pricing plans for churches of every size, from church plants to multi-campus organizations. Every plan includes the core Ruach experience.",
  path: "/pricing",
});

const PHILOSOPHY_POINTS = [
  {
    icon: <Gauge size={16} />,
    text: "The Essential plan is intentionally priced for small churches.",
  },
  {
    icon: <ShieldCheck size={16} />,
    text: "Every plan includes the core Ruach experience -- the conversational assistant and a public Prayer Wall.",
  },
  {
    icon: <Layers size={16} />,
    text: "Higher plans are based on scale, team needs, customization, and organizational complexity -- not artificial restrictions.",
  },
  {
    icon: <Bell size={16} />,
    text: "Usage limits protect infrastructure but aren't meant to penalize ministry growth. Churches receive warnings before reaching a limit, and additional capacity can be added when necessary.",
  },
];

export default function PricingPage() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-5 pb-10 pt-16 text-center">
        <FadeIn>
          <EyebrowLabel>Pricing</EyebrowLabel>
          <h1 className="text-4xl font-semibold tracking-tight text-ink">Plans for churches of every size.</h1>
          <p className="mt-5 text-base leading-relaxed text-ink-secondary">
            Every plan includes the core Ruach experience. Higher plans add scale, customization, and
            organization-wide tools for larger and multi-campus churches.
          </p>
        </FadeIn>
      </section>

      <section className="px-5 pb-16">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <PricingGrid plans={MARKETING_PLANS} />
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-border bg-surface-muted/60 py-16">
        <div className="mx-auto max-w-3xl px-5">
          <FadeIn>
            <h2 className="mb-2 text-2xl font-semibold tracking-tight text-ink">
              Built to remain accessible for churches of different sizes.
            </h2>
          </FadeIn>
          <div className="mt-8 flex flex-col gap-5">
            {PHILOSOPHY_POINTS.map((point, i) => (
              <FadeIn key={point.text} delay={i * 0.06}>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-warm text-accent-dark">
                    {point.icon}
                  </span>
                  <p className="text-sm leading-relaxed text-ink-secondary">{point.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-5">
          <FadeIn>
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">Compare plans in detail.</h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <ComparisonTable rows={COMPARISON_ROWS} />
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
