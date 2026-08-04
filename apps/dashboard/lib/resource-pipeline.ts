import { revalidatePath } from "next/cache";
import { auditService, bulkJobService, resourceService } from "@ruach/database";
import { CategorizationService, getAIProvider } from "@ruach/ai";
import { extractCandidateLinks, extractReadableText, safeFetch } from "@ruach/providers";
import { LocalRetrievalProvider } from "@ruach/retrieval";

const BULK_CONCURRENCY = 5;
const PROGRESS_FLUSH_INTERVAL_MS = 500;

/**
 * Runs `fn` over `items` with at most `concurrency` in flight at once, instead of
 * one at a time. The bulk toolbar actions call real external services per resource
 * (OpenAI categorization, arbitrary web fetches for link inclusion) -- run
 * sequentially, a large selection (now that "select all" spans every matching
 * resource, not just one page) can take minutes. `fn` reports success/failure via
 * its boolean return rather than throwing, so one bad item never aborts the rest of
 * the batch; `onItemDone`, when given, fires with that result after each item
 * settles so a caller can report progress without waiting for the whole batch.
 */
async function mapWithConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<boolean>,
  onItemDone?: (success: boolean) => void,
): Promise<void> {
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const item = items[index++]!;
      const success = await fn(item);
      onItemDone?.(success);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
}

/**
 * Shared by the manual "Import a YouTube channel"/"Import an RSS feed" panels
 * (resources/page.tsx) and the auto-sync cron job (content-sync.ts) -- both need to
 * turn a batch of freshly-created DRAFT resources into ACTIVE, retrieval-indexed
 * ones. Approving without categorizing first would leave the resource with no
 * topics/searchDocument, which is why callers that also want AI categorization
 * should run categorizeResources() before this.
 */
export async function approveAndIndexResources(organizationId: string, resourceIds: string[], onItemDone?: (success: boolean) => void) {
  const retrieval = new LocalRetrievalProvider();
  await mapWithConcurrency(
    resourceIds,
    BULK_CONCURRENCY,
    async (resourceId) => {
      try {
        const resource = await resourceService.approveResource(organizationId, resourceId);
        if (resource) {
          await retrieval.indexResource({
            resourceId: resource.id,
            organizationId,
            resourceType: resource.resourceType,
            title: resource.title,
            searchDocument: resource.searchDocument ?? resource.title,
            status: resource.status,
          });
        }
        return true;
      } catch (err) {
        console.error(`Approve failed for resource ${resourceId}:`, err);
        return false;
      }
    },
    onItemDone,
  );
}

/**
 * Runs AI categorization on each resource, one at a time (matches the bulk "Analyze"
 * toolbar action's behavior). A single resource's failure (e.g. a transient OpenAI
 * error) doesn't abort the rest of the batch -- re-running is always safe.
 */
export async function categorizeResources(organizationId: string, resourceIds: string[], onItemDone?: (success: boolean) => void) {
  const service = new CategorizationService(getAIProvider());
  await mapWithConcurrency(
    resourceIds,
    BULK_CONCURRENCY,
    async (resourceId) => {
      try {
        await service.categorize(organizationId, resourceId);
        return true;
      } catch (err) {
        console.error(`Categorization failed for resource ${resourceId}:`, err);
        return false;
      }
    },
    onItemDone,
  );
}

/**
 * Bulk "find links" toolbar action -- re-runs the same description-link discovery
 * that normally only happens once at import time (import-service.ts), for resources
 * that predate this feature or whose description changed. Dedupes against
 * sourceUrls already on the resource so re-running is always safe. Returns the
 * number of new candidate rows created, for the toolbar's confirmation toast.
 */
export async function discoverLinksForResources(
  organizationId: string,
  resourceIds: string[],
  onItemDone?: (success: boolean) => void,
): Promise<number> {
  let discoveredCount = 0;
  await mapWithConcurrency(
    resourceIds,
    BULK_CONCURRENCY,
    async (resourceId) => {
      try {
        const resource = await resourceService.getResource(organizationId, resourceId);
        if (!resource) return true;
        const existingUrls = new Set(resource.sourceDocuments.map((doc) => doc.sourceUrl).filter((url): url is string => !!url));

        for (const url of extractCandidateLinks(resource.description, resource.title)) {
          if (existingUrls.has(url)) continue;
          await resourceService.addSourceDocument({
            organizationId,
            resourceId,
            sourceType: "WEB_PAGE",
            sourceUrl: url,
            discoveredAutomatically: true,
            approvedByUser: false,
            includedInAnalysis: false,
          });
          discoveredCount += 1;
        }
        return true;
      } catch (err) {
        console.error(`Link discovery failed for resource ${resourceId}:`, err);
        return false;
      }
    },
    onItemDone,
  );
  return discoveredCount;
}

/**
 * Bulk "include links" toolbar action -- the batch version of the resource detail
 * page's per-link "Include" button (brief §22-23): fetches and approves every
 * currently-pending discovered link across the given resources. One bad link (dead,
 * blocked by safeFetch's guardrails, not HTML) doesn't abort the rest of the batch.
 * `onItemDone` fires once per resource (not per link) -- that's the granularity the
 * job progress bar shows.
 */
