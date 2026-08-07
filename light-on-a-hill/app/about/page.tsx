import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Reveal } from "@/components/Reveal";
import { FocusImage } from "@/components/FocusImage";
import { CTASection } from "@/components/CTASection";
import { SITE } from "@/content/site";

export const metadata: Metadata = buildMetadata({
  title: "About | Light on a Hill Photography",
  description:
    "The person behind Light on a Hill Photography — a North Carolina wedding and portrait photographer who works quietly and lets the real moments happen.",
  path: "/about",
  image: "photographer",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        label="The person behind the camera"
        headline={["Hi — I'm the one", "you'll be working with."]}
        image="photographer"
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
      />

      <section className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto grid max-w-editorial gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="max-w-2xl text-balance font-serif text-display-sm text-ink">
                You should feel comfortable with the person documenting the moments that matter.
              </p>
            </Reveal>
            <div className="mt-10 max-w-xl space-y-6 text-[0.98rem] leading-relaxed text-charcoal/80">
              <Reveal delay={0.05}>
                <p>
                  I came to photography the long way &mdash; through years of watching how people actually
                  are with each other, not how they arrange themselves for a camera. That&rsquo;s still the
                  work: reading a room, staying patient, and being ready for the half-second when everyone
                  forgets I&rsquo;m there.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <p>
                  I photograph a deliberately limited number of weddings and sessions each year. It keeps me
                  present on the day and unhurried in the edit, so the gallery you receive feels considered
                  from the first frame to the last.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <p>
                  Based in {SITE.primaryCity}, I work across {SITE.region} and travel gladly for the days
                  worth travelling for. If that sounds like the way you&rsquo;d want your story told, I&rsquo;d
                  love to hear about it.
                </p>
              </Reveal>
            </div>
          </div>

          <Reveal className="self-start">
            <div className="crop-frame">
              <FocusImage image="portraitWoman" className="aspect-[4/5]" sizes="(max-width:1024px) 100vw, 33vw" />
            </div>
            <dl className="mt-8 space-y-4 border-t border-ink/10 pt-8">
              {[
                ["Based in", `${SITE.primaryCity}, NC`],
                ["Works across", "The Triangle, the mountains & beyond"],
                ["Photographs", "Weddings, couples, families, seniors"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 text-sm">
                  <dt className="font-sans text-[0.66rem] uppercase tracking-label text-mist">{k}</dt>
                  <dd className="text-right text-charcoal">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <CTASection
        headline={["Let's see if", "we're a fit."]}
        primaryLabel="Start your inquiry"
        secondaryLabel="See the experience"
        secondaryHref="/the-experience"
      />
    </>
  );
}
