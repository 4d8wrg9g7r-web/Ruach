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
