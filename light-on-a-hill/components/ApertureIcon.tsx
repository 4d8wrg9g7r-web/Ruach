"use client";

import { motion } from "framer-motion";

/**
 * ApertureIcon — abstract aperture blades, not a literal camera.
 *
 * Six blades are drawn as fixed sectors pointing along +x, each placed in its
 * own rotated group. Opening is transform-only (radial translate + a subtle
 * group twist), so it animates on the compositor and stays crisp at any size.
 *
 *   progress 0 → blades closed over the centre (a small iris)
 *   progress 1 → blades retracted, centre wide open
 */

const BLADES = 6;
const R0 = 6; // inner radius when closed
const R = 64; // outer radius (clipped to the disc)
const CENTER = 50;
const DEG30 = Math.PI / 6;

function bladePath(): string {
  const c = Math.cos(DEG30);
  const s = Math.sin(DEG30);
  const p = (r: number, sign: number) =>
    `${(CENTER + r * c).toFixed(2)},${(CENTER + sign * r * s).toFixed(2)}`;
  return `M ${p(R0, -1)} L ${p(R0, 1)} L ${p(R, 1)} L ${p(R, -1)} Z`;
}

const D = bladePath();

export function ApertureIcon({
  progress = 0,
  className,
  outline = false,
  duration = 0.6,
}: {
  progress?: number;
  className?: string;
  outline?: boolean;
  duration?: number;
}) {
  const translate = progress * 30; // radial retract distance
  const twist = progress * 42; // subtle mechanical rotation
  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      animate={{ rotate: twist }}
      transition={{ duration, ease }}
      style={{ overflow: "hidden" }}
    >
      <defs>
        <clipPath id="aperture-disc">
          <circle cx={CENTER} cy={CENTER} r={46} />
        </clipPath>
      </defs>
      <g clipPath="url(#aperture-disc)">
        {Array.from({ length: BLADES }).map((_, i) => (
          <g key={i} transform={`rotate(${(360 / BLADES) * i} ${CENTER} ${CENTER})`}>
            <motion.path
              d={D}
              fill={outline ? "none" : "currentColor"}
              stroke="currentColor"
              strokeWidth={outline ? 0.9 : 0.6}
              strokeOpacity={outline ? 0.5 : 0.14}
              fillOpacity={outline ? 0 : 0.92 - (i % 2) * 0.06}
              animate={{ x: translate }}
              transition={{ duration, ease }}
            />
          </g>
        ))}
      </g>
      {/* thin outer ring — the lens barrel */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={46}
        fill="none"
        stroke="currentColor"
        strokeOpacity={outline ? 0.5 : 0.22}
        strokeWidth={outline ? 0.9 : 1.1}
      />
    </motion.svg>
  );
}
