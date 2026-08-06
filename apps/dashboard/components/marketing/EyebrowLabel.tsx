import type { ReactNode } from "react";

export function EyebrowLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface-warm px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-accent-dark">
      {children}
    </span>
  );
}
