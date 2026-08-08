"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CTAButton, SectionLabel } from "@/components/ui/primitives";
import { FinishSwatch } from "@/components/ui/FinishSwatch";
import { GuitarVisual } from "@/components/visual/GuitarVisual";
import {
  FINISH_CATEGORIES,
  finishesByCategory,
  type Finish,
  type FinishCategory,
} from "@/lib/data/finishes";

/**
 * Section 6 — Finish Lab (§8). A dark material laboratory: one category at a
 * time, a large featured finish on an instrument, and a swatch strip. Not every
 * option at once — you examine the material, you don't shop a wall of chips.
 */
export function FinishLab() {
  const [category, setCategory] = useState<FinishCategory>("CHAMELEON GLOSS");
  const options = finishesByCategory(category);
  const [featured, setFeatured] = useState<Finish>(options[0]);

  function pickCategory(c: FinishCategory) {
    setCategory(c);
    const first = finishesByCategory(c)[0];
    if (first) setFeatured(first);
  }

  return (
    <section
      className="instrument-ambient relative overflow-hidden border-t border-graphite-line py-24"
      style={{ ["--instrument-tint" as string]: featured.tint.join(",") }}
    >
      <div className="shell">
        <SectionLabel index="/ 06">Finish Lab</SectionLabel>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-display-sm font-medium">
            THE MATERIAL,
            <br />
            <span className="text-steel">FINISHED.</span>
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-steel">
            Raw Arium, deep solids, marbles, colour-shifting chameleons, sparkles and true metals.
            Hundreds of possibilities — examined one at a time.
          </p>
        </div>

        {/* category pills */}
        <div className="mt-10 flex flex-wrap gap-2">
          {FINISH_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => pickCategory(c)}
              className={
                "rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide-tech transition-all duration-ui " +
                (category === c
                  ? "border-ice bg-ice/10 text-chalk"
                  : "border-graphite-line text-steel hover:border-steel hover:text-chalk")
              }
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          {/* featured instrument */}
          <div className="relative flex h-[52vh] items-center justify-center overflow-hidden rounded border border-graphite-line bg-graphite">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: `radial-gradient(70% 70% at 50% 40%, rgba(${featured.tint.join(",")},0.16), transparent 65%)` }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={featured.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative h-[110%]"
              >
                <GuitarVisual construction="standard" strings={6} finish={featured} className="h-full w-auto" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-4 left-4">
              <div className="font-display text-xl">{featured.name}</div>
              <div className="tech-label mt-1">{featured.category}</div>
            </div>
          </div>

          {/* swatch strip */}
          <div>
            <div className="tech-label mb-4">{options.length} finishes in {category.toLowerCase()}</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {options.map((f) => (
                <FinishSwatch
                  key={f.id}
                  finish={f}
                  size="sm"
                  selected={featured.id === f.id}
                  onSelect={() => setFeatured(f)}
                />
              ))}
            </div>
            <div className="mt-8">
              <CTAButton href="/build" variant="secondary">
                Configure this finish
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
