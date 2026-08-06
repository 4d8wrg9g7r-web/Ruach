import type { Metadata } from "next";
import Link from "next/link";
import { Wind } from "lucide-react";
import { EyebrowLabel } from "../../../components/marketing/EyebrowLabel";
import { FadeIn } from "../../../components/marketing/FadeIn";
import { buttonClasses } from "../../../components/ui/Button";
import { pageMetadata } from "../../../lib/marketing/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Why Ruach | Ruach",
  description: "Technology should support ministry, not compete with it. Why Ruach exists, and what the name means.",
  path: "/why-ruach",
});

const BELIEFS = [
  "Churches have invested years creating sermons and ministry resources.",
  "Websites often organize content around navigation rather than real human questions.",
  "People often arrive with needs rather than knowing which page to open.",
  "Ruach creates a clearer bridge between those needs and the church's existing ministry.",
  "AI should be constrained, transparent, and grounded in what the church has actually approved.",
  "The product is built specifically for church contexts, not adapted from a general-purpose chatbot.",
  "Prayer should remain connected to real people and real ministry teams.",
];

export default function WhyRuachPage() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-5 pb-10 pt-16 text-center">
        <FadeIn>
          <EyebrowLabel>Why Ruach</EyebrowLabel>
          <h1 className="text-4xl font-semibold tracking-tight text-ink">
            Technology should support ministry, not compete with it.
          </h1>
        </FadeIn>
      </section>

      <section className="border-t border-border bg-surface-muted/60 py-16">
        <div className="mx-auto max-w-2xl px-5">
          <FadeIn>
            <ul className="flex flex-col gap-4">
              {BELIEFS.map((belief) => (
                <li key={belief} className="rounded-lg border border-border bg-surface px-5 py-4 text-sm leading-relaxed text-ink-secondary">
                  {belief}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-2xl px-5">
          <FadeIn>
            <div className="mb-10 text-center">
              <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface-warm text-accent-dark">
                <Wind size={24} />
              </span>
              <h2 className="text-2xl font-semibold tracking-tight text-ink">What &ldquo;Ruach&rdquo; means</h2>
            </div>

            <div className="flex flex-col gap-5 text-sm leading-relaxed text-ink-secondary">
              <p>
                Ruach is a Hebrew word meaning breath, wind, or spirit. The name reflects our purpose: helping the
                ministry your church has already created continue moving, reaching people, and pointing them toward
                meaningful connection. Ruach does not replace pastors or speak for the church. It simply helps
                people discover the sermons, resources, ministries, and prayer support your church has already
                prepared.
              </p>

              <div className="rounded-lg border border-border bg-surface p-5">
                <h3 className="mb-1.5 text-sm font-semibold text-ink">Breath: bringing existing content back to life</h3>
                <p>
                  Churches often have years of sermons, articles, podcasts, ministry pages, and discipleship
                  resources sitting in an archive. Ruach breathes new usefulness into the ministry resources your
                  church has already created&mdash;it does not create a new message, it helps the message the
                  church has already shared continue reaching people long after it was first published.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface p-5">
                <h3 className="mb-1.5 text-sm font-semibold text-ink">Wind: moving people toward the right resource</h3>
                <p>
                  Wind cannot always be seen directly, but its movement can be recognized by what it affects. A
                  visitor arrives with a need or question, and Ruach helps guide them toward something
                  meaningful&mdash;a sermon, a ministry, an event, a discipleship resource, a prayer request, a next
                  step.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface p-5">
                <h3 className="mb-1.5 text-sm font-semibold text-ink">Spirit: pointing beyond technology, handled carefully</h3>
                <p>
                  Ruach should never imply it speaks for the Holy Spirit, possesses spiritual authority, or replaces
                  discernment, Scripture, pastors, or personal ministry. Ruach is a tool serving the
                  church&mdash;not a spiritual voice speaking on its behalf.
                </p>
              </div>

              <p className="text-center text-base font-medium text-ink">
                Your church creates the ministry. Ruach helps it move.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-border bg-sidebar py-16">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <FadeIn>
            <h2 className="text-2xl font-semibold tracking-tight text-white">See how Ruach fits your church.</h2>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/how-it-works" className={buttonClasses("primary", "md")}>
                See how it works
              </Link>
              <Link
                href="/demo"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-white/20 px-5 text-sm font-medium text-white transition-colors duration-180 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
              >
                Request a Demo
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
