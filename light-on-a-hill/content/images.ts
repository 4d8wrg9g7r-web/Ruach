/**
 * Centralised image references — now pointing at the studio's real photography
 * in /public/photography (pulled from the owner's portfolio set). Every
 * component reads from this map, so the whole site re-skins from this file.
 * This is the seam a Portfolio CMS collection plugs into.
 *
 * NOTE ON COVERAGE: the current set has no couples/engagement or maternity
 * frames, so those slots temporarily reuse the closest real work (marked
 * below). Swap them when those sessions are added to the portfolio.
 */

export type StudioImage = {
  id: string; // local /public path (or absolute URL / Unsplash id for legacy)
  alt: string;
  focal?: { x: number; y: number }; // object-position hint, 0..1
};

const UNSPLASH = "https://images.unsplash.com/photo-";

/** Resolve an image reference. Local paths pass through untouched. */
export function src(image: StudioImage, width = 1600): string {
  if (image.id.startsWith("/") || image.id.startsWith("http")) return image.id;
  const q = width > 1400 ? 72 : 74;
  return `${UNSPLASH}${image.id}?auto=format&fit=crop&w=${width}&q=${q}`;
}

export function objectPosition(image: StudioImage): string {
  if (!image.focal) return "50% 50%";
  return `${Math.round(image.focal.x * 100)}% ${Math.round(image.focal.y * 100)}%`;
}

export const IMAGES = {
  heroWedding: {
    id: "/photography/wedding-first-dance.jpg",
    alt: "A bride and groom share their first dance under moody violet light",
    focal: { x: 0.55, y: 0.45 },
  },
  weddingAisle: {
    id: "/photography/wedding-embrace-bw.jpg",
    alt: "A black-and-white portrait of a groom kissing his bride's forehead",
    focal: { x: 0.5, y: 0.4 },
  },
  weddingDance: {
    id: "/photography/wedding-first-dance.jpg",
    alt: "Newlyweds during their first dance, wrapped in soft stage light",
    focal: { x: 0.55, y: 0.45 },
  },
  weddingDetails: {
    id: "/photography/wedding-rings-florals.jpg",
    alt: "Wedding rings resting on pink crepe myrtle blossoms",
  },
  // TEMPORARY: no couples/engagement frames in the current set — reusing the
  // strongest couple imagery until an engagement session is added.
  couplesMountains: {
    id: "/photography/portrait-woman-waterfront.jpg",
    alt: "A relaxed waterfront portrait session with sunlit bokeh",
    focal: { x: 0.42, y: 0.35 },
  },
  couplesField: {
    id: "/photography/wedding-embrace-bw.jpg",
    alt: "A couple held close in a timeless black-and-white frame",
    focal: { x: 0.5, y: 0.4 },
  },
  familyOutdoor: {
    id: "/photography/family-five-brothers.jpg",
    alt: "Five brothers laughing together during a studio family session",
    focal: { x: 0.5, y: 0.45 },
  },
  familyCandid: {
    id: "/photography/family-five-brothers.jpg",
    alt: "A family session full of easy, genuine smiles",
    focal: { x: 0.5, y: 0.45 },
  },
  familyField: {
    id: "/photography/family-five-brothers.jpg",
    alt: "Brothers gathered close for a family portrait",
    focal: { x: 0.5, y: 0.45 },
  },
  seniorPortrait: {
    id: "/photography/senior-silhouette.jpg",
    alt: "A dramatic black-and-white senior silhouette against city architecture",
    focal: { x: 0.45, y: 0.35 },
  },
  // TEMPORARY: no maternity frames in the current set.
  maternity: {
    id: "/photography/portrait-woman-waterfront.jpg",
    alt: "A soft, natural portrait by the water",
    focal: { x: 0.42, y: 0.35 },
  },
  portraitWoman: {
    id: "/photography/portrait-woman-waterfront.jpg",
    alt: "A joyful waterfront portrait in natural light",
    focal: { x: 0.42, y: 0.35 },
  },
  portraitMan: {
    id: "/photography/portrait-man-profile.jpg",
    alt: "A quiet profile portrait in warm window light",
    focal: { x: 0.5, y: 0.4 },
  },
  photographer: {
    id: "/photography/photographer-portrait.jpg",
    alt: "Portrait of the photographer behind Light on a Hill",
    focal: { x: 0.5, y: 0.4 },
  },
  branding: {
    id: "/photography/branding-headshot.jpg",
    alt: "A clean professional headshot against a deep blue studio backdrop",
    focal: { x: 0.5, y: 0.35 },
  },
  raleigh: {
    id: "/photography/stage-performer.jpg",
    alt: "Live event coverage — a performer commanding the stage",
    focal: { x: 0.5, y: 0.4 },
  },
  // Additional real work — events, sports, and creative sessions.
  seniorGuitarist: {
    id: "/photography/senior-guitarist.jpg",
    alt: "A senior session built around his guitar, photographed outdoors",
    focal: { x: 0.55, y: 0.4 },
  },
  cheerleader: {
    id: "/photography/cheerleader-studio.jpg",
    alt: "A cheerleader mid-leap through pink and blue studio smoke",
    focal: { x: 0.5, y: 0.45 },
  },
  bandHats: {
    id: "/photography/band-cowboy-hats.jpg",
    alt: "A band lined up with cowboy hats in hand before the show",
  },
  singerLive: {
    id: "/photography/singer-live.jpg",
    alt: "A singer lost in the moment on stage",
    focal: { x: 0.5, y: 0.4 },
  },
  arenaFootball: {
    id: "/photography/arena-football.jpg",
    alt: "Arena football action at full speed",
  },
  guitarCollage: {
    id: "/photography/guitar-collage.jpg",
    alt: "A black-and-white collage study of a guitarist's hands and strings",
  },
  creativeComposite: {
    id: "/photography/creative-composite.jpg",
    alt: "A dark creative composite portrait",
  },
} satisfies Record<string, StudioImage>;

export type ImageKey = keyof typeof IMAGES;
