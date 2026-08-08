"use client";

import { clsx } from "clsx";
import type { Finish } from "@/lib/data/finishes";
import { formatEUR } from "@/lib/build";

/**
 * A single finish swatch. Renders the finish's CSS descriptor directly, with a
 * subtle behaviour-specific treatment (§15): gloss highlight, metal sweep on
 * hover, sparkle flecks, chameleon shift on hover.
 */
export function FinishSwatch({
  finish,
  selected,
  onSelect,
  size = "md",
}: {
  finish: Finish;
  selected?: boolean;
  onSelect?: (id: string) => void;
  size?: "sm" | "md" | "lg";
}) {
  const dims = {
    sm: "h-14",
    md: "h-20",
    lg: "h-28",
  };
  return (
    <button
      type="button"
      onClick={() => onSelect?.(finish.id)}
      aria-pressed={selected}
      className={clsx(
        "group relative w-full overflow-hidden rounded-sm border text-left transition-all duration-ui ease-mech",
        selected ? "border-ice ring-1 ring-ice" : "border-graphite-line hover:border-steel",
      )}
    >
      <span
        className={clsx("block w-full", dims[size], finish.behaviour === "metal" && "metal-sweep")}
        style={{ background: finish.swatch }}
      >
        {finish.behaviour === "chameleon" && finish.shiftSwatch && (
          <span
            className="absolute inset-0 opacity-0 transition-opacity duration-500 ease-mech group-hover:opacity-100"
            style={{ background: finish.shiftSwatch }}
          />
        )}
        {finish.behaviour === "gloss" && (
          <span className="absolute inset-0 bg-[radial-gradient(120%_120%_at_28%_16%,rgba(255,255,255,0.35),transparent_45%)]" />
        )}
      </span>
      <span className="flex items-center justify-between gap-2 border-t border-graphite-line bg-graphite-raised/80 px-2.5 py-1.5">
        <span className="truncate text-[11px] text-chalk">{finish.name}</span>
        {finish.priceAdd > 0 && (
          <span className="shrink-0 font-mono text-[10px] text-steel">+{formatEUR(finish.priceAdd)}</span>
        )}
      </span>
      {selected && (
        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ice text-[9px] font-bold text-void">
          ✓
        </span>
      )}
    </button>
  );
}
