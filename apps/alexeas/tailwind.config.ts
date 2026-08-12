import type { Config } from "tailwindcss";

/**
 * Alexeas atelier design system. The palette is drawn from wood, plaster, olive
 * trees, brass, leather, and Mediterranean light. Warm neutrals dominate; brass,
 * olive, and a muted sea-blue appear only as restrained accents.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Fraunces", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Manrope", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        atelier: "0 40px 80px -48px rgba(36, 28, 23, 0.5)",
        "atelier-sm": "0 24px 48px -30px rgba(36, 28, 23, 0.4)",
        lift: "0 20px 40px -28px rgba(36, 28, 23, 0.45)",
      },
      colors: {
        // Warm grounds
        warmwhite: "#FBF8F3",
        ivory: "#F2EADF",
        parchment: "#E7DDCE",
        parchmentDeep: "#DBCFBB",
        // Woods & darks
        espresso: "#241C17",
        walnut: "#3A2A21",
        wood: "#8A6245",
        woodLight: "#A67C54",
        // Accents
        brass: "#A88A5A",
        brassLight: "#C4A876",
        olive: "#74745B",
        sea: "#556B70",
        // Text
        ink: "#272521",
        "ink-soft": "#4A4038",
        "ink-muted": "#7A6E60",
      },
      letterSpacing: {
        wider2: "0.14em",
        widest2: "0.24em",
        widest3: "0.34em",
      },
      maxWidth: {
        editorial: "78rem",
        prose2: "42rem",
      },
      transitionTimingFunction: {
        atelier: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        700: "700ms",
        900: "900ms",
        1200: "1200ms",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slow-zoom": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-2%, -3%)" },
          "30%": { transform: "translate(-4%, 2%)" },
          "50%": { transform: "translate(2%, -4%)" },
          "70%": { transform: "translate(-2%, 3%)" },
          "90%": { transform: "translate(3%, 2%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 1s cubic-bezier(0.16,1,0.3,1) forwards",
        "slow-zoom": "slow-zoom 18s ease-out forwards",
        grain: "grain 8s steps(6) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
