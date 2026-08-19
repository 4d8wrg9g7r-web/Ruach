import type { Metadata } from "next";
import Link from "next/link";
import { Bell, CheckCircle2, Eye, EyeOff, Heart, Layers, Lock, ShieldCheck, UserX } from "lucide-react";
import { EyebrowLabel } from "../../../../components/marketing/EyebrowLabel";
import { FadeIn } from "../../../../components/marketing/FadeIn";
import { PrayerWallPreview } from "../../../../components/marketing/PrayerWallPreview";
import { buttonClasses } from "../../../../components/ui/Button";
import { pageMetadata } from "../../../../lib/marketing/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Prayer Wall",
  description: "Give your community a thoughtful way to share prayer requests, respond in prayer, and celebrate answered prayers -- while staying in control of what's public.",
  path: "/product/prayer-wall",
});

const SECTIONS = [
  {
    icon: <Heart size={18} />,
    title: "Community prayer",
    description: "A shared space where the church can see what others are walking through and respond -- not a suggestion box that disappears into an inbox.",
  },
  {
    icon: <Eye size={18} />,
    title: "Public, private, and anonymous requests",
    description: "Every person chooses how visible their request is: shared publicly, kept private for staff, or posted anonymously so their name never appears.",
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "Moderation workflow",
    description: "Nothing reaches the public wall unreviewed. Staff and prayer-team moderators approve, categorize, and manage every request before it's visible.",
  },
  {
    icon: <Heart size={18} />,
    title: "“I Prayed” engagement",
    description: "A simple, low-pressure way for the community to respond -- letting the person who submitted a request know they weren't overlooked.",
  },
  {
    icon: <CheckCircle2 size={18} />,
    title: "Answered prayer stories",
    description: "Requests can be marked answered, giving the congregation a place to see and celebrate what God has done together.",
  },
  {
    icon: <Bell size={18} />,
    title: "Notifications for prayer teams",
    description: "New submissions can forward to your prayer team's email, so nothing waits for someone to remember to check the dashboard.",
  },
  {
    icon: <Layers size={18} />,
    title: "Campus-specific walls",
    description: "Multi-campus churches can give each campus its own wall, with its own branding and forwarding, alongside a shared church-wide wall.",
  },
  {
    icon: <Lock size={18} />,
    title: "Privacy and sensitive information",
    description: "Private requests are visible only to authorized church staff based on your configuration. This is a moderation and access control system, not a medical or legal confidentiality guarantee.",
  },
];

export default function PrayerWallMarketingPage() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-5 pb-10 pt-16 text-center">
        <FadeIn>
          <EyebrowLabel>Prayer Wall</EyebrowLabel>
          <h1 className="text-4xl font-semibold tracking-tight text-ink">
            Create a simple place for your church to pray together.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-ink-secondary">
            Give your community a thoughtful way to share requests, respond in prayer, and celebrate answered
            prayers&mdash;while your team remains in control of what is public.
          </p>
        </FadeIn>
      </section>

      <section className="border-t border-border bg-surface-muted/60 py-16">
        <div className="mx-auto grid max-w-5xl items-start gap-12 px-5 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-6 sm:grid-cols-2">
            {SECTIONS.map((section, i) => (
              <FadeIn key={section.title} delay={Math.min(i * 0.04, 0.2)}>
                <div className="h-full rounded-lg border border-border bg-surface p-5">
                  <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface-warm text-accent-dark">
                    {section.icon}
                  </span>
                  <h3 className="mb-1.5 text-sm font-semibold text-ink">{section.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-secondary">{section.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.15} className="lg:sticky lg:top-24">
            <PrayerWallPreview />
          </FadeIn>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-5 text-center">
          <FadeIn>
            <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
              <EyeOff size={13} /> Anonymous by choice
              <span className="mx-1 text-border-strong">&middot;</span>
              <UserX size={13} /> No public identity required
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
              Ready to give your church a place to pray together?
            </h2>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup" className={buttonClasses("primary", "md")}>
                Start with Ruach
              </Link>
              <Link href="/pricing" className={buttonClasses("secondary", "md")}>
                See pricing
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
