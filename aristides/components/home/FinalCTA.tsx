"use client";

import { motion } from "framer-motion";
import { CTAButton } from "@/components/ui/primitives";
import { GuitarVisual } from "@/components/visual/GuitarVisual";
import { finishById } from "@/lib/data/finishes";

/**
 * Section 10 — Final CTA (§8). Full-screen instrument, single message, one
 * primary action.
 */
export function FinalCTA() {
  const finish = finishById("cham-rose-gold");
  return (
    <section
      className="instrument-ambient relative flex min-h-[100svh] items-center overflow-hidden border-t border-graphite-line"
      style={{ ["--instrument-tint" as string]: (finish?.tint ?? [220, 150, 130]).join(",") }}
    >
      <div className="pointer-events-none absolute inset-0 grid-tech opacity-[0.14]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] -translate-x-1/2 -translate-y-1/2 opacity-70"
      >
        <GuitarVisual construction="standard" strings={6} finish={finish} className="h-full w-auto" />
      </motion.div>

      <div className="shell relative z-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-4xl font-display text-display-md font-medium leading-[0.9]"
        >
          BUILD THE ONE
          <br />
          <span className="text-steel">THAT DOESN&apos;T</span>
          <br />
          EXIST YET.
        </motion.h2>
        <div className="mt-10 flex justify-center">
          <CTAButton href="/build" variant="primary" size="lg">
            Start Configuring
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
