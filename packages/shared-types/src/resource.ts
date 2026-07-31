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

export const ResourceProviderTypeSchema = z.enum(["YOUTUBE", "VIMEO", "SUBSPLASH", "GENERIC_URL", "MANUAL"]);
export type ResourceProviderTypeValue = z.infer<typeof ResourceProviderTypeSchema>;
