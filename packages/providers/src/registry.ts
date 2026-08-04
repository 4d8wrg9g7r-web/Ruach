import type { ResourceProviderTypeValue } from "@ruach/shared-types";
import { GenericUrlProvider } from "./GenericUrlProvider";
import { ManualResourceProvider } from "./ManualResourceProvider";
import { MockVimeoProvider } from "./MockVimeoProvider";
import { MockYouTubeProvider } from "./MockYouTubeProvider";
import type { ResourceProvider } from "./ResourceProvider";
import { RSSProvider } from "./RSSProvider";
import { parseVimeoUrl, parseYouTubeUrl } from "./url-parsing";
import { VimeoProvider } from "./VimeoProvider";
import { YouTubeProvider } from "./YouTubeProvider";

/**
 * Detects the provider and external ID for a pasted URL, trying the specific
 * providers first and falling back to GenericUrlProvider (brief §17 step 2).
 */
export function detectProviderFromUrl(url: string): { provider: ResourceProviderTypeValue; externalId: string } | null {
  const youtubeId = parseYouTubeUrl(url);
  if (youtubeId) return { provider: "YOUTUBE", externalId: youtubeId };

  const vimeoId = parseVimeoUrl(url);
  if (vimeoId) return { provider: "VIMEO", externalId: vimeoId };

  try {
    new URL(url);
    return null; // caller falls back to GenericUrlProvider, which computes its own externalId
  } catch {
    return null;
  }
}

/**
 * Provider factory. Real adapters activate only when their env var is set
 * (YOUTUBE_API_KEY / VIMEO_ACCESS_TOKEN) -- otherwise the mock is used, so the
 * repository still runs without production credentials (brief §57). Callers never
 * know or care which one they got, since both implement ResourceProvider identically.
 */
export function getResourceProvider(provider: ResourceProviderTypeValue): ResourceProvider {
  switch (provider) {
    case "YOUTUBE": {
      const apiKey = process.env.YOUTUBE_API_KEY;
      return apiKey ? new YouTubeProvider(apiKey) : new MockYouTubeProvider();
    }
    case "VIMEO": {
      const accessToken = process.env.VIMEO_ACCESS_TOKEN;
      return accessToken ? new VimeoProvider(accessToken) : new MockVimeoProvider();
    }
    case "GENERIC_URL":
      return new GenericUrlProvider();
    case "MANUAL":
      return new ManualResourceProvider();
    case "RSS":
      return new RSSProvider();
    case "SUBSPLASH":
      throw new Error(
        "Subsplash has no public documented API (brief §16) -- scaffold only. Use manual import instead.",
      );
    default:
      throw new Error(`Unknown provider: ${provider satisfies never}`);
  }
}
