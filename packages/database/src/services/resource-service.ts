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

export async function getResource(organizationId: string, resourceId: string) {
  return tenantDb.resource.findFirst({
    where: { id: resourceId, organizationId },
    include: { sourceDocuments: true, evidence: true },
  });
}

export async function getResourcesByIds(organizationId: string, resourceIds: string[]) {
  if (resourceIds.length === 0) return [];
  return tenantDb.resource.findMany({
    where: { organizationId, id: { in: resourceIds }, status: "ACTIVE" },
  });
}

export async function listActiveResources(organizationId: string) {
  return tenantDb.resource.findMany({ where: { organizationId, status: "ACTIVE" } });
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

export async function approveResource(organizationId: string, resourceId: string) {
  const result = await tenantDb.resource.updateMany({
    where: { id: resourceId, organizationId },
    data: { status: "ACTIVE" },
  });
  if (result.count === 0) return null;
  return getResource(organizationId, resourceId);
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
}) {
  return tenantDb.resourceSourceDocument.create({
    data: { ...params, includedInAnalysis: true },
  });
}

export async function listSourceDocuments(organizationId: string, resourceId: string) {
  return tenantDb.resourceSourceDocument.findMany({ where: { organizationId, resourceId } });
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
