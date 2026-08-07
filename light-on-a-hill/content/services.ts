import { type ImageKey } from "./images";

/**
 * Services — each primary service page is a high-conversion sales page generated
 * from this data. Maps to a `Services` CMS collection. Every field here is meant
 * to be editable by the studio owner without touching code.
 */

export type FAQ = { q: string; a: string };

export type Service = {
  slug: string;
  category: string; // eyebrow label
  navLabel: string;
  // Hero
  heroImage: ImageKey;
  heroHeadline: [string, string]; // two editorial lines
  // Positioning
  positioning: string;
  // Gallery
  gallery: ImageKey[];
  // Why clients choose
  reasons: { title: string; body: string }[];
  // What's included
  includes: string[];
  addOns?: string[];
  // Investment
  investment: {
    startingLabel: string; // e.g. "Collections beginning at"
    startingValue: string; // e.g. "$3,400" or "$200 / hour"
    typicalLabel?: string;
    typicalValue?: string;
    note?: string;
  };
  // FAQ
  faqs: FAQ[];
  // Hub-and-spoke internal links
  relatedServices: string[]; // slugs
  relatedJournal: string[]; // journal slugs
  seo: { title: string; description: string };
};

// Shared portrait-session FAQ answers, grounded in confirmed studio policy.
const PORTRAIT_DELIVERY =
  "Every edited image from your session is included — there are no per-image fees or locked galleries. Your gallery is ready within four weeks and delivered privately online, with high-resolution downloads and personal printing rights.";

