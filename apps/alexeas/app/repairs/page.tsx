import type { Metadata } from "next";
import { Container, Overline, BrassRule } from "@/components/ui";
import { RepairForm } from "@/components/repair-form";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Repairs",
  description:
    "Setups, fretwork, neck resets, bridges, nuts, saddles, structural repair, and restoration of guitars, violins, and other stringed instruments.",
};

const SERVICES: { title: string; body: string }[] = [
  {
    title: "Setups",
    body: "Action, intonation, and playability tuned to your hands and your strings, so the instrument answers the way it should.",
  },
  {
    title: "Fretwork",
    body: "Leveling, crowning, and polishing; partial and full refrets. Clean, true notes the length of the board.",
  },
  {
    title: "Neck Resets",
    body: "Restoring the neck angle on instruments that have shifted with time and tension, so string height and tone return to true.",
  },
  {
    title: "Bridges",
    body: "Reglued, reshaped, or rebuilt bridges — the anchor that carries the string energy into the top.",
  },
  {
    title: "Nuts & Saddles",
    body: "Cut, shaped, and fitted from bone or other materials for even spacing, correct height, and cleaner tone.",
  },
  {
    title: "Structural Repair",
    body: "Cracks, loose braces, and failing seams closed and stabilized so the instrument can carry tension again.",
  },
  {
    title: "Restoration",
    body: "Careful, unhurried restoration of guitars, violins, and other stringed instruments — respecting what makes each one worth keeping.",
  },
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Stringed instrument repair and restoration",
  provider: {
    "@type": "LocalBusiness",
    name: SITE.name,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.location.city,
      addressRegion: SITE.location.regionCode,
      addressCountry: "US",
    },
  },
  areaServed: `${SITE.location.city}, ${SITE.location.region}`,
  description:
    "Setups, fretwork, neck resets, bridges, nuts, saddles, structural repair, and restoration of guitars, violins, and other stringed instruments.",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Repair services",
    itemListElement: SERVICES.map((s) => ({
      "@type": "OfferCatalog",
      name: s.title,
      description: s.body,
    })),
  },
};

export default function RepairsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <section className="bg-warmwhite pb-8 pt-24 sm:pt-32">
        <Container>
          <div className="reveal max-w-editorial">
            <Overline>Repairs & Restoration</Overline>
            <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-[1.05] text-espresso text-balance sm:text-6xl lg:text-7xl">
              Care for the instrument you already love.
            </h1>
            <p className="mt-8 max-w-prose2 text-xl leading-relaxed text-ink-soft text-pretty">
              An instrument that has been played for years is worth more than its
              parts — it holds a sound and a history. The same hands that build
              new guitars and mandolins keep old ones alive, from a simple setup
              to a full structural restoration.
            </p>
          </div>
          <BrassRule className="mt-16" />
        </Container>
      </section>

      <section className="bg-plaster py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="reveal">
              <Overline>The Work</Overline>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-espresso sm:text-5xl">
                What we do at the bench.
              </h2>
              <p className="mt-6 max-w-prose2 text-lg leading-relaxed text-ink-soft text-pretty">
                Guitars, mandolins, violins, and other stringed instruments are
                all welcome. If you are unsure whether something can be saved,
                ask — an honest assessment costs nothing.
              </p>
            </div>

            <div className="reveal">
              <dl>
                {SERVICES.map((service, i) => (
                  <div key={service.title}>
                    {i > 0 && <BrassRule className="opacity-50" />}
                    <div className="grid gap-2 py-6 sm:grid-cols-[0.5fr_1fr] sm:gap-8">
                      <dt className="font-serif text-2xl text-espresso">
                        {service.title}
                      </dt>
                      <dd className="text-base leading-relaxed text-ink-soft text-pretty">
                        {service.body}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-espresso-wash py-24 text-ivory sm:py-32">
        <Container>
          <div className="reveal mx-auto max-w-3xl text-center">
            <Overline className="text-brassLight">A note on old instruments</Overline>
            <blockquote className="mt-8 font-serif text-3xl leading-snug text-parchment text-balance sm:text-4xl">
              “The goal is never to make it new. It is to let it keep being
              itself, for another lifetime of playing.”
            </blockquote>
          </div>
        </Container>
      </section>

      <section className="bg-warmwhite py-24 sm:py-32">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="reveal mb-12">
              <Overline>Start an Inquiry</Overline>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-espresso sm:text-5xl">
                Tell us about your instrument.
              </h2>
              <p className="mt-6 max-w-prose2 text-lg leading-relaxed text-ink-soft text-pretty">
                Share what it is and what it needs. Photographs help. We&rsquo;ll
                write back with an assessment and next steps.
              </p>
            </div>
            <div className="reveal">
              <RepairForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
