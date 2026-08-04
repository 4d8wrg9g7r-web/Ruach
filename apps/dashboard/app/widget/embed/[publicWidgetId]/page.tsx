import { notFound } from "next/navigation";
import { actionLinkService, organizationService, websiteService, widgetService } from "@ruach/database";
import { ChatWidget } from "./ChatWidget";

/**
 * previewColor/previewLogo are cosmetic-only render overrides used exclusively by
 * the widget builder's live preview iframe (WidgetCustomizePanel.tsx) -- never
 * persisted, never affect the chat/data path, and absent on every real embed (the
 * loader script and the "Open full-page preview" link never send them).
 */
export default async function WidgetEmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicWidgetId: string }>;
  searchParams: Promise<{ host?: string; previewColor?: string; previewLogo?: string }>;
}) {
  const { publicWidgetId } = await params;
  const { host, previewColor, previewLogo } = await searchParams;

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
  const actionLinks = await actionLinkService.listActiveActionLinks(widget.organizationId);

  return (
    <ChatWidget
      publicWidgetId={widget.publicWidgetId}
      organizationName={organization?.name ?? widget.assistantName}
      assistantName={widget.assistantName}
      welcomeMessage={widget.welcomeMessage}
      inputPlaceholder={widget.inputPlaceholder}
      suggestedPrompts={widget.suggestedPrompts}
      primaryColor={previewColor ?? widget.primaryColor}
      logoUrl={previewLogo !== undefined ? previewLogo || null : widget.logoUrl}
      privacyNotice={widget.privacyNotice}
      showPlatformBranding={widget.showPlatformBranding}
      actionLinks={actionLinks.map((link) => ({ id: link.id, label: link.label, url: link.url }))}
      host={host ?? null}
    />
  );
}
