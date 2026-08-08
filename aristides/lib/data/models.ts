/**
 * Canonical model data.
 *
 * This is deliberately expressed as DATA, not scattered UI conditions (§21).
 * The model pages, the /models finder and the configurator all read from here,
 * so a spec or price change is a single edit — the shape a CMS (Payload/Sanity)
 * would eventually own.
 *
 * Prices are starting prices in EUR and are indicative — final price is always
 * confirmed by Aristides.
 */

export type Construction =
  | "standard"
  | "multiscale"
  | "headless"
  | "offset"
  | "traditional"
  | "bass";

export type FamilyId = "0" | "S" | "H" | "T" | "STX" | "SB";

export interface Variant {
  /** Model designation, e.g. "060", "H/07", "T/0". */
  code: string;
  strings: number;
  /** Scale length shown to humans, e.g. `25.5"` or `25.5–27"` for multiscale. */
  scale: string;
  fromPrice: number;
}

export interface Family {
  id: FamilyId;
  /** Short glyph used as the oversized background code, e.g. "0", "S", "STX". */
  glyph: string;
  name: string;
  tagline: string;
  construction: Construction[];
  /** One-line positioning used on cards. */
  blurb: string;
  /** Longer editorial copy for the model page. */
  description: string;
  /** Bullet highlights for the model page. */
  highlights: string[];
  variants: Variant[];
  /** Ambient tint (r,g,b) the UI adopts when this family is featured. */
  tint: [number, number, number];
  /** Path segment under /models. */
  slug: string;
}

