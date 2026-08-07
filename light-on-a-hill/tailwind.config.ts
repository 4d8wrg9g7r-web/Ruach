import type { Config } from "tailwindcss";

/**
 * Light on a Hill — interface design system.
 *
 * The palette is intentionally restrained: photography supplies the colour, the
 * UI stays quiet. Champagne is an accent measured in drops, never a theme.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F4F2ED", // warm white — primary light surface
        surface: "#ECE9E2", // soft raised surface
        ink: "#111111", // near black — primary text / dark sections
        charcoal: "#252525",
        mist: "#A7A39B", // warm muted gray — secondary text
        champagne: "#BDA77C", // accent — use sparingly
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        label: "0.24em",
        micro: "0.32em",
      },
      fontSize: {
        // Fluid editorial display scale driven by clamp()
        "display-xl": ["clamp(3rem, 9vw, 9.5rem)", { lineHeight: "0.94", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.5rem, 6.5vw, 6.5rem)", { lineHeight: "0.98", letterSpacing: "-0.015em" }],
        "display-md": ["clamp(2rem, 4.5vw, 4rem)", { lineHeight: "1.02", letterSpacing: "-0.01em" }],
        "display-sm": ["clamp(1.6rem, 3vw, 2.6rem)", { lineHeight: "1.08" }],
      },
      transitionTimingFunction: {
        // Premium easing — mechanical, precise, never bouncy
        aperture: "cubic-bezier(0.16, 1, 0.3, 1)",
        lens: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      maxWidth: {
        editorial: "88rem",
      },
      screens: {
        xs: "430px",
      },
      keyframes: {
        "focus-lock": {
          "0%": { transform: "scale(1.15)", opacity: "0" },
          "60%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "focus-lock": "focus-lock 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
