# Vimeo integration

**Status: real metadata and transcripts, mock fallback.** `VimeoProvider`
(`packages/providers/src/VimeoProvider.ts`) calls the real Vimeo API for metadata
(`GET /videos/{id}`) and, unlike YouTube, for real caption text too
(`GET /videos/{id}/texttracks`) -- Vimeo's texttracks endpoint doesn't have YouTube's
ownership/OAuth gate for public videos, so there's no scraping-vs-official tradeoff
here. It activates only when `VIMEO_ACCESS_TOKEN` is set;
`getResourceProvider("VIMEO")` falls back to `MockVimeoProvider` otherwise. URL
parsing (`parseVimeoUrl`) supports `vimeo.com/ID` and `player.vimeo.com/video/ID` and
is unit-tested.

## What it does

- Metadata: title, description, creator, duration (already in seconds, no parsing
  needed), publish date, largest available thumbnail.
- Embed: `embedUrl` is only populated when the video's `privacy.embed` is `"public"`
  -- per brief §15's explicit requirement, we never claim a video is embeddable when
  Vimeo's own settings say otherwise. Non-embeddable videos still get a `publicUrl`
  so the resource card opens externally instead.
- Transcript: fetches the active English caption/subtitle track if one exists,
  downloads its VTT file, and converts it to plain text via `parseVttToText()`
  (`packages/providers/src/vtt.ts`, unit-tested) -- strips timing lines, cue numbers,
  and inline timing tags, dedupes repeated lines from rolling captions. Returns
  `null` (falls through to metadata-only indexing) if the video has no captions.

## Setup

1. [developer.vimeo.com/apps](https://developer.vimeo.com/apps) → Create an app.
2. App page → Authentication tab → Generate an access token with **Public** scope.
3. Set `VIMEO_ACCESS_TOKEN` in `.env`.

## Error handling

`getResource()` throws on a non-2xx response (bad token, video not found/private),
caught and recorded by the import service same as YouTube. `getTranscript()` is
deliberately lenient -- any failure (no texttracks, fetch error, empty parsed text)
returns `null` rather than throwing, since a missing transcript shouldn't fail the
whole import when metadata succeeded.
