/**
 * Configurator engine — pure, framework-free logic shared by the builder UI, the
 * shareable-link route, and the review page. It owns:
 *   - the slot model (what can be chosen, in what order)
 *   - compatibility resolution (which choices are possible given the rest)
 *   - pricing and build-time estimation
 *   - reversible, DB-free encoding of a build into a short shareable code
 *
 * Keeping this pure means every surface computes the same answer, and a build
 * can be reconstructed entirely from its URL — no server state required.
 */

import { MODELS, getModel, type GuitarModel } from "@/lib/data/models";
import { WOODS, woodsByCategory, getWood, type Wood, type WoodCategory } from "@/lib/data/woods";
import {
  OPTIONS,
  optionsByCategory,
  getOption,
  type ConfigOption,
  type OptionCategory,
} from "@/lib/data/options";

export type SlotId =
  | "model"
  | "top"
  | "body"
  | "neckWood"
  | "fretboard"
  | "neckProfile"
  | "rosette"
  | "fretInlay"
  | "bodyBinding"
  | "neckBinding"
  | "armBevel";

export type Configuration = Record<SlotId, string>;

type SlotDef =
  | { id: SlotId; kind: "model"; step: number; label: string; help: string }
  | {
      id: SlotId;
      kind: "wood";
      cat: WoodCategory;
      step: number;
      label: string;
      help: string;
    }
  | {
      id: SlotId;
      kind: "option";
      cat: OptionCategory;
      step: number;
      label: string;
      help: string;
    };

/** Step ordering matches the five-step guided flow (Instrument · Voice · Feel · Details · Review). */
export const SLOTS: SlotDef[] = [
  { id: "model", kind: "model", step: 1, label: "Model", help: "Every build begins with a body." },
  { id: "top", kind: "wood", cat: "top", step: 2, label: "Top Wood", help: "The soundboard — the single biggest influence on voice." },
  { id: "body", kind: "wood", cat: "body", step: 2, label: "Back & Sides", help: "The body wood shapes overtone and color beneath the top." },
  { id: "neckProfile", kind: "option", cat: "neck-profile", step: 3, label: "Neck Profile", help: "How the neck feels in your hand." },
  { id: "neckWood", kind: "wood", cat: "neck", step: 3, label: "Neck Wood", help: "Stability, weight, and a little of the voice." },
  { id: "fretboard", kind: "wood", cat: "fretboard", step: 3, label: "Fretboard", help: "The surface under your fingers." },
  { id: "rosette", kind: "option", cat: "rosette", step: 4, label: "Sound-hole Rosette", help: "The ring around the sound hole." },
  { id: "fretInlay", kind: "option", cat: "fretboard-inlay", step: 4, label: "Fretboard Inlay", help: "Position markers along the neck." },
  { id: "bodyBinding", kind: "option", cat: "body-binding", step: 4, label: "Body Binding", help: "The frame around the body's edge." },
  { id: "neckBinding", kind: "option", cat: "neck-binding", step: 4, label: "Neck Binding", help: "An optional frame along the fretboard edge." },
  { id: "armBevel", kind: "option", cat: "arm-bevel", step: 4, label: "Arm Bevel", help: "A carved contour where your forearm rests." },
];

export const STEP_TITLES = ["Instrument", "Voice", "Feel", "Details", "Review"] as const;

// ── Candidates ───────────────────────────────────────────────────────────────

function slotCandidateSlugs(slot: SlotDef): string[] {
  if (slot.kind === "model") return [...MODELS].sort((a, b) => a.order - b.order).map((m) => m.slug);
  if (slot.kind === "wood") return woodsByCategory(slot.cat).map((w) => w.slug);
  return optionsByCategory(slot.cat).map((o) => o.slug);
}

function optionCompatibleWithModel(slug: string, modelSlug: string): boolean {
  const opt = getOption(slug);
  if (!opt) return true;
  if (!opt.compatibleModels) return true;
  return opt.compatibleModels.includes(modelSlug);
}

/** A slot applies to a model only if it has at least one model-compatible choice. */
export function slotApplies(slot: SlotDef, modelSlug: string): boolean {
  if (slot.kind !== "option") return true;
  return optionsByCategory(slot.cat).some((o) => optionCompatibleWithModel(o.slug, modelSlug));
}

export function applicableSlots(modelSlug: string): SlotDef[] {
  return SLOTS.filter((s) => slotApplies(s, modelSlug));
}

