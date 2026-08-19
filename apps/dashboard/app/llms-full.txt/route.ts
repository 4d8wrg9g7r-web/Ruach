import { LLMS_PAGES } from "../../lib/marketing/llms-pages";
import { MARKETING_PLANS } from "../../lib/marketing/pricing-data";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://ruachplatform.com";

/**
 * The full-bundle companion to /llms.txt -- every marketing page's longDescription in
 * one plaintext document, plus the current plan lineup, so an answer engine that
 * fetches this one URL gets the whole site without having to crawl each page. No
 * generated-on timestamp: this is a normal dynamic Vercel route (not a static
 * export), so sitemap.xml's per-page lastmod is already the freshness signal --
 * stamping a request-time date here would just make an unchanged bundle look new
 * on every fetch.
 */
export async function GET() {
  const lines: string[] = ["# Ruach -- Full Site Content", "", `Source: ${SITE_URL}`, ""];

  for (const page of LLMS_PAGES) {
    lines.push(`## ${page.title}`);
    lines.push(`URL: ${SITE_URL}${page.path}`);
    lines.push(page.longDescription);
    lines.push("");
  }

  lines.push("## Pricing Plans");
  for (const plan of MARKETING_PLANS) {
    const price = plan.isCustom ? "Custom pricing (contact us)" : `$${plan.priceMonthly}/mo (or $${plan.priceYearly}/yr)`;
    lines.push(`- ${plan.name}: ${price} -- ${plan.tagline}`);
  }
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
