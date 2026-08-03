import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Filter, Mic, MoreHorizontal, Newspaper, Search, Sparkles, Video } from "lucide-react";
import { ResourceStatus, resourceService } from "@ruach/database";
import { importResourceFromUrl } from "@ruach/providers";
import { AutoSubmitSelect } from "../../../components/AutoSubmitSelect";
import { ImportResourceForm } from "../../../components/ImportResourceForm";
import { Badge } from "../../../components/ui/Badge";
import {
  RESOURCE_TYPE_FILTERS,
  resourceStatusLabel,
  resourceStatusTone,
  resourceTypeGroup,
  timeAgo,
} from "../../../lib/format";
import { getCurrentOrganization, requireOrgRole } from "../../../lib/session";

const PAGE_SIZE = 15;

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

const TYPE_ICON: Record<string, React.ReactNode> = {
  VIDEOS: <Video size={16} />,
  PODCASTS: <Mic size={16} />,
  ARTICLES: <Newspaper size={16} />,
  DOCUMENTS: <FileText size={16} />,
  OTHER: <FileText size={16} />,
};

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; q?: string; page?: string }>;
}) {
  const organization = await getCurrentOrganization();
  if (!organization) return null;
  const params = await searchParams;

  const validStatus =
    params.status && (Object.values(ResourceStatus) as string[]).includes(params.status)
      ? (params.status as ResourceStatus)
      : undefined;
  const allResources = await resourceService.listResources(organization.id, validStatus ? { status: validStatus } : undefined);

  const counts = { ALL: allResources.length } as Record<string, number>;
  for (const filter of RESOURCE_TYPE_FILTERS) {
    if (filter.key === "ALL") continue;
    counts[filter.key] = allResources.filter((r) => resourceTypeGroup(r.resourceType) === filter.key).length;
  }

  const typeFilter = params.type ?? "ALL";
  const search = (params.q ?? "").trim().toLowerCase();
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const filtered = allResources.filter((r) => {
    if (typeFilter !== "ALL" && resourceTypeGroup(r.resourceType) !== typeFilter) return false;
    if (search && !r.title.toLowerCase().includes(search)) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageResources = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const baseParams = new URLSearchParams();
  if (params.status) baseParams.set("status", params.status);
  if (params.q) baseParams.set("q", params.q);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Resources</h1>
      </div>

      <div className="shadow-panel mb-8 rounded-lg border border-border bg-surface p-5">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink">
          <Sparkles size={15} className="text-accent" /> Add a resource
        </h2>
        <p className="mb-3 text-sm text-ink-secondary">
          Paste a YouTube or Vimeo URL (e.g.{" "}
          <code className="rounded bg-surface-muted px-1 py-0.5 text-xs">
            https://www.youtube.com/watch?v=mock-yt-anxiety-01
          </code>
          ), or any other public HTTPS URL. Mock providers are used in local development -- no live credentials
          required.
        </p>
        <ImportResourceForm action={importResourceAction} />
      </div>

      <div className="shadow-panel rounded-lg border border-border bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex flex-wrap items-center gap-5">
            {RESOURCE_TYPE_FILTERS.map((filter) => {
              const isActive = typeFilter === filter.key;
              const qs = new URLSearchParams(baseParams);
              if (filter.key !== "ALL") qs.set("type", filter.key);
              return (
                <Link
                  key={filter.key}
                  href={`/resources?${qs.toString()}`}
                  className={`border-b-2 pb-1 text-sm transition-colors duration-180 ${
                    isActive ? "border-accent font-medium text-ink" : "border-transparent text-ink-muted hover:text-ink"
                  }`}
                >
                  {filter.label} <span className="text-xs text-ink-muted">{counts[filter.key] ?? 0}</span>
                </Link>
              );
            })}
          </div>
          <form className="flex items-center gap-2" action="/resources">
            {params.type && <input type="hidden" name="type" value={params.type} />}
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                name="q"
                defaultValue={params.q}
                placeholder="Search resources..."
                className="w-56 rounded border border-border-strong bg-surface py-2 pl-8 pr-3 text-sm text-ink outline-none transition-colors duration-180 focus:border-accent"
              />
            </div>
            <div className="relative">
              <Filter size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <AutoSubmitSelect
                name="status"
                defaultValue={params.status ?? ""}
                options={[
                  { value: "", label: "All statuses" },
                  { value: "REVIEW_REQUIRED", label: "Under Review" },
                  { value: "ACTIVE", label: "Approved" },
                  { value: "DRAFT", label: "Draft" },
                  { value: "ARCHIVED", label: "Rejected" },
                ]}
                className="appearance-none rounded border border-border-strong bg-surface py-2 pl-8 pr-6 text-sm text-ink outline-none transition-colors duration-180 focus:border-accent"
              />
            </div>
          </form>
        </div>

        {pageResources.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-muted">No resources match this filter.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Topics</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Imported</th>
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {pageResources.map((resource) => (
                <tr key={resource.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                  <td className="px-5 py-3">
                    <Link href={`/resources/${resource.id}`} className="flex items-center gap-3">
                      <span className="h-10 w-14 shrink-0 overflow-hidden rounded bg-surface-muted">
                        {resource.thumbnailUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={resource.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-ink">{resource.title}</div>
                        <div className="truncate text-xs text-ink-muted">
                          {[resource.speakerName, resource.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-ink-secondary">
                    <span className="flex items-center gap-1.5">
                      {TYPE_ICON[resourceTypeGroup(resource.resourceType)]}
                      <span className="text-xs">{resource.resourceType}</span>
                    </span>
                  </td>
                  <td className="max-w-[220px] truncate px-3 py-3 text-ink-secondary">
                    {resource.topics.length > 0 ? resource.topics.join(", ") : <span className="text-ink-muted">--</span>}
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={resourceStatusTone(resource.status)}>{resourceStatusLabel(resource.status)}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-ink-muted">{timeAgo(resource.createdAt)}</td>
                  <td className="px-3 py-3">
                    <Link href={`/resources/${resource.id}`} className="text-ink-muted hover:text-ink">
                      <MoreHorizontal size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-ink-muted">
            <span>
              Page {page} of {totalPages} &middot; {filtered.length} resources
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/resources?${new URLSearchParams({ ...Object.fromEntries(baseParams), type: typeFilter, page: String(page - 1) }).toString()}`} className="rounded border border-border-strong px-2.5 py-1 hover:bg-surface-muted">
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/resources?${new URLSearchParams({ ...Object.fromEntries(baseParams), type: typeFilter, page: String(page + 1) }).toString()}`} className="rounded border border-border-strong px-2.5 py-1 hover:bg-surface-muted">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
