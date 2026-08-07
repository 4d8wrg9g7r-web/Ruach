import Link from "next/link";
import { Hero } from "@/components/home/hero";
import { SmallestDetails } from "@/components/home/smallest-details";
import { ModelExplorer } from "@/components/model-explorer";
import { WoodExplorer } from "@/components/wood-explorer";
import { Container, Overline, BrassRule, ArrowLink, ButtonLink, SectionIndex } from "@/components/ui";
import { InstrumentSilhouette } from "@/components/visuals/silhouettes";
import { InstrumentPreview } from "@/components/visuals/instrument-preview";
import { defaultConfig } from "@/lib/config/engine";
import { FAMILIES } from "@/lib/data/models";
import { PROCESS, TESTIMONIALS, PHILOSOPHY } from "@/lib/data/content";
import { SITE } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* 02 — Philosophy */}
      <section className="bg-warmwhite py-24 sm:py-36">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-24">
            <div className="reveal">
              <SectionIndex n="02" label="Philosophy" />
              <h2 className="mt-8 font-serif text-5xl font-light leading-[1.03] tracking-[-0.02em] text-espresso sm:text-6xl lg:text-7xl">
                {PHILOSOPHY.hook}
                <span className="mt-2 block italic text-wood">{PHILOSOPHY.turn}</span>
              </h2>
              <p className="drop-cap mt-10 max-w-prose2 text-lg leading-relaxed text-ink-soft">
                {PHILOSOPHY.body}
              </p>
            </div>
            <div className="reveal flex items-center justify-center">
              <div className="relative w-full max-w-sm border border-brass/20 bg-plaster px-10 py-14 shadow-atelier">
                <span className="mono-label absolute left-6 top-6 text-brass/70">Fig. 01 — Grand Concert</span>
                <InstrumentPreview config={defaultConfig("grand-concert-12")} uid="phil" className="mx-auto h-80 w-auto drop-shadow-[0_30px_44px_rgba(36,28,23,0.24)]" />
                <p className="mt-8 text-center font-serif text-xl italic text-wood">
                  One player. One craftsman. One detail at a time.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 03 — Instrument families */}
      <section className="bg-plaster py-24 sm:py-32" id="families">
        <Container>
          <div className="reveal max-w-2xl">
            <SectionIndex n="03" label="Instrument Families" />
            <h2 className="mt-8 font-serif text-4xl leading-tight text-espresso sm:text-5xl">
              Three families. Every one a starting point.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {/* Dominant panel */}
            <Link
              href={FAMILIES[0].href}
              className="reveal group relative flex min-h-[26rem] flex-col justify-between overflow-hidden border border-brass/25 bg-warmwhite p-10 transition-colors hover:border-brass/60 lg:row-span-2"
            >
              <div className="flex flex-1 items-center justify-center">
                <InstrumentSilhouette silhouette="dreadnought" stroke="#3A2A21" strokeWidth={1.1} className="h-72 w-auto text-espresso transition-transform duration-1000 ease-atelier group-hover:scale-[1.04] sm:h-96" />
              </div>
              <div>
                <h3 className="font-serif text-4xl text-espresso sm:text-5xl">{FAMILIES[0].title}</h3>
                <p className="mt-3 max-w-md font-sans leading-relaxed text-ink-soft">{FAMILIES[0].blurb}</p>
                <span className="mt-5 inline-flex items-center gap-2 font-sans text-sm uppercase tracking-wider2 text-wood">
                  Explore <span className="transition-transform duration-500 ease-atelier group-hover:translate-x-1">→</span>
                </span>
              </div>
            </Link>

            {/* Two stacked */}
            {[FAMILIES[1], FAMILIES[2]].map((fam, i) => (
              <Link
                key={fam.key}
                href={fam.href}
                className="reveal group relative flex min-h-[12.5rem] items-center gap-6 overflow-hidden border border-brass/25 bg-warmwhite p-8 transition-colors hover:border-brass/60"
              >
                <InstrumentSilhouette
                  silhouette={i === 0 ? "mandolin" : "o"}
                  stroke="#8A6245"
                  strokeWidth={1.1}
                  className="h-40 w-auto shrink-0 text-wood transition-transform duration-1000 ease-atelier group-hover:rotate-[3deg]"
                />
                <div>
                  <h3 className="font-serif text-3xl text-espresso">{fam.title}</h3>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-ink-soft">{fam.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-wider2 text-wood">
                    Explore <span className="transition-transform duration-500 ease-atelier group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 04 — Models */}
      <section className="bg-warmwhite py-24 sm:py-32" id="models">
        <Container>
          <div className="reveal flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <SectionIndex n="04" label="The Models" />
              <h2 className="mt-8 font-serif text-4xl leading-tight text-espresso sm:text-5xl">
                Four bodies, and the mandolin.
              </h2>
              <p className="mt-5 max-w-prose2 font-sans leading-relaxed text-ink-soft">
                Each begins as a standard model and becomes something else entirely —
                an instrument shaped around one player.
              </p>
            </div>
            <ArrowLink href="/instruments">See all instruments</ArrowLink>
          </div>
          <div className="mt-8">
            <ModelExplorer />
          </div>
        </Container>
      </section>

      {/* 05 — Smallest details */}
      <SmallestDetails />

      {/* 06 — Tonewoods */}
      <section className="bg-plaster py-24 sm:py-32" id="tonewoods">
        <Container>
          <div className="reveal max-w-2xl">
            <SectionIndex n="06" label="Tonewoods" />
            <h2 className="mt-8 font-serif text-4xl leading-tight text-espresso sm:text-5xl">
              It begins with the wood.
            </h2>
            <p className="mt-5 max-w-prose2 font-sans leading-relaxed text-ink-soft">
              Every set is chosen and tapped by hand. Explore the woods that shape an
              instrument’s voice, look, and feel — then carry your favorites into the build.
            </p>
          </div>
          <div className="reveal mt-14">
            <WoodExplorer initialCategory="body" />
          </div>
        </Container>
      </section>

      {/* 07 — Configurator CTA */}
      <section className="relative overflow-hidden bg-espresso-wash py-28 text-ivory sm:py-40">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40" style={{ background: "radial-gradient(50% 60% at 78% 40%, rgba(168,138,90,0.35), transparent 70%)" }} />
        <Container className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div className="reveal">
              <Overline className="text-brassLight">Build Yours</Overline>
              <h2 className="mt-6 font-serif text-5xl leading-[1.05] text-ivory sm:text-6xl lg:text-7xl">
                The next Alexeas hasn’t been built yet.
                <span className="mt-2 block text-brassLight">Begin with yours.</span>
              </h2>
              <p className="mt-8 max-w-md font-sans leading-relaxed text-parchment/80">
                Not a checkout — a conversation. Design your instrument step by step,
                and send the whole specification to the workshop to begin.
              </p>
              <div className="mt-10">
                <ButtonLink href="/build" variant="ghost" className="!border-brassLight/50 !text-ivory hover:!bg-brass/15">
                  Build Your Instrument →
                </ButtonLink>
              </div>
            </div>
            <div className="reveal flex justify-center">
              <div className="relative">
                <span aria-hidden className="absolute inset-0 -z-10 blur-3xl" style={{ background: "radial-gradient(circle, rgba(196,168,118,0.35), transparent 68%)" }} />
                <InstrumentPreview config={defaultConfig("dreadnought")} uid="cta" className="h-96 w-auto drop-shadow-[0_40px_60px_rgba(0,0,0,0.5)]" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 08 — The Maker */}
      <section className="bg-warmwhite py-24 sm:py-32" id="maker">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <div className="reveal order-2 lg:order-1">
              <div className="border border-brass/20 bg-plaster p-10">
                <CraftPortrait />
              </div>
            </div>
            <div className="reveal order-1 lg:order-2">
              <SectionIndex n="08" label="The Maker" />
              <h2 className="mt-8 font-serif text-4xl leading-tight text-espresso sm:text-5xl">
                Made by hand means made by someone.
              </h2>
              <div className="mt-8 space-y-5 font-sans text-lg leading-relaxed text-ink-soft">
                <p>
                  Alexeas Guitars is the workshop of {SITE.maker}, a luthier of Greek
                  heritage building in {SITE.location.city}, {SITE.location.region}. Each
                  instrument is made in small numbers, most of them spoken for before the
                  first piece of wood is cut.
                </p>
                <p>
                  The work is patient and personal — a standard model is only ever a
                  starting point for a guitar or mandolin built around the player who will
                  spend a lifetime with it. It pays homage to the makers who came before,
                  while carrying a voice of its own.
                </p>
              </div>
              <div className="mt-10">
                <ArrowLink href="/workshop">Step Inside the Workshop</ArrowLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 09 — Build process */}
      <section className="bg-plaster-deep py-24 sm:py-32">
        <Container>
          <div className="reveal max-w-2xl">
            <SectionIndex n="09" label="The Commission" />
            <h2 className="mt-8 font-serif text-4xl leading-tight text-espresso sm:text-5xl">
              What it looks like to commission an instrument.
            </h2>
          </div>
          <ol className="mt-14 grid gap-px overflow-hidden border border-brass/20 bg-brass/20 sm:grid-cols-2 lg:grid-cols-3">
            {PROCESS.map((step) => (
              <li key={step.n} className="reveal flex flex-col bg-warmwhite p-8">
                <span className="font-serif text-3xl text-brass">{step.n}</span>
                <h3 className="mt-3 font-serif text-2xl text-espresso">{step.title}</h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </li>
            ))}
            <li className="reveal flex flex-col justify-center bg-espresso p-8 text-ivory">
              <p className="font-serif text-2xl leading-snug text-parchment">Let’s build yours.</p>
              <div className="mt-6">
                <Link href="/build" className="link-underline font-sans text-sm uppercase tracking-wider2 text-brassLight">
                  <span>Start a build</span>
                  <span className="arrow" aria-hidden>→</span>
                </Link>
              </div>
            </li>
          </ol>
        </Container>
      </section>

      {/* 11 — Testimonials */}
      <section className="bg-warmwhite py-24 sm:py-32">
        <Container>
          <div className="reveal max-w-2xl">
            <SectionIndex n="11" label="Players" />
            <h2 className="mt-8 font-serif text-4xl leading-tight text-espresso sm:text-5xl">
              Stories from the people who play them.
            </h2>
          </div>
          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="reveal flex flex-col border-t border-brass/30 pt-8">
                <blockquote className="font-serif text-2xl leading-snug text-espresso">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6">
                  <p className="font-sans text-sm font-medium text-ink">{t.name}</p>
                  <p className="font-sans text-xs text-ink-muted">{t.model} — {t.woods}</p>
                  <p className="mt-1 font-sans text-xs uppercase tracking-wider2 text-brass">{t.since}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* 12 — Final CTA */}
      <section className="bg-plaster py-28 sm:py-40">
        <Container className="text-center">
          <p className="reveal overline mx-auto">Commission an Instrument</p>
          <h2 className="reveal mx-auto mt-8 max-w-4xl font-serif text-5xl leading-[1.05] text-espresso sm:text-7xl">
            The next Alexeas hasn’t been built yet.
            <span className="mt-2 block text-wood">Let’s build yours.</span>
          </h2>
          <BrassRule className="reveal mx-auto mt-12 max-w-xs" />
          <div className="reveal mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink href="/build">Build Your Instrument →</ButtonLink>
            <ButtonLink href="/contact" variant="ghost">Commission an Instrument</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}

/** A quiet, abstract "portrait" — a bench vignette drawn in line, in lieu of a photo. */
function CraftPortrait() {
  return (
    <svg viewBox="0 0 200 240" className="mx-auto h-80 w-auto text-wood" fill="none" role="img" aria-label="At the workbench">
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="16" y1="150" x2="184" y2="150" opacity="0.5" />
        <path d="M60 150 V120 Q60 96 100 92 Q140 96 140 120 V150" opacity="0.4" />
        {/* Instrument top on the bench */}
        <path d="M70 150 C 70 120 82 100 100 100 C 118 100 130 120 130 150 C 130 172 116 186 100 186 C 84 186 70 172 70 150 Z" />
        <circle cx="100" cy="140" r="9" />
        <rect x="88" y="156" width="24" height="5" rx="1.5" opacity="0.8" />
        {/* Hands, suggested */}
        <path d="M52 148 q10 -8 20 -4" opacity="0.7" />
        <path d="M128 144 q12 -6 20 2" opacity="0.7" />
        {/* Tools */}
        <path d="M150 120 l20 -8 l4 8 l-20 8 Z" opacity="0.7" />
        <line x1="34" y1="128" x2="50" y2="122" opacity="0.6" />
      </g>
    </svg>
  );
}
