import { Quote } from "lucide-react";
import { Card } from "../ui/Card";

interface TestimonialCardProps {
  quote: string;
  role: string;
  churchLabel: string;
}

/**
 * All testimonial content is placeholder (see homepage) -- kept in one typed shape so
 * real quotes can be swapped in later without touching layout/markup.
 */
export function TestimonialCard({ quote, role, churchLabel }: TestimonialCardProps) {
  return (
    <Card>
      <Quote size={18} className="mb-3 text-accent-light" />
      <p className="mb-4 text-sm leading-relaxed text-ink">&ldquo;{quote}&rdquo;</p>
      <div className="text-xs text-ink-muted">
        <p className="font-medium text-ink-secondary">{role}</p>
        <p>{churchLabel}</p>
      </div>
    </Card>
  );
}
