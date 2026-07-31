import { resourceService } from "@ruach/database";
import {
  ChatResponseSchema,
  type ChatResponse,
  type ResourceRecommendation,
} from "@ruach/shared-types";
import type { RetrievalProvider } from "@ruach/retrieval";
import type { AIProvider } from "./AIProvider";

const MAX_MESSAGE_LENGTH = 2000;

export interface ChatPipelineInput {
  organizationId: string;
  widgetId: string;
  conversationId: string;
  messageId: string;
  message: string;
  recentMessages: string[];
  maxRecommendations: number;
  noResultMessage: string;
}

function formatDurationLabel(seconds: number | null): string | null {
  if (!seconds) return null;
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return "<1 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining === 0 ? `${hours} hr` : `${hours} hr ${remaining} min`;
}

function buttonLabelFor(resourceType: string): ResourceRecommendation["buttonLabel"] {
  if (resourceType === "PODCAST" || resourceType === "AUDIO") return "Listen";
  if (resourceType === "ARTICLE" || resourceType === "DOCUMENT" || resourceType === "DEVOTIONAL") return "Read";
  if (resourceType === "VIDEO" || resourceType === "SERMON" || resourceType === "COURSE") return "Watch";
  return "Open";
}

const SAFETY_MESSAGES: Record<string, string> = {
  SELF_HARM:
    "It sounds like you might be going through something really heavy right now. I'm not able to provide crisis support, but please reach out to a crisis line or someone you trust right away.",
  IMMEDIATE_DANGER: "If you or someone else is in immediate danger, please contact local emergency services right now.",
  ABUSE: "What you're describing matters and deserves real support. Please consider reaching out to a local support organization or someone you trust.",
  THREATS: "This sounds serious. Please contact local authorities or someone you trust right away.",
  MEDICAL_EMERGENCY: "This sounds like it could be a medical emergency. Please contact emergency services right away.",
  MENTAL_HEALTH_CRISIS: "It sounds like you're going through a lot right now. Please reach out to a mental health crisis line or someone you trust.",
  CHILD_SAFETY: "What you're describing is serious. Please contact local authorities or a child-safety organization right away.",
  OTHER_HIGH_RISK: "This sounds like something that needs more support than I can offer here. Please reach out to someone you trust.",
};

/**
 * The controlled pipeline from brief §33. A visitor's message is never sent directly
 * into an unrestricted AI response -- every step here narrows what the model can
 * influence, and step 6 (database validation) is what actually prevents fabricated or
 * cross-tenant recommendations from reaching the widget.
 */
export class ChatPipeline {
  constructor(
    private readonly aiProvider: AIProvider,
    private readonly retrievalProvider: RetrievalProvider,
  ) {}

  async respond(input: ChatPipelineInput): Promise<ChatResponse> {
    const base = {
      conversationId: input.conversationId,
      messageId: input.messageId,
    };

    // Step 1: validate input.
    const message = input.message.trim();
    if (message.length === 0 || message.length > MAX_MESSAGE_LENGTH) {
      return ChatResponseSchema.parse({
        ...base,
        responseType: "ERROR",
        acknowledgment: null,
        answer: "I'm having trouble reading that message. Could you try rephrasing it?",
        resources: [],
        followUpQuestion: null,
        suggestedActions: [],
        safetyCategory: null,
      });
    }

    // Step 2: safety classification.
    const safety = await this.aiProvider.classifySafety(message);
    if (safety.category !== "ORDINARY") {
      return ChatResponseSchema.parse({
        ...base,
        responseType: "SAFETY_RESPONSE",
        acknowledgment: null,
        answer: SAFETY_MESSAGES[safety.category] ?? SAFETY_MESSAGES.OTHER_HIGH_RISK,
        resources: [],
        followUpQuestion: null,
        suggestedActions: [],
        safetyCategory: safety.category,
      });
    }

    // Step 3: intent extraction.
    const intent = await this.aiProvider.extractIntent(message, input.recentMessages);

    // Step 4: query generation (kept simple for milestone 1: message + extracted topics).
    const queryText = [message, intent.primaryTopic, ...intent.secondaryTopics].filter(Boolean).join(" ");

    // Step 5: retrieval -- request more candidates than we'll display.
    const candidates = await this.retrievalProvider.search({
      organizationId: input.organizationId,
      queryText,
      limit: 15,
    });

    // Step 6: database validation. This is the real tenant + approval boundary: even
    // if retrieval returned a stale or cross-tenant id, getResourcesByIds re-filters by
    // organizationId AND status === 'ACTIVE' against the database directly.
    const candidateIds = candidates.map((c) => c.resourceId);
    const validResources = await resourceService.getResourcesByIds(input.organizationId, candidateIds);
    const scoreByResourceId = new Map(candidates.map((c) => [c.resourceId, c]));

    // Step 7: ranking (semantic score from retrieval; ties broken by transcript presence).
    const ranked = validResources
      .map((resource) => ({ resource, score: scoreByResourceId.get(resource.id) }))
      .filter((r): r is { resource: typeof validResources[number]; score: NonNullable<typeof r.score> } => Boolean(r.score))
      .sort((a, b) => {
        if (b.score.relevanceScore !== a.score.relevanceScore) return b.score.relevanceScore - a.score.relevanceScore;
        return (b.resource.cleanTranscript ? 1 : 0) - (a.resource.cleanTranscript ? 1 : 0);
      })
      .slice(0, input.maxRecommendations);

    // Step 8: response generation -- the model only ever produces acknowledgment/
    // answer/followUpQuestion text. It never sees or influences resourceId, title,
    // url, thumbnail, etc.
    const conversational = await this.aiProvider.generateConversationalResponse({
      message,
      intent,
      candidateTitles: ranked.map((r) => r.resource.title),
    });

    if (ranked.length === 0) {
      return ChatResponseSchema.parse({
        ...base,
        responseType: "NO_RESULTS",
        acknowledgment: null,
        answer: input.noResultMessage,
        resources: [],
        followUpQuestion: conversational.followUpQuestion,
        suggestedActions: [],
        safetyCategory: null,
      });
    }

    // Step 9: structured response. Every trusted field is read directly off the
    // validated database row (brief §35) -- relevanceExplanation is the only
    // resource-level field the model contributes, and even that is derived from
    // deterministic candidate titles, not free text about the resource.
    const resources: ResourceRecommendation[] = ranked.map(({ resource, score }) => ({
      resourceId: resource.id,
      title: resource.title,
      resourceType: resource.resourceType,
      provider: resource.sourceProvider,
      creatorName: resource.creatorName,
      speakerName: resource.speakerName,
      seriesTitle: resource.seriesTitle,
      publishedAt: resource.publishedAt ? resource.publishedAt.toISOString() : null,
      durationLabel: formatDurationLabel(resource.durationSeconds),
      thumbnailUrl: resource.thumbnailUrl,
      publicUrl: resource.publicUrl,
      embedUrl: resource.embedUrl,
      buttonLabel: buttonLabelFor(resource.resourceType),
      relevanceExplanation: score.matchedExcerpt ?? `Matches what you're looking for.`,
    }));

    return ChatResponseSchema.parse({
      ...base,
      responseType: "RESOURCE_RECOMMENDATION",
      acknowledgment: conversational.acknowledgment,
      answer: conversational.answer,
      resources,
      followUpQuestion: conversational.followUpQuestion,
      suggestedActions: [],
      safetyCategory: null,
    });
  }
}
