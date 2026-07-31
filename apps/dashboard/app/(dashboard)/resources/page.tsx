import Link from "next/link";
import { redirect } from "next/navigation";
import { resourceService } from "@ruach/database";
import { importResourceFromUrl } from "@ruach/providers";
import { getCurrentOrganization, requireOrgRole } from "../../../lib/session";

async function importResourceAction(formData: FormData) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);

  const url = String(formData.get("url") ?? "").trim();
  if (!url) throw new Error("URL is required");

  const result = await importResourceFromUrl(organization.id, url);
  if (result.resource) redirect(`/resources/${result.resource.id}`);
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  APPROVED: "bg-green-50 text-green-700",
  REVIEW_REQUIRED: "bg-amber-50 text-amber-700",
  DRAFT: "bg-slate-100 text-slate-600",
  PROCESSING: "bg-slate-100 text-slate-600",
  FAILED: "bg-red-50 text-red-700",
  INACTIVE: "bg-slate-100 text-slate-500",
  ARCHIVED: "bg-slate-100 text-slate-500",
};

export default async function ResourcesPage() {
  const organization = await getCurrentOrganization();
  if (!organization) return null;

  const resources = await resourceService.listResources(organization.id);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Resources</h1>

      <div className="mb-8 rounded border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-medium">Import a resource</h2>
        <p className="mb-3 text-sm text-slate-500">
          Paste a YouTube or Vimeo URL (e.g. <code>https://www.youtube.com/watch?v=mock-yt-anxiety-01</code>), or any
          other public HTTPS URL. Mock providers are used in local development -- no live credentials required.
        </p>
        <form action={importResourceAction} className="flex flex-wrap items-end gap-3">
          <label className="grow text-sm">
            URL
            <input
              name="url"
              required
              placeholder="https://www.youtube.com/watch?v=mock-yt-anxiety-01"
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Import
          </button>
        </form>
      </div>

      <div className="divide-y divide-slate-200 rounded border border-slate-200 bg-white">
        {resources.length === 0 && <p className="p-4 text-sm text-slate-500">No resources yet.</p>}
        {resources.map((resource) => (
          <Link
            key={resource.id}
            href={`/resources/${resource.id}`}
            className="flex items-center justify-between p-4 hover:bg-slate-50"
          >
            <div>
              <div className="font-medium">{resource.title}</div>
              <div className="text-sm text-slate-500">
                {resource.sourceProvider} &middot; {resource.resourceType}
              </div>
            </div>
            <span className={`rounded px-2 py-1 text-xs ${STATUS_COLORS[resource.status] ?? "bg-slate-100"}`}>
              {resource.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
