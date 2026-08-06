import { revalidatePath } from "next/cache";
import { auditService, billingService, bulkJobService, organizationService, resourceService } from "@ruach/database";
import { CategorizationService, getAIProvider } from "@ruach/ai";
import { extractCandidateLinks, extractReadableText, safeFetch } from "@ruach/providers";
import { LocalRetrievalProvider } from "@ruach/retrieval";

/** Used when a caller doesn't pass an explicit concurrency -- see billingService.bulkConcurrency for the plan-dependent version callers should prefer. */
const DEFAULT_BULK_CONCURRENCY = 5;
const PROGRESS_FLUSH_INTERVAL_MS = 500;

/**
 * Runs `fn` over `items` with at most `concurrency` in flight at once, instead of
 * one at a time. The bulk toolbar actions call real external services per resource
 * (OpenAI categorization, arbitrary web fetches for link inclusion) -- run
 * sequentially, a large selection (now that "select all" spans every matching
 * resource, not just one page) can take minutes. `fn` reports success/failure via
 * its boolean return rather than throwing, so one bad item never aborts the rest of
 * the batch; `onItemDone`, when given, fires with the item and that result after
 * each item settles so a caller can report progress without waiting for the whole
 * batch. `deadline` (a Date.now()-style timestamp), when given, stops workers from
 * claiming *new* items once passed -- an item already in flight still finishes --
 * so a caller can bound one invocation's wall-clock time and pick up whatever's left
 * in a later call (see runBulkJob's chunking).
 */
