import type {
  DiscoveredDocument,
  ExternalResourceSource,
  NormalizedExternalResource,
  ProviderValidationResult,
  TranscriptResult,
} from "@ruach/shared-types";

export interface ProviderConfiguration {
  organizationId: string;
  /** Present once a subscriber has connected an account (brief §14/§15 OAuth flows). Unused by mocks. */
  connectionId?: string;
  /** A pasted channel URL, for providers that support bulk channel import (currently: YouTube). */
  channelUrl?: string;
  /** A pasted RSS/Atom feed URL, for RSSProvider's bulk import. */
  feedUrl?: string;
}

/**
 * The provider abstraction (brief §13). Provider-specific logic (YouTube quota handling,
 * Vimeo privacy settings, etc.) must stay inside each provider's implementation file —
 * nothing provider-specific may leak into the import service, categorization service, or
 * dashboard UI, which only ever see NormalizedExternalResource.
 */
export interface ResourceProvider {
  validateUrl(url: string): Promise<ProviderValidationResult>;
  getResource(source: ExternalResourceSource): Promise<NormalizedExternalResource>;
  listResources?(configuration: ProviderConfiguration): Promise<NormalizedExternalResource[]>;
  getResourcesUpdatedSince?(
    configuration: ProviderConfiguration,
    date: Date,
  ): Promise<NormalizedExternalResource[]>;
  getTranscript?(source: ExternalResourceSource): Promise<TranscriptResult | null>;
  getSupportingDocuments?(source: ExternalResourceSource): Promise<DiscoveredDocument[]>;
}
