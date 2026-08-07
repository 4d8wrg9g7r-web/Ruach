"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";

/**
 * ApertureLens — the signature mechanism.
 *
 * A true iris: each blade is a curved leaf pivoting around a point on the
 * barrel ring, so opening swings the blade tips outward exactly like a lens
 * diaphragm. Depth comes from a per-blade axial gradient, a hairline edge
 * highlight, and a soft contact shadow — machined, not skeuomorphic.
 *
 * Everything animates through transforms only (60fps-safe), and the geometry
 * is shared between the small header control and the large menu instrument.
 *
 *   angle 0°  → blades meet at the centre (sealed)
 *   angle ~8° → resting f-stop (small pupil)
 *   angle 55° → fully open viewport
 */

const N = 8; // blade count
const PIVOT_R = 40; // pivot radius from centre
const EASE = [0.16, 1, 0.3, 1] as const;

// Leaf blade in local coords: pivot at (0,0), tip reaching the centre at (-40,0).
// The belly is kept slim so a ~78° swing fully clears the viewport.
const BLADE_PATH =
  "M 0 0 C -4 -13 -20 -24 -40 0 C -28 10 -9 8 0 0 Z";

export type LensImage = { src: string; alt: string; position?: string };

/**
 * Animate a number toward its target with the house easing, returning the live
 * value. Used for blade angles: CSS transforms on inner SVG nodes rotate about
 * the viewBox origin (not the blade pivot), so blades animate via the SVG
 * `transform` attribute instead — which needs a plain number per frame.
 */
function useAnimatedNumber(target: number, duration: number, reduce: boolean): number {
  const [value, setValue] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    if (reduce) {
      prev.current = target;
      setValue(target);
      return;
    }
    const controls = animate(prev.current, target, {
      duration,
      ease: EASE,
      onUpdate: (v) => setValue(v),
    });
    prev.current = target;
    return () => controls.stop();
  }, [target, duration, reduce]);
  return value;
}

