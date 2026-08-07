import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { LOCATIONS, LOCATION_MAP } from "@/content/locations";
import { getService } from "@/content/services";
import { JOURNAL_MAP } from "@/content/journal";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GalleryGrid } from "@/components/GalleryGrid";
import { FAQAccordion } from "@/components/FAQAccordion";
import { JournalCard } from "@/components/JournalCard";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { CTASection } from "@/components/CTASection";
import { TrackOnView } from "@/components/TrackOnView";

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const loc = LOCATION_MAP[slug];
  if (!loc) return {};
  return buildMetadata({
    title: loc.seo.title,
    description: loc.seo.description,
    path: `/locations/${loc.slug}`,
    image: loc.heroImage,
  });
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loc = LOCATION_MAP[slug];
  if (!loc) notFound();

  const services = loc.relatedServices.map(getService).filter(Boolean);
  const journal = loc.relatedJournal.map((s) => JOURNAL_MAP[s]).filter(Boolean);

  return (
    <>
      <JsonLd data={faqJsonLd(loc.faqs)} />
      <PageHero label={`${loc.city} · Photography`} headline={loc.headline} image={loc.heroImage} intro={loc.intro} />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Locations", path: "/locations" },
          { name: loc.city, path: `/locations/${loc.slug}` },
        ]}
      />

      {/* Local knowledge */}
      <TrackOnView event="location_page_conversion" payload={{ location: loc.slug }}>
        <section className="px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto grid max-w-editorial gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
            <Reveal>
              <p className="max-w-2xl text-balance font-serif text-display-sm text-ink">{loc.local}</p>
            </Reveal>
            <Reveal delay={0.1} className="self-center">
              <p className="eyebrow mb-5 text-champagne">Favourite spots</p>
              <ul className="space-y-3">
                {loc.venues.map((v) => (
                  <li key={v} className="flex gap-3 border-b border-ink/10 pb-3 text-[0.95rem] text-charcoal/80">
                    <span className="mt-1 text-champagne" aria-hidden>
                      &mdash;
                    </span>
                    {v}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      </TrackOnView>

      {/* Portfolio */}
      <section className="bg-surface px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-editorial">
          <p className="eyebrow mb-10 text-champagne">Work from around {loc.city}</p>
          <GalleryGrid images={loc.gallery} />
        </div>
      </section>

      {/* Related services */}
      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto flex max-w-editorial flex-wrap items-center gap-x-8 gap-y-3">
          <span className="eyebrow text-mist">Sessions in {loc.city}</span>
          {services.map(
            (s) =>
              s && (
                <Link
                  key={s.slug}
                  href={`/${s.slug}`}
                  className="border-b border-ink/30 pb-0.5 font-serif text-2xl text-ink hover:text-charcoal"
                >
                  {s.navLabel}
                </Link>
              ),
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-editorial">
          <p className="eyebrow mb-10 text-champagne">Good to know</p>
          <FAQAccordion faqs={loc.faqs} />
        </div>
      </section>

      {journal.length > 0 && (
        <section className="bg-surface px-5 py-20 sm:px-8 sm:py-28">
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

      <CTASection
        headline={[`Photographing in`, `${loc.city} soon?`]}
        primaryLabel="Check availability"
      />
    </>
  );
}
