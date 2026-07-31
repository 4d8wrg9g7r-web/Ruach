# AI categorization

`CategorizationService.categorize(organizationId, resourceId)`
(`packages/ai/src/CategorizationService.ts`) reads every `ResourceSourceDocument`
attached to a resource that's marked `includedInAnalysis`, sends them (plus the
title/description) to the active `AIProvider`, and writes back:

- The generated fields onto the `Resource` row itself (`summary`, `primaryTopic`,
  `secondaryTopics`, `questionsAnswered`, `lifeSituations`, `keyTakeaways`) and sets
  status to `REVIEW_REQUIRED`.
- A `GeneratedMetadataEvidence` row per field, recording the source document, a short
  excerpt, and a confidence score -- shown in the dashboard's resource review screen
  under "Evidence."
- A canonical `searchDocument` (the brief's documented template: title, speaker,
  series, topics, summary, questions answered, life situations, transcript) that
  `LocalRetrievalProvider` searches against.
- A `contentHash` (sha256 of title + transcript + description) intended to let a
  future sync job skip reprocessing unchanged resources.

`MockAIProvider`'s categorization is deterministic keyword-matching against a small
fixed topic vocabulary that overlaps the seed data (see `docs/local-development.md`).
It gives transcript-backed resources a higher confidence score than metadata-only
ones, matching the brief's stated intent ("transcript-backed resources should receive
stronger retrieval confidence").

## Review modes

`Organization.categorizationMode` (`MANUAL`/`ASSISTED`/`AUTOMATIC`) exists in the
schema, defaulting to `ASSISTED` per the brief, but milestone 1's dashboard doesn't yet
branch behavior on it -- every resource currently requires an explicit "Approve and
index" click regardless of mode. Wiring the three modes to actually change behavior
(auto-approve high-confidence fields in `ASSISTED`, skip review entirely in
`AUTOMATIC`) is deferred past milestone 1.
