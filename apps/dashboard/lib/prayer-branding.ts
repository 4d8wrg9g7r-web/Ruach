import type { CSSProperties } from "react";
import { hexToRgba } from "./color";

/** Matches --accent in globals.css -- the default look when an org hasn't set a custom prayer-wall brand color. */
export const DEFAULT_PRAYER_WALL_BRAND_COLOR = "#b87b38";

/** Soft wash of the brand color for hero bands and card accents -- warmth without repainting the whole surface. */
export function brandTintStyle(brandColor: string, alpha = 0.08): CSSProperties {
  return { backgroundColor: hexToRgba(brandColor, alpha) };
}

/**
 * buttonClasses("primary") paints a fixed bronze gradient via backgroundImage --
 * overriding backgroundColor alone wouldn't show through it, so this also clears the
 * gradient. Spread onto a button/link's style prop alongside buttonClasses("primary").
 */
export function brandButtonStyle(brandColor: string): CSSProperties {
  // --tw-ring-color is what buttonClasses()'s shared focus-visible:ring-accent
  // utility actually reads -- an inline style always wins over any class-based rule
  // for the same custom property regardless of stylesheet order (the same reasoning
  // brandInputStyle's doc comment below describes), so this reliably brands the
  // focus ring without touching Button.tsx's BASE (which every non-brand button in
  // the dashboard still correctly uses bronze from).
  return { backgroundColor: brandColor, backgroundImage: "none", "--tw-ring-color": brandColor } as CSSProperties;
}

/**
 * The shared <Input> primitive's focus ring is hardcoded to the app's own --accent
 * (correct for staff-facing dashboard forms). Prayer-wall forms need a runtime brand
 * color instead, which can't be layered on top of Input's classes via className --
 * Tailwind utility precedence is stylesheet-order, not className-string-order, so a
 * later class in the string isn't guaranteed to win over an earlier one. Sets a CSS
 * custom property instead and references it via Tailwind's arbitrary-value syntax,
 * so there's no competing static focus-visible:border-accent class to lose to.
 */
export function brandInputStyle(brandColor: string): CSSProperties {
  return { "--brand-color": brandColor } as CSSProperties;
}

export const brandInputClasses =
  "block w-full rounded-sm border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors duration-180 focus-visible:border-[var(--brand-color)] focus-visible:ring-2 focus-visible:ring-[color:var(--brand-color)]/40 disabled:opacity-60";
