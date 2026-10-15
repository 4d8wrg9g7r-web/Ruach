import type { Metadata } from "next";
import Link from "next/link";
import { Container, Overline, ButtonLink } from "@/components/ui";
import { InstrumentSilhouette } from "@/components/visuals/silhouettes";
import { COMPLETED } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Completed Instruments",
  description:
    "An archive of guitars and mandolins completed in the Alexeas workshop — the woods, the details, and the story behind each build.",
};

export default function CompletedPage() {
  return (
    <>
      <section className="bg-plaster pb-16 pt-32 sm:pt-40">
        <Container>
          <div className="reveal max-w-3xl">
            <Overline>Completed Instruments</Overline>
            <h1 className="mt-6 font-serif text-6xl leading-[1.02] text-espresso sm:text-7xl">
              A record of what’s left the bench.
            </h1>
            <p className="mt-8 max-w-xl font-sans text-lg leading-relaxed text-ink-soft">
              Not a catalog of things to buy — a portfolio of instruments already built,
              each one made for a particular player. A place to find your own beginning.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-warmwhite py-20">
        <Container>
          <div className="grid gap-8 sm:grid-cols-2">
            {COMPLETED.map((b) => (
              <Link
                key={b.id}
                href={`/instruments/completed/${b.id}`}
                className="reveal group grid grid-cols-[auto_1fr] items-center gap-6 border border-brass/20 bg-plaster p-8 transition-colors hover:border-brass/50"
              >
                <InstrumentSilhouette silhouette={b.silhouette} stroke={b.accent} strokeWidth={1.1} className="h-44 w-auto" />
                <div>
                  <p className="font-sans text-xs uppercase tracking-wider2 text-brass">{b.year} · {b.model}</p>
                  <h2 className="mt-2 font-serif text-2xl text-espresso">{b.top} / {b.body}</h2>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-ink-soft line-clamp-3">{b.story}</p>
                  <span className="mt-4 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-wider2 text-wood">
                    View build <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-plaster py-24 text-center">
        <Container>
          <p className="reveal font-serif text-4xl leading-tight text-espresso sm:text-5xl">
            Yours could be next.
          </p>
          <div className="reveal mt-8">
            <ButtonLink href="/build">Build Your Instrument →</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
