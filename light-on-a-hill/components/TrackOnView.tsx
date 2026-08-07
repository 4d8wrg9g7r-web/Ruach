"use client";

import { useEffect, useRef } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/** Fires an analytics event once when its position scrolls into view. */
export function TrackOnView({
  event,
  payload,
  children,
}: {
  event: AnalyticsEvent;
  payload?: Record<string, string | number | boolean>;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !fired.current) {
          fired.current = true;
          track(event, payload);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [event, payload]);
  return <div ref={ref}>{children}</div>;
}
