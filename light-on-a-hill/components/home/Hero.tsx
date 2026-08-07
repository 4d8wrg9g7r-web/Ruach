"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { StudioImage } from "@/components/StudioImage";
import { SITE } from "@/content/site";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const overlayY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100svh] w-full overflow-hidden bg-ink" data-cursor="explore">
      <motion.div style={{ y }} className="absolute inset-0 h-[118%]">
        <StudioImage image="heroWedding" priority sizes="100vw" widthHint={2000} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/10 to-ink/70" />
        <div className="absolute inset-0 bg-ink/10" />
      </motion.div>

      <motion.div
        style={{ y: overlayY }}
        className="relative z-10 flex h-full flex-col justify-end px-5 pb-16 sm:px-8 sm:pb-20 lg:pb-24"
      >
        <div className="max-w-editorial">
          <motion.p
            className="eyebrow text-paper/80"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            {SITE.region} &middot; Wedding, Portrait &amp; Lifestyle
          </motion.p>

          <h1 className="mt-5 max-w-5xl text-balance font-serif text-display-xl text-paper">
            {["Your story deserves", "to feel this alive."].map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.12 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="mt-7 max-w-md text-[0.95rem] leading-relaxed text-paper/85"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            {SITE.tagline}
          </motion.p>
        </div>
      </motion.div>

      {/* exploration cue + frame counter micro-detail */}
      <motion.div
        style={{ opacity: fade }}
        className="absolute bottom-7 right-5 z-10 flex items-center gap-3 font-sans text-[0.62rem] uppercase tracking-label text-paper/80 sm:right-8"
      >
        <span className="tabular-nums text-champagne">01 / 08</span>
        <span className="hidden sm:inline">Explore the work</span>
        <motion.span
          aria-hidden
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          &darr;
        </motion.span>
      </motion.div>
    </section>
  );
}
