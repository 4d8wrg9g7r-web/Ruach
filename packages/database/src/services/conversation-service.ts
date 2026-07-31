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
