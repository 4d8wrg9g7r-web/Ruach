"use client";

/**
 * Conversion tracking seam. Pushes a typed event into the GTM dataLayer and,
 * when present, GA4's gtag. It is intentionally provider-agnostic and safe to
 * call before any tag is installed — it no-ops on the server and when no tag is
 * loaded, so instrumentation can ship ahead of the marketing tags.
 *
 * Wire GA4 / GTM / Meta Pixel via NEXT_PUBLIC_* env + the tags in <head>; every
 * funnel event the brief calls for is enumerated in `AnalyticsEvent`.
 */

export type AnalyticsEvent =
  | "navigation_service_click"
  | "portfolio_view"
  | "gallery_open"
  | "investment_view"
  | "availability_click"
  | "inquiry_started"
  | "inquiry_step_completed"
  | "inquiry_submitted"
  | "phone_click"
  | "email_click"
  | "journal_cta_click"
  | "location_page_conversion";

type Payload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: AnalyticsEvent, payload: Payload = {}): void {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...payload });
    window.gtag?.("event", event, payload);
  } catch {
    /* analytics must never throw into the UI */
  }
}
