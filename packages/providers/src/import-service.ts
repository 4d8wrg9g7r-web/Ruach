import { importJobService, resourceService } from "@ruach/database";
import type { NormalizedExternalResource, ResourceProviderTypeValue } from "@ruach/shared-types";
import { extractCandidateLinks } from "./link-discovery";
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

  // Candidate "supporting document" links (sermon notes, study guides) found in the
  // description -- recorded as pending, unfetched rows (brief §22-23). Nothing is
  // fetched and nothing feeds AI categorization until a human approves each one on
  // the resource review screen; see resourceService.approveSourceDocument.
  for (const url of extractCandidateLinks(normalized.description, normalized.title)) {
    await resourceService.addSourceDocument({
      organizationId,
      resourceId: created.id,
      sourceType: "WEB_PAGE",
      sourceUrl: url,
      discoveredAutomatically: true,
      approvedByUser: false,
      includedInAnalysis: false,
    });
  }

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

export interface BulkImportResult {
  importJobId: string;
  totalItems: number;
  createdResourceIds: string[];
  existingResourceIds: string[];
  failureCount: number;
}

/**
 * Shared by every bulk (listResources-based) import -- YouTube channels, RSS feeds,
 * and any future bulk source. Runs synchronously in this request (no background
 * queue exists yet, by design -- see docs/architecture.md). Each item is persisted
 * as a DRAFT resource via the same persistNormalizedResource path (and the same
 * organizationId+sourceProvider+externalId dedup) as a single-URL import --
 * re-running a bulk import is safe and just skips items already imported. Approval
 * (and whether to auto-approve) is the caller's decision, not this function's -- see
 * the dashboard server actions that call importYouTubeChannel/importRSSFeed.
 */
async function runBulkImport(
  organizationId: string,
  provider: ResourceProviderTypeValue,
  importType: "CHANNEL" | "FEED",
  items: NormalizedExternalResource[],
): Promise<BulkImportResult> {
  const importJob = await importJobService.createImportJob({
    organizationId,
    provider,
    importType,
    totalItems: items.length,
  });

  const createdResourceIds: string[] = [];
  const existingResourceIds: string[] = [];
  let failureCount = 0;

  for (const normalized of items) {
    try {
      const result = await persistNormalizedResource(organizationId, normalized);
      if (result.resource) {
        (result.created ? createdResourceIds : existingResourceIds).push(result.resource.id);
      }
      await importJobService.recordImportJobItem({
        organizationId,
        importJobId: importJob.id,
        resourceId: result.resource?.id,
        sourceUrl: normalized.publicUrl,
        success: true,
      });
    } catch (err) {
      failureCount += 1;
      await importJobService.recordImportJobItem({
        organizationId,
        importJobId: importJob.id,
        sourceUrl: normalized.publicUrl,
        success: false,
        errorMessage: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  await importJobService.completeImportJob(organizationId, importJob.id, {
    successCount: createdResourceIds.length + existingResourceIds.length,
    failureCount,
  });

  return { importJobId: importJob.id, totalItems: items.length, createdResourceIds, existingResourceIds, failureCount };
}

/**
 * Bulk YouTube channel import (brief §14: "Import through... connected YouTube
 * channel" / "Bulk channel import"). No OAuth needed -- see YouTubeProvider's
 * listResources() doc comment. For an N-video channel this is dominated by N/25 or
 * so YouTube API round trips plus N sequential database writes, since transcripts
 * are never fetched for YouTube (metadata-only, brief §14/docs/youtube-integration.md).
 */
export async function importYouTubeChannel(organizationId: string, channelUrl: string): Promise<BulkImportResult> {
  const provider = getResourceProvider("YOUTUBE");
  if (!provider.listResources) {
    throw new Error("The active YouTube provider does not support channel import.");
  }
  const videos = await provider.listResources({ organizationId, channelUrl });
  return runBulkImport(organizationId, "YOUTUBE", "CHANNEL", videos);
}

/**
 * Bulk RSS/Atom feed import for blogs and podcasts (brief §13's anticipated future
 * RSSProvider -- see docs/rss-integration.md). No credentials needed -- a feed URL
 * is a public document, fetched through the same SSRF-guarded fetcher as generic
 * URL import.
 */
export async function importRSSFeed(organizationId: string, feedUrl: string): Promise<BulkImportResult> {
  const provider = getResourceProvider("RSS");
  if (!provider.listResources) {
    throw new Error("The active RSS provider does not support feed import.");
  }
  const items = await provider.listResources({ organizationId, feedUrl });
  return runBulkImport(organizationId, "RSS", "FEED", items);
}
