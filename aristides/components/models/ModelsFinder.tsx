"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CTAButton, SectionLabel } from "@/components/ui/primitives";
import { GuitarVisual } from "@/components/visual/GuitarVisual";
import { FAMILIES, type Construction, type FamilyId } from "@/lib/data/models";
import { PLATFORMS } from "@/lib/data/configurator";
import { formatEUR } from "@/lib/build";

/** /models — model finder + comparison (§10). Filter by string count,
 *  construction and bridge; an intent quiz recommends a family. */

type BridgeKind = "hardtail" | "tremolo" | "evertune" | "ms-evertune";

// derive which bridge kinds each family supports, from the configurator platforms
function familyBridgeKinds(slug: string): Set<BridgeKind> {
  const kinds = new Set<BridgeKind>();
  for (const p of PLATFORMS.filter((pl) => pl.familySlug === slug)) {
    for (const b of p.bridges) {
      if (b === "floyd-rose") kinds.add("tremolo");
      else if (b === "evertune") kinds.add("evertune");
      else if (b === "evertune-ms") kinds.add("ms-evertune");
      else kinds.add("hardtail");
    }
  }
  return kinds;
}

const STRING_OPTS = [6, 7, 8, 9] as const;
const CONSTRUCTION_OPTS: { id: Construction; label: string }[] = [
  { id: "standard", label: "Standard" },
  { id: "multiscale", label: "Multiscale" },
  { id: "headless", label: "Headless" },
  { id: "offset", label: "Offset" },
  { id: "traditional", label: "Traditional" },
];
const BRIDGE_OPTS: { id: BridgeKind; label: string }[] = [
  { id: "hardtail", label: "Hardtail" },
  { id: "tremolo", label: "Tremolo" },
  { id: "evertune", label: "EverTune" },
  { id: "ms-evertune", label: "Multiscale EverTune" },
];

const INTENTS: { id: string; label: string; family: FamilyId }[] = [
  { id: "low", label: "Low tunings", family: "S" },
  { id: "traditional", label: "Traditional feel", family: "T" },
  { id: "ergo", label: "Maximum ergonomics", family: "STX" },
  { id: "range", label: "Extended range", family: "H" },
  { id: "headless", label: "Headless", family: "H" },
  { id: "custom", label: "Maximum customization", family: "T" },
];

