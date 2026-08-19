import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://ruachplatform.com";

/**
 * Disallows everything behind auth (dashboard, API, prayer-wall accounts, widget
 * embeds) -- only the marketing pages and a church's own public prayer wall pages
 * are meant to be indexed.
 */
const DISALLOWED_PATHS = [
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
];

/**
 * AI answer-engine crawlers named explicitly, not just covered by the blanket "*"
 * rule below -- a blanket allow technically permits them too, but naming them keeps
 * the intent legible (this site *wants* to be read by these) and stops a future
 * tightening of the "*" rule from silently sweeping them up along with it. Same
 * disallow list as everyone else: these bots don't get to see anything a normal
 * crawler can't.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot", // OpenAI
  "ClaudeBot",
  "anthropic-ai",
  "Claude-SearchBot", // Anthropic
  "Google-Extended",
  "GoogleOther", // Gemini / AI Overviews
  "PerplexityBot", // Perplexity
  "DuckAssistBot", // DuckDuckGo
  "YouBot", // You.com
  "Meta-ExternalAgent",
  "FacebookBot", // Meta
  "Applebot-Extended", // Apple Intelligence
  "Amazonbot",
  "cohere-ai",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOWED_PATHS },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: DISALLOWED_PATHS },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
