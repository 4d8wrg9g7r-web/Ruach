import Link from "next/link";
import { redirect } from "next/navigation";
import { auditService, websiteService, widgetService } from "@ruach/database";
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
      <h1 className="mb-6 text-xl font-semibold">Widgets</h1>

      {websites.length === 0 ? (
        <p className="text-sm text-slate-600">
          Add a <Link href="/websites" className="text-blue-600 underline">website</Link> first.
        </p>
      ) : (
        <div className="mb-8 rounded border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-medium">Create a widget</h2>
          <form action={createWidgetAction} className="flex flex-wrap items-end gap-3">
            <label className="text-sm">
              Name
              <input
                name="name"
                required
                placeholder="Main Resource Assistant"
                className="mt-1 block rounded border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Website
              <select name="websiteId" required className="mt-1 block rounded border border-slate-300 px-3 py-2">
                {websites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Create widget
            </button>
          </form>
        </div>
      )}

      <div className="divide-y divide-slate-200 rounded border border-slate-200 bg-white">
        {widgets.length === 0 && <p className="p-4 text-sm text-slate-500">No widgets yet.</p>}
        {widgets.map((widget) => (
          <Link
            key={widget.id}
            href={`/widgets/${widget.id}`}
            className="flex items-center justify-between p-4 hover:bg-slate-50"
          >
            <div>
              <div className="font-medium">{widget.name}</div>
              <div className="text-sm text-slate-500">{widget.website.name}</div>
            </div>
            <span className="rounded bg-green-50 px-2 py-1 text-xs text-green-700">{widget.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
