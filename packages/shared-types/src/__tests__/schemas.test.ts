import { describe, expect, it } from "vitest";
import { ChatResponseSchema } from "../chat";
import { NormalizedExternalResourceSchema } from "../provider";
import { ResourceTypeSchema } from "../resource";

describe("ChatResponseSchema", () => {
  it("accepts a well-formed RESOURCE_RECOMMENDATION response", () => {
    const result = ChatResponseSchema.safeParse({
      conversationId: "conv_1",
      messageId: "msg_1",
      responseType: "RESOURCE_RECOMMENDATION",
      acknowledgment: "Here's what I found.",
      answer: "These may help.",
      resources: [
        {
          resourceId: "res_1",
          title: "Example",
          resourceType: "SERMON",
          provider: "YOUTUBE",
          creatorName: null,
          speakerName: null,
          seriesTitle: null,
          publishedAt: null,
          durationLabel: "10 min",
          thumbnailUrl: null,
          publicUrl: "https://example.com/video",
          embedUrl: null,
          buttonLabel: "Watch",
          relevanceExplanation: "Matches the topic.",
        },
      ],
      followUpQuestion: null,
      suggestedActions: [],
      safetyCategory: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects more than 3 resources (brief §36: no more than three primary resources)", () => {
    const resource = {
      resourceId: "res_1",
      title: "Example",
      resourceType: "SERMON",
      provider: "YOUTUBE",
      creatorName: null,
      speakerName: null,
      seriesTitle: null,
      publishedAt: null,
      durationLabel: null,
      thumbnailUrl: null,
      publicUrl: "https://example.com/video",
      embedUrl: null,
      buttonLabel: "Watch",
      relevanceExplanation: "Matches.",
    };
    const result = ChatResponseSchema.safeParse({
      conversationId: "conv_1",
      messageId: "msg_1",
      responseType: "RESOURCE_RECOMMENDATION",
      acknowledgment: null,
      answer: "These may help.",
      resources: [resource, resource, resource, resource],
      followUpQuestion: null,
      suggestedActions: [],
      safetyCategory: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("NormalizedExternalResourceSchema", () => {
  it("defaults optional fields when omitted", () => {
    const result = NormalizedExternalResourceSchema.parse({
      sourceProvider: "YOUTUBE",
      externalId: "abc123",
      resourceType: "VIDEO",
      title: "Example",
      publicUrl: "https://youtube.com/watch?v=abc123",
    });
    expect(result.description).toBeNull();
    expect(result.captionsAvailable).toBe(false);
  });
});

describe("ResourceTypeSchema", () => {
  it("rejects an invalid resource type", () => {
    expect(ResourceTypeSchema.safeParse("NOT_A_TYPE").success).toBe(false);
  });
});
