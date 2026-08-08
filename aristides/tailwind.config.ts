import type { Config } from "tailwindcss";

/**
 * Aristides design tokens.
 *
 * The palette is deliberately narrow: near-black environments, a graphite
 * elevation scale, one technical grey, near-white text, and a single restrained
 * ice accent. Colour in the core UI is scarce on purpose — the instruments are
 * meant to supply the colour. See the creative direction §4.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Environment
        void: "#050505", // near black — primary environment
        graphite: "#0B0C0E", // graphite surface
        "graphite-raised": "#121417", // raised graphite (cards, rails)
        "graphite-line": "#1C1F24", // hairline dividers on dark
        // Text
        chalk: "#F4F5F5", // near-white
        steel: "#8A8F98", // soft technical grey (secondary text, labels)
        "steel-dim": "#565b63", // tertiary / disabled
        // Accent — restrained cool ice, never gamer cyan
        ice: "#7FE9E3",
        "ice-dim": "#3d6b6a",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        "wide-tech": "0.18em",
        "wider-tech": "0.28em",
      },
      borderRadius: {
        // Machined, not soft. Small radii only.
        none: "0",
        xs: "1px",
        sm: "2px",
        DEFAULT: "3px",
        md: "4px",
        lg: "6px",
      },
      transitionTimingFunction: {
        // Smooth mechanical cubic curves. No bounce, no elastic.
        mech: "cubic-bezier(0.22, 0.61, 0.36, 1)",
        "mech-in": "cubic-bezier(0.55, 0.06, 0.68, 0.19)",
        "mech-out": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        ui: "180ms",
        editorial: "700ms",
      },
      maxWidth: {
        shell: "1600px",
      },
      fontSize: {
        // fluid display scale
        "display-sm": ["clamp(2.2rem, 6vw, 4rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
        "display-md": ["clamp(3rem, 9vw, 7rem)", { lineHeight: "0.9", letterSpacing: "-0.035em" }],
        "display-lg": ["clamp(3.5rem, 12vw, 11rem)", { lineHeight: "0.86", letterSpacing: "-0.04em" }],
      },
      keyframes: {
        "emerge": {
          "0%": { opacity: "0", transform: "translateY(24px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "line-grow": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        "sweep": {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
      },
      animation: {
        emerge: "emerge 900ms cubic-bezier(0.16, 1, 0.3, 1) both",
        sweep: "sweep 2.4s cubic-bezier(0.22, 0.61, 0.36, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
