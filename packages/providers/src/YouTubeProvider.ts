import type {
  ExternalResourceSource,
  NormalizedExternalResource,
  ProviderValidationResult,
  TranscriptResult,
} from "@ruach/shared-types";
import type { ProviderConfiguration, ResourceProvider } from "./ResourceProvider";
import type { YouTubeChannelRef } from "./url-parsing";
import { parseYouTubeChannelUrl, parseYouTubeUrl } from "./url-parsing";

const API_BASE = "https://www.googleapis.com/youtube/v3";
const PLAYLIST_PAGE_SIZE = 50;
const VIDEO_BATCH_SIZE = 50;

/** Parses ISO 8601 durations as returned by contentDetails.duration, e.g. "PT15M33S". */
function parseIso8601Duration(duration: string): number | null {
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return null;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}

interface YouTubeVideoItem {
  id?: string;
  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: Record<string, { url?: string }>;
  };
  contentDetails?: { duration?: string; caption?: string };
}

interface YouTubePlaylistItem {
  contentDetails?: { videoId?: string };
}

interface YouTubeChannelItem {
  contentDetails?: { relatedPlaylists?: { uploads?: string } };
}

async function fetchJson<T>(url: URL): Promise<T> {
  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`YouTube Data API request failed (${res.status}): ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

function normalizeVideoItem(item: YouTubeVideoItem, externalId: string): NormalizedExternalResource {
  const thumbnail =
    item.snippet?.thumbnails?.maxres?.url ??
    item.snippet?.thumbnails?.standard?.url ??
    item.snippet?.thumbnails?.high?.url ??
    item.snippet?.thumbnails?.medium?.url ??
    item.snippet?.thumbnails?.default?.url ??
    null;

  return {
    sourceProvider: "YOUTUBE",
    externalId,
    resourceType: "VIDEO",
    title: item.snippet?.title ?? `YouTube video ${externalId}`,
    description: item.snippet?.description ?? null,
    creatorName: item.snippet?.channelTitle ?? null,
    publishedAt: item.snippet?.publishedAt ? new Date(item.snippet.publishedAt) : null,
    durationSeconds: item.contentDetails?.duration ? parseIso8601Duration(item.contentDetails.duration) : null,
    thumbnailUrl: thumbnail,
    publicUrl: `https://www.youtube.com/watch?v=${externalId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${externalId}`,
    captionsAvailable: item.contentDetails?.caption === "true",
  };
}

/**
 * Real YouTube Data API v3 metadata provider. Deliberately metadata-only: the
 * official captions.download endpoint only works with OAuth authorization from the
 * video's own channel owner (brief §14) -- there is no officially sanctioned way to
 * fetch a transcript for a video the subscriber doesn't own, and this codebase
 * doesn't rely on undocumented scraping endpoints for core functionality (brief
 * instruction "do not rely on brittle scraping"). getTranscript() always returns
 * null here; subscribers paste a transcript manually for better categorization, or a
 * future OAuth "connect your channel" flow can add real caption access for owned
 * videos. See docs/youtube-integration.md.
 */
export class YouTubeProvider implements ResourceProvider {
  constructor(private readonly apiKey: string) {}

  async validateUrl(url: string): Promise<ProviderValidationResult> {
    const videoId = parseYouTubeUrl(url);
    if (!videoId) {
      return { valid: false, provider: null, externalId: null, reason: "Not a recognized YouTube URL." };
    }
    return { valid: true, provider: "YOUTUBE", externalId: videoId, reason: null };
  }

  async getResource(source: ExternalResourceSource): Promise<NormalizedExternalResource> {
    const url = new URL(`${API_BASE}/videos`);
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("id", source.externalId);
    url.searchParams.set("key", this.apiKey);

    const data = await fetchJson<{ items?: YouTubeVideoItem[] }>(url);
    const item = data.items?.[0];
    if (!item) {
      throw new Error(`YouTube video ${source.externalId} was not found, is private, or has been removed.`);
    }
    return normalizeVideoItem(item, source.externalId);
  }

  async getTranscript(_source: ExternalResourceSource): Promise<TranscriptResult | null> {
    return null;
  }

  /**
   * Bulk channel import (no OAuth required -- listing a public channel's uploads is
   * public data, unlike caption access). Resolves the channel's uploads playlist,
   * pages through it via playlistItems.list (50/page), then fetches full metadata in
   * batches of 50 IDs via videos.list to minimize quota usage: for an N-video
   * channel this costs roughly N/25 quota units total, well within the free 10,000/
   * day tier even for large channels.
   */
  async listResources(configuration: ProviderConfiguration): Promise<NormalizedExternalResource[]> {
    if (!configuration.channelUrl) {
      throw new Error("listResources requires a channelUrl.");
    }
    const channelRef = parseYouTubeChannelUrl(configuration.channelUrl);
    if (!channelRef) {
      throw new Error(
        `"${configuration.channelUrl}" doesn't look like a YouTube channel URL. Expected a /channel/UC..., ` +
          "/@handle, /c/..., or /user/... URL.",
      );
    }

    const uploadsPlaylistId = await this.resolveUploadsPlaylistId(channelRef);
    const videoIds = await this.collectPlaylistVideoIds(uploadsPlaylistId);

    const results: NormalizedExternalResource[] = [];
    for (let i = 0; i < videoIds.length; i += VIDEO_BATCH_SIZE) {
      const batch = videoIds.slice(i, i + VIDEO_BATCH_SIZE);
      const url = new URL(`${API_BASE}/videos`);
      url.searchParams.set("part", "snippet,contentDetails");
      url.searchParams.set("id", batch.join(","));
      url.searchParams.set("key", this.apiKey);

      const data = await fetchJson<{ items?: YouTubeVideoItem[] }>(url);
      for (const item of data.items ?? []) {
        if (item.id) results.push(normalizeVideoItem(item, item.id));
      }
    }
    return results;
  }

  private async resolveUploadsPlaylistId(channelRef: YouTubeChannelRef): Promise<string> {
    const url = new URL(`${API_BASE}/channels`);
    url.searchParams.set("part", "contentDetails");
    url.searchParams.set("key", this.apiKey);
    if (channelRef.type === "id") url.searchParams.set("id", channelRef.value);
    else if (channelRef.type === "handle") url.searchParams.set("forHandle", channelRef.value);
    else url.searchParams.set("forUsername", channelRef.value);

    const data = await fetchJson<{ items?: YouTubeChannelItem[] }>(url);
    const uploadsId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsId) {
      throw new Error(
        `Could not find a YouTube channel for "${channelRef.value}". Try the channel's /channel/UC... URL ` +
          "instead (Channel page -> About -> Share channel -> Copy channel ID).",
      );
    }
    return uploadsId;
  }

  private async collectPlaylistVideoIds(playlistId: string): Promise<string[]> {
    const ids: string[] = [];
    let pageToken: string | undefined;

    do {
      const url = new URL(`${API_BASE}/playlistItems`);
      url.searchParams.set("part", "contentDetails");
      url.searchParams.set("playlistId", playlistId);
      url.searchParams.set("maxResults", String(PLAYLIST_PAGE_SIZE));
      url.searchParams.set("key", this.apiKey);
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const data = await fetchJson<{ items?: YouTubePlaylistItem[]; nextPageToken?: string }>(url);
      for (const item of data.items ?? []) {
        if (item.contentDetails?.videoId) ids.push(item.contentDetails.videoId);
      }
      pageToken = data.nextPageToken;
    } while (pageToken);

    return ids;
  }
}
