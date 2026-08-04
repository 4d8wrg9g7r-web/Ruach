import Parser from "rss-parser";
import type {
  ExternalResourceSource,
  NormalizedExternalResource,
  ProviderValidationResult,
} from "@ruach/shared-types";
import type { ProviderConfiguration, ResourceProvider } from "./ResourceProvider";
import { assertSafeUrl, safeFetch, UnsafeUrlError } from "./ssrf-guard";

interface ItunesItemFields {
  "itunes:duration"?: string;
  "itunes:image"?: { $?: { href?: string } } | string;
}

type FeedItem = Parser.Item & ItunesItemFields;

// itunes:duration and itunes:image aren't part of rss-parser's default Item shape --
// they need to be requested explicitly as custom fields to be picked up.
const parser = new Parser<Record<string, unknown>, ItunesItemFields>({
  customFields: { item: ["itunes:duration", "itunes:image"] },
});

/** itunes:duration is either plain seconds ("125") or HH:MM:SS / MM:SS. */
function parseItunesDuration(value: string | undefined): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  const parts = trimmed.split(":").map(Number);
  if (parts.length < 2 || parts.length > 3 || parts.some((p) => Number.isNaN(p))) return null;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function itunesImageUrl(field: ItunesItemFields["itunes:image"]): string | null {
  if (!field) return null;
  return typeof field === "string" ? field : (field.$?.href ?? null);
}

/**
 * Regex-based, not a real HTML parser -- feed content is untrusted, and we only need
 * plain text for search indexing and AI categorization, not a rendered DOM. No script
 * execution risk since this text is never rendered as HTML anywhere downstream (the
 * widget renders resource text as plain React children, which auto-escapes it).
 */
function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  const text = html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#0?160;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    // Any other numeric entity (&#8217; curly apostrophes, &#8220;/&#8221; curly
    // quotes, etc. are extremely common in blog/podcast feed content) -- decode via
    // the actual code point rather than trying to special-case each one.
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/\s+/g, " ")
    .trim();
  return text || null;
}

function isPodcastFeed(feed: { itunes?: unknown; items: FeedItem[] }): boolean {
  if (feed.itunes) return true;
  return feed.items.some((item) => item.enclosure?.type?.startsWith("audio"));
}

function externalIdFor(item: FeedItem, index: number): string {
  return item.guid || item.link || `item-${index}`;
}

function normalizeItem(
  item: FeedItem,
  index: number,
  isPodcast: boolean,
  feedImageUrl: string | null,
  feedAuthor: string | null,
): NormalizedExternalResource {
  const rawText = item.content ?? item.summary ?? item.contentSnippet ?? null;
  const publishedAt = item.isoDate ?? item.pubDate;

  return {
    sourceProvider: "RSS",
    externalId: externalIdFor(item, index),
    resourceType: isPodcast ? "PODCAST" : "ARTICLE",
    title: item.title ?? `Untitled ${isPodcast ? "episode" : "post"}`,
    description: stripHtml(rawText),
    creatorName: item.creator ?? feedAuthor ?? null,
    publishedAt: publishedAt ? new Date(publishedAt) : null,
    durationSeconds: parseItunesDuration(item["itunes:duration"]),
    thumbnailUrl: itunesImageUrl(item["itunes:image"]) ?? feedImageUrl,
    publicUrl: item.link ?? item.enclosure?.url ?? "",
    embedUrl: null,
    captionsAvailable: false,
  };
}

/**
 * RSS/Atom feed provider for blogs and podcasts (brief §13's anticipated future
 * RSSProvider). Unlike YouTube/Vimeo, this needs no API key or credentials at all --
 * a feed URL is just a public document -- so there's no mock/real split; this is
 * always the active implementation. The feed itself is fetched through safeFetch
 * (packages/providers/src/ssrf-guard.ts), the same SSRF-guarded fetcher
 * GenericUrlProvider uses, since a subscriber-pasted feed URL is untrusted input.
 *
 * Podcast episodes get their description from itunes show notes/summary (not audio
 * transcription -- out of scope, matching the same boundary as YouTube). Blog posts
 * get their full article body (content:encoded, HTML-stripped) as description, which
 * is real, substantive text for AI categorization -- richer than a metadata-only
 * YouTube import.
 */
export class RSSProvider implements ResourceProvider {
  async validateUrl(url: string): Promise<ProviderValidationResult> {
    try {
      const safeUrl = await assertSafeUrl(url);
      return { valid: true, provider: "RSS", externalId: safeUrl.toString(), reason: null };
    } catch (err) {
      const reason = err instanceof UnsafeUrlError ? err.message : "Invalid URL.";
      return { valid: false, provider: null, externalId: null, reason };
    }
  }

  private async fetchFeed(feedUrl: string) {
    const result = await safeFetch(feedUrl);
    return parser.parseString(result.body);
  }

  /**
   * RSS has no per-item fetch endpoint -- resolving a single entry means re-fetching
   * and re-parsing the whole feed and finding the matching one by externalId. In
   * practice, RSS import always goes through listResources() (the dashboard's bulk
   * "Import an RSS feed" panel); this exists for ResourceProvider interface
   * completeness.
   */
  async getResource(source: ExternalResourceSource): Promise<NormalizedExternalResource> {
    const feed = await this.fetchFeed(source.url);
    const isPodcast = isPodcastFeed(feed);
    const items = feed.items as FeedItem[];
    const index = items.findIndex((item, i) => externalIdFor(item, i) === source.externalId);
    if (index === -1) {
      throw new Error(`Feed item ${source.externalId} was not found in this feed.`);
    }
    const normalized = normalizeItem(items[index]!, index, isPodcast, feed.image?.url ?? null, feed.itunes?.author ?? null);
    if (!normalized.publicUrl) {
      throw new Error("This feed item has no usable link.");
    }
    return normalized;
  }

  async listResources(configuration: ProviderConfiguration): Promise<NormalizedExternalResource[]> {
    if (!configuration.feedUrl) {
      throw new Error("listResources requires a feedUrl.");
    }
    const feed = await this.fetchFeed(configuration.feedUrl);
    const isPodcast = isPodcastFeed(feed);
    const items = feed.items as FeedItem[];

    const results: NormalizedExternalResource[] = [];
    items.forEach((item, index) => {
      const normalized = normalizeItem(item, index, isPodcast, feed.image?.url ?? null, feed.itunes?.author ?? null);
      // Skip entries with no usable link rather than failing the whole import --
      // malformed individual feed items shouldn't block everything else.
      if (normalized.publicUrl) results.push(normalized);
    });
    return results;
  }
}
