"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { objectPosition, src, IMAGES, type ImageKey } from "@/content/images";
import { track } from "@/lib/analytics";

type Frame = { image: ImageKey; index: string; type: string; place: string };

const FRAMES: Frame[] = [
  { image: "heroWedding", index: "01", type: "Wedding", place: "Raleigh, North Carolina" },
  { image: "couplesMountains", index: "02", type: "Couples", place: "Blue Ridge Mountains" },
  { image: "familyOutdoor", index: "03", type: "Family", place: "North Carolina" },
  { image: "weddingDetails", index: "04", type: "Wedding", place: "The Maxwell" },
  { image: "seniorPortrait", index: "05", type: "Senior", place: "Chapel Hill" },
  { image: "couplesField", index: "06", type: "Engagement", place: "Golden hour" },
];

/**
 * Cinematic portfolio reel. On desktop, vertical scroll drives a horizontal
 * filmstrip (the section is tall; an inner sticky viewport translates the track
 * on scroll). On touch, it degrades to a native snap-scroll swipe strip.
 */
export function PortfolioReel() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Track is wider than the viewport; slide it left as we scroll through.
  const x = useTransform(scrollYProgress, [0, 1], ["0vw", `-${FRAMES.length * 46 - 92}vw`]);

  return (
    <>
      {/* Desktop: scroll-driven horizontal reel */}
      <section
        ref={ref}
        className="relative hidden bg-shade text-chalk lg:block"
        style={{ height: `${FRAMES.length * 55}vh` }}
        aria-label="Portfolio reel"
      >
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="absolute left-8 top-8 z-10 font-sans text-[0.62rem] uppercase tracking-label text-mist">
            Selected Work &mdash; {new Date(2026, 0).getFullYear()}
          </div>
          <motion.div style={{ x }} className="flex gap-[4vw] pl-[6vw] pr-[6vw]">
            {FRAMES.map((f) => (
              <ReelFrame key={f.index} frame={f} className="h-[74vh] w-[42vw] shrink-0" />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Touch: native snap-scroll strip */}
      <section className="bg-shade py-14 text-chalk lg:hidden" aria-label="Portfolio reel">
        <div className="mb-5 px-5 font-sans text-[0.62rem] uppercase tracking-label text-mist">Selected Work</div>
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2">
          {FRAMES.map((f) => (
            <ReelFrame key={f.index} frame={f} className="h-[68vh] w-[82vw] shrink-0 snap-center" />
          ))}
        </div>
      </section>
    </>
  );
}

function ReelFrame({ frame, className }: { frame: Frame; className?: string }) {
  const img = IMAGES[frame.image];
  return (
    <figure
      className={`crop-frame group relative overflow-hidden text-chalk ${className ?? ""}`}
      data-cursor="view"
      onClick={() => track("portfolio_view", { frame: frame.type })}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src(img, 1400)}
        alt={img.alt}
        className="h-full w-full object-cover transition-transform duration-[1200ms] ease-aperture group-hover:scale-[1.04]"
        style={{ objectPosition: objectPosition(img) }}
        loading="lazy"
      />
      <figcaption className="absolute bottom-4 left-4 flex items-center gap-3 font-sans text-[0.62rem] uppercase tracking-label mix-blend-difference">
        <span className="tabular-nums text-champagne">{frame.index}</span>
        <span>{frame.type}</span>
        <span className="text-chalk/70">{frame.place}</span>
      </figcaption>
    </figure>
  );
}
