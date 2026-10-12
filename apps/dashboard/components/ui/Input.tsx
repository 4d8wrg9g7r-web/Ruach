import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

/**
 * The one bordered-input recipe used everywhere, previously copy-pasted inline
 * across BulkImportForm/ImportResourceForm/every page's own form fields. Fixes the
 * app-wide focus state in one place: focus-visible:ring replaces the old
 * color-only `focus:border-accent` (WCAG 2.4.11). Deliberately a raw element
 * wrapper -- no label/error-message slot, since every call site already hand-rolls
 * its own <label> differently and a compound Field API would be a bigger rewrite
 * than this pass calls for.
 *
 * forwardRef so react-hook-form's register() (used by the marketing site's contact
 * form) can attach a real DOM ref -- every existing call site ignores the ref, so
 * this is purely additive.
 */
const FIELD_BASE =
  "block w-full border-[1.5px] border-black/[.12] bg-surface text-sm text-ink outline-none transition-colors duration-180 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-60";
const FIELD_CLASSES = `${FIELD_BASE} rounded-full px-[1.1em] py-2.5`;
const TEXTAREA_CLASSES = `${FIELD_BASE} rounded-md px-[1.1em] py-3`;

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className = "", ...props },
  ref,
) {
  return <input ref={ref} className={`${FIELD_CLASSES} ${className}`} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className = "", ...props },
  ref,
) {
  return <textarea ref={ref} className={`${TEXTAREA_CLASSES} ${className}`} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className = "", ...props },
  ref,
) {
  return <select ref={ref} className={`${FIELD_CLASSES} ${className}`} {...props} />;
});
