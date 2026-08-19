"use client";

import { useEffect, useRef } from "react";

/**
 * Shared modal accessibility baseline -- neither InstallCodeModal nor
 * DashboardShell's mobile nav drawer had any of this: no Escape-to-close, no focus
 * moved into the dialog on open, no focus returned to whatever triggered it on
 * close. Returns a ref to attach to the dialog's outer container (needs
 * `tabIndex={-1}` there so it's programmatically focusable) plus `role="dialog"`
 * aria-modal="true" for the caller to spread onto that same element.
 */
export function useDialogA11y<T extends HTMLElement = HTMLElement>(isOpen: boolean, onClose: () => void) {
  const dialogRef = useRef<T>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    triggerRef.current = document.activeElement;
    dialogRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
    };
  }, [isOpen, onClose]);

  return dialogRef;
}
