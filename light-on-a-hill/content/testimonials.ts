import { type ImageKey } from "./images";

/** Testimonials — maps to a `Testimonials` CMS collection. */
export type Testimonial = {
  quote: string; // short, editorial — set in large type
  attribution: string;
  detail: string; // e.g. session type + location
  image: ImageKey;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "It somehow felt like she photographed us exactly as we are.",
    attribution: "Hannah & Will",
    detail: "Wedding — The Maxwell, Raleigh",
    image: "weddingDance",
  },
  {
    quote: "We forgot the camera was there, and the photos prove it.",
    attribution: "The Alvarez Family",
    detail: "Family session — Umstead State Park",
    image: "familyOutdoor",
  },
  {
    quote: "Every single frame felt like a memory, not a pose.",
    attribution: "Maddie & Chris",
    detail: "Engagement — Blue Ridge Mountains",
    image: "couplesMountains",
  },
];
