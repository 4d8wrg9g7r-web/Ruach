/**
 * Configurator engine (§11–§22).
 *
 * The whole point of §21: configuration logic lives as DATA, not scattered
 * conditions. Platforms declare which string counts, orientations, bridges and
 * pickup layouts they support; the UI just asks this module what is valid and
 * renders the answer. Invalid combinations disappear (or are disabled with a
 * reason) rather than being silently accepted. A CMS owns this shape later.
 */

import type { Construction } from "./models";

/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */

export interface Step {
  n: number;
  id: StepId;
  label: string;
  /** Short teaching line shown while on the step (§40 — configuration teaches). */
  teach: string;
}

export type StepId =
  | "platform"
  | "strings"
  | "format"
  | "finish"
  | "fretboard"
  | "hardware"
  | "bridge"
  | "pickups"
  | "controls"
  | "details"
  | "review";

export const STEPS: Step[] = [
  { n: 1, id: "platform", label: "Platform", teach: "The platform sets the geometry everything else is built around." },
  { n: 2, id: "strings", label: "Strings", teach: "String count drives scale length, neck width, and which hardware fits." },
  { n: 3, id: "format", label: "Format", teach: "Orientation and layout. Left-handed is offered only where it can be built." },
  { n: 4, id: "finish", label: "Finish", teach: "Raw Arium, or paint. The visualiser updates as you choose." },
  { n: 5, id: "fretboard", label: "Fretboard", teach: "Board material, inlays and side-dot luminescence." },
  { n: 6, id: "hardware", label: "Hardware", teach: "The colour of every metal part on the instrument." },
  { n: 7, id: "bridge", label: "Bridge", teach: "The bridge system defines tuning stability and feel." },
  { n: 8, id: "pickups", label: "Pickups", teach: "The voice. Passive or active, and how they're laid out." },
  { n: 9, id: "controls", label: "Controls", teach: "Switching and control layout." },
  { n: 10, id: "details", label: "Details", teach: "Tuning, string gauge and anything Aristides should know." },
  { n: 11, id: "review", label: "Review", teach: "Your complete specification and estimated price." },
];

/* ------------------------------------------------------------------ */
/* Platforms                                                           */
/* ------------------------------------------------------------------ */

export type Orientation = "right" | "left";

export interface Platform {
  id: string;
  /** Short code used inside the build designation, e.g. "STX", "H". */
  code: string;
  name: string;
  construction: Construction;
  familySlug: string;
  stringCounts: number[];
  orientations: Orientation[];
  /** Scale length label per string count. */
  scaleByStrings: Record<number, string>;
  /** Base price (EUR) per string count. */
  basePriceByStrings: Record<number, number>;
  /** Bridge ids valid on this platform. */
  bridges: string[];
  /** Pickup layout ids valid on this platform. */
  pickupLayouts: string[];
  /** Whether this platform's designation carries a trailing "S" (multiscale). */
  multiscaleSuffix?: boolean;
}

