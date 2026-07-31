import type { ResourceProviderTypeValue } from "@ruach/shared-types";
import { GenericUrlProvider } from "./GenericUrlProvider";
import { ManualResourceProvider } from "./ManualResourceProvider";
import { MockVimeoProvider } from "./MockVimeoProvider";
import { MockYouTubeProvider } from "./MockYouTubeProvider";
import type { ResourceProvider } from "./ResourceProvider";
import { parseVimeoUrl, parseYouTubeUrl } from "./url-parsing";

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
 * Provider factory. All providers are mocks in milestone 1 (brief §57: the repository
 * must run without production credentials). Live adapters (real YouTube Data API,
 * real Vimeo API) get added here later, gated behind their respective env vars, without
 * changing any caller — that's the point of the ResourceProvider interface.
 */
export function getResourceProvider(provider: ResourceProviderTypeValue): ResourceProvider {
  switch (provider) {
    case "YOUTUBE":
      return new MockYouTubeProvider();
    case "VIMEO":
      return new MockVimeoProvider();
    case "GENERIC_URL":
      return new GenericUrlProvider();
    case "MANUAL":
      return new ManualResourceProvider();
    case "SUBSPLASH":
      throw new Error(
        "Subsplash has no public documented API (brief §16) -- scaffold only. Use manual import instead.",
      );
    default:
      throw new Error(`Unknown provider: ${provider satisfies never}`);
  }
}
