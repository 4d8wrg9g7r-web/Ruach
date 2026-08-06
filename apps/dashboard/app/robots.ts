import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://ruachplatform.com";

/**
 * Disallows everything behind auth (dashboard, API, prayer-wall accounts, widget
 * embeds) -- only the marketing pages and a church's own public prayer wall pages
 * are meant to be indexed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/resources",
        "/widgets",
        "/websites",
        "/analytics",
        "/prayer-wall",
        "/team",
        "/settings",
        "/billing",
        "/audit-log",
        "/admin",
        "/onboarding",
        "/signup/finishing",
        "/signup/plan",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/widget/embed",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
