import type { RetrievalQuery, ScoredResource, SearchableResource } from "@ruach/shared-types";

/**
 * The swap-later seam (brief §32). Every method is embedding-shaped: plain strings in,
 * opaque 0-1 relevance scores out. No implementation detail of the current backend
 * (Postgres tsvector, a future pgvector column, or an OpenAI vector store) may leak
 * into this interface or into any caller.
 */
export interface RetrievalProvider {
  indexResource(resource: SearchableResource): Promise<void>;
  removeResource(organizationId: string, resourceId: string): Promise<void>;
  search(query: RetrievalQuery): Promise<ScoredResource[]>;
}
