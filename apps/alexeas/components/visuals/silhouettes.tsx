import type { SilhouetteKey } from "@/lib/data/models";

/**
 * Instrument geometry, shared by the line-art silhouette (editorial "drawing")
 * and the layered configurator preview (filled wood + hardware). Body outlines
 * are generated from a handful of proportions per shape and mirrored for
 * symmetry, so every instrument is drawn, never photographed.
 */

interface BodyParams {
  shoulderY: number;
  upperW: number;
  upperY: number;
  waistW: number;
  waistY: number;
  lowerW: number;
  lowerY: number;
  bottomY: number;
  soundY: number;
  soundR: number;
}

export const SHAPES: Record<Exclude<SilhouetteKey, "mandolin">, BodyParams> = {
  o: {
    shoulderY: 74, upperW: 50, upperY: 114, waistW: 38, waistY: 172,
    lowerW: 60, lowerY: 226, bottomY: 282, soundY: 150, soundR: 15,
  },
  "grand-concert": {
    shoulderY: 68, upperW: 56, upperY: 112, waistW: 40, waistY: 174,
    lowerW: 68, lowerY: 230, bottomY: 290, soundY: 150, soundR: 16,
  },
  om: {
    shoulderY: 66, upperW: 58, upperY: 110, waistW: 41, waistY: 174,
    lowerW: 70, lowerY: 232, bottomY: 292, soundY: 150, soundR: 16.5,
  },
  dreadnought: {
    shoulderY: 62, upperW: 66, upperY: 108, waistW: 52, waistY: 172,
    lowerW: 75, lowerY: 234, bottomY: 298, soundY: 150, soundR: 17,
  },
};

export function buildBodyPath(p: BodyParams): string {
  const cx = 100;
  return [
    `M ${cx} ${p.shoulderY}`,
    `C ${cx + p.upperW * 0.55} ${p.shoulderY} ${cx + p.upperW} ${p.upperY - 24} ${cx + p.upperW} ${p.upperY}`,
    `C ${cx + p.upperW} ${p.upperY + 30} ${cx + p.waistW} ${p.waistY - 26} ${cx + p.waistW} ${p.waistY}`,
    `C ${cx + p.waistW} ${p.waistY + 26} ${cx + p.lowerW} ${p.lowerY - 34} ${cx + p.lowerW} ${p.lowerY}`,
    `C ${cx + p.lowerW} ${p.lowerY + 44} ${cx + p.lowerW * 0.5} ${p.bottomY} ${cx} ${p.bottomY}`,
    `C ${cx - p.lowerW * 0.5} ${p.bottomY} ${cx - p.lowerW} ${p.lowerY + 44} ${cx - p.lowerW} ${p.lowerY}`,
    `C ${cx - p.lowerW} ${p.lowerY - 34} ${cx - p.waistW} ${p.waistY + 26} ${cx - p.waistW} ${p.waistY}`,
    `C ${cx - p.waistW} ${p.waistY - 26} ${cx - p.upperW} ${p.upperY + 30} ${cx - p.upperW} ${p.upperY}`,
    `C ${cx - p.upperW} ${p.upperY - 24} ${cx - p.upperW * 0.55} ${p.shoulderY} ${cx} ${p.shoulderY}`,
    "Z",
  ].join(" ");
}

export const MANDOLIN = {
  path:
    "M 100 96 C 140 96 158 130 158 170 C 158 214 130 258 100 258 C 70 258 42 214 42 170 C 42 130 60 96 100 96 Z",
  soundY: 150,
  soundR: 15,
  shoulderY: 96,
};

export function isGuitar(key: SilhouetteKey): key is Exclude<SilhouetteKey, "mandolin"> {
  return key !== "mandolin";
}

/** Line-art silhouette: neck, body, sound hole, bridge, and a few frets. */
export function InstrumentSilhouette({
  silhouette,
  className = "",
  stroke = "currentColor",
  strokeWidth = 1.3,
}: {
  silhouette: SilhouetteKey;
  className?: string;
  stroke?: string;
  strokeWidth?: number;
}) {
  const guitar = isGuitar(silhouette);
  const p = guitar ? SHAPES[silhouette] : null;
  const bodyPath = guitar ? buildBodyPath(p!) : MANDOLIN.path;
  const shoulderY = guitar ? p!.shoulderY : MANDOLIN.shoulderY;
  const soundY = guitar ? p!.soundY : MANDOLIN.soundY;
  const soundR = guitar ? p!.soundR : MANDOLIN.soundR;

  // Neck geometry (up from the body shoulder toward the headstock).
  const nutY = 24;
  const nutHalf = 9;
  const heelHalf = 12;

  return (
    <svg
      className={className}
      viewBox="0 0 200 320"
      fill="none"
      role="img"
      aria-label={`${silhouette} instrument silhouette`}
    >
      <g stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round">
        {/* Headstock */}
        <path d={`M ${100 - nutHalf - 2} ${nutY} L ${100 - nutHalf - 4} 8 L ${100 + nutHalf + 4} 8 L ${100 + nutHalf + 2} ${nutY} Z`} opacity="0.9" />
        {/* Neck / fretboard */}
        <path d={`M ${100 - nutHalf} ${nutY} L ${100 - heelHalf} ${shoulderY + 6} L ${100 + heelHalf} ${shoulderY + 6} L ${100 + nutHalf} ${nutY} Z`} />
        {/* Frets */}
        {Array.from({ length: 5 }).map((_, i) => {
          const t = (i + 1) / 6;
          const y = nutY + (shoulderY + 6 - nutY) * t;
          const half = nutHalf + (heelHalf - nutHalf) * t;
          return <line key={i} x1={100 - half} y1={y} x2={100 + half} y2={y} opacity="0.45" />;
        })}
        {/* Body */}
        <path d={bodyPath} />
        {/* Sound hole + rosette hint */}
        <circle cx="100" cy={soundY} r={soundR} />
        <circle cx="100" cy={soundY} r={soundR + 3.5} opacity="0.4" />
        {/* Bridge */}
        <rect x={100 - 18} y={soundY + soundR + 12} width="36" height="8" rx="2" opacity="0.85" />
      </g>
    </svg>
  );
}
