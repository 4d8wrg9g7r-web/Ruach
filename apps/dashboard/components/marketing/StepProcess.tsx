import type { ReactNode } from "react";
import { FadeIn } from "./FadeIn";

export interface Step {
  number: number;
  title: string;
  description: string;
  icon: ReactNode;
}

export function StepProcess({ steps }: { steps: Step[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <FadeIn key={step.number} delay={index * 0.08}>
          <div className="relative rounded-lg border border-border bg-surface p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-warm text-sm font-semibold text-accent-dark">
                {step.number}
              </span>
              <span className="text-accent">{step.icon}</span>
            </div>
            <h3 className="mb-1.5 text-sm font-semibold text-ink">{step.title}</h3>
            <p className="text-sm leading-relaxed text-ink-secondary">{step.description}</p>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
