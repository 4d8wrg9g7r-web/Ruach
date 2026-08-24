import type { ResourceTypeGroup } from "@ruach/shared-types";
export { resourceTypeGroup } from "@ruach/shared-types";
export type { ResourceTypeGroup } from "@ruach/shared-types";

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export interface GroupedByText<T> {
  /** Original-casing text of the most recent occurrence -- what actually renders. */
  display: string;
  count: number;
  /** The most recent original item, for outcome/id/etc. fields callers still need. */
  mostRecent: T;
}

/**
 * Collapses visitor questions/gaps that are effectively the same text asked more
 * than once into a single row with a count, keeping the most recent occurrence's
 * exact wording and any other fields (outcome, id) it carries. Without this, a
 * handful of common questions asked repeatedly bury the genuinely new ones under
 * duplicate rows once a widget has any real traffic -- see Analytics' "Recent
 * questions" and "Content gaps" lists, the two places this matters.
 */
export function groupRepeatedText<T>(
  items: T[],
  getText: (item: T) => string,
  getDate: (item: T) => Date,
): GroupedByText<T>[] {
  const groups = new Map<string, GroupedByText<T>>();
  for (const item of items) {
    const text = getText(item);
    const key = text.trim().toLowerCase().replace(/\s+/g, " ");
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, { display: text, count: 1, mostRecent: item });
    } else {
      existing.count += 1;
      if (getDate(item) > getDate(existing.mostRecent)) {
        existing.display = text;
        existing.mostRecent = item;
      }
    }
  }
  return Array.from(groups.values()).sort(
    (a, b) => getDate(b.mostRecent).getTime() - getDate(a.mostRecent).getTime(),
  );
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export type ConfidenceLevel = "High" | "Medium" | "Low";

export function confidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.8) return "High";
  if (score >= 0.5) return "Medium";
  return "Low";
}

export function averageConfidence(scores: number[]): number | null {
  if (scores.length === 0) return null;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

const AUDIT_ACTION_LABELS: Record<string, string> = {
  "organization.created": "Organization created",
  "website.created": "Website added",
  "widget.created": "Widget created",
  "resource.approved": "Resource approved",
  "resource.categorized": "Resource categorized by AI",
  "channel.imported": "YouTube channel imported",
  "feed.imported": "RSS feed imported",
  "resource.bulk_categorized": "Resources analyzed",
  "resource.bulk_approved": "Resources approved",
  "resource.bulk_rejected": "Resources rejected",
  "resource.bulk_deleted": "Resources deleted",
  "resource.bulk_links_discovered": "Links found in descriptions",
  "resource.bulk_links_included": "Links included",
  "source.synced": "Auto-sync ran",
  "prayer_wall.settings_updated": "Prayer wall settings updated",
  "team.member_invited": "Teammate invited",
  "team.member_role_updated": "Teammate role changed",
  "team.member_removed": "Teammate removed",
  "account.updated": "Account details updated",
  "billing.plan_changed": "Plan changed",
  "billing.cancel_scheduled": "Cancellation scheduled",
  "billing.cancel_undone": "Cancellation undone",
};

export function auditActionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action;
}

export function formatDurationLabel(seconds: number | null): string | null {
  if (!seconds) return null;
  const minutes = Math.round(seconds / 60);
  return minutes < 1 ? "<1 min" : `${minutes} min`;
}

export const RESOURCE_TYPE_FILTERS: {
  key: ResourceTypeGroup | "ALL";
  label: string;
}[] = [
  { key: "ALL", label: "All" },
  { key: "VIDEOS", label: "Videos" },
  { key: "PODCASTS", label: "Podcasts" },
  { key: "ARTICLES", label: "Articles" },
  { key: "DOCUMENTS", label: "Documents" },
];

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Approved",
  APPROVED: "Approved",
  REVIEW_REQUIRED: "Under Review",
  DRAFT: "Draft",
  PROCESSING: "Processing",
  FAILED: "Failed",
  INACTIVE: "Inactive",
  ARCHIVED: "Archived",
};

export function resourceStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export const PRAYER_CATEGORY_OPTIONS = [
  { key: "HEALTH", label: "Health" },
  { key: "FAMILY", label: "Family" },
  { key: "FINANCIAL", label: "Financial" },
  { key: "SPIRITUAL_GROWTH", label: "Spiritual growth" },
  { key: "GRIEF_LOSS", label: "Grief & loss" },
  { key: "GUIDANCE", label: "Guidance" },
  { key: "OTHER", label: "Other" },
] as const;

const PRAYER_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  PRAYER_CATEGORY_OPTIONS.map((o) => [o.key, o.label]),
);

export function prayerCategoryLabel(category: string | null): string {
  if (!category) return "Uncategorized";
  return PRAYER_CATEGORY_LABELS[category] ?? category;
}

export type BadgeTone = "success" | "warning" | "danger" | "neutral";

const STATUS_TONES: Record<string, BadgeTone> = {
  ACTIVE: "success",
  APPROVED: "success",
  REVIEW_REQUIRED: "warning",
  FAILED: "danger",
  DRAFT: "neutral",
  PROCESSING: "neutral",
  INACTIVE: "neutral",
  ARCHIVED: "neutral",
};

export function resourceStatusTone(status: string): BadgeTone {
  return STATUS_TONES[status] ?? "neutral";
}
