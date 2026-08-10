"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Check, HeartHandshake, Sparkles } from "lucide-react";
import { ColorPickerField } from "./ColorPickerField";
import { CopySnippetButton } from "./CopySnippetButton";
import { SubmitButton } from "./SubmitButton";
import { buttonClasses } from "./ui/Button";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";

interface PrayerTestimonyWizardProps {
  organizationName: string;
  publicUrl: string;
  prayerWallEnabled: boolean;
  testimoniesEnabled: boolean;
  testimoniesPageName: string;
  defaultBrandColor: string;
  enablePrayerWallAction: (formData: FormData) => Promise<{ ok: true }>;
  enableTestimoniesAction: (formData: FormData) => Promise<{ ok: true }>;
  exitAction: () => Promise<void>;
}

const STEP_LABELS = ["Prayer Wall", "Testimonies", "Done"] as const;

function initialStepIndex(prayerWallEnabled: boolean, testimoniesEnabled: boolean): number {
  if (!prayerWallEnabled) return 0;
  if (!testimoniesEnabled) return 1;
  return 2;
}

/**
 * Same reused-actions philosophy as SetupWizard.tsx -- calls the exact same
 * organizationService.enablePrayerWall the standalone Settings form already calls,
 * just split across two steps instead of one combined form. "Come back later"
 * (header, any step) marks the wizard seen without requiring anything enabled;
 * PrayerWallModerationPage keeps its own way back in for as long as neither prayer
 * requests nor testimonies is enabled, regardless of whether this was seen before.
 */
export function PrayerTestimonyWizard(props: PrayerTestimonyWizardProps) {
  const [stepIndex, setStepIndex] = useState(() => initialStepIndex(props.prayerWallEnabled, props.testimoniesEnabled));
  const [prayerWallDone, setPrayerWallDone] = useState(props.prayerWallEnabled);
  const [testimoniesDone, setTestimoniesDone] = useState(props.testimoniesEnabled);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runStep(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    });
  }

  function handleComeBackLater() {
    setError(null);
    startTransition(async () => {
      await props.exitAction();
    });
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold tracking-tight text-ink">
            Set up Prayer Wall &amp; Testimonies for {props.organizationName}
          </h1>
          <p className="max-w-lg text-sm text-ink-secondary">
            Two optional, related features -- a public page for prayer requests, and testimonies as a sub-feature
            of that same page. Not ready? You can come back to this anytime.
          </p>
        </div>
        <button
          type="button"
          onClick={handleComeBackLater}
          disabled={isPending}
          className="shrink-0 rounded-sm text-xs text-ink-muted hover:text-ink-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Come back later
        </button>
      </div>

      <ol className="mb-8 flex items-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                i < stepIndex
                  ? "bg-success-bg text-success"
                  : i === stepIndex
                    ? "bg-accent text-white"
                    : "border border-border-strong text-ink-muted"
              }`}
            >
              {i < stepIndex ? <Check size={12} strokeWidth={3} /> : i + 1}
            </span>
            <span className={`text-xs ${i === stepIndex ? "font-medium text-ink" : "text-ink-muted"}`}>{label}</span>
            {i < STEP_LABELS.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>

      {error && <p className="mb-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>}

      <Card padding="md" className="max-w-xl">
        {stepIndex === 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              runStep(async () => {
                await props.enablePrayerWallAction(formData);
                setPrayerWallDone(true);
                setStepIndex(1);
              });
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-2">
              <HeartHandshake size={16} className="text-accent" />
              <h2 className="text-sm font-semibold text-ink">Enable the Prayer Wall</h2>
            </div>
            <p className="text-sm text-ink-secondary">
              A public page where visitors can submit prayer requests and, if they choose, post them publicly for
              others to pray for.
            </p>
            <label className="text-sm text-ink-secondary">
              Forward new submissions to <span className="font-normal text-ink-muted">(optional)</span>
              <Input name="forwardingEmail" type="email" placeholder="staff@example.org" className="mt-1 block w-full max-w-xs" />
            </label>
            <ColorPickerField label="Brand color" name="brandColor" defaultValue={props.defaultBrandColor} onChange={() => {}} />
            <div className="flex justify-end">
              <SubmitButton pendingLabel="Enabling...">
                Continue <ArrowRight size={14} />
              </SubmitButton>
            </div>
          </form>
        )}

        {stepIndex === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-accent" />
              <h2 className="text-sm font-semibold text-ink">Collect testimonies too?</h2>
            </div>
            <p className="text-sm text-ink-secondary">
              &ldquo;Praise reports&rdquo; from your community -- a sub-feature of the same Prayer Wall page, with
              its own page name. Entirely optional, and you can turn it on later from Settings if you skip it now.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                runStep(async () => {
                  await props.enableTestimoniesAction(formData);
                  setTestimoniesDone(true);
                  setStepIndex(2);
                });
              }}
              className="flex flex-col gap-4"
            >
              <label className="text-sm text-ink-secondary">
                Page name
                <Input name="testimoniesPageName" defaultValue="Praise Report" className="mt-1 block w-full max-w-xs" />
              </label>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStepIndex(2)} className={buttonClasses("ghost", "md")}>
                  Skip this step
                </button>
                <SubmitButton pendingLabel="Enabling...">
                  Continue <ArrowRight size={14} />
                </SubmitButton>
              </div>
            </form>
          </div>
        )}

        {stepIndex === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-success" />
              <h2 className="text-sm font-semibold text-ink">You&rsquo;re set up</h2>
            </div>
            <ul className="flex flex-col gap-1.5 text-sm text-ink">
              <li className="flex items-center gap-1.5">
                <Check size={13} className={prayerWallDone ? "text-success" : "text-ink-muted"} />
                Prayer Wall {prayerWallDone ? "enabled" : "not enabled -- you can turn this on later from Settings"}
              </li>
              <li className="flex items-center gap-1.5">
                <Check size={13} className={testimoniesDone ? "text-success" : "text-ink-muted"} />
                Testimonies {testimoniesDone ? `enabled as "${props.testimoniesPageName}"` : "not enabled -- you can turn this on later from Settings"}
              </li>
            </ul>
            {prayerWallDone && (
              <div className="border-t border-border pt-4">
                <p className="mb-2 text-sm text-ink-secondary">Your public page:</p>
                <div className="flex items-center gap-2 rounded-md bg-surface-muted px-3 py-2">
                  <code className="min-w-0 flex-1 truncate text-xs text-ink-secondary">{props.publicUrl}</code>
                  <CopySnippetButton text={props.publicUrl} />
                </div>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-4">
              <button type="button" onClick={() => setStepIndex(1)} className={buttonClasses("ghost", "md")}>
                Back
              </button>
              <button type="button" disabled={isPending} onClick={handleComeBackLater} className={buttonClasses("primary", "md")}>
                {isPending ? "Finishing..." : "Go to Prayer Wall"}
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
