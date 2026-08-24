import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, Rocket, Sparkles, Users, X } from "lucide-react";
import { billingService } from "@ruach/database";
import { getCurrentOrganization, getCurrentUser } from "../../lib/session";
import { AssistantDemo } from "../../components/marketing/AssistantDemo";
import { EyebrowLabel } from "../../components/marketing/EyebrowLabel";
import { FadeIn } from "../../components/marketing/FadeIn";
import { FeatureCard } from "../../components/marketing/FeatureCard";
import { JsonLd } from "../../components/marketing/JsonLd";
import { LogoGrid } from "../../components/marketing/LogoGrid";
import { PrayerWallPreview } from "../../components/marketing/PrayerWallPreview";
import { PricingGrid } from "../../components/marketing/PricingGrid";
import { buttonClasses } from "../../components/ui/Button";
import { MARKETING_PLANS } from "../../lib/marketing/pricing-data";
import { pageMetadata } from "../../lib/marketing/page-metadata";
import {
  organizationSchema,
  softwareApplicationSchema,
} from "../../lib/marketing/schema";

export const metadata: Metadata = pageMetadata({
  title: "Ruach | Help People Discover Your Church's Content",
  absoluteTitle: true,
  description:
    "Ruach helps churches turn sermons, articles, and ministry pages into a conversational website experience, with an optional moderated Prayer Wall.",
  path: "/",
});

/**
 * Organization (brand identity for knowledge-panel-style results) and
 * SoftwareApplication (eligible for rich results like pricing/rating snippets) --
 * builders live in lib/marketing/schema.ts. Only on the homepage, not repeated per
 * marketing page, since both describe the product/company as a whole rather than
 * page-specific content.
 */
const STRUCTURED_DATA = [organizationSchema(), softwareApplicationSchema()];

/**
 * Honest "we're new" section, replacing an earlier placeholder-testimonials section
 * that quoted invented churches -- see git history. No claims here that aren't true
 * today: real shipping cadence (see /release-notes), real direct-access support (no
 * dedicated support team yet to hide behind), real feature provenance.
 */
const BUILDING_POINTS = [
  {
    icon: <Rocket size={18} />,
    title: "We ship every week",
    description:
      "New features go out constantly, not on a quarterly roadmap -- Testimonies, content-type priority, and direct-answer links all shipped in the last two weeks alone.",
  },
  {
    icon: <Users size={18} />,
    title: "You'll talk to the people building it",
    description:
      "Early churches get direct access to the team building Ruach, not a support ticket queue. Your feedback shapes what ships next -- literally.",
  },
  {
    icon: <Sparkles size={18} />,
    title: "Built from real requests, not guesses",
    description:
      "Every feature so far started as something a church actually asked for. If Ruach is missing something you need, that's the fastest way to get it built.",
  },
];

const AUDIENCES = [
  {
    name: "Small Churches",
    description:
      "Affordable, simple setup, one website, one clear place for people to find resources and submit prayer requests.",
    href: "/pricing#essential",
  },
  {
    name: "Growing Churches",
    description:
      "Larger content libraries, multiple ministry areas, richer customization, analytics, and prayer workflows.",
    href: "/pricing#growth",
  },
  {
    name: "Multi-Site Churches",
    description:
      "Campus-specific content, multiple widgets, team permissions, organization-wide oversight.",
    href: "/pricing#multisite",
  },
];

const RUACH_DOES = [
  "Recommend your content",
  "Surface relevant ministries",
  "Link people to next steps",
  "Help visitors navigate",
  "Connect people to prayer",
];

