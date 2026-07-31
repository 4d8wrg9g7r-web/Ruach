import { createHash } from "node:crypto";
import { resourceService } from "@ruach/database";
import type { AIProvider } from "./AIProvider";

function buildSearchDocument(params: {
  title: string;
  speakerName: string | null;
  seriesTitle: string | null;
  publicUrl: string;
  primaryTopic: string;
  secondaryTopics: string[];
  summary: string;
  questionsAnswered: string[];
  lifeSituations: string[];
  transcript: string | null;
}): string {
  // Canonical search document per brief §31. This is what LocalRetrievalProvider's
  // full-text search runs against -- the model never reconstructs trusted resource
  // data from this text; it's used purely for matching, and card fields are always
  // read from the Resource row itself (brief §35).
  return [
    `# ${params.title}`,
    params.speakerName ? `SPEAKER: ${params.speakerName}` : null,
    params.seriesTitle ? `SERIES: ${params.seriesTitle}` : null,
    `TOPICS: ${[params.primaryTopic, ...params.secondaryTopics].join(", ")}`,
    "## Summary",
    params.summary,
    "## Questions This Resource May Help Answer",
    ...params.questionsAnswered.map((q) => `- ${q}`),
    "## Life Situations",
    ...params.lifeSituations.map((s) => `- ${s}`),
    params.transcript ? "## Transcript" : null,
    params.transcript,
  ]
    .filter((line): line is string => line !== null && line !== undefined)
    .join("\n");
}

/**
 * Runs AI categorization for a resource and writes both the generated metadata and
 * the evidence trail (brief §25) back to the database. Callers only pass a resourceId
 * -- all source material is read from ResourceSourceDocument rows already attached to
 * the resource, so re-running categorization after a subscriber approves/edits a
 * supporting document picks up the change automatically.
 */
export class CategorizationService {
  constructor(private readonly aiProvider: AIProvider) {}

  async categorize(organizationId: string, resourceId: string): Promise<void> {
    const resource = await resourceService.getResource(organizationId, resourceId);
    if (!resource) throw new Error(`Resource ${resourceId} not found in organization ${organizationId}`);

    const sourceDocuments = resource.sourceDocuments
      .filter((doc) => doc.includedInAnalysis && doc.cleanText)
      .map((doc) => ({ id: doc.id, sourceType: doc.sourceType, text: doc.cleanText as string }));

    const output = await this.aiProvider.generateCategorization({
      title: resource.title,
      description: resource.description,
      sourceDocuments,
    });

    const searchDocument = buildSearchDocument({
      title: resource.title,
      speakerName: resource.speakerName,
      seriesTitle: resource.seriesTitle,
      publicUrl: resource.publicUrl,
      primaryTopic: output.primaryTopic.value,
      secondaryTopics: output.secondaryTopics.value,
      summary: output.summary.value,
      questionsAnswered: output.questionsAnswered.value,
      lifeSituations: output.lifeSituations.value,
      transcript: resource.cleanTranscript,
    });

    const contentHash = createHash("sha256")
      .update(resource.title + (resource.cleanTranscript ?? "") + (resource.description ?? ""))
      .digest("hex");

    await resourceService.applyCategorization(organizationId, resourceId, {
      summary: output.summary.value,
      primaryTopic: output.primaryTopic.value,
      secondaryTopics: output.secondaryTopics.value,
      topics: [output.primaryTopic.value, ...output.secondaryTopics.value],
      questionsAnswered: output.questionsAnswered.value,
      lifeSituations: output.lifeSituations.value,
      keyTakeaways: output.keyTakeaways.value,
      searchDocument,
      contentHash,
    });

    const fields = [
      { fieldName: "summary", generated: output.summary },
      { fieldName: "primaryTopic", generated: output.primaryTopic },
      { fieldName: "secondaryTopics", generated: output.secondaryTopics },
      { fieldName: "questionsAnswered", generated: output.questionsAnswered },
      { fieldName: "lifeSituations", generated: output.lifeSituations },
      { fieldName: "keyTakeaways", generated: output.keyTakeaways },
    ] as const;

    for (const { fieldName, generated } of fields) {
      await resourceService.addEvidence({
        organizationId,
        resourceId,
        fieldName,
        generatedValue: Array.isArray(generated.value) ? generated.value.join(", ") : generated.value,
        sourceDocumentId: generated.sourceDocumentId,
        sourceExcerpt: generated.sourceExcerpt,
        confidenceScore: generated.confidenceScore,
      });
    }
  }
}
