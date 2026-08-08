import type { MetadataRoute } from "next";
import { FAMILIES } from "@/lib/data/models";

const BASE = "https://aristidesinstruments.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/models", "/build", "/arium", "/production", "/gallery", "/in-stock", "/artists", "/story"].map(
    (path) => ({
      url: `${BASE}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    }),
  );
  const modelRoutes = FAMILIES.map((f) => ({
    url: `${BASE}/models/${f.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...staticRoutes, ...modelRoutes];
}
