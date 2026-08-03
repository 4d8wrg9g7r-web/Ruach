import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        "surface-warm": "var(--surface-warm)",
        sidebar: "var(--sidebar)",
        "sidebar-secondary": "var(--sidebar-secondary)",
        "sidebar-border": "var(--sidebar-border)",
        ink: "var(--text-primary)",
        "ink-secondary": "var(--text-secondary)",
        "ink-muted": "var(--text-muted)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        accent: {
          DEFAULT: "var(--accent)",
          light: "var(--accent-light)",
          dark: "var(--accent-dark)",
        },
        success: {
          DEFAULT: "var(--success)",
          bg: "var(--success-background)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          bg: "var(--warning-background)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          bg: "var(--danger-background)",
        },
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "10px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
      spacing: {
        4.5: "18px",
      },
      transitionDuration: {
        180: "180ms",
      },
    },
  },
  plugins: [],
};

export default config;
