/**
 * Pricing, validation and build-code helpers.
 *
 * Kept separate from the option catalogue so the pure data in
 * `data/configurator.ts` stays declarative and this file holds the logic that
 * reads it.
 */

import { finishById } from "./data/finishes";
import {
  type Build,
  type StepId,
  basePriceFor,
  bridgeById,
  bridgesFor,
  CONTROLS,
  designationFor,
  FRETBOARDS,
  HARDWARE_COLORS,
  INLAY_MATERIALS,
  ORIENTATIONS,
  orientationsFor,
  pickupLayoutById,
  pickupLayoutsFor,
  pickupSetById,
  platformById,
  scaleFor,
  stringCountsFor,
} from "./data/configurator";

function addOf(list: { id: string; priceAdd?: number }[], id?: string): number {
  if (!id) return 0;
  return list.find((o) => o.id === id)?.priceAdd ?? 0;
}

/** Estimated price in EUR. Final price is always confirmed by Aristides. */
export function computePrice(build: Build): number {
  let total = basePriceFor(build);
  if (total === 0) return 0;

  total += build.orientation === "left" ? ORIENTATIONS.left.priceAdd ?? 0 : 0;
  total += build.finish ? finishById(build.finish)?.priceAdd ?? 0 : 0;
  total += build.customFinishNote && build.finish === "custom" ? 0 : 0; // custom add already on finish
  total += build.bridge ? bridgeById(build.bridge)?.priceAdd ?? 0 : 0;
  total += build.pickupSet ? pickupSetById(build.pickupSet)?.priceAdd ?? 0 : 0;
  total += addOf(HARDWARE_COLORS, build.hardwareColor);
  total += addOf(FRETBOARDS, build.fretboard);
  total += addOf(INLAY_MATERIALS, build.inlayMaterial);
  total += addOf(CONTROLS, build.controls);
  return total;
}

/** Whether a given step has enough input to be considered complete. */
export function isStepComplete(step: StepId, build: Build): boolean {
  switch (step) {
    case "platform":
      return Boolean(build.platform);
    case "strings":
      return Boolean(build.strings);
    case "format":
      return Boolean(build.orientation);
    case "finish":
      return Boolean(build.finish) && (build.finish !== "custom" || Boolean(build.customFinishNote?.trim()));
    case "fretboard":
      return Boolean(build.fretboard && build.inlayStyle && build.sideDots);
    case "hardware":
      return Boolean(build.hardwareColor);
    case "bridge":
      return Boolean(build.bridge);
    case "pickups":
      return Boolean(build.pickupSet && build.pickupLayout);
    case "controls":
      return Boolean(build.controls);
    case "details":
      return true; // details are optional
    case "review":
      return true;
    default:
      return false;
  }
}

/** Selections that are no longer valid after an upstream change are dropped. */
export function reconcile(build: Build): Build {
  const next: Build = { ...build };
  const platform = next.platform ? platformById(next.platform) : undefined;

  if (!platform) {
    return { platform: next.platform };
  }
  if (next.strings && !platform.stringCounts.includes(next.strings)) {
    next.strings = undefined;
  }
  if (next.orientation && !platform.orientations.includes(next.orientation)) {
    next.orientation = undefined;
  }
  if (next.bridge && !bridgesFor(next).some((b) => b.id === next.bridge)) {
    next.bridge = undefined;
  }
  if (next.pickupLayout && !pickupLayoutsFor(next).some((l) => l.id === next.pickupLayout)) {
    next.pickupLayout = undefined;
  }
  return next;
}

