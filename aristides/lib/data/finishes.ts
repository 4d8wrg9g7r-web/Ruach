/**
 * Finish catalogue (§6 Finish Lab, §15 configurator).
 *
 * With no real paint photography in the prototype, each finish carries a CSS
 * descriptor so swatches and the visualiser render convincingly and self-
 * contained. `swatch` is a ready-to-use CSS background; `tint` is the ambient
 * light (r,g,b) the UI reflects when the finish is featured. `behaviour` drives
 * the subtle material animation (§15). Real photography swaps in behind the same
 * interface later.
 */

export type FinishCategory =
  | "RAW"
  | "SOLID SATIN"
  | "SOLID GLOSS"
  | "MARBLE SATIN"
  | "MARBLE GLOSS"
  | "CHAMELEON SATIN"
  | "CHAMELEON GLOSS"
  | "SPARKLE"
  | "METAL"
  | "CUSTOM";

export type FinishBehaviour = "flat" | "gloss" | "chameleon" | "sparkle" | "metal" | "marble";

export interface Finish {
  id: string;
  name: string;
  category: FinishCategory;
  swatch: string;
  tint: [number, number, number];
  behaviour: FinishBehaviour;
  /** Added to the base price, EUR. */
  priceAdd: number;
  /** Optional second colour for chameleon shift. */
  shiftSwatch?: string;
}

const solid = (
  id: string,
  name: string,
  hex: string,
  tint: [number, number, number],
  gloss = false,
): Finish => ({
  id,
  name,
  category: gloss ? "SOLID GLOSS" : "SOLID SATIN",
  behaviour: gloss ? "gloss" : "flat",
  tint,
  priceAdd: gloss ? 150 : 0,
  swatch: gloss
    ? `radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.28), transparent 42%), ${hex}`
    : `linear-gradient(150deg, ${hex}, color-mix(in srgb, ${hex} 82%, black))`,
});

