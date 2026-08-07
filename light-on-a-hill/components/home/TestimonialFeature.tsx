"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { objectPosition, src, IMAGES } from "@/content/images";
import { TESTIMONIALS } from "@/content/testimonials";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Editorial social proof — large photography, large type, crossfade between
 *  testimonials. Not a generic slider. */
export function TestimonialFeature() {
  const [i, setI] = useState(0);
  const t = TESTIMONIALS[i];
  const img = IMAGES[t.image];
  const go = (dir: number) => setI((p) => (p + dir + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section className="grid min-h-[92vh] grid-cols-1 bg-paper lg:grid-cols-2">
      <div className="relative order-1 min-h-[45vh] overflow-hidden lg:order-none lg:min-h-full">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={t.image}
            src={src(img, 1400)}
            alt={img.alt}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: objectPosition(img) }}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          />
        </AnimatePresence>
      </div>

      <div className="flex flex-col justify-center px-5 py-20 sm:px-12 lg:px-16">
        <p className="eyebrow text-champagne">In their words</p>
        <div className="mt-10 min-h-[14rem]">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <p className="text-balance font-serif text-3xl leading-[1.1] text-ink sm:text-5xl">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-8">
                <p className="font-sans text-sm font-medium text-ink">{t.attribution}</p>
                <p className="mt-1 font-sans text-[0.72rem] uppercase tracking-label text-mist">{t.detail}</p>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex items-center gap-6">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            &larr;
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            &rarr;
          </button>
          <span className="font-sans text-[0.7rem] tabular-nums tracking-label text-mist">
            {String(i + 1).padStart(2, "0")} / {String(TESTIMONIALS.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