// ── Compatibility ────────────────────────────────────────────────────────────

/** Two slugs conflict if either one lists the other as incompatible. */
function conflicts(a: string, b: string): boolean {
  const oa = getOption(a);
  const ob = getOption(b);
  return Boolean(oa?.incompatibleOptions?.includes(b)) || Boolean(ob?.incompatibleOptions?.includes(a));
}

export interface Availability {
  available: boolean;
  reason?: string;
}

/**
 * Whether `slug` can be chosen given the rest of `config` (ignoring whatever is
 * currently in `slotId`). Returns a human reason when it can't, for the UI.
 */
export function availabilityOf(slug: string, slotId: SlotId, config: Configuration): Availability {
  const model = config.model;

  if (!optionCompatibleWithModel(slug, model)) {
    return { available: false, reason: `Not offered on the ${getModel(model)?.name ?? "selected"} model.` };
  }

  const selectedElsewhere = (Object.keys(config) as SlotId[])
    .filter((k) => k !== slotId)
    .map((k) => config[k])
    .filter(Boolean);

  // Direct conflicts with another current selection.
  for (const other of selectedElsewhere) {
    if (conflicts(slug, other)) {
      const otherName = getOption(other)?.name ?? other;
      return { available: false, reason: `Can't be combined with ${otherName}.` };
    }
  }

  // Unmet requirements (e.g. abalone vine needs an ebony board).
  const opt = getOption(slug);
  if (opt?.requires?.length) {
    for (const req of opt.requires) {
      const has = selectedElsewhere.includes(req) || config[slotId] === req;
      if (!has) {
        const reqName = getWood(req)?.name ?? getOption(req)?.name ?? req;
        return { available: false, reason: `Requires ${reqName}.` };
      }
    }
  }

  return { available: true };
}

export interface Choice {
  slug: string;
  name: string;
  priceModifier: number;
  availability: Availability;
  recommended?: boolean;
  wood?: Wood;
  option?: ConfigOption;
}

export function choicesForSlot(slotId: SlotId, config: Configuration): Choice[] {
  const slot = SLOTS.find((s) => s.id === slotId)!;
  const slugs = slotCandidateSlugs(slot);
  return slugs
    .map((slug) => {
      const wood = getWood(slug);
      const option = getOption(slug);
      // Skip options that don't apply to this model at all (keeps lists clean).
      if (option && !optionCompatibleWithModel(slug, config.model)) return null;
      return {
        slug,
        name: wood?.name ?? option?.name ?? slug,
        priceModifier: wood?.priceModifier ?? option?.priceModifier ?? 0,
        availability: availabilityOf(slug, slotId, config),
        recommended: wood?.recommended ?? option?.recommended,
        wood,
        option,
      } as Choice;
    })
    .filter((c): c is Choice => c !== null);
}

// ── Defaults & reconciliation ────────────────────────────────────────────────

export function defaultConfig(modelSlug: string): Configuration {
  const model = getModel(modelSlug) ?? MODELS[0];
  const pickRecommended = (slot: SlotDef): string => {
    const slugs = slotCandidateSlugs(slot);
    const applicable = slugs.filter((s) => {
      const opt = getOption(s);
      return !opt || optionCompatibleWithModel(s, model.slug);
    });
    const rec = applicable.find((s) => getWood(s)?.recommended || getOption(s)?.recommended);
    return rec ?? applicable[0];
  };

  const config = {} as Configuration;
  for (const slot of SLOTS) {
    if (slot.id === "model") config.model = model.slug;
    else config[slot.id] = pickRecommended(slot);
  }
  // Honor the model's recommended starting woods.
  config.top = model.recommends.top;
  config.body = model.recommends.body;
  config.fretboard = model.recommends.fretboard;
  return reconcile(config);
}

/**
 * After any change, fix up selections that became impossible: an unavailable
 * choice falls back to the first available option in its slot. Runs a couple of
 * passes so a fix that unblocks another slot settles.
 */
export function reconcile(config: Configuration): Configuration {
  const next = { ...config };
  for (let pass = 0; pass < 3; pass++) {
    let changed = false;
    for (const slot of SLOTS) {
      if (slot.id === "model") continue;
      const current = next[slot.id];
      const applies = slotApplies(slot, next.model);
      if (!applies) continue;
      const avail = availabilityOf(current, slot.id, next);
      const stillValid =
        current && (getWood(current) || optionCompatibleWithModel(current, next.model)) && avail.available;
      if (!stillValid) {
        const choices = choicesForSlot(slot.id, next);
        const fallback =
          choices.find((c) => c.availability.available && c.recommended) ??
          choices.find((c) => c.availability.available);
        if (fallback && fallback.slug !== current) {
          next[slot.id] = fallback.slug;
          changed = true;
        }
      }
    }
    if (!changed) break;
  }
  return next;
}

