import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { conversationService, websiteService, widgetService } from "@ruach/database";
import { ChatPipeline, getAIProvider } from "@ruach/ai";
import { LocalRetrievalProvider } from "@ruach/retrieval";
import { ChatRequestSchema } from "@ruach/shared-types";

export const runtime = "nodejs";

/**
 * Public, unauthenticated endpoint -- see config/route.ts's doc comment for the same
 * tenant-boundary note. This is the route covered by the dedicated cross-tenant
 * isolation test: a request against widget A must never be able to surface a resource
 * belonging to org B, and the only thing enforcing that is organizationId resolved
 * from publicWidgetId here, threaded through every downstream call.
 */
export async function POST(req: NextRequest, context: { params: Promise<{ publicWidgetId: string }> }) {
  const { publicWidgetId } = await context.params;
  const widget = await widgetService.getWidgetByPublicId(publicWidgetId);
  if (!widget) {
    return NextResponse.json({ error: "Widget not found" }, { status: 404 });
  }

  const host = req.nextUrl.searchParams.get("host");
  if (host && !websiteService.isDomainAllowed(widget.website, host)) {
    return NextResponse.json({ error: "Domain not authorized for this widget" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success || parsed.data.publicWidgetId !== publicWidgetId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { sessionId, message } = parsed.data;

  const conversation = await conversationService.getOrCreateConversation({
    organizationId: widget.organizationId,
    widgetId: widget.id,
    sessionId,
  });

  const recentMessages = await conversationService.getRecentMessages(widget.organizationId, conversation.id, 6);

  await conversationService.appendMessage({
    organizationId: widget.organizationId,
    conversationId: conversation.id,
    role: "USER",
    content: message,
  });

  const pipeline = new ChatPipeline(getAIProvider(), new LocalRetrievalProvider());
  const response = await pipeline.respond({
    organizationId: widget.organizationId,
    widgetId: widget.id,
    conversationId: conversation.id,
    messageId: randomUUID(),
    message,
    recentMessages: recentMessages.reverse().map((m) => m.content),
    maxRecommendations: widget.maxRecommendations,
    noResultMessage: widget.noResultMessage,
  });

  await conversationService.appendMessage({
    organizationId: widget.organizationId,
    conversationId: conversation.id,
    role: "ASSISTANT",
    content: response.answer,
    responseType: response.responseType,
    recommendedResourceIds: response.resources.map((r) => r.resourceId),
  });

  return NextResponse.json(response);
}
