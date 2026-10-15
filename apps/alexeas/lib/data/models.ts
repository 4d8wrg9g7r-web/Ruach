/**
 * Instrument models. Body shapes (O, Grand Concert, OM, Dreadnought) are the
 * real Alexeas line; specifications use the standard luthier dimensions for each
 * body style and are presented as typical figures — every commission is
 * personally confirmed before construction. Prices are estimates for the
 * configurator, expressed as "starting at".
 */

export type InstrumentFamily = "guitar" | "mandolin" | "custom";
export type SilhouetteKey = "o" | "grand-concert" | "om" | "dreadnought" | "mandolin";

export interface GuitarModel {
  slug: string;
  name: string;
  /** Short label used under silhouettes and in the configurator. */
  shortName: string;
  family: InstrumentFamily;
  silhouette: SilhouetteKey;
  /** Three-word personality line, e.g. "Balanced. Responsive. Exceptionally versatile." */
  tagline: string;
  descriptors: string[];
  playingStyles: string[];
  idealUse: string[];
  /** One-line positioning for cards. */
  summary: string;
  /** Editorial paragraphs for the model page. */
  story: string[];
  toneProfile: string;
  bodyShape: string;
  specs: {
    lowerBout: string;
    scaleLength: string;
    nutWidth: string;
    frets: string;
    depth: string;
  };
  /** Starting commission estimate, in USD. */
  basePrice: number;
  buildMonths: [number, number];
  /** Recommended starting woods (slugs from woods.ts). */
  recommends: { top: string; body: string; fretboard: string };
  /** Accent hue token used for subtle per-model coloring. */
  accent: string;
  order: number;
}

