import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarClock, Rocket } from "lucide-react";
import { ContactForm } from "../../../components/marketing/ContactForm";
import { EyebrowLabel } from "../../../components/marketing/EyebrowLabel";
import { FadeIn } from "../../../components/marketing/FadeIn";
import { Card } from "../../../components/ui/Card";
import { buttonClasses } from "../../../components/ui/Button";
import { pageMetadata } from "../../../lib/marketing/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Request a Demo",
  description: "Start Ruach today, or request a demo and we'll walk you through how it fits your church.",
  path: "/demo",
});

export default function DemoPage() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-5 pb-10 pt-16 text-center">
        <FadeIn>
          <EyebrowLabel>Get started</EyebrowLabel>
          <h1 className="text-4xl font-semibold tracking-tight text-ink">Let&rsquo;s find the right fit for your church.</h1>
          <p className="mt-5 text-base leading-relaxed text-ink-secondary">
            Ready to get started, you can sign up in a few minutes. Want to see it on your own content first, request
            a demo below.
          </p>
        </FadeIn>
      </section>

      <section className="border-t border-border py-16">
        <div className="mx-auto grid max-w-5xl gap-6 px-5 sm:grid-cols-2">
          <FadeIn>
            <Card className="flex h-full flex-col">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface-warm text-accent-dark">
                <Rocket size={18} />
              </span>
              <h2 className="mb-1.5 text-sm font-semibold text-ink">Start Ruach</h2>
              <p className="mb-5 flex-1 text-sm leading-relaxed text-ink-secondary">
                Choose a plan and create your account -- most churches are up and running the same day.
              </p>
              <Link href="/signup" className={`${buttonClasses("primary", "md")} justify-center`}>
                Start with Ruach <ArrowRight size={15} />
              </Link>
            </Card>
          </FadeIn>
          <FadeIn delay={0.08}>
            <Card className="flex h-full flex-col">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface-warm text-accent-dark">
                <CalendarClock size={18} />
              </span>
              <h2 className="mb-1.5 text-sm font-semibold text-ink">Request a Demo</h2>
              <p className="mb-5 flex-1 text-sm leading-relaxed text-ink-secondary">
                Tell us about your church and we&rsquo;ll walk you through how Ruach fits before you commit to
                anything.
              </p>
              <a href="#demo-form" className={`${buttonClasses("secondary", "md")} justify-center`}>
                Fill out the form below
              </a>
            </Card>
          </FadeIn>
        </div>
      </section>

      <section id="demo-form" className="scroll-mt-20 border-t border-border bg-surface-muted/60 py-16">
        <div className="mx-auto max-w-2xl px-5">
          <FadeIn>
            <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight text-ink">Request a Demo</h2>
            <Card>
              <ContactForm />
            </Card>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
