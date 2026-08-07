"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const STEPS = [
  { n: "01", title: "Let's talk", body: "Tell us what you're imagining. We'll make sure it's a fit before anything else." },
  { n: "02", title: "We plan", body: "Location, wardrobe, timeline, lighting, and the small details that quietly make the difference." },
  { n: "03", title: "The session", body: "Relaxed, natural, and directed only when it helps. You'll forget the camera is there." },
  { n: "04", title: "Your images", body: "Carefully edited photographs, delivered through a beautiful private gallery you'll return to for years." },
];

/**
 * The Experience — a process timeline with a photographic focus indicator: a
 * small autofocus bracket settles onto each step as it enters view.
 */
export function ProcessTimeline() {
  return (
    <section className="bg-shade px-5 py-28 text-chalk sm:px-8 sm:py-36">
      <div className="mx-auto max-w-editorial">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-champagne">The Experience</p>
            <h2 className="mt-6 max-w-2xl text-balance font-serif text-display-md">
              What it&rsquo;s actually like to work together.
            </h2>
          </div>
          <Link
            href="/the-experience"
            className="inline-flex items-center gap-2 border-b border-chalk/30 pb-1 font-sans text-[0.72rem] uppercase tracking-label transition-colors hover:border-chalk"
          >
            See the experience &rarr;
          </Link>
        </div>

        <ol className="mt-16 border-t border-chalk/10">
          {STEPS.map((step) => (
            <li key={step.n} className="border-b border-chalk/10">
              <motion.div
                className="grid grid-cols-[auto_1fr] items-start gap-6 py-9 sm:grid-cols-[6rem_1fr_2fr] sm:gap-10"
                initial="rest"
                whileInView="active"
                viewport={{ once: true, margin: "-20%" }}
              >
                <div className="relative h-16 w-16">
                  <span className="absolute inset-0 flex items-center justify-center font-sans text-[0.7rem] tabular-nums tracking-label text-champagne">
                    {step.n}
                  </span>
                  {/* autofocus bracket */}
                  {[
                    "left-0 top-0 border-l border-t",
                    "right-0 top-0 border-r border-t",
                    "left-0 bottom-0 border-l border-b",
                    "right-0 bottom-0 border-r border-b",
                  ].map((pos) => (
                    <motion.span
                      key={pos}
                      className={`absolute h-3.5 w-3.5 border-champagne ${pos}`}
                      variants={{ rest: { opacity: 0, scale: 1.4 }, active: { opacity: 1, scale: 1 } }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  ))}
                </div>
                <h3 className="self-center font-serif text-2xl sm:text-3xl">{step.title}</h3>
                <p className="max-w-md text-[0.95rem] leading-relaxed text-chalk/70 sm:self-center">
                  {step.body}
                </p>
              </motion.div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
