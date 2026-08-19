import type { Metadata } from "next";

const SITE_SUFFIX = " | Ruach";

/**
 * Every marketing page's title/description mirrored into openGraph + twitter, so
 * each page gets correct link-preview cards without repeating the same 3 fields by
 * hand at every call site. `path` (the page's own URL, e.g. "/pricing") sets an
 * explicit self-referencing canonical -- without it, a page reachable via multiple
 * query strings (search UTMs, previews) risks being treated as duplicate content.
 *
 * `title` is the page's own distinctive title -- the root layout's
 * `template: "%s | Ruach"` appends the brand suffix once, so every future page gets
 * it automatically without having to remember to type "| Ruach" by hand. Pass
 * `absoluteTitle: true` only for a page whose title deliberately puts "Ruach" first
 * instead (the homepage, plus a couple of pages with "Ruach" baked into a
 * keyword-rich phrase) -- it bypasses the template so the suffix isn't appended a
 * second time. openGraph/twitter always get the fully-suffixed title regardless,
 * since link-preview cards don't go through the layout's template at all.
 */
export function pageMetadata({
  title,
  absoluteTitle = false,
  description,
  path,
}: {
  title: string;
  absoluteTitle?: boolean;
  description: string;
  path: string;
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title}${SITE_SUFFIX}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { title: fullTitle, description, type: "website", url: path },
    twitter: { card: "summary_large_image", title: fullTitle, description },
  };
}
