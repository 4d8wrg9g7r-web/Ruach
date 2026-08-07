import Link from "next/link";
import type { Service } from "@/content/services";

/** Elegant, minimal pricing presentation. Values come from the CMS, never hard-coded per page. */
export function InvestmentBlock({
  investment,
  category,
}: {
  investment: Service["investment"];
  category: string;
}) {
  return (
    <div className="grid gap-10 border border-ink/10 bg-paper p-8 sm:grid-cols-2 sm:p-12">
      <div>
        <p className="eyebrow text-champagne">{category}</p>
        <p className="mt-8 font-sans text-[0.72rem] uppercase tracking-label text-mist">
          {investment.startingLabel}
        </p>
        <p className="mt-2 font-serif text-5xl text-ink sm:text-6xl">{investment.startingValue}</p>
        {investment.typicalValue && (
          <p className="mt-8 text-sm text-charcoal/75">
            <span className="font-sans text-[0.72rem] uppercase tracking-label text-mist">
              {investment.typicalLabel}
            </span>
            <br />
            <span className="font-serif text-2xl text-ink">{investment.typicalValue}</span>
          </p>
        )}
      </div>
      <div className="flex flex-col justify-between gap-6">
        {investment.note && <p className="text-[0.95rem] leading-relaxed text-charcoal/75">{investment.note}</p>}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/inquire"
            data-cursor="explore"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-sans text-[0.7rem] uppercase tracking-label text-paper transition-transform duration-500 ease-aperture hover:scale-[1.03]"
          >
            Check availability &rarr;
          </Link>
          <Link
            href="/investment"
            className="inline-flex items-center gap-2 border-b border-ink/30 pb-1 font-sans text-[0.7rem] uppercase tracking-label text-ink hover:border-ink"
          >
            View full investment
          </Link>
        </div>
      </div>
    </div>
  );
}
