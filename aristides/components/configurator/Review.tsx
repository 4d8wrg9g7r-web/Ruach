"use client";

import { useState } from "react";
import { CTAButton } from "@/components/ui/primitives";
import { GuitarVisual } from "@/components/visual/GuitarVisual";
import { finishById } from "@/lib/data/finishes";
import { platformById, type Build } from "@/lib/data/configurator";
import { buildCode, computePrice, formatEUR, shortHandle, summarize } from "@/lib/build";

/**
 * Configurator review (§22) + Start Order inquiry (§23).
 * Custom instruments become a structured inquiry, not a checkout. Save/Share
 * encode the whole build into a shareable link; Download produces a spec sheet.
 */
export function Review({ build, shareLink }: { build: Build; shareLink: string }) {
  const [copied, setCopied] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const finish = build.finish ? finishById(build.finish) : undefined;
  const platform = build.platform ? platformById(build.platform) : undefined;
  const rows = summarize(build);
  const code = buildCode(build);
  const handle = shortHandle(build);
  const price = computePrice(build);

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — link is still visible below */
    }
  }

  function downloadSpec() {
    const lines = [
      "ARISTIDES INSTRUMENTS — BUILD SPECIFICATION",
      "=".repeat(44),
      `Build code:   ${code}`,
      `Reference:    ${handle}`,
      "",
      ...rows.map((r) => `${(r.label + ":").padEnd(14)}${r.value}${r.sub ? `  (${r.sub})` : ""}`),
      "",
      `Estimated:    ${formatEUR(price)}  (final price confirmed by Aristides)`,
      "",
      `Share:        ${shareLink}`,
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aristides-${handle}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
      {/* visual */}
      <div
        className="instrument-ambient relative flex h-[52vh] items-center justify-center overflow-hidden rounded border border-graphite-line lg:h-auto lg:min-h-[70vh]"
        style={{ ["--instrument-tint" as string]: (finish?.tint ?? [138, 143, 152]).join(",") }}
      >
        <div className="pointer-events-none absolute inset-0 grid-tech opacity-[0.12]" />
        <GuitarVisual
          construction={platform?.construction}
          strings={build.strings}
          orientation={build.orientation}
          hardwareColor={build.hardwareColor}
          finish={finish}
          className="relative h-[115%] w-auto"
        />
        <div className="absolute left-4 top-4 rounded-sm border border-graphite-line bg-void/70 px-3 py-1.5 font-mono text-[11px] text-ice">
          {code}
        </div>
      </div>

      {/* spec + actions */}
      <div>
        <div className="tech-label">Your specification</div>
        <h1 className="mt-2 font-display text-display-sm font-medium">Review your build</h1>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-0">
          {rows.map((r) => (
            <div key={r.label} className="border-t border-graphite-line py-3">
              <dt className="tech-label">{r.label}</dt>
              <dd className="mt-0.5 font-display text-[15px] text-chalk">{r.value}</dd>
              {r.sub && <dd className="text-[12px] text-steel">{r.sub}</dd>}
            </div>
          ))}
        </dl>

        <div className="mt-6 flex items-end justify-between border-t border-graphite-line pt-4">
          <div>
            <div className="tech-label">Estimated price</div>
            <div className="mt-1 font-display text-3xl tabular-nums">{formatEUR(price)}</div>
          </div>
          <div className="text-right">
            <div className="tech-label">Reference</div>
            <div className="mt-1 font-mono text-lg text-ice">{handle}</div>
          </div>
        </div>

        {!ordering ? (
          <>
            <div className="mt-6 flex flex-wrap gap-2">
              <CTAButton onClick={() => setOrdering(true)} variant="primary" size="lg">
                Start Order
              </CTAButton>
              <button onClick={copyShare} className="rounded-sm border border-graphite-line px-4 py-3 font-mono text-[12px] uppercase tracking-wide-tech text-chalk transition hover:border-steel">
                {copied ? "Link copied ✓" : "Share build"}
              </button>
              <button onClick={downloadSpec} className="rounded-sm border border-graphite-line px-4 py-3 font-mono text-[12px] uppercase tracking-wide-tech text-chalk transition hover:border-steel">
                Download spec
              </button>
            </div>
            <p className="mt-3 break-all font-mono text-[11px] text-steel-dim">{shareLink}</p>
          </>
        ) : (
          <OrderForm build={build} code={code} onBack={() => setOrdering(false)} />
        )}
      </div>
    </div>
  );
}

function OrderForm({ build, code, onBack }: { build: Build; code: string; onBack: () => void }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", country: "", tuning: build.tuning ?? "", gauge: build.gauge ?? "", notes: build.notes ?? "" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // In production this posts the full configuration to Aristides (structured
    // spec to sales; build-summary email to the customer). Prototype simulates it.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-6 rounded border border-ice/40 bg-ice/[0.05] p-6">
        <div className="tech-label text-ice">Inquiry received</div>
        <p className="mt-2 text-sm leading-relaxed text-chalk">
          Thank you, {form.name || "player"}. Your build <span className="font-mono text-ice">{code}</span> has been sent to
          Aristides. You&apos;ll receive a build-summary email at {form.email || "your address"} and the team will confirm
          final pricing and lead time.
        </p>
        <div className="mt-4">
          <CTAButton href="/" variant="secondary">Back to home</CTAButton>
        </div>
      </div>
    );
  }

  const inp = "w-full rounded-sm border border-graphite-line bg-graphite-raised/50 p-3 text-sm text-chalk outline-none placeholder:text-steel-dim focus:border-ice";

  return (
    <form onSubmit={submit} className="mt-6 space-y-3">
      <div className="tech-label">Turn this build into an order inquiry</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inp} />
        <input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inp} />
        <input placeholder="Desired tuning" value={form.tuning} onChange={(e) => setForm({ ...form, tuning: e.target.value })} className={inp} />
        <input placeholder="String gauge" value={form.gauge} onChange={(e) => setForm({ ...form, gauge: e.target.value })} className={`${inp} sm:col-span-2`} />
        <textarea rows={3} placeholder="Special requests" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inp} sm:col-span-2`} />
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <CTAButton type="submit" variant="primary" size="lg">Send to Aristides</CTAButton>
        <button type="button" onClick={onBack} className="rounded-sm border border-graphite-line px-4 py-3 font-mono text-[12px] uppercase tracking-wide-tech text-steel transition hover:text-chalk">
          Back
        </button>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-wide-tech text-steel-dim">
        Aristides builds to order — this sends your full specification, not a checkout.
      </p>
    </form>
  );
}
