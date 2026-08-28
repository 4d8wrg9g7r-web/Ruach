import type { Wood } from "@/lib/data/woods";

/**
 * Procedural wood grain, drawn entirely in SVG so it carries zero image weight
 * and tints itself from each wood's `base`/`grain` pair. Horizontal grain lines
 * (a pattern) are warped by a turbulence displacement map into believable
 * figure, then a soft diagonal sheen is laid over the top.
 *
 * Filter/pattern ids are derived from `uid` (defaults to the wood slug). Two
 * swatches of the same wood share ids and therefore render identically — which
 * is exactly what we want, and avoids any server/client hydration drift.
 */
export function WoodSwatch({
  wood,
  className = "",
  rounded = 4,
  seed = 4,
  uid,
  vertical = false,
}: {
  wood: Wood;
  className?: string;
  rounded?: number;
  seed?: number;
  uid?: string;
  vertical?: boolean;
}) {
  const id = `w-${uid ?? wood.slug}`;
  const gap = Math.max(4, 9 / wood.grainScale);
  const scale = 10 * wood.grainScale;

  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${wood.name} wood`}
    >
      <defs>
        <filter id={`${id}-warp`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.009 0.045"
            numOctaves="3"
            seed={seed}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <pattern
          id={`${id}-grain`}
          width={vertical ? gap : 120}
          height={vertical ? 120 : gap}
          patternUnits="userSpaceOnUse"
        >
          <rect width="120" height="120" fill={wood.base} />
          {vertical ? (
            <rect width="1.5" height="120" fill={wood.grain} opacity="0.45" />
          ) : (
            <rect width="120" height="1.5" fill={wood.grain} opacity="0.45" />
          )}
        </pattern>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.14" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <clipPath id={`${id}-clip`}>
          <rect x="0" y="0" width="120" height="120" rx={rounded} />
        </clipPath>
        <rect
          x="-10"
          y="-10"
          width="140"
          height="140"
          fill={`url(#${id}-grain)`}
          filter={`url(#${id}-warp)`}
        />
        <rect width="120" height="120" fill={`url(#${id}-sheen)`} />
      </g>
    </svg>
  );
}
