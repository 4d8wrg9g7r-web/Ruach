"use client";

import { useId } from "react";
import type { Finish } from "@/lib/data/finishes";
import type { Construction } from "@/lib/data/models";

/**
 * Fully self-contained SVG instrument.
 *
 * With no real photography in the prototype, the guitar is drawn as crisp,
 * scalable SVG and driven entirely by data: the body fill is generated from the
 * selected finish (colour, sparkle, metal sweep, chameleon shift), string count
 * sets the number of strings, and hardware colour tints every metal part. Real
 * renders/photography swap in behind the same props later.
 */

type BodyShape = "standard" | "offset" | "bass";

function shapeFor(construction?: Construction): { body: BodyShape; headless: boolean } {
  switch (construction) {
    case "offset":
      return { body: "offset", headless: false };
    case "bass":
      return { body: "bass", headless: false };
    case "headless":
      return { body: "standard", headless: true };
    default:
      return { body: "standard", headless: false };
  }
}

function rgb([r, g, b]: [number, number, number], a = 1): string {
  return `rgba(${r},${g},${b},${a})`;
}
function scale([r, g, b]: [number, number, number], f: number): [number, number, number] {
  return [Math.min(255, Math.round(r * f)), Math.min(255, Math.round(g * f)), Math.min(255, Math.round(b * f))];
}

const HARDWARE: Record<string, string> = {
  black: "#17191c",
  chrome: "#c4c8cc",
  gold: "#c8a13a",
  hybrid: "#9aa0a6",
};

// Body outlines authored in a 460 × 1180 portrait space (neck up).
const BODIES: Record<BodyShape, string> = {
  standard:
    "M230 590 C150 585 120 600 92 660 C70 706 74 770 96 820 C118 872 120 930 150 968 C182 1008 250 1012 300 986 C346 962 360 908 372 856 C384 806 392 748 372 690 C352 636 316 596 230 590 Z",
  offset:
    "M236 585 C168 580 128 596 96 648 C66 698 88 760 92 812 C96 872 78 930 128 966 C176 1000 244 1004 296 978 C342 956 342 900 366 852 C392 800 402 730 380 676 C356 620 318 590 236 585 Z",
  bass:
    "M232 600 C150 596 112 616 86 682 C62 744 76 812 100 866 C124 922 122 986 158 1026 C196 1068 264 1070 316 1040 C364 1012 372 950 384 892 C396 834 404 762 378 700 C352 642 314 606 232 600 Z",
};

export interface GuitarVisualProps {
  construction?: Construction;
  strings?: number;
  orientation?: "right" | "left";
  hardwareColor?: string;
  finish?: Finish;
  className?: string;
  /** Larger detail for hero/visualiser; simpler for cards. */
  detail?: "full" | "card";
  /** 0..1 chameleon shift progress (driven by cursor angle elsewhere). */
  shift?: number;
}

