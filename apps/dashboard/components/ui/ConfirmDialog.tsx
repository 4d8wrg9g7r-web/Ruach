"use client";

import { useEffect, useRef } from "react";
import { buttonClasses } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" for anything destructive/losing access (delete, remove member, cancel plan) -- "primary" for a plain "are you sure" that isn't inherently harmful (e.g. downgrading a plan). */
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Replaces window.confirm() at every destructive/high-stakes call site (bulk delete,
 * remove team member, cancel plan, downgrade plan) -- a native browser dialog is
 * unstyled OS chrome with no branding, breaking out of the app's own design system
 * at exactly the moments trust matters most. Escape closes it and focus moves to the
 * confirm button on open, same baseline every dialog in the app should have (see
 * InstallCodeModal's doc comment for the same gap on the informational-modal side).
 */
export function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", variant = "danger", onConfirm, onCancel }: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        onClick={(e) => e.stopPropagation()}
        className="shadow-panel w-full max-w-sm rounded-lg border border-border bg-surface p-6"
      >
        <h2 id="confirm-dialog-title" className="text-base font-semibold text-ink">
          {title}
        </h2>
        <p id="confirm-dialog-description" className="mt-2 text-sm leading-relaxed text-ink-secondary">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={buttonClasses("secondary", "sm")}>
            {cancelLabel}
          </button>
          <button type="button" ref={confirmRef} onClick={onConfirm} className={buttonClasses(variant === "danger" ? "danger" : "primary", "sm")}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
