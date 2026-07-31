import { createHash } from "node:crypto";
import type {
  ExternalResourceSource,
  NormalizedExternalResource,
  ProviderValidationResult,
} from "@ruach/shared-types";
import type { ResourceProvider } from "./ResourceProvider";
import { assertSafeUrl, safeFetch, UnsafeUrlError } from "./ssrf-guard";

function stableExternalId(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 24);
}

function extractMetaContent(html: string, property: string): string | null {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
    "i",
  );
  const match = html.match(pattern) ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`, "i"));
  return match ? match[1] ?? null : null;
}

function extractTitleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? (match[1]?.trim() ?? null) : null;
}

function detectResourceType(contentType: string | null): NormalizedExternalResource["resourceType"] {
  if (!contentType) return "OTHER";
  if (contentType.includes("application/pdf")) return "DOCUMENT";
  if (contentType.includes("text/html")) return "ARTICLE";
  return "OTHER";
}

/**
 * Retrieves public Open Graph metadata for a subscriber-supplied URL (brief §17).
 * Uses only regex-based extraction of <meta> tags — no HTML is executed or rendered,
 * and the fetch itself goes through safeFetch's SSRF guardrails (brief §23). Unknown
 * providers are never auto-embedded (brief §17 requirement): embedUrl is always null.
 */
export class GenericUrlProvider implements ResourceProvider {
  async validateUrl(url: string): Promise<ProviderValidationResult> {
    try {
      const safeUrl = await assertSafeUrl(url);
      return { valid: true, provider: "GENERIC_URL", externalId: stableExternalId(safeUrl.toString()), reason: null };
    } catch (err) {
      const reason = err instanceof UnsafeUrlError ? err.message : "Invalid URL.";
      return { valid: false, provider: null, externalId: null, reason };
    }
  }

  async getResource(source: ExternalResourceSource): Promise<NormalizedExternalResource> {
    const result = await safeFetch(source.url);
    const isHtml = result.contentType?.includes("text/html") ?? false;

    const title = isHtml ? extractMetaContent(result.body, "og:title") ?? extractTitleTag(result.body) : null;
    const description = isHtml ? extractMetaContent(result.body, "og:description") : null;
    const image = isHtml ? extractMetaContent(result.body, "og:image") : null;

    return {
      sourceProvider: "GENERIC_URL",
      externalId: stableExternalId(result.finalUrl),
      resourceType: detectResourceType(result.contentType),
      title: title ?? source.url,
      description,
      creatorName: null,
      publishedAt: null,
      durationSeconds: null,
      thumbnailUrl: image,
      publicUrl: result.finalUrl,
      // Unknown providers must never be auto-embedded (brief §17) -- generic URLs
      // always open externally.
      embedUrl: null,
      captionsAvailable: false,
    };
  }
}
