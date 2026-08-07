import { type ImageKey } from "./images";

/**
 * The Journal — editorial content that supports SEO and purchasing decisions.
 * Maps to a `JournalPosts` CMS collection. Bodies are intentionally short stubs
 * here; the CMS carries the full structured article. `relatedServices` /
 * `relatedLocations` power hub-and-spoke internal linking.
 */
export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Weddings" | "Portraits" | "Planning Guides" | "Locations" | "Advice";
  image: ImageKey;
  readingTime: string;
  date: string; // ISO
  relatedServices: string[];
  relatedLocations: string[];
  body: string[]; // paragraph stubs
};

export const JOURNAL: JournalPost[] = [
  {
    slug: "summer-wedding-the-maxwell",
    title: "A Summer Wedding at The Maxwell",
    excerpt:
      "Warm light, an easy timeline, and a celebration that felt like the couple who threw it. A real wedding from downtown Raleigh.",
    category: "Weddings",
    image: "weddingAisle",
    readingTime: "6 min read",
    date: "2026-06-14",
    relatedServices: ["weddings"],
    relatedLocations: ["raleigh-wedding-photographer"],
    body: [
      "Some weddings tell you exactly what kind of day they'll be within the first hour. This was one of them.",
      "This is a preview stub. In the CMS, this post carries the full story, a gallery block, a venue relationship, and a CTA block linking to wedding availability.",
    ],
  },
  {
    slug: "best-wedding-venues-raleigh",
    title: "The Best Wedding Venues in Raleigh",
    excerpt:
      "A photographer's shortlist of Raleigh venues — where the light is, how the timelines run, and what makes each one special.",
    category: "Planning Guides",
    image: "weddingDetails",
    readingTime: "9 min read",
    date: "2026-05-02",
    relatedServices: ["weddings"],
    relatedLocations: ["raleigh-wedding-photographer"],
    body: [
      "The right venue does half the work of a beautiful wedding gallery — light, space, and flow matter more than décor.",
      "This is a preview stub. In the CMS this guide links to the Raleigh Wedding Photography page, the Wedding Investment section, and the Inquiry form.",
    ],
  },
  {
    slug: "what-to-wear-engagement",
    title: "What to Wear for Your Engagement Photos",
    excerpt:
      "The short, practical version: coordinate don't match, choose texture over logos, and wear what feels like you.",
    category: "Advice",
    image: "couplesField",
    readingTime: "5 min read",
    date: "2026-04-18",
    relatedServices: ["couples"],
    relatedLocations: [],
    body: [
      "The best-dressed couples in a gallery almost never look like they tried too hard.",
      "This is a preview stub. The CMS version includes an image gallery and a related-services block.",
    ],
  },
  {
    slug: "best-family-photo-locations-raleigh",
    title: "Best Locations for Family Photography in Raleigh",
    excerpt:
      "Parks, fields, and golden-hour spots around the Triangle that work beautifully for family sessions with real kids.",
    category: "Locations",
    image: "familyField",
    readingTime: "7 min read",
    date: "2026-03-27",
    relatedServices: ["families"],
    relatedLocations: ["raleigh-photographer"],
    body: [
      "A good family location gives kids room to move and gives the camera good light. Here are the ones I return to.",
      "This is a preview stub. The CMS version links to Family Photography and the Raleigh location page.",
    ],
  },
  {
    slug: "wedding-coverage-hours",
    title: "How Long Should Wedding Photography Coverage Be?",
    excerpt:
      "A simple way to think about coverage hours so you pay for the day you'll actually have — not a number pulled from a package sheet.",
    category: "Planning Guides",
    image: "weddingDance",
    readingTime: "6 min read",
    date: "2026-02-11",
    relatedServices: ["weddings"],
    relatedLocations: [],
    body: [
      "Coverage hours are really a timeline question, not a pricing question. Start from the day you want.",
      "This is a preview stub. The CMS version includes an FAQ block and a CTA to check wedding availability.",
    ],
  },
  {
    slug: "prepare-kids-family-photos",
    title: "How to Prepare Kids for Family Photos",
    excerpt:
      "Snacks, timing, and lowered expectations: a photographer's honest guide to a family session that actually goes well.",
    category: "Advice",
    image: "familyCandid",
    readingTime: "5 min read",
    date: "2026-01-20",
    relatedServices: ["families"],
    relatedLocations: [],
    body: [
      "The secret to great photos of small children is to stop trying to make them behave for the camera.",
      "This is a preview stub. The CMS version links to Family Photography and the Inquiry form.",
    ],
  },
];

export const JOURNAL_MAP: Record<string, JournalPost> = Object.fromEntries(
  JOURNAL.map((p) => [p.slug, p]),
);
