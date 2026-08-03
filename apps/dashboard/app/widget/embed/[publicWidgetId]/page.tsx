import { notFound } from "next/navigation";
import { organizationService, websiteService, widgetService } from "@ruach/database";
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
      <main className="flex h-screen items-center justify-center bg-surface-muted p-4 text-center text-sm text-ink-secondary">
        This assistant is not enabled for this domain.
      </main>
    );
  }

  const organization = await organizationService.getOrganization(widget.organizationId);

  return (
    <ChatWidget
      publicWidgetId={widget.publicWidgetId}
      organizationName={organization?.name ?? widget.assistantName}
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
