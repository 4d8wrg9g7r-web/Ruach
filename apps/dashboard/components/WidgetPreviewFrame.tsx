"use client";

import { useState } from "react";
import { Laptop, Smartphone } from "lucide-react";

export function WidgetPreviewFrame({ publicWidgetId }: { publicWidgetId: string }) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

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
      <div className="flex justify-center rounded-xl bg-surface-warm p-6">
        <div
          className="shadow-panel overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-180"
          style={{ width: device === "desktop" ? 390 : 320, height: 640 }}
        >
          <iframe src={`/widget/embed/${publicWidgetId}`} title="Widget preview" className="h-full w-full border-0" />
        </div>
      </div>
    </div>
  );
}
