import type { ImportJobStatus, ResourceProviderType } from "@prisma/client";
import { rawDb, tenantDb } from "../client";

export async function listContentSources(organizationId: string) {
  return tenantDb.contentSource.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Every source with autoSyncEnabled across every org, for the scheduled sync run.
 * Uses rawDb intentionally (like organizationsForUser/user-service) -- the cron job
 * has no single tenant to scope to, it iterates all of them.
 */
export async function listDueForAutoSync() {
  return rawDb.contentSource.findMany({ where: { autoSyncEnabled: true } });
}

export async function createContentSource(params: {
  organizationId: string;
  provider: ResourceProviderType;
  sourceUrl: string;
  label?: string | null;
  autoSyncEnabled?: boolean;
  autoApprove?: boolean;
}) {
  return tenantDb.contentSource.create({
    data: { ...params, autoSyncEnabled: params.autoSyncEnabled ?? true, autoApprove: params.autoApprove ?? false },
  });
}

/**
 * Idempotent version of createContentSource for the "track this for auto-sync"
 * checkbox on the manual import forms -- re-checking it on a URL that's already
 * tracked (e.g. re-running an import) should be a no-op, not a unique-constraint
 * error on (organizationId, provider, sourceUrl).
 */
export async function trackContentSource(params: {
  organizationId: string;
  provider: ResourceProviderType;
  sourceUrl: string;
  autoApprove?: boolean;
}) {
  const existing = await tenantDb.contentSource.findFirst({
    where: { organizationId: params.organizationId, provider: params.provider, sourceUrl: params.sourceUrl },
  });
  if (existing) return existing;
  return createContentSource(params);
}

export async function setAutoSyncEnabled(organizationId: string, contentSourceId: string, autoSyncEnabled: boolean) {
  return tenantDb.contentSource.updateMany({
    where: { id: contentSourceId, organizationId },
    data: { autoSyncEnabled },
  });
}

export async function setAutoApprove(organizationId: string, contentSourceId: string, autoApprove: boolean) {
  return tenantDb.contentSource.updateMany({
    where: { id: contentSourceId, organizationId },
    data: { autoApprove },
  });
}

export async function recordSyncResult(
  organizationId: string,
  contentSourceId: string,
  result: { status: ImportJobStatus; error?: string | null },
) {
  return tenantDb.contentSource.updateMany({
    where: { id: contentSourceId, organizationId },
    data: { lastSyncedAt: new Date(), lastSyncStatus: result.status, lastSyncError: result.error ?? null },
  });
}

export async function deleteContentSource(organizationId: string, contentSourceId: string) {
  return tenantDb.contentSource.deleteMany({ where: { id: contentSourceId, organizationId } });
}
