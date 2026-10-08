import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import {
  conversationService,
  organizationService,
  websiteService,
  widgetService,
} from "@ruach/database";
import { getEmailProvider } from "@ruach/email";
import { ForwardToStaffRequestSchema } from "@ruach/shared-types";
import { checkRateLimit, getClientIp } from "../../../../../lib/rate-limit";

export const runtime = "nodejs";

// A visitor forwards a conversation once, maybe twice -- anything past this is a
// bot using the church's inbox as a relay.
const SESSION_LIMIT = { max: 3, windowMs: 60 * 60 * 1000 };
const IP_LIMIT = { max: 10, windowMs: 60 * 60 * 1000 };

/** Long chats are trimmed to their most recent turns -- staff need the question, not the whole history. */
const MAX_TRANSCRIPT_MESSAGES = 30;

/**
 * Public, unauthenticated endpoint behind ChatWidget's "Forward to staff" button
 * (offered on NO_RESULTS replies -- see ChatPipeline). Emails the visitor's
 * transcript to the campus's questionForwardingEmails (or the org-wide default --
 * see websiteService.questionForwardingRecipients) with replyTo set to the visitor, so a
 * staff reply goes straight to them; Ruach never sees the reply. Same tenant
 * boundary as chat/route.ts: organizationId comes only from publicWidgetId, and the
 * conversation is looked up by that widget + the visitor's own sessionId.
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
  const parsed = ForwardToStaffRequestSchema.safeParse(body);
  if (!parsed.success || parsed.data.publicWidgetId !== publicWidgetId) {
    return NextResponse.json(
      { error: "Please check your name and email and try again." },
      { status: 400 },
    );
  }
  const { sessionId, name, email, note } = parsed.data;

  const sessionCheck = checkRateLimit(
    `forward:session:${widget.id}:${sessionId}`,
    SESSION_LIMIT.max,
    SESSION_LIMIT.windowMs,
  );
  const clientIp = getClientIp(req.headers);
  const ipCheck = clientIp
    ? checkRateLimit(
        `forward:ip:${widget.id}:${clientIp}`,
        IP_LIMIT.max,
        IP_LIMIT.windowMs,
      )
    : { allowed: true };
  if (!sessionCheck.allowed || !ipCheck.allowed) {
    return NextResponse.json(
      {
        error:
          "This conversation has already been forwarded. Our staff will be in touch.",
      },
      { status: 429 },
    );
  }

  const organization = await organizationService.getOrganization(
    widget.organizationId,
  );
  const recipients = websiteService.questionForwardingRecipients(
    widget.website,
    organization,
  );
  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "Forwarding isn't available for this church yet." },
      { status: 409 },
    );
  }

  const conversation = await conversationService.getSessionTranscript({
    organizationId: widget.organizationId,
    widgetId: widget.id,
    sessionId,
  });
  if (!conversation || conversation.messages.length === 0) {
    return NextResponse.json(
      { error: "There's no conversation to forward yet." },
      { status: 404 },
    );
  }

  // The widget belongs to one campus (Website), so name it -- a multi-campus
  // church's shared inbox needs to know which campus's visitor is asking.
  const campusName = widget.website.name;
  const messages = conversation.messages.slice(-MAX_TRANSCRIPT_MESSAGES);
  const transcript = messages
    .map((m) => `${m.role === "USER" ? name : "Assistant"}: ${m.content}`)
    .join("\n\n");
  const appOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const text = [
    `${name} asked a question on the ${campusName} website chat that the assistant couldn't answer, and asked for a member of staff to follow up.`,
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Campus: ${campusName}`,
    note ? `\nTheir note:\n${note}` : null,
    "",
    "Reply to this email to answer them directly.",
    "",
    "--- Conversation ---",
    "",
    transcript,
    "",
    "---",
    `View it in Ruach: ${appOrigin}/conversations/${conversation.id}`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    await Promise.all(
      recipients.map((to) =>
        getEmailProvider().sendEmail({
          to,
          replyTo: email,
          subject: `A visitor question from the ${campusName} chat`,
          text,
        }),
      ),
    );
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json(
      {
        error: "We couldn't forward that right now. Please try again shortly.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
