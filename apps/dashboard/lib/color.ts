/**
 * Tint of an arbitrary #RRGGBB hex color at the given alpha. Hand-rolled rather than
 * CSS color-mix() -- some consumers of this (the chat widget) get embedded on
 * arbitrary third-party sites and may be viewed on older mobile browsers, so a plain
 * rgba() string is the safer bet for compatibility.
 */
export function hexToRgba(hex: string, alpha: number): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return `rgba(0, 0, 0, ${alpha})`;
  const value = match[1]!;
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