// ── Pricing & build time ─────────────────────────────────────────────────────

export interface PriceLine {
  slotId: SlotId;
  label: string;
  name: string;
  amount: number;
}

export function priceLines(config: Configuration): PriceLine[] {
  const lines: PriceLine[] = [];
  for (const slot of SLOTS) {
    if (slot.id === "model") continue;
    if (!slotApplies(slot, config.model)) continue;
    const slug = config[slot.id];
    const wood = getWood(slug);
    const option = getOption(slug);
    lines.push({
      slotId: slot.id,
      label: slot.label,
      name: wood?.name ?? option?.name ?? slug,
      amount: wood?.priceModifier ?? option?.priceModifier ?? 0,
    });
  }
  return lines;
}

export function totalPrice(config: Configuration): number {
  const base = getModel(config.model)?.basePrice ?? 0;
  return base + priceLines(config).reduce((sum, l) => sum + l.amount, 0);
}

export function buildRange(config: Configuration): [number, number] {
  const model = getModel(config.model);
  const [lo, hi] = model?.buildMonths ?? [6, 9];
  let extra = 0;
  for (const slot of SLOTS) {
    if (slot.kind !== "option") continue;
    const opt = getOption(config[slot.id]);
    if (opt?.leadTimeMonths) extra = Math.max(extra, opt.leadTimeMonths);
  }
  return [lo + extra, hi + extra];
}

export function formatUSD(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

// ── Summary ──────────────────────────────────────────────────────────────────

export interface SummaryRow {
  label: string;
  value: string;
}

export function summaryRows(config: Configuration): SummaryRow[] {
  const rows: SummaryRow[] = [];
  const model = getModel(config.model);
  if (model) rows.push({ label: "Model", value: model.name });
  for (const slot of SLOTS) {
    if (slot.id === "model") continue;
    if (!slotApplies(slot, config.model)) continue;
    const slug = config[slot.id];
    const name = getWood(slug)?.name ?? getOption(slug)?.name ?? slug;
    rows.push({ label: slot.label, value: name });
  }
  return rows;
}

// ── Encoding (DB-free shareable codes) ───────────────────────────────────────

const B36 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function toBase36(n: bigint): string {
  if (n === 0n) return "0";
  let out = "";
  let x = n;
  while (x > 0n) {
    out = B36[Number(x % 36n)] + out;
    x /= 36n;
  }
  return out;
}

function fromBase36(s: string): bigint {
  let x = 0n;
  for (const ch of s.toUpperCase()) {
    const d = B36.indexOf(ch);
    if (d < 0) continue;
    x = x * 36n + BigInt(d);
  }
  return x;
}

/**
 * Pack a configuration into a mixed-radix integer (each slot contributes its
 * index within that slot's candidate list), render it base36, and prefix a
 * cosmetic model token: e.g. `OM14-3A7Q`. Fully reversible; the token is
 * ignored on decode.
 */
export function encodeConfig(config: Configuration): string {
  let n = 0n;
  for (const slot of SLOTS) {
    const slugs = slotCandidateSlugs(slot);
    const idx = Math.max(0, slugs.indexOf(config[slot.id]));
    n = n * BigInt(slugs.length) + BigInt(idx);
  }
  const model = getModel(config.model);
  const token = (model?.shortName ?? "BUILD").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 6);
  return `${token}-${toBase36(n)}`;
}

export function decodeConfig(code: string): Configuration | null {
  try {
    const raw = code.includes("-") ? code.split("-").pop()! : code;
    let n = fromBase36(raw);
    // Unpack in reverse slot order (last slot is the least-significant digit).
    const result: Partial<Configuration> = {};
    for (let i = SLOTS.length - 1; i >= 0; i--) {
      const slot = SLOTS[i];
      const slugs = slotCandidateSlugs(slot);
      const radix = BigInt(slugs.length);
      const idx = Number(n % radix);
      n /= radix;
      result[slot.id] = slugs[idx] ?? slugs[0];
    }
    if (!result.model || !getModel(result.model)) return null;
    return reconcile(result as Configuration);
  } catch {
    return null;
  }
}
