"use client";

import Link from "next/link";
import { CTAButton, SectionLabel } from "@/components/ui/primitives";
import { GuitarVisual } from "@/components/visual/GuitarVisual";
import { Reveal } from "@/components/ui/Reveal";
import { FINISHES } from "@/lib/data/finishes";
import type { Construction } from "@/lib/data/models";

/**
 * Section 8 — Custom Builds (§8). An asymmetrical editorial wall (never a square
 * Instagram grid). Hover reveals the spec. This is the inspiration → configuration
 * funnel in miniature.
 */

type Build = {
  model: string;
  construction: Construction;
  strings: number;
  finishId: string;
  bridge: string;
  pickups: string;
  span: string;
};

const BUILDS: Build[] = [
  { model: "STX7 Multiscale", construction: "offset", strings: 7, finishId: "cham-purple-red", bridge: "Multiscale EverTune", pickups: "Bare Knuckle", span: "lg:col-span-2 lg:row-span-2" },
  { model: "H/08 Headless", construction: "headless", strings: 8, finishId: "sparkle-nebula", bridge: "Hantug Headless", pickups: "Fishman Fluence", span: "" },
  { model: "060 Standard", construction: "standard", strings: 6, finishId: "metal-worn-steel", bridge: "Hipshot Fixed", pickups: "Seymour Duncan", span: "" },
  { model: "080S Multiscale", construction: "multiscale", strings: 8, finishId: "cham-blueberry", bridge: "Multiscale EverTune", pickups: "Lundgren M8", span: "lg:col-span-2" },
  { model: "T/0 Style", construction: "traditional", strings: 6, finishId: "gold-gloss", bridge: "EverTune", pickups: "EMG", span: "" },
  { model: "S/B5 Bass", construction: "bass", strings: 5, finishId: "marble-storm-gloss", bridge: "Hipshot Bass", pickups: "Dual Soapbar", span: "" },
];

export function CustomBuilds() {
  return (
    <section className="border-t border-graphite-line bg-void py-24">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel index="/ 08">Custom Builds</SectionLabel>
            <h2 className="mt-6 font-display text-display-sm font-medium">
              ONE PLATFORM.
              <br />
              <span className="text-steel">NO TWO ALIKE.</span>
            </h2>
          </div>
          <CTAButton href="/gallery" variant="secondary">
            Explore 1,000+ builds
          </CTAButton>
        </div>

        <div className="mt-12 grid auto-rows-[220px] grid-cols-2 gap-4 lg:grid-cols-4">
          {BUILDS.map((b, i) => {
            const finish = FINISHES.find((f) => f.id === b.finishId);
            return (
              <Reveal key={b.model} className={b.span}>
                <Link
                  href="/build"
                  className="group relative flex h-full items-center justify-center overflow-hidden rounded border border-graphite-line bg-graphite"
                  style={{ ["--instrument-tint" as string]: (finish?.tint ?? [138, 143, 152]).join(",") }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-70"
                    style={{ background: `radial-gradient(70% 70% at 50% 40%, rgba(${(finish?.tint ?? [138,143,152]).join(",")},0.14), transparent 65%)` }}
                  />
                  <GuitarVisual
                    construction={b.construction}
                    strings={b.strings}
                    finish={finish}
                    detail={i === 0 ? "full" : "card"}
                    className="relative h-[130%] w-auto transition-transform duration-700 ease-mech group-hover:scale-[1.04]"
                  />
                  {/* spec overlay on hover */}
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-void/90 via-void/0 to-void/0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="font-display text-lg">{b.model}</div>
                    <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[10px] text-steel">
                      <span>{finish?.name}</span>
                      <span>{b.bridge}</span>
                      <span>{b.pickups}</span>
                      <span>{b.strings}-string</span>
                    </div>
                  </div>
                  <div className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-wide-tech text-steel/70 transition-opacity group-hover:opacity-0">
                    {b.model}
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
