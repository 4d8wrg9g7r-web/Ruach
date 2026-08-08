import { clsx } from "clsx";

/**
 * EditorialImage (§38).
 *
 * A tasteful placeholder for real photography, so the prototype communicates
 * layout, cropping and pacing without shipping stock imagery. A real <Image>
 * swaps in behind the same box later. The tiny corner label keeps it honest
 * about being a placeholder while still feeling like a captioned technical plate.
 */
export function EditorialImage({
  label,
  caption,
  tone = "mono",
  seed = 0,
  className,
  aspect,
  children,
}: {
  label?: string;
  caption?: string;
  tone?: "mono" | "graphite" | "warm";
  seed?: number;
  className?: string;
  aspect?: string;
  children?: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    mono: "linear-gradient(135deg,#1a1c1f,#0b0c0e)",
    graphite: "linear-gradient(135deg,#202327,#0d0f11)",
    warm: "linear-gradient(135deg,#241f1a,#100d0b)",
  };
  const angle = 120 + (seed % 5) * 24;
  return (
    <div
      className={clsx("group relative overflow-hidden rounded border border-graphite-line", className)}
      style={{ aspectRatio: aspect, background: tones[tone] }}
    >
      {/* subtle sheen that shifts on hover */}
      <div
        className="absolute inset-0 opacity-60 transition-transform duration-700 ease-mech group-hover:scale-105"
        style={{
          background: `radial-gradient(60% 60% at ${30 + (seed % 3) * 20}% ${30 + (seed % 2) * 25}%, rgba(255,255,255,0.05), transparent 60%), linear-gradient(${angle}deg, rgba(255,255,255,0.03), transparent 55%)`,
        }}
      />
      {/* faint technical grid */}
      <div className="absolute inset-0 grid-tech opacity-[0.12]" />
      {children}
      {label && (
        <div className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-wide-tech text-steel/70">
          {label}
        </div>
      )}
      {caption && (
        <div className="absolute bottom-3 left-3 right-3 font-mono text-[11px] text-steel">{caption}</div>
      )}
    </div>
  );
}
