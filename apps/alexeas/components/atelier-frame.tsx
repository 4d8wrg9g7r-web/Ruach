import { SITE } from "@/lib/site";

/**
 * A fixed, non-interactive brass hairline frame inset from the viewport edge,
 * with small corner ticks and quiet edition marginalia. It reads like the mat
 * around an editioned print — a signature that lifts the whole site above a
 * template without touching any page's content. Desktop only, and never
 * interactive (pointer-events: none).
 */
export function AtelierFrame() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[46] hidden lg:block">
      <div className="absolute inset-4 border border-brass/20" />
      {/* Corner ticks */}
      {[
        "left-4 top-4 border-l border-t",
        "right-4 top-4 border-r border-t",
        "left-4 bottom-4 border-l border-b",
        "right-4 bottom-4 border-r border-b",
      ].map((pos) => (
        <span key={pos} className={`absolute h-3 w-3 border-brass/60 ${pos}`} />
      ))}
      {/* Edition marginalia, rotated along the left edge */}
      <span
        className="mono-label absolute left-[1.15rem] top-1/2 origin-center -translate-y-1/2 -rotate-90 whitespace-nowrap text-brass/50"
        style={{ letterSpacing: "0.34em" }}
      >
        {SITE.location.city}, {SITE.location.regionCode} · Est. by hand
      </span>
      <span
        className="mono-label absolute right-[1.15rem] top-1/2 origin-center -translate-y-1/2 rotate-90 whitespace-nowrap text-brass/50"
        style={{ letterSpacing: "0.34em" }}
      >
        Alexeas · Guitars &amp; Mandolins
      </span>
    </div>
  );
}
