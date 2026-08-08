import type { Metadata } from "next";
import {
  SectionLabel,
  DisplayHeading,
  CTAButton,
  Divider,
  TechSpec,
} from "@/components/ui/primitives";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { GuitarVisual } from "@/components/visual/GuitarVisual";
import { finishById } from "@/lib/data/finishes";

export const metadata: Metadata = {
  title: "Story",
  description:
    "Science multiplied by craft. From a decade of material research to Arium — a rigid exoskeleton over a resonant core — every Aristides is engineered and hand-built in Haarlem, The Netherlands.",
};

/**
 * ABOUT / STORY page (§29).
 *
 * A concise, scroll-revealed vertical timeline plus the central brand narrative:
 * SCIENCE × CRAFT, Arium as an engineering advantage, hand-built in Haarlem.
 * Server component; scroll motion comes from the shared Reveal primitives.
 */

interface Milestone {
  year: string;
  title: string;
  body: string;
}

const MILESTONES: Milestone[] = [
  {
    year: "1995",
    title: "Material research begins",
    body: "A decade studying the structural and acoustic properties of premium tonewoods — what makes a body resonate, and what makes it fail. The question was never which wood, but which behaviour.",
  },
  {
    year: "2007",
    title: "Aristides Instruments founded",
    body: "The research becomes a workshop in Haarlem. The premise: engineer the material first, then build the instrument around it.",
  },
  {
    year: "2009",
    title: "The flagship 010, completed",
    body: "The first instrument built entirely from Arium — a rigid exoskeleton over a resonant core. Sustain and clarity that wood could approximate but never guarantee.",
  },
  {
    year: "2010",
    title: "NAMM debut",
    body: "The 010 meets the industry. A guitar with no wood in the body, measured against instruments that had defined the form for fifty years.",
  },
  {
    year: "2015",
    title: "H-series, headless",
    body: "Mass moved off the headstock and into the body. Tuning stability and balance become properties of the platform, not the setup.",
  },
  {
    year: "2018",
    title: "S-series, multiscale",
    body: "A fanned-scale platform built for extended range — tighter low strings, brighter highs, engineered string tension across the fretboard.",
  },
  {
    year: "2021",
    title: "STX platform, with Mike Stringer",
    body: "A signature architecture developed with the Spiritbox guitarist for modern extended-range playing — aggressive, precise, uncompromising.",
  },
  {
    year: "2022",
    title: "The S/B basses",
    body: "Arium taken to the low end. The same exoskeleton-over-core construction, scaled for the clarity and articulation a bass demands.",
  },
  {
    year: "2023",
    title: "The H/09 nine-string",
    body: "Nine strings held in balance on a headless platform — the furthest extension of the range, only possible because the material holds.",
  },
];

const PILLARS = [
  {
    label: "The material",
    value: "Arium",
    sub: "A proprietary composite core — consistent, predictable, and free of the variance that defines wood.",
  },
  {
    label: "The construction",
    value: "Exoskeleton + core",
    sub: "A rigid outer shell over a resonant interior. Energy stays in the string; nothing is lost to a soft body.",
  },
  {
    label: "The place",
    value: "Haarlem, NL",
    sub: "Every instrument hand-built and hand-finished in the Netherlands. Engineering and craft under one roof.",
  },
];

const openingFinish = finishById("cham-blue-green");

