import { createHash } from "node:crypto";
import type {
  ExternalResourceSource,
  NormalizedExternalResource,
  ProviderValidationResult,
  TranscriptResult,
} from "@ruach/shared-types";
import type { ResourceProvider } from "./ResourceProvider";
import { extractReadableText } from "./html-text";
import { assertSafeUrl, safeFetch, UnsafeUrlError } from "./ssrf-guard";

/**
 * Below this, the page almost certainly didn't have real substance to extract
 * (a nav-only landing page, a JS-rendered app shell this regex-only extractor can't
 * see into, an error page) -- returning it anyway would let a near-empty transcript
 * outrank the og:description-only METADATA_ONLY path for no benefit, and CategorizationService
 * would be summarizing noise. Chosen well below a real short page (a one-paragraph
 * "About us" is easily 400+ characters) rather than tuned to any specific site.
 */
const MIN_MEANINGFUL_TEXT_LENGTH = 200;

function stableExternalId(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 24);
}

function extractMetaContent(html: string, property: string): string | null {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
    "i",
  );
  const match =
    html.match(pattern) ??
    html.match(
      new RegExp(
        `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`,
        "i",
      ),
    );
  return match ? (match[1] ?? null) : null;
}

function extractTitleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? (match[1]?.trim() ?? null) : null;
}

function detectResourceType(
  contentType: string | null,
): NormalizedExternalResource["resourceType"] {
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
  /**
   * import-service.ts calls getResource() then getTranscript() back-to-back on the
   * same provider instance for a single-URL import -- without this, that meant two
   * full fetches of the identical page a few lines apart, doubling outbound
   * requests/latency for every import and risking a second-request rate-limit or
   * bot-challenge response on sites that watch for exactly that pattern. Scoped to
   * one URL (not a general cache) since a single provider instance is only ever
   * used for one import in practice; a mismatched URL just falls through to a
   * fresh fetch, so this is purely an optimization, never a correctness dependency.
   */
  #lastFetch: { url: string; body: string; contentType: string | null } | null =
    null;

  async validateUrl(url: string): Promise<ProviderValidationResult> {
    try {
      const safeUrl = await assertSafeUrl(url);
      return {
        valid: true,
        provider: "GENERIC_URL",
        externalId: stableExternalId(safeUrl.toString()),
        reason: null,
      };
    } catch (err) {
      const reason =
        err instanceof UnsafeUrlError ? err.message : "Invalid URL.";
      return { valid: false, provider: null, externalId: null, reason };
    }
  }

  async getResource(
    source: ExternalResourceSource,
  ): Promise<NormalizedExternalResource> {
    const result = await safeFetch(source.url);
    this.#lastFetch = {
      url: source.url,
      body: result.body,
      contentType: result.contentType,
    };
    const isHtml = result.contentType?.includes("text/html") ?? false;

    const title = isHtml
      ? (extractMetaContent(result.body, "og:title") ??
        extractTitleTag(result.body))
      : null;
    const description = isHtml
      ? extractMetaContent(result.body, "og:description")
      : null;
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

  /**
   * The actual substance of a generic page -- previously never captured at all:
   * getResource() above only pulls og:title/og:description (a one-line SEO blurb),
   * so an imported "About Us" or "Service Times" page had nothing beyond that for
   * the assistant to answer from. extractReadableText (html-text.ts) already existed
   * for exactly this job but was never wired into the import path.
   *
   * Reuses #lastFetch when import-service.ts called getResource() moments earlier
   * on this same instance (the normal path) -- otherwise falls back to a fresh
   * fetch, since the interface allows getTranscript to be called on its own.
   * Failure here degrades to null (skip the transcript, the resource itself is
   * already created from getResource()'s metadata) rather than throwing -- a
   * transient fetch failure on an otherwise-successful import shouldn't fail the
   * whole thing.
   */
  async getTranscript(
    source: ExternalResourceSource,
  ): Promise<TranscriptResult | null> {
    try {
      const result =
        this.#lastFetch?.url === source.url
          ? this.#lastFetch
          : { ...(await safeFetch(source.url)) };
      const isHtml = result.contentType?.includes("text/html") ?? false;
      if (!isHtml) return null;

      const text = extractReadableText(result.body);
      if (text.length < MIN_MEANINGFUL_TEXT_LENGTH) return null;

      return { text, source: "EXTRACTED_PAGE_TEXT", language: null };
    } catch {
      return null;
    }
  }
}
