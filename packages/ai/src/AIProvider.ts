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

export interface ConversationalResponseInput {
  message: string;
  intent: ExtractedIntent;
  candidateTitles: string[];
}

export interface ConversationalResponseOutput {
  acknowledgment: string;
  answer: string;
  followUpQuestion: string | null;
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
}
