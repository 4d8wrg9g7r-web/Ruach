# Linked document processing

**Status: built.** The brief describes analyzing a video's description for candidate
links (sermon notes, study guides, articles), presenting them to the subscriber for
inclusion/exclusion, and fetching only approved links (brief §22-23). All three
stages exist:

1. **Discovery (automatic, no network I/O).** `extractCandidateLinks`
   (`packages/providers/src/link-discovery.ts`) regex-extracts `https://` URLs from
   a resource's description and filters out known non-content domains (social
   platforms, giving/donation pages, app stores, self-referential video-platform
   links). This is a best-effort heuristic, not a guarantee -- the review step below
   is the real filter. When a title is available, candidates are also ranked by how
   many of the title's significant words appear in the text surrounding each link
   (its line in the description) before the `maxLinks` cap is applied -- e.g. a
   title of "Hope in Hard Seasons" ranks a "notes on hope in hard seasons" link
   above an unrelated one. This is a ranking signal only, never a hard exclusion --
   a zero-overlap link can still be the right one. Called from
   `persistNormalizedResource` (`packages/providers/src/import-service.ts`) right
   after a resource is created, for every provider uniformly (YouTube, Vimeo, RSS,
   generic URL). Each candidate becomes a `ResourceSourceDocument` row with
   `sourceType: WEB_PAGE`, `discoveredAutomatically: true`, `approvedByUser: false`,
   `includedInAnalysis: false` -- recorded, but nothing is fetched and nothing
   reaches AI categorization yet.
   `discoverLinksForResources` (`apps/dashboard/lib/resource-pipeline.ts`) re-runs
   this same discovery on demand, deduped against a resource's existing
   `sourceUrl`s, for resources that predate this feature -- wired to the Resources
   table's "Find links" bulk-toolbar action.

2. **Review (dashboard UI).** The resource detail page
   (`apps/dashboard/app/(dashboard)/resources/[resourceId]/page.tsx`) shows pending
   discovered links separately from already-included supporting documents, each with
   "Include" and a dismiss button.

3. **Fetch on approval only.** Clicking "Include" runs `safeFetch`
   (`packages/providers/src/ssrf-guard.ts` -- same SSRF-guarded fetcher as
   `GenericUrlProvider`) against the link, strips the HTML down to readable text via
   `extractReadableText` (`packages/providers/src/html-text.ts`, regex-based, no DOM
   parsing/execution -- same posture as `GenericUrlProvider`'s og:tag extraction),
   and calls `resourceService.approveSourceDocument` to stamp the text on the row and
   flip `approvedByUser`/`includedInAnalysis` to true. `CategorizationService`
   already filters on `includedInAnalysis && cleanText`
   (`packages/ai/src/CategorizationService.ts`), so an included link is picked up by
   the next "Generate"/"Regenerate" without any categorization-side changes.
   Dismissing a link deletes the pending row outright.
   `includeDiscoveredLinksForResources` (`apps/dashboard/lib/resource-pipeline.ts`)
   is the batch version -- fetches and includes every pending link across a set of
   resources, one bad link doesn't abort the rest -- wired to the Resources table's
   "Include links" bulk-toolbar action.

A broken/dead link on approval (timeout, non-HTML response, blocked by
`safeFetch`'s guardrails) redirects back to the resource page with a
`?linkError=` message rather than throwing -- an expected, recoverable outcome,
not a validation bug.
