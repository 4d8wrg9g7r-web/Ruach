const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{6,}$/;
const VIMEO_ID_PATTERN = /^\d+$/;

/** Supports watch?v=, youtu.be/, /embed/, /shorts/ (brief §14). Returns null if not YouTube or unparseable. */
export function parseYouTubeUrl(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v");
      return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }
    const embedMatch = url.pathname.match(/^\/embed\/([a-zA-Z0-9_-]+)/);
    if (embedMatch) return embedMatch[1] ?? null;
    const shortsMatch = url.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) return shortsMatch[1] ?? null;
  }

  return null;
}

export type YouTubeChannelRef = { type: "id"; value: string } | { type: "handle"; value: string } | { type: "username"; value: string };

/**
 * Supports /channel/UCxxxx (direct ID) and /@handle (current format) -- these cover
 * the vast majority of real-world channel links. Legacy /c/CustomName and
 * /user/LegacyName URLs are attempted via the API's forUsername lookup on a
 * best-effort basis (works for true legacy usernames, not custom /c/ vanity URLs,
 * which have no reliable direct API lookup) -- if that fails, the caller's error
 * message points the subscriber at the channel's /channel/UC... URL instead.
 */
export function parseYouTubeChannelUrl(rawUrl: string): YouTubeChannelRef | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (host !== "youtube.com" && host !== "m.youtube.com") return null;

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  if (segments[0] === "channel" && segments[1]) {
    return { type: "id", value: segments[1] };
  }
  if (segments[0]?.startsWith("@")) {
    return { type: "handle", value: segments[0] };
  }
  if ((segments[0] === "c" || segments[0] === "user") && segments[1]) {
    return { type: "username", value: segments[1] };
  }

  return null;
}

/** Supports vimeo.com/ID and player.vimeo.com/video/ID (brief §15). Returns null if not Vimeo or unparseable. */
export function parseVimeoUrl(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "player.vimeo.com") {
    const match = url.pathname.match(/^\/video\/(\d+)/);
    return match ? (match[1] as string) : null;
  }

  if (host === "vimeo.com") {
    const segment = url.pathname.split("/").filter(Boolean)[0];
    return segment && VIMEO_ID_PATTERN.test(segment) ? segment : null;
  }

  return null;
}
