import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Saved-build permutations are effectively infinite; keep them out of the index.
      disallow: "/build/",
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
