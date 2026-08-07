"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ApertureIcon } from "./ApertureIcon";
import { SITE } from "@/content/site";
import { track } from "@/lib/analytics";

/**
 * The definitive closing section — near-black, generous whitespace, a giant
 * faint aperture behind an editorial headline. Reused on the homepage and every
 * service / location page.
 */
export function CTASection({
  headline = ["Let's make something", "worth remembering."],
  primaryHref = "/inquire",
  primaryLabel = "Check availability",
  secondaryHref = "/investment",
  secondaryLabel = "View investment",
}: {
  headline?: [string, string];
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="grain relative flex min-h-[85vh] items-center overflow-hidden bg-shade text-chalk">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 text-chalk/[0.05]"
        initial={{ rotate: 0, opacity: 0 }}
        whileInView={{ rotate: 20, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <ApertureIcon progress={0.55} outline className="h-full w-full" />
      </motion.div>

      <div className="relative mx-auto w-full max-w-editorial px-5 py-28 text-center sm:px-8">
        <p className="eyebrow mb-8 text-champagne">Availability</p>
        <h2 className="mx-auto max-w-4xl text-balance font-serif text-display-lg">
          {headline[0]}
          <br />
          {headline[1]}
        </h2>

        <div className="mt-14 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <Link
            href={primaryHref}
            onClick={() => track("availability_click", { cta: primaryLabel })}
            data-cursor="explore"
            className="group inline-flex items-center gap-3 rounded-full bg-chalk px-8 py-4 font-sans text-[0.72rem] uppercase tracking-label text-shade transition-transform duration-500 ease-aperture hover:scale-[1.03]"
          >
            {primaryLabel}
            <span className="transition-transform duration-500 ease-aperture group-hover:translate-x-1">&rarr;</span>
          </Link>
          <Link
            href={secondaryHref}
            className="inline-flex items-center gap-2 border-b border-chalk/40 pb-1 font-sans text-[0.72rem] uppercase tracking-label text-chalk/85 transition-colors hover:border-chalk hover:text-chalk"
          >
            {secondaryLabel}
          </Link>
        </div>

        <p className="mt-10 font-sans text-[0.72rem] uppercase tracking-label text-mist">
          {SITE.responseTime}
        </p>
      </div>
    </section>
  );
}
