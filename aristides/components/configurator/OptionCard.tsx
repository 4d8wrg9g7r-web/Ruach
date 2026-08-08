"use client";

import { clsx } from "clsx";
import { formatEUR } from "@/lib/build";

/**
 * A selectable option in the configurator. Invalid options don't appear at all
 * (§21); when an option is present but unavailable for the current combination
 * it renders disabled with an explanation rather than silently failing.
 */
export function OptionCard({
  title,
  desc,
  priceAdd,
  chip,
  selected,
  disabled,
  disabledReason,
  onSelect,
  size = "md",
}: {
  title: string;
  desc?: string;
  priceAdd?: number;
  chip?: string;
  selected?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onSelect?: () => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      title={disabled ? disabledReason : undefined}
      className={clsx(
        "group relative flex w-full items-start gap-3 rounded-sm border p-4 text-left transition-all duration-ui ease-mech",
        size === "sm" && "p-3",
        disabled
          ? "cursor-not-allowed border-graphite-line/60 opacity-40"
          : selected
            ? "border-ice bg-ice/[0.06]"
            : "border-graphite-line bg-graphite-raised/40 hover:-translate-y-[1px] hover:border-steel",
      )}
    >
      {chip && (
        <span
          className="mt-0.5 h-8 w-8 shrink-0 rounded-sm border border-graphite-line"
          style={{ background: chip }}
        />
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="font-display text-[15px] leading-tight text-chalk">{title}</span>
          {typeof priceAdd === "number" && priceAdd > 0 && (
            <span className="shrink-0 font-mono text-[11px] text-steel">+{formatEUR(priceAdd)}</span>
          )}
        </span>
        {desc && !disabled && <span className="mt-1 block text-[12.5px] leading-snug text-steel">{desc}</span>}
        {disabled && disabledReason && (
          <span className="mt-1 block text-[12px] leading-snug text-steel-dim">{disabledReason}</span>
        )}
      </span>
      {selected && (
        <span className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-ice text-[9px] font-bold text-void">
          ✓
        </span>
      )}
    </button>
  );
}
