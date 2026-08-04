import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  Database,
  Globe as WebsiteIcon,
  HelpCircle,
  Layers,
  MessageCircle,
  PlusCircle,
  Rss,
  Sparkles,
  Video,
} from "lucide-react";
import { auditService, conversationService, resourceService, websiteService, widgetService } from "@ruach/database";
import { MetricCard } from "../../../components/ui/MetricCard";
import { Badge } from "../../../components/ui/Badge";
import { buttonClasses } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { WidgetPreviewFrame } from "../../../components/WidgetPreviewFrame";
import {
  auditActionLabel,
  averageConfidence,
  confidenceLevel,
  greetingForHour,
  resourceStatusLabel,
  resourceStatusTone,
  timeAgo,
} from "../../../lib/format";
import { getCurrentOrganization, getCurrentUser } from "../../../lib/session";

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  "organization.created": <Sparkles size={14} />,
  "website.created": <WebsiteIcon size={14} />,
  "widget.created": <Layers size={14} />,
  "resource.approved": <CheckCircle2 size={14} />,
  "resource.categorized": <Sparkles size={14} />,
  "channel.imported": <Video size={14} />,
  "feed.imported": <Rss size={14} />,
  "resource.bulk_categorized": <Sparkles size={14} />,
  "resource.bulk_approved": <CheckCircle2 size={14} />,
  "resource.bulk_rejected": <CheckCircle2 size={14} />,
  "resource.bulk_deleted": <CheckCircle2 size={14} />,
  "source.synced": <Sparkles size={14} />,
};

const CONFIDENCE_BADGE: Record<string, "success" | "warning" | "danger"> = {
  High: "success",
  Medium: "warning",
  Low: "danger",
};

