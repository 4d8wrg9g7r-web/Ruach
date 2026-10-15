import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MODELS, getModel } from "@/lib/data/models";
import { defaultConfig } from "@/lib/config/engine";
import { getWood } from "@/lib/data/woods";
import { COMPLETED } from "@/lib/data/content";
import { InstrumentPreview } from "@/components/visuals/instrument-preview";
import { Container, Overline, BrassRule, ArrowLink, ButtonLink } from "@/components/ui";
import { CraftDetail } from "@/components/visuals/details";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return MODELS.map((m) => ({ model: m.slug }));
}

interface Props {
  params: Promise<{ model: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { model: slug } = await params;
  const model = getModel(slug);
  if (!model) return {};
  return {
    title: model.name,
    description: `${model.name} — ${model.tagline} ${model.summary}`,
    openGraph: { title: `${model.name} · ${SITE.name}`, description: model.summary },
  };
}

export default async function ModelPage({ params }: Props) {
  const { model: slug } = await params;
  const model = getModel(slug);
  if (!model) notFound();

  const preview = defaultConfig(model.slug);
  const recTop = getWood(model.recommends.top);
  const recBody = getWood(model.recommends.body);
  const examples = COMPLETED.filter((c) => c.silhouette === model.silhouette);
  const configureWord = model.family === "mandolin" ? "Mandolin" : model.shortName;
  const configureLabel = `Configure ${/^[AEIOU]/i.test(configureWord) ? "an" : "a"} ${configureWord}`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "IndividualProduct",
    name: `${SITE.shortName} ${model.name}`,
    brand: { "@type": "Brand", name: SITE.name },
    category: model.family === "mandolin" ? "Mandolin" : "Acoustic Guitar",
    description: model.summary,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: model.basePrice,
      availability: "https://schema.org/MadeToOrder",
      seller: { "@type": "Organization", name: SITE.name },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      {/* Hero */}
      <section className="bg-plaster pb-16 pt-32 sm:pt-40">
        <Container>
          <Link href="/instruments" className="link-underline font-sans text-xs uppercase tracking-wider2 text-ink-muted">
            <span aria-hidden>←</span> <span>All instruments</span>
          </Link>
          <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
            <div className="reveal flex justify-center">
              <InstrumentPreview config={preview} uid={`hero-${model.slug}`} className="h-[60vh] w-auto max-w-sm drop-shadow-2xl" />
            </div>
            <div className="reveal">
              <Overline>{model.bodyShape}</Overline>
              <h1 className="mt-4 font-serif text-6xl leading-none text-espresso sm:text-7xl">{model.name}</h1>
              <p className="mt-4 font-serif text-3xl italic text-wood">{model.tagline}</p>
              <p className="mt-6 max-w-md font-sans text-lg leading-relaxed text-ink-soft">{model.summary}</p>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <ButtonLink href={`/build?model=${model.slug}`}>{configureLabel} →</ButtonLink>
                <ArrowLink href="/craft">See the craft</ArrowLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Designed for */}
      <section className="bg-warmwhite py-20">
        <Container>
          <div className="reveal flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="md:w-1/3">
              <Overline>Designed for</Overline>
            </div>
            <div className="md:w-2/3">
              <div className="flex flex-wrap gap-3">
                {model.playingStyles.map((s) => (
                  <span key={s} className="border border-brass/30 px-4 py-2 font-serif text-xl text-espresso">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Personality & tone */}
      <section className="bg-plaster py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="reveal">
              <Overline>The instrument</Overline>
              <div className="mt-6 space-y-5 font-sans text-lg leading-relaxed text-ink-soft">
                {model.story.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
            <div className="reveal">
              <Overline>Its voice</Overline>
              <p className="mt-6 font-serif text-3xl leading-snug text-espresso">{model.toneProfile}</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {model.descriptors.map((d) => (
                  <span key={d} className="bg-espresso px-3 py-1 font-sans text-xs uppercase tracking-wider2 text-ivory">{d}</span>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Demos placeholder */}
      <section className="bg-espresso-wash py-20 text-ivory">
        <Container>
          <div className="reveal flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <Overline className="text-brassLight">Listen</Overline>
              <h2 className="mt-3 font-serif text-3xl text-ivory sm:text-4xl">Hear the {model.shortName}.</h2>
              <p className="mt-2 max-w-md font-sans text-parchment/70">
                Audio and video demonstrations of this model are on their way.
              </p>
            </div>
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-brassLight/40 text-brassLight">▶</span>
          </div>
        </Container>
      </section>

      {/* Body shape + construction */}
      <section className="bg-warmwhite py-24">
        <Container>
          <div className="grid gap-12 md:grid-cols-2 lg:gap-20">
            <div className="reveal">
              <div className="aspect-square border border-brass/20 bg-plaster p-14 text-wood">
                <CraftDetail kind="voicing" className="h-full w-full" strokeWidth={1.1} />
              </div>
            </div>
            <div className="reveal">
              <Overline>Construction</Overline>
              <h2 className="mt-4 font-serif text-4xl text-espresso">Voiced by hand, built to remain.</h2>
              <p className="mt-6 font-sans leading-relaxed text-ink-soft">
                The {model.name} is built individually — braced and voiced for its body, the
                top thinned and tapped until it speaks, the neck carved to your hands, and a
                thin finish laid to protect the wood without dulling it.
              </p>
              <p className="mt-4 font-sans leading-relaxed text-ink-soft">
                A natural place to begin is a {recTop?.name} top over {recBody?.name} — but the
                whole instrument is yours to shape.
              </p>
              <div className="mt-8">
                <ArrowLink href={`/build?model=${model.slug}`}>Choose your woods</ArrowLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Specifications */}
      <section className="bg-plaster-deep py-24">
        <Container>
          <div className="reveal max-w-2xl">
            <Overline>Specifications</Overline>
            <h2 className="mt-4 font-serif text-4xl text-espresso">Typical figures.</h2>
            <p className="mt-3 font-sans text-sm text-ink-muted">
              A guide, not a rulebook — every commission is confirmed personally.
            </p>
          </div>
          <dl className="reveal mt-10 grid gap-px overflow-hidden border border-brass/20 bg-brass/20 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Body", model.bodyShape],
              ["Lower bout", model.specs.lowerBout],
              ["Body depth", model.specs.depth],
              ["Scale length", model.specs.scaleLength],
              ["Nut width", model.specs.nutWidth],
              ["Frets", model.specs.frets],
            ].map(([k, v]) => (
              <div key={k} className="bg-warmwhite p-6">
                <dt className="font-sans text-xs uppercase tracking-wider2 text-ink-muted">{k}</dt>
                <dd className="mt-2 font-serif text-xl text-espresso">{v}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Completed examples */}
      {examples.length > 0 && (
        <section className="bg-warmwhite py-24">
          <Container>
            <div className="reveal flex items-end justify-between gap-6">
              <div>
                <Overline>From the archive</Overline>
                <h2 className="mt-4 font-serif text-4xl text-espresso">{model.name}s we’ve built.</h2>
              </div>
              <ArrowLink href="/instruments/completed">View archive</ArrowLink>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {examples.map((b) => (
                <Link key={b.id} href={`/instruments/completed/${b.id}`} className="group border border-brass/20 bg-plaster p-6 transition-colors hover:border-brass/50">
                  <p className="font-serif text-xl text-espresso">{b.top} / {b.body}</p>
                  <p className="mt-1 font-sans text-xs uppercase tracking-wider2 text-brass">{b.year}</p>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-ink-soft line-clamp-3">{b.story}</p>
                  <span className="mt-4 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-wider2 text-wood">
                    View build <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* CTA */}
      <section className="bg-plaster py-28">
        <Container className="text-center">
          <p className="reveal overline mx-auto">Make it yours</p>
          <h2 className="reveal mx-auto mt-6 max-w-3xl font-serif text-5xl leading-tight text-espresso sm:text-6xl">
            The {model.name} is a beginning, not a product.
          </h2>
          <BrassRule className="reveal mx-auto mt-10 max-w-xs" />
          <div className="reveal mt-10">
            <ButtonLink href={`/build?model=${model.slug}`}>{configureLabel} →</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
