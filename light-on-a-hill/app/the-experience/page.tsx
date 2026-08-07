import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProcessTimeline } from "@/components/home/ProcessTimeline";
import { Reveal } from "@/components/Reveal";
import { CTASection } from "@/components/CTASection";

export const metadata: Metadata = buildMetadata({
  title: "The Experience | Light on a Hill Photography",
  description:
    "What it's actually like to work with Light on a Hill Photography — from the first conversation to a beautiful private gallery. Calm, considered, and genuinely enjoyable.",
  path: "/the-experience",
  image: "weddingDetails",
});

export default function ExperiencePage() {
  return (
    <>
      <PageHero
        label="The Experience"
        headline={["Considered from the", "first hello onward."]}
        image="weddingDetails"
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "The Experience", path: "/the-experience" },
        ]}
      />

      <section className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-editorial">
          <Reveal>
            <p className="max-w-3xl text-balance font-serif text-display-sm text-ink">
              Great photographs are the outcome. A calm, well-planned day is how you get there.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-xl text-[0.98rem] leading-relaxed text-charcoal/80">
              Everything below is designed to remove friction &mdash; so that by the time the camera comes
              out, the only thing left to do is enjoy the day and let it be documented.
            </p>
          </Reveal>
        </div>
      </section>

      <ProcessTimeline />

      <section className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto grid max-w-editorial gap-x-12 gap-y-14 sm:grid-cols-3">
          {[
            ["A real conversation first", "Before anything is booked, we talk. It matters that we're a fit — for both of us."],
            ["Planning that does the heavy lifting", "Timelines, locations, light, and wardrobe are sorted in advance, so the day itself feels easy."],
            ["A gallery worth returning to", "Consistent editing and a private online gallery your family can find, download, and print from for years."],
          ].map(([title, body], i) => (
            <Reveal key={title} delay={i * 0.08}>
              <span className="font-sans text-[0.7rem] tabular-nums tracking-label text-champagne">0{i + 1}</span>
              <h3 className="mt-4 font-serif text-2xl text-ink">{title}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-charcoal/75">{body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <CTASection headline={["Ready when", "you are."]} primaryLabel="Start your inquiry" />
    </>
  );
}
