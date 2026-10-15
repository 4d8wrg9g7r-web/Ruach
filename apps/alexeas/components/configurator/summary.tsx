"use client";

import { getModel } from "@/lib/data/models";
import {
  type Configuration,
  priceLines,
  totalPrice,
  buildRange,
  formatUSD,
} from "@/lib/config/engine";

/**
 * The discreet running summary. Deliberately not an ecommerce cart — it lists
 * the chosen materials, an estimated commission, and an estimated build time,
 * always under the reminder that specifications and pricing are confirmed
 * personally before anything is built.
 */
export function BuildSummary({
  config,
  detailed = false,
}: {
  config: Configuration;
  detailed?: boolean;
}) {
  const model = getModel(config.model);
  const lines = priceLines(config);
  const total = totalPrice(config);
  const [lo, hi] = buildRange(config);

  return (
    <div className="font-sans">
      <p className="overline">Your Alexeas</p>
      <p className="mt-1 font-serif text-2xl text-espresso">{model?.name}</p>

      <dl className="mt-5 space-y-2 text-sm">
        <div className="flex items-baseline justify-between gap-3 text-ink-soft">
          <dt>Base instrument</dt>
          <dd>{formatUSD(model?.basePrice ?? 0)}</dd>
        </div>
        {(detailed ? lines : lines.filter((l) => l.amount > 0)).map((l) => (
          <div key={l.slotId} className="flex items-baseline justify-between gap-3 text-ink-soft">
            <dt className="text-ink-muted">
              {l.label}
              {detailed && <span className="text-ink-muted/70"> · {l.name}</span>}
            </dt>
            <dd>{l.amount === 0 ? "Included" : `+${formatUSD(l.amount)}`}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex items-baseline justify-between border-t border-brass/25 pt-4">
        <span className="font-sans text-xs uppercase tracking-wider2 text-ink-muted">
          Estimated commission
        </span>
        <span className="font-serif text-2xl text-espresso">{formatUSD(total)}</span>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="font-sans text-xs uppercase tracking-wider2 text-ink-muted">
          Estimated build time
        </span>
        <span className="font-sans text-sm text-ink-soft">{lo}–{hi} months</span>
      </div>

      <p className="mt-5 font-sans text-[0.7rem] leading-relaxed text-ink-muted">
        An estimate to guide the conversation. Final specifications and pricing are
        personally confirmed with you before construction begins.
      </p>
    </div>
  );
}