export const FINISHES: Finish[] = [
  // ---- RAW -------------------------------------------------------------
  {
    id: "raw-arium",
    name: "Raw Arium",
    category: "RAW",
    behaviour: "flat",
    tint: [138, 143, 152],
    priceAdd: 0,
    swatch:
      "repeating-linear-gradient(115deg, #2a2d31 0 3px, #24272b 3px 6px), linear-gradient(150deg, #33363b, #1c1e22)",
  },

  // ---- SOLID SATIN -----------------------------------------------------
  solid("anthracite", "Anthracite", "#2b2e33", [90, 95, 104]),
  solid("black", "Black", "#0d0f11", [40, 42, 46]),
  solid("aqua-green", "Aqua Green", "#1fb0a0", [63, 210, 190]),
  solid("army-green", "Army Green", "#586048", [120, 130, 96]),
  solid("bright-green", "Bright Green", "#38c24a", [90, 220, 110]),
  solid("bright-red", "Bright Red", "#d62828", [230, 70, 70]),
  solid("cerulean-blue", "Cerulean Blue", "#2a6bd4", [80, 140, 230]),
  solid("dark-blue", "Dark Blue", "#1c2e5c", [70, 100, 180]),
  solid("dark-teal", "Dark Teal", "#124e4a", [40, 150, 145]),
  solid("desert-tan", "Desert Tan", "#c2a878", [210, 190, 150]),
  solid("emerald-green", "Emerald Green", "#0f8a52", [50, 190, 130]),
  solid("lambo-grey", "Lambo Grey", "#8d9296", [160, 165, 170]),
  solid("light-blue", "Light Blue", "#7fb6e6", [150, 200, 240]),
  solid("lilac", "Lilac", "#b49adf", [200, 175, 235]),
  solid("orange", "Orange", "#e8721f", [240, 130, 60]),
  solid("royal-red", "Royal Red", "#8f1d2d", [180, 60, 75]),
  solid("seafoam", "Seafoam", "#7fd6c2", [150, 225, 205]),
  solid("shell-pink", "Shell Pink", "#e6b6be", [235, 195, 200]),
  solid("white", "White", "#eceded", [235, 236, 236]),
  solid("yellow", "Yellow", "#e8c531", [240, 205, 70]),

  // ---- SOLID GLOSS -----------------------------------------------------
  solid("purple-gloss", "Purple", "#6d28c4", [150, 90, 235], true),
  solid("pink-gloss", "Pink", "#e0559b", [235, 110, 175], true),
  solid("gold-gloss", "Gold", "#c8a13a", [220, 180, 90], true),

  // ---- MARBLE ----------------------------------------------------------
  {
    id: "marble-ivory-satin",
    name: "Ivory Marble",
    category: "MARBLE SATIN",
    behaviour: "marble",
    tint: [220, 215, 205],
    priceAdd: 450,
    swatch:
      "radial-gradient(60% 40% at 30% 25%, #e8e4dc, transparent 60%), radial-gradient(50% 60% at 75% 70%, #c9c3b6, transparent 55%), linear-gradient(120deg, #d9d4c9, #b6b0a3)",
  },
  {
    id: "marble-storm-gloss",
    name: "Storm Marble",
    category: "MARBLE GLOSS",
    behaviour: "marble",
    tint: [120, 128, 138],
    priceAdd: 550,
    swatch:
      "radial-gradient(50% 40% at 35% 30%, #3b4048, transparent 60%), radial-gradient(60% 55% at 70% 75%, #14161a, transparent 55%), linear-gradient(120deg, #2a2e34, #0f1113)",
  },

  // ---- CHAMELEON -------------------------------------------------------
  {
    id: "cham-purple-red",
    name: "Purple / Red Chameleon",
    category: "CHAMELEON GLOSS",
    behaviour: "chameleon",
    tint: [150, 60, 200],
    priceAdd: 650,
    swatch: "linear-gradient(130deg, #5a1e9c 0%, #8a1e5c 55%, #b31d3a 100%)",
    shiftSwatch: "linear-gradient(130deg, #b31d3a 0%, #8a1e5c 45%, #5a1e9c 100%)",
  },
  {
    id: "cham-blueberry",
    name: "Blueberry Chameleon",
    category: "CHAMELEON GLOSS",
    behaviour: "chameleon",
    tint: [90, 90, 210],
    priceAdd: 650,
    swatch: "linear-gradient(130deg, #241c8a 0%, #5a2ca0 55%, #7a2c7a 100%)",
    shiftSwatch: "linear-gradient(130deg, #7a2c7a 0%, #3a2ca0 45%, #1c3a8a 100%)",
  },
  {
    id: "cham-blue-green",
    name: "Blue / Green Chameleon",
    category: "CHAMELEON SATIN",
    behaviour: "chameleon",
    tint: [60, 190, 180],
    priceAdd: 600,
    swatch: "linear-gradient(130deg, #123a9c 0%, #0f7a8a 55%, #128a52 100%)",
    shiftSwatch: "linear-gradient(130deg, #128a52 0%, #0f8a7a 45%, #123a9c 100%)",
  },
  {
    id: "cham-rose-gold",
    name: "Rose Gold Chameleon",
    category: "CHAMELEON GLOSS",
    behaviour: "chameleon",
    tint: [220, 150, 130],
    priceAdd: 700,
    swatch: "linear-gradient(130deg, #b56a52 0%, #c98a6a 55%, #caa06a 100%)",
    shiftSwatch: "linear-gradient(130deg, #caa06a 0%, #c98a8a 45%, #b5526a 100%)",
  },

  // ---- SPARKLE ---------------------------------------------------------
  {
    id: "sparkle-arctic-sunset",
    name: "Arctic Sunset",
    category: "SPARKLE",
    behaviour: "sparkle",
    tint: [200, 120, 170],
    priceAdd: 500,
    swatch:
      "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.7), transparent), linear-gradient(130deg, #7a3a8a, #c25a7a 60%, #e0894a)",
  },
  {
    id: "sparkle-galactic",
    name: "Galactic",
    category: "SPARKLE",
    behaviour: "sparkle",
    tint: [90, 110, 190],
    priceAdd: 500,
    swatch:
      "radial-gradient(1px 1px at 25% 40%, rgba(255,255,255,0.85), transparent), radial-gradient(1px 1px at 65% 25%, rgba(255,255,255,0.7), transparent), linear-gradient(130deg, #12143a, #2a2c6a 60%, #4a2c8a)",
  },
  {
    id: "sparkle-nebula",
    name: "Nebula",
    category: "SPARKLE",
    behaviour: "sparkle",
    tint: [150, 80, 190],
    priceAdd: 550,
    swatch:
      "radial-gradient(1px 1px at 30% 30%, rgba(255,255,255,0.85), transparent), radial-gradient(1px 1px at 75% 65%, rgba(255,255,255,0.7), transparent), linear-gradient(130deg, #2a0f4a, #7a1d6a 55%, #b31d5a)",
  },

  // ---- METAL -----------------------------------------------------------
  {
    id: "metal-worn-steel",
    name: "Worn Steel",
    category: "METAL",
    behaviour: "metal",
    tint: [160, 165, 172],
    priceAdd: 600,
    swatch: "linear-gradient(115deg, #6b7076 0%, #a8adb2 40%, #4e5257 70%, #8b9096 100%)",
  },
  {
    id: "metal-aluminum",
    name: "Aluminum Metal",
    category: "METAL",
    behaviour: "metal",
    tint: [180, 185, 190],
    priceAdd: 600,
    swatch: "linear-gradient(115deg, #8b9096 0%, #cbced1 40%, #6b7076 70%, #aeb3b8 100%)",
  },
  {
    id: "metal-gold",
    name: "Gold Metal",
    category: "METAL",
    behaviour: "metal",
    tint: [210, 175, 90],
    priceAdd: 650,
    swatch: "linear-gradient(115deg, #8a6a1e 0%, #e0c060 40%, #6a4e14 70%, #c8a13a 100%)",
  },
  {
    id: "metal-martian-rust",
    name: "Martian Rust",
    category: "METAL",
    behaviour: "metal",
    tint: [180, 90, 60],
    priceAdd: 650,
    swatch: "linear-gradient(115deg, #6a2c1e 0%, #b5563a 40%, #4a1e14 70%, #8a3a24 100%)",
  },
  {
    id: "metal-bronze-oxidized",
    name: "Bronze Oxidized",
    category: "METAL",
    behaviour: "metal",
    tint: [130, 150, 120],
    priceAdd: 700,
    swatch: "linear-gradient(115deg, #4a5a3a 0%, #8a9a5a 35%, #3a4a4a 65%, #6a7a4a 100%)",
  },

  // ---- CUSTOM ----------------------------------------------------------
  {
    id: "custom",
    name: "Custom Finish",
    category: "CUSTOM",
    behaviour: "gloss",
    tint: [127, 233, 227],
    priceAdd: 750,
    swatch:
      "conic-gradient(from 210deg, #7a3a8a, #2a6bd4, #1fb0a0, #38c24a, #e8c531, #e8721f, #d62828, #7a3a8a)",
  },
];

export const FINISH_CATEGORIES: FinishCategory[] = [
  "RAW",
  "SOLID SATIN",
  "SOLID GLOSS",
  "MARBLE SATIN",
  "MARBLE GLOSS",
  "CHAMELEON SATIN",
  "CHAMELEON GLOSS",
  "SPARKLE",
  "METAL",
  "CUSTOM",
];

export function finishById(id: string): Finish | undefined {
  return FINISHES.find((f) => f.id === id);
}

export function finishesByCategory(cat: FinishCategory): Finish[] {
  return FINISHES.filter((f) => f.category === cat);
}
