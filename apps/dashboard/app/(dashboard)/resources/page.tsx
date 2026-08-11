import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { Filter, Link2, Search, Sparkles } from "lucide-react";
import { z } from "zod";
import {
  ResourceStatus,
  auditService,
  billingService,
  bulkJobService,
  contentSourceService,
  organizationService,
  organizationalLinkService,
  resourceService,
} from "@ruach/database";
import { importResourceFromUrl, importYouTubeChannel, importRSSFeed } from "@ruach/providers";
import { PRIORITIZABLE_RESOURCE_TYPE_GROUPS } from "@ruach/shared-types";
import { AutoSubmitSelect } from "../../../components/AutoSubmitSelect";
import type { BulkImportSummary } from "../../../components/BulkImportForm";
import { ContentSourceList } from "../../../components/ContentSourceList";
import { ImportTabs } from "../../../components/ImportTabs";
import { OrganizationalLinkList } from "../../../components/OrganizationalLinkList";
import { ResourcesTable } from "../../../components/ResourcesTable";
import { buttonClasses } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Input, Textarea } from "../../../components/ui/Input";
import { RESOURCE_TYPE_FILTERS, resourceTypeGroup } from "../../../lib/format";
import { approveAndIndexResources, runBulkJob } from "../../../lib/resource-pipeline";
import { getCurrentOrganization, getCurrentUser, requireOrgRole } from "../../../lib/session";

const organizationalLinkUrlSchema = z.string().url("Enter a full URL, including https://");

// Server Actions defined in this file inherit it -- runBulkJob (via after(), see
// enqueueBulkJob below) does real per-resource work (OpenAI calls, web fetches) for
// potentially hundreds of resources in one invocation, well past the platform's
// short default. 300s matches the existing cron routes' ceiling (api/cron/sync,
// api/cron/usage-warnings); still not unlimited -- see bulk-job-service.ts's stale-
// job detection for what happens to a batch too large to finish even at this cap.
export const maxDuration = 300;

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 25;

/**
 * Approval is the one bulk/auto-approve action that's plan-capped -- decide upfront
 * how many of the given ids fit under the org's indexed-resource limit rather than
 * checking per-item inside a concurrent worker pool (see resource-pipeline.ts's
 * mapWithConcurrency), which would race. Anything past the cap is simply never
 * attempted, not silently ignored.
 */
async function capToRemainingResourceSlots(organizationId: string, planKey: string, resourceIds: string[]): Promise<string[]> {
  const plan = billingService.getPlan(planKey);
  const activeCount = await resourceService.countActiveResources(organizationId);
  const remaining = billingService.remainingCapacity(activeCount, plan.maxIndexedResources);
  return remaining === null ? resourceIds : resourceIds.slice(0, remaining);
}

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

async function importChannelAction(formData: FormData): Promise<BulkImportSummary> {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);

  const channelUrl = String(formData.get("channelUrl") ?? "").trim();
  if (!channelUrl) throw new Error("Channel URL is required");
  const autoApprove = formData.get("autoApprove") === "on";
  const trackAutoSync = formData.get("trackAutoSync") === "on";

  const result = await importYouTubeChannel(organization.id, channelUrl);
  if (autoApprove && result.createdResourceIds.length > 0) {
    await approveAndIndexResources(organization.id, await capToRemainingResourceSlots(organization.id, organization.planKey, result.createdResourceIds), undefined, billingService.bulkConcurrency(organization.planKey));
  }
  if (trackAutoSync) {
    await contentSourceService.trackContentSource({
      organizationId: organization.id,
      provider: "YOUTUBE",
      sourceUrl: channelUrl,
      autoApprove,
    });
  }

  const user = await getCurrentUser();
  await auditService.recordAuditEvent({
    organizationId: organization.id,
    actorUserId: user?.id,
    action: "channel.imported",
    targetType: "ImportJob",
    targetId: result.importJobId,
    metadata: {
      channelUrl,
      totalFound: result.totalItems,
      created: result.createdResourceIds.length,
      alreadyExisted: result.existingResourceIds.length,
      failed: result.failureCount,
      autoApproved: autoApprove,
    },
  });

  revalidatePath("/resources");
  revalidatePath("/dashboard");

  return {
    totalFound: result.totalItems,
    created: result.createdResourceIds.length,
    alreadyExisted: result.existingResourceIds.length,
    failed: result.failureCount,
    autoApproved: autoApprove,
  };
}

