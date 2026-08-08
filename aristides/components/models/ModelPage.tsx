"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CTAButton, SectionLabel } from "@/components/ui/primitives";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { GuitarVisual } from "@/components/visual/GuitarVisual";
import { FinishSwatch } from "@/components/ui/FinishSwatch";
import { FINISHES } from "@/lib/data/finishes";
import { FAMILIES, type Family } from "@/lib/data/models";
import { formatEUR } from "@/lib/build";

/** A cinematic model-family landing page (§9). Shared design system, per-family
 *  personality via the family tint. Rendered from data for every family. */
export function ModelPage({ family }: { family: Family }) {
  const [variantIdx, setVariantIdx] = useState(0);
  const [finishId, setFinishId] = useState<string>(
    // pick a finish whose tint is near the family tint for a coherent hero
    "raw-arium",
  );
  const variant = family.variants[variantIdx];
  const finish = FINISHES.find((f) => f.id === finishId);
  const construction = family.construction[0];
  const tint = finish?.tint ?? family.tint;
  const others = FAMILIES.filter((f) => f.id !== family.id);

  // a small curated finish set for the model hero
  const finishChoices = FINISHES.filter((f) =>
    ["raw-arium", "black", "cham-purple-red", "metal-worn-steel", "aqua-green", "gold-gloss"].includes(f.id),
  );

  return (
    <div>
      {/* HERO */}
      <section
        className="instrument-ambient relative flex min-h-[92svh] items-center overflow-hidden pt-16"
        style={{ ["--instrument-tint" as string]: tint.join(",") }}
      >
        <div className="pointer-events-none absolute inset-0 grid-tech opacity-[0.12]" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="select-none font-display text-[46vw] font-bold leading-none text-chalk/[0.035] lg:text-[30vw]">
            {family.glyph}
          </span>
        </div>

        <div className="shell relative z-10 grid w-full items-center gap-8 lg:grid-cols-2">
          <div>
            <SectionLabel index={`/ ${family.id}`}>{family.name}</SectionLabel>
            <h1 className="mt-6 font-display text-display-md font-medium leading-[0.9]">
              {family.name.toUpperCase()}
            </h1>
            <p className="mt-3 font-display text-2xl text-steel">{family.tagline}</p>
            <p className="mt-6 max-w-md text-base leading-relaxed text-steel">{family.blurb}</p>

            {/* variant selector */}
            <div className="mt-8 flex flex-wrap gap-2">
              {family.variants.map((v, i) => (
                <button
                  key={v.code}
                  onClick={() => setVariantIdx(i)}
                  className={
                    "rounded-sm border px-4 py-2 font-mono text-[12px] uppercase tracking-wide-tech transition-all duration-ui " +
                    (i === variantIdx
                      ? "border-ice bg-ice/10 text-chalk"
                      : "border-graphite-line text-steel hover:border-steel hover:text-chalk")
                  }
                >
                  {v.code}
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-3">
              <div>
                <div className="tech-label">From</div>
                <div className="font-display text-3xl">{formatEUR(variant.fromPrice)}</div>
              </div>
              <div>
                <div className="tech-label">Scale</div>
                <div className="font-display text-xl">{variant.scale}</div>
              </div>
              <div>
                <div className="tech-label">Strings</div>
                <div className="font-display text-xl">{variant.strings}</div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton href="/build" variant="primary" size="lg">
                Build a {variant.code}
              </CTAButton>
              <CTAButton href="/gallery" variant="secondary" size="lg">
                See it built
              </CTAButton>
            </div>
          </div>

          {/* visual */}
          <div className="relative flex h-[60vh] items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${variant.code}-${finishId}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-full"
              >
                <GuitarVisual construction={construction} strings={variant.strings} finish={finish} className="h-full w-auto" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-2">
              {finishChoices.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFinishId(f.id)}
                  aria-label={f.name}
                  className={
                    "h-6 w-6 rounded-sm border transition " +
                    (finishId === f.id ? "border-ice ring-1 ring-ice" : "border-graphite-line")
                  }
                  style={{ background: f.swatch }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DESCRIPTION + HIGHLIGHTS */}
      <section className="border-t border-graphite-line py-24">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <SectionLabel index="/ 01">The platform</SectionLabel>
            <p className="mt-6 font-display text-2xl leading-snug text-chalk">{family.description}</p>
          </Reveal>
          <RevealGroup className="grid grid-cols-2 gap-x-8 gap-y-6 self-center">
            {family.highlights.map((h, i) => (
              <RevealItem key={h}>
                <div className="border-t border-graphite-line pt-3">
                  <div className="font-mono text-[11px] text-ice">{String(i + 1).padStart(2, "0")}</div>
                  <div className="mt-1 text-[15px] leading-snug text-chalk">{h}</div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* VARIANTS TABLE */}
      <section className="border-t border-graphite-line bg-graphite py-24">
        <div className="shell">
          <SectionLabel index="/ 02">Configurations</SectionLabel>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="border-b border-graphite-line text-left">
                  {["Model", "Strings", "Scale", "From", ""].map((h) => (
                    <th key={h} className="tech-label py-3 pr-4 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {family.variants.map((v) => (
                  <tr key={v.code} className="group border-b border-graphite-line transition-colors hover:bg-graphite-raised/40">
                    <td className="py-4 pr-4 font-display text-xl">{v.code}</td>
                    <td className="py-4 pr-4 font-mono text-sm text-steel">{v.strings}-string</td>
                    <td className="py-4 pr-4 font-mono text-sm text-steel">{v.scale}</td>
                    <td className="py-4 pr-4 font-display text-lg">{formatEUR(v.fromPrice)}</td>
                    <td className="py-4 text-right">
                      <Link href="/build" className="font-mono text-[12px] uppercase tracking-wide-tech text-ice opacity-0 transition group-hover:opacity-100">
                        Configure →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FINISH TEASER */}
      <section className="border-t border-graphite-line py-24">
        <div className="shell">
          <SectionLabel index="/ 03">Finish it your way</SectionLabel>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {finishChoices.map((f) => (
              <FinishSwatch key={f.id} finish={f} size="sm" />
            ))}
          </div>
          <div className="mt-8">
            <CTAButton href="/build" variant="secondary">Open the configurator</CTAButton>
          </div>
        </div>
      </section>

      {/* OTHER FAMILIES */}
      <section className="border-t border-graphite-line bg-graphite py-24">
        <div className="shell">
          <SectionLabel index="/ 04">Other platforms</SectionLabel>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {others.map((f) => (
              <Link
                key={f.id}
                href={`/models/${f.slug}`}
                className="group relative flex h-40 flex-col justify-between overflow-hidden rounded border border-graphite-line bg-graphite-raised/40 p-4 transition hover:border-steel"
              >
                <span className="font-display text-4xl text-chalk/20 transition group-hover:text-chalk/40">{f.glyph}</span>
                <span>
                  <span className="block font-display text-lg">{f.name}</span>
                  <span className="block font-mono text-[10px] text-steel">From {formatEUR(Math.min(...f.variants.map((v) => v.fromPrice)))}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        className="instrument-ambient relative flex min-h-[60vh] items-center border-t border-graphite-line"
        style={{ ["--instrument-tint" as string]: family.tint.join(",") }}
      >
        <div className="shell text-center">
          <h2 className="mx-auto max-w-3xl font-display text-display-sm font-medium">
            YOUR {family.name.toUpperCase()},<br />
            <span className="text-steel">BUILT TO SPEC.</span>
          </h2>
          <div className="mt-8 flex justify-center">
            <CTAButton href="/build" variant="primary" size="lg">Build Your {family.name}</CTAButton>
          </div>
        </div>
      </section>
    </div>
  );
}
