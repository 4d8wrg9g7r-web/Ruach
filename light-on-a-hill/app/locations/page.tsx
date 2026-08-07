import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { LOCATIONS } from "@/content/locations";
import { StudioImage } from "@/components/StudioImage";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Reveal } from "@/components/Reveal";
import { CTASection } from "@/components/CTASection";
import { SITE } from "@/content/site";

export const metadata: Metadata = buildMetadata({
  title: "Service Areas | Light on a Hill Photography",
  description:
    "Light on a Hill Photography serves Raleigh, Durham, Cary, Chapel Hill, the Blue Ridge Mountains, and destinations beyond.",
  path: "/locations",
  image: "raleigh",
});

export default function LocationsPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Locations", path: "/locations" },
        ]}
      />

      <section className="px-5 pb-16 pt-12 sm:px-8">
        <div className="mx-auto max-w-editorial">
          <Reveal>
            <p className="eyebrow text-champagne">Service Areas</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 max-w-3xl text-balance font-serif text-display-lg text-ink">
              {SITE.region}, and wherever your story takes you.
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-editorial gap-8 sm:grid-cols-2 lg:gap-10">
          {LOCATIONS.map((loc, i) => (
            <Reveal key={loc.slug} delay={(i % 2) * 0.08}>
              <Link href={`/locations/${loc.slug}`} data-cursor="explore" className="group block">
                <div className="crop-frame relative aspect-[16/10] overflow-hidden">
                  <StudioImage
                    image={loc.heroImage}
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="transition-transform duration-[1400ms] ease-aperture group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
                  <h2 className="absolute bottom-5 left-5 font-serif text-3xl text-paper">{loc.city}</h2>
                </div>
                <p className="mt-4 max-w-md text-[0.92rem] leading-relaxed text-charcoal/70">{loc.intro}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <CTASection headline={["Not sure if you're", "in the area?"]} primaryLabel="Just ask" />
    </>
  );
}
