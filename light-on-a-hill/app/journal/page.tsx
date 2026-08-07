import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { JOURNAL } from "@/content/journal";
import { JournalCard } from "@/components/JournalCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Reveal } from "@/components/Reveal";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = buildMetadata({
  title: "The Journal | Light on a Hill Photography",
  description:
    "Wedding stories, planning guides, location roundups, and honest photography advice from Light on a Hill Photography in North Carolina.",
  path: "/journal",
  image: "couplesMountains",
});

export default function JournalPage() {
  const [lead, ...rest] = JOURNAL;
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "The Journal", path: "/journal" },
        ]}
      />

      <section className="px-5 pb-16 pt-12 sm:px-8">
        <div className="mx-auto max-w-editorial">
          <Reveal>
            <p className="eyebrow text-champagne">The Journal</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 max-w-3xl text-balance font-serif text-display-lg text-ink">
              Stories, guides, and the occasional planning secret.
            </h1>
          </Reveal>
        </div>
      </section>

      {/* Lead feature */}
      <section className="px-5 sm:px-8">
        <div className="mx-auto max-w-editorial">
          <Reveal>
            <JournalCard post={lead} sizes="100vw" />
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-editorial gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {rest.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.06}>
              <JournalCard post={post} />
            </Reveal>
          ))}
        </div>
      </section>

      <CTASection headline={["Planning something", "worth remembering?"]} primaryLabel="Start your inquiry" />
    </>
  );
}
