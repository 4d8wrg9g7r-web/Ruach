"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { clsx } from "clsx";
import {
  SectionLabel,
  DisplayHeading,
  CTAButton,
  Divider,
} from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { GuitarVisual } from "@/components/visual/GuitarVisual";
import { finishById } from "@/lib/data/finishes";

/* ------------------------------------------------------------------ */
/* Stage data (§25). Eleven steps, science → craft.                    */
/* ------------------------------------------------------------------ */

type Era = "SCIENCE" | "CRAFT";
type Tone = "mono" | "graphite" | "warm";

interface Stage {
  n: string;
  title: string;
  caption: string;
  era: Era;
  tone: Tone;
  /** Craft stages are shot as grayscale plates to read as human hands, not lab. */
  grayscale: boolean;
}

const STAGES: Stage[] = [
  {
    n: "01",
    title: "Mold Preparation",
    caption:
      "Each model has a dedicated closed mold, cleaned and released by hand. Nothing enters the cavity until it reads true to spec.",
    era: "SCIENCE",
    tone: "graphite",
    grayscale: false,
  },
  {
    n: "02",
    title: "Exoskeleton Layup",
    caption:
      "Roughly eight hours of carbon and glass laid entirely by hand, ply by ply, each fibre oriented to the loads the instrument will carry.",
    era: "SCIENCE",
    tone: "mono",
    grayscale: false,
  },
  {
    n: "03",
    title: "Arium Core",
    caption:
      "The proprietary Arium core is cast into the exoskeleton — a single continuous body with no glued joints to swallow vibration.",
    era: "SCIENCE",
    tone: "graphite",
    grayscale: false,
  },
  {
    n: "04",
    title: "Curing",
    caption:
      "The closed body cures under heat and pressure. What emerges is one monolithic shell: dimensionally stable, yet still raw material.",
    era: "SCIENCE",
    tone: "mono",
    grayscale: false,
  },
  {
    n: "05",
    title: "Acoustic Inspection",
    caption:
      "Every raw body is tapped and measured. Resonance and mass are logged before a single tool is allowed to touch it.",
    era: "CRAFT",
    tone: "warm",
    grayscale: true,
  },
  {
    n: "06",
    title: "Routing",
    caption:
      "Cavities, neck pocket and channels are routed to tolerance. Here the cured block becomes a guitar in the hands of a luthier.",
    era: "CRAFT",
    tone: "warm",
    grayscale: true,
  },
  {
    n: "07",
    title: "Fretwork",
    caption:
      "Frets are seated, leveled, crowned and polished by hand — the difference between a body and an instrument that truly plays.",
    era: "CRAFT",
    tone: "warm",
    grayscale: true,
  },
  {
    n: "08",
    title: "Paint",
    caption:
      "Finish is sprayed, cured and cut back in the booth — from raw Arium through chameleon, sparkle and machined-metal.",
    era: "CRAFT",
    tone: "warm",
    grayscale: true,
  },
  {
    n: "09",
    title: "Assembly",
    caption:
      "Hardware, electronics and neck are fitted and wired by a single builder, each part torqued and dressed by hand.",
    era: "CRAFT",
    tone: "warm",
    grayscale: true,
  },
  {
    n: "10",
    title: "Setup",
    caption:
      "Action, intonation and relief are dialed to the player's spec. The instrument is tuned to itself, string by string.",
    era: "CRAFT",
    tone: "warm",
    grayscale: true,
  },
  {
    n: "11",
    title: "Final Inspection",
    caption:
      "Signed off in Haarlem. Every instrument is played, photographed and logged before it is allowed to leave the workshop.",
    era: "CRAFT",
    tone: "warm",
    grayscale: true,
  },
];

/* ------------------------------------------------------------------ */

const rawArium = finishById("raw-arium");
const closingFinish = finishById("cham-blue-green");

