import { importJobService, resourceService } from "@ruach/database";
import type { NormalizedExternalResource, ResourceProviderTypeValue } from "@ruach/shared-types";
import { detectProviderFromUrl, getResourceProvider } from "./registry";

export interface ImportResult {
  resource: Awaited<ReturnType<typeof resourceService.getResource>>;
  created: boolean;
}

async function persistNormalizedResource(
  organizationId: string,
  normalized: NormalizedExternalResource,
): Promise<ImportResult> {
  const existing = await resourceService.findResourceBySource(
    organizationId,
    normalized.sourceProvider,
    normalized.externalId,
  );
  if (existing) {
    return { resource: await resourceService.getResource(organizationId, existing.id), created: false };
  }

  const created = await resourceService.createResource({
    organizationId,
    resourceType: normalized.resourceType,
    sourceProvider: normalized.sourceProvider,
    externalId: normalized.externalId,
    title: normalized.title,
    description: normalized.description,
    creatorName: normalized.creatorName,
    publishedAt: normalized.publishedAt,
    durationSeconds: normalized.durationSeconds,
    thumbnailUrl: normalized.thumbnailUrl,
    publicUrl: normalized.publicUrl,
    embedUrl: normalized.embedUrl,
  });

  await resourceService.addSourceDocument({
    organizationId,
    resourceId: created.id,
    sourceType: "PROVIDER_METADATA",
    originalText: normalized.description,
    cleanText: normalized.description,
    discoveredAutomatically: true,
    approvedByUser: true,
  });

  const provider = getResourceProvider(normalized.sourceProvider);
  if (provider.getTranscript) {
    const transcript = await provider.getTranscript({
      provider: normalized.sourceProvider,
      externalId: normalized.externalId,
      url: normalized.publicUrl,
    });
    if (transcript) {
      await resourceService.setTranscript(organizationId, created.id, transcript.text, transcript.source);
      await resourceService.addSourceDocument({
        organizationId,
        resourceId: created.id,
        sourceType: "TRANSCRIPT",
        originalText: transcript.text,
        cleanText: transcript.text,
        discoveredAutomatically: true,
        approvedByUser: true,
      });
    }
  }

  return { resource: await resourceService.getResource(organizationId, created.id), created: true };
}

/**
 * Single-URL import (brief §29 "Individual URL workflow"): detect provider, validate,
 * fetch normalized metadata + transcript, persist as a draft Resource with its source
 * documents. Wrapped in an ImportJob record for visibility in the dashboard's Imports
 * screen. Duplicate detection is by (organizationId, sourceProvider, externalId), never
 * by title (brief §18).
 */
export async function importResourceFromUrl(organizationId: string, url: string): Promise<ImportResult> {
  const detected = detectProviderFromUrl(url);
  const providerType: ResourceProviderTypeValue = detected?.provider ?? "GENERIC_URL";

  const importJob = await importJobService.createImportJob({
    organizationId,
    provider: providerType,
    importType: "SINGLE",
    totalItems: 1,
  });

  try {
    const provider = getResourceProvider(providerType);
    const validation = await provider.validateUrl(url);
    if (!validation.valid || !validation.externalId) {
      await importJobService.recordImportJobItem({
        organizationId,
        importJobId: importJob.id,
        sourceUrl: url,
        success: false,
        errorMessage: validation.reason ?? "URL could not be validated.",
      });
      throw new Error(validation.reason ?? "URL could not be validated.");
    }

    const normalized = await provider.getResource({
      provider: providerType,
      externalId: validation.externalId,
      url,
    });

    const result = await persistNormalizedResource(organizationId, normalized);

    await importJobService.recordImportJobItem({
      organizationId,
      importJobId: importJob.id,
      resourceId: result.resource?.id,
      sourceUrl: url,
      success: true,
    });
    await importJobService.completeImportJob(organizationId, importJob.id, { successCount: 1, failureCount: 0 });

    return result;
  } catch (err) {
    await importJobService.completeImportJob(organizationId, importJob.id, { successCount: 0, failureCount: 1 });
    throw err;
  }
}
