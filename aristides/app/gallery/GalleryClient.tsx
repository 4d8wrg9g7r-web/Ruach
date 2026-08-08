"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { SectionLabel, DisplayHeading, CTAButton, ModelBadge } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { GuitarVisual } from "@/components/visual/GuitarVisual";
import { finishById, type Finish } from "@/lib/data/finishes";
import type { Construction } from "@/lib/data/models";

/* ------------------------------------------------------------------ *
 * Build dataset — the curated wall of finished custom instruments.
 * Each tile drives a GuitarVisual and carries the facets the filters
 * derive from. Sizes stagger the masonry so it never reads as a grid.
 * ------------------------------------------------------------------ */

type HardwareColor = "black" | "chrome" | "gold";
type TileSize = "sm" | "md" | "lg";

interface Tile {
  id: string;
  code: string;
  family: string;
  construction: Construction;
  strings: number;
  finishId: string;
  bridge: string;
  pickups: string;
  hardwareColor: HardwareColor;
  size: TileSize;
}

const TILES: Tile[] = [
  { id: "b01", code: "060", family: "Standard", construction: "standard", strings: 6, finishId: "cham-purple-red", bridge: "EverTune", pickups: "Bare Knuckle Aftermath", hardwareColor: "black", size: "lg" },
  { id: "b02", code: "070S", family: "Multiscale", construction: "multiscale", strings: 7, finishId: "sparkle-nebula", bridge: "Hipshot Fixed", pickups: "Fishman Fluence Modern", hardwareColor: "chrome", size: "md" },
  { id: "b03", code: "H/08", family: "Headless", construction: "headless", strings: 8, finishId: "metal-worn-steel", bridge: "Hantug Headless", pickups: "Bare Knuckle Ragnarok", hardwareColor: "black", size: "md" },
  { id: "b04", code: "T/0", family: "T Style", construction: "traditional", strings: 6, finishId: "marble-storm-gloss", bridge: "Floyd Rose", pickups: "Seymour Duncan Nazgul / Sentient", hardwareColor: "chrome", size: "sm" },
  { id: "b05", code: "STX7", family: "STX", construction: "offset", strings: 7, finishId: "cham-blueberry", bridge: "Hipshot Fixed", pickups: "Fishman Fluence Modern", hardwareColor: "black", size: "lg" },
  { id: "b06", code: "S/B5", family: "S/B Bass", construction: "bass", strings: 5, finishId: "gold-gloss", bridge: "ABM Bass Fixed", pickups: "Aristides Passive Bass", hardwareColor: "gold", size: "md" },
  { id: "b07", code: "080", family: "Standard", construction: "standard", strings: 8, finishId: "aqua-green", bridge: "EverTune", pickups: "Fishman Fluence Modern", hardwareColor: "chrome", size: "sm" },
  { id: "b08", code: "H/09", family: "Headless", construction: "headless", strings: 9, finishId: "cham-blue-green", bridge: "Hantug Headless", pickups: "Bare Knuckle Aftermath", hardwareColor: "black", size: "lg" },
  { id: "b09", code: "STX8", family: "STX", construction: "offset", strings: 8, finishId: "metal-gold", bridge: "Hipshot Fixed", pickups: "Fishman Fluence Modern", hardwareColor: "gold", size: "md" },
  { id: "b10", code: "060", family: "Standard", construction: "standard", strings: 6, finishId: "bright-red", bridge: "Floyd Rose", pickups: "Seymour Duncan Nazgul / Sentient", hardwareColor: "chrome", size: "sm" },
  { id: "b11", code: "070S", family: "Multiscale", construction: "multiscale", strings: 7, finishId: "emerald-green", bridge: "EverTune", pickups: "Bare Knuckle Aftermath", hardwareColor: "black", size: "md" },
  { id: "b12", code: "H/07", family: "Headless", construction: "headless", strings: 7, finishId: "cham-rose-gold", bridge: "Hantug Headless", pickups: "Fishman Fluence Modern", hardwareColor: "gold", size: "sm" },
  { id: "b13", code: "STX6", family: "STX", construction: "offset", strings: 6, finishId: "sparkle-galactic", bridge: "Hipshot Fixed", pickups: "Bare Knuckle Aftermath", hardwareColor: "black", size: "md" },
  { id: "b14", code: "S/B6", family: "S/B Bass", construction: "bass", strings: 6, finishId: "metal-martian-rust", bridge: "ABM Bass Fixed", pickups: "Aristides Passive Bass", hardwareColor: "chrome", size: "lg" },
  { id: "b15", code: "T/0", family: "T Style", construction: "traditional", strings: 6, finishId: "orange", bridge: "EverTune", pickups: "Seymour Duncan Nazgul / Sentient", hardwareColor: "black", size: "md" },
  { id: "b16", code: "080S", family: "Multiscale", construction: "multiscale", strings: 8, finishId: "dark-teal", bridge: "Hipshot Fixed", pickups: "Fishman Fluence Modern", hardwareColor: "chrome", size: "sm" },
];

