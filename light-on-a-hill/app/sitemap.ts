import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";
import { SERVICES } from "@/content/services";
import { JOURNAL } from "@/content/journal";
import { LOCATIONS } from "@/content/locations";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (p: string) => new URL(p, SITE.url).toString();

  const staticPages = ["/", "/investment", "/about", "/the-experience", "/journal", "/locations", "/inquire"];

  return [
    ...staticPages.map((p) => ({ url: url(p), changeFrequency: "monthly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...SERVICES.map((s) => ({ url: url(`/${s.slug}`), changeFrequency: "monthly" as const, priority: 0.9 })),
    ...LOCATIONS.map((l) => ({ url: url(`/locations/${l.slug}`), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...JOURNAL.map((post) => ({
      url: url(`/journal/${post.slug}`),
      lastModified: post.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
