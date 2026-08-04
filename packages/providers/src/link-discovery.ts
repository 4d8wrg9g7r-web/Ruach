const URL_PATTERN = /https?:\/\/[^\s<>"')\]]+/gi;

// Known non-content domains a video/episode description commonly links to: social
// platforms, giving/donation pages, app stores, and the video platform's own domain
// (self-referential "watch more" links). This is a best-effort denylist, not a
// guarantee -- the point of the staff approval step in the review UI is to catch
// what this heuristic misses, not to be exhaustive (brief §22-23).
const EXCLUDED_HOSTNAME_PATTERNS: RegExp[] = [
  /(^|\.)facebook\.com$/i,
  /(^|\.)fb\.watch$/i,
  /(^|\.)instagram\.com$/i,
  /(^|\.)twitter\.com$/i,
  /(^|\.)x\.com$/i,
  /(^|\.)tiktok\.com$/i,
  /(^|\.)linkedin\.com$/i,
  /(^|\.)threads\.net$/i,
  /(^|\.)youtube\.com$/i,
  /(^|\.)youtu\.be$/i,
  /(^|\.)vimeo\.com$/i,
  /(^|\.)apps\.apple\.com$/i,
  /(^|\.)play\.google\.com$/i,
  /(^|\.)spotify\.com$/i,
  /(^|\.)music\.apple\.com$/i,
  /(^|\.)patreon\.com$/i,
  /(^|\.)paypal\.com$/i,
  /(^|\.)venmo\.com$/i,
  /(^|\.)cash\.app$/i,
  /(^|\.)pushpay\.com$/i,
  /(^|\.)tithe\.ly$/i,
  /(^|\.)amazon\.com$/i,
];

function isLikelyContentLink(url: URL): boolean {
  return !EXCLUDED_HOSTNAME_PATTERNS.some((pattern) => pattern.test(url.hostname));
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "in", "on", "at", "to", "for", "with",
  "is", "are", "this", "that", "from", "by", "as", "it", "be", "will", "we", "our",
  "your", "you", "part", "episode", "week", "sermon", "message", "video",
]);

function significantWords(text: string): Set<string> {
  const words = text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
  return new Set(words.filter((w) => w.length > 2 && !STOPWORDS.has(w)));
}

/** Count of title words that also appear in the text surrounding a candidate link (its line in the description) -- a cheap relevance signal with no extra network I/O. */
function relevanceScore(contextText: string, titleWords: Set<string>): number {
  if (titleWords.size === 0) return 0;
  let score = 0;
  for (const word of significantWords(contextText)) {
    if (titleWords.has(word)) score += 1;
  }
  return score;
}

/**
 * Best-effort extraction of candidate "supporting document" links (sermon notes,
 * study guides, articles) from free-form description text -- e.g. a YouTube video's
 * or podcast episode's description. Filters out known non-content domains (social
 * platforms, giving/donation pages, app stores, self-referential video-platform
 * links), but this is a heuristic, not a guarantee: discovered links still require
 * explicit staff approval before their content is ever fetched or fed into AI
 * categorization (brief §22-23) -- see resource-service.ts's addSourceDocument,
 * which stores these as `includedInAnalysis: false` until approved.
 *
 * When a title is given, candidates are ranked by how many of the title's
 * significant words appear in the text surrounding each link (its line in the
 * description) before the maxLinks cap is applied -- e.g. a title like "Hope in
 * Hard Seasons" ranks a line reading "Notes for this week's message on hope:
 * <link>" above an unrelated "<link>" with no shared words. This is a ranking
 * signal only, never a hard exclusion: a link with zero word overlap can still be
 * the right one, and imprecise text matching should never silently hide a
 * genuinely relevant link from the human reviewer.
 */
export function extractCandidateLinks(description: string | null | undefined, title?: string | null, maxLinks = 5): string[] {
  if (!description) return [];
  const titleWords = significantWords(title ?? "");
  const lines = description.split(/\r?\n/);
  const seen = new Set<string>();
  const candidates: { url: string; score: number }[] = [];

  for (const line of lines) {
    const matches = line.match(URL_PATTERN) ?? [];
    for (const raw of matches) {
      // Strip trailing punctuation the greedy match tends to sweep up (e.g. a URL at
      // the end of a sentence: "notes here: https://example.com/notes.").
      const cleaned = raw.replace(/[.,;:!?]+$/, "");
      let url: URL;
      try {
        url = new URL(cleaned);
      } catch {
        continue;
      }
      if (url.protocol !== "https:") continue;
      if (!isLikelyContentLink(url)) continue;

      const key = url.toString();
      if (seen.has(key)) continue;
      seen.add(key);
      candidates.push({ url: key, score: relevanceScore(line, titleWords) });
    }
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, maxLinks)
    .map((c) => c.url);
}
