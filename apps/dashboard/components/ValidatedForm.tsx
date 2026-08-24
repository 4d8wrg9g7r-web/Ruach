"use client";

import { useState, type FormEvent, type ReactNode } from "react";

/**
 * Replaces the browser's native "Please fill out this field." bubble -- which only
 * ever points at one field at a time and looks/reads differently per browser --
 * with the same styled error banner every server-side validation error on these
 * pages already uses (bg-danger-bg/text-danger). The `required`/`minLength`/etc.
 * attributes stay in place as the real source of truth (via the Constraint
 * Validation API, form.checkValidity()); this only changes how their failure is
 * presented, and still lets a valid submission through to the server action
 * exactly as before.
 */
export function ValidatedForm({
  action,
  className,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  className?: string;
  children: ReactNode;
}) {
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    if (form.checkValidity()) {
      setError(null);
      return;
    }
    e.preventDefault();

    const invalid = Array.from(form.querySelectorAll<HTMLInputElement>(":invalid"));
    const fieldNames = invalid.map((el) => {
      const label = el.labels?.[0]?.textContent ?? el.name;
      // Strip a trailing "(optional -- ...)" aside some labels carry.
      return label.replace(/\s*\(.*\)\s*$/, "").trim();
    });

    setError(
      fieldNames.length > 1
        ? `Fill in the following: ${fieldNames.join(", ")}.`
        : `${fieldNames[0] ?? "This field"} is required.`,
    );
    invalid[0]?.focus();
  }

  return (
    <form action={action} noValidate onSubmit={handleSubmit} className={className}>
      {error && <p className="mb-3 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>}
      {children}
    </form>
  );
}
