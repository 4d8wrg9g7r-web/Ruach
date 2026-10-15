"use client";

import type { Choice, SlotId } from "@/lib/config/engine";
import { formatUSD } from "@/lib/config/engine";
import { WoodSwatch } from "@/components/visuals/wood";
import { NeckProfileGlyph } from "@/components/visuals/details";

/**
 * A single selectable choice in a configurator step. Renders the right visual
 * for what it represents — a wood grain, a neck-profile cross-section, or a
 * material swatch — and clearly communicates when a choice is unavailable and
 * why, so the reason is never hidden.
 */
export function ChoiceCard({
  choice,
  slotId,
  selected,
  onSelect,
}: {
  choice: Choice;
  slotId: SlotId;
  selected: boolean;
  onSelect: (slug: string) => void;
}) {
  const { wood, option, availability } = choice;
  const disabled = !availability.available;
  const descriptors = wood?.descriptors ?? option?.description;

  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect(choice.slug)}
      disabled={disabled}
      aria-pressed={selected}
      title={disabled ? availability.reason : undefined}
      className={`group relative flex w-full flex-col overflow-hidden border text-left transition-all duration-500 ease-atelier ${
        selected
          ? "border-espresso ring-1 ring-espresso"
          : disabled
            ? "cursor-not-allowed border-brass/15 opacity-45"
            : "border-brass/25 hover:border-brass/60"
      }`}
    >
      {/* Visual */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-plaster">
        {wood ? (
          <WoodSwatch
            wood={wood}
            uid={`cc-${wood.slug}`}
            className={`h-full w-full transition-transform duration-700 ease-atelier ${
              disabled ? "" : "group-hover:scale-[1.05]"
            }`}
          />
        ) : slotId === "neckProfile" ? (
          <div className="flex h-full w-full items-center justify-center p-4 text-wood">
            <NeckProfileGlyph variant={option?.visualKey} className="h-full w-auto" />
          </div>
        ) : (
          <OptionSwatch color={option?.color} label={option?.name ?? ""} empty={option?.visualKey === "none"} />
        )}
        {choice.recommended && !disabled && (
          <span className="absolute right-2 top-2 bg-warmwhite/85 px-2 py-0.5 text-[0.58rem] uppercase tracking-wider2 text-brass">
            Favored
          </span>
        )}
        {selected && (
          <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-espresso text-[0.6rem] text-ivory">
            ✓
          </span>
        )}
      </div>

      {/* Label */}
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-sans text-sm text-ink">{choice.name}</p>
          <span className="shrink-0 font-sans text-xs text-ink-muted">
            {choice.priceModifier === 0 ? "Included" : `+${formatUSD(choice.priceModifier)}`}
          </span>
        </div>
        {Array.isArray(descriptors) ? (
          <p className="mt-1 font-sans text-xs text-ink-muted">{descriptors.join(" · ")}</p>
        ) : descriptors ? (
          <p className="mt-1 font-sans text-xs leading-snug text-ink-muted">{descriptors}</p>
        ) : null}
        {disabled && availability.reason && (
          <p className="mt-2 font-sans text-[0.68rem] leading-snug text-sea">{availability.reason}</p>
        )}
      </div>
    </button>
  );
}

function OptionSwatch({ color, label, empty }: { color?: string; label: string; empty?: boolean }) {
  if (empty || !color) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <span className="font-serif text-lg italic text-ink-muted">{empty ? "None" : label}</span>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center">
      <span
        className="h-14 w-14 rounded-full border border-black/10 shadow-inner"
        style={{ background: color }}
        aria-hidden
      />
    </div>
  );
}
