/**
 * Aristides wordmark. A tightly-tracked geometric wordmark with a small
 * exoskeleton bracket mark — hard precision on the outside (the site's central
 * metaphor, §43). SVG so it stays crisp and inherits `currentColor`.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 20" className={className} role="img" aria-label="Aristides">
      {/* exoskeleton bracket */}
      <path d="M2 2 L2 18 M2 2 L7 2 M2 18 L7 18" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <text
        x="16"
        y="15"
        fill="currentColor"
        style={{
          fontFamily: "var(--font-display), sans-serif",
          fontSize: "15px",
          fontWeight: 700,
          letterSpacing: "0.22em",
        }}
      >
        ARISTIDES
      </text>
      <path d="M218 2 L218 18 M218 2 L213 2 M218 18 L213 18" stroke="currentColor" strokeWidth="1.6" fill="none" />
    </svg>
  );
}
