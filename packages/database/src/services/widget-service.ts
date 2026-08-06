import type { LauncherPosition } from "@prisma/client";
import { rawDb, tenantDb } from "../client";

export async function createWidget(params: {
  organizationId: string;
  websiteId: string;
  name: string;
  assistantName?: string;
  welcomeMessage?: string;
  suggestedPrompts?: string[];
}) {
  return tenantDb.widgetConfiguration.create({
    data: {
      organizationId: params.organizationId,
      websiteId: params.websiteId,
      name: params.name,
      ...(params.assistantName ? { assistantName: params.assistantName } : {}),
      ...(params.welcomeMessage ? { welcomeMessage: params.welcomeMessage } : {}),
      suggestedPrompts: params.suggestedPrompts ?? [],
    },
  });
}

export async function listWidgets(organizationId: string) {
  return tenantDb.widgetConfiguration.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
    include: { website: true },
  });
}

/** Used to enforce the org's plan-tier widget cap before creating a new one -- see billingService.assertUnderCap. */
export async function countWidgets(organizationId: string) {
  return tenantDb.widgetConfiguration.count({ where: { organizationId } });
}

export async function updateWidget(
  organizationId: string,
  widgetId: string,
  updates: Partial<{
    assistantName: string;
    welcomeMessage: string;
    inputPlaceholder: string;
    launcherLabel: string;
    launcherPosition: LauncherPosition;
    primaryColor: string;
    logoUrl: string | null;
    suggestedPrompts: string[];
    privacyNotice: string;
    noResultMessage: string;
    maxRecommendations: number;
    allowInlinePlayback: boolean;
    showPlatformBranding: boolean;
    status: "ACTIVE" | "INACTIVE";
  }>,
) {
  const result = await tenantDb.widgetConfiguration.updateMany({
    where: { id: widgetId, organizationId },
    data: updates,
  });
  if (result.count === 0) return null;
  return getWidget(organizationId, widgetId);
}

export async function getWidget(organizationId: string, widgetId: string) {
  return tenantDb.widgetConfiguration.findFirst({
    where: { id: widgetId, organizationId },
    include: { website: true },
  });
}

/**
 * Public lookup: resolves an unauthenticated widget request's publicWidgetId to its
 * organization. This is the ONLY tenant boundary for public widget/chat requests —
 * there is no session to fall back on. Uses rawDb intentionally, since organizationId
 * is not yet known; it's what this query determines. Every subsequent query in the
 * request path (retrieval, resource lookups, conversation writes) MUST use the
 * organizationId resolved here via tenantDb. Covered by a dedicated cross-tenant
 * isolation test in apps/dashboard.
 */
export async function getWidgetByPublicId(publicWidgetId: string) {
  const widget = await rawDb.widgetConfiguration.findUnique({
    where: { publicWidgetId },
    include: { website: true },
  });
  if (!widget || widget.status !== "ACTIVE") return null;
  return widget;
}
