# Transcript processing

`resourceService.setTranscript(organizationId, resourceId, transcript, source)`
(`packages/database/src/services/resource-service.ts`) is the single write path for
transcripts, used both by provider auto-fetch (`MockYouTubeProvider.getTranscript`,
called from the import service) and by the dashboard's manual paste form on the
resource review screen. It stores the original text as-is in `transcript` and a
trimmed `cleanTranscript`, and records `transcriptSource`
(`PROVIDER_CAPTIONS`/`MANUAL_TRANSCRIPT`/etc., per the brief's priority list).

Every transcript write also creates a `ResourceSourceDocument` row (`sourceType:
"TRANSCRIPT"`), which is what `CategorizationService` reads when generating metadata
-- see `docs/ai-categorization.md`.

## Not yet built

File upload for `.vtt`/`.srt`/`.docx`/`.pdf` transcripts (the dashboard only accepts
pasted plain text today), caption-file timestamp stripping, speaker-label detection,
and low-confidence-transcript flagging for review.
