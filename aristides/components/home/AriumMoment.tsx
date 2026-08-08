"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { SectionLabel } from "@/components/ui/primitives";

/**
 * Section 2 — The Arium Moment (§8). One of the site's signature interactions.
 * As you scroll, the instrument separates into its construction layers:
 * exoskeleton → structural fibre → carbon → Arium core. Built as layered
 * elements so real 3D/WebGL assets can swap in behind the same scroll driver.
 */

const LAYERS = [
  { key: "exo", name: "Exoskeleton", copy: "A rigid outer shell — topcoat, glass fibre and structural elements laid up by hand over roughly eight hours.", color: "#2a2d31", offset: -1 },
  { key: "fibre", name: "Structural Fibre", copy: "Woven fibre gives the structure its stiffness and dimensional stability across temperature and humidity.", color: "#3a3d42", offset: -0.4 },
  { key: "carbon", name: "Carbon", copy: "Carbon elements tune where the structure flexes — and, more importantly, where it does not.", color: "#17191c", offset: 0.4 },
  { key: "core", name: "Arium Core", copy: "The resonant core, distributed through the structure — engineered to carry and sustain vibration.", color: "#7a3a8a", offset: 1 },
];

function Layer({
  color,
  progress,
  offset,
}: {
  color: string;
  progress: MotionValue<number>;
  offset: number;
}) {
  const x = useTransform(progress, [0, 1], [0, offset * 120]);
  const rot = useTransform(progress, [0, 1], [0, offset * 6]);
  const op = useTransform(progress, [0, 0.15, 1], [0, 1, 1]);
  return (
    <motion.div
      style={{ x, rotate: rot, opacity: op }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div
        className="h-[62%] w-[26%] rounded-[40%_40%_44%_44%/30%_30%_60%_60%] border shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        style={{
          background: `linear-gradient(150deg, ${color}, color-mix(in srgb, ${color} 55%, black))`,
          borderColor: "rgba(255,255,255,0.06)",
        }}
      />
    </motion.div>
  );
}

export function AriumMoment() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // active window in the middle of the scroll
  const explode = useTransform(scrollYProgress, [0.15, 0.6], [0, 1]);

  return (
    <section ref={ref} className="relative bg-graphite">
      <div className="sticky top-0 flex min-h-screen items-center overflow-hidden">
        <div className="shell grid w-full items-center gap-10 lg:grid-cols-2">
          {/* copy */}
          <div className="relative z-10 order-2 lg:order-1">
            <SectionLabel index="/ 02">The Arium Moment</SectionLabel>
            <h2 className="mt-6 font-display text-display-sm font-medium">
              WOOD WAS THE
              <br />
              STARTING POINT.
              <br />
              <span className="text-steel">NOT THE LIMIT.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-steel">
              Traditional woods damp different frequencies differently. Arium began as research into a
              material designed for sound itself — strong resonance, long sustain, and consistency from
              one instrument to the next.
            </p>

            <ul className="mt-9 space-y-4">
              {LAYERS.map((l, i) => {
                return <ActiveLayerRow key={l.key} name={l.name} copy={l.copy} progress={explode} index={i} total={LAYERS.length} color={l.color} />;
              })}
            </ul>

            <p className="mt-10 font-display text-2xl">
              SCIENCE. <span className="text-steel">CRAFT.</span> <span className="text-ice">ONE INSTRUMENT.</span>
            </p>
          </div>

          {/* exploded stack */}
          <div className="relative order-1 h-[52vh] lg:order-2 lg:h-[80vh]">
            {LAYERS.map((l) => (
              <Layer key={l.key} color={l.color} progress={explode} offset={l.offset} />
            ))}
            <motion.div
              style={{ opacity: useTransform(explode, [0, 0.3], [1, 0]) }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[11px] uppercase tracking-wide-tech text-steel"
            >
              Scroll to separate
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActiveLayerRow({
  name,
  copy,
  progress,
  index,
  total,
  color,
}: {
  name: string;
  copy: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
  color: string;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const op = useTransform(progress, [start - 0.12, start + 0.05, end, end + 0.2], [0.3, 1, 1, 0.3]);
  const x = useTransform(progress, [start - 0.12, start + 0.05], [-8, 0]);
  return (
    <motion.li style={{ opacity: op, x }} className="flex gap-4 border-l pl-4" >
      <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
      <div>
        <div className="font-display text-lg">{name}</div>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-steel">{copy}</p>
      </div>
    </motion.li>
  );
}
