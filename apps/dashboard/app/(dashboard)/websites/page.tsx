import { revalidatePath } from "next/cache";
import { Globe, PlusCircle } from "lucide-react";
import { auditService, websiteService, widgetService } from "@ruach/database";
import { InstallCodeModal } from "../../../components/InstallCodeModal";
import { Badge } from "../../../components/ui/Badge";
import { buttonClasses } from "../../../components/ui/Button";
import { getCurrentOrganization, getCurrentUser, requireOrgRole } from "../../../lib/session";

async function createWebsiteAction(formData: FormData) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN"]);

  const name = String(formData.get("name") ?? "").trim();
  const primaryDomain = String(formData.get("primaryDomain") ?? "").trim();
  if (!name || !primaryDomain) throw new Error("Name and domain are required");

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

      <div className="shadow-panel mb-8 rounded-lg border border-border bg-surface p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <PlusCircle size={15} className="text-accent" /> Add a website
        </h2>
        <form action={createWebsiteAction} className="flex flex-wrap items-end gap-3">
          <label className="text-sm text-ink-secondary">
            Name
            <input
              name="name"
              required
              placeholder="Main Website"
              className="mt-1 block rounded border border-border-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </label>
          <label className="text-sm text-ink-secondary">
            Primary domain
            <input
              name="primaryDomain"
              required
              placeholder="localhost:3000"
              className="mt-1 block rounded border border-border-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </label>
          <button type="submit" className={buttonClasses("primary", "md")}>
            Add website
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-4">
        {websites.length === 0 && (
          <p className="shadow-panel rounded-lg border border-border bg-surface p-6 text-center text-sm text-ink-muted">
            No websites yet.
          </p>
        )}
        {websites.map((site) => {
          const siteWidgets = widgets.filter((w) => w.websiteId === site.id);
          const activeWidget = siteWidgets.find((w) => w.status === "ACTIVE");
          const snippet = activeWidget
            ? `<script src="${appOrigin}/widget-loader.js" data-widget-id="${activeWidget.publicWidgetId}" defer></script>`
            : null;

          return (
            <div key={site.id} className="shadow-panel flex items-center justify-between gap-4 rounded-lg border border-border bg-surface p-5">
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
