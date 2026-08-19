import type { MetadataRoute } from "next";
import { prayerWallService } from "@ruach/database";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://ruachplatform.com";

const MARKETING_PATHS = [
  "/",
  "/how-it-works",
  "/features",
  "/product/prayer-wall",
  "/pricing",
  "/why-ruach",
  "/faq",
  "/release-notes",
  "/demo",
  "/privacy",
  "/terms",
];

/**
 * Marketing pages plus every church's own public Prayer Wall page (robots.ts
 * explicitly allows /prayer -- those pages are meant to be indexed, same as any
 * other public page a church wants visitors to find). Dynamic, so a DB hiccup at
 * request time degrades to marketing-only rather than a broken sitemap -- Google
 * treats a 500 on sitemap.xml far worse than a temporarily incomplete one.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const marketingEntries: MetadataRoute.Sitemap = MARKETING_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));

  let prayerWallEntries: MetadataRoute.Sitemap = [];
  try {
    const walls = await prayerWallService.listPublicPrayerWalls();
    prayerWallEntries = walls.map((wall) => ({
      url: `${SITE_URL}/prayer/${wall.publicPrayerWallId}`,
      lastModified: wall.updatedAt,
      changeFrequency: "weekly",
      priority: 0.5,
    }));
  } catch (err) {
    console.error("sitemap: failed to list public prayer walls, falling back to marketing paths only", err);
  }

  return [...marketingEntries, ...prayerWallEntries];
}
