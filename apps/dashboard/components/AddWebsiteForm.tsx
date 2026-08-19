"use client";

import { useState, useTransition } from "react";
import { buttonClasses } from "./ui/Button";
import { Input } from "./ui/Input";
import { useToast } from "./ui/Toast";
import type { FormActionResult } from "../lib/form-errors";

/**
 * Reference implementation of the inline-field-error pattern (see
 * lib/form-errors.ts) -- errors returned by the action land under the specific
 * field that caused them (aria-invalid + a red message right below the input),
 * not as a floating toast with no indication of which of the two fields is wrong.
 * A thrown error (not the expected validation shape) still falls back to a toast --
 * that path means something actually unexpected happened, not a fixable input.
 */
export function AddWebsiteForm({ action }: { action: (formData: FormData) => Promise<FormActionResult | void> }) {
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const { showToast } = useToast();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFieldErrors({});
    setFormError(null);
    startTransition(async () => {
      try {
        const result = await action(formData);
        if (result?.fieldErrors) setFieldErrors(result.fieldErrors);
        if (result?.formError) setFormError(result.formError);
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Couldn't add that website. Please try again.", "error");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col">
          <label htmlFor="add-website-name" className="text-sm text-ink-secondary">
            Name
          </label>
          <Input
            id="add-website-name"
            name="name"
            required
            placeholder="Main Website"
            disabled={isPending}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "add-website-name-error" : undefined}
            className="mt-1 block"
          />
          {fieldErrors.name && (
            <p id="add-website-name-error" className="mt-1 text-xs text-danger">
              {fieldErrors.name}
            </p>
          )}
        </div>
        <div className="flex flex-col">
          <label htmlFor="add-website-domain" className="text-sm text-ink-secondary">
            Primary domain
          </label>
          <Input
            id="add-website-domain"
            name="primaryDomain"
            required
            placeholder="localhost:3000"
            disabled={isPending}
            aria-invalid={Boolean(fieldErrors.primaryDomain)}
            aria-describedby={fieldErrors.primaryDomain ? "add-website-domain-error" : undefined}
            className="mt-1 block"
          />
          {fieldErrors.primaryDomain && (
            <p id="add-website-domain-error" className="mt-1 text-xs text-danger">
              {fieldErrors.primaryDomain}
            </p>
          )}
        </div>
        <button type="submit" disabled={isPending} className={buttonClasses("primary", "md")}>
          {isPending ? "Adding..." : "Add website"}
        </button>
      </div>
      {formError && <p className="text-xs text-danger">{formError}</p>}
    </form>
  );
}
