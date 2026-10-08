import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { websiteService } from "@ruach/database";
import { SermonLibrary } from "./SermonLibrary";
import { getLibraryCatalog, getLibraryWidget } from "../../../../lib/sermon-library";
import { noIndexMetadata } from "../../../../lib/no-index-metadata";

export const metadata: Metadata = noIndexMetadata;

/**
 * Public sermon library embed. Loaded inside an iframe by sermon-library.js on a
 * church's own sermon page (or pasted directly as an <iframe>). Same tenant boundary
 * as /widget/embed: everything is resolved from publicWidgetId, and the catalog is
 * scoped to that widget's organization and campus (website). See
 * lib/sermon-library.ts for why both lookups are cached.
 */
export default async function SermonLibraryPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicWidgetId: string }>;
  searchParams: Promise<{ host?: string; chat?: string }>;
}) {
  const { publicWidgetId } = await params;
  const { host, chat } = await searchParams;

  const widget = await getLibraryWidget(publicWidgetId);
  if (!widget) notFound();

  if (host && !websiteService.isDomainAllowed(widget.website, host)) {
    return (
      <main className="flex min-h-[200px] items-center justify-center bg-surface-muted p-4 text-center text-sm text-ink-secondary">
        This sermon library is not enabled for this domain.
      </main>
    );
  }

  const items = await getLibraryCatalog(widget.organizationId, widget.websiteId, widget.libraryResourceTypes);

  return (
    <SermonLibrary
      publicWidgetId={widget.publicWidgetId}
      organizationName={widget.organizationName}
      inputPlaceholder={widget.inputPlaceholder}
      suggestedPrompts={widget.suggestedPrompts}
      primaryColor={widget.primaryColor}
      showPlatformBranding={widget.showPlatformBranding}
      items={items}
      host={host ?? null}
      showChat={chat !== "off"}
    />
  );
}