export function ProductionSequence() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.4,
  });

  return (
    <div className="instrument-ambient">
      {/* -------- Scroll progress rail (desktop) -------------------- */}
      <div className="pointer-events-none fixed left-6 top-28 bottom-16 z-30 hidden w-px bg-graphite-line xl:block">
        <motion.div
          className="absolute inset-x-0 top-0 origin-top bg-ice"
          style={{ scaleY: progress, height: "100%" }}
        />
      </div>

      {/* -------- Intro / hero ------------------------------------- */}
      <section className="shell pt-32 pb-24 sm:pt-40 sm:pb-32">
        <Reveal>
          <SectionLabel index="/ PRODUCTION">The Making</SectionLabel>
        </Reveal>
        <Reveal delay={0.06}>
          <DisplayHeading as="h1" size="lg" className="mt-8 max-w-4xl">
            From mold to instrument.
          </DisplayHeading>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-steel">
            Every Aristides begins as chemistry and ends in the hands of a
            single builder. Eleven stages, one workshop in Haarlem — where the
            science of the Arium core meets the craft of the luthier.
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <dl className="mt-16 grid max-w-2xl grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3">
            {[
              { k: "Stages", v: "11" },
              { k: "Layup, by hand", v: "~8 hrs" },
              { k: "Built in", v: "Haarlem" },
            ].map((s) => (
              <div key={s.k} className="border-t border-graphite-line pt-3">
                <dt className="tech-label mb-2">{s.k}</dt>
                <dd className="font-display text-2xl text-chalk">{s.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* -------- Stage sequence ----------------------------------- */}
      <div ref={trackRef}>
        {STAGES.map((stage, i) => {
          const showTransition = stage.era === "CRAFT" && STAGES[i - 1]?.era === "SCIENCE";
          return (
            <div key={stage.n}>
              {showTransition && <EraTransition />}
              <StageBlock stage={stage} index={i} />
            </div>
          );
        })}
      </div>

      {/* -------- Closing CTA -------------------------------------- */}
      <section className="shell pt-8 pb-40">
        <Divider className="mb-24" />
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Reveal>
              <SectionLabel index="/ NEXT">The Result</SectionLabel>
            </Reveal>
            <Reveal delay={0.06}>
              <DisplayHeading size="md" className="mt-8 max-w-xl">
                The last stage is yours.
              </DisplayHeading>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-steel">
                Everything before this was ours. Specify the instrument that
                comes out of the mold — or read how the Arium core makes a
                monolithic body sound the way it does.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-10 flex flex-wrap gap-4">
                <CTAButton href="/build" size="lg">
                  Build Yours
                </CTAButton>
                <CTAButton href="/arium" variant="secondary" size="lg">
                  The Arium Core
                </CTAButton>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="flex justify-center">
            <div className="relative w-full max-w-[280px]">
              <div className="absolute inset-0 -z-10 rounded-full bg-ice/[0.04] blur-3xl" />
              <GuitarVisual
                construction="offset"
                strings={6}
                finish={closingFinish}
                className="w-full drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Single stage — oversized number, plate, technical caption.          */
/* ------------------------------------------------------------------ */

function StageBlock({ stage, index }: { stage: Stage; index: number }) {
  // Alternate the image side for editorial rhythm.
  const imageLeft = index % 2 === 1;
  const isCore = stage.n === "03";

  const numberBlock = (
    <div className="relative">
      <Reveal>
        <div className="tech-label mb-4 flex items-center gap-3">
          <span>{stage.era}</span>
          <span className="h-px w-8 bg-graphite-line" />
          <span>Stage {stage.n} / 11</span>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="flex items-baseline gap-6">
          <span
            aria-hidden
            className="select-none font-display font-medium leading-none text-graphite-line"
            style={{ fontSize: "clamp(4.5rem, 12vw, 11rem)" }}
          >
            {stage.n}
          </span>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <DisplayHeading size="md" className="mt-4 uppercase tracking-tight">
          {stage.title}
        </DisplayHeading>
      </Reveal>

      <Reveal delay={0.16}>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-steel">
          {stage.caption}
        </p>
      </Reveal>
    </div>
  );

  const plate = (
    <Reveal delay={0.08}>
      <EditorialImage
        label={`Aristides / ${stage.n}`}
        caption={`${stage.title} — Haarlem`}
        tone={stage.tone}
        seed={index + 1}
        aspect="4 / 5"
        className={clsx(
          "w-full transition-[filter] duration-ui ease-mech",
          stage.grayscale && "grayscale hover:grayscale-0",
        )}
      >
        {isCore && rawArium && (
          <div className="absolute inset-0 flex items-center justify-center opacity-90">
            <GuitarVisual
              construction="standard"
              strings={6}
              finish={rawArium}
              className="h-[112%] w-auto"
            />
          </div>
        )}
      </EditorialImage>
    </Reveal>
  );

  return (
    <section className="shell border-t border-graphite-line py-24 sm:py-32">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {imageLeft ? (
          <>
            <div className="order-2 lg:order-1">{plate}</div>
            <div className="order-1 lg:order-2">{numberBlock}</div>
          </>
        ) : (
          <>
            <div className="order-1">{numberBlock}</div>
            <div className="order-2">{plate}</div>
          </>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Science → Craft pivot marker.                                       */
/* ------------------------------------------------------------------ */

function EraTransition() {
  return (
    <section className="shell border-t border-graphite-line py-28 sm:py-36">
      <Reveal>
        <div className="tech-label flex items-center justify-center gap-4">
          <span className="text-steel-dim">Science</span>
          <span className="h-px w-16 bg-graphite-line" />
          <span className="text-ice">Craft</span>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mx-auto mt-10 max-w-2xl text-center font-display text-2xl leading-snug text-chalk text-balance sm:text-3xl">
          Out of the mold, the body is a finished piece of engineering and an
          unfinished instrument. What follows cannot be automated — only built.
        </p>
      </Reveal>
      <Reveal delay={0.14}>
        <p className="mx-auto mt-6 max-w-md text-center text-steel">
          Everything from here is skilled luthiery, by hand, in Haarlem.
        </p>
      </Reveal>
    </section>
  );
}