const RUACH_DOES_NOT = [
  "Replace pastors",
  "Create independent doctrine",
  "Pretend to be a counselor",
  "Search unrestricted sources",
  "Publish content without church control",
];

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    const organization = await getCurrentOrganization();
    redirect(organization ? "/dashboard" : "/onboarding");
  }

  return (
    <div>
      <JsonLd data={STRUCTURED_DATA} />
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <FadeIn>
            <EyebrowLabel>For churches</EyebrowLabel>
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
              Breathe fresh life into your content.
            </h1>
            <p className="mt-4 max-w-lg text-xl font-medium leading-snug text-ink-secondary">
              Help people find what your church has already shared.
            </p>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-secondary">
              Ruach turns your sermons, articles, ministries, events, and
              resources into a conversational experience&mdash;helping people
              discover the right next step without searching through your entire
              website.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" className={buttonClasses("primary", "lg")}>
                Start free trial
              </Link>
              <Link
                href="/how-it-works"
                className={buttonClasses("secondary", "lg")}
              >
                See how it works
              </Link>
            </div>
            <p className="mt-5 text-sm text-ink-muted">
              Free for {billingService.TRIAL_PERIOD_DAYS} days, no card
              required. Grounded only in your content.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <AssistantDemo />
          </FadeIn>
        </div>
      </section>

      {/* Why section */}
      <section className="border-t border-border bg-surface-muted/60 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn>
              <EyebrowLabel>Why Ruach</EyebrowLabel>
              <h2 className="max-w-md text-3xl font-semibold tracking-tight text-ink">
                Your church has already done the hard work.
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-ink-secondary">
                Churches spend years creating sermons, podcasts, articles,
                ministry pages, studies, and resources, yet much of that content
                becomes difficult to find after it is published. Ruach helps
                recover that value.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="flex flex-col gap-3">
                {[
                  "Your church teaches.",
                  "Your church creates.",
                  "Your church serves.",
                  "Ruach helps people find it.",
                ].map((line, i) => (
                  <div
                    key={line}
                    className={`rounded-lg border px-5 py-4 text-sm ${
                      i === 3
                        ? "border-accent/30 bg-surface-warm font-medium text-ink"
                        : "border-border bg-surface text-ink-secondary"
                    }`}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* How Ruach works -- a one-line teaser, not a restatement: the full 9-step
          walkthrough already lives on its own page (/how-it-works), and repeating it
          here just made the homepage longer without adding anything a visitor
          couldn't get one click away. */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <EyebrowLabel>How it works</EyebrowLabel>
              <h2 className="text-3xl font-semibold tracking-tight text-ink">
                From archive to conversation.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                Connect your content, Ruach organizes it, add it to your site
                with a simple embed&mdash;and visitors start finding what your
                church has already shared.
              </p>
              <Link
                href="/how-it-works"
                className="mt-6 inline-block rounded-sm text-sm font-medium text-accent hover:text-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                See the full walkthrough &rarr;
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Fill content gaps with trusted outside voices */}
      <section className="border-t border-border bg-surface-muted/60 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn>
              <EyebrowLabel>Fill the gaps</EyebrowLabel>
              <h2 className="max-w-md text-3xl font-semibold tracking-tight text-ink">
                Don&rsquo;t have a message on it? Borrow one you trust.
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-ink-secondary">
                No church has taught on everything. Add sermons, teaching, and
                messages from other ministries and speakers you already trust,
                and Ruach will recommend the right one right alongside your own
                content&mdash;whenever it actually fits what someone&rsquo;s
                asking.
              </p>
              <ul className="mt-6 flex flex-col gap-2.5">
                {[
                  "Add any sermon, podcast, or teaching video by URL -- not just your own",
                  "Blends with your own library in every recommendation",
                  "Always links back and gives credit to the original source",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-ink-secondary"
                  >
                    <Check size={14} className="mt-0.5 shrink-0 text-accent" />{" "}
                    {item}
                  </li>
                ))}
              </ul>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-panel">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Recommended together
                </p>
                <div className="flex flex-col gap-2.5">
                  <div className="rounded-lg border border-border bg-surface-muted p-3.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-accent-dark">
                      Your church
                    </p>
                    <p className="text-sm font-medium text-ink">
                      Anxiety and the Peace of God
                    </p>
                    <p className="text-xs text-ink-muted">
                      Pastor Elena Ruiz &middot; Grace Fellowship
                    </p>
                  </div>
                  <div className="rounded-lg border border-dashed border-accent/40 bg-surface-warm p-3.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-accent-dark">
                      Added by you &middot; another ministry
                    </p>
                    <p className="text-sm font-medium text-ink">
                      When Worry Takes Over
                    </p>
                    <p className="text-xs text-ink-muted">
                      Pastor David Kim &middot; Redeemer Fellowship
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Trust and guardrails */}
      <section className="border-t border-border bg-surface-muted/60 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <FadeIn>
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <EyebrowLabel>Trust and guardrails</EyebrowLabel>
              <h2 className="text-3xl font-semibold tracking-tight text-ink">
                Grounded in your church. Not the open internet.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                Ruach searches the content approved by the church. It should not
                invent sermon recommendations, and it clearly links to original
                sources. The church controls what is indexed and can edit or
                remove resources at any time. Ruach supports ministry rather
                than replacing pastoral relationships.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-6 sm:grid-cols-2">
            <FadeIn>
              <div className="rounded-lg border border-border bg-surface p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
                  <Check size={16} className="text-success" /> Ruach does
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {RUACH_DOES.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-ink-secondary"
                    >
                      <Check
                        size={14}
                        className="mt-0.5 shrink-0 text-success"
                      />{" "}
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="rounded-lg border border-border bg-surface p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
                  <X size={16} className="text-danger" /> Ruach does not
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {RUACH_DOES_NOT.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-ink-secondary"
                    >
                      <X size={14} className="mt-0.5 shrink-0 text-danger" />{" "}
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Prayer Wall introduction */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn>
              <EyebrowLabel>Prayer Wall</EyebrowLabel>
              <h2 className="max-w-md text-3xl font-semibold tracking-tight text-ink">
                Make room for your church to pray together.
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-ink-secondary">
                The Prayer Wall allows people to submit requests, pray for one
                another, and share answered prayers, while giving church staff
                control over moderation and privacy.
              </p>
              <Link
                href="/product/prayer-wall"
                className={`${buttonClasses("secondary", "md")} mt-6`}
              >
                Explore the Prayer Wall
              </Link>
            </FadeIn>
            <FadeIn delay={0.15}>
              <PrayerWallPreview />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Feature highlights -- same reasoning as "How it works" above: a teaser and a
          link, not the full checklist /features already carries. */}
      <section className="border-t border-border bg-surface-muted/60 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <EyebrowLabel>Features</EyebrowLabel>
              <h2 className="text-3xl font-semibold tracking-tight text-ink">
                Everything ministry needs, none of the noise.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                Conversational search, a moderated Prayer Wall, branded widgets,
                and engagement analytics&mdash;all grounded in your
                church&rsquo;s own approved content.
              </p>
              <Link
                href="/features"
                className="mt-6 inline-block rounded-sm text-sm font-medium text-accent hover:text-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                See every feature &rarr;
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Built for the way churches already work */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <FadeIn>
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <EyebrowLabel>Built for how churches work</EyebrowLabel>
              <h2 className="text-3xl font-semibold tracking-tight text-ink">
                Bring together content from the platforms your church already
                uses.
              </h2>
              <p className="mt-4 text-sm text-ink-muted">
                Supported sources and sync options may vary by plan.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <LogoGrid />
          </FadeIn>
        </div>
      </section>

      {/* Audience segmentation */}
      <section className="border-t border-border bg-surface-muted/60 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <FadeIn>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <EyebrowLabel>Built to grow with you</EyebrowLabel>
              <h2 className="text-3xl font-semibold tracking-tight text-ink">
                Churches of every size.
              </h2>
            </div>
          </FadeIn>
          <div className="grid gap-6 sm:grid-cols-3">
            {AUDIENCES.map((audience, i) => (
              <FadeIn key={audience.name} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-lg border border-border bg-surface p-6">
                  <h3 className="mb-2 text-sm font-semibold text-ink">
                    {audience.name}
                  </h3>
                  <p className="mb-5 flex-1 text-sm leading-relaxed text-ink-secondary">
                    {audience.description}
                  </p>
                  <Link
                    href={audience.href}
                    className="rounded-sm text-sm font-medium text-accent hover:text-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  >
                    See plan details &rarr;
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* We're new */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <FadeIn>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <EyebrowLabel>New</EyebrowLabel>
              <h2 className="text-3xl font-semibold tracking-tight text-ink">
                We&rsquo;re new. Here&rsquo;s what we&rsquo;re building.
              </h2>
              <div className="mt-5 flex items-center justify-center gap-2 text-sm text-ink-muted">
                <span>Built with</span>
                <Image
                  src="/brand/victory-church-logo.png"
                  alt="Victory Church, Raleigh, NC"
                  width={759}
                  height={217}
                  className="h-6 w-auto"
                />
              </div>
            </div>
          </FadeIn>
          <div className="grid gap-5 sm:grid-cols-3">
            {BUILDING_POINTS.map((point, i) => (
              <FadeIn key={point.title} delay={i * 0.08}>
                <FeatureCard {...point} />
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.24}>
            <p className="mt-8 text-center">
              <Link
                href="/release-notes"
                className="rounded-sm text-sm font-medium text-accent hover:text-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                See everything we&rsquo;ve shipped &rarr;
              </Link>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="border-t border-border bg-surface-muted/60 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <FadeIn>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <EyebrowLabel>Pricing</EyebrowLabel>
              <h2 className="text-3xl font-semibold tracking-tight text-ink">
                Built to remain accessible for churches of every size.
              </h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <PricingGrid
              plans={MARKETING_PLANS.filter((p) => !p.isCustom)}
              compact
            />
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="mt-10 text-center">
              <Link
                href="/pricing"
                className={buttonClasses("secondary", "md")}
              >
                Compare all plans
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden bg-sidebar py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(600px circle at 50% 0%, rgba(184,123,56,0.25), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <FadeIn>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Your church&rsquo;s content should keep serving people long after
              it is published.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70">
              Ruach helps people discover the sermons, ministries, resources,
              and prayer support they need&mdash;through an experience that
              feels like part of your church.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup" className={buttonClasses("primary", "lg")}>
                Start free trial
              </Link>
              <Link
                href="/demo"
                className="inline-flex h-[3.25rem] items-center justify-center gap-2 rounded-sm border border-white/20 px-7 text-base font-medium text-white transition-colors duration-180 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
              >
                Request a Demo
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/60">
              Free for {billingService.TRIAL_PERIOD_DAYS} days. No credit card
              required.
            </p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
