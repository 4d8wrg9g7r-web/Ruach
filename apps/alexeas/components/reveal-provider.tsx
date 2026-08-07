"use client";

import { useEffect } from "react";

/**
 * Lightweight scroll-reveal. Any element with the `.reveal` class fades and
 * lifts into place the first time it enters the viewport. A single shared
 * IntersectionObserver keeps this cheap regardless of how many elements opt in,
 * and it re-scans on route changes. Honors reduced-motion (the CSS neutralizes
 * the transform) so this only ever adds a class — never blocks content.
 */
export function RevealProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const els = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
            els.delete(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    const scan = () => {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
        if (!els.has(el)) {
          els.add(el);
          observer.observe(el);
        }
      });
    };

    scan();
    // Catch content mounted just after navigation.
    const t = window.setTimeout(scan, 120);
    return () => {
      window.clearTimeout(t);
      observer.disconnect();
    };
  });

  return <>{children}</>;
}
