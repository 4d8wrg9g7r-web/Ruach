import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://ruachplatform.com";

const MARKETING_PATHS = ["/", "/how-it-works", "/features", "/product/prayer-wall", "/pricing", "/why-ruach", "/faq", "/demo", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return MARKETING_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