async function importFeedAction(formData: FormData): Promise<BulkImportSummary> {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);

  const feedUrl = String(formData.get("feedUrl") ?? "").trim();
  if (!feedUrl) throw new Error("Feed URL is required");
  const autoApprove = formData.get("autoApprove") === "on";
  const trackAutoSync = formData.get("trackAutoSync") === "on";

  const result = await importRSSFeed(organization.id, feedUrl);
  if (autoApprove && result.createdResourceIds.length > 0) {
    await approveAndIndexResources(organization.id, await capToRemainingResourceSlots(organization.id, organization.planKey, result.createdResourceIds), undefined, billingService.bulkConcurrency(organization.planKey));
  }
  if (trackAutoSync) {
    await contentSourceService.trackContentSource({
      organizationId: organization.id,
      provider: "RSS",
      sourceUrl: feedUrl,
      autoApprove,
    });
  }

  const user = await getCurrentUser();
  await auditService.recordAuditEvent({
    organizationId: organization.id,
    actorUserId: user?.id,
    action: "feed.imported",
    targetType: "ImportJob",
    targetId: result.importJobId,
    metadata: {
      feedUrl,
      totalFound: result.totalItems,
      created: result.createdResourceIds.length,
      alreadyExisted: result.existingResourceIds.length,
      failed: result.failureCount,
      autoApproved: autoApprove,
    },
  });

  revalidatePath("/resources");
  revalidatePath("/dashboard");

  return {
    totalFound: result.totalItems,
    created: result.createdResourceIds.length,
    alreadyExisted: result.existingResourceIds.length,
    failed: result.failureCount,
    autoApproved: autoApprove,
  };
}

/**
 * Every bulk toolbar action shares this shape: validate, enqueue a BulkJob row, and
 * schedule the actual work via next/server's after() so the response goes back to
 * the client (and its click's Server Action call resolves) before any per-resource
 * work starts. This is what stops a large selection from blocking sidebar
 * navigation -- the action used to await the whole batch inline, and Next's router
 * queues <Link> clicks behind a still-pending Server-Action transition. The client
 * polls /api/bulk-jobs/[jobId] for progress instead.
 */
async function enqueueBulkJob(type: "ANALYZE" | "APPROVE" | "REJECT" | "DELETE" | "FIND_LINKS" | "INCLUDE_LINKS", resourceIds: string[]) {
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);
  if (resourceIds.length === 0) return null;

  let idsToProcess = resourceIds;
  if (type === "APPROVE") {
    idsToProcess = await capToRemainingResourceSlots(organization.id, organization.planKey, resourceIds);
    if (idsToProcess.length === 0) {
      throw new Error("You've reached your plan's indexed-resource limit. Upgrade to approve more.");
    }
  }

  const user = await getCurrentUser();
  const job = await bulkJobService.createBulkJob(organization.id, type, idsToProcess, user?.id);
  after(() => runBulkJob(organization.id, job.id, user?.id));
  return { jobId: job.id, totalCount: idsToProcess.length };
}

async function bulkAnalyzeAction(resourceIds: string[]) {
  "use server";
  return enqueueBulkJob("ANALYZE", resourceIds);
}

async function bulkFindLinksAction(resourceIds: string[]) {
  "use server";
  return enqueueBulkJob("FIND_LINKS", resourceIds);
}

async function bulkIncludeLinksAction(resourceIds: string[]) {
  "use server";
  return enqueueBulkJob("INCLUDE_LINKS", resourceIds);
}

async function bulkApproveAction(resourceIds: string[]) {
  "use server";
  return enqueueBulkJob("APPROVE", resourceIds);
}

async function bulkRejectAction(resourceIds: string[]) {
  "use server";
  return enqueueBulkJob("REJECT", resourceIds);
}

async function bulkDeleteAction(resourceIds: string[]) {
  "use server";
  return enqueueBulkJob("DELETE", resourceIds);
}

async function toggleAutoSyncAction(contentSourceId: string, enabled: boolean) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);
  await contentSourceService.setAutoSyncEnabled(organization.id, contentSourceId, enabled);
  revalidatePath("/resources");
}

async function toggleAutoApproveAction(contentSourceId: string, enabled: boolean) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);
  await contentSourceService.setAutoApprove(organization.id, contentSourceId, enabled);
  revalidatePath("/resources");
}

async function removeContentSourceAction(contentSourceId: string) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);
  await contentSourceService.deleteContentSource(organization.id, contentSourceId);
  revalidatePath("/resources");
}

async function createOrganizationalLinkAction(formData: FormData) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);

  const label = String(formData.get("label") ?? "").trim();
  const rawUrl = String(formData.get("url") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || undefined;
  if (!label || !rawUrl) throw new Error("Label and URL are required.");

  const urlParsed = organizationalLinkUrlSchema.safeParse(rawUrl);
  if (!urlParsed.success) throw new Error(urlParsed.error.issues[0]?.message ?? "Enter a valid URL.");

  await organizationalLinkService.createOrganizationalLink({
    organizationId: organization.id,
    label,
    url: urlParsed.data,
    description,
  });
  revalidatePath("/resources");
}

