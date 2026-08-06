import { tenantDb } from "../client";

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/** Every function below accepts an optional websiteId to scope to one campus's widgets (via Conversation.widget.websiteId) instead of the whole org. Omit/undefined for org-wide, matching pre-Phase-3 behavior exactly. */
type WebsiteFilter = { widget: { websiteId: string } };
function websiteFilter(websiteId: string | null | undefined): WebsiteFilter | Record<string, never> {
  return websiteId ? { widget: { websiteId } } : {};
}

export interface EngagementPoint {
  date: string;
  conversations: number;
  messages: number;
}

/** Conversations started and messages sent, bucketed by day, for the trailing `days` window. */
export async function getEngagementOverTime(organizationId: string, days = 14, websiteId?: string | null): Promise<EngagementPoint[]> {
  const since = daysAgo(days);
  const [conversations, messages] = await Promise.all([
    tenantDb.conversation.findMany({
      where: { organizationId, createdAt: { gte: since }, ...websiteFilter(websiteId) },
      select: { createdAt: true },
    }),
    tenantDb.conversationMessage.findMany({
      where: { organizationId, role: "USER", createdAt: { gte: since }, conversation: websiteFilter(websiteId) },
      select: { createdAt: true },
    }),
  ]);

  const byDay = new Map<string, EngagementPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const key = dayKey(daysAgo(i));
    byDay.set(key, { date: key, conversations: 0, messages: 0 });
  }
  for (const c of conversations) {
    const bucket = byDay.get(dayKey(c.createdAt));
    if (bucket) bucket.conversations += 1;
  }
  for (const m of messages) {
    const bucket = byDay.get(dayKey(m.createdAt));
    if (bucket) bucket.messages += 1;
  }

  return Array.from(byDay.values());
}

export interface TopTopic {
  topic: string;
  count: number;
}

/**
 * "Search trends" -- there's no free-text topic field on a question, so trends are
 * derived from the topics of resources the assistant actually recommended in reply
 * to it. Aggregated in JS rather than SQL (unnest over a String[] column) since
 * dataset sizes at this stage are small and it keeps every query going through
 * tenantDb the same way as the rest of the service layer.
 */
