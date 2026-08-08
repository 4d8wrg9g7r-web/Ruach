import type { Metadata } from "next";
import { SectionLabel, DisplayHeading, CTAButton, Divider } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { ArtistsGallery } from "./ArtistsGallery";

export const metadata: Metadata = {
  title: "Artists",
  description:
    "The players who build their sound on Aristides — across progressive metal, djent, fusion, studio and post-rock. Portraits, the instruments they play, and why they stay.",
};

export default function ArtistsPage() {
  return (
    <>
      {/* ---- Intro -------------------------------------------------- */}
      <section className="instrument-ambient border-b border-graphite-line pb-16 pt-24">
        <div className="shell">
          <Reveal>
            <SectionLabel index="/ ARTISTS">Roster</SectionLabel>
          </Reveal>
          <Reveal delay={0.05}>
            <DisplayHeading as="h1" size="lg" className="mt-8 max-w-4xl">
              PLAYED WHERE
              <br />
              <span className="text-steel">IT MATTERS.</span>
            </DisplayHeading>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-steel">
              Not a logo wall. The players who chose Aristides for the reasons Aristides
              exists — stability under load, definition down low, balance in the hand. Their
              genre. Their instrument. Why it stays on the road.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---- Gallery (client: filters + detail modal) --------------- */}
      <section className="bg-graphite py-16">
        <div className="shell">
          <ArtistsGallery />
        </div>
      </section>

      {/* ---- Closing CTA -------------------------------------------- */}
      <section className="border-t border-graphite-line bg-void py-24">
        <div className="shell">
          <Divider className="mb-16" />
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <SectionLabel index="/ 001">The Same Platform</SectionLabel>
                <DisplayHeading as="h2" size="md" className="mt-6">
                  Play what they play.
                  <br />
                  <span className="text-steel">Build yours.</span>
                </DisplayHeading>
              </div>
              <CTAButton href="/build" size="lg">
                Start your build
              </CTAButton>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
