"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { InstrumentPreview } from "@/components/visuals/instrument-preview";
import { defaultConfig } from "@/lib/config/engine";
import { SITE } from "@/lib/site";

const HERO_CONFIG = defaultConfig("om-14");

/**
 * Full-viewport hero. A richly-rendered instrument sits in a warm pool of light
 * beside a display headline that mixes roman and italic Fraunces. Motion is a
 * slow parallax drift and fade, fully neutralized under prefers-reduced-motion.
 */
export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, reduce ? 1 : 0]);

  const lines: [string, string][] = [
    ["Instruments made", "slowly."],
    ["Made", "deliberately."],
    ["Made to", "remain."],
  ];

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden bg-plaster">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(46% 44% at 74% 42%, rgba(251,248,243,0.95), transparent 72%), radial-gradient(52% 60% at 16% 96%, rgba(215,201,177,0.55), transparent 66%)",
        }}
      />

      {/* Instrument in a pool of light */}
      <motion.div
        style={{ y, opacity }}
        className="pointer-events-none absolute right-[-6%] top-1/2 hidden h-[104%] -translate-y-1/2 md:block lg:right-[2%] lg:h-[112%]"
      >
        <InstrumentPreview
          config={HERO_CONFIG}
          uid="hero"
          className="h-full w-auto drop-shadow-[0_50px_70px_rgba(36,28,23,0.28)] motion-safe:animate-slow-zoom"
        />
      </motion.div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-editorial flex-col justify-center px-6 pb-24 pt-32 sm:px-10 lg:px-16">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="overline mb-9"
        >
          {SITE.name}
        </motion.p>

        <h1 className="font-serif text-[15vw] font-light leading-[0.92] tracking-[-0.03em] text-espresso sm:text-[6.5rem] lg:text-[7.6rem]">
          {lines.map(([roman, ital], i) => (
            <motion.span
              key={roman}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.2 }}
              className="block"
            >
              {roman} <span className="italic text-wood">{ital}</span>
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.1 }}
          className="mt-10 max-w-md text-base leading-relaxed text-ink-soft"
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
            <span>Explore the Instruments</span>
          </Link>
          <Link
            href="/build"
            className="link-underline font-mono text-[0.72rem] uppercase tracking-[0.2em] text-espresso"
          >
            <span>Build Yours</span>
            <span className="arrow" aria-hidden>→</span>
          </Link>
        </motion.div>

        {/* Meta row — quiet marginalia */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="mono-label mt-16 flex flex-wrap items-center gap-x-8 gap-y-2 text-ink-muted"
        >
          <span>Est. by hand · {SITE.location.city}, {SITE.location.regionCode}</span>
          <span className="hidden h-3 w-px bg-brass/40 sm:block" />
          <span>Guitars · Mandolins · Stringed instruments</span>
        </motion.div>
      </div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9, duration: 1 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
      >
        <span className="mono-label text-ink-muted">Scroll</span>
        <span className="h-10 w-px bg-brass/50" />
      </motion.div>
    </section>
  );
}
