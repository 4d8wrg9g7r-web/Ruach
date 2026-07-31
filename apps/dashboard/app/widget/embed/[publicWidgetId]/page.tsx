import { notFound } from "next/navigation";
import { websiteService, widgetService } from "@ruach/database";
import { ChatWidget } from "./ChatWidget";

export default async function WidgetEmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicWidgetId: string }>;
  searchParams: Promise<{ host?: string }>;
}) {
  const { publicWidgetId } = await params;
  const { host } = await searchParams;

  const widget = await widgetService.getWidgetByPublicId(publicWidgetId);
  if (!widget) notFound();

  if (host && !websiteService.isDomainAllowed(widget.website, host)) {
    return (
      <main className="p-4 text-sm text-slate-500">
        This assistant is not enabled for this domain.
      </main>
    );
  }

  return (
    <ChatWidget
      publicWidgetId={widget.publicWidgetId}
      assistantName={widget.assistantName}
      welcomeMessage={widget.welcomeMessage}
      inputPlaceholder={widget.inputPlaceholder}
      suggestedPrompts={widget.suggestedPrompts}
      primaryColor={widget.primaryColor}
      privacyNotice={widget.privacyNotice}
      showPlatformBranding={widget.showPlatformBranding}
      host={host ?? null}
    />
  );
}
