/**
 * Site Settings — the single source of business truth used across the interface
 * and structured data. In production this maps to a `SiteSettings` CMS global.
 *
 * NOTE ON ACCURACY: figures marked `// PLACEHOLDER` are not confirmed from the
 * current Light on a Hill website and must be verified by the owner before
 * launch. Confirmed detail from the existing site: portrait/event sessions are
 * $200/hr with a two-hour minimum, all edited images included and delivered to
 * a private online gallery within four weeks.
 */

export const SITE = {
  name: "Light on a Hill Photography",
  shortName: "Light on a Hill",
  wordmark: "LIGHT ON A HILL",
  tagline: "Wedding, portrait, and lifestyle photography in North Carolina and beyond.",
  url: "https://lightonahillphotography.com",
  email: "hello@lightonahillphotography.com", // PLACEHOLDER — confirm
  phone: "", // optional; leave empty to hide phone CTAs
  primaryCity: "Raleigh",
  region: "North Carolina",
  serviceAreas: [
    "Raleigh",
    "Durham",
    "Cary",
    "Chapel Hill",
    "The Blue Ridge Mountains",
    "Destination — wherever your story takes you",
  ],
  responseTime: "Typically responds within one business day.",
  social: {
    instagram: "https://instagram.com/", // PLACEHOLDER — confirm handle
    facebook: "https://facebook.com/",
    pinterest: "",
  },
  // Confirmed from current site — portrait/event rate.
  sessionRate: {
    hourly: 200,
    minimumHours: 2,
    delivery: "All edited images included and delivered to a private online gallery within four weeks.",
  },
} as const;

export type SiteSettings = typeof SITE;
