import type { Metadata } from "next";
import { SITE } from "@/content/site";
import { IMAGES, src, type ImageKey } from "@/content/images";

/** Build a page-level Metadata object with sensible OG/Twitter defaults. */
export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: ImageKey;
}): Metadata {
  const url = new URL(opts.path, SITE.url).toString();
  const ogImage = src(IMAGES[opts.image ?? "heroWedding"], 1200);
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE.name,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 800, alt: SITE.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [ogImage],
    },
  };
}

/** LocalBusiness / ProfessionalService structured data for the studio. */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE.url}/#business`,
    name: SITE.name,
    image: src(IMAGES.heroWedding, 1200),
    url: SITE.url,
    email: SITE.email,
    ...(SITE.phone ? { telephone: SITE.phone } : {}),
    areaServed: SITE.serviceAreas.map((name) => ({ "@type": "City", name })),
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.primaryCity,
      addressRegion: "NC",
      addressCountry: "US",
    },
    sameAs: [SITE.social.instagram, SITE.social.facebook, SITE.social.pinterest].filter(Boolean),
    knowsAbout: ["Wedding Photography", "Family Photography", "Portrait Photography", "Engagement Photography"],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: new URL(item.path, SITE.url).toString(),
    })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function articleJsonLd(opts: { title: string; description: string; image: string; date: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    image: opts.image,
    datePublished: opts.date,
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: new URL(opts.path, SITE.url).toString(),
  };
}

/** Small helper component-free JSON-LD injector string. */
export function jsonLdScript(data: object): string {
  return JSON.stringify(data);
}
