import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/marketing/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service | Ruach",
  description: "The terms governing use of Ruach's conversational assistant and Prayer Wall.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-ink">Terms of Service</h1>
      <p className="mb-10 text-sm text-ink-muted">
        This page is a placeholder pending formal legal review and should not be relied on as a complete or
        binding terms of service until reviewed by counsel.
      </p>

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-ink-secondary">
        <section>
          <h2 className="mb-2 text-base font-semibold text-ink">Using Ruach</h2>
          <p>
            Ruach is provided to churches and ministry organizations to help visitors discover approved content and
            submit prayer requests. Each plan includes specific usage limits, described on the Pricing page.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-ink">Your content</h2>
          <p>
            Your church retains ownership of everything it imports or creates in Ruach. You&rsquo;re responsible for
            having the rights to any content you add, and for what you choose to make public.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-ink">Billing</h2>
          <p>
            Subscriptions renew automatically on a monthly or annual cycle until canceled. Plan changes and
            cancellations can be managed from your billing dashboard.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-ink">Contact</h2>
          <p>
            Questions about these terms can be sent to{" "}
            <a href="mailto:legal@ruachplatform.com" className="text-accent hover:text-accent-dark">
              legal@ruachplatform.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
