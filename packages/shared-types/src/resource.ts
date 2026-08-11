import { z } from "zod";

export const ResourceTypeSchema = z.enum([
  "VIDEO",
  "SERMON",
  "PODCAST",
  "ARTICLE",
  "COURSE",
  "DOCUMENT",
  "DEVOTIONAL",
  "AUDIO",
  "OTHER",
]);
export type ResourceTypeValue = z.infer<typeof ResourceTypeSchema>;

export const ResourceProviderTypeSchema = z.enum(["YOUTUBE", "VIMEO", "SUBSPLASH", "GENERIC_URL", "MANUAL", "RSS"]);
export type ResourceProviderTypeValue = z.infer<typeof ResourceProviderTypeSchema>;

/**
 * User-facing content-format buckets -- coarser than ResourceTypeValue (e.g. SERMON
 * and COURSE both read as "a video" to a visitor). Single source of truth for both
 * the dashboard's type filter UI (apps/dashboard/lib/format.ts re-exports this
 * rather than defining its own copy) and ChatPipeline's priority-ranking step,
 * which needs the exact same grouping a customer sees when they pick a priority in
 * Settings -- otherwise "prioritize Videos" could silently rank differently than
 * what the Resources page filter calls "Videos".
 */
export const ResourceTypeGroupSchema = z.enum(["VIDEOS", "PODCASTS", "ARTICLES", "DOCUMENTS", "OTHER"]);
export type ResourceTypeGroup = z.infer<typeof ResourceTypeGroupSchema>;

const RESOURCE_TYPE_GROUPS: Record<string, ResourceTypeGroup> = {
  VIDEO: "VIDEOS",
  SERMON: "VIDEOS",
  COURSE: "VIDEOS",
  PODCAST: "PODCASTS",
  AUDIO: "PODCASTS",
  ARTICLE: "ARTICLES",
  DEVOTIONAL: "ARTICLES",
  DOCUMENT: "DOCUMENTS",
  OTHER: "OTHER",
};

export function resourceTypeGroup(resourceType: string): ResourceTypeGroup {
  return RESOURCE_TYPE_GROUPS[resourceType] ?? "OTHER";
}

/** The subset of groups selectable as a chat-ranking priority -- "Other" is too vague a bucket to prioritize toward. */
export const PRIORITIZABLE_RESOURCE_TYPE_GROUPS: { key: ResourceTypeGroup; label: string }[] = [
  { key: "VIDEOS", label: "Videos" },
  { key: "PODCASTS", label: "Podcasts" },
  { key: "ARTICLES", label: "Articles" },
  { key: "DOCUMENTS", label: "Documents" },
];
