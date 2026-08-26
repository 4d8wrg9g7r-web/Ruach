import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  conversationService,
  organizationService,
  websiteService,
  widgetService,
} from "@ruach/database";
import { ChatPipeline, getAIProvider } from "@ruach/ai";
import { LocalRetrievalProvider } from "@ruach/retrieval";
import {
  ChatRequestSchema,
  ResourceTypeGroupSchema,
} from "@ruach/shared-types";
import { checkRateLimit, getClientIp } from "../../../../../lib/rate-limit";

export const runtime = "nodejs";

// Deliberately generous -- this exists to stop runaway/bot/abuse traffic from
// generating unbounded OpenAI cost, not to throttle a real visitor mid-conversation.
// Per-session catches one runaway client; per-IP catches someone cycling sessionIds
// (a client-generated, unauthenticated value) to dodge the per-session limit.
const SESSION_LIMIT = { max: 20, windowMs: 10 * 60 * 1000 };
const IP_LIMIT = { max: 60, windowMs: 10 * 60 * 1000 };

/**
 * Public, unauthenticated endpoint -- see config/route.ts's doc comment for the same
 * tenant-boundary note. This is the route covered by the dedicated cross-tenant
 * isolation test: a request against widget A must never be able to surface a resource
 * belonging to org B, and the only thing enforcing that is organizationId resolved
 * from publicWidgetId here, threaded through every downstream call.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ publicWidgetId: string }> },
) {
  const { publicWidgetId } = await context.params;
  const widget = await widgetService.getWidgetByPublicId(publicWidgetId);
  if (!widget) {
    return NextResponse.json({ error: "Widget not found" }, { status: 404 });
  }

  const host = req.nextUrl.searchParams.get("host");
  if (host && !websiteService.isDomainAllowed(widget.website, host)) {
    return NextResponse.json(
      { error: "Domain not authorized for this widget" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success || parsed.data.publicWidgetId !== publicWidgetId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { sessionId, message } = parsed.data;

  // Rejected here, before any conversation/AI work, so an over-limit request never
  // reaches the OpenAI call that actually costs money.
  const sessionCheck = checkRateLimit(
    `session:${widget.id}:${sessionId}`,
    SESSION_LIMIT.max,
    SESSION_LIMIT.windowMs,
  );
  if (!sessionCheck.allowed) {
    return NextResponse.json(
      {
        error:
          "You've sent a lot of messages recently. Please wait a bit before trying again.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(sessionCheck.retryAfterSeconds) },
      },
    );
  }
  const clientIp = getClientIp(req.headers);
  if (clientIp) {
    const ipCheck = checkRateLimit(
      `ip:${widget.id}:${clientIp}`,
      IP_LIMIT.max,
      IP_LIMIT.windowMs,
    );
    if (!ipCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests from this network. Please try again later.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(ipCheck.retryAfterSeconds) },
        },
      );
    }
  }

  const conversation = await conversationService.getOrCreateConversation({
    organizationId: widget.organizationId,
    widgetId: widget.id,
    sessionId,
  });

  const recentMessages = await conversationService.getRecentMessages(
    widget.organizationId,
    conversation.id,
    6,
  );

  await conversationService.appendMessage({
    organizationId: widget.organizationId,
    conversationId: conversation.id,
    role: "USER",
    content: message,
  });

  // Stored as a plain string (see schema.prisma's doc comment on
  // Organization.priorityContentType), so re-validate against the real enum here --
  // a stale/invalid value degrades to "no priority" rather than reaching
  // ChatPipeline with something it doesn't recognize.
  const organization = await organizationService.getOrganization(
    widget.organizationId,
  );
  const priorityContentTypeParsed = ResourceTypeGroupSchema.safeParse(
    organization?.priorityContentType,
  );
  const priorityContentType = priorityContentTypeParsed.success
    ? priorityContentTypeParsed.data
    : null;

  const pipeline = new ChatPipeline(
    getAIProvider(),
    new LocalRetrievalProvider(),
  );
  const response = await pipeline.respond({
    organizationId: widget.organizationId,
    widgetId: widget.id,
    websiteId: widget.websiteId,
    conversationId: conversation.id,
    messageId: randomUUID(),
    message,
    recentMessages: recentMessages.reverse().map((m) => m.content),
    maxRecommendations: widget.maxRecommendations,
    noResultMessage: widget.noResultMessage,
    priorityContentType,
    organizationName: organization?.name ?? widget.website.name,
    suggestedPrompts: widget.suggestedPrompts,
    contactEmail: organization?.contactEmail ?? null,
    publicWebsiteUrl: organization?.publicWebsiteUrl ?? null,
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
