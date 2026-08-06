import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageSquare, PlusCircle } from "lucide-react";
import { auditService, billingService, websiteService, widgetService } from "@ruach/database";
import { Badge } from "../../../components/ui/Badge";
import { buttonClasses } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Input, Select } from "../../../components/ui/Input";
import { hexToRgba } from "../../../lib/color";
import { getCurrentOrganization, getCurrentUser, requireOrgRole } from "../../../lib/session";

async function createWidgetAction(formData: FormData) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN"]);

  const name = String(formData.get("name") ?? "").trim();
  const websiteId = String(formData.get("websiteId") ?? "");
  if (!name || !websiteId) throw new Error("Name and website are required");

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
          Add a{" "}
          <Link
            href="/websites"
            className="rounded-sm text-accent underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            website
          </Link>{" "}
          first.
        </p>
      ) : (
        <Card className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <PlusCircle size={15} className="text-accent" /> Create a widget
          </h2>
          <form action={createWidgetAction} className="flex flex-wrap items-end gap-3">
            <label className="text-sm text-ink-secondary">
              Name
              <Input name="name" required placeholder="Main Resource Assistant" className="mt-1 block" />
            </label>
            <label className="text-sm text-ink-secondary">
              Website
              <Select name="websiteId" required className="mt-1 block">
                {websites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </Select>
            </label>
            <button type="submit" className={buttonClasses("primary", "md")}>
              Create widget
            </button>
          </form>
        </Card>
      )}

      {widgets.length > 0 && (
        <p className="mb-3 text-sm text-ink-secondary">
          Click a widget to customize its content, branding, and standard links, and to get its installation
          snippet.
        </p>
      )}

      <Card padding="none">
        {widgets.length === 0 ? (
          <EmptyState description="No widgets yet." />
        ) : (
          <div className="divide-y divide-border">
            {widgets.map((widget) => (
              <Link
                key={widget.id}
                href={`/widgets/${widget.id}`}
                className="flex items-center justify-between gap-4 p-4 transition-colors duration-180 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: hexToRgba(widget.primaryColor, 0.15), color: widget.primaryColor }}
                  >
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
        )}
      </Card>
    </div>
  );
}
