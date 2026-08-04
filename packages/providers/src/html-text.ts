const ENTITY_REPLACEMENTS: [RegExp, string][] = [
  [/&nbsp;/gi, " "],
  [/&amp;/gi, "&"],
  [/&lt;/gi, "<"],
  [/&gt;/gi, ">"],
  [/&quot;/gi, '"'],
  [/&#0*39;|&#x0*27;|&apos;/gi, "'"],
];

/**
 * Strips an HTML document down to its visible text -- regex-based only, same
 * security posture as GenericUrlProvider's og:tag extraction (no DOM parsing, no
 * script execution). Good enough for "get the substance of a notes/article page,"
 * not a general-purpose HTML parser; block-level tags are turned into line breaks so
 * paragraphs/headings stay readable rather than running together.
 */
export function extractReadableText(html: string, maxChars = 20000): string {
  const withoutNonContent = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  const withLineBreaks = withoutNonContent.replace(/<\/(p|div|h[1-6]|li|br|tr)>/gi, "\n");
  const withoutTags = withLineBreaks.replace(/<[^>]+>/g, " ");

  let decoded = withoutTags;
  for (const [pattern, replacement] of ENTITY_REPLACEMENTS) {
    decoded = decoded.replace(pattern, replacement);
  }

  const collapsed = decoded
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return collapsed.slice(0, maxChars);
}
