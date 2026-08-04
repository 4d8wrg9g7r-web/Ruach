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

export async function getBulkJob(organizationId: string, jobId: string) {
  return tenantDb.bulkJob.findFirst({ where: { id: jobId, organizationId } });
}

/**
 * Most recent still-in-flight job, if any -- lets the Resources page resume showing
 * progress after a reload or navigating away and back, instead of a job silently
 * running to completion with no visible trace once the tab that started it is gone.
 */
export async function getMostRecentActiveJob(organizationId: string) {
  return tenantDb.bulkJob.findFirst({
    where: { organizationId, status: { in: ["PENDING", "RUNNING"] } },
    orderBy: { createdAt: "desc" },
  });
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
  progress: { processedCount: number; successCount: number; failureCount: number },
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
