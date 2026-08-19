"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCheck, CheckCircle2, FileText, Link2, Mic, MoreHorizontal, Newspaper, Sparkles, Trash2, Video, XCircle } from "lucide-react";
import { Badge } from "./ui/Badge";
import { buttonClasses } from "./ui/Button";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { resourceStatusLabel, resourceStatusTone, resourceTypeGroup, timeAgo } from "../lib/format";

const TYPE_ICON: Record<string, React.ReactNode> = {
  VIDEOS: <Video size={16} />,
  PODCASTS: <Mic size={16} />,
  ARTICLES: <Newspaper size={16} />,
  DOCUMENTS: <FileText size={16} />,
  OTHER: <FileText size={16} />,
};

const JOB_PROGRESS_LABEL: Record<string, string> = {
  ANALYZE: "Analyzing",
  APPROVE: "Approving",
  REJECT: "Rejecting",
  DELETE: "Deleting",
  FIND_LINKS: "Finding links in",
  INCLUDE_LINKS: "Including links from",
};

const POLL_INTERVAL_MS = 750;

export interface ResourceRow {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  speakerName: string | null;
  createdAt: Date;
  resourceType: string;
  topics: string[];
  status: string;
}

interface BulkJobHandle {
  jobId: string;
  totalCount: number;
}

interface InitialJob {
  id: string;
  type: string;
  totalCount: number;
  processedCount: number;
  status: string;
}

interface ActiveJobState {
  id: string;
  type: string;
  totalCount: number;
  processedCount: number;
  status: string;
}

interface ResourcesTableProps {
  resources: ResourceRow[];
  /** Every resource id matching the current filters, across all pages -- used so "select all" isn't limited to the current page's rows. */
  allResourceIds: string[];
  /** A still-running job from before this render (e.g. the page was reloaded, or the user navigated away and back) -- resumes its progress bar instead of losing track of it. */
  initialJob: InitialJob | null;
  onAnalyze: (resourceIds: string[]) => Promise<BulkJobHandle | null>;
  onApprove: (resourceIds: string[]) => Promise<BulkJobHandle | null>;
  onReject: (resourceIds: string[]) => Promise<BulkJobHandle | null>;
  onDelete: (resourceIds: string[]) => Promise<BulkJobHandle | null>;
  onFindLinks: (resourceIds: string[]) => Promise<BulkJobHandle | null>;
  onIncludeLinks: (resourceIds: string[]) => Promise<BulkJobHandle | null>;
}

/**
 * Selection state resets whenever the underlying resource list changes (new page,
 * new filter) since `resources` is a fresh prop each time -- there's no persistent
 * selection across navigations, which is the expected/safer default for a bulk
 * action surface (no risk of silently acting on stale, no-longer-visible rows).
 *
 * Bulk actions enqueue a background job and return almost immediately (see
 * resources/page.tsx's enqueueBulkJob + lib/resource-pipeline.ts's runBulkJob) --
 * this component polls /api/bulk-jobs/[jobId] for progress rather than awaiting the
 * whole batch inline, which is what used to block sidebar navigation on a large
 * selection.
 */