/* ---- Enriched tile: attaches the resolved Finish ------------------- */
interface EnrichedTile extends Tile {
  finish: Finish;
}

const RAW_FALLBACK = finishById("raw-arium") as Finish;

const ENRICHED: EnrichedTile[] = TILES.map((t) => ({
  ...t,
  finish: finishById(t.finishId) ?? RAW_FALLBACK,
}));

/* ---- Facets -------------------------------------------------------- */

type FacetKey = "family" | "finishCat" | "hardware" | "bridge" | "strings";

const FACET_DEFS: { key: FacetKey; label: string }[] = [
  { key: "family", label: "Model" },
  { key: "finishCat", label: "Finish Family" },
  { key: "hardware", label: "Hardware" },
  { key: "bridge", label: "Bridge" },
  { key: "strings", label: "Strings" },
];

function valueFor(tile: EnrichedTile, key: FacetKey): string {
  switch (key) {
    case "family":
      return tile.family;
    case "finishCat":
      return tile.finish.category;
    case "hardware":
      return tile.hardwareColor;
    case "bridge":
      return tile.bridge;
    case "strings":
      return String(tile.strings);
  }
}

function optionsFor(key: FacetKey): string[] {
  const seen = new Set<string>();
  for (const t of ENRICHED) seen.add(valueFor(t, key));
  const arr = Array.from(seen);
  if (key === "strings") return arr.sort((a, b) => Number(a) - Number(b));
  return arr.sort((a, b) => a.localeCompare(b));
}

function labelFor(key: FacetKey, value: string): string {
  if (key === "strings") return `${value}-string`;
  if (key === "hardware") return value.charAt(0).toUpperCase() + value.slice(1);
  return value;
}

const SIZE_H: Record<TileSize, string> = {
  sm: "h-72",
  md: "h-[24rem]",
  lg: "h-[32rem]",
};

function ambient(tint: [number, number, number], strength = 0.16): string {
  return `radial-gradient(80% 70% at 50% 30%, rgba(${tint[0]},${tint[1]},${tint[2]},${strength}), transparent 65%)`;
}

/* ================================================================== *
 * Component
 * ================================================================== */

