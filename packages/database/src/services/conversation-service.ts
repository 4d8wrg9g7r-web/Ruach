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

/**
 * Dashboard "Conversations" log: paginated, most-recently-active first, with just
 * enough joined data (widget name, message count, last message preview) to render a
 * list row without a second round-trip per row. `widgetId` is accepted now even
 * though no page passes it yet -- filtering by widget is the obvious next control to
 * add, and threading it through the service now keeps that a page-only change later.
 */
export async function listConversations(
  organizationId: string,
  params: { page?: number; pageSize?: number; widgetId?: string } = {},
) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.pageSize ?? 25;
  const where = { organizationId, ...(params.widgetId ? { widgetId: params.widgetId } : {}) };

  const [conversations, total] = await Promise.all([
    tenantDb.conversation.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        widget: { select: { name: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { messages: true } },
      },
    }),
    tenantDb.conversation.count({ where }),
  ]);

  return {
    conversations: conversations.map((c) => ({
      id: c.id,
      widgetId: c.widgetId,
      widgetName: c.widget.name,
      sessionId: c.sessionId,
      messageCount: c._count.messages,
      lastMessage: c.messages[0] ?? null,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Full transcript for the conversation detail page -- messages in reading order (oldest first), unlike getRecentMessages which serves the chat pipeline's own "recent context" needs in newest-first order. */
export async function getConversationDetail(organizationId: string, conversationId: string) {
  return tenantDb.conversation.findFirst({
    where: { id: conversationId, organizationId },
    include: {
      widget: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
}