export const PLATFORMS: Platform[] = [
  {
    id: "0",
    code: "0",
    name: "0 Standard",
    construction: "standard",
    familySlug: "0-standard",
    stringCounts: [6, 7, 8],
    orientations: ["right", "left"],
    scaleByStrings: { 6: '25.5"', 7: '26.5"', 8: '27"' },
    basePriceByStrings: { 6: 2445, 7: 2545, 8: 2645 },
    bridges: ["hipshot-fixed", "hipshot-contour", "floyd-rose", "evertune"],
    pickupLayouts: ["hh", "hsh", "h"],
  },
  {
    id: "S",
    code: "0",
    name: "S Multiscale",
    construction: "multiscale",
    familySlug: "s-multiscale",
    stringCounts: [6, 7, 8],
    orientations: ["right", "left"],
    scaleByStrings: { 6: '25.5–27"', 7: '25.5–27"', 8: '25.5–27"' },
    basePriceByStrings: { 6: 2795, 7: 2895, 8: 2995 },
    bridges: ["hipshot-fixed-ms", "evertune-ms"],
    pickupLayouts: ["hh", "hsh"],
    multiscaleSuffix: true,
  },
  {
    id: "H",
    code: "H",
    name: "H Headless",
    construction: "headless",
    familySlug: "h-headless",
    stringCounts: [6, 7, 8, 9],
    orientations: ["right", "left"],
    scaleByStrings: { 6: '25.5"', 7: '26.5"', 8: '27"', 9: '28"' },
    basePriceByStrings: { 6: 2795, 7: 2895, 8: 2995, 9: 3095 },
    bridges: ["hantug-headless", "hantug-headless-ms"],
    pickupLayouts: ["hh", "hsh"],
  },
  {
    id: "T",
    code: "T",
    name: "T Style",
    construction: "traditional",
    familySlug: "t-style",
    stringCounts: [6],
    orientations: ["right", "left"],
    scaleByStrings: { 6: '25.5"' },
    basePriceByStrings: { 6: 2545 },
    bridges: ["hipshot-fixed", "hipshot-contour", "floyd-rose", "evertune"],
    pickupLayouts: ["hh", "hsh", "hs", "ss", "h"],
  },
  {
    id: "STX",
    code: "STX",
    name: "STX",
    construction: "offset",
    familySlug: "stx",
    stringCounts: [6, 7, 8],
    orientations: ["right"],
    scaleByStrings: { 6: '25.5"', 7: '26.5"', 8: '27"' },
    basePriceByStrings: { 6: 2995, 7: 3095, 8: 3195 },
    bridges: ["hipshot-fixed", "hipshot-contour", "evertune"],
    pickupLayouts: ["hh", "h"],
  },
  {
    id: "STXS",
    code: "STX",
    name: "STX Multiscale",
    construction: "offset",
    familySlug: "stx",
    stringCounts: [6, 7, 8],
    orientations: ["right"],
    scaleByStrings: { 6: '25.5–27"', 7: '25.5–27"', 8: '25.5–27"' },
    basePriceByStrings: { 6: 3195, 7: 3295, 8: 3395 },
    bridges: ["hipshot-fixed-ms", "evertune-ms"],
    pickupLayouts: ["hh", "h"],
    multiscaleSuffix: true,
  },
  {
    id: "SB",
    code: "S/B",
    name: "S/B Bass",
    construction: "bass",
    familySlug: "sb-bass",
    stringCounts: [4, 5, 6],
    orientations: ["right", "left"],
    scaleByStrings: { 4: '34"', 5: '34–35"', 6: '34–35"' },
    basePriceByStrings: { 4: 2995, 5: 3195, 6: 3395 },
    bridges: ["hipshot-bass", "hipshot-bass-ms"],
    pickupLayouts: ["soapbar", "jj"],
    multiscaleSuffix: true,
  },
];

export function platformById(id: string): Platform | undefined {
  return PLATFORMS.find((p) => p.id === id);
}

/* ------------------------------------------------------------------ */
/* Option catalogues                                                   */
/* ------------------------------------------------------------------ */

export interface Option {
  id: string;
  label: string;
  desc?: string;
  priceAdd?: number;
  /** CSS colour/gradient for a hardware/material chip. */
  chip?: string;
}

export const ORIENTATIONS: Record<Orientation, Option> = {
  right: { id: "right", label: "Right-handed", desc: "Standard orientation." },
  left: { id: "left", label: "Left-handed", desc: "Built to order where the platform allows.", priceAdd: 150 },
};

export interface Bridge extends Option {
  code: string;
  constructions: Construction[];
}

export const BRIDGES: Bridge[] = [
  { id: "hipshot-fixed", code: "HT", label: "Hipshot Fixed", desc: "A rock-solid fixed bridge. Maximum sustain transfer, zero drama.", priceAdd: 0, constructions: ["standard", "traditional", "offset"] },
  { id: "hipshot-contour", code: "HC", label: "Hipshot US Contour", desc: "Low-profile contoured baseplate for a closer palm and cleaner ergonomics.", priceAdd: 90, constructions: ["standard", "traditional", "offset"] },
  { id: "floyd-rose", code: "FR", label: "Floyd Rose", desc: "Double-locking tremolo for extreme vibrato with tuning return.", priceAdd: 260, constructions: ["standard", "traditional"] },
  { id: "evertune", code: "ET", label: "EverTune", desc: "A constant-tension bridge that holds pitch through bends, heat and time.", priceAdd: 320, constructions: ["standard", "traditional", "offset"] },
  { id: "hipshot-fixed-ms", code: "HT", label: "Hipshot Fixed — Multiscale", desc: "Individual fanned saddles for a true multiscale fixed bridge.", priceAdd: 120, constructions: ["multiscale", "offset"] },
  { id: "evertune-ms", code: "ET", label: "Aristides Multiscale EverTune", desc: "Aristides' own multiscale EverTune implementation — constant tension, fanned.", priceAdd: 480, constructions: ["multiscale", "offset"] },
  { id: "hantug-headless", code: "HG", label: "Hantug Headless", desc: "The proprietary Aristides × Hantug headless bridge and headpiece system.", priceAdd: 0, constructions: ["headless"] },
  { id: "hantug-headless-ms", code: "HG", label: "Hantug Headless — Multiscale", desc: "The headless system in a fanned-fret configuration.", priceAdd: 180, constructions: ["headless"] },
  { id: "hipshot-bass", code: "HB", label: "Hipshot Bass", desc: "A precise fixed bass bridge with fine spacing control.", priceAdd: 0, constructions: ["bass"] },
  { id: "hipshot-bass-ms", code: "HB", label: "Hipshot Bass — Multiscale", desc: "Fanned bass bridge for balanced low-string tension.", priceAdd: 140, constructions: ["bass"] },
];

