import type { Metadata } from "next";
import { Container, Overline, BrassRule, ArrowLink } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Commission an instrument or write to the workshop. Reach James Alexeas in Clayton, North Carolina — the start of a relationship, not a checkout.",
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE.name,
  description:
    "Handcrafted acoustic guitars, mandolins, and stringed instruments, built individually by luthier James Alexeas.",
  email: SITE.email,
  url: SITE.url,
  founder: { "@type": "Person", name: SITE.maker },
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.location.street,
    addressLocality: SITE.location.city,
    addressRegion: SITE.location.regionCode,
    postalCode: SITE.location.postalCode,
    addressCountry: "US",
  },
  sameAs: [SITE.social.instagram, SITE.social.facebook],
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <section className="bg-warmwhite pb-8 pt-24 sm:pt-32">
        <Container>
          <div className="reveal max-w-editorial">
            <Overline>Contact & Commission</Overline>
            <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-[1.05] text-espresso text-balance sm:text-6xl lg:text-7xl">
              This is the start of a relationship, not a checkout.
            </h1>
            <p className="mt-8 max-w-prose2 text-xl leading-relaxed text-ink-soft text-pretty">
              Commissioning an Alexeas begins with a conversation — about how you
              play, what you hear, and the instrument you have been imagining.
              There is no cart and no rush. Write, and we&rsquo;ll begin.
            </p>
          </div>
          <BrassRule className="mt-16" />
        </Container>
      </section>

      <section className="bg-plaster py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
            <div className="reveal">
              <Overline>Write to the Workshop</Overline>
              <a
                href={`mailto:${SITE.email}`}
                className="mt-4 block font-serif text-3xl text-espresso transition-colors hover:text-walnut sm:text-4xl"
              >
                {SITE.email}
              </a>
              <p className="mt-4 text-base leading-relaxed text-ink-soft text-pretty">
                Every message is read personally by {SITE.maker}.
              </p>
            </div>

            <div className="reveal">
              <Overline>The Workshop</Overline>
              <p className="mt-4 font-serif text-3xl text-espresso sm:text-4xl">
                {SITE.location.city}, {SITE.location.region}
              </p>
              <p className="mt-4 text-base leading-relaxed text-ink-soft text-pretty">
                Instruments built and repaired by hand in the American South, in
                a small workshop with Greek roots in its name.
              </p>
            </div>

            <div className="reveal">
              <Overline>Follow Along</Overline>
              <div className="mt-5 flex flex-col gap-4">
                <ArrowLink href={SITE.social.instagram}>Instagram</ArrowLink>
                <ArrowLink href={SITE.social.facebook}>Facebook</ArrowLink>
              </div>
              <p className="mt-6 text-base leading-relaxed text-ink-soft text-pretty">
                Work in progress and finished instruments, shared as they come
                off the bench.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-warmwhite py-24 sm:py-32">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="reveal mb-12">
              <Overline>Begin Here</Overline>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-espresso sm:text-5xl">
                Tell us what you have in mind.
              </h2>
              <p className="mt-6 max-w-prose2 text-lg leading-relaxed text-ink-soft text-pretty">
                A few details are enough to start. Whether you know exactly what
                you want or only that you want to begin, this is the right place.
              </p>
            </div>
            <div className="reveal">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-espresso-wash py-24 text-ivory sm:py-32">
        <Container>
          <div className="reveal mx-auto max-w-3xl text-center">
            <blockquote className="font-serif text-3xl leading-snug text-parchment text-balance sm:text-4xl lg:text-5xl">
              “{SITE.tagline}”
            </blockquote>
            <p className="mt-8 text-sm uppercase tracking-wider2 text-parchment/60">
              {SITE.name} · {SITE.location.city}, {SITE.location.regionCode}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