/** A short, deterministic, shareable build code, e.g. AR-STX7S-CPR-ET-BKP-BLK. */
export function buildCode(build: Build): string {
  const parts = ["AR"];
  const des = designationFor(build);
  if (des) parts.push(des.replace(/[/]/g, ""));
  if (build.finish) {
    const f = finishById(build.finish);
    if (f) parts.push(abbr(f.name));
  }
  if (build.bridge) {
    const b = bridgeById(build.bridge);
    if (b) parts.push(b.code);
  }
  if (build.pickupSet) {
    const p = pickupSetById(build.pickupSet);
    if (p) parts.push(abbr(p.brand));
  }
  if (build.hardwareColor) parts.push(build.hardwareColor.slice(0, 3).toUpperCase());
  return parts.join("-");
}

function abbr(name: string): string {
  return name
    .replace(/[^a-zA-Z /]/g, "")
    .split(/[\s/]+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
}

/** A short opaque handle for a saved-build URL, e.g. /build/AX7L2P. */
export function shortHandle(build: Build): string {
  const json = JSON.stringify(build);
  let h = 0;
  for (let i = 0; i < json.length; i++) {
    h = (h * 31 + json.charCodeAt(i)) >>> 0;
  }
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  let n = h;
  for (let i = 0; i < 6; i++) {
    out += alphabet[n % alphabet.length];
    n = Math.floor(n / alphabet.length) + 7;
  }
  return out;
}

export interface SummaryRow {
  label: string;
  value: string;
  sub?: string;
}

/** The canonical, human-readable summary used on the sticky panel, review page
 *  and the inquiry email. */
export function summarize(build: Build): SummaryRow[] {
  const rows: SummaryRow[] = [];
  const platform = build.platform ? platformById(build.platform) : undefined;

  if (platform) rows.push({ label: "Platform", value: platform.name });
  const des = designationFor(build);
  if (des) rows.push({ label: "Model", value: des, sub: scaleFor(build) });
  if (build.strings) rows.push({ label: "Strings", value: `${build.strings}-string` });
  if (build.orientation) rows.push({ label: "Orientation", value: ORIENTATIONS[build.orientation].label });
  if (build.finish) {
    const f = finishById(build.finish);
    if (f)
      rows.push({
        label: "Finish",
        value: f.name,
        sub: f.id === "custom" && build.customFinishNote ? build.customFinishNote : f.category,
      });
  }
  if (build.fretboard) {
    const fb = FRETBOARDS.find((o) => o.id === build.fretboard);
    if (fb) rows.push({ label: "Fretboard", value: fb.label });
  }
  if (build.inlayStyle) {
    rows.push({
      label: "Inlays",
      value:
        (build.inlayStyle === "none" ? "None" : build.inlayStyle.replace("dots-", "").replace("-", " ")) +
        (build.inlayMaterial ? ` · ${INLAY_MATERIALS.find((m) => m.id === build.inlayMaterial)?.label ?? ""}` : ""),
    });
  }
  if (build.sideDots) {
    rows.push({ label: "Side dots", value: build.sideDots.replace("luminlay-", "Luminlay ") });
  }
  if (build.hardwareColor) {
    rows.push({ label: "Hardware", value: HARDWARE_COLORS.find((h) => h.id === build.hardwareColor)?.label ?? "" });
  }
  if (build.bridge) {
    const b = bridgeById(build.bridge);
    if (b) rows.push({ label: "Bridge", value: b.label });
  }
  if (build.pickupSet) {
    const p = pickupSetById(build.pickupSet);
    const l = build.pickupLayout ? pickupLayoutById(build.pickupLayout) : undefined;
    if (p) rows.push({ label: "Pickups", value: p.label, sub: l?.code });
  }
  if (build.controls) {
    rows.push({ label: "Controls", value: CONTROLS.find((c) => c.id === build.controls)?.label ?? "" });
  }
  if (build.tuning) rows.push({ label: "Tuning", value: build.tuning });
  if (build.gauge) rows.push({ label: "String gauge", value: build.gauge });
  return rows;
}

export function formatEUR(n: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

// re-export so consumers import build helpers from one place
export { stringCountsFor, orientationsFor, bridgesFor, pickupLayoutsFor, scaleFor, designationFor };
