import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JOURNAL, JOURNAL_MAP } from "@/content/journal";
import { getService } from "@/content/services";
import { LOCATION_MAP } from "@/content/locations";
import { IMAGES, src } from "@/content/images";
import { buildMetadata, articleJsonLd } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { JournalCard } from "@/components/JournalCard";
import { CTASection } from "@/components/CTASection";
import { TrackedLink } from "@/components/TrackedLink";

export function generateStaticParams() {
  return JOURNAL.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = JOURNAL_MAP[slug];
  if (!post) return {};
  return buildMetadata({
    title: `${post.title} | The Journal`,
    description: post.excerpt,
    path: `/journal/${post.slug}`,
    image: post.image,
  });
}

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = JOURNAL_MAP[slug];
  if (!post) notFound();

  const services = post.relatedServices.map(getService).filter(Boolean);
  const locations = post.relatedLocations.map((s) => LOCATION_MAP[s]).filter(Boolean);
  const more = JOURNAL.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);
  const fallbackMore = more.length ? more : JOURNAL.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.excerpt,
          image: src(IMAGES[post.image], 1200),
          date: post.date,
          path: `/journal/${post.slug}`,
        })}
      />
      <PageHero label={post.category} headline={[post.title, ""]} image={post.image} />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "The Journal", path: "/journal" },
          { name: post.title, path: `/journal/${post.slug}` },
        ]}
      />

      <article className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-2xl">
          <p className="font-sans text-[0.66rem] uppercase tracking-label text-mist">{post.readingTime}</p>
          <p className="mt-8 font-serif text-2xl leading-snug text-ink">{post.excerpt}</p>
          <div className="mt-8 space-y-6 text-[1.02rem] leading-[1.8] text-charcoal/85">
            {post.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* Hub-and-spoke internal links (CTA block) */}
          {(services.length > 0 || locations.length > 0) && (
            <div className="mt-14 border-y border-ink/10 py-10">
              <p className="eyebrow mb-6 text-champagne">Keep exploring</p>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {services.map(
                  (s) =>
                    s && (
                      <TrackedLink
                        key={s.slug}
                        href={`/${s.slug}`}
                        event="journal_cta_click"
                        payload={{ to: s.slug }}
                        className="border-b border-ink/30 pb-0.5 font-serif text-xl text-ink hover:text-charcoal"
                      >
                        {s.navLabel} Photography
                      </TrackedLink>
                    ),
                )}
                {locations.map((l) => (
                  <TrackedLink
                    key={l.slug}
                    href={`/locations/${l.slug}`}
                    event="journal_cta_click"
                    payload={{ to: l.slug }}
                    className="border-b border-ink/30 pb-0.5 font-serif text-xl text-ink hover:text-charcoal"
                  >
                    {l.city}
                  </TrackedLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <section className="bg-surface px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-editorial">
          <p className="eyebrow mb-12 text-champagne">More from the journal</p>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {fallbackMore.map((p) => (
              <JournalCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </section>

      <CTASection headline={["Let's plan", "yours."]} primaryLabel="Start your inquiry" />
    </>
  );
}
