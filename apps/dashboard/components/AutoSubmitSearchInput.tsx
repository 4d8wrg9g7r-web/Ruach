"use client";

import { useRef } from "react";
import { Search } from "lucide-react";

const DEBOUNCE_MS = 400;

/**
 * The status/page-size selects next to this field already auto-submit instantly on
 * change (AutoSubmitSelect) -- this field used to be the odd one out, submitting
 * only on an undiscoverable Enter keypress, with a decorative (non-clickable)
 * search icon that looked like a button but wasn't. Debounced instead of instant
 * (unlike the selects) since every keystroke would otherwise fire a full navigation.
 */
export function AutoSubmitSearchInput({ name, defaultValue, placeholder, className }: { name: string; defaultValue?: string; placeholder?: string; className?: string }) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (
    <div className="relative">
      <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={(e) => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          const form = e.currentTarget.form;
          timeoutRef.current = setTimeout(() => form?.requestSubmit(), DEBOUNCE_MS);
        }}
        className={className}
      />
    </div>
  );
}
