"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { CTAButton, SectionLabel } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";

/**
 * /arium — the Arium story (§24). A scroll narrative from 1995 material research
 * to a finished instrument, anchored by an interactive cross-section that
 * reveals the construction layers. We communicate principle, never chemistry.
 */

const STAGES = [
  { year: "1995", title: "Wood Analysis", copy: "Research begins into the structural and acoustic properties of premium tonewoods — how each species carries, colours and damps vibration." },
  { year: "—", title: "Acoustic Research", copy: "The question shifts: rather than choosing a wood, could a material be designed for sound itself — resonant, sustaining, consistent?" },
  { year: "2007", title: "Arium Development", copy: "Aristides is founded around the answer. Arium is engineered to preserve the musical characteristics that matter while removing the ones that don't." },
  { year: "—", title: "Exoskeleton", copy: "A rigid outer shell is laid up by hand over roughly eight hours — topcoat, glass fibre, carbon and structural elements." },
  { year: "—", title: "Arium Core", copy: "The resonant core is distributed through the structure — the energy beneath the precise outer shell." },
  { year: "—", title: "Curing", copy: "The structure cures into a single continuous body-and-neck. This is the raw material the instrument is then built from." },
  { year: "—", title: "Luthiery", copy: "Routing, sanding, fretwork, finishing, assembly, setup and inspection — the craft that turns material into an instrument." },
  { year: "today", title: "Finished Instrument", copy: "Wood, but more: resonance, sustain and consistency, in an instrument that holds its setup for years." },
];

// which cross-section layers are "active" at each stage index
const LAYER_STAGE = [0, 0, 1, 2, 3, 3, 3, 3];

