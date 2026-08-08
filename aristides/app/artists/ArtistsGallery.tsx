"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CTAButton, TechSpec, ModelBadge } from "@/components/ui/primitives";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { GuitarVisual } from "@/components/visual/GuitarVisual";
import { ARTISTS, type Artist } from "@/lib/data/artists";
import { finishById } from "@/lib/data/finishes";
import type { Construction } from "@/lib/data/models";

/**
 * Artists gallery (§28). Editorial masonry of portraits that colourise on hover,
 * discipline filter pills, and an accessible detail modal (Esc + backdrop close)
 * pairing a large portrait with the artist's instrument, pull-quote and specs.
 *
 * The build spec below is view-local presentation, not shared data: it maps each
 * artist's model string to a body construction, string count and a stand-in
 * finish so the GuitarVisual reads correctly. No shared file is touched.
 */

interface BuildSpec {
  construction: Construction;
  strings: number;
  finishId: string;
}

const BUILD: Record<string, BuildSpec> = {
  a1: { construction: "offset", strings: 8, finishId: "purple-gloss" },
  a2: { construction: "standard", strings: 7, finishId: "aqua-green" },
  a3: { construction: "headless", strings: 9, finishId: "cham-blue-green" },
  a4: { construction: "bass", strings: 6, finishId: "cerulean-blue" },
  a5: { construction: "traditional", strings: 6, finishId: "orange" },
  a6: { construction: "multiscale", strings: 8, finishId: "bright-green" },
};

const FALLBACK: BuildSpec = { construction: "standard", strings: 6, finishId: "anthracite" };

function buildFor(id: string): BuildSpec {
  return BUILD[id] ?? FALLBACK;
}

function discipline(role: string): "GUITAR" | "BASS" | "SESSION" {
  if (/bass/i.test(role)) return "BASS";
  if (/session|producer/i.test(role)) return "SESSION";
  return "GUITAR";
}

const DISCIPLINE_LABEL: Record<string, string> = {
  ALL: "All",
  GUITAR: "Guitar",
  BASS: "Bass",
  SESSION: "Session / Producers",
};

// Per-tile aspect rhythm so the masonry reads editorial, not uniform.
const ASPECTS = ["4 / 5.4", "4 / 4.5", "4 / 5", "4 / 4.4", "4 / 5.2", "4 / 4.6"];

function tint(a: Artist, alpha: number): string {
  return `rgba(${a.finishTint.join(",")},${alpha})`;
}