export const MODELS: GuitarModel[] = [
  {
    slug: "o",
    name: "O",
    shortName: "O",
    family: "guitar",
    silhouette: "o",
    tagline: "Intimate. Vocal. Quietly expressive.",
    descriptors: ["Intimate", "Vocal", "Focused"],
    playingStyles: ["Fingerstyle", "Parlor", "Recording", "Late-night playing"],
    idealUse: ["Fingerstyle", "Home", "Studio", "Solo repertoire"],
    summary: "A small-bodied parlor voice — close, clear, and endlessly personal.",
    story: [
      "The O is the most intimate instrument in the workshop. A small body sits easily against you, and its voice comes back quickly — direct, articulate, and full of character in the midrange.",
      "It rewards a light touch and a quiet room. Fingerstyle players and singers find that it never fights them; it simply answers. Built at twelve frets to the body, it carries a warmth and immediacy that larger guitars trade away for volume.",
    ],
    toneProfile:
      "Woody and focused, with a sweet upper midrange and a fast, tactile response. What it gives up in sheer volume it returns in intimacy and clarity.",
    bodyShape: "Small parlor body, 12 frets to the body.",
    specs: {
      lowerBout: "13½ in",
      scaleLength: "24.9 in",
      nutWidth: "1¾ in",
      frets: "12 to the body",
      depth: "4¼ in",
    },
    basePrice: 4200,
    buildMonths: [6, 9],
    recommends: { top: "adirondack-spruce", body: "mahogany", fretboard: "ebony" },
    accent: "#8A6245",
    order: 1,
  },
  {
    slug: "grand-concert-12",
    name: "Grand Concert 12-Fret",
    shortName: "Grand Concert",
    family: "guitar",
    silhouette: "grand-concert",
    tagline: "Refined. Even. Beautifully composed.",
    descriptors: ["Refined", "Even", "Warm"],
    playingStyles: ["Fingerstyle", "Singer-songwriter", "Recording", "Small rooms"],
    idealUse: ["Fingerstyle", "Studio", "Singer-songwriter", "Ensemble"],
    summary: "A composed, evenly balanced body with the elegance of a 12-fret neck.",
    story: [
      "The Grand Concert answers the player who wants balance above all else. No single register shouts over the others; chords sit together, and single notes bloom cleanly out of them.",
      "Joined at the twelfth fret, the bridge sits nearer the center of a slightly larger body, which lends the guitar a rounded warmth and a relaxed, singing sustain. It is a natural companion to the voice.",
    ],
    toneProfile:
      "Warm, balanced, and refined, with a rounded low end and a vocal midrange. The 12-fret join adds sweetness and a relaxed sustain.",
    bodyShape: "Grand Concert body, 12 frets to the body.",
    specs: {
      lowerBout: "15 in",
      scaleLength: "24.9 in",
      nutWidth: "1¾ in",
      frets: "12 to the body",
      depth: "4½ in",
    },
    basePrice: 4800,
    buildMonths: [7, 10],
    recommends: { top: "european-spruce", body: "east-indian-rosewood", fretboard: "ebony" },
    accent: "#74745B",
    order: 2,
  },
  {
    slug: "om-14",
    name: "OM 14-Fret",
    shortName: "OM",
    family: "guitar",
    silhouette: "om",
    tagline: "Balanced. Responsive. Exceptionally versatile.",
    descriptors: ["Balanced", "Responsive", "Versatile"],
    playingStyles: ["Fingerstyle", "Flatpicking", "Singer-songwriter", "Studio"],
    idealUse: ["Fingerstyle", "Flatpicking", "Recording", "Singer-songwriters"],
    summary:
      "The all-rounder — articulate under fingers, punchy under a pick, at home anywhere.",
    story: [
      "If a player asks for one guitar to do everything, the OM is the honest answer. The 14-fret neck and comfortable body give it reach and clarity without ever tipping into boominess.",
      "It is quick to respond and easy to record, with enough headroom for a flatpick and enough nuance for fingerstyle. Many players who commission an OM find it becomes the instrument they reach for first, for years.",
    ],
    toneProfile:
      "Articulate and well-defined across the strings, with strong note separation and a responsive, dynamic character that suits both fingers and a pick.",
    bodyShape: "Orchestra Model body, 14 frets to the body.",
    specs: {
      lowerBout: "15 in",
      scaleLength: "25.4 in",
      nutWidth: "1¾ in",
      frets: "14 to the body",
      depth: "4⅛ in",
    },
    basePrice: 4600,
    buildMonths: [7, 10],
    recommends: { top: "european-spruce", body: "mahogany", fretboard: "ebony" },
    accent: "#A88A5A",
    order: 3,
  },
  {
    slug: "dreadnought",
    name: "Dreadnought",
    shortName: "Dreadnought",
    family: "guitar",
    silhouette: "dreadnought",
    tagline: "Powerful. Bold. Unmistakably present.",
    descriptors: ["Powerful", "Bold", "Full"],
    playingStyles: ["Flatpicking", "Strumming", "Bluegrass", "Stage"],
    idealUse: ["Flatpicking", "Strumming", "Stage", "Ensemble"],
    summary: "The big voice — deep, projecting, and built to be heard in a room.",
    story: [
      "The Dreadnought is the workshop's largest standard body, and it plays like it. A broad low end and generous projection make it the instrument for strumming, flatpicking, and holding a room on its own.",
      "Built with Adirondack bracing and carefully voiced, an Alexeas Dreadnought keeps its clarity even when pushed hard — power with definition, not just volume.",
    ],
    toneProfile:
      "Deep, powerful, and projecting, with a broad low end and strong fundamentals. Voiced to keep clarity and headroom when driven.",
    bodyShape: "Dreadnought body, 14 frets to the body.",
    specs: {
      lowerBout: "15⅝ in",
      scaleLength: "25.4 in",
      nutWidth: "1¹¹⁄₁₆ in",
      frets: "14 to the body",
      depth: "4¾ in",
    },
    basePrice: 4700,
    buildMonths: [7, 10],
    recommends: { top: "adirondack-spruce", body: "east-indian-rosewood", fretboard: "ebony" },
    accent: "#556B70",
    order: 4,
  },
  {
    slug: "mandolin",
    name: "Mandolin",
    shortName: "Mandolin",
    family: "mandolin",
    silhouette: "mandolin",
    tagline: "Bright. Percussive. Full of life.",
    descriptors: ["Bright", "Percussive", "Clear"],
    playingStyles: ["Melody", "Chop", "Ensemble", "Recording"],
    idealUse: ["Bluegrass", "Folk", "Ensemble", "Recording"],
    summary: "A carved, individually voiced mandolin with clarity and quick attack.",
    story: [
      "Alongside guitars, the workshop builds mandolins to order. Each is carved and voiced individually, with the same attention to tap-tone and balance that goes into the guitars.",
      "The result is a mandolin with a clear, singing top end, a percussive chop, and enough warmth underneath to keep it from ever sounding thin.",
    ],
    toneProfile:
      "Clear and bright with a percussive attack, a singing melodic voice, and a warm, present body underneath.",
    bodyShape: "Carved mandolin, built to order.",
    specs: {
      lowerBout: "10 in",
      scaleLength: "13⅞ in",
      nutWidth: "1⅛ in",
      frets: "20 to the body",
      depth: "2 in",
    },
    basePrice: 3800,
    buildMonths: [6, 9],
    recommends: { top: "adirondack-spruce", body: "maple", fretboard: "ebony" },
    accent: "#8A6245",
    order: 5,
  },
];

export const GUITAR_MODELS = MODELS.filter((m) => m.family === "guitar");

export function getModel(slug: string): GuitarModel | undefined {
  return MODELS.find((m) => m.slug === slug);
}

export const FAMILIES: {
  key: InstrumentFamily;
  title: string;
  blurb: string;
  href: string;
}[] = [
  {
    key: "guitar",
    title: "Guitars",
    blurb:
      "Four standard bodies — from the intimate O to the projecting Dreadnought — each a starting point for an instrument built around one player.",
    href: "/instruments#guitars",
  },
  {
    key: "mandolin",
    title: "Mandolins",
    blurb:
      "Carved and voiced by hand, built to order for players who want clarity, attack, and a voice of their own.",
    href: "/instruments#mandolins",
  },
  {
    key: "custom",
    title: "Custom Instruments",
    blurb:
      "Guitars, mandolins, and other stringed instruments that begin as a conversation rather than a catalog.",
    href: "/contact",
  },
];
