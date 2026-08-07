import { IMAGES, type ImageKey } from "./images";

/**
 * Primary navigation — the aperture menu reads this. Each entry carries the
 * background image the menu cross-fades to on hover, plus a one-line descriptor.
 * Maps to a `Navigation` CMS collection.
 */
export type NavItem = {
  index: string;
  label: string;
  href: string;
  image: ImageKey;
  hint?: string;
};

export const PRIMARY_NAV: NavItem[] = [
  { index: "01", label: "Home", href: "/", image: "heroWedding", hint: "The studio" },
  { index: "02", label: "Weddings", href: "/weddings", image: "weddingAisle", hint: "The whole day, remembered" },
  { index: "03", label: "Couples", href: "/couples", image: "couplesField", hint: "The two of you" },
  { index: "04", label: "Families", href: "/families", image: "familyOutdoor", hint: "This season of life" },
  { index: "05", label: "Seniors", href: "/seniors", image: "seniorPortrait", hint: "The year everything changes" },
  { index: "06", label: "The Experience", href: "/the-experience", image: "weddingDetails", hint: "What it's like to work together" },
  { index: "07", label: "About", href: "/about", image: "photographer", hint: "The person behind the camera" },
  { index: "08", label: "Journal", href: "/journal", image: "couplesMountains", hint: "Stories, guides & planning" },
  { index: "09", label: "Inquire", href: "/inquire", image: "weddingDance", hint: "Start the conversation" },
];

// Grouped footer navigation (hub-and-spoke aware).
export const FOOTER_NAV = {
  Photography: [
    { label: "Weddings", href: "/weddings" },
    { label: "Couples", href: "/couples" },
    { label: "Families", href: "/families" },
    { label: "Seniors", href: "/seniors" },
    { label: "Maternity", href: "/maternity" },
    { label: "Branding", href: "/branding" },
  ],
  Studio: [
    { label: "The Experience", href: "/the-experience" },
    { label: "Investment", href: "/investment" },
    { label: "About", href: "/about" },
    { label: "The Journal", href: "/journal" },
  ],
  "Service Areas": [
    { label: "Raleigh", href: "/locations/raleigh-photographer" },
    { label: "Durham", href: "/locations/durham-photographer" },
    { label: "Cary", href: "/locations/cary-photographer" },
    { label: "Chapel Hill", href: "/locations/chapel-hill-photographer" },
    { label: "Destination", href: "/locations/destination-photography" },
  ],
} as const;

export const NAV_IMAGE = IMAGES; // re-export for menu consumers
