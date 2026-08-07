import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { MODELS } from "@/lib/data/models";
import { COMPLETED } from "@/lib/data/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const staticRoutes = [
    "",
    "/instruments",
    "/instruments/completed",
    "/build",
    "/craft",
    "/workshop",
    "/repairs",
    "/contact",
  ];

  const routes: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  for (const m of MODELS) {
    routes.push({ url: `${base}/instruments/${m.slug}`, changeFrequency: "monthly", priority: 0.8 });
  }
  for (const b of COMPLETED) {
    routes.push({ url: `${base}/instruments/completed/${b.id}`, changeFrequency: "yearly", priority: 0.5 });
  }
  return routes;
}
