import { NextRequest, NextResponse } from "next/server";
import { websiteService, widgetService } from "@ruach/database";

export const runtime = "nodejs";

/**
 * Public, unauthenticated endpoint. The only tenant boundary here is the
 * publicWidgetId -> organization resolution inside getWidgetByPublicId (see that
 * function's doc comment). No dashboard session helpers may be imported into this file.
 */
export async function GET(req: NextRequest, context: { params: Promise<{ publicWidgetId: string }> }) {
  const { publicWidgetId } = await context.params;
  const widget = await widgetService.getWidgetByPublicId(publicWidgetId);
  if (!widget) {
    return NextResponse.json({ error: "Widget not found" }, { status: 404 });
  }

  const host = req.nextUrl.searchParams.get("host");
  if (host && !websiteService.isDomainAllowed(widget.website, host)) {
    return NextResponse.json({ error: "Domain not authorized for this widget" }, { status: 403 });
  }

  return NextResponse.json({
    publicWidgetId: widget.publicWidgetId,
    assistantName: widget.assistantName,
    welcomeMessage: widget.welcomeMessage,
    inputPlaceholder: widget.inputPlaceholder,
    launcherLabel: widget.launcherLabel,
    launcherPosition: widget.launcherPosition,
    primaryColor: widget.primaryColor,
    suggestedPrompts: widget.suggestedPrompts,
    privacyNotice: widget.privacyNotice,
    allowInlinePlayback: widget.allowInlinePlayback,
    showPlatformBranding: widget.showPlatformBranding,
  });
}
