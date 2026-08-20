"use client";

import { WIDGET_DISPLAY_STYLES, type WidgetDisplayStyle } from "@ruach/shared-types";

/**
 * A tiny CSS diagram per style -- not a full interactive mockup (that's
 * WidgetShellPreview.tsx, the real preview pane), just enough of a shape cue to tell
 * the 10 options apart at a glance in a compact grid. Each is a 40x28 "site frame"
 * rectangle with a mark showing roughly where the launcher/panel sits.
 */
function StyleDiagram({ styleKey }: { styleKey: WidgetDisplayStyle }) {
  return (
    <span className="relative block h-7 w-10 shrink-0 rounded-[3px] border border-border-strong bg-surface-muted">
      {styleKey === "BUBBLE" && <span className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full bg-accent" />}
      {styleKey === "GREETER" && (
        <>
          <span className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full bg-accent" />
          <span className="absolute bottom-1 right-2.5 h-1.5 w-3 rounded-sm bg-accent-light" />
        </>
      )}
      {styleKey === "SLIDE" && <span className="absolute inset-y-0 right-0 w-3 rounded-r-[2px] bg-accent" />}
      {styleKey === "TAB" && <span className="absolute right-0 top-1/2 h-3 w-2 -translate-y-1/2 rounded-l-[2px] bg-accent" />}
      {styleKey === "INLINE" && <span className="absolute inset-1 rounded-[2px] border border-dashed border-accent" />}
      {styleKey === "DOCK" && <span className="absolute inset-x-0.5 bottom-0.5 h-1.5 rounded-sm bg-accent" />}
      {styleKey === "PALETTE" && <span className="absolute left-1/2 top-1 h-2 w-5 -translate-x-1/2 rounded-sm bg-accent" />}
      {styleKey === "SHEET" && <span className="absolute inset-x-0 bottom-0 h-2/3 rounded-t-[2px] bg-accent" />}
      {styleKey === "RIBBON" && <span className="absolute inset-x-0 top-0 h-1.5 rounded-t-[2px] bg-accent" />}
      {styleKey === "LINK" && <span className="absolute bottom-1 right-1 h-0.5 w-3 rounded-full bg-accent" />}
    </span>
  );
}

export function WidgetStyleField({
  name,
  defaultValue,
  onChange,
}: {
  name: string;
  defaultValue: WidgetDisplayStyle;
  onChange?: (style: WidgetDisplayStyle) => void;
}) {
  return (
    <fieldset className="grid grid-cols-2 gap-2">
      <legend className="sr-only">Display style</legend>
      {WIDGET_DISPLAY_STYLES.map((style) => (
        <label
          key={style.key}
          className="has-[:checked]:border-accent has-[:checked]:bg-surface-warm has-[:checked]:ring-1 has-[:checked]:ring-accent flex cursor-pointer items-start gap-2.5 rounded-md border border-border-strong p-2.5 transition-colors duration-180 hover:bg-surface-muted"
        >
          <input
            type="radio"
            name={name}
            value={style.key}
            defaultChecked={style.key === defaultValue}
            onChange={() => onChange?.(style.key)}
            className="sr-only"
          />
          <StyleDiagram styleKey={style.key} />
          <span className="min-w-0">
            <span className="block text-xs font-medium text-ink">{style.label}</span>
            <span className="mt-0.5 block text-[11px] leading-snug text-ink-muted">{style.description}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
