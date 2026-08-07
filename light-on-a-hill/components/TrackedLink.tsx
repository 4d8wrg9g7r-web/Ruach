"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/** A next/link that fires an analytics event on click. Lets server components
 *  render tracked links without becoming client components themselves. */
export function TrackedLink({
  event,
  payload,
  ...props
}: ComponentProps<typeof Link> & { event: AnalyticsEvent; payload?: Record<string, string | number | boolean> }) {
  return <Link {...props} onClick={() => track(event, payload)} />;
}
