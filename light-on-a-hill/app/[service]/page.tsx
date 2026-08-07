import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { SERVICES, getService } from "@/content/services";
import { JOURNAL_MAP } from "@/content/journal";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GalleryGrid } from "@/components/GalleryGrid";
import { FAQAccordion } from "@/components/FAQAccordion";
import { InvestmentBlock } from "@/components/InvestmentBlock";
import { TestimonialFeature } from "@/components/home/TestimonialFeature";
import { JournalCard } from "@/components/JournalCard";
import { CTASection } from "@/components/CTASection";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { TrackOnView } from "@/components/TrackOnView";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ service: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const { service } = await params;
  const svc = getService(service);
  if (!svc) return {};
  return buildMetadata({
    title: svc.seo.title,
    description: svc.seo.description,
    path: `/${svc.slug}`,
    image: svc.heroImage,
  });
}

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const svc = getService(service);
  if (!svc) notFound();

  const related = svc.relatedServices.map(getService).filter(Boolean) as NonNullable<
    ReturnType<typeof getService>
  >[];
  const journal = svc.relatedJournal.map((s) => JOURNAL_MAP[s]).filter(Boolean);

  return (
    <>
      <JsonLd data={faqJsonLd(svc.faqs)} />
      <PageHero label={svc.category} headline={svc.heroHeadline} image={svc.heroImage} />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: svc.category, path: `/${svc.slug}` },
        ]}
      />

      {/* Positioning */}
      <section className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-editorial">
          <Reveal>
            <p className="max-w-3xl text-balance font-serif text-display-sm text-ink">{svc.positioning}</p>
          </Reveal>
        </div>
      </section>

      {/* Featured portfolio */}
      <section className="bg-surface px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-editorial">
          <p className="eyebrow mb-10 text-champagne">Selected work</p>
          <GalleryGrid images={svc.gallery} />
        </div>
      </section>

      {/* Why clients choose */}
      <section className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-editorial">
          <p className="eyebrow mb-12 text-champagne">Why couples & families choose Light on a Hill</p>
          <div className="grid gap-x-12 gap-y-14 sm:grid-cols-3">
            {svc.reasons.map((r, i) => (
              <Reveal key={r.title} delay={i * 0.08}>
                <span className="font-sans text-[0.7rem] tabular-nums tracking-label text-champagne">
                  0{i + 1}
                </span>
                <h3 className="mt-4 font-serif text-2xl text-ink">{r.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-charcoal/75">{r.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What's included + add-ons */}
      <section className="bg-ink px-5 py-24 text-paper sm:px-8 sm:py-32">
        <div className="mx-auto grid max-w-editorial gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-8 text-champagne">What&rsquo;s included</p>
            <ul className="space-y-4">
              {svc.includes.map((inc) => (
                <li key={inc} className="flex gap-4 border-b border-paper/10 pb-4 text-[0.98rem] text-paper/85">
                  <span className="mt-1 text-champagne" aria-hidden>
                    &mdash;
                  </span>
                  {inc}
                </li>
              ))}
            </ul>
          </div>
          {svc.addOns && (
            <div>
              <p className="eyebrow mb-8 text-champagne">Thoughtful add-ons</p>
              <ul className="space-y-4">
                {svc.addOns.map((a) => (
                  <li key={a} className="flex gap-4 border-b border-paper/10 pb-4 text-[0.98rem] text-paper/70">
                    <span className="mt-1 text-champagne" aria-hidden>
                      +
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Investment */}
      <section className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-editorial">
          <p className="eyebrow mb-10 text-champagne">The investment</p>
          <TrackOnView event="investment_view" payload={{ service: svc.slug }}>
            <InvestmentBlock investment={svc.investment} category={svc.category} />
          </TrackOnView>
        </div>
      </section>

      {/* Social proof */}
      <TestimonialFeature />

      {/* FAQ */}
      <section className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-editorial">
          <p className="eyebrow mb-10 text-champagne">Questions, answered</p>
          <FAQAccordion faqs={svc.faqs} />
        </div>
      </section>

      {/* Related journal + services (hub-and-spoke) */}
      {journal.length > 0 && (
        <section className="bg-surface px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-editorial">
            <p className="eyebrow mb-12 text-champagne">From the journal</p>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              {journal.map((post) => (
                <JournalCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto flex max-w-editorial flex-wrap items-center gap-x-8 gap-y-3">
            <span className="eyebrow text-mist">Also explore</span>
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/${r.slug}`}
                className="border-b border-ink/30 pb-0.5 font-serif text-2xl text-ink transition-colors hover:text-charcoal"
              >
                {r.navLabel}
              </Link>
            ))}
          </div>
        </section>
      )}

      <CTASection
        headline={["Let's talk about", "your day."]}
        primaryLabel="Check availability"
        secondaryLabel="View investment"
      />
    </>
  );
}