async function toggleOrganizationalLinkActiveAction(linkId: string, enabled: boolean) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);
  await organizationalLinkService.updateOrganizationalLink(organization.id, linkId, { isActive: enabled });
  revalidatePath("/resources");
}

async function removeOrganizationalLinkAction(linkId: string) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN", "CONTENT_MANAGER"]);
  await organizationalLinkService.deleteOrganizationalLink(organization.id, linkId);
  revalidatePath("/resources");
}

async function setPriorityContentTypeAction(formData: FormData) {
  "use server";
  const organization = await getCurrentOrganization();
  if (!organization) throw new Error("No organization");
  await requireOrgRole(organization.id, ["OWNER", "ADMIN"]);

  const raw = String(formData.get("priorityContentType") ?? "");
  const isValid = PRIORITIZABLE_RESOURCE_TYPE_GROUPS.some((g) => g.key === raw);
  await organizationService.setPriorityContentType(organization.id, isValid ? raw : null);
  revalidatePath("/resources");
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; q?: string; page?: string; pageSize?: string }>;
}) {
  const organization = await getCurrentOrganization();
  if (!organization) return null;
  const params = await searchParams;
  const contentSources = await contentSourceService.listContentSources(organization.id);
  const activeJob = await bulkJobService.getMostRecentActiveJob(organization.id);
  const organizationalLinks = await organizationalLinkService.listOrganizationalLinks(organization.id);

  const validStatus =
    params.status && (Object.values(ResourceStatus) as string[]).includes(params.status)
      ? (params.status as ResourceStatus)
      : undefined;
  const isReviewQueue = validStatus === ResourceStatus.REVIEW_REQUIRED;
  const allResources = await resourceService.listResources(organization.id, validStatus ? { status: validStatus } : undefined);

  const counts = { ALL: allResources.length } as Record<string, number>;
  for (const filter of RESOURCE_TYPE_FILTERS) {
    if (filter.key === "ALL") continue;
    counts[filter.key] = allResources.filter((r) => resourceTypeGroup(r.resourceType) === filter.key).length;
  }

  const typeFilter = params.type ?? "ALL";
  const search = (params.q ?? "").trim().toLowerCase();
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = PAGE_SIZE_OPTIONS.includes(Number(params.pageSize) as (typeof PAGE_SIZE_OPTIONS)[number])
    ? Number(params.pageSize)
    : DEFAULT_PAGE_SIZE;

  const filtered = allResources.filter((r) => {
    if (typeFilter !== "ALL" && resourceTypeGroup(r.resourceType) !== typeFilter) return false;
    if (search && !r.title.toLowerCase().includes(search)) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageResources = filtered.slice((page - 1) * pageSize, page * pageSize);

  const baseParams = new URLSearchParams();
  if (params.status) baseParams.set("status", params.status);
  if (params.q) baseParams.set("q", params.q);
  if (params.pageSize) baseParams.set("pageSize", params.pageSize);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {isReviewQueue ? "Review Queue" : "Resources"}
        </h1>
        {isReviewQueue && (
          <p className="mt-1 text-sm text-ink-secondary">
            Resources awaiting a decision before they&rsquo;re visible to visitors. Approve, reject, or analyze them
            below -- switch the status filter to &ldquo;All statuses&rdquo; to return to the full library.
          </p>
        )}
      </div>

      {!isReviewQueue && (
        <Card className="mb-8">
          <ImportTabs
            importResourceAction={importResourceAction}
            importChannelAction={importChannelAction}
            importFeedAction={importFeedAction}
            youtubeApiKeyConfigured={Boolean(process.env.YOUTUBE_API_KEY)}
            vimeoAccessTokenConfigured={Boolean(process.env.VIMEO_ACCESS_TOKEN)}
          />
        </Card>
      )}

      {!isReviewQueue && (
        <Card padding="none" className="mb-8">
          <div className="border-b border-border p-5">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink">
              <Sparkles size={15} className="text-accent" /> Auto-sync sources
            </h2>
            <p className="text-sm text-ink-secondary">
              Channels and feeds checked here are automatically re-imported and analyzed on a schedule. Track a
              channel or feed by checking &ldquo;Keep checking for new...&rdquo; when importing it above.
            </p>
          </div>
          <ContentSourceList
            sources={contentSources}
            onToggleAutoSync={toggleAutoSyncAction}
            onToggleAutoApprove={toggleAutoApproveAction}
            onRemove={removeContentSourceAction}
          />
        </Card>
      )}

      {!isReviewQueue && (
        <Card padding="none" className="mb-8">
          <div className="border-b border-border p-5">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink">
              <Link2 size={15} className="text-accent" /> Organizational Links
            </h2>
            <p className="text-sm text-ink-secondary">
              Links the assistant can send a visitor to when they ask a navigational question -- "where can I
              find the notes?" -- instead of searching your resource library. These are never shown as buttons
              in the widget; add a description so the assistant knows when each one applies.
            </p>
          </div>
          <div className="border-b border-border p-5">
            <form action={createOrganizationalLinkAction} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-end gap-3">
                <label className="text-sm text-ink-secondary">
                  Label
                  <Input name="label" required placeholder="Notes" className="mt-1 block w-40" />
                </label>
                <label className="grow text-sm text-ink-secondary">
                  Link URL
                  <Input name="url" required placeholder="https://..." className="mt-1 block w-full" />
                </label>
              </div>
              <label className="text-sm text-ink-secondary">
                Description <span className="font-normal text-ink-muted">(optional -- helps the assistant know when to use this link)</span>
                <Textarea
                  name="description"
                  rows={2}
                  placeholder="This week's sermon notes and study guide"
                  className="mt-1 block w-full max-w-lg"
                />
              </label>
              <div>
                <button type="submit" className={buttonClasses("secondary", "md")} disabled={organizationalLinks.length >= 20}>
                  Add link
                </button>
              </div>
            </form>
            {organizationalLinks.length >= 20 && (
              <p className="mt-2 text-xs text-ink-muted">Maximum of 20 organizational links reached -- remove one to add another.</p>
            )}
          </div>
          <OrganizationalLinkList
            links={organizationalLinks}
            onToggleActive={toggleOrganizationalLinkActiveAction}
            onRemove={removeOrganizationalLinkAction}
          />
        </Card>
      )}

      {!isReviewQueue && (
        <Card padding="md" className="mb-8">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink">
            <Sparkles size={15} className="text-accent" /> Content Priority
          </h2>
          <p className="mb-4 text-sm text-ink-secondary">
            When a visitor's question matches resources of different types, always show this type first --
            regardless of how closely the others match. Leave as "No priority" to rank purely by relevance, like
            today.
          </p>
          <form action={setPriorityContentTypeAction} className="flex items-center gap-2">
            <AutoSubmitSelect
              name="priorityContentType"
              defaultValue={organization.priorityContentType ?? ""}
              options={[
                { value: "", label: "No priority" },
                ...PRIORITIZABLE_RESOURCE_TYPE_GROUPS.map((g) => ({ value: g.key, label: g.label })),
              ]}
              className="rounded-sm border border-border-strong bg-surface py-2 pl-3 pr-6 text-sm text-ink outline-none transition-colors duration-180 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
            />
          </form>
        </Card>
      )}

      <Card padding="none">
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
                  className={`rounded-sm border-b-2 pb-1 text-sm transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
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
                className="w-56 rounded-sm border border-border-strong bg-surface py-2 pl-8 pr-3 text-sm text-ink outline-none transition-colors duration-180 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
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
                className="appearance-none rounded-sm border border-border-strong bg-surface py-2 pl-8 pr-6 text-sm text-ink outline-none transition-colors duration-180 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
              />
            </div>
            <label className="flex items-center gap-1.5 text-sm text-ink-secondary">
              Show
              <AutoSubmitSelect
                name="pageSize"
                defaultValue={String(pageSize)}
                options={PAGE_SIZE_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))}
                className="rounded-sm border border-border-strong bg-surface py-2 pl-2 pr-6 text-sm text-ink outline-none transition-colors duration-180 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
              />
            </label>
          </form>
        </div>

        {pageResources.length === 0 ? (
          <EmptyState description="No resources match this filter." />
        ) : (
          <ResourcesTable
            resources={pageResources}
            allResourceIds={filtered.map((r) => r.id)}
            initialJob={activeJob ? { id: activeJob.id, type: activeJob.type, totalCount: activeJob.totalCount, processedCount: activeJob.processedCount, status: activeJob.status } : null}
            onAnalyze={bulkAnalyzeAction}
            onApprove={bulkApproveAction}
            onReject={bulkRejectAction}
            onDelete={bulkDeleteAction}
            onFindLinks={bulkFindLinksAction}
            onIncludeLinks={bulkIncludeLinksAction}
          />
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-ink-muted">
            <span>
              Page {page} of {totalPages} &middot; {filtered.length} resources
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/resources?${new URLSearchParams({ ...Object.fromEntries(baseParams), type: typeFilter, page: String(page - 1) }).toString()}`}
                  className="rounded-sm border border-border-strong px-2.5 py-1 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/resources?${new URLSearchParams({ ...Object.fromEntries(baseParams), type: typeFilter, page: String(page + 1) }).toString()}`}
                  className="rounded-sm border border-border-strong px-2.5 py-1 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
