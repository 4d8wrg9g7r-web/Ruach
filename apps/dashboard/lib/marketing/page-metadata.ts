import type { Metadata } from "next";

/**
 * Every marketing page's title/description mirrored into openGraph + twitter, so
 * each page gets correct link-preview cards without repeating the same 3 fields by
 * hand at every call site. `path` (the page's own URL, e.g. "/pricing") sets an
 * explicit self-referencing canonical -- without it, a page reachable via multiple
 * query strings (search UTMs, previews) risks being treated as duplicate content.
 */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, type: "website", url: path },
    twitter: { card: "summary_large_image", title, description },
  };
}
