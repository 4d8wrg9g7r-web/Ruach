import { z } from "zod";

/**
 * The 10 widget shell treatments widget-loader.js can mount (see that file's
 * buildXShell functions) and WidgetStyleField.tsx's picker on the settings page.
 * Single source of truth for the key list + display copy, so the settings UI and
 * the server action's validation can't drift out of sync with each other.
 */
export const WidgetDisplayStyleSchema = z.enum([
  "BUBBLE",
  "SLIDE",
  "INLINE",
  "DOCK",
  "PALETTE",
  "GREETER",
  "SHEET",
  "TAB",
  "RIBBON",
  "LINK",
]);
export type WidgetDisplayStyle = z.infer<typeof WidgetDisplayStyleSchema>;

export interface WidgetDisplayStyleInfo {
  key: WidgetDisplayStyle;
  label: string;
  description: string;
  /** True for the handful of styles where launcherPosition (left/right) actually changes anything -- the rest are inherently edge/center-anchored or have no launcher at all. */
  supportsLauncherPosition: boolean;
}

export const WIDGET_DISPLAY_STYLES: WidgetDisplayStyleInfo[] = [
  { key: "BUBBLE", label: "Classic Corner Bubble", description: "A round launcher that opens a compact card above it. The familiar shape most visitors already expect.", supportsLauncherPosition: true },
  { key: "SLIDE", label: "Slide-In Panel", description: "A quiet edge tab that pulls out a full-height drawer.", supportsLauncherPosition: false },
  { key: "INLINE", label: "Inline Card", description: "No launcher at all -- a permanent card embedded directly in the page. Requires adding a placeholder element to your site.", supportsLauncherPosition: false },
  { key: "DOCK", label: "Bottom Search Dock", description: "A real input stays on screen at all times and grows upward into a full conversation.", supportsLauncherPosition: false },
  { key: "PALETTE", label: "Command Palette", description: "A minimal pill opens a centered, spotlight-style dialog over a dimmed page.", supportsLauncherPosition: false },
  { key: "GREETER", label: "Greeter Bubble", description: "The classic bubble plus a speech-bubble callout that proactively invites the first question.", supportsLauncherPosition: true },
  { key: "SHEET", label: "Full-Screen Sheet", description: "Rises to cover the whole screen, app-style. Roomy and focused.", supportsLauncherPosition: false },
  { key: "TAB", label: "Side Tab", description: "A vertical edge tab pops out a compact card beside it, not a full drawer.", supportsLauncherPosition: false },
  { key: "RIBBON", label: "Top Ribbon", description: "An inviting strip across the top of the page drops down into a panel.", supportsLauncherPosition: false },
  { key: "LINK", label: "Minimal Text Link", description: "No icon or bubble -- just a quiet line of text. The lightest possible footprint.", supportsLauncherPosition: true },
];
