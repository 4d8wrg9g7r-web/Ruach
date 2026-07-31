# Retrieval

See `docs/architecture.md`'s "Retrieval" section for the design rationale
(embedding-shaped interface, why terms are OR-combined instead of using
`plainto_tsquery` directly).

`RetrievalProvider` (`packages/retrieval/src/RetrievalProvider.ts`):

```ts
interface RetrievalProvider {
  indexResource(resource: SearchableResource): Promise<void>;
  removeResource(organizationId: string, resourceId: string): Promise<void>;
  search(query: RetrievalQuery): Promise<ScoredResource[]>;
}
```

`LocalRetrievalProvider` is the only implementation today: Postgres full-text search
over `to_tsvector('english', searchDocument || ' ' || title)`, backed by a GIN
expression index (see the `init` migration's trailing `CREATE INDEX`). `indexResource`
and `removeResource` are near no-ops here (search happens live at query time against
the `Resource` table, not a denormalized index) -- they exist so the interface has a
real lifecycle to swap a future adapter into without touching callers.

## Swapping in a different backend

To add a pgvector or managed-vector-store adapter: implement `RetrievalProvider`
against the same three methods, using real indexing in `indexResource` this time, and
swap the `new LocalRetrievalProvider()` call sites (currently in the resource-approval
server action and the public chat route) for the new class. Nothing else changes,
because `RetrievalQuery`/`ScoredResource` never expose FTS-specific concepts.