export const SERVICES: Service[] = [
  {
    slug: "weddings",
    category: "Weddings",
    navLabel: "Weddings",
    heroImage: "weddingAisle",
    heroHeadline: ["The day disappears.", "The photographs don't."],
    positioning:
      "A wedding is the fastest day of your life. My work is to move through it quietly — reading the room, catching the glance across the aisle, the hand your father won't let go of — so that years from now the photographs still carry the temperature of the day, not just the look of it.",
    gallery: ["weddingAisle", "weddingDetails", "weddingDance", "couplesField", "heroWedding", "couplesMountains"],
    reasons: [
      {
        title: "Unhurried on the fastest day",
        body: "I photograph a limited number of weddings each year so yours is never one of a crowded weekend. You get presence, not a rushed shot list.",
      },
      {
        title: "Directed only when it helps",
        body: "Portraits are guided enough to feel easy and loose enough to feel like you. The rest of the day I stay out of the way.",
      },
      {
        title: "A gallery built to be lived with",
        body: "Careful, consistent editing and a private online gallery your family can actually find, download, and print from for years.",
      },
    ],
    includes: [
      "Continuous coverage of your day, from prep to send-off",
      "A pre-wedding planning call and photography timeline built with you",
      "A complimentary engagement session",
      "Every edited image, hand-finished for a consistent look",
      "A private online gallery with high-resolution downloads and printing rights",
      "Professional-grade backup equipment and full liability insurance",
    ],
    addOns: [
      "Second photographer for a fuller angle on the day",
      "Fine-art heirloom album, designed with you",
      "Rehearsal-dinner or welcome-party coverage",
      "Extended coverage hours",
    ],
    investment: {
      startingLabel: "Collections beginning at",
      startingValue: "$3,400", // PLACEHOLDER — confirm wedding pricing
      typicalLabel: "Most couples invest",
      typicalValue: "$4,200 – $6,500", // PLACEHOLDER — confirm
      note: "A signed agreement and retainer reserve your date. Final pricing is confirmed after we talk through your day.",
    },
    faqs: [
      { q: "Where are you located, and do you travel?", a: "I'm based in Raleigh, North Carolina and photograph weddings across the Triangle, the Blue Ridge Mountains, and the coast. I travel for destination weddings gladly — travel is quoted simply and transparently." },
      { q: "What does wedding coverage include?", a: "Continuous coverage of your day, a planning call and timeline built together, a complimentary engagement session, every edited image, and a private online gallery with downloads and printing rights." },
      { q: "How many hours of coverage do we need?", a: "Most full days land between eight and ten hours, from getting-ready to the send-off. On our planning call we map your timeline and match coverage to it — no upselling hours you won't use." },
      { q: "Do you photograph engagement sessions?", a: "Yes — a complimentary engagement session is included with wedding collections. It's the best way for us to get comfortable together before the day itself." },
      { q: "Do you help build the timeline?", a: "Always. A photography-aware timeline is the difference between a calm day and a rushed one, so we plan light, locations, and buffers together." },
      { q: "How many images will we receive?", a: "It depends on the length of your day, but full-day weddings typically deliver several hundred finished images. There are no locked or pay-to-unlock photographs." },
      { q: "How long until we see the photographs?", a: "You'll receive a same-week preview, with your full wedding gallery delivered within a few weeks of the date." },
      { q: "What happens if the weather turns, or the photographer is unwell?", a: "Weather becomes part of the story — some of the most striking frames come from imperfect skies, and we plan indoor alternatives in advance. In the rare event of illness or emergency, I maintain a network of trusted professional photographers and full insurance so your day is always covered." },
      { q: "How far in advance should we book?", a: "Popular dates are often reserved nine to eighteen months out. If your date is close, reach out anyway — it's always worth checking." },
    ],
    relatedServices: ["couples", "families"],
    relatedJournal: ["summer-wedding-the-maxwell", "wedding-coverage-hours", "best-wedding-venues-raleigh"],
    seo: {
      title: "Raleigh Wedding Photographer | Light on a Hill Photography",
      description:
        "Editorial, emotion-first wedding photography in Raleigh, the Triangle, and beyond. A calm presence on the fastest day of your life. View the work and check availability.",
    },
  },
  {
    slug: "couples",
    category: "Couples",
    navLabel: "Couples",
    heroImage: "couplesField",
    heroHeadline: ["Photographs that feel", "like the two of you."],
    positioning:
      "Not a photoshoot — an hour that feels like a good evening together. We walk, you forget the camera, and the pictures end up looking like the way you actually are with each other.",
    gallery: ["couplesField", "couplesMountains", "heroWedding", "weddingDance"],
    reasons: [
      { title: "Easy, not posed", body: "Gentle direction that gives you something to do with your hands and lets the real thing happen in between." },
      { title: "Locations with meaning", body: "Golden-hour light in a place that means something to you — where you met, where you live, or the mountains at dusk." },
      { title: "Every image, quickly", body: PORTRAIT_DELIVERY },
    ],
    includes: [
      "A relaxed, guided session at the location we choose together",
      "Wardrobe and location guidance beforehand",
      "Every edited image from the session",
      "A private online gallery within four weeks, with printing rights",
    ],
    investment: {
      startingLabel: "Sessions beginning at",
      startingValue: "$200 / hour",
      note: "Two-hour minimum. All edited images included and delivered within four weeks.",
    },
    faqs: [
      { q: "How long are sessions?", a: "Couples sessions run one to two hours, with a two-hour minimum. That's enough time to relax, move between a couple of settings, and catch the best light." },
      { q: "Where do sessions happen, and can you help choose?", a: "Anywhere that feels like you — a favourite part of the city, an open field, or the mountains at golden hour. I'll suggest locations and the right time of day for the light." },
      { q: "What should we wear?", a: "You'll get a simple wardrobe guide after booking. The short version: coordinate, don't match; choose texture over logos; and wear something you feel like yourself in." },
      { q: "How many images do we receive, and how fast?", a: PORTRAIT_DELIVERY },
      { q: "What is the investment?", a: "Sessions are $200 per hour with a two-hour minimum, with all edited images included." },
    ],
    relatedServices: ["weddings", "families"],
    relatedJournal: ["what-to-wear-engagement", "best-family-photo-locations-raleigh"],
    seo: {
      title: "Raleigh Couples & Engagement Photographer | Light on a Hill",
      description:
        "Relaxed, natural couples and engagement photography in Raleigh and across North Carolina. Every edited image included, delivered within four weeks.",
    },
  },
  {
    slug: "families",
    category: "Families",
    navLabel: "Families",
    heroImage: "familyOutdoor",
    heroHeadline: ["The beautifully imperfect", "season you're in now."],
    positioning:
      "Kids don't hold still, and they shouldn't have to. Family sessions are built around real movement and real personalities — the result looks like your actual family, on an actual good day, not a stiff line-up in matching shirts.",
    gallery: ["familyOutdoor", "familyCandid", "familyField", "seniorPortrait"],
    reasons: [
      { title: "Built for real kids", body: "We keep it moving and playful. The best frames usually happen in the in-between moments, not the say-cheese ones." },
      { title: "No pressure to perform", body: "If a toddler melts down, that's fine — I've photographed enough families to work with it, not against it." },
      { title: "Every image, quickly", body: PORTRAIT_DELIVERY },
    ],
    includes: [
      "A relaxed, movement-friendly session at a location we choose together",
      "Wardrobe and location guidance beforehand",
      "Every edited image from the session",
      "A private online gallery within four weeks, with printing rights",
    ],
    addOns: ["Extended family & multi-generation groupings", "Additional session time for larger families"],
    investment: {
      startingLabel: "Sessions beginning at",
      startingValue: "$200 / hour",
      note: "Two-hour minimum. All edited images included and delivered within four weeks.",
    },
    faqs: [
      { q: "How long are sessions, and where do they happen?", a: "Family sessions run one to two hours (two-hour minimum) at an outdoor location we choose together — a park, a field, the coast, or your own home." },
      { q: "Do you help with posing?", a: "Yes, but lightly. I set up situations for your family to be together in, then let the real interaction happen. You won't be micromanaged into stiff poses." },
      { q: "What if the children don't cooperate?", a: "Completely normal, and completely fine. We build in time, keep it playful, and often the 'off' moments make the best photographs. There's no pressure for anyone to perform." },
      { q: "Do you photograph extended families?", a: "Absolutely — multi-generation and extended-family sessions are welcome. Let me know the headcount and we'll plan the time accordingly." },
      { q: "How many images, and how fast?", a: PORTRAIT_DELIVERY },
      { q: "What is the investment?", a: "Sessions are $200 per hour with a two-hour minimum, with all edited images included." },
    ],
    relatedServices: ["seniors", "maternity"],
    relatedJournal: ["prepare-kids-family-photos", "best-family-photo-locations-raleigh"],
    seo: {
      title: "Raleigh Family Photographer | Light on a Hill Photography",
      description:
        "Natural, movement-friendly family photography in Raleigh and across North Carolina. Real kids, real personalities, every edited image included.",
    },
  },
  {
    slug: "seniors",
    category: "Seniors",
    navLabel: "Seniors",
    heroImage: "seniorPortrait",
    heroHeadline: ["The year everything", "is about to change."],
    positioning:
      "Senior portraits should look like who you are right now — not a template. We build the session around your style, your interests, and the light, and end up with images that feel current instead of dated the moment you graduate.",
    gallery: ["seniorPortrait", "portraitWoman", "portraitMan", "couplesField"],
    reasons: [
      { title: "Your style, not a formula", body: "We plan wardrobe and locations around who you actually are, so the portraits feel like now." },
      { title: "Comfortable in front of the camera", body: "Clear direction that makes it easy, even if you've never loved having your photo taken." },
      { title: "Every image, quickly", body: PORTRAIT_DELIVERY },
    ],
    includes: [
      "A guided senior session at the location we choose together",
      "Wardrobe and outfit-change guidance",
      "Every edited image from the session",
      "A private online gallery within four weeks, with printing rights",
    ],
    investment: {
      startingLabel: "Sessions beginning at",
      startingValue: "$200 / hour",
      note: "Two-hour minimum. All edited images included and delivered within four weeks.",
    },
    faqs: [
      { q: "How long is a senior session?", a: "One to two hours (two-hour minimum), which leaves room for a couple of outfit changes and locations." },
      { q: "Can we do multiple outfits and locations?", a: "Yes — we plan outfit changes and one or two nearby settings into the timeline so the gallery has range." },
      { q: "How many images, and how fast?", a: PORTRAIT_DELIVERY },
      { q: "What is the investment?", a: "Sessions are $200 per hour with a two-hour minimum, with all edited images included." },
    ],
    relatedServices: ["families", "couples"],
    relatedJournal: ["what-to-wear-engagement"],
    seo: {
      title: "Raleigh Senior Portrait Photographer | Light on a Hill",
      description:
        "Modern, personal senior portrait photography in Raleigh and across North Carolina. Every edited image included, delivered within four weeks.",
    },
  },
  {
    slug: "maternity",
    category: "Maternity",
    navLabel: "Maternity",
    heroImage: "maternity",
    heroHeadline: ["A quiet chapter,", "worth keeping."],
    positioning:
      "Maternity sessions are calm, warm, and unhurried — a small pause to hold onto before everything gets louder. Soft light, real tenderness, and none of the awkwardness you might be bracing for.",
    gallery: ["maternity", "familyField", "portraitWoman", "familyCandid"],
    reasons: [
      { title: "Calm and comfortable", body: "Gentle direction and flattering light, planned around how you're feeling." },
      { title: "Yours, or the whole family", body: "Solo, with your partner, or with older siblings — however you want to remember this." },
      { title: "Every image, quickly", body: PORTRAIT_DELIVERY },
    ],
    includes: [
      "A relaxed maternity session at the location we choose together",
      "Wardrobe guidance, including studio-gown options",
      "Every edited image from the session",
      "A private online gallery within four weeks, with printing rights",
    ],
    investment: {
      startingLabel: "Sessions beginning at",
      startingValue: "$200 / hour",
      note: "Two-hour minimum. All edited images included and delivered within four weeks.",
    },
    faqs: [
      { q: "When should we schedule a maternity session?", a: "Usually between 28 and 34 weeks, when the bump is beautifully round but you're still comfortable moving. We'll find a date that works for you." },
      { q: "What should I wear?", a: "You'll get a wardrobe guide with flattering options; flowing fabrics and simple silhouettes photograph wonderfully. Gowns are available if you'd like them." },
      { q: "How many images, and how fast?", a: PORTRAIT_DELIVERY },
      { q: "What is the investment?", a: "Sessions are $200 per hour with a two-hour minimum, with all edited images included." },
    ],
    relatedServices: ["families", "couples"],
    relatedJournal: [],
    seo: {
      title: "Raleigh Maternity Photographer | Light on a Hill Photography",
      description:
        "Calm, warm maternity photography in Raleigh and across North Carolina. Every edited image included, delivered within four weeks.",
    },
  },
  {
    slug: "branding",
    category: "Branding",
    navLabel: "Branding",
    heroImage: "branding",
    heroHeadline: ["Your work,", "photographed like it matters."],
    positioning:
      "Personal-brand and business photography for people whose work deserves better than a phone snapshot. We build a small, consistent library of images that actually looks like you and your business — for your site, your press, and everywhere else.",
    gallery: ["branding", "portraitMan", "portraitWoman", "seniorPortrait"],
    reasons: [
      { title: "A usable library, not one headshot", body: "A planned set of images — portraits, at-work, and detail frames — you can draw from all year." },
      { title: "On-brand and consistent", body: "We plan wardrobe, setting, and colour so the whole set feels like one deliberate brand." },
      { title: "Every image, quickly", body: PORTRAIT_DELIVERY },
    ],
    includes: [
      "A planning conversation about how and where you'll use the images",
      "A guided session at your workspace or an on-brand location",
      "Every edited image from the session",
      "A private online gallery within four weeks, with commercial usage for your own marketing",
    ],
    investment: {
      startingLabel: "Sessions beginning at",
      startingValue: "$200 / hour",
      note: "Two-hour minimum. All edited images included and delivered within four weeks.",
    },
    faqs: [
      { q: "What kinds of businesses do you photograph?", a: "Founders, creatives, coaches, realtors, and small teams — anyone who needs a consistent set of professional images that look like them." },
      { q: "Can we shoot at my office or studio?", a: "Yes. On-location at your own workspace is often the best choice; we can also scout a setting that fits your brand." },
      { q: "How many images, and how fast?", a: PORTRAIT_DELIVERY },
      { q: "What is the investment?", a: "Sessions are $200 per hour with a two-hour minimum, with all edited images included." },
    ],
    relatedServices: ["seniors", "couples"],
    relatedJournal: [],
    seo: {
      title: "Raleigh Personal Branding & Business Photographer | Light on a Hill",
      description:
        "Personal-brand and business photography in Raleigh and across North Carolina. A consistent library of images that looks like you. Every edited image included.",
    },
  },
];

export const SERVICE_MAP: Record<string, Service> = Object.fromEntries(
  SERVICES.map((s) => [s.slug, s]),
);

export function getService(slug: string): Service | undefined {
  return SERVICE_MAP[slug];
}
