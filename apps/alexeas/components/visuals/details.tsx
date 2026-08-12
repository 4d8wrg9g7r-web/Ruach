/**
 * Line-art detail illustrations. These stand in for macro photography with
 * deliberate, editorial drawings — neck-profile cross-sections for the
 * configurator, and craftsmanship vignettes for "The Smallest Details" and the
 * Craft page. All inherit `currentColor`.
 */

export function NeckProfileGlyph({
  variant,
  className = "",
}: {
  variant?: string;
  className?: string;
}) {
  // Back-of-neck cross-section under a flat fretboard.
  let d = "M 12 26 Q 60 78 108 26"; // rounded-c
  if (variant === "soft-v") d = "M 12 26 Q 44 64 60 72 Q 76 64 108 26";
  if (variant === "modern-c") d = "M 12 28 Q 60 58 108 28";
  return (
    <svg className={className} viewBox="0 0 120 84" fill="none" role="img" aria-label={`${variant} neck profile`}>
      <line x1="8" y1="26" x2="112" y2="26" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export type CraftKind =
  | "joint"
  | "binding"
  | "fretwork"
  | "voicing"
  | "finish"
  | "inlay"
  | "wood"
  | "neck"
  | "setup";

export function CraftDetail({
  kind,
  className = "",
  strokeWidth = 1.3,
}: {
  kind: CraftKind;
  className?: string;
  strokeWidth?: number;
}) {
  const common = {
    stroke: "currentColor",
    strokeWidth,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg className={className} viewBox="0 0 160 120" role="img" aria-label={`${kind} detail`}>
      <g {...common}>{FIGURES[kind]}</g>
    </svg>
  );
}

const FIGURES: Record<CraftKind, JSX.Element> = {
  // Dovetail neck/body joint
  joint: (
    <>
      <path d="M20 20 H74 V44 L86 52 L74 60 V84 H20" opacity="0.85" />
      <path d="M140 20 H86 V44 L74 52 L86 60 V84 H140" />
      <line x1="80" y1="12" x2="80" y2="108" opacity="0.3" strokeDasharray="3 4" />
    </>
  ),
  // Layered binding at a body corner
  binding: (
    <>
      <path d="M24 96 Q24 40 96 32 T140 26" />
      <path d="M28 96 Q28 44 96 36 T140 30" opacity="0.7" />
      <path d="M32 96 Q32 48 96 40 T140 34" opacity="0.45" />
      <line x1="120" y1="20" x2="132" y2="40" opacity="0.5" />
    </>
  ),
  // Fretwork — frets and a crown profile
  fretwork: (
    <>
      {[28, 52, 76, 100, 124].map((x) => (
        <line key={x} x1={x} y1="24" x2={x} y2="72" />
      ))}
      <line x1="16" y1="24" x2="140" y2="24" opacity="0.4" />
      <line x1="16" y1="72" x2="140" y2="72" opacity="0.4" />
      <path d="M40 96 Q52 84 64 96" opacity="0.8" />
      <circle cx="52" cy="48" r="2.4" fill="currentColor" stroke="none" opacity="0.7" />
    </>
  ),
  // Voicing — X-brace pattern on a top
  voicing: (
    <>
      <path d="M80 14 C120 26 138 62 132 104 C104 112 56 112 28 104 C22 62 40 26 80 14 Z" opacity="0.5" />
      <line x1="52" y1="40" x2="112" y2="96" />
      <line x1="108" y1="40" x2="48" y2="96" />
      <line x1="80" y1="58" x2="80" y2="100" opacity="0.7" />
      <circle cx="80" cy="52" r="9" opacity="0.6" />
    </>
  ),
  // Finish — layered sheen
  finish: (
    <>
      <path d="M24 40 Q80 20 136 40" />
      <path d="M24 56 Q80 36 136 56" opacity="0.7" />
      <path d="M24 72 Q80 52 136 72" opacity="0.45" />
      <path d="M92 84 q8 12 0 18 q-8 -6 0 -18Z" opacity="0.8" />
    </>
  ),
  // Inlay — vine / rosette motif
  inlay: (
    <>
      <circle cx="80" cy="60" r="34" opacity="0.55" />
      <circle cx="80" cy="60" r="26" opacity="0.35" />
      <path d="M80 26 q18 14 0 34 q-18 -20 0 -34Z" opacity="0.85" />
      <path d="M80 94 q18 -14 0 -34 q-18 20 0 34Z" opacity="0.85" />
      <circle cx="80" cy="60" r="3" fill="currentColor" stroke="none" />
    </>
  ),
  // Wood selection — stacked billets
  wood: (
    <>
      <rect x="26" y="34" width="108" height="12" rx="2" />
      <rect x="26" y="54" width="108" height="12" rx="2" opacity="0.75" />
      <rect x="26" y="74" width="108" height="12" rx="2" opacity="0.5" />
      <path d="M34 40 h92 M34 60 h92 M34 80 h92" opacity="0.3" />
    </>
  ),
  // Neck carving — spokeshave curl
  neck: (
    <>
      <path d="M22 84 Q60 24 138 30" />
      <path d="M22 92 Q64 40 138 44" opacity="0.6" />
      <path d="M110 22 q10 6 6 18 q-12 -2 -6 -18Z" opacity="0.8" />
    </>
  ),
  // Setup — action / string height
  setup: (
    <>
      <line x1="20" y1="40" x2="140" y2="52" />
      <line x1="20" y1="78" x2="140" y2="78" opacity="0.5" />
      <line x1="40" y1="46" x2="40" y2="78" opacity="0.7" />
      <line x1="120" y1="50" x2="120" y2="78" opacity="0.7" />
      <path d="M124 78 l4 -6 l4 6" opacity="0.8" />
    </>
  ),
};
