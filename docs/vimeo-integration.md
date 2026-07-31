# Vimeo integration

**Status: mock only.** `MockVimeoProvider` (`packages/providers/src/
MockVimeoProvider.ts`) -- same rationale and pattern as `MockYouTubeProvider` (see
`docs/youtube-integration.md`). URL parsing (`parseVimeoUrl`) supports `vimeo.com/ID`
and `player.vimeo.com/video/ID` forms and is unit-tested.

## Building the live integration

Swap `getResourceProvider("VIMEO")` (`packages/providers/src/registry.ts`) for a real
adapter using the Vimeo API. Before starting, confirm which Vimeo API access tier the
target account has -- several metadata/embed endpoints are gated to paid tiers, and
the brief explicitly requires respecting Vimeo's privacy/domain-restriction settings
rather than assuming a video is embeddable. Same interface, same "nothing else in the
app changes" property as the YouTube integration.
