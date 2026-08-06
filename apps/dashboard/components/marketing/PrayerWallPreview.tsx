import { CheckCircle2, Heart, Lock, ShieldCheck } from "lucide-react";

/** Compact mockup for the homepage's Prayer Wall intro section -- a public request, an "I Prayed" response, and an answered-prayer update, plus a small moderation/privacy note. */
export function PrayerWallPreview() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-panel">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-ink">Prayer Wall</span>
        <span className="flex items-center gap-1 rounded-full bg-surface-warm px-2.5 py-1 text-[11px] font-medium text-accent-dark">
          <ShieldCheck size={11} /> Moderated
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-lg border border-border bg-surface-muted p-3.5">
          <p className="mb-2 text-xs text-ink">
            Praying for peace as our family navigates a difficult diagnosis this month.
          </p>
          <div className="flex items-center justify-between text-[11px] text-ink-muted">
            <span>Anonymous</span>
            <span className="flex items-center gap-1 text-accent-dark">
              <Heart size={11} className="fill-current" /> 24 prayed
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-success-bg bg-success-bg/60 p-3.5">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-success">
            <CheckCircle2 size={12} /> Answered prayer
          </div>
          <p className="text-xs text-ink">Job offer came through this week -- thank you for praying with us.</p>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-border-strong p-2.5 text-[11px] text-ink-muted">
          <Lock size={11} className="shrink-0" /> Private requests are visible only to authorized church staff.
        </div>
      </div>
    </div>
  );
}
