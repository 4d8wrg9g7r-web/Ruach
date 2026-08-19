import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  Code2,
  HeartHandshake,
  Palette,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { EyebrowLabel } from "../../../components/marketing/EyebrowLabel";
import { FadeIn } from "../../../components/marketing/FadeIn";
import { buttonClasses } from "../../../components/ui/Button";
import { pageMetadata } from "../../../lib/marketing/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "How Ruach Works",
  description: "The full lifecycle of Ruach -- from connecting your church's content to conversational discovery, installation, and ongoing sync.",
  path: "/how-it-works",
});

const LIFECYCLE = [
  {
    icon: <UploadCloud size={18} />,
    title: "Connect content",
    description:
      "Import sermons, videos, podcasts, articles, website pages, and ministry resources -- your own, or ones from other ministries and speakers you trust -- or point Ruach at a channel or feed to sync ongoing.",
  },
  {
    icon: <Sparkles size={18} />,
    title: "Processing and categorization",
    description:
      "Ruach reads each resource's transcript, description, and metadata, then categorizes it by topic, life situation, and the questions it answers.",
  },
  {
    icon: <Search size={18} />,
    title: "Conversational retrieval",
    description:
      "When a visitor asks a question, Ruach searches only the church's approved, categorized library and responds with grounded, source-linked recommendations.",
  },
  {
    icon: <Code2 size={18} />,
    title: "Website installation",
    description: "A single embed script adds the assistant to any website -- no rebuild, no developer required for day-to-day use.",
  },
  {
    icon: <Palette size={18} />,
    title: "Branding and customization",
    description: "Set an accent color, logo, assistant name, welcome message, and suggested questions so it feels native to your site.",
  },
  {
    icon: <RefreshCw size={18} />,
    title: "Ongoing sync",
    description: "Tracked channels and feeds can check for new content on a schedule, so the library keeps itself current as your church keeps publishing.",
  },
  {
    icon: <BarChart3 size={18} />,
    title: "Analytics",
    description: "See the questions people are asking, which resources are opened, and where content gaps show up.",
  },
  {
    icon: <HeartHandshake size={18} />,
    title: "Prayer Wall workflow",
    description: "Requests can be submitted publicly, privately, or anonymously, then reviewed by staff before anything appears on the public wall.",
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "Safety and moderation",
    description:
      "A safety classifier screens every message before a response is generated, and the church controls exactly what content Ruach can recommend.",
  },
];

const VISITOR_JOURNEY = [
  "Ask a question",
  "Receive a clear response",
  "View recommended resources",
  "Visit a ministry page",
  "Submit a prayer request",
  "Take a next step",
];

const STAFF_JOURNEY = [
  "Add or sync content",
  "Review indexed resources",
  "Customize the assistant",
  "Manage prayer requests",
  "Review analytics",
  "Improve suggested pathways",
];

export default function HowItWorksPage() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-5 pb-12 pt-16 text-center">
        <FadeIn>
          <EyebrowLabel>How it works</EyebrowLabel>
          <h1 className="text-4xl font-semibold tracking-tight text-ink">From published once to found again.</h1>
          <p className="mt-5 text-base leading-relaxed text-ink-secondary">
            Ruach connects to the content your church has already created, organizes it so it can be found through
            natural questions, and gives your website a conversational way to guide people to it.
          </p>
        </FadeIn>
      </section>

      <section className="border-t border-border bg-surface-muted/60 py-16">
        <div className="mx-auto max-w-5xl px-5">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LIFECYCLE.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.05}>
                <div className="h-full rounded-lg border border-border bg-surface p-6">
                  <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface-warm text-accent-dark">
                    {item.icon}
                  </span>
                  <h3 className="mb-1.5 text-sm font-semibold text-ink">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-secondary">{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-5">
          <div className="grid gap-8 md:grid-cols-2">
            <FadeIn>
              <div className="rounded-lg border border-border bg-surface p-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">What visitors experience</h2>
                <ol className="flex flex-col gap-3">
                  {VISITOR_JOURNEY.map((step, i) => (
                    <li key={step} className="flex items-center gap-3 text-sm text-ink">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-warm text-xs font-semibold text-accent-dark">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="rounded-lg border border-border bg-surface p-6">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">What church staff manage</h2>
                <ol className="flex flex-col gap-3">
                  {STAFF_JOURNEY.map((step, i) => (
                    <li key={step} className="flex items-center gap-3 text-sm text-ink">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-warm text-xs font-semibold text-accent-dark">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-sidebar py-16">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <FadeIn>
            <h2 className="text-2xl font-semibold tracking-tight text-white">See it on your own church&rsquo;s content.</h2>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup" className={buttonClasses("primary", "md")}>
                Start with Ruach
              </Link>
              <Link
                href="/demo"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-white/20 px-5 text-sm font-medium text-white transition-colors duration-180 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
              >
                Request a Demo
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
