/**
 * Minimal WebVTT -> plain text converter for provider-supplied caption tracks
 * (currently: Vimeo's texttracks endpoint). Strips the WEBVTT header, NOTE blocks,
 * numeric cue identifiers, timing lines, and inline timing tags, keeping only the
 * spoken text. Not a full VTT parser (no styling/positioning support) -- this is
 * intentionally simple since we only need plain text for search indexing and AI
 * categorization, not a rendered caption track.
 */
export function parseVttToText(vtt: string): string {
  const lines = vtt.replace(/\r\n/g, "\n").split("\n");
  const kept: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^WEBVTT/i.test(line)) continue;
    if (/^NOTE/i.test(line)) continue;
    if (/-->/.test(line)) continue;
    if (/^\d+$/.test(line)) continue;

    const withoutTags = line.replace(/<[^>]+>/g, "").trim();
    if (!withoutTags) continue;

    if (kept[kept.length - 1] !== withoutTags) {
      kept.push(withoutTags);
    }
  }

  return kept.join(" ").replace(/\s+/g, " ").trim();
}
