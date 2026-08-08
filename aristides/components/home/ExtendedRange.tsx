"use client";

import { motion } from "framer-motion";
import { CTAButton, SectionLabel } from "@/components/ui/primitives";
import { GuitarVisual } from "@/components/visual/GuitarVisual";
import { finishById } from "@/lib/data/finishes";

/**
 * Section 5 — Extended Range (§8). 8/9-string headless hero. Scale-length
 * diagram illustrating multiscale geometry. The H-series extends to H/09.
 */
export function ExtendedRange() {
  const finish = finishById("cham-blue-green");
  return (
    <section
      className="instrument-ambient relative overflow-hidden border-t border-graphite-line py-24"
      style={{ ["--instrument-tint" as string]: (finish?.tint ?? [60, 190, 180]).join(",") }}
    >
      <div className="shell grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionLabel index="/ 05">Extended Range</SectionLabel>
          <h2 className="mt-6 font-display text-display-md font-medium leading-[0.9]">
            GO LOWER.
            <br />
            <span className="text-steel">KEEP THE</span>
            <br />
            DEFINITION.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-steel">
            Aristides is built for 6, 7, 8 and 9 strings. The H-series extends through H/09, and every
            extended platform is available multiscale — a longer bass-side scale for tension and clarity
            where it matters most.
          </p>

          {/* multiscale diagram */}
          <div className="mt-10 max-w-md">
            <div className="tech-label mb-3">Multiscale geometry</div>
            <svg viewBox="0 0 400 120" className="w-full">
              {Array.from({ length: 8 }).map((_, i) => {
                const y = 12 + i * 13;
                // treble strings shorter, bass strings longer (fanned)
                const x2 = 300 + i * 12;
                return (
                  <g key={i}>
                    <motion.line
                      x1="20"
                      y1={y}
                      x2={x2}
                      y2={y}
                      stroke={i === 7 ? "#7FE9E3" : "rgba(138,143,152,0.5)"}
                      strokeWidth={0.6 + i * 0.15}
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </g>
                );
              })}
              <line x1="20" y1="6" x2="20" y2="114" stroke="#565b63" strokeWidth="1" />
              <text x="24" y="112" className="font-mono" fill="#565b63" fontSize="9">NUT</text>
              <text x="330" y="112" className="font-mono" fill="#7FE9E3" fontSize="9">FANNED SADDLES</text>
            </svg>
          </div>

          <div className="mt-9">
            <CTAButton href="/models/h-headless" variant="secondary">
              Explore Headless
            </CTAButton>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex h-[60vh] items-center justify-center"
        >
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="select-none font-display text-[30vw] font-bold leading-none text-chalk/[0.04] lg:text-[16vw]">
              H/09
            </span>
          </div>
          <GuitarVisual construction="headless" strings={9} finish={finish} hardwareColor="black" className="h-full w-auto" />
        </motion.div>
      </div>
    </section>
  );
}
