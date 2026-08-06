import type {
  ResourceProviderType,
  ResourceStatus,
  ResourceType,
  SourceDocumentType,
  TranscriptSource,
} from "@prisma/client";
import { tenantDb } from "../client";

export async function findResourceBySource(
  organizationId: string,
  sourceProvider: ResourceProviderType,
  externalId: string,
) {
  return tenantDb.resource.findFirst({ where: { organizationId, sourceProvider, externalId } });
}

export async function createResource(params: {
  organizationId: string;
  resourceType: ResourceType;
  sourceProvider: ResourceProviderType;
  externalId: string;
  title: string;
  description?: string | null;
  creatorName?: string | null;
  speakerName?: string | null;
  seriesTitle?: string | null;
  publishedAt?: Date | null;
  durationSeconds?: number | null;
  thumbnailUrl?: string | null;
  publicUrl: string;
  embedUrl?: string | null;
}) {
  return tenantDb.resource.create({
    data: { ...params, status: "DRAFT" },
  });
}

export async function listResources(organizationId: string, filter?: { status?: ResourceStatus }) {
  return tenantDb.resource.findMany({
    where: { organizationId, ...(filter?.status ? { status: filter.status } : {}) },
    orderBy: { createdAt: "desc" },
  });
}

/** Dashboard review queue: pending resources with their evidence, for confidence badges. */
export async function listReviewQueue(organizationId: string, limit = 10) {
  return tenantDb.resource.findMany({
    where: { organizationId, status: "REVIEW_REQUIRED" },
    include: { evidence: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getResource(organizationId: string, resourceId: string) {
  return tenantDb.resource.findFirst({
    where: { id: resourceId, organizationId },
    include: { sourceDocuments: true, evidence: true },
  });
}

/**
 * websiteId scopes to a single campus's widget: resources are visible if they're
 * org-wide (websiteId null) or scoped to that same campus. Omit it for org-wide
 * callers (e.g. the review queue) that should see every resource regardless of scope.
 */
export async function getResourcesByIds(organizationId: string, resourceIds: string[], websiteId?: string | null) {
  if (resourceIds.length === 0) return [];
  return tenantDb.resource.findMany({
    where: {
      organizationId,
      id: { in: resourceIds },
      status: "ACTIVE",
      ...(websiteId !== undefined ? { OR: [{ websiteId: null }, { websiteId }] } : {}),
    },
  });
}

export async function listActiveResources(organizationId: string) {
  return tenantDb.resource.findMany({ where: { organizationId, status: "ACTIVE" } });
}

/** Used to enforce the org's plan-tier indexed-resource cap before approving another one -- see billingService.assertUnderCap. */
export async function countActiveResources(organizationId: string) {
  return tenantDb.resource.count({ where: { organizationId, status: "ACTIVE" } });
}

export async function setTranscript(
  organizationId: string,
  resourceId: string,
  transcript: string,
  source: TranscriptSource,
) {
  const result = await tenantDb.resource.updateMany({
    where: { id: resourceId, organizationId },
    data: { transcript, cleanTranscript: transcript.trim(), transcriptSource: source },
  });
  if (result.count === 0) return null;
  return getResource(organizationId, resourceId);
}

export async function applyCategorization(
  organizationId: string,
  resourceId: string,
  categorization: {
    summary?: string;
    primaryTopic?: string;
    secondaryTopics?: string[];
    topics?: string[];
    scriptures?: string[];
    questionsAnswered?: string[];
    audiences?: string[];
    lifeSituations?: string[];
    keyTakeaways?: string[];
    searchDocument?: string;
    contentHash?: string;
  },
) {
  const result = await tenantDb.resource.updateMany({
    where: { id: resourceId, organizationId },
    data: { ...categorization, status: "REVIEW_REQUIRED" },
  });
  if (result.count === 0) return null;
  return getResource(organizationId, resourceId);
}

/** null = org-wide (visible to every campus's widgets). See getResourcesByIds's websiteId param. */
export async function setResourceWebsiteScope(organizationId: string, resourceId: string, websiteId: string | null) {
  const result = await tenantDb.resource.updateMany({
    where: { id: resourceId, organizationId },
    data: { websiteId },
  });
  if (result.count === 0) return null;
  return getResource(organizationId, resourceId);
}

export async function approveResource(organizationId: string, resourceId: string) {
  const result = await tenantDb.resource.updateMany({
    where: { id: resourceId, organizationId },
    data: { status: "ACTIVE" },
  });
  if (result.count === 0) return null;
  return getResource(organizationId, resourceId);
}

export async function archiveResource(organizationId: string, resourceId: string) {
  const result = await tenantDb.resource.updateMany({
    where: { id: resourceId, organizationId },
    data: { status: "ARCHIVED" },
  });
  if (result.count === 0) return null;
  return getResource(organizationId, resourceId);
}

export async function archiveResources(organizationId: string, resourceIds: string[]) {
  if (resourceIds.length === 0) return { count: 0 };
  return tenantDb.resource.updateMany({
    where: { id: { in: resourceIds }, organizationId },
    data: { status: "ARCHIVED" },
  });
}

/**
 * Hard delete. Cascades to ResourceSourceDocument/GeneratedMetadataEvidence/
 * ResourceCollection (schema onDelete: Cascade); ImportJobItem.resourceId is set
 * null (onDelete: SetNull) so import history is preserved. Irreversible -- the
 * caller (dashboard bulk-action UI) is responsible for confirming with the user
 * before calling this; archiveResources is the reversible alternative.
 */
export async function deleteResources(organizationId: string, resourceIds: string[]) {
  if (resourceIds.length === 0) return { count: 0 };
  return tenantDb.resource.deleteMany({
    where: { id: { in: resourceIds }, organizationId },
  });
}

export async function markIndexed(organizationId: string, resourceId: string) {
  return tenantDb.resource.updateMany({
    where: { id: resourceId, organizationId },
    data: { lastIndexedAt: new Date() },
  });
}

export async function addSourceDocument(params: {
  organizationId: string;
  resourceId: string;
  sourceType: SourceDocumentType;
  sourceUrl?: string | null;
  fileName?: string | null;
  originalText?: string | null;
  cleanText?: string | null;
  discoveredAutomatically?: boolean;
  approvedByUser?: boolean;
  /** Defaults true, matching every existing caller -- auto-discovered links (see link-discovery.ts) are the one case that overrides it to false until a human approves. */
  includedInAnalysis?: boolean;
}) {
  const { includedInAnalysis = true, ...rest } = params;
  return tenantDb.resourceSourceDocument.create({
    data: { ...rest, includedInAnalysis },
  });
}

export async function listSourceDocuments(organizationId: string, resourceId: string) {
  return tenantDb.resourceSourceDocument.findMany({ where: { organizationId, resourceId } });
}

/**
 * The "staff approved a discovered link" step (brief §22-23): stamps the fetched,
 * cleaned text onto the pending row and flips it into analysis. `id` (not just
 * resourceId+organizationId) narrows the update to exactly this one document.
 */
export async function approveSourceDocument(
  organizationId: string,
  resourceId: string,
  sourceDocumentId: string,
  text: { originalText: string; cleanText: string },
) {
  return tenantDb.resourceSourceDocument.updateMany({
    where: { id: sourceDocumentId, organizationId, resourceId },
    data: { ...text, approvedByUser: true, includedInAnalysis: true },
  });
}

/** Dismissing a discovered-but-unwanted link just removes the candidate row -- there's nothing worth keeping once staff has said "not this one." */
export async function rejectSourceDocument(organizationId: string, resourceId: string, sourceDocumentId: string) {
  return tenantDb.resourceSourceDocument.deleteMany({
    where: { id: sourceDocumentId, organizationId, resourceId },
  });
}

export async function addEvidence(params: {
  organizationId: string;
  resourceId: string;
  fieldName: string;
  generatedValue: string;
  sourceDocumentId?: string | null;
  sourceExcerpt?: string | null;
  confidenceScore: number;
}) {
  return tenantDb.generatedMetadataEvidence.create({ data: params });
}

export async function listEvidence(organizationId: string, resourceId: string) {
  return tenantDb.generatedMetadataEvidence.findMany({ where: { organizationId, resourceId } });
}
