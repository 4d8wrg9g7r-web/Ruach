import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

/**
 * The one bordered-input recipe used everywhere, previously copy-pasted inline
 * across BulkImportForm/ImportResourceForm/every page's own form fields. Fixes the
 * app-wide focus state in one place: focus-visible:ring replaces the old
 * color-only `focus:border-accent` (WCAG 2.4.11). Deliberately a raw element
 * wrapper -- no label/error-message slot, since every call site already hand-rolls
 * its own <label> differently and a compound Field API would be a bigger rewrite
 * than this pass calls for.
 */
const FIELD_CLASSES =
  "block w-full rounded-sm border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors duration-180 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-60";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${FIELD_CLASSES} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${FIELD_CLASSES} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${FIELD_CLASSES} ${className}`} {...props} />;
}
