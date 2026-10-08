import { revalidateTag, unstable_cache } from "next/cache";
import { billingService, organizationService, resourceService, widgetService } from "@ruach/database";
import { findLibraryFont, type LibraryItem, type ResourceTypeValue } from "@ruach/shared-types";

/**
 * Data loading for the public sermon library embed (/widget/library/[publicWidgetId]).
 *
 * Neon cost is the constraint here: this page sits on a church's public sermon page,
 * so it can see far more traffic than the chat launcher. Both lookups below go
 * through Next's data cache (shared across serverless instances on Vercel), so in
 * steady state a page view costs zero database queries -- the catalog is read once
 * per campus per CACHE_SECONDS, and every filter click after that runs in the
 * visitor's browser. Staff edits invalidate by tag (see invalidate* below), so the
 * TTL is only the worst case for changes made outside those paths (e.g. the hourly
 * sync cron).
 */

const CACHE_SECONDS = 600;

/** Keeps the cached entry well under Vercel's 2MB data-cache item limit (~400 bytes
 * per item). A church preaching weekly for 30+ years still fits; past that, the
 * oldest messages drop out of the archive but stay reachable through chat. */
export const LIBRARY_ITEM_LIMIT = 2000;

const SUMMARY_LENGTH = 180;

const widgetTag = (publicWidgetId: string) => `sermon-library:widget:${publicWidgetId}`;
const catalogTag = (organizationId: string) => `sermon-library:org:${organizationId}`;

function truncate(text: string | null): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (trimmed.length <= SUMMARY_LENGTH) return trimmed || null;
  return `${trimmed.slice(0, SUMMARY_LENGTH).replace(/\s+\S*$/, "")}…`;
}

/**
 * The public widget -> organization boundary (widgetService.getWidgetByPublicId),
 * cached. Returns only what the library page renders plus the domain allowlist
 * needed for the host check -- nothing else about the website leaves this function.
 */
export function getLibraryWidget(publicWidgetId: string) {
  return unstable_cache(
    async () => {
      const widget = await widgetService.getWidgetByPublicId(publicWidgetId);
      if (!widget) return null;
      const organization = await organizationService.getOrganization(widget.organizationId);
      // Plan gates are re-checked here, not only when settings are saved, so an org
      // that downgrades gets "Powered by Ruach" back and loses its custom font even
      // though the saved values are kept (they come back if they upgrade again).
      // Billing webhooks don't invalidate this cache, so a downgrade can take up to
      // CACHE_SECONDS to show.
      const planKey = organization?.planKey ?? "essential";
      const canRemoveBranding = billingService.planHasFeature(planKey, "removeBranding");
      const canCustomize = billingService.planHasFeature(planKey, "advancedWidgetCustomization");
      return {
        publicWidgetId: widget.publicWidgetId,
        organizationId: widget.organizationId,
        websiteId: widget.websiteId,
        organizationName: organization?.name ?? widget.website.name,
        assistantName: widget.assistantName,
        inputPlaceholder: widget.inputPlaceholder,
        suggestedPrompts: widget.suggestedPrompts,
        primaryColor: widget.primaryColor,
        showPlatformBranding: canRemoveBranding ? widget.showPlatformBranding : true,
        font: canCustomize ? findLibraryFont(widget.libraryFontFamily) : null,
        libraryResourceTypes: widget.libraryResourceTypes as ResourceTypeValue[],
        website: {
          primaryDomain: widget.website.primaryDomain,
          allowedDomains: widget.website.allowedDomains,
          stagingDomains: widget.website.stagingDomains,
        },
      };
    },
    ["sermon-library-widget", publicWidgetId],
    { revalidate: CACHE_SECONDS, tags: [widgetTag(publicWidgetId)] },
  )();
}

/**
 * One campus's catalog, limited to the resource types the widget's library shows.
 * websiteId and resourceTypes come from the resolved widget above, never from the
 * request.
 */
export function getLibraryCatalog(
  organizationId: string,
  websiteId: string | null,
  resourceTypes: ResourceTypeValue[],
): Promise<LibraryItem[]> {
  const types = [...new Set(resourceTypes)].sort();
  return unstable_cache(
    async () => {
      if (types.length === 0) return [];
      const rows = await resourceService.listLibraryResources({
        organizationId,
        websiteId,
        resourceTypes: types,
        limit: LIBRARY_ITEM_LIMIT,
      });
      return rows.map(
        (row): LibraryItem => ({
          id: row.id,
          title: row.title,
          resourceType: row.resourceType,
          speakerName: row.speakerName?.trim() || null,
          seriesTitle: row.seriesTitle?.trim() || null,
          publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
          durationSeconds: row.durationSeconds,
          thumbnailUrl: row.thumbnailUrl,
          publicUrl: row.publicUrl,
          summary: truncate(row.summary),
          // primaryTopic is usually also in topics; the facet builder dedupes per item.
          topics: [...(row.primaryTopic ? [row.primaryTopic] : []), ...row.topics].filter((t) => t.trim()),
          scriptures: row.scriptures.filter((s) => s.trim()),
          messageTypes: row.messageTypes.filter((t) => t.trim()),
        }),
      );
    },
    ["sermon-library-catalog", organizationId, websiteId ?? "org", types.join(",")],
    { revalidate: CACHE_SECONDS, tags: [catalogTag(organizationId)] },
  )();
}

// Both invalidators swallow errors: some callers run outside a request scope (bulk
// jobs finish inside after()), where revalidateTag can throw -- and a missed
// invalidation only means waiting out CACHE_SECONDS, never wrong data.
function safeRevalidateTag(tag: string) {
  try {
    revalidateTag(tag);
  } catch (err) {
    console.error(`revalidateTag(${tag}) failed:`, err);
  }
}

/** Call after a widget's settings change so its library picks up the new color/prompts. */
export function invalidateLibraryWidget(publicWidgetId: string) {
  safeRevalidateTag(widgetTag(publicWidgetId));
}

/** Call after resources are approved, archived, deleted or re-scoped to a campus. */
export function invalidateLibraryCatalog(organizationId: string) {
  safeRevalidateTag(catalogTag(organizationId));
}
