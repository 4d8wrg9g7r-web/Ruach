import type { ExtractedIntent, SafetyClassification } from "@ruach/shared-types";
import type {
  AIProvider,
  CategorizationInput,
  CategorizationOutput,
  ConversationalResponseInput,
  ConversationalResponseOutput,
} from "./AIProvider";

const CRISIS_KEYWORDS: Array<{ pattern: RegExp; category: SafetyClassification["category"] }> = [
  {
    pattern: /\b(kill myself|suicid|end my life|(don'?t|do not|not) want(ing)? to live)\b/i,
    category: "SELF_HARM",
  },
  { pattern: /\b(hurt myself|self[\s-]?harm|cutting myself)\b/i, category: "SELF_HARM" },
  { pattern: /\b(being abused|domestic violence|he hits me|she hits me)\b/i, category: "ABUSE" },
  { pattern: /\b(overdose|can'?t breathe|chest pain|heart attack)\b/i, category: "MEDICAL_EMERGENCY" },
  { pattern: /\b(child (is )?being (abused|hurt|touched))\b/i, category: "CHILD_SAFETY" },
  { pattern: /\b(threat(en(ing)?)? to kill|going to hurt (him|her|them))\b/i, category: "THREATS" },
];

/** Fixed vocabulary matching the seed library's topics -- deterministic, no network calls. */
const TOPIC_VOCABULARY = [
  "anxiety",
  "forgiveness",
  "leadership",
  "marriage",
  "grief",
  "waiting",
  "spiritual growth",
  "new believers",
  "prayer",
  "identity",
  "trust",
  "discouragement",
  "burnout",
  "communication",
  "conflict",
];

function findMatchingTopics(text: string): string[] {
  const lower = text.toLowerCase();
  return TOPIC_VOCABULARY.filter((topic) => lower.includes(topic));
}

function truncate(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trim()}...`;
}

export class MockAIProvider implements AIProvider {
  async classifySafety(message: string): Promise<SafetyClassification> {
    for (const { pattern, category } of CRISIS_KEYWORDS) {
      if (pattern.test(message)) return { category };
    }
    return { category: "ORDINARY" };
  }

  async extractIntent(message: string, _recentMessages: string[]): Promise<ExtractedIntent> {
    const topics = findMatchingTopics(message);
    return {
      primaryTopic: topics[0] ?? null,
      secondaryTopics: topics.slice(1),
      desiredResourceType: null,
      lifeSituation: topics[0] ?? null,
      needsClarification: topics.length === 0,
    };
  }

  async generateCategorization(input: CategorizationInput): Promise<CategorizationOutput> {
    const combinedText = [input.title, input.description ?? "", ...input.sourceDocuments.map((d) => d.text)].join(
      "\n",
    );
    const transcriptDoc = input.sourceDocuments.find((d) => d.sourceType === "TRANSCRIPT");
    const topics = findMatchingTopics(combinedText);
    const confidenceBase = transcriptDoc ? 0.85 : 0.6;

    const summarySource = transcriptDoc?.text ?? input.description ?? input.title;

    return {
      summary: {
        value: truncate(summarySource, 240),
        confidenceScore: confidenceBase,
        sourceDocumentId: transcriptDoc?.id ?? null,
        sourceExcerpt: transcriptDoc ? truncate(transcriptDoc.text, 160) : null,
      },
      primaryTopic: {
        value: topics[0] ?? "General",
        confidenceScore: topics.length > 0 ? confidenceBase : 0.3,
        sourceDocumentId: transcriptDoc?.id ?? null,
        sourceExcerpt: transcriptDoc ? truncate(transcriptDoc.text, 160) : null,
      },
      secondaryTopics: {
        value: topics.slice(1, 4),
        confidenceScore: confidenceBase - 0.1,
        sourceDocumentId: transcriptDoc?.id ?? null,
        sourceExcerpt: null,
      },
      questionsAnswered: {
        value: topics.slice(0, 2).map((topic) => `What does this resource say about ${topic}?`),
        confidenceScore: confidenceBase - 0.15,
        sourceDocumentId: null,
        sourceExcerpt: null,
      },
      lifeSituations: {
        value: topics.slice(0, 3),
        confidenceScore: confidenceBase - 0.1,
        sourceDocumentId: null,
        sourceExcerpt: null,
      },
      keyTakeaways: {
        value: [truncate(summarySource, 100)],
        confidenceScore: confidenceBase - 0.2,
        sourceDocumentId: transcriptDoc?.id ?? null,
        sourceExcerpt: null,
      },
    };
  }

  async generateConversationalResponse(input: ConversationalResponseInput): Promise<ConversationalResponseOutput> {
    if (input.candidateTitles.length === 0) {
      return {
        acknowledgment: "I looked through what's available here.",
        answer: "I couldn't find a resource that directly addresses that yet.",
        followUpQuestion: "Would you like to try a different topic?",
      };
    }

    const topicPhrase = input.intent.primaryTopic ? ` about ${input.intent.primaryTopic}` : "";
    return {
      acknowledgment: `It sounds like you're looking for something${topicPhrase}.`,
      answer: "These resources may be a good place to start.",
      followUpQuestion: input.candidateTitles.length > 1 ? "Would you like something shorter, or a full teaching?" : null,
    };
  }
}
