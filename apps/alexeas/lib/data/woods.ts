/**
 * Tonewoods used in the workshop, grouped by where they live on the instrument.
 * Each wood carries the fields the configurator and the tonewood explorer need,
 * plus a two-color pair (`base`/`grain`) that drives the procedural SVG grain
 * so the visual preview stays photography-free yet convincing. `priceModifier`
 * is an estimate delta over the model base price; `audio` is reserved so tone
 * samples can be dropped in later without a schema change.
 */

export type WoodCategory = "top" | "body" | "neck" | "fretboard";

export interface Wood {
  slug: string;
  name: string;
  category: WoodCategory;
  descriptors: string[];
  tone: string;
  visual: string;
  styles: string[];
  priceModifier: number;
  base: string;
  grain: string;
  /** Slight grain contrast + line frequency hint for the SVG renderer. */
  grainScale: number;
  recommended?: boolean;
  availability: "in-stock" | "limited" | "by-request";
  /** Reserved for future tone samples; UI already renders a "Hear this" affordance. */
  audio?: string;
  order: number;
}

export const WOODS: Wood[] = [
  // ── Soundboard / top woods ────────────────────────────────────────────────
  {
    slug: "sitka-spruce",
    name: "Sitka Spruce",
    category: "top",
    descriptors: ["Clear", "Strong", "Versatile"],
    tone: "A broad dynamic range with strong fundamentals — the dependable, all-purpose soundboard.",
    visual: "Pale honey with tight, even grain lines and a subtle silk to the surface.",
    styles: ["Flatpicking", "Strumming", "Mixed"],
    priceModifier: 0,
    base: "#E8D6B0",
    grain: "#CBB183",
    grainScale: 1,
    availability: "in-stock",
    recommended: true,
    order: 1,
  },
  {
    slug: "adirondack-spruce",
    name: "Adirondack Spruce",
    category: "top",
    descriptors: ["Powerful", "Open", "Dynamic"],
    tone: "Big headroom and a bell-like top end — it keeps clarity even when you drive it hard.",
    visual: "Warm cream with slightly wider grain and a faint reddish cast.",
    styles: ["Flatpicking", "Bluegrass", "Strumming"],
    priceModifier: 350,
    base: "#EAD9B6",
    grain: "#C9AE7E",
    grainScale: 1.1,
    availability: "limited",
    order: 2,
  },
  {
    slug: "european-spruce",
    name: "European Spruce",
    category: "top",
    descriptors: ["Refined", "Complex", "Responsive"],
    tone: "Refined and quick, with a shimmering complexity that rewards a nuanced touch.",
    visual: "Fine, pale ivory grain with an even, luminous surface.",
    styles: ["Fingerstyle", "Recording", "Singer-songwriter"],
    priceModifier: 450,
    base: "#EFE0C2",
    grain: "#D2B98C",
    grainScale: 0.9,
    availability: "limited",
    recommended: true,
    order: 3,
  },
  {
    slug: "western-red-cedar",
    name: "Western Red Cedar",
    category: "top",
    descriptors: ["Warm", "Immediate", "Dark"],
    tone: "Warm, dark, and immediate, with a lush response ideal for a light fingerstyle touch.",
    visual: "Rich caramel to russet, with a soft, matte grain.",
    styles: ["Fingerstyle", "Home", "Recording"],
    priceModifier: 150,
    base: "#C98A5A",
    grain: "#A96B3C",
    grainScale: 1,
    availability: "in-stock",
    order: 4,
  },

  // ── Back & sides / body woods ─────────────────────────────────────────────
  {
    slug: "east-indian-rosewood",
    name: "East Indian Rosewood",
    category: "body",
    descriptors: ["Rich", "Complex", "Powerful"],
    tone: "Strong low end, extended overtones, and a broad tonal spectrum — depth and shimmer at once.",
    visual: "Deep chocolate to plum, with dramatic dark grain streaks.",
    styles: ["Fingerstyle", "Flatpicking", "Recording"],
    priceModifier: 500,
    base: "#4A3226",
    grain: "#2A1B12",
    grainScale: 1.2,
    availability: "in-stock",
    recommended: true,
    order: 1,
  },
  {
    slug: "mahogany",
    name: "Honduran Mahogany",
    category: "body",
    descriptors: ["Dry", "Direct", "Responsive"],
    tone: "Dry, punchy, and direct, with strong midrange focus and excellent note-to-note clarity.",
    visual: "Warm reddish brown with a fine, ribboned grain.",
    styles: ["Fingerstyle", "Recording", "Singer-songwriter"],
    priceModifier: 0,
    base: "#7A4A32",
    grain: "#5A3422",
    grainScale: 1,
    availability: "in-stock",
    recommended: true,
    order: 2,
  },
  {
    slug: "walnut",
    name: "Walnut",
    category: "body",
    descriptors: ["Balanced", "Clear", "Warm"],
    tone: "Sits between rosewood and mahogany — warm and clear, with balance across the strings.",
    visual: "Grey-brown to chocolate, with soft, flowing figure.",
    styles: ["Fingerstyle", "Mixed", "Recording"],
    priceModifier: 250,
    base: "#5A4636",
    grain: "#3E2E22",
    grainScale: 1.05,
    availability: "in-stock",
    order: 3,
  },
  {
    slug: "maple",
    name: "Maple",
    category: "body",
    descriptors: ["Focused", "Articulate", "Fast"],
    tone: "Transparent and articulate, with a fast response that lets the top wood speak — a recording favorite.",
    visual: "Pale gold, often with rippling flame or quilt figure.",
    styles: ["Recording", "Stage", "Ensemble"],
    priceModifier: 300,
    base: "#D8C29A",
    grain: "#BFA476",
    grainScale: 0.85,
    availability: "limited",
    order: 4,
  },
  {
    slug: "koa",
    name: "Koa",
    category: "body",
    descriptors: ["Sweet", "Focused", "Warming"],
    tone: "Warm and focused, opening up and sweetening as it is played in over the years.",
    visual: "Golden amber to deep honey, with luminous flame.",
    styles: ["Fingerstyle", "Recording", "Singer-songwriter"],
    priceModifier: 700,
    base: "#9A5A2E",
    grain: "#7A3F1C",
    grainScale: 1,
    availability: "by-request",
    order: 5,
  },

  // ── Neck woods ────────────────────────────────────────────────────────────
  {
    slug: "mahogany-neck",
    name: "Mahogany",
    category: "neck",
    descriptors: ["Stable", "Warm", "Traditional"],
    tone: "The classic neck wood — stable, warm, and light, with a feel players know instinctively.",
    visual: "Reddish brown with a fine, straight grain.",
    styles: ["All styles"],
    priceModifier: 0,
    base: "#7A4A32",
    grain: "#5A3422",
    grainScale: 1,
    availability: "in-stock",
    recommended: true,
    order: 1,
  },
  {
    slug: "maple-neck",
    name: "Maple",
    category: "neck",
    descriptors: ["Rigid", "Bright", "Stable"],
    tone: "Stiff and stable, adding a touch of brightness and snap to the instrument's response.",
    visual: "Pale, dense grain — often paired with a figured body.",
    styles: ["All styles"],
    priceModifier: 200,
    base: "#D8C29A",
    grain: "#BFA476",
    grainScale: 0.9,
    availability: "in-stock",
    order: 2,
  },

  // ── Fretboard woods ───────────────────────────────────────────────────────
  {
    slug: "ebony",
    name: "Ebony",
    category: "fretboard",
    descriptors: ["Hard", "Slick", "Articulate"],
    tone: "Dense and slick under the fingers, with a crisp, articulate attack.",
    visual: "Deep, near-black with a fine polished surface.",
    styles: ["All styles"],
    priceModifier: 0,
    base: "#1E1A17",
    grain: "#0C0A08",
    grainScale: 0.7,
    availability: "in-stock",
    recommended: true,
    order: 1,
  },
  {
    slug: "rosewood-fretboard",
    name: "Rosewood",
    category: "fretboard",
    descriptors: ["Warm", "Grippy", "Traditional"],
    tone: "A touch warmer and more textured than ebony, with a classic, broken-in feel.",
    visual: "Chocolate brown with visible open grain.",
    styles: ["All styles"],
    priceModifier: 0,
    base: "#4A3226",
    grain: "#2E1E15",
    grainScale: 1,
    availability: "in-stock",
    order: 2,
  },
];

export function woodsByCategory(category: WoodCategory): Wood[] {
  return WOODS.filter((w) => w.category === category).sort((a, b) => a.order - b.order);
}

export function getWood(slug: string): Wood | undefined {
  return WOODS.find((w) => w.slug === slug);
}
