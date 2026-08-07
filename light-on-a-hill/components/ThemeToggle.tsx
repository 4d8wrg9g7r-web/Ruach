"use client";

import { useEffect, useState } from "react";

/**
 * Day / Night / Sepia — named like film stocks, not OS modes. The choice is
 * stamped as data-theme on <html> (absent = Day) and persisted; a tiny inline
 * script in layout.tsx applies it pre-hydration so there's no flash.
 */
const THEMES = [
  { id: "day", label: "Day" },
  { id: "night", label: "Night" },
  { id: "sepia", label: "Sepia" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeId>("day");

  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    if (t === "night" || t === "sepia") setTheme(t);
  }, []);

  const apply = (t: ThemeId) => {
    setTheme(t);
    if (t === "day") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("loah-theme", t);
    } catch {
      /* private mode */
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={`inline-flex items-center gap-4 font-sans text-[0.6rem] uppercase tracking-label ${className ?? ""}`}
    >
      {THEMES.map((t) => {
        const active = theme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => apply(t.id)}
            className="group inline-flex items-center gap-1.5 transition-colors duration-500"
          >
            <span
              aria-hidden
              className={`h-[5px] w-[5px] rounded-full border transition-all duration-500 ease-aperture ${
                active
                  ? "border-champagne bg-champagne"
                  : "border-current bg-transparent opacity-40 group-hover:opacity-80"
              }`}
            />
            <span className={active ? "opacity-100" : "opacity-45 group-hover:opacity-80"}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
