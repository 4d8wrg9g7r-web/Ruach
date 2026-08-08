"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { CTAButton } from "@/components/ui/primitives";
import { GuitarVisual } from "@/components/visual/GuitarVisual";
import { finishById } from "@/lib/data/finishes";

/**
 * Section 1 — Hero (§8). Full viewport, dark, aggressive 3/4 crop of the
 * instrument emerging from darkness. Extremely subtle cursor parallax; no
 * constant spinning. A small vertical status readout anchors it as instrumentation.
 */
export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const guitarScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // cursor parallax
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 20 });
  const sy = useSpring(py, { stiffness: 60, damping: 20 });

  const finish = finishById("cham-purple-red");

  function onMove(e: React.MouseEvent) {
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width - 0.5) * 24);
    py.set(((e.clientY - r.top) / r.height - 0.5) * 16);
  }

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      className="instrument-ambient relative flex min-h-[100svh] items-center overflow-hidden"
      style={{ ["--instrument-tint" as string]: (finish?.tint ?? [138, 143, 152]).join(",") }}
    >
      <div className="pointer-events-none absolute inset-0 grid-tech opacity-[0.18]" />

      {/* Oversized background model code (§39) */}
      <div className="pointer-events-none absolute right-[-2vw] top-[14%] select-none font-display text-[26vw] font-bold leading-none text-chalk/[0.03]">
        070
      </div>

      {/* Guitar — 3/4 crop, extends beyond viewport */}
      <motion.div
        style={{ x: sx, y: sy, scale: guitarScale }}
        className="pointer-events-none absolute right-[-6%] top-1/2 z-10 h-[125%] max-h-none -translate-y-1/2 lg:right-[2%] lg:h-[135%]"
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
        >
          <GuitarVisual
            construction="offset"
            strings={7}
            finish={finish}
            hardwareColor="black"
            className="h-full w-auto drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
          />
        </motion.div>
      </motion.div>

      {/* Copy */}
      <motion.div style={{ y, opacity: fade }} className="shell relative z-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="max-w-2xl"
        >
          <div className="tech-label mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-ice" />
            Aristides Instruments
          </div>
          <h1 className="font-display text-display-lg font-medium">
            THE INSTRUMENT
            <br />
            <span className="text-steel">REENGINEERED.</span>
          </h1>
          <p className="mt-7 max-w-md text-base leading-relaxed text-steel">
            Hand-built in Haarlem. Engineered around Arium. Designed without compromise.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <CTAButton href="/build" variant="primary" size="lg">
              Build Your Aristides
            </CTAButton>
            <CTAButton href="/arium" variant="secondary" size="lg">
              Explore the Technology
            </CTAButton>
          </div>
        </motion.div>
      </motion.div>

      {/* Vertical status display */}
      <div className="absolute bottom-8 left-5 z-20 hidden flex-col gap-2 sm:left-8 lg:flex">
        {["HAARLEM / NL", "ARIUM CORE", "HAND BUILT"].map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.12 }}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wide-tech text-steel"
          >
            <span className="h-1 w-1 rounded-full bg-ice" />
            {s}
          </motion.div>
        ))}
      </div>

      {/* scroll hint */}
      <div className="absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
        <span className="font-mono text-[10px] uppercase tracking-wide-tech text-steel-dim">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-8 w-px bg-gradient-to-b from-steel to-transparent"
        />
      </div>
    </section>
  );
}
