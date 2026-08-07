/**
 * Editorial content used across the homepage, workshop, and archive.
 *
 * NOTE: TESTIMONIALS and COMPLETED builds below are illustrative placeholder
 * content, meant to be replaced by the workshop with real players and real
 * instruments (they are structured exactly as the CMS-backed data would be).
 * They are intentionally generic and are never presented as verified reviews.
 */

export interface ProcessStep {
  n: string;
  title: string;
  body: string;
}

export const PROCESS: ProcessStep[] = [
  { n: "01", title: "Conversation", body: "We begin by talking — how you play, what you hear, and the instrument you've always wanted in your hands." },
  { n: "02", title: "Instrument Design", body: "Body, voice, feel, and detail take shape together, drawn around you rather than pulled from a catalog." },
  { n: "03", title: "Wood Selection", body: "Sets are chosen and tapped by hand. The right piece of wood is the quiet beginning of the whole instrument." },
  { n: "04", title: "Construction", body: "Braces, joinery, neck, and body come together slowly, each stage checked before the next begins." },
  { n: "05", title: "Voicing", body: "The top is shaped and listened to, again and again, until the instrument speaks the way it should." },
  { n: "06", title: "Finish & Setup", body: "A thin finish protects the wood without dampening it, and the setup is dialed to your hands." },
  { n: "07", title: "Delivery", body: "The instrument comes home to you — and, if you'll have it, stays in touch with the shop for the rest of its life." },
];

export interface Testimonial {
  name: string;
  model: string;
  woods: string;
  since: string;
  quote: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "J. Marsh",
    model: "OM 14",
    woods: "European Spruce / Mahogany",
    since: "Owned since 2018",
    quote:
      "Seven years in, it keeps opening up. It has become the guitar I reach for before any other — the one that already knows what I'm about to play.",
  },
  {
    name: "A. Delacroix",
    model: "Grand Concert 12-Fret",
    woods: "Adirondack / East Indian Rosewood",
    since: "Owned since 2020",
    quote:
      "I asked for something that would sit under my voice without ever crowding it. That is exactly what came back to me. Nothing about it feels off-the-shelf.",
  },
  {
    name: "R. Okafor",
    model: "Dreadnought",
    woods: "Adirondack / East Indian Rosewood",
    since: "Owned since 2016",
    quote:
      "Loud when I dig in, quiet when I don't, and always clear. Every time I open the case I notice another detail I hadn't seen the year before.",
  },
];

export interface CompletedBuild {
  id: string;
  model: string;
  year: string;
  top: string;
  body: string;
  neck: string;
  fretboard: string;
  binding: string;
  rosette: string;
  features: string[];
  story: string;
  silhouette: "o" | "grand-concert" | "om" | "dreadnought" | "mandolin";
  accent: string;
}

export const COMPLETED: CompletedBuild[] = [
  {
    id: "om14-0192",
    model: "OM 14-Fret",
    year: "2024",
    top: "European Spruce",
    body: "East Indian Rosewood",
    neck: "Mahogany",
    fretboard: "Ebony",
    binding: "Maple",
    rosette: "Wood Mosaic",
    features: ["Walnut arm bevel", "Traditional dot inlays"],
    story:
      "Commissioned for a fingerstyle player who records at home. Voiced for clarity and separation, with a walnut bevel for long sessions at the desk.",
    silhouette: "om",
    accent: "#A88A5A",
  },
  {
    id: "gc12-0177",
    model: "Grand Concert 12-Fret",
    year: "2023",
    top: "Adirondack Spruce",
    body: "Koa",
    neck: "Mahogany",
    fretboard: "Ebony",
    binding: "Koa",
    rosette: "Abalone",
    features: ["12-fret neck", "Abalone rosette"],
    story:
      "A warm, singing 12-fret for a songwriter. Koa back and sides give it a sweetness that has only grown as it's been played in.",
    silhouette: "grand-concert",
    accent: "#9A5A2E",
  },
  {
    id: "dread-0158",
    model: "Dreadnought",
    year: "2023",
    top: "Adirondack Spruce",
    body: "East Indian Rosewood",
    neck: "Mahogany",
    fretboard: "Ebony",
    binding: "Ebony",
    rosette: "Classic Ring",
    features: ["Forward-shifted bracing", "Bold projection"],
    story:
      "Built for a flatpicker who needed volume without mud. Rosewood and a driven Adirondack top give it power that keeps its edges.",
    silhouette: "dreadnought",
    accent: "#556B70",
  },
  {
    id: "o-0143",
    model: "O",
    year: "2022",
    top: "Western Red Cedar",
    body: "Walnut",
    neck: "Mahogany",
    fretboard: "Rosewood",
    binding: "Rosewood",
    rosette: "Minimal",
    features: ["Parlor body", "Cedar top"],
    story:
      "A small, intimate guitar for late-night playing. Cedar over walnut makes it immediate and warm at a whisper.",
    silhouette: "o",
    accent: "#8A6245",
  },
];

export const PHILOSOPHY = {
  hook: "There are easier ways to make a guitar.",
  turn: "We aren't interested in them.",
  body: "Every Alexeas is built individually — the top voiced by hand, the joinery cut and fitted, the finish laid thin, and the whole instrument inspected before it is allowed to leave. Not so it is merely well made, but so that it remains well made, decades from now, in the hands of the one person it was built for.",
};
