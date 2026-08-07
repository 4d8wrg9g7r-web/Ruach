import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { SERVICES } from "@/content/services";
import { SITE } from "@/content/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Reveal } from "@/components/Reveal";
import { CTASection } from "@/components/CTASection";
import { FocusImage } from "@/components/FocusImage";

export const metadata: Metadata = buildMetadata({
  title: "Investment | Light on a Hill Photography",
  description:
    "Wedding collections and portrait sessions with Light on a Hill Photography. Transparent starting investment, every edited image included. Serving Raleigh and beyond.",
  path: "/investment",
  image: "weddingDetails",
});

const wedding = SERVICES.find((s) => s.slug === "weddings")!;

export default function InvestmentPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Investment", path: "/investment" },
        ]}
      />

      <section className="px-5 pb-20 pt-14 sm:px-8">
        <div className="mx-auto max-w-editorial">
          <Reveal>
            <p className="eyebrow text-champagne">Investment</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 max-w-3xl text-balance font-serif text-display-lg text-ink">
              Clear from the start, so you can decide with confidence.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-xl text-[0.98rem] leading-relaxed text-charcoal/80">
              Every collection includes the full, hand-finished gallery &mdash; no locked images, no
              pay-to-unlock. Final pricing is confirmed after we talk through what you&rsquo;re planning.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Weddings */}
      <section className="bg-surface px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-editorial gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div className="crop-frame order-2 lg:order-none">
            <FocusImage image="weddingAisle" className="aspect-[4/5]" sizes="(max-width:1024px) 100vw, 50vw" />
          </div>
          <div className="order-1 lg:order-none">
            <p className="eyebrow text-champagne">Weddings</p>
            <p className="mt-8 font-sans text-[0.72rem] uppercase tracking-label text-mist">
              {wedding.investment.startingLabel}
            </p>
            <p className="mt-2 font-serif text-6xl text-ink sm:text-7xl">{wedding.investment.startingValue}</p>
            <p className="mt-6 text-sm text-charcoal/75">
              <span className="font-sans text-[0.72rem] uppercase tracking-label text-mist">
                {wedding.investment.typicalLabel}
              </span>
              <br />
              <span className="font-serif text-3xl text-ink">{wedding.investment.typicalValue}</span>
            </p>
            <ul className="mt-8 space-y-3">
              {wedding.includes.slice(0, 4).map((inc) => (
                <li key={inc} className="flex gap-3 text-[0.95rem] text-charcoal/80">
                  <span className="mt-1 text-champagne" aria-hidden>
                    &mdash;
                  </span>
                  {inc}
                </li>
              ))}
            </ul>
            <Link
              href="/weddings"
              className="mt-8 inline-flex items-center gap-2 border-b border-ink/30 pb-1 font-sans text-[0.72rem] uppercase tracking-label text-ink hover:border-ink"
            >
              Explore wedding photography &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Portraits */}
      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-editorial">
          <p className="eyebrow text-champagne">Portraits &amp; Sessions</p>
          <div className="mt-8 grid gap-10 border-y border-ink/10 py-12 sm:grid-cols-[auto_1fr] sm:gap-20">
            <div>
              <p className="font-sans text-[0.72rem] uppercase tracking-label text-mist">Sessions beginning at</p>
              <p className="mt-2 font-serif text-6xl text-ink sm:text-7xl">$200</p>
              <p className="mt-1 font-sans text-[0.72rem] uppercase tracking-label text-mist">per hour</p>
            </div>
            <div className="max-w-xl">
              <p className="text-[0.98rem] leading-relaxed text-charcoal/80">
                Couples, families, seniors, maternity, and personal branding sessions are{" "}
                <span className="text-ink">${SITE.sessionRate.hourly} per hour</span> with a{" "}
                {SITE.sessionRate.minimumHours}-hour minimum. {SITE.sessionRate.delivery}
              </p>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {["couples", "families", "seniors", "maternity", "branding"].map((s) => (
                  <Link
                    key={s}
                    href={`/${s}`}
                    className="border-b border-ink/30 pb-0.5 font-serif text-xl capitalize text-ink hover:text-charcoal"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        headline={["Have a date", "in mind?"]}
        primaryLabel="Check availability"
        secondaryLabel="Read the FAQ"
        secondaryHref="/weddings"
      />
    </>
  );
}
