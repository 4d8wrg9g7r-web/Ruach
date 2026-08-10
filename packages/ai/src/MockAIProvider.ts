import type { ExtractedIntent, SafetyClassification } from "@ruach/shared-types";
import type {
  ActionLinkCandidate,
  ActionLinkMatchOutput,
  AIProvider,
  CategorizationInput,
  CategorizationOutput,
  ConversationalResponseInput,
  ConversationalResponseOutput,
} from "./AIProvider";

/** Dropped from both the message and link text before overlap scoring -- common enough to inflate the score of an unrelated link without meaning anything ("where can I find the page about the thing"). */
const MATCH_STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "do", "does", "did", "can", "could", "would", "should",
  "where", "what", "when", "who", "how", "i", "you", "your", "we", "our", "to", "for", "of", "in", "on",
  "at", "and", "or", "find", "get", "go", "see", "check", "out", "please", "me", "it", "that", "this",
]);

function matchTokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 1 && !MATCH_STOPWORDS.has(word)),
  );
}

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
    if (input.candidates.length === 0) {
      return {
        acknowledgment: "I looked through what's available here.",
        answer: "I couldn't find a resource that directly addresses that yet.",
        followUpQuestion: "Would you like to try a different topic?",
      };
    }

    const topicPhrase = input.intent.primaryTopic ? ` about ${input.intent.primaryTopic}` : "";
    const top = input.candidates[0]!;
    const reason = top.primaryTopic ? ` -- it speaks directly to ${top.primaryTopic.toLowerCase()}` : "";
    return {
      acknowledgment: `It sounds like you're looking for something${topicPhrase}.`,
      answer: `"${top.title}" might be a good place to start${reason}.`,
      followUpQuestion: input.candidates.length > 1 ? "Would you like something shorter, or a full teaching?" : null,
    };
  }

  async matchActionLink(message: string, links: ActionLinkCandidate[]): Promise<ActionLinkMatchOutput> {
    const messageTokens = matchTokens(message);
    if (messageTokens.size === 0) return { matchedLinkId: null };

    let best: { id: string; score: number } | null = null;
    for (const link of links) {
      const linkTokens = matchTokens(`${link.label} ${link.description ?? ""}`);
      if (linkTokens.size === 0) continue;

      let overlap = 0;
      for (const token of messageTokens) {
        if (linkTokens.has(token)) overlap += 1;
      }
      // Score is overlap as a fraction of the MESSAGE's (typically short) vocabulary,
      // not the link's -- "where can I find the notes?" reduces to the single token
      // "notes", which should confidently match a link labeled/described with that
      // word regardless of how much other, non-overlapping text is in its
      // description. Scoring against the link's vocabulary instead would penalize
      // longer, more helpful descriptions for no reason. The tradeoff: a short
      // message that happens to share its one meaningful word with an unrelated
      // link's description can false-positive -- acceptable here since this is only
      // the no-network-call mock heuristic (OpenAIProvider's real matchActionLink
      // reasons about intent, not just word overlap), and a wrong link is a minor
      // UX miss, not a safety issue.
      const score = overlap / messageTokens.size;
      if (overlap > 0 && score >= 0.5 && (!best || score > best.score)) {
        best = { id: link.id, score };
      }
    }
    return { matchedLinkId: best?.id ?? null };
  }
}
