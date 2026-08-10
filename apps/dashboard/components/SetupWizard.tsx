"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Check, Globe, Link2, MessageSquare, Sparkles, Wind } from "lucide-react";
import { ColorPickerField } from "./ColorPickerField";
import { CopySnippetButton } from "./CopySnippetButton";
import { SubmitButton } from "./SubmitButton";
import { buttonClasses } from "./ui/Button";
import { Input, Textarea } from "./ui/Input";

interface WebsiteResult {
  id: string;
  name: string;
}
interface WidgetResult {
  id: string;
  name: string;
  publicWidgetId?: string;
}

interface SetupWizardProps {
  organizationName: string;
  appOrigin: string;
  initialWebsite: WebsiteResult | null;
  initialWidget: WidgetResult | null;
  hasResource: boolean;
  createWebsiteAction: (formData: FormData) => Promise<WebsiteResult>;
  createWidgetAction: (formData: FormData) => Promise<WidgetResult>;
  importResourceAction: (formData: FormData) => Promise<{ id: string; title: string } | { skipped: true }>;
  customizeWidgetAction: (formData: FormData) => Promise<{ ok: true }>;
  finishAction: () => Promise<void>;
}

const STEP_LABELS = ["Website", "Widget", "Content", "Install"] as const;

function initialStepIndex(hasWebsite: boolean, hasWidget: boolean, hasResource: boolean): number {
  if (!hasWebsite) return 0;
  if (!hasWidget) return 1;
  if (!hasResource) return 2;
  return 3;
}

/**
 * Reuses the exact same underlying server actions the standalone /websites,
 * /widgets, and /resources pages call (see onboarding/setup/page.tsx) -- this is a
 * guided entry point wrapping existing forms inline, not a fork of them. Those pages
 * keep working unchanged for direct visits and for e2e/golden-path.spec.ts.
 */
