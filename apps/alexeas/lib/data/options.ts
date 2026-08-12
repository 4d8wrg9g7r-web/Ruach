/**
 * Non-wood configurator options — the "Feel" and "Details" choices. Woods live
 * in woods.ts; everything else (neck profiles, rosettes, inlays, bindings, arm
 * bevels) lives here under a single extensible shape so new categories can be
 * added later without touching the configurator UI.
 *
 * Compatibility is expressed declaratively:
 *   - `compatibleModels`  — whitelist of model slugs (undefined = every model)
 *   - `incompatibleOptions` — option/wood slugs this choice cannot coexist with
 *   - `requires`          — option/wood slugs that must already be selected
 * The engine (lib/config/engine.ts) reads these to disable impossible builds and
 * explain why, so a customer can never assemble an instrument that can't be made.
 */

import { GUITAR_MODELS } from "./models";

export type OptionCategory =
  | "neck-profile"
  | "rosette"
  | "fretboard-inlay"
  | "body-binding"
  | "neck-binding"
  | "arm-bevel";

export interface ConfigOption {
  slug: string;
  name: string;
  category: OptionCategory;
  description: string;
  priceModifier: number;
  leadTimeMonths?: number;
  compatibleModels?: string[];
  incompatibleOptions?: string[];
  requires?: string[];
  availability: "in-stock" | "limited" | "by-request";
  recommended?: boolean;
  order: number;
  /** Drives the SVG preview: a swatch color and/or a named visual treatment. */
  color?: string;
  visualKey?: string;
}

const ALL_GUITARS = GUITAR_MODELS.map((m) => m.slug);

