import { auditService, billingService, contentSourceService, organizationService, type ContentSource } from "@ruach/database";
import { importYouTubeChannel, importRSSFeed } from "@ruach/providers";
import { approveAndIndexResources, categorizeResources } from "./resource-pipeline";

export interface SyncOutcome {
  contentSourceId: string;
  totalFound: number;
  created: number;
  failed: number;
  error?: string;
}

/**
 * Runs one tracked source through the same bulk-import path as the manual "Import a
 * YouTube channel"/"Import an RSS feed" panels, then -- unlike the manual panels --
 * always categorizes newly-created resources (the whole point of auto-sync is
 * "imported and analyzed" with no human triggering "Analyze" by hand). autoApprove
 * additionally flips categorized resources straight to ACTIVE and indexes them;
 * without it they land in REVIEW_REQUIRED for a human to check, same as any other
 * AI-categorized resource.
 */
export async function syncContentSource(organizationId: string, source: ContentSource): Promise<SyncOutcome> {
  try {
    const result =
      source.provider === "YOUTUBE"
        ? await importYouTubeChannel(organizationId, source.sourceUrl)
        : await importRSSFeed(organizationId, source.sourceUrl);

    if (result.createdResourceIds.length > 0) {
      const organization = await organizationService.getOrganization(organizationId);
      const concurrency = billingService.bulkConcurrency(organization?.planKey ?? "essential");
      await categorizeResources(organizationId, result.createdResourceIds, undefined, concurrency);
      if (source.autoApprove) {
        await approveAndIndexResources(organizationId, result.createdResourceIds, undefined, concurrency);
      }
    }

    await auditService.recordAuditEvent({
      organizationId,
      action: "source.synced",
      targetType: "ContentSource",
      targetId: source.id,
      metadata: {
        sourceUrl: source.sourceUrl,
        provider: source.provider,
        totalFound: result.totalItems,
        created: result.createdResourceIds.length,
        alreadyExisted: result.existingResourceIds.length,
        failed: result.failureCount,
        autoApproved: source.autoApprove,
      },
    });
    await contentSourceService.recordSyncResult(organizationId, source.id, {
      status: result.failureCount === 0 ? "COMPLETED" : result.createdResourceIds.length === 0 ? "FAILED" : "PARTIAL",
    });

    return {
      contentSourceId: source.id,
      totalFound: result.totalItems,
      created: result.createdResourceIds.length,
      failed: result.failureCount,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await contentSourceService.recordSyncResult(organizationId, source.id, { status: "FAILED", error: message });
    return { contentSourceId: source.id, totalFound: 0, created: 0, failed: 0, error: message };
  }
}

/**
 * Entry point for the scheduled sync run (see app/api/cron/sync/route.ts). Iterates
 * every autoSyncEnabled source across every organization -- there's no per-tenant
 * cron, a single shared job checks all of them. One source failing doesn't stop the
 * rest (syncContentSource already catches its own errors and records them).
 */
export async function syncAllDueSources(): Promise<SyncOutcome[]> {
  const sources = await contentSourceService.listDueForAutoSync();
  const outcomes: SyncOutcome[] = [];
  for (const source of sources) {
    outcomes.push(await syncContentSource(source.organizationId, source));
  }
  return outcomes;
}
