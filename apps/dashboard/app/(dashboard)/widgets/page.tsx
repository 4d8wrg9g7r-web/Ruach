import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageSquare, PlusCircle } from "lucide-react";
import { auditService, websiteService, widgetService } from "@ruach/database";
import { Badge } from "../../../components/ui/Badge";
import { buttonClasses } from "../../../components/ui/Button";
import { getCurrentOrganization, getCurrentUser, requireOrgRole } from "../../../lib/session";

async function createWidgetAction(formData: FormData) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN"]);

  const name = String(formData.get("name") ?? "").trim();
  const websiteId = String(formData.get("websiteId") ?? "");
  if (!name || !websiteId) throw new Error("Name and website are required");

  const widget = await widgetService.createWidget({ organizationId: organization.id, websiteId, name });
  const user = await getCurrentUser();
  await auditService.recordAuditEvent({
    organizationId: organization.id,
    actorUserId: user?.id,
    action: "widget.created",
    targetType: "WidgetConfiguration",
    targetId: widget.id,
  });
  redirect(`/widgets/${widget.id}`);
}

export default async function WidgetsPage() {
  const organization = await getCurrentOrganization();
  if (!organization) return null;

  const [widgets, websites] = await Promise.all([
    widgetService.listWidgets(organization.id),
    websiteService.listWebsites(organization.id),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-ink">Widgets</h1>

      {websites.length === 0 ? (
        <p className="text-sm text-ink-secondary">
          Add a <Link href="/websites" className="text-accent underline">website</Link> first.
        </p>
      ) : (
        <div className="shadow-panel mb-8 rounded-lg border border-border bg-surface p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <PlusCircle size={15} className="text-accent" /> Create a widget
          </h2>
          <form action={createWidgetAction} className="flex flex-wrap items-end gap-3">
            <label className="text-sm text-ink-secondary">
              Name
              <input
                name="name"
                required
                placeholder="Main Resource Assistant"
                className="mt-1 block rounded border border-border-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
            </label>
            <label className="text-sm text-ink-secondary">
              Website
              <select name="websiteId" required className="mt-1 block rounded border border-border-strong bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent">
                {websites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className={buttonClasses("primary", "md")}>
              Create widget
            </button>
          </form>
        </div>
      )}

      <div className="shadow-panel divide-y divide-border rounded-lg border border-border bg-surface">
        {widgets.length === 0 && <p className="p-6 text-sm text-ink-muted">No widgets yet.</p>}
        {widgets.map((widget) => (
          <Link
            key={widget.id}
            href={`/widgets/${widget.id}`}
            className="flex items-center justify-between gap-4 p-4 transition-colors duration-180 hover:bg-surface-muted"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-warm text-accent-dark">
                <MessageSquare size={15} />
              </span>
              <div>
                <div className="font-medium text-ink">{widget.name}</div>
                <div className="text-sm text-ink-muted">{widget.website.name}</div>
              </div>
            </div>
            <Badge variant={widget.status === "ACTIVE" ? "success" : "neutral"}>{widget.status}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
