import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";

/**
 * Type system (§5): an aggressive modern grotesk for display, a clean European
 * grotesk for body, and a technical monospace for the tiny engineered labels
 * that make the site feel like instrumentation.
 */
export const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-display",
  display: "swap",
});

export const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});