export default async function OverviewPage() {
  const organization = await getCurrentOrganization();
  const user = await getCurrentUser();
  if (!organization) return null;

  const [resources, websites, widgets, questionsAnswered, activity, reviewQueue] = await Promise.all([
    resourceService.listResources(organization.id),
    websiteService.listWebsites(organization.id),
    widgetService.listWidgets(organization.id),
    conversationService.countRecommendationResponses(organization.id),
    auditService.listAuditEvents(organization.id, 6),
    resourceService.listReviewQueue(organization.id, 5),
  ]);

  const activeCount = resources.filter((r) => r.status === "ACTIVE").length;
  const pendingReviewCount = resources.filter((r) => r.status === "REVIEW_REQUIRED").length;
  const activeWidgets = widgets.filter((w) => w.status === "ACTIVE");
  const activeWebsiteCount = new Set(activeWidgets.map((w) => w.websiteId)).size;
  const firstName = (user?.name || user?.email || "there").split(" ")[0]?.split("@")[0];
  const previewWidget = activeWidgets[0] ?? widgets[0] ?? null;
  const recentResources = resources.slice(0, 5);

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {greetingForHour(new Date().getHours())}, {firstName}
            </h1>
            <p className="mt-1 text-sm text-ink-secondary">Here&rsquo;s what&rsquo;s happening with {organization.name}.</p>
          </div>
          <Link href="/resources" className={buttonClasses("primary", "md")}>
            <PlusCircle size={16} /> Import Resource <ChevronDown size={14} className="opacity-70" />
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard label="Resources" value={activeCount} helperText={`${resources.length} total`} icon={<Database size={16} />} />
          <MetricCard
            label="Pending Review"
            value={pendingReviewCount}
            helperText={pendingReviewCount > 0 ? "Needs your attention" : "All caught up"}
            icon={<Clock size={16} />}
          />
          <MetricCard
            label="Questions Answered"
            value={questionsAnswered}
            helperText="Across all widgets"
            icon={<MessageCircle size={16} />}
          />
          <MetricCard
            label="Active Widgets"
            value={activeWidgets.length}
            helperText={`Across ${activeWebsiteCount} website${activeWebsiteCount === 1 ? "" : "s"}`}
            icon={<Code2 size={16} />}
          />
        </div>

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Recent Activity</h2>
            </div>
            {activity.length === 0 ? (
              <EmptyState description="No activity yet." />
            ) : (
              <ul className="flex flex-col gap-4">
                {activity.map((event) => (
                  <li key={event.id} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-warm text-accent-dark">
                      {ACTIVITY_ICONS[event.action] ?? <HelpCircle size={14} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{auditActionLabel(event.action)}</p>
                    </div>
                    <span className="shrink-0 text-xs text-ink-muted">{timeAgo(event.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Review Queue</h2>
              <Link
                href="/resources?status=REVIEW_REQUIRED"
                className="rounded-sm text-xs font-medium text-accent hover:text-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                View all ({pendingReviewCount})
              </Link>
            </div>
            {reviewQueue.length === 0 ? (
              <EmptyState description="Nothing waiting for review." />
            ) : (
              <ul className="flex flex-col gap-4">
                {reviewQueue.map((resource) => {
                  const avg = averageConfidence(resource.evidence.map((e) => e.confidenceScore));
                  const level = avg !== null ? confidenceLevel(avg) : null;
                  return (
                    <li key={resource.id}>
                      <Link
                        href={`/resources/${resource.id}`}
                        className="flex items-center gap-3 rounded-md p-1.5 transition-colors duration-180 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                      >
                        <span className="h-10 w-14 shrink-0 overflow-hidden rounded bg-surface-muted">
                          {resource.thumbnailUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={resource.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{resource.title}</p>
                          <p className="truncate text-xs text-ink-muted">
                            {[resource.speakerName, resource.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        {level && (
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <Badge variant={CONFIDENCE_BADGE[level]}>{level}</Badge>
                            <span className="text-[11px] text-ink-muted">{Math.round((avg ?? 0) * 100)}%</span>
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <Card padding="none">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Resources</h2>
            <Link
              href="/resources"
              className="rounded-sm text-xs font-medium text-accent hover:text-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              View all ({resources.length})
            </Link>
          </div>
          {recentResources.length === 0 ? (
            <EmptyState description="No resources yet." />
          ) : (
            <ul className="divide-y divide-border">
              {recentResources.map((resource) => (
                <li key={resource.id}>
                  <Link
                    href={`/resources/${resource.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors duration-180 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  >
                    <span className="h-9 w-12 shrink-0 overflow-hidden rounded bg-surface-muted">
                      {resource.thumbnailUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={resource.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{resource.title}</p>
                      <p className="truncate text-xs text-ink-muted">{[resource.speakerName, resource.resourceType].filter(Boolean).join(" · ")}</p>
                    </div>
                    <Badge variant={resourceStatusTone(resource.status)}>{resourceStatusLabel(resource.status)}</Badge>
                    <span className="w-16 shrink-0 text-right text-xs text-ink-muted">{timeAgo(resource.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {websites.length === 0 && (
          <p className="mt-8 text-sm text-ink-secondary">
            Get started by{" "}
            <Link href="/websites" className="rounded-sm text-accent underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
              adding a website
            </Link>
            , then{" "}
            <Link href="/widgets" className="rounded-sm text-accent underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
              creating a widget
            </Link>{" "}
            and{" "}
            <Link href="/resources" className="rounded-sm text-accent underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
              importing a resource
            </Link>
            .
          </p>
        )}
      </div>

      <aside className="hidden w-[400px] shrink-0 xl:block">
        <div className="sticky top-8">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-ink">Widget Preview</h2>
            <p className="text-xs text-ink-muted">This is how your widget looks to visitors.</p>
          </div>
          {previewWidget ? (
            <WidgetPreviewFrame publicWidgetId={previewWidget.publicWidgetId} />
          ) : (
            <EmptyState
              bare={false}
              description="Create a widget to see a live preview here."
              action={
                <Link
                  href="/widgets"
                  className="rounded-sm text-xs font-medium text-accent hover:text-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  Create a widget →
                </Link>
              }
            />
          )}
        </div>
      </aside>
    </div>
  );
}
