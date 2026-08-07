"use client";

import { motion } from "framer-motion";
import { StudioImage } from "./StudioImage";
import type { ImageKey } from "@/content/images";

/** Cinematic inner-page hero: full-bleed image, eyebrow label, two-line headline. */
export function PageHero({
  label,
  headline,
  image,
  intro,
}: {
  label: string;
  headline: [string, string];
  image: ImageKey;
  intro?: string;
}) {
  return (
    <section className="relative flex h-[82svh] min-h-[560px] items-end overflow-hidden bg-shade">
      <div className="absolute inset-0">
        <StudioImage image={image} priority sizes="100vw" widthHint={2000} />
        <div className="absolute inset-0 bg-gradient-to-b from-shade/30 via-shade/5 to-shade/65" />
      </div>

      <div className="relative z-10 w-full px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-editorial">
          <motion.p
            className="eyebrow text-chalk/80"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            {label}
          </motion.p>
          <h1 className="mt-5 max-w-4xl text-balance font-serif text-display-lg text-chalk">
            {headline.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 + i * 0.1 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          {intro && (
            <motion.p
              className="mt-7 max-w-xl text-[0.98rem] leading-relaxed text-chalk/85"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              {intro}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
