import type { ReactNode } from "react";
import { brandTintStyle } from "../lib/prayer-branding";

interface PrayerPageIntroProps {
  icon: ReactNode;
  title: string;
  description: string;
  brandColor: string;
}

/** Shared icon-badge + heading treatment for the signup/login/submit pages -- keeps their tone consistent with the wall's hero section. */
export function PrayerPageIntro({ icon, title, description, brandColor }: PrayerPageIntroProps) {
  return (
    <div className="mb-6">
      <span
        className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full"
        style={brandTintStyle(brandColor, 0.12)}
      >
        {icon}
      </span>
      <h2 className="mb-1 text-xl font-semibold text-ink">{title}</h2>
      <p className="text-sm text-ink-secondary">{description}</p>
    </div>
  );
}
