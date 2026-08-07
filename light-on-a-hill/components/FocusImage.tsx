"use client";

import { motion, useReducedMotion } from "framer-motion";
import { IMAGES, objectPosition, src, type ImageKey } from "@/content/images";

/**
 * Autofocus microinteraction. On first view the image resolves from very
 * slightly soft to sharp while a minimal focus bracket settles and briefly
 * locks, then disappears. A fraction of a second, used sparingly. Reduced-motion
 * users see the sharp image immediately with no bracket.
 */
export function FocusImage({
  image,
  className,
  sizes = "100vw",
  meta,
}: {
  image: ImageKey;
  className?: string;
  sizes?: string;
  meta?: { index?: string; label?: string };
}) {
  const img = IMAGES[image];
  const reduce = useReducedMotion();
  const url = src(img, 1600);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { filter: "blur(9px) brightness(0.92)", scale: 1.05 }}
        whileInView={{ filter: "blur(0px) brightness(1)", scale: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={img.alt}
          sizes={sizes}
          className="h-full w-full object-cover"
          style={{ objectPosition: objectPosition(img) }}
          loading="lazy"
        />
      </motion.div>

      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, scale: 1.3 }}
          whileInView={{ opacity: [0, 1, 1, 0], scale: [1.3, 1, 1, 1] }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], times: [0, 0.3, 0.72, 1] }}
        >
          {/* corner brackets */}
          {[
            "left-0 top-0 border-l-2 border-t-2",
            "right-0 top-0 border-r-2 border-t-2",
            "left-0 bottom-0 border-l-2 border-b-2",
            "right-0 bottom-0 border-r-2 border-b-2",
          ].map((pos) => (
            <span key={pos} className={`absolute h-4 w-4 border-champagne ${pos}`} />
          ))}
        </motion.div>
      )}

      {meta && (
        <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-3 font-sans text-[0.62rem] uppercase tracking-label text-chalk mix-blend-difference">
          {meta.index && <span className="tabular-nums text-champagne">{meta.index}</span>}
          {meta.label && <span>{meta.label}</span>}
        </div>
      )}
    </div>
  );
}
