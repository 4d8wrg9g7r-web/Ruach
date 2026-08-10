import type { ExtractedIntent, SafetyClassification } from "@ruach/shared-types";

export interface CategorizationSourceDocument {
  id: string;
  sourceType: string;
  text: string;
}

export interface CategorizationInput {
  title: string;
  description: string | null;
  sourceDocuments: CategorizationSourceDocument[];
}

export interface GeneratedField<T> {
  value: T;
  confidenceScore: number;
  sourceDocumentId: string | null;
  sourceExcerpt: string | null;
}

export interface CategorizationOutput {
  summary: GeneratedField<string>;
  primaryTopic: GeneratedField<string>;
  secondaryTopics: GeneratedField<string[]>;
  questionsAnswered: GeneratedField<string[]>;
  lifeSituations: GeneratedField<string[]>;
  keyTakeaways: GeneratedField<string[]>;
}

/** Real, already-validated data about a candidate resource -- enough for the model to explain genuine relevance without inventing anything. */
export interface ConversationalCandidate {
  title: string;
  primaryTopic: string | null;
  summary: string | null;
}

export interface ConversationalResponseInput {
  message: string;
  intent: ExtractedIntent;
  candidates: ConversationalCandidate[];
}

export interface ConversationalResponseOutput {
  acknowledgment: string;
  answer: string;
  followUpQuestion: string | null;
}

/**
 * An org's OrganizationalLink rows -- link candidates for matchLink, deliberately
 * generic/source-agnostic here (the AI layer has no concept of OrganizationalLink vs.
 * ActionLink, that distinction lives in ChatPipeline/the database layer). Never
 * resource content.
 */
export interface LinkCandidate {
  id: string;
  label: string;
  description: string | null;
}

export interface LinkMatchOutput {
  /** Null when nothing in the list is a confident match for a direct "where do I find X" / "how do I get to Y" request -- ChatPipeline falls through to the normal resource pipeline in that case, it never forces a match. */
  matchedLinkId: string | null;
}

/**
 * The AI seam. MockAIProvider (deterministic, no network calls) is the default so the
 * repository runs without OPENAI_API_KEY (brief §57). OpenAIProvider will implement the
 * same interface and only activate when the key is set -- ChatPipeline and
 * CategorizationService are written against this interface and never against a
 * specific provider.
 */
export interface AIProvider {
  classifySafety(message: string): Promise<SafetyClassification>;
  extractIntent(message: string, recentMessages: string[]): Promise<ExtractedIntent>;
  generateCategorization(input: CategorizationInput): Promise<CategorizationOutput>;
  generateConversationalResponse(input: ConversationalResponseInput): Promise<ConversationalResponseOutput>;
  /** "Where can I find the notes?" should return a link, not a ministry-toned resource recommendation -- see ChatPipeline's link-matching step. */
  matchLink(message: string, links: LinkCandidate[]): Promise<LinkMatchOutput>;
}
