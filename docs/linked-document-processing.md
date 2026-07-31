# Linked document processing

**Status: not yet built.** The brief describes analyzing a video's description for
candidate links (sermon notes, study guides, articles), presenting them to the
subscriber for inclusion/exclusion, and fetching only approved links (brief §22-23).

What exists today that this will build on:

- `ResourceSourceDocument` (`packages/database/prisma/schema.prisma`) already has
  `discoveredAutomatically`/`approvedByUser` fields.
- `safeFetch`/`assertSafeUrl` (`packages/providers/src/ssrf-guard.ts`) is already the
  SSRF-guarded fetcher this feature would reuse -- see `docs/security.md`.

What's missing: extracting candidate URLs from a resource's description text,
distinguishing likely-relevant links from unrelated ones (giving pages, social
profiles), and the dashboard review UI for including/excluding each discovered link.
