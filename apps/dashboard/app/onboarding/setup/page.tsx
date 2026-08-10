import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  auditService,
  billingService,
  organizationService,
  resourceService,
  websiteService,
  widgetService,
} from "@ruach/database";
import { importResourceFromUrl } from "@ruach/providers";
import { SetupWizard } from "../../../components/SetupWizard";
import { getCurrentOrganization, getCurrentUser, requireCurrentUser, requireOrgRole } from "../../../lib/session";
import { noIndexMetadata } from "../../../lib/no-index-metadata";

export const metadata: Metadata = noIndexMetadata;

async function wizardCreateWebsiteAction(formData: FormData): Promise<{ id: string; name: string }> {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN"]);

  const name = String(formData.get("name") ?? "").trim();
  const primaryDomain = String(formData.get("primaryDomain") ?? "").trim();
  if (!name || !primaryDomain) throw new Error("Name and domain are required.");

  const plan = billingService.getPlan(organization.planKey);
  const websiteCount = await websiteService.countWebsites(organization.id);
  billingService.assertUnderCap(websiteCount, plan.maxWebsites, "website");

  const website = await websiteService.createWebsite({ organizationId: organization.id, name, primaryDomain });
  const user = await getCurrentUser();
  await auditService.recordAuditEvent({
    organizationId: organization.id,
    actorUserId: user?.id,
    action: "website.created",
    targetType: "Website",
    targetId: website.id,
    metadata: { primaryDomain, viaSetupWizard: true },
  });
  return { id: website.id, name: website.name };
}

async function wizardCreateWidgetAction(formData: FormData): Promise<{ id: string; name: string }> {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN"]);

  const name = String(formData.get("name") ?? "").trim();
  const websiteId = String(formData.get("websiteId") ?? "");
  if (!name || !websiteId) throw new Error("Name and website are required.");

  const plan = billingService.getPlan(organization.planKey);
  const widgetCount = await widgetService.countWidgets(organization.id);
  billingService.assertUnderCap(widgetCount, plan.maxWidgets, "widget");

  const widget = await widgetService.createWidget({ organizationId: organization.id, websiteId, name });
  const user = await getCurrentUser();
  await auditService.recordAuditEvent({
    organizationId: organization.id,
    actorUserId: user?.id,
    action: "widget.created",
    targetType: "WidgetConfiguration",
    targetId: widget.id,
    metadata: { viaSetupWizard: true },
  });
  return { id: widget.id, name: widget.name };
}

/** Skippable -- an empty url just moves the wizard forward without importing anything, rather than blocking on content that isn't ready yet. */
async function wizardImportResourceAction(formData: FormData): Promise<{ id: string; title: string } | { skipped: true }> {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);

  const url = String(formData.get("url") ?? "").trim();
  if (!url) return { skipped: true };

  const result = await importResourceFromUrl(organization.id, url);
  if (!result.resource) throw new Error("Couldn't import that URL -- check it's a public link and try again.");
  return { id: result.resource.id, title: result.resource.title };
}

async function wizardCustomizeWidgetAction(formData: FormData): Promise<{ ok: true }> {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);

  const widgetId = String(formData.get("widgetId") ?? "");
  const assistantName = String(formData.get("assistantName") ?? "").trim();
  const welcomeMessage = String(formData.get("welcomeMessage") ?? "").trim();
  const primaryColor = String(formData.get("primaryColor") ?? "").trim();
  if (!widgetId) throw new Error("No widget to customize.");

  await widgetService.updateWidget(organization.id, widgetId, {
    ...(assistantName ? { assistantName } : {}),
    ...(welcomeMessage ? { welcomeMessage } : {}),
    ...(primaryColor ? { primaryColor } : {}),
  });
  return { ok: true };
}

async function wizardFinishAction(): Promise<void> {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await organizationService.markOnboardingWizardSeen(organization.id);
  redirect("/dashboard");
}

export default async function SetupWizardPage() {
  await requireCurrentUser();
  const organization = await getCurrentOrganization();
  if (!organization) redirect("/onboarding");

  const [websites, widgets, resources] = await Promise.all([
    websiteService.listWebsites(organization.id),
    widgetService.listWidgets(organization.id),
    resourceService.listResources(organization.id),
  ]);

  const appOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const existingWidget = widgets[0];

  return (
    <SetupWizard
      organizationName={organization.name}
      appOrigin={appOrigin}
      initialWebsite={websites[0] ? { id: websites[0].id, name: websites[0].name } : null}
      initialWidget={existingWidget ? { id: existingWidget.id, name: existingWidget.name, publicWidgetId: existingWidget.publicWidgetId } : null}
      hasResource={resources.length > 0}
      createWebsiteAction={wizardCreateWebsiteAction}
      createWidgetAction={wizardCreateWidgetAction}
      importResourceAction={wizardImportResourceAction}
      customizeWidgetAction={wizardCustomizeWidgetAction}
      finishAction={wizardFinishAction}
    />
  );
}
