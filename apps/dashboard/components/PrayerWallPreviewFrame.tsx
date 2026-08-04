"use client";

import { useState } from "react";
import { Laptop, Smartphone } from "lucide-react";

interface PrayerWallPreviewFrameProps {
  publicPrayerWallId: string;
  /** Cosmetic-only overrides forwarded to PrayerWallPage's previewColor/previewLogo searchParams -- see that page's doc comment. Omitted -> the iframe shows the real saved wall, unchanged from before this prop existed. */
  previewColor?: string;
  previewLogo?: string | null;
}

const VISIBLE_HEIGHT = 560;
/** The wall has no responsive breakpoints, so a "desktop" preview needs to actually
 * render at a real desktop width and then shrink -- rendering it natively at the
 * visible box's narrow width just reflows the same fixed padding/font sizes into a
 * cramped column, which reads as "zoomed in" rather than a true miniature. Mobile
 * doesn't need this: 320px is already a realistic phone width, so it renders 1:1. */
const DESKTOP_NATIVE_WIDTH = 900;

/** Mirrors WidgetPreviewFrame's device-toggle iframe pattern, sized for a full page instead of a narrow chat panel. */
export function PrayerWallPreviewFrame({ publicPrayerWallId, previewColor, previewLogo }: PrayerWallPreviewFrameProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const params = new URLSearchParams();
  if (previewColor) params.set("previewColor", previewColor);
  if (previewLogo !== undefined) params.set("previewLogo", previewLogo ?? "");
  const query = params.toString();
  const src = `/prayer/${publicPrayerWallId}${query ? `?${query}` : ""}`;

  const visibleWidth = device === "desktop" ? 420 : 320;
  const nativeWidth = device === "desktop" ? DESKTOP_NATIVE_WIDTH : visibleWidth;
  const scale = visibleWidth / nativeWidth;
  const nativeHeight = VISIBLE_HEIGHT / scale;

  return (
    <div>
      <div className="mb-3 flex justify-end gap-1">
        <button
          type="button"
          onClick={() => setDevice("desktop")}
          aria-label="Desktop preview"
          className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-180 ${
            device === "desktop" ? "bg-surface-warm text-accent-dark" : "text-ink-muted hover:bg-surface-muted"
          }`}
        >
          <Laptop size={15} />
        </button>
        <button
          type="button"
          onClick={() => setDevice("mobile")}
          aria-label="Mobile preview"
          className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-180 ${
            device === "mobile" ? "bg-surface-warm text-accent-dark" : "text-ink-muted hover:bg-surface-muted"
          }`}
        >
          <Smartphone size={15} />
        </button>
      </div>
      <div className="flex justify-center overflow-x-auto rounded-xl bg-surface-warm p-4">
        <div
          className="shadow-panel shrink-0 overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-180"
          style={{ width: visibleWidth, height: VISIBLE_HEIGHT }}
        >
          <iframe
            src={src}
            title="Prayer wall preview"
            className="border-0"
            style={{ width: nativeWidth, height: nativeHeight, transform: `scale(${scale})`, transformOrigin: "top left" }}
          />
        </div>
      </div>
    </div>
  );
}