export const FAMILIES: Family[] = [
  {
    id: "0",
    glyph: "0",
    name: "Standard",
    tagline: "The core Aristides experience.",
    construction: ["standard"],
    blurb: "The reference platform. One-piece construction, balanced tone, endless hardware freedom.",
    description:
      "The 0 Series is the instrument every other Aristides is measured against. A comfortable C-shaped neck, effortless upper-fret access and a single continuous exoskeleton-and-Arium structure deliver a balanced voice with the stability the material is known for. It carries the widest range of hardware and electronics choices in the catalogue.",
    highlights: [
      "Comfortable C-shaped neck profile",
      "Unrestricted upper-fret access",
      "One-piece exoskeleton + Arium construction",
      "Balanced, full-range tone",
      "Exceptional tuning stability",
      "The widest hardware selection",
    ],
    variants: [
      { code: "060", strings: 6, scale: '25.5"', fromPrice: 2445 },
      { code: "070", strings: 7, scale: '26.5"', fromPrice: 2545 },
      { code: "080", strings: 8, scale: '27"', fromPrice: 2645 },
    ],
    tint: [127, 233, 227],
    slug: "0-standard",
  },
  {
    id: "S",
    glyph: "S",
    name: "Multiscale",
    tagline: "More range. Less compromise.",
    construction: ["multiscale"],
    blurb: "Fanned frets for low-string definition and treble-side familiarity in one neck.",
    description:
      "The S Series brings a fanned-fret geometry to the Standard platform. A longer bass-side scale tightens low-string tension and clarity while the treble side keeps a familiar feel — so extended tunings stay defined without fighting the player. Ergonomics and intonation improve as a consequence of the geometry, not a compromise against it.",
    highlights: [
      "Low-string definition under tension",
      "Improved intonation across the range",
      "Ergonomic fanned-fret wrist position",
      "Confident down-tuning",
      "Balanced string-to-string tension",
    ],
    variants: [
      { code: "060S", strings: 6, scale: '25.5–27"', fromPrice: 2795 },
      { code: "070S", strings: 7, scale: '25.5–27"', fromPrice: 2895 },
      { code: "080S", strings: 8, scale: '25.5–27"', fromPrice: 2995 },
    ],
    tint: [126, 217, 87],
    slug: "s-multiscale",
  },
  {
    id: "H",
    glyph: "H",
    name: "Headless",
    tagline: "Compact. Balanced. Uncompromising.",
    construction: ["headless", "multiscale"],
    blurb: "Proprietary headless hardware. Lighter, shorter, perfectly balanced — up to nine strings.",
    description:
      "The H Series strips the instrument to its essentials. A compact, lightweight, perfectly balanced body pairs with a proprietary headpiece and bridge system developed with Hantug. The range extends to H/09 — nine strings — in fixed and multiscale formats, with no headstock mass to pull it out of balance.",
    highlights: [
      "Proprietary Aristides × Hantug hardware",
      "Compact, lightweight footprint",
      "Perfect neutral balance",
      "Available multiscale",
      "Extends to nine strings",
      "Fast, ergonomic response",
    ],
    variants: [
      { code: "H/06", strings: 6, scale: '25.5"', fromPrice: 2795 },
      { code: "H/07", strings: 7, scale: '26.5"', fromPrice: 2895 },
      { code: "H/08", strings: 8, scale: '27"', fromPrice: 2995 },
      { code: "H/09", strings: 9, scale: '28"', fromPrice: 3095 },
    ],
    tint: [138, 143, 152],
    slug: "h-headless",
  },
  {
    id: "T",
    glyph: "T",
    name: "T Style",
    tagline: "The chameleon.",
    construction: ["traditional"],
    blurb: "A classic reference point rebuilt on Aristides engineering. The broadest configuration range.",
    description:
      "The T/0 takes a familiar, classic silhouette and rebuilds it on Arium. Twenty-two frets, a 25.5\" scale, a 10–14\" compound radius and a slightly thicker C-neck give it a timeless feel — while it accepts the largest range of Aristides hardware and electronic configurations. Classic reference point, Aristides engineering underneath.",
    highlights: [
      "22 frets, 25.5\" scale",
      "10–14\" compound radius",
      "Slightly thicker C-neck",
      "Widest hardware & electronics range",
      "Classic feel, Arium core",
    ],
    variants: [{ code: "T/0", strings: 6, scale: '25.5"', fromPrice: 2545 }],
    tint: [206, 132, 92],
    slug: "t-style",
  },
  {
    id: "STX",
    glyph: "STX",
    name: "STX",
    tagline: "Offset. Aggressive. Modern.",
    construction: ["offset", "multiscale"],
    blurb: "Developed with Mike Stringer. An aggressive modern offset built around the wrist.",
    description:
      "STX is an aggressive modern offset platform developed in collaboration with Mike Stringer. Every line serves the wrist: an ergonomic body, radical upper-fret access, a unique in-line headstock and a custom neck carve. Available in 6, 7 and 8 strings, in standard and multiscale formats — the most dramatic instrument in the catalogue.",
    highlights: [
      "Designed with Mike Stringer",
      "Wrist-first ergonomics",
      "Radical upper-fret access",
      "Unique in-line headstock",
      "Custom neck carve",
      "6/7/8, standard & multiscale",
    ],
    variants: [
      { code: "STX6", strings: 6, scale: '25.5"', fromPrice: 2995 },
      { code: "STX7", strings: 7, scale: '26.5"', fromPrice: 3095 },
      { code: "STX8", strings: 8, scale: '27"', fromPrice: 3195 },
    ],
    tint: [138, 92, 246],
    slug: "stx",
  },
  {
    id: "SB",
    glyph: "S/B",
    name: "S/B Bass",
    tagline: "The philosophy, applied low.",
    construction: ["bass", "multiscale"],
    blurb: "Aristides engineering for bass — multiscale layouts, low-frequency clarity, flexible electronics.",
    description:
      "The S/B Series applies the same engineering philosophy to the low end. Available in 4, 5 and 6 strings with multiscale layouts, it delivers the low-frequency clarity and note definition Arium is built for, with the electronics flexibility and ergonomics of the rest of the range.",
    highlights: [
      "4 / 5 / 6 string layouts",
      "Multiscale geometry",
      "Low-frequency clarity & definition",
      "Flexible electronics",
      "Ergonomic body & balance",
    ],
    variants: [
      { code: "S/B4", strings: 4, scale: '34"', fromPrice: 2995 },
      { code: "S/B5", strings: 5, scale: '34–35"', fromPrice: 3195 },
      { code: "S/B6", strings: 6, scale: '34–35"', fromPrice: 3395 },
    ],
    tint: [92, 138, 206],
    slug: "sb-bass",
  },
];

export function familyBySlug(slug: string): Family | undefined {
  return FAMILIES.find((f) => f.slug === slug);
}

export function familyById(id: FamilyId): Family | undefined {
  return FAMILIES.find((f) => f.id === id);
}

/** Lowest starting price across the whole catalogue — used for hero copy. */
export const CATALOG_FROM_PRICE = Math.min(
  ...FAMILIES.flatMap((f) => f.variants.map((v) => v.fromPrice)),
);
