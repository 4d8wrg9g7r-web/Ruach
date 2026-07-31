# YouTube integration

**Status: mock only.** `MockYouTubeProvider` (`packages/providers/src/
MockYouTubeProvider.ts`) implements `ResourceProvider` with no network calls --
deterministic results for a small set of known mock video IDs (matching the seed
data), and plausible synthetic results for any other ID. URL parsing
(`parseYouTubeUrl`, `packages/providers/src/url-parsing.ts`) supports
`watch?v=`, `youtu.be/`, `/embed/`, and `/shorts/` forms and is unit-tested.

## Building the live integration

Swap `getResourceProvider("YOUTUBE")` (`packages/providers/src/registry.ts`) to
return a new `YouTubeProvider` implementing the same interface, using the official
YouTube Data API. Needs, before starting:

- A Google Cloud project with the YouTube Data API enabled and an API key, provided
  by whoever operates this deployment -- not something to fake or guess.
- A decision on OAuth consent-screen verification requirements for channel
  connections (brief §14), which gates private/unlisted content access.
- Real quota-handling and rate-limit backoff, which is also the trigger for
  introducing the background job queue (brief instruction #24 -- don't build live
  sync until mock flows work, which they now do).

Nothing in `ChatPipeline`, `CategorizationService`, the import service, or the
dashboard UI needs to change -- they only ever see `NormalizedExternalResource`.
