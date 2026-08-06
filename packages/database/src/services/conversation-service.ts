import type { MessageRole } from "@prisma/client";
import { tenantDb } from "../client";

export async function getOrCreateConversation(params: {
  organizationId: string;
  widgetId: string;
  sessionId: string;
}) {
  const existing = await tenantDb.conversation.findFirst({
    where: {
      organizationId: params.organizationId,
      widgetId: params.widgetId,
      sessionId: params.sessionId,
    },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;
  return tenantDb.conversation.create({ data: params });
}

export async function appendMessage(params: {
  organizationId: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  responseType?: string;
  recommendedResourceIds?: string[];
}) {
  return tenantDb.conversationMessage.create({
    data: {
      organizationId: params.organizationId,
      conversationId: params.conversationId,
      role: params.role,
      content: params.content,
      responseType: params.responseType,
      recommendedResourceIds: params.recommendedResourceIds ?? [],
    },
  });
}

export async function getRecentMessages(organizationId: string, conversationId: string, limit = 10) {
  return tenantDb.conversationMessage.findMany({
    where: { organizationId, conversationId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** Dashboard "Questions Answered" metric: assistant replies that returned a recommendation. */
export async function countRecommendationResponses(organizationId: string) {
  return tenantDb.conversationMessage.count({
    where: { organizationId, role: "ASSISTANT", responseType: "RESOURCE_RECOMMENDATION" },
  });
}

/** Guided-onboarding checklist's "embed the widget" step: real chat traffic is a more honest signal than Widget.status (which defaults to ACTIVE at creation regardless of whether the script tag was ever installed anywhere). */
export async function countConversations(organizationId: string) {
  return tenantDb.conversation.count({ where: { organizationId } });
}
