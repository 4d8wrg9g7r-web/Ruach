import { Prisma, rawDb, resourceService } from "@ruach/database";
import type { RetrievalQuery, ScoredResource, SearchableResource } from "@ruach/shared-types";
import type { RetrievalProvider } from "./RetrievalProvider";

export function tokenize(queryText: string): string[] {
  const words = queryText.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return Array.from(new Set(words));
}

/**
 * Milestone-1 implementation: Postgres full-text search (tsvector), computed at query
 * time rather than denormalized into a stored column — simple enough that "indexing"
 * a resource just means it's ACTIVE with a populated searchDocument.
 *
 * This file uses raw SQL ($queryRaw), which is one of the few places in the codebase
 * that bypasses the tenant-guard Prisma extension (raw SQL isn't intercepted by
 * Client Extensions). organizationId is included directly in the WHERE clause below —
 * treat any edit to this query with the same scrutiny as the guard itself.
 */
export class LocalRetrievalProvider implements RetrievalProvider {
  async indexResource(resource: SearchableResource): Promise<void> {
    // No separate index to maintain for tsvector-at-query-time; this exists so the
    // interface has a real lifecycle hook to swap a future vector-store adapter into.
    await resourceService.markIndexed(resource.organizationId, resource.resourceId);
  }

  async removeResource(_organizationId: string, _resourceId: string): Promise<void> {
    // No-op for the same reason as indexResource — the resource row itself is the
    // source of truth. A future vector-store adapter would issue a delete call here.
  }

  async search(query: RetrievalQuery): Promise<ScoredResource[]> {
    // plainto_tsquery ANDs every word together, which is too strict for a natural-
    // language question -- "anything about anxiety" would require the document to
    // contain the (stemmed) word "anything" too. Instead we tokenize the query
    // ourselves and OR the per-word tsqueries together, so a document matching ANY
    // significant word is a candidate, ranked by how many words actually matched.
    // Each word still goes through plainto_tsquery individually (never raw
    // to_tsquery on user input), which safely strips stop words and never throws on
    // unbalanced operators the way a hand-built to_tsquery string could.
    const words = tokenize(query.queryText);
    if (words.length === 0) return [];

    const rows = await rawDb.$queryRaw<Array<{ id: string; rank: number; excerpt: string | null }>>(
      Prisma.sql`
        WITH parsed_query AS (
          SELECT to_tsquery(string_agg(pq::text, ' | ')) AS tsq
          FROM (
            SELECT plainto_tsquery('english', w) AS pq
            FROM unnest(${words}::text[]) AS w
          ) words
          WHERE pq != ''::tsquery
        )
        SELECT
          r."id",
          ts_rank(
            to_tsvector('english', coalesce(r."searchDocument", '') || ' ' || r."title"),
            parsed_query.tsq
          ) AS rank,
          ts_headline(
            'english',
            coalesce(r."searchDocument", ''),
            parsed_query.tsq,
            -- StartSel/StopSel blanked out -- ts_headline defaults to wrapping matches
            -- in literal <b>...</b>, which this excerpt shows to visitors as raw text
            -- (it's never HTML-rendered), so the default highlighting just leaked tags.
            'MaxFragments=1, MaxWords=30, MinWords=10, StartSel="", StopSel=""'
          ) AS excerpt
        FROM "Resource" r, parsed_query
        WHERE r."organizationId" = ${query.organizationId}
          AND r."status" = 'ACTIVE'
          AND parsed_query.tsq IS NOT NULL
          AND to_tsvector('english', coalesce(r."searchDocument", '') || ' ' || r."title") @@ parsed_query.tsq
        ORDER BY rank DESC
        LIMIT ${query.limit}
      `,
    );

    if (rows.length === 0) return [];

    const maxRank = Math.max(...rows.map((r) => r.rank), 0.0001);
    return rows.map((row) => ({
      resourceId: row.id,
      relevanceScore: Math.min(1, row.rank / maxRank),
      matchedExcerpt: row.excerpt,
    }));
  }
}
