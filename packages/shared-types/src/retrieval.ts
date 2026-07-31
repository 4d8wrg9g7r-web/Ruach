import { z } from "zod";
import { ResourceTypeSchema } from "./resource";

/**
 * Embedding-shaped from day one: a plain query string in, scored resources out, with
 * an opaque 0-1 relevance score. No implementation detail (tsquery syntax, ts_rank,
 * vector distance metric) may leak past this schema — that's what lets the milestone-1
 * Postgres full-text search implementation be swapped for pgvector or an OpenAI vector
 * store later without touching callers.
 */
export const RetrievalQuerySchema = z.object({
  organizationId: z.string().min(1),
  queryText: z.string().min(1),
  allowedResourceTypes: z.array(ResourceTypeSchema).optional(),
  allowedCollectionIds: z.array(z.string()).optional(),
  limit: z.number().int().positive().max(50).default(15),
});
export type RetrievalQuery = z.infer<typeof RetrievalQuerySchema>;

export const ScoredResourceSchema = z.object({
  resourceId: z.string(),
  relevanceScore: z.number().min(0).max(1),
  matchedExcerpt: z.string().nullable().default(null),
});
export type ScoredResource = z.infer<typeof ScoredResourceSchema>;
export type RetrievalResult = ScoredResource;

/** What a RetrievalProvider needs to build/update a searchable document for a resource. */
export const SearchableResourceSchema = z.object({
  resourceId: z.string(),
  organizationId: z.string(),
  resourceType: ResourceTypeSchema,
  title: z.string(),
  searchDocument: z.string(),
  status: z.string(),
});
export type SearchableResource = z.infer<typeof SearchableResourceSchema>;
