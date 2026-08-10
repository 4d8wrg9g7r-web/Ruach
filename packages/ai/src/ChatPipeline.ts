import { organizationalLinkService, resourceService } from "@ruach/database";
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
  /** The widget's campus (Website), if any -- see getResourcesByIds's websiteId param. */
  websiteId: string | null;
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

/**
 * ts_headline's excerpt is pulled straight out of the resource's searchDocument
 * (buildSearchDocument in CategorizationService.ts), which uses Markdown-style
 * headers ("# Title", "## Summary") and "- " bullets purely to help full-text search
 * relevance -- it was never meant to be read verbatim. When the matched excerpt
 * window lands on/near one of those lines, the literal #/##/- characters leak into
 * what's shown to a visitor as "why this matches your question," so strip them here.
 */
function cleanExcerpt(excerpt: string): string {
  return excerpt
    .replace(/#{1,6}\s*/g, "")
    .replace(/(^|\s)-\s+/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function buttonLabelFor(resourceType: string): ResourceRecommendation["buttonLabel"] {
  if (resourceType === "PODCAST" || resourceType === "AUDIO") return "Listen";
  if (resourceType === "ARTICLE" || resourceType === "DOCUMENT" || resourceType === "DEVOTIONAL") return "Read";
  if (resourceType === "VIDEO" || resourceType === "SERMON" || resourceType === "COURSE") return "Watch";
  return "Open";
}

/**
 * These represent someone potentially in danger right now, or a specific threat to a
 * person -- the response must stay 100% focused on getting them to real help, with
 * nothing else competing for attention. Every other non-ORDINARY category still runs
 * the full pipeline and blends the safety disclaimer with matching resources, if any
 * -- e.g. a message classified MENTAL_HEALTH_CRISIS about grief can still surface a
 * grief-related sermon alongside the disclaimer, since dismissing the visitor's
 * actual question entirely isn't the only way to take a safety concern seriously.
 */
const ACUTE_SAFETY_CATEGORIES = new Set(["SELF_HARM", "IMMEDIATE_DANGER", "CHILD_SAFETY", "MEDICAL_EMERGENCY", "THREATS"]);

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
    const safetyMessage = SAFETY_MESSAGES[safety.category] ?? SAFETY_MESSAGES.OTHER_HIGH_RISK;
    if (safety.category !== "ORDINARY" && ACUTE_SAFETY_CATEGORIES.has(safety.category)) {
      return ChatResponseSchema.parse({
        ...base,
        responseType: "SAFETY_RESPONSE",
        acknowledgment: null,
        answer: safetyMessage,
        resources: [],
        followUpQuestion: null,
        suggestedActions: [],
        safetyCategory: safety.category,
      });
    }
    const isNonAcuteSafetyConcern = safety.category !== "ORDINARY";

    // Step 2.5: organizational-link matching. "Where can I find the notes?" should
    // get a direct link, not a ministry-toned resource recommendation -- deliberately
    // separate from ActionLink (the widget's always-visible quick-action buttons,
    // e.g. Give/Contact): OrganizationalLink rows are never shown as buttons, they
    // only ever surface here, when a visitor's question specifically calls for one.
    // This is a cheaper check that runs before intent extraction/retrieval and
    // short-circuits the rest of the pipeline on a match. Skipped entirely for any
    // non-ORDINARY safety category (even non-acute) -- a bare link response would
    // feel dismissive layered under a safety disclaimer, and the existing blended
    // safety+resource flow below already handles that case.
    if (!isNonAcuteSafetyConcern) {
      const links = await organizationalLinkService.listActiveOrganizationalLinks(input.organizationId);
      if (links.length > 0) {
        const match = await this.aiProvider.matchLink(
          message,
          links.map((link) => ({ id: link.id, label: link.label, description: link.description })),
        );
        // OrganizationalLink.url is format-validated at creation (Zod .url()), but
        // guard here too rather than trust that invariant blindly -- a malformed url
        // must fall through to the normal pipeline, not crash the response via
        // ChatResponseSchema's z.string().url().
        const matchedLink = match.matchedLinkId ? links.find((link) => link.id === match.matchedLinkId) : undefined;
        const hasValidUrl = matchedLink ? isValidHttpUrl(matchedLink.url) : false;
        if (matchedLink && hasValidUrl) {
          return ChatResponseSchema.parse({
            ...base,
            responseType: "ACTION_RESPONSE",
            acknowledgment: null,
            answer: `Here's ${matchedLink.label}.`,
            resources: [],
            followUpQuestion: null,
            suggestedActions: [{ type: "LINK", label: matchedLink.label, url: matchedLink.url }],
            safetyCategory: null,
          });
        }
      }
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
    // organizationId AND status === 'ACTIVE' against the database directly. Passing
    // websiteId also enforces campus scoping here -- a resource scoped to campus A
    // never reaches campus B's widget, regardless of what retrieval returned.
    const candidateIds = candidates.map((c) => c.resourceId);
    const validResources = await resourceService.getResourcesByIds(input.organizationId, candidateIds, input.websiteId);
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
      candidates: ranked.map((r) => ({
        title: r.resource.title,
        primaryTopic: r.resource.primaryTopic,
        summary: r.resource.summary,
      })),
    });

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
      relevanceExplanation: (score.matchedExcerpt && cleanExcerpt(score.matchedExcerpt)) || `Matches what you're looking for.`,
    }));

    if (isNonAcuteSafetyConcern) {
      // Blended response: the safety disclaimer leads (as acknowledgment, shown
      // first), but -- unlike the acute categories above -- we still surface
      // matching resources if the visitor's underlying question found any. Taking a
      // safety concern seriously doesn't have to mean withholding the content they
      // actually asked for.
      return ChatResponseSchema.parse({
        ...base,
        responseType: "SAFETY_RESPONSE",
        acknowledgment: safetyMessage,
        answer: resources.length > 0 ? conversational.answer : input.noResultMessage,
        resources,
        followUpQuestion: conversational.followUpQuestion,
        suggestedActions: [],
        safetyCategory: safety.category,
      });
    }

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