export function bridgeById(id: string): Bridge | undefined {
  return BRIDGES.find((b) => b.id === id);
}

export interface PickupLayout extends Option {
  code: string;
}

export const PICKUP_LAYOUTS: PickupLayout[] = [
  { id: "hh", code: "HH", label: "Humbucker / Humbucker", desc: "Two full humbuckers — the extended-range default: fat, focused, aggressive." },
  { id: "hsh", code: "HSH", label: "H-S-H", desc: "Humbuckers at the ends with a middle single-coil for quacky in-between voices." },
  { id: "hs", code: "HS", label: "Humbucker / Single", desc: "Bridge humbucker, neck single — classic versatility." },
  { id: "ss", code: "SS", label: "Single / Single", desc: "Two single-coils for glassy, articulate tones." },
  { id: "h", code: "H", label: "Single Humbucker", desc: "One bridge humbucker. Nothing in the way." },
  { id: "soapbar", code: "SB", label: "Dual Soapbar", desc: "Two soapbar bass pickups — deep, even, full-range." },
  { id: "jj", code: "JJ", label: "J / J", desc: "Two single-coil bass pickups for growl and definition." },
];

export function pickupLayoutById(id: string): PickupLayout | undefined {
  return PICKUP_LAYOUTS.find((p) => p.id === id);
}

export interface PickupSet extends Option {
  brand: string;
  model: string;
  type: "passive" | "active";
  character: string;
}

/** CMS-managed in production (§18). A representative, brand-diverse starter set. */
export const PICKUP_SETS: PickupSet[] = [
  { id: "bkp-aftermath", brand: "Bare Knuckle", model: "Aftermath", type: "passive", character: "Tight, high-output, brutally articulate.", priceAdd: 320, label: "Bare Knuckle Aftermath" },
  { id: "bkp-juggernaut", brand: "Bare Knuckle", model: "Juggernaut", type: "passive", character: "Balanced modern output with clarity under gain.", priceAdd: 320, label: "Bare Knuckle Juggernaut" },
  { id: "emg-8189", brand: "EMG", model: "81 / 89", type: "active", character: "The active metal standard — focused and quiet.", priceAdd: 230, label: "EMG 81 / 89" },
  { id: "sd-nazgul", brand: "Seymour Duncan", model: "Nazgûl / Sentient", type: "passive", character: "Aggressive bridge, dynamic neck — a modern set.", priceAdd: 240, label: "Seymour Duncan Nazgûl / Sentient" },
  { id: "fishman-modern", brand: "Fishman", model: "Fluence Modern", type: "active", character: "Two voices per pickup, zero hum.", priceAdd: 280, label: "Fishman Fluence Modern" },
  { id: "lundgren-m", brand: "Lundgren", model: "M-Series", type: "passive", character: "The extended-range benchmark — cutting and defined.", priceAdd: 360, label: "Lundgren M-Series" },
];

export function pickupSetById(id: string): PickupSet | undefined {
  return PICKUP_SETS.find((p) => p.id === id);
}

export const HARDWARE_COLORS: Option[] = [
  { id: "black", label: "Black", chip: "linear-gradient(135deg,#2a2c30,#0d0e10)" },
  { id: "chrome", label: "Chrome", chip: "linear-gradient(135deg,#cbced1,#6b7076 60%,#e6e8ea)", priceAdd: 0 },
  { id: "gold", label: "Gold", chip: "linear-gradient(135deg,#e0c060,#8a6a1e 60%,#c8a13a)", priceAdd: 120 },
  { id: "hybrid", label: "Hybrid / Custom", chip: "linear-gradient(135deg,#c8a13a,#2a2c30 55%,#cbced1)", priceAdd: 180 },
];

