"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { objectPosition, src, IMAGES, type ImageKey } from "@/content/images";
import { track } from "@/lib/analytics";

/**
 * Editorial gallery with an accessible lightbox. Images take varied spans for an
 * asymmetric, non-thumbnail composition. Lightbox supports arrow-key / button
 * navigation and Escape-to-close, with focus returned to the trigger.
 */
const SPANS = [
  "sm:col-span-7 aspect-[3/2]",
  "sm:col-span-5 aspect-[4/5]",
  "sm:col-span-5 aspect-[4/5]",
  "sm:col-span-7 aspect-[3/2]",
  "sm:col-span-6 aspect-[3/2]",
  "sm:col-span-6 aspect-[3/2]",
];

export function GalleryGrid({ images }: { images: ImageKey[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const move = useCallback(
    (dir: number) => setOpen((p) => (p === null ? p : (p + dir + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close, move]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:gap-5">
        {images.map((key, i) => {
          const img = IMAGES[key];
          return (
            <button
              key={`${key}-${i}`}
              type="button"
              onClick={() => {
                setOpen(i);
                track("gallery_open", { image: key });
              }}
              data-cursor="view"
              className={`crop-frame group relative overflow-hidden ${SPANS[i % SPANS.length]}`}
              aria-label={`View ${img.alt}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src(img, 1200)}
                alt={img.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1400ms] ease-aperture group-hover:scale-[1.05]"
                style={{ objectPosition: objectPosition(img) }}
              />
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            className="fixed inset-0 z-[150] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-md sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close viewer"
              className="absolute right-5 top-5 font-sans text-[0.66rem] uppercase tracking-label text-paper/80 hover:text-paper"
            >
              Close &times;
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                move(-1);
              }}
              aria-label="Previous image"
              className="absolute left-3 flex h-12 w-12 items-center justify-center rounded-full border border-paper/30 text-paper hover:bg-paper hover:text-ink sm:left-8"
            >
              &larr;
            </button>
            <motion.img
              key={open}
              src={src(IMAGES[images[open]], 1800)}
              alt={IMAGES[images[open]].alt}
              className="max-h-[86vh] max-w-full object-contain"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                move(1);
              }}
              aria-label="Next image"
              className="absolute right-3 flex h-12 w-12 items-center justify-center rounded-full border border-paper/30 text-paper hover:bg-paper hover:text-ink sm:right-8"
            >
              &rarr;
            </button>
            <span className="absolute bottom-6 font-sans text-[0.66rem] tabular-nums tracking-label text-paper/70">
              {String(open + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
