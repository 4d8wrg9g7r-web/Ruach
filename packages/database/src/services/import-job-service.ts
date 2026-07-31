import type { ImportType, ResourceProviderType } from "@prisma/client";
import { tenantDb } from "../client";

export async function createImportJob(params: {
  organizationId: string;
  provider: ResourceProviderType;
  importType: ImportType;
  totalItems: number;
}) {
  return tenantDb.importJob.create({
    data: { ...params, status: "RUNNING" },
  });
}

export async function recordImportJobItem(params: {
  organizationId: string;
  importJobId: string;
  resourceId?: string | null;
  sourceUrl: string;
  success: boolean;
  errorMessage?: string | null;
}) {
  return tenantDb.importJobItem.create({ data: params });
}

export async function completeImportJob(
  organizationId: string,
  importJobId: string,
  counts: { successCount: number; failureCount: number },
) {
  const status = counts.failureCount === 0 ? "COMPLETED" : counts.successCount === 0 ? "FAILED" : "PARTIAL";
  return tenantDb.importJob.updateMany({
    where: { id: importJobId, organizationId },
    data: { status, successCount: counts.successCount, failureCount: counts.failureCount },
  });
}

export async function listImportJobs(organizationId: string) {
  return tenantDb.importJob.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}
