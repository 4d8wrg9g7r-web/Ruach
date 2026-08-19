import { LLMS_PAGES, type LlmsPage } from "../../lib/marketing/llms-pages";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://ruachplatform.com";

const SECTION_ORDER: LlmsPage["section"][] = ["Product", "Pricing", "Company", "Resources", "Legal"];

/**
 * The llms.txt index (llmstxt.org) -- a short, structured summary an AI answer engine
 * can fetch instead of crawling and inferring the site from rendered HTML. Content
 * comes entirely from lib/marketing/llms-pages.ts, so it can't drift from what
 * sitemap.ts/robots.ts already expose; see /llms-full.txt for the expanded version.
 */
export async function GET() {
  const lines: string[] = [
    "# Ruach",
    "",
    "> A conversational assistant and moderated Prayer Wall for church websites -- grounded entirely in a church's own approved content, not open-ended chat.",
    "",
    "Ruach helps churches turn sermons, articles, ministry pages, and other resources into a conversational website experience. It installs as a small embed script on any existing website and never answers from outside a church's own approved content library. Learn more at " +
      SITE_URL +
      ".",
    "",
  ];

  for (const section of SECTION_ORDER) {
    const pages = LLMS_PAGES.filter((page) => page.section === section);
    if (pages.length === 0) continue;
    lines.push(`## ${section}`);
    for (const page of pages) {
      lines.push(`- [${page.title}](${SITE_URL}${page.path}): ${page.description}`);
    }
    lines.push("");
  }

  lines.push("## Optional");
  lines.push(`- [Full site content](${SITE_URL}/llms-full.txt): every page above, expanded.`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
