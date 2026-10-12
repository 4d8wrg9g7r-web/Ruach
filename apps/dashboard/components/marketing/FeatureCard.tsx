import type { ReactNode } from "react";
import { Card } from "../ui/Card";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

/** Card elevates slightly on hover -- the one "premium" micro-interaction feature cards get, no other motion. */
export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card interactive>
      <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface-warm text-accent-dark">
        {icon}
      </span>
      <h3 className="mb-1.5 text-sm font-bold text-ink">{title}</h3>
      <p className="text-sm leading-relaxed text-ink-secondary">{description}</p>
    </Card>
  );
}
