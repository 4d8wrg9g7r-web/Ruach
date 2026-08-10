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

describe("MockAIProvider.matchLink", () => {
  const provider = new MockAIProvider();
  const links = [
    { id: "link_notes", label: "Notes", description: "This week's sermon notes and study guide" },
    { id: "link_give", label: "Give", description: null },
  ];

  it("matches a direct navigational request to the right link", async () => {
    const result = await provider.matchLink("Where can I find the notes?", links);
    expect(result.matchedLinkId).toBe("link_notes");
  });

  it("matches on the label alone when there's no description", async () => {
    const result = await provider.matchLink("How do I give?", links);
    expect(result.matchedLinkId).toBe("link_give");
  });

  it("does not match an unrelated content question", async () => {
    const result = await provider.matchLink("Do you have anything about anxiety?", links);
    expect(result.matchedLinkId).toBeNull();
  });

  it("does not match a struggle/content request even when it shares a word with a link's description", async () => {
    const prayerLinks = [
      { id: "link_prayer_request", label: "Prayer Request", description: "Submit a prayer request to our prayer team" },
    ];
    const result = await provider.matchLink("I've been hitting a wall in prayer", prayerLinks);
    expect(result.matchedLinkId).toBeNull();
  });

  it("returns null when there are no links to match against", async () => {
    const result = await provider.matchLink("Where can I find the notes?", []);
    expect(result.matchedLinkId).toBeNull();
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
