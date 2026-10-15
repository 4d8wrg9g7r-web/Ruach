"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CraftDetail, type CraftKind } from "@/components/visuals/details";
import { Container } from "@/components/ui";

const STEPS: { n: string; title: string; kind: CraftKind; body: string }[] = [
  { n: "01", title: "The Joint", kind: "joint", body: "Where the neck meets the body, the fit is cut and pared by hand. It is what keeps the instrument stable and true — not for a season, but for a lifetime of string tension." },
  { n: "02", title: "The Binding", kind: "binding", body: "The binding is fitted, mitered, and leveled until the transitions disappear. You feel it before you see it: an edge that is simply, quietly right." },
  { n: "03", title: "The Fretwork", kind: "fretwork", body: "Each fret is set, leveled, crowned, and polished. Good fretwork is invisible — it is the reason the instrument plays cleanly everywhere, with nothing in your way." },
  { n: "04", title: "The Voicing", kind: "voicing", body: "Every top is a different piece of wood, so every top is shaped differently. It is thinned and tapped and listened to, again and again, until it gives up its voice." },
  { n: "05", title: "The Finish", kind: "finish", body: "The finish is laid thin — enough to protect the wood and let it deepen with light, never so much that it smothers the resonance underneath." },
  { n: "06", title: "The Inlay", kind: "inlay", body: "Where there is decorative work, it is cut and inlaid by hand, piece by piece. Restraint, mostly — and then one detail worth leaning in for." },
];

/**
 * Scroll-driven craftsmanship sequence. A sticky illustration on the left
 * cross-fades to whichever step is centered in the viewport on the right,
 * turning claims of craftsmanship into something the reader watches unfold.
 */
export function SmallestDetails() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            setActive(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const current = STEPS[active];

  return (
    <section className="bg-espresso-wash py-24 text-ivory sm:py-32">
      <Container>
        <div className="mb-16 flex items-center gap-4">
          <span className="font-serif text-2xl text-brassLight">05</span>
          <span className="overline text-brassLight">The Smallest Details</span>
        </div>
        <h2 className="max-w-3xl font-serif text-4xl leading-tight text-ivory sm:text-6xl">
          Craftsmanship you can see — and some you won’t, for years.
        </h2>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          {/* Sticky visual */}
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <div className="relative aspect-square w-full overflow-hidden border border-brass/25 bg-walnut/40">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.kind}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 flex items-center justify-center p-16 text-brassLight"
                  >
                    <CraftDetail kind={current.kind} className="h-full w-full" strokeWidth={1.1} />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute left-6 top-6 font-serif text-6xl text-ivory/15">
                  {current.n}
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div>
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                data-index={i}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className="border-t border-brass/20 py-10 first:border-t-0 lg:min-h-[52vh] lg:py-16"
              >
                {/* Inline visual on mobile */}
                <div className="mb-6 aspect-[16/9] w-full border border-brass/20 p-8 text-brassLight lg:hidden">
                  <CraftDetail kind={step.kind} className="h-full w-full" />
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="font-serif text-xl text-brassLight">{step.n}</span>
                  <h3 className="font-serif text-3xl text-ivory sm:text-4xl">{step.title}</h3>
                </div>
                <p className="mt-4 max-w-md font-sans leading-relaxed text-parchment/75">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-16 max-w-2xl font-serif text-2xl leading-snug text-parchment sm:text-3xl">
          You’ll notice some of these details immediately. Others you’ll notice
          twenty years from now.
        </p>
      </Container>
    </section>
  );
}
