import type {
  ExternalResourceSource,
  NormalizedExternalResource,
  ProviderValidationResult,
  TranscriptResult,
} from "@ruach/shared-types";
import type { ResourceProvider } from "./ResourceProvider";
import { parseVttToText } from "./vtt";
import { parseVimeoUrl } from "./url-parsing";

const API_BASE = "https://api.vimeo.com";
const ACCEPT_HEADER = "application/vnd.vimeo.*+json;version=3.4";

interface VimeoVideoResponse {
  name?: string;
  description?: string | null;
  link?: string;
  duration?: number;
  release_time?: string;
  created_time?: string;
  user?: { name?: string };
  pictures?: { sizes?: Array<{ width: number; link: string }> };
  privacy?: { embed?: string };
}

interface VimeoTextTrack {
  type?: string;
  language?: string;
  link?: string;
  active?: boolean;
}

/**
 * Real Vimeo API provider. Unlike YouTube, Vimeo's texttracks endpoint officially
 * supports fetching a video's caption/subtitle file for any video the access token
 * can see (no ownership/OAuth-consent gate for public videos) -- so real transcript
 * fetching is implemented here, not deferred. Respects Vimeo's embed privacy setting
 * (brief §15): embedUrl is only populated when the video's privacy.embed is "public".
 */
export class VimeoProvider implements ResourceProvider {
  constructor(private readonly accessToken: string) {}

  private authHeaders() {
    return { Authorization: `Bearer ${this.accessToken}`, Accept: ACCEPT_HEADER };
  }

  async validateUrl(url: string): Promise<ProviderValidationResult> {
    const videoId = parseVimeoUrl(url);
    if (!videoId) {
      return { valid: false, provider: null, externalId: null, reason: "Not a recognized Vimeo URL." };
    }
    return { valid: true, provider: "VIMEO", externalId: videoId, reason: null };
  }

  async getResource(source: ExternalResourceSource): Promise<NormalizedExternalResource> {
    const res = await fetch(`${API_BASE}/videos/${encodeURIComponent(source.externalId)}`, {
      headers: this.authHeaders(),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Vimeo API request failed (${res.status}): ${body.slice(0, 200)}`);
    }

    const data = (await res.json()) as VimeoVideoResponse;

    const thumbnail = data.pictures?.sizes?.length
      ? data.pictures.sizes.reduce((best, size) => (size.width > (best?.width ?? 0) ? size : best)).link
      : null;

    const canEmbed = data.privacy?.embed === "public";
    const publishedAt = data.release_time ?? data.created_time;

    return {
      sourceProvider: "VIMEO",
      externalId: source.externalId,
      resourceType: "VIDEO",
      title: data.name ?? `Vimeo video ${source.externalId}`,
      description: data.description ?? null,
      creatorName: data.user?.name ?? null,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      durationSeconds: data.duration ?? null,
      thumbnailUrl: thumbnail,
      publicUrl: data.link ?? `https://vimeo.com/${source.externalId}`,
      embedUrl: canEmbed ? `https://player.vimeo.com/video/${source.externalId}` : null,
      captionsAvailable: false,
    };
  }

  async getTranscript(source: ExternalResourceSource): Promise<TranscriptResult | null> {
    const res = await fetch(`${API_BASE}/videos/${encodeURIComponent(source.externalId)}/texttracks`, {
      headers: this.authHeaders(),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { data?: VimeoTextTrack[] };
    const tracks = data.data ?? [];
    if (tracks.length === 0) return null;

    const track =
      tracks.find((t) => t.active && (t.type === "captions" || t.type === "subtitles") && t.language?.startsWith("en")) ??
      tracks.find((t) => t.active) ??
      tracks[0];

    if (!track?.link) return null;

    const trackRes = await fetch(track.link);
    if (!trackRes.ok) return null;

    const vttText = await trackRes.text();
    const text = parseVttToText(vttText);
    if (!text) return null;

    return { text, source: "PROVIDER_CAPTIONS", language: track.language ?? null };
  }
}