export const ApertureLens = memo(function ApertureLens({
  angle,
  ringRotate = 0,
  image = null,
  parallax,
  arcs = false,
  progress = null,
  breathe = false,
  duration = 0.7,
  tone = "dark",
  className,
  onImageError,
}: {
  angle: number; // blade swing in degrees (0 = sealed)
  ringRotate?: number; // additional barrel rotation
  image?: LensImage | null;
  parallax?: { x: number; y: number };
  arcs?: boolean; // faint structural arcs outside the barrel
  progress?: { index: number; total: number } | null;
  breathe?: boolean; // near-imperceptible idle drift
  duration?: number;
  tone?: "dark" | "light"; // light = paper-toned blades for tiny sizes / blend contexts
  className?: string;
  onImageError?: () => void;
}) {
  const light = tone === "light";
  const uid = light ? "lens-l" : "lens-d";
  const reduce = useReducedMotion() ?? false;
  const bladeAngle = useAnimatedNumber(angle, duration, reduce);

  const ticks = useMemo(() => {
    const t: { x1: number; y1: number; x2: number; y2: number; major: boolean }[] = [];
    for (let i = 0; i < 36; i++) {
      const a = (i * 10 * Math.PI) / 180;
      const major = i % 9 === 0;
      const r1 = 47.6;
      const r2 = major ? 45.2 : 46.3;
      t.push({
        x1: 50 + r1 * Math.cos(a),
        y1: 50 + r1 * Math.sin(a),
        x2: 50 + r2 * Math.cos(a),
        y2: 50 + r2 * Math.sin(a),
        major,
      });
    }
    return t;
  }, []);

  // Progress arc: thin indicator around the barrel showing the active item.
  const arcLen = 2 * Math.PI * 49;
  const progressFrac = progress ? (progress.index + 1) / progress.total : 0;

  return (
    <div
      className={`relative ${className ?? ""}`}
      style={breathe && !reduce ? { animation: "lens-breathe 9s ease-in-out infinite alternate" } : undefined}
    >
      {/* Central image viewport — behind the blades */}
      <div
        className="absolute rounded-full overflow-hidden"
        style={{ inset: "16%", background: light && !image ? "rgba(17,17,17,0.25)" : "#0c0c0c" }}
      >
        {image && (
          <motion.img
            key={image.src}
            src={image.src}
            alt={image.alt}
            onError={onImageError}
            className="h-full w-full object-cover"
            style={{
              objectPosition: image.position ?? "50% 50%",
              x: parallax?.x ?? 0,
              y: parallax?.y ?? 0,
              scale: 1.08, // headroom for parallax drift
            }}
            initial={reduce ? false : { opacity: 0, scale: 1.14, filter: "blur(7px)" }}
            animate={{ opacity: 1, scale: 1.08, filter: "blur(0px)" }}
            transition={{ duration: 0.75, ease: EASE }}
          />
        )}
        {/* glass sheen over the pupil */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(120% 90% at 32% 24%, rgba(244,242,237,0.10), rgba(244,242,237,0.02) 38%, transparent 60%)",
          }}
        />
      </div>

      <motion.svg
        viewBox="-14 -14 128 128"
        className="relative block h-full w-full"
        aria-hidden="true"
        animate={{ rotate: ringRotate }}
        transition={{ duration, ease: EASE }}
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id={`${uid}-blade`} x1="-40" y1="0" x2="0" y2="0" gradientUnits="userSpaceOnUse">
            {light ? (
              <>
                <stop offset="0%" stopColor="#F4F2ED" />
                <stop offset="55%" stopColor="#DEDACE" />
                <stop offset="100%" stopColor="#C8C3B4" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#232120" />
                <stop offset="55%" stopColor="#1b1a19" />
                <stop offset="100%" stopColor="#141313" />
              </>
            )}
          </linearGradient>
          <filter id={`${uid}-shadow`} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0.7" stdDeviation="0.9" floodColor="#000000" floodOpacity={light ? 0.25 : 0.55} />
          </filter>
          <radialGradient id={`${uid}-barrel`} cx="38%" cy="28%" r="90%">
            {light ? (
              <>
                <stop offset="0%" stopColor="#F4F2ED" />
                <stop offset="100%" stopColor="#B9B4A5" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#2b2926" />
                <stop offset="60%" stopColor="#1d1c1a" />
                <stop offset="100%" stopColor="#121110" />
              </>
            )}
          </radialGradient>
        </defs>

        {/* faint structural arcs outside the barrel */}
        {arcs && (
          <g fill="none" stroke="#ECE9E2" strokeWidth="0.35">
            <circle cx="50" cy="50" r="56" strokeOpacity="0.10" strokeDasharray="1.4 5.5" />
            <path d="M 50 -9 A 59 59 0 0 1 109 50" strokeOpacity="0.16" />
            <path d="M 50 109 A 59 59 0 0 1 -9 50" strokeOpacity="0.16" />
          </g>
        )}

        {/* barrel: annulus carrying the blades */}
        <circle cx="50" cy="50" r="47.5" fill="none" stroke={`url(#${uid}-barrel)`} strokeWidth="7.5" strokeOpacity={light ? 0.9 : 1} />
        {/* machined edges of the barrel */}
        <circle cx="50" cy="50" r="51.1" fill="none" stroke="#F4F2ED" strokeOpacity={light ? 0.5 : 0.14} strokeWidth="0.45" />
        <circle cx="50" cy="50" r="43.9" fill="none" stroke="#000000" strokeOpacity={light ? 0.25 : 0.5} strokeWidth="0.5" />
        <circle cx="50" cy="50" r="44.6" fill="none" stroke="#F4F2ED" strokeOpacity="0.07" strokeWidth="0.4" />

        {/* index ticks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={light ? "#111111" : "#F4F2ED"}
            strokeOpacity={t.major ? 0.34 : 0.16}
            strokeWidth={t.major ? 0.55 : 0.4}
          />
        ))}

        {/* engraved inner ring */}
        <circle cx="50" cy="50" r="41.6" fill="none" stroke="#F4F2ED" strokeOpacity="0.09" strokeWidth="0.35" strokeDasharray="0.6 2.6" />

        {/* iris blades — clipped to the barrel interior */}
        <clipPath id={`${uid}-interior`}>
          <circle cx="50" cy="50" r="43.9" />
        </clipPath>
        <g clipPath={`url(#${uid}-interior)`}>
          {/* opaque outer annulus — the zone blades retract into; keeps the
              image visible only through the central pupil, like a real iris */}
          <circle
            cx="50"
            cy="50"
            r="35.5"
            fill="none"
            stroke={light ? "#DDD9CC" : "#131211"}
            strokeWidth="17"
          />
          {Array.from({ length: N }).map((_, i) => (
            <g
              key={i}
              transform={`rotate(${(360 / N) * i} 50 50) translate(${50 + PIVOT_R} 50) rotate(${bladeAngle})`}
            >
              <path
                d={BLADE_PATH}
                fill={`url(#${uid}-blade)`}
                fillOpacity={0.985 - (i % 3) * 0.025}
                stroke={light ? "#111111" : "#F4F2ED"}
                strokeOpacity={light ? 0.22 : 0.1}
                strokeWidth="0.45"
                filter={`url(#${uid}-shadow)`}
              />
            </g>
          ))}
        </g>

        {/* progress arc + index marker */}
        {progress && (
          <motion.circle
            cx="50"
            cy="50"
            r="49"
            fill="none"
            stroke="#BDA77C"
            strokeOpacity="0.55"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeDasharray={arcLen}
            transform="rotate(-90 50 50)"
            animate={{ strokeDashoffset: arcLen * (1 - progressFrac) }}
            transition={{ duration: 0.6, ease: EASE }}
          />
        )}
      </motion.svg>
    </div>
  );
});
