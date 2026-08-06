import type { BulkJobType } from "@prisma/client";
import { tenantDb } from "../client";

export async function createBulkJob(
  organizationId: string,
  type: BulkJobType,
  resourceIds: string[],
  createdByUserId?: string,
) {
  return tenantDb.bulkJob.create({
    data: { organizationId, type, resourceIds, totalCount: resourceIds.length, createdByUserId },
  });
}

const STALE_ACTIVE_JOB_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes with no progress heartbeat
const STALLED_JOB_MESSAGE = "This job stopped making progress and was likely interrupted (e.g. by a server timeout on a large batch). Please try again.";

/**
 * A genuinely active job's progress is flushed at least every ~500ms (see
 * resource-pipeline.ts's PROGRESS_FLUSH_INTERVAL_MS), so `updatedAt` only goes
 * stale like this when the background worker running it died mid-job -- most
 * commonly the serverless function hitting its max execution duration on a large
 * batch (runBulkJob has no chunking/resumability, so it must finish in one
 * invocation). Left alone, a dead RUNNING job looks identical to a real one
 * forever, both to the polling UI and to the next page load
 * (getMostRecentActiveJob) -- from the outside this is exactly what "the analysis
 * got stuck" looks like. Detected lazily at read time (not a cron sweep) since it
 * only matters at the two moments something actually looks at the job's status.
 */
async function reapIfStale(job: Awaited<ReturnType<typeof tenantDb.bulkJob.findFirst>>) {
  if (!job || (job.status !== "RUNNING" && job.status !== "PENDING")) return job;
  if (Date.now() - job.updatedAt.getTime() < STALE_ACTIVE_JOB_THRESHOLD_MS) return job;
  await failBulkJob(job.organizationId, job.id, STALLED_JOB_MESSAGE);
  return { ...job, status: "FAILED" as const, errorMessage: STALLED_JOB_MESSAGE };
}

export async function getBulkJob(organizationId: string, jobId: string) {
  const job = await tenantDb.bulkJob.findFirst({ where: { id: jobId, organizationId } });
  return reapIfStale(job);
}

/**
 * Most recent still-in-flight job, if any -- lets the Resources page resume showing
 * progress after a reload or navigating away and back, instead of a job silently
 * running to completion with no visible trace once the tab that started it is gone.
 */
export async function getMostRecentActiveJob(organizationId: string) {
  const job = await tenantDb.bulkJob.findFirst({
    where: { organizationId, status: { in: ["PENDING", "RUNNING"] } },
    orderBy: { createdAt: "desc" },
  });
  const reaped = await reapIfStale(job);
  // The newest active job just got reaped as stale -- an older one might genuinely
  // still be in flight and should surface instead of nothing.
  if (job && reaped?.status === "FAILED") return getMostRecentActiveJob(organizationId);
  return reaped;
}

export async function markRunning(organizationId: string, jobId: string) {
  const result = await tenantDb.bulkJob.updateMany({
    where: { id: jobId, organizationId },
    data: { status: "RUNNING" },
  });
  if (result.count === 0) return null;
  return getBulkJob(organizationId, jobId);
}

export async function recordProgress(
  organizationId: string,
  jobId: string,
  progress: {
    processedCount: number;
    successCount: number;
    failureCount: number;
    /** Cumulative (the full list so far, not just this flush's delta) -- see the schema doc comment on why this can't be derived from processedCount alone once a job spans multiple chunks. */
    processedResourceIds?: string[];
    extraCount?: number;
  },
) {
  return tenantDb.bulkJob.updateMany({
    where: { id: jobId, organizationId },
    data: progress,
  });
}

export async function completeBulkJob(
  organizationId: string,
  jobId: string,
  result: { successCount: number; failureCount: number; resultSummary: string },
) {
  return tenantDb.bulkJob.updateMany({
    where: { id: jobId, organizationId },
    data: { status: "COMPLETED", processedCount: result.successCount + result.failureCount, ...result },
  });
}

export async function failBulkJob(organizationId: string, jobId: string, errorMessage: string) {
  return tenantDb.bulkJob.updateMany({
    where: { id: jobId, organizationId },
    data: { status: "FAILED", errorMessage },
  });
}
