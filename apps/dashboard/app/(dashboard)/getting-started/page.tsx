import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { buttonClasses } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { GETTING_STARTED_GUIDES } from "../../../lib/getting-started-guides";
import { noIndexMetadata } from "../../../lib/no-index-metadata";

export const metadata: Metadata = noIndexMetadata;

export default function GettingStartedPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-ink">
          <Compass size={22} className="text-accent" /> Getting Started
        </h1>
        <p className="max-w-2xl text-sm text-ink-secondary">
          A walkthrough of every part of Ruach, with real screenshots from the dashboard. Work through these in
          order, or jump straight to whatever you&rsquo;re setting up.
        </p>
      </div>

      {/* Quick nav */}
      <Card padding="md" className="mb-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-muted">Jump to</p>
        <div className="flex flex-wrap gap-2">
          {GETTING_STARTED_GUIDES.map((guide, i) => (
            <a
              key={guide.id}
              href={`#${guide.id}`}
              className="rounded-full border border-border-strong bg-surface px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors duration-180 hover:border-accent hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {i + 1}. {guide.title}
            </a>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-8">
        {GETTING_STARTED_GUIDES.map((guide, i) => (
          <Card key={guide.id} id={guide.id} padding="none" className="scroll-mt-6 overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[1fr_1.3fr]">
              <div className="p-6">
                <Badge variant="neutral">Step {i + 1}</Badge>
                <h2 className="mb-1.5 mt-3 text-lg font-semibold text-ink">{guide.title}</h2>
                <p className="mb-4 text-sm text-ink-secondary">{guide.summary}</p>
                <ol className="mb-5 flex flex-col gap-2.5">
                  {guide.steps.map((step, stepIndex) => (
                    <li key={step} className="flex items-start gap-2.5 text-sm text-ink">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-warm text-[11px] font-semibold text-accent-dark">
                        {stepIndex + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <Link href={guide.ctaHref} className={buttonClasses("secondary", "sm")}>
                  {guide.ctaLabel}
                </Link>
              </div>
              <div className="border-t border-border bg-surface-muted lg:border-l lg:border-t-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={guide.image} alt={guide.imageAlt} loading="lazy" decoding="async" className="w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-xs text-ink-muted">
        Still stuck on something? Reach out from the{" "}
        <Link href="/settings" className="underline hover:text-ink-secondary">
          Settings
        </Link>{" "}
        page, or email us directly.
      </p>
    </div>
  );
}
