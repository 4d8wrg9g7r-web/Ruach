import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/marketing/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Ruach collects, uses, and protects data for churches and their visitors.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-ink">Privacy Policy</h1>
      <p className="mb-10 text-sm text-ink-muted">
        This page is a placeholder pending formal legal review and should not be relied on as a complete or
        binding privacy policy until reviewed by counsel.
      </p>

      <div className="flex flex-col gap-8 text-sm leading-relaxed text-ink-secondary">
        <section>
          <h2 className="mb-2 text-base font-semibold text-ink">What we collect</h2>
          <p>
            Account information for church staff (name, email, role), organization and billing details, content
            libraries a church imports or creates, chat questions asked through a church&rsquo;s widget, and Prayer
            Wall submissions made by visitors.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-ink">How it&rsquo;s used</h2>
          <p>
            To operate the product (indexing content, generating conversational responses, moderating the Prayer
            Wall), to communicate with account holders, and to improve the service. Each church&rsquo;s data is
            isolated from every other church&rsquo;s.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-ink">Visitor data</h2>
          <p>
            Widget conversations are not linked to a visitor&rsquo;s identity. Prayer Wall accounts are created with
            an email and password chosen by the visitor, scoped to the church they signed up with.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-base font-semibold text-ink">Contact</h2>
          <p>
            Questions about this policy can be sent to{" "}
            <a href="mailto:privacy@ruachplatform.com" className="text-accent hover:text-accent-dark">
              privacy@ruachplatform.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
