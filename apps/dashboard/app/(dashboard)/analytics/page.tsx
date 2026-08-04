import { AlertCircle, BarChart3, MessageSquareText, Sparkles } from "lucide-react";
import { analyticsService } from "@ruach/database";
import { EngagementChart } from "../../../components/analytics/EngagementChart";
import { RankedBarList } from "../../../components/analytics/RankedBarList";
import { RecentQuestionsList } from "../../../components/analytics/RecentQuestionsList";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { MetricCard } from "../../../components/ui/MetricCard";
import { timeAgo } from "../../../lib/format";
import { getCurrentOrganization } from "../../../lib/session";

const WINDOW_DAYS = 30;

export default async function AnalyticsPage() {
  const organization = await getCurrentOrganization();
  if (!organization) return null;

  const [summary, engagement, topTopics, topResources, contentGaps, recentQuestions] = await Promise.all([
    analyticsService.getSummaryMetrics(organization.id, WINDOW_DAYS),
    analyticsService.getEngagementOverTime(organization.id, WINDOW_DAYS),
    analyticsService.getTopTopics(organization.id, WINDOW_DAYS),
    analyticsService.getTopResources(organization.id, WINDOW_DAYS),
    analyticsService.getContentGaps(organization.id, WINDOW_DAYS),
    analyticsService.getRecentQuestions(organization.id, WINDOW_DAYS),
  ]);

  if (summary.totalConversations === 0) {
    return (
      <div>
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-ink">Analytics</h1>
        <p className="mb-8 text-sm text-ink-secondary">Search trends, content gaps, and engagement over time.</p>
        <EmptyState
          bare={false}
          icon={<BarChart3 size={28} strokeWidth={1.5} />}
          title="No conversations yet"
          description="Once visitors start chatting with your widget, trends, content gaps, and engagement will show up here."
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-ink">Analytics</h1>
      <p className="mb-8 text-sm text-ink-secondary">Search trends, content gaps, and engagement over the last {WINDOW_DAYS} days.</p>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <MetricCard label="Conversations" value={summary.totalConversations} icon={<MessageSquareText size={16} />} />
        <MetricCard label="Questions asked" value={summary.totalQuestions} icon={<Sparkles size={16} />} />
        <MetricCard
          label="No-match rate"
          value={`${summary.noResultRate}%`}
          helperText={`${summary.noResultCount} question${summary.noResultCount === 1 ? "" : "s"} with no resource match`}
          icon={<AlertCircle size={16} />}
        />
      </div>

      <Card padding="md" className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">Engagement over time</h2>
        <EngagementChart data={engagement} />
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-6">
        <Card padding="md">
          <h2 className="mb-1 text-sm font-semibold text-ink">Search trends</h2>
          <p className="mb-4 text-xs text-ink-muted">Topics of the resources most often recommended in reply.</p>
          {topTopics.length === 0 ? (
            <p className="text-sm text-ink-muted">Not enough data yet.</p>
          ) : (
            <RankedBarList items={topTopics.map((t) => ({ key: t.topic, label: t.topic, count: t.count }))} />
          )}
        </Card>
        <Card padding="md">
          <h2 className="mb-1 text-sm font-semibold text-ink">Most recommended resources</h2>
          <p className="mb-4 text-xs text-ink-muted">What the assistant points visitors to most.</p>
          {topResources.length === 0 ? (
            <p className="text-sm text-ink-muted">Not enough data yet.</p>
          ) : (
            <RankedBarList items={topResources.map((r) => ({ key: r.resourceId, label: r.title, count: r.recommendationCount }))} />
          )}
        </Card>
      </div>

      <Card padding="md" className="mb-6">
        <h2 className="mb-1 text-sm font-semibold text-ink">Recent questions</h2>
        <p className="mb-4 text-xs text-ink-muted">Exactly what visitors have been asking, most recent first.</p>
        <RecentQuestionsList questions={recentQuestions} />
      </Card>

      <Card padding="md">
        <h2 className="mb-1 text-sm font-semibold text-ink">Content gaps</h2>
        <p className="mb-4 text-xs text-ink-muted">Questions that came back with no matching resource -- the clearest signal of what to import next.</p>
        {contentGaps.length === 0 ? (
          <p className="text-sm text-ink-muted">No unanswered questions in this window -- nice work.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {contentGaps.map((gap, i) => (
              <li key={i} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <span className="text-ink">{gap.question}</span>
                <span className="shrink-0 text-xs text-ink-muted">{timeAgo(gap.askedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
