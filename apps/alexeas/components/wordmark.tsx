/**
 * The Alexeas wordmark: a small rosette emblem (concentric soundhole rings) set
 * beside the name in the editorial serif. Drawn in SVG so it stays crisp at any
 * size and inherits color via `currentColor`.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 232 32"
      role="img"
      aria-label="Alexeas"
      fill="none"
    >
      <g stroke="currentColor" strokeWidth="1.1">
        <circle cx="16" cy="16" r="12.5" opacity="0.35" />
        <circle cx="16" cy="16" r="9" opacity="0.6" />
        <circle cx="16" cy="16" r="5" opacity="0.9" />
      </g>
      <circle cx="16" cy="16" r="1.6" fill="currentColor" />
      <text
        x="40"
        y="23"
        fill="currentColor"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "23px",
          fontWeight: 500,
          letterSpacing: "0.14em",
        }}
      >
        ALEXEAS
      </text>
    </svg>
  );
}