export function GuitarVisual({
  construction,
  strings = 6,
  orientation = "right",
  hardwareColor = "black",
  finish,
  className,
  detail = "full",
  shift = 0,
}: GuitarVisualProps) {
  const uid = useId().replace(/:/g, "");
  const { body, headless } = shapeFor(construction);
  const tint = finish?.tint ?? [138, 143, 152];
  const beh = finish?.behaviour ?? "flat";
  const hw = HARDWARE[hardwareColor] ?? HARDWARE.black;

  const hi = rgb(scale(tint, 1.45), 1);
  const base = rgb(tint, 1);
  const shadow = rgb(scale(tint, 0.42), 1);

  // chameleon shifts base toward a secondary hue as `shift` grows
  const shiftTint = finish?.shiftSwatch ? scale(tint, 0.7).map((v, i) => Math.min(255, v + [70, -20, 60][i])) as [number, number, number] : tint;
  const chBase = beh === "chameleon" ? rgb(mix(tint, shiftTint, shift)) : base;

  const bodyPath = BODIES[body];
  const neckW = body === "bass" ? 46 : 40;
  const nutY = headless ? 150 : 210;
  const strCount = strings;

  // string x positions across the neck
  const strXs = Array.from({ length: strCount }, (_, i) => {
    const spread = neckW - 8;
    const step = spread / (strCount - 1 || 1);
    return 230 - spread / 2 + i * step;
  });

  return (
    <svg
      viewBox="0 0 460 1180"
      className={className}
      role="img"
      aria-label={`Aristides ${construction ?? "guitar"} in ${finish?.name ?? "raw"} finish`}
      style={{ transform: orientation === "left" ? "scaleX(-1)" : undefined }}
    >
      <defs>
        <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={hi} />
          <stop offset="42%" stopColor={chBase} />
          <stop offset="100%" stopColor={shadow} />
        </linearGradient>
        <linearGradient id={`neck-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0e0f11" />
          <stop offset="50%" stopColor="#1a1c1f" />
          <stop offset="100%" stopColor="#0b0c0e" />
        </linearGradient>
        <linearGradient id={`metal-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={rgb(scale(hexToRgb(hw), 1.4))} />
          <stop offset="55%" stopColor={hw} />
          <stop offset="100%" stopColor={rgb(scale(hexToRgb(hw), 0.6))} />
        </linearGradient>
        <radialGradient id={`gloss-${uid}`} cx="0.32" cy="0.2" r="0.6">
          <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        {beh === "metal" && (
          <linearGradient id={`sweep-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="48%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="52%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        )}
      </defs>

      {/* soft ground shadow */}
      <ellipse cx="240" cy="1120" rx="150" ry="18" fill="rgba(0,0,0,0.55)" />

      {/* ---- Neck + fretboard ------------------------------------- */}
      <rect x={230 - neckW / 2} y={nutY} width={neckW} height={640} rx="6" fill={`url(#neck-${uid})`} />
      {/* fretboard */}
      <rect x={230 - neckW / 2 + 3} y={nutY} width={neckW - 6} height={640} fill="#141618" />
      {/* frets */}
      {detail === "full" &&
        Array.from({ length: 18 }, (_, i) => {
          const y = nutY + 18 + i * 34;
          return <rect key={i} x={230 - neckW / 2 + 3} y={y} width={neckW - 6} height="1.4" fill="#3a3d42" />;
        })}
      {/* side/position dots */}
      {detail === "full" &&
        [3, 5, 7, 9].map((f) => (
          <circle key={f} cx={230} cy={nutY + 18 + f * 34} r="2.6" fill={finish?.tint ? "#5ab6e6" : "#5ab6e6"} opacity="0.85" />
        ))}

      {/* ---- Headstock (or headless block) ------------------------- */}
      {headless ? (
        <rect x={230 - neckW / 2 - 3} y={nutY - 34} width={neckW + 6} height={30} rx="4" fill={`url(#metal-${uid})`} />
      ) : (
        <path
          d={`M${230 - neckW / 2 - 6} ${nutY} L${230 - 46} 70 Q230 44 ${230 + 46} 70 L${230 + neckW / 2 + 6} ${nutY} Z`}
          fill={`url(#neck-${uid})`}
          stroke="#0a0b0d"
          strokeWidth="1"
        />
      )}

      {/* ---- Body ------------------------------------------------- */}
      <g>
        <path d={bodyPath} fill={`url(#body-${uid})`} stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" />
        {/* gloss / satin sheen */}
        {(beh === "gloss" || beh === "chameleon" || beh === "sparkle") && (
          <path d={bodyPath} fill={`url(#gloss-${uid})`} />
        )}
        {/* metal reflective sweep */}
        {beh === "metal" && (
          <path d={bodyPath} fill={`url(#sweep-${uid})`}>
            <animateTransform
              attributeName="transform"
              type="translate"
              from="-120 0"
              to="140 0"
              dur="4.5s"
              repeatCount="indefinite"
            />
          </path>
        )}
        {/* marble veins */}
        {beh === "marble" && (
          <g opacity="0.4" clipPath={`url(#clip-${uid})`}>
            <path d="M120 660 C200 720 260 800 340 900" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" />
            <path d="M150 720 C230 760 250 880 300 960" stroke="rgba(0,0,0,0.45)" strokeWidth="3" fill="none" />
          </g>
        )}
        {/* sparkle flecks */}
        {beh === "sparkle" &&
          SPARKLES.map((s, i) => (
            <circle key={i} cx={s[0]} cy={s[1]} r="1.1" fill="rgba(255,255,255,0.85)">
              <animate attributeName="opacity" values="0.3;1;0.3" dur={`${2 + (i % 4)}s`} repeatCount="indefinite" />
            </circle>
          ))}
        <clipPath id={`clip-${uid}`}>
          <path d={bodyPath} />
        </clipPath>
      </g>

      {/* ---- Strings (over neck + body) --------------------------- */}
      {detail === "full" &&
        strXs.map((x, i) => (
          <line
            key={i}
            x1={x}
            y1={nutY}
            x2={x}
            y2={body === "bass" ? 1010 : 950}
            stroke="rgba(220,224,228,0.55)"
            strokeWidth={0.6 + i * 0.12}
          />
        ))}

      {/* ---- Pickups --------------------------------------------- */}
      <rect x={200} y={760} width={60} height={22} rx="2" fill={`url(#metal-${uid})`} />
      <rect x={200} y={812} width={60} height={26} rx="2" fill={`url(#metal-${uid})`} />

      {/* ---- Bridge ---------------------------------------------- */}
      <rect x={206} y={body === "bass" ? 968 : 908} width={48} height={16} rx="2" fill={`url(#metal-${uid})`} />

      {/* ---- Controls ------------------------------------------- */}
      {detail === "full" && (
        <>
          <circle cx={300} cy={900} r="7" fill={`url(#metal-${uid})`} />
          <circle cx={322} cy={868} r="7" fill={`url(#metal-${uid})`} />
        </>
      )}
    </svg>
  );
}

const SPARKLES: [number, number][] = [
  [140, 700], [180, 760], [220, 820], [260, 880], [300, 820], [330, 760],
  [160, 900], [280, 700], [200, 940], [340, 880], [120, 800], [260, 960],
];

function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
