# YouTube integration

**Status: real metadata, mock fallback.** `YouTubeProvider` (`packages/providers/src/
YouTubeProvider.ts`) calls the real YouTube Data API v3 (`videos.list`) for title,
description, channel name, publish date, thumbnail, and duration. It activates only
when `YOUTUBE_API_KEY` is set in the environment; `getResourceProvider("YOUTUBE")`
(`packages/providers/src/registry.ts`) falls back to `MockYouTubeProvider` otherwise,
so the app and test suite still run with zero credentials (brief §57). URL parsing
(`parseYouTubeUrl`, `packages/providers/src/url-parsing.ts`) supports `watch?v=`,
`youtu.be/`, `/embed/`, and `/shorts/` forms and is unit-tested.

## Transcripts are deliberately not fetched here

`getTranscript()` always returns `null`. This is a considered decision, not a gap:
YouTube's official captions.download endpoint only works with OAuth authorization
from the video's *own* channel owner. There is no officially sanctioned way to fetch
a transcript for a video the subscriber doesn't own through the documented API --
the tools that do this rely on an undocumented endpoint, which is exactly the
brittle-scraping approach the build brief says not to depend on for core
functionality. Subscribers paste a transcript manually for better categorization
(already supported in the resource review screen), or a future OAuth "connect your
YouTube channel" flow (brief §14) would add real caption access for videos the
subscriber's own channel owns.

## Setup

1. Google Cloud Console → new project → enable "YouTube Data API v3".
2. Credentials → Create Credentials → API key. Restrict it to YouTube Data API v3.
3. Set `YOUTUBE_API_KEY` in `.env`.

Free tier quota is 10,000 units/day; a metadata fetch costs ~1 unit.

## Error handling

`YouTubeProvider.getResource()` throws on a non-2xx response (bad key, quota
exceeded, video not found/private/deleted) with the response body included. The
import service (`packages/providers/src/import-service.ts`) already catches this,
records the failure on the `ImportJob`, and surfaces it to the subscriber -- no
additional error handling was needed at the call site.

## Channel bulk import

Unlike captions, listing a public channel's uploaded videos is public data and needs
no OAuth -- so this *is* built. `YouTubeProvider.listResources({ organizationId,
channelUrl })` (`packages/providers/src/YouTubeProvider.ts`) resolves the channel
(`/channel/UC...`, `/@handle`, or legacy `/c/`/`/user/` via best-effort username
lookup -- see `parseYouTubeChannelUrl`, `packages/providers/src/url-parsing.ts`),
pages through its uploads playlist, and batch-fetches metadata in chunks of 50 IDs
(~N/25 quota units for an N-video channel). `importYouTubeChannel()`
(`packages/providers/src/import-service.ts`) persists every video as a draft
resource under one `ImportJob`, reusing the same
`organizationId`+`sourceProvider`+`externalId` dedup as single-video import -- safe
to re-run. The dashboard's "Import a YouTube channel" panel
(`apps/dashboard/app/(dashboard)/resources/page.tsx`) exposes this with an optional
"approve automatically" toggle. Runs synchronously in the request (no cap on video
count, no background queue) since transcripts are never fetched here -- the
expensive part of a normal import is skipped entirely for YouTube.

## Next steps

Real rate-limit backoff for very large channels, and OAuth consent-screen
verification for a "connect your channel" flow (real transcript access for owned
videos), are the trigger for introducing the background job queue (brief instruction
#24 -- don't build live sync until mock flows work, which they now do). Nothing in
`ChatPipeline`, `CategorizationService`, the import service, or the dashboard UI
needs to change when that's built -- they only ever see `NormalizedExternalResource`.
