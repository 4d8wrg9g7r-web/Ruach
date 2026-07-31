import { revalidatePath } from "next/cache";
import { auditService, websiteService } from "@ruach/database";
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

  const websites = await websiteService.listWebsites(organization.id);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Websites</h1>

      <div className="mb-8 rounded border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-medium">Add a website</h2>
        <form action={createWebsiteAction} className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            Name
            <input name="name" required placeholder="Main Website" className="mt-1 block rounded border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm">
            Primary domain
            <input
              name="primaryDomain"
              required
              placeholder="localhost:3000"
              className="mt-1 block rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Add website
          </button>
        </form>
      </div>

      <div className="divide-y divide-slate-200 rounded border border-slate-200 bg-white">
        {websites.length === 0 && <p className="p-4 text-sm text-slate-500">No websites yet.</p>}
        {websites.map((site) => (
          <div key={site.id} className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">{site.name}</div>
              <div className="text-sm text-slate-500">{site.primaryDomain}</div>
            </div>
            <span className="rounded bg-green-50 px-2 py-1 text-xs text-green-700">{site.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