export const FRETBOARDS: Option[] = [
  { id: "richlite-black", label: "Richlite Black", desc: "Dense, stable, jet-black composite board.", chip: "#141618" },
  { id: "richlite-light", label: "Richlite Light", desc: "A lighter composite board with warm grain tone.", chip: "#8a7a5e" },
];

export const INLAY_STYLES: Option[] = [
  { id: "logo", label: "Model logo", desc: "The Aristides mark at the 12th." },
  { id: "dots-center", label: "Center dots", desc: "Traditional centred position markers." },
  { id: "dots-offset", label: "Offset dots", desc: "Modern treble-side markers." },
  { id: "rings", label: "Rings", desc: "Open ring inlays." },
  { id: "none", label: "None", desc: "A clean, unmarked board." },
];

export const INLAY_MATERIALS: Option[] = [
  { id: "mop", label: "Mother of Pearl", priceAdd: 0 },
  { id: "epoxy", label: "Coloured Epoxy", priceAdd: 60 },
];

export const SIDE_DOTS: Option[] = [
  { id: "luminlay-blue", label: "Luminlay Blue", chip: "#5ab6e6" },
  { id: "luminlay-green", label: "Luminlay Green", chip: "#7fe07f" },
];

export const CONTROLS: Option[] = [
  { id: "1v-3way", label: "1 Volume · 3-way toggle", desc: "The essentials — one volume, a three-way switch." },
  { id: "1v1t-3way", label: "1 Vol · 1 Tone · 3-way", desc: "Add a tone control for more shaping." },
  { id: "1v1t-5way", label: "1 Vol · 1 Tone · 5-way blade", desc: "Five positions for maximum pickup blends.", priceAdd: 40 },
  { id: "1v-killswitch", label: "1 Volume · Killswitch", desc: "Stripped-down with a killswitch for stutter effects.", priceAdd: 60 },
];

/* ------------------------------------------------------------------ */
/* Build state + engine                                                */
/* ------------------------------------------------------------------ */

export interface Build {
  platform?: string;
  strings?: number;
  orientation?: Orientation;
  finish?: string;
  customFinishNote?: string;
  fretboard?: string;
  inlayStyle?: string;
  inlayMaterial?: string;
  sideDots?: string;
  hardwareColor?: string;
  bridge?: string;
  pickupSet?: string;
  pickupLayout?: string;
  controls?: string;
  tuning?: string;
  gauge?: string;
  notes?: string;
}

/** String counts valid for the selected platform. */
export function stringCountsFor(build: Build): number[] {
  const p = build.platform ? platformById(build.platform) : undefined;
  return p ? p.stringCounts : [];
}

export function orientationsFor(build: Build): Orientation[] {
  const p = build.platform ? platformById(build.platform) : undefined;
  return p ? p.orientations : ["right"];
}

export function bridgesFor(build: Build): Bridge[] {
  const p = build.platform ? platformById(build.platform) : undefined;
  if (!p) return [];
  return BRIDGES.filter((b) => p.bridges.includes(b.id));
}

export function pickupLayoutsFor(build: Build): PickupLayout[] {
  const p = build.platform ? platformById(build.platform) : undefined;
  if (!p) return [];
  return PICKUP_LAYOUTS.filter((l) => p.pickupLayouts.includes(l.id));
}

export function scaleFor(build: Build): string | undefined {
  const p = build.platform ? platformById(build.platform) : undefined;
  if (!p || !build.strings) return undefined;
  return p.scaleByStrings[build.strings];
}

/** Human-facing model designation, e.g. "STX7S", "H/07", "060". */
export function designationFor(build: Build): string | undefined {
  const p = build.platform ? platformById(build.platform) : undefined;
  if (!p || !build.strings) return undefined;
  const s = build.strings;
  const suffix = p.multiscaleSuffix ? "S" : "";
  switch (p.id) {
    case "0":
    case "S":
      return `0${s}0${suffix}`; // 060, 070S ...
    case "H":
      return `H/0${s}`;
    case "T":
      return "T/0";
    case "STX":
    case "STXS":
      return `STX${s}${suffix}`;
    case "SB":
      return `S/B${s}${suffix}`;
    default:
      return `${p.code}${s}`;
  }
}

export function basePriceFor(build: Build): number {
  const p = build.platform ? platformById(build.platform) : undefined;
  if (!p || !build.strings) return 0;
  return p.basePriceByStrings[build.strings] ?? 0;
}
