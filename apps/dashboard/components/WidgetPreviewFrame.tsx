"use client";

import { useState } from "react";
import { Laptop, Smartphone } from "lucide-react";

interface WidgetPreviewFrameProps {
  publicWidgetId: string;
  /** Cosmetic-only overrides forwarded to the embed page's previewColor/previewLogo searchParams -- see WidgetEmbedPage's doc comment. Omitted -> the iframe shows the real saved widget, unchanged from before this prop existed. */
  previewColor?: string;
  previewLogo?: string | null;
}

export function WidgetPreviewFrame({ publicWidgetId, previewColor, previewLogo }: WidgetPreviewFrameProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const params = new URLSearchParams();
  if (previewColor) params.set("previewColor", previewColor);
  if (previewLogo !== undefined) params.set("previewLogo", previewLogo ?? "");
  const query = params.toString();
  const src = `/widget/embed/${publicWidgetId}${query ? `?${query}` : ""}`;

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
      {/* overflow-x-auto so the fixed-width device mockup (a deliberate simulated
          screen size, not meant to shrink) scrolls within this panel on narrow
          viewports instead of forcing the whole page wider than the viewport. */}
      <div className="flex justify-center overflow-x-auto rounded-xl bg-surface-warm p-6">
        <div
          className="shadow-panel shrink-0 overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-180"
          style={{ width: device === "desktop" ? 390 : 320, height: 640 }}
        >
          <iframe src={src} title="Widget preview" className="h-full w-full border-0" />
        </div>
      </div>
    </div>
  );
}
