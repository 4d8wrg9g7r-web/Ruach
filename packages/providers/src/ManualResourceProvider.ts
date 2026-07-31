import type {
  ExternalResourceSource,
  NormalizedExternalResource,
  ProviderValidationResult,
} from "@ruach/shared-types";
import type { ResourceProvider } from "./ResourceProvider";

/**
 * Manual entries are filled in directly by the subscriber through a form (title,
 * speaker, transcript, etc.) — there is nothing to fetch. In practice the import
 * service builds the NormalizedExternalResource straight from form input and never
 * calls getResource() here; this class exists so ManualResourceProvider participates
 * in the same ResourceProvider registry as the fetch-based providers (brief §13).
 */
export class ManualResourceProvider implements ResourceProvider {
  async validateUrl(url: string): Promise<ProviderValidationResult> {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") {
        return { valid: false, provider: null, externalId: null, reason: "Only HTTPS URLs are allowed." };
      }
      return { valid: true, provider: "MANUAL", externalId: null, reason: null };
    } catch {
      return { valid: false, provider: null, externalId: null, reason: "Not a valid URL." };
    }
  }

  async getResource(source: ExternalResourceSource): Promise<NormalizedExternalResource> {
    return {
      sourceProvider: "MANUAL",
      externalId: source.externalId,
      resourceType: "OTHER",
      title: "Untitled manual resource",
      description: null,
      creatorName: null,
      publishedAt: null,
      durationSeconds: null,
      thumbnailUrl: null,
      publicUrl: source.url,
      embedUrl: null,
      captionsAvailable: false,
    };
  }
}
