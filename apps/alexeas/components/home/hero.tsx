"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { InstrumentSilhouette } from "@/components/visuals/silhouettes";
import { SITE } from "@/lib/site";

/**
 * Full-viewport hero. In place of stock video we compose a slowly drifting,
 * softly lit instrument drawing with a staggered text fade — motion stays
 * restrained and is fully neutralized under prefers-reduced-motion.
 */
export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yInstrument = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0]);

  const lines = ["Instruments made slowly.", "Made deliberately.", "Made to remain."];

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden bg-plaster">
      {/* Warm light wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 72% 34%, rgba(251,248,243,0.85), transparent 70%), radial-gradient(50% 60% at 20% 90%, rgba(219,207,187,0.5), transparent 65%)",
        }}
      />

      {/* Instrument, bleeding off the right edge */}
      <motion.div
        style={{ y: yInstrument, opacity }}
        className="pointer-events-none absolute right-[-14%] top-1/2 hidden h-[112%] -translate-y-1/2 md:block lg:right-[-4%]"
      >
        <InstrumentSilhouette
          silhouette="om"
          stroke="#3A2A21"
          strokeWidth={1}
          className="h-full w-auto opacity-[0.9] motion-safe:animate-slow-zoom"
        />
      </motion.div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-editorial flex-col justify-center px-6 pb-24 pt-32 sm:px-8 lg:px-12">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="overline mb-8"
        >
          {SITE.name}
        </motion.p>

        <h1 className="font-serif text-[13vw] leading-[0.95] text-espresso sm:text-7xl lg:text-8xl">
          {lines.map((line, i) => (
            <motion.span
              key={line}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.22 }}
              className="block"
            >
              {line}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.1 }}
          className="mt-10 max-w-md font-sans text-base leading-relaxed text-ink-soft"
        >
          Handcrafted guitars, mandolins, and stringed instruments built
          individually in the Alexeas workshop.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <Link href="/instruments" className="btn-primary">
            Explore the Instruments
          </Link>
          <Link
            href="/build"
            className="link-underline font-sans text-sm uppercase tracking-wider2 text-espresso"
          >
            <span>Build Yours</span>
            <span className="arrow" aria-hidden>
              →
            </span>
          </Link>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
      >
        <span className="text-[0.65rem] uppercase tracking-widest2 text-ink-muted">Scroll</span>
        <span className="h-10 w-px bg-brass/50" />
      </motion.div>
    </section>
  );
}
