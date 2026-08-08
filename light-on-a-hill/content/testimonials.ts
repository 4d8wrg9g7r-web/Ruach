import { type ImageKey } from "./images";

/**
 * Testimonials — maps to a `Testimonials` CMS collection.
 * PLACEHOLDER COPY: quotes and attributions are sample content for the owner
 * to replace with real client words before launch.
 */
export type Testimonial = {
  quote: string; // short, editorial — set in large type
  attribution: string;
  detail: string; // e.g. session type + location
  image: ImageKey;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "It somehow felt like he photographed us exactly as we are.",
    attribution: "A recent couple", // PLACEHOLDER — replace with real client
    detail: "Wedding — North Carolina",
    image: "weddingDance",
  },
  {
    quote: "Five boys, one photo where everyone is actually smiling. Magic.",
    attribution: "A Raleigh family", // PLACEHOLDER — replace with real client
    detail: "Family session — Studio",
    image: "familyOutdoor",
  },
  {
    quote: "He caught who I actually am — not just what I look like.",
    attribution: "A graduating senior", // PLACEHOLDER — replace with real client
    detail: "Senior session — North Carolina",
    image: "seniorGuitarist",
  },
];