export async function includeDiscoveredLinksForResources(
  organizationId: string,
  resourceIds: string[],
  onItemDone?: (success: boolean) => void,
): Promise<{ included: number; failed: number }> {
  let included = 0;
  let failed = 0;

  await mapWithConcurrency(
    resourceIds,
    BULK_CONCURRENCY,
    async (resourceId) => {
      try {
        const documents = await resourceService.listSourceDocuments(organizationId, resourceId);
        const pending = documents.filter((doc) => doc.sourceType === "WEB_PAGE" && doc.discoveredAutomatically && !doc.approvedByUser);

        await mapWithConcurrency(pending, BULK_CONCURRENCY, async (doc) => {
          if (!doc.sourceUrl) return true;
          try {
            const result = await safeFetch(doc.sourceUrl);
            const text = result.contentType?.includes("text/html") ? extractReadableText(result.body) : "";
            if (!text) {
              failed += 1;
              return false;
            }
            await resourceService.approveSourceDocument(organizationId, resourceId, doc.id, { originalText: text, cleanText: text });
            included += 1;
            return true;
          } catch (err) {
            console.error(`Failed to include link ${doc.sourceUrl} for resource ${resourceId}:`, err);
            failed += 1;
            return false;
          }
        });
        return true;
      } catch (err) {
        console.error(`Failed to list source documents for resource ${resourceId}:`, err);
        return false;
      }
    },
    onItemDone,
  );

  return { included, failed };
}

const BULK_JOB_AUDIT_ACTION: Record<string, string> = {
  ANALYZE: "resource.bulk_categorized",
  APPROVE: "resource.bulk_approved",
  REJECT: "resource.bulk_rejected",
  DELETE: "resource.bulk_deleted",
  FIND_LINKS: "resource.bulk_links_discovered",
  INCLUDE_LINKS: "resource.bulk_links_included",
};

/**
 * Runs a previously-enqueued BulkJob to completion. Called from resources/page.tsx's
 * bulk*Action Server Actions via next/server's after() -- scheduled to run once the
 * response has already been sent, so the click that triggered it never waits on the
 * actual work (see BulkJob's schema doc comment for why this exists). Never throws:
 * any unexpected failure is caught and recorded on the job instead, since nothing is
 * awaiting this call's rejection.
 */
export async function runBulkJob(organizationId: string, jobId: string, userId: string | undefined): Promise<void> {
  try {
    const job = await bulkJobService.markRunning(organizationId, jobId);
    if (!job) return;

    let processedCount = 0;
    let successCount = 0;
    let failureCount = 0;
    let lastFlush = Date.now();
    const onItemDone = (success: boolean) => {
      processedCount += 1;
      if (success) successCount += 1;
      else failureCount += 1;
      const now = Date.now();
      if (now - lastFlush >= PROGRESS_FLUSH_INTERVAL_MS || processedCount === job.totalCount) {
        lastFlush = now;
        void bulkJobService.recordProgress(organizationId, jobId, { processedCount, successCount, failureCount });
      }
    };

    let resultSummary: string;
    switch (job.type) {
      case "ANALYZE": {
        await categorizeResources(organizationId, job.resourceIds, onItemDone);
        resultSummary = `${successCount} resource${successCount === 1 ? "" : "s"} analyzed` + (failureCount ? `, ${failureCount} failed` : "");
        break;
      }
      case "APPROVE": {
        await approveAndIndexResources(organizationId, job.resourceIds, onItemDone);
        resultSummary = `${successCount} resource${successCount === 1 ? "" : "s"} approved` + (failureCount ? `, ${failureCount} failed` : "");
        break;
      }
      case "FIND_LINKS": {
        const discoveredCount = await discoverLinksForResources(organizationId, job.resourceIds, onItemDone);
        resultSummary =
          discoveredCount === 0
            ? "No new links found in the selected resources' descriptions."
            : `Found ${discoveredCount} new link${discoveredCount === 1 ? "" : "s"} -- review them on each resource's page.`;
        break;
      }
      case "INCLUDE_LINKS": {
        const { included, failed } = await includeDiscoveredLinksForResources(organizationId, job.resourceIds, onItemDone);
        resultSummary =
          included === 0 && failed === 0
            ? "No pending links to include in the selected resources."
            : `Included ${included} link${included === 1 ? "" : "s"}` + (failed > 0 ? `, ${failed} couldn't be fetched.` : ".");
        break;
      }
      case "REJECT": {
        await resourceService.archiveResources(organizationId, job.resourceIds);
        processedCount = successCount = job.totalCount;
        resultSummary = `${job.totalCount} resource${job.totalCount === 1 ? "" : "s"} rejected`;
        break;
      }
      case "DELETE": {
        await resourceService.deleteResources(organizationId, job.resourceIds);
        processedCount = successCount = job.totalCount;
        resultSummary = `${job.totalCount} resource${job.totalCount === 1 ? "" : "s"} deleted`;
        break;
      }
    }

    await bulkJobService.completeBulkJob(organizationId, jobId, { successCount, failureCount, resultSummary });

    await auditService.recordAuditEvent({
      organizationId,
      actorUserId: userId,
      action: BULK_JOB_AUDIT_ACTION[job.type]!,
      targetType: "Resource",
      targetId: "bulk",
      metadata: { resourceIds: job.resourceIds, count: job.totalCount, successCount, failureCount },
    });

    revalidatePath("/resources");
    revalidatePath("/dashboard");
  } catch (err) {
    console.error(`Bulk job ${jobId} failed:`, err);
    await bulkJobService.failBulkJob(organizationId, jobId, err instanceof Error ? err.message : String(err));
  }
}
