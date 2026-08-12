import { getModel } from "@/lib/data/models";
import { getWood } from "@/lib/data/woods";
import { getOption } from "@/lib/data/options";
import type { Configuration } from "@/lib/config/engine";
import { SHAPES, MANDOLIN, buildBodyPath, isGuitar } from "./silhouettes";

/**
 * The layered instrument preview. Given a Configuration it composes, back to
 * front: a soft shadow, the neck and fretboard, the wood soundboard (procedural
 * grain), the body binding, the rosette, the sound hole, the bridge, any fret
 * inlays, and an optional arm bevel. Each choice maps to one layer — the exact
 * "layered visual engine" the brief calls for, and the seam along which a future
 * 3D or photographic renderer could slot in without changing callers.
 */
export function InstrumentPreview({
  config,
  className = "",
  uid = "preview",
}: {
  config: Configuration;
  className?: string;
  uid?: string;
}) {
  const model = getModel(config.model);
  if (!model) return null;
  const p = isGuitar(model.silhouette) ? SHAPES[model.silhouette] : null;
  const guitar = p !== null;
  const bodyPath = guitar ? buildBodyPath(p!) : MANDOLIN.path;
  const shoulderY = guitar ? p!.shoulderY : MANDOLIN.shoulderY;
  const soundY = guitar ? p!.soundY : MANDOLIN.soundY;
  const soundR = guitar ? p!.soundR : MANDOLIN.soundR;

  const top = getWood(config.top);
  const body = getWood(config.body);
  const fret = getWood(config.fretboard);
  const rosette = getOption(config.rosette);
  const binding = getOption(config.bodyBinding);
  const neckBinding = getOption(config.neckBinding);
  const fretInlay = getOption(config.fretInlay);
  const armBevel = getOption(config.armBevel);

  const nutY = 24;
  const nutHalf = 9;
  const heelHalf = 12;
  const boardTopY = nutY;
  const boardBotY = shoulderY + 8;

  // Fret inlay positions (as a fraction from nut to body).
  const inlayFrets = [0.28, 0.44, 0.6, 0.74];
  const inlayColor = fretInlay?.color ?? "#F2EADF";

  return (
    <svg
      className={className}
      viewBox="0 0 200 320"
      role="img"
      aria-label={`${model.name} in ${top?.name} and ${body?.name}`}
    >
      <defs>
        <filter id={`${uid}-warp`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045 0.009" numOctaves="3" seed="6" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={9} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <pattern id={`${uid}-grain`} width={Math.max(4, 9 / (top?.grainScale ?? 1))} height="320" patternUnits="userSpaceOnUse">
          <rect width="12" height="320" fill={top?.base ?? "#E8D6B0"} />
          <rect width="1.4" height="320" fill={top?.grain ?? "#CBB183"} opacity="0.4" />
        </pattern>
        <radialGradient id={`${uid}-sheen`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.16" />
        </radialGradient>
        <clipPath id={`${uid}-body`}>
          <path d={bodyPath} />
        </clipPath>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="100" cy="306" rx="66" ry="10" fill="#241C17" opacity="0.14" />

      {/* Neck + fretboard */}
      <g>
        <path
          d={`M ${100 - nutHalf} ${boardTopY} L ${100 - heelHalf} ${boardBotY} L ${100 + heelHalf} ${boardBotY} L ${100 + nutHalf} ${boardTopY} Z`}
          fill={fret?.base ?? "#1E1A17"}
        />
        {/* Headstock */}
        <path
          d={`M ${100 - nutHalf - 2} ${nutY} L ${100 - nutHalf - 4} 7 L ${100 + nutHalf + 4} 7 L ${100 + nutHalf + 2} ${nutY} Z`}
          fill={body?.grain ?? "#3A2A21"}
        />
        {/* Neck binding */}
        {neckBinding?.color && (
          <path
            d={`M ${100 - nutHalf} ${boardTopY} L ${100 - heelHalf} ${boardBotY} M ${100 + nutHalf} ${boardTopY} L ${100 + heelHalf} ${boardBotY}`}
            stroke={neckBinding.color}
            strokeWidth="1.6"
            fill="none"
          />
        )}
        {/* Frets */}
        {Array.from({ length: 7 }).map((_, i) => {
          const t = (i + 1) / 8;
          const y = boardTopY + (boardBotY - boardTopY) * t;
          const half = nutHalf + (heelHalf - nutHalf) * t;
          return <line key={i} x1={100 - half} y1={y} x2={100 + half} y2={y} stroke="#C9B79A" strokeWidth="0.6" opacity="0.7" />;
        })}
        {/* Fret inlays */}
        {fretInlay?.visualKey !== "none" &&
          inlayFrets.map((t, i) => {
            const y = boardTopY + (boardBotY - boardTopY) * t;
            if (fretInlay?.visualKey === "diamonds") {
              return <rect key={i} x={98} y={y - 2} width="4" height="4" transform={`rotate(45 100 ${y})`} fill={inlayColor} opacity="0.9" />;
            }
            if (fretInlay?.visualKey === "vine") {
              return <circle key={i} cx={100} cy={y} r="1.8" fill={inlayColor} opacity="0.95" />;
            }
            return <circle key={i} cx={100} cy={y} r="1.6" fill={inlayColor} opacity="0.9" />;
          })}
      </g>

      {/* Soundboard: side-wood underlay, then top wood grain */}
      <path d={bodyPath} fill={body?.base ?? "#7A4A32"} />
      <g clipPath={`url(#${uid}-body)`}>
        <rect x="0" y="0" width="200" height="320" fill={`url(#${uid}-grain)`} filter={`url(#${uid}-warp)`} />
        <rect x="0" y="0" width="200" height="320" fill={`url(#${uid}-sheen)`} />
        {/* Inner side-wood shadow to hint depth */}
        <path d={bodyPath} fill="none" stroke={body?.grain ?? "#3A2A21"} strokeWidth="7" opacity="0.28" />
      </g>

      {/* Body binding */}
      {binding?.color && <path d={bodyPath} fill="none" stroke={binding.color} strokeWidth="2.6" />}

      {/* Arm bevel (guitars): a soft sliver on the upper treble bout */}
      {guitar && armBevel && armBevel.visualKey === "bevel" && (
        <path
          d={`M ${100 + p!.upperW - 6} ${p!.upperY - 6} C ${100 + p!.upperW + 2} ${p!.upperY + 20} ${100 + p!.waistW + 6} ${p!.waistY - 20} ${100 + p!.waistW + 2} ${p!.waistY} L ${100 + p!.waistW - 8} ${p!.waistY - 6} C ${100 + p!.upperW - 12} ${p!.upperY + 16} ${100 + p!.upperW - 12} ${p!.upperY} ${100 + p!.upperW - 6} ${p!.upperY - 6} Z`}
          fill={armBevel.color}
          opacity="0.85"
          clipPath={`url(#${uid}-body)`}
        />
      )}

      {/* Rosette */}
      <RosetteRings uid={uid} cx={100} cy={soundY} r={soundR} rosette={rosette?.visualKey} color={rosette?.color ?? "#8A6245"} />

      {/* Sound hole */}
      <circle cx="100" cy={soundY} r={soundR} fill="#1A130E" />
      <circle cx="100" cy={soundY} r={soundR} fill="none" stroke="#000" strokeOpacity="0.5" strokeWidth="1" />

      {/* Bridge + pins */}
      <g>
        <rect x={100 - 19} y={soundY + soundR + 14} width="38" height="9" rx="2.4" fill={fret?.base ?? "#1E1A17"} />
        {Array.from({ length: 6 }).map((_, i) => (
          <circle key={i} cx={100 - 13 + i * 5.2} cy={soundY + soundR + 18.5} r="1" fill="#EDE6D6" opacity="0.85" />
        ))}
      </g>
    </svg>
  );
}

function RosetteRings({
  uid,
  cx,
  cy,
  r,
  rosette,
  color,
}: {
  uid: string;
  cx: number;
  cy: number;
  r: number;
  rosette?: string;
  color: string;
}) {
  if (rosette === "hairline") {
    return <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke={color} strokeWidth="0.8" opacity="0.8" />;
  }
  if (rosette === "shell") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke={color} strokeWidth="2.4" opacity="0.85" />
        <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#DDE7E4" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.7" />
      </g>
    );
  }
  if (rosette === "mosaic") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke={color} strokeWidth="3.6" opacity="0.8" />
        <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke="#3A2A21" strokeWidth="3.6" strokeDasharray="2.4 2.4" opacity="0.55" />
      </g>
    );
  }
  // ring (default)
  return (
    <g fill="none" stroke={color} opacity="0.85">
      <circle cx={cx} cy={cy} r={r + 3} strokeWidth="1.4" />
      <circle cx={cx} cy={cy} r={r + 5.5} strokeWidth="0.9" opacity="0.6" />
    </g>
  );
}
