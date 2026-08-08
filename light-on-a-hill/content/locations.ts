import { type ImageKey } from "./images";

/**
 * Location SEO landing pages — genuinely useful, not doorway pages. Maps to a
 * `Locations` CMS collection. Each carries unique intro copy, local venue
 * knowledge, FAQs, and hub-and-spoke links to services and journal posts.
 */
export type LocationPage = {
  slug: string;
  city: string;
  headline: [string, string];
  intro: string;
  local: string; // local venue / area knowledge paragraph
  venues: string[];
  heroImage: ImageKey;
  gallery: ImageKey[];
  faqs: { q: string; a: string }[];
  relatedServices: string[];
  relatedJournal: string[];
  seo: { title: string; description: string };
};

export const LOCATIONS: LocationPage[] = [
  {
    slug: "raleigh-photographer",
    city: "Raleigh",
    headline: ["Raleigh", "photographer."],
    intro:
      "Raleigh is home. It's where the studio is based and where most of a year's weddings, families, and portrait sessions happen — which means I know its light, its parks, and its venues the way you only can from photographing them season after season.",
    local:
      "From Dorothea Dix Park at golden hour to the quiet corners of the JC Raulston Arboretum and the warehouse light of the Warehouse District, Raleigh gives a session real range within a short drive. For families, Umstead State Park and the Museum of Art grounds are reliable favourites.",
    venues: ["Dorothea Dix Park", "JC Raulston Arboretum", "NC Museum of Art grounds", "Umstead State Park", "Downtown & Warehouse District"],
    heroImage: "raleigh",
    gallery: ["familyOutdoor", "couplesField", "seniorPortrait", "portraitWoman"],
    faqs: [
      { q: "Do you photograph across the whole Triangle?", a: "Yes — Raleigh is the base, and I regularly photograph in Durham, Cary, Chapel Hill, and the surrounding towns." },
      { q: "What does a Raleigh session cost?", a: "Portrait and family sessions are $200 per hour with a two-hour minimum, with every edited image included and delivered within four weeks." },
    ],
    relatedServices: ["families", "couples", "seniors"],
    relatedJournal: ["best-family-photo-locations-raleigh"],
    seo: {
      title: "Raleigh Photographer | Family, Couples & Portraits | Light on a Hill",
      description:
        "A Raleigh-based photographer for families, couples, seniors, and portraits. Knows the city's light and locations. Every edited image included, delivered within four weeks.",
    },
  },
  {
    slug: "raleigh-wedding-photographer",
    city: "Raleigh",
    headline: ["Raleigh wedding", "photographer."],
    intro:
      "A Raleigh wedding photographer who works quietly and knows the city's venues from the inside — where the light falls at four o'clock, how to build a timeline around it, and how to stay out of the way while catching everything.",
    local:
      "The Maxwell, The Merrimon-Wynne House, and Market Hall each run differently, and a photographer who's worked them can plan your timeline around their light and their quirks instead of discovering them on the day.",
    venues: ["The Maxwell", "The Merrimon-Wynne House", "Market Hall", "The Stockroom at 230", "All Saints Chapel"],
    heroImage: "weddingAisle",
    gallery: ["weddingAisle", "weddingDetails", "heroWedding"],
    faqs: [
      { q: "Do you know Raleigh's wedding venues?", a: "Yes — I've photographed across the city's most-loved venues and plan timelines around each one's light and flow." },
      { q: "How far in advance should we book a Raleigh wedding?", a: "Popular dates are often reserved nine to eighteen months out. It's always worth checking your date, even last-minute." },
    ],
    relatedServices: ["weddings", "couples"],
    relatedJournal: ["summer-wedding-the-maxwell", "best-wedding-venues-raleigh"],
    seo: {
      title: "Raleigh Wedding Photographer | Light on a Hill Photography",
      description:
        "An editorial Raleigh wedding photographer who knows the city's venues and light. A calm presence on the day, with galleries built to be lived with. Check availability.",
    },
  },
  {
    slug: "durham-photographer",
    city: "Durham",
    headline: ["Durham", "photographer."],
    intro:
      "Durham has a texture all its own — tobacco-warehouse brick, leafy neighbourhoods, and the Duke gardens — and it photographs beautifully. I'm a short drive away and work here often.",
    local:
      "Sarah P. Duke Gardens is a perennial favourite for couples and families, while the American Tobacco Campus and downtown's brick and murals give portrait sessions an editorial, urban edge.",
    venues: ["Sarah P. Duke Gardens", "American Tobacco Campus", "Downtown Durham", "Duke University campus"],
    heroImage: "portraitWoman",
    gallery: ["couplesField", "familyCandid", "seniorPortrait", "portraitMan"],
    faqs: [
      { q: "Do you travel to Durham?", a: "Yes — Durham is a short drive from the studio and a regular part of my work." },
      { q: "What does a Durham session cost?", a: "Portrait and family sessions are $200 per hour with a two-hour minimum, every edited image included." },
    ],
    relatedServices: ["couples", "families", "seniors"],
    relatedJournal: [],
    seo: {
      title: "Durham Photographer | Family, Couples & Portraits | Light on a Hill",
      description:
        "A photographer serving Durham, NC — families, couples, seniors, and portraits among the city's gardens and warehouses. Every edited image included.",
    },
  },
  {
    slug: "cary-photographer",
    city: "Cary",
    headline: ["Cary", "photographer."],
    intro:
      "Cary's parks and greenways make for relaxed, green, family-friendly sessions minutes from home. I photograph here regularly for families, couples, and seniors.",
    local:
      "Bond Park, Hemlock Bluffs, and the Fred G. Bond Metro Park trails offer shaded light and open space that work especially well for families with young children.",
    venues: ["Fred G. Bond Metro Park", "Hemlock Bluffs Nature Preserve", "Bond Park", "Downtown Cary Park"],
    heroImage: "familyField",
    gallery: ["familyOutdoor", "familyField", "couplesField", "seniorPortrait"],
    faqs: [
      { q: "Do you serve Cary and the surrounding area?", a: "Yes — Cary is well within the studio's core service area and a frequent location for family and portrait sessions." },
      { q: "What does a Cary session cost?", a: "Sessions are $200 per hour with a two-hour minimum, with every edited image included and delivered within four weeks." },
    ],
    relatedServices: ["families", "couples"],
    relatedJournal: ["best-family-photo-locations-raleigh"],
    seo: {
      title: "Cary Photographer | Family & Portrait Sessions | Light on a Hill",
      description:
        "A photographer serving Cary, NC — relaxed family, couples, and senior sessions in the town's parks and greenways. Every edited image included.",
    },
  },
  {
    slug: "chapel-hill-photographer",
    city: "Chapel Hill",
    headline: ["Chapel Hill", "photographer."],
    intro:
      "Chapel Hill's campus light and botanical gardens make it one of the most photogenic corners of the Triangle. I work here often for couples, families, and seniors.",
    local:
      "The North Carolina Botanical Garden, Coker Arboretum, and the classic brick of UNC's campus give sessions a timeless, collegiate warmth — especially in autumn.",
    venues: ["North Carolina Botanical Garden", "Coker Arboretum", "UNC campus", "Downtown Franklin Street"],
    heroImage: "seniorPortrait",
    gallery: ["seniorPortrait", "portraitWoman", "couplesField", "familyCandid"],
    faqs: [
      { q: "Do you travel to Chapel Hill?", a: "Yes — Chapel Hill is part of the studio's regular service area for portraits, families, and couples." },
      { q: "What does a Chapel Hill session cost?", a: "Sessions are $200 per hour with a two-hour minimum, with every edited image included." },
    ],
    relatedServices: ["seniors", "couples", "families"],
    relatedJournal: [],
    seo: {
      title: "Chapel Hill Photographer | Portraits, Seniors & Families | Light on a Hill",
      description:
        "A photographer serving Chapel Hill, NC — seniors, couples, and families among the campus and botanical gardens. Every edited image included.",
    },
  },
  {
    slug: "destination-photography",
    city: "Destination",
    headline: ["Wherever your", "story takes you."],
    intro:
      "Some of the best days happen far from home — a wedding in the Blue Ridge Mountains, an elopement on the coast, a session somewhere that means everything to you. I travel gladly, and travel is quoted simply.",
    local:
      "From the mountains to the Carolina coast and beyond, destination coverage is planned end-to-end so the logistics never touch your experience of the day.",
    venues: ["Blue Ridge Mountains", "Asheville & the High Country", "The Carolina coast", "Beyond — by arrangement"],
    heroImage: "couplesMountains",
    gallery: ["couplesMountains", "heroWedding", "weddingDetails"],
    faqs: [
      { q: "Do you travel for weddings and sessions?", a: "Yes — destination weddings and sessions are welcome, whether that's the mountains, the coast, or further afield. Travel is quoted transparently up front." },
      { q: "How does destination pricing work?", a: "Coverage is priced as usual, with travel added simply and transparently once we know the location. No hidden fees." },
    ],
    relatedServices: ["weddings", "couples"],
    relatedJournal: [],
    seo: {
      title: "Destination Photographer | Weddings & Elopements | Light on a Hill",
      description:
        "A North Carolina-based destination photographer for weddings, elopements, and sessions in the mountains, on the coast, and beyond. Travel quoted transparently.",
    },
  },
];

export const LOCATION_MAP: Record<string, LocationPage> = Object.fromEntries(
  LOCATIONS.map((l) => [l.slug, l]),
);