export function AriumStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <div>
      {/* HERO */}
      <section className="relative flex min-h-[92svh] items-center overflow-hidden pt-16">
        <div className="pointer-events-none absolute inset-0 grid-tech opacity-[0.14]" />
        <div className="shell relative z-10">
          <SectionLabel index="/ ARIUM">The material</SectionLabel>
          <Reveal>
            <h1 className="mt-8 max-w-4xl font-display text-display-lg font-medium leading-[0.88]">
              WHAT IF THE MATERIAL
              <br />
              <span className="text-steel">WAS DESIGNED</span>
              <br />
              FOR SOUND?
            </h1>
          </Reveal>
          <p className="mt-8 max-w-lg text-base leading-relaxed text-steel">
            Arium is not a wood substitute. It began as research into a material engineered for
            resonance, sustain and consistency — and became the core of every Aristides.
          </p>
          <div className="mt-9 flex gap-3">
            <CTAButton href="/production" variant="secondary" size="lg">See it built</CTAButton>
            <CTAButton href="/build" variant="primary" size="lg">Build one</CTAButton>
          </div>
        </div>
      </section>

      {/* DAMPING DIAGRAM */}
      <section className="border-t border-graphite-line py-24">
        <div className="shell grid gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionLabel index="/ PRINCIPLE">Why a designed material</SectionLabel>
            <h2 className="mt-6 font-display text-display-sm font-medium">
              WOOD DAMPS
              <br />
              <span className="text-steel">UNEVENLY.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-steel">
              Every piece of wood absorbs frequencies differently — the reason two instruments never
              sound quite alike. Arium is engineered to carry the full range evenly, so what you play is
              what you hear, from the lowest string up.
            </p>
          </Reveal>
          <Reveal className="self-center">
            <DampingDiagram />
          </Reveal>
        </div>
      </section>

      {/* SCROLL STORY with pinned cross-section */}
      <section ref={ref} className="relative border-t border-graphite-line">
        <div className="shell grid lg:grid-cols-2">
          {/* pinned cross-section */}
          <div className="hidden lg:block">
            <div className="sticky top-0 flex h-screen items-center justify-center">
              <CrossSection progress={scrollYProgress} />
            </div>
          </div>

          {/* stage list */}
          <div className="py-24">
            {STAGES.map((s, i) => (
              <div key={s.title} className="flex min-h-[70vh] flex-col justify-center border-b border-graphite-line/60 py-10">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-[12px] text-ice">{String(i + 1).padStart(2, "0")}</span>
                  <span className="tech-label">{s.year}</span>
                </div>
                <h3 className="mt-4 font-display text-4xl font-medium">{s.title}</h3>
                <p className="mt-4 max-w-md text-base leading-relaxed text-steel">{s.copy}</p>
                {/* mobile mini cross-section */}
                <div className="mt-8 lg:hidden">
                  <MiniLayer active={LAYER_STAGE[i]} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section className="border-t border-graphite-line bg-graphite py-24">
        <div className="shell text-center">
          <h2 className="mx-auto max-w-3xl font-display text-display-md font-medium leading-[0.9]">
            SCIENCE. <span className="text-steel">CRAFT.</span>
            <br />
            ONE INSTRUMENT.
          </h2>
          <div className="mt-8 flex justify-center gap-3">
            <CTAButton href="/build" variant="primary" size="lg">Build Your Aristides</CTAButton>
            <CTAButton href="/models" variant="secondary" size="lg">Explore Models</CTAButton>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---- interactive cross-section ----------------------------------- */
const LAYERS = [
  { r: 150, color: "#2a2d31", label: "Exoskeleton" },
  { r: 118, color: "#3a3d42", label: "Structural Fibre" },
  { r: 86, color: "#17191c", label: "Carbon" },
  { r: 54, color: "#7a3a8a", label: "Arium Core" },
];

function CrossSection({ progress }: { progress: MotionValue<number> }) {
  // active layer index 0..3 across the scroll
  const active = useTransform(progress, [0, 0.25, 0.55, 0.8, 1], [0, 1, 2, 3, 3]);
  return (
    <svg viewBox="0 0 360 360" className="h-[70vh] w-auto">
      <defs>
        <radialGradient id="ar-core-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(160,80,200,0.6)" />
          <stop offset="100%" stopColor="rgba(160,80,200,0)" />
        </radialGradient>
      </defs>
      <circle cx="180" cy="180" r="150" fill="url(#ar-core-glow)" opacity="0.5" />
      {LAYERS.map((l, i) => (
        <CrossLayer key={l.label} layer={l} index={i} active={active} />
      ))}
      {/* callouts */}
      {LAYERS.map((l, i) => (
        <CrossLabel key={l.label} layer={l} index={i} active={active} />
      ))}
    </svg>
  );
}

function CrossLayer({ layer, index, active }: { layer: (typeof LAYERS)[number]; index: number; active: MotionValue<number> }) {
  const opacity = useTransform(active, (a) => (a >= index ? 1 : 0.25));
  const stroke = useTransform(active, (a) => (Math.round(a) === index ? "#7FE9E3" : "rgba(255,255,255,0.08)"));
  return (
    <motion.circle
      cx="180"
      cy="180"
      r={layer.r}
      fill={layer.color}
      style={{ opacity }}
      stroke={stroke}
      strokeWidth="1.5"
    />
  );
}

function CrossLabel({ layer, index, active }: { layer: (typeof LAYERS)[number]; index: number; active: MotionValue<number> }) {
  const opacity = useTransform(active, (a) => (Math.round(a) === index ? 1 : 0));
  const y = 180 - layer.r + 14;
  return (
    <motion.g style={{ opacity }}>
      <line x1="180" y1={y} x2="320" y2={y} stroke="#7FE9E3" strokeWidth="0.75" strokeDasharray="2 3" />
      <text x="324" y={y + 3} className="fill-chalk" fontSize="11" style={{ fontFamily: "var(--font-mono)" }}>
        {layer.label}
      </text>
    </motion.g>
  );
}

function MiniLayer({ active }: { active: number }) {
  return (
    <svg viewBox="0 0 160 160" className="h-32 w-32">
      {LAYERS.map((l, i) => (
        <circle
          key={l.label}
          cx="80"
          cy="80"
          r={l.r * 0.44}
          fill={l.color}
          opacity={i <= active ? 1 : 0.25}
          stroke={i === active ? "#7FE9E3" : "rgba(255,255,255,0.08)"}
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

function DampingDiagram() {
  return (
    <svg viewBox="0 0 460 220" className="w-full">
      {/* axes */}
      <line x1="30" y1="180" x2="440" y2="180" stroke="#565b63" strokeWidth="1" />
      <line x1="30" y1="20" x2="30" y2="180" stroke="#565b63" strokeWidth="1" />
      <text x="34" y="16" fill="#565b63" fontSize="9" style={{ fontFamily: "var(--font-mono)" }}>RESPONSE</text>
      <text x="392" y="196" fill="#565b63" fontSize="9" style={{ fontFamily: "var(--font-mono)" }}>FREQUENCY</text>
      {/* uneven wood curve */}
      <motion.path
        d="M30 150 C90 60 120 170 170 90 C220 20 260 160 310 110 C360 70 400 165 440 120"
        fill="none"
        stroke="rgba(138,143,152,0.5)"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      />
      {/* even arium line */}
      <motion.path
        d="M30 70 C120 66 240 64 440 62"
        fill="none"
        stroke="#7FE9E3"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: "easeOut", delay: 0.3 }}
      />
      <circle cx="40" cy="70" r="3" fill="#7FE9E3" />
      <text x="48" y="74" className="fill-chalk" fontSize="10" style={{ fontFamily: "var(--font-mono)" }}>ARIUM — EVEN</text>
      <circle cx="40" cy="150" r="3" fill="#8A8F98" />
      <text x="48" y="154" fill="#8A8F98" fontSize="10" style={{ fontFamily: "var(--font-mono)" }}>WOOD — UNEVEN</text>
    </svg>
  );
}
