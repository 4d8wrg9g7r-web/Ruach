import type { Metadata } from "next";
import { Container, Overline, BrassRule, ButtonLink } from "@/components/ui";
import { CraftDetail, type CraftKind } from "@/components/visuals/details";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Workshop",
  description:
    "Step inside the Alexeas workshop in Clayton, North Carolina — a room organized around wood, tools, and the slow making of stringed instruments.",
};

type Station = {
  n: string;
  title: string;
  kind?: CraftKind;
  body: string;
};

const STATIONS: Station[] = [
  {
    n: "01",
    title: "Wood Storage",
    kind: "wood",
    body: "Racks of quartersawn tops and backs, stickered and stacked, drying into the still air of the shop. Some of it has waited years for the right instrument.",
  },
  {
    n: "02",
    title: "The Bench",
    body: "The center of the room. Marked, dented, and worked smooth by use — the surface where nearly every part of an instrument passes through a pair of hands.",
  },
  {
    n: "03",
    title: "Hand Tools",
    kind: "setup",
    body: "Planes, chisels, spokeshaves, and scrapers, each hung within reach and kept sharp. A short row of them does most of the work you can hear.",
  },
  {
    n: "04",
    title: "Unfinished Bodies",
    kind: "joint",
    body: "Rims bent to shape and closed around their blocks, waiting on tops and backs. At this stage an instrument is all promise and no sound.",
  },
  {
    n: "05",
    title: "Bracing",
    kind: "voicing",
    body: "Where soundboards are braced and voiced — braces carved down and tapped, again and again, until the top answers the way it should.",
  },
  {
    n: "06",
    title: "Neck Shaping",
    kind: "neck",
    body: "A neck blank held in the vise, taking its profile from the spokeshave one pass at a time, read by hand until it feels like nothing.",
  },
  {
    n: "07",
    title: "Inlay Bench",
    kind: "inlay",
    body: "A small, well-lit corner for the most patient work: pieces cut and fitted tight enough that no line reads as a seam.",
  },
  {
    n: "08",
    title: "The Finishing Room",
    kind: "finish",
    body: "Kept clean and apart from the dust. Thin coats are built and rubbed back over weeks, slow enough to let the wood keep breathing.",
  },
  {
    n: "09",
    title: "Fret & Setup Bench",
    kind: "fretwork",
    body: "Where frets are leveled and crowned and the final setup is dialed in — nut, saddle, and action set to the hands the instrument is made for.",
  },
  {
    n: "10",
    title: "Completed Instruments",
    body: "A short line of finished guitars and mandolins, hung and settling. Each one is about to belong to someone. None of them will be built again.",
  },
];

export default function WorkshopPage() {
  return (
    <>
      <section className="bg-warmwhite pb-8 pt-24 sm:pt-32">
        <Container>
          <div className="reveal">
            <Overline>The Workshop</Overline>
            <h1 className="mt-6 max-w-5xl font-serif text-5xl leading-[1.05] text-espresso text-balance sm:text-6xl lg:text-7xl">
              Before an Alexeas becomes an instrument, it spends a long time as
              wood.
            </h1>
            <p className="mt-8 max-w-prose2 text-xl leading-relaxed text-ink-soft text-pretty">
              There are no photographs here yet — only the room itself, described
              honestly. This is the workshop of {SITE.maker} in{" "}
              {SITE.location.city}, {SITE.location.region}: a handful of
              stations, a great deal of wood, and the unhurried business of
              turning one into the other.
            </p>
          </div>
          <BrassRule className="mt-16" />
        </Container>
      </section>

      <section className="bg-plaster py-20 sm:py-24">
        <Container>
          <div className="reveal mb-14 max-w-prose2">
            <Overline>An index of the room</Overline>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-espresso sm:text-4xl">
              Ten stations, in the order the work moves through them.
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden border border-brass/20 bg-brass/20 sm:grid-cols-2 lg:grid-cols-3">
            {STATIONS.map((station) => (
              <article
                key={station.n}
                className="reveal flex flex-col bg-warmwhite p-8 sm:p-10"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-serif text-2xl text-brass">
                    {station.n}
                  </span>
                  {station.kind ? (
                    <div className="h-16 w-16 border border-brass/25 p-2 text-wood">
                      <CraftDetail kind={station.kind} className="h-full w-full" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center border border-brass/25 font-serif text-3xl text-brass/70">
                      {station.n}
                    </div>
                  )}
                </div>
                <h3 className="font-serif text-2xl text-espresso">
                  {station.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-ink-soft text-pretty">
                  {station.body}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-espresso-wash py-24 text-ivory sm:py-32">
        <Container>
          <div className="reveal mx-auto max-w-3xl text-center">
            <Overline className="text-brassLight">Inside the shop</Overline>
            <blockquote className="mt-8 font-serif text-3xl leading-snug text-parchment text-balance sm:text-4xl lg:text-5xl">
              “Nothing here is rushed. The wood sets the pace, and the work keeps
              its appointment with it.”
            </blockquote>
            <p className="mt-8 text-sm uppercase tracking-wider2 text-parchment/60">
              {SITE.maker} · {SITE.location.city}, {SITE.location.regionCode}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-plaster-deep py-24 sm:py-32">
        <Container>
          <div className="reveal mx-auto max-w-3xl text-center">
            <Overline>Come further in</Overline>
            <h2 className="mt-6 font-serif text-4xl leading-tight text-espresso text-balance sm:text-5xl">
              The next instrument to leave this room could be yours.
            </h2>
            <p className="mx-auto mt-6 max-w-prose2 text-lg leading-relaxed text-ink-soft text-pretty">
              Begin a build, or simply write to the workshop and start a
              conversation.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonLink href="/build">Build Your Instrument</ButtonLink>
              <ButtonLink href="/contact" variant="ghost">
                Write to the Workshop
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