export function SetupWizard(props: SetupWizardProps) {
  const [stepIndex, setStepIndex] = useState(() =>
    initialStepIndex(!!props.initialWebsite, !!props.initialWidget, props.hasResource),
  );
  const [website, setWebsite] = useState(props.initialWebsite);
  const [widget, setWidget] = useState(props.initialWidget);
  const [importedTitle, setImportedTitle] = useState<string | null>(null);
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

  function handleSkipAll() {
    setError(null);
    startTransition(async () => {
      await props.finishAction();
    });
  }

  const snippet = widget?.publicWidgetId
    ? `<script src="${props.appOrigin}/widget-loader.js" data-widget-id="${widget.publicWidgetId}" defer></script>`
    : null;

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind size={18} strokeWidth={1.75} className="text-accent" />
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Ruach</span>
          </div>
          <button
            type="button"
            onClick={handleSkipAll}
            disabled={isPending}
            className="rounded-sm text-xs text-ink-muted hover:text-ink-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Skip setup
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-6 py-10">
        <div className="mb-8">
          <h1 className="mb-1 text-2xl font-semibold tracking-tight text-ink">
            Let&rsquo;s get {props.organizationName} set up
          </h1>
          <p className="text-sm text-ink-secondary">Four quick steps -- you can skip ahead any time.</p>
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

        <div className="shadow-panel rounded-lg border border-border bg-surface p-6">
          {stepIndex === 0 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                runStep(async () => {
                  const result = await props.createWebsiteAction(formData);
                  setWebsite(result);
                  setStepIndex(1);
                });
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-accent" />
                <h2 className="text-sm font-semibold text-ink">Add your website</h2>
              </div>
              <p className="text-sm text-ink-secondary">
                A website is where a widget lives -- most churches only need one, even with several pages.
              </p>
              <label className="text-sm text-ink-secondary">
                Name
                <Input name="name" required placeholder="Main Website" defaultValue={website?.name} className="mt-1 block w-full" />
              </label>
              <label className="text-sm text-ink-secondary">
                Primary domain
                <Input name="primaryDomain" required placeholder="yourchurch.org" className="mt-1 block w-full" />
              </label>
              <div className="flex justify-end">
                <SubmitButton pendingLabel="Adding...">
                  Continue <ArrowRight size={14} />
                </SubmitButton>
              </div>
            </form>
          )}

          {stepIndex === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                runStep(async () => {
                  const result = await props.createWidgetAction(formData);
                  setWidget(result);
                  setStepIndex(2);
                });
              }}
              className="flex flex-col gap-4"
            >
              <input type="hidden" name="websiteId" value={website?.id ?? ""} />
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-accent" />
                <h2 className="text-sm font-semibold text-ink">Create a widget</h2>
              </div>
              <p className="text-sm text-ink-secondary">
                The widget is the chat assistant itself, embedded on <strong>{website?.name}</strong>.
              </p>
              <label className="text-sm text-ink-secondary">
                Name
                <Input name="name" required placeholder="Main Resource Assistant" defaultValue={widget?.name} className="mt-1 block w-full" />
              </label>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStepIndex(0)} className={buttonClasses("ghost", "md")}>
                  Back
                </button>
                <SubmitButton pendingLabel="Creating...">
                  Continue <ArrowRight size={14} />
                </SubmitButton>
              </div>
            </form>
          )}

          {stepIndex === 2 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                runStep(async () => {
                  const result = await props.importResourceAction(formData);
                  if ("title" in result) setImportedTitle(result.title);
                  setStepIndex(3);
                });
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-2">
                <Link2 size={16} className="text-accent" />
                <h2 className="text-sm font-semibold text-ink">Import your first resource</h2>
              </div>
              <p className="text-sm text-ink-secondary">
                Paste a link to a sermon, podcast episode, or article. You can import in bulk (a whole YouTube
                channel or RSS feed) later from the Resources page -- this is just to see it work.
              </p>
              <label className="text-sm text-ink-secondary">
                URL <span className="font-normal text-ink-muted">(optional -- skip if you'd rather do this later)</span>
                <Input name="url" placeholder="https://youtube.com/watch?v=..." className="mt-1 block w-full" />
              </label>
              {importedTitle && (
                <p className="flex items-center gap-1.5 text-xs text-success">
                  <Check size={13} /> Imported &ldquo;{importedTitle}&rdquo;
                </p>
              )}
              <div className="flex justify-between">
                <button type="button" onClick={() => setStepIndex(1)} className={buttonClasses("ghost", "md")}>
                  Back
                </button>
                <SubmitButton pendingLabel="Importing...">
                  Continue <ArrowRight size={14} />
                </SubmitButton>
              </div>
            </form>
          )}

          {stepIndex === 3 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-accent" />
                <h2 className="text-sm font-semibold text-ink">Customize &amp; install</h2>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  runStep(async () => {
                    await props.customizeWidgetAction(formData);
                  });
                }}
                className="flex flex-col gap-4"
              >
                <input type="hidden" name="widgetId" value={widget?.id ?? ""} />
                <label className="text-sm text-ink-secondary">
                  Assistant name
                  <Input name="assistantName" placeholder="Resource Assistant" className="mt-1 block w-full" />
                </label>
                <label className="text-sm text-ink-secondary">
                  Welcome message
                  <Textarea name="welcomeMessage" rows={2} placeholder="Hi! What are you looking for today?" className="mt-1 block w-full" />
                </label>
                <ColorPickerField label="Brand color" name="primaryColor" defaultValue="#161616" onChange={() => {}} />
                <div className="flex justify-end">
                  <button type="submit" disabled={isPending} className={buttonClasses("secondary", "md")}>
                    {isPending ? "Saving..." : "Save customization"}
                  </button>
                </div>
              </form>

              {snippet && (
                <div className="border-t border-border pt-4">
                  <p className="mb-2 text-sm text-ink-secondary">Copy this snippet into your website&rsquo;s &lt;head&gt;:</p>
                  <div className="flex items-center gap-2 rounded-md bg-ink px-3 py-2.5">
                    <code className="min-w-0 flex-1 truncate text-xs text-white/80">{snippet}</code>
                    <CopySnippetButton text={snippet} />
                  </div>
                </div>
              )}

              <div className="flex justify-between border-t border-border pt-4">
                <button type="button" onClick={() => setStepIndex(2)} className={buttonClasses("ghost", "md")}>
                  Back
                </button>
                <button type="button" disabled={isPending} onClick={() => runStep(props.finishAction)} className={buttonClasses("primary", "md")}>
                  {isPending ? "Finishing..." : "Finish setup"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
