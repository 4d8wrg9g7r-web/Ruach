import { z } from "zod";
import { ResourceTypeSchema } from "./resource";

export const ResponseTypeSchema = z.enum([
  "RESOURCE_RECOMMENDATION",
  "CLARIFYING_QUESTION",
  "NO_RESULTS",
  "ACTION_RESPONSE",
  "SAFETY_RESPONSE",
  // Small talk (a bare "hi", "thanks", "what can you do?") -- distinct from
  // NO_RESULTS specifically so Analytics' no-match rate and content-gap list, both
  // driven off responseType, stop counting a friendly "hello" as a failed content
  // search. See ChatPipeline's detectSmallTalk.
  "GREETING",
  "ERROR",
]);
export type ResponseType = z.infer<typeof ResponseTypeSchema>;

/**
 * Trusted card fields (title, url, embedUrl, thumbnail, creator, speaker, duration,
 * date, provider, resourceId) come ONLY from the database — the AI may only produce
 * `relevanceExplanation`. This schema is the enforcement point: the chat pipeline
 * builds ResourceRecommendation objects itself from validated DB rows and never lets
 * model output populate these fields directly (brief §35).
 */
export const ResourceRecommendationSchema = z.object({
  resourceId: z.string(),
  title: z.string(),
  resourceType: ResourceTypeSchema,
  provider: z.string(),
  creatorName: z.string().nullable(),
  speakerName: z.string().nullable(),
  seriesTitle: z.string().nullable(),
  publishedAt: z.string().nullable(),
  durationLabel: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  publicUrl: z.string().url(),
  embedUrl: z.string().url().nullable(),
  buttonLabel: z.enum(["Watch", "Listen", "Read", "Open"]),
  relevanceExplanation: z.string(),
});
export type ResourceRecommendation = z.infer<
  typeof ResourceRecommendationSchema
>;

export const SuggestedActionSchema = z.object({
  type: z.string(),
  label: z.string(),
  url: z.string().url().nullable(),
});
export type SuggestedAction = z.infer<typeof SuggestedActionSchema>;

export const ChatResponseSchema = z.object({
  conversationId: z.string(),
  messageId: z.string(),
  responseType: ResponseTypeSchema,
  acknowledgment: z.string().nullable(),
  answer: z.string(),
  resources: z.array(ResourceRecommendationSchema).max(3),
  followUpQuestion: z.string().nullable(),
  suggestedActions: z.array(SuggestedActionSchema),
  safetyCategory: z.string().nullable(),
});
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

export const ChatRequestSchema = z.object({
  publicWidgetId: z.string().min(1),
  sessionId: z.string().min(1),
  message: z.string().min(1).max(2000),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

/** Output contract for the (mock or real) AI intent-extraction step — brief §33 step 3. */
export const ExtractedIntentSchema = z.object({
  primaryTopic: z.string().nullable(),
  secondaryTopics: z.array(z.string()).default([]),
  desiredResourceType: ResourceTypeSchema.nullable(),
  lifeSituation: z.string().nullable(),
  needsClarification: z.boolean().default(false),
});
export type ExtractedIntent = z.infer<typeof ExtractedIntentSchema>;

/** Output contract for the safety-classification step — brief §33 step 2. */
export const SafetyClassificationSchema = z.object({
  category: z.enum([
    "ORDINARY",
    "SELF_HARM",
    "IMMEDIATE_DANGER",
    "ABUSE",
    "THREATS",
    "MEDICAL_EMERGENCY",
    "MENTAL_HEALTH_CRISIS",
    "CHILD_SAFETY",
    "OTHER_HIGH_RISK",
  ]),
});
export type SafetyClassification = z.infer<typeof SafetyClassificationSchema>;
