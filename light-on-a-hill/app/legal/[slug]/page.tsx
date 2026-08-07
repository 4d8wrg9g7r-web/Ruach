import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SITE } from "@/content/site";

/**
 * Lightweight legal pages. Placeholder copy the studio should replace with
 * reviewed policy text before launch — maps to CMS `Pages` documents.
 */
const PAGES: Record<string, { title: string; body: string[] }> = {
  privacy: {
    title: "Privacy Policy",
    body: [
      "This placeholder privacy policy should be replaced with reviewed copy before launch.",
      `${SITE.name} collects only the information you provide through the inquiry form — your name, contact details, and the details of your event — in order to respond to your enquiry. We do not sell your information.`,
      "Analytics tools may collect anonymised usage data to help improve the site. You can opt out via your browser's Do Not Track setting.",
    ],
  },
  terms: {
    title: "Terms",
    body: [
      "This placeholder terms page should be replaced with reviewed copy before launch.",
      "All photographs on this site are the property of the studio and may not be reproduced without permission. Session and wedding agreements are provided separately at the time of booking.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) return {};
  return buildMetadata({ title: `${page.title} | ${SITE.name}`, description: page.title, path: `/${slug}` });
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();
  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: page.title, path: `/legal/${slug}` },
        ]}
      />
      <article className="mx-auto max-w-2xl px-5 py-20 sm:px-8 sm:py-28">
        <h1 className="font-serif text-display-sm text-ink">{page.title}</h1>
        <div className="mt-8 space-y-6 text-[1rem] leading-relaxed text-charcoal/80">
          {page.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </article>
    </>
  );
}
