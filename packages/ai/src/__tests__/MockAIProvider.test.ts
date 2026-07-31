import { describe, expect, it } from "vitest";
import { MockAIProvider } from "../MockAIProvider";

describe("MockAIProvider.classifySafety", () => {
  const provider = new MockAIProvider();

  it("classifies ordinary resource questions as ORDINARY", async () => {
    const result = await provider.classifySafety("Do you have anything about anxiety?");
    expect(result.category).toBe("ORDINARY");
  });

  it("flags self-harm language", async () => {
    const result = await provider.classifySafety("I don't want to live anymore");
    expect(result.category).toBe("SELF_HARM");
  });

  it("flags medical emergency language", async () => {
    const result = await provider.classifySafety("I think I'm having a heart attack");
    expect(result.category).toBe("MEDICAL_EMERGENCY");
  });
});

describe("MockAIProvider.extractIntent", () => {
  const provider = new MockAIProvider();

  it("extracts a known topic from the vocabulary", async () => {
    const result = await provider.extractIntent("I need help understanding forgiveness", []);
    expect(result.primaryTopic).toBe("forgiveness");
    expect(result.needsClarification).toBe(false);
  });

  it("flags needsClarification when no topic matches", async () => {
    const result = await provider.extractIntent("asdkjfh qwoeiru", []);
    expect(result.primaryTopic).toBeNull();
    expect(result.needsClarification).toBe(true);
  });
});

describe("MockAIProvider.generateCategorization", () => {
  const provider = new MockAIProvider();

  it("gives transcript-backed resources higher confidence than metadata-only ones", async () => {
    const withTranscript = await provider.generateCategorization({
      title: "Trusting God in the Waiting",
      description: "A message about waiting.",
      sourceDocuments: [{ id: "doc_1", sourceType: "TRANSCRIPT", text: "This message is about waiting and trust." }],
    });
    const withoutTranscript = await provider.generateCategorization({
      title: "Trusting God in the Waiting",
      description: "A message about waiting.",
      sourceDocuments: [],
    });
    expect(withTranscript.summary.confidenceScore).toBeGreaterThan(withoutTranscript.summary.confidenceScore);
  });
});