export async function getTopTopics(organizationId: string, days = 30, limit = 8, websiteId?: string | null): Promise<TopTopic[]> {
  const since = daysAgo(days);
  const messages = await tenantDb.conversationMessage.findMany({
    where: {
      organizationId,
      role: "ASSISTANT",
      createdAt: { gte: since },
      recommendedResourceIds: { isEmpty: false },
      conversation: websiteFilter(websiteId),
    },
    select: { recommendedResourceIds: true },
  });
  const resourceIds = Array.from(new Set(messages.flatMap((m) => m.recommendedResourceIds)));
  if (resourceIds.length === 0) return [];

  const resources = await tenantDb.resource.findMany({
    where: { organizationId, id: { in: resourceIds } },
    select: { id: true, topics: true, primaryTopic: true },
  });
  const topicsByResourceId = new Map(resources.map((r) => [r.id, r.primaryTopic ? [r.primaryTopic, ...r.topics] : r.topics]));

  const counts = new Map<string, number>();
  for (const message of messages) {
    const seenInMessage = new Set<string>();
    for (const resourceId of message.recommendedResourceIds) {
      for (const topic of topicsByResourceId.get(resourceId) ?? []) {
        if (seenInMessage.has(topic)) continue;
        seenInMessage.add(topic);
        counts.set(topic, (counts.get(topic) ?? 0) + 1);
      }
    }
  }

  return Array.from(counts.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export interface ContentGap {
  question: string;
  askedAt: Date;
}

/** Visitor questions that came back with no matching resource -- the clearest signal of missing content. */
export async function getContentGaps(organizationId: string, days = 30, limit = 10, websiteId?: string | null): Promise<ContentGap[]> {
  const since = daysAgo(days);
  const noResultReplies = await tenantDb.conversationMessage.findMany({
    where: {
      organizationId,
      role: "ASSISTANT",
      responseType: "NO_RESULTS",
      createdAt: { gte: since },
      conversation: websiteFilter(websiteId),
    },
    select: { conversationId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: limit * 3, // over-fetch -- several no-result replies can share one preceding question
  });
  if (noResultReplies.length === 0) return [];

  const conversationIds = Array.from(new Set(noResultReplies.map((r) => r.conversationId)));
  const userMessages = await tenantDb.conversationMessage.findMany({
    where: { organizationId, role: "USER", conversationId: { in: conversationIds } },
    select: { conversationId: true, content: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const gaps: ContentGap[] = [];
  for (const reply of noResultReplies) {
    // The question this reply answered: the last USER message in the same conversation before the reply's timestamp.
    const precedingUserMessages = userMessages.filter(
      (m) => m.conversationId === reply.conversationId && m.createdAt <= reply.createdAt,
    );
    const question = precedingUserMessages[precedingUserMessages.length - 1];
    if (question) gaps.push({ question: question.content, askedAt: reply.createdAt });
  }

  return gaps.slice(0, limit);
}

export interface TopResource {
  resourceId: string;
  title: string;
  recommendationCount: number;
}

export async function getTopResources(organizationId: string, days = 30, limit = 8, websiteId?: string | null): Promise<TopResource[]> {
  const since = daysAgo(days);
  const messages = await tenantDb.conversationMessage.findMany({
    where: {
      organizationId,
      role: "ASSISTANT",
      createdAt: { gte: since },
      recommendedResourceIds: { isEmpty: false },
      conversation: websiteFilter(websiteId),
    },
    select: { recommendedResourceIds: true },
  });

  const counts = new Map<string, number>();
  for (const message of messages) {
    for (const resourceId of message.recommendedResourceIds) {
      counts.set(resourceId, (counts.get(resourceId) ?? 0) + 1);
    }
  }
  if (counts.size === 0) return [];

  const topIds = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
  const resources = await tenantDb.resource.findMany({ where: { organizationId, id: { in: topIds } }, select: { id: true, title: true } });
  const titleById = new Map(resources.map((r) => [r.id, r.title]));

  return topIds
    .filter((id) => titleById.has(id))
    .map((id) => ({ resourceId: id, title: titleById.get(id)!, recommendationCount: counts.get(id)! }));
}

export interface RecentQuestion {
  question: string;
  askedAt: Date;
  outcome: "matched" | "no_match" | "pending";
}

/**
 * Every question asked (not just the no-match ones getContentGaps surfaces) -- the
 * "what exactly did people ask" view. Outcome is the earliest ASSISTANT reply in the
 * same conversation at or after the question's timestamp, same pairing approach as
 * getContentGaps; "pending" covers a question with no reply yet (e.g. sent seconds
 * before this query ran).
 */
export async function getRecentQuestions(organizationId: string, days = 30, limit = 50, websiteId?: string | null): Promise<RecentQuestion[]> {
  const since = daysAgo(days);
  const userMessages = await tenantDb.conversationMessage.findMany({
    where: { organizationId, role: "USER", createdAt: { gte: since }, conversation: websiteFilter(websiteId) },
    select: { conversationId: true, content: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  if (userMessages.length === 0) return [];

  const conversationIds = Array.from(new Set(userMessages.map((m) => m.conversationId)));
  const assistantMessages = await tenantDb.conversationMessage.findMany({
    where: { organizationId, role: "ASSISTANT", conversationId: { in: conversationIds } },
    select: { conversationId: true, responseType: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return userMessages.map((q) => {
    const reply = assistantMessages.find((a) => a.conversationId === q.conversationId && a.createdAt >= q.createdAt);
    const outcome: RecentQuestion["outcome"] = !reply ? "pending" : reply.responseType === "NO_RESULTS" ? "no_match" : "matched";
    return { question: q.content, askedAt: q.createdAt, outcome };
  });
}

export interface AnalyticsSummary {
  totalConversations: number;
  totalQuestions: number;
  noResultCount: number;
  noResultRate: number;
}

export async function getSummaryMetrics(organizationId: string, days = 30, websiteId?: string | null): Promise<AnalyticsSummary> {
  const since = daysAgo(days);
  const [totalConversations, totalQuestions, noResultCount] = await Promise.all([
    tenantDb.conversation.count({ where: { organizationId, createdAt: { gte: since }, ...websiteFilter(websiteId) } }),
    tenantDb.conversationMessage.count({
      where: { organizationId, role: "USER", createdAt: { gte: since }, conversation: websiteFilter(websiteId) },
    }),
    tenantDb.conversationMessage.count({
      where: { organizationId, role: "ASSISTANT", responseType: "NO_RESULTS", createdAt: { gte: since }, conversation: websiteFilter(websiteId) },
    }),
  ]);
  return {
    totalConversations,
    totalQuestions,
    noResultCount,
    noResultRate: totalQuestions === 0 ? 0 : Math.round((noResultCount / totalQuestions) * 100),
  };
}

export interface WebsiteAnalyticsSummary extends AnalyticsSummary {
  websiteId: string;
  websiteName: string;
}

/** Per-campus breakdown for the org-wide analytics view (orgWideAnalytics feature, Multi-Site+). */
export async function getAnalyticsByWebsite(organizationId: string, days = 30): Promise<WebsiteAnalyticsSummary[]> {
  const websites = await tenantDb.website.findMany({ where: { organizationId }, select: { id: true, name: true }, orderBy: { createdAt: "asc" } });
  return Promise.all(
    websites.map(async (website) => ({
      websiteId: website.id,
      websiteName: website.name,
      ...(await getSummaryMetrics(organizationId, days, website.id)),
    })),
  );
}
