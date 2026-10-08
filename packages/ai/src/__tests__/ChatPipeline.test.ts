import { describe, expect, it, vi } from "vitest";

vi.mock("@ruach/database", () => ({
  organizationalLinkService: { listActiveOrganizationalLinks: async () => [] },
  resourceService: { getResourcesByIds: async () => [] },
}));

import { FORWARD_TO_STAFF_ACTION } from "@ruach/shared-types";
import type { RetrievalProvider } from "@ruach/retrieval";
import { ChatPipeline } from "../ChatPipeline";
import { MockAIProvider } from "../MockAIProvider";

const emptyRetrieval = { search: async () => [] } as unknown as RetrievalProvider;

function input(overrides: { contactEmail: string | null; publicWebsiteUrl?: string | null }) {
  return {
    organizationId: "org_1",
    widgetId: "widget_1",
    websiteId: null,
    conversationId: "conv_1",
    messageId: "msg_1",
    message: "What time does the youth group meet on Wednesdays?",
    recentMessages: [],
    maxRecommendations: 3,
    noResultMessage:
      "I'm sorry, I'm not sure of the answer to your question. I was built to match you with sermon content.",
    priorityContentType: null,
    organizationName: "Grace Church",
    suggestedPrompts: [],
    publicWebsiteUrl: null,
    ...overrides,
  };
}

describe("ChatPipeline NO_RESULTS fallback", () => {
  const pipeline = new ChatPipeline(new MockAIProvider(), emptyRetrieval);

  it("offers to forward to staff when the org has a contact email", async () => {
    const response = await pipeline.respond(input({ contactEmail: "office@grace.org" }));
    expect(response.responseType).toBe("NO_RESULTS");
    expect(response.answer).toBe(
      "I'm sorry, I'm not sure of the answer to your question. I was built to match you with sermon content. If you'd like, I can forward this conversation to a member of our staff so that they can answer your question.",
    );
    expect(response.suggestedActions).toEqual([
      { type: FORWARD_TO_STAFF_ACTION, label: "Forward to staff", url: null },
    ]);
  });

  it("makes no forward offer when there's nowhere to send it", async () => {
    const response = await pipeline.respond(
      input({ contactEmail: null, publicWebsiteUrl: "https://grace.org" }),
    );
    expect(response.responseType).toBe("NO_RESULTS");
    expect(response.answer).not.toContain("forward");
    expect(response.answer).toContain("https://grace.org");
    expect(response.suggestedActions).toEqual([]);
  });
});