export function ModelsFinder() {
  const [strings, setStrings] = useState<number | null>(null);
  const [construction, setConstruction] = useState<Construction | null>(null);
  const [bridge, setBridge] = useState<BridgeKind | null>(null);
  const [intent, setIntent] = useState<string | null>(null);

  const recommended = intent ? INTENTS.find((i) => i.id === intent)?.family : null;

  const filtered = useMemo(() => {
    return FAMILIES.filter((f) => {
      if (strings && !f.variants.some((v) => v.strings === strings)) return false;
      if (construction && !f.construction.includes(construction)) return false;
      if (bridge && !familyBridgeKinds(f.slug).has(bridge)) return false;
      return true;
    });
  }, [strings, construction, bridge]);

  function reset() {
    setStrings(null);
    setConstruction(null);
    setBridge(null);
    setIntent(null);
  }

  return (
    <div className="pt-24">
      {/* header */}
      <section className="shell">
        <SectionLabel index="/ MODELS">The Range</SectionLabel>
        <h1 className="mt-6 max-w-3xl font-display text-display-md font-medium leading-[0.9]">
          FIND YOUR
          <br />
          <span className="text-steel">PLATFORM.</span>
        </h1>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-steel">
          Six platforms, one engineering philosophy. Tell us what you&apos;re after — or filter by the
          specs that matter — and we&apos;ll point you to the right starting point.
        </p>
      </section>

      {/* intent quiz */}
      <section className="shell mt-14">
        <div className="tech-label mb-4">What are you looking for?</div>
        <div className="flex flex-wrap gap-2">
          {INTENTS.map((i) => (
            <button
              key={i.id}
              onClick={() => setIntent(intent === i.id ? null : i.id)}
              className={
                "rounded-sm border px-4 py-2 font-mono text-[12px] uppercase tracking-wide-tech transition-all duration-ui " +
                (intent === i.id ? "border-ice bg-ice/10 text-chalk" : "border-graphite-line text-steel hover:border-steel hover:text-chalk")
              }
            >
              {i.label}
            </button>
          ))}
        </div>
        {recommended && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-wrap items-center gap-4 rounded border border-ice/40 bg-ice/[0.05] p-5"
          >
            {(() => {
              const f = FAMILIES.find((x) => x.id === recommended)!;
              return (
                <>
                  <div className="relative h-24 w-16 shrink-0 overflow-hidden">
                    <GuitarVisual construction={f.construction[0]} strings={f.variants[f.variants.length - 1].strings} detail="card" className="absolute left-1/2 top-0 h-[280px] -translate-x-1/2" />
                  </div>
                  <div className="flex-1">
                    <div className="tech-label text-ice">Recommended</div>
                    <div className="font-display text-2xl">{f.name}</div>
                    <p className="mt-1 max-w-md text-sm text-steel">{f.blurb}</p>
                  </div>
                  <CTAButton href={`/models/${f.slug}`} variant="secondary">Explore {f.name}</CTAButton>
                </>
              );
            })()}
          </motion.div>
        )}
      </section>

      {/* filters */}
      <section className="shell mt-14">
        <div className="grid gap-6 border-y border-graphite-line py-6 sm:grid-cols-3">
          <FilterRow label="String count">
            {STRING_OPTS.map((n) => (
              <Pill key={n} active={strings === n} onClick={() => setStrings(strings === n ? null : n)}>{n}</Pill>
            ))}
          </FilterRow>
          <FilterRow label="Construction">
            {CONSTRUCTION_OPTS.map((c) => (
              <Pill key={c.id} active={construction === c.id} onClick={() => setConstruction(construction === c.id ? null : c.id)}>{c.label}</Pill>
            ))}
          </FilterRow>
          <FilterRow label="Bridge">
            {BRIDGE_OPTS.map((b) => (
              <Pill key={b.id} active={bridge === b.id} onClick={() => setBridge(bridge === b.id ? null : b.id)}>{b.label}</Pill>
            ))}
          </FilterRow>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-[11px] text-steel">{filtered.length} of {FAMILIES.length} platforms</span>
          <button onClick={reset} className="font-mono text-[11px] uppercase tracking-wide-tech text-steel hover:text-chalk">Reset</button>
        </div>
      </section>

      {/* results grid */}
      <section className="shell mt-8 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            <Link
              key={f.id}
              href={`/models/${f.slug}`}
              className="group relative flex h-72 flex-col overflow-hidden rounded border border-graphite-line bg-graphite-raised/30 p-5 transition hover:border-steel"
              style={{ ["--instrument-tint" as string]: f.tint.join(",") }}
            >
              <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: `radial-gradient(70% 60% at 80% 10%, rgba(${f.tint.join(",")},0.14), transparent 60%)` }} />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="font-display text-4xl">{f.glyph}</div>
                  <div className="mt-1 font-display text-lg text-chalk">{f.name}</div>
                </div>
                <div className="font-mono text-[10px] text-steel">{f.variants.map((v) => v.strings).join("/")} str</div>
              </div>
              <div className="relative mt-auto flex items-end justify-between">
                <div>
                  <div className="tech-label">From</div>
                  <div className="font-display text-xl">{formatEUR(Math.min(...f.variants.map((v) => v.fromPrice)))}</div>
                </div>
                <div className="h-24 w-16 overflow-hidden">
                  <GuitarVisual construction={f.construction[0]} strings={f.variants[f.variants.length - 1].strings} detail="card" className="h-[280px] w-auto -translate-y-2 transition-transform duration-500 group-hover:-translate-y-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded border border-dashed border-graphite-line p-12 text-center">
            <p className="font-display text-2xl">No stock combination matches.</p>
            <p className="mt-2 text-sm text-steel">Almost anything is possible as a custom build.</p>
            <div className="mt-5 flex justify-center"><CTAButton href="/build" variant="primary">Build it custom</CTAButton></div>
          </div>
        )}
      </section>

      {/* comparison table */}
      <section className="border-t border-graphite-line bg-graphite py-24">
        <div className="shell">
          <SectionLabel index="/ COMPARE">Side by side</SectionLabel>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-graphite-line">
                  {["Platform", "Construction", "Strings", "Scale", "From"].map((h) => (
                    <th key={h} className="tech-label py-3 pr-4 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FAMILIES.map((f) => (
                  <tr key={f.id} className="border-b border-graphite-line align-top">
                    <td className="py-4 pr-4">
                      <Link href={`/models/${f.slug}`} className="font-display text-lg hover:text-ice">{f.name}</Link>
                      <div className="font-mono text-[10px] text-steel">{f.tagline}</div>
                    </td>
                    <td className="py-4 pr-4 font-mono text-sm capitalize text-steel">{f.construction.join(" · ")}</td>
                    <td className="py-4 pr-4 font-mono text-sm text-steel">{f.variants.map((v) => v.strings).join("/")}</td>
                    <td className="py-4 pr-4 font-mono text-sm text-steel">{f.variants[0].scale}</td>
                    <td className="py-4 pr-4 font-display text-base">{formatEUR(Math.min(...f.variants.map((v) => v.fromPrice)))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="tech-label mb-3">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-sm border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide-tech transition-all duration-ui " +
        (active ? "border-ice bg-ice/10 text-chalk" : "border-graphite-line text-steel hover:border-steel hover:text-chalk")
      }
    >
      {children}
    </button>
  );
}
