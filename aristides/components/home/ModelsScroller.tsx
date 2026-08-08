"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { FAMILIES } from "@/lib/data/models";
import { GuitarVisual } from "@/components/visual/GuitarVisual";
import { SectionLabel } from "@/components/ui/primitives";

/**
 * Section 3 — Models (§8). Huge horizontal presentation; each family occupies
 * almost the full viewport. Pinned vertical scroll drives the horizontal track
 * on desktop; on touch it falls back to native horizontal scroll-snap.
 */
export function ModelsScroller() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // move the track from 0 to -(n-1) panels
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(FAMILIES.length - 1) * 100}%`]);

  return (
    <>
      <div className="shell pt-24">
        <SectionLabel index="/ 03">The Range</SectionLabel>
      </div>

      {/* Desktop: pinned horizontal scroll */}
      <section ref={ref} className="relative hidden lg:block" style={{ height: `${FAMILIES.length * 100}vh` }}>
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <motion.div style={{ x }} className="flex h-full">
            {FAMILIES.map((f, i) => (
              <ModelPanel key={f.id} family={f} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mobile: native horizontal snap carousel */}
      <section className="lg:hidden">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 pt-4">
          {FAMILIES.map((f, i) => (
            <div key={f.id} className="w-[85vw] shrink-0 snap-center">
              <ModelPanel family={f} index={i} mobile />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ModelPanel({
  family,
  index,
  mobile,
}: {
  family: (typeof FAMILIES)[number];
  index: number;
  mobile?: boolean;
}) {
  const cheapest = family.variants.reduce((a, b) => (a.fromPrice < b.fromPrice ? a : b));
  const biggest = family.variants[family.variants.length - 1];
  return (
    <div
      className={
        mobile
          ? "relative h-[70vh] w-full overflow-hidden rounded border border-graphite-line bg-graphite"
          : "relative flex h-full w-screen shrink-0 items-center"
      }
      style={{ ["--instrument-tint" as string]: family.tint.join(",") }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(80% 80% at 30% 40%, rgba(${family.tint.join(",")},0.10), transparent 60%)`,
        }}
      />
      {/* oversized glyph */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="select-none font-display text-[52vw] font-bold leading-none text-chalk/[0.04] lg:text-[34vw]">
          {family.glyph}
        </span>
      </div>

      <div className={mobile ? "relative z-10 grid h-full grid-rows-[1fr_auto] p-6" : "shell relative z-10 grid w-full grid-cols-2 items-center gap-10"}>
        {/* guitar */}
        <div className={mobile ? "relative overflow-hidden" : "relative flex h-[75vh] items-center justify-center"}>
          <GuitarVisual
            construction={family.construction[0]}
            strings={biggest.strings}
            className={mobile ? "absolute left-1/2 top-1/2 h-[120%] -translate-x-1/2 -translate-y-1/2" : "h-full w-auto"}
          />
        </div>

        {/* copy */}
        <div>
          <div className="font-mono text-[11px] text-ice">/ 0{index + 1}</div>
          <div className="mt-2 font-display text-6xl font-bold leading-none lg:text-8xl">{cheapest.code}</div>
          <div className="mt-2 font-display text-2xl uppercase tracking-tight text-steel">{family.name}</div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-steel">
            <span>{cheapest.scale}</span>
            <span>{family.variants.map((v) => `${v.strings}`).join("/")} STRING</span>
            <span className="text-chalk">FROM €{cheapest.fromPrice}</span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-steel">{family.blurb}</p>
          <Link
            href={`/models/${family.slug}`}
            className="group mt-6 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-wide-tech text-chalk"
          >
            Explore {family.name}
            <span className="transition-transform duration-ui group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
