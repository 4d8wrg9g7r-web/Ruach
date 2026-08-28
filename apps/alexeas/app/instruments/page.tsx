import type { Metadata } from "next";
import Link from "next/link";
import { Container, Overline, ArrowLink, ButtonLink, SectionIndex } from "@/components/ui";
import { ModelExplorer } from "@/components/model-explorer";
import { WoodExplorer } from "@/components/wood-explorer";
import { InstrumentSilhouette } from "@/components/visuals/silhouettes";
import { FAMILIES } from "@/lib/data/models";
import { COMPLETED } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Instruments",
  description:
    "Guitars and mandolins from the Alexeas workshop — four standard bodies and the mandolin, each a starting point for an instrument built around one player.",
};

export default function InstrumentsPage() {
  return (
    <>
      <section className="bg-plaster pb-16 pt-32 sm:pt-40">
        <Container>
          <div className="reveal max-w-3xl">
            <Overline>The Instruments</Overline>
            <h1 className="mt-6 font-serif text-6xl leading-[1.02] text-espresso sm:text-7xl">
              Every instrument is a starting point.
            </h1>
            <p className="mt-8 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
              Four standard guitar bodies and the mandolin. Each is a considered design in its
              own right — and each is only the first word in a conversation about the
              instrument you’ll actually own.
            </p>
          </div>
        </Container>
      </section>

      {/* Families */}
      <section className="bg-warmwhite py-20" id="guitars">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {FAMILIES.map((fam, i) => (
              <Link
                key={fam.key}
                href={fam.href}
                id={fam.key === "mandolin" ? "mandolins" : undefined}
                className="reveal group flex flex-col border border-brass/25 bg-plaster p-8 transition-colors hover:border-brass/60"
              >
                <InstrumentSilhouette
                  silhouette={i === 0 ? "om" : i === 1 ? "mandolin" : "o"}
                  stroke="#8A6245"
                  strokeWidth={1.1}
                  className="mx-auto h-40 w-auto text-wood transition-transform duration-700 ease-atelier group-hover:rotate-[2deg]"
                />
                <h2 className="mt-6 font-serif text-3xl text-espresso">{fam.title}</h2>
                <p className="mt-2 flex-1 font-sans text-sm leading-relaxed text-ink-soft">{fam.blurb}</p>
                <span className="mt-4 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-wider2 text-wood">
                  Explore <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Model explorer */}
      <section className="bg-plaster py-20">
        <Container>
          <div className="reveal max-w-2xl">
            <SectionIndex n="01" label="The Models" />
            <h2 className="mt-6 font-serif text-4xl text-espresso sm:text-5xl">Bodies & voices.</h2>
          </div>
          <div className="mt-6">
            <ModelExplorer />
          </div>
        </Container>
      </section>

      {/* Tonewoods */}
      <section className="bg-warmwhite py-20" id="tonewoods">
        <Container>
          <div className="reveal max-w-2xl">
            <SectionIndex n="02" label="Tonewoods" />
            <h2 className="mt-6 font-serif text-4xl text-espresso sm:text-5xl">The woods you can choose from.</h2>
          </div>
          <div className="reveal mt-12">
            <WoodExplorer initialCategory="top" />
          </div>
        </Container>
      </section>

      {/* Completed teaser */}
      <section className="bg-plaster-deep py-20">
        <Container>
          <div className="reveal flex items-end justify-between gap-6">
            <div>
              <SectionIndex n="03" label="Completed Instruments" />
              <h2 className="mt-6 font-serif text-4xl text-espresso sm:text-5xl">The archive.</h2>
            </div>
            <ArrowLink href="/instruments/completed">View all</ArrowLink>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {COMPLETED.map((b) => (
              <Link key={b.id} href={`/instruments/completed/${b.id}`} className="group border border-brass/20 bg-warmwhite p-6 transition-colors hover:border-brass/50">
                <InstrumentSilhouette silhouette={b.silhouette} stroke={b.accent} strokeWidth={1.1} className="mx-auto h-32 w-auto" />
                <p className="mt-4 font-serif text-lg text-espresso">{b.model}</p>
                <p className="font-sans text-xs text-ink-muted">{b.top} / {b.body}</p>
                <p className="mt-1 font-sans text-xs uppercase tracking-wider2 text-brass">{b.year}</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-espresso-wash py-24 text-center text-ivory">
        <Container>
          <p className="reveal font-serif text-4xl leading-tight sm:text-5xl">
            The next Alexeas hasn’t been built yet.
          </p>
          <div className="reveal mt-8">
            <ButtonLink href="/build" variant="ghost" className="!border-brassLight/50 !text-ivory hover:!bg-brass/15">
              Build Your Instrument →
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
