const SITE_URL = process.env.NEXTAUTH_URL ?? "https://ruachplatform.com";

/**
 * JSON-LD builders for the marketing site -- centralized so the brand-identity facts
 * (name, description, pricing range) live in one place instead of being retyped at
 * whichever page happens to render them. Rendered via <JsonLd> (components/marketing/
 * JsonLd.tsx). Organization and SoftwareApplication describe the product/company as a
 * whole, not page-specific content, so they only belong on the homepage -- see
 * page.tsx's usage.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ruach",
    url: SITE_URL,
    description: "Ruach helps churches turn sermons, articles, ministry pages, and other resources into a conversational website experience.",
  };
}

/** Eligible for rich results like pricing/rating snippets -- lowPrice/highPrice should track lib/marketing/pricing-data.ts's actual monthly range. */
export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Ruach",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description: "A conversational assistant and Prayer Wall for church websites, grounded entirely in a church's own approved content.",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "29",
      highPrice: "179",
      offerCount: "4",
    },
  };
}

export interface FAQEntrySchema {
  question: string;
  answer: string;
}

/** Makes every passed-in question eligible for FAQ rich results in search. */
export function faqPageSchema(items: FAQEntrySchema[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
