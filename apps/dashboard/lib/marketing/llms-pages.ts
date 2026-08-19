/**
 * The curated index behind /llms.txt and /llms-full.txt (llmstxt.org). React pages
 * can't be reliably stringified into plain text at request time -- JSX, not
 * markdown -- so this is hand-authored instead of derived from the rendered pages,
 * same tradeoff pageMetadata()'s title/description already accepts for search. The
 * one manual duty this creates: adding a top-level marketing page means adding it
 * here too, same as it already means adding it to sitemap.ts's MARKETING_PATHS.
 */
export interface LlmsPage {
  path: string;
  title: string;
  /** One line, for the /llms.txt index -- mirrors each page's own metadata description. */
  description: string;
  section: "Product" | "Pricing" | "Company" | "Resources" | "Legal";
  /** A few sentences, for the /llms-full.txt bundle. */
  longDescription: string;
}

export const LLMS_PAGES: LlmsPage[] = [
  {
    path: "/",
    title: "Ruach",
    description: "Ruach helps churches turn sermons, articles, and ministry pages into a conversational website experience, with an optional moderated Prayer Wall.",
    section: "Product",
    longDescription:
      "Ruach is a conversational assistant and moderated Prayer Wall for church websites. A visitor asks a question in plain language -- about a sermon topic, an event, where to find sermon notes -- and Ruach recommends resources from the church's own approved content library (sermon videos, podcast episodes, articles, ministry pages, and external links), or routes navigational questions to the right page directly. It installs as a small embed script on any existing website, regardless of platform, without rebuilding the site.",
  },
  {
    path: "/how-it-works",
    title: "How Ruach Works",
    description: "The full lifecycle of Ruach -- from connecting your church's content to conversational discovery, installation, and ongoing sync.",
    section: "Product",
    longDescription:
      "A church connects its content (importing or syncing sermons, videos, podcasts, articles, and ministry pages, including trusted content from other ministries), Ruach organizes and categorizes it automatically, staff install the widget with a short embed snippet and customize its name/colors/welcome message, and from then on visitors get real recommendations from the church's own library instead of generic chatbot answers.",
  },
  {
    path: "/features",
    title: "Ruach Features",
    description:
      "Every Ruach feature, grouped by category -- conversational assistant, content library, branding, Prayer Wall, analytics, team administration, and support.",
    section: "Product",
    longDescription:
      "Covers the conversational assistant (grounded entirely in approved content, with configurable content-type priority), the content library (imports from YouTube, RSS, and direct URLs, with auto-sync and bulk review tooling), widget branding and embed customization, the moderated Prayer Wall and Testimonies feature, conversation analytics, team member roles, and support.",
  },
  {
    path: "/product/prayer-wall",
    title: "Prayer Wall",
    description:
      "Give your community a thoughtful way to share prayer requests, respond in prayer, and celebrate answered prayers -- while staying in control of what's public.",
    section: "Product",
    longDescription:
      "A moderated space where a church's visitors can submit prayer requests, have others in the community pray for them, and share testimonies of answered prayer. Staff moderate what is public, and the wall carries the church's own branding at a dedicated, shareable URL that installs alongside (or independently of) the conversational widget.",
  },
  {
    path: "/why-ruach",
    title: "Why Ruach",
    description: "Technology should support ministry, not compete with it. Why Ruach exists, and what the name means.",
    section: "Company",
    longDescription:
      "Ruach (Hebrew for breath/spirit/wind) exists on the belief that technology should support a church's ministry, not compete with or replace it -- the assistant only ever recommends a church's own approved content, never generates open-ended chat, so it extends a church's existing teaching rather than substituting for it.",
  },
  {
    path: "/pricing",
    title: "Ruach Pricing",
    description: "Ruach pricing plans for churches of every size, from church plants to multi-campus organizations. Every plan includes the core Ruach experience.",
    section: "Pricing",
    longDescription:
      "Four plans (Essential, Growth, Multi-Site, and an enterprise tier), priced monthly or yearly, scaling by indexed-resource limits, team seats, and features like campus-scoped Prayer Walls and content-type priority. Every plan includes the core conversational assistant and widget embed.",
  },
  {
    path: "/faq",
    title: "Ruach FAQ",
    description: "Answers to common questions about Ruach's conversational assistant, AI guardrails, Prayer Wall, setup, and pricing.",
    section: "Resources",
    longDescription:
      "Answers what Ruach is, how it differs from an open-ended chatbot (it only recommends a church's own approved content), what content types it can search, how it handles content from other ministries, how installation works on an existing site, and how the Prayer Wall and pricing work.",
  },
  {
    path: "/release-notes",
    title: "Ruach Release Notes",
    description: "What's new in Ruach -- every update to the conversational assistant and Prayer Wall, in one place.",
    section: "Resources",
    longDescription:
      "A reverse-chronological, month-grouped log of product updates -- new features, meaningful changes, and fixes worth knowing about, each with a short headline and a plain-language explanation of what changed and why it matters to a church running the product.",
  },
  {
    path: "/demo",
    title: "Request a Demo",
    description: "Start Ruach today, or request a demo and we'll walk you through how it fits your church.",
    section: "Resources",
    longDescription: "A church can start using Ruach immediately, or request a guided walkthrough of how it fits their specific website and content.",
  },
  {
    path: "/privacy",
    title: "Privacy Policy",
    description: "How Ruach collects, uses, and protects data for churches and their visitors.",
    section: "Legal",
    longDescription: "Ruach's privacy policy, covering what data is collected from churches and their website visitors, how it's used, and how it's protected.",
  },
  {
    path: "/terms",
    title: "Terms of Service",
    description: "The terms governing use of Ruach's conversational assistant and Prayer Wall.",
    section: "Legal",
    longDescription: "The terms of service governing a church's use of the Ruach conversational assistant and Prayer Wall.",
  },
];