export function ArtistsGallery() {
  const [filter, setFilter] = useState<string>("ALL");
  const [active, setActive] = useState<Artist | null>(null);

  const filters = useMemo(() => {
    const present = new Set(ARTISTS.map((a) => discipline(a.role)));
    return ["ALL", ...["GUITAR", "BASS", "SESSION"].filter((d) => present.has(d as never))];
  }, []);

  const shown = useMemo(
    () => (filter === "ALL" ? ARTISTS : ARTISTS.filter((a) => discipline(a.role) === filter)),
    [filter],
  );

  // Esc-to-close + scroll lock while the modal is open.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active]);

  const activeBuild = active ? buildFor(active.id) : null;
  const activeFinish = activeBuild ? finishById(activeBuild.finishId) : undefined;

  return (
    <>
      {/* ---- Filter pills ------------------------------------------- */}
      <div className="mt-10 flex flex-wrap items-center gap-2.5">
        {filters.map((f) => {
          const on = f === filter;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={on}
              className={[
                "rounded-sm border px-3.5 py-2 font-mono text-[11px] uppercase tracking-wide-tech transition-colors duration-ui ease-mech",
                on
                  ? "border-steel bg-graphite-raised text-chalk"
                  : "border-graphite-line bg-transparent text-steel hover:border-steel hover:text-chalk",
              ].join(" ")}
            >
              {DISCIPLINE_LABEL[f] ?? f}
            </button>
          );
        })}
        <span className="ml-auto hidden font-mono text-[11px] text-steel-dim sm:block">
          {String(shown.length).padStart(2, "0")} / {String(ARTISTS.length).padStart(2, "0")}
        </span>
      </div>

      {/* ---- Editorial masonry -------------------------------------- */}
      <motion.div layout className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
        <AnimatePresence initial={false}>
          {shown.map((a, i) => {
            const b = buildFor(a.id);
            return (
              <motion.button
                key={a.id}
                type="button"
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
                onClick={() => setActive(a)}
                aria-label={`View ${a.name} — ${a.model}`}
                className="group mb-4 block w-full break-inside-avoid text-left"
              >
                <EditorialImage
                  tone="mono"
                  seed={i}
                  aspect={ASPECTS[i % ASPECTS.length]}
                  label={String(i + 1).padStart(2, "0")}
                  className="grayscale transition-all duration-700 ease-mech group-hover:grayscale-0"
                >
                  {/* ambient finish glow, only on hover */}
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(85% 65% at 50% 88%, ${tint(a, 0.34)}, transparent 72%)`,
                    }}
                  />
                  <div className="absolute inset-x-4 bottom-4">
                    <div className="tech-label" style={{ color: `rgb(${a.finishTint.join(",")})` }}>
                      {a.genre}
                    </div>
                    <div className="mt-1 font-display text-xl leading-tight text-chalk">{a.name}</div>
                    <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-steel">
                      <span>{a.model}</span>
                      <span className="h-px flex-1 bg-graphite-line/80" />
                      <span className="opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        View →
                      </span>
                    </div>
                  </div>
                </EditorialImage>
                <div className="mt-2 flex items-center justify-between">
                  <span className="tech-label">{a.role}</span>
                  <ModelBadge>{b.strings} STR</ModelBadge>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* ---- Detail modal ------------------------------------------- */}
      <AnimatePresence>
        {active && activeBuild && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* backdrop */}
            <button
              type="button"
              aria-label="Close"
              onClick={() => setActive(null)}
              className="absolute inset-0 bg-void/80 backdrop-blur-sm"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`${active.name} — ${active.model}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
              className="relative z-10 max-h-[92vh] w-full max-w-shell overflow-y-auto rounded-sm border border-graphite-line bg-graphite frosted"
            >
              {/* ambient tint from the artist finish */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-64"
                style={{ background: `radial-gradient(70% 100% at 50% 0%, ${tint(active, 0.16)}, transparent 70%)` }}
              />

              <div className="relative flex items-center justify-between border-b border-graphite-line px-6 py-4 sm:px-10">
                <span className="font-mono text-[11px] uppercase tracking-wide-tech text-steel">
                  / Artist Profile
                </span>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="font-mono text-[11px] uppercase tracking-wide-tech text-steel transition-colors duration-ui hover:text-chalk"
                >
                  Close ✕
                </button>
              </div>

              <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                {/* portrait */}
                <div className="relative">
                  <div
                    aria-hidden
                    className="absolute -inset-6 -z-10 blur-2xl"
                    style={{ background: `radial-gradient(60% 60% at 50% 60%, ${tint(active, 0.28)}, transparent 70%)` }}
                  />
                  <EditorialImage tone="mono" seed={3} aspect="4 / 5" label="Portrait">
                    <div className="absolute inset-x-4 bottom-4">
                      <div className="tech-label" style={{ color: `rgb(${active.finishTint.join(",")})` }}>
                        {active.genre}
                      </div>
                      <div className="mt-1 font-display text-2xl">{active.name}</div>
                    </div>
                  </EditorialImage>
                </div>

                {/* copy + instrument + specs */}
                <div className="flex flex-col">
                  <blockquote className="font-display text-display-sm font-medium leading-[1.05] text-balance text-chalk">
                    <span className="text-steel">“</span>
                    {active.quote}
                    <span className="text-steel">”</span>
                  </blockquote>
                  <div className="mt-3 font-mono text-[11px] uppercase tracking-wide-tech text-steel">
                    {active.name} — {active.role}
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4">
                    <TechSpec label="Model" value={active.model} />
                    <TechSpec label="Discipline" value={DISCIPLINE_LABEL[discipline(active.role)] ?? active.role} />
                    <TechSpec label="Genre" value={active.genre} />
                    <TechSpec label="Strings" value={`${activeBuild.strings}-string`} sub={activeFinish?.name} />
                  </div>

                  <div className="relative mt-8 flex-1 overflow-hidden rounded-sm border border-graphite-line bg-void/60">
                    <div className="tech-label absolute left-4 top-3 z-10">The Instrument</div>
                    <div className="flex items-center justify-center py-6">
                      <GuitarVisual
                        construction={activeBuild.construction}
                        strings={activeBuild.strings}
                        finish={activeFinish}
                        detail="full"
                        className="h-[46vh] max-h-[420px] w-auto"
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <CTAButton href="/build" size="lg">
                      Build this platform
                    </CTAButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