export const OPTIONS: ConfigOption[] = [
  // ── Neck profile ──────────────────────────────────────────────────────────
  {
    slug: "rounded-c",
    name: "Rounded C",
    category: "neck-profile",
    description: "A familiar, medium-full profile that suits almost every hand.",
    priceModifier: 0,
    availability: "in-stock",
    recommended: true,
    order: 1,
    visualKey: "rounded-c",
  },
  {
    slug: "soft-v",
    name: "Soft V",
    category: "neck-profile",
    description: "A gentle V with a defined spine — a favorite of thumb-over players.",
    priceModifier: 0,
    availability: "in-stock",
    order: 2,
    visualKey: "soft-v",
  },
  {
    slug: "modern-c",
    name: "Modern C",
    category: "neck-profile",
    description: "A slimmer, flatter C for fast, low-effort playing across the neck.",
    priceModifier: 0,
    availability: "in-stock",
    order: 3,
    visualKey: "modern-c",
  },

  // ── Rosette (sound-hole inlay) ────────────────────────────────────────────
  {
    slug: "rosette-classic",
    name: "Classic Ring",
    category: "rosette",
    description: "Concentric wood rings — quiet, traditional, and timeless.",
    priceModifier: 0,
    availability: "in-stock",
    recommended: true,
    order: 1,
    color: "#8A6245",
    visualKey: "ring",
  },
  {
    slug: "rosette-mosaic",
    name: "Wood Mosaic",
    category: "rosette",
    description: "A fine mosaic of end-grain woods, set and leveled by hand.",
    priceModifier: 220,
    availability: "in-stock",
    order: 2,
    color: "#A88A5A",
    visualKey: "mosaic",
  },
  {
    slug: "rosette-abalone",
    name: "Abalone",
    category: "rosette",
    description: "A ring of shell that catches the light and shifts as you move.",
    priceModifier: 380,
    leadTimeMonths: 1,
    availability: "limited",
    order: 3,
    color: "#6E8A8C",
    visualKey: "shell",
  },
  {
    slug: "rosette-minimal",
    name: "Minimal",
    category: "rosette",
    description: "A single hairline ring — restraint as its own statement.",
    priceModifier: 0,
    availability: "in-stock",
    order: 4,
    color: "#3A2A21",
    visualKey: "hairline",
  },

  // ── Fretboard inlay ───────────────────────────────────────────────────────
  {
    slug: "inlay-none",
    name: "Unmarked",
    category: "fretboard-inlay",
    description: "A clean board with only side dots — pure and understated.",
    priceModifier: 0,
    availability: "in-stock",
    order: 1,
    visualKey: "none",
  },
  {
    slug: "inlay-dots",
    name: "Traditional Dots",
    category: "fretboard-inlay",
    description: "Simple position dots in shell or bone — the classic marker.",
    priceModifier: 0,
    availability: "in-stock",
    recommended: true,
    order: 2,
    color: "#F2EADF",
    visualKey: "dots",
  },
  {
    slug: "inlay-diamonds",
    name: "Diamonds & Squares",
    category: "fretboard-inlay",
    description: "A vintage pattern of diamonds and squares along the neck.",
    priceModifier: 260,
    availability: "in-stock",
    order: 3,
    color: "#EDE6D6",
    visualKey: "diamonds",
  },
  {
    slug: "inlay-vine",
    name: "Abalone Vine",
    category: "fretboard-inlay",
    description: "A flowing shell vine, cut and inlaid by hand. Shows best on ebony.",
    priceModifier: 900,
    leadTimeMonths: 1,
    // Only offered on an ebony board, where the shell reads best.
    requires: ["ebony"],
    availability: "by-request",
    order: 4,
    color: "#7FA0A2",
    visualKey: "vine",
  },

  // ── Body binding ──────────────────────────────────────────────────────────
  {
    slug: "binding-ebony",
    name: "Ebony",
    category: "body-binding",
    description: "A dark, quiet frame that lets the top wood lead.",
    priceModifier: 0,
    availability: "in-stock",
    recommended: true,
    order: 1,
    color: "#1E1A17",
    visualKey: "binding",
  },
  {
    slug: "binding-maple",
    name: "Maple",
    category: "body-binding",
    description: "A pale line that draws a crisp edge around the body.",
    priceModifier: 120,
    availability: "in-stock",
    order: 2,
    color: "#D8C29A",
    visualKey: "binding",
  },
  {
    slug: "binding-rosewood",
    name: "Rosewood",
    category: "body-binding",
    description: "A warm, figured border with visible grain.",
    priceModifier: 160,
    availability: "in-stock",
    order: 3,
    color: "#4A3226",
    visualKey: "binding",
  },
  {
    slug: "binding-koa",
    name: "Koa",
    category: "body-binding",
    description: "A luminous, flamed border. Its width is reserved for a plain edge, not a beveled arm.",
    priceModifier: 300,
    // Demonstrates a binding/arm-bevel conflict: koa binding won't wrap a bevel.
    incompatibleOptions: ["bevel-walnut", "bevel-ebony"],
    availability: "limited",
    order: 4,
    color: "#9A5A2E",
    visualKey: "binding",
  },
  {
    slug: "binding-tortoise",
    name: "Tortoise",
    category: "body-binding",
    description: "A warm faux-tortoise shell edge with mottled depth.",
    priceModifier: 140,
    incompatibleOptions: ["bevel-walnut", "bevel-ebony"],
    availability: "in-stock",
    order: 5,
    color: "#7A3B22",
    visualKey: "binding",
  },

  // ── Neck binding ──────────────────────────────────────────────────────────
  {
    slug: "neckbind-none",
    name: "Unbound",
    category: "neck-binding",
    description: "A clean, unbound neck edge.",
    priceModifier: 0,
    availability: "in-stock",
    recommended: true,
    order: 1,
    visualKey: "none",
  },
  {
    slug: "neckbind-ivoroid",
    name: "Ivoroid",
    category: "neck-binding",
    description: "A cream binding that frames the fretboard edge.",
    priceModifier: 180,
    availability: "in-stock",
    order: 2,
    color: "#EDE6D6",
    visualKey: "neck-binding",
  },
  {
    slug: "neckbind-ebony",
    name: "Ebony",
    category: "neck-binding",
    description: "A dark binding for a seamless, monochrome neck.",
    priceModifier: 180,
    availability: "in-stock",
    order: 3,
    color: "#1E1A17",
    visualKey: "neck-binding",
  },

  // ── Arm bevel (guitars only) ──────────────────────────────────────────────
  {
    slug: "bevel-none",
    name: "None",
    category: "arm-bevel",
    description: "A traditional edge where the forearm meets the body.",
    priceModifier: 0,
    compatibleModels: ALL_GUITARS,
    availability: "in-stock",
    recommended: true,
    order: 1,
    visualKey: "none",
  },
  {
    slug: "bevel-walnut",
    name: "Walnut Arm Bevel",
    category: "arm-bevel",
    description: "A carved, contoured bevel capped in walnut for comfort over long sessions.",
    priceModifier: 480,
    leadTimeMonths: 1,
    compatibleModels: ALL_GUITARS,
    availability: "in-stock",
    order: 2,
    color: "#5A4636",
    visualKey: "bevel",
  },
  {
    slug: "bevel-ebony",
    name: "Ebony Arm Bevel",
    category: "arm-bevel",
    description: "A contoured bevel capped in ebony — a dark, elegant transition.",
    priceModifier: 520,
    leadTimeMonths: 1,
    compatibleModels: ALL_GUITARS,
    availability: "in-stock",
    order: 3,
    color: "#1E1A17",
    visualKey: "bevel",
  },
];

export function optionsByCategory(category: OptionCategory): ConfigOption[] {
  return OPTIONS.filter((o) => o.category === category).sort((a, b) => a.order - b.order);
}

export function getOption(slug: string): ConfigOption | undefined {
  return OPTIONS.find((o) => o.slug === slug);
}
