export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
};

export function auditActionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action;
}

export function formatDurationLabel(seconds: number | null): string | null {
  if (!seconds) return null;
  const minutes = Math.round(seconds / 60);
  return minutes < 1 ? "<1 min" : `${minutes} min`;
}

export type ResourceTypeGroup = "VIDEOS" | "PODCASTS" | "ARTICLES" | "DOCUMENTS" | "OTHER";

const TYPE_GROUPS: Record<string, ResourceTypeGroup> = {
  VIDEO: "VIDEOS",
  SERMON: "VIDEOS",
  COURSE: "VIDEOS",
  PODCAST: "PODCASTS",
  AUDIO: "PODCASTS",
  ARTICLE: "ARTICLES",
  DEVOTIONAL: "ARTICLES",
  DOCUMENT: "DOCUMENTS",
  OTHER: "OTHER",
};

export function resourceTypeGroup(resourceType: string): ResourceTypeGroup {
  return TYPE_GROUPS[resourceType] ?? "OTHER";
}

export const RESOURCE_TYPE_FILTERS: { key: ResourceTypeGroup | "ALL"; label: string }[] = [
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
