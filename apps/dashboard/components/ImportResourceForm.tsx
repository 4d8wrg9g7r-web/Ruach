"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { buttonClasses } from "./ui/Button";

const PROCESSING_STEPS = [
  "Fetching content",
  "Extracting metadata",
  "Finding transcript",
  "Preparing for review",
];

/**
 * Mock providers resolve in a single fast round trip -- there's no real multi-stage
 * async job to poll (no background queue exists yet, by design). This timeline is a
 * decorative pacing overlay driven by genuine React pending state (useTransition), not
 * fabricated progress: it plays for as long as the real server action is actually in
 * flight, cycling through labels on a fixed interval until the action's redirect()
 * navigates the page away.
 */
export function ImportResourceForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [isPending, startTransition] = useTransition();
  const [stepIndex, setStepIndex] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isPending) {
      setStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, PROCESSING_STEPS.length - 1));
    }, 450);
    return () => clearInterval(interval);
  }, [isPending]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await action(formData);
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grow text-sm text-ink-secondary">
          URL
          <input
            name="url"
            required
            disabled={isPending}
            placeholder="https://..."
            className="mt-1 block w-full rounded border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors duration-180 focus:border-accent disabled:opacity-60"
          />
        </label>
        <button type="submit" disabled={isPending} className={buttonClasses("primary", "md")}>
          {isPending ? "Analyzing..." : "Analyze Resource"}
        </button>
      </div>

      {isPending && (
        <ul className="flex flex-col gap-1.5 rounded-md bg-surface-muted p-3">
          {PROCESSING_STEPS.map((step, i) => (
            <li key={step} className="flex items-center gap-2 text-xs">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-180 ${
                  i <= stepIndex ? "bg-accent" : "bg-border-strong"
                }`}
              />
              <span className={i <= stepIndex ? "text-ink" : "text-ink-muted"}>{step}</span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
