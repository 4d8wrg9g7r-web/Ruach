# Generic URL import

`GenericUrlProvider` (`packages/providers/src/GenericUrlProvider.ts`) is the one
provider that does real network I/O in milestone 1 -- it needs no credentials, so
there's no reason to mock it. Given any HTTPS URL:

1. `assertSafeUrl`/`safeFetch` (`packages/providers/src/ssrf-guard.ts`) validate and
   fetch it under SSRF guardrails -- see `docs/security.md`.
2. Open Graph tags (`og:title`, `og:description`, `og:image`) are extracted via
   regex against the raw HTML -- no HTML is parsed into a DOM or executed.
3. Resource type is guessed from the response's `Content-Type` header
   (`application/pdf` → `DOCUMENT`, `text/html` → `ARTICLE`, else `OTHER`).
4. `embedUrl` is always `null` -- unknown providers are never auto-embedded (brief
   §17's explicit requirement); the resource card always links out instead.

The stable identity used for duplicate detection is a sha256 hash of the final
(post-redirect) URL, not the title (brief §18: never use title alone as the unique
identifier).

## Not yet built

PDF text extraction, Google Docs/Word document parsing, and the "discovered
supporting document" review UI described in brief §22 (description-link discovery) --
`ResourceSourceDocument.discoveredAutomatically` exists in the schema and is written
by the description-link-discovery-adjacent code paths that do exist (provider
metadata, transcripts), but nothing yet crawls a video description for candidate
links.
