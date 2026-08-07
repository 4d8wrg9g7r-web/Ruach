"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FAQ } from "@/content/services";

export function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={faq.q}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span className="font-serif text-xl leading-snug sm:text-2xl">{faq.q}</span>
                <span
                  className={`mt-1 shrink-0 font-sans text-lg text-champagne transition-transform duration-500 ease-aperture ${
                    isOpen ? "rotate-45" : ""
                  }`}
                  aria-hidden
                >
                  +
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-7 text-[0.98rem] leading-relaxed text-charcoal/80">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
