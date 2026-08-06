"use client";

import { motion, useReducedMotion, type Transition } from "framer-motion";
import { HeartHandshake, MessageCircle, PlayCircle, Sparkles } from "lucide-react";

const RESOURCES = [
  { type: "Sermon", icon: PlayCircle, title: "Peace That Doesn't Make Sense", meta: "Pastor Elena Ruiz · 34 min" },
  { type: "Ministry", icon: Sparkles, title: "Care & Counseling Ministry", meta: "Ministry page" },
  { type: "Prayer", icon: HeartHandshake, title: "Share a prayer request", meta: "Prayer Wall" },
  { type: "Article", icon: MessageCircle, title: "Anxious for Nothing: A Short Study", meta: "5-part article series" },
];

/**
 * Hero's product visualization -- a real usable-looking chat exchange, not a
 * conceptual illustration. Reveals in stages (question -> answer -> resource cards)
 * on a fixed timeline via framer-motion; prefers-reduced-motion skips straight to the
 * fully-revealed state instead of animating the reveal.
 */
export function AssistantDemo() {
  const shouldReduceMotion = useReducedMotion();
  const stage = (delay: number) => {
    const transition: Transition = { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] };
    return shouldReduceMotion
      ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
      : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition };
  };

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-panel">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-warm text-accent-dark">
          <MessageCircle size={14} />
        </span>
        <span className="text-sm font-medium text-ink">Grace Fellowship Assistant</span>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <motion.div {...stage(0)} className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-surface-muted px-4 py-2.5 text-sm text-ink">
          Do you have anything that could help me with anxiety?
        </motion.div>

        <motion.div {...stage(0.5)} className="max-w-[90%] rounded-2xl rounded-tl-sm bg-surface-warm px-4 py-2.5 text-sm leading-relaxed text-ink">
          A few things from our church might help. I found a recent sermon on facing anxiety, our Care &amp; Counseling
          ministry, and a short study you can walk through on your own. You&rsquo;re also welcome to share a prayer
          request.
        </motion.div>

        <motion.div {...stage(1)} className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {RESOURCES.map((resource) => (
            <div key={resource.title} className="flex items-start gap-2.5 rounded-lg border border-border bg-surface p-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-warm text-accent-dark">
                <resource.icon size={13} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wide text-accent-dark">{resource.type}</p>
                <p className="truncate text-xs font-medium text-ink">{resource.title}</p>
                <p className="truncate text-[11px] text-ink-muted">{resource.meta}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