export function GalleryClient() {
  const [filters, setFilters] = useState<Record<FacetKey, string | null>>({
    family: null,
    finishCat: null,
    hardware: null,
    bridge: null,
    strings: null,
  });
  const [active, setActive] = useState<EnrichedTile | null>(null);

  const visible = useMemo(
    () =>
      ENRICHED.filter((t) =>
        FACET_DEFS.every(({ key }) => {
          const f = filters[key];
          return f === null || valueFor(t, key) === f;
        }),
      ),
    [filters],
  );

  const anyActive = Object.values(filters).some((v) => v !== null);

  const setFacet = (key: FacetKey, value: string | null) =>
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));

  const resetAll = () =>
    setFilters({ family: null, finishCat: null, hardware: null, bridge: null, strings: null });

  /* ---- Lightbox keyboard + scroll lock ---------------------------- */
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [active]);

  return (
    <div className="instrument-ambient min-h-screen">
      {/* ---- Header ------------------------------------------------- */}
      <section className="shell pt-24 pb-10 sm:pt-28">
        <Reveal>
          <SectionLabel index="/ GALLERY">Custom Builds</SectionLabel>
        </Reveal>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <Reveal delay={0.05}>
            <DisplayHeading as="h1" size="lg">
              Built once.
              <br />
              Never twice.
            </DisplayHeading>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="max-w-md text-sm leading-relaxed text-steel">
              Every instrument here left Haarlem as a one-off — finish, hardware and range chosen by
              the player it was made for. Filter the wall, open a build, then start your own from
              anything that stops you.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---- Filters ----------------------------------------------- */}
      <section className="shell border-t border-graphite-line py-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <span className="tech-label">Refine</span>
          <span className="font-mono text-[11px] text-steel">
            <span className="text-chalk">{String(visible.length).padStart(2, "0")}</span>
            {" / "}
            {String(ENRICHED.length).padStart(2, "0")} builds
          </span>
        </div>

        <div className="space-y-4">
          {FACET_DEFS.map(({ key, label }) => (
            <div key={key} className="grid gap-2 sm:grid-cols-[9rem_1fr] sm:items-start sm:gap-4">
              <span className="tech-label pt-2">{label}</span>
              <div className="flex flex-wrap gap-2">
                <Pill selected={filters[key] === null} onClick={() => setFacet(key, null)}>
                  All
                </Pill>
                {optionsFor(key).map((opt) => (
                  <Pill
                    key={opt}
                    selected={filters[key] === opt}
                    onClick={() => setFacet(key, opt)}
                  >
                    {labelFor(key, opt)}
                  </Pill>
                ))}
              </div>
            </div>
          ))}
        </div>

        {anyActive && (
          <div className="mt-6">
            <button
              type="button"
              onClick={resetAll}
              className="font-mono text-[11px] uppercase tracking-wide-tech text-ice transition-colors duration-ui hover:text-chalk"
            >
              Reset all filters
            </button>
          </div>
        )}
      </section>

      {/* ---- Masonry wall ------------------------------------------ */}
      <section className="shell pb-28 pt-4">
        {visible.length === 0 ? (
          <div className="border-t border-graphite-line py-24 text-center">
            <p className="font-display text-2xl text-chalk">No builds match that combination.</p>
            <p className="mt-3 text-sm text-steel">
              Loosen a filter — or build the one that does not exist yet.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <CTAButton onClick={resetAll} variant="secondary">
                Reset filters
              </CTAButton>
              <CTAButton href="/build" variant="primary">
                Start a build
              </CTAButton>
            </div>
          </div>
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [column-fill:balance]">
            {visible.map((tile) => (
              <div key={tile.id} className="mb-5 break-inside-avoid">
                <GalleryCard tile={tile} onOpen={() => setActive(tile)} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---- Lightbox ---------------------------------------------- */}
      <AnimatePresence>
        {active && <Lightbox tile={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== *
 * Pill
 * ================================================================== */

function Pill({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={clsx(
        "rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide-tech transition-all duration-ui ease-mech",
        selected
          ? "border-ice bg-ice/10 text-chalk"
          : "border-graphite-line bg-graphite-raised/40 text-steel hover:border-steel hover:text-chalk",
      )}
    >
      {children}
    </button>
  );
}

/* ================================================================== *
 * Gallery card (tile)
 * ================================================================== */

function GalleryCard({ tile, onOpen }: { tile: EnrichedTile; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
      className="group relative block w-full overflow-hidden rounded-sm border border-graphite-line bg-graphite text-left"
    >
      {/* ambient instrument light */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80 transition-opacity duration-editorial ease-mech group-hover:opacity-100"
        style={{ background: ambient(tile.finish.tint) }}
      />
      <div className="pointer-events-none absolute inset-0 grid-tech opacity-[0.05]" />

      {/* visual */}
      <div className={clsx("relative flex items-center justify-center px-6 pt-8", SIZE_H[tile.size])}>
        <GuitarVisual
          construction={tile.construction}
          strings={tile.strings}
          finish={tile.finish}
          hardwareColor={tile.hardwareColor}
          detail="card"
          className="h-full w-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-transform duration-editorial ease-mech group-hover:scale-[1.03]"
        />
      </div>

      {/* caption plate */}
      <div className="relative flex items-center justify-between gap-3 border-t border-graphite-line bg-graphite-raised/70 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-base leading-none text-chalk">{tile.code}</span>
            <span className="font-mono text-[10px] uppercase tracking-wide-tech text-steel-dim">
              {tile.strings}-str
            </span>
          </div>
          <div className="mt-1 truncate font-mono text-[10px] uppercase tracking-wide-tech text-steel">
            {tile.finish.name}
          </div>
        </div>
        <span
          aria-hidden
          className="shrink-0 font-mono text-[11px] text-steel transition-colors duration-ui group-hover:text-ice"
        >
          View →
        </span>
      </div>
    </motion.button>
  );
}

/* ================================================================== *
 * Lightbox
 * ================================================================== */

function Lightbox({ tile, onClose }: { tile: EnrichedTile; onClose: () => void }) {
  const specs: { label: string; value: string }[] = [
    { label: "Model", value: `${tile.family} · ${tile.code}` },
    { label: "Finish", value: `${tile.finish.name} · ${tile.finish.category}` },
    { label: "Pickups", value: tile.pickups },
    { label: "Bridge", value: tile.bridge },
    {
      label: "Hardware",
      value: tile.hardwareColor.charAt(0).toUpperCase() + tile.hardwareColor.slice(1),
    },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label={`${tile.family} ${tile.code} custom build`}
    >
      {/* backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-void/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.985 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 grid max-h-[90vh] w-full max-w-5xl overflow-hidden rounded border border-graphite-line bg-graphite md:grid-cols-[1fr_1fr]"
      >
        {/* close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-sm border border-graphite-line bg-graphite-raised/80 font-mono text-sm text-steel transition-colors duration-ui hover:border-steel hover:text-chalk"
        >
          ✕
        </button>

        {/* visual side */}
        <div className="relative flex min-h-[16rem] items-center justify-center overflow-hidden p-8">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: ambient(tile.finish.tint, 0.22) }}
          />
          <div className="pointer-events-none absolute inset-0 grid-tech opacity-[0.06]" />
          <GuitarVisual
            construction={tile.construction}
            strings={tile.strings}
            finish={tile.finish}
            hardwareColor={tile.hardwareColor}
            detail="full"
            className="relative max-h-[72vh] w-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* spec side */}
        <div className="flex flex-col overflow-y-auto border-t border-graphite-line md:border-l md:border-t-0">
          <div className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <ModelBadge>{tile.family}</ModelBadge>
              <span className="font-mono text-[11px] uppercase tracking-wide-tech text-steel">
                One-off build
              </span>
            </div>

            <DisplayHeading as="h2" size="sm">
              {tile.code}
            </DisplayHeading>

            <dl className="mt-8 space-y-0">
              {specs.map((s) => (
                <div key={s.label} className="border-t border-graphite-line py-3.5">
                  <dt className="tech-label mb-1">{s.label}</dt>
                  <dd className="font-display text-lg leading-tight text-chalk">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-auto border-t border-graphite-line p-8">
            <CTAButton href="/build" variant="primary" size="lg" className="w-full">
              Build something like this
            </CTAButton>
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-wide-tech text-steel-dim">
              Start from this spec in the configurator
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
