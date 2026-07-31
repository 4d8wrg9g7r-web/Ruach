import { z } from "zod";
import { ResourceProviderTypeSchema, ResourceTypeSchema } from "./resource";

/**
 * The normalized shape every ResourceProvider (brief §13) must return, regardless of
 * source (YouTube, Vimeo, generic URL, manual). Provider-specific fields must not leak
 * past this boundary.
 */
export const NormalizedExternalResourceSchema = z.object({
  sourceProvider: ResourceProviderTypeSchema,
  externalId: z.string().min(1),
  resourceType: ResourceTypeSchema,
  title: z.string().min(1),
  description: z.string().nullable().default(null),
  creatorName: z.string().nullable().default(null),
  publishedAt: z.coerce.date().nullable().default(null),
  durationSeconds: z.number().int().positive().nullable().default(null),
  thumbnailUrl: z.string().url().nullable().default(null),
  publicUrl: z.string().url(),
  embedUrl: z.string().url().nullable().default(null),
  captionsAvailable: z.boolean().default(false),
});
export type NormalizedExternalResource = z.infer<typeof NormalizedExternalResourceSchema>;

export const ProviderValidationResultSchema = z.object({
  valid: z.boolean(),
  provider: ResourceProviderTypeSchema.nullable(),
  externalId: z.string().nullable(),
  reason: z.string().nullable().default(null),
});
export type ProviderValidationResult = z.infer<typeof ProviderValidationResultSchema>;

export const TranscriptResultSchema = z.object({
  text: z.string().min(1),
  source: z.enum([
    "PROVIDER_CAPTIONS",
    "UPLOADED_CAPTIONS",
    "MANUAL_TRANSCRIPT",
    "LINKED_NOTES",
    "AUTOMATIC_TRANSCRIPTION",
    "METADATA_ONLY",
  ]),
  language: z.string().nullable().default(null),
});
export type TranscriptResult = z.infer<typeof TranscriptResultSchema>;

export const DiscoveredDocumentSchema = z.object({
  url: z.string().url(),
  suggestedLabel: z.string(),
  likelyRelevant: z.boolean(),
});
export type DiscoveredDocument = z.infer<typeof DiscoveredDocumentSchema>;

/** A source an import can be started from — an existing DB row is not required yet. */
export const ExternalResourceSourceSchema = z.object({
  provider: ResourceProviderTypeSchema,
  externalId: z.string().min(1),
  url: z.string().url(),
});
export type ExternalResourceSource = z.infer<typeof ExternalResourceSourceSchema>;
