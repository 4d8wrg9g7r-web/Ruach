import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ChevronRight, Globe, PlusCircle } from "lucide-react";
import { auditService, billingService, websiteService, widgetService } from "@ruach/database";
import { AddWebsiteForm } from "../../../components/AddWebsiteForm";
import { InstallCodeModal } from "../../../components/InstallCodeModal";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import type { FormActionResult } from "../../../lib/form-errors";
import { getCurrentOrganization, getCurrentUser, requireOrgRole } from "../../../lib/session";

async function createWebsiteAction(formData: FormData): Promise<FormActionResult | void> {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN"]);

  const name = String(formData.get("name") ?? "").trim();
  const primaryDomain = String(formData.get("primaryDomain") ?? "").trim();
  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Name is required.";
  if (!primaryDomain) fieldErrors.primaryDomain = "Domain is required.";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const plan = billingService.getPlan(organization.planKey);
  const websiteCount = await websiteService.countWebsites(organization.id);
  try {
    billingService.assertUnderCap(websiteCount, plan.maxWebsites, "website");
  } catch (err) {
    // Not tied to either field -- the fix is upgrading the plan, not editing an input.
    return { formError: err instanceof Error ? err.message : "You've reached your plan's website limit." };
  }

  const website = await websiteService.createWebsite({ organizationId: organization.id, name, primaryDomain });
  const user = await getCurrentUser();
  await auditService.recordAuditEvent({
    organizationId: organization.id,
    actorUserId: user?.id,
    action: "website.created",
    targetType: "Website",
    targetId: website.id,
    metadata: { primaryDomain },
  });
  revalidatePath("/websites");
}

export default async function WebsitesPage() {
  const organization = await getCurrentOrganization();
  if (!organization) return null;

  const [websites, widgets] = await Promise.all([
    websiteService.listWebsites(organization.id),
    widgetService.listWidgets(organization.id),
  ]);
  const appOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-ink">Websites</h1>

      <Card className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <PlusCircle size={15} className="text-accent" /> Add a website
        </h2>
        <AddWebsiteForm action={createWebsiteAction} />
      </Card>

      <Card padding="none">
        {websites.length === 0 ? (
          <EmptyState description="No websites yet." />
        ) : (
          <div className="divide-y divide-border">
            {websites.map((site) => {
              const siteWidgets = widgets.filter((w) => w.websiteId === site.id);
              const activeWidget = siteWidgets.find((w) => w.status === "ACTIVE");
              const snippet = activeWidget
                ? `<script src="${appOrigin}/widget-loader.js" data-widget-id="${activeWidget.publicWidgetId}" defer></script>`
                : null;

              return (
                <div key={site.id} className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-warm text-accent-dark">
                      <Globe size={16} />
                    </span>
                    <div>
                      <div className="font-medium text-ink">{site.name}</div>
                      <div className="text-sm text-ink-muted">{site.primaryDomain}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={activeWidget ? "success" : "neutral"}>
                      {activeWidget ? "Connected" : "Awaiting installation"}
                    </Badge>
                    {snippet && <InstallCodeModal snippet={snippet} websiteName={site.name} />}
                    <Link
                      href={`/websites/${site.id}`}
                      className="flex items-center gap-0.5 rounded-sm text-sm text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                      Manage <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
