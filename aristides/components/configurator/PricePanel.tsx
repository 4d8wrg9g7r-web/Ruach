"use client";

import { useEffect, useState } from "react";
import type { Build } from "@/lib/data/configurator";
import { computePrice, designationFor, formatEUR, summarize } from "@/lib/build";

/**
 * Sticky build summary + estimated price (§20). Price transitions smoothly when
 * selections change — no obnoxious digit rolling. Final price confirmed by
 * Aristides.
 */
export function PricePanel({ build, compact }: { build: Build; compact?: boolean }) {
  const price = computePrice(build);
  const des = designationFor(build);
  const rows = summarize(build).slice(0, compact ? 3 : 99);
  const display = useAnimatedNumber(price);

  return (
    <div className={compact ? "" : "rounded border border-graphite-line bg-graphite-raised/50 p-5"}>
      {!compact && <div className="tech-label mb-3">Your build</div>}
      {des ? (
        <div className="font-display text-2xl">{des}</div>
      ) : (
        <div className="font-display text-2xl text-steel">Unconfigured</div>
      )}

      {!compact && (
        <ul className="mt-4 space-y-1.5">
          {rows
            .filter((r) => r.label !== "Model")
            .map((r) => (
              <li key={r.label} className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="text-steel-dim">{r.label}</span>
                <span className="truncate text-right text-chalk">{r.value}</span>
              </li>
            ))}
        </ul>
      )}

      <div className="mt-4 border-t border-graphite-line pt-4">
        <div className="tech-label">Estimated price</div>
        <div className="mt-1 font-display text-3xl tabular-nums">
          {price > 0 ? formatEUR(display) : "—"}
        </div>
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide-tech text-steel-dim">
          Final price confirmed by Aristides
        </p>
      </div>
    </div>
  );
}

/** Smoothly interpolates toward a target — no per-digit animation. */
function useAnimatedNumber(target: number): number {
  const [value, setValue] = useState(target);
  useEffect(() => {
    if (typeof window === "undefined") {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = value;
    const t0 = performance.now();
    const dur = 420;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(start + (target - start) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
}