async function mapWithConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<boolean>,
  onItemDone?: (item: T, success: boolean) => void,
  deadline = Infinity,
): Promise<void> {
  let index = 0;
  async function worker() {
    while (index < items.length && Date.now() < deadline) {
      const item = items[index++]!;
      const success = await fn(item);
      onItemDone?.(item, success);
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
export async function approveAndIndexResources(
  organizationId: string,
  resourceIds: string[],
  onItemDone?: (resourceId: string, success: boolean) => void,
  concurrency = DEFAULT_BULK_CONCURRENCY,
  deadline = Infinity,
) {
  const retrieval = new LocalRetrievalProvider();
  await mapWithConcurrency(
    resourceIds,
    concurrency,
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
    deadline,
  );
}

/**
 * Runs AI categorization on each resource, one at a time (matches the bulk "Analyze"
 * toolbar action's behavior). A single resource's failure (e.g. a transient OpenAI
 * error) doesn't abort the rest of the batch -- re-running is always safe.
 */
export async function categorizeResources(
  organizationId: string,
  resourceIds: string[],
  onItemDone?: (resourceId: string, success: boolean) => void,
  concurrency = DEFAULT_BULK_CONCURRENCY,
  deadline = Infinity,
) {
  const service = new CategorizationService(getAIProvider());
  await mapWithConcurrency(
    resourceIds,
    concurrency,
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
    deadline,
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
  onItemDone?: (resourceId: string, success: boolean) => void,
  concurrency = DEFAULT_BULK_CONCURRENCY,
  deadline = Infinity,
): Promise<number> {
  let discoveredCount = 0;
  await mapWithConcurrency(
    resourceIds,
    concurrency,
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
    deadline,
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
  onItemDone?: (resourceId: string, success: boolean) => void,
  concurrency = DEFAULT_BULK_CONCURRENCY,
  deadline = Infinity,
): Promise<{ included: number; failed: number }> {
  let included = 0;
  let failed = 0;

  await mapWithConcurrency(
    resourceIds,
    concurrency,
    async (resourceId) => {
      try {
        const documents = await resourceService.listSourceDocuments(organizationId, resourceId);
        const pending = documents.filter((doc) => doc.sourceType === "WEB_PAGE" && doc.discoveredAutomatically && !doc.approvedByUser);

        await mapWithConcurrency(pending, concurrency, async (doc) => {
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
    deadline,
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

// Leaves headroom under the route's 300s maxDuration (see resources/page.tsx) for
// the final progress flush, the audit event, and the fetch() that hands off to the
// next chunk -- a chunk that ran right up to 300s wouldn't have time left to do any
// of that cleanly.
const CHUNK_TIME_BUDGET_MS = 4 * 60 * 1000;
// Safety valve against a runaway self-chaining loop (e.g. a bug where the remaining
// set never shrinks) -- each chunk only makes real progress or fails outright, so a
// job legitimately taking this long would already be an operational problem worth
// surfacing rather than silently chaining forever.
const MAX_JOB_AGE_MS = 2 * 60 * 60 * 1000;

function buildResultSummary(type: string, successCount: number, failureCount: number, extraCount: number): string {
  switch (type) {
    case "ANALYZE":
      return `${successCount} resource${successCount === 1 ? "" : "s"} analyzed` + (failureCount ? `, ${failureCount} failed` : "");
    case "APPROVE":
      return `${successCount} resource${successCount === 1 ? "" : "s"} approved` + (failureCount ? `, ${failureCount} failed` : "");
    case "FIND_LINKS":
      return extraCount === 0
        ? "No new links found in the selected resources' descriptions."
        : `Found ${extraCount} new link${extraCount === 1 ? "" : "s"} -- review them on each resource's page.`;
    case "INCLUDE_LINKS":
      return extraCount === 0 && failureCount === 0
        ? "No pending links to include in the selected resources."
        : `Included ${extraCount} link${extraCount === 1 ? "" : "s"}` + (failureCount > 0 ? `, ${failureCount} couldn't be fetched.` : ".");
    default:
      return `${successCount} resource${successCount === 1 ? "" : "s"} processed`;
  }
}

/**
 * completeBulkJob is the one write that actually matters -- once it succeeds, the
 * job genuinely is done, and the audit event + revalidatePath calls after it are
 * secondary bookkeeping. They're wrapped separately (not just left to bubble up
 * into runBulkJob's outer catch) so that a hiccup in either one can never
 * retroactively flip an already-completed job to FAILED -- that catch exists for
 * failures *during* the actual work, not for cleanup steps after it succeeded.
 */
async function finalizeBulkJob(
  organizationId: string,
  job: { id: string; type: string; resourceIds: string[]; totalCount: number },
  userId: string | undefined,
  successCount: number,
  failureCount: number,
  extraCount: number,
) {
  const resultSummary = buildResultSummary(job.type, successCount, failureCount, extraCount);
  await bulkJobService.completeBulkJob(organizationId, job.id, { successCount, failureCount, resultSummary });

  try {
    await auditService.recordAuditEvent({
      organizationId,
      actorUserId: userId,
      action: BULK_JOB_AUDIT_ACTION[job.type]!,
      targetType: "Resource",
      targetId: "bulk",
      metadata: { resourceIds: job.resourceIds, count: job.totalCount, successCount, failureCount },
    });
  } catch (err) {
    console.error(`Bulk job ${job.id} completed but its audit event failed to record:`, err);
  }

  try {
    revalidatePath("/resources");
    revalidatePath("/dashboard");
  } catch (err) {
    console.error(`Bulk job ${job.id} completed but revalidatePath failed:`, err);
  }
}

/**
 * Hands off to a fresh serverless invocation (its own 300s budget, not whatever's
 * left of this one) to keep working on a job that didn't finish within one chunk's
 * time budget -- runBulkJob has no way to "pause and resume itself" mid-invocation,
 * so continuing means a genuinely new request. Guarded by CRON_SECRET (already used
 * for the other non-session-authenticated background routes) since this must never
 * be reachable by an untrusted caller -- it would let someone else's request re-run
 * paid OpenAI categorization work against this organization.
 */
async function triggerNextChunk(organizationId: string, jobId: string, userId: string | undefined) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error(`Cannot continue bulk job ${jobId}: CRON_SECRET is not configured.`);
    await bulkJobService.failBulkJob(
      organizationId,
      jobId,
      "This batch is too large to finish in one pass, and automatic continuation isn't configured. Please try a smaller batch.",
    );
    return;
  }
  const appOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  try {
    await fetch(`${appOrigin}/api/bulk-jobs/${jobId}/continue`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ organizationId, userId }),
    });
  } catch (err) {
    console.error(`Failed to trigger next chunk for bulk job ${jobId}:`, err);
    await bulkJobService.failBulkJob(organizationId, jobId, "Couldn't continue this batch automatically. Please try again.");
  }
}

/**
 * Runs one chunk of a previously-enqueued BulkJob, continuing automatically (via
 * triggerNextChunk) if it doesn't finish within CHUNK_TIME_BUDGET_MS. Called from
 * resources/page.tsx's bulk*Action Server Actions via next/server's after() --
 * scheduled to run once the response has already been sent, so the click that
 * triggered it never waits on the actual work (see BulkJob's schema doc comment for
 * why this exists) -- and again from api/bulk-jobs/[jobId]/continue for each
 * subsequent chunk of a job too large for one invocation. Never throws: any
 * unexpected failure is caught and recorded on the job instead, since nothing is
 * awaiting this call's rejection.
 */
export async function runBulkJob(organizationId: string, jobId: string, userId: string | undefined): Promise<void> {
  try {
    const job = await bulkJobService.markRunning(organizationId, jobId);
    if (!job) return;

    if (Date.now() - job.createdAt.getTime() > MAX_JOB_AGE_MS) {
      await bulkJobService.failBulkJob(
        organizationId,
        jobId,
        "This batch has been running too long and was stopped. Please try again, ideally with a smaller selection.",
      );
      return;
    }

    // REJECT/DELETE are plain batch DB writes, not per-item external calls -- always
    // finish well within one invocation, so they skip the chunking machinery below.
    if (job.type === "REJECT" || job.type === "DELETE") {
      if (job.type === "REJECT") await resourceService.archiveResources(organizationId, job.resourceIds);
      else await resourceService.deleteResources(organizationId, job.resourceIds);
      await finalizeBulkJob(organizationId, job, userId, job.totalCount, 0, 0);
      return;
    }

    // No request-scoped getCurrentOrganization() here (this runs via next/server's
    // after(), detached from the request) -- resolved directly so Multi-Site+ orgs
    // get their plan's larger worker pool (billingService.bulkConcurrency).
    const organization = await organizationService.getOrganization(organizationId);
    const concurrency = billingService.bulkConcurrency(organization?.planKey ?? "essential");

    // Resuming a chunked job: pick up wherever earlier chunks left off. Filtered by
    // id (not a resourceIds.slice) since concurrent workers can finish items out of
    // the array's original order -- see the schema doc comment on processedResourceIds.
    const alreadyDoneIds = new Set(job.processedResourceIds);
    const remainingIds = job.resourceIds.filter((id) => !alreadyDoneIds.has(id));

    let processedCount = job.processedCount;
    let successCount = job.successCount;
    let failureCount = job.failureCount;
    let extraCount = job.extraCount;
    const cumulativeDoneIds = [...job.processedResourceIds];
    let lastFlush = Date.now();

    const flush = () =>
      bulkJobService.recordProgress(organizationId, jobId, {
        processedCount,
        successCount,
        failureCount,
        extraCount,
        processedResourceIds: cumulativeDoneIds,
      });

    const onItemDone = (resourceId: string, success: boolean) => {
      processedCount += 1;
      if (success) successCount += 1;
      else failureCount += 1;
      cumulativeDoneIds.push(resourceId);
      const now = Date.now();
      if (now - lastFlush >= PROGRESS_FLUSH_INTERVAL_MS || processedCount === job.totalCount) {
        lastFlush = now;
        void flush();
      }
    };

    const deadline = Date.now() + CHUNK_TIME_BUDGET_MS;
    switch (job.type) {
      case "ANALYZE":
        await categorizeResources(organizationId, remainingIds, onItemDone, concurrency, deadline);
        break;
      case "APPROVE":
        await approveAndIndexResources(organizationId, remainingIds, onItemDone, concurrency, deadline);
        break;
      case "FIND_LINKS":
        extraCount += await discoverLinksForResources(organizationId, remainingIds, onItemDone, concurrency, deadline);
        break;
      case "INCLUDE_LINKS": {
        const { included, failed } = await includeDiscoveredLinksForResources(organizationId, remainingIds, onItemDone, concurrency, deadline);
        extraCount += included;
        failureCount += failed;
        break;
      }
    }

    await flush(); // persist this chunk's final state before deciding what's next

    if (cumulativeDoneIds.length < job.resourceIds.length) {
      await triggerNextChunk(organizationId, jobId, userId);
      return; // not done -- the next invocation finalizes
    }

    await finalizeBulkJob(organizationId, job, userId, successCount, failureCount, extraCount);
  } catch (err) {
    console.error(`Bulk job ${jobId} failed:`, err);
    await bulkJobService.failBulkJob(organizationId, jobId, err instanceof Error ? err.message : String(err));
  }
}