export function ResourcesTable({
  resources,
  allResourceIds,
  initialJob,
  onAnalyze,
  onApprove,
  onReject,
  onDelete,
  onFindLinks,
  onIncludeLinks,
}: ResourcesTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isEnqueuing, setIsEnqueuing] = useState(false);
  const [activeJob, setActiveJob] = useState<ActiveJobState | null>(initialJob);
  const [summary, setSummary] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // The header checkbox used to toggle against allResourceIds directly -- every
  // other table convention (Gmail, Notion, Airtable) defaults that checkbox to "this
  // page" and offers select-everything-matching as a separate, explicit follow-up,
  // specifically because silently selecting hundreds of cross-page rows from one
  // click is surprising right before a Delete button.
  const pageIds = resources.map((r) => r.id);
  const pageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const allMatchingSelected = allResourceIds.length > 0 && allResourceIds.every((id) => selected.has(id));
  const canExpandToAllMatching = pageSelected && !allMatchingSelected && allResourceIds.length > pageIds.length;
  const someSelected = selected.size > 0;
  const jobRunning = activeJob !== null && activeJob.status !== "COMPLETED" && activeJob.status !== "FAILED";

  useEffect(() => {
    if (!activeJob || activeJob.status === "COMPLETED" || activeJob.status === "FAILED") return;
    const jobId = activeJob.id;
    let cancelled = false;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/bulk-jobs/${jobId}`);
      if (cancelled || !res.ok) return;
      const data = await res.json();
      if (cancelled) return;

      setActiveJob((prev) => (prev && prev.id === jobId ? { ...prev, ...data } : prev));

      if (data.status === "COMPLETED" || data.status === "FAILED") {
        clearInterval(interval);
        setSelected(new Set());
        setSummary(data.status === "FAILED" ? (data.errorMessage ?? "That action didn't finish successfully.") : (data.resultSummary ?? null));
        router.refresh();
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeJob?.id]);

  function toggleAll() {
    setSelected(pageSelected ? new Set() : new Set(pageIds));
  }

  function selectAllMatching() {
    setSelected(new Set(allResourceIds));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function runBulkAction(type: string, action: (resourceIds: string[]) => Promise<BulkJobHandle | null>) {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setSummary(null);
    setIsEnqueuing(true);
    action(ids).then((result) => {
      setIsEnqueuing(false);
      if (result) {
        setActiveJob({ id: result.jobId, type, totalCount: result.totalCount, processedCount: 0, status: "PENDING" });
      }
    });
  }

  // Delete is irreversible (a real DB delete, unlike reject/archive) -- the confirm
  // dialog is a low-effort but real guardrail against an accidental
  // bulk-select-all + delete.
  function handleDelete() {
    setConfirmDeleteOpen(true);
  }

  function confirmDelete() {
    setConfirmDeleteOpen(false);
    runBulkAction("DELETE", onDelete);
  }

  const buttonsDisabled = isEnqueuing || jobRunning;

  return (
    <>
      {(someSelected || jobRunning) && (
        <div className="border-b border-border bg-surface-warm px-5 py-3">
          {/* flex-wrap: 6 text+icon buttons don't fit one row on a phone-width
              viewport -- without wrapping they forced this row (and the page around
              it) wider than the screen instead of just stacking onto a second line. */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-ink">
              {jobRunning && activeJob
                ? `${JOB_PROGRESS_LABEL[activeJob.type] ?? "Working on"} ${activeJob.processedCount} of ${activeJob.totalCount}...`
                : `${selected.size} selected`}
            </span>
            {someSelected && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={buttonsDisabled}
                  onClick={() => runBulkAction("ANALYZE", onAnalyze)}
                  className={buttonClasses("secondary", "sm")}
                >
                  <Sparkles size={14} /> Analyze
                </button>
                <button
                  type="button"
                  disabled={buttonsDisabled}
                  onClick={() => runBulkAction("APPROVE", onApprove)}
                  className={buttonClasses("secondary", "sm")}
                >
                  <CheckCircle2 size={14} /> Approve
                </button>
                <button
                  type="button"
                  disabled={buttonsDisabled}
                  onClick={() => runBulkAction("REJECT", onReject)}
                  className={buttonClasses("secondary", "sm")}
                >
                  <XCircle size={14} /> Reject
                </button>
                <button
                  type="button"
                  disabled={buttonsDisabled}
                  onClick={() => runBulkAction("FIND_LINKS", onFindLinks)}
                  className={buttonClasses("secondary", "sm")}
                >
                  <Link2 size={14} /> Find links
                </button>
                <button
                  type="button"
                  disabled={buttonsDisabled}
                  onClick={() => runBulkAction("INCLUDE_LINKS", onIncludeLinks)}
                  className={buttonClasses("secondary", "sm")}
                >
                  <CheckCheck size={14} /> Include links
                </button>
                <button type="button" disabled={buttonsDisabled} onClick={handleDelete} className={buttonClasses("danger", "sm")}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
          {canExpandToAllMatching && !jobRunning && (
            <p className="mt-2 text-xs text-ink-secondary">
              All {pageIds.length} resources on this page are selected.{" "}
              <button
                type="button"
                onClick={selectAllMatching}
                className="rounded-sm font-medium text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Select all {allResourceIds.length} resources matching this filter
              </button>
            </p>
          )}
          {jobRunning && activeJob && activeJob.totalCount > 0 && (
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-accent transition-all duration-200"
                style={{ width: `${Math.min(100, (activeJob.processedCount / activeJob.totalCount) * 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {summary && (
        <div className="flex items-center justify-between border-b border-border bg-surface-muted px-5 py-2.5 text-sm text-ink-secondary">
          <span>{summary}</span>
          <button
            type="button"
            onClick={() => setSummary(null)}
            className="rounded-sm text-xs font-medium text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* overflow-x-auto so the table's natural min-content width (7 columns --
          thumbnail+title, type, topics, status, date, actions -- comfortably wider
          than a phone viewport) scrolls locally instead of forcing the whole page
          layout wider than the screen, matching the pattern already used for wide
          content elsewhere (ComparisonTable, WidgetPreviewFrame, InstallCodeModal). */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="w-10 px-5 py-3">
                <input type="checkbox" checked={pageSelected} onChange={toggleAll} aria-label="Select all resources on this page" />
              </th>
              <th className="px-3 py-3 font-medium">Title</th>
              <th className="px-3 py-3 font-medium">Type</th>
              <th className="px-3 py-3 font-medium">Topics</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Imported</th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                <td className="px-5 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(resource.id)}
                    onChange={() => toggleOne(resource.id)}
                    aria-label={`Select ${resource.title}`}
                  />
                </td>
                <td className="px-3 py-3">
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
                        {[
                          resource.speakerName,
                          resource.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                        ]
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
                  <Link
                    href={`/resources/${resource.id}`}
                    aria-label={`More options for ${resource.title}`}
                    className="rounded-sm text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  >
                    <MoreHorizontal size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title={`Delete ${selected.size} resource${selected.size === 1 ? "" : "s"}?`}
        description="This can't be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </>
  );
}
