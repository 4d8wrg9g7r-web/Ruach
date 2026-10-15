"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WOODS, woodsByCategory, type Wood, type WoodCategory } from "@/lib/data/woods";
import { WoodSwatch } from "@/components/visuals/wood";

const GROUPS: { cat: WoodCategory; label: string }[] = [
  { cat: "top", label: "Soundboards" },
  { cat: "body", label: "Back & Sides" },
  { cat: "neck", label: "Necks" },
  { cat: "fretboard", label: "Fretboards" },
];

/**
 * Interactive tonewood explorer. Woods are grouped by where they live on the
 * instrument; selecting one expands a detail panel with tone, look, and styles.
 * The "Hear this wood" affordance is intentionally wired but inert — the data
 * model already reserves an `audio` field, so samples drop in later untouched.
 */
export function WoodExplorer({ initialCategory = "body" as WoodCategory }) {
  const [cat, setCat] = useState<WoodCategory>(initialCategory);
  const woods = woodsByCategory(cat);
  const [activeSlug, setActiveSlug] = useState<string>(woods[0]?.slug);
  const active: Wood | undefined = WOODS.find((w) => w.slug === activeSlug) ?? woods[0];

  const selectCat = (c: WoodCategory) => {
    setCat(c);
    setActiveSlug(woodsByCategory(c)[0]?.slug);
  };

  return (
    <div>
      {/* Category tabs */}
      <div className="flex flex-wrap gap-x-8 gap-y-3 border-b border-brass/25 pb-4">
        {GROUPS.map((g) => (
          <button
            key={g.cat}
            onClick={() => selectCat(g.cat)}
            className={`font-sans text-xs uppercase tracking-wider2 transition-colors ${
              cat === g.cat ? "text-espresso" : "text-ink-muted hover:text-ink-soft"
            }`}
          >
            {g.label}
            {cat === g.cat && (
              <motion.span layoutId="wood-tab" className="mt-2 block h-px bg-brass" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        {/* Swatch grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
          {woods.map((w) => {
            const selected = w.slug === activeSlug;
            return (
              <button
                key={w.slug}
                onClick={() => setActiveSlug(w.slug)}
                aria-pressed={selected}
                className="group text-left"
              >
                <div
                  className={`relative aspect-[4/3] overflow-hidden border transition-all duration-500 ease-atelier ${
                    selected ? "border-espresso shadow-lg" : "border-brass/20 hover:border-brass/50"
                  }`}
                >
                  <WoodSwatch
                    wood={w}
                    uid={`ex-${w.slug}`}
                    className="h-full w-full transition-transform duration-700 ease-atelier group-hover:scale-[1.06]"
                  />
                  {w.recommended && (
                    <span className="absolute right-2 top-2 bg-warmwhite/85 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider2 text-brass">
                      Favored
                    </span>
                  )}
                </div>
                <p className="mt-2 font-sans text-sm text-ink">{w.name}</p>
                <p className="font-sans text-xs text-ink-muted">{w.descriptors.join(" · ")}</p>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={active.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="border border-brass/20 bg-warmwhite p-8"
              >
                <div className="mb-6 aspect-[16/9] w-full overflow-hidden border border-brass/15">
                  <WoodSwatch wood={active} uid={`panel-${active.slug}`} className="h-full w-full" />
                </div>
                <h3 className="font-serif text-3xl text-espresso">{active.name}</h3>
                <p className="mt-1 font-sans text-xs uppercase tracking-wider2 text-brass">
                  {active.descriptors.join(" · ")}
                </p>
                <dl className="mt-6 space-y-4 text-sm">
                  <div>
                    <dt className="font-sans text-xs uppercase tracking-wider2 text-ink-muted">Tone</dt>
                    <dd className="mt-1 font-sans leading-relaxed text-ink-soft">{active.tone}</dd>
                  </div>
                  <div>
                    <dt className="font-sans text-xs uppercase tracking-wider2 text-ink-muted">Look</dt>
                    <dd className="mt-1 font-sans leading-relaxed text-ink-soft">{active.visual}</dd>
                  </div>
                  <div>
                    <dt className="font-sans text-xs uppercase tracking-wider2 text-ink-muted">
                      Suits
                    </dt>
                    <dd className="mt-1 font-sans text-ink-soft">{active.styles.join(", ")}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  disabled
                  title="Tone samples coming soon"
                  className="mt-6 flex items-center gap-2 font-sans text-xs uppercase tracking-wider2 text-ink-muted/70"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-brass/40">
                    ▶
                  </span>
                  Hear this wood — soon
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
