"use client";

import { useEffect, useState } from "react";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

interface ColorPickerFieldProps {
  label: string;
  name: string;
  defaultValue: string;
  /** Fired with the current valid hex value (never a partial/invalid typed string) whenever it changes -- only used by callers building a live preview; omitted everywhere else. */
  onChange?: (hex: string) => void;
}

/**
 * Pairs a native color swatch with a typeable hex text field, both submitting the
 * same value under `name`. A bare <input type="color"> has no way to type a hex
 * code directly (some browsers expose one inside the picker popover, but it's not
 * discoverable) -- this makes typing "#b87b38" and clicking the swatch equally
 * valid ways to set the same field. Only the text input carries `name` so the form
 * submits one value; the swatch is a secondary control kept in sync via state.
 */
export function ColorPickerField({ label, name, defaultValue, onChange }: ColorPickerFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const swatchValue = HEX_RE.test(value) ? value : defaultValue;

  useEffect(() => {
    onChange?.(swatchValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swatchValue]);

  return (
    <label className="block max-w-[220px] text-sm text-ink-secondary">
      {label}
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          value={swatchValue}
          onChange={(e) => setValue(e.target.value)}
          aria-label={`${label} swatch`}
          className="h-10 w-12 shrink-0 rounded-sm border border-border-strong bg-surface p-1"
        />
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="#b87b38"
          maxLength={7}
          className="w-full rounded-sm border border-border-strong bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-180 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
        />
      </div>
    </label>
  );
}
