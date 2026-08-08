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
        // Palette is driven by CSS variables (see app/globals.css) so the whole
        // UI adapts to light/dark without any per-component changes. Channels are
        // stored as space-separated RGB so opacity utilities keep working
        // (e.g. text-chalk/[0.04], bg-ice/10).
        // Environment
        void: "rgb(var(--c-void) / <alpha-value>)", // primary environment
        graphite: "rgb(var(--c-graphite) / <alpha-value>)", // surface
        "graphite-raised": "rgb(var(--c-graphite-raised) / <alpha-value>)", // cards, rails
        "graphite-line": "rgb(var(--c-graphite-line) / <alpha-value>)", // hairline dividers
        // Text
        chalk: "rgb(var(--c-chalk) / <alpha-value>)", // primary text
        steel: "rgb(var(--c-steel) / <alpha-value>)", // secondary text, labels
        "steel-dim": "rgb(var(--c-steel-dim) / <alpha-value>)", // tertiary / disabled
        // Accent — restrained cool ice, never gamer cyan
        ice: "rgb(var(--c-ice) / <alpha-value>)",
        "ice-dim": "rgb(var(--c-ice-dim) / <alpha-value>)",
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