export default function StoryPage() {
  return (
    <div className="instrument-ambient min-h-screen">
      {/* ---- Opening statement ---------------------------------- */}
      <section className="shell pt-32 pb-20 sm:pt-40">
        <Reveal>
          <SectionLabel index="/ STORY">The company</SectionLabel>
        </Reveal>

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            <Reveal delay={0.05}>
              <DisplayHeading as="h1" size="lg" className="text-chalk">
                Science, multiplied by craft.
              </DisplayHeading>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-steel">
                Most guitars begin with a piece of wood and hope. We began with a
                decade of material research and a single conviction: that an
                instrument should be engineered, not selected. Arium is that
                engineering advantage — a rigid exoskeleton over a resonant core,
                consistent from the first build to the ten-thousandth.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="mt-5 max-w-2xl text-steel-dim leading-relaxed">
                Everything that follows is hand-built and hand-finished in
                Haarlem, The Netherlands.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-4">
            <Reveal delay={0.2}>
              <div className="relative mx-auto max-w-[240px] lg:max-w-none">
                <GuitarVisual
                  construction="headless"
                  strings={6}
                  finish={openingFinish}
                  className="h-auto w-full"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Brand narrative pillars ---------------------------- */}
      <section className="shell pb-24">
        <Reveal>
          <SectionLabel index="/ 01">The advantage</SectionLabel>
        </Reveal>
        <RevealGroup className="mt-10 grid gap-px overflow-hidden rounded-sm border border-graphite-line bg-graphite-line sm:grid-cols-3">
          {PILLARS.map((p) => (
            <RevealItem key={p.label} className="bg-void p-8">
              <TechSpec label={p.label} value={p.value} sub={p.sub} className="border-t-0 pt-0" />
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ---- Timeline ------------------------------------------- */}
      <section className="shell pb-24">
        <Reveal>
          <SectionLabel index="/ 02">The timeline</SectionLabel>
        </Reveal>

        <div className="mt-12">
          <RevealGroup className="relative">
            {/* vertical hairline spine */}
            <span
              aria-hidden
              className="absolute left-[7px] top-2 bottom-2 w-px bg-graphite-line sm:left-[calc(9rem+7px)]"
            />

            <ol className="space-y-0">
              {MILESTONES.map((m) => (
                <RevealItem key={m.year} className="">
                  <li className="group relative grid grid-cols-1 gap-x-8 gap-y-2 py-8 sm:grid-cols-[9rem_1fr]">
                    {/* year rail */}
                    <div className="flex items-center gap-4 sm:block">
                      <span className="font-mono text-sm text-ice sm:text-base">{m.year}</span>
                    </div>

                    {/* node + content */}
                    <div className="relative pl-8">
                      <span
                        aria-hidden
                        className="absolute left-0 top-[6px] h-3.5 w-3.5 -translate-x-1/2 rounded-full border border-steel bg-void transition-colors duration-ui ease-mech group-hover:border-ice group-hover:bg-graphite-raised"
                      />
                      <h3>
                        <DisplayHeading as="h3" size="sm" className="text-chalk">
                          {m.title}
                        </DisplayHeading>
                      </h3>
                      <p className="mt-3 max-w-xl leading-relaxed text-steel">{m.body}</p>
                    </div>

                    <div className="col-span-full mt-8">
                      <Divider />
                    </div>
                  </li>
                </RevealItem>
              ))}
            </ol>
          </RevealGroup>
        </div>
      </section>

      {/* ---- Texture plate -------------------------------------- */}
      <section className="shell pb-24">
        <Reveal>
          <div className="grid gap-px overflow-hidden rounded-sm sm:grid-cols-2">
            <EditorialImage
              label="Haarlem / bench"
              caption="Hand-finished, one instrument at a time."
              tone="graphite"
              seed={2}
              aspect="4 / 3"
            />
            <EditorialImage
              label="Arium / core"
              caption="Rigid exoskeleton over a resonant core."
              tone="mono"
              seed={4}
              aspect="4 / 3"
            />
          </div>
        </Reveal>
      </section>

      {/* ---- Closing CTA ---------------------------------------- */}
      <section className="shell pb-32">
        <Divider className="mb-16" />
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="tech-label">Science × Craft</span>
            <DisplayHeading size="md" className="mt-6 text-chalk">
              The material is the instrument.
            </DisplayHeading>
            <p className="mx-auto mt-6 max-w-xl leading-relaxed text-steel">
              Understand the engineering, then build the one that is yours. Every
              Aristides starts from the same platform and ends somewhere entirely
              your own.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <CTAButton href="/build" size="lg" variant="primary">
                Build yours
              </CTAButton>
              <CTAButton href="/arium" size="lg" variant="secondary">
                Explore Arium
              </CTAButton>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
