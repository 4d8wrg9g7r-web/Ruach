/**
 * Centralised image references.
 *
 * These point at Unsplash placeholders so the design reads as photography-first
 * during the build. At launch, replace each `id` with the studio's real gallery
 * asset (or a local /public path) — every component reads from this map, so the
 * whole site re-skins from one file. This is the seam a Portfolio CMS collection
 * plugs into.
 */

export type StudioImage = {
  id: string; // Unsplash photo id (placeholder) or absolute URL
  alt: string;
  focal?: { x: number; y: number }; // object-position hint, 0..1
};

const UNSPLASH = "https://images.unsplash.com/photo-";

/** Build a responsive Unsplash URL, or pass through an absolute URL. */
export function src(image: StudioImage, width = 1600): string {
  if (image.id.startsWith("http")) return image.id;
  const q = width > 1400 ? 72 : 74;
  return `${UNSPLASH}${image.id}?auto=format&fit=crop&w=${width}&q=${q}`;
}

export function objectPosition(image: StudioImage): string {
  if (!image.focal) return "50% 50%";
  return `${Math.round(image.focal.x * 100)}% ${Math.round(image.focal.y * 100)}%`;
}

export const IMAGES = {
  heroWedding: {
    id: "1519741497674-611481863552",
    alt: "A couple embracing at golden hour on their wedding day",
    focal: { x: 0.5, y: 0.4 },
  },
  weddingAisle: {
    id: "1465495976277-4387d4b0b4c6",
    alt: "Bride and groom during an outdoor wedding ceremony",
    focal: { x: 0.5, y: 0.45 },
  },
  weddingDance: {
    id: "1519225421980-715cb0215aed",
    alt: "Newlyweds sharing a first dance under warm light",
  },
  weddingDetails: {
    id: "1583939003579-730e3918a45a",
    alt: "A bride in soft window light before the ceremony",
    focal: { x: 0.5, y: 0.35 },
  },
  couplesMountains: {
    id: "1490578474895-699cd4e2cf59",
    alt: "A couple walking together in the Blue Ridge mountains",
  },
  couplesField: {
    id: "1522673607200-164d1b6ce486",
    alt: "A couple laughing together in an open field at dusk",
  },
  familyOutdoor: {
    id: "1476234251651-f353703a034d",
    alt: "A family walking together outdoors in autumn",
    focal: { x: 0.5, y: 0.35 },
  },
  familyCandid: {
    id: "1511895426328-dc8714191300",
    alt: "Parents and children laughing together at home",
  },
  familyField: {
    id: "1537633552985-df8429e8048b",
    alt: "A young family in a sunlit field",
  },
  seniorPortrait: {
    id: "1524504388940-b1c1722653e1",
    alt: "A senior portrait session in soft afternoon light",
    focal: { x: 0.5, y: 0.3 },
  },
  maternity: {
    id: "1518621736915-f3b1c41bfd00",
    alt: "An expectant mother in a quiet, softly lit portrait",
  },
  portraitWoman: {
    id: "1438761681033-6461ffad8d80",
    alt: "A natural portrait of a woman in window light",
    focal: { x: 0.5, y: 0.3 },
  },
  portraitMan: {
    id: "1500648767791-00dcc994a43e",
    alt: "A candid editorial portrait of a man",
    focal: { x: 0.5, y: 0.3 },
  },
  photographer: {
    id: "1494790108377-be9c29b29330",
    alt: "Portrait of the photographer behind Light on a Hill",
    focal: { x: 0.5, y: 0.3 },
  },
  branding: {
    id: "1529626455594-4ff0802cfb7e",
    alt: "A personal branding session for a creative professional",
  },
  raleigh: {
    id: "1570126618953-d437176e8c79",
    alt: "Downtown Raleigh, North Carolina at dusk",
  },
} satisfies Record<string, StudioImage>;

export type ImageKey = keyof typeof IMAGES;
